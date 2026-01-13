import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2-client';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';

// Create Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Help TypeScript understand these are defined after the runtime guard above
const SUPABASE_URL: string = supabaseUrl;
const SUPABASE_ANON_KEY: string = supabaseAnonKey;

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Handle month rollover (e.g., Jan 31 + 1 month)
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function computeMembershipEnd(planId: string, startsAt: Date) {
  switch (planId) {
    case "monthly":
      return addMonths(startsAt, 1);
    case "six-months":
      return addMonths(startsAt, 6);
    case "yearly":
      return addMonths(startsAt, 12);
    default:
      // Fallback: treat as 1 month
      return addMonths(startsAt, 1);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header for user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to upload proof of payment.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with user's access token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired session.' },
        { status: 401 }
      );
    }

    // Prevent duplicate submissions:
    // - Block if user already has a pending proof
    // - Block if user has a verified proof and membership hasn't ended
    const now = new Date();

    const { data: pendingExisting, error: pendingErr } = await supabase
      .from("payment_proofs")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1);

    if (pendingErr) {
      console.error("Error checking pending proofs:", pendingErr);
    }

    if (pendingExisting && pendingExisting.length > 0) {
      return NextResponse.json(
        { error: "You already submitted a proof of payment. Please wait for admin review." },
        { status: 409 }
      );
    }

    const { data: activeVerified, error: verifiedErr } = await supabase
      .from("payment_proofs")
      .select("membership_ends_at")
      .eq("user_id", user.id)
      .eq("status", "verified")
      .order("membership_ends_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verifiedErr) {
      console.error("Error checking verified proofs:", verifiedErr);
    }

    const membershipEndsAt = activeVerified?.membership_ends_at
      ? new Date(activeVerified.membership_ends_at)
      : null;

    if (membershipEndsAt && membershipEndsAt.getTime() > now.getTime()) {
      return NextResponse.json(
        { error: "Your membership is still active. You can upload a new proof after it ends (or if an admin rejects your proof)." },
        { status: 409 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('proof') as File;
    const reference = formData.get('reference') as string;
    const planId = formData.get('planId') as string;
    const amount = formData.get('amount') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${reference}-${timestamp}.${fileExtension}`;
    const key = `proofs/${filename}`;

    // Upload to R2 bucket
    const bucketName = process.env.R2_PROOF_OF_PAYMENT_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: 'R2 bucket configuration missing' },
        { status: 500 }
      );
    }

    const publicUrl = await uploadToR2(
      bucketName,
      key,
      buffer,
      file.type
    );

    const membershipStartsAt = now;
    const computedMembershipEndsAt = computeMembershipEnd(planId, membershipStartsAt);

    // Save to Supabase database
    const { data: paymentProof, error: dbError } = await supabase
      .from('payment_proofs')
      .insert({
        user_id: user.id,
        payment_reference: reference,
        plan_id: planId,
        amount: parseFloat(amount),
        proof_url: publicUrl,
        file_name: filename,
        file_size: file.size,
        file_type: file.type,
        status: 'pending', // pending, verified, rejected
        uploaded_at: now.toISOString(),
        membership_starts_at: membershipStartsAt.toISOString(),
        membership_ends_at: computedMembershipEndsAt.toISOString(),
      })
      .select()
      .single();

    // Telegram notification (don't block the request if it fails)
    const telegramText =
      `🧾 New payment proof uploaded\n` +
      `User: ${user.email ?? "(no email)"}\n` +
      `User ID: ${user.id}\n` +
      `Plan: ${planId}\n` +
      `Amount: $${amount}\n` +
      `Reference: ${reference}\n` +
      `Proof: ${publicUrl}\n` +
      (dbError ? `\nDB save: FAILED (${dbError.message})` : `\nDB save: OK`);

    try {
      await sendTelegramMessage(telegramText);
    } catch (err) {
      console.error("Telegram notification failed:", err);
    }

    if (dbError) {
      console.error('Error saving payment proof to database:', dbError);
      // If table doesn't exist, log the error but still return success for the upload
      // You'll need to create the table in Supabase
      return NextResponse.json({
        success: true,
        message: 'Proof of payment uploaded successfully, but failed to save to database. Please contact support.',
        filePath: publicUrl,
        reference,
        warning: 'Database error: ' + dbError.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Proof of payment uploaded successfully',
      filePath: publicUrl,
      reference,
      paymentProofId: paymentProof?.id,
    });
  } catch (error) {
    console.error('Error uploading proof of payment:', error);
    return NextResponse.json(
      { error: 'Failed to upload proof of payment' },
      { status: 500 }
    );
  }
}

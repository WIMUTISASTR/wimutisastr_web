import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/storage/r2-client';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/utils/telegram';
import { env } from '@/lib/utils/env';
import { logger } from '@/lib/utils/logger';
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit/redis';
import { validateFileBuffer, sanitizeFilename } from '@/lib/storage/file-validation';

const log = logger.child({ module: 'api/payment/upload-proof' });

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
    // Rate limiting - strict for file uploads
    const rateLimitResult = await rateLimit(request, RateLimitPresets.upload);
    if (!rateLimitResult.success) {
      log.warn('Rate limit exceeded for upload-proof', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return createRateLimitResponse(rateLimitResult);
    }

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
    const supabase = createClient(env.supabase.url(), env.supabase.anonKey(), {
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
      log.error("Error checking pending proofs", pendingErr, { userId: user.id });
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
      log.error("Error checking verified proofs", verifiedErr, { userId: user.id });
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

    // Convert file to buffer for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Enhanced file validation - checks magic numbers, not just MIME type
    const validation = validateFileBuffer(buffer, file.name, file.type, 'paymentProof');
    if (!validation.valid) {
      log.warn('File validation failed', {
        userId: user.id,
        filename: file.name,
        mimeType: file.type,
        error: validation.error,
      });
      return NextResponse.json(
        { error: validation.error || 'Invalid file' },
        { status: 400 }
      );
    }

    // Generate secure filename
    const timestamp = Date.now();
    const sanitizedOriginalName = sanitizeFilename(file.name);
    const fileExtension = sanitizedOriginalName.split('.').pop() || 'jpg';
    const filename = `${sanitizeFilename(reference)}-${timestamp}.${fileExtension}`;
    const key = `proofs/${filename}`;

    log.info('File validation passed', {
      userId: user.id,
      detectedType: validation.detectedType,
      filename,
    });

    // Upload to R2 bucket
    const bucketName = env.r2.proofOfPaymentBucket();
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
      log.error("Telegram notification failed", err);
    }

    if (dbError) {
      log.error('Error saving payment proof to database', dbError, {
        userId: user.id,
        reference,
      });
      return NextResponse.json({
        success: true,
        message: 'Proof of payment uploaded successfully, but failed to save to database. Please contact support.',
        filePath: publicUrl,
        reference,
        warning: 'Database error: ' + dbError.message,
      });
    }

    log.info('Payment proof uploaded successfully', {
      userId: user.id,
      reference,
      proofId: paymentProof?.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Proof of payment uploaded successfully',
      filePath: publicUrl,
      reference,
      paymentProofId: paymentProof?.id,
    });
  } catch (error) {
    log.error('Error uploading proof of payment', error);
    return NextResponse.json(
      { error: 'Failed to upload proof of payment' },
      { status: 500 }
    );
  }
}

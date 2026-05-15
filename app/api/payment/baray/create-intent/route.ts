import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encryptPayload, getApiKey } from '@/lib/payment/baray';
import { env } from '@/lib/utils/env';
import logger from '@/lib/utils/logger';
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit/redis';

const log = logger.child({ module: 'api/payment/baray/create-intent' });

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RateLimitPresets.standard);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(env.supabase.url(), env.supabase.anonKey(), {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Invalid or expired session.' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, amount, currency = 'USD' } = body as {
      planId: string;
      amount: number;
      currency?: string;
    };

    if (!planId || !amount) {
      return NextResponse.json({ error: 'planId and amount are required' }, { status: 400 });
    }

    // Block if user already has an active membership
    const now = new Date();
    const { data: activeProof } = await supabase
      .from('payment_proofs')
      .select('membership_ends_at')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .order('membership_ends_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeProof?.membership_ends_at && new Date(activeProof.membership_ends_at) > now) {
      return NextResponse.json(
        { error: 'Your membership is still active.' },
        { status: 409 }
      );
    }

    // Resolve subscription plan for duration + name
    const supabaseAdmin = createClient(env.supabase.url(), env.supabase.serviceRoleKey());
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('id, name, duration_days, price, currency')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    // Create a pending payment_proof so we have an ID to use as Baray order_id
    const membershipStartsAt = now.toISOString();
    const membershipEndsAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString();

    const { data: proof, error: proofError } = await supabaseAdmin
      .from('payment_proofs')
      .insert({
        user_id: user.id,
        payment_reference: 'baray_pending',
        subscription_plan_id: plan.id,
        plan_id: planId,
        amount: parseFloat(amount.toString()),
        proof_url: '',
        file_name: 'baray_payment',
        file_size: 0,
        file_type: 'baray',
        payment_source: 'baray',
        status: 'pending',
        uploaded_at: now.toISOString(),
        membership_starts_at: membershipStartsAt,
        membership_ends_at: membershipEndsAt,
        notes: 'Baray online payment — pending confirmation',
      })
      .select('id')
      .single();

    if (proofError || !proof) {
      log.error('Failed to create payment proof record', proofError);
      return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/payment/success?ref=${proof.id}`;

    const payload = {
      amount: parseFloat(amount.toString()).toFixed(2),
      currency: currency.toUpperCase(),
      order_id: proof.id,
      tracking: { user_id: user.id, plan_id: planId },
      order_details: { items: [{ name: plan.name, price: parseFloat(amount.toString()) }] },
      custom_success_url: successUrl,
    };

    const encryptedData = encryptPayload(payload);

    const barayRes = await fetch('https://api.baray.io/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getApiKey(),
      },
      body: JSON.stringify({ data: encryptedData }),
    });

    if (!barayRes.ok) {
      const errBody = await barayRes.json().catch(() => ({})) as { error?: string };
      log.error('Baray API error', { status: barayRes.status, error: errBody });

      // Clean up the pending proof record
      await supabaseAdmin.from('payment_proofs').delete().eq('id', proof.id);

      return NextResponse.json(
        { error: errBody.error || 'Payment gateway error. Please try again.' },
        { status: 502 }
      );
    }

    const intent = await barayRes.json() as { _id: string; order_id: string };

    // Update payment_reference with the Baray intent ID
    await supabaseAdmin
      .from('payment_proofs')
      .update({ payment_reference: intent._id })
      .eq('id', proof.id);

    log.info('Baray payment intent created', { proofId: proof.id, intentId: intent._id, userId: user.id });

    return NextResponse.json({
      intentId: intent._id,
      redirectUrl: `https://pay.baray.io/${intent._id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error('Failed to create Baray payment intent', { message });
    const isMissingCredentials = message.includes('Missing Baray credentials');
    return NextResponse.json(
      { error: isMissingCredentials ? 'Payment gateway is not configured. Please contact support.' : 'Internal server error' },
      { status: 500 }
    );
  }
}

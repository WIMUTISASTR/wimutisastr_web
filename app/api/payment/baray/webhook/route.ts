import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  activateBarayMembership,
  isBarayPaymentProof,
} from '@/lib/payment/baray-membership';
import {
  decryptBarayWebhookOrderId,
  parseBarayWebhookBody,
  verifyBarayWebhookRequest,
} from '@/lib/payment/baray-webhook';
import { env } from '@/lib/utils/env';
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit/redis';
import logger from '@/lib/utils/logger';

const log = logger.child({ module: 'api/payment/baray/webhook' });

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RateLimitPresets.strict);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    if (!verifyBarayWebhookRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    let parsed;
    try {
      parsed = parseBarayWebhookBody(body);
    } catch (err) {
      log.warn('Invalid Baray webhook payload', { error: err instanceof Error ? err.message : String(err) });
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    let orderId: string;
    try {
      orderId = decryptBarayWebhookOrderId(parsed.encrypted_order_id!);
    } catch (err) {
      log.error('Failed to decrypt Baray webhook order_id', err);
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    log.info('Baray webhook received', { orderId, bank: parsed.bank });

    const supabaseAdmin = createClient(env.supabase.url(), env.supabase.serviceRoleKey());

    const { data: proof, error: proofError } = await supabaseAdmin
      .from('payment_proofs')
      .select(
        'id, user_id, subscription_plan_id, plan_id, membership_starts_at, membership_ends_at, status, payment_source, file_type'
      )
      .eq('id', orderId)
      .single();

    if (proofError || !proof) {
      log.error('Payment proof not found for Baray webhook', { orderId });
      // Return 200 so Baray doesn't retry — unknown order
      return new NextResponse('OK', { status: 200 });
    }

    if (!isBarayPaymentProof(proof)) {
      log.warn('Baray webhook for non-Baray proof', { orderId });
      return new NextResponse('OK', { status: 200 });
    }

    if (proof.status === 'verified') {
      log.info('Payment proof already verified', { orderId });
      return new NextResponse('OK', { status: 200 });
    }

    await activateBarayMembership(supabaseAdmin, proof, {
      bank: parsed.bank,
      source: 'webhook',
    });

    log.info('Baray webhook processed successfully', { orderId, userId: proof.user_id });
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    log.error('Baray webhook handler error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

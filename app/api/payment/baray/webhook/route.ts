import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decryptOrderId } from '@/lib/payment/baray';
import { sendTelegramMessage } from '@/lib/utils/telegram';
import { env } from '@/lib/utils/env';
import logger from '@/lib/utils/logger';

const log = logger.child({ module: 'api/payment/baray/webhook' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { encrypted_order_id: string; bank: string };
    const { encrypted_order_id, bank } = body;

    if (!encrypted_order_id) {
      return NextResponse.json({ error: 'Missing encrypted_order_id' }, { status: 400 });
    }

    let orderId: string;
    try {
      orderId = decryptOrderId(encrypted_order_id);
    } catch (err) {
      log.error('Failed to decrypt Baray webhook order_id', err);
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    log.info('Baray webhook received', { orderId, bank });

    const supabaseAdmin = createClient(env.supabase.url(), env.supabase.serviceRoleKey());

    // orderId is the payment_proof.id we set as the Baray order_id
    const { data: proof, error: proofError } = await supabaseAdmin
      .from('payment_proofs')
      .select('id, user_id, subscription_plan_id, plan_id, membership_starts_at, membership_ends_at, status')
      .eq('id', orderId)
      .single();

    if (proofError || !proof) {
      log.error('Payment proof not found for Baray webhook', { orderId });
      // Return 200 so Baray doesn't retry — unknown order
      return new NextResponse('OK', { status: 200 });
    }

    if (proof.status === 'verified') {
      log.info('Payment proof already verified', { orderId });
      return new NextResponse('OK', { status: 200 });
    }

    const now = new Date();

    // Compute membership dates from subscription plan
    let membershipEndsAt: string = proof.membership_ends_at;
    if (proof.subscription_plan_id) {
      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('duration_days')
        .eq('id', proof.subscription_plan_id)
        .single();

      if (plan?.duration_days) {
        membershipEndsAt = new Date(
          now.getTime() + Number(plan.duration_days) * 24 * 60 * 60 * 1000
        ).toISOString();
      }
    }

    const membershipStartsAt = now.toISOString();

    // Mark payment proof as verified
    const { error: updateError } = await supabaseAdmin
      .from('payment_proofs')
      .update({
        status: 'verified',
        verified_at: now.toISOString(),
        membership_starts_at: membershipStartsAt,
        membership_ends_at: membershipEndsAt,
        notes: `Auto-verified via Baray. Bank: ${bank ?? 'unknown'}`,
      })
      .eq('id', proof.id);

    if (updateError) {
      log.error('Failed to update payment proof status', updateError, { orderId });
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    // Update user profile to activate membership
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        membership_status: 'approved',
        membership_approved_at: now.toISOString(),
        membership_denied_at: null,
        membership_starts_at: membershipStartsAt,
        membership_ends_at: membershipEndsAt,
      })
      .eq('id', proof.user_id);

    if (profileError) {
      log.error('Failed to update user profile after Baray payment', profileError, { userId: proof.user_id });
    }

    // Telegram notification
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(proof.user_id);
      const userEmail = authData?.user?.email ?? '(unknown)';

      await sendTelegramMessage(
        `✅ Baray payment verified\n` +
        `User: ${userEmail}\n` +
        `Order ID: ${orderId}\n` +
        `Bank: ${bank ?? 'unknown'}\n` +
        `Membership until: ${membershipEndsAt}`
      );
    } catch (err) {
      log.error('Telegram notification failed', err);
    }

    log.info('Baray webhook processed successfully', { orderId, userId: proof.user_id });
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    log.error('Baray webhook handler error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/utils/env';
import logger from '@/lib/utils/logger';

const log = logger.child({ module: 'api/payment/baray/activate' });

/**
 * POST /api/payment/baray/activate
 *
 * Called from the payment success page immediately after Baray redirects
 * the user back. Baray only hits the custom_success_url on genuine payment
 * success, so receiving this call is sufficient evidence to activate the
 * user's membership — no need to wait for the async webhook.
 *
 * The webhook (/api/payment/baray/webhook) remains the primary path and is
 * the reliable backup. Both paths are idempotent: if the proof is already
 * 'verified' this endpoint returns success without touching anything.
 */
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { ref: string };
    const { ref } = body;

    if (!ref) {
      return NextResponse.json({ error: 'ref is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(env.supabase.url(), env.supabase.serviceRoleKey());

    const { data: proof, error: proofError } = await supabaseAdmin
      .from('payment_proofs')
      .select('id, user_id, subscription_plan_id, status, payment_source, file_type')
      .eq('id', ref)
      .single();

    if (proofError || !proof) {
      log.warn('Payment proof not found for activate', { ref, userId: user.id });
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Security: proof must belong to the authenticated user
    if (proof.user_id !== user.id) {
      log.warn('Activate attempt for wrong user', { ref, userId: user.id, proofUserId: proof.user_id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Idempotent: already activated (webhook fired first)
    if (proof.status === 'verified') {
      log.info('Proof already verified (webhook fired first)', { ref });
      return NextResponse.json({ success: true, alreadyActivated: true });
    }

    // Only auto-activate Baray payments — manual proofs still need admin review
    if (proof.payment_source !== 'baray' && proof.file_type !== 'baray') {
      return NextResponse.json({ error: 'Not a Baray payment' }, { status: 400 });
    }

    if (proof.status !== 'pending') {
      return NextResponse.json({ error: 'Payment cannot be activated' }, { status: 400 });
    }

    const now = new Date();

    // Resolve membership end date from the subscription plan
    let membershipEndsAt: string | null = null;
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

    if (!membershipEndsAt) {
      log.error('Unable to resolve plan duration', { ref, planId: proof.subscription_plan_id });
      return NextResponse.json({ error: 'Unable to determine plan duration' }, { status: 400 });
    }

    const membershipStartsAt = now.toISOString();

    const { error: updateError } = await supabaseAdmin
      .from('payment_proofs')
      .update({
        status: 'verified',
        verified_at: membershipStartsAt,
        membership_starts_at: membershipStartsAt,
        membership_ends_at: membershipEndsAt,
        notes: 'Auto-verified via Baray success redirect',
      })
      .eq('id', proof.id);

    if (updateError) {
      log.error('Failed to update payment proof', updateError, { ref });
      return NextResponse.json({ error: 'Activation failed' }, { status: 500 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        membership_status: 'approved',
        membership_approved_at: membershipStartsAt,
        membership_denied_at: null,
        membership_starts_at: membershipStartsAt,
        membership_ends_at: membershipEndsAt,
      })
      .eq('id', user.id);

    if (profileError) {
      log.error('Failed to update user profile after activation', profileError, { userId: user.id });
    }

    log.info('Membership activated via success redirect', { ref, userId: user.id, membershipEndsAt });
    return NextResponse.json({ success: true, membershipEndsAt });
  } catch (error) {
    log.error('Activate endpoint error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

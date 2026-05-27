import { SupabaseClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/utils/telegram';
import logger from '@/lib/utils/logger';

const log = logger.child({ module: 'payment/baray-membership' });

export type BarayPaymentProof = {
  id: string;
  user_id: string;
  subscription_plan_id: string | null;
  plan_id: string | null;
  membership_starts_at: string | null;
  membership_ends_at: string | null;
  status: string;
  payment_source: string | null;
  file_type: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidBarayOrderId(orderId: string): boolean {
  return UUID_RE.test(orderId);
}

export function isBarayPaymentProof(proof: Pick<BarayPaymentProof, 'payment_source' | 'file_type'>): boolean {
  return proof.payment_source === 'baray' || proof.file_type === 'baray';
}

/**
 * Activate membership after Baray webhook confirms payment.
 * Idempotent — safe to call if proof is already verified.
 */
export async function activateBarayMembership(
  supabaseAdmin: SupabaseClient,
  proof: BarayPaymentProof,
  options: { bank?: string; source: 'webhook' | 'webhook-replay' }
): Promise<{ alreadyVerified: boolean; membershipEndsAt: string }> {
  if (proof.status === 'verified') {
    return {
      alreadyVerified: true,
      membershipEndsAt: proof.membership_ends_at ?? new Date().toISOString(),
    };
  }

  if (!isBarayPaymentProof(proof)) {
    throw new Error('Not a Baray payment proof');
  }

  if (proof.status !== 'pending') {
    throw new Error(`Payment proof cannot be activated (status: ${proof.status})`);
  }

  const now = new Date();
  let membershipEndsAt: string = proof.membership_ends_at ?? now.toISOString();

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
  const notes =
    options.source === 'webhook'
      ? `Auto-verified via Baray. Bank: ${options.bank ?? 'unknown'}`
      : `Auto-verified via Baray (replay). Bank: ${options.bank ?? 'unknown'}`;

  const { error: updateError } = await supabaseAdmin
    .from('payment_proofs')
    .update({
      status: 'verified',
      verified_at: now.toISOString(),
      membership_starts_at: membershipStartsAt,
      membership_ends_at: membershipEndsAt,
      notes,
    })
    .eq('id', proof.id)
    .eq('status', 'pending');

  if (updateError) {
    log.error('Failed to update payment proof status', updateError, { orderId: proof.id });
    throw updateError;
  }

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
    log.error('Failed to update user profile after Baray payment', profileError, {
      userId: proof.user_id,
    });
  }

  try {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(proof.user_id);
    const userEmail = authData?.user?.email ?? '(unknown)';

    await sendTelegramMessage(
      `✅ Baray payment verified\n` +
        `User: ${userEmail}\n` +
        `Order ID: ${proof.id}\n` +
        `Bank: ${options.bank ?? 'unknown'}\n` +
        `Membership until: ${membershipEndsAt}`
    );
  } catch (err) {
    log.error('Telegram notification failed', err);
  }

  log.info('Baray membership activated', { orderId: proof.id, userId: proof.user_id });

  return { alreadyVerified: false, membershipEndsAt };
}

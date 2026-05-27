import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/utils/env';
import { isBarayPaymentProof } from '@/lib/payment/baray-membership';
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit/redis';
import logger from '@/lib/utils/logger';

const log = logger.child({ module: 'api/payment/baray/status' });

export type BarayPaymentStatus = 'pending' | 'verified' | 'not_found' | 'unauthorized';

/**
 * GET /api/payment/baray/status?ref=<proofId>
 *
 * Read-only status check for the payment success page.
 * Never activates membership — only the Baray webhook may do that.
 */
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ref = request.nextUrl.searchParams.get('ref')?.trim();
    if (!ref) {
      return NextResponse.json({ error: 'ref is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(env.supabase.url(), env.supabase.serviceRoleKey());

    const { data: proof, error: proofError } = await supabaseAdmin
      .from('payment_proofs')
      .select('id, user_id, status, payment_source, file_type, membership_ends_at')
      .eq('id', ref)
      .maybeSingle();

    if (proofError) {
      log.error('Failed to fetch payment proof status', proofError, { ref });
      return NextResponse.json({ error: 'Unable to check payment status' }, { status: 500 });
    }

    if (!proof) {
      return NextResponse.json({
        status: 'not_found' satisfies BarayPaymentStatus,
        membershipEndsAt: null,
      });
    }

    if (proof.user_id !== user.id) {
      log.warn('Status check for wrong user', { ref, userId: user.id, proofUserId: proof.user_id });
      return NextResponse.json({
        status: 'unauthorized' satisfies BarayPaymentStatus,
        membershipEndsAt: null,
      });
    }

    if (!isBarayPaymentProof(proof)) {
      return NextResponse.json({
        status: 'not_found' satisfies BarayPaymentStatus,
        membershipEndsAt: null,
      });
    }

    const status: BarayPaymentStatus =
      proof.status === 'verified' ? 'verified' : 'pending';

    return NextResponse.json({
      status,
      membershipEndsAt: proof.membership_ends_at ?? null,
    });
  } catch (error) {
    log.error('Baray status check failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Server-side payment verification endpoint
 * Validates payment status against database, not localStorage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { 
          hasPaid: false, 
          message: 'User not authenticated' 
        },
        { status: 401 }
      );
    }

    // Check user's profile and payment proof status
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('membership_status')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { 
          hasPaid: false, 
          message: 'Failed to fetch profile' 
        },
        { status: 500 }
      );
    }

    // Check for approved payment proofs
    const { data: proofs, error: proofsError } = await supabase
      .from('payment_proofs')
      .select('status, membership_ends_at')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('membership_ends_at', { ascending: false })
      .limit(1);

    if (proofsError) {
      return NextResponse.json(
        { 
          hasPaid: false, 
          message: 'Failed to fetch payment proofs' 
        },
        { status: 500 }
      );
    }

    // User has paid if:
    // 1. They have an approved payment proof
    // 2. Their membership hasn't expired
    const latestProof = proofs?.[0];
    const hasPaid = latestProof && latestProof.status === 'approved';
    const membershipEndsAt = latestProof?.membership_ends_at || null;
    
    // Check if membership has expired
    const isExpired = membershipEndsAt 
      ? new Date(membershipEndsAt) < new Date() 
      : false;

    return NextResponse.json({
      hasPaid: hasPaid && !isExpired,
      membershipEndsAt,
      isExpired,
      membershipStatus: profile?.membership_status || 'none',
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        hasPaid: false, 
        message: 'Unexpected error during verification' 
      },
      { status: 500 }
    );
  }
}

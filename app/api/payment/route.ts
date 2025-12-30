import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for payment sessions (in production, use a database)
const paymentSessions = new Map<string, {
  planId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
  qrData: string;
}>();

// Generate KHQR payment string
// Format: KHQR format with merchant info and amount
function generateKHQRData(amount: number, reference: string): string {
  // KHQR format: 00020101021238570010A00000072701270006KHQR01...
  // For demo purposes, we'll create a simplified version
  // In production, use actual Bakong/KHQR API to generate proper QR
  const merchantId = process.env.BAKONG_MERCHANT_ID || 'DEMO_MERCHANT';
  const merchantName = process.env.BAKONG_MERCHANT_NAME || 'Wimutisastr';
  
  // Simplified KHQR data structure
  // Real implementation would use Bakong API
  return JSON.stringify({
    type: 'KHQR',
    merchant: merchantId,
    merchantName: merchantName,
    amount: amount,
    currency: 'USD',
    reference: reference,
    timestamp: Date.now(),
  });
}

// POST: Create a new payment session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, amount } = body;

    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Plan ID and amount are required' },
        { status: 400 }
      );
    }

    // Generate unique payment reference
    const reference = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate QR code data
    const qrData = generateKHQRData(amount, reference);

    // Create payment session
    const session = {
      planId,
      amount,
      status: 'pending' as const,
      createdAt: Date.now(),
      qrData,
    };

    paymentSessions.set(reference, session);

    return NextResponse.json({
      reference,
      qrData,
      status: 'pending',
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}

// GET: Check payment status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const session = paymentSessions.get(reference);

    if (!session) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      );
    }

    // Simulate payment verification
    // In production, this would check with Bakong API
    // For demo: randomly mark as completed after 10-30 seconds
    const elapsed = Date.now() - session.createdAt;
    if (session.status === 'pending' && elapsed > 10000) {
      // Simulate payment completion (80% success rate for demo)
      const isSuccess = Math.random() > 0.2;
      session.status = isSuccess ? 'completed' : 'failed';
    }

    return NextResponse.json({
      reference,
      status: session.status,
      planId: session.planId,
      amount: session.amount,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}


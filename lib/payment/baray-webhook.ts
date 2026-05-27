import { NextRequest } from 'next/server';
import { decryptOrderId } from '@/lib/payment/baray';
import { isValidBarayOrderId } from '@/lib/payment/baray-membership';
import logger from '@/lib/utils/logger';

const log = logger.child({ module: 'payment/baray-webhook' });

export type BarayWebhookBody = {
  encrypted_order_id?: string;
  bank?: string;
};

/**
 * Baray authenticates webhooks via AES-256-CBC encryption using the merchant SK/IV.
 * Only payloads encrypted by Baray (or our server with the same keys) decrypt successfully.
 */
export function decryptBarayWebhookOrderId(encryptedOrderId: string): string {
  const orderId = decryptOrderId(encryptedOrderId);

  if (!orderId || !isValidBarayOrderId(orderId)) {
    throw new Error('Decrypted order_id is not a valid payment proof UUID');
  }

  return orderId;
}

export function parseBarayWebhookBody(body: unknown): BarayWebhookBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid webhook body');
  }

  const record = body as Record<string, unknown>;
  const encrypted_order_id = record.encrypted_order_id;
  const bank = record.bank;

  if (typeof encrypted_order_id !== 'string' || encrypted_order_id.trim() === '') {
    throw new Error('Missing encrypted_order_id');
  }

  return {
    encrypted_order_id: encrypted_order_id.trim(),
    bank: typeof bank === 'string' ? bank : undefined,
  };
}

/**
 * Optional defense-in-depth: verify Baray sends x-api-key on webhooks when configured.
 */
export function verifyBarayWebhookRequest(request: NextRequest): boolean {
  const expectedApiKey = process.env.BARAY_API_KEY?.trim();
  if (!expectedApiKey) return true;

  const headerKey = request.headers.get('x-api-key');
  if (!headerKey) {
    // Baray may not always send x-api-key — rely on encrypted payload when absent.
    return true;
  }

  if (headerKey !== expectedApiKey) {
    log.warn('Baray webhook rejected: x-api-key mismatch');
    return false;
  }

  return true;
}

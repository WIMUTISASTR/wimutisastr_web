import crypto from 'crypto';

function getCredentials() {
  const apiKey = process.env.BARAY_API_KEY;
  const sk = process.env.BARAY_SK;
  const iv = process.env.BARAY_IV;

  if (!apiKey || !sk || !iv) {
    throw new Error('Missing Baray credentials: BARAY_API_KEY, BARAY_SK, and BARAY_IV are required.');
  }

  return { apiKey, sk, iv };
}

export function encryptPayload(payload: object): string {
  const { sk, iv } = getCredentials();
  const key = Buffer.from(sk, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  const plaintext = JSON.stringify(payload);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, ivBuffer);
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('base64');
}

export function decryptOrderId(encryptedOrderId: string): string {
  const { sk, iv } = getCredentials();
  const key = Buffer.from(sk, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  const encryptedData = Buffer.from(encryptedOrderId, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

export function getApiKey(): string {
  return getCredentials().apiKey;
}

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 is S3-compatible, so we use the AWS S3 SDK
// R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Required for R2
});

export async function uploadToR2(
  bucketName: string,
  key: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return the public URL
  const publicUrl = process.env.R2_PROOF_OF_PAYMENT_URL || '';
  return `${publicUrl}/${key}`;
}

export { r2Client };

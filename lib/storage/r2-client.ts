import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from '@/lib/utils/env';

// R2 is S3-compatible, so we use the AWS S3 SDK
// R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.r2.accountId()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2.accessKeyId(),
    secretAccessKey: env.r2.secretAccessKey(),
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

type SignedUrlOverrides = {
  responseContentType?: string;
  responseContentDisposition?: string;
};

export async function getSignedR2ObjectUrl(
  bucketName: string,
  key: string,
  expiresInSeconds: number,
  overrides: SignedUrlOverrides = {}
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ResponseContentType: overrides.responseContentType,
    ResponseContentDisposition: overrides.responseContentDisposition,
  });
  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

export { r2Client };

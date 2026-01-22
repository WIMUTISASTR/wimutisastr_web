/**
 * Enhanced file validation with magic number checking
 * Validates file content, not just MIME type
 */

import { logger } from '../utils/logger';

const log = logger.child({ module: 'file-validation' });

/**
 * File magic numbers (file signatures)
 * These are the first few bytes that identify a file type
 * null means "any byte" (wildcard)
 */
const FILE_SIGNATURES: Record<string, { signature: (number | null)[][]; extensions: string[] }> = {
  // Images
  jpeg: {
    signature: [
      [0xFF, 0xD8, 0xFF, 0xE0],
      [0xFF, 0xD8, 0xFF, 0xE1],
      [0xFF, 0xD8, 0xFF, 0xE2],
      [0xFF, 0xD8, 0xFF, 0xE3],
      [0xFF, 0xD8, 0xFF, 0xE8],
    ],
    extensions: ['jpg', 'jpeg'],
  },
  png: {
    signature: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    extensions: ['png'],
  },
  gif: {
    signature: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
    extensions: ['gif'],
  },
  webp: {
    signature: [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]],
    extensions: ['webp'],
  },
  // Documents
  pdf: {
    signature: [[0x25, 0x50, 0x44, 0x46]],
    extensions: ['pdf'],
  },
};

/**
 * Allowed file types for different upload contexts
 */
export const FileTypeConfigs = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['jpeg', 'png', 'gif', 'webp'] as string[],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as string[],
  },
  paymentProof: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['jpeg', 'png', 'pdf'] as string[],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'] as string[],
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['pdf'] as string[],
    allowedMimeTypes: ['application/pdf'] as string[],
  },
};

export type FileTypeConfig = keyof typeof FileTypeConfigs;

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: string;
}

/**
 * Check if buffer matches any of the file signatures
 */
function matchesSignature(buffer: Buffer, signatures: (number | null)[][]): boolean {
  return signatures.some(sig => {
    for (let i = 0; i < sig.length; i++) {
      const expectedByte = sig[i];
      // null means "any byte" (wildcard)
      if (expectedByte !== null && buffer[i] !== expectedByte) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Detect file type from buffer content (magic number)
 */
function detectFileType(buffer: Buffer): string | null {
  for (const [type, { signature }] of Object.entries(FILE_SIGNATURES)) {
    if (matchesSignature(buffer, signature)) {
      return type;
    }
  }
  return null;
}

/**
 * Validate file extension matches content
 */
function validateExtension(filename: string, detectedType: string): boolean {
  const extension = filename.toLowerCase().split('.').pop();
  if (!extension) return false;

  const typeConfig = FILE_SIGNATURES[detectedType];
  return typeConfig?.extensions.includes(extension) ?? false;
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Comprehensive file validation
 */
export async function validateFile(
  file: File,
  configType: FileTypeConfig = 'image'
): Promise<ValidationResult> {
  const config = FileTypeConfigs[configType];

  // 1. Check file size
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // 2. Check MIME type (first line of defense)
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
    };
  }

  // 3. Read file header to check magic numbers
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read first 16 bytes (enough for most file signatures)
    const header = buffer.slice(0, 16);
    const detectedType = detectFileType(header);

    if (!detectedType) {
      log.warn('Could not detect file type from magic number', {
        filename: file.name,
        mimeType: file.type,
        headerHex: header.toString('hex'),
      });
      return {
        valid: false,
        error: 'Could not verify file type. The file may be corrupted or invalid.',
      };
    }

    // 4. Verify detected type matches allowed types
    if (!config.allowedTypes.includes(detectedType)) {
      return {
        valid: false,
        error: `File content type ${detectedType} does not match allowed types`,
      };
    }

    // 5. Verify file extension matches content
    if (!validateExtension(file.name, detectedType)) {
      log.warn('File extension does not match content', {
        filename: file.name,
        detectedType,
        mimeType: file.type,
      });
      return {
        valid: false,
        error: 'File extension does not match file content',
      };
    }

    return {
      valid: true,
      detectedType,
    };
  } catch (error) {
    log.error('File validation failed', error, { filename: file.name });
    return {
      valid: false,
      error: 'Failed to validate file',
    };
  }
}

/**
 * Validate file buffer (for server-side validation)
 */
export function validateFileBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  configType: FileTypeConfig = 'image'
): ValidationResult {
  const config = FileTypeConfigs[configType];

  // 1. Check buffer size
  if (buffer.length === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (buffer.length > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // 2. Check MIME type
  if (!config.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed`,
    };
  }

  // 3. Check magic numbers
  const header = buffer.slice(0, 16);
  const detectedType = detectFileType(header);

  if (!detectedType) {
    log.warn('Could not detect file type from magic number', {
      filename,
      mimeType,
      headerHex: header.toString('hex'),
    });
    return {
      valid: false,
      error: 'Could not verify file type. The file may be corrupted or invalid.',
    };
  }

  // 4. Verify detected type matches allowed types
  if (!config.allowedTypes.includes(detectedType)) {
    return {
      valid: false,
      error: `File content type ${detectedType} does not match allowed types`,
    };
  }

  // 5. Verify file extension matches content
  if (!validateExtension(filename, detectedType)) {
    log.warn('File extension does not match content', {
      filename,
      detectedType,
      mimeType,
    });
    return {
      valid: false,
      error: 'File extension does not match file content',
    };
  }

  return {
    valid: true,
    detectedType,
  };
}

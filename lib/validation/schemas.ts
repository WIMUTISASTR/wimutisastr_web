import { z } from 'zod';

/**
 * Validation schemas for API inputs
 * Uses Zod for runtime type checking and validation
 */

// ============================================================================
// ID Validators
// ============================================================================

/**
 * UUID validator
 * Validates that the value is a valid UUID v4
 */
export const uuidSchema = z.string().uuid({
  message: 'Invalid ID format. Expected a valid UUID.',
});

/**
 * Book ID validator
 * Accepts UUID or special category "__all__"
 */
export const bookIdSchema = z.string().uuid({
  message: 'Invalid book ID format.',
});

/**
 * Video ID validator
 */
export const videoIdSchema = z.string().uuid({
  message: 'Invalid video ID format.',
});

/**
 * Category ID validator
 * Accepts UUID or special "__all__" category
 */
export const categoryIdSchema = z.union([
  z.string().uuid(),
  z.literal('__all__'),
]).refine(() => true, {
  message: 'Invalid category ID format.',
});

/**
 * User ID validator
 */
export const userIdSchema = z.string().uuid({
  message: 'Invalid user ID format.',
});

// ============================================================================
// Plan & Payment Validators
// ============================================================================

/**
 * Plan ID validator
 * Accepts UUID or legacy plan names
 */
export const planIdSchema = z.string().min(1, {
  message: 'Plan ID is required.',
}).max(100, {
  message: 'Plan ID is too long.',
});

/**
 * Payment reference validator
 */
export const paymentReferenceSchema = z.string()
  .min(1, { message: 'Payment reference is required.' })
  .max(200, { message: 'Payment reference is too long (max 200 characters).' })
  .trim();

/**
 * Amount validator
 * Accepts positive numbers with up to 2 decimal places
 */
export const amountSchema = z.number()
  .positive({ message: 'Amount must be positive.' })
  .finite({ message: 'Amount must be a valid number.' })
  .multipleOf(0.01, { message: 'Amount can have at most 2 decimal places.' });

// ============================================================================
// Token Validators
// ============================================================================

/**
 * Generic token validator
 * For JWT tokens, API tokens, etc.
 */
export const tokenSchema = z.string()
  .min(10, { message: 'Invalid token format.' })
  .max(2000, { message: 'Token is too long.' });

/**
 * Content access token validator
 */
export const contentTokenSchema = tokenSchema;

/**
 * Video access token validator
 */
export const videoTokenSchema = tokenSchema;

/**
 * Storage access token validator
 */
export const storageTokenSchema = tokenSchema;

// ============================================================================
// User Input Validators
// ============================================================================

/**
 * Email validator
 */
export const emailSchema = z.string()
  .email({ message: 'Invalid email address.' })
  .toLowerCase()
  .trim();

/**
 * Password validator
 * Minimum 8 characters, at least one letter and one number
 */
export const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .max(100, { message: 'Password is too long.' })
  .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' });

/**
 * Search query validator
 */
export const searchQuerySchema = z.string()
  .max(200, { message: 'Search query is too long.' })
  .trim()
  .optional();

// ============================================================================
// File Upload Validators
// ============================================================================

/**
 * File size validator (in bytes)
 */
export const fileSizeSchema = z.number()
  .int({ message: 'File size must be an integer.' })
  .positive({ message: 'File size must be positive.' })
  .max(10 * 1024 * 1024, { message: 'File size must not exceed 10MB.' });

/**
 * MIME type validator for images
 */
export const imageMimeTypeSchema = z.enum([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
], {
  message: 'Invalid file type. Only images are allowed.',
});

/**
 * MIME type validator for documents
 */
export const documentMimeTypeSchema = z.enum([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
], {
  message: 'Invalid file type. Only PDF and Word documents are allowed.',
});

// ============================================================================
// Pagination Validators
// ============================================================================

/**
 * Page number validator
 */
export const pageSchema = z.number()
  .int({ message: 'Page must be an integer.' })
  .positive({ message: 'Page must be positive.' })
  .default(1);

/**
 * Page size validator
 */
export const pageSizeSchema = z.number()
  .int({ message: 'Page size must be an integer.' })
  .positive({ message: 'Page size must be positive.' })
  .max(100, { message: 'Page size must not exceed 100.' })
  .default(10);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };


export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the first error message
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Validation failed' };
  }
}


export function validateMultiple<T extends Record<string, unknown>>(
  fields: { [K in keyof T]: [z.ZodSchema<T[K]>, unknown] }
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const data: Record<string, unknown> = {};

  for (const [key, [schema, value]] of Object.entries(fields)) {
    const result = validateInput(schema, value);
    if (!result.success) {
      errors[key] = result.error;
    } else {
      data[key] = result.data;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: data as T };
}


export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): ValidationResult<T> => validateInput(schema, data);
}


export const paymentProofUploadSchema = z.object({
  planId: planIdSchema,
  paymentReference: paymentReferenceSchema,
  amount: z.string().optional().transform((val) => {
    if (!val) return null;
    const num = parseFloat(val);
    if (isNaN(num)) return null;
    return num;
  }),
});

/**
 * Login credentials schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required.' }),
});

/**
 * Registration schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});


export const paginationSchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
});

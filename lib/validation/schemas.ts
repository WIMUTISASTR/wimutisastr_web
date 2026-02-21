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
  message: 'ទម្រង់ ID មិនត្រឹមត្រូវ។ ត្រូវការតម្លៃ UUID ត្រឹមត្រូវ។',
});

/**
 * Book ID validator
 * Accepts UUID or special category "__all__"
 */
export const bookIdSchema = z.string().uuid({
  message: 'ទម្រង់ Book ID មិនត្រឹមត្រូវ។',
});

/**
 * Video ID validator
 */
export const videoIdSchema = z.string().uuid({
  message: 'ទម្រង់ Video ID មិនត្រឹមត្រូវ។',
});

/**
 * Category ID validator
 * Accepts UUID or special "__all__" category
 */
export const categoryIdSchema = z.union([
  z.string().uuid(),
  z.literal('__all__'),
]).refine(() => true, {
  message: 'ទម្រង់ Category ID មិនត្រឹមត្រូវ។',
});

/**
 * User ID validator
 */
export const userIdSchema = z.string().uuid({
  message: 'ទម្រង់ User ID មិនត្រឹមត្រូវ។',
});

// ============================================================================
// Plan & Payment Validators
// ============================================================================

/**
 * Plan ID validator
 * Accepts UUID or legacy plan names
 */
export const planIdSchema = z.string().min(1, {
  message: 'ត្រូវការបញ្ចូល Plan ID។',
}).max(100, {
  message: 'Plan ID វែងពេក។',
});

/**
 * Payment reference validator
 */
export const paymentReferenceSchema = z.string()
  .min(1, { message: 'ត្រូវការបញ្ចូលលេខយោងការទូទាត់។' })
  .max(200, { message: 'លេខយោងការទូទាត់វែងពេក (អតិបរមា 200 តួអក្សរ)។' })
  .trim();

/**
 * Amount validator
 * Accepts positive numbers with up to 2 decimal places
 */
export const amountSchema = z.number()
  .positive({ message: 'ចំនួនទឹកប្រាក់ត្រូវតែធំជាងសូន្យ។' })
  .finite({ message: 'ចំនួនទឹកប្រាក់ត្រូវតែជាលេខត្រឹមត្រូវ។' })
  .multipleOf(0.01, { message: 'ចំនួនទឹកប្រាក់អាចមានទសភាគអតិបរមា 2 ខ្ទង់។' });

// ============================================================================
// Token Validators
// ============================================================================

/**
 * Generic token validator
 * For JWT tokens, API tokens, etc.
 */
export const tokenSchema = z.string()
  .min(10, { message: 'ទម្រង់ token មិនត្រឹមត្រូវ។' })
  .max(2000, { message: 'Token វែងពេក។' });

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
  .email({ message: 'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ។' })
  .toLowerCase()
  .trim();

/**
 * Password validator
 * Minimum 8 characters, at least one letter and one number
 */
export const passwordSchema = z.string()
  .min(8, { message: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 8 តួអក្សរ។' })
  .max(100, { message: 'ពាក្យសម្ងាត់វែងពេក។' })
  .regex(/[a-zA-Z]/, { message: 'ពាក្យសម្ងាត់ត្រូវមានអក្សរយ៉ាងហោចណាស់មួយ។' })
  .regex(/[0-9]/, { message: 'ពាក្យសម្ងាត់ត្រូវមានលេខយ៉ាងហោចណាស់មួយ។' });

/**
 * Search query validator
 */
export const searchQuerySchema = z.string()
  .max(200, { message: 'ពាក្យស្វែងរកវែងពេក។' })
  .trim()
  .optional();

// ============================================================================
// File Upload Validators
// ============================================================================

/**
 * File size validator (in bytes)
 */
export const fileSizeSchema = z.number()
  .int({ message: 'ទំហំឯកសារត្រូវជាចំនួនគត់។' })
  .positive({ message: 'ទំហំឯកសារត្រូវតែធំជាងសូន្យ។' })
  .max(10 * 1024 * 1024, { message: 'ទំហំឯកសារមិនត្រូវលើស 10MB។' });

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
  message: 'ប្រភេទឯកសារមិនត្រឹមត្រូវ។ អនុញ្ញាតតែរូបភាពប៉ុណ្ណោះ។',
});

/**
 * MIME type validator for documents
 */
export const documentMimeTypeSchema = z.enum([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
], {
  message: 'ប្រភេទឯកសារមិនត្រឹមត្រូវ។ អនុញ្ញាតតែឯកសារ PDF និង Word ប៉ុណ្ណោះ។',
});

// ============================================================================
// Pagination Validators
// ============================================================================

/**
 * Page number validator
 */
export const pageSchema = z.number()
  .int({ message: 'ទំព័រត្រូវជាចំនួនគត់។' })
  .positive({ message: 'ទំព័រត្រូវតែធំជាងសូន្យ។' })
  .default(1);

/**
 * Page size validator
 */
export const pageSizeSchema = z.number()
  .int({ message: 'ទំហំទំព័រត្រូវជាចំនួនគត់។' })
  .positive({ message: 'ទំហំទំព័រត្រូវតែធំជាងសូន្យ។' })
  .max(100, { message: 'ទំហំទំព័រមិនត្រូវលើស 100។' })
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
    return { success: false, error: 'ការផ្ទៀងផ្ទាត់បរាជ័យ' };
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
  password: z.string().min(1, { message: 'ត្រូវការបញ្ចូលពាក្យសម្ងាត់។' }),
});

/**
 * Registration schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "ពាក្យសម្ងាត់មិនត្រូវគ្នា",
  path: ['confirmPassword'],
});


export const paginationSchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
});

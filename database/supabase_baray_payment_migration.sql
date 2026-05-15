-- Migration: Support Baray online payment records in payment_proofs
-- Baray payments are auto-verified via webhook; they don't have a proof image.
-- This migration makes proof_url, file_name, file_size, file_type nullable
-- and adds a payment_source column to distinguish manual vs Baray payments.

-- Step 1: Make proof image columns nullable (Baray payments have no uploaded image)
ALTER TABLE public.payment_proofs
  ALTER COLUMN proof_url  DROP NOT NULL,
  ALTER COLUMN file_name  DROP NOT NULL,
  ALTER COLUMN file_size  DROP NOT NULL,
  ALTER COLUMN file_type  DROP NOT NULL;

-- Step 2: Add payment_source column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_proofs' AND column_name = 'payment_source'
  ) THEN
    ALTER TABLE public.payment_proofs
      ADD COLUMN payment_source TEXT NOT NULL DEFAULT 'manual'
        CHECK (payment_source IN ('manual', 'baray'));
  END IF;
END $$;

-- Step 3: Add membership date columns to user_profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'membership_starts_at'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN membership_starts_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN membership_ends_at   TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Step 4: Index for quick Baray payment lookups
CREATE INDEX IF NOT EXISTS idx_payment_proofs_payment_source
  ON public.payment_proofs(payment_source);

COMMENT ON COLUMN public.payment_proofs.payment_source IS
  'Source of the payment: "manual" = QR proof upload; "baray" = Baray online payment auto-verified via webhook.';

SELECT 'Baray payment migration completed successfully.' AS status;

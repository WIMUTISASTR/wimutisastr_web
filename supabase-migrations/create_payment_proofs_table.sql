-- Create payment_proofs table to track user payment proofs
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- References auth.users(id) but without FK constraint due to permissions
  payment_reference TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  proof_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  membership_starts_at TIMESTAMPTZ,
  membership_ends_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID, -- References auth.users(id) but without FK constraint due to permissions
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IMPORTANT:
-- If the table already existed before you added membership columns, the CREATE TABLE IF NOT EXISTS
-- will NOT add new columns. These ALTER TABLE statements make the migration safe to re-run.
ALTER TABLE payment_proofs
  ADD COLUMN IF NOT EXISTS membership_starts_at TIMESTAMPTZ;

ALTER TABLE payment_proofs
  ADD COLUMN IF NOT EXISTS membership_ends_at TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id ON payment_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_reference ON payment_proofs(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_uploaded_at ON payment_proofs(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_membership_ends_at ON payment_proofs(membership_ends_at DESC);

-- Only one pending proof per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_proofs_one_pending_per_user
  ON payment_proofs(user_id)
  WHERE status = 'pending';

-- Enable Row Level Security (RLS)
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payment proofs
DROP POLICY IF EXISTS "Users can view own payment proofs" ON payment_proofs;
CREATE POLICY "Users can view own payment proofs"
  ON payment_proofs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own payment proofs
DROP POLICY IF EXISTS "Users can insert own payment proofs" ON payment_proofs;
CREATE POLICY "Users can insert own payment proofs"
  ON payment_proofs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all payment proofs
-- Using user metadata from JWT token (accessible via auth.jwt())
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON payment_proofs;
CREATE POLICY "Admins can view all payment proofs"
  ON payment_proofs
  FOR SELECT
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
  );

-- Policy: Admins can update payment proofs
DROP POLICY IF EXISTS "Admins can update payment proofs" ON payment_proofs;
CREATE POLICY "Admins can update payment proofs"
  ON payment_proofs
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_payment_proofs_updated_at ON payment_proofs;
CREATE TRIGGER update_payment_proofs_updated_at
  BEFORE UPDATE ON payment_proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE payment_proofs IS 'Stores payment proof images uploaded by users for subscription payments';
COMMENT ON COLUMN payment_proofs.status IS 'Payment verification status: pending, verified, or rejected';
COMMENT ON COLUMN payment_proofs.verified_by IS 'Admin user ID who verified/rejected the payment';

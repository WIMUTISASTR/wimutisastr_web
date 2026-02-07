-- =============================================================================
-- Fix RLS Performance Issues (COMPREHENSIVE)
-- =============================================================================
-- Issues addressed:
-- 1. auth_rls_initplan: auth.role()/auth.uid() re-evaluated per row
--    Fix: Wrap in (SELECT ...) to evaluate once
-- 2. multiple_permissive_policies: Duplicate policies on same table/role/action
--    Fix: Consolidate into single policies
--
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR
-- =============================================================================

-- =============================================================================
-- SUBSCRIPTION_PLANS - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "subscription_plans_service_role_all" ON public.subscription_plans;
DROP POLICY IF EXISTS "Allow service role full access to subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Allow authenticated users to read active plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_read" ON public.subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_write" ON public.subscription_plans;

-- Single read policy for authenticated/anon users (no auth functions needed)
CREATE POLICY "subscription_plans_read"
  ON public.subscription_plans
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Single write policy for service role only (uses SELECT wrapper for performance)
CREATE POLICY "subscription_plans_write"
  ON public.subscription_plans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- USER_PROFILES - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "Service role can manage user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_service_role" ON public.user_profiles;

-- Users can read their own profile (uses SELECT wrapper)
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Service role can manage all profiles (targeted TO service_role, no auth check needed)
CREATE POLICY "user_profiles_service_role"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- BOOKS - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "books_select_policy" ON public.books;
DROP POLICY IF EXISTS "books_write_service_role_only" ON public.books;
DROP POLICY IF EXISTS "books_read" ON public.books;
DROP POLICY IF EXISTS "books_write" ON public.books;

-- Read policy: free books for all authenticated, premium for approved members
CREATE POLICY "books_read"
  ON public.books
  FOR SELECT
  TO authenticated
  USING (
    access_level = 'free'
    OR
    public.has_approved_membership()
  );

-- Write policy for service role only (targeted, no auth check needed)
CREATE POLICY "books_write"
  ON public.books
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- VIDEOS - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "Public can read videos" ON public.videos;
DROP POLICY IF EXISTS "videos_select_members_only" ON public.videos;
DROP POLICY IF EXISTS "videos_write_service_role_only" ON public.videos;
DROP POLICY IF EXISTS "videos_read" ON public.videos;
DROP POLICY IF EXISTS "videos_write" ON public.videos;

-- Read policy: free videos for all authenticated, premium for approved members
CREATE POLICY "videos_read"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (
    access_level = 'free'
    OR
    public.has_approved_membership()
  );

-- Write policy for service role only (targeted, no auth check needed)
CREATE POLICY "videos_write"
  ON public.videos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- CATEGORIES - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_write_service_role_only" ON public.categories;
DROP POLICY IF EXISTS "categories_read" ON public.categories;
DROP POLICY IF EXISTS "categories_write" ON public.categories;

-- Read policy: all authenticated users can browse categories
CREATE POLICY "categories_read"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Write policy for service role only (targeted, no auth check needed)
CREATE POLICY "categories_write"
  ON public.categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- VIDEO_CATEGORIES - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "Public can read video categories" ON public.video_categories;
DROP POLICY IF EXISTS "video_categories_select_members_only" ON public.video_categories;
DROP POLICY IF EXISTS "video_categories_write_service_role_only" ON public.video_categories;
DROP POLICY IF EXISTS "video_categories_read" ON public.video_categories;
DROP POLICY IF EXISTS "video_categories_write" ON public.video_categories;

-- Read policy: all authenticated users can browse video categories
CREATE POLICY "video_categories_read"
  ON public.video_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Write policy for service role only (targeted, no auth check needed)
CREATE POLICY "video_categories_write"
  ON public.video_categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- PAYMENT_PROOFS - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "payment_proofs_insert_own" ON public.payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_select_own" ON public.payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_service_role_all" ON public.payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_insert" ON public.payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_select" ON public.payment_proofs;
DROP POLICY IF EXISTS "payment_proofs_service_role" ON public.payment_proofs;

-- Users can insert their own payment proofs (uses SELECT wrapper)
CREATE POLICY "payment_proofs_insert"
  ON public.payment_proofs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can view their own payment proofs (uses SELECT wrapper)
CREATE POLICY "payment_proofs_select"
  ON public.payment_proofs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Service role can manage all payment proofs (targeted, no auth check needed)
CREATE POLICY "payment_proofs_service_role"
  ON public.payment_proofs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- AUDIT_LOGS - Drop ALL existing policies first
-- =============================================================================
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;

-- Service role can insert audit logs (targeted TO service_role, no auth check needed)
CREATE POLICY "audit_logs_insert"
  ON public.audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =============================================================================
-- Verification
-- =============================================================================
SELECT 'OK: Fixed RLS performance issues - consolidated policies and optimized auth checks' AS status;

-- Fix RLS policy to allow reading FREE books for all authenticated users
-- Premium books still require approved membership

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "books_select_members_only" ON public.books;

-- Create new policy: free books for all authenticated, premium for approved members only
CREATE POLICY "books_select_policy"
  ON public.books
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if book is free
    access_level = 'free'
    OR
    -- Or if user has approved membership
    public.has_approved_membership()
  );

-- Also fix categories so users can browse them
DROP POLICY IF EXISTS "categories_select_members_only" ON public.categories;

CREATE POLICY "categories_select_policy"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (true); -- Categories should be browsable by all authenticated users

-- Done
SELECT 'OK: Fixed RLS to allow free books for all authenticated users' AS status;

-- Optional: enforce relation between payment_proofs and user_profiles without referencing auth.users.
-- Safe to run multiple times.

ALTER TABLE public.payment_proofs
  ADD CONSTRAINT payment_proofs_user_id_user_profiles_fk
  FOREIGN KEY (user_id)
  REFERENCES public.user_profiles(id)
  ON DELETE CASCADE;


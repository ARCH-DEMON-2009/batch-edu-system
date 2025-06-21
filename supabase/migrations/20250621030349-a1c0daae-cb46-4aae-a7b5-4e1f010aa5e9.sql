
-- Remove the unique constraint on email in user_profiles table
-- This constraint is causing the duplicate key error
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;

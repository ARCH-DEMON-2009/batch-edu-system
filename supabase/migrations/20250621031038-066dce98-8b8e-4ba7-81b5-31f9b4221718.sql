
-- Insert permanent demo users into user_profiles table
-- First delete any existing entries for these emails to avoid conflicts
DELETE FROM public.user_profiles WHERE email IN ('shashanksv2009@gmail.com', 'admin@example.com', 'uploader@example.com');

-- Insert the three permanent demo users
INSERT INTO public.user_profiles (email, role, assigned_batches)
VALUES 
  ('shashanksv2009@gmail.com', 'super_admin', '{}'),
  ('admin@example.com', 'admin', '{}'),
  ('uploader@example.com', 'uploader', '{}');

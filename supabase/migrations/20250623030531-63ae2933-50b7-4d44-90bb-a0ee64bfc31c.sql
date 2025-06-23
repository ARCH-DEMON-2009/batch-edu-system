
-- First, remove duplicate entries keeping only the most recent one for each email
DELETE FROM public.user_profiles 
WHERE id NOT IN (
    SELECT DISTINCT ON (email) id
    FROM public.user_profiles
    ORDER BY email, created_at DESC
);

-- Now add the unique constraint on the email column
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Insert or update the super admin user profile
INSERT INTO public.user_profiles (email, role, assigned_batches)
VALUES ('shashanksv2009@gmail.com', 'super_admin', '{}')
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'super_admin',
    assigned_batches = '{}';

-- Also ensure we have the demo admin and uploader users
INSERT INTO public.user_profiles (email, role, assigned_batches)
VALUES 
    ('admin@example.com', 'admin', '{}'),
    ('uploader@example.com', 'uploader', '{}')
ON CONFLICT (email) 
DO UPDATE SET 
    role = EXCLUDED.role,
    assigned_batches = EXCLUDED.assigned_batches;

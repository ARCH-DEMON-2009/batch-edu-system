
-- Update existing user_profiles table to match our needs
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE(user_id);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

-- Ensure assigned_batches column exists and has proper default
ALTER TABLE public.user_profiles 
ALTER COLUMN assigned_batches SET DEFAULT '{}';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can manage users" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage uploaders" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON public.user_profiles;

-- Create new RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Super admins can manage users" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can manage uploaders" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role = 'admin'
    )
    AND role = 'uploader'
  );

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role)
  VALUES (new.id, new.email, 'uploader');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update batches table to track assigned uploaders
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS assigned_uploaders uuid[] DEFAULT '{}';

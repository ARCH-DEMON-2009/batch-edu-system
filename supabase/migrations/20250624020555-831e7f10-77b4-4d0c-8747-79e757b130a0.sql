
-- Only add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add subjects foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subjects_batch_id_fkey' 
        AND table_name = 'subjects'
    ) THEN
        ALTER TABLE public.subjects 
        ADD CONSTRAINT subjects_batch_id_fkey 
        FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;
    END IF;

    -- Add chapters foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chapters_subject_id_fkey' 
        AND table_name = 'chapters'
    ) THEN
        ALTER TABLE public.chapters 
        ADD CONSTRAINT chapters_subject_id_fkey 
        FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
    END IF;

    -- Add lectures foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'lectures_chapter_id_fkey' 
        AND table_name = 'lectures'
    ) THEN
        ALTER TABLE public.lectures 
        ADD CONSTRAINT lectures_chapter_id_fkey 
        FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;
    END IF;

    -- Add live_classes foreign keys if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'live_classes_batch_id_fkey' 
        AND table_name = 'live_classes'
    ) THEN
        ALTER TABLE public.live_classes 
        ADD CONSTRAINT live_classes_batch_id_fkey 
        FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'live_classes_subject_id_fkey' 
        AND table_name = 'live_classes'
    ) THEN
        ALTER TABLE public.live_classes 
        ADD CONSTRAINT live_classes_subject_id_fkey 
        FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'live_classes_chapter_id_fkey' 
        AND table_name = 'live_classes'
    ) THEN
        ALTER TABLE public.live_classes 
        ADD CONSTRAINT live_classes_chapter_id_fkey 
        FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user can access batch
CREATE OR REPLACE FUNCTION public.can_access_batch(batch_id uuid)
RETURNS BOOLEAN AS $$
  SELECT CASE 
    WHEN public.get_current_user_role() IN ('super_admin', 'admin') THEN true
    WHEN public.get_current_user_role() = 'uploader' THEN 
      batch_id = ANY(
        SELECT unnest(assigned_batches) 
        FROM public.user_profiles 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    ELSE false
  END;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for batches
DROP POLICY IF EXISTS "Public read access for batches" ON public.batches;
DROP POLICY IF EXISTS "Authenticated users can manage batches" ON public.batches;

CREATE POLICY "Public read access for batches" ON public.batches
  FOR SELECT USING (true);

CREATE POLICY "Super admins and admins can manage batches" ON public.batches
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Uploaders can read assigned batches" ON public.batches
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND public.can_access_batch(id)
  );

-- RLS Policies for subjects
DROP POLICY IF EXISTS "Public read access for subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can manage subjects" ON public.subjects;

CREATE POLICY "Public read access for subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage subjects" ON public.subjects
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Uploaders can manage subjects in assigned batches" ON public.subjects
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.can_access_batch(batch_id)
  );

-- RLS Policies for chapters
DROP POLICY IF EXISTS "Public read access for chapters" ON public.chapters;
DROP POLICY IF EXISTS "Authenticated users can manage chapters" ON public.chapters;

CREATE POLICY "Public read access for chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage chapters" ON public.chapters
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Uploaders can manage chapters in assigned batches" ON public.chapters
  FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.subjects s 
      WHERE s.id = subject_id AND public.can_access_batch(s.batch_id)
    )
  );

-- RLS Policies for lectures
DROP POLICY IF EXISTS "Public read access for lectures" ON public.lectures;
DROP POLICY IF EXISTS "Authenticated users can manage lectures" ON public.lectures;

CREATE POLICY "Public read access for lectures" ON public.lectures
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage lectures" ON public.lectures
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Uploaders can manage lectures in assigned batches" ON public.lectures
  FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.chapters c 
      JOIN public.subjects s ON s.id = c.subject_id
      WHERE c.id = chapter_id AND public.can_access_batch(s.batch_id)
    )
  );

-- RLS Policies for live_classes
DROP POLICY IF EXISTS "Public read access for live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Authenticated users can manage live_classes" ON public.live_classes;

CREATE POLICY "Public read access for live_classes" ON public.live_classes
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage live_classes" ON public.live_classes
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Uploaders can manage live_classes in assigned batches" ON public.live_classes
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.can_access_batch(batch_id)
  );

-- Add settings table for monetization configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can manage settings" ON public.settings
  FOR ALL USING (public.get_current_user_role() = 'super_admin');

-- Insert default monetization settings
INSERT INTO public.settings (key, value) VALUES 
  ('monetization', '{
    "access_duration": "3600",
    "server1_url": "",
    "server2_url": "",
    "linkshortify_enabled": true
  }')
ON CONFLICT (key) DO NOTHING;

-- Create backup functionality table
CREATE TABLE IF NOT EXISTS public.system_backups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  backup_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can manage backups" ON public.system_backups
  FOR ALL USING (public.get_current_user_role() = 'super_admin');

-- Function to create daily backup
CREATE OR REPLACE FUNCTION public.create_system_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    backup_data jsonb;
BEGIN
    SELECT jsonb_build_object(
        'batches', (SELECT jsonb_agg(to_jsonb(b.*)) FROM public.batches b),
        'subjects', (SELECT jsonb_agg(to_jsonb(s.*)) FROM public.subjects s),
        'chapters', (SELECT jsonb_agg(to_jsonb(c.*)) FROM public.chapters c),
        'lectures', (SELECT jsonb_agg(to_jsonb(l.*)) FROM public.lectures l),
        'live_classes', (SELECT jsonb_agg(to_jsonb(lc.*)) FROM public.live_classes lc),
        'user_profiles', (SELECT jsonb_agg(to_jsonb(up.*)) FROM public.user_profiles up),
        'settings', (SELECT jsonb_agg(to_jsonb(st.*)) FROM public.settings st)
    ) INTO backup_data;
    
    INSERT INTO public.system_backups (backup_date, backup_data)
    VALUES (CURRENT_DATE, backup_data)
    ON CONFLICT (backup_date) 
    DO UPDATE SET 
        backup_data = EXCLUDED.backup_data,
        created_at = now();
END;
$$;

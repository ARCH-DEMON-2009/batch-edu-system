
-- Create tables for the educational platform
CREATE TABLE public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lectures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'direct')),
  dpp_url TEXT,
  notes_url TEXT,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.live_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  live_url TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table for admin management
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'uploader')),
  assigned_batches UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily backup tables
CREATE TABLE public.daily_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_date DATE NOT NULL DEFAULT CURRENT_DATE,
  backup_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_subjects_batch_id ON public.subjects(batch_id);
CREATE INDEX idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX idx_lectures_chapter_id ON public.lectures(chapter_id);
CREATE INDEX idx_live_classes_batch_id ON public.live_classes(batch_id);
CREATE INDEX idx_daily_backups_date ON public.daily_backups(backup_date);

-- Insert default super admin
INSERT INTO public.user_profiles (email, role, assigned_batches) 
VALUES ('shashanksv2009@gmail.com', 'super_admin', '{}');

-- Enable Row Level Security
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_backups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now, will be refined with authentication)
CREATE POLICY "Allow all operations on batches" ON public.batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lectures" ON public.lectures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on live_classes" ON public.live_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on daily_backups" ON public.daily_backups FOR ALL USING (true) WITH CHECK (true);

-- Create function for daily backup
CREATE OR REPLACE FUNCTION create_daily_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    backup_data jsonb;
BEGIN
    -- Create comprehensive backup of all data
    SELECT jsonb_build_object(
        'batches', (SELECT jsonb_agg(to_jsonb(b.*)) FROM public.batches b),
        'subjects', (SELECT jsonb_agg(to_jsonb(s.*)) FROM public.subjects s),
        'chapters', (SELECT jsonb_agg(to_jsonb(c.*)) FROM public.chapters c),
        'lectures', (SELECT jsonb_agg(to_jsonb(l.*)) FROM public.lectures l),
        'live_classes', (SELECT jsonb_agg(to_jsonb(lc.*)) FROM public.live_classes lc),
        'user_profiles', (SELECT jsonb_agg(to_jsonb(up.*)) FROM public.user_profiles up)
    ) INTO backup_data;
    
    -- Insert backup (replace if exists for today)
    INSERT INTO public.daily_backups (backup_date, backup_data)
    VALUES (CURRENT_DATE, backup_data)
    ON CONFLICT (backup_date) 
    DO UPDATE SET 
        backup_data = EXCLUDED.backup_data,
        created_at = now();
END;
$$;

-- Create function to restore from backup
CREATE OR REPLACE FUNCTION restore_from_backup(restore_date DATE)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    backup_record record;
    result_message text;
BEGIN
    -- Get backup data
    SELECT backup_data INTO backup_record
    FROM public.daily_backups 
    WHERE backup_date = restore_date;
    
    IF NOT FOUND THEN
        RETURN 'No backup found for date: ' || restore_date;
    END IF;
    
    -- Clear existing data (in reverse order due to foreign keys)
    DELETE FROM public.lectures;
    DELETE FROM public.live_classes;
    DELETE FROM public.chapters;
    DELETE FROM public.subjects;
    DELETE FROM public.batches;
    DELETE FROM public.user_profiles;
    
    -- Restore data from backup
    INSERT INTO public.batches 
    SELECT * FROM jsonb_populate_recordset(null::public.batches, backup_record.backup_data->'batches');
    
    INSERT INTO public.subjects 
    SELECT * FROM jsonb_populate_recordset(null::public.subjects, backup_record.backup_data->'subjects');
    
    INSERT INTO public.chapters 
    SELECT * FROM jsonb_populate_recordset(null::public.chapters, backup_record.backup_data->'chapters');
    
    INSERT INTO public.lectures 
    SELECT * FROM jsonb_populate_recordset(null::public.lectures, backup_record.backup_data->'lectures');
    
    INSERT INTO public.live_classes 
    SELECT * FROM jsonb_populate_recordset(null::public.live_classes, backup_record.backup_data->'live_classes');
    
    INSERT INTO public.user_profiles 
    SELECT * FROM jsonb_populate_recordset(null::public.user_profiles, backup_record.backup_data->'user_profiles');
    
    result_message := 'Successfully restored data from backup date: ' || restore_date;
    RETURN result_message;
END;
$$;

-- Add unique constraint for daily backups (one per day)
ALTER TABLE public.daily_backups ADD CONSTRAINT unique_backup_date UNIQUE (backup_date);

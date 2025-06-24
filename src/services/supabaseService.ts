import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type BatchRow = Tables['batches']['Row'];
type SubjectRow = Tables['subjects']['Row'];
type ChapterRow = Tables['chapters']['Row'];
type LectureRow = Tables['lectures']['Row'];
type LiveClassRow = Tables['live_classes']['Row'];
type UserProfileRow = Tables['user_profiles']['Row'];
type SettingsRow = Tables['settings']['Row'];

export interface SupabaseBatch extends BatchRow {
  subjects: SupabaseSubject[];
}

export interface SupabaseSubject extends SubjectRow {
  chapters: SupabaseChapter[];
}

export interface SupabaseChapter extends ChapterRow {
  lectures: LectureRow[];
}

export const supabaseService = {
  // Export supabase client for direct access
  supabase,

  // User Profile operations
  async getUserProfiles(): Promise<UserProfileRow[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateUserProfile(id: string, updates: Partial<UserProfileRow>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUserProfile(id: string) {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createUserProfile(profile: {
    email: string;
    role: 'super_admin' | 'admin' | 'uploader';
    assigned_batches?: string[];
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        ...profile,
        assigned_batches: profile.assigned_batches || []
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Batch operations
  async getBatches(): Promise<SupabaseBatch[]> {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        subjects (
          *,
          chapters (
            *,
            lectures (*)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createBatch(batch: { name: string; description: string }) {
    const { data, error } = await supabase
      .from('batches')
      .insert([batch])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBatch(id: string, updates: { name?: string; description?: string; assigned_uploaders?: string[] }) {
    const { data, error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBatch(id: string) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subject operations
  async createSubject(batchId: string, subject: { name: string; color: string }) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ ...subject, batch_id: batchId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSubject(id: string, updates: { name?: string; color?: string }) {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSubject(id: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Chapter operations
  async createChapter(subjectId: string, chapter: { title: string }) {
    // Get the next order index
    const { data: existingChapters } = await supabase
      .from('chapters')
      .select('order_index')
      .eq('subject_id', subjectId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingChapters && existingChapters.length > 0 
      ? existingChapters[0].order_index + 1 
      : 1;

    const { data, error } = await supabase
      .from('chapters')
      .insert([{ 
        ...chapter, 
        subject_id: subjectId,
        order_index: nextOrderIndex 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateChapter(id: string, updates: { title?: string; order_index?: number }) {
    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteChapter(id: string) {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Lecture operations
  async createLecture(chapterId: string, lecture: {
    title: string;
    video_url: string;
    video_type: 'youtube' | 'direct';
    notes_url?: string;
    dpp_url?: string;
    uploaded_by: string;
  }) {
    const { data, error } = await supabase
      .from('lectures')
      .insert([{ ...lecture, chapter_id: chapterId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLecture(id: string, updates: Partial<LectureRow>) {
    const { data, error } = await supabase
      .from('lectures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLecture(id: string) {
    const { error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Live class operations
  async getLiveClasses(): Promise<LiveClassRow[]> {
    const { data, error } = await supabase
      .from('live_classes')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createLiveClass(liveClass: {
    title: string;
    batch_id: string;
    subject_id: string;
    chapter_id: string;
    scheduled_at: string;
    live_url: string;
    status?: 'scheduled' | 'live' | 'completed';
  }) {
    const { data, error } = await supabase
      .from('live_classes')
      .insert([liveClass])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLiveClassStatus(id: string, status: 'scheduled' | 'live' | 'completed') {
    const { data, error } = await supabase
      .from('live_classes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLiveClass(id: string) {
    const { error } = await supabase
      .from('live_classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Settings operations
  async getSettings(key: string): Promise<SettingsRow | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateSettings(key: string, value: any) {
    const { data, error } = await supabase
      .from('settings')
      .upsert([{ key, value }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Backup operations
  async createBackup() {
    const { data, error } = await supabase.rpc('create_system_backup');
    if (error) throw error;
    return data;
  },

  async getBackups() {
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .order('backup_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async restoreFromBackup(date: string) {
    const { data, error } = await supabase.rpc('restore_from_backup', {
      restore_date: date
    });
    if (error) throw error;
    return data;
  }
};

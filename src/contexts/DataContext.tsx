
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lecture {
  id: string;
  title: string;
  videoUrl: string;
  videoType: 'youtube' | 'direct';
  dppUrl?: string;
  notesUrl?: string;
  createdAt: Date;
  uploadedBy: string;
}

export interface Chapter {
  id: string;
  title: string;
  lectures: Lecture[];
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  color: string;
}

export interface Batch {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
  assignedUploaders: string[];
}

export interface LiveClass {
  id: string;
  title: string;
  batchId: string;
  subjectId: string;
  chapterId: string;
  liveUrl: string;
  scheduledAt: Date;
  status: 'scheduled' | 'live' | 'completed';
}

interface DataContextType {
  batches: Batch[];
  liveClasses: LiveClass[];
  loading: boolean;
  addBatch: (batch: Omit<Batch, 'id' | 'subjects' | 'assignedUploaders'>) => Promise<void>;
  updateBatch: (id: string, batch: Partial<Batch>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  addSubject: (batchId: string, subject: Omit<Subject, 'id' | 'chapters'>) => Promise<void>;
  addChapter: (batchId: string, subjectId: string, chapter: Omit<Chapter, 'id' | 'lectures'>) => Promise<void>;
  addLecture: (batchId: string, subjectId: string, chapterId: string, lecture: Omit<Lecture, 'id'>) => Promise<void>;
  addLiveClass: (liveClass: Omit<LiveClass, 'id'>) => Promise<void>;
  updateLiveClassStatus: (id: string, status: LiveClass['status']) => Promise<void>;
  createBackup: () => Promise<void>;
  restoreFromBackup: (date: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBatches = async () => {
    try {
      // Load batches with all related data
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (batchesError) throw batchesError;

      const batchesWithSubjects = await Promise.all(
        (batchesData || []).map(async (batch) => {
          // Load subjects for this batch
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('subjects')
            .select('*')
            .eq('batch_id', batch.id);

          if (subjectsError) throw subjectsError;

          const subjectsWithChapters = await Promise.all(
            (subjectsData || []).map(async (subject) => {
              // Load chapters for this subject
              const { data: chaptersData, error: chaptersError } = await supabase
                .from('chapters')
                .select('*')
                .eq('subject_id', subject.id)
                .order('order_index', { ascending: true });

              if (chaptersError) throw chaptersError;

              const chaptersWithLectures = await Promise.all(
                (chaptersData || []).map(async (chapter) => {
                  // Load lectures for this chapter
                  const { data: lecturesData, error: lecturesError } = await supabase
                    .from('lectures')
                    .select('*')
                    .eq('chapter_id', chapter.id)
                    .order('created_at', { ascending: true });

                  if (lecturesError) throw lecturesError;

                  return {
                    id: chapter.id,
                    title: chapter.title,
                    order: chapter.order_index,
                    lectures: (lecturesData || []).map(lecture => ({
                      id: lecture.id,
                      title: lecture.title,
                      videoUrl: lecture.video_url,
                      videoType: lecture.video_type as 'youtube' | 'direct',
                      dppUrl: lecture.dpp_url || undefined,
                      notesUrl: lecture.notes_url || undefined,
                      createdAt: new Date(lecture.created_at),
                      uploadedBy: lecture.uploaded_by
                    }))
                  };
                })
              );

              return {
                id: subject.id,
                name: subject.name,
                color: subject.color,
                chapters: chaptersWithLectures
              };
            })
          );

          return {
            id: batch.id,
            name: batch.name,
            description: batch.description || '',
            subjects: subjectsWithChapters,
            assignedUploaders: [] // Will be loaded from user_profiles later
          };
        })
      );

      setBatches(batchesWithSubjects);
    } catch (error) {
      console.error('Error loading batches:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load batches from database.",
        variant: "destructive",
      });
    }
  };

  const loadLiveClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      setLiveClasses((data || []).map(liveClass => ({
        id: liveClass.id,
        title: liveClass.title,
        batchId: liveClass.batch_id,
        subjectId: liveClass.subject_id,
        chapterId: liveClass.chapter_id,
        liveUrl: liveClass.live_url,
        scheduledAt: new Date(liveClass.scheduled_at),
        status: liveClass.status as 'scheduled' | 'live' | 'completed'
      })));
    } catch (error) {
      console.error('Error loading live classes:', error);
      toast({
        title: "Error Loading Live Classes",
        description: "Failed to load live classes from database.",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([loadBatches(), loadLiveClasses()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addBatch = async (batch: Omit<Batch, 'id' | 'subjects' | 'assignedUploaders'>) => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .insert([{
          name: batch.name,
          description: batch.description
        }])
        .select()
        .single();

      if (error) throw error;

      await refreshData();
      toast({
        title: "Batch Created",
        description: `${batch.name} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error adding batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch.",
        variant: "destructive",
      });
    }
  };

  const updateBatch = async (id: string, batch: Partial<Batch>) => {
    try {
      const { error } = await supabase
        .from('batches')
        .update({
          name: batch.name,
          description: batch.description
        })
        .eq('id', id);

      if (error) throw error;

      await refreshData();
      toast({
        title: "Batch Updated",
        description: "Batch has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating batch:', error);
      toast({
        title: "Error",
        description: "Failed to update batch.",
        variant: "destructive",
      });
    }
  };

  const deleteBatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refreshData();
      toast({
        title: "Batch Deleted",
        description: "Batch has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({
        title: "Error",
        description: "Failed to delete batch.",
        variant: "destructive",
      });
    }
  };

  const addSubject = async (batchId: string, subject: Omit<Subject, 'id' | 'chapters'>) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .insert([{
          batch_id: batchId,
          name: subject.name,
          color: subject.color
        }]);

      if (error) throw error;

      await refreshData();
      toast({
        title: "Subject Added",
        description: `${subject.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error",
        description: "Failed to add subject.",
        variant: "destructive",
      });
    }
  };

  const addChapter = async (batchId: string, subjectId: string, chapter: Omit<Chapter, 'id' | 'lectures'>) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .insert([{
          subject_id: subjectId,
          title: chapter.title,
          order_index: chapter.order
        }]);

      if (error) throw error;

      await refreshData();
      toast({
        title: "Chapter Added",
        description: `${chapter.title} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding chapter:', error);
      toast({
        title: "Error",
        description: "Failed to add chapter.",
        variant: "destructive",
      });
    }
  };

  const addLecture = async (batchId: string, subjectId: string, chapterId: string, lecture: Omit<Lecture, 'id'>) => {
    try {
      const { error } = await supabase
        .from('lectures')
        .insert([{
          chapter_id: chapterId,
          title: lecture.title,
          video_url: lecture.videoUrl,
          video_type: lecture.videoType,
          dpp_url: lecture.dppUrl,
          notes_url: lecture.notesUrl,
          uploaded_by: lecture.uploadedBy
        }]);

      if (error) throw error;

      await refreshData();
      toast({
        title: "Lecture Added",
        description: `${lecture.title} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding lecture:', error);
      toast({
        title: "Error",
        description: "Failed to add lecture.",
        variant: "destructive",
      });
    }
  };

  const addLiveClass = async (liveClass: Omit<LiveClass, 'id'>) => {
    try {
      const { error } = await supabase
        .from('live_classes')
        .insert([{
          title: liveClass.title,
          batch_id: liveClass.batchId,
          subject_id: liveClass.subjectId,
          chapter_id: liveClass.chapterId,
          live_url: liveClass.liveUrl,
          scheduled_at: liveClass.scheduledAt.toISOString(),
          status: liveClass.status
        }]);

      if (error) throw error;

      await refreshData();
      toast({
        title: "Live Class Scheduled",
        description: `${liveClass.title} has been scheduled successfully.`,
      });
    } catch (error) {
      console.error('Error adding live class:', error);
      toast({
        title: "Error",
        description: "Failed to schedule live class.",
        variant: "destructive",
      });
    }
  };

  const updateLiveClassStatus = async (id: string, status: LiveClass['status']) => {
    try {
      const { error } = await supabase
        .from('live_classes')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await refreshData();
      toast({
        title: "Status Updated",
        description: `Live class status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating live class status:', error);
      toast({
        title: "Error",
        description: "Failed to update live class status.",
        variant: "destructive",
      });
    }
  };

  const createBackup = async () => {
    try {
      const { error } = await supabase.rpc('create_daily_backup');
      
      if (error) throw error;

      toast({
        title: "Backup Created",
        description: "Daily backup has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Backup Error",
        description: "Failed to create backup.",
        variant: "destructive",
      });
    }
  };

  const restoreFromBackup = async (date: string) => {
    try {
      const { data, error } = await supabase.rpc('restore_from_backup', {
        restore_date: date
      });
      
      if (error) throw error;

      await refreshData();
      toast({
        title: "Restore Complete",
        description: data || "Data has been restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring from backup:', error);
      toast({
        title: "Restore Error",
        description: "Failed to restore from backup.",
        variant: "destructive",
      });
    }
  };

  const value = {
    batches,
    liveClasses,
    loading,
    addBatch,
    updateBatch,
    deleteBatch,
    addSubject,
    addChapter,
    addLecture,
    addLiveClass,
    updateLiveClassStatus,
    createBackup,
    restoreFromBackup,
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

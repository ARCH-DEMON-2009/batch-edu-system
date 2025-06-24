
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseService, SupabaseBatch } from '@/services/supabaseService';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

type Tables = Database['public']['Tables'];
type UserProfileRow = Tables['user_profiles']['Row'];
type LiveClassRow = Tables['live_classes']['Row'];

interface DataContextType {
  // Batches
  batches: SupabaseBatch[];
  loadBatches: () => Promise<void>;
  createBatch: (batch: { name: string; description: string }) => Promise<void>;
  updateBatch: (id: string, updates: { name?: string; description?: string; assigned_uploaders?: string[] }) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;

  // Users
  users: UserProfileRow[];
  loadUsers: () => Promise<void>;
  createUser: (user: { email: string; role: 'admin' | 'uploader'; assigned_batches?: string[] }) => Promise<void>;
  updateUser: (id: string, updates: Partial<UserProfileRow>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Live Classes
  liveClasses: LiveClassRow[];
  loadLiveClasses: () => Promise<void>;
  createLiveClass: (liveClass: any) => Promise<void>;
  updateLiveClass: (id: string, updates: any) => Promise<void>;
  deleteLiveClass: (id: string) => Promise<void>;
  addLiveClass: (liveClass: any) => Promise<void>;
  updateLiveClassStatus: (id: string, status: string) => Promise<void>;

  // Settings
  getSettings: (key: string) => Promise<any>;
  updateSettings: (key: string, value: any) => Promise<void>;

  // Backup
  createBackup: () => Promise<void>;
  getBackups: () => Promise<any[]>;
  restoreFromBackup: (date: string) => Promise<void>;

  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<SupabaseBatch[]>([]);
  const [users, setUsers] = useState<UserProfileRow[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Batch operations
  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getBatches();
      setBatches(data);
    } catch (error) {
      console.error('Error loading batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (batch: { name: string; description: string }) => {
    try {
      const newBatch = await supabaseService.createBatch(batch);
      setBatches(prev => [{ ...newBatch, subjects: [] }, ...prev]);
      toast.success('Batch created successfully');
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    }
  };

  const updateBatch = async (id: string, updates: { name?: string; description?: string; assigned_uploaders?: string[] }) => {
    try {
      const updatedBatch = await supabaseService.updateBatch(id, updates);
      setBatches(prev => prev.map(batch => 
        batch.id === id ? { ...batch, ...updatedBatch } : batch
      ));
      toast.success('Batch updated successfully');
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Failed to update batch');
    }
  };

  const deleteBatch = async (id: string) => {
    try {
      await supabaseService.deleteBatch(id);
      setBatches(prev => prev.filter(batch => batch.id !== id));
      toast.success('Batch deleted successfully');
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
  };

  // User operations
  const loadUsers = async () => {
    try {
      const data = await supabaseService.getUserProfiles();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const createUser = async (user: { email: string; role: 'admin' | 'uploader'; assigned_batches?: string[] }) => {
    try {
      const newUser = await supabaseService.createUserProfile(user);
      setUsers(prev => [newUser, ...prev]);
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const updateUser = async (id: string, updates: Partial<UserProfileRow>) => {
    try {
      const updatedUser = await supabaseService.updateUserProfile(id, updates);
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await supabaseService.deleteUserProfile(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Live class operations
  const loadLiveClasses = async () => {
    try {
      const data = await supabaseService.getLiveClasses();
      setLiveClasses(data);
    } catch (error) {
      console.error('Error loading live classes:', error);
      toast.error('Failed to load live classes');
    }
  };

  const createLiveClass = async (liveClass: any) => {
    try {
      const newLiveClass = await supabaseService.createLiveClass({
        title: liveClass.title,
        batch_id: liveClass.batchId,
        subject_id: liveClass.subjectId,
        chapter_id: liveClass.chapterId,
        scheduled_at: liveClass.scheduledAt.toISOString(),
        live_url: liveClass.liveUrl,
        status: liveClass.status || 'scheduled'
      });
      setLiveClasses(prev => [newLiveClass, ...prev]);
      toast.success('Live class created successfully');
    } catch (error) {
      console.error('Error creating live class:', error);
      toast.error('Failed to create live class');
    }
  };

  const addLiveClass = createLiveClass; // Alias for compatibility

  const updateLiveClass = async (id: string, updates: any) => {
    try {
      const updatedLiveClass = await supabaseService.updateLiveClassStatus(id, updates.status);
      setLiveClasses(prev => prev.map(lc => 
        lc.id === id ? updatedLiveClass : lc
      ));
      toast.success('Live class updated successfully');
    } catch (error) {
      console.error('Error updating live class:', error);
      toast.error('Failed to update live class');
    }
  };

  const updateLiveClassStatus = async (id: string, status: string) => {
    await updateLiveClass(id, { status });
  };

  const deleteLiveClass = async (id: string) => {
    try {
      await supabaseService.deleteLiveClass(id);
      setLiveClasses(prev => prev.filter(lc => lc.id !== id));
      toast.success('Live class deleted successfully');
    } catch (error) {
      console.error('Error deleting live class:', error);
      toast.error('Failed to delete live class');
    }
  };

  // Settings operations
  const getSettings = async (key: string) => {
    try {
      const settings = await supabaseService.getSettings(key);
      return settings?.value || {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  };

  const updateSettings = async (key: string, value: any) => {
    try {
      await supabaseService.updateSettings(key, value);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  // Backup operations
  const createBackup = async () => {
    try {
      await supabaseService.createBackup();
      toast.success('Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    }
  };

  const getBackups = async () => {
    try {
      return await supabaseService.getBackups();
    } catch (error) {
      console.error('Error getting backups:', error);
      toast.error('Failed to load backups');
      return [];
    }
  };

  const restoreFromBackup = async (date: string) => {
    try {
      // Call the Supabase function to restore from backup
      const { data, error } = await supabaseService.supabase.rpc('restore_from_backup', {
        restore_date: date
      });
      
      if (error) throw error;
      
      toast.success('Data restored successfully from backup');
      
      // Reload all data after restore
      if (user) {
        await loadBatches();
        if (user.role === 'super_admin') {
          await loadUsers();
        }
        await loadLiveClasses();
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      toast.error('Failed to restore from backup');
    }
  };

  // Load initial data when user is authenticated
  useEffect(() => {
    if (user) {
      loadBatches();
      if (user.role === 'super_admin') {
        loadUsers();
      }
      loadLiveClasses();
    }
  }, [user]);

  const value = {
    batches,
    loadBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    users,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    liveClasses,
    loadLiveClasses,
    createLiveClass,
    updateLiveClass,
    deleteLiveClass,
    addLiveClass,
    updateLiveClassStatus,
    getSettings,
    updateSettings,
    createBackup,
    getBackups,
    restoreFromBackup,
    loading
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

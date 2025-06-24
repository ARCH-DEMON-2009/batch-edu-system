
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'uploader';
  assignedBatches: string[];
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', supabaseUser.email)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          role: profile.role as 'super_admin' | 'admin' | 'uploader',
          assignedBatches: profile.assigned_batches || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user);
          if (mounted) {
            setUser(userProfile);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      
      if (session?.user) {
        const userProfile = await loadUserProfile(session.user);
        if (mounted) {
          setUser(userProfile);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return false;
      }

      toast.success('Signed in successfully');
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in');
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const signUp = async (email: string, password: string, role: 'admin' | 'uploader' = 'uploader'): Promise<boolean> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return false;
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            email,
            role,
            user_id: data.user.id,
            assigned_batches: []
          }]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      toast.success('Account created successfully');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An error occurred during sign up');
      setLoading(false);
      return false;
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    isAuthenticated: !!user
  };
};

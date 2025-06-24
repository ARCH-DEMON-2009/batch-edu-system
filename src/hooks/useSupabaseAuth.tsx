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
      console.log('Loading user profile for:', supabaseUser.email);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', supabaseUser.email)
        .single();

      let userProfile = profile;

      if (error) {
        console.error('Error loading user profile:', error);
        
        // If user doesn't exist in profiles, create one with default role
        if (error.code === 'PGRST116') {
          console.log('Creating new user profile with default role');
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{
              email: supabaseUser.email,
              user_id: supabaseUser.id,
              role: 'uploader',
              assigned_batches: []
            }])
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            return null;
          }

          userProfile = newProfile;
        } else {
          return null;
        }
      }

      if (userProfile) {
        const authUser = {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role as 'super_admin' | 'admin' | 'uploader',
          assignedBatches: userProfile.assigned_batches || []
        };
        
        console.log('User profile loaded:', authUser);
        return authUser;
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
        console.log('Auth state changed:', event, session?.user?.email);
        
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
      
      console.log('Initial session check:', session?.user?.email);
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
        console.error('Sign in error:', error);
        toast.error(error.message);
        setLoading(false);
        return false;
      }

      console.log('Sign in successful for:', email);
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
      console.log('Signing out user:', user?.email);
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
        return;
      }

      // Clear any remaining local storage
      localStorage.removeItem('sb-cvraqxexfduoylpofoec-auth-token');
      
      toast.success('Signed out successfully');
      
      // Redirect to login page
      window.location.href = '/admin';
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
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`
        }
      });

      if (error) {
        console.error('Sign up error:', error);
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

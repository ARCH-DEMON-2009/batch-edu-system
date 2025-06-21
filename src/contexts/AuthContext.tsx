
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'uploader';
  assignedBatches?: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Loading profile for user:', supabaseUser.email);
      
      // First try to get profile by user_id
      let { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      // If no profile found by user_id, try by email
      if (error && error.code === 'PGRST116') {
        console.log('No profile found by user_id, trying by email...');
        const { data: emailProfile, error: emailError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', supabaseUser.email)
          .single();

        if (!emailError && emailProfile) {
          // Update the profile with the user_id
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ user_id: supabaseUser.id })
            .eq('id', emailProfile.id);

          if (!updateError) {
            profile = { ...emailProfile, user_id: supabaseUser.id };
          }
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return null;
      }

      if (!profile) {
        console.log('No profile found, this might be a new user');
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        role: profile.role as 'super_admin' | 'admin' | 'uploader',
        assignedBatches: profile.assigned_batches || []
      };
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user);
          setUser(userProfile);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        const userProfile = await loadUserProfile(session.user);
        setUser(userProfile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      console.log('Login successful for:', email);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    session,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

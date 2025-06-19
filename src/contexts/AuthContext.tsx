
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'uploader';
  assignedBatches?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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

  useEffect(() => {
    // Check for stored auth on load
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Hardcoded authentication for demo
    const users = [
      {
        id: '1',
        email: 'shashanksv2009@gmail.com',
        password: 'admin123',
        role: 'super_admin' as const
      },
      {
        id: '2',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin' as const
      },
      {
        id: '3',
        email: 'uploader@example.com',
        password: 'uploader123',
        role: 'uploader' as const,
        assignedBatches: ['1', '2']
      }
    ];

    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const authUser: User = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        assignedBatches: foundUser.assignedBatches
      };
      
      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

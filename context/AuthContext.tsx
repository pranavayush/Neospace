import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapSessionToUser = (session: Session): User => {
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
      avatarUrl: session.user.user_metadata?.avatar_url
    };
  };

  const refreshUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error && (error.message.includes('Refresh Token') || error.message.includes('refresh_token'))) {
        try { await supabase.auth.signOut(); } catch (e) {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
          }
        }
      }
      if (session) {
        setUser(mapSessionToUser(session));
      } else {
        setUser(null);
      }
    } catch (e) {
      // suppress
    }
  };

  useEffect(() => {
    window.addEventListener('neonotex_profile_updated', refreshUser);
    return () => {
      window.removeEventListener('neonotex_profile_updated', refreshUser);
    };
  }, []);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          const errMsg = error.message || '';
          if (errMsg.includes('Failed to fetch')) {
             console.warn('Network offline or fetch blocked. Treating as unauthenticated or offline mode.');
          } else if (
            errMsg.includes('Refresh Token') ||
            errMsg.includes('refresh_token') ||
            errMsg.includes('not found') ||
            error.status === 400 ||
            error.status === 401
          ) {
            // Force sign-out to clear invalid local state
            try {
              await supabase.auth.signOut();
            } catch {
              // Fallback manual clearance of supabase keys in localStorage
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                  localStorage.removeItem(key);
                }
              }
            }
          } else {
             console.error('Session initialization error:', error);
          }
        }
        if (session) {
          setUser(mapSessionToUser(session));
        } else {
          setUser(null);
        }
      } catch (error: any) {
        const errMsg = error?.message || '';
        if (errMsg.includes('Refresh Token') || errMsg.includes('refresh_token')) {
          try {
            await supabase.auth.signOut();
          } catch {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                localStorage.removeItem(key);
              }
            }
          }
        } else if (errMsg.includes('Failed to fetch')) {
           console.warn('Network offline or fetch blocked in exception. Treating as offline.');
        } else {
           console.error('Error fetching session exception:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(mapSessionToUser(session));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
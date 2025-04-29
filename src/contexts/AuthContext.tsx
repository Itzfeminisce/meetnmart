
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<{ error: any | null }>;
  verifyOTP: (phoneNumber: string, token: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for session on initial load
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setIsLoading(false);
      
      if (data.session?.user) {
        await fetchUserProfile(data.session.user.id);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId?: string) => {
    try {
      const id = userId || user?.id;
      if (!id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Set default names if not already set
      if (data && !data.name) {
        const defaultName = data.is_seller ? 'MeetnMart Seller' : 'MeetnMart Buyer';
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ name: defaultName })
          .eq('id', id);

        if (updateError) throw updateError;
        data.name = defaultName;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const verifyOTP = async (phoneNumber: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsLoading(false);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    profile,
    isLoading,
    signInWithPhone,
    verifyOTP,
    signOut,
    fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

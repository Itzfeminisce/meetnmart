
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  userRole: 'buyer' | 'seller' | 'moderator' | 'admin' | null;
  wallet: { balance: number; escrowed_balance: number } | null;
  isLoading: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<{ error: any | null }>;
  verifyOTP: (phoneNumber: string, token: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserRole: (role: 'buyer' | 'seller' | 'moderator' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'moderator' | 'admin' | null>(null);
  const [wallet, setWallet] = useState<{ balance: number; escrowed_balance: number } | null>(null);
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
          setUserRole(null);
          setWallet(null);
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

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Set default names if not already set
      if (profileData && !profileData.name) {
        const defaultName = profileData.is_seller ? 'MeetnMart Seller' : 'MeetnMart Buyer';
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ name: defaultName })
          .eq('id', id);

        if (updateError) throw updateError;
        profileData.name = defaultName;
      }

      setProfile(profileData);

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { uid: id });
      
      if (!roleError && roleData) {
        setUserRole(roleData as 'buyer' | 'seller' | 'moderator' | 'admin');
      }

      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .rpc('get_user_wallet', { uid: id });
      
      if (!walletError && walletData) {
        setWallet(walletData as { balance: number; escrowed_balance: number });
      }
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
    setUserRole(null);
    setWallet(null);
    setIsLoading(false);
    toast.success('Logged out successfully');
  };

  const updateUserRole = async (role: 'buyer' | 'seller' | 'moderator' | 'admin') => {
    if (!user) return;
    
    try {
      // Update user role in the database
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: user.id, 
          role 
        });
      
      if (roleError) throw roleError;

      // Update profile with is_seller flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_seller: role === 'seller' || role === 'admin' || role === 'moderator' 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      setUserRole(role);
      
      // Update the local profile
      if (profile) {
        setProfile({
          ...profile,
          is_seller: role === 'seller' || role === 'admin' || role === 'moderator'
        });
      }
      
    } catch (error: any) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    userRole,
    wallet,
    isLoading,
    signInWithPhone,
    verifyOTP,
    signOut,
    fetchUserProfile,
    updateUserRole
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

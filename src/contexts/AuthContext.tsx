import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Subscription, User } from '@supabase/supabase-js';
import { Database } from "@/integrations/supabase/types"
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SplashScreen } from '@/components/SplashScreen';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Define types for better type safety
export type UserRole = 'buyer' | 'seller' | 'moderator' | 'admin' | null;
export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type WalletInfo = Database['public']['Tables']['wallets']['Row']
export type EscrowTransaction = Database['public']['Tables']['escrow_transactions']['Row']
interface AuthContextType {
  user: User | null;
  profile: any | null;
  userRole: UserRole;
  wallet: WalletInfo;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<{ error: any | null }>;
  verifyOTP: (phoneNumber: string, token: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  fetchUserProfile: (userId?: string) => Promise<{ profile: UserProfile, role: string; wallet: WalletInfo }>;
  fetchUsersByRole: (role: Exclude<UserRole, null>) => Promise<Database['public']['Functions']['get_users_by_role']['Returns']>;
  fetchUserRole: (userId?: string) => Promise<string>;
  updateUserRole: (role: Exclude<UserRole, null>) => Promise<void>;
}

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const { setValue: userRoleToLocalStorage, clear: clearLocalStrorage } = useLocalStorage("role")
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [wallet, setWallet] = useState<WalletInfo>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch user profile data, role, and wallet information
   */
  const fetchUserProfile = async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) {
      console.log("No user ID available for fetching profile");
      return;
    }

    const [profileData, role, userWallet] = await Promise.all([
      fetchProfileData(id),
      fetchUserRole(id),
      fetchWalletData(id)
    ]);

    userRoleToLocalStorage(userRole)
    return {
      profile: profileData as UserProfile,
      role: role as string,
      wallet: userWallet as WalletInfo
    }
  };

  /**
   * Fetch and process user profile data
   */
  const fetchProfileData = async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return;
    }

    // Set default names if not already set
    if (profileData && !profileData.name) {
      const defaultName = profileData.is_seller ? 'MeetnMart Seller' : 'MeetnMart Buyer';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name: defaultName })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating default name:", updateError);
      } else {
        profileData.name = defaultName;
      }
    }

    setProfile(profileData);
    return profileData
  };

  /**
   * Fetch user role data
   */
  const fetchUserRole = async (userId: string) => {
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { uid: userId });

    if (roleError) {
      console.error("Role fetch error:", roleError);
      return;
    }

    setUserRole(roleData as UserRole);
    return roleData
  };
  /**
   * Fetch user role data
   */
  const fetchUsersByRole = async (role: UserRole) => {
    const { data: users, error: usersError } = await supabase
      .rpc('get_users_by_role', { target_role: role });

    if (usersError) {
      console.error("UserByRole fetch error:", usersError);
      return;
    }
    return users
  };

  /**
   * Fetch wallet data
   */
  const fetchWalletData = async (userId: string) => {
    const { data: walletData, error: walletError } = await supabase
      .rpc('get_user_wallet', { uid: userId });

    if (walletError) {
      console.error("Wallet fetch error:", walletError);
      return;
    }

    setWallet(walletData as WalletInfo);
    return walletData
  };

  /**
   * Sign in with phone number by sending OTP
   */
  const signInWithPhone = async (phoneNumber: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        console.error("Phone sign-in error:", error);
        toast.error('Failed to send verification code');
      } else {
        console.log("OTP sent successfully");
        toast.success('Verification code sent');
      }

      return { error };
    } catch (error: any) {
      console.error("Phone sign-in exception:", error);
      toast.error('An error occurred while sending verification code');
      return { error };
    }
  };

  /**
   * Verify OTP token for phone authentication
   */
  const verifyOTP = async (phoneNumber: string, token: string) => {
    try {
      console.log("Verifying OTP for phone:", phoneNumber);
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });

      if (error) {
        console.error("OTP verification error:", error);
        toast.error('Invalid verification code');
      } else {
        console.log("OTP verified successfully");
        toast.success('Logged in successfully');
      }

      return { error };
    } catch (error: any) {
      console.error("OTP verification exception:", error);
      toast.error('An error occurred during verification');
      return { error };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      console.log("Signing out");
      setIsLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        toast.error('Failed to log out');
      } else {
        // Clear user state
        setUser(null);
        setProfile(null);
        setUserRole(null);
        setWallet(null);
        setIsAuthenticated(false);
        clearLocalStrorage()
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error("Sign out exception:", error);
      toast.error('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user role and related profile information
   */
  const updateUserRole = async (role: Exclude<UserRole, null>) => {
    if (!user) {
      console.error("Cannot update role: No user logged in");
      toast.error('You must be logged in to update your role');
      return;
    }

    try {
      console.log("Updating user role to:", role);
      setIsLoading(true);

      // Update user role in the database
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role
        });

      if (roleError) {
        console.error("Role update error:", roleError);
        toast.error('Failed to update user role');
        throw roleError;
      }

      // Update profile with is_seller flag
      const isSeller = role === 'seller' || role === 'admin' || role === 'moderator';
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_seller: isSeller
        })
        .eq('id', user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        toast.error('Failed to update profile');
        throw profileError;
      }

      // Update local state
      setUserRole(role);

      if (profile) {
        setProfile({
          ...profile,
          is_seller: isSeller
        });
      }

      console.log("User role updated successfully");
      toast.success(`Role updated to ${role} successfully`);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  /**
   * Initialize auth and set up auth state listeners
   */
  useLayoutEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        

        const { data: { session }, } = await supabase.auth.getSession();

        await fetchUserProfile(session.user.id);


        setIsAuthenticated(!!session);
        setUser(session.user);
      } catch (error) {
        console.log("initializeAuth", { error });

      } finally {
        setIsLoading(false)
      }

    };




    // Initialize auth immediately
    initializeAuth();

  }, []);


  useEffect(() => {
    const waitTime = user ? 1000 : 3000
    const wait = async () => await new Promise((resolve) => setTimeout(resolve, waitTime)) 

    wait()
  }, [user])

  // Context value
  const contextValue: AuthContextType = {
    user,
    profile,
    userRole,
    wallet,
    isLoading,
    isAuthenticated,
    signInWithPhone,
    verifyOTP,
    signOut,
    fetchUserProfile,
    fetchUsersByRole,
    updateUserRole,
    fetchUserRole
  };


  return isLoading ? <SplashScreen /> : (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


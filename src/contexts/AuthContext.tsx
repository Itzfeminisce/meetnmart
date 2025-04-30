import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { redirect, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Define types for better type safety
type UserRole = 'buyer' | 'seller' | 'moderator' | 'admin' | null;
type WalletInfo = { balance: number; escrowed_balance: number } | null;

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
  fetchUserProfile: (userId?: string) => Promise<void>;
  updateUserRole: (role: Exclude<UserRole, null>) => Promise<void>;
}

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
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
    setIsLoading(true);
    try {
      const id = userId || user?.id;
      if (!id) {
        console.log("No user ID available for fetching profile");
        return;
      }

      await Promise.all([
        fetchProfileData(id),
        fetchUserRole(id),
        fetchWalletData(id)
      ]);
      
      console.log("User profile fetch complete");
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch and process user profile data
   */
  const fetchProfileData = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return;
      }
      
      console.log("Profile data retrieved:", profileData ? "success" : "null");

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
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
    }
  };

  /**
   * Fetch user role data
   */
  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role");
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { uid: userId });

      if (roleError) {
        console.error("Role fetch error:", roleError);
        return;
      }
      
      if (roleData) {
        console.log("User role:", roleData);
        setUserRole(roleData as UserRole);
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
    }
  };

  /**
   * Fetch wallet data
   */
  const fetchWalletData = async (userId: string) => {
    try {
      console.log("Fetching wallet data");
      const { data: walletData, error: walletError } = await supabase
        .rpc('get_user_wallet', { uid: userId });

      if (walletError) {
        console.error("Wallet fetch error:", walletError);
        return;
      }
      
      if (walletData) {
        console.log("Wallet data retrieved");
        setWallet(walletData as WalletInfo);
      }
    } catch (error) {
      console.error("Error in fetchWalletData:", error);
    }
  };

  /**
   * Initialize auth and set up auth state listeners
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setIsAuthenticated(!!session);
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize auth immediately
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    });

    // Cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    updateUserRole
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    redirect("/");
  }

  return (
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
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Subscription, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SplashScreen } from '@/components/SplashScreen';
import { useLocalStorage } from '@/hooks/use-local-storage';
import ErrorComponent from '@/components/ErrorComponent';
import { 
  useGetUserRole, 
  // useGetProfileData, 
  useGetWalletData,
  useSignInWithPhone,
  useVerifyOTP,
  useSignOut,
  useUpdateUserRole,
  useGetWalletSummary,
  useGetTransactions,
  useGetSellers,
  useGetBuyers,
  queryClient,
  UserRole,
  WalletInfo,
  EscrowTransaction,
  UsersByRole,
  WalletSummary,
  Transaction,
  cacheKeys
} from '@/hooks/api-hooks';
import { useAuthV2 } from './AuthContextV2';
import { useUserProfileStore } from './Store';
import { UserProfile } from '@/types';

// Re-export types for convenience
export type { UserRole, UserProfile, WalletInfo, EscrowTransaction, UsersByRole, WalletSummary, Transaction };

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  userRole: UserRole;
  wallet: WalletInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  // fetchUserProfile: (userId?: string) => Promise<{ profile: UserProfile, role: string; wallet: WalletInfo } | null>;
  // fetchUsersByRole: (role: Exclude<UserRole, null>) => Promise<UsersByRole[]>;
  // fetchUserRole: (userId?: string) => Promise<string | null>;
  // updateUserRole: (role: Exclude<UserRole, null>) => Promise<void>;
  // // fetchWalletSummary: () => Promise<WalletSummary | null>;
  // fetchTransactions: (args: Transaction['Args']) => Promise<Transaction['Returns'] | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage management
  const { setValue: userRoleToLocalStorage, clear: clearLocalStorage } = useLocalStorage("role");

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  // Data hooks - only fetch when user exists
  const { data: userRole, isLoading: roleLoading, error: roleError } = useGetUserRole({ userId: user?.id, enabled: !!user?.id });
  // const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileData({ userId: user?.id,  enabled: !!user?.id });
  const { data: wallet, isLoading: walletLoading, error: walletError } = useGetWalletData({ userId: user?.id, enabled: !!user?.id });

  // Pre-fetch sellers and buyers for better UX
  const { data: sellers, error: sellersError } = useGetSellers();
  const { data: buyers, error: buyersError } = useGetBuyers();
  // const { data: walletSummary, error: walletSummaryError } = useGetWalletSummary({enabled: !!user?.id});

  // Mutation hooks
  const signInMutation = useSignInWithPhone();
  const verifyOTPMutation = useVerifyOTP();
  const signOutMutation = useSignOut();
  const updateRoleMutation = useUpdateUserRole();

  // Compute loading state
  // const isDataLoading = user ? (roleLoading || profileLoading || walletLoading) : false;
  // const isLoading = !isInitialized || isDataLoading;

  // Update local storage when role changes
  useEffect(() => {
    if (userRole) {
      userRoleToLocalStorage(userRole);
    }
  }, [userRole]);

  const setProfileData = useUserProfileStore(state => state.setProfileData);

  /**
   * Sign in with phone number - uses hook
   */
  const signInWithPhone = useCallback(async (phoneNumber: string) => {
    try {
      await signInMutation.mutateAsync({ phoneNumber });
      toast.success('Verification code sent');
    } catch (error: any) {
      console.error("Phone sign-in error:", error);
      toast.error('Failed to send verification code');
      throw error;
    }
  }, []);

  /**
   * Verify OTP - uses hook
   */
  const verifyOTP = useCallback(async (phoneNumber: string, token: string) => {
    try {
      await verifyOTPMutation.mutateAsync({ phoneNumber, token });
      toast.success('Logged in successfully');
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error('Invalid verification code');
      throw error;
    }
  }, []);

  /**
   * Sign out - uses hook
   */
  const signOut = useCallback(async () => {
    try {
      await signOutMutation.mutateAsync();
      setUser(null);
      setIsAuthenticated(false);
      clearLocalStorage();
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error('Failed to log out');
      throw error;
    }
  }, []);

  /**
   * Update user role - uses hook
   */
  const updateUserRole = useCallback(async (role: Exclude<UserRole, null>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      await updateRoleMutation.mutateAsync({ userId: user.id, role });
      toast.success(`Role updated to ${role} successfully`);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      throw error;
    }
  }, []);

  /**
   * Fetch user profile - leverages cached data from hooks
   */
  const fetchUserProfile = useCallback(async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) {
      console.log("No user ID available for fetching profile");
      return null;
    }

    // Invalidate and refetch data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: cacheKeys.userProfile(id) }),
      queryClient.invalidateQueries({ queryKey: ["role", id] }),
      queryClient.invalidateQueries({ queryKey: ["wallet", id] })
    ]);

    // Get data from cache after invalidation triggers refetch
    const profileData = queryClient.getQueryData(cacheKeys.userProfile(id)) as UserProfile;
    const roleData = queryClient.getQueryData(["role", id]) as string;
    const walletData = queryClient.getQueryData(["wallet", id]) as WalletInfo;

    if (profileData) setProfileData(profileData);

    if (!profileData || !walletData) {
      return null;
    }

    return {
      profile: profileData,
      role: roleData,
      wallet: walletData
    };
  }, []);

  /**
   * Fetch users by role - uses cached data from hooks
   */
  const fetchUsersByRole = useCallback(async (role: Exclude<UserRole, null>): Promise<UsersByRole[]> => {
    try {
      if (role === 'seller') {
        return sellers || [];
      } else if (role === 'buyer') {
        return buyers || [];
      } else {
        // For other roles, invalidate and get fresh data
        await queryClient.invalidateQueries({ queryKey: [`users_by_role`, role] });
        const data = queryClient.getQueryData([`users_by_role`, role]) as UsersByRole[];
        return data || [];
      }
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }
  }, []);

  /**
   * Fetch user role - uses cached data
   */
  const fetchUserRole = useCallback(async (userId?: string): Promise<string | null> => {
    const id = userId || user?.id;
    if (!id) {
      console.log("No user ID available for fetching role");
      return null;
    }

    // Get from cache or current userRole state
    if (id === user?.id && userRole) {
      return userRole;
    }

    // For other users, get from cache
    const cachedRole = queryClient.getQueryData(["role", id]) as string;
    return cachedRole || null;
  }, []);

  /**
   * Fetch wallet summary - uses cached data
   */
  // const fetchWalletSummary = useCallback(async (): Promise<WalletSummary | null> => {
  //   // Return cached data or trigger fresh fetch
  //   if (walletSummary) {
  //     return walletSummary;
  //   }
    
  //   await queryClient.invalidateQueries({ queryKey: ["wallet_summary"] });
  //   const data = queryClient.getQueryData(["wallet_summary"]) as WalletSummary;
  //   return data || null;
  // }, []);

  /**
   * Fetch transactions - uses cached data
   */
  const fetchTransactions = useCallback(async (params: Transaction['Args']): Promise<Transaction['Returns'] | null> => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["transactions", params] });
      const data = queryClient.getQueryData(["transactions", params]) as Transaction['Returns'];
      return data || null;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }
  }, []);

  /**
   * Initialize auth and set up auth state listeners
   * Only handles auth state - no data fetching
   */
  useEffect(() => {
    let authSubscription: Subscription | null = null;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setIsAuthenticated(false);
          setUser(null);
          throw error;
        } else if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }

        // Set up auth state listener
        authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAuthenticated(false);
            clearLocalStorage();
            // Clear all cached data
            queryClient.clear();
          }
        }).data.subscription;

      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuthenticated(false);
        setUser(null);
        setError(error as Error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user,
    // profile: profile || null,
    userRole: userRole || null,
    wallet: wallet || null,
    // isLoading,
    isAuthenticated,
    isInitialized,
    signInWithPhone,
    verifyOTP,
    signOut,
    // fetchUserProfile,
    // fetchUsersByRole,
    // updateUserRole,
    // fetchUserRole,
    // // fetchWalletSummary,
    // fetchTransactions
  };

  // Show splash screen while initializing
  if (!isInitialized) {
    return <SplashScreen />;
  }

  const errors = error || roleError || walletError || sellersError || buyersError

  if (errors) return <ErrorComponent error={error} />;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = useAuthV2
// () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
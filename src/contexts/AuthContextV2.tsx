import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cacheKeys, useGetUserProfile, useGetUserRole, useGetWalletData, UserRole, useSignInWithPhone, useSignOut, useUpdateUserRole, useVerifyOTP } from '@/hooks/api-hooks';
import { UserProfile, WalletData } from '@/types';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useUserProfileStore } from './Store';
import Loader from '@/components/ui/loader';

interface AuthContextV2Type {
  wallet: WalletData | null;
  user: User | null;
  profile: UserProfile | null;
  onboardingStep: number;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateOnboardingStep: (step: number) => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, token: string) => Promise<void>;
}

const AuthContextV2 = createContext<AuthContextV2Type | undefined>(undefined);

export const AuthProviderV2: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);


  const { clear: clearLocalStorage } = useLocalStorage("role");


  const __profile = useUserProfileStore()
  const updateRoleMutation = useUpdateUserRole();


  // Derive onboardingStep from profile
  const { data: profile, isLoading: isLoadingProfile } = useGetUserProfile({ userId: user?.id, enabled: true })

  // const { data: userRole, isLoading: isLoadingRole } = useGetUserRole({ userId: user?.id })
  const { data: wallet, isLoading: walletLoading } = useGetWalletData({ userId: user?.id });
  const profileStore = useUserProfileStore()


  // Mutation hooks
  const signInMutation = useSignInWithPhone();
  const verifyOTPMutation = useVerifyOTP();
  const signOutMutation = useSignOut();

  // const userRole: UserRole = null;
  const onboardingStep = profile?.onboarding_step ?? 0

  // Sign in with phone (OTP)
  const signIn = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  }, []);


  // Update onboarding step
  const updateOnboardingStep = useCallback(async (step: number) => {
    const { error } = await supabase.from('profiles').update({ onboarding_step: step }).eq('id', user.id);
    if (error) throw error;
    __profile.setProfileData(prev => ({ ...prev, onboarding_step: step }))
  }, [user]);

  // Update onboarding step
  const updateUserRole = useCallback(async (role: UserRole) => {
    await updateRoleMutation.mutateAsync({ userId: user.id, role })
    __profile.setProfileData(prev => ({ ...prev, role }))
  }, [user]);


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


  const isLoading = !isInitialized || isLoadingProfile


  // Fetch session and user
  useEffect(() => {
    let mounted = true;
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsInitialized(true);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return () => { mounted = false; subscription?.unsubscribe(); };
  }, []);


  useEffect(() => {
    if (profile) {
      profileStore.setProfileData(profile)
    }
  }, [profile])

  
  // Wait for auth and onboardingStep to be ready
  if (!isInitialized || isLoading || onboardingStep === undefined || onboardingStep === null) {
    return <Loader />
  }

  const value: AuthContextV2Type = {
    wallet,
    user,
    profile: __profile.data,
    onboardingStep,
    userRole: __profile.data?.role as UserRole,
    isAuthenticated,
    isLoading,
    isInitialized,
    signIn,
    signOut,
    updateOnboardingStep,
    signInWithPhone,
    verifyOTP,
    updateUserRole
  };

  return <AuthContextV2.Provider value={value}>{children}</AuthContextV2.Provider>;
};

export const useAuthV2 = () => {
  const ctx = useContext(AuthContextV2);
  if (!ctx) throw new Error('useAuthV2 must be used within an AuthProviderV2');
  return ctx;
}; 
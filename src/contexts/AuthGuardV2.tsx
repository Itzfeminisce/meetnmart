import React from 'react';
import { useAuthV2 } from './AuthContextV2';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '@/components/ui/loader';

interface AuthGuardV2Props {
  children?: React.ReactNode;
  requiresAuth?: boolean;
  onboardingStepRequired?: number | null; // null = any step
  redirectTo?: string;
}

const onboardingRoutes = ['/role-selection', '/interest-selection'];

export const AuthGuardV2: React.FC<AuthGuardV2Props> = ({
  children,
  requiresAuth = true,
  onboardingStepRequired = null,
  redirectTo
}) => {
  const { isAuthenticated, isLoading, profile} = useAuthV2();
  const location = useLocation();

  // // Wait for auth and profile.onboarding_step to be ready
  if (isLoading || !profile) {
    return <Loader />
  }

  // If authentication is required but user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to={redirectTo || '/'} state={{ from: location }} replace />;
  }

  // Onboarding step logic
  if (profile?.onboarding_step === 0 && location.pathname !== '/role-selection') {
    return <Navigate to="/role-selection" replace />;
  }
  if (profile?.onboarding_step === 1 && location.pathname !== '/interest-selection') {
    return <Navigate to="/interest-selection" replace />;
  }
  if (profile?.onboarding_step >= 2 && onboardingRoutes.includes(location.pathname)) {
    return <Navigate to="/feeds" replace />;
  }

  // If a specific onboarding step is required
  if (
    onboardingStepRequired !== null &&
    profile?.onboarding_step !== onboardingStepRequired &&
    location.pathname !== onboardingRoutes[onboardingStepRequired]
  ) {
    // Redirect to the required onboarding step
    return <Navigate to={onboardingRoutes[onboardingStepRequired] || '/feeds'} replace />;
  }

  // Render protected content
  return children ? <>{children}</> : <Outlet />;
};

// Drop-in replacement guards
export const ProtectedRouteV2: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AuthGuardV2 requiresAuth={true}>{children}</AuthGuardV2>
);

export const PublicRouteV2: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AuthGuardV2 requiresAuth={false}>{children}</AuthGuardV2>
);

export const RoleSelectionRouteV2: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AuthGuardV2 requiresAuth={true} onboardingStepRequired={0}>{children}</AuthGuardV2>
);

export const InterestSelectionRouteV2: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AuthGuardV2 requiresAuth={true} onboardingStepRequired={1}>{children}</AuthGuardV2>
); 
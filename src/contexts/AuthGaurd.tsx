import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SplashScreen } from '@/components/SplashScreen';

interface AuthGuardProps {
    children?: React.ReactNode;
    requiresAuth?: boolean; // Whether authentication is required
    requiresRole?: boolean; // Whether a role is required
    allowedRoles?: string[]; // Specific roles allowed (optional)
    redirectTo?: string; // Custom redirect path
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
    children, 
    requiresAuth = true,
    requiresRole = true,
    allowedRoles,
    redirectTo
}) => {
    const { isAuthenticated, userRole, user, isLoading, isInitialized } = useAuth();
    const location = useLocation();

    // Show loading screen while auth is initializing or loading
    if (!isInitialized || isLoading) {
        return <SplashScreen />;
    }

    // If authentication is required but user is not authenticated
    if (requiresAuth && !isAuthenticated) {
        console.log('Redirecting to login - not authenticated');
        return <Navigate to={redirectTo || "/"} state={{ from: location }} replace />;
    }

    // If user is authenticated but on a public route (like login), redirect appropriately
    if (!requiresAuth && isAuthenticated) {
        // If user has a role, redirect to their dashboard
        if (userRole) {
            const dashboardPath = getDashboardPath(userRole);
            if (location.pathname !== dashboardPath) {
                return <Navigate to={dashboardPath} replace />;
            }
        } else {
            // User is authenticated but has no role, redirect to role selection
            if (location.pathname !== "/role-selection") {
                return <Navigate to="/role-selection" replace />;
            }
        }
    }

    // If authentication is required and user is authenticated
    if (requiresAuth && isAuthenticated) {
        // If role is required but user has no role, redirect to role selection
        if (requiresRole && !userRole) {
            return <Navigate to="/role-selection" replace />;
        }

        // If specific roles are required, check if user has allowed role
        if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
            const dashboardPath = getDashboardPath(userRole);
            return <Navigate to={dashboardPath} replace />;
        }

        // If user has role but is on role selection page, redirect to dashboard
        if (userRole && location.pathname === "/role-selection") {
            const dashboardPath = getDashboardPath(userRole);
            return <Navigate to={dashboardPath} replace />;
        }
    }

    // If we reach here, render the protected content
    return children ? <>{children}</> : <Outlet />;
};

/**
 * Helper function to get dashboard path based on user role
 */
const getDashboardPath = (role: string): string => {
    switch (role) {
        case 'seller':
            return '/seller/landing';
        case 'buyer':
            return '/buyer/landing';
        case 'admin':
            return '/admin-dashboard';
        case 'moderator':
            return '/moderator-dashboard';
        default:
            return '/'; // Default fallback
    }
};

export default AuthGuard;

// Export specific guard components for convenience
export const PublicRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <AuthGuard requiresAuth={false} requiresRole={false}>
        {children}
    </AuthGuard>
);

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <AuthGuard requiresAuth={true} requiresRole={true}>
        {children}
    </AuthGuard>
);

export const RoleSelectionRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <AuthGuard requiresAuth={true} requiresRole={false}>
        {children}
    </AuthGuard>
);

export const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <AuthGuard requiresAuth={true} requiresRole={true} allowedRoles={['admin']}>
        {children}
    </AuthGuard>
);

export const SellerRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <AuthGuard requiresAuth={true} requiresRole={true} allowedRoles={['seller']}>
        {children}
    </AuthGuard>
);

export const BuyerRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <AuthGuard requiresAuth={true} requiresRole={true} allowedRoles={['buyer']}>
        {children}
    </AuthGuard>
);

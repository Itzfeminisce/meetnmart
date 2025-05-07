
import React from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

interface AuthGaurdProps {
  children?: React.ReactNode;
  requiresRole?: boolean; // Added prop to differentiate between routes that need a role and those that don't
}

const AuthGaurd: React.FC<AuthGaurdProps> = ({ children, requiresRole = true }) => {
    const { isAuthenticated, userRole } = useAuth()

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to={"/"} />
    }

    // If authentication is required and user has no role yet, redirect to role selection
    // But skip this check if we're already on the role-selection page (requiresRole=false)
    if (requiresRole && !userRole) {
        return <Navigate to={"/role-selection"} />
    }

    // If we're on role-selection but already have a role, redirect to appropriate dashboard
    if (!requiresRole && userRole) {
        // User already has a role, redirect to dashboard based on role
        if (userRole === 'seller') {
            return <Navigate to={"/seller-dashboard"} />
        } else {
            return <Navigate to={"/markets"} />
        }
    }

    // If we have children, render them, otherwise render the Outlet
    return children || <Outlet />
}

export default AuthGaurd

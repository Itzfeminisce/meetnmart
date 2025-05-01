import React from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

const AuthGaurd = () => {
    const { isAuthenticated, userRole } = useAuth()


    if (!isAuthenticated) {
        return <Navigate to={"/"} />
    }

    if (isAuthenticated && !userRole) {
        return <Navigate to={"/role-selection"} />
    }

    return <Outlet />
}

export default AuthGaurd
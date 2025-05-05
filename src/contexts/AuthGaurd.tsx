
import React, { useEffect } from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import { IncomingCall } from '@/components/IncomingCall'
import { toast } from 'sonner'
import { useSocket } from './SocketContext'
import { CallAction } from '@/types/call'
import livekitService from '@/services/livekitService'

const AuthGaurd = () => {
    const { isAuthenticated, userRole, user } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to={"/"} />
    }

    // If user is authenticated but has no role yet, redirect to role selection
    if (isAuthenticated && !userRole) {
        return <Navigate to={"/role-selection"} />
    }

    return <Outlet />
}

export default AuthGaurd

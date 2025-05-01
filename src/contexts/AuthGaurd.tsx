import React, { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import { IncomingCall } from '@/components/IncomingCall'
import { toast } from 'sonner'
import { useSocket } from './SocketContext'
import { CallAction } from '@/types/call'

const AuthGaurd = () => {
    const { isAuthenticated, userRole } = useAuth()
    const {isConnected, subscribe} = useSocket()
    const [isIncomingCall, setIsIncomingCall] = useState(false)

    useEffect(() => {
        if(isAuthenticated && isConnected){
           subscribe(CallAction.Incoming, () => {
            setIsIncomingCall(true)

            // TODO: implementation here
           })
        }
    }, [])


    const handleAcceptCall = () => {
        toast.success("Call accepted")
    }
    const handleRejectCall = () => {
        toast.error("Call rejected")
    }


    if (!isAuthenticated) {
        return <Navigate to={"/"} />
    }

    if (isAuthenticated && !userRole) {
        return <Navigate to={"/role-selection"} />
    }



    return (
        <>
            <IncomingCall
                caller='James'
                category='food'
                location='Lagos'
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
                onOpenChange={setIsIncomingCall}
                open={isIncomingCall}
            />
            <Outlet />

        </>
    )
}

export default AuthGaurd
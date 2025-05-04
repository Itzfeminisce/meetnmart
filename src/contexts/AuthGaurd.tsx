import React, { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import { IncomingCall } from '@/components/IncomingCall'
import { toast } from 'sonner'
import { useSocket } from './SocketContext'
import { CallAction } from '@/types/call'
import livekitService from '@/services/livekitService'

const AuthGaurd = () => {
    const { isAuthenticated, userRole } = useAuth()
    // const { isConnected, subscribe, publish } = useSocket()
    // const [isIncomingCall, setIsIncomingCall] = useState(false)
    // const [incomingData, setIncomingData] = useState(null)

    // useEffect(() => {
    //     if (isAuthenticated && isConnected) {
    //         subscribe(CallAction.Incoming, (data) => {
    //             setIsIncomingCall(true)
    //             setIncomingData(data)
    //             console.log("[Incoming call]", data);
    //         })


    //         subscribe(CallAction.Ended, (data) => {
    //             setIsIncomingCall(false)
    //             setIncomingData(null)
    //             console.log("[Ended call]", data);
    //         })
    //     }
    // }, [])


    // const handleAcceptCall = async () => {
    //     await livekitService.connectToRoom(incomingData.room, incomingData.receiver.name)
    //     toast.success("Call accepted")
    // }


    // const handleRejectCall = () => {
    //     if (isIncomingCall && isConnected) {
    //         publish(CallAction.Rejected, {
    //             room: incomingData.room,
    //             receiver: {
    //                 name: incomingData.receiver.name,
    //                 id: incomingData.receiver.id
    //             },
    //             caller: {
    //                 id: incomingData.caller.id,
    //                 name: incomingData.caller.name
    //             }
    //         })
    //         toast.error("Call rejected")
    //     }
    // }


    if (!isAuthenticated) {
        return <Navigate to={"/"} />
    }

    if (isAuthenticated && !userRole) {
        return <Navigate to={"/role-selection"} />
    }



    return (
        // <>
        //     {isIncomingCall && (
        //         <IncomingCall
        //             caller={incomingData.caller.name}
        //             category='food'
        //             location='Lagos'
        //             onAccept={handleAcceptCall}
        //             onReject={handleRejectCall}
        //             onOpenChange={setIsIncomingCall}
        //             open={isIncomingCall}
        //         />
        //     )}
            <Outlet />

        // </>
    )
}

export default AuthGaurd
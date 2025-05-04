import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'
import { CallAction } from '@/types/call'
import { toast } from 'sonner'
import livekitService from '@/services/livekitService'
import { IncomingCall } from '@/components/IncomingCall'

interface CallParticipant {
    name: string;
    id: string;

    [key: string]: any;
}


export interface CallData {
    room: string;
    caller: CallParticipant;
    receiver: CallParticipant;
}

interface ILiveCallProvider {
    callData: CallData;
    handlePublishCallEnded: (_callData: CallData) => void;
    handlePublishOutgoingCall: (_callData: CallData) => void;
    handlePublishAcceptCall: (_callData: CallData) => Promise<void>;
    handlePublishRejectCall: (_callData: CallData) => void;
    isCallRejected: boolean;
    // isCallAccepted: boolean;
    // isCallEnded: boolean;
    // isOutgoingCall: boolean;
}

const LiveCallContext = createContext<ILiveCallProvider | undefined>(undefined)

export const useLiveCall = () => {
    const ctx = useContext(LiveCallContext)

    if (!ctx) throw new Error("useLiveCall must be used within a LiveCallContext")

    return ctx;
}

const LiveCallPovider: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAuthenticated, } = useAuth()
    const { isConnected, subscribe, publish,socket } = useSocket()
    const [isIncomingCall, setIsIncomingCall] = useState(false)
    const [callData, setIncomingData] = useState(null)
    const [isCallRejected, setIsCallRejected] = useState(false)
    // const [isCallAccepted, setIsCallAccepted] = useState(false)
    // const [isCallEnded, setIsCallEnded] = useState(false)
    // const [isOutgoingCall, setIsOutgoingCall] = useState(false)


    const handlePublishCallEnded = useCallback((_callData: CallData) => {
        publish(CallAction.Ended, {
            room: _callData.room,
            receiver: {
                name: _callData.receiver.name,
                id: _callData.receiver.id
            },
            caller: {
                id: _callData.caller.id,
                name: _callData.caller.name
            }
        })
        // setIsCallEnded(true)
    }, [])


    const handlePublishOutgoingCall = useCallback((_callData: CallData) => {
        publish(CallAction.Outgoing, {
            room: _callData.room,
            receiver: {
                name: _callData.receiver.name,
                id: _callData.receiver.id
            },
            caller: {
                id: _callData.caller.id,
                name: _callData.caller.name
            }
        })
        // setIsOutgoingCall(true)
        setIsCallRejected(false)
    }, [])


    const handlePublishAcceptCall = useCallback(async (_callData: CallData) => {
            publish(CallAction.Accepted, {
                room: _callData.room,
                receiver: {
                    name: _callData.receiver.name,
                    id: _callData.receiver.id
                },
                caller: {
                    id: _callData.caller.id,
                    name: _callData.caller.name
                }
            })
          
            setIsIncomingCall(false)
            toast.success("Call accepted")
    }, [])


    const handlePublishRejectCall = (_callData: CallData) => {
        if (isIncomingCall && isConnected) {
            publish(CallAction.Rejected, {
                room: _callData.room,
                receiver: {
                    name: _callData.receiver.name,
                    id: _callData.receiver.id
                },
                caller: {
                    id: _callData.caller.id,
                    name: _callData.caller.name
                }
            })

            setIsIncomingCall(false)
        }
    }



    useEffect(() => {
        if (isAuthenticated && isConnected) {
            subscribe(CallAction.Accepted, async (data) => {
                setIncomingData(data)
                await livekitService.connectToRoom(data.room, data.receiver.name)
                toast.error("Your call was acccepted")
                console.log("[Ended call]", data);
            })


            subscribe(CallAction.Ended, (data) => {
                setIsIncomingCall(false)
                setIncomingData(null)
                console.log("[Ended call]", data);
            })

            subscribe(CallAction.Incoming, (data) => {
                setIsIncomingCall(true)
                setIncomingData(data)
                setIsCallRejected(false)
                console.log("[Incoming call]", data);
            })

            subscribe(CallAction.Rejected, (data) => {
                console.log("[CallAction.Rejected]", { callData, data });

                // setIsIncomingCall(false)
                setIncomingData(null)
                // setIsCallRejected(true)

                toast.error("Your call was rejected")
                console.log("[Rejected call]", data);
            })
        }
    }, [subscribe, socket, isAuthenticated, isConnected])

    return (
        <LiveCallContext.Provider value={{
            callData,
            handlePublishAcceptCall,
            handlePublishCallEnded,
            handlePublishOutgoingCall,
            handlePublishRejectCall,
            // isOutgoingCall,
            // isCallAccepted,
            // isCallEnded,
            isCallRejected
        }}>

            {isIncomingCall && (
                <IncomingCall
                    callData={callData}
                    category='food'
                    location='Lagos'
                    onAccept={handlePublishAcceptCall}
                    onReject={handlePublishRejectCall}
                    onOpenChange={setIsIncomingCall}
                    open={isIncomingCall}
                />
            )}

            {children}
        </LiveCallContext.Provider>
    )
}

export { LiveCallPovider }
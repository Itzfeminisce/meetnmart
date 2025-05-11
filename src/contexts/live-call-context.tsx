import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { CallAction } from '@/types/call';
import { useNavigate } from 'react-router-dom';
import { IncomingCall } from '@/components/IncomingCall';
import { toast } from 'sonner';
import EscrowPaymentConfirmModal from '@/components/EscrowPaymentConfirmModal';

interface CallParticipant {
  id: string;
  name: string;
}

export interface CallData<TData = any, TReceiver = CallParticipant> {
  room: string;
  caller: CallParticipant;
  receiver: TReceiver;
  data?: TData
}

export type EscrowData = CallData<{
  amount: number,
  itemTitle: string;
  itemDescription: string;
}>


interface LiveCallContextType {
  incomingCall: CallData | null;
  outgoingCall: CallData | null;
  isCallActive: boolean;
  activeCall: CallData | null;
  handleIncomingCall: (callData: CallData) => void;
  handleOutgoingCall: (callData: CallData) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  handlePublishOutgoingCall: (callData: CallData) => void;
  handlePublishCallEnded: (callData: CallData) => void;
  handlePublishEscrowRequested: (callData: EscrowData) => void;
}

const LiveCallContext = createContext<LiveCallContextType | undefined>(undefined);

export const LiveCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<CallData | null>(null);
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const { isConnected, subscribe, publish, socket } = useSocket()
  const navigate = useNavigate()


  // Payment (escrow) request handles
  const [isPaymentRequestActive, setIsPaymentRequestActive] = useState(false);
  const [escrowPayment, setEscrowPayment] = useState<EscrowData | null>(null);



  // Handle incoming call notification
  const handleIncomingCall = useCallback((callData: CallData) => {
    setIncomingCall(callData);
    // Here you would play an incoming call sound, show notification, etc.
  }, []);

  // Handle outgoing call
  const handleOutgoingCall = useCallback((callData: CallData) => {
    setOutgoingCall(callData);
    // Here you would start call UI, play ringing sound, etc.
  }, []);

  // Accept payment request
  const acceptPaymentRequest = useCallback(() => { }, [])
  // Reject payment request
  const rejectPaymentRequest = useCallback(() => { }, [])

  // Accept incoming call
  const acceptCall = useCallback((callData?: CallData) => {
    if (incomingCall) {
      setActiveCall(incomingCall);
      setIsCallActive(true);
      setIncomingCall(null);



      publish(CallAction.Accepted, {
        room: callData.room,
        receiver: {
          name: callData.receiver.name,
          id: callData.receiver.id
        },
        caller: {
          id: callData.caller.id,
          name: callData.caller.name
        }
      })
      navigate("/call", {
        state: callData
        // state: { name: callData.receiver.name, callerId: callData.caller.id,  id: callData.receiver.id, room: callData.room }
      })
    }
  }, [incomingCall]);

  // Reject incoming call
  const rejectCall = useCallback((callData?: CallData) => {
    if (incomingCall) {
      publish(CallAction.Rejected, {
        room: callData.room,
        receiver: {
          name: callData.receiver.name,
          id: callData.receiver.id
        },
        caller: {
          id: callData.caller.id,
          name: callData.caller.name
        }
      })

      setIncomingCall(null);
    }
  }, [incomingCall]);

  // End active call
  const endCall = useCallback(() => {
    setIsCallActive(false);
    setActiveCall(null);
    setOutgoingCall(null);
    // Here you would disconnect from the LiveKit room
  }, []);

  // Publish outgoing call to the backend/messaging system
  const handlePublishOutgoingCall = useCallback((callData: CallData) => {
    setOutgoingCall(callData);
    setActiveCall(callData);
    setIsCallActive(true);

    console.log('Publishing outgoing call:', callData);
    publish(CallAction.Outgoing, {
      room: callData.room,
      receiver: {
        name: callData.receiver.name,
        id: callData.receiver.id
      },
      caller: {
        id: callData.caller.id,
        name: callData.caller.name
      }
    })
  }, []);

  // Publish call ended notification
  const handlePublishEscrowRequested = useCallback((callData: EscrowData) => {
    toast.info("Payment request sent")
    publish(CallAction.EscrowRequested, {
      room: callData.room,
      receiver: {
        name: callData.receiver.name,
        id: callData.receiver.id
      },
      caller: {
        id: callData.caller.id,
        name: callData.caller.name
      },
      data: callData.data
    })
  }, []);

  const handlePublishCallEnded = useCallback((callData: CallData) => {
    // In a real application, you would send this to a backend service
    console.log('Publishing call ended:', callData);
    setIsCallActive(false);
    setActiveCall(null);
    setOutgoingCall(null);

    publish(CallAction.Ended, {
      room: callData.room,
      receiver: {
        name: callData.receiver.name,
        id: callData.receiver.id
      },
      caller: {
        id: callData.caller.id,
        name: callData.caller.name
      }
    })
  }, []);



  useEffect(() => {
    subscribe(CallAction.Incoming, (data) => {
      setIncomingCall(data)
      setActiveCall(data)
      // setIsCallRejected(false)
    })



    subscribe(CallAction.Accepted, async (data) => {
      setActiveCall(data)
      // await livekitService.connectToRoom(data.room, data.receiver.name)
      // toast.success("Your call was acccepted")
    })


    subscribe(CallAction.Ended, ({ data }) => {
      setIncomingCall(null)
      setActiveCall(null)
    })


    subscribe(CallAction.Rejected, (data) => {
      // setIsIncomingCall(false)
      setActiveCall(null)
      // setIsCallRejected(true)

      toast.error("Your call was rejected")
    })


    // Escrow Requested
    subscribe(CallAction.EscrowRequested, (data: EscrowData) => {
      console.info("[CallAction.EscrowRequested]", data)
      setEscrowPayment(data)
      setIsPaymentRequestActive(true)
      toast.success("Escrow Accepted")
    })

    // TODO: Real-time update for user online status on SellerList.tsx
    // subscribe(AppEvent.DISCONNECT, ({ userId }) => {
    //     const button = document.querySelector(`[data-user-id="socket-${userId}"]`)?.closest("button");
    //     if (button) button.disabled = true;
    // });

  }, [subscribe, socket, isConnected])



  // Context value
  const value = {
    incomingCall,
    outgoingCall,
    isCallActive,
    activeCall,
    handleIncomingCall,
    handleOutgoingCall,
    acceptCall,
    rejectCall,
    endCall,
    handlePublishOutgoingCall,
    handlePublishCallEnded,
    handlePublishEscrowRequested
  };

  return (
    <LiveCallContext.Provider value={value}>
      {incomingCall && (
        <IncomingCall
          payload={incomingCall}
          onAccept={acceptCall}
          onReject={rejectCall}
          onOpenChange={setIsCallActive}
          open={!!incomingCall}
        />
      )}
      {escrowPayment && (
        <EscrowPaymentConfirmModal
          payload={escrowPayment}
          sellerName={escrowPayment.receiver.name}
          onAccept={acceptPaymentRequest}
          onReject={rejectPaymentRequest}
          onOpenChange={setIsPaymentRequestActive}
          open={isPaymentRequestActive}
        />
      )}
      {children}
    </LiveCallContext.Provider>
  );
};

// Custom hook to use the LiveCall context
export const useLiveCall = (): LiveCallContextType => {
  const context = useContext(LiveCallContext);
  if (context === undefined) {
    throw new Error('useLiveCall must be used within a LiveCallProvider_V2');
  }
  return context;
};
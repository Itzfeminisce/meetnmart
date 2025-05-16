import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { CallAction } from '@/types/call';
import { useNavigate } from 'react-router-dom';
import { IncomingCall } from '@/components/IncomingCall';
import { toast } from 'sonner';
import EscrowPaymentConfirmModal from '@/components/EscrowPaymentConfirmModal';
import { SellerPaymentFeedbackModal } from '@/components/SellerPaymentFeedbackModal';
import { SellerPaymentRejectionFeedbackModal } from '@/components/SellerPaymentRejectionFeedbackModal';

export interface CallParticipant {
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
  reference?: string;
  callSessionId?: string;
  [key: string]: any;
}>

// type EscrowStatus = "pending" | "rejected" | "initiated" | "held" | "delivered" | "confirmed" | "released" | "disputed" | "refunded"


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
  const [escrowPaymentFeedback, setEscrowPaymentFeedback] = useState<EscrowData | null>(null);



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
  const acceptPaymentRequest = useCallback((callData: EscrowData) => {
    publish(CallAction.EscrowAccepted, callData)
  }, [])


  // Reject payment request
  const rejectPaymentRequest = useCallback((callData: EscrowData) => {
    publish(CallAction.EscrowRejected, callData)
  }, [])

  // Accept incoming call
  const acceptCall = useCallback((callData?: CallData) => {
    console.log("[acceptCall]", { incomingCall });

    if (incomingCall) {
      setActiveCall(incomingCall);
      setIsCallActive(true);
      setIncomingCall(null);



      publish(CallAction.Accepted, callData)
      navigate("/call", {
        state: callData
      })
    }
  }, [incomingCall]);

  // Reject incoming call
  const rejectCall = useCallback((callData?: CallData) => {
    if (incomingCall) {
      publish(CallAction.Rejected, callData)

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
    publish(CallAction.Outgoing, callData)
  }, []);

  // Publish call ended notification
  const handlePublishEscrowRequested = useCallback((callData: EscrowData) => {
    toast.info("Payment request sent")
    publish(CallAction.EscrowRequested, callData)
  }, []);

  const handlePublishCallEnded = useCallback((callData: CallData) => {
    console.log('Publishing call ended:', callData);
    setIsCallActive(false);
    setActiveCall(null);
    setOutgoingCall(null);

    publish(CallAction.Ended, callData)
  }, []);



  useEffect(() => {
    subscribe(CallAction.Incoming, (data) => {
      setIncomingCall(data)
      setActiveCall(data)
    })



    subscribe(CallAction.Accepted, async (payload, callSessionId) => {
      // the buyer receives a callSessionId when seller accepts call
      setActiveCall({
        ...payload,
        data: {
          callSessionId
        }
      })
    })


    subscribe(CallAction.Ended, ({ data }) => {
      console.log("[CallAction.Ended#subscribe]", data);
      // TODO: Better handle disconnect.

      // Right now, it makes the screen go blank due to absence of callSessionId or something. yet to figure it out.
      // setIncomingCall(null)
      // setActiveCall(null)
    })


    subscribe(CallAction.Rejected, (data) => {
      setActiveCall(null)
    })


    // Escrow Requested
    subscribe(CallAction.EscrowRequested, (data: EscrowData) => {
      setEscrowPayment(data)
      setIsPaymentRequestActive(true)
    })


    // Escrow Accepted
    subscribe(CallAction.EscrowAccepted, (data: EscrowData) => {
      setEscrowPaymentFeedback(data)
    })
    // Escrow Rejected
    subscribe(CallAction.EscrowRejected, (data: EscrowData) => {
      setEscrowPaymentFeedback(data)
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
          payload={{
            ...escrowPayment,
            data: {
              ...escrowPayment.data,
              callSessionId: activeCall.data.callSessionId
            }
          }}
          sellerName={escrowPayment.receiver.name}
          onAccept={acceptPaymentRequest}
          onReject={rejectPaymentRequest}
          onOpenChange={setIsPaymentRequestActive}
          open={isPaymentRequestActive}
        />
      )}

      {escrowPaymentFeedback && !("escrow-rejected" in escrowPaymentFeedback.data) && (
        <SellerPaymentFeedbackModal
          buyerName={escrowPaymentFeedback.caller.name}
          onOpenChange={() => {
            setEscrowPaymentFeedback(null)
            return true
          }}
          open={!!escrowPaymentFeedback}
          paymentDetails={{
            amount: escrowPaymentFeedback.data.amount,
            productDescription: escrowPaymentFeedback.data.itemDescription,
            productName: escrowPaymentFeedback.data.itemTitle,
            reference: escrowPaymentFeedback.data.reference
          }}
          buyerAvatar=''
          isNewCustomer={true}
        />
      )}

      {escrowPaymentFeedback && ("escrow-rejected" in escrowPaymentFeedback.data) && (<SellerPaymentRejectionFeedbackModal
        onClose={() => {
          setEscrowPaymentFeedback(null)
          return true
        }}
        open={"escrow-rejected" in escrowPaymentFeedback.data}
        buyerName={escrowPaymentFeedback.receiver.name}
      />)}
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
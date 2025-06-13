import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Users, Maximize, Minimize, PhoneOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryAgent } from '@/types';
import { toast } from 'sonner';
import EscrowRequestModal from '@/components/EscrowRequestModal';
import InviteDeliveryModal from '@/components/InviteDeliveryModal';
import DeliveryOrderSheet from '@/components/DeliveryOrderSheet';
import DeliveryEscrowModal from '@/components/DeliveryEscrowModal';
import { cn, formatDuration } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Participant, CallControls } from '@/components/LiveKitComponents';
import { CallTimer, CallTimerHandle } from '@/components/CallTimer';
import { useLiveKit } from '@/hooks/use-livekit';
import { CallData, useLiveCall } from '@/contexts/live-call-context';
import { AppData, CallAction } from '@/types/call';
import { useAxios } from '@/lib/axiosUtils';
import { useSocket } from '@/contexts/SocketContext';

// Call states enum for better state management
enum CallState {
  CONNECTING = 'connecting',
  WAITING_FOR_PARTICIPANT = 'waiting_for_participant',
  IN_CALL = 'in_call',
  PARTICIPANT_LEFT = 'participant_left',
  CALL_REJECTED = 'call_rejected',
  DISCONNECTED = 'disconnected'
}

interface CallStateData {
  state: CallState;
  isLoading: boolean;
  participantCount: number;
  otherParticipantPresent: boolean;
}

const LiveCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, userRole } = useAuth();
  const timerRef = useRef<CallTimerHandle>(null);
  const apiClient = useAxios();
  const liveCall = useLiveCall();
  const socket = useSocket();

  const callData = location.state as CallData;
  const [isSeller] = useState(userRole === "seller");

  // UI States
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [deliveryEscrowModalOpen, setDeliveryEscrowModalOpen] = useState(false);
  const [inviteDeliveryModalOpen, setInviteDeliveryModalOpen] = useState(false);
  const [deliveryOrderSheetOpen, setDeliveryOrderSheetOpen] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [manualActiveSpeaker, setManualActiveSpeaker] = useState<string | null>(null);

  // Call States - Unified state management
  const [callState, setCallState] = useState<CallState>(CallState.CONNECTING);
  const [isCallRejected, setIsCallRejected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const roomName = callData?.room;
  const participantName = profile?.name || user.id;

  if (!roomName) return <Navigate to={"/"} replace />;

  // LiveKit Connection Hook
  const {
    room,
    localParticipant,
    remoteParticipants,
    activeSpeakers,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera
  } = useLiveKit({
    onParticipantConnected: (participant) => {
      const isOtherParticipant = participant.identity !== participantName;
      
      if (isOtherParticipant) {
        toast.info(`${participant.identity} joined the call`);
        setCallState(CallState.IN_CALL);
        setReconnecting(false);
      }
    },
    onParticipantDisconnected: async (participant) => {
      const isOtherParticipant = participant.identity !== participantName;

      if (isOtherParticipant) {
        toast.info(`${participant.identity} left the call`);
        
        // Completely disconnect the call when other participant leaves
        await disconnect();
        setCallState(CallState.PARTICIPANT_LEFT);
      }
    },
    onError: (error) => {
      toast.error(`Call error: ${error.message}`);
      setCallState(CallState.DISCONNECTED);
    }
  });

  // Socket event handlers
  useEffect(() => {
    const handleCallRejected = (data: CallData) => {
      if (data.caller.id === user?.id) {
        setIsCallRejected(true);
        setCallState(CallState.CALL_REJECTED);
      }
    };

    socket.subscribe(CallAction.Rejected, handleCallRejected);
    return () => socket.unsubscribe(CallAction.Rejected, handleCallRejected);
  }, [socket, user?.id]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Connection management
  const connectParticipant = useCallback(async () => {
    if (!user || !profile) return;

    setReconnecting(true);
    setIsCallRejected(false);
    setCallState(CallState.CONNECTING);

    try {
      const newRoom = await connect(roomName, participantName);
      
      if (newRoom) {
        // After successful connection, determine initial state
        if (!isSeller) {
          // Buyer should wait for seller
          setCallState(CallState.WAITING_FOR_PARTICIPANT);
          
          // Notify seller about the call
          liveCall.handlePublishOutgoingCall(callData);
          await apiClient.Post('/messaging/notify/call', {
            userId: callData.receiver.id,
            callId: roomName,
            callerName: callData.caller.name,
            icon: "https://meetnmart.com/logo-white.png",
            redirectUrl: "http://localhost:3000/calls"
          });
        } else {
          // Seller joins - check if buyer is already there
          const hasOtherParticipants = newRoom.remoteParticipants.size > 0;
          setCallState(hasOtherParticipants ? CallState.IN_CALL : CallState.WAITING_FOR_PARTICIPANT);
        }
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      await disconnect();
      setCallState(CallState.DISCONNECTED);
    } finally {
      setReconnecting(false);
    }
  }, [user, profile, roomName, participantName, isSeller, connect, disconnect, liveCall, callData, apiClient]);

  // Initial connection
  useEffect(() => {
    connectParticipant();
    return () => {
      disconnect();
    };
  }, []);

  // Call state computation
  const getCallStateData = useCallback((): CallStateData => {
    const participantCount = localParticipant ? remoteParticipants.length + 1 : 0;
    const otherParticipantPresent = remoteParticipants.length > 0;

    return {
      state: callState,
      isLoading: isConnecting || reconnecting,
      participantCount,
      otherParticipantPresent
    };
  }, [callState, isConnecting, reconnecting, localParticipant, remoteParticipants]);

  // Active speaker logic
  const getActiveSpeaker = useCallback(() => {
    if (manualActiveSpeaker) {
      const manualSpeaker = [...remoteParticipants, localParticipant].find(
        p => p && p.identity === manualActiveSpeaker
      );
      if (manualSpeaker) return manualSpeaker.identity;
    }

    if (activeSpeakers.length > 0) {
      return activeSpeakers[0].identity;
    }

    if (remoteParticipants.length > 0) {
      return remoteParticipants[0].identity;
    }

    return localParticipant?.identity || '';
  }, [activeSpeakers, remoteParticipants, localParticipant, manualActiveSpeaker]);

  // Call control handlers
  const handleEndCall = useCallback(async () => {
    console.log({liveCall});
    
    await disconnect();

    if (room && user && profile) {
      liveCall.handlePublishCallEnded({
        ...callData,
        data: {
          ...callData.data,
          callSessionId: liveCall.activeCall?.data?.callSessionId
        }
      });
    }

    if (isSeller) {
      navigate(-1);
    } else {
      navigate('/rating', {
        state: {
          seller: callData.receiver,
          deliveryAgent,
          callDuration: timerRef.current?.getTimer()
        },
        replace: true
      });
    }
  }, [disconnect, room, user, profile, liveCall, callData, isSeller, navigate, deliveryAgent]);

  const handleToggleMute = useCallback(async () => {
    const newState = await toggleMicrophone();
    setIsMuted(!newState);
    toast.success(newState ? 'Microphone unmuted' : 'Microphone muted');
  }, [toggleMicrophone]);

  const handleToggleVideo = useCallback(async () => {
    const newState = await toggleCamera();
    setIsVideoOn(newState);
    toast.success(newState ? 'Camera turned on' : 'Camera turned off');
  }, [toggleCamera]);

  // Business logic handlers
  const handlePaymentRequest = useCallback((payload: {
    amount: number,
    itemTitle: string;
    itemDescription: string;
  }) => {
    liveCall.handlePublishEscrowRequested({
      ...callData,
      data: {
        amount: payload.amount,
        itemDescription: payload.itemDescription,
        itemTitle: payload.itemTitle,
      }
    });
    toast.success(`Payment request of ${AppData.CurrencySymbol}${payload.amount.toFixed(2)} sent to buyer!`);
  }, [liveCall, callData]);

  const handleDeliveryPaymentRequest = useCallback((amount: number) => {
    toast.success(`Delivery escrow of ${AppData.CurrencySymbol}${amount.toFixed(2)} created successfully!`);
  }, []);

  const handleInviteDelivery = useCallback(() => {
    setDeliveryOrderSheetOpen(true);
  }, []);

  const handleDeliveryOrderSubmit = useCallback((orderDetails: any) => {
    setDeliveryOrderSheetOpen(false);
    setInviteDeliveryModalOpen(true);
  }, []);

  const handleDeliveryAgentSelected = useCallback((agent: DeliveryAgent) => {
    setInviteDeliveryModalOpen(false);
    setDeliveryAgent(agent);
    toast.success(`${agent.name} has been invited and will join the call shortly!`);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error('Error attempting to enable fullscreen mode');
      });
      setIsFullscreenMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreenMode(false);
      }
    }
  }, []);

  // Participant rendering
  const renderParticipants = useCallback(() => {
    if (!localParticipant) return [];

    const activeSpeakerId = getActiveSpeaker();

    return [
      {
        participant: localParticipant,
        isLocal: true,
        isCameraOn: isVideoOn,
        isMicOn: !isMuted,
        isSpeaking: localParticipant.identity === activeSpeakerId,
      },
      ...remoteParticipants.map(participant => ({
        participant,
        isLocal: false,
        isCameraOn: participant.isCameraEnabled,
        isMicOn: participant.isMicrophoneEnabled,
        isSpeaking: participant.identity === activeSpeakerId,
      }))
    ];
  }, [localParticipant, remoteParticipants, isVideoOn, isMuted, getActiveSpeaker]);

  const stateData = getCallStateData();

  // Render different states
  if (stateData.state === CallState.PARTICIPANT_LEFT || stateData.state === CallState.CALL_REJECTED) {
    return (
      <ParticipantLeftCallNotice
        isLoading={stateData.isLoading}
        connectParticipant={connectParticipant}
        handleEndCall={handleEndCall}
        isSeller={isSeller}
        isCallRejected={isCallRejected}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col relative overflow-hidden">
      {/* Call Header */}
      <div className="absolute top-0 left-0 right-0 z-10 glass-morphism-dark py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-white" />
          <span className="font-medium text-white">
            {`${stateData.participantCount} participants`}
          </span>
        </div>
        <div className="glass-morphism-dark px-3 py-1 rounded-full text-sm font-medium text-white">
          <CallTimer
            ref={timerRef}
            formatDuration={formatDuration}
            shouldStart={!isConnecting && stateData.participantCount > 1}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white hover:bg-white/10"
          onClick={toggleFullscreen}
        >
          {isFullscreenMode ? <Minimize size={20} /> : <Maximize size={20} />}
        </Button>
      </div>

      {/* Main Call Area */}
      <div className="w-full h-full flex-1 relative">
        {stateData.isLoading ? (
          <div className="text-center text-white absolute inset-0 flex items-center justify-center">
            <p>Connecting to the call...</p>
          </div>
        ) : stateData.state === CallState.WAITING_FOR_PARTICIPANT ? (
          <div className="w-full h-full flex items-center justify-center text-white">
            <p>{isSeller ? 'Waiting for buyer to join...' : 'Waiting for seller to join...'}</p>
          </div>
        ) : stateData.participantCount <= 2 ? (
          // Two participant layout
          <div className="w-full h-full relative">
            <div className="absolute inset-0">
              {renderParticipants().find(p => !p.isLocal) && (
                <Participant
                  {...renderParticipants().find(p => !p.isLocal)!}
                  large={true}
                />
              )}
            </div>
            <div className="absolute bottom-24 right-5 w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg z-10">
              {renderParticipants().find(p => p.isLocal) && (
                <Participant
                  {...renderParticipants().find(p => p.isLocal)!}
                />
              )}
            </div>
          </div>
        ) : (
          // Multiple participants layout
          <div className="w-full h-full relative">
            <div className="absolute inset-0">
              {renderParticipants().find(p => p.isSpeaking) && (
                <Participant
                  {...renderParticipants().find(p => p.isSpeaking)!}
                  large={true}
                />
              )}
            </div>
            <div className={cn(
              "absolute z-10 flex gap-2 bg-black/30 p-2 rounded-lg backdrop-blur-sm",
              isMobile ? "bottom-24 left-1/2 transform -translate-x-1/2 flex-row" : "right-5 top-1/2 transform -translate-y-1/2 flex-col"
            )}>
              {renderParticipants()
                .filter(p => !p.isSpeaking)
                .map((p, idx) => (
                  <div
                    key={p.participant.identity || idx}
                    className={cn(
                      "relative rounded-lg overflow-hidden border border-white/30 cursor-pointer hover:border-primary/80 transition-colors",
                      isMobile ? "h-20 w-20" : "h-24 w-24"
                    )}
                    onClick={() => setManualActiveSpeaker(p.participant.identity || null)}
                  >
                    <Participant {...p} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute left-0 right-0 bottom-0 z-10">
        <CallControls
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onEndCall={handleEndCall}
          onInviteDelivery={!isSeller && !deliveryAgent ? handleInviteDelivery : undefined}
          showInviteDelivery={!isSeller && !deliveryAgent}
          showRequestPayment={isSeller}
          isMobile={isMobile}
          onPaymentRequest={() => setEscrowModalOpen(true)}
        />
      </div>

      {/* Modals */}
      {isSeller && (
        <EscrowRequestModal
          open={escrowModalOpen}
          onOpenChange={setEscrowModalOpen}
          onSuccess={handlePaymentRequest}
        />
      )}

      <DeliveryOrderSheet
        open={deliveryOrderSheetOpen}
        onOpenChange={setDeliveryOrderSheetOpen}
        sellerLocation={""}
        onSubmit={handleDeliveryOrderSubmit}
      />

      <InviteDeliveryModal
        open={inviteDeliveryModalOpen}
        onOpenChange={setInviteDeliveryModalOpen}
        onSelect={handleDeliveryAgentSelected}
      />

      {deliveryAgent && (
        <DeliveryEscrowModal
          open={deliveryEscrowModalOpen}
          onOpenChange={setDeliveryEscrowModalOpen}
          deliveryAgent={deliveryAgent}
          onSuccess={handleDeliveryPaymentRequest}
        />
      )}
    </div>
  );
};

const ParticipantLeftCallNotice = ({
  isSeller,
  connectParticipant,
  handleEndCall,
  isLoading,
  isCallRejected,
}: {
  isSeller: boolean;
  isLoading: boolean;
  connectParticipant: () => void;
  handleEndCall: () => void;
  isCallRejected?: boolean;
}) => {
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md">
        <h2 className="text-3xl font-bold mb-4">
          {isLoading ? "Invitation Sent" :
            isCallRejected ? "Call Declined" :
            isSeller ? "Buyer Left the Call" :
              "Seller Left the Call"}
        </h2>

        {isLoading ? (
          <p className="text-sm text-muted-foreground italic">
            Reconnecting you to the other participant... 🧠 Warming up the signal tubes...
          </p>
        ) : isCallRejected ? (
          <p className="mb-6 text-base">
            No worries! There are plenty of other amazing sellers waiting to chat with you! 🌟
          </p>
        ) : isSeller ? (
          <p className="mb-6 text-base">
            Looks like the buyer dipped 🍵 — go stretch, sip some tea, and get ready for your next awesome customer.
          </p>
        ) : (
          <p className="mb-6 text-base">
            The seller just ninja-vanished 🥷 — hang tight or hit reconnect to bring them back!
          </p>
        )}

        <div className="flex justify-center gap-4">
          {(!isSeller || isCallRejected) && (
            <Button onClick={connectParticipant} variant="default" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              {isCallRejected ? "Try Again" : "Reconnect"}
            </Button>
          )}
          <Button onClick={handleEndCall} variant="outline" className="gap-2 text-white border-white hover:bg-white/10">
            <PhoneOff className="w-4 h-4" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
};

export { LiveCall as LiveCall_V2 };
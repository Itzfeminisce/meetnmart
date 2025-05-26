import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, redirect, useLocation, useNavigate } from 'react-router-dom';
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
import { AppData } from '@/types/call';
import { useAxios } from '@/lib/axiosUtils';
import { CardContent } from '@/components/ui/card';

const LiveCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, userRole } = useAuth();
  const timerRef = useRef<CallTimerHandle>(null);
  const apiClient = useAxios()

  const callData = location.state as CallData
  const [isSeller] = useState(userRole === "seller");
  const liveCall = useLiveCall();

  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [deliveryEscrowModalOpen, setDeliveryEscrowModalOpen] = useState(false);
  const [inviteDeliveryModalOpen, setInviteDeliveryModalOpen] = useState(false);
  const [deliveryOrderSheetOpen, setDeliveryOrderSheetOpen] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [manualActiveSpeaker, setManualActiveSpeaker] = useState<string | null>(null);
  const [waitingForSeller, setWaitingForSeller] = useState<boolean>(true);
  const [isCallEnded, setIsCallEnded] = useState<boolean>(false);
  const [otherParticipantLeft, setOtherParticipantLeft] = useState<boolean>(false);


  // Use our LiveKit hook
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
      toast.info(`${participant.identity} joined the call`);
      setWaitingForSeller(false);
      setOtherParticipantLeft(false); // Reset when someone reconnects
    },
    onParticipantDisconnected: async (participant) => {
      console.log({
        identity: participant.identity,
        caller: callData.caller,
        isSeller,
        profileName: profile?.name
      });

      // Check if the participant that left is NOT the current user
      const isOtherParticipant = participant.identity !== profile?.name;

      if (isOtherParticipant) {
        setOtherParticipantLeft(true);
        toast.info(`${participant.identity} left the call`);

        // If we're the seller and buyer left, show the notice immediately
        if (isSeller) {
          setIsCallEnded(true);
        }
        // If we're the buyer and seller left, also show the notice
        else {
          setIsCallEnded(true);
        }
      }
    },
    onError: (error) => {
      toast.error(`Call error: ${error.message}`);
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);


  const roomName = callData?.room;
  const participantName = profile?.name || user.id;

  


  if (!roomName) return <Navigate to={"/"} replace />


  // Update mobile status on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  async function connectParticipant() {
    setOtherParticipantLeft(false);
    setIsCallEnded(false); // Reset call ended state
    setWaitingForSeller(!isSeller); // Only buyers wait for seller

    await connect(roomName, participantName)
      .then(async newRoom => {
        if (newRoom && !isSeller) {
          // Notify seller about the call if we're the buyer
          liveCall.handlePublishOutgoingCall(callData);
          await apiClient.Post('/messaging/notify/call', {
            userId: callData.receiver.id,
            callId: roomName,
            callerName: callData.caller.name,
            icon: "https://meetnmart.com/logo-white.png",
            redirectUrl: "http://localhost:3000/calls"
          })
        }
      }).catch(() => disconnect());
  }
  

  // Connect to the LiveKit room when component mounts
  useEffect(() => {
    if (!user || !profile) return;
    connectParticipant()

    return () => {
      disconnect();
    };
  }, [user, profile]);

  // Get current active speaker - with manual override support
  const getActiveSpeaker = useCallback(() => {
    // If manually selected, use that
    if (manualActiveSpeaker) {
      const manualSpeaker = [...remoteParticipants, localParticipant].find(
        p => p && p.identity === manualActiveSpeaker
      );
      if (manualSpeaker) {
        return manualSpeaker.identity;
      }
    }

    // Otherwise use real active speakers
    if (activeSpeakers.length > 0) {
      return activeSpeakers[0].identity;
    }

    // Default to a remote participant if available
    if (remoteParticipants.length > 0) {
      return remoteParticipants[0].identity;
    }

    // Fall back to local
    return localParticipant?.identity || '';
  }, [activeSpeakers, remoteParticipants, localParticipant, manualActiveSpeaker]);

  const handleEndCall = async () => {
    // Disconnect from LiveKit
    await disconnect();

    // Notify about call ending
    if (room && user && profile) {
      liveCall.handlePublishCallEnded({
        ...callData,
        data: {
          ...callData.data,
          callSessionId: liveCall.activeCall?.data?.callSessionId
        }
      });
    }

    // Navigate based on role
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
  };

  const handleToggleMute = async () => {
    const newState = await toggleMicrophone();
    setIsMuted(!newState);
    toast.success(newState ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleToggleVideo = async () => {
    const newState = await toggleCamera();
    setIsVideoOn(newState);
    toast.success(newState ? 'Camera turned on' : 'Camera turned off');
  };

  const handlePaymentRequest = (payload: {
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
    })
    toast.success(`Payment request of ${AppData.CurrencySymbol}${payload.amount.toFixed(2)} sent to buyer!`);
  };

  const handleDeliveryPaymentRequest = (amount: number) => {
    toast.success(`Delivery escrow of ${AppData.CurrencySymbol}${amount.toFixed(2)} created successfully!`);
  };

  const handleInviteDelivery = () => {
    setDeliveryOrderSheetOpen(true);
  };

  const handleDeliveryOrderSubmit = (orderDetails: any) => {
    setDeliveryOrderSheetOpen(false);
    setInviteDeliveryModalOpen(true);
  };

  const handleDeliveryAgentSelected = (agent: DeliveryAgent) => {
    setInviteDeliveryModalOpen(false);
    setDeliveryAgent(agent);
    toast.success(`${agent.name} has been invited and will join the call shortly!`);
  };


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error('Error attempting to enable fullscreen mode');
      });
      setIsFullscreenMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreenMode(false);
      }
    }
  };

  // Format participants for the UI
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

  // Participant count, including local participant
  const participantCount = localParticipant ? remoteParticipants.length + 1 : 0;

  // Determine if we should show the "other participant left" screen
  const shouldShowParticipantLeftScreen = () => {
    // Show if call ended (which happens when other participant leaves)
    return isCallEnded && isConnected;
  };

  // Determine if we should show "waiting for seller" screen
  const shouldShowWaitingScreen = () => {
    return !isSeller && waitingForSeller && !otherParticipantLeft && !isCallEnded && isConnected && remoteParticipants.length === 0;
  };

  // If call officially ended or other participant left, show the notice
  if (shouldShowParticipantLeftScreen()) {
    return (
      <ParticipantLeftCallNotice
        isLoading={false}
        connectParticipant={connectParticipant}
        handleEndCall={handleEndCall}
        isSeller={isSeller}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col relative overflow-hidden">
      {/* Call Header - Floating */}
      <div className="absolute top-0 left-0 right-0 z-10 glass-morphism-dark py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-white" />
          <span className="font-medium text-white">
            {`${participantCount} participants`}
          </span>
        </div>
        <div className="glass-morphism-dark px-3 py-1 rounded-full text-sm font-medium text-white">
          <CallTimer
            ref={timerRef}
            formatDuration={formatDuration}
            shouldStart={!isConnecting && participantCount > 1}
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

      {/* Main Call Area - Full Screen */}
      <div className="w-full h-full flex-1 relative">
        {isConnecting ? (
          <div className="text-center text-white absolute inset-0 flex items-center justify-center">
            <p>Connecting to the call...</p>
          </div>
        ) : shouldShowWaitingScreen() ? (
          <div className="w-full h-full flex items-center justify-center text-white">
            <p>Waiting for seller to join...</p>
          </div>
        ) : participantCount <= 2 ? (
          // Two participant layout - Full Screen
          <div className="w-full h-full relative">
            {/* Main participant (remote) - Full Screen */}
            <div className="absolute inset-0">
              {renderParticipants().find(p => !p.isLocal) && (
                <Participant
                  {...renderParticipants().find(p => !p.isLocal)!}
                  large={true}
                />
              )}
            </div>

            {/* Self view (small) - Floating */}
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
            {/* Main active speaker - Full Screen */}
            <div className="absolute inset-0">
              {renderParticipants().find(p => p.isSpeaking) && (
                <Participant
                  {...renderParticipants().find(p => p.isSpeaking)!}
                  large={true}
                />
              )}
            </div>

            {/* Thumbnail strip - Floating */}
            <div className={cn(
              "absolute z-10 flex gap-2 bg-black/30 p-2 rounded-lg backdrop-blur-sm",
              isMobile ? "bottom-24 left-1/2 transform -translate-x-1/2 flex-row" : "right-5 top-1/2 transform -translate-y-1/2 flex-col"
            )}>
              {/* Thumbnails for non-speaking participants */}
              {renderParticipants()
                .filter(p => !p.isSpeaking)
                .map((p, idx) => (
                  <div
                    key={p.participant.identity || idx}
                    className={cn(
                      "relative rounded-lg overflow-hidden border border-white/30 cursor-pointer hover:border-primary/80 transition-colors",
                      isMobile ? "h-20 w-20" : "h-24 w-24"
                    )}
                    onClick={() => {
                      setManualActiveSpeaker(p.participant.identity || null);
                    }}
                  >
                    <Participant {...p} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Call Controls - Floating */}
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
      {
        isSeller && (
          <EscrowRequestModal
            open={escrowModalOpen}
            onOpenChange={setEscrowModalOpen}
            onSuccess={handlePaymentRequest}
          />
        )
      }

      {/* Delivery Order Sheet (for collecting address info) */}
      <DeliveryOrderSheet
        open={deliveryOrderSheetOpen}
        onOpenChange={setDeliveryOrderSheetOpen}
        sellerLocation={"visitor.location"}
        onSubmit={handleDeliveryOrderSubmit}
      />

      {/* Invite Delivery Modal (for selecting a delivery agent) */}
      <InviteDeliveryModal
        open={inviteDeliveryModalOpen}
        onOpenChange={setInviteDeliveryModalOpen}
        onSelect={handleDeliveryAgentSelected}
      />

      {/* Delivery Escrow Modal */}
      {
        deliveryAgent && (
          <DeliveryEscrowModal
            open={deliveryEscrowModalOpen}
            onOpenChange={setDeliveryEscrowModalOpen}
            deliveryAgent={deliveryAgent}
            onSuccess={handleDeliveryPaymentRequest}
          />
        )
      }
    </div>
  );
};

const ParticipantLeftCallNotice = ({
  isSeller,
  connectParticipant,
  handleEndCall,
  isLoading,
}: {
  isSeller: boolean;
  isLoading: boolean;
  connectParticipant: () => void;
  handleEndCall: () => void;
}) => {

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md">
        <h2 className="text-3xl font-bold mb-4">
          {isLoading ? "Invitation Sent" :
            isSeller ? "Buyer Left the Call" :
              "Seller Left the Call"}
        </h2>

        {isLoading ? (
          <p className="text-sm text-muted-foreground italic">
            Reconnecting you to the other participant... 🧠 Warming up the signal tubes...
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
          {!isSeller && <Button onClick={connectParticipant} variant="default" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Reconnect
          </Button>
          }
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

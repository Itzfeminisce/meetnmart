import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Maximize, Minimize } from 'lucide-react';
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

const LiveCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, userRole } = useAuth();
  const timerRef = useRef<CallTimerHandle>(null);

  const callData = location.state as CallData<never>
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
      setWaitingForSeller(false)
    },
    onParticipantDisconnected: (participant) => {
      toast.info(`${participant.identity} left the call`);
    },
    onError: (error) => {
      toast.error(`Call error: ${error.message}`);
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);


  const roomName = callData.room;
  const participantName = profile.name || user.id;


  // Update mobile status on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Connect to the LiveKit room when component mounts
  useEffect(() => {
    if (!user || !profile) return;

    connect(roomName, participantName)
      .then(newRoom => {
        if (newRoom && !isSeller) {
          // Notify seller about the call if we're the buyer
          liveCall.handlePublishOutgoingCall(callData);
        }
      });

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
    // Notify about call ending
    if (room && user && profile) {
      liveCall.handlePublishCallEnded(callData);
    }

    // Disconnect from LiveKit
    await disconnect();

    // Navigate based on role
    if (isSeller) {
      navigate(-1);
    } else {
      navigate('/rating', {
        state: {
          seller: { avatar: "", name: callData.receiver.name, descripition: "Great work" },
          deliveryAgent,
          callDuration: timerRef.current?.getTimer()
        }
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
        itemTitle: payload.itemTitle
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
    setIsFullscreenMode(!isFullscreenMode);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Call Header */}
      <div className="glass-morphism py-3 px-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <span className="font-medium">
            {`${participantCount} participants`}
          </span>
        </div>
        <div className="glass-morphism px-3 py-1 rounded-full text-sm font-medium">
          <CallTimer
            ref={timerRef}
            formatDuration={formatDuration}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={toggleFullscreen}
        >
          {isFullscreenMode ? <Minimize size={20} /> : <Maximize size={20} />}
        </Button>
      </div>

      {/* Main Call Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Main Video/Avatar Space */}
        <div
          className={cn(
            "flex-1 flex flex-col items-center justify-center",
            isMobile ? "pb-20" : "pb-24"
          )}
        >
          {isConnecting ? (
            <div className="text-center">
              <p>Connecting to the call...</p>
            </div>
          ) : participantCount <= 2 ? (
            // Two participant layout
            <div className="relative max-w-2xl w-full h-full flex flex-col items-center justify-center">
              {/* Main participant (remote) */}
              <div className="aspect-video w-full h-[calc(100vh - 42rem)] relative rounded-xl overflow-hidden bg-secondary/30 border-2 border-market-orange/50 flex items-center justify-center">
                {!isConnecting && waitingForSeller && !isSeller ? (<p>Waiting for seller</p>) : (
                  renderParticipants().find(p => !p.isLocal) && (
                    <Participant
                      {...renderParticipants().find(p => !p.isLocal)!}
                      large={true}
                    />
                  )
                )}
              </div>

              {/* Self view (small) */}
              <div className="absolute bottom-5 right-5 w-32 h-32 rounded-lg overflow-hidden border-2 border-background shadow-md">
                {renderParticipants().find(p => p.isLocal) && (
                  <Participant
                    {...renderParticipants().find(p => p.isLocal)!}
                  />
                )}
              </div>
            </div>
          ) : (
            // Multiple participants layout
            <div className="w-full h-full flex flex-col md:flex-row gap-4">
              {/* Main active speaker */}
              <div className="flex-1 relative">
                <div className="aspect-video w-full h-full max-h-[60vh] md:max-h-none relative rounded-xl overflow-hidden bg-secondary/30 border-2 border-market-orange/50 flex items-center justify-center">
                  {renderParticipants().find(p => p.isSpeaking) && (
                    <Participant
                      {...renderParticipants().find(p => p.isSpeaking)!}
                      large={true}
                    />
                  )}
                </div>
              </div>

              {/* Thumbnail strip (vertical on mobile, horizontal on desktop) */}
              <div className={cn(
                "flex gap-2",
                isMobile ? "flex-row justify-center" : "flex-col justify-start w-1/4"
              )}>
                {/* Thumbnails for all non-speaking participants */}
                {renderParticipants()
                  .filter(p => !p.isSpeaking)
                  .map((p, idx) => (
                    <div
                      key={p.participant.identity || idx}
                      className={cn(
                        "relative rounded-lg overflow-hidden bg-secondary/30 border-2 cursor-pointer hover:border-primary/50 transition-colors",
                        isMobile ? "h-24 w-24" : "aspect-video w-full"
                      )}
                      onClick={() => {
                        // Manually set active speaker for UI purposes
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
      </div>

      {/* Call Controls */}
      <div className="absolute left-0 right-0 bottom-0">
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

export { LiveCall as LiveCall_V2 };
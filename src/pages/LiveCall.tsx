import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryAgent } from '@/types';
import { toast } from 'sonner';
import EscrowRequestModal from '@/components/EscrowRequestModal';
import InviteDeliveryModal from '@/components/InviteDeliveryModal';
import DeliveryOrderSheet from '@/components/DeliveryOrderSheet';
import DeliveryEscrowModal from '@/components/DeliveryEscrowModal';
import { cn, formatDuration, toLivekitRoomName } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import livekitService from '@/services/livekitService';
import { Room, RoomEvent, LocalParticipant, RemoteParticipant } from 'livekit-client';
import { Participant, CallControls } from '@/components/LiveKitComponents';
import { CallTimer, CallTimerHandle } from '@/components/CallTimer';
import { useLiveCall } from '@/contexts/LiveCallContext';

const LiveCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, userRole } = useAuth();
  const timerRef = useRef<CallTimerHandle>()

  const visitor = location.state as { name: string; id: string, room?: string }
  const [isSeller] = useState(userRole === "seller");
  const liveCall = useLiveCall()

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [deliveryEscrowModalOpen, setDeliveryEscrowModalOpen] = useState(false);
  const [inviteDeliveryModalOpen, setInviteDeliveryModalOpen] = useState(false);
  const [deliveryOrderSheetOpen, setDeliveryOrderSheetOpen] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('seller'); // 'seller' or 'delivery'

  // LiveKit integration
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);

  // Update mobile status on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Simulate active speaker changes (for demo purposes)
  useEffect(() => {
    if (deliveryAgent) {
      const speakerInterval = setInterval(() => {
        setActiveSpeaker(prev => prev === 'seller' ? 'delivery' : 'seller');
      }, 8000);
      return () => clearInterval(speakerInterval);
    }
  }, [deliveryAgent]);


  // Handle room events for participant tracking
  const handleParticipantConnected = (participant: RemoteParticipant) => {
    setRemoteParticipants(prev => [...prev, participant]);
  };

  const handleParticipantDisconnected = (participant: RemoteParticipant) => {
    setRemoteParticipants(prev => prev.filter(p => p.sid !== participant.sid));
  };


  const connectToRoom = useCallback(async () => {
    if (!user || !profile) return;


    setIsConnecting(true);
    try {
      // Create a room name from the call data
      const roomName = visitor.room || toLivekitRoomName(`call_${Date.now()}_${visitor.id}_${user.id}`);
      const participantName = profile.name || user.id;

      const newRoom = await livekitService.connectToRoom(roomName, participantName);


      if (newRoom) {
        setRoom(newRoom);
        setLocalParticipant(newRoom.localParticipant);


        // Set up initial remote participants
        setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));

        // Register event listeners
        newRoom.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
        newRoom.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

        // Set initial track states
        setIsMuted(false);
        setIsVideoOn(true);

        // Enable audio and video
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        await newRoom.localParticipant.setCameraEnabled(true);

        // Post outgoing call to notify seller
        if (visitor && !isSeller) {
          liveCall.handlePublishOutgoingCall({
            room: roomName,
            receiver: {
              name: visitor.name,
              id: visitor.id
            },
            caller: {
              id: user.id,
              name: profile.name
            }
          })


          toast.success('Connected to call');
        }

        setIsConnecting(false);
      } else {
        toast.error('Failed to connect to call');
      }


    } catch (error) {
      console.error('Error connecting to LiveKit room:', error);
      toast.error('Failed to connect to call');
    }
  }, [localParticipant, remoteParticipants]);

  // LiveKit room connection
  useEffect(() => {

    connectToRoom();

    // Cleanup when leaving the page
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);


  const handleEndCall = async () => {
    // Disconnect from the room
    if (room) {
      liveCall.handlePublishCallEnded({
        room: room.name,
        receiver: {
          name: visitor.name,
          id: visitor.id
        },
        caller: {
          id: user.id,
          name: profile.name
        }
      })
      await room.disconnect(true);
    }

    if (isSeller) {
      navigate(-1)
    } else {
      navigate('/rating', { state: { seller: { avatar: "", name: visitor.name, descripition: "Great work" }, deliveryAgent, callDuration: timerRef.current?.getTimer() } });
    }
  };

  const handlePaymentRequest = (amount: number) => {
    // In a real app, this would send the payment request to the buyer
    toast.success(`Payment request of $${amount.toFixed(2)} sent to buyer!`);
  };

  const handleDeliveryPaymentRequest = (amount: number) => {
    toast.success(`Delivery escrow of $${amount.toFixed(2)} created successfully!`);
  };

  const handleInviteDelivery = () => {
    // First open the delivery order sheet to collect address info
    setDeliveryOrderSheetOpen(true);
  };

  const handleDeliveryOrderSubmit = (orderDetails: any) => {
    setDeliveryOrderSheetOpen(false);
    // Now open the invite delivery modal with the order details
    setInviteDeliveryModalOpen(true);
  };

  const handleDeliveryAgentSelected = (agent: DeliveryAgent) => {
    setInviteDeliveryModalOpen(false);
    setDeliveryAgent(agent);

    // In a real app, you'd invite the delivery agent to the LiveKit room here
    // For this demo, we'll simulate adding them to the participants list
    toast.success(`${agent.name} has been invited and will join the call shortly!`);
  };

  const toggleFullscreen = () => {
    setIsFullscreenMode(!isFullscreenMode);
  };

  const handleToggleMute = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const handleToggleVideo = async () => {
    try {
      await localParticipant.setCameraEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
      toast.success(isVideoOn ? 'Camera turned off' : 'Camera turned on');
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast.error('Failed to toggle camera');
    }
  };

  // Handle participants for the UI
  const renderParticipants = useCallback(
    () => {
      return [
        {
          participant: localParticipant, // || { identity: profile?.name || 'You' } as any,
          isLocal: true,
          isCameraOn: isVideoOn,
          isMicOn: !isMuted,
          isSpeaking: false,
        },
        ...remoteParticipants.map(participant => ({
          participant,
          isLocal: false,
          isCameraOn: true, // In a real app, you'd check if they have video tracks
          isMicOn: true, // In a real app, you'd check if they have audio tracks
          isSpeaking: activeSpeaker === participant.identity,
        }))
      ];
    }, [localParticipant, remoteParticipants]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Call Header */}
      <div className="glass-morphism py-3 px-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <span className="font-medium">
            {deliveryAgent ? '3 participants' : '2 participants'}
          </span>
        </div>
        <div className="glass-morphism px-3 py-1 rounded-full text-sm font-medium">
          {/* <CallTimer ref={timerRef} /> */}
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
          ) : renderParticipants().length <= 2 ? (
            // Two participant layout
            <div className="relative max-w-2xl w-full h-full flex flex-col items-center justify-center">
              {/* Main participant (remote) */}
              <div className="aspect-video w-full  h-[calc(100vh - 42rem)] relative rounded-xl overflow-hidden bg-secondary/30 border-2 border-market-orange/50 flex items-center justify-center">
                {renderParticipants().find(p => !p.isLocal) && (
                  <Participant
                    {...renderParticipants().find(p => !p.isLocal)!}
                    large={true}
                  />
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
                      onClick={() => setActiveSpeaker(p.participant.identity || '')}
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

      {/* Action buttons */}

      {/* 
            <div className={cn(
        "absolute left-0 right-0 bottom-20 flex justify-center gap-2",
        isMobile ? "pb-4" : "pb-2"
      )}>
        {!isSeller && !deliveryAgent && (
          <Button
            variant="outline" 
            size="sm"
            className="bg-primary/20 border-none"
            onClick={handleInviteDelivery}
          >
            <Truck size={16} className="text-primary mr-2" />
            Invite Delivery
          </Button>
        )}
       {!isSeller && deliveryAgent && (
          <Button
            variant="outline" 
            size="sm"
            className="bg-market-green/20 border-none"
            onClick={() => setDeliveryEscrowModalOpen(true)}
          >
            <DollarSign size={16} className="text-market-green mr-2" />
            Pay for Delivery
          </Button>
        )}
        
        {isSeller && (
          <Button
            variant="outline" 
            size="sm"
            className="bg-market-green/20 border-none"
            onClick={() => setEscrowModalOpen(true)}
          >
            <DollarSign size={16} className="text-market-green mr-2" />
            Request Payment
          </Button>
        )} 
    </div>
     */}
      {/* Modals */}
      {
        isSeller && (
          <EscrowRequestModal
            open={escrowModalOpen}
            onOpenChange={setEscrowModalOpen}
            sellerName={visitor.name}
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
    </div >
  );
};

export default LiveCall;

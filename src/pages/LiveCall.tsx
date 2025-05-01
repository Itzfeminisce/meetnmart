import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneCall, DollarSign, Truck, Users, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Seller, DeliveryAgent } from '@/types';
import { toast } from 'sonner';
import EscrowRequestModal from '@/components/EscrowRequestModal';
import InviteDeliveryModal from '@/components/InviteDeliveryModal';
import DeliveryOrderSheet from '@/components/DeliveryOrderSheet';
import DeliveryEscrowModal from '@/components/DeliveryEscrowModal';
import { cn, formatDuration, getInitials, toLivekitRoomName } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import livekitService from '@/services/livekitService';
import { Room, RoomEvent, LocalParticipant, RemoteParticipant } from 'livekit-client';
import { Participant, CallControls } from '@/components/LiveKitComponents';

const LiveCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, userRole } = useAuth();
  const { seller } = location.state as { seller: Seller };
  const [isSeller] = useState(userRole);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
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

  // Simulate call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
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
  
  // LiveKit room connection
  useEffect(() => {
    const connectToRoom = async () => {
      if (!user || !profile) return;
      
      setIsConnecting(true);
      
      try {
        // Create a room name from the call data
        const roomName = toLivekitRoomName(`call_${Date.now()}_${seller.id}_${user.id}`);
        const participantName = profile.name || user.id;
        
        const newRoom = await livekitService.connectToRoom(roomName, participantName);

        console.log("connectToRoom#[LiveCall]", newRoom);
        
        
        if (newRoom) {
          setRoom(newRoom);
          setLocalParticipant(newRoom.localParticipant);
          
          // Handle room events for participant tracking
          const handleParticipantConnected = (participant: RemoteParticipant) => {
            console.log('Remote participant connected:', participant.identity);
            setRemoteParticipants(prev => [...prev, participant]);
          };
          
          const handleParticipantDisconnected = (participant: RemoteParticipant) => {
            console.log('Remote participant disconnected:', participant.identity);
            setRemoteParticipants(prev => prev.filter(p => p.sid !== participant.sid));
          };
          
          // Set up initial remote participants
          // setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
          
          // Register event listeners
          newRoom.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
          newRoom.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
          
          // Set initial track states
          setIsMuted(false);
          setIsVideoOn(true);
          
          // Enable audio and video
          await newRoom.localParticipant.setMicrophoneEnabled(true);
          await newRoom.localParticipant.setCameraEnabled(true);
        setIsConnecting(false);
          
          toast.success('Connected to call');
        } else {
          toast.error('Failed to connect to call');
        }
      } catch (error) {
        console.error('Error connecting to LiveKit room:', error);
        toast.error('Failed to connect to call');
      } finally {
        // setIsConnecting(false);
      }
    };
    
    connectToRoom();
    
    // Cleanup when leaving the page
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [user, profile, seller]);

  const handleEndCall = () => {
    // Disconnect from the room
    if (room) {
      room.disconnect();
    }
    
    navigate('/rating', { state: { seller, callDuration, deliveryAgent } });
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
    if (room && localParticipant) {
      try {
        await localParticipant.setMicrophoneEnabled(isMuted);
        setIsMuted(!isMuted);
        toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
      } catch (error) {
        console.error('Error toggling microphone:', error);
        toast.error('Failed to toggle microphone');
      }
    } else {
      // Fallback for demo purposes
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    }
  };
  
  const handleToggleVideo = async () => {
    if (room && localParticipant) {
      try {
        await localParticipant.setCameraEnabled(!isVideoOn);
        setIsVideoOn(!isVideoOn);
        toast.success(isVideoOn ? 'Camera turned off' : 'Camera turned on');
      } catch (error) {
        console.error('Error toggling camera:', error);
        toast.error('Failed to toggle camera');
      }
    } else {
      // Fallback for demo purposes
      setIsVideoOn(!isVideoOn);
      toast.success(isVideoOn ? 'Camera turned off' : 'Camera turned on');
    }
  };

  // Handle participants for the UI
  const renderParticipants = () => {
    // For demo purposes, ensure there are always participants to display
    // if (remoteParticipants.length === 0 && !isConnecting) {
    //   // Simulate a remote participant (seller)
    //   return [
    //     {
    //       participant: localParticipant || { identity: profile?.name || 'You' } as any,
    //       isLocal: true,
    //       isCameraOn: isVideoOn,
    //       isMicOn: !isMuted,
    //       isSpeaking: false,
    //     },
    //     {
    //       participant: { identity: seller.name } as any,
    //       isLocal: false,
    //       isCameraOn: true,
    //       isMicOn: true,
    //       isSpeaking: activeSpeaker === 'seller',
    //     },
    //     ...(deliveryAgent ? [{
    //       participant: { identity: deliveryAgent.name } as any,
    //       isLocal: false,
    //       isCameraOn: true,
    //       isMicOn: true,
    //       isSpeaking: activeSpeaker === 'delivery',
    //     }] : [])
    //   ];
    // }
    
    // Return actual participants when available
    return [
      {
        participant: localParticipant, // || { identity: profile?.name || 'You' } as any,
        isLocal: true,
        isCameraOn: isVideoOn,
        isMicOn: !isMuted,
        isSpeaking: false,
      },
      // ...remoteParticipants.map(participant => ({
      //   participant,
      //   isLocal: false,
      //   isCameraOn: true, // In a real app, you'd check if they have video tracks
      //   isMicOn: true, // In a real app, you'd check if they have audio tracks
      //   isSpeaking: activeSpeaker === participant.identity,
      // }))
    ];
  };

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
          {formatDuration(callDuration)}
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
          isMobile={isMobile}
        />
      </div>
      
      {/* Action buttons */}
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
      
      {/* Modals */}
      {isSeller && (
        <EscrowRequestModal 
          open={escrowModalOpen}
          onOpenChange={setEscrowModalOpen}
          sellerName={seller.name}
          onSuccess={handlePaymentRequest}
        />
      )}
      
      {/* Delivery Order Sheet (for collecting address info) */}
      <DeliveryOrderSheet
        open={deliveryOrderSheetOpen}
        onOpenChange={setDeliveryOrderSheetOpen}
        sellerLocation={seller.location}
        onSubmit={handleDeliveryOrderSubmit}
      />
      
      {/* Invite Delivery Modal (for selecting a delivery agent) */}
      <InviteDeliveryModal
        open={inviteDeliveryModalOpen}
        onOpenChange={setInviteDeliveryModalOpen}
        onSelect={handleDeliveryAgentSelected}
      />
      
      {/* Delivery Escrow Modal */}
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

export default LiveCall;

// import { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Mic, MicOff, Video, VideoOff, PhoneCall, DollarSign, Truck, Users, Maximize, Minimize } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Seller, DeliveryAgent } from '@/types';
// import { toast } from 'sonner';
// import EscrowRequestModal from '@/components/EscrowRequestModal';
// import InviteDeliveryModal from '@/components/InviteDeliveryModal';
// import DeliveryOrderSheet from '@/components/DeliveryOrderSheet';
// import DeliveryEscrowModal from '@/components/DeliveryEscrowModal';
// import { cn, formatDuration, getInitials, toLivekitRoomName } from '@/lib/utils';
// import { useAuth } from '@/contexts/AuthContext';
// import livekitService from '@/services/livekitService';
// import { Room } from 'livekit-client';
// import { Participant, CallControls } from '@/components/LiveKitComponents';

// const LiveCall = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, profile, userRole } = useAuth();
//   const { seller } = location.state as { seller: Seller };
//   const [isSeller] = useState(userRole);
  
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [callDuration, setCallDuration] = useState(0);
//   const [escrowModalOpen, setEscrowModalOpen] = useState(false);
//   const [deliveryEscrowModalOpen, setDeliveryEscrowModalOpen] = useState(false);
//   const [inviteDeliveryModalOpen, setInviteDeliveryModalOpen] = useState(false);
//   const [deliveryOrderSheetOpen, setDeliveryOrderSheetOpen] = useState(false);
//   const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [isFullscreenMode, setIsFullscreenMode] = useState(false);
//   const [activeSpeaker, setActiveSpeaker] = useState('seller'); // 'seller' or 'delivery'
  
//   // LiveKit integration
//   const [room, setRoom] = useState<Room | null>(null);
//   const [isConnecting, setIsConnecting] = useState(true);
//   const [participants, setParticipants] = useState<any[]>([]);
  
//   // Update mobile status on window resize
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Simulate call timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCallDuration(prev => prev + 1);
//     }, 1000);
    
//     return () => clearInterval(timer);
//   }, []);

//   // Simulate active speaker changes (for demo purposes)
//   useEffect(() => {
//     if (deliveryAgent) {
//       const speakerInterval = setInterval(() => {
//         setActiveSpeaker(prev => prev === 'seller' ? 'delivery' : 'seller');
//       }, 8000);
//       return () => clearInterval(speakerInterval);
//     }
//   }, [deliveryAgent]);
  
//   // LiveKit room connection
//   useEffect(() => {
//     const connectToRoom = async () => {
//       if (!user || !profile) return;
      
//       setIsConnecting(true);
      
//       try {
//         // In a real app, you'd get the room name from the call request
//         // For this demo, we'll create a room name
//         const roomName = toLivekitRoomName(`call_${Date.now()}_${seller.id}_${user.id}`)
//         const participantName = profile.name || user.id;
        
//         const newRoom = await livekitService.connectToRoom(roomName, participantName);
        
//         if (newRoom) {
//           setRoom(newRoom);
          
//           // Set up event listeners (in a real app)
//           // newRoom.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
//           // newRoom.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
//           // newRoom.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
//           // newRoom.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
          
//           // For this demo, we'll simulate participants
//           setParticipants([
//             newRoom.localParticipant,
//             newRoom.remoteParticipants
//             // { id: 'local', name: participantName, isLocal: true },
//             // { id: seller.id, name: seller.name, isLocal: false }
//           ]);
          
//           // Handle local tracks
//           setIsMuted(false);
//           setIsVideoOn(true);
          
//           toast.success('Connected to call');
//         } else {
//           toast.error('Failed to connect to call');
//         }
//       } catch (error) {
//         console.error('Error connecting to LiveKit room:', error);
//         toast.error('Failed to connect to call');
//       } finally {
//         setIsConnecting(false);
//       }
//     };
    
//     connectToRoom();
    
//     // Cleanup when leaving the page
//     return () => {
//       if (room) {
//         room.disconnect();
//       }
//     };
//   }, [user, profile, seller]);

//   const handleEndCall = () => {
//     // Disconnect from the room
//     if (room) {
//       room.disconnect();
//     }
    
//     navigate('/rating', { state: { seller, callDuration, deliveryAgent } });
//   };

//   const handlePaymentRequest = (amount: number) => {
//     // In a real app, this would send the payment request to the buyer
//     toast.success(`Payment request of $${amount.toFixed(2)} sent to buyer!`);
//   };

//   const handleDeliveryPaymentRequest = (amount: number) => {
//     toast.success(`Delivery escrow of $${amount.toFixed(2)} created successfully!`);
//   };

//   const handleInviteDelivery = () => {
//     // First open the delivery order sheet to collect address info
//     setDeliveryOrderSheetOpen(true);
//   };

//   const handleDeliveryOrderSubmit = (orderDetails) => {
//     setDeliveryOrderSheetOpen(false);
//     // Now open the invite delivery modal with the order details
//     setInviteDeliveryModalOpen(true);
//   };

//   const handleDeliveryAgentSelected = (agent: DeliveryAgent) => {
//     setInviteDeliveryModalOpen(false);
//     setDeliveryAgent(agent);
    
//     // In a real app, you'd invite the delivery agent to the LiveKit room here
//     // For this demo, we'll simulate adding them to the participants list
//     setParticipants(prev => [...prev, { id: agent.id, name: agent.name, isLocal: false }]);
    
//     toast.success(`${agent.name} has been invited and will join the call shortly!`);
//   };

//   const toggleFullscreen = () => {
//     setIsFullscreenMode(!isFullscreenMode);
//   };
  
//   const handleToggleMute = () => {
//     setIsMuted(!isMuted);
    
//     // In a real app, this would mute/unmute the local audio track
//     // if (room) {
//     //   room.localParticipant.setMicrophoneEnabled(!isMuted);
//     // }
    
//     toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
//   };
  
//   const handleToggleVideo = () => {
//     setIsVideoOn(!isVideoOn);
    
//     // In a real app, this would enable/disable the local video track
//     // if (room) {
//     //   room.localParticipant.setCameraEnabled(!isVideoOn);
//     // }
    
//     toast.success(isVideoOn ? 'Camera turned off' : 'Camera turned on');
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       {/* Call Header */}
//       <div className="glass-morphism py-3 px-4 border-b flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <Users size={20} />
//           <span className="font-medium">
//             {deliveryAgent ? '3 participants' : '2 participants'}
//           </span>
//         </div>
//         <div className="glass-morphism px-3 py-1 rounded-full text-sm font-medium">
//           {formatDuration(callDuration)}
//         </div>
//         <Button 
//           variant="ghost" 
//           size="icon" 
//           className="rounded-full" 
//           onClick={toggleFullscreen}
//         >
//           {isFullscreenMode ? <Minimize size={20} /> : <Maximize size={20} />}
//         </Button>
//       </div>

//       {/* Main Call Area */}
//       <div className="flex-1 flex flex-col relative overflow-hidden">
//         {/* Main Video/Avatar Space */}
//         <div 
//           className={cn(
//             "flex-1 flex flex-col items-center justify-center p-4",
//             isMobile ? "pb-20" : "pb-24"
//           )}
//         >
//           {participants.length <= 2 ? (
//             // Two participant layout
//             <div className="relative max-w-lg w-full h-full flex flex-col items-center justify-center">
//               {/* Main participant (remote) */}
//               <div className="aspect-video w-full max-h-[70vh] relative rounded-xl overflow-hidden bg-secondary/30 border-2 border-market-orange/50 flex items-center justify-center">
//                 {participants.find(p => !p.isLocal) && (
//                   <Participant 
//                     participant={{ identity: seller.name } as any}
//                     isSpeaking={true}
//                     isCameraOn={true}
//                     isMicOn={true}
//                     large={true}
//                   />
//                 )}
//               </div>
              
//               {/* Self view (small) */}
//               <div className="absolute bottom-5 right-5 w-32 h-24 rounded-lg overflow-hidden border-2 border-background shadow-md">
//                 <Participant 
//                   participant={{ identity: profile?.name || 'You' } as any}
//                   isLocal={true}
//                   isCameraOn={isVideoOn}
//                   isMicOn={!isMuted}
//                 />
//               </div>
//             </div>
//           ) : (
//             // Multiple participants layout
//             <div className="w-full h-full flex flex-col md:flex-row gap-4">
//               {/* Main active speaker */}
//               <div className="flex-1 relative">
//                 <div className="aspect-video w-full h-full max-h-[60vh] md:max-h-none relative rounded-xl overflow-hidden bg-secondary/30 border-2 border-market-orange/50 flex items-center justify-center">
//                   {activeSpeaker === 'seller' ? (
//                     <Participant 
//                       participant={{ identity: seller.name } as any}
//                       isSpeaking={true}
//                       isCameraOn={true}
//                       isMicOn={true}
//                       large={true}
//                     />
//                   ) : (
//                     <Participant 
//                       participant={{ identity: deliveryAgent?.name || 'Delivery' } as any}
//                       isSpeaking={true}
//                       isCameraOn={true}
//                       isMicOn={true}
//                       large={true}
//                     />
//                   )}
//                 </div>
//               </div>
              
//               {/* Thumbnail strip (vertical on mobile, horizontal on desktop) */}
//               <div className={cn(
//                 "flex gap-2",
//                 isMobile ? "flex-row justify-center" : "flex-col justify-start w-1/4"
//               )}>
//                 {/* Local participant thumbnail */}
//                 <div 
//                   className={cn(
//                     "relative rounded-lg overflow-hidden bg-secondary/30 border-2",
//                     isMobile ? "h-24 w-24" : "aspect-video w-full"
//                   )}
//                 >
//                   <Participant 
//                     participant={{ identity: profile?.name || 'You' } as any}
//                     isLocal={true}
//                     isCameraOn={isVideoOn}
//                     isMicOn={!isMuted}
//                   />
//                 </div>
                
//                 {/* Other participants thumbnails */}
//                 {activeSpeaker === 'seller' && deliveryAgent && (
//                   <div 
//                     className={cn(
//                       "relative rounded-lg overflow-hidden bg-secondary/30 border-2 cursor-pointer hover:border-primary/50 transition-colors",
//                       isMobile ? "h-24 w-24" : "aspect-video w-full"
//                     )}
//                     onClick={() => setActiveSpeaker('delivery')}
//                   >
//                     <Participant 
//                       participant={{ identity: deliveryAgent.name } as any}
//                       isCameraOn={true}
//                       isMicOn={true}
//                     />
//                   </div>
//                 )}
                
//                 {activeSpeaker === 'delivery' && (
//                   <div 
//                     className={cn(
//                       "relative rounded-lg overflow-hidden bg-secondary/30 border-2 cursor-pointer hover:border-primary/50 transition-colors",
//                       isMobile ? "h-24 w-24" : "aspect-video w-full"
//                     )}
//                     onClick={() => setActiveSpeaker('seller')}
//                   >
//                     <Participant 
//                       participant={{ identity: seller.name } as any}
//                       isCameraOn={true}
//                       isMicOn={true}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
      
//       {/* Call Controls */}
//       <div className="absolute left-0 right-0 bottom-0">
//         <CallControls 
//           isMuted={isMuted}
//           isVideoOn={isVideoOn}
//           onToggleMute={handleToggleMute}
//           onToggleVideo={handleToggleVideo}
//           onEndCall={handleEndCall}
//           onInviteDelivery={!isSeller && !deliveryAgent ? handleInviteDelivery : undefined}
//           showInviteDelivery={!isSeller && !deliveryAgent}
//           isMobile={isMobile}
//         />
//       </div>
      
//       {/* Action buttons */}
//       <div className={cn(
//         "absolute left-0 right-0 bottom-20 flex justify-center gap-2",
//         isMobile ? "pb-4" : "pb-2"
//       )}>
//         {!isSeller && !deliveryAgent && (
//           <Button
//             variant="outline" 
//             size="sm"
//             className="bg-primary/20 border-none"
//             onClick={handleInviteDelivery}
//           >
//             <Truck size={16} className="text-primary mr-2" />
//             Invite Delivery
//           </Button>
//         )}
        
//         {!isSeller && deliveryAgent && (
//           <Button
//             variant="outline" 
//             size="sm"
//             className="bg-market-green/20 border-none"
//             onClick={() => setDeliveryEscrowModalOpen(true)}
//           >
//             <DollarSign size={16} className="text-market-green mr-2" />
//             Pay for Delivery
//           </Button>
//         )}
        
//         {isSeller && (
//           <Button
//             variant="outline" 
//             size="sm"
//             className="bg-market-green/20 border-none"
//             onClick={() => setEscrowModalOpen(true)}
//           >
//             <DollarSign size={16} className="text-market-green mr-2" />
//             Request Payment
//           </Button>
//         )}
//       </div>
      
//       {/* Modals */}
//       {isSeller && (
//         <EscrowRequestModal 
//           open={escrowModalOpen}
//           onOpenChange={setEscrowModalOpen}
//           sellerName={seller.name}
//           onSuccess={handlePaymentRequest}
//         />
//       )}
      
//       {/* Delivery Order Sheet (for collecting address info) */}
//       <DeliveryOrderSheet
//         open={deliveryOrderSheetOpen}
//         onOpenChange={setDeliveryOrderSheetOpen}
//         sellerLocation={seller.location}
//         onSubmit={handleDeliveryOrderSubmit}
//       />
      
//       {/* Invite Delivery Modal (for selecting a delivery agent) */}
//       <InviteDeliveryModal
//         open={inviteDeliveryModalOpen}
//         onOpenChange={setInviteDeliveryModalOpen}
//         onSelect={handleDeliveryAgentSelected}
//       />
      
//       {/* Delivery Escrow Modal */}
//       {deliveryAgent && (
//         <DeliveryEscrowModal
//           open={deliveryEscrowModalOpen}
//           onOpenChange={setDeliveryEscrowModalOpen}
//           deliveryAgent={deliveryAgent}
//           onSuccess={handleDeliveryPaymentRequest}
//         />
//       )}
//     </div>
//   );
// };

// export default LiveCall;

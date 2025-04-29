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
import { cn, formatDuration, getInitials } from '@/lib/utils';

const LiveCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { seller } = location.state as { seller: Seller };
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [deliveryEscrowModalOpen, setDeliveryEscrowModalOpen] = useState(false);
  const [inviteDeliveryModalOpen, setInviteDeliveryModalOpen] = useState(false);
  const [deliveryOrderSheetOpen, setDeliveryOrderSheetOpen] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
  const [isSeller] = useState(() => {
    // In a real app, this would check the current user's role
    // For demo purposes, we'll use 50% chance of being a seller
    return Math.random() > 0.5;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('seller'); // 'seller' or 'delivery'

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
  

  const handleEndCall = () => {
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

  const handleDeliveryOrderSubmit = (orderDetails) => {
    setDeliveryOrderSheetOpen(false);
    // Now open the invite delivery modal with the order details
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Call Header */}
      <div className="glass-morphism py-3 px-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <span className="font-medium">
            {deliveryAgent ? '2 participants' : '1 participant'}
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
            "flex-1 flex flex-col items-center justify-center p-4",
            isMobile ? "pb-20" : "pb-24"
          )}
        >
          {!deliveryAgent ? (
            // Single participant layout
            <div className="relative max-w-lg w-full h-full flex flex-col items-center justify-center">
              <div className="aspect-video w-full max-h-[70vh] relative rounded-xl overflow-hidden bg-secondary/30 border-2 border-market-orange/50 flex items-center justify-center">
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-bold text-muted-foreground">
                    {getInitials(seller.name)}
                  </div>
                )}
                
                {/* Video controls indicator */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {isMuted && (
                    <div className="bg-background/80 rounded-full p-1">
                      <MicOff size={16} className="text-market-orange" />
                    </div>
                  )}
                  {!isVideoOn && (
                    <div className="bg-background/80 rounded-full p-1">
                      <VideoOff size={16} className="text-market-orange" />
                    </div>
                  )}
                </div>
                
                {/* Name tag */}
                <div className="absolute bottom-3 right-3 glass-morphism px-3 py-1 rounded-full text-sm">
                  {seller.name}
                </div>
              </div>
            </div>
          ) : (
            // Multiple participants layout
            <div className="w-full h-full flex flex-col md:flex-row gap-4">
              {/* Main active speaker */}
              <div className="flex-1 relative">
                <div className="aspect-video w-full h-full max-h-[60vh] md:max-h-none relative rounded-xl overflow-hidden bg-secondary/30 border-2 border-market-orange/50 flex items-center justify-center">
                  {activeSpeaker === 'seller' ? (
                    seller.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl font-bold text-muted-foreground">
                        {getInitials(seller.name)}
                      </div>
                    )
                  ) : (
                    deliveryAgent.avatar ? (
                      <img
                        src={deliveryAgent.avatar}
                        alt={deliveryAgent.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl font-bold text-muted-foreground">
                        {getInitials(deliveryAgent.name)}
                      </div>
                    )
                  )}
                  
                  {/* Video controls indicator */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {isMuted && (
                      <div className="bg-background/80 rounded-full p-1">
                        <MicOff size={16} className="text-market-orange" />
                      </div>
                    )}
                    {!isVideoOn && (
                      <div className="bg-background/80 rounded-full p-1">
                        <VideoOff size={16} className="text-market-orange" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name tag */}
                  <div className="absolute bottom-3 right-3 glass-morphism px-3 py-1 rounded-full text-sm">
                    {activeSpeaker === 'seller' ? seller.name : `${deliveryAgent.name} (Delivery)`}
                  </div>
                </div>
              </div>
              
              {/* Thumbnail strip (vertical on mobile, horizontal on desktop) */}
              <div className={cn(
                "flex gap-2",
                isMobile ? "flex-row justify-center" : "flex-col justify-start w-1/4"
              )}>
                {/* Inactive participant thumbnail */}
                <div 
                  className={cn(
                    "relative rounded-lg overflow-hidden bg-secondary/30 border-2 cursor-pointer hover:border-primary/50 transition-colors",
                    activeSpeaker === 'seller' ? "border-muted" : "border-market-orange/50",
                    isMobile ? "h-24 w-24" : "aspect-video w-full"
                  )}
                  onClick={() => setActiveSpeaker(activeSpeaker === 'seller' ? 'delivery' : 'seller')}
                >
                  {activeSpeaker !== 'seller' ? (
                    seller.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                        {getInitials(seller.name)}
                      </div>
                    )
                  ) : (
                    deliveryAgent.avatar ? (
                      <img
                        src={deliveryAgent.avatar}
                        alt={deliveryAgent.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                        {getInitials(deliveryAgent.name)}
                      </div>
                    )
                  )}
                  
                  {/* Small name tag */}
                  <div className="absolute bottom-1 right-1 left-1 glass-morphism px-1 py-0.5 rounded text-xs text-center truncate">
                    {activeSpeaker !== 'seller' ? seller.name : `${deliveryAgent.name}`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Call Controls */}
      <div className={cn(
        "glass-morphism p-3 flex justify-center items-center space-x-2 md:space-x-4 absolute left-0 right-0 bottom-0",
        isMobile ? "pb-safe" : ""
      )}>
        <Button
          variant="outline" 
          size={isMobile ? "default" : "icon"}
          className={cn(
            "bg-secondary border-none",
            isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
          )}
          onClick={() => {
            setIsMuted(!isMuted);
            toast.success(isMuted ? "Microphone unmuted" : "Microphone muted");
          }}
        >
          {isMuted ? (
            <MicOff size={isMobile ? 20 : 24} className="text-market-orange" />
          ) : (
            <Mic size={isMobile ? 20 : 24} className="text-foreground" />
          )}
        </Button>
        
        <Button
          variant="outline" 
          size={isMobile ? "default" : "icon"}
          className={cn(
            "bg-secondary border-none",
            isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
          )}
          onClick={() => {
            setIsVideoOn(!isVideoOn);
            toast.success(isVideoOn ? "Camera turned off" : "Camera turned on");
          }}
        >
          {isVideoOn ? (
            <Video size={isMobile ? 20 : 24} className="text-foreground" />
          ) : (
            <VideoOff size={isMobile ? 20 : 24} className="text-market-orange" />
          )}
        </Button>
        
        {!isSeller && !deliveryAgent && (
          <Button
            variant="outline" 
            size={isMobile ? "default" : "icon"}
            className={cn(
              "bg-primary/20 border-none",
              isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
            )}
            onClick={handleInviteDelivery}
          >
            <Truck size={isMobile ? 20 : 24} className="text-primary" />
          </Button>
        )}
        
        {!isSeller && deliveryAgent && (
          <Button
            variant="outline" 
            size={isMobile ? "default" : "icon"}
            className={cn(
              "bg-market-green/20 border-none",
              isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
            )}
            onClick={() => setDeliveryEscrowModalOpen(true)}
          >
            <DollarSign size={isMobile ? 20 : 24} className="text-market-green" />
          </Button>
        )}
        
        {isSeller && (
          <Button
            variant="outline" 
            size={isMobile ? "default" : "icon"}
            className={cn(
              "bg-market-green/20 border-none",
              isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
            )}
            onClick={() => setEscrowModalOpen(true)}
          >
            <DollarSign size={isMobile ? 20 : 24} className="text-market-green" />
          </Button>
        )}
        
        <Button
          variant="destructive" 
          size={isMobile ? "default" : "icon"}
          className={cn(
            "bg-destructive border-none",
            isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
          )}
          onClick={handleEndCall}
        >
          <PhoneCall size={isMobile ? 20 : 24} className="rotate-[135deg]" />
        </Button>
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
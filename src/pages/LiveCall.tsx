
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Seller } from '@/types';
import { toast } from 'sonner';

const LiveCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { seller } = location.state as { seller: Seller };
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Simulate call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigate('/rating', { state: { seller, callDuration } });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      {/* Call Video/Avatar Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-bold mb-8 text-gradient">
          In call with {seller.name}
        </h1>
        
        <div className="relative mb-8">
          <div className="h-48 w-48 rounded-full overflow-hidden bg-secondary/30 border-4 border-market-orange/50 flex items-center justify-center">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-5xl font-bold text-muted-foreground">
                {getInitials(seller.name)}
              </div>
            )}
          </div>
          <div className="absolute bottom-2 right-2 glass-morphism px-2 py-1 rounded-full text-xs">
            {formatDuration(callDuration)}
          </div>
        </div>
        
        <div className="w-full max-w-xs text-center">
          <h2 className="text-xl font-medium">{seller.name}</h2>
          <p className="text-muted-foreground text-sm">{seller.description}</p>
        </div>
      </div>
      
      {/* Call Controls */}
      <div className="glass-morphism p-6 flex justify-center space-x-4">
        <Button
          variant="outline" 
          size="icon"
          className="h-14 w-14 rounded-full bg-secondary border-none"
          onClick={() => {
            setIsMuted(!isMuted);
            toast.success(isMuted ? "Microphone unmuted" : "Microphone muted");
          }}
        >
          {isMuted ? (
            <MicOff size={24} className="text-market-orange" />
          ) : (
            <Mic size={24} className="text-foreground" />
          )}
        </Button>
        
        <Button
          variant="outline" 
          size="icon"
          className="h-14 w-14 rounded-full bg-secondary border-none"
          onClick={() => {
            setIsVideoOn(!isVideoOn);
            toast.success(isVideoOn ? "Camera turned off" : "Camera turned on");
          }}
        >
          <Video 
            size={24} 
            className={isVideoOn ? "text-foreground" : "text-market-orange"} 
          />
        </Button>
        
        <Button
          variant="destructive" 
          size="icon"
          className="h-14 w-14 rounded-full bg-destructive border-none"
          onClick={handleEndCall}
        >
          <PhoneCall size={24} className="rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
};

export default LiveCall;

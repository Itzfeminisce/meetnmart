
import { useState, useEffect } from 'react';
import { Room, LocalParticipant, RemoteParticipant, Track, TrackPublication, ConnectionState } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, VideoOff, Mic, MicOff, PhoneCall } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Participant Component
interface ParticipantProps {
  participant: LocalParticipant | RemoteParticipant;
  isSpeaking?: boolean;
  isCameraOn?: boolean;
  isMicOn?: boolean;
  isLocal?: boolean;
  large?: boolean;
}

export const Participant = ({ 
  participant, 
  isSpeaking = false, 
  isCameraOn = false, 
  isMicOn = true,
  isLocal = false,
  large = false 
}: ParticipantProps) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const name = participant.identity || 'Unknown';
  
  useEffect(() => {
    if (!videoElement) return;
    
    // In a real implementation, you would attach the video track to the video element
    // This would use LiveKit's APIs to get and attach the track
    
    // For demonstration purposes, we're just showing a placeholder
    
    return () => {
      // Cleanup
    };
  }, [participant, videoElement]);

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden bg-secondary/30",
        large ? "w-full h-full" : "w-full max-w-[180px]",
        isSpeaking ? "ring-2 ring-primary" : ""
      )}
    >
      {isCameraOn ? (
        <video
          ref={setVideoElement}
          autoPlay
          playsInline
          muted={isLocal}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-muted">
          <Avatar className={large ? "h-24 w-24" : "h-12 w-12"}>
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex gap-1">
        {!isMicOn && (
          <div className="bg-background/80 rounded-full p-1">
            <MicOff size={large ? 16 : 12} className="text-destructive" />
          </div>
        )}
      </div>
      
      {/* Name tag */}
      <div className="absolute bottom-2 right-2 bg-background/60 px-2 py-1 rounded-full text-xs">
        {name} {isLocal && "(You)"}
      </div>
    </div>
  );
};

// Call Controls
interface CallControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onInviteDelivery?: () => void;
  showInviteDelivery?: boolean;
  isMobile?: boolean;
}

export const CallControls = ({
  isMuted,
  isVideoOn,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  onInviteDelivery,
  showInviteDelivery = false,
  isMobile = false
}: CallControlsProps) => {
  return (
    <div className={cn(
      "glass-morphism p-3 flex justify-center items-center space-x-2 md:space-x-4",
      isMobile ? "pb-safe" : ""
    )}>
      <Button
        variant="outline" 
        size={isMobile ? "default" : "icon"}
        className={cn(
          "bg-secondary border-none",
          isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
        )}
        onClick={onToggleMute}
      >
        {isMuted ? (
          <MicOff size={isMobile ? 20 : 24} className="text-destructive" />
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
        onClick={onToggleVideo}
      >
        {isVideoOn ? (
          <Video size={isMobile ? 20 : 24} className="text-foreground" />
        ) : (
          <VideoOff size={isMobile ? 20 : 24} className="text-destructive" />
        )}
      </Button>
      
      {/* Additional controls can go here */}
      
      <Button
        variant="destructive" 
        size={isMobile ? "default" : "icon"}
        className={cn(
          "bg-destructive border-none",
          isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
        )}
        onClick={onEndCall}
      >
        <PhoneCall size={isMobile ? 20 : 24} className="rotate-[135deg]" />
      </Button>
    </div>
  );
};

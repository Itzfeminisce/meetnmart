
import { useState, useEffect, useRef } from 'react';
import { Room, LocalParticipant, RemoteParticipant, Track, TrackPublication, ConnectionState } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, VideoOff, Mic, MicOff, PhoneCall, Truck, DollarSign, BanknoteIcon } from 'lucide-react';
import { getInitials } from '@/lib/utils';
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
  isCameraOn,
  isMicOn = true,
  isLocal = false,
  large = false
}: ParticipantProps) => {

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTrack, setVideoTrack] = useState<Track | null>(null);
  const [hasVideo, setHasVideo] = useState<boolean>(false);

  const name = participant.identity || 'Unknown';

  // Find and monitor video tracks
  useEffect(() => {
    // Function to find active video track
    const findVideoTrack = () => {
      if (!participant) return null;

      // Get video publications regardless of participant type
      const publications = Array.from(participant.videoTrackPublications.values());

      console.log("{publications}", publications);


      // Search for first active track
      for (const publication of publications) {
        if (publication.track) {
          setHasVideo(true);
          return publication.track;
        }
      }

      setHasVideo(false);
      return null;
    };

    // Set initial video track
    const track = findVideoTrack();
    setVideoTrack(track);

    // Set up track subscribed/unsubscribed listeners
    const handleTrackSubscribed = (track: Track) => {
      if (track.kind === Track.Kind.Video) {
        setVideoTrack(track);
        setHasVideo(true);
      }
    };

    const handleTrackUnsubscribed = (track: Track) => {
      if (track.kind === Track.Kind.Video && videoTrack === track) {
        setVideoTrack(null);
        setHasVideo(false);
      }
    };

    const handleTrackMuted = (publication: TrackPublication) => {
      if (publication.kind === Track.Kind.Video && publication.track === videoTrack) {
        setHasVideo(false);
      }
    };

    const handleTrackUnmuted = (publication: TrackPublication) => {
      if (publication.kind === Track.Kind.Video && publication.track) {
        setVideoTrack(publication.track);
        setHasVideo(true);
      }
    };

    // Add event listeners
    if ('on' in participant) {
      participant.on('trackSubscribed', handleTrackSubscribed);
      participant.on('trackUnsubscribed', handleTrackUnsubscribed);
      participant.on('trackMuted', handleTrackMuted);
      participant.on('trackUnmuted', handleTrackUnmuted);
    }

    // Clean up event listeners
    return () => {
      if ('off' in participant) {
        participant.off('trackSubscribed', handleTrackSubscribed);
        participant.off('trackUnsubscribed', handleTrackUnsubscribed);
        participant.off('trackMuted', handleTrackMuted);
        participant.off('trackUnmuted', handleTrackUnmuted);
      }
    };
  }, [participant]);

  // Attach or detach video track when it changes
  useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach(videoRef.current);
      };
    }
  }, [videoTrack, videoRef.current]);

  // Attach audio tracks
  useEffect(() => {
    if (!participant) return;

    // Function to find active audio track
    const findAudioTrack = () => {
      const publications = Array.from(participant.audioTrackPublications.values());
      for (const publication of publications) {
        if (publication.track && !publication.isMuted) {
          return publication.track;
        }
      }
      return null;
    };

    const audioTrack = findAudioTrack();

    if (audioTrack && !isLocal) {
      audioTrack.attach();
    }

    // Set up audio track subscribed/unsubscribed listeners
    const handleAudioTrackSubscribed = (track) => {
      if (track.kind === Track.Kind.Audio && !isLocal) {
        track.attach();
      }
    };

    const handleAudioTrackUnsubscribed = (track) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach();
      }
    };

    // Add event listeners
    if ('on' in participant) {
      participant.on('trackSubscribed', handleAudioTrackSubscribed);
      participant.on('trackUnsubscribed', handleAudioTrackUnsubscribed);
    }

    // Clean up
    return () => {
      if (audioTrack && !isLocal) {
        audioTrack.detach();
      }

      if ('off' in participant) {
        participant.off('trackSubscribed', handleAudioTrackSubscribed);
        participant.off('trackUnsubscribed', handleAudioTrackUnsubscribed);
      }
    };
  }, [participant, isLocal]);

  // Determine if camera is on based on props or track state
  const showVideo = isCameraOn !== undefined ? isCameraOn : hasVideo;

  return (
    <div
    className={cn(
      "relative overflow-hidden transition-all duration-300 w-full h-full",
      isSpeaking ? "ring-2 ring-primary shadow-lg" : "",
      showVideo ? "bg-black" : "bg-slate-900"
    )}
  >
    {showVideo ? (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="h-full w-full flex items-center justify-center bg-slate-800">
        <Avatar className={cn(
          "flex items-center justify-center text-center font-medium",
          large ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl"
        )}>
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
    )}

    {/* Status indicators */}
    <div className="absolute top-2 right-2 flex gap-1.5">
      {!isMicOn && (
        <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm shadow-sm">
          <MicOff size={large ? 16 : 14} className="text-destructive" />
        </div>
      )}
      {!showVideo && (
        <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm shadow-sm">
          <VideoOff size={large ? 16 : 14} className="text-muted-foreground" />
        </div>
      )}
    </div>

    {/* Name tag */}
    <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-black/70 text-xs font-medium backdrop-blur-sm truncate text-white">
      {name} {isLocal && "(You)"}
    </div>
  </div>
    // <div
    //   className={cn(
    //     "relative rounded-lg overflow-hidden transition-all duration-300 aspect-video w-full h-full",
    //     large ? "w-full h-full" : "w-full aspect-video max-w-[180px]",
    //     isSpeaking ? "ring-2 ring-primary shadow-lg" : "",
    //     showVideo ? "bg-black" : "bg-slate-100 dark:bg-slate-800"
    //   )}
    // >
    //   {showVideo ? (
    //     <video
    //     ref={videoRef}
    //     autoPlay
    //     playsInline
    //     muted={isLocal}
    //     className="h-full w-full object-cover"
    //   />
    //   ) : (
    //     <div className="h-full w-full flex items-center justify-center bg-slate-800">
    //       <Avatar className={cn(
    //         "flex items-center justify-center text-center font-medium",
    //         large ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl"
    //       )}>
    //         <AvatarFallback className="bg-primary/10 text-primary">
    //           {getInitials(name)}
    //         </AvatarFallback>
    //       </Avatar>
    //     </div>
    //   )}

    //   {/* Status indicators */}
    //   <div className="absolute top-2 right-2 flex gap-1.5">
    //     {!isMicOn && (
    //       <div className="bg-background/80 rounded-full p-1.5 backdrop-blur-sm shadow-sm">
    //         <MicOff size={large ? 16 : 14} className="text-destructive" />
    //       </div>
    //     )}
    //     {!showVideo && (
    //       <div className="bg-background/80 rounded-full p-1.5 backdrop-blur-sm shadow-sm">
    //         <VideoOff size={large ? 16 : 14} className="text-muted-foreground" />
    //       </div>
    //     )}
    //   </div>

    //   {/* Name tag */}
    //   <div className="absolute inset-x-0 bottom-0 px-2 bg-background/90 text-xs font-medium backdrop-blur-sm truncate">
    //     {name} {isLocal && "(You)"}
    //   </div>
    // </div>
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
  onPaymentRequest?: () => void;
  showInviteDelivery?: boolean;
  showRequestPayment?: boolean;
  isMobile?: boolean;
}
export const CallControls = ({
  isMuted,
  isVideoOn,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  onInviteDelivery,
  onPaymentRequest,
  showRequestPayment = false,
  showInviteDelivery = false,
  isMobile = false
}: CallControlsProps) => {
  return (
    <div className={cn(
      "glass-morphism-dark p-3 flex justify-center items-center space-x-2 md:space-x-4 mx-auto max-w-md rounded-full backdrop-blur-md",
      isMobile ? "pb-safe mb-4" : "mb-6"
    )}>
      <Button type='button'
        variant="outline"
        size={isMobile ? "default" : "icon"}
        className={cn(
          "bg-black/50 border-none hover:bg-white/20",
          isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
        )}
        onClick={onToggleMute}
      >
        {isMuted ? (
          <MicOff size={isMobile ? 20 : 24} className="text-destructive" />
        ) : (
          <Mic size={isMobile ? 20 : 24} className="text-white" />
        )}
      </Button>

      <Button type='button'
        variant="outline"
        size={isMobile ? "default" : "icon"}
        className={cn(
          "bg-black/50 border-none hover:bg-white/20",
          isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
        )}
        onClick={onToggleVideo}
      >
        {isVideoOn ? (
          <Video size={isMobile ? 20 : 24} className="text-white" />
        ) : (
          <VideoOff size={isMobile ? 20 : 24} className="text-destructive" />
        )}
      </Button>

      {showInviteDelivery && onInviteDelivery && (
        <Button type='button'
          title='Request Delivery'
          variant="outline"
          size={isMobile ? "default" : "icon"}
          className={cn(
            "bg-black/50 border-none hover:bg-white/20",
            isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
          )}
          onClick={onInviteDelivery}
        >
          <Truck size={isMobile ? 20 : 24} className="text-white" />
        </Button>
      )}

      {showRequestPayment && onPaymentRequest && (
        <Button type='button'
          title='Request Payment'
          variant="outline"
          size={isMobile ? "default" : "icon"}
          className={cn(
            "bg-black/50 border-none hover:bg-white/20",
            isMobile ? "rounded-full h-12 w-12 p-0" : "rounded-full h-14 w-14"
          )}
          onClick={onPaymentRequest}
        >
          <BanknoteIcon size={isMobile ? 20 : 24} className="text-market-green" />
        </Button>
      )}

      <Button type='button'
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

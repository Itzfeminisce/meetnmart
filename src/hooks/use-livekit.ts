import { useState, useEffect, useCallback } from 'react';
import { Room, LocalParticipant, RemoteParticipant, Participant, ConnectionState } from 'livekit-client';
import {livekitService} from '@/services/livekit-service';
import {LiveKitEventHandler} from '@/services/livekit-event-handlers';
import { toast } from 'sonner';

interface UseLiveKitOptions {
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onActiveSpeakerChanged?: (speakers: Participant[]) => void;
  onConnectionStateChanged?: (state: ConnectionState) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

function useLiveKit(options: UseLiveKitOptions = {}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [activeSpeakers, setActiveSpeakers] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [eventHandler, setEventHandler] = useState<LiveKitEventHandler | null>(null);

  // Connect to room
  const connect = useCallback(async (
    roomName: string, 
    participantName: string, 
    token?: string
  ) => {
    if (isConnecting) return null;
    
    setIsConnecting(true);
    try {
      const newRoom = await livekitService.connectToRoom(roomName, participantName, token);
      
      setRoom(newRoom);
      setLocalParticipant(newRoom.localParticipant);
      setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
      setIsConnected(newRoom.state === ConnectionState.Connected);
      setConnectionState(newRoom.state);
      
      // Set up the event handler
      const handler = new LiveKitEventHandler(newRoom, {
        onParticipantConnected: (participant) => {
          setRemoteParticipants(prev => [...prev, participant]);
          options.onParticipantConnected?.(participant);
        },
        
        onParticipantDisconnected: (participant) => {
          setRemoteParticipants(prev => prev.filter(p => p.sid !== participant.sid));
          options.onParticipantDisconnected?.(participant);
        },
        
        onActiveSpeakerChanged: (speakers) => {
          setActiveSpeakers(speakers);
          options.onActiveSpeakerChanged?.(speakers);
        },
        
        onDisconnected: () => {
          setIsConnected(false);
          setConnectionState(ConnectionState.Disconnected);
          options.onDisconnected?.();
        },
        
        onError: (error) => {
          console.error('LiveKit error:', error);
          toast.error(`Call error: ${error.message}`);
          options.onError?.(error);
        }
      });
      
      setEventHandler(handler);
      setIsConnecting(false);
      return newRoom;
    } catch (error) {
      console.error('Error connecting to room:', error);
      setIsConnecting(false);
      options.onError?.(error as Error);
      return null;
    }
  }, [isConnecting, options]);

  // Disconnect from room
  const disconnect = useCallback(async () => {
    if (eventHandler) {
      eventHandler.detach();
      setEventHandler(null);
    }
    
    if (room) {
      await room.disconnect();
      setRoom(null);
      setLocalParticipant(null);
      setRemoteParticipants([]);
      setActiveSpeakers([]);
      setIsConnected(false);
      setConnectionState(ConnectionState.Disconnected);
    }
  }, [room, eventHandler]);

  // Media control functions
  const toggleMicrophone = useCallback(async (enabled?: boolean) => {
    if (!localParticipant) return false;
    
    const targetState = enabled !== undefined ? enabled : !localParticipant.isMicrophoneEnabled;
    
    try {
      await localParticipant.setMicrophoneEnabled(targetState);
      return targetState;
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error('Failed to toggle microphone');
      return localParticipant.isMicrophoneEnabled;
    }
  }, [localParticipant]);
  
  const toggleCamera = useCallback(async (enabled?: boolean) => {
    if (!localParticipant) return false;
    
    const targetState = enabled !== undefined ? enabled : !localParticipant.isCameraEnabled;
    
    try {
      await localParticipant.setCameraEnabled(targetState);
      return targetState;
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast.error('Failed to toggle camera');
      return localParticipant.isCameraEnabled;
    }
  }, [localParticipant]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (eventHandler) {
        eventHandler.detach();
      }
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  return {
    room,
    localParticipant,
    remoteParticipants,
    activeSpeakers,
    isConnecting,
    isConnected,
    connectionState,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera
  };
}

export {useLiveKit};
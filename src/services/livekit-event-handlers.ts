import { Room, RoomEvent, RemoteParticipant, Participant, ParticipantEvent, TrackPublication, Track } from 'livekit-client';

export interface LiveKitEventHandlerOptions {
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onActiveSpeakerChanged?: (speakers: Participant[]) => void;
  onLocalTrackPublished?: (publication: TrackPublication) => void;
  onLocalTrackUnpublished?: (publication: TrackPublication) => void;
  onRemoteTrackSubscribed?: (track: Track, publication: TrackPublication, participant: RemoteParticipant) => void;
  onRemoteTrackUnsubscribed?: (track: Track, publication: TrackPublication, participant: RemoteParticipant) => void;
  onTrackMuted?: (publication: TrackPublication, participant: Participant) => void;
  onTrackUnmuted?: (publication: TrackPublication, participant: Participant) => void;
  onDisconnected?: () => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onError?: (error: Error) => void;
}

class LiveKitEventHandler {
  private room: Room;
  private options: LiveKitEventHandlerOptions;

  constructor(room: Room, options: LiveKitEventHandlerOptions = {}) {
    this.room = room;
    this.options = options;
    this.attachRoomListeners();
    this.attachParticipantListeners(room.localParticipant);
    
    // Attach listeners to any existing remote participants
    room.remoteParticipants.forEach(participant => {
      this.attachParticipantListeners(participant);
    });
  }

  private attachRoomListeners() {
    // Room connection events
    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Room disconnected');
      this.options.onDisconnected?.();
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      console.log('Room reconnecting');
      this.options.onReconnecting?.();
    });

    this.room.on(RoomEvent.Reconnected, () => {
      console.log('Room reconnected');
      this.options.onReconnected?.();
    });

    // Participant events
    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('Participant connected:', participant.identity);
      this.attachParticipantListeners(participant);
      this.options.onParticipantConnected?.(participant);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('Participant disconnected:', participant.identity);
      this.options.onParticipantDisconnected?.(participant);
    });

    // Active speaker detection
    this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      console.log('Active speakers changed:', speakers.map(s => s.identity));
      this.options.onActiveSpeakerChanged?.(speakers);
    });

    // Error handling
    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log('Connection state changed:', state);
    });

    this.room.on(RoomEvent.MediaDevicesError, (error: Error) => {
      console.error('Media devices error:', error);
      this.options.onError?.(error);
    });
  }

  private attachParticipantListeners(participant: Participant) {
    // Track publication events
    participant.on(ParticipantEvent.TrackPublished, (publication: TrackPublication) => {
      console.log(`${participant.identity} published track:`, publication.trackSid);
      
      if (participant === this.room.localParticipant) {
        this.options.onLocalTrackPublished?.(publication);
      }
    });

    participant.on(ParticipantEvent.TrackUnpublished, (publication: TrackPublication) => {
      console.log(`${participant.identity} unpublished track:`, publication.trackSid);
      
      if (participant === this.room.localParticipant) {
        this.options.onLocalTrackUnpublished?.(publication);
      }
    });

    // For remote participants, handle subscription events
    if (participant instanceof RemoteParticipant) {
      participant.on(ParticipantEvent.TrackSubscribed, (track: Track, publication: TrackPublication) => {
        console.log(`Subscribed to ${participant.identity}'s track:`, publication.trackSid);
        this.options.onRemoteTrackSubscribed?.(track, publication, participant);
      });

      participant.on(ParticipantEvent.TrackUnsubscribed, (track: Track, publication: TrackPublication) => {
        console.log(`Unsubscribed from ${participant.identity}'s track:`, publication.trackSid);
        this.options.onRemoteTrackUnsubscribed?.(track, publication, participant);
      });
    }

    // Track mute/unmute events
    participant.on(ParticipantEvent.TrackMuted, (publication: TrackPublication) => {
      console.log(`${participant.identity} muted track:`, publication.trackSid);
      this.options.onTrackMuted?.(publication, participant);
    });

    participant.on(ParticipantEvent.TrackUnmuted, (publication: TrackPublication) => {
      console.log(`${participant.identity} unmuted track:`, publication.trackSid);
      this.options.onTrackUnmuted?.(publication, participant);
    });

    // Connection quality monitoring
    participant.on(ParticipantEvent.ConnectionQualityChanged, (quality) => {
      console.log(`${participant.identity}'s connection quality:`, quality);
    });
  }

  public detach() {
    // Remove all event listeners
    this.room.removeAllListeners();
    this.room.localParticipant.removeAllListeners();
    this.room.remoteParticipants.forEach(participant => {
      participant.removeAllListeners();
    });
  }
}

export {LiveKitEventHandler};
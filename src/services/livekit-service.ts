import {
    Room,
    RoomOptions,
    LocalParticipant,
    VideoPresets,
    ConnectionState,
    ConnectionQuality,
    DisconnectReason,
    AudioPresets
} from 'livekit-client';
import { useAxios } from '@/lib/axiosUtils';

const axiosUtils = useAxios()

interface RoomConnectionOptions {
    audioEnabled?: boolean;
    videoEnabled?: boolean;
    simulcast?: boolean;
    adaptiveStream?: boolean;
    dynacast?: boolean;
}

class LiveKitService {
    private apiUrl: string;
    private activeRoom: Room | null = null;

    constructor() {
        // The actual API URL should come from your environment variables
        this.apiUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://your-livekit-server.com';
    }

    /**
     * Connect to a LiveKit room
     * 
     * @param roomName - Name of the room to join
     * @param participantName - Display name of the participant
     * @param token - JWT token (if already obtained)
     * @param options - Connection options
     * @returns Connected Room instance
     */
    async connectToRoom(
        roomName: string,
        participantName: string,
        token?: string,
        options: RoomConnectionOptions = {}
    ): Promise<Room> {
        try {
            // If we already have a room connection, disconnect first
            if (this.activeRoom) {
                await this.activeRoom.disconnect(true);
                this.activeRoom = null;
            }

            // If no token is provided, fetch one from your backend
            if (!token) {
                token = await this.getToken(roomName, participantName);
            }

            // Configure room options
            const roomOptions: RoomOptions = {
                adaptiveStream: options.adaptiveStream !== false,
                dynacast: options.dynacast !== false,
                publishDefaults: {
                    simulcast: options.simulcast !== false,
                    videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h540, VideoPresets.h216],
                    videoCodec: 'vp8',
                    dtx: true,
                    audioPreset: AudioPresets.music,
                    stopMicTrackOnMute: true
                },
                videoCaptureDefaults: {
                    resolution: VideoPresets.h720
                }
            };

            // Connect to the room
            console.log(`Connecting to LiveKit room: ${roomName}`);
            const room = new Room(roomOptions);

            await room.connect(this.apiUrl, token);
            console.log('Connected to room:', room.name);

            // Configure initial media settings
            const localParticipant = room.localParticipant;

            // Enable/disable initial media based on options
            await this.configureInitialMedia(localParticipant, options);

            this.activeRoom = room;
            return room;
        } catch (error) {
            console.error('Error connecting to LiveKit room:', error);
            throw error;
        }
    }

    /**
     * Configure initial media devices for the participant
     */
    private async configureInitialMedia(
        localParticipant: LocalParticipant,
        options: RoomConnectionOptions
    ) {
        try {
            // Default both to true unless explicitly set to false
            const shouldEnableAudio = options.audioEnabled !== false;
            const shouldEnableVideo = options.videoEnabled !== false;

            // Configure audio
            if (shouldEnableAudio) {
                await localParticipant.setMicrophoneEnabled(true);
            } else {
                await localParticipant.setMicrophoneEnabled(false);
            }

            // Configure video
            if (shouldEnableVideo) {
                await localParticipant.setCameraEnabled(true);
            } else {
                await localParticipant.setCameraEnabled(false);
            }
        } catch (error) {
            console.error('Error configuring media:', error);
        }
    }

    /**
     * Get a token from your backend service
     * This is a placeholder - implement the actual API call to your token server
     */
    private async getToken(roomName: string, participantName: string): Promise<string> {
        try {
            const response = await axiosUtils.Post<{ data: string }>("/api/livekit/token", { roomName, participantName })

            return response.data
        } catch (error) {
            console.error('Error getting token:', error);
            throw new Error('Failed to obtain LiveKit access token');
        }
    }

    /**
     * Disconnect from the current room
     */
    async disconnect(): Promise<void> {
        if (this.activeRoom) {
            await this.activeRoom.disconnect(true);
            this.activeRoom = null;
        }
    }

    /**
     * Get the currently active room
     */
    getActiveRoom(): Room | null {
        return this.activeRoom;
    }

    /**
     * Check connection state
     */
    isConnected(): boolean {
        return this.activeRoom?.state === ConnectionState.Connected;
    }

    /**
     * Get current connection quality
     */
    getConnectionQuality(): ConnectionQuality | null {
        return this.activeRoom?.localParticipant.connectionQuality || null;
    }

    /**
     * Refresh camera and microphone devices
     */
    async refreshDevices(): Promise<void> {
        if (!this.activeRoom || !this.activeRoom.localParticipant) return;

        try {
            await this.activeRoom.localParticipant.restartAudioTrack();
            await this.activeRoom.localParticipant.restartVideoTrack();
        } catch (error) {
            console.error('Error refreshing media devices:', error);
            throw error;
        }
    }
}

// Export as singleton
const livekitService = new LiveKitService();
export { livekitService };

import { Room, RoomEvent, RemoteParticipant, LocalParticipant, RemoteTrackPublication, ConnectionState } from 'livekit-client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAxios } from '@/lib/axiosUtils';


const axiosUtils = useAxios()

// This would normally be retrieved from an environment variable or server
const LIVEKIT_URL = 'wss://meetnmart-0yt4w00u.livekit.cloud';

interface CreateRoomResponse {
  success: boolean;
  room?: string;
  token?: string;
  error?: string;
}

const livekitService = {
  /**
   * Get a token for connecting to a LiveKit room
   */
  async getToken(roomName: string, participantName: string, isHost: boolean = false): Promise<string | null> {
    try {
      // const { data, error } = await supabase.functions.invoke('livekit-token', {
      //   body: { roomName, participantName, isHost }
      // });

      const response = await axiosUtils.Post<{ data: string }>("/api/livekit/token", { roomName, participantName, isHost })

      return response.data
    } catch (error) {
      console.error('Error getting LiveKit token:', error);
      toast.error('Failed to get access token');
      return null;
    }
  },

  /**
   * Create a new LiveKit room
   */
  async createRoom(roomName: string): Promise<CreateRoomResponse> {
    try {
      // Here's what would happen in a real implementation:
      const { data, error } = await supabase.functions.invoke('livekit-create-room', {
        body: { roomName }
      });


      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating LiveKit room:', error);
      return {
        success: false,
        error: 'Failed to create room'
      };
    }
  },

  /**
   * Request to join a call with a seller
   */
  async requestCall(sellerId: string, buyerId: string): Promise<string | null> {
    try {
      // Generate a unique room name
      const roomName = `call_${Date.now()}_${sellerId}_${buyerId}`;

      // Create the room in LiveKit
      const roomResult = await this.createRoom(roomName);


      if (!roomResult.success) {
        throw new Error(roomResult.error || 'Failed to create room');
      }

      // In a real app, you'd store the call request in your database
      // const { error } = await supabase
      //   .from('call_requests')
      //   .insert({
      //     seller_id: sellerId,
      //     buyer_id: buyerId,
      //     room_name: roomName,
      //     status: 'pending'
      //   });

      // if (error) throw error;

      return roomName;
    } catch (error) {
      console.error('Error requesting call:', error);
      toast.error('Failed to request call');
      return null;
    }
  },

  /**
   * Accept a call request
   */
  async acceptCallRequest(roomName: string, participantName: string): Promise<boolean> {
    try {
     
      return true;
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
      return false;
    }
  },

  /**
   * Connect to a LiveKit room
   */
  async connectToRoom(roomName: string, participantName: string, isHost: boolean = false): Promise<Room | null> {
    try {
      // Get token
      const token = await this.getToken(roomName, participantName, isHost);

      if (!token) return null;

      // Create room
      const room = new Room({
        stopLocalTrackOnUnpublish: true,
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        videoCaptureDefaults: {
          resolution: { width: 640, height: 480, frameRate: 30 },
        },
        disconnectOnPageLeave: true,
      });
      

      // Connect to room
      await room.connect(LIVEKIT_URL, token, {
        autoSubscribe: true,
      });
      return room;
    } catch (error) {
      console.error('Error connecting to LiveKit room:', error);
      toast.error('Failed to connect to call');
      return null;
    }
  }
};

export default livekitService;

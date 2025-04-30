// src/livekit/room.ts
import { 
    AccessToken, 
    RoomServiceClient, 
    Room as LiveKitServerRoom 
  } from 'livekit-server-sdk';
  import { Room, RoomOptions, RoomConnectOptions, ConnectionState } from 'livekit-client';
  import { 
    LiveKitConfig, 
    MeetnMartRoom, 
    RoomMetadata, 
    RoomStatus, 
    TokenOptions, 
    UserRole 
  } from './types';
  import { SessionLogger } from './session'
  import { EventEmitter } from 'events';
  import { v4 as uuidv4 } from 'uuid';
  import colors from 'colors/safe';
  
  /**
   * Service for managing LiveKit rooms within MeetnMart
   */
  export class RoomService {
    private roomServiceClient: RoomServiceClient;
    private config: LiveKitConfig;
    private logger: SessionLogger;
    private activeRooms: Map<string, MeetnMartRoom> = new Map();
    private events: EventEmitter = new EventEmitter();
  
    constructor(config: LiveKitConfig, logger: SessionLogger) {
      this.config = config;
      this.roomServiceClient = new RoomServiceClient(
        this.config.host,
        this.config.apiKey,
        this.config.apiSecret
      );
      this.logger = logger;
      
      // Set higher limit for event listeners
      this.events.setMaxListeners(100);
  
      console.log(colors.cyan('[RoomService]'), 'Initialized with host:', colors.yellow(config.host));
    }
  
    /**
     * Create a new room on the LiveKit server
     */
    async createRoom(
      name: string = uuidv4(),
      metadata: Partial<RoomMetadata> = {},
      options: { 
        emptyTimeout?: number;
        maxParticipants?: number; 
      } = {}
    ): Promise<string> {
      try {
        console.log(colors.cyan('[RoomService]'), 'Creating room:', colors.yellow(name));
        
        const fullMetadata: RoomMetadata = {
          marketplaceId: metadata.marketplaceId || 'default',
          status: RoomStatus.CREATING,
          createdAt: Date.now(),
          ...metadata
        };
  
        // Create the room on LiveKit server
        const room = await this.roomServiceClient.createRoom({
          name,
          emptyTimeout: options.emptyTimeout || 10 * 60, // 10 minutes by default
          maxParticipants: options.maxParticipants || 10,
          metadata: JSON.stringify(fullMetadata)
        });
  
        // Update status to active
        fullMetadata.status = RoomStatus.ACTIVE;
        await this.roomServiceClient.updateRoomMetadata(name, JSON.stringify(fullMetadata));
  
        // Log room creation
        this.logger.info(name, 'Room created', { 
          marketplaceId: fullMetadata.marketplaceId,
          category: fullMetadata.category
        });
  
        console.log(colors.green('[RoomService]'), 'Room created successfully:', colors.yellow(name));
        return name;
      } catch (error) {
        console.error(colors.red('[RoomService]'), 'Failed to create room:', error);
        this.logger.error(name, 'Room creation failed', { error: (error as Error).message });
        throw error;
      }
    }
  
    /**
     * Update room metadata
     */
    async updateRoomMetadata(roomId: string, metadata: Partial<RoomMetadata>): Promise<void> {
      try {
        const room = await this.roomServiceClient.getRoom(roomId);
        if (!room) {
          throw new Error(`Room ${roomId} not found`);
        }
  
        const currentMetadata = room.metadata ? JSON.parse(room.metadata) as RoomMetadata : { status: RoomStatus.ACTIVE, createdAt: Date.now(), marketplaceId: 'default' };
        const updatedMetadata: RoomMetadata = { ...currentMetadata, ...metadata };
        
        await this.roomServiceClient.updateRoomMetadata(roomId, JSON.stringify(updatedMetadata));
        
        // Update local cache if we're tracking this room
        const activeRoom = this.activeRooms.get(roomId);
        if (activeRoom) {
          activeRoom.metadata = updatedMetadata;
        }
        
        this.logger.info(roomId, 'Room metadata updated', { metadataChanges: Object.keys(metadata) });
      } catch (error) {
        console.error(colors.red('[RoomService]'), `Failed to update room ${roomId} metadata:`, error);
        this.logger.error(roomId, 'Room metadata update failed', { error: (error as Error).message });
        throw error;
      }
    }
  
    /**
     * End a room session
     */
    async endRoom(roomId: string, reason?: string): Promise<void> {
      try {
        console.log(colors.cyan('[RoomService]'), 'Ending room:', colors.yellow(roomId));
        
        // Update metadata to ENDED before closing
        await this.updateRoomMetadata(roomId, { status: RoomStatus.ENDED });
        
        // End the room on LiveKit server
        await this.roomServiceClient.deleteRoom(roomId);
        
        // Remove from local tracking
        this.activeRooms.delete(roomId);
        
        this.logger.info(roomId, 'Room ended', { reason });
        console.log(colors.green('[RoomService]'), 'Room ended successfully:', colors.yellow(roomId));
      } catch (error) {
        console.error(colors.red('[RoomService]'), `Failed to end room ${roomId}:`, error);
        this.logger.error(roomId, 'Room end failed', { error: (error as Error).message });
        throw error;
      }
    }
  
    /**
     * List all active rooms
     */
    async listRooms(): Promise<LiveKitServerRoom[]> {
      try {
        return await this.roomServiceClient.listRooms();
      } catch (error) {
        console.error(colors.red('[RoomService]'), 'Failed to list rooms:', error);
        throw error;
      }
    }
  
    /**
     * Generate a token for room access
     */
    createToken(options: TokenOptions): string {
      const { userId, name, role, roomId, ttl = 3600, metadata = {} } = options;
      
      try {
        const token = new AccessToken(this.config.apiKey, this.config.apiSecret, {
          identity: userId,
          name,
          ttl, // 1 hour default
          metadata: JSON.stringify({ role, ...metadata }),
        });
  
        // Set permissions based on role
        if (role === UserRole.ADMIN) {
          // Admin can do everything
          token.addGrant({ 
            roomJoin: true, 
            room: roomId,
            roomAdmin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true 
          });
        } else if (role === UserRole.SELLER || role === UserRole.BUYER) {
          // Seller and buyer can publish and subscribe
          token.addGrant({ 
            roomJoin: true, 
            room: roomId,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true 
          });
        } else if (role === UserRole.DELIVERY) {
          // Delivery personnel has limited permissions
          token.addGrant({ 
            roomJoin: true, 
            room: roomId,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true 
          });
        }
  
        this.logger.debug(roomId, 'Token created', { userId, role });
        return token.toJwt();
      } catch (error) {
        console.error(colors.red('[RoomService]'), 'Failed to create token:', error);
        this.logger.error(roomId, 'Token creation failed', { error: (error as Error).message });
        throw error;
      }
    }
  
    /**
     * Handle room lifecycle hooks for tracking and management
     */
    trackRoom(room: Room, metadata: RoomMetadata): MeetnMartRoom {
      const roomId = room.name;
      
      // Create MeetnMart room object
      const meetnMartRoom: MeetnMartRoom = {
        roomId,
        livekitRoom: room,
        metadata,
        participants: new Map()
      };
      
      // Store in active rooms map
      this.activeRooms.set(roomId, meetnMartRoom);
      
      // Set up room event listeners for lifecycle management
      room.on(Room.roomConnected, () => {
        console.log(colors.green('[RoomService]'), `Connected to room: ${colors.yellow(roomId)}`);
        this.logger.info(roomId, 'Room connected');
        
        // Track connection state changes
        room.on(Room.connectionStateChanged, (state: ConnectionState) => {
          console.log(colors.cyan('[RoomService]'), `Room ${roomId} connection state: ${state}`);
          this.logger.debug(roomId, 'Connection state changed', { state });
          
          // Handle disconnection
          if (state === ConnectionState.Disconnected) {
            this.activeRooms.delete(roomId);
            this.logger.info(roomId, 'Room disconnected');
          }
        });
        
        // Emit event for other services to react
        this.events.emit('room:connected', meetnMartRoom);
      });
      
      // Handle idle detection
      let idleTimeout: NodeJS.Timeout;
      const checkIdleStatus = () => {
        clearTimeout(idleTimeout);
        
        // Set timeout to check if room is idle
        idleTimeout = setTimeout(async () => {
          if (room.participants.size === 0) {
            console.log(colors.yellow('[RoomService]'), `Room ${roomId} is idle, updating status`);
            await this.updateRoomMetadata(roomId, { status: RoomStatus.IDLE });
            this.events.emit('room:idle', meetnMartRoom);
          }
        }, 60000); // Check after 1 minute of no participants
      };
      
      // Monitor participant changes
      room.on(Room.participantConnected, () => checkIdleStatus());
      room.on(Room.participantDisconnected, () => checkIdleStatus());
      
      return meetnMartRoom;
    }
  
    /**
     * Get MeetnMartRoom by ID if it's being tracked
     */
    getRoom(roomId: string): MeetnMartRoom | undefined {
      return this.activeRooms.get(roomId);
    }
  
    /**
     * Get all active tracked rooms
     */
    getActiveRooms(): MeetnMartRoom[] {
      return Array.from(this.activeRooms.values());
    }
  
    /**
     * Subscribe to room events
     */
    on(event: string, listener: (...args: any[]) => void): void {
      this.events.on(event, listener);
    }
  
    /**
     * Remove event subscription
     */
    off(event: string, listener: (...args: any[]) => void): void {
      this.events.off(event, listener);
    }
  }
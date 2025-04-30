// src/livekit/user.ts
import { 
    LocalParticipant, 
    Participant, 
    RemoteParticipant, 
    Room, 
    ParticipantEvent 
  } from 'livekit-client';
  import { 
    MeetnMartParticipant, 
    MeetnMartRoom, 
    UserMetadata, 
    UserRole,
    ModerationAction
  } from './types';
  import { SessionLogger } from './session';
  import { EventEmitter } from 'events';
  import colors from 'colors/safe';
  
  /**
   * Service for managing users in LiveKit rooms
   */
  export class UserService {
    private logger: SessionLogger;
    private events: EventEmitter = new EventEmitter();
    
    // Track inactive users for potential cleanup
    private inactiveUsers: Map<string, { 
      userId: string, 
      roomId: string, 
      lastActive: number,
      inactivityTimer?: NodeJS.Timeout 
    }> = new Map();
    
    constructor(logger: SessionLogger) {
      this.logger = logger;
      
      // Set higher limit for event listeners
      this.events.setMaxListeners(100);
      
      console.log(colors.cyan('[UserService]'), 'Initialized');
    }
  
    /**
     * Parse and extract metadata from participant
     */
    private extractUserMetadata(participant: Participant): UserMetadata | null {
      try {
        if (!participant.metadata) {
          return null;
        }
        
        const metadata = JSON.parse(participant.metadata);
        
        if (!metadata.userId || !metadata.role) {
          console.warn(colors.yellow('[UserService]'), 'Participant has invalid metadata:', participant.identity);
          return null;
        }
        
        return {
          userId: metadata.userId || participant.identity,
          displayName: metadata.displayName || participant.name || 'Unknown User',
          role: metadata.role as UserRole,
          profileImageUrl: metadata.profileImageUrl,
          customData: metadata.customData
        };
      } catch (error) {
        console.error(colors.red('[UserService]'), 'Failed to parse participant metadata:', error);
        return null;
      }
    }
  
    /**
     * Track participant in a room
     */
    trackParticipant(room: MeetnMartRoom, participant: RemoteParticipant | LocalParticipant): MeetnMartParticipant | null {
      const metadata = this.extractUserMetadata(participant);
      
      if (!metadata) {
        console.warn(colors.yellow('[UserService]'), `Cannot track participant ${participant.identity} without valid metadata`);
        return null;
      }
      
      const meetnMartParticipant: MeetnMartParticipant = {
        participantId: participant.identity,
        livekitParticipant: participant,
        metadata,
        joinedAt: Date.now(),
        permissions: {
          canPublishAudio: true,
          canPublishVideo: true,
          canPublishData: true,
          canSubscribe: true
        },
        violations: []
      };
      
      // Store in room's participants map
      room.participants.set(participant.identity, meetnMartParticipant);
      
      // Log participant join event
      this.logger.info(room.roomId, 'Participant joined', { 
        userId: metadata.userId, 
        role: metadata.role 
      });
      
      console.log(colors.green('[UserService]'), 
        `Participant ${colors.yellow(metadata.displayName)} (${colors.blue(metadata.role)}) joined room ${colors.yellow(room.roomId)}`
      );
      
      // Set up participant event listeners
      this.setupParticipantListeners(room, meetnMartParticipant);
      
      // Emit event for other services to react
      this.events.emit('participant:joined', room, meetnMartParticipant);
      
      return meetnMartParticipant;
    }
  
    /**
     * Setup event listeners for a participant
     */
    private setupParticipantListeners(room: MeetnMartRoom, participant: MeetnMartParticipant): void {
      const lkParticipant = participant.livekitParticipant;
      const roomId = room.roomId;
      const userId = participant.metadata.userId;
      
      // Track connection quality changes
      lkParticipant.on(ParticipantEvent.ConnectionQualityChanged, (quality) => {
        participant.connectionQuality = quality;
        
        if (quality < 0.5) {
          console.warn(colors.yellow('[UserService]'), 
            `Participant ${colors.yellow(participant.metadata.displayName)} has poor connection quality: ${quality}`
          );
          this.logger.warn(roomId, 'Poor connection quality', { userId, quality });
        }
      });
      
      // Track mute/unmute events
      lkParticipant.on(ParticipantEvent.TrackMuted, (pub) => {
        const kind = pub.kind === 'audio' ? 'audio' : 'video';
        this.logger.info(roomId, `${kind} muted`, { userId });
      });
      
      lkParticipant.on(ParticipantEvent.TrackUnmuted, (pub) => {
        const kind = pub.kind === 'audio' ? 'audio' : 'video';
        this.logger.info(roomId, `${kind} unmuted`, { userId });
      });
      
      // Track disconnection
      lkParticipant.on(ParticipantEvent.Disconnected, () => {
        this.handleParticipantDisconnect(room, participant);
      });
      
      // Set up user activity monitoring
      this.setupUserActivityMonitoring(room, participant);
    }
  
    /**
     * Handle participant disconnection
     */
    private handleParticipantDisconnect(room: MeetnMartRoom, participant: MeetnMartParticipant): void {
      const roomId = room.roomId;
      const userId = participant.metadata.userId;
      
      // Remove from room's participants map
      room.participants.delete(participant.participantId);
      
      // Remove from inactive users if present
      this.inactiveUsers.delete(participant.participantId);
      
      // Log participant leave event
      this.logger.info(roomId, 'Participant left', { 
        userId, 
        role: participant.metadata.role,
        duration: Math.floor((Date.now() - participant.joinedAt) / 1000)
      });
      
      console.log(colors.yellow('[UserService]'), 
        `Participant ${colors.yellow(participant.metadata.displayName)} left room ${colors.yellow(roomId)}`
      );
      
      // Emit event for other services to react
      this.events.emit('participant:left', room, participant);
    }
  
    /**
     * Setup monitoring for user activity
     */
    private setupUserActivityMonitoring(room: MeetnMartRoom, participant: MeetnMartParticipant): void {
      const participantId = participant.participantId;
      const roomId = room.roomId;
      
      // Create or update inactive user entry
      this.inactiveUsers.set(participantId, {
        userId: participant.metadata.userId,
        roomId: roomId,
        lastActive: Date.now(),
        inactivityTimer: setTimeout(() => {
          this.checkUserActivity(participantId);
        }, 5 * 60 * 1000) // Check after 5 minutes
      });
    }
  
    /**
     * Update user activity timestamp
     */
    updateUserActivity(participantId: string): void {
      const inactiveEntry = this.inactiveUsers.get(participantId);
      
      if (inactiveEntry) {
        // Update last active time
        inactiveEntry.lastActive = Date.now();
        
        // Clear and reset timer
        if (inactiveEntry.inactivityTimer) {
          clearTimeout(inactiveEntry.inactivityTimer);
        }
        
        inactiveEntry.inactivityTimer = setTimeout(() => {
          this.checkUserActivity(participantId);
        }, 5 * 60 * 1000); // Reset to 5 minutes
      }
    }
  
    /**
     * Check if user is idle and handle accordingly
     */
    private checkUserActivity(participantId: string): void {
      const inactiveEntry = this.inactiveUsers.get(participantId);
      
      if (!inactiveEntry) return;
      
      const idleTime = (Date.now() - inactiveEntry.lastActive) / 1000 / 60; // minutes
      
      if (idleTime >= 10) { // 10 minutes of inactivity
        console.warn(colors.yellow('[UserService]'), 
          `Participant ${colors.yellow(participantId)} has been idle for ${Math.floor(idleTime)} minutes`
        );
        
        this.logger.warn(inactiveEntry.roomId, 'User idle', { 
          userId: inactiveEntry.userId, 
          idleMinutes: Math.floor(idleTime) 
        });
        
        // Emit idle event for other services to react
        this.events.emit('participant:idle', participantId, inactiveEntry.roomId, Math.floor(idleTime));
      }
    }
  
    /**
     * Get users in a room by role
     */
    getUsersByRole(room: MeetnMartRoom, role: UserRole): MeetnMartParticipant[] {
      const users: MeetnMartParticipant[] = [];
      
      room.participants.forEach(participant => {
        if (participant.metadata.role === role) {
          users.push(participant);
        }
      });
      
      return users;
    }
  
    /**
     * Get a user by ID from a room
     */
    getUser(room: MeetnMartRoom, userId: string): MeetnMartParticipant | undefined {
      for (const participant of room.participants.values()) {
        if (participant.metadata.userId === userId) {
          return participant;
        }
      }
      return undefined;
    }
  
    /**
     * Take moderation action against a user
     */
    async moderateUser(
      room: MeetnMartRoom, 
      participant: MeetnMartParticipant,
      action: ModerationAction,
      reason: string
    ): Promise<boolean> {
      const roomId = room.roomId;
      const userId = participant.metadata.userId;
      const lkParticipant = participant.livekitParticipant;
      
      try {
        switch (action) {
          case ModerationAction.WARNING:
            // Just log the warning, actual notification would be through a custom event
            this.logger.warn(roomId, 'User warning issued', { userId, reason });
            
            // Track violation in participant data
            participant.violations = participant.violations || [];
            participant.violations.push({
              type: 'warning',
              timestamp: Date.now(),
              details: reason
            });
            break;
            
          case ModerationAction.MUTE_AUDIO:
            // Find and mute audio track
            for (const trackPublication of lkParticipant.trackPublications.values()) {
              if (trackPublication.kind === 'audio' && !trackPublication.isMuted) {
                await trackPublication.mute();
                this.logger.info(roomId, 'User audio muted', { userId, reason });
              }
            }
            
            // Update permissions
            participant.permissions.canPublishAudio = false;
            
            // Track violation
            participant.violations = participant.violations || [];
            participant.violations.push({
              type: 'audio_muted',
              timestamp: Date.now(),
              details: reason
            });
            break;
            
          case ModerationAction.DISABLE_VIDEO:
            // Find and mute video track
            for (const trackPublication of lkParticipant.trackPublications.values()) {
              if (trackPublication.kind === 'video' && !trackPublication.isMuted) {
                await trackPublication.mute();
                this.logger.info(roomId, 'User video disabled', { userId, reason });
              }
            }
            
            // Update permissions
            participant.permissions.canPublishVideo = false;
            
            // Track violation
            participant.violations = participant.violations || [];
            participant.violations.push({
              type: 'video_disabled',
              timestamp: Date.now(),
              details: reason
            });
            break;
            
          case ModerationAction.KICK:
            // Kick participant from room
            if (lkParticipant instanceof RemoteParticipant) {
              await room.livekitRoom.removeParticipant(lkParticipant.sid);
              this.logger.warn(roomId, 'User kicked', { userId, reason });
            } else {
              console.warn(colors.yellow('[UserService]'), 'Cannot kick local participant');
              return false;
            }
            break;
            
          case ModerationAction.BAN:
            // Implement ban logic - would need to be tracked in a database
            if (lkParticipant instanceof RemoteParticipant) {
              await room.livekitRoom.removeParticipant(lkParticipant.sid);
              
              // Add user to ban list (this would be persisted in a real implementation)
              this.logger.warn(roomId, 'User banned', { userId, reason });
              
              // Emit ban event for external systems to handle (e.g., ban from entire marketplace)
              this.events.emit('participant:banned', roomId, userId, reason);
            } else {
              console.warn(colors.yellow('[UserService]'), 'Cannot ban local participant');
              return false;
            }
            break;
            
          default:
            console.warn(colors.yellow('[UserService]'), `Unknown moderation action: ${action}`);
            return false;
        }
        
        // Emit moderation event
        this.events.emit('participant:moderated', room, participant, action, reason);
        
        console.log(colors.green('[UserService]'), 
          `Moderation action ${colors.blue(action)} taken against user ${colors.yellow(participant.metadata.displayName)}`
        );
        
        return true;
      } catch (error) {
        console.error(colors.red('[UserService]'), `Failed to moderate user ${userId} in room ${roomId}:`, error);
        this.logger.error(roomId, 'Moderation action failed', { 
          userId, 
          action, 
          reason,
          error: (error as Error).message 
        });
        return false;
      }
    }
  
    /**
     * Update user permissions
     */
    updateUserPermissions(
      room: MeetnMartRoom,
      participant: MeetnMartParticipant,
      permissions: Partial<MeetnMartParticipant['permissions']>
    ): boolean {
      try {
        // Update permissions object
        participant.permissions = {
          ...participant.permissions,
          ...permissions
        };
        
        this.logger.info(room.roomId, 'User permissions updated', { 
          userId: participant.metadata.userId,
          updatedPermissions: Object.keys(permissions)
        });
        
        // Emit event for other services to react
        this.events.emit('participant:permissions_updated', room, participant, permissions);
        
        return true;
      } catch (error) {
        console.error(colors.red('[UserService]'), 'Failed to update user permissions:', error);
        return false;
      }
    }
  
    /**
     * Subscribe to user events
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
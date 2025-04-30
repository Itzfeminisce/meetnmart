// src/livekit/types.ts
import { Room as LiveKitRoom, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { RoomServiceClient } from 'livekit-server-sdk';

/**
 * User roles in the MeetnMart platform
 */
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  DELIVERY = 'delivery',
  ADMIN = 'admin',
}

/**
 * Room status lifecycle states
 */
export enum RoomStatus {
  CREATING = 'creating',
  ACTIVE = 'active',
  IDLE = 'idle',
  ENDED = 'ended',
  ERROR = 'error',
}

/**
 * Custom events that can be emitted during a session
 */
export enum CustomEventType {
  INVITE_DELIVERY = 'invite_delivery',
  PRODUCT_SHOWCASE = 'product_showcase',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  DISPUTE_RAISED = 'dispute_raised',
  CALL_RECORDING = 'call_recording',
  SESSION_IDLE = 'session_idle',
  USER_VIOLATION = 'user_violation',
  MODERATION_ACTION = 'moderation_action',
}

/**
 * Log levels for session logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Moderation actions that can be taken
 */
export enum ModerationAction {
  WARNING = 'warning',
  MUTE_AUDIO = 'mute_audio',
  DISABLE_VIDEO = 'disable_video', 
  KICK = 'kick',
  BAN = 'ban',
}

/**
 * Configuration for LiveKit server connection
 */
export interface LiveKitConfig {
  host: string;
  apiKey: string;
  apiSecret: string;
  region?: string;
  secure?: boolean;
}

/**
 * User metadata for participants
 */
export interface UserMetadata {
  userId: string;
  displayName: string;
  role: UserRole;
  profileImageUrl?: string;
  customData?: Record<string, any>;
}

/**
 * Room metadata for marketplace sessions
 */
export interface RoomMetadata {
  marketplaceId: string;
  category?: string;
  productId?: string;
  status: RoomStatus;
  moderationLevel?: string;
  createdAt: number;
  scheduledEndTime?: number;
  recording?: boolean;
  customData?: Record<string, any>;
}

/**
 * Custom event payload structure
 */
export interface CustomEvent {
  type: CustomEventType;
  senderId: string;
  timestamp: number;
  targetId?: string;
  payload?: Record<string, any>;
}

/**
 * Session log entry structure
 */
export interface SessionLogEntry {
  roomId: string;
  timestamp: number;
  level: LogLevel;
  event: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * AI moderation configuration 
 */
export interface ModerationConfig {
  enabled: boolean;
  audioModeration?: boolean;
  videoModeration?: boolean;
  textModeration?: boolean;
  providers?: {
    name: string;
    apiKey?: string;
    endpoint?: string;
    options?: Record<string, any>;
  }[];
  allowedKeywords?: string[];
  bannedKeywords?: string[];
  sensitiveCategories?: string[];
  actionThresholds?: Record<string, number>;
}

/**
 * Enhanced participant interface combining LiveKit participant with our metadata
 */
export interface MeetnMartParticipant {
  participantId: string;
  livekitParticipant: RemoteParticipant | LocalParticipant;
  metadata: UserMetadata;
  joinedAt: number;
  permissions: {
    canPublishAudio: boolean;
    canPublishVideo: boolean;
    canPublishData: boolean;
    canSubscribe: boolean;
  };
  connectionQuality?: number;
  violations?: {
    type: string;
    timestamp: number;
    details?: string;
  }[];
}

/**
 * Enhanced room interface combining LiveKit room with our metadata
 */
export interface MeetnMartRoom {
  roomId: string;
  livekitRoom: LiveKitRoom;
  metadata: RoomMetadata;
  participants: Map<string, MeetnMartParticipant>;
  moderationConfig?: ModerationConfig;
}

/**
 * Structure for permission tokens
 */
export interface TokenOptions {
  userId: string;
  name: string;
  role: UserRole;
  roomId: string;
  ttl?: number;
  metadata?: Record<string, any>;
}
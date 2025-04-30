// src/livekit/moderation.ts
import {
    MeetnMartRoom,
    MeetnMartParticipant,
    ModerationAction,
    ModerationConfig,
    CustomEventType,
    
} from './types';
import { UserService } from './user';
import { SessionLogger } from './session';
import { EventService } from './events';
import { EventEmitter } from 'events';
import colors from 'colors/safe';

/**
 * Provider interface for AI moderation services
 */
export interface ModerationProvider {
    name: string;
    checkText(text: string): Promise<ModerationResult>;
    checkAudio?(audioData: Uint8Array): Promise<ModerationResult>;
    checkVideo?(videoData: Uint8Array): Promise<ModerationResult>;
}

/**
 * Result of content moderation
 */
export interface ModerationResult {
    flagged: boolean;
    categories?: {
        [category: string]: number; // Score between 0-1
    };
    flags?: string[];
    severity?: number; // 0-1 overall severity score
    actionRecommended?: ModerationAction;
    reason?: string;
}

/**
 * OpenAI text moderation provider
 * This is just a placeholder implementation - in production you would use the OpenAI API
 */
export class OpenAIModerationProvider implements ModerationProvider {
    name = 'openai';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async checkText(text: string): Promise<ModerationResult> {
        console.log(colors.dim('[OpenAIModeration] Would check text with OpenAI API'), text.substring(0, 30) + '...');

        // This is just a placeholder that would integrate with OpenAI's Moderation API
        // In production, you would make an API call to OpenAI

        // Simple demo implementation that triggers on forbidden words
        const forbiddenWords = ['badword1', 'badword2', 'badword3'];
        const lowercaseText = text.toLowerCase();

        for (const word of forbiddenWords) {
            if (lowercaseText.includes(word)) {
                return {
                    flagged: true,
                    categories: {
                        'prohibited_content': 0.95
                    },
                    flags: ['prohibited_content'],
                    severity: 0.95,
                    actionRecommended: ModerationAction.WARNING,
                    reason: 'Detected prohibited content'
                };
            }
        }

        return {
            flagged: false,
            categories: {},
            severity: 0
        };
    }
}

/**
 * Service for content moderation in LiveKit rooms
 */
export class ModerationService {
    private userService: UserService;
    private eventService: EventService;
    private logger: SessionLogger;
    private events: EventEmitter = new EventEmitter();

    // Registered moderation providers
    private providers: Map<string, ModerationProvider> = new Map();

    constructor(userService: UserService, eventService: EventService, logger: SessionLogger) {
        this.userService = userService;
        this.eventService = eventService;
        this.logger = logger;

        // Set higher limit for event listeners
        this.events.setMaxListeners(100);

        console.log(colors.cyan('[ModerationService]'), 'Initialized');
    }

    /**
     * Register a moderation provider
     */
    registerProvider(provider: ModerationProvider): void {
        this.providers.set(provider.name, provider);
        console.log(colors.cyan('[ModerationService]'), `Registered moderation provider: ${colors.yellow(provider.name)}`);
    }

    /**
     * Setup moderation for a room
     */
    setupRoomModeration(room: MeetnMartRoom, config: ModerationConfig): void {
        // Store moderation config in room
        room.moderationConfig = config;

        if (!config.enabled) {
            console.log(colors.yellow('[ModerationService]'), `Moderation disabled for room: ${colors.yellow(room.roomId)}`);
            return;
        }

        console.log(colors.cyan('[ModerationService]'), `Setting up moderation for room: ${colors.yellow(room.roomId)}`);

        // Set up text moderation for data channel messages
        if (config.textModeration) {
            this.setupTextModeration(room);
        }

        // Audio moderation would require audio stream processing
        // This is a placeholder for future implementation
        if (config.audioModeration) {
            this.setupAudioModeration(room);
        }

        // Video moderation would require video frame processing
        // This is a placeholder for future implementation
        if (config.videoModeration) {
            this.setupVideoModeration(room);
        }

        this.logger.info(room.roomId, 'Moderation configured', {
            textModeration: config.textModeration,
            audioModeration: config.audioModeration,
            videoModeration: config.videoModeration,
            providers: config.providers?.map(p => p.name)
        });
    }

    /**
     * Setup text content moderation
     */
    private setupTextModeration(room: MeetnMartRoom): void {
        // Subscribe to custom events that contain text content
        this.eventService.on('custom_event', async (eventRoom: MeetnMartRoom, event: any) => {
            // Skip if not for our room
            if (eventRoom.roomId !== room.roomId) return;

            // Skip if moderation is disabled
            if (!room.moderationConfig?.enabled || !room.moderationConfig.textModeration) return;

            // Extract text content from event payload if present
            let textToModerate = '';

            if (event.payload?.message) {
                textToModerate = event.payload.message;
            } else if (event.payload?.text) {
                textToModerate = event.payload.text;
            } else if (event.payload?.comment) {
                textToModerate = event.payload.comment;
            } else if (typeof event.payload === 'string') {
                textToModerate = event.payload;
            } else if (event.payload && typeof event.payload === 'object') {
                // Try to extract text from any fields that might contain text
                const possibleTextFields = Object.values(event.payload).filter(val => typeof val === 'string');
                textToModerate = possibleTextFields.join(' ');
            }

            // Skip if no text to moderate
            if (!textToModerate) return;

            // Moderate the text content
            await this.moderateText(room, event.senderId, textToModerate);
        });

        console.log(colors.green('[ModerationService]'), `Text moderation set up for room: ${colors.yellow(room.roomId)}`);
    }

    /**
     * Setup audio content moderation
     * This is a placeholder for future implementation
     */
    private setupAudioModeration(room: MeetnMartRoom): void {
        // This would require integration with LiveKit's audio streams
        // and processing them in real-time for moderation
        console.log(colors.yellow('[ModerationService]'),
            `Audio moderation for room ${colors.yellow(room.roomId)} is not yet implemented`
        );
    }

    /**
       * Setup video content moderation
       * This is a placeholder for future implementation
       */
    private setupVideoModeration(room: MeetnMartRoom): void {
        console.log(colors.yellow('[ModerationService]'),
            `Video moderation for room ${colors.yellow(room.roomId)} is being configured`
        );

        // Get all participants in the room
        room.livekitRoom.participants.forEach(participant => {
            this.setupParticipantVideoModeration(room, participant);
        });

        // Also monitor for new participants joining
        room.livekitRoom.on('participantConnected', participant => {
            this.setupParticipantVideoModeration(room, participant);
        });

        this.logger.info(room.roomId, 'Video moderation configured', {
            enabled: true,
            providers: room.moderationConfig?.providers?.map(p => p.name)
        });
    }

    /**
     * Set up video moderation for a specific participant
     */
    private setupParticipantVideoModeration(room: MeetnMartRoom, participant: RemoteParticipant): void {
        // Track when participant publishes new video tracks
        participant.on('trackPublished', publication => {
            if (publication.kind !== 'video') return;

            // When track is subscribed, we'll have access to the actual video data
            publication.on('subscribed', track => {
                if (track.kind !== 'video') return;

                this.monitorVideoTrack(room, participant, track as VideoTrack);
            });
        });

        // Check existing video tracks
        for (const publication of participant.trackPublications.values()) {
            if (publication.kind === 'video' && publication.track) {
                this.monitorVideoTrack(room, participant, publication.track as VideoTrack);
            }
        }

        this.logger.debug(room.roomId, 'Participant video moderation configured', {
            participantId: participant.identity
        });
    }

    /**
     * Monitor a video track for content moderation
     */
    private monitorVideoTrack(room: MeetnMartRoom, participant: RemoteParticipant, track: VideoTrack): void {
        if (!room.moderationConfig?.enabled || !room.moderationConfig.videoModeration) return;

        const participantId = participant.identity;
        const roomId = room.roomId;

        // Extract user metadata if available
        let userId = participantId;
        try {
            if (participant.metadata) {
                const metadata = JSON.parse(participant.metadata);
                userId = metadata.userId || participantId;
            }
        } catch (error) {
            console.error(colors.red('[ModerationService]'), 'Failed to parse participant metadata:', error);
        }

        console.log(colors.cyan('[ModerationService]'),
            `Monitoring video from ${colors.yellow(userId)} in room ${colors.yellow(roomId)}`
        );

        // Sampling interval for video frames (e.g., every 5 seconds)
        const sampleInterval = 5000;

        // Set up periodic sampling of video frames for moderation
        const frameCheckInterval = setInterval(async () => {
            try {
                if (!track.attachedElements || track.attachedElements.length === 0) {
                    // Create a temporary hidden video element to capture frames
                    const videoEl = document.createElement('video');
                    videoEl.style.display = 'none';
                    videoEl.muted = true;
                    document.body.appendChild(videoEl);

                    // Attach the track to the element
                    track.attach(videoEl);

                    // Extract a frame for analysis
                    await this.moderateVideoFrame(room, userId, videoEl);

                    // Clean up
                    track.detach(videoEl);
                    document.body.removeChild(videoEl);
                } else {
                    // Use already attached element
                    await this.moderateVideoFrame(room, userId, track.attachedElements[0] as HTMLVideoElement);
                }
            } catch (error) {
                console.error(colors.red('[ModerationService]'),
                    `Error moderating video frame for ${userId} in room ${roomId}:`, error
                );
            }
        }, sampleInterval);

        // Clean up interval when track is ended or unsubscribed
        track.on('ended', () => {
            clearInterval(frameCheckInterval);
            this.logger.debug(roomId, 'Video track moderation stopped', { userId });
        });

        this.logger.info(roomId, 'Video track moderation started', { userId });
    }

    /**
     * Analyze a video frame for content moderation
     */
    private async moderateVideoFrame(room: MeetnMartRoom, userId: string, videoElement: HTMLVideoElement): Promise<void> {
        if (!videoElement) return;

        const roomId = room.roomId;
        const providers = room.moderationConfig?.providers || [];

        try {
            // Create a canvas to extract the frame
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;

            // Set canvas dimensions to match video
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            // Draw the current frame to canvas
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Convert canvas to binary data (e.g., PNG)
            const dataURL = canvas.toDataURL('image/png');
            const binaryData = this.dataURLtoUint8Array(dataURL);

            // Run moderation checks with all enabled providers
            for (const provider of providers) {
                const moderationProvider = this.providers.get(provider.name);
                if (!moderationProvider || !moderationProvider.checkVideo) continue;

                const result = await moderationProvider.checkVideo(binaryData);

                if (result.flagged) {
                    this.logger.warn(roomId, 'Video content flagged', {
                        userId,
                        severity: result.severity,
                        categories: result.categories,
                        flags: result.flags
                    });

                    // Take appropriate action based on moderation result
                    if (result.actionRecommended) {
                        await this.handleModerationViolation(
                            room,
                            userId,
                            result.actionRecommended,
                            `Video content violation: ${result.reason || result.flags?.join(', ')}`,
                            'video'
                        );
                    }

                    // Only need one provider to flag content
                    break;
                }
            }
        } catch (error) {
            console.error(colors.red('[ModerationService]'),
                `Error processing video frame for ${userId} in room ${roomId}:`, error
            );
            this.logger.error(roomId, 'Video moderation error', {
                userId,
                error: (error as Error).message
            });
        }
    }

    /**
     * Convert Data URL to Uint8Array for sending to moderation APIs
     */
    private dataURLtoUint8Array(dataURL: string): Uint8Array {
        const base64 = dataURL.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes;
    }

    /**
     * Handle moderation violations by taking appropriate action
     */
    private async handleModerationViolation(
        room: MeetnMartRoom,
        userId: string,
        action: ModerationAction,
        reason: string,
        contentType: 'text' | 'audio' | 'video'
    ): Promise<void> {
        try {
            // Find the user in the room
            let participant: MeetnMartParticipant | undefined;

            for (const p of room.participants.values()) {
                if (p.metadata.userId === userId) {
                    participant = p;
                    break;
                }
            }

            if (!participant) {
                this.logger.warn(room.roomId, 'Cannot take moderation action - user not found', { userId });
                return;
            }

            // Get user service if available
            // Note: In a real implementation, this would be properly injected rather than dynamically imported
            const userService = this.userService;
            if (!userService) {
                this.logger.error(room.roomId, 'User service not available for moderation action', { userId });
                return;
            }

            // Take action based on moderation recommendation
            await userService.moderateUser(room, participant, action, reason);

            // Emit moderation event
            this.eventService.sendEvent(
                room,
                CustomEventType.MODERATION_ACTION,
                'system',
                {
                    userId,
                    action,
                    contentType,
                    reason
                }
            );

            this.logger.info(room.roomId, 'Moderation action taken', {
                userId,
                action,
                contentType,
                reason
            });

            // Emit event for other services to react
            this.events.emit('moderation:action_taken', room, userId, action, reason, contentType);
        } catch (error) {
            console.error(colors.red('[ModerationService]'),
                `Failed to handle moderation violation for ${userId}:`, error
            );
            this.logger.error(room.roomId, 'Moderation action failed', {
                userId,
                error: (error as Error).message
            });
        }
    }
}
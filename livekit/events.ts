// src/livekit/events.ts
import { DataPacket_Kind, Room } from 'livekit-client';
import { 
  CustomEvent, 
  CustomEventType, 
  MeetnMartParticipant, 
  MeetnMartRoom 
} from './types';
import { SessionLogger } from './session';
import { EventEmitter } from 'events';
import colors from 'colors/safe';

/**
 * Service for handling custom events in LiveKit rooms
 */
export class EventService {
  private logger: SessionLogger;
  private events: EventEmitter = new EventEmitter();
  
  // Store registered event handlers
  private eventHandlers: Map<CustomEventType, Array<(room: MeetnMartRoom, event: CustomEvent) => void>> = new Map();
  
  constructor(logger: SessionLogger) {
    this.logger = logger;
    
    // Set higher limit for event listeners
    this.events.setMaxListeners(100);
    
    console.log(colors.cyan('[EventService]'), 'Initialized');
  }

  /**
   * Set up event handling for a room
   */
  setupRoomEvents(room: MeetnMartRoom): void {
    const livekitRoom = room.livekitRoom;
    const roomId = room.roomId;
    
    // Set up data message handling
    livekitRoom.on(Room.dataReceived, (payload: Uint8Array, participant, kind) => {
      // Only handle reliable messages for custom events
      if (kind !== DataPacket_Kind.RELIABLE) return;
      
      try {
        // Convert binary data to string then parse JSON
        const textDecoder = new TextDecoder();
        const dataStr = textDecoder.decode(payload);
        const eventData = JSON.parse(dataStr) as CustomEvent;
        
        // Validate event structure
        if (!eventData.type || !Object.values(CustomEventType).includes(eventData.type as CustomEventType)) {
          console.warn(colors.yellow('[EventService]'), `Invalid event type received: ${eventData.type}`);
          return;
        }
        
        // Process the custom event
        this.processCustomEvent(room, eventData, participant?.identity);
      } catch (error) {
        console.error(colors.red('[EventService]'), 'Failed to process data message:', error);
        this.logger.error(roomId, 'Event processing error', { error: (error as Error).message });
      }
    });
    
    console.log(colors.green('[EventService]'), `Event handling set up for room: ${colors.yellow(roomId)}`);
  }

  /**
   * Process a received custom event
   */
  private processCustomEvent(
    room: MeetnMartRoom, 
    event: CustomEvent, 
    senderId?: string
  ): void {
    const roomId = room.roomId;
    const eventType = event.type;
    
    // Set sender ID if not provided in the event
    if (!event.senderId && senderId) {
      event.senderId = senderId;
    }
    
    // Ensure timestamp is present
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }
    
    // Log the event
    this.logger.info(roomId, `Custom event: ${eventType}`, { 
      senderId: event.senderId,
      targetId: event.targetId
    });
    
    console.log(colors.cyan('[EventService]'), 
      `Event ${colors.blue(eventType)} received in room ${colors.yellow(roomId)} from ${colors.yellow(event.senderId)}`
    );
    
    // Execute registered handlers for this event type
    const handlers = this.eventHandlers.get(eventType as CustomEventType);
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => {
        try {
          handler(room, event);
        } catch (error) {
          console.error(colors.red('[EventService]'), `Error in event handler for ${eventType}:`, error);
        }
      });
    }
    
    // Emit generic event for other services
    this.events.emit('custom_event', room, event);
    
    // Emit specific event type
    this.events.emit(`custom_event:${eventType}`, room, event);
  }

  /**
   * Send a custom event to the room
   */
  async sendEvent(
    room: MeetnMartRoom, 
    eventType: CustomEventType, 
    senderId: string,
    payload?: Record<string, any>,
    targetId?: string
  ): Promise<boolean> {
    try {
      const livekitRoom = room.livekitRoom;
      const roomId = room.roomId;
      
      // Create event object
      const event: CustomEvent = {
        type: eventType,
        senderId,
        timestamp: Date.now(),
        targetId,
        payload
      };
      
      // Convert to JSON string then to binary
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(JSON.stringify(event));
      
      // Send data to all participants
      await livekitRoom.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
      
      // Log the event
      this.logger.info(roomId, `Custom event sent: ${eventType}`, { 
        senderId,
        targetId
      });
      
      console.log(colors.green('[EventService]'), 
        `Event ${colors.blue(eventType)} sent in room ${colors.yellow(roomId)}`
      );
      
      return true;
    } catch (error) {
      console.error(colors.red('[EventService]'), `Failed to send event ${eventType}:`, error);
      this.logger.error(room.roomId, 'Event send failed', { 
        eventType, 
        error: (error as Error).message 
      });
      return false;
    }
  }

  /**
   * Invite a delivery person to join the room
   */
  async inviteDelivery(
    room: MeetnMartRoom,
    senderId: string,
    deliveryUserId: string,
    deliveryInfo: {
      address: string;
      items: Array<{ id: string; name: string; quantity: number }>;
      estimatedTime?: string;
      specialInstructions?: string;
    }
  ): Promise<boolean> {
    return this.sendEvent(
      room,
      CustomEventType.INVITE_DELIVERY,
      senderId,
      { deliveryInfo },
      deliveryUserId
    );
  }

  /**
   * Show product information during call
   */
  async showProduct(
    room: MeetnMartRoom,
    senderId: string,
    productInfo: {
      id: string;
      name: string;
      price: number;
      description?: string;
      imageUrl?: string;
      options?: Record<string, any>;
    }
  ): Promise<boolean> {
    return this.sendEvent(
      room,
      CustomEventType.PRODUCT_SHOWCASE,
      senderId,
      { productInfo }
    );
  }

  /**
   * Initiate payment process
   */
  async initiatePayment(
    room: MeetnMartRoom,
    senderId: string,
    paymentInfo: {
      amount: number;
      currency: string;
      items: Array<{ id: string; name: string; price: number; quantity: number }>;
      paymentMethods?: string[];
    }
  ): Promise<boolean> {
    return this.sendEvent(
      room,
      CustomEventType.PAYMENT_INITIATED,
      senderId,
      { paymentInfo }
    );
  }

  /**
   * Register a handler for a specific event type
   */
  registerEventHandler(
    eventType: CustomEventType,
    handler: (room: MeetnMartRoom, event: CustomEvent) => void
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
    console.log(colors.cyan('[EventService]'), `Handler registered for event type: ${colors.blue(eventType)}`);
  }

  /**
   * Unregister a handler for a specific event type
   */
  unregisterEventHandler(
    eventType: CustomEventType,
    handler: (room: MeetnMartRoom, event: CustomEvent) => void
  ): void {
    const handlers = this.eventHandlers.get(eventType);
    
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        console.log(colors.cyan('[EventService]'), `Handler unregistered for event type: ${colors.blue(eventType)}`);
      }
    }
  }

  /**
   * Subscribe to events
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
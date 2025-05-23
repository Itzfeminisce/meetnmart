import { MessagePayload } from 'firebase/messaging';
import FCMService from './FCMService';
import PermissionManager from './PermissionManager';
import NotificationInteractionHandler from './NotificationInteractionHandler';
import CallManager from './CallManager';
import DeepLinkManager from './DeepLinkManager';
import { useAxios } from '@/lib/axiosUtils';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  silent?: boolean;
  requireInteraction?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationHandlerParams {
  onNotificationReceived?: (payload: MessagePayload) => void;
  onNotificationClicked?: (data: any) => void;
  onTokenRefreshed?: (token: string) => void;
  onPermissionChanged?: (status: NotificationPermission) => void;
}

const apiClient = useAxios()

class NotificationManager {
  private static instance: NotificationManager;
  private fcmService: FCMService;
  private permissionManager: PermissionManager;
  private notificationHandler: NotificationInteractionHandler;
  private callManager: CallManager;
  private deepLinkManager: DeepLinkManager;
  private unsubscribeForegroundListener: (() => void) | null = null;
  private isInitialized: boolean = false;
  private handlers: NotificationHandlerParams = {};

  constructor() {
    this.fcmService = FCMService.getInstance();
    this.permissionManager = PermissionManager.getInstance();
    this.notificationHandler = NotificationInteractionHandler.getInstance();
    this.callManager = CallManager.getInstance();
    this.deepLinkManager = DeepLinkManager.getInstance();

    // Register default action handlers
    this.registerDefaultActionHandlers();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Initialize notification services
   */
  async initialize(handlers: NotificationHandlerParams = {}): Promise<boolean> {
    if (this.isInitialized) return true;

    this.handlers = handlers;

    try {
      // Check browser support
      if (!this.permissionManager.isSupported()) {
        console.warn('Notifications are not supported in this browser');
        return false;
      }

      // Initialize FCM
      await this.fcmService.initialize();

      // Set up foreground message listener
      this.setupForegroundListener();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notification services:', error);
      return false;
    }
  }

  /**
   * Request notification permissions and register token
   */
  async requestPermissionAndRegister(): Promise<boolean> {
    try {
      // Request permission
      const hasPermission = await this.permissionManager.ensurePermission();

      if (this.handlers.onPermissionChanged) {
        this.handlers.onPermissionChanged(this.permissionManager.getPermissionStatus());
      }
 
      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return false;
      }

      // Request FCM token
      const token = await this.fcmService.requestToken();

      if (token && this.handlers.onTokenRefreshed) {
        this.handlers.onTokenRefreshed(token);
      }

      return !!token;
    } catch (error) {
      console.error('Error in permission request or token registration:', error);
      return false;
    }
  }

  /**
   * Set up foreground notification listener
   */
  private setupForegroundListener(): void {
    // Clean up existing listener if any
    if (this.unsubscribeForegroundListener) {
      this.unsubscribeForegroundListener();
    }

    // Set up new listener
    this.unsubscribeForegroundListener = this.fcmService.onForegroundMessage((payload) => {
      // Process the incoming notification
      this.processForegroundNotification(payload);

      // Call custom handler if provided
      if (this.handlers.onNotificationReceived) {
        this.handlers.onNotificationReceived(payload);
      }
    });
  }

  /**
   * Process foreground notification and show UI
   */
  private async processForegroundNotification(payload: MessagePayload): Promise<void> {
    console.log("processForegroundNotification", payload);

    try {
      const data = payload.data || {};
      const notification = payload.notification || {};

      // Extract notification content
      const notificationOptions: NotificationOptions = {
        title: notification.title || 'New Notification',
        body: notification.body || '',
        icon: notification.icon || '/notification.png',
        data
      };

      // Special handling for different notification types
      if (data.type === 'call') {
        await this.handleIncomingCallNotification(data, notificationOptions);
      } else if (data.type === 'message') {
        await this.handleMessageNotification(data, notificationOptions);
      } else {
        // Generic notification
        await this.notificationHandler.showNotification(notificationOptions);
      }
    } catch (error) {
      console.error('Error processing foreground notification:', error);
    }
  }

  /**
   * Handle incoming call notification with accept/reject actions
   */
  private async handleIncomingCallNotification(
    data: any,
    options: NotificationOptions
  ): Promise<void> {
    try {
      // Add call-specific actions
      options.actions = [
        {
          action: 'accept-call',
          title: data.callType === 'video' ? 'Accept Video' : 'Accept',
          icon: data.callType === 'video' ? '/video-calling.png' : '/phone-calling.png'
        },
        {
          action: 'reject-call',
          title: 'Reject',
          icon: '/phone-call-cancel-reject.png'
        }
      ];

      // Make sure notification stays visible until acted upon
      options.requireInteraction = true;
      options.tag = `call-${data.callId}`;

      // Show notification
      await this.notificationHandler.showNotification(options);

      // Also trigger in-app UI for call if app is in foreground
      const event = new CustomEvent('incoming-call', {
        detail: {
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerName || 'Unknown caller',
          callType: data.callType || 'audio'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error handling call notification:', error);
    }
  }

  /**
   * Handle message notification
   */
  private async handleMessageNotification(
    data: any,
    options: NotificationOptions
  ): Promise<void> {
    // Group messages by conversation
    if (data.conversationId) {
      options.tag = `conversation-${data.conversationId}`;
    }

    // Show notification
    await this.notificationHandler.showNotification(options);
  }

  /**
   * Register default action handlers
   */
  private registerDefaultActionHandlers(): void {
    // Register call acceptance handler
    this.notificationHandler.registerActionHandler('accept-call', (data) => {
      // The NotificationInteractionHandler already dispatches events,
      // but we can add additional handling here if needed
      console.log('Call accepted via NotificationManager:', data);
    });

    // Register call rejection handler
    this.notificationHandler.registerActionHandler('reject-call', (data) => {
      console.log('Call rejected via NotificationManager:', data);
    });
  }

  /**
   * Register custom action handler
   */
  registerActionHandler(action: string, handler: (data: any) => void): void {
    this.notificationHandler.registerActionHandler(action, handler);
  }

  /**
   * Show a custom notification
   */
  async showNotification(options: NotificationOptions): Promise<boolean> {
   await this.permissionManager.ensurePermission()
    return this.notificationHandler.showNotification(options);
  }

  /**
   * Get current FCM token
   */
  async getToken(): Promise<string | null> {
    const token = localStorage.getItem('fcmToken');
    if (token) return token;

    return await this.fcmService.requestToken();
  }

  /**
   * Force token refresh
   */
  async refreshToken(): Promise<string | null> {
    return await this.fcmService.refreshToken();
  }

  /**
   * Unregister FCM token (call on user logout)
   */
  async unregister(): Promise<boolean> {
    try {
      // Clean up foreground listener
      if (this.unsubscribeForegroundListener) {
        this.unsubscribeForegroundListener();
        this.unsubscribeForegroundListener = null;
      }

      // Unregister token from FCM
      await this.fcmService.unregisterToken();

      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Error unregistering notification services:', error);
      return false;
    }
  }

  /**
   * Check if notifications are currently enabled
   */
  isNotificationsEnabled(): boolean {
    return this.permissionManager.getPermissionStatus() === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permissionManager.getPermissionStatus();
  }

  /**
   * Subscribe to a topic (for topic-based notifications)
   * Requires server implementation to handle topic subscriptions
   */
  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Call your backend API to subscribe this token to the topic
      const response = await apiClient.Post("/notifications/topic/subscribe", {
        token,
        topic
      })

      return !!response.data;
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Call your backend API to unsubscribe this token from the topic
      const response = await apiClient.Post("/notifications/topic/unsubscribe", {
        token,
        topic
      })

      return !!response.data;
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      return false;
    }
  }
}

export default NotificationManager;
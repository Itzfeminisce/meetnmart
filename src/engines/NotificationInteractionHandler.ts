import DeepLinkManager from './DeepLinkManager';

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationOptions {
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

class NotificationInteractionHandler {
  private static instance: NotificationInteractionHandler;
  private deepLinkManager: DeepLinkManager;
  private actionHandlers: Map<string, (data: any) => void>;
  
  constructor() {
    this.deepLinkManager = DeepLinkManager.getInstance();
    this.actionHandlers = new Map();
    this.registerServiceWorker();
    this.setupNotificationClickListener();
  }

  static getInstance(): NotificationInteractionHandler {
    if (!NotificationInteractionHandler.instance) {
      NotificationInteractionHandler.instance = new NotificationInteractionHandler();
    }
    return NotificationInteractionHandler.instance;
  }
  
  /**
   * Register the service worker for handling background notifications
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        console.log('ServiceWorker registered with scope:', registration.scope);
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }
  
  /**
   * Set up listener for notification clicks in foreground
   */
  private setupNotificationClickListener(): void {
    // For notifications created by the Notification API in the foreground
    if ('Notification' in window) {
      self.addEventListener('notificationclick', (event: any) => {
        console.log('Notification clicked:', event);
        
        // Close the notification
        event.notification.close();
        
        // Get action and notification data
        const action = event.action || 'default';
        const data = event.notification.data || {};
        
        // Handle the action
        this.handleAction(action, data);
      });
    }
  }
  
  /**
   * Register a handler for a specific notification action
   */
  registerActionHandler(action: string, handler: (data: any) => void): void {
    this.actionHandlers.set(action, handler);
  }
  
  /**
   * Handle notification actions
   */
  handleAction(action: string, data: any): void {
    console.log(`Handling action: ${action}`, data);
    
    // Call specific action handler if registered
    const handler = this.actionHandlers.get(action);
    if (handler) {
      handler(data);
      return;
    }
    
    // Default handling based on action type
    switch (action) {
      case 'accept-call':
        this.handleAcceptCall(data);
        break;
      case 'reject-call':
        this.handleRejectCall(data);
        break;
      case 'default':
        this.handleDefaultClick(data);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
        this.handleDefaultClick(data);
    }
  }
  
  /**
   * Handle accepting a call
   */
  private handleAcceptCall(data: any): void {
    console.log('Call accepted:', data);
    
    // Navigate to call screen with call ID
    if (data.callId) {
      this.deepLinkManager.navigateTo(`/calls/${data.callId}`, {
        state: {
          accepted: true,
          caller: data.caller,
          callType: data.callType || 'audio',
          autoJoin: true
        }
      });
    }
    
    // Dispatch event for call manager to pick up
    const event = new CustomEvent('call-accepted', { 
      detail: { ...data }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Handle rejecting a call
   */
  private handleRejectCall(data: any): void {
    console.log('Call rejected:', data);
    
    // Call API to update call status
    if (data.callId) {
      fetch(`/api/calls/${data.callId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        console.error('Failed to update call status:', err);
      });
    }
    
    // Dispatch event for call manager
    const event = new CustomEvent('call-rejected', { 
      detail: { ...data }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Handle default notification click
   */
  private handleDefaultClick(data: any): void {
    // Focus on existing window/tab if possible
    if (data.url) {
      this.deepLinkManager.navigateTo(data.url, {
        state: { ...data }
      });
    } else {
      // Default to opening the app
      this.deepLinkManager.navigateTo('/', {
        state: { notificationData: data }
      });
    }
  }
  
  /**
   * Show a foreground notification with actions
   */
  async showNotification(options: NotificationOptions): Promise<boolean> {
    
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }
    
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }
    
    try {
      const notification = new Notification(options.title, {
        ...options,
        // Ensure data is available when notification is clicked
        data: options.data || {},
      });

      // Set up click handler for foreground notification
      notification.onclick = (event) => {
        
        notification.close();
        this.handleAction('accept-call', options.data || {});
      };
      
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }
}

export default NotificationInteractionHandler;
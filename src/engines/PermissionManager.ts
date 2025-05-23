class PermissionManager {
    private static instance: PermissionManager;
  
    static getInstance(): PermissionManager {
      if (!PermissionManager.instance) {
        PermissionManager.instance = new PermissionManager();
      }
      return PermissionManager.instance;
    }
  
    /**
     * Check if notifications are supported
     */
    isSupported(): boolean {
      return 'Notification' in window;
    }
  
    /**
     * Check current permission status
     */
    getPermissionStatus(): NotificationPermission {
      if (!this.isSupported()) {
        return 'denied';
      }
      return Notification.permission;
    }
  
    /**
     * Request permission with contextual UI
     */
    async requestPermission(): Promise<NotificationPermission> {
      if (!this.isSupported()) {
        console.warn('Notifications not supported in this browser');
        return 'denied';
      }
      
      try {
        const permission = await Notification.requestPermission();
        return permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }
  
    /**
     * Check if we have permission and request if needed
     */
    async ensurePermission(): Promise<boolean> {
      const status = this.getPermissionStatus();
      
      if (status === 'granted') {
        return true;
      } 
      
      if (status === 'denied') {
        // Permission was denied before, show instructions to user
        this.showPermissionInstructions();
        return false;
      }
      
      // If status is 'default' (not decided yet)
      const newStatus = await this.requestPermission();
      return newStatus === 'granted';
    }
  
    /**
     * Show instructions for enabling notifications when previously denied
     */
    private showPermissionInstructions(): void {
      // Implement UI for showing how to enable notifications in browser settings
      // This could be a modal, tooltip, or inline message
      const instructions = this.getBrowserSpecificInstructions();
      
      // Example implementation (replace with your actual UI components)
      const event = new CustomEvent('show-notification-instructions', {
        detail: { instructions }
      });
      window.dispatchEvent(event);
    }
  
    /**
     * Get browser-specific instructions for enabling notifications
     */
    private getBrowserSpecificInstructions(): string {
      const browser = this.detectBrowser();
      
      switch (browser) {
        case 'chrome':
          return 'Click the lock icon in the address bar, then set "Notifications" to "Allow"';
        case 'firefox':
          return 'Click the lock icon in the address bar, then select "More Information" > "Permissions" and enable "Send Notifications"';
        case 'safari':
          return 'Open Safari Preferences > Websites > Notifications, then find this website and select "Allow"';
        default:
          return 'Please enable notifications for this website in your browser settings';
      }
    }
  
    /**
     * Detect browser type for specific instructions
     */
    private detectBrowser(): string {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.indexOf('chrome') > -1) return 'chrome';
      if (userAgent.indexOf('firefox') > -1) return 'firefox';
      if (userAgent.indexOf('safari') > -1) return 'safari';
      if (userAgent.indexOf('edge') > -1) return 'edge';
      
      return 'unknown';
    }
  }
  
  export default PermissionManager;
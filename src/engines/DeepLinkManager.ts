interface NavigationOptions {
    state?: Record<string, any>;
    replace?: boolean;
  }
  
  class DeepLinkManager {
    private static instance: DeepLinkManager;
    private history: any;
    
    constructor() {
      // Will be initialized when setHistory is called
      this.history = null;
    }
    
    static getInstance(): DeepLinkManager {
      if (!DeepLinkManager.instance) {
        DeepLinkManager.instance = new DeepLinkManager();
      }
      return DeepLinkManager.instance;
    }
    
    /**
     * Set the history object from your router
     */
    setHistory(history: any): void {
      this.history = history;
    }
    
    /**
     * Navigate to a specific route with options
     */
    navigateTo(path: string, options: NavigationOptions = {}): void {
      // Focus the window first if needed
      this.focusWindow();
      
      if (this.history) {
        // Use React Router's history API for in-app navigation
        if (options.replace) {
          this.history.replace(path, options.state || {});
        } else {
          this.history.push(path, options.state || {});
        }
      } else {
        // Fallback to window.location if history isn't available
        if (options.state) {
          // Serialize state in URL parameters if needed
          const params = new URLSearchParams();
          Object.entries(options.state).forEach(([key, value]) => {
            params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          });
          
          const url = path.includes('?') 
            ? `${path}&${params.toString()}`
            : `${path}?${params.toString()}`;
            
          window.location.href = url;
        } else {
          window.location.href = path;
        }
      }
    }
    
    /**
     * Extract route parameters from the URL
     */
    extractRouteParams(paramPattern: string): Record<string, string> {
      const params: Record<string, string> = {};
      
      // Extract from path parameters
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/').filter(Boolean);
      
      const patternSegments = paramPattern.split('/').filter(Boolean);
      
      patternSegments.forEach((segment, index) => {
        if (segment.startsWith(':') && index < pathSegments.length) {
          const paramName = segment.substring(1);
          params[paramName] = pathSegments[index];
        }
      });
      
      // Extract from query parameters
      const searchParams = new URLSearchParams(window.location.search);
      for (const [key, value] of searchParams.entries()) {
        // Try to parse JSON if it looks like an object
        if (value.startsWith('{') && value.endsWith('}')) {
          try {
            params[key] = JSON.parse(value);
            continue;
          } catch (e) {
            // If parsing fails, use as string
          }
        }
        params[key] = value;
      }
      
      return params;
    }
    
    /**
     * Try to focus on the current window/tab
     */
    private focusWindow(): void {
      // Check if we're in a ServiceWorker context
      if (typeof window === 'undefined') {
        return;
      }
      
      // Focus the window if needed
      if (window.focus) {
        window.focus();
      }
    }
    
    /**
     * Parse deep link from push notification data
     */
    parseDeepLink(data: any): { path: string; options: NavigationOptions } {
      // Default path
      let path = '/';
      let options: NavigationOptions = {};
      
      // Extract path from notification data
      if (data) {
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // If it's not valid JSON, use as is
            path = data;
          }
        }
        
        if (typeof data === 'object') {
          // Handle different types of notification payloads
          if (data.url) {
            path = data.url;
          } else if (data.path) {
            path = data.path;
          } else if (data.screen) {
            path = `/${data.screen}`;
          } else if (data.type === 'call' && data.callId) {
            path = `/calls/${data.callId}`;
            options.state = {
              callData: data,
              autoJoin: data.autoJoin || false
            };
          } else if (data.type === 'message' && data.conversationId) {
            path = `/messages/${data.conversationId}`;
            options.state = { messageData: data };
          }
        }
      }
      
      return { path, options };
    }
  }
  
  export default DeepLinkManager;
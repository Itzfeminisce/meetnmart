import { supabase } from '@/integrations/supabase/client';
import { axiosInstance, useAxios } from '@/lib/axiosUtils';
import { getEnvVar } from '@/lib/utils';
import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
  isSupported,
} from 'firebase/messaging';

// Your Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.APP_FIREBASE_API_KEY,

//   authDomain: process.env.APP_FIREBASE_AUTH_DOMAIN,

//   projectId: process.env.APP_FIREBASE_PROJECT_ID,

//   storageBucket: process.env.APP_FIREBASE_STORAGE_BUCKET,

//   messagingSenderId: process.env.APP_FIREBASE_MESSAGING_SENDER_ID,

//   appId: process.env.APP_FIREBASE_APP_ID

// };

const axiosClient = useAxios()

// const firebaseConfig = {
//     apiKey: getEnvVar("APP_FIREBASE_API_KEY"),
//     authDomain: getEnvVar("APP_FIREBASE_AUTH_DOMAIN"),
//     projectId: getEnvVar("APP_FIREBASE_PROJECT_ID"),
//     storageBucket: getEnvVar("APP_FIREBASE_STORAGE_BUCKET"),
//     messagingSenderId: getEnvVar("APP_FIREBASE_MESSAGING_SENDER_ID"),
//     appId: getEnvVar("APP_FIREBASE_APP_ID")
//   }; 

const firebaseConfig = {
  apiKey: "AIzaSyDu8wQNkLXO35cdGrFPJlMMgbc1K2op7Us",
  authDomain: "meetnmart.firebaseapp.com",
  projectId: "meetnmart",
  storageBucket: "meetnmart.firebasestorage.app",
  messagingSenderId: "82487166386",
  appId: "1:82487166386:web:78f5db4c34a1774943d0ab",
  measurementId: "G-S49WCFPB80"
};

class FCMService {
  private messaging: any;
  private vapidKey: string = "BA9HZnAj842QYZp6fwHbHg3LQfwO1FucxxSs5CX4D52szFqfi5Qq93PCTRL5unlkpyt8Z3MhB7jBogVtUbLOiuk"; // getEnvVar("APP_FIREBASE_VAPID_KEY") || '';
  private tokenRefreshInterval: number = 1000 * 60 * 60 * 24 * 7; // 7 days
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private app: any;
  private static instance: FCMService;

  constructor() {
    this.initialize();
  }

  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Initialize Firebase and FCM
   */
  async initialize(): Promise<void> {
    try {
      const isSupp = await isSupported();
      if (!isSupp) {
        console.warn('Firebase messaging is not supported in this browser');
        return;
      }

      this.app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(this.app);

      console.log('FCM Service initialized');
    } catch (error) {
      console.error('Failed to initialize FCM service:', error);
    }
  }

  /**
   * Request FCM token and store it
   */
  async requestToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        await this.initialize();
        if (!this.messaging) return null;
      }

      const currentToken = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });

      if (currentToken) {
        await this.saveTokenToServer(currentToken);
        this.setupTokenRefresh();
        return currentToken;
      } else {
        console.warn('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  /**
   * Save token to your backend
   */
  private async saveTokenToServer(token: string): Promise<void> {
    try {
      // Get current user ID - implement based on your auth system
      const userId = await this.getCurrentUserId();

      const { browserName, osName, ipAddress } = await this.getBrowserInfo()

      await axiosClient.Post('/messaging/token', {
        user_id: userId,
        token: token,
        device_type: "web",
        device_info: {
          browser_name: browserName,
          os_name: osName,
          ip_address: ipAddress,
        },
      })

      // console.log('Token saved to server successfully', response);
      localStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Error saving token to server:', error);
    }
  }

  /**
   * Get current user ID from your auth system
   */
  private async getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    return data.user.id;
  }

  /**
   * Set up periodic token refresh
   */
  private setupTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    this.tokenRefreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, this.tokenRefreshInterval);
  }

  /**
   * Refresh FCM token
   */
  async refreshToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        await this.initialize();
        if (!this.messaging) return null;
      }

      // Delete existing token
      const oldToken = localStorage.getItem('fcmToken');
      if (oldToken) {
        await deleteToken(this.messaging);
      }

      // Request new token
      return await this.requestToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  /**
   * Set up foreground message handler
   */
  onForegroundMessage(callback: (payload: any) => void): () => void {
    if (!this.messaging) return () => { };

    return onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  }

  /**
   * Unregister FCM token on logout
   */
  async unregisterToken(): Promise<boolean> {
    try {
      if (!this.messaging) return false;

      await deleteToken(this.messaging);

     await axiosClient.Delete(`/messaging/token/${localStorage.getItem('fcmToken')}`);

      localStorage.removeItem('fcmToken');

      console.log('Token unregistered successfully');
      return true;
    } catch (error) {
      console.error('Failed to unregister token:', error);
      return false;
    }
  }

  async getBrowserInfo(){
    const userAgent = navigator.userAgent;
    const browserName = userAgent.includes('Chrome') ? 'Chrome' : 'Unknown';
    const osName = userAgent.includes('Windows') ? 'Windows' : 'Unknown';
    const ipAddress =  await this.getIpAddress()
    return { browserName, osName, ipAddress };
  }

  async getIpAddress(){
    const ipAddress = localStorage.getItem('ipAddress')
    if (ipAddress) return ipAddress


    const response = await fetch('https://api.ipify.org?format=json').then(res => res.json())

    localStorage.setItem('ipAddress', response?.ip ?? "")
    return response.ip
  }
} 

export default FCMService;
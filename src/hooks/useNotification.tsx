import { useState, useEffect, useCallback } from 'react';
import NotificationManager, { NotificationOptions } from '../engines/NotificationManager';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
// import {  } from 'react-router-dom';

/**
 * Custom hook for managing notifications
 */
export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notificationManager = NotificationManager.getInstance();
  const { isAuthenticated, isInitialized: isAuthInitialized } = useAuth()

  // const history = {
  //   push() {
  //     console.log("Navigating to somewhere");

  //   }, pop() {
  //     console.log("Navigating from somewhere");
  //   }
  // }



  const  initializeNotifications = useCallback(async () => {
    try {
      // Pass history to DeepLinkManager for navigation
      const DeepLinkManager = (await import('../engines/DeepLinkManager')).default;
      DeepLinkManager.getInstance().setHistory(history);

      // Initialize notification manager with handlers
      const success = await notificationManager.initialize({
        onPermissionChanged: (status) => {
          setPermissionStatus(status);
        },
        onTokenRefreshed: (newToken) => {
          setToken(newToken);
        },
        onNotificationReceived: (payload) => {
          console.log('Notification received in app:', payload);
        },
      });

      setIsInitialized(success);

      if (success) {
        // Get current permission status
        setPermissionStatus(notificationManager.getPermissionStatus());

        // Get token if already available
        if (isAuthInitialized && isAuthenticated) {
          const currentToken = await notificationManager.getToken();
          setToken(currentToken);
        }
      }
    } catch (err) {
      console.error('Failed to initialize notifications:', err);
      toast.error('Failed to initialize notification services');
    }
  },[])


  // Request notification permissions
  const requestPermission = useCallback(async () => {
    try {
      if (!isInitialized) {
        throw new Error('Notification services not initialized');
      }

      const success = await notificationManager.requestPermissionAndRegister();
      if (success) {
        setPermissionStatus(notificationManager.getPermissionStatus());
        const currentToken = await notificationManager.getToken();
        setToken(currentToken);
      }

      return success;
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request notification permission');
      return false;
    }
  }, [isInitialized, notificationManager]);

  // Subscribe to a topic
  const subscribeToTopic = useCallback(async (topic: string) => {
    try {
      if (!isInitialized) {
        throw new Error('Notification services not initialized');
      }

      return await notificationManager.subscribeToTopic(topic);
    } catch (err) {
      console.error(`Error subscribing to topic ${topic}:`, err);
      setError(`Failed to subscribe to topic: ${topic}`);
      return false;
    }
  }, [isInitialized, notificationManager]);

  // Unsubscribe from a topic
  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    try {
      if (!isInitialized) {
        throw new Error('Notification services not initialized');
      }

      return await notificationManager.unsubscribeFromTopic(topic);
    } catch (err) {
      console.error(`Error unsubscribing from topic ${topic}:`, err);
      setError(`Failed to unsubscribe from topic: ${topic}`);
      return false;
    }
  }, [isInitialized, notificationManager]);

  // Show a custom notification
  const showNotification = useCallback(async (options: NotificationOptions) => {
    try {
      if (!isInitialized) {
        throw new Error('Notification services not initialized');
      }

      return await notificationManager.showNotification(options);
    } catch (err) {
      console.error('Error showing notification:', err);
      setError('Failed to show notification');
      return false;
    }
  }, [isInitialized, notificationManager]);

  // Clean up on logout
  const unregister = useCallback(async () => {
    try {
      if (!isInitialized) return true;

      const success = await notificationManager.unregister();
      if (success) {
        setToken(null);
      }

      return success;
    } catch (err) {
      console.error('Error unregistering notifications:', err);
      setError('Failed to unregister notification services');
      return false;
    }
  }, [isInitialized, notificationManager]);


  return {
    isInitialized,
    permissionStatus,
    token,
    error,
    requestPermission,
    initializeNotifications,
    subscribeToTopic,
    unsubscribeFromTopic,
    showNotification,
    unregister
  };
};
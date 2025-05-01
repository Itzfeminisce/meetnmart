import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { STORAGE_KEY, useAuth } from './AuthContext';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { User } from '@/hooks/api-hooks';
import { getEnvVar } from '@/utils/env';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  emit: () => {},
  on: () => {},
  off: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
  url?: string;
  options?: {
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    autoConnect?: boolean;
    path?: string;
    transports?: string[];
    withCredentials?: boolean;
  };
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  url = getEnvVar("VITE_APP_SOCKET_URL") || 'http://localhost:4000',
  options = {
    reconnectionAttempts: 1,
    reconnectionDelay: 10,
    autoConnect: false,
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    withCredentials: true,
  },
}) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const {value} = useLocalStorage<User>(STORAGE_KEY)

  const connect = () => {
    if (socket) return;

    console.log('Connecting to socket with URL:', url);
    console.log('Socket options:', options);
    console.log('Auth token:', value?.token ? 'Present' : 'Missing');

    const socketInstance = io(url, {
      ...options,
      auth: value?.token ? { token: value.token } : undefined,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      console.error('Error details:', error);
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const emit = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, value?.token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
        emit,
        on,
        off,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

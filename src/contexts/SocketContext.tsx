// src/contexts/SocketContext.tsx
import { getEnvVar } from '@/lib/utils';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextState {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  lastPong: number | null;
  connect: (token?: string) => void;
  disconnect: () => void;
  ping: () => void;
  subscribe: (event: string, listener: (...args: any[]) => void) => void
  publish: (event: string, ...data: any[]) => void
}

interface SocketProviderProps {
  children: React.ReactNode;
  url?: string;
  autoConnect?: boolean;
  defaultToken?: string;
  tokenKey?: string;
}

// Default context value
const defaultContextValue: SocketContextState = {
  socket: null,
  isConnected: false,
  connectionError: null,
  lastPong: null,
  connect: () => {},
  disconnect: () => {},
  ping: () => {},
  subscribe: () => {},
  publish: () => {},
};

// Create context
const SocketContext = createContext<SocketContextState>(defaultContextValue);

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  url = getEnvVar("VITE_API_URL") || 'http://localhost:4000',
  autoConnect = true,
  defaultToken,
  tokenKey = 'token'
}) => {
  // Use refs for values that shouldn't trigger re-renders
  const socketRef = useRef<Socket | null>(null);
  const tokenRef = useRef<string | undefined>(defaultToken);

  // State that should trigger re-renders
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastPong, setLastPong] = useState<number | null>(null);
  
  // Connect function
  const connect = useCallback((token?: string) => {
    // Store token in ref if provided
    if (token !== undefined) {
      tokenRef.current = token;
    }
    
    // Disconnect existing socket if any
    if (socketRef.current) {
      console.log('Closing existing socket connection');
      socketRef.current.disconnect();
    }
    
    try {
      console.log(`Connecting to socket server at ${url}`);
      setConnectionError(null);
      
      // Connection options
      const connectionOptions: any = {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        auth: {},
        forceNew: true,
      };
      
      // Add auth token if available
      if (tokenRef.current) {
        connectionOptions.auth[tokenKey] = tokenRef.current;
        console.log(`Auth token added with key: ${tokenKey}`);
      }
      
      // Create socket instance
      const newSocket = io(url, connectionOptions);
      socketRef.current = newSocket;
      
      // Setup event listeners
      setupSocketListeners(newSocket);
      
    } catch (err) {
      console.error('Error initializing socket:', err);
      setConnectionError(err instanceof Error ? err.message : 'Unknown error');
      socketRef.current = null;
    }
  }, [url, tokenKey]);

  // Setup socket event listeners
  const setupSocketListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => {
      console.log(`Socket connected with ID: ${socket.id}`);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('connection_confirmed', (data) => {
      console.log('Server confirmed connection:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected. Reason: ${reason}`);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnectionError(err.message);
      setIsConnected(false);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setConnectionError(typeof err === 'string' ? err : 'Socket error');
    });

    socket.on('pong', (data) => {
      console.log('Received pong:', data);
      setLastPong(data.timestamp);
    });
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Manually disconnecting socket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Ping server to check connection
  const ping = useCallback(() => {
    if (socketRef.current && isConnected) {
      console.log('Sending ping to server');
      const startTime = Date.now();
      
      // Try with callback first
      socketRef.current.emit('ping', (response) => {
        const latency = Date.now() - startTime;
        console.log(`Ping response received in ${latency}ms:`, response);
        setLastPong(response.timestamp);
      });
    } else {
      console.warn('Cannot ping: socket not connected');
    }
  }, [isConnected]);

  // Subscribe to a room
  const subscribe = useCallback((event: string, listener: (...args: any[]) => void) => {
    if (socketRef.current && isConnected) {
      console.log(`Subscribing to event: ${event}`);
      socketRef.current.on(event, listener);
    } else {
      console.warn(`Cannot subscribe to ${event}: socket not connected`);
    }
  }, [isConnected]);

  // Publish an event
  const publish = useCallback((event: string, ...data: any[]) => {
    if (socketRef.current && isConnected) {
      console.log(`Publishing an event: ${event}`);
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot publish to ${event}: socket not connected`);
    }
  }, [isConnected]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('Component unmounting, closing socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [autoConnect, connect]);

  // Setup periodic ping if connected
  useEffect(() => {
    if (isConnected && socketRef.current) {
      const pingInterval = setInterval(() => {
        if (socketRef.current && isConnected) {
          socketRef.current.emit('ping', (response) => {
            setLastPong(response.timestamp);
          });
        }
      }, 30000); // Ping every 30 seconds
      
      return () => {
        clearInterval(pingInterval);
      };
    }
  }, [isConnected, ping]);

  // Context value
  const contextValue: SocketContextState = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    lastPong,
    connect,
    disconnect,
    ping,
    subscribe, 
    publish
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};
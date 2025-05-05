
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room } from 'livekit-client';

interface RoomContextType {
  roomId: string;
  setRoomId: (roomId: string) => void;
  room: Room | null;
  setRoom: (room: Room | null) => void;
  isConnecting: boolean;
  setIsConnecting: (isConnecting: boolean) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);

  // Clean up the room when the component unmounts
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect(true);
      }
    };
  }, [room]);

  const value: RoomContextType = {
    roomId,
    setRoomId,
    room,
    setRoom,
    isConnecting,
    setIsConnecting
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};

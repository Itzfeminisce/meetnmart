import { Room } from 'livekit-client';
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { RoomContext } from '@livekit/components-react';
import { getEnvVar } from '@/lib/utils';
import livekitService from '@/services/livekitService';



const MeetnMartRoomProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [room] = useState(() => new Room({}));

    // You can manage room connection lifecycle here
    useEffect(() => {
        livekitService.connectToRoom()
        return () => {
            room.disconnect();
        };
    }, [room]);

    return (
        <RoomContext.Provider value={room}>
            {children}
        </RoomContext.Provider>
    )
}

export { MeetnMartRoomProvider }
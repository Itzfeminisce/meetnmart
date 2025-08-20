import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface UserAvatarProps {
    name: string;
    avatar: string | null;
    online: boolean;
    size?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = React.memo(({ name, avatar, online, size = "h-12 w-12" }) => (
    <div className="relative">
        <Avatar className={size}>
            <AvatarImage src={avatar || "U"} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        {online && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        )}
    </div>
));

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video } from 'lucide-react';
import { Chat, ChatAction, Conversation } from '@/types';
import UserAvatar from './UserAvatar';
import ChatItemMenu from './ChatItemMenu';
import TypingIndicator from './TypingIndicator';

interface ChatHeaderProps {
    chat: Conversation & Pick<Chat, 'name' | 'avatar' | "online">;
    onBack: () => void;
    onAction: (action: ChatAction) => void;
    isTyping?: boolean;
    isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({ 
    chat, 
    onBack, 
    onAction, 
    isTyping = false, 
    isOnline = true 
}) => {
    return (
        <div className="px-2 py-2 container">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="lg"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                <UserAvatar 
                    name={chat.name} 
                    avatar={chat.avatar} 
                    online={chat.online} 
                    size="h-10 w-10" 
                />

                <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <div className="text-sm text-muted-foreground truncate">
                        {isTyping ? (
                            <TypingIndicator />
                        ) : isOnline ? (
                            'Online'
                        ) : (
                            'Last seen recently'
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Video className="h-4 w-4" />
                    </Button>
                    <ChatItemMenu chat={chat} onAction={onAction} />
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if chat data or typing status changes
    return (
        prevProps.chat.id === nextProps.chat.id &&
        prevProps.chat.name === nextProps.chat.name &&
        prevProps.isTyping === nextProps.isTyping &&
        prevProps.isOnline === nextProps.isOnline
    );
}); 

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
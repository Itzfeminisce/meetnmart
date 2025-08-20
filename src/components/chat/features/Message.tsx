import React from 'react';
import { FileText } from 'lucide-react';
import { Conversation } from '@/types';
import MessageStatusIcon from './MessageStatusIcon';

interface MessageProps {
    message: Conversation;
}

const Message: React.FC<MessageProps> = React.memo(({ message }) => {
    const isMe = message.sender === 'me';
    
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1`}>
            <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-1' : 'order-2'}`}>
                <div
                    className={`px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                        isMe
                            ? 'bg-market-orange text-foreground'
                            : 'bg-muted'
                    }`}
                >
                    {message.type === 'file' ? (
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-base">{message.text}</span>
                        </div>
                    ) : (
                        <p className="text-base">{message.text}</p>
                    )}
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    {isMe && <MessageStatusIcon status={message.status} />}
                </div>
            </div>
        </div>
    );
});

Message.displayName = 'Message';

export default Message;
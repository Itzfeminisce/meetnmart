import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, SendHorizonal } from 'lucide-react';
import { AttachmentType } from '@/types';
import AttachmentMenu from './AttachmentMenu';

interface MessageInputProps {
    message: string;
    participantId: string;
    onChange: (message: string) => void;
    onSend: () => void;
    showAttachments: boolean;
    onToggleAttachments: () => void;
    onAttachment: (type: AttachmentType) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleTyping: (isTyping: boolean, participantId: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = React.memo(({
    message,
    participantId,
    onChange,
    onSend,
    showAttachments,
    onToggleAttachments,
    onAttachment,
    fileInputRef,
    handleTyping
}) => {

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }, [onSend]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onAttachment('file');
        }
    }, [onAttachment]);

    const isMessageEmpty = !message.trim();

    return (
        <div className="relative py-4 border-t">
            {showAttachments && (
                <AttachmentMenu onAttachment={onAttachment} fileInputRef={fileInputRef} />
            )}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 flex-shrink-0"
                    onClick={onToggleAttachments}
                >
                    <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => {
                        handleTyping(e.target.value.length > 0, participantId);
                        onChange(e.target.value)
                    }}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                />
                <Button
                    onClick={onSend}
                    disabled={isMessageEmpty}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-0 rounded-full flex-shrink-0 mr-2 bg-market-orange text-black"
                >
                    <SendHorizonal className="h-4 w-4" />
                </Button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
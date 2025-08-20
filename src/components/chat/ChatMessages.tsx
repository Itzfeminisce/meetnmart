import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateRandomId } from '@/lib/utils';
import { useGetConversations } from '@/hooks/api-hooks';
import { AttachmentType, ChatAction, Conversation } from '@/types';
import { useChatStore } from '@/contexts/store/conversation';
import { useSocketChat, useTypingStatus } from './features/useSocketChat';
import { ChatHeader, ChatNotFound, Message, MessageInput } from './features';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '../AppHeader';

// Loading component - memoized to prevent re-renders
const LoadingState = React.memo(() => (
    <div className="flex flex-1 p-4 justify-center items-center ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
));
LoadingState.displayName = 'LoadingState';

// Empty state component - memoized to prevent re-renders
const EmptyState = React.memo(() => (
    <div className="h-screen flex flex-col">
        <ChatNotFound />
    </div>
));
EmptyState.displayName = 'EmptyState';

// Message list component - memoized to prevent unnecessary re-renders
const MessageList = React.memo<{
    conversations: Conversation[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
}>(({ conversations, messagesEndRef }) => (
    <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
            {conversations.map((message) => (
                <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    </ScrollArea>
));
MessageList.displayName = 'MessageList';

const ChatMessages: React.FC = () => {
    const { profile } = useAuth()
    const { conversationId } = useParams<{ conversationId: string }>();
    const [newMessage, setNewMessage] = useState<string>('');
    const [showAttachments, setShowAttachments] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Preserve location state immediately and prevent loss during re-renders
    const [preservedChatData] = useState(() => {
        const locationState = location.state;

        return {
            chat: locationState?.chat || null,
            participantId: locationState?.participantId || searchParams.get("participantId"),
            name: locationState?.name || null
        };
    });

    if (!preservedChatData.chat) {
        navigate('/messages', { replace: true })
        return;
    }

    // Use preserved data instead of location state
    const participantId = preservedChatData.participantId;
    const chatData = preservedChatData.chat;
    const participantName = preservedChatData.name;

    // Memoize API call to prevent unnecessary re-renders
    const { isLoading, status } = useGetConversations({ conversationId });
    const conversations = useChatStore(ctx => ctx.conversations);
    const appendConversation = useChatStore(ctx => ctx.appendConversation);

    // Memoized scroll function
    const scrollToBottom =() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // Memoized socket integration
    const { sendMessage, handleTyping: sendTypingStatus, isTyping } = useSocketChat({
        conversationId,
        onNewMessage: scrollToBottom
    });


    // Handle typing status with a custom hook
    const { handleTyping } = useTypingStatus(
        () => sendTypingStatus(true, participantId),    // Fire your "typing" update
        () => sendTypingStatus(false, participantId),    // Fire your "stopped typing" update
        3000 // 3 seconds
    )
    
    useEffect(() => {
        scrollToBottom();
    }, [sendMessage, status, conversations, scrollToBottom]);


    // Auto-scroll when new messages arrive - optimized with useMemo
    const conversationCount = useMemo(() => conversations.length, [conversations.length]);

    // Memoized message send handler
    const handleSendMessage = useCallback(() => {
        if (!newMessage.trim() || !participantId) return;

        const newMsg: Conversation = {
            id: chatData?.id || generateRandomId(),
            text: newMessage,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: 'sent'
        };

        // Send via socket
        sendMessage(newMsg.text, participantId, chatData?.id);

        // Add to local state
        appendConversation(newMsg);

        // Reset input
        setNewMessage('');
        setShowAttachments(false);
    }, [newMessage, participantId, sendMessage, appendConversation]);

    // Memoized attachment handler
    const handleAttachment = useCallback((type: AttachmentType) => {
        setShowAttachments(false);
        console.log(`Attaching ${type}`);
        // Handle attachment logic here
    }, []);

    // Memoized navigation handler
    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // Memoized chat action handler
    const handleChatAction = useCallback((action: ChatAction) => {
        if (conversationCount === 0) return;

        switch (action) {
            case 'pin':
                console.log('Pin chat');
                break;
            case 'delete':
                console.log('Delete chat');
                break;
            case 'archive':
                console.log('Archive chat');
                break;
            case 'report':
                console.log('Report chat');
                break;
        }
    }, [conversationCount]);

    // Memoized attachment toggle handler
    const handleToggleAttachments = useCallback(() => {
        setShowAttachments(prev => !prev);
    }, []);

    // Memoized message input change handler
    const handleMessageChange = useCallback((value: string) => {
        setNewMessage(value);
    }, []);

    // Memoized chat header props
    const chatHeaderProps = useMemo(() => ({
        chat: chatData || (conversations.length > 0 ? conversations[0] : null),
        onBack: handleBack,
        onAction: handleChatAction,
        isOnline: profile?.is_online || false,
        participantName: participantName,
        isTyping
    }), [chatData, isTyping, conversations, handleBack, handleChatAction, participantName]);

    // Memoized message input props
    const messageInputProps = useMemo(() => ({
        message: newMessage,
        participantId,
        onChange: handleMessageChange,
        onSend: handleSendMessage,
        showAttachments,
        onToggleAttachments: handleToggleAttachments,
        onAttachment: handleAttachment,
        fileInputRef,
        handleTyping
    }), [
        handleTyping,
        newMessage,
        participantId,
        handleMessageChange,
        handleSendMessage,
        showAttachments,
        handleToggleAttachments,
        handleAttachment
    ]);


    // Early returns for loading and empty states
    // if (isLoading) {
    //     return <LoadingState />;
    // }

    if (!isLoading && conversationCount === 0) {
        return <EmptyState />;
    }

    return (
        <div className="h-screen flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden border-none">
                <ChatHeader {...chatHeaderProps} />

                <Separator />

                {isLoading ? <LoadingState /> : (
                    <MessageList
                        conversations={conversations}
                        messagesEndRef={messagesEndRef}
                    />
                )}


                <MessageInput {...messageInputProps} />
            </Card>
        </div>
    );
};

export default ChatMessages;
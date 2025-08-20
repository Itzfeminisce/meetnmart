import { useEffect, useCallback, useRef, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useChatStore } from '@/contexts/store/conversation';
import { Conversation } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

interface UseSocketChatProps {
    conversationId?: string;
    onNewMessage?: (message: Conversation & Partial<{ conversationId: string; text: string }>) => void;
}

export const useSocketChat = ({ conversationId, onNewMessage }: UseSocketChatProps) => {
    const socket = useSocket();
    const appendConversation = useChatStore(ctx => ctx.appendConversation);
    const updateChat = useChatStore(ctx => ctx.updateChat);

    const [isTyping, setIsTyping] = useState(false);

    // Memoize the handler to prevent unnecessary re-subscriptions
    const handleCreateChatEvent = useCallback((data: Conversation & { conversationId: string; text: string }) => {

        // Only append if it's for the current conversation
        if (conversationId || data.conversationId === conversationId) {
            const receivedConversation = {
                ...data,
                sender: "other",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'delivered',
            } as typeof data
            appendConversation(receivedConversation);
            onNewMessage?.(receivedConversation);
        }
    }, [conversationId, updateChat, appendConversation, onNewMessage]);

    const handleTypingEvent = useCallback((data: { conversationId: string; participantId: string; typing: boolean }) => {
        if (data.conversationId === conversationId) {
            setIsTyping(data.typing);
        }

    }, [conversationId]);


    // Subscribe to typing events when the component mounts
    useEffect(() => {
        socket.subscribe('CREATE_CHAT_EVENT.TYPING', handleTypingEvent);

        return () => {
            socket.unsubscribe('CREATE_CHAT_EVENT.TYPING', handleTypingEvent);
        };
    }, [socket, handleTypingEvent]);

    useEffect(() => {
        socket.subscribe('CREATE_CHAT_EVENT', handleCreateChatEvent);

        return () => {
            socket.unsubscribe('CREATE_CHAT_EVENT', handleCreateChatEvent);
        };
    }, [socket, handleCreateChatEvent]);

    const sendMessage = useCallback((message: string, participantId: string, conversationId: string) => {
        socket.publish('CREATE_CHAT_EVENT', {
            to: participantId,
            conversationId,
            message,
        });
    }, [socket]);

    // Handle typing events
    const handleTyping = useCallback((isTyping: boolean, participantId: string) => {
        socket.publish('CREATE_CHAT_EVENT.TYPING', {
            conversationId,
            participantId,
            typing: isTyping,
        });
    }, [socket, conversationId]);

    return { sendMessage, handleTyping, isTyping };
};



export function useTypingStatus(onTypingStart: () => void, onTypingStop: () => void, delay = 3000) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleTyping = useCallback(() => {
        if (!timeoutRef.current) {
            onTypingStart()
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            onTypingStop()
            timeoutRef.current = null
        }, delay)
    }, [onTypingStart, onTypingStop, delay])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return { handleTyping }
}


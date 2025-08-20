import { Chat, Conversation } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';

type ChatStore = {
    quickMessage?: string | null;
    addQuickMessage: (quickMessage: string) => void;

    chats: Chat[];
    conversations: Conversation[];
    setChats: (chats: Chat[]) => void;
    deleteChat: (chatId: string) => void;
    updateChat: (chatId: string, updatedChat: Partial<Chat>) => void;
    setConversations: (conversation: Conversation[]) => void;
    appendConversation: (conversation: Conversation) => void;

    refetch: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({

    quickMessage: null,
    conversations: [],
    chats: [],

    refetch: () => {
        set((state) => ({
            chats: [...state.chats],
            conversations: [...state.conversations]
        }));
    },

    // Quick message management
    addQuickMessage: (quickMessage: string) => set({ quickMessage }),

    // Chats management
    setChats: (chats: Chat[]) => set({ chats }),
    updateChat: (chatId: string, updatedChat: Partial<Chat>) => {
        set((state) => ({
            chats: state.chats.map(chat =>
                chat.id === chatId ? { ...chat, ...updatedChat } : chat
            )
        }))
    },
    deleteChat: (chatId: string) => set((state) => ({
        chats: state.chats.filter(chat => chat.id !== chatId)
    })),

    // Conversations management
    setConversations: (conversations: Conversation[]) => set({ conversations }),
    appendConversation: (conversation: Conversation) => set((state) => ({
        conversations: [...state.conversations, conversation]
    })),
}));

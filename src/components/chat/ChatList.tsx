import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Pin,
  Archive,
  Flag,
  Trash2,
  Plus
} from 'lucide-react';
import AppHeader from '../AppHeader';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGetMessages } from '@/hooks/api-hooks';
import { useChatStore } from '@/contexts/store/conversation';
import { Chat, Conversation } from '@/types';
import { useSocketChat } from './features/useSocketChat';
import { Separator } from '../ui/separator';
import { useSocket } from '@/contexts/SocketContext';

type ChatAction = 'pin' | 'delete' | 'archive' | 'report';

interface ChatItemProps {
  chat: Chat;
  onPin: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onNavigate: (chat: Chat) => void;
}

interface ChatItemMenuProps {
  chat: Chat;
  onAction: (action: ChatAction) => void;
}

interface UserAvatarProps {
  name: string;
  avatar: string | null;
  online: boolean;
  size?: string;
}

// Typing Indicator Component - Memoized with display name
const TypingIndicator = React.memo(() => (
  <div className="flex items-center gap-1 text-muted-foreground">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-sm">typing...</span>
  </div>
));
TypingIndicator.displayName = 'TypingIndicator';

// User Avatar Component - Memoized with proper props comparison
const UserAvatar = React.memo<UserAvatarProps>(({ name, avatar, online, size = "h-12 w-12" }) => (
  <div className="relative">
    <Avatar className={size}>
      <AvatarImage src={avatar || undefined} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
    {online && (
      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
    )}
  </div>
));
UserAvatar.displayName = 'UserAvatar';

// Chat Item Menu Component - Memoized with stable callback
const ChatItemMenu = React.memo<ChatItemMenuProps>(({ chat, onAction }) => {
  const handleAction = useCallback((action: ChatAction) => {
    onAction(action);
  }, [onAction]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleAction('pin')}>
          <Pin className="h-4 w-4 mr-2" />
          {chat.pinned ? 'Unpin' : 'Pin'} Chat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('archive')}>
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleAction('report')}>
          <Flag className="h-4 w-4 mr-2" />
          Report
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
ChatItemMenu.displayName = 'ChatItemMenu';

// Chat Item Component - Optimized with proper memoization
const ChatItem = React.memo<ChatItemProps>(({
  chat,
  onPin,
  onDelete,
  onNavigate
}) => {

  // listen for new messages and typing status
  const updateChat = useChatStore(ctx => ctx.updateChat);

  const { isTyping, } = useSocketChat({
    conversationId: chat.id, // No specific conversationId for chat list
    onNewMessage: (newMessage) => {
      updateChat(newMessage.conversationId, {
        lastMessage: newMessage.text,
      });
    }
  });

  const isMobile = useIsMobile();

  const handleMenuAction = useCallback((action: ChatAction) => {
    switch (action) {
      case 'pin':
        onPin(chat.id);
        break;
      case 'delete':
        onDelete(chat.id);
        break;
      case 'archive':
        console.log(`Archive action for chat ${chat.id}`);
        break;
      case 'report':
        console.log(`Report action for chat ${chat.id}`);
        break;
      default:
        console.log(`Action ${action} not implemented`);
    }
  }, [chat.id, onPin, onDelete]);

  const handleClick = useCallback(() => {
    if (isMobile) {
      onNavigate(chat);
    }
  }, [isMobile, onNavigate, chat]);

  const formattedTime = useMemo(() => new Date(chat.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }), [chat.timestamp]);

  return (
    <div
      className="relative flex items-center gap-3 p-3  cursor-pointer transition-all duration-200 hover:bg-accent  group border-b border-muted last:border-0"
      onClick={handleClick}
    >
      {chat.pinned && (
        <Pin className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
      )}

      <UserAvatar name={chat.name} avatar={chat.avatar} online={chat.online} />

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm truncate">{chat.name}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedTime}
          </span>
        </div>
        <div className="flex items-center justify-between max-w-full">
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <p className={cn(`text-sm text-muted-foreground line-clamp-1`, chat.unread > 0 && 'font-medium')}>
              {chat.lastMessage}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {chat.unread > 0 && (
          <Badge variant="default" className="h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse">
            {chat.unread}
          </Badge>
        )}

        <ChatItemMenu chat={chat} onAction={handleMenuAction} />
      </div>
    </div>
  );
});
ChatItem.displayName = 'ChatItem';

// Empty State Component - Static memoized component
const EmptyState = React.memo(() => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
      <p className="text-muted-foreground">Your messages will appear here when you start a conversation</p>
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Loading State Component - Static memoized component
const LoadingState = React.memo(() => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));
LoadingState.displayName = 'LoadingState';

// Main Chat List Component
const ChatList: React.FC = () => {
  const { isLoading, refetch } = useGetMessages();
  const chats = useChatStore(ctx => ctx.chats);
  const updateChat = useChatStore(ctx => ctx.updateChat);
  const deleteChat = useChatStore(ctx => ctx.deleteChat);
  const navigate = useNavigate();

  const socket = useSocket()

  const [searchQuery, setSearchQuery] = useState<string>('');


  useEffect(() => {
    // // Subscribe to chat read events
    socket.subscribe('CHAT_READ_EVENT.EVENT_INCOMING', (data) => {
      refetch()
    });

    return () => {
      // Unsubscribe when component unmounts
      socket.unsubscribe('CREATE_CHAT_EVENT.READ');
      socket.unsubscribe('CHAT_READ_EVENT.EVENT_INCOMING');
    };
  }, [])


  // Filter and sort chats based on search and pinned status
  const filteredAndSortedChats = useMemo(() => {
    if (!chats) return [];

    const filtered = chats.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [chats, searchQuery]);




  // Stable callbacks with useCallback
  const handlePinChat = useCallback((chatId: string) => {
    const chat = chats?.find(c => c.id === chatId);
    if (chat) {
      updateChat(chatId, { pinned: !chat.pinned });
    }
  }, [chats, updateChat]);

  const handleDeleteChat = useCallback((chatId: string) => {
    deleteChat(chatId);
  }, [deleteChat]);

  const handleNavigateToChat = useCallback((chat: Chat) => {
    // Fixed navigation with proper state structure
    navigate(`/messages/${chat.id}`, {
      state: {
        chat: chat,
        participantId: chat.participantId,
        name: chat.name
      }
    });

    // Mark chat as read
    updateChat(chat.id, { unread: 0 });
    socket.publish('CREATE_CHAT_EVENT.READ', {
      conversationId: chat.id,
    });
  }, [navigate]);

  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);


  // Render function for chat items to prevent recreation
  const renderChatItem = useCallback((chat: Chat) => (
    <ChatItem
      key={chat.id}
      chat={chat}
      onPin={handlePinChat}
      onDelete={handleDeleteChat}
      onNavigate={handleNavigateToChat}
    />
  ), [handlePinChat, handleDeleteChat, handleNavigateToChat]);

  return (
    <>
      <AppHeader
        title="Messages"
        subtitle={`${filteredAndSortedChats.length} chats`}
        search={{
          onSearch: handleSearch,
          placeholder: "Search chats..."
        }}
        // showBackButton
        // onBackClick={handleBackClick}
      />

      <div className="flex-1 overflow-hidden md:container">
        {isLoading ? (
          <LoadingState />
        ) : filteredAndSortedChats.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="space-y-1">
              {filteredAndSortedChats.map(renderChatItem)}
            </div>
          </ScrollArea>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
};

export default ChatList;

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pin, Archive, Flag, Trash2 } from 'lucide-react';
import { ChatAction, Conversation } from '@/types';

interface ChatItemMenuProps {
    chat: Conversation;
    onAction: (action: ChatAction) => void;
    isPinned?: boolean;
}

const ChatItemMenu: React.FC<ChatItemMenuProps> = React.memo(({ chat, onAction, isPinned = false }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction('pin')}>
                <Pin className="h-4 w-4 mr-2" />
                {isPinned ? 'Unpin' : 'Pin'} Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('archive')}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('report')}>
                <Flag className="h-4 w-4 mr-2" />
                Report
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => onAction('delete')}
                className="text-destructive focus:text-destructive"
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
));

ChatItemMenu.displayName = 'ChatItemMenu';

export default ChatItemMenu;
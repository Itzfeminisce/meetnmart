import React from 'react';
import ChatList from './ChatList';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatMessages from './ChatMessages';

const ChatLayout: React.FC = () => {
    const isMobile = useIsMobile()
    return (
        <div className="h-screen flex flex-col md:flex-row">
            {/* Left pane: ChatList */}
            <div className="md:w-1/3 border-r border-gray-200 h-full">
                <ChatList />
            </div>

            {/* Right pane: ChatMessages */}
            {!isMobile && (
                <div className="flex-1 h-full">
                <ChatMessages />
            </div>
            )}
            
        </div>
    );
};

export default ChatLayout;

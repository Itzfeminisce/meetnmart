import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { MessageStatus } from '@/types';

interface MessageStatusIconProps {
    status: MessageStatus;
}

const MessageStatusIcon: React.FC<MessageStatusIconProps> = React.memo(({ status }) => {
    const iconProps = "h-3 w-3 flex-shrink-0";

    switch (status) {
        case 'sent':
            return <Check className={`${iconProps} text-muted-foreground`} />;
        case 'delivered':
            return <CheckCheck className={`${iconProps} text-muted-foreground`} />;
        case 'read':
            return <CheckCheck className={`${iconProps} text-blue-500`} />;
        default:
            return null;
    }
});

MessageStatusIcon.displayName = 'MessageStatusIcon';

export default MessageStatusIcon;
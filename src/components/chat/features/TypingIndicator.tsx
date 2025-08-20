import React from 'react';

const TypingIndicator: React.FC = React.memo(() => (
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

export default TypingIndicator;
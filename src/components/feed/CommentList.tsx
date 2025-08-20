import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { FeedInteractionItem } from '@/types';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';



interface CommentListProps {
    comments: FeedInteractionItem[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
    const isMobile = useIsMobile()
    const MAX_COMMENT_LENGTH = isMobile ? 35 : 150;
    const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});

    const toggleComment = (idx: number) => {
        setExpandedComments(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    return (
        <div className="space-y-1.5">
            {comments.map((comment, idx) => {
                const isExpanded = expandedComments[idx];
                const message = comment.metadata.message;
                const shouldTruncate = message.length > MAX_COMMENT_LENGTH;
                const displayMessage = shouldTruncate && !isExpanded
                    ? message.slice(0, MAX_COMMENT_LENGTH) + '...'
                    : message;

                return (
                    <div key={idx} className="group flex items-start gap-1.5 py-1 border-b border-b-muted/30 rounded transition-colors pb-2">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                            <AvatarFallback><User className="h-2.5 w-2.5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-sm md:text-sm">
                                <span className="text-foreground/80 leading-tight">{comment.author.name}</span>
                            </div>
                            <div className="flex flex-col text-xs md:text-sm mt-0.5">
                                <div className="flex items-center gap-1">
                                    <span className="text-foreground text-sm">{displayMessage}</span>
                                </div>
                                <div className="flex items-center gap-x-2 mt-0.5">
                                    <span className="text-xs md:text-xs text-muted-foreground/60">{formatTimeAgo(comment.created_at)}</span>
                                    {shouldTruncate && (
                                        <button
                                            onClick={() => toggleComment(idx)}
                                            className="text-xs md:text-sm text-muted-foreground hover:underline"
                                        >
                                            {isExpanded ? 'See less' : 'See more'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
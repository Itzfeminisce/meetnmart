import React, { useState } from 'react';
import { Send, User, ChevronDown, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CommentList } from './CommentList';
import { FeedInteraction, FeedInteractionItem } from '@/types';
import { useFeedStore } from '@/contexts/Store';
import { quickActions } from '@/data/pulse-mocks';

interface CommentSectionProps {
  cardType: 'buyer_request' | 'seller_offer' | 'delivery_ping';
  onSendComment: (comment: string) => void;
  showQuickActions?: boolean;
  initialComments?: FeedInteractionItem[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  cardType,
  onSendComment,
  showQuickActions = false,
  initialComments = []
}) => {
  const { profile } = useAuth();
  const [comment, setComment] = useState('');
  const [visibleComments, setVisibleComments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const remainingComments = initialComments.length - visibleComments;

  const handleSendComment = async () => {
    if (comment.trim()) {
      setIsSubmitting(true);
      try {
        await onSendComment(comment);
        setComment('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleQuickAction = async (action: string) => {
    setSubmittingAction(action);
    try {
      await onSendComment(action);
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleLoadMore = () => {
    setVisibleComments(prev => prev + 4);
  };

  const getButtonColor = () => {
    switch (cardType) {
      case "buyer_request":
        return "bg-market-blue hover:bg-market-blue/90";
      case "seller_offer":
        return "bg-market-green hover:bg-market-green/90";
      case "delivery_ping":
        return "bg-market-purple hover:bg-market-purple/90";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  const getBadgeStyle = () => {
    switch (cardType) {
      case "buyer_request":
        return "bg-market-blue/10 text-market-blue hover:bg-market-blue/20 border-market-blue/20";
      case "seller_offer":
        return "bg-market-green/10 text-market-green hover:bg-market-green/20 border-market-green/20";
      case "delivery_ping":
        return "bg-market-purple/10 text-market-purple hover:bg-market-purple/20 border-market-purple/20";
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    }
  };

  return (
    <div className="animate-in slide-in-from-top-2 duration-200">
      <Card className="border-t-0 rounded-t-none">
        <CardContent className="p-2">
          <div className="space-y-4">
            {/* Comments List */}
            {initialComments.length > 0 && (
              <div className="mb-4">
                <CommentList comments={initialComments.slice(0, visibleComments)} />
                {remainingComments > 0 && (
                  <button
                    className="flex items-center justify-start text-xs text-muted-foreground hover:text-primary transition-colors py-1 px-2 rounded-full hover:bg-muted/50"
                    onClick={handleLoadMore}
                  >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    View {remainingComments} more {remainingComments === 1 ? 'comment' : 'comments'}
                  </button>
                )}
              </div>
            )}

            {/* Quick Action Badges */}
            {/* {showQuickActions && ( */}
            <div className="relative">
              <div className="flex overflow-x-auto gap-2 scrollbar-none">
                {quickActions[cardType].map((action, index) => (
                  <React.Fragment key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`rounded-full cursor-pointer transition-colors ${getBadgeStyle()} px-3 md:py-1.5 text-sm font-medium flex-shrink-0 relative ${submittingAction === action.text ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={() => handleQuickAction(action.message)}
                        >
                          {submittingAction === action.text ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <span className="mr-1.5">{action.icon}</span>
                          )}
                          {action.text}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* )} */}

            {/* Comment Input */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar} alt="User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-9 rounded-full"
                  disabled={isSubmitting}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className={`h-9 w-9 rounded-full ${getButtonColor()}`}
                      onClick={handleSendComment}
                      disabled={!comment.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
// components/FeedCard.tsx
import React, { useState, useRef, memo, useCallback, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  Truck,
  Clock,
  Users,
  Zap,
  Timer,
  MapPin,
  Send,
  User,
  Image as ImageIcon,
  X,
  Bookmark,
  Share2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CommentSection } from './CommentSection';
import { FeedItem } from '@/types';
import { useFeedStore } from '@/contexts/Store';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useCreateFeedInteraction } from '@/hooks/api-hooks';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { sluggify } from '@/lib/utils';
import { ShareDialog } from '../ShareDialog';
import { Link } from 'react-router-dom';

// Default values for feed card configuration
const DEFAULT_CONFIG = {
  contentCharLimit: 10,
  collapsedLines: 2,
} as const;

const isRecentItem = (timestamp: string) => {
  const now = new Date();
  const itemTime = new Date(timestamp);
  const diffMs = now.getTime() - itemTime.getTime();
  return diffMs < 60 * 60 * 1000; // 1hr in milliseconds
};

interface FeedCardProps {
  item: FeedItem;
  onCall?: (id: string) => void;
  onDelivery?: (id: string) => void;
  onShare?: (id: string) => void;
  photos?: string[];
  isFirstCard?: boolean;
  config?: Partial<typeof DEFAULT_CONFIG>;
}

// Helper functions (not components, so no memo needed)
const getCardStyle = (type: FeedItem['type'], createdAt: string) => {
  const baseStyle = 'hover:shadow-md transition-shadow rounded-none rounded-lg';
  const recentStyle = isRecentItem(createdAt)
    ? 'relative before:absolute before:inset-[-1px] before:rounded-lg before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-pink-500 before:animate-gradient-x before:bg-[length:200%_100%] before:-z-10 after:absolute after:inset-[1px] after:rounded-lg after:bg-background after:-z-[5]'
    : '';

  switch (type) {
    case "buyer_request":
      return `${baseStyle} ${recentStyle} bg-market-blue/5 dark:bg-market-blue/20`;
    case "seller_offer":
      return `${baseStyle} ${recentStyle} bg-market-green/5 dark:bg-market-green/20`;
    case "delivery_ping":
      return `${baseStyle} ${recentStyle} bg-market-purple/5 dark:bg-market-purple/20`;
    default:
      return `${baseStyle} ${recentStyle} dark:border-gray-700`;
  }
};

const getTypeIcon = (type: FeedItem['type']) => {
  switch (type) {
    case "buyer_request":
      return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case "seller_offer":
      return <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case "delivery_ping":
      return <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    default:
      return null;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

// Memoized ActionButtons component
const ActionButtons = memo(({
  item,
  showComments,
  setShowComments,
  handleCall,
  handleDelivery,
  handleSave,
  handleShare,
  profile,
  isBookmarked
}: {
  item: FeedItem;
  showComments: boolean;
  setShowComments: (show: boolean) => void;
  handleCall: () => void;
  handleDelivery: () => void;
  handleSave: () => void;
  handleShare: () => void;
  profile: any;
  isBookmarked: boolean;
}) => (
  <div className="flex gap-2 flex-shrink-0">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-3 h-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Chat with seller</p>
      </TooltipContent>
    </Tooltip>

    {item.type === 'seller_offer' && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleCall}
          >
            <Phone className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Call seller</p>
        </TooltipContent>
      </Tooltip>
    )}

    {item.delivery_preference && item.type !== "delivery_ping" && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleDelivery}
          >
            <Truck className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Request delivery</p>
        </TooltipContent>
      </Tooltip>
    )}

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`h-8 w-8 p-0 ${isBookmarked ? 'text-primary' : ''}`}
          onClick={handleSave}
        >
          <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isBookmarked ? 'Saved' : 'Save for later'}</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handleShare}
        >
          <Share2 className="w-3 h-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share this post</p>
      </TooltipContent>
    </Tooltip>
  </div>
));

export const FeedCard: React.FC<FeedCardProps> = memo(({
  item,
  onCall,
  onDelivery,
  onShare,
  isFirstCard = false,
  config = {}
}) => {
  const feedsStore = useFeedStore()
  const { profile } = useAuth()
  const [showComments, setShowComments] = useState(isFirstCard);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const feedsInteraction = useCreateFeedInteraction()
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile()
  const [isShareOpen, setShareOpen] = useState(false);

  // Memoized calculations
  const cardStyle = useMemo(() => getCardStyle(item.type, item.created_at), [item.type, item.created_at]);
  const typeIcon = useMemo(() => getTypeIcon(item.type), [item.type]);
  const timeAgo = useMemo(() => formatTimeAgo(item.created_at), [item.created_at]);
  const isBookmarked = useMemo(() =>
    item.interactions.items.some(it => it.type === "bookmark" && it.author.id === profile.id),
    [item.interactions.items, profile.id]
  );
  const feedStats = useMemo(() => feedsStore.getFeedStats(item.id), [feedsStore, item.id]);

  // Memoized callbacks
  const handleCall = useCallback(() => onCall?.(item.id), [onCall, item.id]);
  const handleDelivery = useCallback(() => onDelivery?.(item.id), [onDelivery, item.id]);
  const handleSave = useCallback(() => {
    feedsInteraction.mutate({
      feed_id: item.id,
      type: "bookmark",
      author: item.author,
    })
  }, [feedsInteraction, item.id, item.author]);

  const handleShare = useCallback(() => {
    setShareOpen(true)
  }, []);

  const handleSendComment = useCallback((comment: string) => {
    feedsInteraction.mutate({
      feed_id: item.id,
      type: "comment",
      author: item.author,
      metadata: {
        message: comment,
      }
    })
  }, [feedsInteraction, item.id, item.author]);

  // Add intersection observer for view tracking
  const { elementRef } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    onIntersect: useCallback(() => {
      feedsInteraction.mutate({
        feed_id: item.id,
        type: "view",
        author: item.author,
      })
    }, [feedsInteraction, item.id, item.author]),
    id: item.id,
  });

  // Merge default config with provided config
  const { contentCharLimit, collapsedLines } = useMemo(() =>
    ({ ...DEFAULT_CONFIG, ...config }), [config]
  );

  // Memoized images component
  const ImagesSection = useMemo(() => {
    if (!item.images?.length) return null;

    return (
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory">
          {item.images.map((photo, index) => (
            <div
              key={`${item.id}-img-${index}`}
              className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden snap-start"
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }, [item.images, item.id]);

  return (
    <div className="space-y-2" ref={elementRef}>
      <Card className={cardStyle}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-5 h-5 flex-shrink-0 capitalize">
                        {typeIcon}
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild className='flex items-center justify-center gap-x-2 max-w-[90%]'>
                          <Link to={`/feeds/${encodeURIComponent(sluggify(item.title))}-${item.id}`} state={{ fromList: item.id }}>
                            <h3 className="text-lg font-semibold truncate sm:group-hover:line-clamp-none sm:group-hover:whitespace-normal">
                              {item.title}
                            </h3>
                            <div className="">
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          View Details
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0 ml-2 capitalize">
                      {item.category.name}
                    </span>
                  </div>
                  <div className="relative">
                    <p className={`text-sm md:text-base text-muted-foreground ${!isExpanded && item.content.length > contentCharLimit && isMobile ? `line-clamp-${collapsedLines}` : ''} transition-all duration-200`}>
                      {item.content}
                    </p>
                    {item.content.length > contentCharLimit && (
                      <div className="sm:hidden">
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="text-xs text-primary hover:text-primary/80 font-medium mt-1 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              Show less
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180">
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </>
                          ) : (
                            <>
                              Read more
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden sm:block">
                <ActionButtons
                  item={item}
                  showComments={showComments}
                  setShowComments={setShowComments}
                  handleCall={handleCall}
                  handleDelivery={handleDelivery}
                  handleSave={handleSave}
                  handleShare={handleShare}
                  profile={profile}
                  isBookmarked={isBookmarked}
                />
              </div>
            </div>

            {/* Image Section */}
            {ImagesSection}

            {/* Details Section */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {item.price_range && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Price:</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold capitalize">
                    {item.price_range}
                  </span>
                </div>
              )}
              {item.quantity && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Qty:</span>
                  <span className="capitalize">{item.quantity}</span>
                </div>
              )}
              {item.needed_by && (
                <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                  <Timer className="w-3 h-3" />
                  <span className="font-medium capitalize">{item.needed_by}</span>
                </div>
              )}
              {item.delivery_preference && (
                <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                  <Truck className="w-3 h-3" />
                  <span className="text-xs font-medium capitalize">Delivery Available</span>
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate capitalize">{item.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span className="capitalize">{timeAgo}</span>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="sm:hidden mt-2 flex items-center justify-end w-full">
                <ActionButtons
                  item={item}
                  showComments={showComments}
                  setShowComments={setShowComments}
                  handleCall={handleCall}
                  handleDelivery={handleDelivery}
                  handleSave={handleSave}
                  handleShare={handleShare}
                  profile={profile}
                  isBookmarked={isBookmarked}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 justify-between w-full md:justify-end">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{feedStats.views || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bookmark className="w-3 h-3" />
                  <span>{feedStats.bookmarks || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{feedStats.comments || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="w-3 h-3" />
                  <span>{0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showComments && (
        <CommentSection
          cardType={item.type}
          onSendComment={handleSendComment}
          showQuickActions={isFirstCard}
          initialComments={item.interactions?.items?.filter(it => it.type === "comment")}
        />
      )}

      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setShareOpen(false)}
        url={`${location.origin}/feeds/${encodeURIComponent(sluggify(item.title))}-${item.id}`}
        title={item.title}
        description={item.content}
      />
    </div>
  );
});

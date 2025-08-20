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
  ExternalLink,
  Heart
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
import { cn, sluggify } from '@/lib/utils';
import { ShareDialog } from '../ShareDialog';
import { Link } from 'react-router-dom';
import { ComingSoon } from '../PremiumFeature';
import { ImageGridView } from '../ImageGridView';
import { useBottomSheet } from '../ui/bottom-sheet-modal';
import { FeedCardPosterSheetBody, FeedCardPosterSheetFooter, FeedCardPosterSheetHeader } from './FeedCardPosterSheet';

// Default values for feed card configuration
const DEFAULT_CONFIG = {
  contentCharLimit: 10,
  collapsedLines: 1,
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
  const baseStyle = 'hover:shadow-md transition-shadow rounded-none border-x-0 bg-red-500';
  const recentStyle = isRecentItem(createdAt)
    ? 'relative before:absolute before:inset-[-1px] before:rounded-none before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-pink-500 before:animate-gradient-x before:bg-[length:200%_100%] before:-z-10 after:absolute after:inset-[1px] after:rounded-none after:bg-background after:-z-[5]'
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
      return <Users className={cn("w-4 h-4 text-blue-600 dark:text-blue-400",)} />;
    case "seller_offer":
      return <Zap className={cn("w-4 h-4 text-green-600 dark:text-green-400",)} />;
    case "delivery_ping":
      return <Truck className={cn("w-4 h-4 text-purple-600 dark:text-purple-400",)} />;
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
  <div className="grid md:flex grid-cols-2 items-center justify-center p-2 md:p-0  gap-2 border-y md:border-none border-y-muted/20  w-full">
   
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(`text-xs h-6 p-0 m-0 text-foreground/90`)}
          onClick={handleSave}
        >
          <Heart className={cn(`w-2 h-2 `, isBookmarked && 'text-red-600')} />
          Bookmark{isBookmarked && 'ed'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isBookmarked ? 'Saved' : 'Save for later'}</p>
      </TooltipContent>
    </Tooltip>
    {/* )}   */}

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="w-full text-foreground/90 text-xs h-6"
          onClick={handleShare}
        >
          <Share2 className="w-2 h-2" />
          Share
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
  const [showComments, setShowComments] = useState(true) //isFirstCard);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const feedsInteraction = useCreateFeedInteraction()
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile()
  const [isShareOpen, setShareOpen] = useState(false);
  const { open: openPosterSheet } = useBottomSheet()

  // Memoized calculations
  const cardStyle = useMemo(() => getCardStyle(item.type, item.created_at), [item.type, item.created_at]);
  const typeIcon = useMemo(() => getTypeIcon(item.type), [item.type]);
  const timeAgo = useMemo(() => formatTimeAgo(item.created_at), [item.created_at]);
  const isBookmarked = useMemo(() =>
    item.interactions.items.some(it => it.type === "bookmark" && it.author.id === profile.id),
    [item, profile.id]
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

  const ImagesSection = useMemo(() => {
    if (!item.images?.length) return null;

    return (
      <div onClick={handleStartConversation} className="cursor-pointer">
        <ImageGridView
          images={item.images}
          itemId={item.id}
        />
      </div>
    );
  }, [item.images, item.id]);

  function handleStartConversation() {
    openPosterSheet({
      data: item,
      header: <FeedCardPosterSheetHeader />,
      body: <FeedCardPosterSheetBody />,
      footer: <FeedCardPosterSheetFooter />,
      viewId: sluggify(item.title)
    })
  }

  return (
    <div className="space-y-2" ref={elementRef}>
      <Card className={cn(cardStyle)}>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4 p-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-5 h-5 flex-shrink-0 capitalize">
                        {typeIcon}
                      </div>
                      <span className="hidden md:inline-flex text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0 ml-2 capitalize">
                        {item.category.name}
                      </span>
                    </div>
                    <span className="md:hidden  text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0 ml-2 capitalize">
                      {item.category.name}
                    </span>

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
                  <Tooltip>
                    <TooltipTrigger asChild className='flex items-start justify-start gap-x-2'>
                      <Link to={`/feeds/${encodeURIComponent(sluggify(item.title))}-${item.id}`} state={{ fromList: item.id }}>
                        <h3 className="text-base font-medium text-foreground/80">
                          {item.title}
                          {/* <ExternalLink className="w-3 h-3 inline-flex ml-2 mb-2" /> */}
                        </h3>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      View Details
                    </TooltipContent>
                  </Tooltip>
                  <div className="relative">
                    <div
                      onClick={handleStartConversation}
                      className={`
                          text-base text-muted-foreground cursor-pointer
                          ${!isExpanded && item.content.length > contentCharLimit ? `line-clamp-${collapsedLines}` : ''}
                          whitespace-pre-wrap break-words  overflow-hidden
                        `}
                    >
                      {item.content}
                    </div>
                    {/* <p className={`text-sm md:text-base text-muted-foreground ${!isExpanded && item.content.length > contentCharLimit && isMobile ? `line-clamp-${collapsedLines}` : ''} transition-all duration-200`}>
                      {item.content}
                    </p> */}
                    {item.content.length > contentCharLimit && (
                      <div className="">
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="text-xs text-foreground/80 hover:text-primary/80 font-medium mt-1 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              See less
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180">
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </>
                          ) : (
                            <>
                              See more
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* <button className='text-sm text-muted-foreground pt-1 inline-flex gap-x-1'>Posted by <span className='font-bold'>Rotimi Oluwafemi</span></button> */}
                </div>
              </div>

              {/* Desktop Action Buttons */}
              {/* <div className="hidden sm:block">
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
              </div> */}
            </div>

            {/* Image Section */}
            {ImagesSection}

            {/* Details Section */}
            <div className="flex flex-wrap items-center gap-x-2 p-2 ">
              {item.price_range && (
                <div className="flex text-sm  items-center space-x-1 text-muted-foreground capitalize">
                  <span className="">Price:</span>
                  <span className="text-foreground/80 dark:text-foreground/80 font-medium text-market-green">
                    {item.price_range}
                  </span>
                </div>
              )}
              {item.quantity && (
                <div className="flex items-center space-x-1 text-sm  text-muted-foreground capitalize">
                  <span className=" ">Qty:</span>
                  <span className="text-foreground/80 dark:text-foreground/80 font-medium">{item.quantity}</span>
                </div>
              )}
              {item.needed_by && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {/* <Timer className="w-3 h-3" /> */}
                  <span className=" ">Urgency:</span>
                  <span className="text-foreground/80 dark:text-foreground/80 font-medium">{item.needed_by}</span>
                </div>
              )}
              {/* {item.delivery_preference && (
                <div className="flex items-center  text-sm space-x-1">
                  <Truck className="w-3 h-3" />
                  <span className="text-foreground/80 dark:text-foreground/80 font-medium ">Delivery Available</span>
                </div>
              )} */}
            </div>

            {/* Footer Section */}
            <div className="flex flex-wrap items-center justify-between  px-2  gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {/* <MapPin className="w-3 h-3" /> */}
                  <span className="">Location:</span>
                  <span className="text-foreground/80 dark:text-foreground/80 font-medium">{item.location}</span>
                </div>
                <div className="flex items-center text-sm space-x-1 text-muted-foreground">
                  {/* <Clock className="w-3 h-3" /> */}
                  <span className="">Posted:</span>
                  <span className="text-foreground/80 dark:text-foreground/80 font-medium firstcapitalize">{timeAgo}</span>
                </div>
              </div>

              {/* Mobile Action Buttons items-center justify-end */}
              <div className="flex items-center md:p-2 gap-4 justify-end w-full">
                <div className="flex items-center space-x-1 text-sm ">
                  <Eye className="w-3 h-3" />
                  <span>{feedStats.views || 0}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm ">
                  <Bookmark className="w-3 h-3" />
                  <span>{feedStats.bookmarks || 0}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm ">
                  <MessageCircle className="w-3 h-3" />
                  <span>{feedStats.comments || 0}</span>
                </div>
                {/* <div className="flex items-center space-x-1 ">
                  <Phone className="w-3 h-3" />
                  <span>{0}</span>
                </div>
                <div className="flex items-center space-x-1 ">
                  <Truck className="w-3 h-3" />
                  <span>{0}</span>
                </div> */}
              </div>
              {isMobile && (
                <ActionButtons
                  item={item}
                  showComments={showComments}
                  setShowComments={handleStartConversation}
                  handleCall={handleCall}
                  handleDelivery={handleDelivery}
                  handleSave={handleSave}
                  handleShare={handleShare}
                  profile={profile}
                  isBookmarked={isBookmarked}
                />
              )}


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

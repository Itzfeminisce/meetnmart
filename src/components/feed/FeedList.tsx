// components/FeedList.tsx
import React, { memo, useMemo, useEffect, useRef, useCallback } from 'react';
import { FeedCard } from './FeedCard';
import { FeedItem } from '@/types';
import { useFeedStore } from '@/contexts/Store';

interface FeedListProps {
  onCall?: (id: string) => void;
  onDelivery?: (id: string) => void;
}

// Memoized empty state component
const EmptyState = memo(() => (
  <div className="text-center py-8 text-gray-500">
    Hang on! We're getting you some update.
  </div>
));

// Loading indicator with better visibility
const LoadingIndicator = memo(() => (
  <div className="text-center py-8">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <p className="mt-3 text-gray-500 font-medium">Loading more...</p>
  </div>
));

// Optimized memoized feed item component
const MemoizedFeedCard = memo(({ 
  item, 
  onCall, 
  onDelivery, 
  isFirstCard 
}: {
  item: FeedItem;
  onCall?: (id: string) => void;
  onDelivery?: (id: string) => void;
  isFirstCard: boolean;
}) => (
  <FeedCard
    item={item}
    onCall={onCall}
    onDelivery={onDelivery}
    isFirstCard={isFirstCard}
  />
), (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isFirstCard === nextProps.isFirstCard &&
    prevProps.onCall === nextProps.onCall &&
    prevProps.onDelivery === nextProps.onDelivery
  );
});

export const FeedList: React.FC<FeedListProps> = memo(({
  onCall,
  onDelivery
}) => {
  const feedsStore = useFeedStore();
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const observerInstanceRef = useRef<IntersectionObserver | null>(null);
  
  // Memoize feeds and pagination with shallow comparison
  const { filteredFeeds, pagination, hasMore } = useMemo(() => ({
    filteredFeeds: feedsStore.filteredFeeds,
    pagination: feedsStore.pagination,
    hasMore: feedsStore.pagination?.has_more ?? false
  }), [feedsStore.filteredFeeds, feedsStore.pagination]);

  // Optimized loadMore with debouncing
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !pagination) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextOffset = pagination.offset + pagination.limit;
      await feedsStore.refetch({
        p_offset: nextOffset,
        limit: pagination.limit
      });
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, pagination?.offset, pagination?.limit, feedsStore.refetch]);

  // Optimized Intersection Observer with cleanup
  useEffect(() => {
    // Cleanup previous observer
    if (observerInstanceRef.current) {
      observerInstanceRef.current.disconnect();
    }

    if (!hasMore) return;

    observerInstanceRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { 
        threshold: 0.8, // Higher threshold for better loader visibility
        rootMargin: '20px' // Small margin to ensure loader is visible
      }
    );

    if (observerRef.current) {
      observerInstanceRef.current.observe(observerRef.current);
    }

    return () => {
      if (observerInstanceRef.current) {
        observerInstanceRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoadingMore]);

  // Early return for empty state
  if (filteredFeeds.length === 0) {
    return (
      <main className="max-w-6xl mx-auto">
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="">
      <div className="space-y-4 bg-background">
        {filteredFeeds.map((item, index) => (
          <MemoizedFeedCard
            key={`feed-${item.id}`} // More descriptive key
            item={item}
            onCall={onCall}
            onDelivery={onDelivery}
            isFirstCard={index === 0}
          />
        ))}
      </div>
      
      {/* Loading trigger element - always visible when hasMore */}
      {hasMore && (
        <div 
          ref={observerRef} 
          className="py-4 min-h-[100px] flex items-center justify-center"
        >
          {isLoadingMore && <LoadingIndicator />}
          {!isLoadingMore && (
            <div className="text-center text-gray-400 text-sm">
              Scroll for more
            </div>
          )}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && filteredFeeds.length > 0 && (
        <div className="text-center py-8 text-gray-500 border-t border-gray-200 mt-8">
          <p>You're caught up. That's it for now.</p>
          {/* <p className="text-sm mt-1 text-gray-400">
            {pagination?.total ? `${filteredFeeds.length} of ${pagination.total} items` : `${filteredFeeds.length} items`}
          </p> */}
        </div>
      )}
    </main>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for FeedList component
  return (
    prevProps.onCall === nextProps.onCall &&
    prevProps.onDelivery === nextProps.onDelivery
  );
});
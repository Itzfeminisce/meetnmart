// components/FeedList.tsx
import React, { memo, useMemo, useEffect, useRef, useCallback } from 'react';
import { FeedCard } from './FeedCard';
import { FeedItem } from '@/types';
import { useFeedStore } from '@/contexts/Store';

interface FeedListProps {
  onCall?: (id: string) => void;
  onDelivery?: (id: string) => void;
  itemsPerPage?: number;
}

// Memoized empty state component
const EmptyState = memo(() => (
  <div className="text-center py-8 text-gray-500">
    No items available at the moment.
  </div>
));

// Loading indicator
const LoadingIndicator = memo(() => (
  <div className="text-center py-4">
    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
    <p className="mt-2 text-gray-500">Loading more...</p>
  </div>
));

// Memoized feed item component
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
));

export const FeedList: React.FC<FeedListProps> = memo(({
  onCall,
  onDelivery,
  itemsPerPage = 5
}) => {
  const feedsStore = useFeedStore();
  const [displayedCount, setDisplayedCount] = React.useState(itemsPerPage);
  const [isLoading, setIsLoading] = React.useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Memoize filtered feeds
  const filteredFeeds = useMemo(() => feedsStore.filteredFeeds, [feedsStore.filteredFeeds]);
  
  // Memoize displayed items
  const displayedItems = useMemo(() => 
    filteredFeeds.slice(0, displayedCount), 
    [filteredFeeds, displayedCount]
  );
  
  const hasMore = displayedCount < filteredFeeds.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate loading delay (remove in production)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + itemsPerPage, filteredFeeds.length));
      setIsLoading(false);
    }, 1000);
  }, [isLoading, hasMore, itemsPerPage, filteredFeeds.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  // Reset displayed count when filtered feeds change
  useEffect(() => {
    setDisplayedCount(itemsPerPage);
  }, [filteredFeeds, itemsPerPage]);

  if (filteredFeeds.length === 0) {
    return (
      <main className="max-w-6xl mx-auto">
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto">
      <div className="space-y-4">
        {displayedItems.map((item, index) => (
          <MemoizedFeedCard
            key={item.id}
            item={item}
            onCall={onCall}
            onDelivery={onDelivery}
            isFirstCard={index === 0}
          />
        ))}
      </div>
      
      {/* Loading trigger element */}
      {hasMore && (
        <div ref={observerRef} className="py-4">
          {isLoading && <LoadingIndicator />}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && displayedItems.length > itemsPerPage && (
        <div className="text-center py-8 text-gray-500">
          No more items to load
        </div>
      )}
    </main>
  );
});
// // components/FeedList.tsx
// import React, { memo, useMemo } from 'react';
// import { FeedCard } from './FeedCard';
// import { FeedItem } from '@/types';
// import { useFeedStore } from '@/contexts/Store';

// interface FeedListProps {
//   onCall?: (id: string) => void;
//   onDelivery?: (id: string) => void;
// }

// // Memoized empty state component
// const EmptyState = memo(() => (
//   <div className="text-center py-8 text-gray-500">
//     No items available at the moment.
//   </div>
// ));

// // Memoized feed item component
// const MemoizedFeedCard = memo(({ 
//   item, 
//   onCall, 
//   onDelivery, 
//   isFirstCard 
// }: {
//   item: FeedItem;
//   onCall?: (id: string) => void;
//   onDelivery?: (id: string) => void;
//   isFirstCard: boolean;
// }) => (
//   <FeedCard
//     key={item.id}
//     item={item}
//     onCall={onCall}
//     onDelivery={onDelivery}
//     isFirstCard={isFirstCard}
//   />
// ));

// export const FeedList: React.FC<FeedListProps> = memo(({
//   onCall,
//   onDelivery
// }) => {
//   const feedsStore = useFeedStore();
  
//   // Memoize filtered feeds to prevent unnecessary recalculations
//   const filteredFeeds = useMemo(() => feedsStore.filteredFeeds, [feedsStore.filteredFeeds]);
  
//   if (filteredFeeds.length === 0) {
//     return (
//       <main className="max-w-6xl mx-auto">
//         <EmptyState />
//       </main>
//     );
//   }

//   return (
//     <main className="max-w-6xl mx-auto">
//       <div className="space-y-4">
//         {filteredFeeds.map((item, index) => (
//           <MemoizedFeedCard
//             key={item.id}
//             item={item}
//             onCall={onCall}
//             onDelivery={onDelivery}
//             isFirstCard={index === 0}
//           />
//         ))}
//       </div>
//     </main>
//   );
// });
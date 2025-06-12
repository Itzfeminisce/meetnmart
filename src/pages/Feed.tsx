import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CategoryFilter } from '@/components/feed/CategoryFilter';
import { FeedCard } from '@/components/feed/FeedCard';
import { FeedForm } from '@/components/feed/FeedForm';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedList } from '@/components/feed/FeedList';
import { FeedOverview } from '@/components/feed/FeedOverview';
import { MarketScroll } from '@/components/feed/MarketScroll';
import {
  markets
} from '@/data/pulse-mocks';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { useGetFeedInteractionStats, useGetFeeds } from '@/hooks/api-hooks';
import { FindMarketCard } from '@/components/feed/FindMarketCard';


export default function FeedPage() {
  const [selectedMarket, setSelectedMarket] = useState(markets[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTime] = useState(new Date());
  const isMobile = useIsMobile()

  useGetFeeds()
  useGetFeedInteractionStats()


  // Action handlers
  const handleCall = (id: string) => {
    console.log('Calling:', id);
    // In real app, would initiate call
  };


  const handleDelivery = (id: string) => {
    console.log('Delivery request:', id);
    // In real app, would create delivery request
  };

  return (
    <>
      <FeedHeader
        selectedMarket={selectedMarket}
        onMarketChange={setSelectedMarket}
        // markets={markets}
        currentTime={currentTime}
        onFormOpenChange={setIsFormOpen}
      />

      <div className="container space-y-4 mb-[5rem]">
        <FeedOverview marqueeSpeed={"medium"} />


        <CategoryFilter />

        <div className="md:grid grid-cols-5 gap-4 hidden">
          <div className="col-span-3">
            <FeedList
              onCall={handleCall}
              onDelivery={handleDelivery}
            />
          </div>

          {/* Right */}
          <div className="col-span-2 bg-muted-foreground/5 h-fit p-4 rounded-md sticky top-[6rem] max-h-[calc(100vh-10rem)] scrollbar-small overflow-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-x-2">
                <FindMarketCard
                  className="bg-market-orange"
                  linkHref='/markets'
                  name='Explore Markets'
                />
                <FindMarketCard
                  className="bg-market-purple"
                  linkHref='/markets'
                  name='Talk to Sellers'
                />
              </div>

              <Separator className='my-8' />
              <FeedForm
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
              />
              {/* <br />
              <Separator className='my-8' />
              <br />
              <MarketScroll
                markets={marketDetails}
                selectedMarket={selectedMarket}
                onMarketChange={setSelectedMarket}
              />
              <br />
              <Separator className='my-8' />
              <br />

              <CategoryFilter /> */}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <FeedList
            onCall={handleCall}
            onDelivery={handleDelivery}
          />
        </div>
      </div>

      {isMobile && (
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent side="bottom" className="h-auto p-4">
            <FeedForm
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
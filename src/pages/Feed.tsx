import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CategoryFilter } from '@/components/feed/CategoryFilter';
import { FeedCard } from '@/components/feed/FeedCard';
// import { FeedForm } from '@/components/feed/FeedForm.v1';
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
import { Store, User } from 'lucide-react';
import SEO from '../components/SEO';
import { FeedForm } from '@/components/feed/FeedForm';
import { FeedForm as FeedFormDesktop } from '@/components/feed/FeedForm.v1';
import { useNavigate, useSearchParams } from 'react-router-dom';


export default function FeedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      <SEO
        title="Feeds | MeetnMart"
        description="Discover local markets, connect with sellers, and explore products in your area. Browse through our community feed to find the best deals and connect with nearby vendors."
        keywords="local markets, sellers, community feed, local vendors, marketplace, deals, nearby sellers"
      />
      <FeedHeader
        selectedMarket={selectedMarket}
        onMarketChange={setSelectedMarket}
        // markets={markets}
        currentTime={currentTime}
        onFormOpenChange={setIsFormOpen}
      />

      <div className="md:container mb-[5rem]">
        {/* <FeedOverview marqueeSpeed={"medium"} /> */}


        <div className="md:sticky top-0 z-10 bg-background md:py-4">
          <CategoryFilter />
        </div>

        <div className="md:grid grid-cols-5 gap-4 hidden">
          <div className="col-span-3">
            <FeedList
              onCall={handleCall}
              onDelivery={handleDelivery}
            />
          </div>

          {/* Right */}
          <div className="col-span-2 bg-muted-foreground/5 h-fit p-4 rounded-md sticky top-[6rem] max-h-[calc(100vh-13rem)] scrollbar-small overflow-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-x-2">
                <FindMarketCard
                  icon={Store}
                  className="bg-market-orange"
                  linkHref='/markets'
                  name='Explore Markets'
                />
                <FindMarketCard
                  icon={User}
                  className="bg-market-purple"
                  linkHref='/markets'
                  name='Sellers Nearby'
                />
              </div>

              <Separator className='my-8' />
              <FeedFormDesktop
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
              />
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
        <FeedForm />
      )}
    </>
  );
}
import { useState, useEffect, useMemo, memo } from 'react';
import { MapPin, ArrowRight, Search, Store, Users, CheckCircle, Loader2, SignpostIcon, LogInIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useGetMarkets } from '../hooks/api-hooks';
import { getInitials } from '@/lib/utils';
import MarketIcon from '@/components/ui/svg/market-icon.svg';
import { useSocket } from '@/contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

type MarketWithAnalytics = {
  id: string;                // UUID string
  place_id: string;
  name: string;
  address: string;
  location: string;          // PostgreSQL point as string "(lat,long)"
  user_count: number | null; // nullable in schema, but example is 1
  created_at: string;        // ISO timestamp string
  updated_at: string;        // ISO timestamp string
  impressions: number | null;
  recent_count: number;      // computed count (same on all rows)
  last_24hrs: boolean;
  impressions_per_user: number;
  age_hours: number;
  updated_recently: boolean;
};


interface Coordinates {
  latitude: number;
  longitude: number;
}

const SellerMarketSelection = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const { data: availableMarkets = [], isLoading, refetch } = useGetMarkets({ limit: 10 })
  const { subscribe, unsubscribe } = useSocket()



  const [filteredMarkets, setFilteredMarkets] = useState<MarketWithAnalytics[]>(availableMarkets);
  const last24Hours = useMemo(() => filteredMarkets.reduce((acc, curr) => (acc + curr.recent_count), 0), [])

  // Handle location detection
  const handleLocationDetection = () => {
    setIsDetectingLocation(true);

    // Simulate location detection
    setTimeout(() => {
      setLocation({ latitude: 40.7128, longitude: -74.0060 });
      setIsDetectingLocation(false);
    }, 1500);
  };


  useEffect(() => {
    subscribe("markets:new_market_added", refetch)
    return () => unsubscribe("markets:new_market_added", refetch)
  }, [refetch])


  // Handle search
  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredMarkets(availableMarkets);
    } else {
      const filtered = availableMarkets.filter(market =>
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMarkets(filtered);
    }
  }, [searchQuery, availableMarkets]);

  // Handle market selection
  const handleMarketToggle = (marketId: string) => {
    setSelectedMarkets(prev =>
      prev.includes(marketId)
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  };

  // Handle continue to categories
  const handleContinue = () => {
    // Navigate to category selection
    navigate("/seller/categories")
    console.log('Selected markets:', selectedMarkets);
  };


  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Choose Your Markets</h1>
        <p className="text-muted-foreground">Select where you want to sell your products</p>
      </header>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-none"
          />
        </div>
      </div>

      {/* Location Detection */}
      <div className="mb-6">
        <Button
          variant="outline"
          className="w-full bg-secondary/50 border-none"
          onClick={handleLocationDetection}
          disabled={isDetectingLocation}
        >
          {isDetectingLocation ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <MapPin size={16} className="mr-2 text-market-blue" />
          )}
          {isDetectingLocation ? 'Finding markets near you...' : 'Find markets near me'}
        </Button>
      </div>

      {/* Selection Summary */}
      {selectedMarkets.length > 0 && (
        <Card className="mb-6 bg-market-orange/10 border-market-orange/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-market-orange">
                  {selectedMarkets.length} market{selectedMarkets.length !== 1 ? 's' : ''} selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  You'll appear in these markets
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-market-orange" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Markets */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium flex items-center">
            <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
            Available Markets
          </h2>

          <p className='text-sm text-market-orange'> Recently Added ({last24Hours})</p>
        </div>

        <div className="space-y-3">
          {filteredMarkets.map(market => (
            <MarketCard 
            handleMarketToggle={handleMarketToggle}
            market={market}
            selectedMarkets={selectedMarkets}
            />
            // <div
            //   key={market.id}
            //   className={`glass-morphism rounded-lg p-4 cursor-pointer transition-all ${selectedMarkets.includes(market.id)
            //     ? 'ring-2 ring-market-orange bg-market-orange/5'
            //     : 'hover:bg-secondary/30'
            //     }`}
            //   onClick={() => handleMarketToggle(market.id)}
            // >
            //   <div className="flex items-center">
            //     <Avatar className="w-12 h-12 mr-4">
            //       <AvatarImage src={MarketIcon} alt="Market Icon" className="w-full h-full object-cover" />
            //       <AvatarFallback className="bg-market-orange/20 text-market-orange">
            //         {getInitials(market.name)}
            //       </AvatarFallback>
            //     </Avatar>

            //     <div className="flex-grow">
            //       <div className="flex items-center gap-2 mb-1">
            //         <h3 className="font-medium">{market.name}</h3>
            //       </div>

            //       <div className="flex items-center text-xs text-muted-foreground mb-2">
            //         <div>
            //           <MapPin size={12} className="mr-1" />
            //         </div>
            //         <span>{market.address}</span>
            //       </div>

            //       <div className="flex w-full items-center justify-end gap-x-3">
            //         <div className="flex items-center text-xs text-market-blue">
            //           <Users size={12} className="mr-1" />
            //           <span>{market.user_count} unique visits</span>
            //         </div>
            //         <div className="flex items-center text-xs text-market-blue">
            //           <LogInIcon size={12} className="mr-1" />
            //           <span>{market.impressions} impressions</span>
            //         </div>
            //       </div>
            //     </div>

            //     <div className="flex-shrink-0">
            //       {selectedMarkets.includes(market.id) ? (
            //         <CheckCircle size={20} className="text-market-orange" />
            //       ) : (
            //         <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
            //       )}
            //     </div>
            //   </div>
            // </div>
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-8">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No markets found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-6">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={selectedMarkets.length === 0}
          className="w-full bg-market-orange hover:bg-market-orange/90"
        >
          Continue to Categories
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You can change your market selection anytime from your dashboard
        </p>
      </div>
    </div>
  );
};

const MarketCard = memo(({handleMarketToggle,market, selectedMarkets} : {market: MarketWithAnalytics, selectedMarkets: string[], handleMarketToggle: (marketId: string) => void}) => {
  return (
    <div
      key={market.id}
      className={`relative glass-morphism rounded-lg p-3 sm:p-4 cursor-pointer transition-all group ${selectedMarkets.includes(market.id) ? 'ring-2 ring-market-orange bg-market-orange/5' : 'hover:bg-secondary/30'}`}
      onClick={() => handleMarketToggle(market.id)}
    >
      {/* Activity Pulse Indicator - Mobile Positioning */}
      {market.updated_recently && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="relative">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-market-orange/40"></div>
            <SignpostIcon className="h-3 w-3 sm:h-4 sm:w-4 text-market-orange" />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
    
        {/* Content Area - Full width on mobile */}
        <div className="flex-grow w-full">
          {/* Title & Badge - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1 max-w-[80%]">
            <h3 className="font-medium text-base sm:text-lg">
              {market.name}
            </h3>
            {market.last_24hrs && (
              <span className="px-2 py-1 bg-market-orange/10 text-market-orange text-xs rounded-full whitespace-nowrap">
                Hot Today
              </span>
            )}
          </div>

          {/* Location & Timeline - Vertical stack on mobile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-xs sm:text-sm text-muted-foreground mb-2">
            <div className="flex items-center max-w-[70%]">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{market.address}</span>
            </div>
          </div>

          {/* Metrics Grid - 1 column mobile, 3 columns sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 sm:mt-3">
            <div className="text-center p-1 sm:p-2 bg-market-orange/5 rounded-lg">
              <div className="text-sm sm:text-base font-medium text-market-orange">
                {market.user_count}
              </div>
              <div className="text-[0.6rem] sm:text-xs text-muted-foreground">Active Shoppers</div>
            </div>

            <div className="text-center p-1 sm:p-2 bg-market-blue/5 rounded-lg">
              <div className="text-sm sm:text-base font-medium text-market-blue">
                {market.impressions}
                <span className="text-[0.6rem] sm:text-xs ml-1">({market.impressions_per_user}/user)</span>
              </div>
              <div className="text-[0.6rem] sm:text-xs text-muted-foreground">Views</div>
            </div>

            <div className="text-center p-1 sm:p-2 bg-market-green/5 rounded-lg">
              <div className="text-sm sm:text-base font-medium text-market-green">
                {market.recent_count}
              </div>
              <div className="text-[0.6rem] sm:text-xs text-muted-foreground">New Today</div>
            </div>
          </div>
        </div>

        {/* Selection Indicator - Bottom right on mobile */}
        <div className="absolute sm:relative bottom-2 right-2 sm:bottom-auto sm:right-auto mt-2 sm:mt-0 sm:ml-4">
          {selectedMarkets.includes(market.id) ? (
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-market-orange animate-pop-in" />
          ) : (
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-market-orange/30 transition-colors" />
          )}
        </div>
      </div>

      {/* Timeline - Full width on all devices */}
      <div className="mt-2 sm:mt-3">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-market-orange transition-all duration-500"
            style={{ width: `${Math.min((market.age_hours / 720) * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Market maturity: {Math.round(market.age_hours / 24)} days
        </div>
      </div>
    </div>
  )
})

export default SellerMarketSelection;
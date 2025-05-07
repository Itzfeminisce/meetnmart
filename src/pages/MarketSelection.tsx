import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Search, List, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  debouncedSearchMarkets,
  getNearbyMarkets,
  joinMarket,
  saveRecentVisit,
  getRecentVisits,
  MarketSearchResult,
  MarketResult,
  useJoinMarket
} from '@/services/marketsService';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MarketPlaceholder } from '@/components/MarketPlaceholder';
import MarketIcon from '@/components/ui/svg/market-icon.svg';
import { useAuth } from '@/contexts/AuthContext';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const MarketSelection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [nearbyMarkets, setNearbyMarkets] = useState<MarketResult[]>([]);
  const [searchResults, setSearchResults] = useState<MarketResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyPage, setNearbyPage] = useState(1);
  const [hasMoreNearby, setHasMoreNearby] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentVisits, setRecentVisits] = useState<MarketResult[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  // const  {mutate, isLoading } = useJoinMarket()
  const navigate = useNavigate();

  // Create the debounced search function once when component mounts
  const performDebouncedSearch = useRef(
    debouncedSearchMarkets((response) => {
      // Handle the possibility that response could be in different formats
      // Check if response is an array directly or has a markets property
      const results = Array.isArray(response) ? response : 
                     (response && response.markets ? response.markets : []);
      
      console.log("Search results received:", results);
      setSearchResults(results);
      setIsSearching(false);
      // Keep the popover open while results are available
      if (searchQuery.length >= 2) {
        setIsSearchPopoverOpen(true);
      }
    })
  ).current;

  // Function to detect user location
  const handleLocationDetection = () => {
    setIsDetecting(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setLocation(userCoordinates);

        try {
          setLoadingNearby(true);
          const response = await getNearbyMarkets(userCoordinates);
          setNearbyMarkets(response.markets);
          setNearbyPage(1);
          setHasMoreNearby(response.markets.length >= 7); // If we got exactly 7 results, there might be more
          toast.success("Location detected! Showing nearby markets.");
        } catch (error) {
          console.error('Error fetching nearby markets:', error);
          toast.error("Failed to fetch nearby markets.");
        } finally {
          setIsDetecting(false);
          setLoadingNearby(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred while detecting location.");
        }
      }
    );
  };

  // Handle search input changes
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length >= 2) {
      setIsSearching(true);
      // Use the already created debounced function
      performDebouncedSearch(value);
    } else {
      setSearchResults([]);
      setIsSearchPopoverOpen(false);
      setIsSearching(false);
    }
  };

  // Handle market selection
  const handleSelectMarket = async (market: MarketResult) => {
    
    try {
      // Join the market (increment user count)
      await joinMarket(market);
      
      // Navigate to categories page with the selected market
      navigate('/categories', {
        state: {
          market: {
            id: market.id,
            name: market.name,
            location: market.address
          }
        }
      });
    } catch (error) {
      console.error('Error selecting market:', error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleLoadMoreNearby = async () => {
    if (!location || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = nearbyPage + 1;
      const moreMarkets = await getNearbyMarkets(location, nextPage);
      
      if (moreMarkets.markets.length === 0) {
        setHasMoreNearby(false);
      } else {
        setNearbyMarkets(prev => [...prev, ...moreMarkets.markets]);
        setNearbyPage(nextPage);
        setHasMoreNearby(moreMarkets.markets.length >= 7); // Check if there might be more
      }
    } catch (error) {
      console.error('Error loading more markets:', error);
      toast.error("Failed to load more markets");
    } finally {
      setLoadingMore(false);
    }
  };

  // Function to load recent visits
  const loadRecentVisits = async () => {
    if (!isAuthenticated) return;
    
    setLoadingRecent(true);
    try {
      const visits = await getRecentVisits(3); // Get only to 3 most recent visits
      setRecentVisits(visits);
    } catch (error) {
      console.error('Error loading recent visits:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Navigate to all recent visits page
  const handleSeeAllRecentVisits = () => {
    navigate('/recent-visits');
  };

  // Load nearby markets and recent visits on component mount
  useEffect(() => {
    handleLocationDetection();
    loadRecentVisits();
  }, [isAuthenticated]);

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Select a Market</h1>
        <p className="text-muted-foreground">Choose a market near you or search</p>
      </header>

      <div className="mb-6">
        <Popover 
          open={isSearchPopoverOpen} 
          onOpenChange={(open) => {
            setIsSearchPopoverOpen(open && searchQuery.length >= 2);
          }}
        >
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="pl-9 bg-secondary/50 border-none"
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    setIsSearchPopoverOpen(true);
                  }
                }}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[var(--radix-popper-anchor-width)]" align="start">
            <Command className="rounded-lg border shadow-md">
              <CommandList>
                <CommandGroup heading="Search Results">
                  {isSearching ? (
                    <div className="py-6 text-center text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    searchResults.map((market) => (
                      <CommandItem
                        key={market.id}
                        onSelect={() => {
                          handleSelectMarket(market);
                          setIsSearchPopoverOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <p className="font-medium">{market.name}</p>
                            <p className="text-xs text-muted-foreground">{market.address}</p>
                          </div>
                          <div className="text-xs text-market-blue">
                            {market.user_count > 0 ? `${market.user_count} shoppers` : 'New'}
                          </div>
                        </div>
                      </CommandItem>
                    ))
                  ) : (
                    <CommandEmpty>No markets found</CommandEmpty>
                  )}

                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          className="flex-1 mr-2 bg-secondary/50 border-none"
          onClick={handleLocationDetection}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <MapPin size={16} className="mr-2 text-market-blue" />
          )}
          {isDetecting ? 'Detecting...' : 'Detect location'}
        </Button>
        <Button
          variant="outline"
          className="flex-1 ml-2 bg-secondary/50 border-none"
        >
          <List size={16} className="mr-2 text-market-green" />
          View all markets
        </Button>
      </div>

      {/* Recent Visits Section */}
      {isAuthenticated && recentVisits.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center">
              <span className="bg-market-blue/20 w-1 h-5 mr-2"></span>
              Recently Visited
            </h2>
            <Button 
              variant="ghost" 
              className="text-xs text-market-blue"
              onClick={handleSeeAllRecentVisits}
            >
              See All
            </Button>
          </div>

          {loadingRecent ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-market-blue" />
            </div>
          ) : (
            <div className="space-y-3">
              {recentVisits.map(market => (
                <div
                  key={market.id}
                  className="glass-morphism rounded-lg p-3 flex items-center card-hover cursor-pointer"
                  onClick={() => handleSelectMarket(market)}
                >
                  <Avatar className="w-14 h-14 mr-4">
                    <AvatarImage src={MarketIcon} alt="Market Icon" className="w-full h-full object-cover" />
                    <AvatarFallback>{getInitials(market.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden mr-2">
                    <h3 className="font-medium truncate whitespace-nowrap text-ellipsis">
                      {market.name}
                    </h3>
                    <div className="flex items-start text-xs text-muted-foreground">
                      <span className="flex-shrink-0 mr-1 mt-[2px]">
                        <MapPin size={12} />
                      </span>
                      <span className="line-clamp-2 leading-snug">
                        {market.address}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <History size={16} className="text-market-blue mr-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nearby Markets Section */}
      <div className="space-y-4 mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Markets near you
        </h2>

        {loadingNearby ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-market-orange" />
          </div>
        ) : (
          <div className="space-y-3">
          {nearbyMarkets.length > 0 ? (
            <>
              {nearbyMarkets.map(market => (
                <div
                  key={market.id}
                  className="glass-morphism rounded-lg p-3 flex items-center card-hover cursor-pointer"
                  onClick={() => handleSelectMarket(market)}
                >
                  <Avatar className="w-14 h-14 mr-4">
                    <AvatarImage src={MarketIcon} alt="Market Icon" className="w-full h-full object-cover" />
                    <AvatarFallback>{getInitials(market.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden mr-2">
                    <h3 className="font-medium truncate whitespace-nowrap text-ellipsis">
                      {market.name}
                    </h3>
                    <div className="flex items-start text-xs text-muted-foreground">
                      <span className="flex-shrink-0 mr-1 mt-[2px]">
                        <MapPin size={12} />
                      </span>
                      <span className="line-clamp-2 leading-snug">
                        {market.address}
                      </span>
                    </div>
                    {market.user_count > 0 && (
                      <div className="text-xs text-market-blue mt-1">
                        {market.user_count} {market.user_count === 1 ? 'shopper' : 'shoppers'}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight size={18} className="text-muted-foreground ml-2" />
                  </div>
                </div>
              ))}

              {hasMoreNearby && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleLoadMoreNearby}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more markets'
                  )}
                </Button>
              )}
            </>
          ) : (
            <MarketPlaceholder message="No markets found nearby. Try searching for a market." />
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default MarketSelection;
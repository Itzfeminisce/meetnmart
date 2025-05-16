import { useState, useEffect, useRef, useCallback } from 'react';
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
  getRecentVisits,
  MarketResult
} from '@/services/marketsService';
import { MarketPlaceholder } from '@/components/MarketPlaceholder';
import MarketIcon from '@/components/ui/svg/market-icon.svg';
import { useAuth } from '@/contexts/AuthContext';
import { useFetch, useMutate, queryClient } from '@/hooks/api-hooks';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const MarketSelection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [nearbyPage, setNearbyPage] = useState(1);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<MarketResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Create the debounced search function once when component mounts
  const performDebouncedSearch = useCallback((query: string) => {
    if (query.length < 2) return;
    
    setIsSearching(true);
    debouncedSearchMarkets((response) => {
      const results = Array.isArray(response) ? response :
        (response && response.markets ? response.markets : []);
      
      setSearchResults(results);
      setIsSearching(false);
    })(query);
  }, []);

  // Query for retrieving nearby markets
  const {
    data: nearbyMarketsData,
    isLoading: loadingNearby,
    refetch: refetchNearbyMarkets
  } = useFetch<{ markets: MarketResult[], hasMore: boolean }>(
    ['nearbyMarkets', location?.latitude, location?.longitude, nearbyPage],
    () => location ? getNearbyMarkets(location, nearbyPage) : Promise.resolve({ markets: [], hasMore: false }),
    {
      enabled: !!location,
      // Transform the response to include a hasMore flag
      select: (data) => ({
        markets: data.markets || [],
        hasMore: (data.markets || []).length >= 7
      })
    }
  );

  // Query for recent visits
  const {
    data: recentVisits = [],
    isLoading: loadingRecent
  } = useFetch<MarketResult[]>(
    ['recentVisits'],
    () => getRecentVisits(3),
    {
      enabled: isAuthenticated,
      staleTime: 60000 // 1 minute
    }
  );

  // Mutation for joining a market
  const {
    mutate: joinMarketMutation,
  } = useMutate<any, Error, MarketResult>(
    (market) => joinMarket(market),
    {
      onSuccess: (_, market) => {
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

        // Add to recent visits list
        queryClient.invalidateQueries(['recentVisits']);
      },
      onError: (error) => {
        console.error('Error joining market:', error);
        toast.error("Something went wrong. Please try again.");
      }
    }
  );

  // Function to detect user location
  const handleLocationDetection = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.loading("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setLocation(userCoordinates);
        setNearbyPage(1);
        toast.dismiss();
        toast.success("Location detected! Showing nearby markets.");
      },
      (error) => {
        toast.dismiss();
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
  }, []);

  // Handle search input changes
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);

    if (value.length >= 2) {
      setIsSearchPopoverOpen(true);
      performDebouncedSearch(value);
    } else {
      setIsSearchPopoverOpen(false);
      setSearchResults([]);
    }
  };

  // Handle market selection
  const handleSelectMarket = (market: MarketResult) => {
    joinMarketMutation(market);
  };

  const handleLoadMoreNearby = () => {
    setNearbyPage(prevPage => prevPage + 1);
  };

  // Navigate to all recent visits page
  const handleSeeAllRecentVisits = () => {
    navigate('/recent-visits');
  };

  // Load nearby markets on component mount
  useEffect(() => {
    handleLocationDetection();
  }, [handleLocationDetection]);

  // Effect to ensure popover stays open when results change
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearchPopoverOpen(true);
    }
  }, [searchResults, searchQuery]);

  // Derived state
  const nearbyMarkets = nearbyMarketsData?.markets || [];
  const hasMoreNearby = nearbyMarketsData?.hasMore || false;
  
  // Render the search results dropdown conditionally
  const renderSearchDropdown = () => {
    if (!isSearchPopoverOpen || searchQuery.length < 2) return null;
    
    return (
      <div className="absolute left-0 right-0 top-full mt-1 bg-background rounded-lg border shadow-md z-10">
        <div className="p-0 max-h-80 overflow-y-auto">
          <div className="p-2 border-b">
            <h4 className="text-sm font-medium text-muted-foreground">Search Results</h4>
          </div>
          
          {isSearching ? (
            <div className="py-6 text-center text-sm">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((market) => (
                <div 
                  key={market.id} 
                  className="p-2 hover:bg-secondary cursor-pointer"
                  onClick={() => {
                    handleSelectMarket(market);
                    setIsSearchPopoverOpen(false);
                  }}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No markets found
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Select a Market</h1>
        <p className="text-muted-foreground">Choose a market near you or search</p>
      </header>

      <div className="mb-6">
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
            onBlur={(e) => {
              // Only close the dropdown if the click was outside our component
              // This uses a short timeout to check where the new focus is
              setTimeout(() => {
                // Don't close if clicking on a result in the dropdown
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (!relatedTarget?.closest('.search-results-dropdown')) {
                  setIsSearchPopoverOpen(false);
                }
              }, 100);
            }}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {/* Render the custom dropdown instead of using Popover */}
          {renderSearchDropdown()}
        </div>
      </div>

      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          className="flex-1 mr-2 bg-secondary/50 border-none"
          onClick={handleLocationDetection}
          disabled={loadingNearby && !location}
        >
          {loadingNearby && !location ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <MapPin size={16} className="mr-2 text-market-blue" />
          )}
          {loadingNearby && !location ? 'Detecting...' : 'Detect location'}
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
                    disabled={loadingNearby}
                  >
                    {loadingNearby ? (
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
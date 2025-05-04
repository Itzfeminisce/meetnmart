
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Search, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  debouncedSearchMarkets,
  getNearbyMarkets,
  joinMarket,
  MarketSearchResult
} from '@/services/marketsService';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MarketPlaceholder } from '@/components/MarketPlaceholder';
import MarketIcon from '@/components/ui/svg/market-icon.svg';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const MarketSelection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [nearbyMarkets, setNearbyMarkets] = useState<MarketSearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<MarketSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const navigate = useNavigate();

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
          const markets = await getNearbyMarkets(userCoordinates);
          setNearbyMarkets(markets);
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
      debouncedSearchMarkets(value, (results) => {
        setSearchResults(results);
        setIsSearching(false);
      });
    } else {
      setSearchResults([]);
    }
  };

  // Handle market selection
  const handleSelectMarket = async (market: MarketSearchResult) => {
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

  // Load nearby markets on component mount
  useEffect(() => {
    handleLocationDetection();
  }, []);

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Select a Market</h1>
        <p className="text-muted-foreground">Choose a market near you or search</p>
      </header>

      <div className="mb-6">
        <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="pl-9 bg-secondary/50 border-none"
                onFocus={() => searchQuery.length >= 2 && setIsSearchPopoverOpen(true)}
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
                  {searchResults.length === 0 && !isSearching ? (
                    <CommandEmpty>No markets found</CommandEmpty>
                  ) : (
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
                  )}
                  {isSearching && (
                    <div className="py-6 text-center text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
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
            nearbyMarkets.map(market => (
              <div
                key={market.id}
                className="glass-morphism rounded-lg p-3 flex items-center card-hover"
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
            ))
          ) : (
            <MarketPlaceholder message="No markets found nearby. Try searching for a market." />
          )}
        </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MarketSelection;

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MapPin, ArrowRight, Search, Store, CheckCircle,
  Loader2, SignpostIcon, Package,
  ArrowLeft,
  Trash2,
  ArrowUp,
  ArrowDown,
  SearchIcon,
  User,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDeleteMarketSelection, useGetCategories, useGetMarkets, useGetSellerMarketAndCategories, useSellerCatrgoryMutation, useGetNearbyMarkets } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { Category, MarketWithAnalytics } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import MarketInsightsDialog from '@/components/MarketInsightsDialog';
import { cn } from '@/lib/utils';
import { useLocation as useUserLocation } from '@/hooks/useLocation';
import AppHeader from '@/components/AppHeader';



// Search-specific market card component
const SearchMarketCard = ({ market }: { market: MarketWithAnalytics & { distance?: number } }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/market/${market.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:border-market-orange/50 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base truncate group-hover:text-market-orange transition-colors">
            {market.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {market.address}
          </p>

          {/* Market stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {market.user_count !== null && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{market.user_count} sellers</span>
              </div>
            )}
            {market.impressions !== null && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{market.impressions} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Distance indicator if available */}
        {typeof market.distance === 'number' && (
          <div className="flex-shrink-0">
            <Badge variant="secondary" className="text-xs">
              {market.distance < 1
                ? `${Math.round(market.distance * 1000)}m`
                : `${market.distance.toFixed(1)}km`}
            </Badge>
          </div>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-market-orange/0 via-market-orange/0 to-market-orange/0 opacity-0 group-hover:opacity-5 transition-opacity" />
    </div>
  );
};

const SearchPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showLearnMarketStatDialog, setShowLearnMarketStatsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(!!searchParams.get("q"));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  const { location: userLocation, detectLocation, isDetecting } = useUserLocation();

  // Trigger search on mount if there's a query parameter
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      handleSearch(query);
    }
  }, []); // Only run on mount

  // API hooks with proper typing
  const { data: availableMarkets = {} as Record<string, MarketWithAnalytics[]>, isLoading: isMarketLoading } = useGetMarkets({ userId: user?.id, limit: 50 });
  const { data: availableCategories = [] as Category[], isLoading: isCategoryLoading } = useGetCategories({ userId: user?.id, limit: 50 });

  const { data: nearbyMarkets, isLoading: isLoadingNearbyMarkets } = useGetNearbyMarkets(
    userLocation && !searchQuery ?
      { lat: userLocation.latitude, lng: userLocation.longitude, nearby: true, pageSize: 20 } :
      searchQuery.length > 2 ?
        { query: searchQuery, nearby: false, pageSize: 20 } :
        undefined,
    !!userLocation || searchQuery.length > 2
  );

  // Filtered markets with deduplication and proper null checks
  const filteredMarkets = useMemo(() => {
    if (!isSearching && !userLocation) {
      return availableMarkets.impressions || [];
    }

    const marketMap = new Map<string, MarketWithAnalytics & { distance?: number }>();

    // Process nearby markets with null check
    const nearbyMarketsList = Array.isArray(nearbyMarkets?.markets) ? nearbyMarkets.markets : [];
    for (const market of nearbyMarketsList) {
      if (!market?.id) continue;
      const existing = marketMap.get(market.id);
      if (!existing || (market.belongs_to_market && !existing.belongs_to_market)) {
        marketMap.set(market.id, market);
      }
    }

    // Process available markets if no nearby markets
    if (marketMap.size === 0) {
      const availableMarketsList = availableMarkets.impressions || [];
      for (const market of availableMarketsList) {
        if (!market?.id) continue;
        const existing = marketMap.get(market.id);
        if (!existing || (market.belongs_to_market && !existing.belongs_to_market)) {
          marketMap.set(market.id, market);
        }
      }
    }

    const uniqueMarkets = Array.from(marketMap.values());
    return uniqueMarkets;
  }, [availableMarkets, nearbyMarkets, userLocation, isSearching]);

  // Display markets with show more functionality
  const displayMarkets = useMemo(() => {
    if (showAllMarkets) return filteredMarkets;
    return filteredMarkets.slice(0, 5);
  }, [filteredMarkets, showAllMarkets]);

  const remainingCount = filteredMarkets.length - displayMarkets.length;

  // Popular categories for quick access
  const popularCategories = useMemo(() =>
    availableCategories.filter(cat => cat.popular).slice(0, 5),
    [availableCategories]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    setActiveCategory(null);
  };

  const handleLocationSearch = async () => {
    setIsSearching(true);
    setActiveCategory(null);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setActiveCategory(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    const category = availableCategories.find(cat => cat.id === categoryId);
    if (category) {
      setSearchQuery(category.name);
      setIsSearching(true);
      setActiveCategory(categoryId);
    }
  };

  // Only show initial loading state when no search is active
  if ((isMarketLoading || isCategoryLoading) && !isSearching) {
    return <Loader />;
  }

  return (
    <>
      <AppHeader
        title="Search"
        subtitle={userLocation ? "Markets near you" : "Discover markets around you"}
        search={{
          placeholder: "Search markets, categories or sellers nearby...",
          onSearch: handleSearch,
          onClear: handleClearSearch,
          defaultValue: searchQuery,
        }}
        
        rightContent={
          <Button
            size="icon"
            variant="outline"
            onClick={handleLocationSearch}
            disabled={isDetecting}
            className="rounded-lg bg-secondary/50 border-none hover:bg-secondary/70"
          >
            {isDetecting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} className="text-market-blue" />
            )}
          </Button>
        }
      />

      <div className="container mx-auto  animate-fade-in   pb-[5rem]">
        {/* Location-based search hint */}
        {!userLocation && !isSearching && (
          <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-market-blue" />
              <div>
                <h3 className="font-medium">Find markets near you</h3>
                <p className="text-sm text-muted-foreground">
                  Click the location icon to discover markets in your area
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Popular Categories */}
        {!isSearching && popularCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Popular Categories</h2>
              <span className="text-sm text-muted-foreground">Quick access</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {popularCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-colors",
                    activeCategory === category.id
                      ? "bg-market-orange text-white"
                      : "bg-secondary/50 hover:bg-secondary/70"
                  )}
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results or default content */}
        <div className="space-y-6">
          {isSearching ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {userLocation ? "Markets near you" : "Search results"}
                </h2>
                {filteredMarkets.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {filteredMarkets.length} markets found
                  </span>
                )}
              </div>

              {isLoadingNearbyMarkets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-market-orange" />
                  <span className="ml-2 text-muted-foreground">Searching markets...</span>
                </div>
              ) : filteredMarkets.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No markets found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or location
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayMarkets.map(market => (
                      <SearchMarketCard key={market.id} market={market} />
                    ))}
                  </div>

                  {remainingCount > 0 && (
                    <div className="flex justify-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllMarkets(true)}
                        className="text-sm"
                      >
                        Show {remainingCount} more markets
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMarkets.map(market => (
                  <SearchMarketCard key={market.id} market={market} />
                ))}
              </div>

              {remainingCount > 0 && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllMarkets(true)}
                    className="text-sm"
                  >
                    Show {remainingCount} more markets
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MarketInsightsDialog
        onOpenChange={setShowLearnMarketStatsDialog}
        open={showLearnMarketStatDialog}
      />
    </>
  );
};



export default SearchPage;
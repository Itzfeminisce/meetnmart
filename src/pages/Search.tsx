
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  MapPin, ArrowRight, Search, Store, CheckCircle,
  Loader2, SignpostIcon, Package,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  useGetCategories,
  useFetchNearbyMarkets
} from '@/hooks/api-hooks';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLocation as useUserLocation } from '@/hooks/useLocation';
import AppHeader from '@/components/AppHeader';
import SEO from '@/components/SEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExpandedResult, useMarketSearchStore } from '@/contexts/store/search';
import { useSocket } from '@/contexts/SocketContext';
import { SellerSearchCard } from '@/components/search/SellerSearchCard';
import { FeedSearchCard } from '@/components/search/FeedSearchCard';
import { ProductSearchCard } from '@/components/search/ProductSearchCard';
import MarketSearchCard from '@/components/search/MarketSearchCard';
import SkeletonSearchCard from '@/components/search/SkeletonSearchCard';




const SearchPage = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<ExpandedResult[]>([])
  const [activeExpandedResultsMeta, setActiveExpandedResultsMeta] = useState<ExpandedResult>()
  const socket = useSocket()

  const searchStore = useMarketSearchStore();
  const { location: userLocation, detectLocation, isDetecting } = useUserLocation();

  const {
    isPending: isLoadingNearbyMarkets,
    error: searchApiError,
    fetchMarkets: refetch,
  } = useFetchNearbyMarkets();

  const currentPage = Number(searchStore.meta?.page) ?? 1;
  const availableCategories = useGetCategories({ userId: user?.id, limit: 50 }).data ?? [];

  const handleSearch = useCallback(async (query: string) => {
    if (!!!query) return;
    setSearchQuery(query);
    setActiveCategory(null);
    searchStore.reset();

    const params = new URLSearchParams(searchParams);
    query ? params.set("q", query) : params.delete("q");
    setSearchParams(params);

    await refetch({ query, page: 1 });
  }, [searchParams]);

  const handleLocationSearch = useCallback(async () => {
    searchStore.reset();
    if (!userLocation) await detectLocation();
    await refetch({});
  }, [userLocation]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveCategory(null);
    searchStore.reset();
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    setSearchParams(params);
  };

  const handleCategoryClick = (categoryId: string) => {
    const category = availableCategories.find(c => c.id === categoryId);
    if (!category) return;
    setActiveCategory(categoryId);
    handleSearch(category.name);
  };

  const loadMore = async () => {
    if (!searchStore.meta?.has_next_page) return;
    await refetch({ query: searchQuery, page: currentPage + 1, key: activeExpandedResultsMeta.key, action: "load_more", params: { id: activeExpandedResultsMeta.id } });
  };

  const handleFetchExtendedSearchResult = async (meta: ExpandedResult) => {
    setActiveExpandedResultsMeta(meta)
    const response = await refetch({ query: searchQuery, page: 1, key: meta.key, });
  }

  const isSearching = !!searchQuery;
  const hasError = !!searchApiError;



  useEffect(() => {

    function handleSearchExpandedResult(response: ExpandedResult[]) {
      console.log("[handleSearchExpandedResult]", { response });
      setExpandedResults(response)
    }

    socket.subscribe("search_expanded_results", handleSearchExpandedResult)

    return () => socket.unsubscribe("search_expanded_results", handleSearchExpandedResult)
  }, [socket])



  const getCard = ({ type, props }: { type: ExpandedResult['id'], props: any }) => {
    if (isLoadingNearbyMarkets) return <SkeletonSearchCard />
    switch (type) {
      case "PRODUCT":
        return <ProductSearchCard data={props} />
      case "MARKET":
        return <MarketSearchCard data={props} />
      case "SELLER":
        return <SellerSearchCard data={props} />
      case "FEED":
        return <FeedSearchCard data={props} />
      default:
        break;
    }
  }

  return (
    <>
      <SEO title="Search Markets | MeetnMart" description="Search and discover local markets..." />

      <AppHeader
        title="Search"
        subtitle={userLocation ? "Markets near you" : "Discover markets around you"}
        search={{
          placeholder: "Search markets and sellers in your area",
          onSearch: handleSearch,
          onClear: handleClearSearch,
          defaultValue: searchQuery ?? "",
        }}
        defaultSearchActive={searchParams.has("q")}
        rightContent={
          <Button
            size="icon"
            variant="outline"
            onClick={handleLocationSearch}
            disabled={isDetecting}
            className="rounded-lg bg-secondary/50 border-none hover:bg-secondary/70"
          >
            {isDetecting ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} className="text-market-blue" />}
          </Button>
        }
      />

      <div className="container mx-auto animate-fade-in pb-[5rem]">
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

        {!isSearching && availableCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Popular Categories</h2>
              <span className="text-sm text-muted-foreground">Quick access</span>
            </div>
            <div className={cn("flex gap-2 overflow-x-auto pb-2 -mx-4 px-4", isMobile ? "scrollbar-none" : "scrollbar-small")}>
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-colors",
                    activeCategory === category.id ? "bg-market-orange text-white" : "bg-secondary/50 hover:bg-secondary/70"
                  )}
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          {(searchStore.data).length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {userLocation ? "Markets near you" : "Search results"}
              </h2>
              <span className="text-sm text-muted-foreground">
                {(searchStore.data).length} results found
              </span>
            </div>
          )}

          <div className={cn("flex sticky py-4 top-0 z-10 bg-background gap-2 overflow-x-auto -mx-4 px-4", isMobile ? "scrollbar-none" : "scrollbar-small")}>

            {(searchStore.data).length > 0 && (
              <>
                <button
                onClick={handleClearSearch}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-none whitespace-nowrap transition-colors text-[.9rem]",
                    "bg-market-orange/10 text-white"
                  )}
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>

                <button
                  onClick={() => handleFetchExtendedSearchResult({
                    id: "MARKET",
                    type: "Markets",
                    count: 0,
                    key: ""
                  })}
                  className={cn(
                    "flex items-center gap-2 px-2 bg-secondary/50 hover:bg-secondary/70 gap-x-2 rounded-none"
                  )}
                >
                  {isLoadingNearbyMarkets && activeExpandedResultsMeta?.id === "MARKET" && (
                    <Loader2 className="h-4 w-4 animate-spin text-market-orange" />
                  )}
                  Markets
                </button>
              </>
            )
            }

            {expandedResults.length > 0 && (
              expandedResults.filter(result => result.count > 0).map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFetchExtendedSearchResult(result)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-colors text-[.9rem]",
                    "bg-secondary/50 hover:bg-secondary/70 gap-x-2 rounded-none", activeExpandedResultsMeta?.id === result.id && "border border-market-orange"
                  )}
                >
                  {isLoadingNearbyMarkets && activeExpandedResultsMeta.id === result.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-market-orange" />
                  )}
                  {result.count}
                  <span className="text-[.9rem]">{result.type}</span>
                </button>
              )))}
          </div>

          {hasError ? (
            <div className="text-center py-8">
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                <p className="text-sm">Failed to search markets. Please try again.</p>
              </div>
              <Button variant="outline" onClick={() => refetch({ query: searchQuery, page: 1 })}>Try again</Button>
            </div>
          ) : isLoadingNearbyMarkets && (searchStore.data).length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-market-orange" />
              <span className="ml-2 text-muted-foreground">Searching markets...</span>
            </div>
          ) : (searchStore.data).length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No markets found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your search or location"}
              </p>
              {searchQuery && <Button variant="outline" onClick={handleClearSearch}>Clear search</Button>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(searchStore.data).map((market, index) => (
                  <React.Fragment key={index}>
                    {getCard({ props: market, type: activeExpandedResultsMeta?.id ?? "MARKET" })}
                  </React.Fragment>
                ))}
              </div>
              {searchStore.meta?.has_next_page && (
                <Button onClick={loadMore} disabled={isLoadingNearbyMarkets} variant='outline' size='sm' className="w-full md:max-w-sm justify-center mt-6">
                  {isLoadingNearbyMarkets && <Loader2 className="h-8 w-8 animate-spin text-market-orange" />}
                  Load More
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};


export default SearchPage;

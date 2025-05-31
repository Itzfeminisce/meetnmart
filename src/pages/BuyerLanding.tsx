import React, { useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Store } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Search, MapPin, Loader2, CheckCircle, SignpostIcon } from 'lucide-react';
import { DebouncedInput } from '@/components/ui/debounced-input';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';

import { categories } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { useGetMarkets, useGetNearbyMarkets, useJoinMarket, useUpdateProfile } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);
  const updateProfile = useUpdateProfile()

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      return
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationUpdateCount(prev => prev + 1);
        setIsDetecting(false);
        updateProfile.mutate({
          update: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
        })
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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  }, []);

  return {
    location,
    isDetecting,
    detectLocation,
    locationUpdateCount,
  };
};


export type MarketWithAnalytics = {
  id: string;
  place_id: string;
  name: string;
  address: string;
  location: string;
  user_count: number | null;
  created_at: string;
  updated_at: string;
  impressions: number | null;
  recent_count: number;
  last_24hrs: boolean;
  impressions_per_user: number;
  age_hours: number;
  updated_recently: boolean;
};

export const useMarketSelection = () => {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // console.log({searchQuery});


  const handleMarketToggle = useCallback((marketId: string) => {
    setSelectedMarkets([marketId]);
  }, []);

  const filterMarkets = useCallback((markets: MarketWithAnalytics[]) => {
    if (searchQuery.length === 0) return markets;
    return markets.filter(market =>
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return {
    selectedMarkets,
    searchQuery,
    setSearchQuery,
    handleMarketToggle,
    filterMarkets,
  };
};

export const useCategorySelection = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories([categoryId]);
  }, []);

  const filteredCategories = useMemo(() => {
    if (searchQuery.length === 0) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const popularCategories = useMemo(() =>
    filteredCategories.filter(cat => cat.popular),
    [filteredCategories]
  );

  const otherCategories = useMemo(() =>
    filteredCategories.filter(cat => !cat.popular),
    [filteredCategories]
  );

  return {
    selectedCategories,
    searchQuery,
    setSearchQuery,
    handleCategoryToggle,
    filteredCategories,
    popularCategories,
    otherCategories,
  };
};


interface HeaderSectionProps {
  scrolled: boolean;
  isLoading: boolean;
  onContinue: () => void;
  canContinue: boolean;
  buttonText?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  scrolled,
  isLoading,
  onContinue,
  canContinue,
  buttonText = "Continue"
}) => {
  const showRightArrow = buttonText === "Find Sellers";
  const showDownArrow = buttonText === "Choose Product Category";

  return (
    <header className="mb-6 md:flex items-center justify-between gap-4 space-y-2 sticky top-0 z-50 bg-background/95 backdrop-blur-sm transition-all duration-300">
      <div className={`transition-all duration-300 overflow-hidden ${scrolled ? 'opacity-0 max-h-0' : 'opacity-100 max-h-32'}`}>
        <h1 className="text-xl md:text-3xl font-bold">Find Markets</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Select a markets and product category
        </p>
      </div>

      <div className='z-10 pb-2 grid grid-cols-4 gap-x-2'>
        <Button
          size="lg"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          variant='outline'
          className={cn(!scrolled && 'hidden')}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!canContinue || isLoading}
          className={cn(
            `w-full bg-market-orange hover:bg-market-orange/90 col-span-3`,
            !scrolled && 'col-span-4',
            showDownArrow && 'animate-bounce-subtle'
          )}
        >
          {buttonText}
          {showRightArrow && <ArrowRight className="ml-2 h-4 w-4" />}
          {showDownArrow && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
};

interface SearchAndLocationProps {
  isLocationDetectable: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLocationDetect: () => void;
  isDetecting: boolean;
  placeholder?: string;
}

export const SearchAndLocation: React.FC<SearchAndLocationProps> = ({
  searchQuery,
  onSearchChange,
  onLocationDetect,
  isDetecting,
  isLocationDetectable,
  placeholder = "Search markets...",
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className={cn('relative col-span-2', !isLocationDetectable && "col-span-3")}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <DebouncedInput
          placeholder={placeholder}
          delay={isLocationDetectable ? 800 : 500} // higher debounce if searching for markets (GOOGLE MAP API) else use normal debouncing
          onChangeText={onSearchChange}
        />
      </div>
      <Button
        variant="outline"
        onClick={onLocationDetect}
        disabled={isDetecting}
        className={cn(!isLocationDetectable && "hidden", 'bg-secondary/50 border-none')}
      >
        {isDetecting ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <MapPin size={16} className="mr-2 text-market-blue" />
        )}
        {isDetecting ? 'Detecting...' : 'Detect'}
      </Button>
    </div>
  );
};


interface MarketCardProps {
  market: MarketWithAnalytics;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  isSelected,
  onToggle
}) => {
  return (
    <div
      className={`relative glass-morphism rounded-lg p-3 sm:p-4 cursor-pointer transition-all group ${isSelected
        ? 'ring-2 ring-market-orange bg-market-orange/5'
        : 'hover:bg-secondary/30'
        }`}
      onClick={() => onToggle(market.id)}
    >
      {market.updated_recently && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="relative">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-market-orange/40"></div>
            <SignpostIcon className="h-3 w-3 sm:h-4 sm:w-4 text-market-orange" />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <div className="flex-grow w-full">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center text-xs sm:text-sm text-muted-foreground mb-2">
            <div className="flex items-center max-w-full">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{market.address}</span>
            </div>
          </div>

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
                <span className="text-[0.6rem] sm:text-xs ml-1">({Number(market.impressions_per_user).toFixed(1)}/user)</span>
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

        <div className="absolute sm:relative bottom-2 right-2 sm:bottom-auto sm:right-auto mt-2 sm:mt-0 sm:ml-4">
          {isSelected ? (
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-market-orange animate-pop-in" />
          ) : (
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-market-orange/30 transition-colors" />
          )}
        </div>
      </div>

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
  );
};


interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onToggle
}) => {
  return (
    <div
      className={`glass-morphism rounded-lg p-4 cursor-pointer transition-all group ${isSelected
        ? 'ring-2 ring-market-orange bg-market-orange/5'
        : 'hover:bg-secondary/30'
        }`}
      onClick={() => onToggle(category.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${category.color}`}>
          {category.icon}
        </div>

        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckCircle className="h-5 w-5 text-market-orange animate-pop-in" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-market-orange/30 transition-colors" />
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-1">{category.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {category.description}
        </p>
      </div>

      {category.popular && (
        <Badge
          variant="secondary"
          className="mt-3 bg-market-orange/10 text-market-orange text-xs"
        >
          Popular
        </Badge>
      )}
    </div>
  );
};

interface MarketTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  markets: Record<string, MarketWithAnalytics[]>;
  selectedMarkets: string[];
  onMarketToggle: (id: string) => void;
  onLocationDetect: () => void;
  isLocationDetecting: boolean;
}

export const MarketTabs: React.FC<MarketTabsProps> = ({
  activeTab,
  onTabChange,
  markets,
  selectedMarkets,
  onMarketToggle,
  onLocationDetect,
  isLocationDetecting,
}) => {
  // Trigger location detection when nearby tab becomes active
  useEffect(() => {
    if (activeTab === 'nearby' && !isLocationDetecting && (!markets.nearby || markets.nearby.length === 0)) {
      onLocationDetect();
    }
  }, [activeTab, markets.nearby?.length]);

  // Function to format tab title
  const formatTabTitle = (key: string) => {
    return key.split("_").join(" ")
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="scrollbar-small h-full overflow-x-auto flex items-start justify-start gap-2 bg-transparent border-b border-b-muted rounded-none mb-4">
        {Object.entries(markets).map(([key, marketList]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="capitalize rounded-none text-sm font-medium px-4 py-1.5 data-[state=active]:border-b-2 border-b-market-orange"
          >
            {formatTabTitle(key)} {" "} {marketList.length > 0 && (
              <span className='text-market-orange ml-2 text-[0.5rem] align-super uppercase animate-pulse'>Top {marketList.length}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {Object.entries(markets).map(([key, marketList]) => (
        <TabsContent key={key} value={key}>
          {marketList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketList.map(market => (
                <MarketCard
                  key={market.id}
                  market={market}
                  isSelected={selectedMarkets.includes(market.id)}
                  onToggle={onMarketToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {key === 'nearby' && isLocationDetecting ? 'Finding nearby markets...' : 'No markets found'}
              </p>
              <p className="text-sm text-muted-foreground">
                {key === 'nearby' && isLocationDetecting ? 'Please wait' : 'Try adjusting your search'}
              </p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};


interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  colorClass: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  subtitle,
  categories,
  selectedCategories,
  onCategoryToggle,
  colorClass,
}) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className={`${colorClass} w-1 h-5 mr-2`}></span>
          {title}
        </h2>
        {subtitle && (
          <Badge variant="secondary" className="bg-market-orange/10 text-market-orange">
            {subtitle}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={selectedCategories.includes(category.id)}
            onToggle={onCategoryToggle}
          />
        ))}
      </div>
    </div>
  );
};
const BuyerLanding = () => {
  const { user } = useAuth()
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [levelOneActiveTab, setLevelOneActiveTab] = useState<'markets' | 'categories'>('markets');
  const [levelTwoActiveTab, setLevelTwoActiveTab] = useState<'trending' | 'nearby'>('nearby');
  const joinMarket = useJoinMarket()

  const {
    selectedMarkets,
    searchQuery: marketSearchQuery,
    setSearchQuery: setMarketSearchQuery,
    handleMarketToggle,
    filterMarkets,
  } = useMarketSelection();

  const { location, isDetecting: isDetectingLocation, detectLocation, locationUpdateCount } = useLocation();

  // Only make API call when nearby tab is active and search query is long enough
  const shouldFetchNearbyMarkets = levelTwoActiveTab === 'nearby' &&
    (!!location || marketSearchQuery.length > 2);

  const { data: nearbyMarkets, isLoading: isLoadingNearbyMarkets } = useGetNearbyMarkets(
    shouldFetchNearbyMarkets ?
      (location && !marketSearchQuery ?
        { lat: location.latitude, lng: location.longitude, nearby: true, pageSize: 20, query: marketSearchQuery } :
        marketSearchQuery.length > 2 ?
          { query: marketSearchQuery, nearby: false, pageSize: 20 } :
          undefined
      ) :
      undefined,
    shouldFetchNearbyMarkets,
    locationUpdateCount
  );

  const {
    selectedCategories,
    searchQuery: categorySearchQuery,
    setSearchQuery: setCategorySearchQuery,
    handleCategoryToggle,
    popularCategories,
    otherCategories,
    filteredCategories,
  } = useCategorySelection();

  // API calls
  const { data: availableMarkets, isLoading: isMarketLoading } = useGetMarkets({ limit: 10, userId: user?.id });

  // Filtered markets with proper null checks and client-side filtering
  // const filteredTrendingMarkets = useMemo(() => {
  //   const generalMarkets = Array.isArray(availableMarkets?.general) ? availableMarkets.general : [];
  //   // Only apply search filter if not in nearby tab
  //   if (levelTwoActiveTab === 'nearby') {
  //     return generalMarkets;
  //   }
  //   return filterMarkets(generalMarkets);
  // }, [availableMarkets, filterMarkets, levelTwoActiveTab]);

  const filteredNearbyMarkets = useMemo(() => {
    return Array.isArray(nearbyMarkets?.markets) ? nearbyMarkets.markets : [];
  }, [nearbyMarkets]);

  // Handle search query changes based on active tab
  const handleMarketSearch = useCallback((query: string) => {
    setMarketSearchQuery(query);
    // If not in nearby tab, we don't need to trigger an API call
    if (levelTwoActiveTab !== 'nearby') {
      return;
    }
    // For nearby tab, API call is handled by the useGetNearbyMarkets hook
  }, [levelTwoActiveTab, setMarketSearchQuery]);

  const getButtonText = () => {
    if (selectedMarkets.length === 0) {
      return "Select a Market";
    }
    if (selectedCategories.length === 0) {
      return "Choose Products";
    }
    return "Find Sellers";
  };

  const handleContinue = async () => {
    if (selectedMarkets.length === 0) {
      // If no market selected, switch to markets tab
      setLevelOneActiveTab('markets');
      return;
    }
    if (selectedCategories.length === 0) {
      // If market selected but no category, switch to categories tab
      setLevelOneActiveTab('categories');
      // Scroll to top to ensure the category section is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If both selected, navigate to sellers page
    const selectedMarketId = selectedMarkets[0];

    // Find the selected market in all available markets
    const marketChosen = Object.values(availableMarkets || {})
      .flat()
      .find(mkt => mkt.id === selectedMarketId) ||
      filteredNearbyMarkets.find(mkt => mkt.id === selectedMarketId);

    if (!marketChosen) {
      toast.error('Selected market not found. Please try selecting again.');
      return;
    }

    await joinMarket.mutateAsync({
      address: marketChosen.address,
      id: marketChosen.id,
      name: marketChosen.name,
      place_id: marketChosen.place_id,
      location: marketChosen.location
    })

    navigate(`/sellers/${encodeURIComponent(marketChosen.name)}`, {
      state: {
        market: marketChosen,
        categoryId: selectedCategories[0]
      }
    });
  };

  // Scroll detection
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isMarketLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-background py-4 pb-[5rem] animate-fade-in">
      <div className="container mx-auto">
        <HeaderSection
          buttonText={getButtonText()}
          scrolled={scrolled}
          isLoading={joinMarket.isPending}
          onContinue={handleContinue}
          canContinue={(selectedMarkets.length > 0 || selectedCategories.length > 0) && !joinMarket.isPending}
        />

        <Tabs value={levelOneActiveTab} onValueChange={tab => setLevelOneActiveTab(tab as any)} className="w-full">
          <TabsList className="flex items-start justify-start gap-2 bg-transparent border-b border-b-muted rounded-none mb-4">
            <TabsTrigger
              value="markets"
              className={cn('rounded-none text-sm font-medium px-4 py-1.5 data-[state=active]:border-b-2 border-b-market-orange gap-x-2')}
            >
              <MapPin className="h-4 w-4" />
              Markets
              {selectedMarkets.length > 0 && (
                <span className="bg-market-orange/10 text-market-orange text-xs px-2 py-0.5 rounded-full">
                  {selectedMarkets.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              disabled={selectedMarkets.length === 0}
              className={cn('rounded-none text-sm font-medium px-4 py-1.5 data-[state=active]:border-b-2 border-b-market-orange gap-x-2')}
            >
              <Package className="h-4 w-4" />
              Products
              {selectedCategories.length > 0 && (
                <span className="bg-market-orange/10 text-market-orange text-xs px-2 py-0.5 rounded-full">
                  {selectedCategories.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="mt-4">
            <div className="space-y-6">
              <SearchAndLocation
                isLocationDetectable={levelTwoActiveTab === "nearby" && levelOneActiveTab === "markets"}
                searchQuery={marketSearchQuery}
                onSearchChange={handleMarketSearch}
                onLocationDetect={detectLocation}
                isDetecting={isDetectingLocation || isLoadingNearbyMarkets}
                placeholder="Search markets..."
              />

              <MarketTabs
                activeTab={levelTwoActiveTab}
                //@ts-ignore
                onTabChange={setLevelTwoActiveTab}
                markets={{
                  nearby: filteredNearbyMarkets,
                  ...availableMarkets
                }}
                selectedMarkets={selectedMarkets}
                onMarketToggle={handleMarketToggle}
                onLocationDetect={detectLocation}
                isLocationDetecting={isDetectingLocation || isLoadingNearbyMarkets}
              />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <div className="space-y-6">
              <SearchAndLocation
                isLocationDetectable={false}
                searchQuery={categorySearchQuery}
                onSearchChange={setCategorySearchQuery}
                onLocationDetect={detectLocation}
                isDetecting={isDetectingLocation || isLoadingNearbyMarkets}
                placeholder="Search categories..."
              />
              <div className="space-y-8">
                {popularCategories.length > 0 && (
                  <CategorySection
                    title="Popular Categories"
                    subtitle="Most Active"
                    categories={popularCategories}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    colorClass="bg-market-orange/20"
                  />
                )}

                {otherCategories.length > 0 && (
                  <CategorySection
                    title="All Categories"
                    categories={otherCategories}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    colorClass="bg-market-blue/20"
                  />
                )}

                {filteredCategories.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No categories found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuyerLanding;
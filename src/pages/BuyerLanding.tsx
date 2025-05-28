import React, { useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Store } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Search, MapPin, Loader2, CheckCircle, SignpostIcon } from 'lucide-react';
import { DebouncedInput } from '@/components/ui/debounced-input';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';

import { categories } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { queryClient, useGetMarkets, useGetNearbyMarkets } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

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
        setIsDetecting(false);
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
  onContinue: () => void;
  canContinue: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  scrolled,
  onContinue,
  canContinue,
}) => {
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
          disabled={!canContinue}
          className={cn(`w-full bg-market-orange hover:bg-market-orange/90 col-span-3`, !scrolled && 'col-span-4')}
        >
          Find Sellers
          <ArrowRight className="ml-2 h-4 w-4" />
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
        {isDetecting ? 'Detecting...' : 'Auto Detect'}
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
  activeTab: 'trending' | 'nearby';
  onTabChange: (value: 'trending' | 'nearby') => void;
  trendingMarkets: MarketWithAnalytics[];
  nearbyMarkets: MarketWithAnalytics[];
  selectedMarkets: string[];
  onMarketToggle: (id: string) => void;
  onLocationDetect: () => void;
  isLocationDetecting: boolean;
}

export const MarketTabs: React.FC<MarketTabsProps> = ({
  activeTab,
  onTabChange,
  trendingMarkets,
  nearbyMarkets,
  selectedMarkets,
  onMarketToggle,
  onLocationDetect,
  isLocationDetecting,
}) => {
  // Trigger location detection when nearby tab becomes active
  // useEffect(() => {
  //   if (activeTab === 'nearby' && !isLocationDetecting && nearbyMarkets.length === 0) {
  //     // onLocationDetect();
  //   }
  // }, [activeTab,  nearbyMarkets.length]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="flex items-start justify-start gap-2 bg-transparent border-b border-b-muted rounded-none mb-4">
        <TabsTrigger value="nearby" className="rounded-none text-sm font-medium px-4 py-1.5 data-[state=active]:border-b-2 border-b-market-orange">
          Markets Near You
        </TabsTrigger>
        <TabsTrigger value="trending" className="rounded-none text-sm font-medium px-4 py-1.5 data-[state=active]:border-b-2 border-b-market-orange">
          Trending Markets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="nearby">
        {nearbyMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyMarkets.map(market => (
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
              {isLocationDetecting ? 'Finding nearby markets...' : 'No markets found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isLocationDetecting ? 'Please wait' : 'Allow location services to see nearby markets'}
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="trending">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingMarkets.map(market => (
            <MarketCard
              key={market.id}
              market={market}
              isSelected={selectedMarkets.includes(market.id)}
              onToggle={onMarketToggle}
            />
          ))}
        </div>

        {trendingMarkets.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No markets found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

interface SelectionSummaryProps {
  selectedMarkets?: string[];
  selectedCategories?: string[];
  availableMarkets?: MarketWithAnalytics[];
  type: 'markets' | 'categories';
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  selectedMarkets = [],
  selectedCategories = [],
  availableMarkets = [],
  type,
}) => {
  if (type === 'markets' && selectedMarkets.length > 0) {
    return (
      <Card className="bg-market-blue/5 border-market-blue/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-market-blue mb-1">
                Selected Markets ({selectedMarkets.length})
              </h3>
              <div className="flex gap-2 flex-wrap">
                {selectedMarkets.map((marketId, index) => {
                  const market = availableMarkets.find(m => m.id === marketId);
                  return market ? (
                    <Badge key={index} variant="secondary" className="bg-market-blue/10 text-market-blue">
                      {market.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-market-blue" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'categories' && selectedCategories.length > 0) {
    return (
      <Card className="bg-market-orange/10 border-market-orange/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-market-orange">
                {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Buyers will find you in these categories
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-market-orange" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
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
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [levelOneActiveTab, setLevelOneActiveTab] = useState<'markets' | 'categories'>('markets');
  const [levelTwoActiveTab, setLevelTwoActiveTab] = useState<'trending' | 'nearby'>('nearby');
  const { location, isDetecting: isDetectingLocation, detectLocation } = useLocation();
  const nearbyMarkets = useGetNearbyMarkets(
    location ? { lat: location.latitude, lng: location.longitude, nearby: true, pageSize: 20 } : undefined,
    !!location 
  );

// console.log({nearbyMarkets});

  const {
    selectedMarkets,
    searchQuery: marketSearchQuery,
    setSearchQuery: setMarketSearchQuery,
    handleMarketToggle,
    filterMarkets,
  } = useMarketSelection();

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
  const { data: availableMarkets = [], isLoading: isMarketLoading } = useGetMarkets({ limit: 10 });

  // Filtered markets
  const filteredTrendingMarkets = filterMarkets(availableMarkets);
  const filteredNearbyMarkets = []; // This should be populated based on location

  const canContinue = selectedMarkets.length > 0 && selectedCategories.length > 0;

  const handleContinue = () => {
    navigate('/sellers', {
      state: {
        market: availableMarkets.find(mkt => mkt.id === selectedMarkets[0]),
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
          scrolled={scrolled}
          onContinue={handleContinue}
          canContinue={canContinue}
        />

        <Tabs defaultValue="markets" onValueChange={tab => setLevelOneActiveTab(tab as any)} className="w-full">
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
              Categories
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
                onSearchChange={setMarketSearchQuery}
                onLocationDetect={detectLocation}
                isDetecting={isDetectingLocation || nearbyMarkets.isFetching}
                placeholder="Search markets..."
              />

              <SelectionSummary
                selectedMarkets={selectedMarkets}
                availableMarkets={availableMarkets}
                type="markets"
              />

              <MarketTabs
                activeTab={levelTwoActiveTab}
                onTabChange={setLevelTwoActiveTab}
                trendingMarkets={filteredTrendingMarkets}
                nearbyMarkets={filteredNearbyMarkets}
                selectedMarkets={selectedMarkets}
                onMarketToggle={handleMarketToggle}
                onLocationDetect={detectLocation}
                isLocationDetecting={isDetectingLocation || nearbyMarkets.isFetching}
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
                isDetecting={isDetectingLocation || nearbyMarkets.isFetching}
                placeholder="Search categories..."
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectionSummary
                  selectedMarkets={selectedMarkets}
                  availableMarkets={availableMarkets}
                  type="markets"
                />
                <SelectionSummary
                  selectedCategories={selectedCategories}
                  type="categories"
                />
              </div>

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
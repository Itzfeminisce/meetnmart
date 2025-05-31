import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MapPin, ArrowRight, Search, Store, CheckCircle,
  Loader2, SignpostIcon, Package,
  ArrowLeft,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useDeleteMarketSelection, useGetCategories, useGetMarkets, useGetSellerMarketAndCategories, useSellerCatrgoryMutation, useGetNearbyMarkets } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import MarketInsightsDialog from '@/components/MarketInsightsDialog';
import CustomDialog from '@/components/ui/custom-dialog';
import { cn } from '@/lib/utils';
import { MarketTabs } from './BuyerLanding';
import { DebouncedInput } from '@/components/ui/debounced-input';

type MarketWithAnalytics = {
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
  belongs_to_market?: boolean;
};

// Custom hooks for seller-specific functionality
const useSellerMarketSelection = () => {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarketToggle = useCallback((marketId: string) => {
    setSelectedMarkets(prev =>
      prev.includes(marketId)
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  }, []);

  const filterMarkets = useCallback((markets: MarketWithAnalytics[] = []) => {
    if (!markets || searchQuery.length === 0) return markets;
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

const useSellerCategorySelection = (availableCategories: Category[]) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const filteredCategories = useMemo(() => {
    if (searchQuery.length === 0) return availableCategories;
    return availableCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, availableCategories]);

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

// Update SellerHeader props interface
interface SellerHeaderProps {
  scrolled: boolean;
  onContinue: () => void;
  selectedMarkets: string[];
  selectedCategories: string[];
  onBack: () => void;
  buttonText: string;
}

// Update SellerHeader component
const SellerHeader: React.FC<SellerHeaderProps> = ({
  scrolled,
  onContinue,
  selectedMarkets,
  selectedCategories,
  onBack,
  buttonText
}) => {
  const showRightArrow = buttonText === "Complete Setup";
  const showDownArrow = buttonText === "Choose Product Category";

  return (
    <header className="mb-6 md:flex items-center justify-between gap-4 space-y-2 sticky top-0 z-50 bg-background/95 backdrop-blur-sm transition-all duration-300">
      <div className={`transition-all duration-300 overflow-hidden flex items-center justify-start gap-2 ${scrolled ? 'opacity-0 max-h-0' : 'opacity-100 max-h-32'}`}>
        <div className="">
          <Button onClick={onBack} size='icon' variant='outline'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </div>
        <div className="">
          <h1 className="text-xl md:text-3xl font-bold">Discover Markets</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Select one or more markets and product categories to engage in
          </p>
        </div>
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
          disabled={selectedMarkets.length === 0 || selectedCategories.length === 0}
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

// Selection summary component
const SelectionSummary: React.FC<{
  count: number;
  type: 'market' | 'category';
  message: string;
}> = ({ count, type, message }) => {
  if (count === 0) return null;
  
  return (
    <Card className="bg-market-orange/10 border-market-orange/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-market-orange">
              {count} {type}{count !== 1 ? 's' : ''} selected
            </h3>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-market-orange" />
        </div>
      </CardContent>
    </Card>
  );
};

const SellerSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'markets' | 'categories'>('markets');
  const [levelTwoActiveTab, setLevelTwoActiveTab] = useState<'trending' | 'nearby'>('nearby');
  const [showLearnMarketStatDialog, setShowLearnMarketStatsDialog] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Custom hooks for selection management
  const {
    selectedMarkets,
    searchQuery,
    setSearchQuery,
    handleMarketToggle,
    filterMarkets,
  } = useSellerMarketSelection();

  // API hooks with proper typing
  const { data: availableMarkets = {} as Record<string, MarketWithAnalytics[]>, isLoading: isMarketLoading } = useGetMarkets({ userId: user?.id, limit: 50 });
  const { data: availableCategories = [] as Category[], isLoading: isCategoryLoading } = useGetCategories({ userId: user?.id, limit: 50 });
  const { data: nearbyMarkets, isLoading: isLoadingNearbyMarkets } = useGetNearbyMarkets(
    levelTwoActiveTab === 'nearby' ?
      (location && !searchQuery ?
        { lat: location.latitude, lng: location.longitude, nearby: true, pageSize: 20, query: searchQuery } :
        searchQuery.length > 2 ?
          { query: searchQuery, nearby: false, pageSize: 20 } :
          undefined
      ) :
      searchQuery.length > 2 ?
        { query: searchQuery, nearby: false, pageSize: 20 } :
        undefined,
    (levelTwoActiveTab === 'nearby' && !!location) || searchQuery.length > 2
  );

  const sellerMaketCategory = useSellerCatrgoryMutation();
  const sellerMarketSelectionDelete = useDeleteMarketSelection();

  const {
    selectedCategories,
    searchQuery: categorySearchQuery,
    setSearchQuery: setCategorySearchQuery,
    handleCategoryToggle,
    filteredCategories,
    popularCategories,
    otherCategories,
  } = useSellerCategorySelection(availableCategories);

  // Filtered markets with deduplication and proper null checks
  const filteredMarkets = useMemo(() => {
    const marketMap = new Map<string, MarketWithAnalytics>();
    
    // Process general markets with null check
    const generalMarkets = Array.isArray(availableMarkets?.general) ? availableMarkets.general : [];
    for (const market of generalMarkets) {
      if (!market?.id) continue; // Skip invalid markets
      const existing = marketMap.get(market.id);
      if (!existing || (market.belongs_to_market && !existing.belongs_to_market)) {
        marketMap.set(market.id, market);
      }
    }

    // Process nearby markets with null check
    const nearbyMarketsList = Array.isArray(nearbyMarkets?.markets) ? nearbyMarkets.markets : [];
    for (const market of nearbyMarketsList) {
      if (!market?.id) continue; // Skip invalid markets
      const existing = marketMap.get(market.id);
      if (!existing || (market.belongs_to_market && !existing.belongs_to_market)) {
        marketMap.set(market.id, market);
      }
    }

    const uniqueMarkets = Array.from(marketMap.values());
    return filterMarkets(uniqueMarkets);
  }, [availableMarkets, nearbyMarkets, filterMarkets]);

  // Count selected items including existing memberships with proper null checks
  const initialSelectedMarketCount = useMemo(() => 
    filteredMarkets.filter(it => it?.belongs_to_market).length + selectedMarkets.length, 
    [selectedMarkets, filteredMarkets]
  );

  const initialSelectedCategoryCount = useMemo(() => 
    filteredCategories.filter(it => it?.belongs_to_category).length + selectedCategories.length, 
    [selectedCategories, filteredCategories]
  );

  // Memoized market finding logic
  const findMarketById = useCallback((marketId: string): MarketWithAnalytics | undefined => {
    if (!marketId) return undefined;
    const generalMarkets = Array.isArray(availableMarkets?.general) ? availableMarkets.general : [];
    return generalMarkets.find(market => market?.id === marketId);
  }, [availableMarkets]);

  // Handlers
  const handleLocationDetection = useCallback(() => {
    if (!confirm("We are showing you markets and products that at least one buyer already engaged with so you can find buyers faster. We do not guarantee that a buyer will communicate from your search results anytime soon. Ensure you are sure about this detection results. Click OK to continue or CANCEL now.")) return;
    setIsDetectingLocation(true);
    setTimeout(() => {
      setLocation({ latitude: 40.7128, longitude: -74.0060 });
      setIsDetectingLocation(false);
    }, 1500);
  }, []);

  const getButtonText = useCallback(() => {
    if (selectedMarkets.length === 0) {
      return "Select a Market";
    }
    if (selectedCategories.length === 0) {
      return "Choose Product Category";
    }
    return "Complete Setup";
  }, [selectedMarkets.length, selectedCategories.length]);

  const handleContinue = useCallback(async () => {
    if (selectedMarkets.length === 0) {
      // If no market selected, switch to markets tab
      setActiveTab('markets');
      return;
    }
    if (selectedCategories.length === 0) {
      // If market selected but no category, switch to categories tab
      setActiveTab('categories');
      // Scroll to top to ensure the category section is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If both selected, proceed with setup
    try {
      await sellerMaketCategory.mutateAsync({
        sellerId: user?.id,
        payload: {
          selectedMarkets,
          selectedCategories
        }
      });
      toast.success(`Success: You will be visible to buyers browsing your selected market sale-points and categories`);
      navigate(-1); // Go back after successful setup
    } catch (error) {
      toast.error("Unable to complete this request. Please try again");
    }
  }, [sellerMaketCategory, user?.id, selectedMarkets, selectedCategories, navigate]);

  const handleDeleteSelection = useCallback(async ({ criteria, selectionId }: { criteria: "category_id" | "market_id"; selectionId: string; }) => {
    try {
      await sellerMarketSelectionDelete.mutateAsync({
        criteria,
        selectionId,
        userId: user?.id
      });
      toast.success(`Success. Item removed`);
    } catch (error) {
      toast.error("Unable to delete selection. Please try again");
    }
  }, [sellerMarketSelectionDelete, user?.id]);

  const handleLearnMarketStat = useCallback((ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setShowLearnMarketStatsDialog(true);
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isMarketLoading || isCategoryLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="container mx-auto pt-4 mb-[5rem]">
        <SellerHeader
          scrolled={scrolled}
          onContinue={handleContinue}
          selectedMarkets={selectedMarkets}
          selectedCategories={selectedCategories}
          onBack={() => navigate(-1)}
          buttonText={getButtonText()}
        />

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'markets' ? 'border-b-2 border-market-orange' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('markets')}
          >
            <MapPin className="h-4 w-4" />
            Markets
            {selectedMarkets.length > 0 && (
              <span className="bg-market-orange/10 text-market-orange text-xs px-2 py-0.5 rounded-full">
                {selectedMarkets.length}
              </span>
            )}
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'categories' ? 'border-b-2 border-market-orange' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('categories')}
            disabled={selectedMarkets.length === 0}
          >
            <Package className="h-4 w-4" />
            Categories
            {selectedCategories.length > 0 && (
              <span className="bg-market-orange/10 text-market-orange text-xs px-2 py-0.5 rounded-full">
                {selectedCategories.length}
              </span>
            )}
          </button>
        </div>

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div className="space-y-6">
            {/* Search and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <div className="pl-9 bg-secondary/50 border-none">
                  <DebouncedInput
                    placeholder="Search markets..."
                    delay={levelTwoActiveTab === 'nearby' ? 800 : 500}
                    onChangeText={setSearchQuery}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLocationDetection}
                disabled={isDetectingLocation}
                className="bg-secondary/50 border-none"
              >
                {isDetectingLocation ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <MapPin size={16} className="mr-2 text-market-blue" />
                )}
                {isDetectingLocation ? 'Finding markets...' : 'Find markets near me'}
              </Button>
            </div>

            {/* Selection Summary */}
            <SelectionSummary
              count={initialSelectedMarketCount}
              type="market"
              message="You'll appear in these markets"
            />

            {/* Markets List */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium flex items-center">
                <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
                Available Markets
              </h2>

              <MarketTabs
                activeTab={levelTwoActiveTab}
                onTabChange={(value) => setLevelTwoActiveTab(value as 'trending' | 'nearby')}
                markets={{
                  nearby: nearbyMarkets?.markets || [],
                  ...availableMarkets
                }}
                selectedMarkets={selectedMarkets}
                onMarketToggle={handleMarketToggle}
                onLocationDetect={handleLocationDetection}
                isLocationDetecting={isDetectingLocation || isLoadingNearbyMarkets}
              />
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="pl-9 bg-secondary/50 border-none">
                <DebouncedInput
                  placeholder="Search categories..."
                  delay={500}
                  onChangeText={setCategorySearchQuery}
                />
              </div>
            </div>

            {/* Selected Markets Summary */}
            {selectedMarkets.length > 0 && (
              <Card className="bg-market-blue/5 border-market-blue/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-market-blue mb-1">
                        Selected Markets ({selectedMarkets.length})
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedMarkets.map((marketId, index) => {
                          const market = findMarketById(marketId);
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
            )}

            {/* Categories Selection Summary */}
            <SelectionSummary
              count={initialSelectedCategoryCount}
              type="category"
              message="Buyers will find you in these categories"
            />

            {/* Categories List */}
            <div className="space-y-6">
              {popularCategories.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-medium flex items-center">
                      <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
                      Popular Categories
                    </h2>
                    <Badge variant="secondary" className="bg-market-orange/10 text-market-orange">
                      Most Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {popularCategories.map(category => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        isSelected={selectedCategories.includes(category.id)}
                        belongsToCategory={category.belongs_to_category}
                        onToggle={!category.belongs_to_category ? handleCategoryToggle : undefined}
                        handleDeleteSelection={handleDeleteSelection}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherCategories.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium flex items-center mb-4">
                    <span className="bg-market-blue/20 w-1 h-5 mr-2"></span>
                    All Categories
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {otherCategories.map(category => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        isSelected={selectedCategories.includes(category.id)}
                        belongsToCategory={category.belongs_to_category}
                        onToggle={handleCategoryToggle}
                        handleDeleteSelection={handleDeleteSelection}
                      />
                    ))}
                  </div>
                </div>
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
        )}
      </div>

      <MarketInsightsDialog
        onOpenChange={setShowLearnMarketStatsDialog}
        open={showLearnMarketStatDialog}
      />
    </>
  );
};

// MarketCard and CategoryCard components remain the same as in previous implementation
const MarketCard = ({
  market,
  isSelected,
  onToggle,
  handleLearnMarketStat,
  isMember,
  handleDeleteSelection
}: {
  market: MarketWithAnalytics;
  isSelected: boolean;
  isMember: boolean;
  onToggle: (id: string) => void;
  handleDeleteSelection: ({ criteria, selectionId }: {
    criteria: "category_id" | "market_id";
    selectionId: string;
  }) => Promise<void>
  handleLearnMarketStat: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
  return (
    <div
      className={`relative glass-morphism rounded-lg p-3 sm:p-4 cursor-pointer transition-all group ${isSelected || isMember
        ? 'ring-2 ring-market-orange bg-market-orange/5'
        : 'hover:bg-secondary/30'
        }`}
      onClick={() => !isMember && onToggle(market.id)}
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
            <div className="flex items-center justify-start gap-x-2">
              <Button onClick={() => handleDeleteSelection({ criteria: "market_id", selectionId: market.id })} variant='ghost' size='sm' className={cn('hidden', isMember && 'inline-block')} ><Trash2 /></Button>
              <h3 className="font-medium text-base sm:text-lg">
                {market.name}
              </h3>
            </div>
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
          {isSelected || isMember ? (
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

      <Separator className='my-4' />
      <div className='w-full flex items-center justify-between'>
        <p className='text-xs text-muted-foreground'>
          <button className='pr-1 font-bold m-0 text-market-orange hover:underline' onClick={handleLearnMarketStat}>Learn more</button>
          to use these stats for you advantage</p>
      </div>
    </div>
  );
};

const CategoryCard = ({
  category,
  isSelected,
  belongsToCategory,
  onToggle,
  handleDeleteSelection
}: {
  category: Category;
  isSelected: boolean;
  belongsToCategory: boolean;
  onToggle: (id: string) => void;
  handleDeleteSelection: ({ criteria, selectionId }: {
    criteria: "category_id" | "market_id";
    selectionId: string;
  }) => Promise<void>
}) => {
  return (
    <div
      className={`glass-morphism rounded-lg p-4 cursor-pointer transition-all group ${isSelected || belongsToCategory
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
          {isSelected || belongsToCategory ? (
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
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="mt-3 bg-market-orange/10 text-market-orange text-xs"
          >
            Popular
          </Badge>

          <Button onClick={() => handleDeleteSelection({ criteria: "category_id", selectionId: category.id })} variant='ghost' size='sm' className={cn('hidden', belongsToCategory && 'inline-block')} ><Trash2 /></Button>
        </div>
      )}
    </div>
  );
};

export default SellerSetup;
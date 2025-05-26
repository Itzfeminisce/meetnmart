import { useState, useMemo, useCallback } from 'react';
import {
  MapPin, ArrowRight, Search, Store, Users, CheckCircle,
  Loader2, SignpostIcon, Package, ShoppingCart, Coffee,
  Shirt, Utensils, Gamepad2, Home, Heart, Baby, Car,
  Book, Music, Camera, Flower, Apple, Wrench, Paintbrush, Star,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useGetMarkets } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { categories } from '@/lib/mockData';
import { Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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
};


const SellerSetup = () => {
  const { data: availableMarkets = [], isLoading: isMarketLoading, refetch } = useGetMarkets({ limit: 10 })
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'markets' | 'categories'>('markets');

  const filteredMarkets = useMemo(() => {
    if (searchQuery.length === 0) return availableMarkets;
    return availableMarkets.filter(market =>
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, availableMarkets]);

  const filteredCategories = useMemo(() => {
    if (searchCategoryQuery.length === 0) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchCategoryQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchCategoryQuery.toLowerCase())
    );
  }, [searchCategoryQuery]);

  const popularCategories = useMemo(() =>
    filteredCategories.filter(cat => cat.popular),
    [filteredCategories]
  );

  const otherCategories = useMemo(() =>
    filteredCategories.filter(cat => !cat.popular),
    [filteredCategories]
  );

  const handleLocationDetection = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setLocation({ latitude: 40.7128, longitude: -74.0060 });
      setIsDetectingLocation(false);
    }, 1500);
  };

  const handleMarketToggle = useCallback((marketId: string) => {
    setSelectedMarkets( [ marketId]);
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories([categoryId]);
  };

  const handleContinue = () => {
    navigate('/sellers', {
      state: {
        market: filteredMarkets.find(mkt => mkt.id == selectedMarkets[0] ),
        categoryId: selectedCategories[0]
      }
    });
  };

  return (
    <div className="bg-background py-4 pb-[5rem] animate-fade-in">
      <div className="container mx-auto">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="">
            <h1 className="text-2xl md:text-3xl font-bold">Find Markets</h1>
            <p className="text-muted-foreground">Select a markets and product category</p>
          </div>


          {/* Continue Button */}
          <div className="bg-background/95 backdrop-blur-sm">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={selectedMarkets.length === 0 || selectedCategories.length === 0}
              className="w-full bg-market-orange hover:bg-market-orange/90"
            >
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

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
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${selectedMarkets.length == 0 ? "cursor-not-allowed" : ''} ${activeTab === 'categories' ? 'border-b-2 border-market-orange' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('categories')}
            disabled={selectedMarkets.length == 0}
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
                <Input
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-none"
                />
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
            {isMarketLoading ? <Loader /> : selectedMarkets.length > 0 && (
              <Card className="bg-market-orange/10 border-market-orange/20">
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

            {/* Markets List */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium flex items-center">
                <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
                Available Markets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMarkets.map(market => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    isSelected={selectedMarkets.includes(market.id)}
                    onToggle={handleMarketToggle}
                  />
                ))}
              </div>

              {filteredMarkets.length === 0 && (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No markets found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchCategoryQuery}
                onChange={(e) => setSearchCategoryQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-none"
              />
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
            )}

            {/* Categories Selection */}
            {selectedCategories.length > 0 && (
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
            )}

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
                        onToggle={handleCategoryToggle}
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
                        onToggle={handleCategoryToggle}
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
    </div>
  );
};

// MarketCard and CategoryCard components remain the same as in previous implementation
const MarketCard = ({
  market,
  isSelected,
  onToggle
}: {
  market: MarketWithAnalytics;
  isSelected: boolean;
  onToggle: (id: string) => void;
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

const CategoryCard = ({
  category,
  isSelected,
  onToggle
}: {
  category: Category;
  isSelected: boolean;
  onToggle: (id: string) => void;
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
          {/* <IconComponent className="h-6 w-6" /> */}
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

export default SellerSetup;
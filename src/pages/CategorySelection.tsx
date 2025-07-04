import { useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import {
  MapPin, ArrowRight, Search, Store, CheckCircle,
  Loader2, SignpostIcon, Package,
  ArrowLeft,
  Trash2,
  ArrowUp,
  ArrowDown,
  SearchIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeleteMarketSelection, useGetCategories, useGetMarkets, useGetSellerMarketAndCategories, useSellerCatrgoryMutation, useGetNearbyMarkets } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn, sluggify } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import AppHeader from '@/components/AppHeader';
import SellerMarketCategorySelectionConfirmationModal from '@/components/SellerMarketCategorySelectionConfirmationModal';
import { z } from 'zod';
import { CategorySelectionStateSchema } from '@/types/screens';
import SEO from '@/components/SEO';

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



const useSellerCategorySelection = (availableCategories: Category[]) => {
  const { userRole } = useAuth()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      const _categories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : (
          userRole === "buyer" ? [categoryId] : [...prev, categoryId]
        )

      return _categories
    }
    );
  }, []);

  const filteredCategories = useMemo(() => {
    if (searchQuery.length === 0) return availableCategories;
    return availableCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, availableCategories]);

  // const popularCategories = useMemo(() =>
  //   filteredCategories.filter(cat => cat.popular),
  //   [filteredCategories]
  // );

  // const otherCategories = useMemo(() =>
  //   filteredCategories.filter(cat => !cat.popular),
  //   [filteredCategories]
  // );

  return {
    selectedCategories,
    searchQuery,
    setSearchQuery,
    handleCategoryToggle,
    filteredCategories,
    // popularCategories,
    // otherCategories,
  };
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


const CategorySelection = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile()
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'markets' | 'categories'>('markets');
  const [levelTwoActiveTab, setLevelTwoActiveTab] = useState<'trending' | 'nearby'>('nearby');
  const [showLearnMarketStatDialog, setShowLearnMarketStatsDialog] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);


  const locationState = CategorySelectionStateSchema.parse(useLocation().state)


  // const { location, detectLocation, isDetecting } = useLocation()

  // const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  // const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Custom hooks for selection management
  // const {
  //   selectedMarkets,
  //   searchQuery,
  //   setSearchQuery,
  //   handleMarketToggle,
  //   filterMarkets,
  // } = useSellerMarketSelection();

  // API hooks with proper typing
  // const { data: availableMarkets = {} as Record<string, MarketWithAnalytics[]>, isLoading: isMarketLoading } = useGetMarkets({ userId: user?.id, limit: 50 });
  const { data: availableCategories = [] as Category[], isLoading: isCategoryLoading } = useGetCategories({ userId: user?.id, limit: 50 });
  // const { data: nearbyMarkets, isLoading: isLoadingNearbyMarkets } = useGetNearbyMarkets(
  //   levelTwoActiveTab === 'nearby' ?
  //     (location && !searchQuery ?
  //       { lat: location.latitude, lng: location.longitude, nearby: true, pageSize: 20, query: searchQuery } :
  //       searchQuery.length > 2 ?
  //         { query: searchQuery, nearby: false, pageSize: 20 } :
  //         undefined
  //     ) :
  //     searchQuery.length > 2 ?
  //       { query: searchQuery, nearby: false, pageSize: 20 } :
  //       undefined,
  //   (levelTwoActiveTab === 'nearby' && !!location) || searchQuery.length > 2
  // );

  const sellerMaketCategory = useSellerCatrgoryMutation();
  const sellerMarketSelectionDelete = useDeleteMarketSelection();

  const {
    selectedCategories,
    searchQuery: categorySearchQuery,
    setSearchQuery: setCategorySearchQuery,
    handleCategoryToggle,
    filteredCategories,
    // popularCategories,
    // otherCategories,
  } = useSellerCategorySelection(availableCategories);



  const handleSaveSelections = async () => {
    try {
      await sellerMaketCategory.mutateAsync({
        sellerId: user?.id,
        payload: {
          selectedMarkets: locationState.markets.map(it => it.id),
          selectedCategories: selectedCategories
        }
      });
      setShowConfirmationModal(true);
    } catch (error) {
      toast.error('Failed to save selections');
    }
  };

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


  const getNextBehaviourOnActionClick = useCallback(() => {
    let actions: ReactNode[] = [];
    switch (locationState.utm_role) {
      case "buyer":
        const _selectedCategory = filteredCategories.find(it => it.id == selectedCategories[0])
        const _selectedMarket = locationState.markets[0]
        actions = [
          (
            <Button
              type='button'
              variant='market'
              onClick={() => navigate(`/sellers/${encodeURIComponent(sluggify(_selectedMarket.name))}`, {
                state: {
                  title: _selectedMarket.name,
                  description:  _selectedCategory.name,
                  market: {
                    id: _selectedMarket.id,
                    name: _selectedMarket.name,
                  },
                  category: {
                    id: _selectedCategory.id,
                    name: _selectedCategory.name
                  },
                  utm_source: "market_selection",
                }
              })}>
              View Sellers
            </Button>
          )
        ]

        // @ts-ignore
        if (locationState.utm_cta?.includes("market")) {
          actions.unshift(
            (
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate("/markets", {
                  state: {
                    title: `Showing sellers for X categories`,
                    categoryIds: selectedCategories,
                    ...locationState
                  }
                })
                }>
                Browse Markets
              </Button>
            ),
          )
        }
        break;
      case "seller":
        actions = [(
          <Button
            type='button'
            variant='market'
            onClick={handleSaveSelections}
            className={cn(`w-full sm:w-auto rounded-sm bg-market-orange hover:bg-market-orange/90`)}>
            {sellerMaketCategory.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">Save Selection</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </Button>
        )]
        break;
      default:
        break;
    }

    return actions;
  }, [locationState])


  // const initialSelectedCategoryCount = useMemo(() =>
  //   filteredCategories.filter(it => it?.belongs_to_category).length + selectedCategories.length,
  //   [selectedCategories, filteredCategories]
  // );

  if (isCategoryLoading) {
    return <Loader />;
  }

  return (
    <>
    <SEO 
      title="Category Selection | MeetnMart"
      description="Choose from a variety of categories to connect with buyers and showcase your services on MeetnMart."
    />
      <AppHeader
        title={locationState.title}
        subtitle="Select one or more categories to engage in"
        search={{
          placeholder: "Search markets, categories or sellers nearby...",
          onSearch: setCategorySearchQuery,
          onClear: () => setCategorySearchQuery(""),
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        rightContentOnNewLine={isMobile}
        rightContent={selectedCategories.length > 0 && (
          <div className='flex flex-row sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full'>
            {getNextBehaviourOnActionClick()}
          </div>
        )}
      />

      <div className="container mx-auto pt-4 mb-[5rem]">

        <div className="space-y-6">
          {/* Categories Selection Summary */}
          {/* <SelectionSummary
            count={initialSelectedCategoryCount}
            type="category"
            message="Buyers will find you in these categories"
          /> */}

          {/* Categories List */}
          <div className="space-y-6">
            {/* {popularCategories.length > 0 && (
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
            )} */}

            {filteredCategories.length > 0 && (
              <div>
                <h2 className="text-lg font-medium flex items-center mb-4">
                  <span className="bg-market-blue/20 w-1 h-5 mr-2"></span>
                  All Categories
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCategories.map(category => (
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
      </div>
      <SellerMarketCategorySelectionConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
      />
    </>
  )
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

export default CategorySelection;
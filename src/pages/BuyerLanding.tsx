import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle,
  Loader2,
  PhoneCall,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useDeleteMarketSelection, useGetCategories, useGetMarkets, useSellerCatrgoryMutation, useGetNearbyMarkets, useGetNearbySellers, useGetSellers } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { MarketWithAnalytics } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MarketInsightsDialog from '@/components/MarketInsightsDialog';
import { cn, getInitials, sluggify } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { MarketCard } from '@/components/MarketCard';
import { SearchHint } from '@/components/SearchHint';
import SellerMarketCategorySelectionConfirmationModal from '@/components/SellerMarketCategorySelectionConfirmationModal';
import SellerProductCatalogCard from '@/components/SellerProductCatalogCard';
import { SellerCard } from '@/components/SellerCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UtmCta, UtmRole, UtmSource } from '@/types/screens';

interface MarketCardProps {
  market: MarketWithAnalytics;
  isSelected: boolean;
  onToggle: (marketId: string) => void;
  handleLearnMarketStat: () => void;
  handleDeleteSelection: (params: { criteria: "category_id" | "market_id"; selectionId: string; }) => void;
}

// Custom hooks for seller-specific functionality
const useSellerMarketSelection = (markets: Record<string, MarketWithAnalytics[]> | undefined) => {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarketToggle = useCallback((marketId: string) => {
    setSelectedMarkets([marketId]);
  }, []);

  const filterMarkets = useCallback((markets: MarketWithAnalytics[] = []) => {
    if (!markets || searchQuery.length === 0) return markets;
    return markets.filter(market =>
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Initialize selectedMarkets with markets that user already belongs to
  useEffect(() => {
    if (markets?.impressions) {
      const existingMarkets = markets.impressions
        .filter(market => market.belongs_to_market)
        .map(market => market.id);
      setSelectedMarkets(prev => {
        // Only add markets that aren't already selected
        const newMarkets = existingMarkets.filter(id => !prev.includes(id));
        return [...prev, ...newMarkets];
      });
    }
  }, [markets]);

  return {
    selectedMarkets,
    searchQuery,
    setSearchQuery,
    handleMarketToggle,
    filterMarkets,
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

// Add this new component before the BuyerLanding component
interface CategoryCardProps {
  name: string;
  icon: React.ReactNode;
  count?: number;
  onClick: () => void;
}

// Update the CategoryCard component to be more compact for horizontal scrolling
function CategoryCard({ name, icon, count, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 py-3 rounded-lg hover:bg-market-orange/5 transition-colors duration-200 min-w-[150px]"
    >
      <div className="h-10 w-10 rounded-full bg-market-orange/10 flex items-center justify-center group-hover:bg-market-orange/20 transition-colors duration-200">
        {icon}
      </div>
      <div className="text-center">
        <h3 className="font-medium text-sm">{name}</h3>
        {count && <p className="text-xs text-muted-foreground">{count} items</p>}
      </div>
    </button>
  );
}

const BuyerLanding = () => {
  const isMobile = useIsMobile()

  const { user } = useAuth();
  const navigate = useNavigate();
  const [_action, _setAction] = useState<'save' | 'continue' | null>(null);
  const [showLearnMarketStatDialog, setShowLearnMarketStatsDialog] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // API hooks with proper typing
  const { data: markets, isLoading: isMarketLoading } = useGetMarkets({ userId: user?.id, limit: 50 });
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories({ limit: isMobile ? 47 : 912 })


  // Custom hooks for selection management
  const {
    selectedMarkets,
    searchQuery,
    setSearchQuery,
    handleMarketToggle,
    filterMarkets,
  } = useSellerMarketSelection(markets);



  const { data: sellers = [], isLoading, error, refetch } = useGetSellers()


  const sellerMaketCategory = useSellerCatrgoryMutation();
  const sellerMarketSelectionDelete = useDeleteMarketSelection();


  // Filtered markets with deduplication and proper null checks
  const filteredMarkets = useMemo(() => {
    if (!markets) return [];

    const marketMap = new Map<string, MarketWithAnalytics>();
    const impressions = markets.impressions;

    // Process general markets with null check
    // const generalMarkets = Array.isArray(markets) ? availableMarkets.general : [];
    for (const market of impressions) {
      if (!market?.id) continue; // Skip invalid markets
      const existing = marketMap.get(market.id);
      if (!existing || (market.belongs_to_market && !existing.belongs_to_market)) {
        marketMap.set(market.id, market);
      }
    }

    const uniqueMarkets = Array.from(marketMap.values());
    return filterMarkets(uniqueMarkets);
  }, [markets, filterMarkets]);


  // console.log({filteredMarkets});


  // Count selected items including existing memberships with proper null checks
  const initialSelectedMarketCount = useMemo(() =>
    filteredMarkets.filter(it => it?.belongs_to_market).length + selectedMarkets.length,
    [selectedMarkets, filteredMarkets]
  );

  async function handleSaveSelections() {
    try {
      await sellerMaketCategory.mutateAsync({
        sellerId: user?.id,
        payload: {
          selectedMarkets: selectedMarkets,
          selectedCategories: []
        }
      });
      setShowConfirmationModal(true);
    } catch (error) {
      toast.error('Failed to save selections');
    }
  }

  const preparePayloadForCta = useCallback((marketIds: string[], options: {
    show_more_info?: boolean;
    utm_cta?: UtmCta;
    utm_source?: UtmSource;
    title: string;
  }) => {


    // let title: string = "Categories";

    // if (options.utm_cta.startsWith("market")) {
    //   const [firstMarketId, ...restOfSelectedMarkets] = marketIds;

    //   const firstMarket = filteredMarkets.find(mkt => mkt.id === firstMarketId)

    //   if (firstMarket) {
    //     title = `${firstMarket.name}${options.show_more_info ? ` & ${restOfSelectedMarkets.length} others` : ''}`
    //   }else{
    //     title = "Markets"
    //   }
    // }



    return {
      title: options.title,
      marketIds,
      utm_source: "buyer_landing",
      show_more_info: false,

      // what button on the page was clicked
      utm_cta: options.utm_cta,

      // Required on category selection to display the right cta's
      utm_role: "buyer"
    }
  }, [filteredMarkets])


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


  if (isMarketLoading) {
    return <Loader />;
  }


  return (
    <>
      {/* <div className="container mx-auto pt-4 mb-[5rem]"> */}
      <AppHeader
        title="Find Local Sellers"
        subtitle="Connect with trusted sellers in your area through verified markets"
        search={{
          placeholder: "Search for sellers, products or markets near you...",
          onSearch: setSearchQuery,
          onClear: () => setSearchQuery(""),
        }}

        rightContentOnNewLine={isMobile}
      // rightContent={
      //   selectedMarkets.length > 0 && (
      //   <div className='flex flex-row sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full'>
      //     <Button
      //       type='button'
      //       variant='outline'
      //       size='default'
      //       onClick={() => navigate("/categories", {
      //         state: preparePayloadForCta(selectedMarkets, {
      //           utm_cta: "category.view_all",
      //           show_more_info: true,
      //         })
      //       })}
      //       className="w-full sm:w-auto">
      //       <span className="hidden sm:inline">Continue to Category</span>
      //       <span className="sm:hidden">Category</span>
      //     </Button>
      //     <Button
      //       type='button'
      //       variant='market'
      //       disabled={sellerMaketCategory.isPending}
      //       onClick={handleSaveSelections}
      //       className={cn(`w-full sm:w-auto rounded-sm bg-market-orange hover:bg-market-orange/90`)}>
      //       {sellerMaketCategory.isPending ? (
      //         <div className="flex items-center gap-2">
      //           <Loader2 className="h-4 w-4 animate-spin" />
      //           <span>Saving...</span>
      //         </div>
      //       ) : (
      //         <>
      //           <span className="hidden sm:inline">Skip & Save</span>
      //           <span className="sm:hidden">Save</span>
      //         </>
      //       )}
      //     </Button>
      //   </div>
      // )}
      />


      <div className="container  animate-fade-in  mb-[5rem]">
        {/* Selection Summary */}
        <SelectionSummary
          count={initialSelectedMarketCount}
          type="market"
          message="You'll appear in these markets"
        />


        {/* Markets List - Now Horizontally Scrollable */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Featured Markets</h2>
              {/* <p className="text-sm text-muted-foreground">Discover popular markets in your area</p> */}
            </div>
            <Button variant="ghost" size="sm" className="text-market-orange" asChild>
              <Link to={"/markets"} state={preparePayloadForCta([], {
                // show_more_info: true,
                title: "Markets",
                utm_cta: "market.view_all"
              })}>
                View All
              </Link>
            </Button>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-4 px-1 -mx-1 snap-x snap-mandatory scrollbar-small">
              {filteredMarkets.map((market, idx) => (
                <div key={idx} className="snap-start min-w-[300px]">
                  <HorizontalMarketCard
                    market={market}
                    isSelected={selectedMarkets.includes(market.id)}
                    onToggle={handleMarketToggle}
                    handleLearnMarketStat={() => setShowLearnMarketStatsDialog(true)}
                    handleDeleteSelection={handleDeleteSelection}
                  />
                </div>
              ))}
            </div>
            {/* <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" /> */}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Browse Categories</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-market-orange">
              <Link to={"/categories"} state={preparePayloadForCta([], {
                // show_more_info: true,
                title: "Categories",
                utm_cta: "category.view_all",

              })}>
                View All
              </Link>
            </Button>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto gap-x-1 pb-4 px-1 -mx-1 snap-x snap-mandatory scrollbar-small">
              {isLoadingCategories ? (<Loader2 className="h-8 w-8 animate-spin text-market-orange" />) : categories.map((category, idx) => (
                <div className="snap-start" key={idx}>
                  <Link to={`/markets/${encodeURIComponent(sluggify(category.name))}`} state={preparePayloadForCta([], {
                    // show_more_info: true,
                    title: "Markets",
                    // utm_cta: "market.view_all"
                  })}>
                    <CategoryCard
                      name={category.name}
                      icon={<span className={cn('text-lg', category.color)}>{category.icon}</span>}
                      // count={24}
                      onClick={() => { }}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seller List - Now in Grid at the top */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Top Sellers</h2>
              <p className="text-sm text-muted-foreground">Connect with verified sellers in your area</p>
            </div>
            <Button variant="ghost" size="sm" className="text-market-orange">
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sellers.map((seller, idx) => (
              <MiniSellerCard
                key={idx}
                name={seller.name}
                avatar={seller.avatar}
                is_online={seller.is_online}
                avg_rating={seller.avg_rating}
                total_reviews={seller.total_reviews}
              />
            ))}
          </div>
        </div>

        {searchQuery && filteredMarkets.length < 2 && (
          <SearchHint query={searchQuery} />
        )}
      </div>

      <MarketInsightsDialog
        onOpenChange={setShowLearnMarketStatsDialog}
        open={showLearnMarketStatDialog}
      />
      <SellerMarketCategorySelectionConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
      />
    </>
  );
};

export default BuyerLanding;

interface MiniSellerCardProps {
  name: string;
  avatar?: string;
  is_online: boolean;
  avg_rating: number;
  total_reviews: number;
}

function MiniSellerCard({ name, avatar, is_online, avg_rating, total_reviews }: MiniSellerCardProps) {
  return (
    <div className="glass-morphism rounded-xl p-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300 min-w-[280px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-market-orange/10 to-transparent rounded-bl-full" />

      <div className="flex flex-col items-center text-center gap-3">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-secondary ring-2 ring-market-orange/20">
            {avatar ? (
              <AvatarImage src={avatar} alt={name} className="object-contain" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-market-orange/20 to-secondary text-foreground font-semibold text-xl">
                {getInitials(name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background flex items-center justify-center ${is_online ? 'bg-market-green' : 'bg-muted'}`}>
            {is_online ? <Bell size={12} className="text-white" /> : <BellOff size={12} className="text-muted-foreground" />}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex items-center justify-center gap-1">
            <Star size={16} className="text-yellow-500" />
            <span className="text-base font-medium">{avg_rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({total_reviews})</span>
          </div>
        </div>

        <Button
          size="lg"
          className={`w-full ${is_online
            ? 'bg-market-green hover:bg-market-green/90 shadow-lg shadow-market-green/20'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
            } transition-all duration-200`}
          disabled={!is_online}
        >
          <PhoneCall size={16} className="mr-2" />
          Talk Now
        </Button>
      </div>
    </div>
  );
}

// Add this new horizontal market card component
function HorizontalMarketCard({ market, isSelected, onToggle, handleLearnMarketStat, handleDeleteSelection }: MarketCardProps) {
  return (
    <div className="glass-morphism rounded-xl p-2 sm:p-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300 mx-1 w-full max-w-[400px]">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-market-orange/10 flex items-center justify-center">
            <span className="text-market-orange font-semibold text-base sm:text-lg">
              {getInitials(market.name)}
            </span>
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base truncate">{market.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{market.address}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full ${isSelected ? 'bg-market-orange/10 text-market-orange' : ''}`}
              onClick={() => onToggle(market.id)}
            >
              <CheckCircle size={14} className={`${isSelected ? 'fill-market-orange' : ''} sm:w-4 sm:h-4 w-3.5 h-3.5`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

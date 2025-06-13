import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, PhoneCall, Star, Package, Heart, X, MapPin, Clock, Award, ShoppingBag, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { categories, mockProducts } from '@/lib/mockData';
import { Category, Market, NearbySellerResponse } from '@/types';
import { formatTimeAgo, getInitials, toLivekitRoomName } from '@/lib/utils';
import { useAuth, UsersByRole } from '@/contexts/AuthContext';
import { CallData } from '@/contexts/live-call-context';
import { useGetNearbySellers, useGetSellers, useGetUserFeedbacks } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import ErrorComponent from '@/components/ErrorComponent';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import SellerProductCatalogCard from '@/components/SellerProductCatalogCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SellerCard } from '@/components/SellerCard';
import { z } from 'zod';
import { SellerSelectionStateSchema } from '@/types/screens';
import AppHeader from '@/components/AppHeader';
import SellerFilter from '@/components/SellerFilter';
// import { useVirtualizer } from '@tanstack/react-virtual';

const useFilteredSellers = (_sellers: NearbySellerResponse[]) => {
  const [sellers, setSellers] = useState<NearbySellerResponse[]>(_sellers)
  const [searchQuery, setSearchQuery] = useState("")

  const setFilteredSellers = useCallback((_filteredSellers: NearbySellerResponse[]) => {
    setSellers(_filteredSellers)
  }, [sellers])

  const filterSellers = useMemo(() => {
    if (!sellers || searchQuery.length === 0) return sellers;

    return sellers.filter(seller => {
      // Check if seller name matches
      const sellerNameMatch = seller.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Check if any of the seller's products match
      const productMatch = seller.products.items.some(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const otherProductSearchCriteriaMatch = seller.products.items.some(product =>
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Return true if either seller name or any product matches
      return sellerNameMatch || productMatch || otherProductSearchCriteriaMatch;
    });
  }, [sellers, searchQuery]);

  return {
    setFilteredSellers,
    filterSellers,
    setSearchQuery,
    searchQuery
  }
}

const SellerSelection = () => {
  const { profile } = useAuth()
  const navigate = useNavigate();
  const { unsubscribe, subscribe } = useSocket()
  const [selectedSeller, setSelectedSeller] = useState<NearbySellerResponse | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('reviews');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // const [searchQuery, setSearchQuery] = useState("")

  const locationState = SellerSelectionStateSchema.parse(useLocation().state)

  const { market, category,  } = locationState;


  const { data: sellers = [], isLoading, error, refetch } = useGetNearbySellers({ market_id: market?.id, category_id: category?.id })

  const { filterSellers, setFilteredSellers, searchQuery, setSearchQuery } = useFilteredSellers(sellers)

  // Memoize handlers
  const handleCall = useCallback(async (seller: NearbySellerResponse) => {
    navigate('/calls', {
      state: {
        caller: { id: profile.id, name: profile.name },
        room: toLivekitRoomName(`call_${Date.now()}_${seller.seller_id}`),
        receiver: { name: seller.name, id: seller.seller_id },
        data: {
          marketId: market.id,
          categoryId: category.id
        }
      } as CallData,
    });
  }, [profile, market, category, navigate]);

  const toggleFavorite = useCallback((sellerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(sellerId)) {
        newFavorites.delete(sellerId);
      } else {
        newFavorites.add(sellerId);
      }
      return newFavorites;
    });
  }, []);

  const openSellerDetails = useCallback((seller: NearbySellerResponse, tab: 'reviews' | 'catalog') => {
    setSelectedSeller(seller);
    setActiveTab(tab);
    setSheetOpen(true);
  }, []);
  // // Memoize seller list
  // const sellerList = useMemo(() => {
  //   if (!sellers) return [];
  //   return sellers;
  // }, [sellers]);

  // Memoize socket subscription
  useEffect(() => {
    subscribe("events:user_joined", refetch)
    return () => unsubscribe("events:user_joined", refetch)
  }, [refetch, subscribe, unsubscribe])


  if (error) return <ErrorComponent error={error} onRetry={() => navigate(0)} />

  return (
    <>
      <AppHeader
        title={locationState.title}
        subtitle={`${locationState.category.name || "All Categories"}, Found: (${filterSellers.length})`}
        search={{
          placeholder: "Search anything...",
          onSearch: setSearchQuery,
          onClear: () => setSearchQuery(""),
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
      />

      <div className="container animate-fade-in mb-[5rem]">
        <SellerFilter
          sellers={sellers}
          onFiltersChange={setFilteredSellers}
          className='mb-4'
        />
        <div className="space-y-4 mb-4">
          <div className="">
            {isLoading ? (
              <Loader />
            ) : filterSellers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filterSellers.map(seller => (
                  <SellerCard
                    key={seller.seller_id}
                    seller={seller}
                    onCall={handleCall}
                    onOpenDetails={openSellerDetails}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.has(seller.seller_id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">No sellers found</p>
                <p className="text-sm">Try checking other categories or markets</p>
              </div>
            )}
          </div>
        </div>

        {/* Seller Details Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            className="w-full max-w-[100vw] sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] px-4 sm:px-6 md:px-8 overflow-y-auto pb-0"
          >
            {selectedSeller && (
              <div className="flex flex-col h-full">
                <div className="flex-grow overflow-y-auto">
                  <SheetHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-xl font-bold truncate">
                        {selectedSeller.name}
                      </SheetTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(selectedSeller.seller_id)}
                        >
                          <Heart
                            size={18}
                            className={`${favorites.has(selectedSeller.seller_id)
                              ? 'text-red-500 fill-red-500'
                              : 'text-muted-foreground'
                              }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </SheetHeader>

                  {/* Seller info header */}
                  <div className="flex items-center mb-6">
                    <Avatar className="h-16 w-16 mr-4 border-2 border-secondary">
                      {selectedSeller.avatar ? (
                        <AvatarImage src={selectedSeller.avatar} alt={selectedSeller.name} className=' object-contain w-full' />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-market-orange/20 to-secondary text-foreground text-lg font-semibold">
                          {getInitials(selectedSeller.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-grow">
                      <div className="flex items-center mb-1">
                        <Badge
                          variant={selectedSeller.seller_status.is_online ? "default" : "secondary"}
                          className={`mr-2 ${selectedSeller.seller_status.is_online
                            ? 'bg-market-green/10 text-market-green border-market-green/20'
                            : 'bg-muted text-muted-foreground'
                            }`}
                        >
                          {selectedSeller.seller_status.is_online ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>

                      <div className="flex items-center mb-2">
                        <span className='text-market-orange text-lg mr-2'>
                          {'★'.repeat(Math.floor(selectedSeller?.reviews_summary.average_rating || 0))}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {selectedSeller?.reviews_summary.average_rating?.toFixed(1)} ({selectedSeller?.reviews_summary.total_reviews || 0} reviews)
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {selectedSeller.seller_status.description}
                      </p>
                    </div>
                  </div>

                  {/* Tab navigation */}
                  <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className=''>
                    <TabsList className="w-full bg-transparent border-b rounded-none justify-start space-x-4 overflow-x-auto scrollbar-small max-w-full overflow-y-hidden">
                      <TabsTrigger
                        value="reviews"
                        className={`border-b-2 px-4 py-2 rounded-none text-sm font-medium data-[state=active]:border-market-orange data-[state=active]:text-foreground border-transparent`}
                      >
                        <Star size={16} className="mr-2" />
                        Reviews & Ratings
                      </TabsTrigger>

                      <TabsTrigger
                        value="catalog"
                        className={`border-b-2 px-4 py-2 rounded-none text-sm font-medium data-[state=active]:border-market-orange data-[state=active]:text-foreground border-transparent`}
                      >
                        <Package size={16} className="mr-2" />
                        Product Catalog
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="reviews">
                      <div className="space-y-4 pb-20">
                        {selectedSeller.products && selectedSeller.products.items.length === 0 ?
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-secondary/50 rounded-full p-4 mb-4">
                              <Star className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                            <p className="text-muted-foreground max-w-sm">
                              Be the first to share your experience with this seller
                            </p>
                          </div>
                          : selectedSeller.reviews_summary.recent_reviews.map((review, idx) => (
                            <div key={idx} className="glass-morphism rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="font-medium text-sm mr-2">{"MeetnMart User"}</span>
                                  <div className="flex items-center">
                                    <span className='text-market-orange text-sm'>
                                      {'★'.repeat(review.rating)}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{formatTimeAgo(review.created_at)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{review.feedback_text || "No Description"}</p>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="catalog">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
                        {selectedSeller.products.items.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center col-span-2">
                            <div className="bg-secondary/50 rounded-full p-4 mb-4">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Products Listed</h3>
                            <p className="text-muted-foreground max-w-sm">
                              This seller hasn't added any products to their catalog yet
                            </p>
                          </div>
                        ) : (
                          selectedSeller.products.items.map(product => (
                            <SellerProductCatalogCard
                              key={product.id}
                              product={product}
                            />
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Action button at bottom */}
                <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border mt-auto">
                  <div className="grid grid-cols-4 gap-x-2 p-4">
                    <Button
                      variant='outline'
                      onClick={() => setSheetOpen(false)}
                    >
                      <ChevronLeft size={16} className="" />
                    </Button>
                    <Button
                      onClick={() => {
                        handleCall(selectedSeller);
                        setSheetOpen(false);
                      }}
                      className={`w-full col-span-3 ${selectedSeller.seller_status.is_online
                        ? 'bg-market-green hover:bg-market-green/90'
                        : 'bg-muted text-muted-foreground'
                        }`}
                      disabled={!selectedSeller.seller_status.is_online}
                    >
                      <PhoneCall size={16} className="mr-2" />
                      Start Conversation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default memo(SellerSelection);

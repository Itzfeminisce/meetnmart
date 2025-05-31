import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, PhoneCall, Star, Package, Heart, X, MapPin, Clock, Award, ShoppingBag, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { categories, mockProducts } from '@/lib/mockData';
import { Market } from '@/types';
import { formatTimeAgo, getInitials, toLivekitRoomName } from '@/lib/utils';
import { useAuth, UsersByRole } from '@/contexts/AuthContext';
import { CallData } from '@/contexts/live-call-context';
import { useGetSellers, useGetUserFeedbacks } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import ErrorComponent from '@/components/ErrorComponent';
import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import SellerProductCatalogCard from '@/components/SellerProductCatalogCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const mockReviews = [
  { id: 1, rating: 5, comment: "Excellent service and quality products!", reviewer: "John D.", date: "2024-01-15" },
  { id: 2, rating: 4, comment: "Good communication, fast delivery.", reviewer: "Sarah M.", date: "2024-01-10" },
  { id: 3, rating: 5, comment: "Highly recommended seller!", reviewer: "Mike R.", date: "2024-01-08" },
];

const SellersList = () => {
  const { user, profile } = useAuth()
  const location = useLocation();
  const navigate = useNavigate();
  const { unsubscribe, subscribe } = useSocket()
  const { market, categoryId } = location.state as { market: Market; categoryId: string };
  const [selectedSeller, setSelectedSeller] = useState<UsersByRole | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('reviews');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());


  const feedbacks = useGetUserFeedbacks({ p_seller_id: selectedSeller?.id });

  // console.log({feedbacks});


  const { data: sellers, isLoading, error, refetch } = useGetSellers()

  const category = categories.find(cat => cat.id === categoryId);
  const filteredSellers = sellers;

  const handleCall = async (seller: UsersByRole) => {
    navigate('/calls', {
      state: {
        caller: { id: profile.id, name: profile.name },
        room: toLivekitRoomName(`call_${Date.now()}_${seller.id}`),
        receiver: { name: seller.name, id: seller.id },
        data:{
          marketId: market.id,
          categoryId: categoryId
        }
      } as CallData,
    });
  };

  const toggleFavorite = (sellerId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sellerId)) {
      newFavorites.delete(sellerId);
    } else {
      newFavorites.add(sellerId);
    }
    setFavorites(newFavorites);
  };

  const openSellerDetails = (seller: UsersByRole, tab: 'reviews' | 'catalog') => {
    setSelectedSeller(seller);
    setActiveTab(tab);
    setSheetOpen(true);
  };

  useEffect(() => {
    subscribe("user_socket_cache:user_joined", refetch)
    return () => unsubscribe("user_socket_cache:user_joined", refetch)
  }, [refetch])

  if (error) return <ErrorComponent error={error} onRetry={() => navigate(0)} />

  return (
    <div className="container pt-6 animate-fade-in mb-[5rem]">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 -ml-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="font-bold text-gradient text-base md:text-xl xl:text-2xl">{market.name}</h1>
            <p className="text-sm text-muted-foreground">
              {category?.name || 'All Categories'}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Available Sellers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <Loader />
          ) : filteredSellers?.length > 0 ? (
            filteredSellers.map(seller => (
              <div
                key={seller.id}
                className="glass-morphism rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                {/* Background gradient accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-market-orange/10 to-transparent rounded-bl-full" />

                {/* Header section */}
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                  <div className="flex items-start sm:items-center flex-1 min-w-0">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mr-3 border-2 border-secondary ring-2 ring-market-orange/20 shrink-0">
                      {seller.avatar ? (
                        <AvatarImage src={seller.avatar} alt={seller.name} className="object-contain" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-market-orange/20 to-secondary text-foreground font-semibold">
                          {getInitials(seller.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{seller.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50"
                          onClick={() => toggleFavorite(seller.id)}
                        >
                          <Heart
                            size={16}
                            className={`transition-colors ${favorites.has(seller.id)
                              ? 'text-red-500 fill-red-500'
                              : 'text-muted-foreground hover:text-red-400'
                              }`}
                          />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
                        <div className="flex items-center">
                          {seller.is_online ? (
                            <Bell size={14} className="text-market-green mr-1" />
                          ) : (
                            <BellOff size={14} className="text-muted-foreground mr-1" />
                          )}
                          <Badge
                            variant={seller.is_online ? 'default' : 'secondary'}
                            className={`text-xs px-2 py-0.5 ${seller.is_online
                              ? 'bg-market-green/10 text-market-green border-market-green/20'
                              : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {seller.is_online ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>

                        <div className="flex items-center text-xs">
                          <span className="text-market-orange text-base">
                            {'★'.repeat(Math.floor(seller?.avg_rating || 0))}
                          </span>
                          {(seller?.avg_rating || 0) % 1 > 0 && <span className="text-market-orange/40">☆</span>}
                          <span className="ml-1 text-muted-foreground">({seller?.total_reviews || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 sm:line-clamp-3">
                  {seller.description || 'No Description'}
                </p>

                {/* Quick stats */}
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    <span>2.5km away</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    <span>Usually responds in 5 min</span>
                  </div>
                  <div className="flex items-center">
                    <Award size={12} className="mr-1" />
                    <span>Verified Seller</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 border-market-orange/20 hover:bg-market-orange/10"
                      onClick={() => openSellerDetails(seller, 'reviews')}
                    >
                      <Star size={14} className="mr-1" />
                      Reviews
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 border-market-orange/20 hover:bg-market-orange/10"
                      onClick={() => openSellerDetails(seller, 'catalog')}
                    >
                      <Package size={14} className="mr-1" />
                      Catalog
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleCall(seller)}
                    size="sm"
                    className={`w-full sm:w-auto h-8 px-3 ${seller.is_online
                      ? 'bg-market-green hover:bg-market-green/90 shadow-lg shadow-market-green/20'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                      } transition-all duration-200`}
                    disabled={!seller.is_online}
                  >
                    <PhoneCall size={14} />
                    Talk Now
                  </Button>
                </div>
              </div>
            ))
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
                        onClick={() => toggleFavorite(selectedSeller.id)}
                      >
                        <Heart
                          size={18}
                          className={`${favorites.has(selectedSeller.id)
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
                        variant={selectedSeller.is_online ? "default" : "secondary"}
                        className={`mr-2 ${selectedSeller.is_online
                          ? 'bg-market-green/10 text-market-green border-market-green/20'
                          : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {selectedSeller.is_online ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>

                    <div className="flex items-center mb-2">
                      <span className='text-market-orange text-lg mr-2'>
                        {'★'.repeat(Math.floor(selectedSeller?.avg_rating || 0))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedSeller?.avg_rating?.toFixed(1)} ({selectedSeller?.total_reviews || 0} reviews)
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {selectedSeller.description}
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
                      {feedbacks.isLoading ? <Loader /> : feedbacks?.data && feedbacks.data.length === 0 ?
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="bg-secondary/50 rounded-full p-4 mb-4">
                            <Star className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                          <p className="text-muted-foreground max-w-sm">
                            Be the first to share your experience with this seller
                          </p>
                        </div>
                        : feedbacks.data.map(review => (
                          <div key={review.id} className="glass-morphism rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="font-medium text-sm mr-2">{review.buyer_name}</span>
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
                      {mockProducts.length === 0 ? (
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
                        mockProducts.map(product => (
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
                    className={`w-full col-span-3 ${selectedSeller.is_online
                      ? 'bg-market-green hover:bg-market-green/90'
                      : 'bg-muted text-muted-foreground'
                      }`}
                    disabled={!selectedSeller.is_online}
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
  );
};

export default SellersList;

import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, PhoneCall, Star, Package, Heart, X, MapPin, Clock, Award, ShoppingBag } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'reviews' | 'catalog'>('reviews');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());


  const feedbacks = useGetUserFeedbacks({p_seller_id: selectedSeller?.id});

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
    <div className="px-4 pt-6 animate-fade-in mb-[5rem]">
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
            <h1 className="text-2xl font-bold text-gradient">{market.name}</h1>
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
                className="glass-morphism rounded-xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                {/* Background gradient accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-market-orange/10 to-transparent rounded-bl-full" />

                {/* Header section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center flex-1">
                    <Avatar className="h-14 w-14 mr-4 border-2 border-secondary ring-2 ring-market-orange/20">
                      {seller.avatar ? (
                        <AvatarImage src={seller.avatar} alt={seller.name} className='object-contain' />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-market-orange/20 to-secondary text-foreground font-semibold">
                          {getInitials(seller.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{seller.name}</h3>
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

                      <div className="flex items-center mt-1 mb-2">
                        <div className="flex items-center mr-3">
                          {seller.is_online ? (
                            <Bell size={14} className="text-market-green mr-1" />
                          ) : (
                            <BellOff size={14} className="text-muted-foreground mr-1" />
                          )}
                          <Badge
                            variant={seller.is_online ? "default" : "secondary"}
                            className={`text-xs px-2 py-0.5 ${seller.is_online
                                ? 'bg-market-green/10 text-market-green border-market-green/20'
                                : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {seller.is_online ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>

                        <div className="flex items-center text-sm">
                          <div className="flex items-center mr-2">
                            <span className='text-market-orange text-base'>
                              {'★'.repeat(Math.floor(seller?.avg_rating || 0))}
                            </span>
                            {(seller?.avg_rating || 0) % 1 > 0 && <span className='text-market-orange/40'>☆</span>}
                            <span className="ml-1 text-muted-foreground text-xs">
                              ({seller?.total_reviews || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {seller.description || "No Description"}
                </p>

                {/* Quick stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                    className={`${seller.is_online
                        ? 'bg-market-green hover:bg-market-green/90 shadow-lg shadow-market-green/20'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                      } transition-all duration-200`}
                    disabled={!seller.is_online}
                  >
                    <PhoneCall size={14} className="mr-2" />
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
        <SheetContent className="min-w-[50vw] max-w-1/2">
          {selectedSeller && (
            <>
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
              <div className="flex border-b border-border mb-6">
                <Button
                  variant={activeTab === 'reviews' ? 'default' : 'ghost'}
                  className={`rounded-none border-b-2 ${activeTab === 'reviews'
                      ? 'border-market-orange'
                      : 'border-transparent'
                    }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <Star size={16} className="mr-2" />
                  Reviews & Ratings
                </Button>
                <Button
                  variant={activeTab === 'catalog' ? 'default' : 'ghost'}
                  className={`rounded-none border-b-2 ${activeTab === 'catalog'
                      ? 'border-market-orange'
                      : 'border-transparent'
                    }`}
                  onClick={() => setActiveTab('catalog')}
                >
                  <Package size={16} className="mr-2" />
                  Product Catalog
                </Button>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto h-[calc(100vh-60%)] scrollbar-small p-4">
                {activeTab === 'reviews' ? (
                  <div className="space-y-4">
                    {feedbacks.isLoading ? <Loader /> : feedbacks?.data && feedbacks.data.length === 0 ? 
                      <p className='text-sm text-market-orange text-center'>No Feedbacks yet.</p>
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
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mockProducts.map(product => (
                      <SellerProductCatalogCard
                        product={product}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Action button at bottom */}
              <div className="pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    handleCall(selectedSeller);
                    setSheetOpen(false);
                  }}
                  className={`w-full ${selectedSeller.is_online
                      ? 'bg-market-green hover:bg-market-green/90'
                      : 'bg-muted text-muted-foreground'
                    }`}
                  disabled={!selectedSeller.is_online}
                >
                  <PhoneCall size={16} className="mr-2" />
                  Start Conversation
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SellersList;

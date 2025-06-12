import { memo } from 'react';
import { Bell, BellOff, Heart, MapPin, Clock, Award, Star, Package, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NearbySellerResponse } from '@/types';
import { getInitials } from '@/lib/utils';

// Memoized Seller Card Component
export const SellerCard = memo(({ 
    seller, 
    onCall, 
    onOpenDetails, 
    onToggleFavorite, 
    isFavorite 
  }: { 
    seller: NearbySellerResponse;
    onCall: (seller: NearbySellerResponse) => void;
    onOpenDetails: (seller: NearbySellerResponse, tab: 'reviews' | 'catalog') => void;
    onToggleFavorite: (sellerId: string) => void;
    isFavorite: boolean;
  }) => {
    return (
      <div className="glass-morphism rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-market-orange/10 to-transparent rounded-bl-full" />
        
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
                  onClick={() => onToggleFavorite(seller.seller_id)}
                >
                  <Heart
                    size={16}
                    className={`transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-400'}`}
                  />
                </Button>
              </div>
  
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
                <div className="flex items-center">
                  {seller.seller_status.is_online ? (
                    <Bell size={14} className="text-market-green mr-1" />
                  ) : (
                    <BellOff size={14} className="text-muted-foreground mr-1" />
                  )}
                  <Badge
                    variant={seller.seller_status.is_online ? 'default' : 'secondary'}
                    className={`text-xs px-2 py-0.5 ${seller.seller_status.is_online
                      ? 'bg-market-green/10 text-market-green border-market-green/20'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {seller.seller_status.is_online ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
  
                <div className="flex items-center text-xs">
                  <span className="text-market-orange text-base">
                    {'★'.repeat(Math.floor(seller?.reviews_summary.average_rating || 0))}
                  </span>
                  {(seller?.reviews_summary.average_rating || 0) % 1 > 0 && <span className="text-market-orange/40">☆</span>}
                  <span className="ml-1 text-muted-foreground">({seller?.reviews_summary.total_reviews || 0})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 sm:line-clamp-3">
          {seller.seller_status.description || 'No Description'}
        </p>
  
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 text-xs text-muted-foreground mb-4">
          <div className="flex items-center">
            <MapPin size={12} className="mr-1" />
            <span>{seller.distance_km}km away</span>
          </div>
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            <span>Usually responds in {Math.round(seller.avg_response_time_minutes)} min</span>
          </div>
          <div className="flex items-center">
            <Award size={12} className="mr-1" />
            <span>{seller.seller_status.is_verified ? "Verified" : "Unverified"} Seller</span>
          </div>
        </div>
  
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 border-market-orange/20 hover:bg-market-orange/10"
              onClick={() => onOpenDetails(seller, 'reviews')}
            >
              <Star size={14} className="mr-1" />
              Reviews
            </Button>
  
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 border-market-orange/20 hover:bg-market-orange/10"
              onClick={() => onOpenDetails(seller, 'catalog')}
            >
              <Package size={14} className="mr-1" />
              Catalog
            </Button>
          </div>
  
          <Button
            onClick={() => onCall(seller)}
            size="sm"
            className={`w-full sm:w-auto h-8 px-3 ${seller.seller_status.is_online
              ? 'bg-market-green hover:bg-market-green/90 shadow-lg shadow-market-green/20'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
              } transition-all duration-200`}
            disabled={!seller.seller_status.is_online}
          >
            <PhoneCall size={14} />
            Talk Now
          </Button>
        </div>
      </div>
    );
  });
  
  SellerCard.displayName = 'SellerCard';
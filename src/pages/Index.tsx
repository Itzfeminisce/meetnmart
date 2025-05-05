
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PhoneCall, ShoppingBasket, MapPin } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';
import { getNearbyMarkets, MarketSearchResult } from '@/services/marketsService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import MarketIcon from '@/components/ui/svg/market-icon.svg';
import { MarketPlaceholder } from '@/components/MarketPlaceholder';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut, profile, userRole, isAuthenticated, fetchUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nearbyMarkets, setNearbyMarkets] = useState<MarketSearchResult[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [nearbyPage, setNearbyPage] = useState(1);
  const [hasMoreNearby, setHasMoreNearby] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (!userRole) {
        navigate('/role-selection');
      } else if (profile?.is_seller) {
        navigate('/seller-dashboard');
      } else {
        navigate('/markets');  // Changed from buyer-dashboard to markets
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = async () => {
    window.location.reload()
  };

  // Attempt to get location and load nearby markets on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsDetectingLocation(false);
        }
      );
    }
  }, []);

  // Load nearby markets when coordinates are available
  useEffect(() => {
    if (coordinates) {
      fetchNearbyMarkets();
    }
  }, [coordinates]);

  const fetchNearbyMarkets = async (loadMore = false) => {
    if (!coordinates) return;
    
    try {
      const page = loadMore ? nearbyPage + 1 : 1;
      setLoadingMore(true);
      
      const markets = await getNearbyMarkets(coordinates, page);
      
      if (markets.length === 0) {
        setHasMoreNearby(false);
      } else {
        setNearbyMarkets(prev => loadMore ? [...prev, ...markets] : markets);
        setNearbyPage(page);
      }
    } catch (error) {
      console.error("Error fetching nearby markets:", error);
      toast.error("Failed to load markets");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleMarketSelect = (market: MarketSearchResult) => {
    navigate('/categories', {
      state: {
        market: {
          id: market.id,
          name: market.name,
          location: market.address
        }
      }
    });
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreNearby) {
      fetchNearbyMarkets(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <main className="flex-grow flex flex-col p-4 animate-fade-in">
        <div className="glass-morphism max-w-md mx-auto p-6 rounded-xl mb-8">
          <div className="mb-8 text-center">
            <span className="font-bold text-5xl">
              Meet<span className="text-market-orange">n'</span><span className="text-market-purple">Mart</span>
            </span>
            <p className="text-xl text-muted-foreground">
              Connect with local sellers through LIVE video
            </p>
          </div>

          <div className="grid gap-4">
            {!isAuthenticated && <SocialAuthButtons redirectTo={window.location.origin} flow='login' providers={['google']} />}
            <Button disabled={isLoading}
              size="lg"
              onClick={handleGetStarted}
              className="bg-market-orange hover:bg-market-orange/90"
            >
              <ShoppingBasket className="mr-2 h-4 w-4" />
              {user ? 'Browse Markets' : 'Get Started'}
            </Button>

            {isAuthenticated ? (
              <Button disabled={isLoading}
                variant="outline"
                onClick={signOut}
                className="bg-secondary/50 border-none"
              >
                Sign Out
              </Button>
            ) : (
              <Button disabled={isLoading}
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="bg-secondary/50 border-none"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Continue with Phone
              </Button>
            )}
          </div>

          <div className="mt-8 text-sm text-muted-foreground text-center">
            <p>Test credentials: +15086842093, OTP: 123456</p>
          </div>
        </div>

        {/* We've removed the recently visited section as requested */}
        
        {isAuthenticated && (
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-lg font-medium flex items-center mb-4">
                <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
                <MapPin className="w-4 h-4 mr-2" />
                Markets near you
              </h2>
              
              {isDetectingLocation && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-2 border-market-orange border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Detecting your location...</p>
                </div>
              )}
              
              {!isDetectingLocation && !coordinates && (
                <MarketPlaceholder message="Could not detect your location. Please go to Markets page and enable location services." />
              )}
              
              {!isDetectingLocation && coordinates && nearbyMarkets.length === 0 && (
                <MarketPlaceholder message="No markets found nearby." />
              )}
              
              {nearbyMarkets.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate('/markets')}
                >
                  View All Markets
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;

import { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Search, Store, Users, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface Market {
  id: string;
  name: string;
  address: string;
  buyerCount: number;
  isActive: boolean;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const SellerMarketSelection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  
  // Mock data - in real app this would come from API
  const [availableMarkets] = useState<Market[]>([
    {
      id: '1',
      name: 'Downtown Farmer\'s Market',
      address: '123 Main St, Downtown',
      buyerCount: 1250,
      isActive: true
    },
    {
      id: '2',
      name: 'Westside Community Market',
      address: '456 Oak Ave, Westside',
      buyerCount: 890,
      isActive: false
    },
    {
      id: '3',
      name: 'Riverside Weekend Market',
      address: '789 River Rd, Riverside',
      buyerCount: 650,
      isActive: true
    },
    {
      id: '4',
      name: 'Suburban Plaza Market',
      address: '321 Plaza Dr, Suburbs',
      buyerCount: 420,
      isActive: false
    }
  ]);

  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>(availableMarkets);

  // Handle location detection
  const handleLocationDetection = () => {
    setIsDetectingLocation(true);
    
    // Simulate location detection
    setTimeout(() => {
      setLocation({ latitude: 40.7128, longitude: -74.0060 });
      setIsDetectingLocation(false);
    }, 1500);
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredMarkets(availableMarkets);
    } else {
      const filtered = availableMarkets.filter(market =>
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMarkets(filtered);
    }
  }, [searchQuery, availableMarkets]);

  // Handle market selection
  const handleMarketToggle = (marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) 
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  };

  // Handle continue to categories
  const handleContinue = () => {
    // Navigate to category selection
    console.log('Selected markets:', selectedMarkets);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Choose Your Markets</h1>
        <p className="text-muted-foreground">Select where you want to sell your products</p>
      </header>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-none"
          />
        </div>
      </div>

      {/* Location Detection */}
      <div className="mb-6">
        <Button
          variant="outline"
          className="w-full bg-secondary/50 border-none"
          onClick={handleLocationDetection}
          disabled={isDetectingLocation}
        >
          {isDetectingLocation ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <MapPin size={16} className="mr-2 text-market-blue" />
          )}
          {isDetectingLocation ? 'Finding markets near you...' : 'Find markets near me'}
        </Button>
      </div>

      {/* Selection Summary */}
      {selectedMarkets.length > 0 && (
        <Card className="mb-6 bg-market-orange/10 border-market-orange/20">
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

      {/* Available Markets */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-medium flex items-center">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Available Markets
        </h2>

        <div className="space-y-3">
          {filteredMarkets.map(market => (
            <div
              key={market.id}
              className={`glass-morphism rounded-lg p-4 cursor-pointer transition-all ${
                selectedMarkets.includes(market.id) 
                  ? 'ring-2 ring-market-orange bg-market-orange/5' 
                  : 'hover:bg-secondary/30'
              }`}
              onClick={() => handleMarketToggle(market.id)}
            >
              <div className="flex items-center">
                <Avatar className="w-12 h-12 mr-4">
                  <AvatarImage src="" alt="Market Icon" />
                  <AvatarFallback className="bg-market-orange/20 text-market-orange">
                    {getInitials(market.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{market.name}</h3>
                    {market.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-market-green/20 text-market-green">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <MapPin size={12} className="mr-1" />
                    <span>{market.address}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-market-blue">
                    <Users size={12} className="mr-1" />
                    <span>{market.buyerCount} potential customers</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {selectedMarkets.includes(market.id) ? (
                    <CheckCircle size={20} className="text-market-orange" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-8">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No markets found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-6">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={selectedMarkets.length === 0}
          className="w-full bg-market-orange hover:bg-market-orange/90"
        >
          Continue to Categories
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          You can change your market selection anytime from your dashboard
        </p>
      </div>
    </div>
  );
};

export default SellerMarketSelection;
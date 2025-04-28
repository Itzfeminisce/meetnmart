
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Search, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNavigation from '@/components/BottomNavigation';
import { markets } from '@/lib/mockData';
import { Market } from '@/types';
import { toast } from 'sonner';

const MarketSelection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const navigate = useNavigate();

  const filteredMarkets = searchQuery
    ? markets.filter(market => 
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        market.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : markets;

  const handleLocationDetection = () => {
    setIsDetecting(true);
    // Simulate location detection
    setTimeout(() => {
      setIsDetecting(false);
      toast.success("Location detected! Showing nearby markets.");
    }, 1500);
  };

  const handleSelectMarket = (market: Market) => {
    navigate('/categories', { state: { market } });
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Select a Market</h1>
        <p className="text-muted-foreground">Choose a market near you or search</p>
      </header>
      
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
      
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          className="flex-1 mr-2 bg-secondary/50 border-none"
          onClick={handleLocationDetection}
          disabled={isDetecting}
        >
          <MapPin size={16} className="mr-2 text-market-blue" />
          {isDetecting ? 'Detecting...' : 'Detect location'}
        </Button>
        <Button
          variant="outline"
          className="flex-1 ml-2 bg-secondary/50 border-none"
        >
          <List size={16} className="mr-2 text-market-green" />
          View all markets
        </Button>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Markets near you
        </h2>
        
        <div className="space-y-3">
          {filteredMarkets.map(market => (
            <div
              key={market.id}
              className="glass-morphism rounded-lg p-3 flex items-center card-hover"
              onClick={() => handleSelectMarket(market)}
            >
              <div className="h-16 w-16 rounded-md overflow-hidden mr-3 flex-shrink-0">
                <img
                  src={market.image || 'https://images.unsplash.com/photo-1487958449943-2429e8be8625'}
                  alt={market.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{market.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin size={12} className="mr-1" />
                  <span>{market.location}</span>
                </div>
                {market.distance && (
                  <div className="text-xs text-market-blue mt-1">{market.distance}</div>
                )}
              </div>
              <ArrowRight size={18} className="text-muted-foreground" />
            </div>
          ))}
          
          {filteredMarkets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No markets found matching your search
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default MarketSelection;

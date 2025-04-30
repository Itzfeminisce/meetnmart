
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import EscrowPaymentConfirmModal from '@/components/EscrowPaymentConfirmModal';
import { sellers, categories } from '@/lib/mockData';
import { Market, Seller } from '@/types';
import { toast } from 'sonner';
import { getInitials, toLivekitRoomName } from '@/lib/utils';
import livekitService from '@/services/livekitService';

const SellersList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { market, categoryId } = location.state as { market: Market; categoryId: string };
  
  const [paymentConfirmModalOpen, setPaymentConfirmModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [requestAmount, setRequestAmount] = useState(0);

  const category = categories.find(cat => cat.id === categoryId);
  const filteredSellers = sellers.filter(seller => seller.category === categoryId);

  // This is for demo purposes to simulate a seller requesting payment
  // In a real app, this would come from a notification or a WebSocket
  const simulatePaymentRequest = (seller: Seller) => {
    setSelectedSeller(seller);
    setRequestAmount(Math.floor(Math.random() * 50) + 10); // Random amount between 10 and 60
    setPaymentConfirmModalOpen(true);
  };

  // In a real app, this would happen randomly or after a call
  // For demo purposes, we'll just show a button to simulate it
  const simulateRandomPaymentRequest = () => {
    const onlineSellers = filteredSellers.filter(s => s.isOnline);
    if (onlineSellers.length > 0) {
      const randomSeller = onlineSellers[Math.floor(Math.random() * onlineSellers.length)];
      setTimeout(() => {
        simulatePaymentRequest(randomSeller);
      }, 5000); // Simulate payment request after 5 seconds
    }
  };

  // Trigger a random payment request for demo purposes
  useState(() => {
    simulateRandomPaymentRequest();
  });

  const handleCall = async (seller: Seller) => {
    if (!seller.isOnline) {
      toast.error("This seller is currently offline.");
      return;
    }
    setSelectedSeller(seller);
    navigate('/call', { state: { seller} });
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
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
      
      <div className="space-y-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Available Sellers
        </h2>
        
        <div className="space-y-3">
          {filteredSellers.length > 0 ? (
            filteredSellers.map(seller => (
              <div
                key={seller.id}
                className="glass-morphism rounded-lg p-4"
              >
                <div className="flex items-center mb-3">
                  <Avatar className="h-12 w-12 mr-3 border-2 border-secondary">
                    {seller.avatar ? (
                      <AvatarImage src={seller.avatar} alt={seller.name} />
                    ) : (
                      <AvatarFallback className="bg-secondary text-foreground">
                        {getInitials(seller.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <h3 className="font-medium">{seller.name}</h3>
                      <div className="ml-2 flex items-center">
                        {seller.isOnline ? (
                          <Bell size={14} className="text-market-green" />
                        ) : (
                          <BellOff size={14} className="text-muted-foreground" />
                        )}
                        <span className={`text-xs ml-1 ${seller.isOnline ? 'text-market-green' : 'text-muted-foreground'}`}>
                          {seller.isOnline ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="flex items-center">
                        {'★'.repeat(Math.floor(seller.rating))}
                        {seller.rating % 1 > 0 ? '☆' : ''}
                        <span className="ml-1">{seller.rating.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {seller.description}
                </p>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleCall(seller)}
                    className={`${seller.isOnline ? 'bg-market-green hover:bg-market-green/90' : 'bg-muted text-muted-foreground'}`}
                    disabled={!seller.isOnline}
                  >
                    <PhoneCall size={16} className="mr-2" />
                    Talk Now
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No sellers found in this category
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
      
      {selectedSeller && (
        <EscrowPaymentConfirmModal
          open={paymentConfirmModalOpen}
          onOpenChange={setPaymentConfirmModalOpen}
          sellerName={selectedSeller.name}
          amount={requestAmount}
          onAccept={() => {
            toast.success(`Payment of $${requestAmount.toFixed(2)} sent to ${selectedSeller.name}!`);
          }}
          onReject={() => {
            toast.info(`Payment request from ${selectedSeller.name} was rejected.`);
          }}
        />
      )}
    </div>
  );
};

export default SellersList;


import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { categories } from '@/lib/mockData';
import { Market } from '@/types';
import { getInitials, toLivekitRoomName } from '@/lib/utils';
import { useAuth, UsersByRole } from '@/contexts/AuthContext';
import { CallData } from '@/contexts/live-call-context';
import { useGetSellers } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import ErrorComponent from '@/components/ErrorComponent';
import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

const SellersList = () => {
  const { profile } = useAuth()
  const location = useLocation();
  const navigate = useNavigate();
  const {unsubscribe,subscribe} = useSocket()
  const { market, categoryId } = location.state as { market: Market; categoryId: string };


  const { data: sellers, isLoading, error, refetch } = useGetSellers()

  const category = categories.find(cat => cat.id === categoryId);
  const filteredSellers = sellers //.filter(seller => seller.category === categoryId);

  const handleCall = async (seller: UsersByRole) => {
    navigate('/calls', {
      state: {
        caller: { id: profile.id, name: profile.name },
        room: toLivekitRoomName(`call_${Date.now()}_${seller.id}`),
        receiver: { name: seller.name, id: seller.id },
      } as CallData,
    });
  };



  useEffect(() => {
    subscribe("user_socket_cache:user_joined", refetch)
    return () => unsubscribe("user_socket_cache:user_joined", refetch)
  }, [refetch])


  if (error) return <ErrorComponent error={error} onRetry={() => navigate(0)} />


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

      <div className="space-y-4 mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Available Sellers
        </h2>

        <div className="space-y-3">
          {isLoading ? (
            <Loader />
          ) : filteredSellers?.length > 0 ? (
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
                        {seller.is_online ? (
                          <Bell size={14} className="text-market-green" />
                        ) : (
                          <BellOff size={14} className="text-muted-foreground" />
                        )}
                        <span className={`text-xs ml-1 ${seller.is_online ? 'text-market-green' : 'text-muted-foreground'}`}>
                          {seller.is_online ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <span className='text-market-orange'>{'★'.repeat(Math.floor(seller?.avg_rating))}</span>
                        {seller.avg_rating % 1 > 0 ? '☆' : ''}
                        <span className="ml-1 ">{seller?.total_reviews || 'No Reviews'}</span>
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
                    className={`${seller.is_online ? 'bg-market-green hover:bg-market-green/90' : 'bg-muted text-muted-foreground'}`}
                    disabled={!seller.is_online}
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

      {/* {selectedSeller && (
        <EscrowPaymentConfirmModal
        payload={}
          open={paymentConfirmModalOpen}
          onOpenChange={setPaymentConfirmModalOpen}
          sellerName={selectedSeller.name}
          onAccept={() => {
            toast.success(`Payment of $${requestAmount.toFixed(2)} sent to ${selectedSeller.name}!`);
          }}
          onReject={() => {
            toast.info(`Payment request from ${selectedSeller.name} was rejected.`);
          }}
        />
      )} */}
    </div>
  );
};

export default SellersList;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, PhoneCall, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import EscrowRequestModal from '@/components/EscrowRequestModal';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const recentCalls = [
  { id: 'c1', buyerName: 'John Smith', time: '2 hours ago', duration: '8:45', missed: false },
  { id: 'c2', buyerName: 'Sarah Wilson', time: 'Yesterday', duration: '12:32', missed: false },
  { id: 'c3', buyerName: 'Robert Lee', time: 'Yesterday', duration: '', missed: true },
];

const paymentRequests = [
  { id: 'p1', buyerName: 'John Smith', amount: 45.99, status: 'accepted', time: '1 hour ago' },
  { id: 'p2', buyerName: 'Emma Davis', amount: 24.50, status: 'pending', time: 'Yesterday' },
];

const SellerDashboard = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleToggleOnline = async (checked: boolean) => {
    setIsOnline(checked);
    toast.success(checked ? 'You are now online!' : 'You are now offline');

    if (user) {
      await supabase
        .from('profiles')
        .update({ is_online: checked })
        .eq('id', user.id);
    }
  };

  const handleRequestPayment = (buyerId: string, buyerName: string) => {
    setSelectedBuyer({ id: buyerId, name: buyerName });
    setEscrowModalOpen(true);
  };

  const handlePaymentRequestSubmit = (amount: number) => {
    if (selectedBuyer) {
      toast.success(`Payment request of $${amount.toFixed(2)} sent to ${selectedBuyer.name}!`);
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-seller-profile');
  };
  const handleSignOut = async () => {
    toast.success('Clearing session...');
    await signOut()
    navigate('/');
  };

  if (!profile) {
    return (
      <div className="app-container flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your seller account</p>
      </header>

      <div className="glass-morphism rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <Avatar className="h-16 w-16 mr-4 border-2 border-market-orange/50">
            {profile.avatar ? (
              <AvatarImage src={profile.avatar} alt={profile.name} />
            ) : (
              <AvatarFallback className="bg-secondary text-foreground">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">{profile.name || 'MeetnMart Seller'}</h2>
            <p className="text-sm text-muted-foreground capitalize">{profile.category || 'Uncategorized'}</p>
            <p className="text-xs text-market-blue">{profile.phone_number || user?.phone}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Availability Status</h3>
              <p className="text-sm text-muted-foreground">
                {isOnline ? 'You are visible to buyers' : 'You are not visible to buyers'}
              </p>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
              className={isOnline ? 'bg-market-green' : undefined}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium flex items-center mb-4">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Payment Requests
        </h2>

        <div className="space-y-3 mb-6">
          {paymentRequests.length > 0 ? (
            paymentRequests.map(payment => (
              <div
                key={payment.id}
                className="glass-morphism rounded-lg p-3 flex items-center"
              >
                <div className="h-10 w-10 rounded-full bg-market-green/20 flex items-center justify-center mr-3">
                  <DollarSign size={20} className="text-market-green" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-sm">${payment.amount.toFixed(2)} from {payment.buyerName}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock size={12} className="mr-1" />
                    <span>{payment.time}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${payment.status === 'accepted'
                      ? 'bg-market-green/20 text-market-green'
                      : payment.status === 'pending'
                        ? 'bg-market-orange/20 text-market-orange'
                        : 'bg-destructive/20 text-destructive'
                      }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No payment requests yet
            </div>
          )}
        </div>

        <h2 className="text-lg font-medium flex items-center mb-4">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Recent Calls
        </h2>

        <div className="space-y-3">
          {recentCalls.map(call => (
            <div
              key={call.id}
              className="glass-morphism rounded-lg p-3 flex items-center"
            >
              <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center mr-3">
                <PhoneCall size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-sm">
                  {call.buyerName}
                  {call.missed && (
                    <span className="text-destructive text-xs ml-2">(Missed)</span>
                  )}
                </h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock size={12} className="mr-1" />
                  <span>{call.time}</span>
                  {call.duration && (
                    <span className="ml-2">{call.duration}</span>
                  )}
                </div>
              </div>
              {!call.missed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-market-green hover:text-market-green/90"
                  onClick={() => handleRequestPayment(call.id, call.buyerName)}
                >
                  <DollarSign size={16} className="mr-1" />
                  Request
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium flex items-center mb-4">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Earnings Overview
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-morphism rounded-lg p-3 text-center">
            <div className="text-market-green text-xl font-bold">$254.65</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
          <div className="glass-morphism rounded-lg p-3 text-center">
            <div className="text-market-blue text-xl font-bold">$1,245.00</div>
            <div className="text-xs text-muted-foreground">All Time</div>
          </div>
        </div>
      </div>

      <Button
        className="w-full mb-8 bg-market-orange hover:bg-market-orange/90"
        onClick={handleEditProfile}
      >
        Edit Profile
      </Button>
      <Button
        disabled={isLoading}
        className="w-full mb-8 bg-destructive/10 hover:bg-destructive/90 hover:text-foreground text-destructive"
        onClick={handleSignOut}
      >
        Log out
      </Button>

      <EscrowRequestModal
        open={escrowModalOpen}
        onOpenChange={setEscrowModalOpen}
        sellerName={profile.name || 'MeetnMart Seller'}
        onSuccess={handlePaymentRequestSubmit}
      />
    </div>
  );
};

export default SellerDashboard;

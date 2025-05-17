
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, PhoneCall, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import EscrowRequestModal from '@/components/EscrowRequestModal';
import { toast } from 'sonner';
import { useAuth, WalletSummary } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { WalletSummary as WalletSummaryComponent } from '@/components/WalletSummary';
import Loader from '@/components/ui/loader';
import RecentCallCard from '@/components/RecentCallCard';
import { useFetch } from '@/hooks/api-hooks';

const recentCalls = [
  { id: 'c1', buyerName: 'John Smith', time: '2 hours ago', duration: '8:45', missed: false },
  { id: 'c2', buyerName: 'Sarah Wilson', time: 'Yesterday', duration: '12:32', missed: false },
  { id: 'c3', buyerName: 'Robert Lee', time: 'Yesterday', duration: '', missed: true },
];

const paymentRequests = [
  { id: 'p1', buyerName: 'John Smith', amount: 45.99, status: 'accepted', time: '1 hour ago' },
  { id: 'p2', buyerName: 'Emma Davis', amount: 24.50, status: 'pending', time: 'Yesterday' },
];

// const fetchTransactionsData = async () => {
//   setTrxErr('')
//   try {
//     setIsLoadingTrx(true)
//     const trxs = await fetchTransactions({ user_id: user.id, limit_count: 2 })
//     setRecentCalls(trxs)
//     setTrxErr('')
//   } catch (error) {
//     setTrxErr("Unable to load transaction. Please try again")
//   } finally {
//     setIsLoadingTrx(false)
//   }
// }

const SellerDashboard = () => {
  const { user, profile, signOut, isLoading, fetchTransactions } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  // const [walletSummary, setWalletSummary] = useState<WalletSummary>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<{ id: string; name: string } | null>(null);

  const {data:recentCalls, isLoading: isLoadingTrx, error: trxErr } = useFetch(["transactions"], () => fetchTransactions({ user_id: user.id, limit_count: 2 }),)
  // const {data:walletSummary } = useFetch(["wallets"], fetchWalletSummary,)


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
          <WalletSummaryComponent userRole='seller' />
      </div>

      <div className="my-6">
        <div className='w-full flex items-center justify-between py-4'>
          <h2 className='font-bold'>Recent Calls</h2>
          <Button
            type='button'
            onClick={() => navigate("/recent-calls")}
            size='sm'
            variant='link'
          >View All</Button>
        </div>

        <div className="space-y-4">
          {isLoadingTrx ? (
            <Loader />
          ) : trxErr ? (
            <p>{trxErr as any}</p>
          ) : (
            !trxErr && recentCalls.length == 0 ? (
              <p>No transactions found.</p>
            ) : recentCalls.map((call) => (
              <RecentCallCard role={'seller'} key={call.transaction_id} recentCall={call} />
            ))
          )}
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

    </div>
  );
};

export default SellerDashboard;


import { useState,  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth,  } from '@/contexts/AuthContext';
import { WalletSummary as WalletSummaryComponent } from '@/components/WalletSummary';
import Loader from '@/components/ui/loader';
import RecentCallCard from '@/components/RecentCallCard';
import { useFetch, useGetTransactions } from '@/hooks/api-hooks';
import ErrorComponent from '@/components/ErrorComponent';



const SellerDashboard = () => {
  const { user, profile, signOut, isLoading, fetchTransactions } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);

  const { data: recentCalls, isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({params: { user_id: user.id, limit_count: 2 }})


  const handleToggleOnline = async (checked: boolean) => {
    setIsOnline(checked);
    toast.success(checked ? 'You are now online!' : 'You are now offline');
  }
  const handleEditProfile = () => {
    navigate('/edit-seller-profile');
  };


  const handleSignOut = async () => {
    toast.success('Clearing session...');
    await signOut()
    navigate('/');
  };

  if (trxErr) return <ErrorComponent error={trxErr as Error} onRetry={() => navigate(0)} />

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
          ) : recentCalls?.length == 0 ? (
              <p>No transactions found.</p>
            ) : recentCalls.map((call) => (
              <RecentCallCard role={'seller'} key={call.transaction_id} recentCall={call} />
            )
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

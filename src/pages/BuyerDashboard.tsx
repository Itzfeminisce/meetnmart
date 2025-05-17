
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ShoppingBag, Truck } from 'lucide-react';
import { formatCurrency, getInitials } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { MarketPlaceholder } from '@/components/MarketPlaceholder';
import { toast } from 'sonner';
import RecentCallCard from '@/components/RecentCallCard';
import { Separator } from '@/components/ui/separator';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/api-hooks';

const BuyerDashboard = () => {
  const { user, profile, signOut, userRole, isLoading, fetchTransactions, wallet: walletData } = useAuth();
  const navigate = useNavigate();

  const {data:recentCalls, isLoading: isLoadingTrx, error: trxErr } = useFetch(["transactions"], () => fetchTransactions({ user_id: user.id, limit_count: 2 }),)


  if (!user) {
    return <MarketPlaceholder message="Please sign in to view your dashboard" />;
  }

  const navigateToMarkets = () => {
    navigate('/markets');
  };


  const handleEditProfile = () => {
    navigate('/edit-buyer-profile');
  };
  const handleSignOut = async () => {
    toast.success('Clearing session...');
    await signOut()
    navigate('/');
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <div className="flex justify-between items-center gap-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Hello, {profile?.name || 'Buyer'}!</h1>
          <p className="text-muted-foreground">Welcome back to your dashboard</p>
        </div>

        <Avatar onClick={handleEditProfile} className="h-14 w-14 mr-5  self-start  text-market-green border-market-green/30 cursor-pointer">
          <AvatarImage src={profile?.avatar} alt="Profile" />
          <AvatarFallback className="bg-secondary text-foreground">{getInitials(profile?.name)}</AvatarFallback>
        </Avatar>
      </div>

      {/* Wallet Card */}
      <Card className="mb-6 bg-gradient-to-br from-market-green/20 to-background shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(walletData.balance)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(walletData.escrowed_balance)} in escrow
              </p>
            </div>
            <Button variant="outline" className="rounded-full h-10 w-10 p-0">
              <DollarSign className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 text-market-green border-market-green/30"
          onClick={navigateToMarkets}
        >
          <ShoppingBag className="h-6 w-6 mb-2" />
          <span>Shop Now</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 text-market-orange border-market-orange/30"
        >
          <Truck className="h-6 w-6 mb-2" />
          <span>Delivery</span>
        </Button>
      </div>

      <div className="mt-6">
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
            <p>{trxErr as string}</p>
          ) : (
            !trxErr && recentCalls.length == 0 ? (
              <p>No transactions found.</p>
            ) : recentCalls.map((call) => (
              <RecentCallCard role={userRole} key={call.transaction_id} recentCall={call} />
            ))
          )}
        </div>
      </div>

      <Separator className='my-4' />

      <div className="mt-4">
        <Button
          disabled={isLoading}
          className="w-full mb-8 bg-destructive/10 hover:bg-destructive/90 hover:text-foreground text-destructive"
          onClick={handleSignOut}
        >
          Log out
        </Button>
      </div>
    </div>
  );
};

export default BuyerDashboard;

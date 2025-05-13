
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ShoppingBag, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, getInitials } from '@/lib/utils';
import { WalletData } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketPlaceholder } from '@/components/MarketPlaceholder';
import { toast } from 'sonner';
import { WalletSummary } from '@/components/WalletSummary';

const BuyerDashboard = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const [walletData, setWalletData] = useState<WalletData>({ balance: 0, escrowed_balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Fetch wallet data
    const fetchWalletData = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_wallet', {
          uid: user.id,
        }) as any;

        if (error) throw error;
        if (data) {
          setWalletData({
            balance: +data.balance || 0,
            escrowed_balance: +data.escrowed_balance || 0
          });
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    // Fetch mock data for demo purposes
    const fetchMockData = () => {
      // Mock transactions data
      const mockTransactions = [
        { id: 1, type: 'payment', amount: 52.50, description: 'Fresh vegetables', status: 'completed', date: '2025-04-28' },
        { id: 2, type: 'escrow', amount: 120.00, description: 'Electronic goods', status: 'pending', date: '2025-04-27' },
        { id: 3, type: 'payment', amount: 35.75, description: 'Local spices', status: 'completed', date: '2025-04-25' },
      ];

      // Mock calls data
      const mockCalls = [
        { id: 1, seller: 'Aisha M.', duration: '12:45', date: '2025-04-28', category: 'Vegetables' },
        { id: 2, seller: 'Kofi Electronics', duration: '08:20', date: '2025-04-26', category: 'Electronics' },
        { id: 3, seller: 'Mama Spices', duration: '05:30', date: '2025-04-24', category: 'Food' },
      ];

      setRecentTransactions(mockTransactions);
      setRecentCalls(mockCalls);
    };

    fetchWalletData();
    fetchMockData();
  }, [user]);

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

        <Avatar className="h-14 w-14 mr-5  self-start  text-market-green border-market-green/30">
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

      <Tabs defaultValue="transactions" className="mt-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="calls">Recent Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <Card key={tx.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className={`rounded-full p-2 mr-4 ${tx.type === 'escrow' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {tx.type === 'escrow' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(tx.amount)}</p>
                      <p className={`text-xs ${tx.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calls">
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <Card key={call.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitials(call.seller)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{call.seller}</p>
                      <p className="text-xs text-muted-foreground">{call.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{call.duration}</p>
                      <p className="text-xs text-muted-foreground">{call.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
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
    </div>
  );
};

export default BuyerDashboard;

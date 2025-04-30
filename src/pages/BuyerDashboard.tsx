
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, TrendingUp, User, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatDuration } from '@/lib/utils';

// Mock data for the buyer dashboard
const mockTransactions = [
  { id: 't1', description: 'Fresh Vegetables', amount: 24.50, date: '2 days ago', status: 'completed' },
  { id: 't2', description: 'Handmade Craft', amount: 45.99, date: '5 days ago', status: 'completed' },
  { id: 't3', description: 'Delivery Service', amount: 15.00, date: 'Apr 15', status: 'pending' },
];

const mockEscrows = [
  { id: 'e1', description: 'Organic Fruits', amount: 32.75, seller: 'Maria G.', status: 'held', date: '3 hours ago' },
  { id: 'e2', description: 'Custom Artwork', amount: 89.50, seller: 'John A.', status: 'delivered', date: 'Yesterday' },
];

const mockCalls = [
  { id: 'c1', sellerName: 'Fresh Market', duration: 462, time: '1 hour ago' },
  { id: 'c2', sellerName: 'Craft Corner', duration: 185, time: 'Yesterday' },
  { id: 'c3', sellerName: 'Tech Gadgets', duration: 723, time: 'Apr 15' },
];

interface WalletData {
  balance: number;
  escrowed_balance: number;
}

const BuyerDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchWalletData = async () => {
      try {
        // Call the Supabase function to get user wallet data
        const { data, error } = await supabase.rpc('get_user_wallet', { uid: user.id });
        
        if (error) throw error;
        setWalletData(data);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, [user, navigate]);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleSignOut = async () => {
    toast.success('Clearing session...');
    await signOut();
    navigate('/');
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-market-green/20 text-market-green';
      case 'pending':
        return 'bg-market-orange/20 text-market-orange';
      case 'held':
        return 'bg-market-blue/20 text-market-blue';
      case 'delivered':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-secondary/20 text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container px-4 pt-6 pb-20 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Buyer Dashboard</h1>
        <p className="text-muted-foreground">Manage your purchases and transactions</p>
      </header>

      <div className="glass-morphism rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <Avatar className="h-16 w-16 mr-4 border-2 border-market-blue/50">
            {profile?.avatar ? (
              <AvatarImage src={profile.avatar} alt={profile.name} />
            ) : (
              <AvatarFallback className="bg-secondary text-foreground">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'B'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">{profile?.name || 'MeetnMart Buyer'}</h2>
            <p className="text-xs text-market-blue">{profile?.phone_number || user?.phone}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
            <p className="text-xl font-semibold text-market-green">${walletData?.balance.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-secondary/30 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">In Escrow</p>
            <p className="text-xl font-semibold text-market-orange">${walletData?.escrowed_balance.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-medium flex items-center mb-4">
                <span className="bg-market-blue/20 w-1 h-5 mr-2"></span>
                Active Escrows
              </h2>

              {mockEscrows.length > 0 ? (
                <div className="space-y-3">
                  {mockEscrows.map((escrow) => (
                    <div key={escrow.id} className="glass-morphism rounded-lg p-3 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-market-blue/20 flex items-center justify-center mr-3">
                        <DollarSign size={20} className="text-market-blue" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">${escrow.amount.toFixed(2)} - {escrow.description}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusClass(escrow.status)}`}>
                            {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Seller: {escrow.seller} · {escrow.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No active escrow payments
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-medium flex items-center mb-4">
                <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
                Recent Calls
              </h2>

              <div className="space-y-3">
                {mockCalls.map((call) => (
                  <div key={call.id} className="glass-morphism rounded-lg p-3 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center mr-3">
                      <Clock size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm">{call.sellerName}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{formatDuration(call.duration)}</span>
                        <span className="mx-2">•</span>
                        <span>{call.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div>
            <h2 className="text-lg font-medium flex items-center mb-4">
              <span className="bg-market-green/20 w-1 h-5 mr-2"></span>
              Transaction History
            </h2>

            <div className="space-y-3">
              {mockTransactions.map((transaction) => (
                <div key={transaction.id} className="glass-morphism rounded-lg p-3 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-market-green/20 flex items-center justify-center mr-3">
                    <DollarSign size={20} className="text-market-green" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{transaction.description}</h3>
                      <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{transaction.date}</span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded-full ${getStatusClass(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="space-y-4">
            <Card className="glass-morphism">
              <CardContent className="pt-6">
                <h3 className="font-medium text-center mb-4">Shopping Categories</h3>
                <div className="h-32 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Spending trends visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism">
              <CardContent className="pt-6">
                <h3 className="font-medium text-center mb-4">Monthly Spending</h3>
                <div className="h-32 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Monthly spending chart will appear here</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-morphism rounded-lg p-3 text-center">
                <div className="text-market-green text-lg font-bold">$245.30</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </div>
              <div className="glass-morphism rounded-lg p-3 text-center">
                <div className="text-market-blue text-lg font-bold">$1,320.75</div>
                <div className="text-xs text-muted-foreground">All time</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        className="w-full bg-market-blue hover:bg-market-blue/90"
        onClick={handleEditProfile}
      >
        Edit Profile
      </Button>
      
      <Button
        className="w-full mt-4 mb-8 bg-destructive/10 hover:bg-destructive/90 hover:text-foreground text-destructive"
        onClick={handleSignOut}
      >
        Log out
      </Button>

      <BottomNavigation />
    </div>
  );
};

export default BuyerDashboard;

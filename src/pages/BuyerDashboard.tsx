import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  DollarSign,
  ShoppingBag,
  Truck,
  TrendingUp,
  Star,
  Phone,
  Calendar,
  Target,
  Award,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { formatCurrency, getInitials } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import RecentCallCard from '@/components/RecentCallCard';
import { Separator } from '@/components/ui/separator';
import Loader from '@/components/ui/loader';
import { useGetTransactions } from '@/hooks/api-hooks';
import ErrorComponent from '@/components/ErrorComponent';
import { ComingSoon } from '@/components/PremiumFeature';
import AppHeader from '@/components/AppHeader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const BuyerDashboard = () => {
  const { user, profile, signOut, userRole, isLoading, fetchTransactions, wallet: walletData } = useAuth();
  const navigate = useNavigate();

  const { data: recentCalls, isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({
    params: { user_id: user.id, limit_count: 3 }
  });

  // Mock data for enhanced buyer experience
  const buyerStats = {
    totalSpent: 2450.00,
    totalCalls: 47,
    avgCallDuration: '12m 34s',
    favoriteCategories: ['Tech Support', 'Consulting', 'Tutoring'],
    thisMonthSpent: 580.00,
    monthlyBudget: 1000.00,
    savedExperts: 12,
    completedCalls: 43,
    rating: 4.8
  };

  const upcomingCalls = [
    { expert: 'Sarah Chen', category: 'Business Consulting', time: '2:30 PM Today', price: 45 },
    { expert: 'Mike Johnson', category: 'Tech Support', time: 'Tomorrow 10:00 AM', price: 35 }
  ];

  const navigateToMarkets = () => navigate(`/markets`);
  const handleEditProfile = () => navigate('/edit-buyer-profile');

  const handleSignOut = async () => {
    toast.success('Clearing session...');
    await signOut();
    navigate('/');
  };

  if (trxErr) return <ErrorComponent error={trxErr as Error} onRetry={() => navigate(0)} />;

  const budgetProgress = (buyerStats.thisMonthSpent / buyerStats.monthlyBudget) * 100;

  return (
    <>
      <AppHeader
        title={`Hello, ${profile?.name || 'Buyer'}!`}
        subtitle={
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{buyerStats.rating} rating</span>
            </div>
            <div className="md:flex items-center gap-1 hidden ">
              <Phone className="h-4 w-4" />
              <span>{buyerStats.completedCalls} calls completed</span>
            </div>
          </div>
        }
        rightContent={
          <Avatar onClick={handleEditProfile} className="md:h-16 h-12 md:w-16 w-12 cursor-pointer ring-2 ring-market-green/20 hover:ring-market-green/40 transition-all">
            <AvatarImage src={profile?.avatar} alt="Profile" />
            <AvatarFallback className="bg-market-green/10 text-market-green font-semibold text-lg">
              {getInitials(profile?.name)}
            </AvatarFallback>
          </Avatar>
        }
      />

      <div className="container animate-fade-in max-w-4xl">

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Wallet Card */}
          <Card className="bg-gradient-to-br from-market-green/10 via-background to-market-green/5 border-market-green/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
                <Tooltip>
                    <ComingSoon>
                  <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                  </TooltipTrigger>
                    </ComingSoon>
                  <TooltipContent>
                    Add Funds
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-market-green">{formatCurrency(walletData.balance)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(walletData.escrowed_balance)} in active calls
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">+12% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Budget Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{formatCurrency(buyerStats.thisMonthSpent)}</p>
                  <Badge variant={budgetProgress > 80 ? "destructive" : "secondary"}>
                    {Math.round(budgetProgress)}% used
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={budgetProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(buyerStats.monthlyBudget - buyerStats.thisMonthSpent)} remaining of {formatCurrency(buyerStats.monthlyBudget)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-market-green" />
            <p className="text-2xl font-bold">{formatCurrency(buyerStats.totalSpent)}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </Card>

          <Card className="text-center p-4">
            <Phone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{buyerStats.totalCalls}</p>
            <p className="text-sm text-muted-foreground">Total Calls</p>
          </Card>

          <Card className="text-center p-4">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{buyerStats.avgCallDuration}</p>
            <p className="text-sm text-muted-foreground">Avg Duration</p>
          </Card>

          <Card className="text-center p-4">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{buyerStats.savedExperts}</p>
            <p className="text-sm text-muted-foreground">Saved Experts</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            variant="outline"
            className="flex items-center justify-between h-auto p-6 text-market-green border-market-green/30 hover:bg-market-green/5"
            onClick={navigateToMarkets}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold">Find Sellers</p>
                <p className="text-sm text-muted-foreground">Browse marketplace</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4" />
          </Button>

          <ComingSoon>
            <Button
              variant="outline"
              className="flex items-center justify-between h-auto p-6 text-market-purple border-martext-market-purple/30 w-full"
            >
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-purple-500" />
                <div className="text-left">
                  <p className="font-semibold">Saved Experts</p>
                  <p className="text-sm text-muted-foreground">{buyerStats.savedExperts} experts</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </ComingSoon>

          <ComingSoon>
            <Button
              variant="outline"
              className="flex items-center justify-between h-auto p-6 text-market-orange border-market-orange/30 w-full"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-semibold">Schedule Call</p>
                  <p className="text-sm text-muted-foreground">Book for later</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </ComingSoon>
        </div>

        {/* Upcoming Calls */}
        {upcomingCalls.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Calls
                </CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingCalls.map((call, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-semibold">{call.expert}</p>
                      <p className="text-sm text-muted-foreground">{call.category}</p>
                      <p className="text-sm font-medium">{call.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-market-green">{formatCurrency(call.price)}</p>
                      <ComingSoon>
                        <Button size="sm" variant="outline">Join Call</Button>
                      </ComingSoon>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Favorite Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {buyerStats.favoriteCategories.map((category, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1">
                  {category}
                </Badge>
              ))}
              <ComingSoon>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Interest
                </Button>
              </ComingSoon>
            </div>
          </CardContent>
        </Card>

        {/* Recent Calls */}
        <Card className="mb-8 border-none">
          <CardHeader className='p-0 mb-4'>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Calls</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/recent-calls")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className='p-0 border-none'>
            <div className="space-y-4">
              {isLoadingTrx ? (
                <Loader />
              ) : recentCalls?.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No recent calls found</p>
                  <Button className="mt-4" onClick={navigateToMarkets}>
                    Start Your First Call
                  </Button>
                </div>
              ) : (
                recentCalls?.map((call) => (
                  <RecentCallCard role={userRole} key={call.transaction_id} recentCall={call} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Sign Out */}
        <div className="pb-8">
          <Button
            disabled={isLoading}
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};

export default BuyerDashboard;


// import { useAuth } from '@/contexts/AuthContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { Clock, DollarSign, ShoppingBag, Truck } from 'lucide-react';
// import { formatCurrency, getInitials } from '@/lib/utils';
// import { useNavigate, } from 'react-router-dom';
// import { toast } from 'sonner';
// import RecentCallCard from '@/components/RecentCallCard';
// import { Separator } from '@/components/ui/separator';
// import Loader from '@/components/ui/loader';
// import {useGetTransactions } from '@/hooks/api-hooks';
// import ErrorComponent from '@/components/ErrorComponent';
// import { ComingSoon } from '@/components/PremiumFeature';

// const BuyerDashboard = () => {
//   const { user, profile, signOut, userRole, isLoading, fetchTransactions, wallet: walletData } = useAuth();
//   const navigate = useNavigate();

//   const { data: recentCalls, isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({ params: { user_id: user.id, limit_count: 2 } })


//   const navigateToMarkets = () => {
//     navigate(`/${userRole}/landing`);
//   };


//   const handleEditProfile = () => {
//     navigate('/edit-buyer-profile');
//   };
//   const handleSignOut = async () => {
//     toast.success('Clearing session...');
//     await signOut()
//     navigate('/');
//   };

//   if (trxErr) return <ErrorComponent error={trxErr as Error} onRetry={() => navigate(0)} />

//   return (
//     <div className="container px-4 pt-6 animate-fade-in">
//       <div className="flex justify-between items-center gap-2">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold">Hello, {profile?.name || 'Buyer'}!</h1>
//           <p className="text-muted-foreground">Welcome back to your dashboard</p>
//         </div>

//         <Avatar onClick={handleEditProfile} className="h-14 w-14 mr-5  self-start  text-market-green border-market-green/30 cursor-pointer">
//           <AvatarImage src={profile?.avatar} alt="Profile" />
//           <AvatarFallback className="bg-secondary text-foreground">{getInitials(profile?.name)}</AvatarFallback>
//         </Avatar>
//       </div>

//       {/* Wallet Card */}
//       <Card className="mb-6 bg-gradient-to-br from-market-green/20 to-background shadow-sm">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-3xl font-bold">{formatCurrency(walletData.balance)}</p>
//               <p className="text-sm text-muted-foreground mt-1">
//                 {formatCurrency(walletData.escrowed_balance)} in escrow
//               </p>
//             </div>
//             <Button variant="outline" className="rounded-full h-10 w-10 p-0">
//               <DollarSign className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardContent>
//       </Card>


//       {/* Quick Actions */}
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <Button
//           variant="outline"
//           className="flex flex-col h-auto py-4 text-market-green border-market-green/30"
//           onClick={navigateToMarkets}
//         >
//           <ShoppingBag className="h-6 w-6 mb-2" />
//           <span>Shop Now</span>
//         </Button>

//         <ComingSoon>
//           <Button
//             variant="outline"
//             className="flex flex-col h-auto py-4 text-market-orange border-market-orange/30 w-full"
//           >
//             <Truck className="h-6 w-6 mb-2" />
//             <span>Delivery</span>
//           </Button>
//         </ComingSoon>
//       </div>

//       <div className="mt-6">
//         <div className='w-full flex items-center justify-between py-4'>
//           <h2 className='font-bold'>Recent Calls</h2>
//           <Button
//             type='button'
//             onClick={() => navigate("/recent-calls")}
//             size='sm'
//             variant='link'
//           >View All</Button>
//         </div>

//         <div className="space-y-4">
//           {isLoadingTrx ? (
//             <Loader />
//           ) : (
//             recentCalls.length == 0 ? (
//               <p>No transactions found.</p>
//             ) : recentCalls.map((call) => (
//               <RecentCallCard role={userRole} key={call.transaction_id} recentCall={call} />
//             ))
//           )}
//         </div>
//       </div>

//       <Separator className='my-4' />

//       <div className="mt-4">
//         <Button
//           disabled={isLoading}
//           className="w-full mb-8 bg-destructive/10 hover:bg-destructive/90 hover:text-foreground text-destructive"
//           onClick={handleSignOut}
//         >
//           Log out
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default BuyerDashboard;

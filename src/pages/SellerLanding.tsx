import { useState, useEffect, useMemo } from 'react';
import {
    MapPin,
    Users,
    Phone,
    MessageCircle,
    TrendingUp,
    Eye,
    Clock,
    Settings,
    Power,
    Bell,
    CheckCircle2,
    Star,
    ShoppingBag,
    Package,
    Calendar,
    BarChart3,
    Activity,
    ChevronRight,
    Zap,
    Wallet,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ComingSoon } from '@/components/PremiumFeature';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGetSellerMarketAndCategories, useGetTransactions, useToggleOnlineStatus } from '@/hooks/api-hooks';
import { formatCurrency, formatDuration, formatTimeAgo, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const SellerLanding = () => {
    const { user, profile, wallet } = useAuth()
    const { data: sellerMarketAndCategories, isLoading: isSellerCategoryLoading } = useGetSellerMarketAndCategories({ seller: user?.id, })

    console.log({ sellerMarketAndCategories });


    const { data: recentCalls = [], isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({ params: { user_id: user?.id, limit_count: 2 } })
    const [isOnline, setIsOnline] = useState(profile.is_reachable);
    const navigate = useNavigate()
    const toggleOnline = useToggleOnlineStatus()

    // Mock seller data - merged from SellerDashboard
    const [sellerProfile] = useState({
        name: "Sarah's Fresh Market",
        avatar: "SM",
        rating: 4.8,
        totalSales: 127,
        joinDate: "March 2024",
        category: "Fresh Produce",
        phone: "+1 (555) 123-4567"
    });

    // Wallet data from SellerDashboard
    const [walletData] = useState({
        balance: 1245.50,
        pendingEarnings: 89.25,
        totalEarnings: 3456.78,
        thisWeekEarnings: 245.50,
        transactions: [
            { id: 1, type: 'credit', amount: 45.00, description: 'Call payment from Mike R.', date: '2 hours ago' },
            { id: 2, type: 'credit', amount: 23.50, description: 'Call payment from Sarah M.', date: '4 hours ago' },
            { id: 3, type: 'debit', amount: 5.00, description: 'Platform fee', date: '1 day ago' }
        ]
    });


    const [selectedMarkets] = useState([
        { id: 1, name: 'Downtown Square', address: '123 Main St', activeBuyers: 34, status: 'active' },
        { id: 2, name: 'Market Plaza', address: '456 Oak Ave', activeBuyers: 28, status: 'active' }
    ]);

    const [selectedCategories] = useState([
        { id: 1, name: 'Fresh Produce', icon: '🥕', activeBuyers: 45 },
        { id: 2, name: 'Organic Food', icon: '🌱', activeBuyers: 23 },
        { id: 3, name: 'Handmade Items', icon: '🎨', activeBuyers: 12 }
    ]);

    const [todayStats] = useState({
        views: 147,
        calls: 8,
        messages: 15,
        earnings: 245.50,
        responseRate: 94,
        avgResponseTime: 2.3
    });

    const [weeklyData] = useState([
        { day: 'Mon', views: 45, calls: 3 },
        { day: 'Tue', views: 67, calls: 5 },
        { day: 'Wed', views: 89, calls: 7 },
        { day: 'Thu', views: 102, calls: 9 },
        { day: 'Fri', views: 134, calls: 12 },
        { day: 'Sat', views: 147, calls: 8 },
        { day: 'Sun', views: 98, calls: 6 }
    ]);



    const handleToggleOnlineStatus = async (status: boolean) => {
        try {
            const _status = await toggleOnline.mutateAsync({
                status,
                userId: user.id
            })

            setIsOnline(_status)
        } catch (error) {
            console.error("Error updating online status", error?.message)
            toast.error("Unable to update status. Please try again")
        }
    };


    const handleEditProfile = () => {
        // Navigate to edit profile
        console.log('Navigate to edit profile');
    };

    const handleViewAllCalls = () => {
        // Navigate to recent calls
        console.log('Navigate to recent calls');
    };



    return (
        <div className="min-h-screen bg-background mb-14">

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-market-orange/20 card-hover">
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback className="text-lg font-semibold bg-market-orange/10">{profile.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold ">{profile.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                {/* <span>{sellerProfile.rating}</span>
                                <span>•</span>
                                <span>{sellerProfile.totalSales} sales</span>
                                <span>•</span> */}
                                <span>{"Seller"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={toggleOnline.isPending}
                            onClick={() => handleToggleOnlineStatus(!isOnline)}
                            className="border-market-orange/50 hover:bg-market-orange/10"
                        >
                            <Power className="w-4 h-4 mr-2" />
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Left Sidebar - Markets & Categories */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Wallet Summary */}
                        <Card className="glass-morphism border-market-orange/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wallet className="w-5 h-5" />
                                    Wallet Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-2xl font-bold ">{formatCurrency(wallet.balance)}</p>
                                        <p className="text-sm text-muted-foreground">Available Balance</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="font-medium text-market-orange">{formatCurrency(wallet.escrowed_balance)}</p>
                                            <p className="text-muted-foreground">Escrow</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-market-green">+{"N/A"}</p>
                                            <p className="text-muted-foreground">This Week</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold  text-market-green">{formatCurrency(wallet.balance + wallet.escrowed_balance)}</p>
                                        <p className="text-muted-foreground">Total Revenue</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Markets */}
                        <Card className="glass-morphism">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Your Markets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">

                                {sellerMarketAndCategories?.markets.length == 0 && (
                                    <div className='flex flex-col  text-center items-center justify-center gap-y-2 my-4'>
                                        <h1 className='text-base'>No records found</h1>
                                        <p className='text-xs text-muted-foreground'>Click <b>Manage</b> to engage in a market</p>
                                    </div>
                                )}
                                {sellerMarketAndCategories?.markets.map(market => (
                                    <div
                                        key={market.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors card-hover"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{market.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{market.address}</p>
                                        </div>
                                        <div className="text-right ml-2">
                                            <p className="text-sm font-medium text-market-green">{market.impressions}</p>
                                            <p className="text-xs text-muted-foreground">impressions</p>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-market-orange/50 hover:bg-market-orange/10"
                                >
                                    <Link to={"/seller/setup"}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage Markets</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Active Categories */}
                        <Card className="glass-morphism">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 ">
                                    <Package className="w-5 h-5" />
                                    Your Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                            {sellerMarketAndCategories?.categories.length == 0 && (
                                    <div className='flex flex-col  text-center items-center justify-center gap-y-2 my-4'>
                                        <h1 className='text-base'>No records found</h1>
                                        <p className='text-xs text-muted-foreground'>Click <b>Manage</b> to engage in a category</p>
                                    </div>
                                )}

                                {sellerMarketAndCategories?.categories.map(category => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors card-hover"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{category.name}</p>
                                            <span className="text-lg text-market-blue"><ChevronRight /> </span>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-market-orange/50 hover:bg-market-orange/10"
                                >
                                    <Link to={"/seller/setup"}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage Categories
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Today's Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="glass-morphism">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Views</p>
                                            <p className="text-2xl font-bold">{todayStats.views}</p>
                                        </div>
                                        <Eye className="w-8 h-8 text-market-orange" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-morphism">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Calls</p>
                                            <p className="text-2xl font-bold">{recentCalls.length}</p>
                                        </div>
                                        <Phone className="w-8 h-8 text-market-green" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* <ComingSoon> */}
                            <Card className="glass-morphism relative">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Feedbacks</p>
                                            <p className="text-2xl font-bold">{todayStats.messages}</p>
                                        </div>
                                        <MessageCircle className="w-8 h-8 text-market-purple" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Weekly Analytics */}
                        <Card className="glass-morphism">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 ">
                                    <BarChart3 className="w-5 h-5" />
                                    Weekly Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {weeklyData.map((day, index) => (
                                        <div key={day.day} className="text-center">
                                            <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                                            <div className="space-y-1">
                                                <div
                                                    className="bg-market-orange/20 rounded-sm mx-auto"
                                                    style={{
                                                        height: `${Math.max(4, (day.views / 150) * 60)}px`,
                                                        width: '12px'
                                                    }}
                                                />
                                                <div className="text-xs font-medium">{day.views}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Views this week</span>
                                    <span>Peak: Friday (147 views)</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Performance Metrics */}
                            <Card className="glass-morphism">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 ">
                                        <Zap className="w-5 h-5" />
                                        Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Response Rate</span>
                                            <span className="font-medium text-market-green">{todayStats.responseRate}%</span>
                                        </div>
                                        <Progress
                                            value={todayStats.responseRate}
                                            className="h-2 bg-white/10"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Avg Response Time</span>
                                            <span className="font-medium text-market-orange">{todayStats.avgResponseTime}m</span>
                                        </div>
                                        <Progress
                                            value={85}
                                            className="h-2 bg-white/10"
                                        />
                                    </div>

                                    <div className="pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-sm text-market-green">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Great performance! Keep it up.</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Calls - Replacing Recent Activity */}
                            <Card className="glass-morphism">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 ">
                                            <Phone className="w-5 h-5" />
                                            Recent Calls
                                        </CardTitle>
                                        <Button
                                            asChild
                                            variant="link"
                                            size="sm"
                                            onClick={handleViewAllCalls}
                                            className="text-market-orange hover:text-market-orange/80"
                                        >
                                            <Link to={"/transactions"}>
                                                View All</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentCalls.map(call => (
                                            <div
                                                onClick={() => navigate(`/transactions/${call.call_session_id}`)}
                                                key={call.transaction_id}
                                                className="flex items-center justify-between p-3 cursor-pointer rounded-lg border border-white/10 hover:bg-white/5 transition-colors card-hover"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={call.buyer_avatar} />
                                                        <AvatarFallback className="text-sm bg-market-orange/10">
                                                            {getInitials(call.buyer_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate"><span className='text-slate-400 font-thin'>With </span>{call.buyer_name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{call.reference}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{formatDuration(call.duration)}</span>
                                                            <span>•</span>
                                                            <span>{call.transaction_created_at ? formatTimeAgo(call.transaction_created_at) : "No transaction"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-2">
                                                    <p className="text-sm font-medium text-market-green">{formatCurrency(call.amount)}</p>
                                                    <Badge
                                                        variant={call.status === 'completed' ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {call?.status || "N/A"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerLanding;

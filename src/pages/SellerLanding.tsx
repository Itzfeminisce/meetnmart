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
import { useGetSellerMarketAndCategories, useGetSellerStats, useGetTransactions, useToggleOnlineStatus } from '@/hooks/api-hooks';
import { cn, formatCurrency, formatDuration, formatTimeAgo, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { getShortName } from '../lib/utils';
import { SellerStat } from '@/components/SellerStat';
import Loader from '@/components/ui/loader';

const SellerLanding = () => {
    const { user, profile, wallet } = useAuth()
    const { data: sellerMarketAndCategories, isLoading: isSellerCategoryLoading } = useGetSellerMarketAndCategories({ seller: user?.id, })
    const { data: sellerStats, isLoading: isLoadingSellerStats } = useGetSellerStats({ userId: user?.id })

    const { data: recentCalls = [], isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({ params: { user_id: user?.id, limit_count: 2 } })
    const [isOnline, setIsOnline] = useState(profile.is_reachable);
    const navigate = useNavigate()
    const toggleOnline = useToggleOnlineStatus()


    const [todayStats] = useState({
        views: 147,
        calls: 8,
        messages: 15,
        earnings: 245.50,
        responseRate: 94,
        avgResponseTime: 2.3
    });



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
        <div className="container mb-[5rem] mt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-start justify-between w-full">
                    <div className="">
                        <div className='flex items-center'>
                            <Button
                                title={isOnline ? 'Go Offline' : 'Go Online'}
                                variant="ghost"
                                size="sm"
                                disabled={toggleOnline.isPending}
                                onClick={() => handleToggleOnlineStatus(!isOnline)}
                                className={cn(isOnline ? 'border-bg-destructive/50 hover:bg-destructive/50' : 'border-green-500/50 hover:bg-green-500/50')}
                            >
                                <Power className="w-4 h-4" />
                            </Button>
                            <h2> Welcome, <h1 className="text-2xl font-bold">{getShortName(profile.name)}</h1></h2>
                        </div>

                    </div>
                    <div className="relative">
                        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <Avatar className="w-12 h-12 border-2 border-market-orange/20 card-hover">
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback className="text-lg font-semibold bg-market-orange/10">{profile.avatar}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Left Sidebar - Markets & Categories */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Wallet Summary */}
                    <div className="md:grid grid-cols-4 gap-4 space-y-4 md:space-y-0 lg:grid-cols-1">
                        <Card className="glass-morphism border-market-orange/20 col-span-3">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wallet className="w-5 h-5" />
                                    Wallet Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-2xl font-bold text-market-green">{formatCurrency(wallet.balance)}</p>
                                        <p className="text-sm text-muted-foreground">Available Balance</p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <div>
                                            <p className="font-medium text-market-orange text-2xl">{formatCurrency(wallet.escrowed_balance)}</p>
                                            <p className="text-muted-foreground">Escrow</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-market-green">+{formatCurrency(sellerStats?.this_week || 0)}</p>
                                            <p className="text-muted-foreground">This Week</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xl font-bold">{formatCurrency(wallet.balance + wallet.escrowed_balance)}</p>
                                        <p className="text-muted-foreground">Total Revenue</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Today's Stats */}
                        <div className="md:space-y-0 grid md:grid-cols-1 grid-cols-3 lg:grid-cols-3 gap-2">
                            <Card className="glass-morphism">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Transactions</p>
                                            <p className="text-2xl font-bold">{sellerStats?.transactions || 0}</p>
                                        </div>
                                        <Eye className="w-8 h-8 text-market-orange hidden md:flex" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-morphism">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Calls</p>
                                            <p className="text-2xl font-bold">{sellerStats?.calls || 0}</p>
                                        </div>
                                        <Phone className="w-8 h-8 text-market-green hidden md:flex" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* <ComingSoon> */}
                            <Card className="glass-morphism ">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between ">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Feedbacks</p>
                                            <p className="text-2xl font-bold">{sellerStats?.feedbacks || 0}</p>
                                        </div>
                                        <MessageCircle className="w-8 h-8 text-market-purple hidden md:flex" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Active Markets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
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
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">


                    {/* Weekly Analytics */}
                    {isLoadingSellerStats ? <Loader /> : (
                        <SellerStat data={sellerStats?.charts} />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">

                        {/* Performance Metrics */}
                        <Card className="glass-morphism">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2  text-base md:text-2xl ">
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
                        <Card className="glass-morphism rounded-xl shadow-sm border">
                            <CardHeader>
                                <div className="flex  justify-between sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <CardTitle className="flex items-center gap-2  text-base md:text-2xl ">
                                        <Phone className="w-5 h-5" />
                                        Recent Calls
                                    </CardTitle>
                                    <Button
                                        asChild
                                        variant="link"
                                        size="sm"
                                        onClick={handleViewAllCalls}
                                        className="text-market-orange hover:text-market-orange/80 p-0"
                                    >
                                        <Link to="/transactions">View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {recentCalls.map((call) => (
                                        <div
                                            key={call.transaction_id}
                                            onClick={() => navigate(`/transactions/${call.call_session_id}`)}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition cursor-pointer"
                                        >
                                            {/* Left */}
                                            <div className="flex flex-1 items-start gap-3 min-w-0">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={call.buyer_avatar} />
                                                    <AvatarFallback className="bg-market-orange/10 text-sm">
                                                        {getInitials(call.buyer_name)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="text-sm font-medium truncate">
                                                        <span className="text-slate-400 font-light">With </span>{call.buyer_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">{call.reference}</p>

                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{formatDuration(call.duration)}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <span>{call.transaction_created_at ? formatTimeAgo(call.transaction_created_at) : 'No transaction'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right */}
                                            <div className="flex flex-col sm:items-end text-right gap-1 min-w-[100px]">
                                                <p className="text-sm font-semibold text-market-green whitespace-nowrap">
                                                    {formatCurrency(call.amount)}
                                                </p>
                                                <Badge
                                                    variant={call.status === 'completed' ? 'default' : 'secondary'}
                                                    className="text-xs whitespace-nowrap w-fit"
                                                >
                                                    {call?.status || 'N/A'}
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
    );
};

export default SellerLanding;

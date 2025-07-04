import React, { useState, useMemo, useEffect } from 'react';
import {
    Phone,
    MessageCircle,
    Truck,
    Clock,
    Users,
    Zap,
    Timer,
    MapPin,
    User,
    Bookmark,
    Share2,
    Eye,
    ArrowLeft,
    ChevronDown,
    Send,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import AppHeader from '@/components/AppHeader';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { FeedDetailScreenSchema } from '@/types/screens';
import { Link, redirect, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetFeeds } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';
import SEO from '@/components/SEO';

// Mock data for demonstration
const mockFeedItem = {
    id: '1',
    title: 'Fresh Tomatoes Available - Best Quality in Town',
    content: 'High-quality fresh tomatoes from local farm. Perfect for cooking, salads, and restaurants. Organic and pesticide-free. Available in bulk quantities. Contact for wholesale prices.',
    type: 'seller_offer',
    category: { name: 'vegetables' },
    author: {
        id: 'seller-1',
        name: 'John Farmer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    price_range: '₦500-800 per basket',
    quantity: '50 baskets available',
    needed_by: 'this week',
    delivery_preference: true,
    location: 'Ikeja, Lagos',
    created_at: '2024-06-12T08:30:00Z',
    images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1606588260447-8b49401c9696?w=400&h=300&fit=crop'
    ],
    interactions: {
        items: [
            {
                id: '1',
                type: 'comment',
                author: { id: 'buyer-1', name: 'Sarah Johnson', avatar: null },
                metadata: { message: 'Are these available for delivery to Victoria Island?' },
                created_at: '2024-06-12T09:15:00Z'
            },
            {
                id: '2',
                type: 'comment',
                author: { id: 'buyer-2', name: 'Mike Chen', avatar: null },
                metadata: { message: 'What are your wholesale rates for restaurants? I need regular supply.' },
                created_at: '2024-06-12T10:30:00Z'
            },
            {
                id: '3',
                type: 'comment',
                author: { id: 'buyer-3', name: 'Grace Okafor', avatar: null },
                metadata: { message: 'Can I get 5 baskets today? Will pay cash on delivery.' },
                created_at: '2024-06-12T11:45:00Z'
            }
        ]
    }
};

const mockStats = {
    views: 145,
    bookmarks: 23,
    comments: 8,
    calls: 12,
    deliveries: 5
};

const mockProfile = {
    id: 'current-user',
    name: 'Current User',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=32&h=32&fit=crop&crop=face'
};

const quickActions = {
    seller_offer: [
        { icon: '💰', text: 'Interested', message: 'I\'m interested in this offer', tooltip: 'Show interest' },
        { icon: '📞', text: 'Call me', message: 'Please call me to discuss', tooltip: 'Request a call' },
        { icon: '🚚', text: 'Delivery?', message: 'Do you offer delivery to my area?', tooltip: 'Ask about delivery' },
        { icon: '💵', text: 'Price?', message: 'What\'s your best price?', tooltip: 'Negotiate price' }
    ]
};

const getCardStyle = (type, createdAt) => {
    // @ts-ignore
    const isRecent = (new Date() - new Date(createdAt)) < 60 * 60 * 1000;
    const recentStyle = isRecent
        ? 'relative before:absolute before:inset-[-1px] before:rounded-lg before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-pink-500 before:animate-gradient-x before:bg-[length:200%_100%] before:-z-10 after:absolute after:inset-[1px] after:rounded-lg after:bg-background after:-z-[5]'
        : '';

    switch (type) {
        case "buyer_request":
            return `${recentStyle} bg-market-blue/5 dark:bg-market-blue/20`;
        case "seller_offer":
            return `${recentStyle} bg-market-green/5 dark:bg-market-green/20`;
        case "delivery_ping":
            return `${recentStyle} bg-market-purple/5 dark:bg-market-purple/20`;
        default:
            return `${recentStyle} dark:border-gray-700`;
    }
};

const getTypeIcon = (type) => {
    switch (type) {
        case "buyer_request":
            return <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
        case "seller_offer":
            return <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />;
        case "delivery_ping":
            return <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
        default:
            return null;
    }
};

const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
};

const getButtonColor = (cardType) => {
    switch (cardType) {
        case "buyer_request":
            return "bg-market-blue hover:bg-market-blue/90";
        case "seller_offer":
            return "bg-market-green hover:bg-market-green/90";
        case "delivery_ping":
            return "bg-market-purple hover:bg-market-purple/90";
        default:
            return "bg-primary hover:bg-primary/90";
    }
};

const getBadgeStyle = (cardType) => {
    switch (cardType) {
        case "buyer_request":
            return "bg-market-blue/10 text-market-blue hover:bg-market-blue/20 border-market-blue/20";
        case "seller_offer":
            return "bg-market-green/10 text-market-green hover:bg-market-green/20 border-market-green/20";
        case "delivery_ping":
            return "bg-market-purple/10 text-market-purple hover:bg-market-purple/20 border-market-purple/20";
        default:
            return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    }
};

const StatsSection = ({ stats }) => (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
        <div className="text-center">
            <div className="flex items-center justify-center mb-1">
                <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-lg font-semibold">{stats.views}</div>
            <div className="text-xs text-muted-foreground">Views</div>
        </div>
        <div className="text-center">
            <div className="flex items-center justify-center mb-1">
                <Bookmark className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-lg font-semibold">{stats.bookmarks}</div>
            <div className="text-xs text-muted-foreground">Saves</div>
        </div>
        <div className="text-center">
            <div className="flex items-center justify-center mb-1">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-lg font-semibold">{stats.comments}</div>
            <div className="text-xs text-muted-foreground">Comments</div>
        </div>
        <div className="text-center">
            <div className="flex items-center justify-center mb-1">
                <Phone className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-lg font-semibold">{stats.calls}</div>
            <div className="text-xs text-muted-foreground">Calls</div>
        </div>
        <div className="text-center">
            <div className="flex items-center justify-center mb-1">
                <Truck className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-lg font-semibold">{stats.deliveries}</div>
            <div className="text-xs text-muted-foreground">Deliveries</div>
        </div>
    </div>
);

const CommentItem = ({ comment }) => (
    <div className="flex flex-col sm:flex-row items-start gap-3 py-3 border-b border-b-muted/30 last:border-b-0">
        <Avatar className="h-8 w-8 hidden md:inline-block">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium text-muted-foreground">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground/60">{formatTimeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-primary/90 break-words">{comment.metadata.message}</p>
        </div>
    </div>
);

// Updated Comment Input
const CommentsSection = ({ comments, onSendComment, cardType }) => {
    const { isAuthenticated } = useAuth()
    const [comment, setComment] = useState('');
    const [visibleComments, setVisibleComments] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingAction, setSubmittingAction] = useState(null);

    const remainingComments = comments.length - visibleComments;

    const handleSendComment = async () => {
        if (comment.trim()) {
            setIsSubmitting(true);
            try {
                await onSendComment(comment);
                setComment('');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendComment();
        }
    };

    const handleQuickAction = async (action) => {
        setSubmittingAction(action);
        try {
            await onSendComment(action);
        } finally {
            setSubmittingAction(null);
        }
    };

    return (
        <Card className="rounded-none">
            <CardHeader>
                <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Actions */}
                <div className="flex overflow-x-auto gap-2 scrollbar-none">
                    {quickActions[cardType]?.map((action, index) => (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <button
                                    className={`rounded-full cursor-pointer transition-colors ${getBadgeStyle(cardType)} px-3 py-1.5 text-sm font-medium flex-shrink-0 ${submittingAction === action.text ? 'opacity-50 pointer-events-none' : ''}`}
                                    onClick={() => handleQuickAction(action.message)}
                                >
                                    {submittingAction === action.text ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                        <span className="mr-1.5">{action.icon}</span>
                                    )}
                                    {action.text}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{action.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                {/* Comments List */}
                <div className="space-y-0">
                    {comments.slice(0, visibleComments).map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}

                    {remainingComments > 0 && (
                        <button
                            className="flex items-center justify-start text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-3 rounded-full hover:bg-muted/50 w-full"
                            onClick={() => setVisibleComments(prev => prev + 5)}
                        >
                            <ChevronDown className="w-4 h-4 mr-2" />
                            View {remainingComments} more {remainingComments === 1 ? 'comment' : 'comments'}
                        </button>
                    )}
                </div>

                {/* Comment Input */}
                <div className="sticky bottom-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-muted/30">
                    <Avatar className="h-8 w-8 hidden md:inline-block">
                        <AvatarImage src={mockProfile.avatar} alt="User" />
                        <AvatarFallback>
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    {
                        isAuthenticated && <div className="flex items-center justify-center w-full gap-x-2">
                            <Textarea
                                placeholder="Type your message..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isSubmitting}
                                className="w-full text-sm resize-none min-h-[3rem] max-h-[8rem] sm:min-h-[5rem] sm:max-h-[12rem] overflow-y-auto"
                            />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        className={`h-10 w-10 shrink-0 rounded-full ${getButtonColor(cardType)}`}
                                        onClick={handleSendComment}
                                        disabled={!comment.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Send message</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    }
                </div>
            </CardContent>
        </Card>
    );
};

export function extractFeedIdFromSlug(url: string): string | null {
    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    const match = url.match(uuidRegex);
    return match ? match[1] : null;
}

export default function FeedDetails() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const { feedId: slug } = useParams();
    const [isBookmarked, setIsBookmarked] = useState(false);


    const feedId = useMemo(() => extractFeedIdFromSlug(slug), [slug]);

    const { data: [item] = [], isLoading } = useGetFeeds({ p_feed_id: feedId });



    const handleSendComment = async (comment) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Comment sent:', comment);
    };

    const handleCall = () => {
        console.log('Calling seller...');
    };

    const handleSave = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleShare = () => {
        console.log('Sharing post...');
    };

    const handleDelivery = () => {
        console.log('Requesting delivery...');
    };




    if (isLoading) return <Loader />;
    if (!item) redirect("/404");

    const stats = item?.interactions?.stats ?? {};
    const comments = item?.interactions?.items?.filter(it => it?.type === 'comment') ?? [];


    return (
        <>
            <SEO 
              title={`${item.title} | MeetnMart`}
              description={item.content?.length > 160 ? `${item.content.substring(0, 157)}...` : item.content}
            />
            <AppHeader
                title={item.title}
                subtitle={item.category.name}
                className='mb-0 border-none'
                showBackButton={isAuthenticated}
                onBackClick={() => navigate("/feeds")}
                rightContent={
                    !isAuthenticated && (
                        <div className='flex items-center justify-center gap-x-4'>
                            <Button asChild>
                                <a href={"/"}>Login</a>
                            </Button>
                        </div>
                    )
                }
            />

            <div className="space-y-6 container md:max-w-screen-md mb-[5rem]">
                {/* Main Content */}
                <Card className={cn(getCardStyle(item.type, item.created_at), 'rounded-none shadow-none m-0')}>
                    <CardContent className="p-4 rounded-none shadow-none">
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0">{getTypeIcon(item.type)}</div>
                                            <h2 className="text-xl sm:text-2xl font-bold leading-tight break-words">{item.title}</h2>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4 break-words">
                                        {item.content}
                                    </p>
                                    <Badge className="capitalize flex-shrink-0">{item.category.name}</Badge>
                                </div>
                            </div>


                            {/* Images Section */}
                            {item.images?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {item.images.map((image, index) => (
                                        <div key={index} className="aspect-video rounded-lg overflow-hidden">
                                            <img
                                                src={image}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Details Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                {item.price_range && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-muted-foreground">Price:</span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                            {item.price_range}
                                        </span>
                                    </div>
                                )}
                                {item.quantity && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-muted-foreground">Quantity:</span>
                                        <span>{item.quantity}</span>
                                    </div>
                                )}
                                {item.needed_by && (
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        <Timer className="w-4 h-4" />
                                        <span className="font-medium">Needed by: {item.needed_by}</span>
                                    </div>
                                )}
                                {item.delivery_preference && (
                                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                        <Truck className="w-4 h-4" />
                                        <span className="font-medium">Delivery Available</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{item.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatTimeAgo(item.created_at)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button className={getButtonColor(item.type)} onClick={handleCall}>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Seller
                                </Button>
                                {item.delivery_preference && (
                                    <Button variant="outline" onClick={handleDelivery}>
                                        <Truck className="w-4 h-4 mr-2" />
                                        Request Delivery
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleSave}
                                    className={isBookmarked ? 'text-primary' : ''}
                                >
                                    <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                                    {isBookmarked ? 'Saved' : 'Save'}
                                </Button>
                                <Button variant="outline" onClick={handleShare}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Section */}
                <Card className='rounded-none shadow-none p-4'>
                    <CardContent className="p-0 m-0">
                        <h3 className="text-lg font-semibold mb-4">Engagement Stats</h3>
                        <StatsSection stats={stats} />
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <CommentsSection
                    comments={comments}
                    onSendComment={handleSendComment}
                    cardType={item.type}
                />
            </div>

            {isAuthenticated && <BottomNavigation />}
        </>
    );
}
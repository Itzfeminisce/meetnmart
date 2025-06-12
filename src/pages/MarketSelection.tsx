import { useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import {
    CheckCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeleteMarketSelection, useGetCategories, useGetMarkets, useSellerCatrgoryMutation, useGetNearbyMarkets } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { MarketWithAnalytics } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MarketInsightsDialog from '@/components/MarketInsightsDialog';
import { cn, sluggify } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { MarketCard } from '@/components/MarketCard';
import { SearchHint } from '@/components/SearchHint';
import SellerMarketCategorySelectionConfirmationModal from '@/components/SellerMarketCategorySelectionConfirmationModal';
import { z } from 'zod';
import { MarketSelectionLocationStateSchema } from '@/types/screens';


// Custom hooks for seller-specific functionality
const useSellerMarketSelection = (markets: MarketWithAnalytics[] | undefined) => {
    const { userRole } = useAuth()
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleMarketToggle = useCallback((marketId: string) => {
        setSelectedMarkets(prev =>
            prev.includes(marketId)
                ? prev.filter(id => id !== marketId)
                : (
                    // Max of 3 categories for buyers
                    userRole === "buyer" ? [marketId] : [...prev, marketId]
                )
        );
    }, []);

    const filterMarkets = useCallback((markets: MarketWithAnalytics[] = []) => {
        if (!markets || searchQuery.length === 0) return markets;
        return markets.filter(market =>
            market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            market.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // Initialize selectedMarkets with markets that user already belongs to
    useEffect(() => {
        if (markets) {
            const existingMarkets = markets
                .filter(market => market.belongs_to_market)
                .map(market => market.id);
            setSelectedMarkets(prev => {
                // Only add markets that aren't already selected
                const newMarkets = existingMarkets.filter(id => !prev.includes(id));
                return [...prev, ...newMarkets];
            });
        }
    }, [markets]);

    return {
        selectedMarkets,
        searchQuery,
        setSearchQuery,
        handleMarketToggle,
        filterMarkets,
    };
};

// Selection summary component
const SelectionSummary: React.FC<{
    count: number;
    type: 'market' | 'category';
    message: string;
}> = ({ count, type, message }) => {
    if (count === 0) return null;

    return (
        <Card className="bg-market-orange/10 border-market-orange/20">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-market-orange">
                            {count} {type}{count !== 1 ? 's' : ''} selected
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {message}
                        </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-market-orange" />
                </div>
            </CardContent>
        </Card>
    );
};



const MarketSelection = () => {
    const isMobile = useIsMobile()
    const [searchParams] = useSearchParams()
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const [_action, _setAction] = useState<'save' | 'continue' | null>(null);
    const [showLearnMarketStatDialog, setShowLearnMarketStatsDialog] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [newMarketEntry, setNewMarketEntry] = useState<string[]>([]);

    const locationState = MarketSelectionLocationStateSchema.parse(useLocation().state ?? { utm_source: `${userRole}_landing`, utm_role: userRole })

    // API hooks with proper typing
    const { data: markets, isLoading: isMarketLoading } = useGetMarkets({ userId: user?.id, limit: 50 });

    // Custom hooks for selection management
    const {
        selectedMarkets,
        searchQuery,
        setSearchQuery,
        handleMarketToggle,
        filterMarkets,
    } = useSellerMarketSelection(markets);

    // Track existing market memberships
    const existingMarketMemberships = useMemo(() => {
        if (!markets) return [];
        return markets
            .filter(market => market.belongs_to_market)
            .map(market => market.id);
    }, [markets]);

    // Track new market selections
    useEffect(() => {
        const newSelections = selectedMarkets.filter(id => !existingMarketMemberships.includes(id));
        setNewMarketEntry(newSelections);
    }, [selectedMarkets, existingMarketMemberships]);

    const sellerMaketCategory = useSellerCatrgoryMutation();
    const sellerMarketSelectionDelete = useDeleteMarketSelection();


    // Filtered markets with deduplication and proper null checks
    const filteredMarkets = useMemo(() => {
        if (!markets) return [];

        const marketMap = new Map<string, MarketWithAnalytics>();
        const impressions = markets;

        // Process general markets with null check
        // const generalMarkets = Array.isArray(markets) ? availableMarkets.general : [];
        for (const market of impressions) {
            if (!market?.id) continue; // Skip invalid markets
            const existing = marketMap.get(market.id);
            if (!existing || (market.belongs_to_market && !existing.belongs_to_market)) {
                marketMap.set(market.id, market);
            }
        }

        const uniqueMarkets = Array.from(marketMap.values());
        return filterMarkets(uniqueMarkets);
    }, [markets, filterMarkets]);

    // const initialSelectedMarketCount = useMemo(() => {
    //     const alreadyJoinedMarketIds = filteredMarkets
    //       .filter(it => it?.belongs_to_market)
    //       .map(it => it.belongs_to_market); // extract just market_id
      
    //     const allMarketIds = [...alreadyJoinedMarketIds, ...selectedMarkets];
      
    //     const uniqueMarketIds = new Set(allMarketIds);
      
    //     return uniqueMarketIds.size;
    //   }, [selectedMarkets, filteredMarkets]);
      

    async function handleSaveSelections() {
        try {
            await sellerMaketCategory.mutateAsync({
                sellerId: user?.id,
                payload: {
                    selectedMarkets: newMarketEntry,
                    selectedCategories: []
                }
            });
            setShowConfirmationModal(true);
        } catch (error) {
            toast.error('Failed to save selections');
        }
    }


    const handleDeleteSelection = useCallback(async ({ criteria, selectionId }: { criteria: "category_id" | "market_id"; selectionId: string; }) => {
        try {
            await sellerMarketSelectionDelete.mutateAsync({
                criteria,
                selectionId,
                userId: user?.id
            });
            toast.success(`Success. Item removed`);
        } catch (error) {
            toast.error("Unable to delete selection. Please try again");
        }
    }, [sellerMarketSelectionDelete, user?.id]);


    const preparePayloadForCategoryPage = useCallback((marketIds: string[], showMoreInfo = false) => {
        const [firstMarketId, ...restOfSelectedMarkets] = marketIds;

        const firstMarket = filteredMarkets.find(mkt => mkt.id === firstMarketId)


        let title = "Categories";
        if (firstMarket) {
            title = `${firstMarket.name}${restOfSelectedMarkets.length > 0 && showMoreInfo ? ` & ${restOfSelectedMarkets.length} others` : ''}`
        }

        return {
            ...locationState,
            title,
            markets: [{
                id: firstMarket.id,
                name: firstMarket.name
            }],

            // utm_source: locationState.utm_source,
            // utm_role: locationState.utm_role
        }
    }, [filteredMarkets])



    const getNextBehaviourOnActionClick = useCallback(() => {
        let actions: ReactNode[] = [];
        switch (locationState.utm_source) {
            case "seller_landing":
                actions = [
                    (
                        <Button
                            type='button'
                            variant='outline'
                            size='default'
                            onClick={() => navigate("/categories", {
                                state: preparePayloadForCategoryPage(newMarketEntry, true)
                            })}
                            className="w-full sm:w-auto">
                            <span className="hidden sm:inline">Continue to Category</span>
                            <span className="sm:hidden">Category</span>
                        </Button>
                    )
                ]
                if (newMarketEntry.length > 0) {
                    actions.push(
                        <Button
                            type='button'
                            variant='market'
                            disabled={sellerMaketCategory.isPending}
                            onClick={handleSaveSelections}
                            className={cn(`w-full sm:w-auto rounded-sm bg-market-orange hover:bg-market-orange/90`)}>
                            {sellerMaketCategory.isPending ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">Skip & Save</span>
                                    <span className="sm:hidden">Save</span>
                                </>
                            )}
                        </Button>
                    )
                }
                break;
            case "buyer_landing":
                const _selectedMarket = filteredMarkets.find(mkt => mkt.id == selectedMarkets[0])
                actions = [
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => navigate("/categories", {
                            state: preparePayloadForCategoryPage(selectedMarkets, true)
                        })}
                        className={cn(`w-full sm:w-auto rounded-sm`)}>
                        Browse Categories
                    </Button>,
                    <Button
                        type='button'
                        variant='market'
                        onClick={() =>
                            // console.log({ selectedMarkets })
                            navigate(`/sellers/${encodeURIComponent(sluggify(_selectedMarket.name))}`, {
                                state: {
                                    title: _selectedMarket.name,
                                    market: {
                                        id: _selectedMarket.id,
                                        name: _selectedMarket.name
                                    },
                                    category: {
                                        id: null,
                                        name: null
                                    },
                                    utm_source: "market_selection",
                                }
                            })
                        }
                        className={cn(`w-full sm:w-auto rounded-sm bg-market-orange hover:bg-market-orange/90`)}>
                        Take me to Sellers
                    </Button>
                ]

                switch (locationState.utm_cta) {
                    case "market.view_all":
                        actions.unshift(
                            (
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='default'
                                    onClick={() => navigate("/categories", {
                                        state: preparePayloadForCategoryPage(selectedMarkets, true)
                                    })}
                                    className="w-full sm:w-auto">
                                    <span className="hidden sm:inline">Continue to Category</span>
                                    <span className="sm:hidden">Category</span>
                                </Button>
                            )
                        )
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        return actions;
    }, [locationState])





    if (isMarketLoading) {
        return <Loader />;
    }


    return (
        <>
            {/* <div className="container mx-auto pt-4 mb-[5rem]"> */}
            <AppHeader
                title={locationState.title}
                subtitle="Select one or more markets to engage in"
                search={{
                    placeholder: "Search markets, categories or sellers nearby...",
                    onSearch: setSearchQuery,
                    onClear: () => setSearchQuery(""),
                }}
                showBackButton={locationState.utm_source !== "seller_landing"}
                onBackClick={() => navigate(-1)}
                rightContentOnNewLine={isMobile}
                rightContent={selectedMarkets.length > 0 && (
                    <div className='flex flex-row sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full'>
                        {getNextBehaviourOnActionClick()}
                    </div>
                )}
            />


            <div className="container animate-fade-in space-y-6  mb-[5rem]">
                {/* Selection Summary */}
                {/* <SelectionSummary
                    count={initialSelectedMarketCount}
                    type="market"
                    message="You'll appear in these markets"
                /> */}

                {/* Markets List */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMarkets.map(market => (
                            <MarketCard
                                isMember={market.belongs_to_market}
                                key={market.id}
                                market={market}
                                isSelected={selectedMarkets.includes(market.id)}
                                onToggle={handleMarketToggle}
                                handleLearnMarketStat={() => setShowLearnMarketStatsDialog(true)}
                                handleDeleteSelection={handleDeleteSelection}
                            />
                        ))}
                    </div>

                    {searchQuery && filteredMarkets.length < 2 && (
                        <SearchHint query={searchQuery} />
                    )}
                </div>
            </div>

            {/* </div> */}

            <MarketInsightsDialog
                onOpenChange={setShowLearnMarketStatsDialog}
                open={showLearnMarketStatDialog}
            />
            <SellerMarketCategorySelectionConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
            />
        </>
    );
};

export default MarketSelection;
import { sluggify } from '@/lib/utils'
import { Category, SearchedMarket } from '@/types'
import { MapPin, Store, Navigation, Clock, Phone, Star, Calendar, Users, X, Loader } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBottomSheet, useSheetData } from "../ui/bottom-sheet-modal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from '@/contexts/AuthContext'
import { SearchableSelect } from '../ui/searchable-select'
import { useGetCategories, useJoinMarket, useSellerCatrgoryMutation } from '@/hooks/api-hooks'
import { Badge } from '../ui/badge'

const MarketSearchCard: React.FC<{ data: SearchedMarket }> = ({ data: market }) => {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { open } = useBottomSheet()
    const distanceKm = (+market.distance / 1000).toFixed(1)


    const Footer = {
        'seller': <MarketSearchCardBottomSheetFooter_SELLER />,
        'buyer': <MarketSearchCardBottomSheetFooter_BUYER />,
    }

    return (
        <div className="relative glass-morphism rounded-xl p-4 cursor-pointer transition-all group hover:shadow-md"
            onClick={() => open({
                viewId: sluggify(market.name),
                body: <MarketSearchCardBottomSheetBody />,
                footer: Footer[profile.role],
                header: <MarketSearchCardBottomSheetHeader />,
                data: market
            })}
        >
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        {market.name}
                    </h3>
                    {/* Enhanced address with better visual prominence */}
                    <div className="flex items-center text-sm text-foreground/80 mb-3 bg-secondary/20 rounded-lg px-1 py-2 border border-secondary/40">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-market-orange" />
                        <span className="font-medium">{market.address}</span>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-secondary/20 mb-3">
                <img
                    src={market.map_url}
                    alt={`Map location for ${market.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Stats Section */}
            <div className="text-sm text-muted-foreground">
                <b> {distanceKm}km </b> from you
            </div>
        </div>
    )
}

function MarketSearchCardBottomSheetHeader() {
    const { data: marketData } = useSheetData() as { data: SearchedMarket }
    const distanceKm = (+marketData.distance / 1000).toFixed(1)

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="w-8 md:w-12 h-8 md:h-12 rounded-full bg-market-orange/10">
                    <AvatarFallback className="bg-market-orange/20 text-market-orange">
                        <Store className="h-4 w-4 md:h-6 md:w-6" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-base md:text-xl font-semibold flex items-center gap-2">
                        {marketData.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span>{distanceKm}km away</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MarketSearchCardBottomSheetBody() {
    const { data: marketData } = useSheetData() as { data: SearchedMarket & { categories?: any[]; removeCategory?: (arg: any) => void } }
    const distanceKm = (+marketData.distance / 1000).toFixed(1)

    return (
        <div className="space-y-4">
            {/* Location & Map Section */}
            <Card className="border-none">
                <CardContent className="space-y-4 p-2">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-market-orange" />
                        <span className="font-medium text-base">{marketData.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className='text-base'>{distanceKm}km from your location</span>
                    </div>

                    {/* Map Display */}
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-secondary/20">
                        <img
                            src={marketData.map_url}
                            alt={`Map location for ${marketData.name}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </CardContent>


                {marketData?.categories && (
                    <div className=" ml-2 my-4 space-y-2">
                        <p className='text-sm'>You will appear in these catgories</p>
                        <div className="flex items-center gap-x-4 max-w-full flex-wrap gap-4">

                            {marketData?.categories?.map(catgory => (
                                <Badge key={catgory.id} className='text-foreground/90 px-4 py-1 relative text-base bg-muted hover:bg-muted'>
                                    {catgory.name}

                                    <button className='absolute -top-1 -right-1 bg-destructive rounded-full hover:bg-destructive/80' onClick={() => marketData?.removeCategory(catgory.id)}>
                                        <X className='w-4 h-4' />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}


            </Card>
        </div>
    )
}

function MarketSearchCardBottomSheetFooter_SELLER() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { data: marketData, updateData } = useSheetData()
    const { close } = useBottomSheet()

    const sellerMaketCategory = useSellerCatrgoryMutation();
    const { mutateAsync: joinMarket, isPending } = useJoinMarket()

    const { data: _categories, isLoading } = useGetCategories()

    const [selectedCategories, setSelectedCategories] = useState([])

    const handleAddCategory = (category: Pick<Category, "id" | "name">) => {
        setSelectedCategories(prev => [...prev, category])
    }

    useEffect(() => {
        if (selectedCategories.length > 0) {
            updateData({
                removeCategory(categoryId: string) {
                    setSelectedCategories(selectedCategories.filter(it => it.id !== categoryId))
                },
                categories: selectedCategories
            })
        }
    }, [selectedCategories])

    async function handleSaveSelections() {
        const marketId = await joinMarket({
            address: marketData.address,
            location: `(${marketData.lon},${marketData.lat})`,
            map_url: marketData.map_url,
            name: marketData.name,
            place_id: marketData.place_id
        });
 
      await  sellerMaketCategory.mutateAsync({
            sellerId: profile?.id,
            payload: {
                selectedMarkets: [marketId],
                selectedCategories: selectedCategories.map(it => it.id)
            }
        })
    }

    return (
        <div className="sticky bottom-0 border-t border-t-muted-foreground/10 px-2 py-2 bg-background">
            <div className='grid grid-cols-2 w-full items-center justify-center gap-x-2'>
                <SearchableSelect
                    options={_categories.map(ct => ({
                        label: ct.name,
                        value: ct.id,
                        disabled: selectedCategories.find(selectedCategory => selectedCategory.id == ct.id) || ct.belongs_to_category
                    }))}
                    clearable
                    disabled={isLoading}
                    searchPlaceholder='Search categories'
                    placeholder='Categories'
                    onValueChange={(val, label) => handleAddCategory({ id: val, name: label })}
                />
                <Button
                    onClick={handleSaveSelections}
                    disabled={isPending}
                    size="sm"
                    variant='market'
                    className="flex-1 flex items-center gap-2"
                >
                    {isPending ? (<Loader className='h-4 w-4 animate-spin'/> ) : (<Store className="h-4 w-4" />)}
                    Add to list
                </Button>
            </div>
        </div>
    )
}
function MarketSearchCardBottomSheetFooter_BUYER() {
    const navigate = useNavigate()
    const { data: marketData, } = useSheetData()
    const { close } = useBottomSheet()

    async function gotoMarket() {
        close()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        navigate(`/sellers/${encodeURIComponent(sluggify(marketData.name))}`, {
            state: {
                title: marketData.name,
                market: {
                    id: marketData.id,
                    name: marketData.name
                },
                category: {
                    id: null,
                    name: null
                },
                utm_source: "market_selection",
            }
        })

    }

    return (
        <div className="sticky bottom-0 border-t border-t-muted-foreground/10 px-2 py-2 bg-background">
            <div className="flex gap-3 items-center justify-center">
                <Button
                    onClick={gotoMarket}
                    size="sm"
                    variant='market'
                    className="flex-1 flex items-center gap-2"
                >
                    <Store className="h-4 w-4" />
                    Browse Sellers
                </Button>
            </div>
        </div>
    )
}

export default MarketSearchCard

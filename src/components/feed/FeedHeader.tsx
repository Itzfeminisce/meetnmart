// components/FeedHeader.tsx
import React, { useState } from 'react';
import { MapPin, Plus, ChevronRight, Users, Eye, TrendingUp, Star, Search, Store } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AppHeader from '../AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { FeedItem } from '@/types';
import { useFeedStore } from '@/contexts/Store';
import { Marquee } from '../Marquee';
import { Link } from 'react-router-dom';

interface Market {
  name: string;
  shoppersCount: number;
  views: number;
  isJoined?: boolean;
  trending?: boolean;
  rating?: number;
}

interface FeedHeaderProps {
  selectedMarket: string;
  onMarketChange: (market: string) => void;
  feeds?: FeedItem[];
  currentTime: Date;
  onFormOpenChange: (open: boolean) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedMarket,
  onMarketChange,
  currentTime,
  onFormOpenChange,
}) => {
  const { profile } = useAuth()
  const isMobile = useIsMobile();
  const feedsStore = useFeedStore()
  // const [isMarketSheetOpen, setIsMarketSheetOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // const renderMarketStats = (market: Market) => (
  //   <div className="flex items-center gap-2 text-xs text-muted-foreground">
  //     <div className="flex items-center gap-1">
  //       <Users className="w-3 h-3" />
  //       <span>{market.shoppersCount?.toLocaleString() ?? '0'}</span>
  //     </div>
  //     <div className="flex items-center gap-1">
  //       <Eye className="w-3 h-3" />
  //       <span>{market.views?.toLocaleString() ?? '0'}</span>
  //     </div>
  //     {market.rating && (
  //       <div className="flex items-center gap-1">
  //         <Star className="w-3 h-3" />
  //         <span>{market.rating.toFixed(1)}</span>
  //       </div>
  //     )}
  //   </div>
  // );

  // const filteredMarkets = markets.filter(market => 
  //   market?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  // );

  // const renderMarketSelector = () => {
  //   if (isMobile) {
  //     return (
  //       <Sheet open={isMarketSheetOpen} onOpenChange={setIsMarketSheetOpen}>
  //         <SheetTrigger asChild>
  //           <Button variant="ghost" size="icon" className="relative">
  //             <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  //             <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
  //           </Button>
  //         </SheetTrigger>
  //         <SheetContent side="bottom" className="h-[70vh] p-0">
  //           <div className="flex flex-col h-full">
  //             <SheetHeader className="px-4 py-3 border-b">
  //               <SheetTitle>Select Market</SheetTitle>
  //             </SheetHeader>

  //             {/* Search Input */}
  //             <div className="px-4 py-2">
  //               <div className="relative">
  //                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
  //                 <Input
  //                   placeholder="Search markets..."
  //                   value={searchQuery}
  //                   onChange={(e) => setSearchQuery(e.target.value)}
  //                   className="pl-8"
  //                 />
  //               </div>
  //             </div>

  //             <Tabs defaultValue="your-markets" className="flex-1">
  //               <TabsList className="w-full justify-start px-4 pt-2">
  //                 <TabsTrigger value="your-markets">Your Markets</TabsTrigger>
  //                 <TabsTrigger value="recommended">Recommended</TabsTrigger>
  //               </TabsList>
  //               <ScrollArea className="flex-1">
  //                 <TabsContent value="your-markets" className="p-4 space-y-2">
  //                   {filteredMarkets.filter(m => m.isJoined).map((market) => (
  //                     <Button
  //                       key={market.name}
  //                       variant={market.name === selectedMarket ? "secondary" : "ghost"}
  //                       className="w-full justify-between h-auto py-3 px-4"
  //                       onClick={() => {
  //                         onMarketChange(market.name);
  //                         setIsMarketSheetOpen(false);
  //                       }}
  //                     >
  //                       <div className="flex flex-col items-start">
  //                         <div className="flex items-center gap-2">
  //                           <MapPin className="w-4 h-4" />
  //                           <span className="font-medium">{market.name}</span>
  //                         </div>
  //                         {renderMarketStats(market)}
  //                       </div>
  //                       <ChevronRight className="w-4 h-4" />
  //                     </Button>
  //                   ))}
  //                   {filteredMarkets.filter(m => m.isJoined).length === 0 && (
  //                     <div className="text-center text-muted-foreground py-4">
  //                       No markets found
  //                     </div>
  //                   )}
  //                 </TabsContent>
  //                 <TabsContent value="recommended" className="p-4 space-y-2">
  //                   {filteredMarkets.filter(m => !m.isJoined).map((market) => (
  //                     <div key={market.name} className="space-y-2">
  //                       <Button
  //                         variant="ghost"
  //                         className="w-full justify-between h-auto py-3 px-4"
  //                         onClick={() => {
  //                           onMarketChange(market.name);
  //                           setIsMarketSheetOpen(false);
  //                         }}
  //                       >
  //                         <div className="flex flex-col items-start">
  //                           <div className="flex items-center gap-2">
  //                             <MapPin className="w-4 h-4" />
  //                             <span className="font-medium">{market.name}</span>
  //                             {market.trending && (
  //                               <Badge variant="secondary" className="gap-1">
  //                                 <TrendingUp className="w-3 h-3" />
  //                                 Trending
  //                               </Badge>
  //                             )}
  //                           </div>
  //                           {renderMarketStats(market)}
  //                         </div>
  //                         <ChevronRight className="w-4 h-4" />
  //                       </Button>
  //                       <Separator />
  //                     </div>
  //                   ))}
  //                   {filteredMarkets.filter(m => !m.isJoined).length === 0 && (
  //                     <div className="text-center text-muted-foreground py-4">
  //                       No markets found
  //                     </div>
  //                   )}
  //                 </TabsContent>
  //               </ScrollArea>
  //             </Tabs>
  //           </div>
  //         </SheetContent>
  //       </Sheet>
  //     );
  //   }

  //   return (
  //     <Select value={selectedMarket} onValueChange={onMarketChange}>
  //       <SelectTrigger className="w-[180px]">
  //         <div className="flex items-center space-x-2">
  //           <div className="flex items-center space-x-1">
  //             <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
  //             <div className="w-2 h-2 bg-blue-500 rounded-full" title="Auto-detected location" />
  //           </div>
  //           <SelectValue />
  //         </div>
  //       </SelectTrigger>
  //       <SelectContent>
  //         <div className="p-2">
  //           {/* Search Input */}
  //           <div className="relative mb-2">
  //             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
  //             <Input
  //               placeholder="Search markets..."
  //               value={searchQuery}
  //               onChange={(e) => setSearchQuery(e.target.value)}
  //               className="pl-8"
  //             />
  //           </div>

  //           <div className="text-sm font-medium mb-2">Your Markets</div>
  //           {filteredMarkets.filter(m => m.isJoined).map(market => (
  //             <SelectItem key={market.name} value={market.name}>
  //               <div className="flex flex-col">
  //                 <span>{market.name}</span>
  //                 {renderMarketStats(market)}
  //               </div>
  //             </SelectItem>
  //           ))}
  //           {filteredMarkets.filter(m => m.isJoined).length === 0 && (
  //             <div className="text-sm text-muted-foreground py-2">
  //               No markets found
  //             </div>
  //           )}
  //           <Separator className="my-2" />
  //           <div className="text-sm font-medium mb-2">Recommended</div>
  //           {filteredMarkets.filter(m => !m.isJoined).map(market => (
  //             <SelectItem key={market.name} value={market.name}>
  //               <div className="flex flex-col">
  //                 <div className="flex items-center gap-2">
  //                   <span>{market.name}</span>
  //                   {market.trending && (
  //                     <Badge variant="secondary" className="gap-1">
  //                       <TrendingUp className="w-3 h-3" />
  //                       Trending
  //                     </Badge>
  //                   )}
  //                 </div>
  //                 {renderMarketStats(market)}
  //               </div>
  //             </SelectItem>
  //           ))}
  //           {filteredMarkets.filter(m => !m.isJoined).length === 0 && (
  //             <div className="text-sm text-muted-foreground py-2">
  //               No markets found
  //             </div>
  //           )}
  //         </div>
  //       </SelectContent>
  //     </Select>
  //   );
  // };

  return (
    <AppHeader
      title="Feeds"
      subtitle={
        <Marquee scroll={isMobile} text={`${getGreeting()}, ${profile.name}`} />
      }
      search={{
        onSearch(query) {
          feedsStore.filterBy({
            search: query
          })
        },
      }}
      rightContent={
        <div className="flex items-center space-x-2">
          {/* {renderMarketSelector()} */}
          {isMobile && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onFormOpenChange(true)}
                className="md:hidden"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                asChild
                variant="outline"
                size="icon"
                className="md:hidden"
              >
                <Link to={"/markets"}>
                  <Store className="h-5 w-5 text-market-orange" />

                </Link>
              </Button>
            </>
          )}
        </div>
      }
    />
  );
};
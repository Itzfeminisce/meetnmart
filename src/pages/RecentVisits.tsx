import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRecentVisits, joinMarket, saveRecentVisit, MarketSearchResult } from '@/services/marketsService';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { MarketPlaceholder } from '@/components/MarketPlaceholder';
import MarketIcon from '@/components/ui/svg/market-icon.svg';
import { useFetch, useMutate } from '@/hooks/api-hooks';
import ErrorComponent from '@/components/ErrorComponent';

const RecentVisits = () => {
  const navigate = useNavigate();

  // Fixed: Correct type parameter should be array type, and handle the response properly
  const { data: recentVisits = [], error, isLoading } = useFetch<MarketSearchResult[]>(
    ["recentVisits", 50], 
    () => getRecentVisits(50)
  );

  const recentVisitMutation = useMutate(saveRecentVisit);
  const joinMarketMutation = useMutate(joinMarket);

  const handleSelectMarket = async (market: MarketSearchResult) => {
    try {
      // Join the market (increment user count)
      await joinMarketMutation.mutateAsync(market);
      
      // Save to recent visits
      await recentVisitMutation.mutateAsync(market);

      // Navigate to categories page with the selected market
      navigate('/categories', {
        state: {
          market: {
            id: market.id,
            name: market.name,
            location: market.address
          }
        }
      });
    } catch (error) {
      console.error('Error selecting market:', error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Handle error state
  if (error) <ErrorComponent error={error} onRetry={() => navigate(0)} />

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2 -ml-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gradient">Recently Visited</h1>
        </div>
        <p className="text-muted-foreground">Your previous market visits</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-market-blue" />
        </div>
      ) : recentVisits.length > 0 ? (
        <div className="space-y-3 mb-6">
          {recentVisits.map(market => (
            <div
              key={market.id}
              className="glass-morphism rounded-lg p-3 flex items-center card-hover cursor-pointer"
              onClick={() => handleSelectMarket(market)}
            >
              <Avatar className="w-14 h-14 mr-4">
                <AvatarImage src={MarketIcon} alt="Market Icon" className="w-full h-full object-cover" />
                <AvatarFallback>{getInitials(market.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow overflow-hidden mr-2">
                <h3 className="font-medium truncate whitespace-nowrap text-ellipsis">
                  {market.name}
                </h3>
                <div className="flex items-start text-xs text-muted-foreground">
                  <span className="flex-shrink-0 mr-1 mt-[2px]">
                    <MapPin size={12} />
                  </span>
                  <span className="line-clamp-2 leading-snug">
                    {market.address}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <MarketPlaceholder message="No recently visited markets found. Start exploring markets to see your history here." />
      )}
    </div>
  );
};

export default RecentVisits;


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, ArrowLeft, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { getRecentVisits, joinMarket, saveRecentVisit, MarketSearchResult } from '@/services/marketsService';
// import { getInitials } from '@/lib/utils';
// import { toast } from 'sonner';
// import { MarketPlaceholder } from '@/components/MarketPlaceholder';
// import MarketIcon from '@/components/ui/svg/market-icon.svg';
// import { useFetch, useMutate } from '@/hooks/api-hooks';

// const RecentVisits = () => {
//   // const [recentVisits, setRecentVisits] = useState<MarketSearchResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // @ts-ignore
//   const {data: recentVisits, error, isLoading} = useFetch<MarketSearchResult>(["recentVisits"], () => getRecentVisits(50))

//   const recentVisitMutation = useMutate(saveRecentVisit)
//   const joinMarketMutation = useMutate(joinMarket)

//   // useEffect(() => {
//   //   const loadRecentVisits = async () => {
//   //     setLoading(true);
//   //     try {
//   //       const visits = await getRecentVisits(50); // Get up to 50 recent visits
//   //       setRecentVisits(visits);
//   //     } catch (error) {
//   //       console.error('Error loading recent visits:', error);
//   //       toast.error('Failed to load recent visits');
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   loadRecentVisits();
//   // }, []);

//   const handleSelectMarket = async (market: MarketSearchResult) => {
//     try {
//       // Join the market (increment user count)
//       await joinMarketMutation.mutateAsync(market)
//       // await joinMarket(market);
      
//       // Save to recent visits
//       // await saveRecentVisit(market);
//       await recentVisitMutation.mutateAsync(market)

//       // Navigate to categories page with the selected market
//       navigate('/categories', {
//         state: {
//           market: {
//             id: market.id,
//             name: market.name,
//             location: market.address
//           }
//         }
//       });
//     } catch (error) {
//       console.error('Error selecting market:', error);
//       toast.error("Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <div className="app-container px-4 pt-6 animate-fade-in">
//       <header className="mb-6">
//         <div className="flex items-center mb-4">
//           <Button 
//             variant="ghost" 
//             size="icon"
//             className="mr-2 -ml-3"
//             onClick={() => navigate(-1)}
//           >
//             <ArrowLeft size={20} />
//           </Button>
//           <h1 className="text-2xl font-bold text-gradient">Recently Visited</h1>
//         </div>
//         <p className="text-muted-foreground">Your previous market visits</p>
//       </header>

//       {loading ? (
//         <div className="flex justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-market-blue" />
//         </div>
//       ) : recentVisits.length > 0 ? (
//         <div className="space-y-3 mb-6">
//           {recentVisits.map(market => (
//             <div
//               key={market.id}
//               className="glass-morphism rounded-lg p-3 flex items-center card-hover cursor-pointer"
//               onClick={() => handleSelectMarket(market)}
//             >
//               <Avatar className="w-14 h-14 mr-4">
//                 <AvatarImage src={MarketIcon} alt="Market Icon" className="w-full h-full object-cover" />
//                 <AvatarFallback>{getInitials(market.name)}</AvatarFallback>
//               </Avatar>
//               <div className="flex-grow overflow-hidden mr-2">
//                 <h3 className="font-medium truncate whitespace-nowrap text-ellipsis">
//                   {market.name}
//                 </h3>
//                 <div className="flex items-start text-xs text-muted-foreground">
//                   <span className="flex-shrink-0 mr-1 mt-[2px]">
//                     <MapPin size={12} />
//                   </span>
//                   <span className="line-clamp-2 leading-snug">
//                     {market.address}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <MarketPlaceholder message="No recently visited markets found. Start exploring markets to see your history here." />
//       )}
//     </div>
//   );
// };

// export default RecentVisits;

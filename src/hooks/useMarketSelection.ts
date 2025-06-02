import { MarketWithAnalytics } from "@/types";
import { useCallback, useState } from "react";

export const useMarketSelection = () => {
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
  
    // console.log({searchQuery});
  
  
    const handleMarketToggle = useCallback((marketId: string) => {
      setSelectedMarkets([marketId]);
    }, []);
  
    const filterMarkets = useCallback((markets: MarketWithAnalytics[]) => {
      if (searchQuery.length === 0) return markets;
      return markets.filter(market =>
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [searchQuery]);
  
    return {
      selectedMarkets,
      searchQuery,
      setSearchQuery,
      handleMarketToggle,
      filterMarkets,
    };
  };
  
  
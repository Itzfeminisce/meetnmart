
import { supabase } from "@/integrations/supabase/client";
import { debounce } from "lodash";

export interface MarketSearchResult {
  id: string;
  place_id: string;
  name: string;
  address: string;
  user_count: number;
  location?: string; // Added location property
  photos?: Array<{
    reference: string;
    width: number;
    height: number;
  }>;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Debounced search function
export const debouncedSearchMarkets = debounce(async (
  query: string,
  callback: (results: MarketSearchResult[]) => void
) => {
  try {
    const { data, error } = await supabase.functions.invoke("search-markets", {
      body: { query }
    });

    if (error) {
      console.error("Error searching markets:", error);
      callback([]);
      return;
    }

    callback(data.markets || []);
  } catch (error) {
    console.error("Error searching markets:", error);
    callback([]);
  }
}, 300);

// Function to get nearby markets based on coordinates
export const getNearbyMarkets = async (coordinates: Coordinates): Promise<MarketSearchResult[]> => {
  try {
    const { data, error } = await supabase.functions.invoke("search-markets", {
      body: {
        nearby: true,
        lat: coordinates.latitude,
        lng: coordinates.longitude
      }
    });

    if (error) {
      console.error("Error fetching nearby markets:", error);
      return [];
    }

    return data.markets || [];
  } catch (error) {
    console.error("Error fetching nearby markets:", error);
    return [];
  }
};

// Function to join a market (increment user count)
export const joinMarket = async (market: MarketSearchResult) => {
  try {
    // Check if market exists
    const { data: existingMarket } = await supabase
      .from('markets')
      .select('id')
      .eq('place_id', market.place_id)
      .single();

    if (existingMarket) {
      // Market exists, increment user count
      await supabase.rpc('increment_market_user_count', {
        market_place_id: market.place_id
      });
    } else {
      // Market doesn't exist, insert new record
      await supabase
        .from('markets')
        .insert({
          place_id: market.place_id,
          name: market.name,
          address: market.address,
          // Convert to PostgreSQL point format
          location: market.location
        });
    }
    
    return true;
  } catch (error) {
    console.error("Error joining market:", error);
    return false;
  }
};

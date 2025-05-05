
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

// Function to get nearby markets based on coordinates with pagination
export const getNearbyMarkets = async (
  coordinates: Coordinates,
  page: number = 1,
  pageSize: number = 7
): Promise<MarketSearchResult[]> => {
  try {
    const { data, error } = await supabase.functions.invoke("search-markets", {
      body: {
        nearby: true,
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        page,
        pageSize
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

// Function to save a recently visited market
export const saveRecentVisit = async (market: MarketSearchResult) => {
  try {
    if (!supabase.auth.getUser()) {
      console.log("User not logged in, can't save recent visit");
      return false;
    }

    const { data, error } = await supabase
      .from('recent_visits')
      .upsert({
        place_id: market.place_id,
        market_name: market.name,
        market_address: market.address,
        visited_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,place_id'
      });

    if (error) {
      console.error("Error saving recent visit:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving recent visit:", error);
    return false;
  }
};

// Function to get recently visited markets
export const getRecentVisits = async (): Promise<MarketSearchResult[]> => {
  try {
    const { data, error } = await supabase
      .from('recent_visits')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching recent visits:", error);
      return [];
    }

    // Convert to MarketSearchResult format
    return (data || []).map(item => ({
      id: item.place_id,
      place_id: item.place_id,
      name: item.market_name,
      address: item.market_address,
      user_count: 0 // We don't have this info from recent_visits table
    }));
  } catch (error) {
    console.error("Error fetching recent visits:", error);
    return [];
  }
};

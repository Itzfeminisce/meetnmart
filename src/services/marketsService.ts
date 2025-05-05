
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

// Improved cache management
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache
const searchCache = new Map();

// Helper to prune old cache entries
const pruneCache = () => {
  const now = Date.now();
  const oldEntries = [...searchCache.entries()]
    .filter(([_, value]) => now - value.timestamp > CACHE_TTL)
    .map(([key]) => key);
  
  oldEntries.forEach(key => searchCache.delete(key));
};

// Periodically clean cache
setInterval(pruneCache, 5 * 60 * 1000); // Clean every 5 minutes

// Debounced search function
export const debouncedSearchMarkets = debounce(async (
  query: string,
  callback: (results: MarketSearchResult[]) => void
) => {
  try {
    // Check cache first (with pruning old entries)
    const cacheKey = `search-${query}`;
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
      console.log("Using cached search results for:", query);
      callback(cachedResult.data);
      return;
    }
    
    const { data, error } = await supabase.functions.invoke("search-markets", {
      body: { query }
    });

    if (error) {
      console.error("Error searching markets:", error);
      callback([]);
      return;
    }
    
    // Update cache with new results
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      data: data.markets || []
    });
    
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
    // Check cache first
    const cacheKey = `nearby-${coordinates.latitude.toFixed(4)}-${coordinates.longitude.toFixed(4)}-${page}-${pageSize}`;
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
      console.log("Using cached nearby markets for:", cacheKey);
      return cachedResult.data;
    }
    
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
    
    // Cache the results
    const markets = data.markets || [];
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      data: markets
    });
    
    return markets;
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
      // Market exists, increment user count using the RPC function
      const { error } = await supabase.rpc('increment_market_user_count', {
        market_place_id: market.place_id
      });
      
      if (error) {
        console.error("Error incrementing market user count:", error);
        return false;
      }
      
      // Clear any cache entries that might have this market to ensure fresh data
      const cacheKeys = [...searchCache.keys()];
      cacheKeys.forEach(key => {
        if (key.startsWith('nearby-') || key === `search-${market.name}`) {
          searchCache.delete(key);
        }
      });
      
    } else {
      // Market doesn't exist, insert new record
      const { error } = await supabase
        .from('markets')
        .insert({
          place_id: market.place_id,
          name: market.name,
          address: market.address,
          // Convert to PostgreSQL point format
          location: market.location
        });
        
      if (error) {
        console.error("Error inserting market:", error);
        return false;
      }
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
    const user = supabase.auth.getUser();
    if (!user || !(await user).data.user) {
      console.log("User not logged in, can't save recent visit");
      return false;
    }

    const userId = (await user).data.user.id;

    const { data, error } = await supabase
      .from('recent_visits')
      .upsert({
        user_id: userId,
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
export const getRecentVisits = async (limit: number = 10): Promise<MarketSearchResult[]> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user?.data?.user?.id) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('recent_visits')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('visited_at', { ascending: false })
      .limit(limit);

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

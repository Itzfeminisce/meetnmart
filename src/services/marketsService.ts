import { supabase } from '@/integrations/supabase/client';

export interface MarketSearchResult {
  id: string;
  name: string;
  address: string;
  place_id: string;
  location?: { latitude: number; longitude: number };
  distance?: string;
  user_count?: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns The distance between the two points in kilometers
 */
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRadians = (angle: number): number => (angle * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

/**
 * Retrieves a list of markets near the specified coordinates
 * @param coordinates The coordinates to search near
 * @param page The page number to retrieve
 * @param limit The number of markets to retrieve per page
 * @returns A promise that resolves to an array of MarketSearchResult objects
 */
export const getNearbyMarkets = async (
  coordinates: { latitude: number; longitude: number },
  page: number = 1,
  limit: number = 7
): Promise<MarketSearchResult[]> => {
  try {
    const { latitude, longitude } = coordinates;
    const offset = (page - 1) * limit;

    // Fetch markets from the database
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }

    // Transform the data into MarketSearchResult objects and calculate the distance
    const marketsWithDistance = data.map(market => {
      const distance = haversine(
        latitude,
        longitude,
        market.location.latitude,
        market.location.longitude
      );

      const distanceString = distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;

      return {
        id: market.id,
        name: market.name,
        address: market.address,
        place_id: market.place_id,
        location: market.location,
        distance: distanceString,
        user_count: market.user_count
      };
    });

    return marketsWithDistance;
  } catch (error) {
    console.error('Error in getNearbyMarkets:', error);
    throw error;
  }
};

/**
 * Searches for markets based on the provided query
 * @param query The search query
 * @returns A promise that resolves to an array of MarketSearchResult objects
 */
export const searchMarkets = async (query: string): Promise<MarketSearchResult[]> => {
  try {
    if (!query || query.trim() === '') {
      return []; // Return an empty array if the query is null or empty
    }

    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (error) {
      console.error('Error searching markets:', error);
      return []; // Return an empty array in case of an error
    }

    // Transform the data into MarketSearchResult objects
    const searchResults = data.map(market => ({
      id: market.id,
      name: market.name,
      address: market.address,
      place_id: market.place_id,
      location: market.location,
      user_count: market.user_count
    }));

    return searchResults;
  } catch (error) {
    console.error('Error in searchMarkets:', error);
    return []; // Return an empty array in case of an error
  }
};

/**
 * Debounces the searchMarkets function to prevent excessive API calls
 */
export const debouncedSearchMarkets = (query: string, callback: (results: MarketSearchResult[]) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      searchMarkets(query).then(results => callback(results));
    }, 300);
  };
};

/**
 * Increments the user count for the specified market
 * @param market The market to join
 */
export const joinMarket = async (market: MarketSearchResult): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_market_user_count', {
      market_place_id: market.id,
    });

    if (error) {
      console.error('Error incrementing market user count:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in joinMarket:', error);
    throw error;
  }
};

/**
 * Retrieves the recent visits for the current user
 * @param limit The number of recent visits to retrieve
 * @returns A promise that resolves to an array of MarketSearchResult objects
 */
export const getRecentVisits = async (limit: number = 5): Promise<MarketSearchResult[]> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Retrieve recent visits from the database
    const { data, error } = await supabase
      .from('recent_visits')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent visits:', error);
      throw error;
    }

    // Transform the data into MarketSearchResult objects
    const recentVisits = data.map(visit => ({
      id: visit.id,
      name: visit.market_name,
      address: visit.market_address,
      place_id: visit.place_id,
    }));

    return recentVisits;
  } catch (error) {
    console.error('Error in getRecentVisits:', error);
    throw error;
  }
};

/**
 * Save a market to the user's recent visits
 */
export const saveRecentVisit = async (market: MarketSearchResult): Promise<void> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save to recent visits using upsert to handle the unique constraint
    await supabase
      .from('recent_visits')
      .upsert(
        {
          user_id: user.id,
          place_id: market.place_id,
          market_name: market.name,
          market_address: market.address,
          visited_at: new Date().toISOString()
        },
        { onConflict: 'user_id,place_id', ignoreDuplicates: false }
      );
      
  } catch (error) {
    console.error('Error saving recent visit:', error);
    throw error;
  }
};

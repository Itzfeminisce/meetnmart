
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Set up Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Cache for market searches to reduce API calls
const searchCache = new Map()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour cache

// Cache for nearby market results
const nearbyCache = new Map()

// Helper function to get market information from the database to avoid API calls
async function getMarketDataFromDb(placeIds: string[]) {
  if (!placeIds.length) return {};
  
  const { data } = await supabase
    .from('markets')
    .select('place_id, user_count')
    .in('place_id', placeIds);
    
  const marketMap = {};
  if (data) {
    data.forEach(market => {
      marketMap[market.place_id] = market;
    });
  }
  
  return marketMap;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const { query, nearby, lat, lng, page = 1, pageSize = 10 } = await req.json();
    
    // Get the API key from environment variables
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!googleMapsApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Return early if query is too short and not looking for nearby places
    if (!query && query?.length < 2 && !nearby) {
      return new Response(
        JSON.stringify({ markets: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check cache first for this query
    let cacheKey;
    if (nearby) {
      // For nearby searches, use lat/lng/page as the cache key
      cacheKey = `nearby-${lat?.toFixed(4)}-${lng?.toFixed(4)}-${page}-${pageSize}`;
      const cachedResult = nearbyCache.get(cacheKey);
      if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
        console.log("Cache hit for nearby:", cacheKey);
        return new Response(
          JSON.stringify({ markets: cachedResult.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // For text searches, use query as cache key
      cacheKey = `search-${query}`;
      const cachedResult = searchCache.get(cacheKey);
      if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
        console.log("Cache hit for search:", cacheKey);
        return new Response(
          JSON.stringify({ markets: cachedResult.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If not in cache, we need to call the API
    // First, check if we have pagination token from previous request
    let nextPageToken = null;
    if (nearby && page > 1) {
      const prevPageKey = `nearby-${lat?.toFixed(4)}-${lng?.toFixed(4)}-${page-1}-${pageSize}`;
      const prevPageData = nearbyCache.get(prevPageKey);
      if (prevPageData) {
        nextPageToken = prevPageData.nextPageToken;
      }
    }

    // Different endpoints based on the search type
    const endpoint = nearby 
      ? 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
      : 'https://maps.googleapis.com/maps/api/place/textsearch/json'

    // Prepare search parameters
    const searchParams = new URLSearchParams()
    if (nearby && lat && lng) {
      searchParams.append('location', `${lat},${lng}`)
      searchParams.append('radius', '5000')  // 5km radius
      searchParams.append('type', 'supermarket|market|grocery_or_supermarket|store|shopping_mall')
      // Add pagination token if we have one
      if (nextPageToken) {
        searchParams.append('pagetoken', nextPageToken)
      }
    } else {
      searchParams.append('query', `${query} market, nigeria`)
    }
    searchParams.append('key', googleMapsApiKey)

    // Make request to Google Maps API
    const googleResponse = await fetch(`${endpoint}?${searchParams.toString()}`)
    const data = await googleResponse.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data)
      return new Response(
        JSON.stringify({ error: `Google Maps API error: ${data.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Process results
    const places = data.results || []
    const placeIds = places.map(place => place.place_id)
    
    // Get existing markets from our database
    const existingMarketsMap = await getMarketDataFromDb(placeIds);
    
    // Format results with appropriate pagination
    const startIdx = nearby ? 0 : (page - 1) * pageSize
    const endIdx = nearby ? places.length : startIdx + pageSize
    const paginatedPlaces = places.slice(startIdx, endIdx)

    const results = paginatedPlaces.map(place => {
      const existingMarket = existingMarketsMap[place.place_id];
      const userCount = existingMarket ? existingMarket.user_count : 0;
      
      return {
        id: place.place_id,
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity,
        location: place.geometry?.location 
          ? `(${place.geometry.location.lat},${place.geometry.location.lng})`
          : null,
        user_count: userCount,
        photos: place.photos 
          ? place.photos.map(photo => ({
              reference: photo.photo_reference,
              width: photo.width,
              height: photo.height
            }))
          : []
      }
    });

    // Cache the results
    if (nearby) {
      nearbyCache.set(cacheKey, {
        timestamp: Date.now(),
        data: results,
        nextPageToken: data.next_page_token || null
      });
    } else {
      searchCache.set(cacheKey, {
        timestamp: Date.now(),
        data: results
      });
    }

    // Limit cache size to prevent memory issues
    if (searchCache.size > 200) {
      // Delete oldest entries
      const keys = [...searchCache.keys()];
      keys.slice(0, 50).forEach(k => searchCache.delete(k));
    }
    if (nearbyCache.size > 200) {
      // Delete oldest entries
      const keys = [...nearbyCache.keys()];
      keys.slice(0, 50).forEach(k => nearbyCache.delete(k));
    }

    return new Response(
      JSON.stringify({ 
        markets: results,
        nextPageToken: data.next_page_token || null,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in search-markets function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

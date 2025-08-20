import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
async function getCached(key) {
  const { data, error } = await supabase.from('api_cache').select('data, next_page_token, created_at').eq('key', key).single();
  if (error || !data) return null;
  const age = Date.now() - new Date(data.created_at).getTime();
  if (age > CACHE_TTL_MS) return null;
  return data;
}
async function setCached(key, payload, nextPageToken = null, type = 'search') {
  await supabase.from('api_cache').upsert({
    key,
    type,
    data: payload,
    next_page_token: nextPageToken,
    created_at: new Date().toISOString()
  });
}
async function getMarketDataFromDb(placeIds) {
  if (!placeIds.length) return {};
  const { data } = await supabase.from('markets').select('place_id, user_count').in('place_id', placeIds);
  return (data || []).reduce((acc, market)=>{
    acc[market.place_id] = market;
    return acc;
  }, {});
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { query, nearby, lat, lng, page = 1, pageSize = 10 } = await req.json();
    const googleMapsApiKey = ""; // Deno.env.get('GOOGLE_MAPS_API_KEY');
    if ((!query || query.length < 2) && !nearby) {
      return new Response(JSON.stringify({
        markets: []
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const cacheKey = nearby ? `nearby-${lat?.toFixed(4)}-${lng?.toFixed(4)}-${page}-${pageSize}` : `search-${query}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({
        markets: cached.data,
        nextPageToken: cached.next_page_token,
        cached: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const endpoint = nearby ? 'https://maps.googleapis.com/maps/api/place/nearbysearch/json' : 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const params = new URLSearchParams();
    if (nearby && lat && lng) {
      params.append('location', `${lat},${lng}`);
      params.append('radius', '5000');
      params.append('type', 'supermarket|market|grocery_or_supermarket|store|shopping_mall');
    } else {
      params.append('query', `${query} market, nigeria`);
    }
    if (!googleMapsApiKey) {
      return new Response(JSON.stringify({
        error: 'Google Maps API key not configured'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    params.append('key', googleMapsApiKey);
    const googleResponse = await fetch(`${endpoint}?${params.toString()}`);
    const data = await googleResponse.json();
    if (![
      'OK',
      'ZERO_RESULTS'
    ].includes(data.status)) {
      console.error('Google Maps API error:', data);
      return new Response(JSON.stringify({
        error: `Google Maps API error: ${data.status}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    const places = data.results || [];
    const placeIds = places.map((p)=>p.place_id);
    const existingMarkets = await getMarketDataFromDb(placeIds);
    const paginatedPlaces = nearby ? places : places.slice((page - 1) * pageSize, page * pageSize);
    const results = paginatedPlaces.map((place)=>({
        id: place.place_id,
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity,
        location: place.geometry?.location ? `(${place.geometry.location.lat},${place.geometry.location.lng})` : null,
        user_count: existingMarkets[place.place_id]?.user_count || 0,
        photos: (place.photos || []).map((photo)=>({
            reference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          }))
      }));
    await setCached(cacheKey, results, data.next_page_token || null, nearby ? 'nearby' : 'search');
    return new Response(JSON.stringify({
      markets: results,
      nextPageToken: data.next_page_token || null,
      cached: false
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});

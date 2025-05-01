import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { create, getNumericDate, Header, Payload } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY')!;
const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET')!;
const LIVEKIT_API_URL = Deno.env.get('LIVEKIT_API_URL')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200, // 👈 explicitly set 200
      headers: corsHeaders,
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { roomName } = body;

    if (!roomName) {
      return new Response(JSON.stringify({ error: 'Missing roomName' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create JWT for REST API
    const header: Header = { alg: 'HS256', typ: 'JWT' };
    const payload: Payload = {
      iss: LIVEKIT_API_KEY,
      exp: getNumericDate(60), // 60 seconds expiry
    };
    const jwt = await create(header, payload, LIVEKIT_API_SECRET);

    // Call LiveKit API to create room
    const livekitRes = await fetch(`${LIVEKIT_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: roomName }),
    });

    const data = await livekitRes.json();

    if (!livekitRes.ok) {
      throw new Error(data.message || 'LiveKit error');
    }

    return new Response(JSON.stringify({ success: true, room: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

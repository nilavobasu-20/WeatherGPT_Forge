import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const port = Number(process.env.PORT ?? 3001);
const googleApiKey = process.env.GOOGLE_API_KEY ?? process.env.VITE_GOOGLE_API_KEY;

if (!googleApiKey) {
  console.warn('No Google API key found. Add GOOGLE_API_KEY or VITE_GOOGLE_API_KEY to .env or .env.local');
}

/** Get the client referer header to satisfy Google API referrer restrictions */
function getRefererHeaders(req) {
  const referer = req.headers.referer || req.headers.origin || 'http://localhost:5173/';
  return {
    'Referer': referer,
    'Accept': 'application/json',
  };
}

/** Safely parse a fetch response as JSON, returning an error object on failure. */
async function safeJson(response) {
  const text = await response.text();
  if (!text) {
    return { error: `Google API returned an empty response (HTTP ${response.status}).` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Google API returned non-JSON (HTTP ${response.status}): ${text.slice(0, 200)}` };
  }
}

// Geocode location string to coordinates
app.get('/api/geocode', async (req, res) => {
  const address = req.query.address;
  if (!address || typeof address !== 'string') {
    res.status(400).json({ error: 'Missing address query parameter' });
    return;
  }

  if (!googleApiKey) {
    res.status(500).json({ error: 'Google API key is missing in the server environment.' });
    return;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}`;
    const response = await fetch(url, { headers: getRefererHeaders(req) });
    const data = await safeJson(response);
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    console.error('Geocode proxy error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to resolve location',
    });
  }
});

// Reverse geocode coordinates to specific address / place name
app.get('/api/reverse-geocode', async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;

  if (!lat || !lng || typeof lat !== 'string' || typeof lng !== 'string') {
    res.status(400).json({ error: 'Missing lat/lng query parameters' });
    return;
  }

  if (!googleApiKey) {
    res.status(500).json({ error: 'Google API key is missing in the server environment.' });
    return;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
    const response = await fetch(url, { headers: getRefererHeaders(req) });
    const data = await safeJson(response);

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0];
      let city = '';
      let state = '';
      let country = '';

      for (const component of result.address_components || []) {
        const types = component.types || [];
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (!city && (types.includes('sublocality') || types.includes('administrative_area_level_2') || types.includes('postal_town'))) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('country')) {
          country = component.long_name;
        }
      }

      const locationName = city ? (state ? `${city}, ${state}` : city) : (result.formatted_address || 'Detected Location');
      res.json({
        locationName,
        city: city || locationName,
        state,
        country: country || 'Unknown',
        formattedAddress: result.formatted_address,
      });
    } else {
      res.json({
        locationName: 'Detected Location',
        country: 'Current Area',
      });
    }
  } catch (error) {
    console.error('Reverse geocode proxy error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to reverse geocode location',
    });
  }
});

// Weather conditions lookup
app.get('/api/weather', async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;

  if (!lat || !lng || typeof lat !== 'string' || typeof lng !== 'string') {
    res.status(400).json({ error: 'Missing lat/lng query parameters' });
    return;
  }

  if (!googleApiKey) {
    res.status(500).json({ error: 'Google API key is missing in the server environment.' });
    return;
  }

  try {
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}&location.latitude=${lat}&location.longitude=${lng}`;
    const response = await fetch(url, { headers: getRefererHeaders(req) });
    const data = await safeJson(response);
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    console.error('Weather proxy error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to fetch weather data',
    });
  }
});

// Places autocomplete suggestions proxy
app.get('/api/suggestions', async (req, res) => {
  const query = req.query.q;
  if (!query || typeof query !== 'string' || !query.trim()) {
    res.json({ suggestions: [] });
    return;
  }

  if (!googleApiKey) {
    res.json({ suggestions: [] });
    return;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${googleApiKey}`;
    const response = await fetch(url, { headers: getRefererHeaders(req) });
    const data = await safeJson(response);

    if (data && Array.isArray(data.predictions)) {
      const suggestions = data.predictions.map((p) => ({
        id: p.place_id,
        name: p.structured_formatting?.main_text || p.description,
        subtext: p.structured_formatting?.secondary_text || '',
        full: p.description,
      }));
      res.json({ suggestions });
      return;
    }
  } catch (err) {
    // Graceful fallback to empty
  }

  res.json({ suggestions: [] });
});

// Chat proxy to Activepieces webhook (avoids CORS on deployed builds)
const DEFAULT_WEBHOOK_URL = 'https://cloud.activepieces.com/api/v1/webhooks/47Z2utYcnmyBR62fAmCWb/sync';

app.post('/api/chat', express.json(), async (req, res) => {
  const webhookUrl =
    process.env.VITE_ACTIVEPIECES_WEBHOOK_URL ||
    process.env.ACTIVEPIECES_WEBHOOK_URL ||
    DEFAULT_WEBHOOK_URL;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type') || '';

    if (response.ok) {
      if (contentType.includes('application/json')) {
        const data = await response.json();
        res.status(200).json(data);
      } else {
        const text = await response.text();
        res.status(200).json({ reply: text });
      }
    } else {
      const text = await response.text();
      res.status(response.status).json({
        error: `Activepieces returned HTTP ${response.status}`,
        details: text.slice(0, 500),
      });
    }
  } catch (error) {
    console.error('Chat proxy error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to reach chatbot service',
    });
  }
});

app.listen(port, () => {
  console.log(`Weather proxy server running on http://localhost:${port}`);
});

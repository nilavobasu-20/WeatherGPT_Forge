export default async function handler(req, res) {
  const lat = req.query.lat;
  const lng = req.query.lng;

  if (!lat || !lng || typeof lat !== 'string' || typeof lng !== 'string') {
    return res.status(400).json({ error: 'Missing lat/lng query parameters' });
  }

  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
  if (!googleApiKey) {
    return res.status(500).json({ error: 'Google API key is missing in the server environment.' });
  }

  try {
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}&location.latitude=${lat}&location.longitude=${lng}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    console.error('Weather proxy error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to fetch weather data',
    });
  }
}


const DEFAULT_GOOGLE_KEY = 'AIzaSyD4L7DZSxHArSFLvY2RpQtQYb5olaZ-aI0';

export default async function handler(req, res) {
  const address = req.query.address;
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing address query parameter' });
  }

  const googleApiKey =
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GOOGLE_API_KEY ||
    DEFAULT_GOOGLE_KEY;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    console.error('Geocode proxy error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to resolve location',
    });
  }
}

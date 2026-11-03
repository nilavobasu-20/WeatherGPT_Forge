const DEFAULT_GOOGLE_KEY = 'AIzaSyD4L7DZSxHArSFLvY2RpQtQYb5olaZ-aI0';

export default async function handler(req, res) {
  const query = req.query.q;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.json({ suggestions: [] });
  }

  const googleApiKey =
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GOOGLE_API_KEY ||
    DEFAULT_GOOGLE_KEY;

  try {
    // Remove types=(cities) restriction to get all place types (areas, neighborhoods, establishments, etc.)
    // like Google Maps autocomplete does
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleApiKey}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();

    if (data && Array.isArray(data.predictions)) {
      const suggestions = data.predictions.map((p) => ({
        id: p.place_id,
        name: p.structured_formatting?.main_text || p.description,
        subtext: p.structured_formatting?.secondary_text || '',
        full: p.description,
      }));
      return res.json({ suggestions });
    }
  } catch {
    // Graceful fallback to empty
  }

  return res.json({ suggestions: [] });
}

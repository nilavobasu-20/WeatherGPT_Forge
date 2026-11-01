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
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0];
      let city = '';
      let state = '';
      let country = '';

      for (const component of result.address_components || []) {
        const types = component.types || [];
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (
          !city &&
          (types.includes('sublocality') ||
            types.includes('administrative_area_level_2') ||
            types.includes('postal_town'))
        ) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('country')) {
          country = component.long_name;
        }
      }

      const locationName = city
        ? state
          ? `${city}, ${state}`
          : city
        : result.formatted_address || 'Detected Location';
      return res.json({
        locationName,
        city: city || locationName,
        state,
        country: country || 'Unknown',
        formattedAddress: result.formatted_address,
      });
    } else {
      return res.json({
        locationName: 'Detected Location',
        country: 'Current Area',
      });
    }
  } catch (error) {
    console.error('Reverse geocode proxy error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to reverse geocode location',
    });
  }
}


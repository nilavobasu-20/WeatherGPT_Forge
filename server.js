import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const port = Number(process.env.PORT ?? 3001);
const googleApiKey = process.env.GOOGLE_API_KEY ?? process.env.VITE_GOOGLE_API_KEY;

if (!googleApiKey) {
  console.warn('No Google API key found. Add GOOGLE_API_KEY or VITE_GOOGLE_API_KEY to .env.local');
}

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
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to resolve location',
    });
  }
});

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
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to fetch weather data',
    });
  }
});

app.listen(port, () => {
  console.log(`Weather proxy server running on http://localhost:${port}`);
});

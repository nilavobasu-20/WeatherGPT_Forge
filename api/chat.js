export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.VITE_ACTIVEPIECES_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Activepieces webhook URL is not configured.' });
  }

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
        return res.status(200).json(data);
      } else {
        const text = await response.text();
        return res.status(200).json({ reply: text });
      }
    } else {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Activepieces returned HTTP ${response.status}`,
        details: text.slice(0, 500),
      });
    }
  } catch (error) {
    console.error('Chat proxy error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to reach chatbot service',
    });
  }
}


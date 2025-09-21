module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    try {
      const { token, url } = req.body;
      
      if (!token || !url) {
        return res.status(400).json({ error: 'Token and URL are required' });
      }
      
      // Set webhook via Telegram API
      const telegramUrl = `https://api.telegram.org/bot${token}/setWebhook`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${url}/api/telegram-webhook`
        })
      });
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error setting webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
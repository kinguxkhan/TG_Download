module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Parse the request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { token, url } = JSON.parse(body);
        
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
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          res.status(200).json(data);
        } else {
          // Handle non-JSON responses
          const text = await response.text();
          console.error('Non-JSON response from Telegram:', text);
          res.status(500).json({ 
            error: 'Telegram API returned non-JSON response',
            details: text.substring(0, 100) + '...' 
          });
        }
      } catch (parseError) {
        console.error('Error parsing request:', parseError);
        res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    });
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

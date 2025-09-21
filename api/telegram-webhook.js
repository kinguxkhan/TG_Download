// Use environment variable for bot token
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8441543645:AAFb8rQNhKw9byP3fRtH30fZfVGsBh4brwo";

// Simple Telegram webhook handler without external dependencies
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
      const update = req.body;
      console.log('Received update:', JSON.stringify(update));
      
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const messageText = update.message.text;
        
        // Handle /start command
        if (messageText === '/start') {
          await sendTelegramMessage(chatId, 
            'Welcome to Social Media Downloader Bot! 🎉\n\n' +
            'Send me a link from:\n' +
            '• TikTok\n• Instagram\n• Reddit\n• Facebook\n• Snapchat\n• SoundCloud\n\n' +
            'I will fetch the download links for you!'
          );
          return res.status(200).json({ ok: true });
        }
        
        // Handle /help command
        if (messageText === '/help') {
          await sendTelegramMessage(chatId,
            'How to use:\n\n' +
            '1. Send me a link from supported platforms\n' +
            '2. I will process it and send you download options\n\n' +
            'Supported platforms: TikTok, Instagram, Reddit, Facebook, Snapchat, SoundCloud'
          );
          return res.status(200).json({ ok: true });
        }
        
        // Handle URLs
        if (messageText.match(/https?:\/\/[^\s]+/)) {
          // Send "processing" message
          await sendTelegramMessage(chatId, '🔄 Processing your link...');
          
          try {
            // Call your download API
            const apiUrl = `https://batgpt.vercel.app/api/alldl?url=${encodeURIComponent(messageText)}`;
            const response = await fetch(apiUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch from API');
            }
            
            const data = await response.json();
            
            // Format the response
            let replyText = 'Here are your download options:\n\n';
            
            if (data && data.data) {
              if (data.data.video) {
                replyText += '🎥 Videos:\n';
                if (data.data.video.urls && data.data.video.urls.length > 0) {
                  data.data.video.urls.forEach((url, index) => {
                    replyText += `${index + 1}. ${url}\n`;
                  });
                }
                replyText += '\n';
              }
              
              if (data.data.audio) {
                replyText += '🔊 Audio:\n';
                if (data.data.audio.url) {
                  replyText += `1. ${data.data.audio.url}\n`;
                }
                replyText += '\n';
              }
            } else {
              replyText = 'No downloadable content found for this URL.';
            }
            
            // Send the result
            await sendTelegramMessage(chatId, replyText);
          } catch (error) {
            console.error('Error processing URL:', error);
            await sendTelegramMessage(chatId, 'Sorry, I encountered an error processing your request. Please try again later.');
          }
          
          return res.status(200).json({ ok: true });
        }
        
        // Handle non-URL messages
        await sendTelegramMessage(chatId, 'Please send a valid URL from supported platforms.');
        return res.status(200).json({ ok: true });
      }
      
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error handling Telegram update:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

// Function to send message via Telegram API
async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      throw new Error(`Telegram API error: ${errorData.description}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
                                                }

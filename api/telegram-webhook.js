const { Telegraf } = require('telegraf');

// Initialize bot with your token (use environment variable for security)
const bot = new Telegraf(process.env.8441543645:AAFb8rQNhKw9byP3fRtH30fZfVGsBh4brwo);

// Handle start command
bot.start((ctx) => {
  ctx.reply(
    'Welcome to Social Media Downloader Bot! 🎉\n\n' +
    'Send me a link from:\n' +
    '• TikTok\n• Instagram\n• Reddit\n• Facebook\n• Snapchat\n• SoundCloud\n\n' +
    'I will fetch the download links for you!'
  );
});

// Handle help command
bot.help((ctx) => {
  ctx.reply(
    'How to use:\n\n' +
    '1. Send me a link from supported platforms\n' +
    '2. I will process it and send you download options\n\n' +
    'Supported platforms: TikTok, Instagram, Reddit, Facebook, Snapchat, SoundCloud'
  );
});

// Handle incoming messages with URLs
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  
  // Simple URL detection
  if (!message.match(/https?:\/\/[^\s]+/)) {
    return ctx.reply('Please send a valid URL from supported platforms.');
  }
  
  try {
    // Send "processing" message
    const processingMsg = await ctx.reply('🔄 Processing your link...');
    
    // Call your download API
    const apiUrl = `https://batgpt.vercel.app/api/alldl?url=${encodeURIComponent(message)}`;
    const response = await fetch(apiUrl);
    
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
    
    // Edit the processing message with results
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      null,
      replyText
    );
  } catch (error) {
    console.error('Error:', error);
    ctx.reply('Sorry, I encountered an error processing your request. Please try again later.');
  }
});

// Export the bot middleware
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Handle Telegram webhook
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Error handling Telegram update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
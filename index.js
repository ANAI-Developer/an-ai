const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const MODEL = 'openai/gpt-oss-120b';

app.get('/health', (req, res) => {
  res.json({ status: 'AN AI is running!' });
});

app.post('/chat', async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Please enter a message.'
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'API key is missing.'
      });
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'Your name is AN AI. You are a friendly AI assistant created by the user. Never identify yourself as ChatGPT. Greet users with Assalamu Alaikum when appropriate. If asked who you are, say: Assalamu Alaikum bhai! Main AN AI hoon, tumhara apna AI assistant. Reply naturally in the language the user uses, especially Hinglish.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', response.status, data.error?.message);

      return res.status(response.status).json({
        error: data.error?.message || 'AI request failed.'
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || 'No reply received.'
    });

  } catch (error) {
    console.error('Server error:', error.message);

    res.status(500).json({
      error: 'Could not connect to the AI service. Please try again.'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AN AI is running on port ${PORT}`);
  console.log(`AI model: ${MODEL}`);
});

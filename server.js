/**
 * server.js
 */
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// GET endpoint to fetch TikTok stats
app.get('/api/getTikTokStats', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const url = `https://www.tiktok.com/@${username}`;
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    // If TikTok returned an error
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch from TikTok. Status: ${response.status}`
      });
    }

    const content = await response.text();

    // Regex to find follower and like counts in the HTML
    const followersRegEx = /<strong[^>]*data-e2e="followers-count"[^>]*>(.*?)<\/strong>/;
    const likesRegEx = /<strong[^>]*data-e2e="likes-count"[^>]*>(.*?)<\/strong>/;

    let followers = 'Not found';
    let likes = 'Not found';

    const followersMatch = content.match(followersRegEx);
    if (followersMatch && followersMatch.length > 1) {
      followers = followersMatch[1];
    }

    const likesMatch = content.match(likesRegEx);
    if (likesMatch && likesMatch.length > 1) {
      likes = likesMatch[1];
    }

    return res.json({
      username,
      url,
      followers,
      likes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

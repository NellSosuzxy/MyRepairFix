const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache structure to prevent hitting API limits
let newsCache = {
    data: null,
    timestamp: 0
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

router.get('/', async (req, res) => {
    try {
        // Check cache first
        const now = Date.now();
        if (newsCache.data && (now - newsCache.timestamp < CACHE_DURATION)) {
            return res.json(newsCache.data);
        }

        // Check if API key exists
        if (!process.env.NEWS_API_KEY) {
            console.warn('NEWS_API_KEY is missing in environment variables');
            return res.status(503).json({ 
                success: false, 
                message: 'News service temporarily unavailable' 
            });
        }

        // Fetch new data
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                category: 'technology',
                language: 'en',
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 12 // Fetch more to allow filtering for images
            }
        });

        // Update cache
        if (response.data.status === 'ok') {
            newsCache = {
                data: { success: true, articles: response.data.articles },
                timestamp: now
            };
            return res.json(newsCache.data);
        } else {
            throw new Error(response.data.message || 'News API Error');
        }

    } catch (error) {
        console.error('News API Error:', error.message);
        
        // If API fails but we have stale cache, serve it as backup
        if (newsCache.data) {
            return res.json(newsCache.data);
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch news',
            articles: [] // Return empty array to prevent frontend crash
        });
    }
});

module.exports = router;

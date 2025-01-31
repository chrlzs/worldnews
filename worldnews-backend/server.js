require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// News API Route
app.get('/news', async (req, res) => {
    try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                apiKey: process.env.NEWS_API_KEY,
                country: 'us'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
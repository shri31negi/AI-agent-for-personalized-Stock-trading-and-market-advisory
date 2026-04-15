const analyzeSentiment = async (headline) => {
    return {
        sentiment: "neutral",
        recommendation: "HOLD",
        impact: "Analysis Pending..."
    };
};

exports.getMarketNews = async (req, res) => {
    try {
        const { symbol } = req.query;
        let url = `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_API_KEY}`;
        
        // If searching a specific stock, try to get company news
        if (symbol) {
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const to = today.toISOString().split('T')[0];
            const from = lastWeek.toISOString().split('T')[0];
            url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Finnhub API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure data is array (in case of API rate limit errors returning objects)
        if (!Array.isArray(data)) {
            throw new Error('Invalid response from Finnhub');
        }

        // Finnhub returns an array: { category, datetime, headline, id, image, source, summary, url }
        const mappedNews = data.slice(0, 10).map(item => ({
            id: String(item.id),
            title: item.headline,
            summary: item.summary,
            source: item.source,
            timestamp: new Date(item.datetime * 1000).toLocaleString(),
            link: item.url,
            sentiment: 'neutral'
        }));

        res.json(mappedNews);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
};

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
        
        // Mock news data for now
        const mockNews = [
            {
                id: '1',
                title: 'Market Rally Continues as Tech Stocks Surge',
                summary: 'Major tech companies lead market gains',
                source: 'Financial Times',
                timestamp: new Date().toLocaleString(),
                link: '#',
                sentiment: 'positive'
            },
            {
                id: '2',
                title: 'Federal Reserve Maintains Interest Rates',
                summary: 'Fed keeps rates steady amid economic uncertainty',
                source: 'Reuters',
                timestamp: new Date().toLocaleString(),
                link: '#',
                sentiment: 'neutral'
            },
            {
                id: '3',
                title: 'Oil Prices Fluctuate on Global Supply Concerns',
                summary: 'Energy sector sees volatility',
                source: 'Bloomberg',
                timestamp: new Date().toLocaleString(),
                link: '#',
                sentiment: 'neutral'
            }
        ];

        res.json(mockNews);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
};

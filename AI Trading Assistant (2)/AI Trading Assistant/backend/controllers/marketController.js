const aiIntegrationService = require('../services/aiIntegrationService');

exports.getTrendingStocks = async (req, res) => {
    try {
        const result = await aiIntegrationService.getMarketDataAction('trending');
        if (result.success) {
            res.json(result.data);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error fetching trending stocks:', error);
        res.status(500).json({ error: 'Failed to fetch trending stocks' });
    }
};

exports.getStockQuote = async (req, res) => {
    try {
        const { symbol } = req.params;
        const result = await aiIntegrationService.getMarketDataAction('quote', symbol);
        
        if (result.success && !result.data.error) {
            res.json(result.data);
        } else {
            // Provide a fallback or return the error
            res.status(404).json({ error: `Could not find data for ${symbol}` });
        }
    } catch (error) {
        console.error('Error fetching stock quote:', error);
        res.status(500).json({ error: 'Failed to fetch stock quote' });
    }
};

exports.searchStocks = async (req, res) => {
    try {
        const { query } = req.query;
        // For search, use regex for flexible ticker formats like RELIANCE.NS
        if (/^[A-Z]{1,10}(\.(NS|BO))?$/.test(query.toUpperCase())) {
            const result = await aiIntegrationService.getMarketDataAction('quote', query.toUpperCase());
            if (result && result.success && !result.data.error) {
                return res.json([result.data]);
            }
        }
        
        // Default search logic
        res.json([]);
    } catch (error) {
        console.error('Error searching stocks:', error);
        res.status(500).json({ error: 'Failed to search stocks' });
    }
};

exports.getStockHistory = async (req, res) => {
    try {
        const { symbol } = req.params;
        const { period = '1mo' } = req.query;
        const result = await aiIntegrationService.getMarketDataAction('history', symbol, period);
        
        if (result.success && !result.data.error) {
            // Transform history to the format expected by Recharts
            const history = result.data.history;
            const formattedHistory = history.dates.map((date, index) => ({
                date,
                price: history.close[index],
                open: history.open[index],
                high: history.high[index],
                low: history.low[index],
                volume: history.volume[index]
            }));
            res.json(formattedHistory);
        } else {
            res.status(404).json({ error: `Could not find history for ${symbol}` });
        }
    } catch (error) {
        console.error('Error fetching stock history:', error);
        res.status(500).json({ error: 'Failed to fetch stock history' });
    }
};

exports.getStockTechnicals = async (req, res) => {
    try {
        const { symbol } = req.params;
        const result = await aiIntegrationService.getMarketDataAction('technicals', symbol);
        
        if (result && result.success && !result.error) {
            res.json(result.data);
        } else {
            console.error('Technicals action returned error:', result.error);
            res.status(404).json({ error: `Could not calculate technicals for ${symbol}` });
        }
    } catch (error) {
        console.error('Error fetching technicals:', error);
        res.status(500).json({ error: 'Failed to fetch technical analysis' });
    }
};

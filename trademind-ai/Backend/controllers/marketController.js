import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

// List of predefined trending stocks to mimic the old mockData
const TRENDING_SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'AMZN'];

// Helper to map Yahoo Finance quote to our frontend Stock interface
const mapQuoteToStock = (quote) => {
    return {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        pe: quote.forwardPE || quote.trailingPE,
        sector: quote.sector || "Technology" // Yahoo Finance quote doesn't always include sector directly unless using quoteSummary, so we fallback
    };
};

export const getTrendingStocks = async (req, res) => {
    try {
        const quotes = await yahooFinance.quote(TRENDING_SYMBOLS);
        const stocks = quotes.map(mapQuoteToStock);
        res.json(stocks);
    } catch (error) {
        console.error("Error fetching trending stocks:", error);
        res.status(500).json({ error: "Failed to fetch market data" });
    }
};

export const getStockQuote = async (req, res) => {
    try {
        const { symbol } = req.params;
        const quote = await yahooFinance.quote(symbol);
        
        if (!quote) {
            return res.status(404).json({ error: "Stock not found" });
        }

        const stock = mapQuoteToStock(quote);
        res.json(stock);
    } catch (error) {
        console.error(`Error fetching quote for ${req.params.symbol}:`, error);
        res.status(500).json({ error: "Failed to fetch stock quote" });
    }
};

export const getMultipleQuotes = async (req, res) => {
    try {
        const { symbols } = req.query;
        if (!symbols) {
            return res.status(400).json({ error: "No symbols provided" });
        }
        
        const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
        const quotes = await yahooFinance.quote(symbolArray);
        
        const stocks = quotes.map(mapQuoteToStock);
        res.json(stocks);
    } catch (error) {
        console.error(`Error fetching multiple quotes:`, error);
        res.status(500).json({ error: "Failed to fetch quotes" });
    }
};

export const getStockHistory = async (req, res) => {
    try {
        const { symbol } = req.params;
        const { timeframe = '1M' } = req.query;

        let period1 = new Date();
        let interval = '1d';

        switch(timeframe) {
            case '1D':
                // For 1D, go back 2 or 3 days to guarantee market open data, using 15m intervals
                period1.setDate(period1.getDate() - 2);
                interval = '15m';
                break;
            case '1W':
                period1.setDate(period1.getDate() - 7);
                interval = '60m';
                break;
            case '1M':
                period1.setMonth(period1.getMonth() - 1);
                interval = '1d';
                break;
            case '3M':
                period1.setMonth(period1.getMonth() - 3);
                interval = '1d';
                break;
            case '1Y':
                period1.setFullYear(period1.getFullYear() - 1);
                interval = '1wk';
                break;
            default:
                period1.setMonth(period1.getMonth() - 1);
        }

        const queryOptions = {
            period1: period1.toISOString().split('T')[0],
            interval
        };

        const chartResult = await yahooFinance.chart(symbol, queryOptions);
        
        if (!chartResult || !chartResult.quotes || chartResult.quotes.length === 0) {
            return res.json([]);
        }

        const history = chartResult.quotes
            .filter(q => q.close !== null)
            .map(q => ({
                date: q.date.toISOString(),
                price: parseFloat(q.close.toFixed(2)),
                volume: q.volume || 0
            }));

        res.json(history);
    } catch (error) {
        console.error(`Error fetching history for ${req.params.symbol}:`, error.message);
        res.status(500).json({ error: "Failed to fetch historical data" });
    }
};

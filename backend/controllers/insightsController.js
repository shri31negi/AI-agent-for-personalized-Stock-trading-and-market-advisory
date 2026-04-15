const aiIntegrationService = require('../services/aiIntegrationService');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1/models';

// Try models in order of preference (verified available for this API key)
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function callGemini(prompt) {
    for (const model of MODELS) {
        try {
            const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                })
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                console.warn(`Model ${model} failed (${res.status}):`, errBody?.error?.message);
                continue; // try next model
            }

            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return { text, model };
        } catch (err) {
            console.warn(`Model ${model} threw error:`, err.message);
        }
    }
    throw new Error('All Gemini models failed or quota exhausted');
}

exports.getAIInsights = async (req, res) => {
    try {
        // Step 1: Fetch live market data via the Python/yfinance service
        let stockData = [];
        try {
            const result = await aiIntegrationService.getMarketDataAction('trending');
            if (result.success && Array.isArray(result.data)) {
                // Pick top 5 stocks with valid prices
                stockData = result.data
                    .filter(s => s.price && s.changePercent !== undefined)
                    .slice(0, 5)
                    .map(s => ({
                        symbol: s.symbol,
                        name: s.name,
                        price: s.price,
                        changePercent: parseFloat(s.changePercent).toFixed(2),
                        volume: s.volume,
                        sector: s.sector,
                        pe: s.pe_ratio,
                        beta: s.beta,
                        volatility: s.volatility ? (s.volatility * 100).toFixed(1) : null
                    }));
            }
        } catch (err) {
            console.warn('Could not fetch live market data for insights, using fallback:', err.message);
        }

        // Fallback if data fetch failed
        if (stockData.length === 0) {
            stockData = [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 175, changePercent: '0.68', sector: 'Technology' },
                { symbol: 'NVDA', name: 'NVIDIA', price: 726, changePercent: '2.17', sector: 'Technology' },
                { symbol: 'TSLA', name: 'Tesla', price: 181, changePercent: '-1.87', sector: 'Automotive' }
            ];
        }

        // Step 2: Build the Gemini prompt with real data
        const stockSummary = stockData
            .map(s => `${s.symbol} (${s.name}): Price $${s.price}, Change ${s.changePercent}%, Sector: ${s.sector}${s.volatility ? ', Volatility: ' + s.volatility + '%' : ''}${s.pe ? ', P/E: ' + s.pe : ''}`)
            .join('\n');

        const prompt = `You are a professional stock market AI analyst. Based on the following REAL-TIME market data from today, generate exactly 4 actionable market insights in JSON format.

LIVE MARKET DATA:
${stockSummary}

Generate a JSON array with exactly 4 insights. Each insight must have:
- "id": string (1, 2, 3, 4)
- "type": one of "opportunity", "warning", "tip", "alert"
- "title": short punchy title (max 6 words)
- "message": 2-3 sentence analysis that references specific stocks and their actual prices/changes from the data above. Be specific and actionable.
- "stocks": array of stock symbols mentioned (can be empty)

Use each type exactly once. Make the insights genuinely useful based on the actual numbers provided. Reference real prices and percentage changes.

Respond ONLY with valid JSON array, no markdown, no explanation.`;

        // Step 3: Call Gemini API via REST
        const { text, model: usedModel } = await callGemini(prompt);
        console.log(`Gemini insights generated using model: ${usedModel}`);

        // Step 4: Parse and validate the response
        let insights;
        try {
            // Strip any markdown code fences if present
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            insights = JSON.parse(cleaned);

            // Validate structure
            if (!Array.isArray(insights) || insights.length === 0) {
                throw new Error('Invalid insights format');
            }

            // Ensure required fields
            insights = insights.map((item, idx) => ({
                id: item.id || String(idx + 1),
                type: item.type || 'tip',
                title: item.title || 'Market Update',
                message: item.message || 'No analysis available.',
                timestamp: 'Just now',
                stocks: Array.isArray(item.stocks) ? item.stocks : []
            }));

        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text);
            throw new Error('AI returned invalid JSON');
        }

        res.json({ success: true, insights, generatedAt: new Date().toISOString() });

    } catch (error) {
        console.error('Error generating AI insights:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to generate AI insights',
            details: error.message
        });
    }
};

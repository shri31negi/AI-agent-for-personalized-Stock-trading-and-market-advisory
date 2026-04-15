const InvestorProfile = require('../models/InvestorProfile');
const GuestSession = require('../models/GuestSession');
const aiIntegrationService = require('../services/aiIntegrationService');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1/models';

// Try models in order of preference
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

exports.savePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profile, portfolio, session_id } = req.body;

    // Check if profile already exists
    let investorProfile = await InvestorProfile.findOne({ user_id: userId });

    if (investorProfile) {
      // Update existing profile
      investorProfile.profile = profile;
      investorProfile.portfolio = portfolio;
      investorProfile.updated_at = Date.now();
    } else {
      // Create new profile
      investorProfile = new InvestorProfile({
        user_id: userId,
        profile,
        portfolio,
        from_guest_session: !!session_id
      });
    }

    await investorProfile.save();

    // If from guest session, mark as merged
    if (session_id) {
      await GuestSession.findOneAndUpdate(
        { session_id },
        { 
          merged_to_user: true,
          user_id: userId
        }
      );
    }

    res.json({
      success: true,
      message: 'Portfolio saved successfully',
      profile: investorProfile
    });

  } catch (error) {
    console.error('Save portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save portfolio'
    });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const investorProfile = await InvestorProfile.findOne({ user_id: userId });

    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    res.json({
      success: true,
      profile: investorProfile.profile,
      portfolio: investorProfile.portfolio,
      created_at: investorProfile.created_at,
      updated_at: investorProfile.updated_at
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve portfolio'
    });
  }
};

exports.updatePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profile, portfolio } = req.body;

    const investorProfile = await InvestorProfile.findOne({ user_id: userId });

    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    if (profile) investorProfile.profile = profile;
    if (portfolio) investorProfile.portfolio = portfolio;
    investorProfile.updated_at = Date.now();

    await investorProfile.save();

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      profile: investorProfile
    });

  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update portfolio'
    });
  }
};

exports.deletePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    await InvestorProfile.findOneAndDelete({ user_id: userId });

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete portfolio'
    });
  }
};

exports.getGuestRecommendations = async (req, res) => {
  try {
    const { holdings } = req.body;
    
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return res.json({
        success: true,
        recommendations: [
          {
            id: "1",
            type: "tip",
            title: "Build Your Portfolio",
            message: "Add some stocks to your portfolio to get personalized AI recommendations.",
            timestamp: "Just now",
            stocks: []
          }
        ]
      });
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);

    // Fetch predictive ML insights (LSTM/ARIMA) from Python backend for each holding
    const enrichedHoldings = await Promise.all(holdings.map(async (h) => {
      try {
        const mlData = await aiIntegrationService.getPrediction(h.symbol, 'lstm');
        if (mlData && mlData.success && mlData.prediction) {
          return {
            ...h,
            mlPredictedPrice: mlData.prediction.prediction,
            mlConfidence: mlData.prediction.confidence
          };
        }
      } catch (err) {
        console.warn(`Could not fetch ML prediction for ${h.symbol}`);
      }
      return h;
    }));

    const portfolioSummary = enrichedHoldings
      .map(h => {
        let text = `${h.symbol}: ${h.shares} shares @ $${h.avgCost.toFixed(2)} (Current: $${h.currentPrice.toFixed(2)}, Value: $${h.totalValue.toFixed(2)}, Gain/Loss: ${h.gainLossPercent.toFixed(2)}%)`;
        if (h.mlPredictedPrice) {
          text += ` | LSTM Predicted Next Price: $${h.mlPredictedPrice.toFixed(2)}`;
        }
        return text;
      })
      .join('\n');

    const prompt = `Analyze the user's portfolio and provide clear BUY, SELL, or HOLD recommendations for each stock.

User Portfolio (Total Value: $${totalValue.toFixed(2)}):
${portfolioSummary}

Instructions:
1. For each stock in the portfolio, decide exactly one action: BUY, SELL, or HOLD
2. Base your decision on:
   - Current price vs user's average purchase price
   - The algorithmic LSTM Predicted Next Price.
   - Any logical assumptions about RSI, MACD trend, 50-day moving average, or recent market news if known for those specific symbols.
3. Combine all factors logically before making a decision.
4. Avoid overly aggressive or risky suggestions.
5. Keep each explanation concise (2–4 sentences) and write in a natural, human-like tone (not robotic).
6. Do not include disclaimers.

We need exactly one insight per stock in the user's portfolio. Output format must be a strictly valid JSON array (NO MARKDOWN or plain text). Each object in the array must look like this:
{
  "id": "1",
  "title": "<symbol> - BUY / SELL / HOLD",
  "type": "opportunity" (if BUY), "warning" (if SELL), or "tip" (if HOLD),
  "message": "<clear and concise explanation>",
  "stocks": ["<symbol>"]
}`;

    try {
      const { text, model: usedModel } = await callGemini(prompt);
      console.log(`Gemini portfolio recommendations generated using model: ${usedModel}`);

      // Parse and validate the response
      let recommendations;
      try {
          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          recommendations = JSON.parse(cleaned);

          if (!Array.isArray(recommendations) || recommendations.length === 0) {
              throw new Error('Invalid insights format');
          }

          recommendations = recommendations.map((item, idx) => ({
              id: item.id || String(idx + 1),
              type: item.type || 'tip',
              title: item.title || 'Portfolio Update',
              message: item.message || 'No analysis available.',
              timestamp: 'Just now',
              stocks: Array.isArray(item.stocks) ? item.stocks : []
          }));

      } catch (parseError) {
          console.error('Failed to parse Gemini response:', text);
          throw new Error('AI returned invalid JSON');
      }

      res.json({ success: true, recommendations, generatedAt: new Date().toISOString() });
    } catch (apiError) {
      console.warn('Gemini API exhausted or failed. Using logical fallback strategy.', apiError.message);
      
      // Fallback: Generate logical recommendations based on Math alone without LLM
      const fallbackRecommendations = enrichedHoldings.map((h, idx) => {
        let action = 'HOLD';
        let type = 'tip';
        let reason = `Hold ${h.symbol}. Current price $${h.currentPrice.toFixed(2)} is stable compared to your cost basis.`;
        
        if (h.gainLossPercent < -10) {
          action = 'BUY';
          type = 'opportunity';
          reason = `Current price is significantly below your average cost of $${h.avgCost.toFixed(2)}. This is an opportunity to average down.`;
        } else if (h.mlPredictedPrice && h.mlPredictedPrice < h.currentPrice) {
          action = 'SELL';
          type = 'warning';
          reason = `LSTM Model predicts a short-term drop to $${h.mlPredictedPrice.toFixed(2)}. You are currently up ${h.gainLossPercent.toFixed(2)}%. Consider taking profits.`;
        } else if (h.gainLossPercent > 15) {
          action = 'SELL';
          type = 'warning';
          reason = `You have strong unrealized gains of ${h.gainLossPercent.toFixed(2)}%. Recommendation to SELL some exposure to lock in profits.`;
        }

        return {
          id: String(idx + 1),
          title: `${h.symbol} - ${action}`,
          type: type,
          message: reason,
          timestamp: 'Just now',
          stocks: [h.symbol]
        };
      });

      res.json({ success: true, recommendations: fallbackRecommendations, generatedAt: new Date().toISOString(), fallback: true });
    }

  } catch (error) {
    console.error('Error generating AI portfolio recommendations:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI recommendations',
      details: error.message
    });
  }
};


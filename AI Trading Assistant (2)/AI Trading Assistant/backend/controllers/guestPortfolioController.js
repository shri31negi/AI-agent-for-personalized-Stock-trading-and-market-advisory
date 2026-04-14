const GuestSession = require('../models/GuestSession');
const aiService = require('../services/aiIntegrationService');
const { v4: uuidv4 } = require('uuid');

exports.buildPortfolio = async (req, res) => {
  try {
    const { age, monthly_income, investment_amount, risk_preference, investment_horizon, financial_goal } = req.body;

    // Validate input
    if (!age || !monthly_income || !investment_amount || !risk_preference || !investment_horizon) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate ranges
    if (age < 18 || age > 100) {
      return res.status(400).json({
        success: false,
        error: 'Age must be between 18 and 100'
      });
    }

    if (investment_amount < 1000) {
      return res.status(400).json({
        success: false,
        error: 'Minimum investment amount is $1,000'
      });
    }

    if (!['low', 'medium', 'high'].includes(risk_preference)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid risk preference'
      });
    }

    // Map input to AI service format
    const profileData = aiService.mapInputToProfileData({
      age,
      monthly_income,
      investment_amount,
      risk_preference,
      investment_horizon,
      financial_goal
    });

    // Call AI profiling service
    const profileResult = await aiService.buildUserProfile(profileData);

    if (!profileResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate profile'
      });
    }

    const profile = profileResult.profile;

    // Get market data
    const marketData = await aiService.getMarketData();

    // Generate portfolio recommendation
    const recommendationResult = await aiService.generateRecommendation(
      profile,
      marketData,
      investment_amount
    );

    if (!recommendationResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate recommendation'
      });
    }

    const portfolio = recommendationResult.recommendation;

    // Generate session ID
    const session_id = uuidv4();

    // Save guest session
    const guestSession = new GuestSession({
      session_id,
      profile,
      portfolio,
      input_data: {
        age,
        monthly_income,
        investment_amount,
        risk_preference,
        investment_horizon,
        financial_goal
      }
    });

    await guestSession.save();

    // Return response
    res.json({
      success: true,
      session_id,
      profile: {
        risk_score: profile.risk_score,
        stability_score: profile.stability_score,
        discipline_score: profile.discipline_score,
        profile_type: profile.profile_type,
        characteristics: profile.characteristics
      },
      portfolio: {
        allocation: portfolio.allocation,
        selected_stocks: portfolio.selected_stocks.slice(0, 5),
        strategy: {
          name: portfolio.strategy.strategy_name,
          approach: portfolio.strategy.approach,
          rebalancing: portfolio.strategy.rebalancing_frequency
        },
        recommended_actions: portfolio.action_plan.recommended_actions
      },
      top_stocks: portfolio.selected_stocks.slice(0, 5).map(stock => ({
        symbol: stock.symbol,
        score: stock.recommendation_score,
        risk_level: stock.risk_level
      }))
    });

  } catch (error) {
    console.error('Build portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

exports.getGuestSession = async (req, res) => {
  try {
    const { session_id } = req.params;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }

    const session = await GuestSession.findOne({ 
      session_id,
      merged_to_user: false,
      expires_at: { $gt: new Date() }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    res.json({
      success: true,
      profile: session.profile,
      portfolio: session.portfolio,
      input_data: session.input_data,
      created_at: session.created_at,
      expires_at: session.expires_at
    });

  } catch (error) {
    console.error('Get guest session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

exports.refreshSession = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }

    const session = await GuestSession.findOne({ session_id });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Extend expiration by 24 hours
    session.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await session.save();

    res.json({
      success: true,
      message: 'Session refreshed',
      expires_at: session.expires_at
    });

  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

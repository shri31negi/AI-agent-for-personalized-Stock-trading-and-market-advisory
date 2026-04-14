const InvestorProfile = require('../models/InvestorProfile');
const GuestSession = require('../models/GuestSession');

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

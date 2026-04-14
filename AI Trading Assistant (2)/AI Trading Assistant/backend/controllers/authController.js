const User = require('../models/userModel');
const InvestorProfile = require('../models/InvestorProfile');
const GuestSession = require('../models/GuestSession');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { name, email, password, session_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // If session_id provided, merge guest portfolio
    if (session_id) {
      await mergeGuestSession(session_id, user._id);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      portfolio_merged: !!session_id
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, session_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // If session_id provided, merge guest portfolio
    let portfolioMerged = false;
    if (session_id) {
      portfolioMerged = await mergeGuestSession(session_id, user._id);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      portfolio_merged: portfolioMerged
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

async function mergeGuestSession(session_id, user_id) {
  try {
    const guestSession = await GuestSession.findOne({
      session_id,
      merged_to_user: false,
      expires_at: { $gt: new Date() }
    });

    if (!guestSession) {
      return false;
    }

    // Check if user already has a profile
    let investorProfile = await InvestorProfile.findOne({ user_id });

    if (investorProfile) {
      // Update existing profile
      investorProfile.profile = guestSession.profile;
      investorProfile.portfolio = guestSession.portfolio;
      investorProfile.updated_at = Date.now();
    } else {
      // Create new profile
      investorProfile = new InvestorProfile({
        user_id,
        profile: guestSession.profile,
        portfolio: guestSession.portfolio,
        from_guest_session: true
      });
    }

    await investorProfile.save();

    // Mark guest session as merged
    guestSession.merged_to_user = true;
    guestSession.user_id = user_id;
    await guestSession.save();

    return true;
  } catch (error) {
    console.error('Merge guest session error:', error);
    return false;
  }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

const mongoose = require('mongoose');

const investorProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profile: {
    risk_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    stability_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    discipline_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    profile_type: {
      type: String,
      required: true,
      enum: ['Conservative', 'Cautious', 'Moderate', 'Balanced', 'Aggressive', 'Speculative']
    },
    characteristics: {
      risk_tolerance: String,
      recommended_allocation: Object,
      max_position_size: Number,
      preferred_assets: [String],
      trading_frequency: String,
      description: String
    },
    metadata: {
      age: Number,
      monthly_income: Number,
      investment_amount: Number,
      risk_preference: String,
      investment_horizon: String,
      financial_goal: String,
      experience_years: Number,
      portfolio_value: Number
    }
  },
  portfolio: {
    allocation: Object,
    selected_stocks: Array,
    positions: Array,
    strategy: Object,
    action_plan: Object
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  from_guest_session: {
    type: Boolean,
    default: false
  }
});

investorProfileSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('InvestorProfile', investorProfileSchema);

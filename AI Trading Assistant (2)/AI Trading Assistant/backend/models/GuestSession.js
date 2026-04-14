const mongoose = require('mongoose');

const guestSessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  profile: {
    risk_score: Number,
    stability_score: Number,
    discipline_score: Number,
    profile_type: String,
    characteristics: Object,
    metadata: Object
  },
  portfolio: {
    allocation: Object,
    selected_stocks: Array,
    positions: Array,
    strategy: Object,
    action_plan: Object
  },
  input_data: {
    age: Number,
    monthly_income: Number,
    investment_amount: Number,
    risk_preference: String,
    investment_horizon: String,
    financial_goal: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  merged_to_user: {
    type: Boolean,
    default: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

// Auto-delete expired sessions
guestSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GuestSession', guestSessionSchema);

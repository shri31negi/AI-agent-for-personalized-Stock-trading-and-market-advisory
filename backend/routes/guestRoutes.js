const express = require('express');
const router = express.Router();
const guestPortfolioController = require('../controllers/guestPortfolioController');

// Build portfolio for guest user
router.post('/build-portfolio', guestPortfolioController.buildPortfolio);

// Get guest session data
router.get('/session/:session_id', guestPortfolioController.getGuestSession);

// Refresh guest session
router.post('/refresh-session', guestPortfolioController.refreshSession);

module.exports = router;

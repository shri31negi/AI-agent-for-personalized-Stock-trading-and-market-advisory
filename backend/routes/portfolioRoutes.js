const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Save portfolio
router.post('/save', portfolioController.savePortfolio);

// Get user portfolio
router.get('/', portfolioController.getPortfolio);

// Update portfolio
router.put('/update', portfolioController.updatePortfolio);

// Delete portfolio
router.delete('/', portfolioController.deletePortfolio);

module.exports = router;

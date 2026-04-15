const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');

// GET /api/insights - Generate live AI insights using Gemini
router.get('/', insightsController.getAIInsights);

module.exports = router;

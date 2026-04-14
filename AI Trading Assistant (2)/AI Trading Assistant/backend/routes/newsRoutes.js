const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Get market news
router.get('/', newsController.getMarketNews);

module.exports = router;

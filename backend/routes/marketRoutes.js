const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.get('/trending', marketController.getTrendingStocks);
router.get('/quote/:symbol', marketController.getStockQuote);
router.get('/history/:symbol', marketController.getStockHistory);
router.get('/technicals/:symbol', marketController.getStockTechnicals);
router.get('/search', marketController.searchStocks);

module.exports = router;

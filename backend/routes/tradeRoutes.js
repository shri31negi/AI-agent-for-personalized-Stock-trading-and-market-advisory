const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', tradeController.createTrade);
router.get('/', tradeController.getTrades);
router.get('/stats', tradeController.getTradeStats);

module.exports = router;

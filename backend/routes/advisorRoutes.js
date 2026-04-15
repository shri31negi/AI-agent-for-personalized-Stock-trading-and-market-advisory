const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');

// POST /api/advisor/chat — Real-time free-form AI advisor chat
router.post('/chat', advisorController.chatWithAdvisor);

module.exports = router;

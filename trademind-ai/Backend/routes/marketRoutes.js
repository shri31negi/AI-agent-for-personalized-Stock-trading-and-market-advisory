import express from "express";
import { getTrendingStocks, getStockHistory, getStockQuote, getMultipleQuotes } from "../controllers/marketController.js";

const router = express.Router();

// Get predefined trending stocks
router.get("/trending", getTrendingStocks);

// Get specific stock quote
router.get("/quote/:symbol", getStockQuote);

// Get bulk stock quotes
router.get("/quotes", getMultipleQuotes);

// Get historical chart data
router.get("/history/:symbol", getStockHistory);

export default router;

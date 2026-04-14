# TradeMind Diagnostic Report
Generated: 2026-04-14 (Diagnostic Run)

## Executive Summary
Comprehensive diagnostic of Node.js + Python AI stock trading application. 10 checks performed covering dependencies, model files, API performance, timeout handling, and feature completeness.

---

## Diagnostic Results Table

| # | Check | Result | Root Cause |
|---|-------|--------|------------|
| 1 | Python dependencies | ⚠️ WARNING | TensorFlow broken (protobuf conflict), Prophet missing |
| 2 | Trained model files | ❌ FAIL | No .h5/.pkl files found - trained_models/ directory missing |
| 3 | Single quote (AAPL) | ✅ PASS | 8.42s, price=259.2 USD returned correctly |
| 4 | Trending stocks timing | ✅ PASS | 7.4s for 9 stocks (including NSE tickers) |
| 5 | Prediction (LSTM) | ⚠️ WARNING | Returns data but uses fallback heuristics (LSTM_fallback) |
| 6 | Technical indicators | ❌ FAIL | Hardcoded RSI=55.5, never calls technical_indicators.py |
| 7 | Node.js timeout coverage | ❌ FAIL | getPrediction() and getMarketDataAction() missing timeouts |
| 8 | Recommendation flow | ✅ PASS | Filters NVDA correctly, returns valid allocation |
| 9 | NSE ticker support | ✅ PASS | RELIANCE.NS, TCS.NS, INFY.NS all return INR prices |
| 10 | Search endpoint | ❌ FAIL | NSE tickers blocked by length check (query.length <= 5) |

---

## Detailed Findings

### CHECK 1 — Python Environment & Dependencies
**Status:** ⚠️ WARNING

**Findings:**
- Python 3.13.5 installed ✅
- yfinance 1.2.1 installed ✅
- numpy installed ✅
- pandas 3.0.2 installed ✅
- statsmodels 0.14.6 installed ✅
- TensorFlow 2.21.0 installed but BROKEN ❌
  - Error: `ImportError: cannot import name 'runtime_version' from 'google.protobuf'`
  - Protobuf version incompatibility with TensorFlow
- Prophet NOT installed ❌
  - Error: `ModuleNotFoundError: No module named 'prophet'`

**Impact:**
- LSTM model will always use fallback (no TensorFlow)
- Prophet model will fail to load
- Only ARIMA model can function properly

**Required packages missing from requirements.txt:**
- `yfinance` (critical - used but not listed)
- `prophet` (optional - for Prophet model)
- `statsmodels` (critical - for ARIMA)

---

### CHECK 2 — Trained Model Files
**Status:** ❌ FAIL

**Findings:**
- `trained_models/` directory does not exist
- No `.h5` files found (LSTM model)
- No `.pkl` files found (ARIMA/Prophet models)

**Expected paths (from model_loader.py line 14-16):**
```
ai_integration/trained_models/lstm_model.h5
ai_integration/trained_models/arima_model.pkl
ai_integration/trained_models/prophet_model.pkl
```

**Impact:**
All models fall back to heuristics:
- LSTM: returns `last_price * 1.02` (hardcoded 2% increase)
- ARIMA: extrapolates short linear trend
- Prophet: uses exponential smoothing

**Evidence from test output:**
```json
"model_type": "LSTM_fallback"
"model_type": "ARIMA_fallback"
"model_type": "Prophet_fallback"
```

---

### CHECK 3 — Single Stock Quote (yfinance end-to-end)
**Status:** ✅ PASS

**Findings:**
- Exit code: 0
- Response time: 8.42s
- Price returned: 259.2 USD
- All fields populated correctly (name, change, volume, marketCap, etc.)

**Sample output:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 259.2,
  "change": -1.28,
  "changePercent": -0.4914,
  "currency": "USD",
  "volatility": 0.237,
  "beta": 1.109
}
```

---

### CHECK 4 — Trending Stocks: Sequential Fetch Timing
**Status:** ✅ PASS

**Findings:**
- Time: 7.4s for 9 stocks
- All 9 stocks returned successfully
- Symbols: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, RELIANCE.NS, TCS.NS, INFY.NS
- No errors in individual stocks
- Well under 20s threshold

**Note:** Performance is good. The concern about sequential fetching causing slowdowns is not manifesting in current tests. However, under high load or network latency, this could become an issue.

---

### CHECK 5 — Prediction Pipeline (Model Fallback Detection)
**Status:** ⚠️ WARNING

**Findings:**
- Predictions return successfully
- BUT: All models use fallback heuristics
- LSTM test: outer `model_type: "lstm"` but details show `"LSTM_fallback"`
- Ensemble test: all three models show fallback variants

**Evidence:**
```json
{
  "model_type": "lstm",
  "details": {
    "model_type": "LSTM_fallback",
    "confidence": 0.65
  }
}
```

**Root cause:** No trained model files (see CHECK 2)

**Impact:** 
- Predictions are not ML-based, just simple heuristics
- LSTM: last_price * 1.02
- Confidence scores are fake (hardcoded 0.65, 0.75)

---

### CHECK 6 — Technical Indicators: Wired vs. Hardcoded
**Status:** ❌ FAIL

**Findings:**

**6a - Hardcoding confirmed in marketController.js (line 98):**
```javascript
res.json({
    rsi: 55.5, // Fallback values
    ma50: lastPrice * 0.98,
    ma200: lastPrice * 0.95,
    volatility: 25.0,
    beta: 1.1,
    prediction: techResult.success ? techResult.prediction.prediction : lastPrice * 1.05
});
```

**6b - technical_indicators.py is NEVER called:**
- `get_technical_analysis()` is defined in `prediction_service.py` (line 96)
- It's imported in `main.py` (line 13)
- BUT: No action handler for it in `main.py`
- No `action: 'technicals'` case in the routing logic
- marketController calls `getPrediction()` instead, which doesn't calculate indicators

**6c - technical_indicators.py works correctly when tested directly:**
```
RSI (last): 48.12
MACD (last): -0.3277
SMA-20 (last): 140.59
```

**Root cause:** 
1. No action handler in main.py for technical analysis
2. marketController.js doesn't call the right endpoint
3. Hardcoded values used as "fallback" but never replaced

---

### CHECK 7 — Node.js Timeout Coverage
**Status:** ❌ FAIL

**Findings:**

**Methods WITH timeout (30s):**
- `buildUserProfile()` - line 48-52 ✅
- `generateRecommendation()` - line 97-101 ✅

**Methods WITHOUT timeout:**
- `getMarketDataAction()` - NO TIMEOUT ❌
- `getPrediction()` - NO TIMEOUT ❌

**Impact:**
- If Python process hangs on market data fetch or prediction, the Node.js request handler will wait indefinitely
- Express server can accumulate hung connections
- No automatic cleanup of zombie Python processes

**Evidence from aiIntegrationService.js:**
- Lines 154-199: `getMarketDataAction()` - no setTimeout block
- Lines 201-246: `getPrediction()` - no setTimeout block

---

### CHECK 8 — Recommendation Flow (Data Input Quality)
**Status:** ✅ PASS

**Findings:**
- Selected stocks: MSFT, AAPL (correctly filtered out NVDA)
- NVDA excluded due to high volatility (0.45) and beta (1.9) for Moderate profile
- Recommendation scores calculated: MSFT=5.1, AAPL=4.2
- Allocation: 60% stocks, 30% bonds, 10% cash
- Strategy: "Growth & Income" with appropriate risk management

**Risk filtering working correctly:**
- NVDA risk_level: 45 (too high for Moderate profile)
- MSFT risk_level: 25 (acceptable)
- AAPL risk_level: 32 (acceptable)

---

### CHECK 9 — Indian Stock Ticker Support (NSE)
**Status:** ✅ PASS

**Findings:**
All NSE tickers return correct data:
```
RELIANCE.NS: price=1315.1, currency=INR, error=None
TCS.NS: price=2472.6, currency=INR, error=None
INFY.NS: price=1276.8, currency=INR, error=None
```

**Notes:**
- Currency correctly identified as INR
- Prices in correct range for Indian market
- No field mapping issues (yfinance handles NSE tickers properly)

---

### CHECK 10 — Stock Search Endpoint Logic
**Status:** ❌ FAIL

**Findings from marketController.js line 40:**
```javascript
if (query.length <= 5 && /^[A-Z.]+$/.test(query.toUpperCase())) {
```

**Test results:**
```
'AAPL' -> would attempt lookup: true ✅
'apple' -> would attempt lookup: true ✅ (passes after toUpperCase)
'TCS.NS' -> would attempt lookup: false ❌ (length=6)
'reliance' -> would attempt lookup: false ❌ (length=8)
'MSFT' -> would attempt lookup: true ✅
'RELIANCE.NS' -> would attempt lookup: false ❌ (length=11)
```

**Root cause:**
- `query.length <= 5` check blocks ALL NSE tickers
- NSE tickers require `.NS` suffix (minimum 6 chars: `X.NS`)
- Most NSE tickers are 7-13 characters long

**Impact:**
- Users cannot search for Indian stocks by symbol
- Company name searches also blocked (e.g., "reliance")

---

## Critical Fixes Required (Priority Order)

### Fix 1 — Add Timeouts to Missing Methods
**Priority:** CRITICAL (Security/Stability)
**File:** `backend/services/aiIntegrationService.js`
**Lines:** 154-199 (getMarketDataAction), 201-246 (getPrediction)

**Problem:** No timeout protection on two Python spawn calls. Hung Python processes will block Express indefinitely.

**Diff for getMarketDataAction():**
```diff
      python.on('close', (code) => {
        if (code === 0 && result) {
          try {
            const parsed = JSON.parse(result);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Failed to parse AI response'));
          }
        } else {
          reject(new Error(error || 'AI service failed'));
        }
      });
+
+      setTimeout(() => {
+        python.kill();
+        reject(new Error('AI service timeout'));
+      }, 30000);
    });
  }
```

**Diff for getPrediction():**
```diff
      python.on('close', (code) => {
        if (code === 0 && result) {
          try {
            const parsed = JSON.parse(result);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Failed to parse AI response'));
          }
        } else {
          reject(new Error(error || 'AI service failed'));
        }
      });
+
+      setTimeout(() => {
+        python.kill();
+        reject(new Error('AI service timeout'));
+      }, 30000);
    });
  }
```

---

### Fix 2 — Fix Search Endpoint to Support NSE Tickers
**Priority:** HIGH (Feature Broken)
**File:** `backend/controllers/marketController.js`
**Line:** 40

**Problem:** Length check blocks all NSE tickers (6+ chars)

**Diff:**
```diff
exports.searchStocks = async (req, res) => {
    try {
        const { query } = req.query;
-       // For search, we can still use a limited set or a search API if available
-       // For now, let's use the quote action if they search for a specific symbol
-       if (query.length <= 5 && /^[A-Z.]+$/.test(query.toUpperCase())) {
+       // Support both US tickers (1-5 chars) and NSE tickers (with .NS/.BO suffix)
+       const upperQuery = query.toUpperCase();
+       const isValidSymbol = /^[A-Z]{1,10}(\.(NS|BO))?$/.test(upperQuery);
+       
+       if (isValidSymbol) {
-           const result = await aiIntegrationService.getMarketDataAction('quote', query.toUpperCase());
+           const result = await aiIntegrationService.getMarketDataAction('quote', upperQuery);
            if (result.success && !result.data.error) {
                return res.json([result.data]);
            }
        }
        
        // Default search logic (could be improved with a real search API)
        res.json([]);
    } catch (error) {
        console.error('Error searching stocks:', error);
        res.status(500).json({ error: 'Failed to search stocks' });
    }
};
```

**Explanation:**
- New regex: `^[A-Z]{1,10}(\.(NS|BO))?$`
  - Allows 1-10 letter symbols
  - Optional `.NS` or `.BO` suffix for Indian exchanges
  - Supports: AAPL, MSFT, RELIANCE.NS, TCS.NS, etc.

---

### Fix 3 — Wire Technical Indicators to Backend
**Priority:** HIGH (Feature Not Working)
**Files:** 
- `ai_integration/main.py` (add handler)
- `backend/controllers/marketController.js` (call correct action)

**Problem:** Technical indicators are calculated but never called. Hardcoded values returned instead.

**Diff for ai_integration/main.py (add after line 82):**
```diff
def handle_market_data_request(data):
    """Handle market data requests"""
    try:
        sub_action = data.get('sub_action')
        symbol = data.get('symbol')
        
        if sub_action == 'quote':
            result = get_stock_info(symbol)
        elif sub_action == 'history':
            result = get_historical_data(symbol, period=data.get('period', '1mo'))
        elif sub_action == 'trending':
            result = get_trending_stocks()
+       elif sub_action == 'technicals':
+           # Get historical data first
+           hist = get_historical_data(symbol, period='6mo')
+           if 'history' in hist:
+               # Convert to DataFrame format for technical analysis
+               import pandas as pd
+               df = pd.DataFrame(hist['history'])
+               result = get_technical_analysis(df)
+           else:
+               result = {'error': 'Could not fetch historical data'}
        else:
            result = {'error': f'Unknown sub-action: {sub_action}'}
            
        return {'success': True, 'data': result}
    except Exception as e:
        logger.error(f"Market data request error: {e}")
        return {'success': False, 'error': str(e)}
```

**Diff for backend/controllers/marketController.js (lines 85-110):**
```diff
exports.getStockTechnicals = async (req, res) => {
    try {
        const { symbol } = req.params;
-       // First get history to calculate indicators
-       const histResult = await aiIntegrationService.getMarketDataAction('history', symbol, '6mo');
+       // Call AI service for technical analysis
+       const techResult = await aiIntegrationService.getMarketDataAction('technicals', symbol, '6mo');
        
-       if (histResult.success && !histResult.data.error) {
-           // Call AI service for technical analysis
-           const techResult = await aiIntegrationService.getPrediction(symbol, 'ensemble'); // Actually using predict as it calculates indicators
-           
-           // For now, let's just use the prediction service's indicators if available
-           // or return a structured response from the history
-           const history = histResult.data.history;
-           const prices = history.close;
-           const lastPrice = prices[prices.length - 1];
-           
-           res.json({
-               rsi: 55.5, // Fallback values
-               ma50: lastPrice * 0.98,
-               ma200: lastPrice * 0.95,
-               volatility: 25.0,
-               beta: 1.1,
-               prediction: techResult.success ? techResult.prediction.prediction : lastPrice * 1.05
-           });
+       if (techResult.success && !techResult.data.error) {
+           res.json(techResult.data);
        } else {
            res.status(404).json({ error: `Could not calculate technicals for ${symbol}` });
        }
    } catch (error) {
        console.error('Error fetching technicals:', error);
        res.status(500).json({ error: 'Failed to fetch technical analysis' });
    }
};
```

---

### Fix 4 — Fix Python Dependencies
**Priority:** HIGH (Core Functionality)
**File:** `ai_integration/requirements.txt`

**Problem:** Missing critical dependencies, TensorFlow broken

**Diff:**
```diff
numpy>=1.21.0
pandas>=1.3.0
scikit-learn>=0.24.0
-tensorflow>=2.6.0
-protobuf<5.0.0,>=3.20.2
+tensorflow>=2.6.0,<2.22.0
+protobuf>=3.20.2,<4.0.0
pyyaml>=5.4.0
+yfinance>=0.2.0
+statsmodels>=0.13.0
+prophet>=1.1.0

# Optional: For HTTP API server
# flask>=2.0.0
# flask-cors>=3.0.0
```

**Installation command:**
```bash
pip install --upgrade protobuf==3.20.3
pip install yfinance statsmodels prophet
```

**Note:** TensorFlow 2.21.0 + Python 3.13 + protobuf incompatibility. May need to downgrade Python to 3.11 or use TensorFlow 2.16.

---

### Fix 5 — Create Trained Models Directory Structure
**Priority:** MEDIUM (ML Functionality)
**Action:** Create directory and placeholder files

**Commands:**
```bash
mkdir -p ai_integration/trained_models
touch ai_integration/trained_models/.gitkeep
```

**Note:** Actual model training required separately. Until then, fallback heuristics will continue to be used.

---

## Fixes That Are Quick Wins (< 30 min each)

1. **Fix 1 - Add Timeouts** (10 min)
   - Copy-paste setTimeout blocks to two methods
   - Test with a slow network simulation

2. **Fix 2 - Search Endpoint** (5 min)
   - Update regex pattern
   - Test with NSE tickers

3. **Fix 5 - Create Directory** (1 min)
   - Run mkdir command

4. **Fix 4 - Update requirements.txt** (15 min)
   - Add missing packages
   - Run pip install
   - Test imports

---

## Fixes Requiring Significant Work

1. **Train ML Models** (Days/Weeks)
   - Collect historical stock data
   - Train LSTM model (requires GPU for reasonable speed)
   - Train ARIMA models per stock
   - Train Prophet models
   - Validate model performance
   - Save to .h5/.pkl files

2. **Fix 3 - Wire Technical Indicators** (1-2 hours)
   - Add handler in main.py
   - Update controller
   - Test all technical indicator calculations
   - Verify output format matches frontend expectations
   - Handle edge cases (insufficient data, etc.)

3. **Fix TensorFlow/Protobuf Compatibility** (Variable)
   - May require Python version downgrade (3.13 → 3.11)
   - Or wait for TensorFlow update
   - Or use alternative ML framework

---

## Additional Observations

### Performance Notes
- yfinance API calls are reasonably fast (7-8s for single quote, 7.4s for 9 stocks)
- No obvious N+1 query problems in current implementation
- Sequential fetching in get_trending_stocks() is acceptable for 9 stocks

### Security Notes
- No SQL injection risks (using MongoDB)
- Python subprocess spawning is safe (no shell=True)
- Missing timeouts are the main security concern (DoS risk)

### Code Quality Notes
- Good separation of concerns (services, controllers, models)
- Consistent error handling patterns
- Logging infrastructure in place
- Missing: unit tests, integration tests

---

## Recommended Action Plan

**Immediate (Today):**
1. Apply Fix 1 (timeouts) - CRITICAL
2. Apply Fix 2 (search) - HIGH
3. Apply Fix 5 (mkdir) - QUICK WIN

**This Week:**
4. Apply Fix 4 (dependencies) - HIGH
5. Apply Fix 3 (technical indicators) - HIGH

**Next Sprint:**
6. Train ML models or document fallback behavior
7. Add comprehensive error handling
8. Write integration tests

---

## Conclusion

The application is functional for basic stock quotes and recommendations, but several critical issues need addressing:

- **Security:** Missing timeouts can cause DoS
- **Features:** Technical indicators hardcoded, search broken for NSE
- **ML:** All models using fallback heuristics (no real ML)
- **Dependencies:** TensorFlow broken, Prophet missing

Priority should be: Security fixes → Feature fixes → ML model training.

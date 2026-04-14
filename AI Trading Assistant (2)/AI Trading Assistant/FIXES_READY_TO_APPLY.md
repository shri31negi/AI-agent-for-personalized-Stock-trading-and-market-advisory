# Ready-to-Apply Fixes for TradeMind

## Fix 1: Add Timeouts to getMarketDataAction()

**File:** `backend/services/aiIntegrationService.js`
**Location:** After line 199 (inside getMarketDataAction method)

Add this code before the closing of the Promise:

```javascript
      setTimeout(() => {
        python.kill();
        reject(new Error('AI service timeout'));
      }, 30000);
```

Full context - add after the `python.on('close', ...)` block:

```javascript
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

      // ADD THIS BLOCK:
      setTimeout(() => {
        python.kill();
        reject(new Error('AI service timeout'));
      }, 30000);
    });
  }
```

---

## Fix 2: Add Timeout to getPrediction()

**File:** `backend/services/aiIntegrationService.js`
**Location:** After line 246 (inside getPrediction method)

Add the same timeout block:

```javascript
      setTimeout(() => {
        python.kill();
        reject(new Error('AI service timeout'));
      }, 30000);
```

Full context:

```javascript
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

      // ADD THIS BLOCK:
      setTimeout(() => {
        python.kill();
        reject(new Error('AI service timeout'));
      }, 30000);
    });
  }
```

---

## Fix 3: Update Search Regex for NSE Tickers

**File:** `backend/controllers/marketController.js`
**Location:** Lines 38-45 (searchStocks function)

Replace this:

```javascript
        const { query } = req.query;
        // For search, we can still use a limited set or a search API if available
        // For now, let's use the quote action if they search for a specific symbol
        if (query.length <= 5 && /^[A-Z.]+$/.test(query.toUpperCase())) {
            const result = await aiIntegrationService.getMarketDataAction('quote', query.toUpperCase());
```

With this:

```javascript
        const { query } = req.query;
        // Support both US tickers (1-5 chars) and NSE tickers (with .NS/.BO suffix)
        const upperQuery = query.toUpperCase();
        const isValidSymbol = /^[A-Z]{1,10}(\.(NS|BO))?$/.test(upperQuery);
        
        if (isValidSymbol) {
            const result = await aiIntegrationService.getMarketDataAction('quote', upperQuery);
```

---

## Fix 4: Add Technical Indicators Handler to Python

**File:** `ai_integration/main.py`
**Location:** Inside `handle_market_data_request()` function, after line 77

Add this elif block before the else clause:

```python
        elif sub_action == 'technicals':
            # Get historical data first
            hist = get_historical_data(symbol, period='6mo')
            if 'history' in hist:
                # Convert to DataFrame format for technical analysis
                import pandas as pd
                df = pd.DataFrame(hist['history'])
                result = get_technical_analysis(df)
            else:
                result = {'error': 'Could not fetch historical data'}
```

Full context:

```python
        if sub_action == 'quote':
            result = get_stock_info(symbol)
        elif sub_action == 'history':
            result = get_historical_data(symbol, period=data.get('period', '1mo'))
        elif sub_action == 'trending':
            result = get_trending_stocks()
        elif sub_action == 'technicals':  # ADD THIS BLOCK
            # Get historical data first
            hist = get_historical_data(symbol, period='6mo')
            if 'history' in hist:
                # Convert to DataFrame format for technical analysis
                import pandas as pd
                df = pd.DataFrame(hist['history'])
                result = get_technical_analysis(df)
            else:
                result = {'error': 'Could not fetch historical data'}
        else:
            result = {'error': f'Unknown sub-action: {sub_action}'}
```

---

## Fix 5: Update getStockTechnicals Controller

**File:** `backend/controllers/marketController.js`
**Location:** Lines 85-110 (getStockTechnicals function)

Replace the entire function body with:

```javascript
exports.getStockTechnicals = async (req, res) => {
    try {
        const { symbol } = req.params;
        // Call AI service for technical analysis
        const techResult = await aiIntegrationService.getMarketDataAction('technicals', symbol, '6mo');
        
        if (techResult.success && !techResult.data.error) {
            res.json(techResult.data);
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

## Fix 6: Update requirements.txt

**File:** `ai_integration/requirements.txt`

Replace entire file with:

```
numpy>=1.21.0
pandas>=1.3.0
scikit-learn>=0.24.0
tensorflow>=2.6.0,<2.22.0
protobuf>=3.20.2,<4.0.0
pyyaml>=5.4.0
yfinance>=0.2.0
statsmodels>=0.13.0
prophet>=1.1.0

# Optional: For HTTP API server
# flask>=2.0.0
# flask-cors>=3.0.0
```

Then run:
```bash
pip install -r ai_integration/requirements.txt
```

---

## Fix 7: Create Model Directory

Run this command from project root:

```bash
mkdir -p ai_integration/trained_models
```

Or on Windows:
```cmd
mkdir ai_integration\trained_models
```

---

## Testing After Fixes

### Test 1: Verify Timeouts Work
```bash
# This should timeout after 30s if Python hangs
curl http://localhost:5000/api/market/quote/AAPL
```

### Test 2: Verify NSE Search Works
```bash
# Should return RELIANCE.NS data
curl http://localhost:5000/api/market/search?query=RELIANCE.NS
```

### Test 3: Verify Technical Indicators
```bash
# Should return real RSI, MACD, MA values (not 55.5)
curl http://localhost:5000/api/market/technicals/AAPL
```

### Test 4: Verify Dependencies
```bash
cd ai_integration
python -c "import yfinance, statsmodels, prophet; print('All imports OK')"
```

---

## Application Order

Apply fixes in this order:

1. **Fix 1 & 2** (Timeouts) - CRITICAL, do first
2. **Fix 7** (Create directory) - Quick, no risk
3. **Fix 6** (Dependencies) - May take time to install
4. **Fix 3** (Search regex) - Quick, low risk
5. **Fix 4 & 5** (Technical indicators) - Test together

---

## Rollback Plan

If any fix causes issues:

1. **Timeouts:** Remove the setTimeout blocks
2. **Search:** Revert to `query.length <= 5` check
3. **Technical indicators:** Revert to hardcoded values
4. **Dependencies:** `pip uninstall prophet` if it causes issues

Keep backups of:
- `backend/services/aiIntegrationService.js`
- `backend/controllers/marketController.js`
- `ai_integration/main.py`
- `ai_integration/requirements.txt`

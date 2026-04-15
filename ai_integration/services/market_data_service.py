import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_stock_info(symbol, fast=False):
    """Fetch real-time stock information"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info
        
        # Determine price quickly
        price = info.last_price if hasattr(info, 'last_price') else 0
        prev_close = info.previous_close if hasattr(info, 'previous_close') else 0
        change = price - prev_close if price and prev_close else 0
        change_percent = (change / prev_close) * 100 if prev_close else 0

        # Fast fetch mode skips full 1Y history to avoid severe API lag for big lists
        volatility = 0.2
        momentum = 0
        
        if not fast:
            try:
                hist = ticker.history(period="1y")
                if not hist.empty:
                    returns = hist['Close'].pct_change().dropna()
                    calc_vol = returns.std() * np.sqrt(252) # Annualized volatility
                    volatility = float(calc_vol) if not np.isnan(calc_vol) else 0.2
                    momentum = float((hist['Close'].iloc[-1] / hist['Close'].iloc[0]) - 1)
            except Exception as e:
                pass

        return {
            "symbol": symbol,
            "name": info.get("longName", symbol) if not fast else symbol,
            "price": price,
            "change": change,
            "changePercent": change_percent,
            "volume": info.get("regularMarketVolume", 0) if not fast else (info.last_volume if hasattr(info, 'last_volume') else 0),
            "marketCap": info.get("marketCap", 0) if not fast else (info.market_cap if hasattr(info, 'market_cap') else 0),
            "pe_ratio": info.get("trailingPE", 0) if not fast else 0,
            "sector": info.get("sector", "Tech") if not fast else "Tech",
            "currency": info.get("currency", "USD") if not fast else (info.currency if hasattr(info, 'currency') else "USD"),
            "high": info.get("dayHigh", 0) if not fast else (info.day_high if hasattr(info, 'day_high') else 0),
            "low": info.get("dayLow", 0) if not fast else (info.day_low if hasattr(info, 'day_low') else 0),
            "dividend_yield": info.get("dividendYield", 0) if not fast else 0,
            "volatility": volatility,
            "beta": info.get("beta", 1.0) if not fast else 1.0,
            "momentum": momentum,
            "growth_rate": info.get("earningsGrowth", 0) if not fast else 0
        }
    except Exception as e:
        return {"error": str(e), "symbol": symbol}

def get_historical_data(symbol, period="1mo", interval="1d"):
    """Fetch historical price data"""
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            return {"error": f"No data found for {symbol}", "symbol": symbol}
            
        # Convert to list of dicts or standard format
        return {
            "symbol": symbol,
            "history": {
                "dates": df.index.strftime('%Y-%m-%d').tolist(),
                "open": df['Open'].tolist(),
                "high": df['High'].tolist(),
                "low": df['Low'].tolist(),
                "close": df['Close'].tolist(),
                "volume": df['Volume'].tolist()
            }
        }
    except Exception as e:
        return {"error": str(e), "symbol": symbol}

def get_trending_stocks(region="US"):
    """Fetch trending stocks efficiently by downloading batch live data avoiding IP bans"""
    popular_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA'] # Top 6
    
    results = []
    try:
        data = yf.download(popular_symbols, period="2d", progress=False)
        closes = data['Close']
        
        for symbol in popular_symbols:
            if symbol in closes:
                # get last 2 days close if available or just last
                series_data = closes[symbol].dropna()
                if len(series_data) >= 2:
                    current_price = series_data.iloc[-1]
                    prev_close = series_data.iloc[-2]
                elif len(series_data) == 1:
                    current_price = series_data.iloc[-1]
                    prev_close = current_price
                else: continue
                
                change = float(current_price - prev_close)
                change_percent = float((change / prev_close) * 100) if prev_close else 0
                
                results.append({
                    "symbol": symbol,
                    "name": symbol,
                    "price": float(current_price),
                    "change": change,
                    "changePercent": change_percent,
                    "volume": 0, "marketCap": 0, "pe_ratio": 0, "sector": "Tech", "currency": "USD",
                    "high": 0, "low": 0, "dividend_yield": 0, "volatility": 0.2, "beta": 1.0, 
                    "momentum": 0, "growth_rate": 0
                })
    except Exception as e:
        print(f"Error fetching live batch data: {e}")
            
    return results

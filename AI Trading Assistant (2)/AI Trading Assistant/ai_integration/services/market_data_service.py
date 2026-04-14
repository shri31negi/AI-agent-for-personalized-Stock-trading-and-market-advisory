import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_stock_info(symbol):
    """Fetch real-time stock information"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        # Fetch historical data to calculate volatility and momentum
        hist = ticker.history(period="1y")
        returns = hist['Close'].pct_change().dropna()
        volatility = returns.std() * np.sqrt(252) # Annualized volatility
        
        # Calculate momentum (1-year return)
        momentum = (hist['Close'].iloc[-1] / hist['Close'].iloc[0]) - 1 if len(hist) > 0 else 0

        return {
            "symbol": symbol,
            "name": info.get("longName", symbol),
            "price": info.get("currentPrice", info.get("regularMarketPrice")),
            "change": info.get("regularMarketChange"),
            "changePercent": info.get("regularMarketChangePercent"),
            "volume": info.get("regularMarketVolume"),
            "marketCap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "sector": info.get("sector"),
            "currency": info.get("currency", "USD"),
            "high": info.get("dayHigh"),
            "low": info.get("dayLow"),
            "dividend_yield": info.get("dividendYield", 0),
            "volatility": float(volatility) if not np.isnan(volatility) else 0.2,
            "beta": info.get("beta", 1.0),
            "momentum": float(momentum),
            "growth_rate": info.get("earningsGrowth", 0)
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

def get_technical_indicators(symbol):
    """Fetch real technical indicators using yfinance"""
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1y")
        
        if df.empty:
            return {"error": f"No data found for {symbol}", "symbol": symbol}
            
        close = df['Close']
        
        # Calculate SMA 50 and 200
        sma_50 = close.rolling(window=50).mean().iloc[-1]
        sma_200 = close.rolling(window=200).mean().iloc[-1]
        
        # Calculate RSI (14)
        delta = close.diff()
        gain = delta.where(delta > 0, 0.0)
        loss = -delta.where(delta < 0, 0.0)
        
        avg_gain = gain.ewm(com=13, adjust=False).mean()
        avg_loss = loss.ewm(com=13, adjust=False).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs)).iloc[-1]
        
        # Volatility & Beta for UI
        returns = close.pct_change().dropna()
        volatility = returns.std() * np.sqrt(252) * 100
        
        info = ticker.info
        beta = info.get("beta", 1.0)
        
        # Use simple heuristic for default prediction
        last_price = close.iloc[-1]
        if pd.isna(sma_50) or last_price > sma_50:
            prediction = last_price * 1.05
        else:
            prediction = last_price * 0.95
            
        return {
            "symbol": symbol,
            "rsi": float(rsi) if not pd.isna(rsi) else None,
            "ma50": float(sma_50) if not pd.isna(sma_50) else None,
            "ma200": float(sma_200) if not pd.isna(sma_200) else None,
            "volatility": float(volatility) if not pd.isna(volatility) else None,
            "beta": float(beta) if beta is not None else 1.0,
            "prediction": float(prediction)
        }
    except Exception as e:
        return {"error": str(e), "symbol": symbol}

def get_trending_stocks(region="US"):
    """Fetch trending stocks (limited to a few well-known ones if API limited)"""
    # yfinance doesn't have a direct 'trending' list easily, 
    # we can use a predefined list of popular stocks and update their prices
    popular_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS']
    
    results = []
    for symbol in popular_symbols:
        info = get_stock_info(symbol)
        if "error" not in info:
            results.append(info)
            
    return results

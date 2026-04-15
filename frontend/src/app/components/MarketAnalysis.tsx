import React, { useState, useEffect, useMemo } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, TrendingUp, TrendingDown, Info, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Stock, trendingStocks, generatePriceHistory } from "../data/mockData";
import { Badge } from "./ui/badge";
import { formatCurrency, getCurrencySymbol } from "../utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function MarketAnalysis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingStocksState, setTrendingStocksState] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const tickerRows = useMemo(() => [], []); // Removed mock random background prices

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/market/trending");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTrendingStocksState(data);
        if (data.length > 0) {
          setSelectedStock(data[0]);
        }
      } catch (err) {
        console.warn("Backend not reachable, using mock data", err);
        setTrendingStocksState(trendingStocks);
        if (trendingStocks.length > 0) {
          setSelectedStock(trendingStocks[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!selectedStock) return;
    const fetchHistory = async () => {
      setChartLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/market/history/${selectedStock.symbol}?timeframe=${timeframe}`);
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setPriceHistory(data);
      } catch (err) {
        console.warn("Backend not reachable, generating mock history", err);
        const days = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
        setPriceHistory(generatePriceHistory(selectedStock.price, days));
      } finally {
        setChartLoading(false);
      }
    };
    fetchHistory();
  }, [selectedStock?.symbol, timeframe]);

  const handleSearchKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      let symbol = searchQuery.trim().toUpperCase();


      const commonIndianStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'WIPRO', 'HCLTECH'];
      if (commonIndianStocks.includes(symbol)) {
        symbol += '.NS';
      }

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/market/quote/${symbol}`);
        if (res.ok) {
          const stock = await res.json();
          setSelectedStock(stock);
          if (!trendingStocksState.find((s: Stock) => s.symbol === stock.symbol)) {
            setTrendingStocksState([stock, ...trendingStocksState]);
          }
        } else {

          const fallbackRes = await fetch(`http://localhost:5000/api/market/quote/${searchQuery.trim().toUpperCase()}`);
          if (fallbackRes.ok) {
            const stock = await fallbackRes.json();
            setSelectedStock(stock);
          } else {
            throw new Error("API failed");
          }
        }
      } catch (error) {
        console.warn("Falling back to local search", error);
        const searchTarget = symbol.replace('.NS', '');
        const found = trendingStocks.find(s =>
          s.symbol.toUpperCase().includes(searchTarget) ||
          s.name.toUpperCase().includes(searchTarget)
        );
        if (found) {
          setSelectedStock(found);
          if (!trendingStocksState.find((s: Stock) => s.symbol === found.symbol)) {
            setTrendingStocksState([found, ...trendingStocksState]);
          }
        } else {
          alert(`Stock ${searchTarget} not found in mock database`);
        }
      } finally {
        setLoading(false);
      }
    }
  };


  const filteredStocks = searchQuery
    ? trendingStocksState.filter(stock =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : trendingStocksState;

  const [technicalIndicators, setTechnicalIndicators] = useState<any>({
    rsi: 58.3,
    ma50: 0,
    ma200: 0,
    volume: 0,
    volatility: 28.5,
    beta: 1.25,
    prediction: 0
  });

  useEffect(() => {
    if (!selectedStock) return;
    const fetchTechnicals = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/market/technicals/${selectedStock.symbol}`);
        if (res.ok) {
          const data = await res.json();
          setTechnicalIndicators({
            ...data,
            volume: selectedStock.volume,
            avgVolume: selectedStock.volume * 0.85
          });
        }
      } catch (err) {
        console.warn("Failed to fetch technicals", err);
      }
    };
    fetchTechnicals();
  }, [selectedStock?.symbol]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading market data...</span>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="p-8 flex items-center justify-center h-[600px]">
        <span className="text-lg text-muted-foreground">No stock data available</span>
      </div>
    );
  }

  const analystRatings = {
    buy: 18,
    hold: 7,
    sell: 2,
    targetPrice: technicalIndicators.prediction || selectedStock.price * 1.15
  };


  return (
    <div className="relative min-h-screen w-full">
      <style>{`
        @keyframes tickerLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tickerRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-ticker-left {
          animation: tickerLeft 40s linear infinite;
        }
        .animate-ticker-right {
          animation: tickerRight 50s linear infinite;
        }
      `}</style>

      {/* Immersive Market Analysis Background */}
      <div className="fixed inset-0 -z-10 bg-[#020617] overflow-hidden">
        <img
          src="/stock-ticker-bg.png"
          alt="Market Analysis Background"
          className="w-full h-full object-cover opacity-40 dark:opacity-50 pointer-events-none mix-blend-screen"
        />
        {/* Dimming overlay so foreground content is readable */}
        <div className="absolute inset-0 bg-background/80 dark:bg-background/70 backdrop-blur-[3px] pointer-events-none" />
      </div>

      <div className="p-4 md:p-8 relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stock List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-card border-border">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
                    placeholder="Search and hit enter..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedStock.symbol === stock.symbol
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold text-foreground">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{stock.name}</p>
                      </div>
                      {stock.changePercent >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold text-sm text-foreground">
                        {formatCurrency(stock.price, stock.currency, stock.symbol)}
                      </p>
                      <p className={`text-xs ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Analysis Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stock Header */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-purple-400">{selectedStock.symbol}</h3>
                    <Badge variant="outline">{selectedStock.sector}</Badge>
                  </div>
                  <p className="text-foreground mb-4">{selectedStock.name}</p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-foreground">
                      {formatCurrency(selectedStock.price, selectedStock.currency, selectedStock.symbol)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className={`text-lg font-semibold ${selectedStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedStock.changePercent >= 0 ? '+' : ''}
                        {getCurrencySymbol(selectedStock.currency, selectedStock.symbol)}{selectedStock.change.toFixed(2)}
                      </p>

                      <p className={`text-sm ${selectedStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Add to Watchlist</Button>
                  <Button>Trade</Button>
                </div>
              </div>
            </Card>

            {/* Price Chart */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-400">Price Chart</h3>
                <div className="flex gap-2">
                  {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={selectedStock.changePercent >= 0 ? "#10b981" : "#ef4444"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={selectedStock.changePercent >= 0 ? "#10b981" : "#ef4444"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      if (timeframe === '1D') return date.toLocaleTimeString('en-US', { hour: 'numeric' });
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tickFormatter={(value) => `${getCurrencySymbol(selectedStock.currency, selectedStock.symbol)}${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => [formatCurrency(value, selectedStock.currency, selectedStock.symbol), 'Price']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: timeframe === '1D' ? 'numeric' : undefined,
                      minute: timeframe === '1D' ? '2-digit' : undefined
                    })}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={selectedStock.changePercent >= 0 ? "#10b981" : "#ef4444"}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Analysis Tabs */}
            <Card className="p-6 bg-card border-border">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="technicals">Technicals</TabsTrigger>
                  <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
                  <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Cap</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {formatCurrency(selectedStock.marketCap, selectedStock.currency)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">P/E Ratio</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">{selectedStock.pe?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volume</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {(selectedStock.volume / 1e6).toFixed(2)}M
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sector</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">{selectedStock.sector}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-blue-100 mb-1">Company Overview</p>
                        <p className="text-sm text-gray-700 dark:text-blue-200/70">
                          {selectedStock.symbol} is a leading company in the {selectedStock.sector} sector with a market capitalization of {formatCurrency(selectedStock.marketCap, selectedStock.currency, selectedStock.symbol)}. The stock is currently trading at {selectedStock.changePercent >= 0 ? 'above' : 'below'} its recent average.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="technicals" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">RSI (14)</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">{technicalIndicators.rsi.toFixed(1)}</p>
                      <Badge
                        variant={technicalIndicators.rsi > 70 ? 'destructive' : technicalIndicators.rsi < 30 ? 'default' : 'secondary'}
                        className="mt-2 text-xs"
                      >
                        {technicalIndicators.rsi > 70 ? 'Overbought' : technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {formatCurrency(technicalIndicators.ma50, selectedStock.currency, selectedStock.symbol)}
                      </p>
                      <Badge variant={selectedStock.price > technicalIndicators.ma50 ? 'default' : 'destructive'} className="mt-2 text-xs">
                        {selectedStock.price > technicalIndicators.ma50 ? 'Above' : 'Below'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {formatCurrency(technicalIndicators.ma200, selectedStock.currency, selectedStock.symbol)}
                      </p>
                      <Badge variant={selectedStock.price > technicalIndicators.ma200 ? 'default' : 'destructive'} className="mt-2 text-xs">
                        {selectedStock.price > technicalIndicators.ma200 ? 'Above' : 'Below'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volume vs Avg</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {((technicalIndicators.volume / technicalIndicators.avgVolume - 1) * 100).toFixed(1)}%
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {technicalIndicators.volume > technicalIndicators.avgVolume ? 'High' : 'Low'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volatility (30D)</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">{technicalIndicators.volatility.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Beta</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">{technicalIndicators.beta.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900/50">
                    <p className="font-semibold text-gray-900 dark:text-purple-100 mb-2">Technical Summary</p>
                    <p className="text-sm text-gray-700 dark:text-purple-200/70">
                      {selectedStock.symbol} is trading {selectedStock.price > technicalIndicators.ma50 ? 'above' : 'below'} its 50-day moving average, indicating {selectedStock.price > technicalIndicators.ma50 ? 'bullish' : 'bearish'} short-term momentum. The RSI of {technicalIndicators.rsi.toFixed(1)} suggests the stock is {technicalIndicators.rsi > 70 ? 'overbought' : technicalIndicators.rsi < 30 ? 'oversold' : 'in neutral territory'}.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="fundamentals" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">P/E Ratio</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">{selectedStock.pe?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Cap</p>
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {formatCurrency(selectedStock.marketCap, selectedStock.currency)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-muted/30 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {formatCurrency(selectedStock.price / (selectedStock.pe || 1), selectedStock.currency, selectedStock.symbol)}
                      </p>
                    </div>
                  </div>

                  <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-border dark:border-green-900/30">
                    <p className="font-semibold text-gray-900 dark:text-foreground mb-3">Analyst Ratings</p>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-500">{analystRatings.buy}</p>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">Buy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{analystRatings.hold}</p>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">Hold</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-500">{analystRatings.sell}</p>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">Sell</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                          {selectedStock.currency === 'INR' ? '₹' : '$'}{analystRatings.targetPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">Avg Target</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-muted-foreground">
                      Upside potential: {((analystRatings.targetPrice / selectedStock.price - 1) * 100).toFixed(1)}%
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-analysis" className="space-y-4 mt-4">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-900/40">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-blue-100 mb-1">AI-Powered Analysis</h4>
                        <p className="text-sm text-gray-600 dark:text-blue-200/60">Based on your moderate risk profile and growth goals</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-foreground mb-2">Recommendation</p>
                        <Badge className="mb-2 bg-primary text-white">
                          {selectedStock.changePercent >= 0 && technicalIndicators.rsi < 70 ? 'BUY' :
                            selectedStock.changePercent < 0 && technicalIndicators.rsi > 30 ? 'HOLD' : 'WATCH'}
                        </Badge>
                        <p className="text-sm text-gray-700 dark:text-muted-foreground/90">
                          {selectedStock.symbol} shows {selectedStock.changePercent >= 0 ? 'positive' : 'negative'} momentum with {technicalIndicators.rsi > 70 ? 'overbought' : technicalIndicators.rsi < 30 ? 'oversold' : 'neutral'} technical signals. The stock is trading {selectedStock.price > technicalIndicators.ma200 ? 'above' : 'below'} its 200-day moving average, indicating {selectedStock.price > technicalIndicators.ma200 ? 'long-term bullish' : 'long-term bearish'} trend.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 dark:text-foreground mb-2">Risk Assessment</p>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline" className="dark:border-white/20 dark:text-white/80">Volatility: {technicalIndicators.volatility.toFixed(1)}%</Badge>
                          <Badge variant="outline" className="dark:border-white/20 dark:text-white/80">Beta: {technicalIndicators.beta.toFixed(2)}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-muted-foreground/90">
                          With a beta of {technicalIndicators.beta.toFixed(2)}, this stock is {technicalIndicators.beta > 1 ? 'more volatile than' : 'less volatile than'} the market. Given your moderate risk tolerance, {technicalIndicators.volatility > 30 ? 'consider a smaller position size' : 'this aligns well with your profile'}.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 dark:text-foreground mb-2">Suggested Strategy</p>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-muted-foreground/90">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>Entry Price: {selectedStock.currency === 'INR' ? '₹' : '$'}{(selectedStock.price * 0.97).toFixed(2)} - {selectedStock.currency === 'INR' ? '₹' : '$'}{selectedStock.price.toFixed(2)}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>Stop Loss: {selectedStock.currency === 'INR' ? '₹' : '$'}{(selectedStock.price * 0.92).toFixed(2)} (8% below entry)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>Target: {selectedStock.currency === 'INR' ? '₹' : '$'}{(selectedStock.price * 1.15).toFixed(2)} (15% upside)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>Position Size: {technicalIndicators.volatility > 30 ? '5-7%' : '8-10%'} of portfolio</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, AlertCircle, Loader2, Lightbulb } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, Tooltip, AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";
import { portfolioHoldings, userProfile, portfolioPerformanceData, monthlyInvestmentData } from "../data/mockData";
import { Badge } from "./ui/badge";
import { formatCurrency, getCurrencySymbol } from "../utils/formatters";

export function Portfolio() {
  const [timeFilter, setTimeFilter] = useState<'1W' | '1M' | '1Y'>('1M');
  const [liveHoldings, setLiveHoldings] = useState(portfolioHoldings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const symbols = portfolioHoldings.map(h => h.symbol).join(",");
        const res = await fetch(`http://localhost:5000/api/market/quotes?symbols=${symbols}`);
        if (!res.ok) throw new Error("Failed");
        const liveQuotes = await res.json();
        
        const updatedHoldings = portfolioHoldings.map(holding => {
          const liveQuote = liveQuotes.find((q: any) => q.symbol === holding.symbol);
          if (liveQuote) {
            const currentPrice = liveQuote.price;
            const totalValue = holding.shares * currentPrice;
            const gainLoss = totalValue - (holding.shares * holding.avgCost);
            const gainLossPercent = (gainLoss / (holding.shares * holding.avgCost)) * 100;

            return {
              ...holding,
              currentPrice,
              totalValue,
              gainLoss,
              gainLossPercent
            };
          }
          return holding;
        });

        setLiveHoldings(updatedHoldings);
      } catch (e) {
        console.error("Failed to fetch live quotes", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLivePrices();
  }, []);

  // Metrics Calculations
  const totalHoldingsValue = liveHoldings.reduce((sum, holding) => sum + holding.totalValue, 0);
  const totalPortfolioValue = totalHoldingsValue + userProfile.cashBalance;
  const totalInvestedAmount = userProfile.totalInvested;
  const totalProfitLoss = totalPortfolioValue - totalInvestedAmount;
  const returnPercentage = ((totalProfitLoss / totalInvestedAmount) * 100).toFixed(2);

  const chartData = portfolioPerformanceData[timeFilter];
  const PIE_COLORS = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];

  const liveAssetAllocation = [
    ...liveHoldings.map(h => ({
      name: h.symbol,
      value: h.totalValue,
      percentage: ((h.totalValue / totalPortfolioValue) * 100).toFixed(1)
    })).sort((a,b) => b.value - a.value),
    {
       name: 'Cash',
       value: userProfile.cashBalance,
       percentage: ((userProfile.cashBalance / totalPortfolioValue) * 100).toFixed(1)
    }
  ];

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background/50 backdrop-blur-lg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
        <span className="mt-4 text-xl font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Analyzing Portfolio...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen h-full flex flex-col p-4 md:p-8 overflow-y-auto bg-transparent space-y-8 w-full z-0">
      {/* Immersive Green Matrix Background */}
      <div className="fixed inset-0 -z-10 bg-[#020617] dark:bg-black overflow-hidden pointer-events-none">
        <img 
          src="/green-matrix-bg.png" 
          alt="Green Matrix Flow Background" 
          className="w-full h-full object-cover opacity-60 mix-blend-screen dark:mix-blend-lighten pointer-events-none" 
        />
        <div className="absolute inset-0 bg-background/70 dark:bg-background/60 backdrop-blur-[4px] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto space-y-8">
      {/* Top Metrics Row - Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Total Value</p>
              <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {formatCurrency(totalPortfolioValue)}
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Invested Amount</p>
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {formatCurrency(totalInvestedAmount)}
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Profit / Loss</p>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${totalProfitLoss >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {totalProfitLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
            </div>
            <p className={`text-3xl font-black tabular-nums ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Total Return</p>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-3xl font-black tabular-nums ${parseFloat(returnPercentage) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(returnPercentage) >= 0 ? '+' : ''}{returnPercentage}%
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Allocation Pie Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card className="p-8 premium-card flex flex-col h-full min-h-[420px]">
            <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Asset Allocation
            </h3>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={liveAssetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {liveAssetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value, (liveHoldings.find(h => h.symbol === name) as any)?.currency || 'INR'),
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Modern Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/5">
              {liveAssetAllocation.slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="flex items-center group cursor-default">
                  <div className="w-2 h-2 rounded-full mr-2 group-hover:scale-150 transition-transform" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mr-auto">{entry.name}</span>
                  <span className="text-xs font-black text-foreground">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Monthly Investment Tracker */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
          <Card className="p-8 premium-card flex flex-col h-full min-h-[420px]">
            <h3 className="text-xl font-black text-foreground mb-8 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              Monthly Contribution
            </h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyInvestmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={(value) => `${getCurrencySymbol(undefined, 'AAPL')}${value.toLocaleString()}`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    formatter={(value: number) => [formatCurrency(value, 'USD'), 'Invested']}
                  />
                  <Bar dataKey="invested" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Insight Card - Premium Refinement */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 rounded-full transition-transform group-hover:scale-150" />
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-indigo-500/20 rounded-2xl flex-shrink-0 animate-pulse">
              <Lightbulb className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xl font-black text-indigo-300 mb-2 flex items-center gap-2">
                AI Portfolio Strategist
                <Badge variant="outline" className="text-xs font-black border-indigo-400/30 text-indigo-300 ml-2">PRO ADVISORY</Badge>
              </h4>
              <p className="text-muted-foreground font-bold leading-relaxed text-base max-w-5xl">
                Your portfolio is performing consistently, mostly driven by strong equity gains. However, your <strong className="text-foreground">Cash & Crypto</strong> allocation is relatively high right now. Consider dollar-cost averaging your cash balance into your ETF holdings for steadier long-term compounding.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Holdings List - Premium Table */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="premium-card overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-black text-foreground">Asset Holdings</h3>
            <Badge variant="secondary" className="font-black text-xs tracking-widest">{liveHoldings.length} ASSETS</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left p-6 font-black text-muted-foreground text-[11px] uppercase tracking-widest">Asset Name</th>
                  <th className="text-right p-6 font-black text-muted-foreground text-[11px] uppercase tracking-widest">Shares</th>
                  <th className="text-right p-6 font-black text-muted-foreground text-[11px] uppercase tracking-widest">Avg Cost</th>
                  <th className="text-right p-6 font-black text-muted-foreground text-[11px] uppercase tracking-widest">Market Price</th>
                  <th className="text-right p-6 font-black text-muted-foreground text-[11px] uppercase tracking-widest">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {liveHoldings.map((holding) => (
                  <tr key={holding.symbol} className="group hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{holding.symbol}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase mt-1">{holding.name}</div>
                    </td>
                    <td className="p-6 text-right font-black tabular-nums">{holding.shares}</td>
                    <td className="p-6 text-right font-black tabular-nums text-muted-foreground">
                      {formatCurrency(holding.avgCost, (holding as any).currency, holding.symbol)}
                    </td>
                    <td className="p-6 text-right font-black tabular-nums">
                      {formatCurrency(holding.currentPrice, (holding as any).currency, holding.symbol)}
                    </td>
                    <td className="p-6 text-right">
                      <div className="font-black tabular-nums text-foreground">{formatCurrency(holding.totalValue, (holding as any).currency, holding.symbol)}</div>
                      <div className={`text-xs font-black mt-1 ${holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.gainLoss >= 0 ? '▲' : '▼'} {Math.abs(holding.gainLossPercent).toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}

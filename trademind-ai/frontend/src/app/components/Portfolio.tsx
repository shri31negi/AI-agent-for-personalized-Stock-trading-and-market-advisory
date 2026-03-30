import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, AlertCircle, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, Tooltip, AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";
import { portfolioHoldings, userProfile, portfolioPerformanceData, monthlyInvestmentData } from "../data/mockData";
import { Badge } from "./ui/badge";

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

  // New Metrics Calculations
  // 1. Total Portfolio Value (Holdings Value + Cash)
  const totalHoldingsValue = liveHoldings.reduce((sum, holding) => sum + holding.totalValue, 0);
  const totalPortfolioValue = totalHoldingsValue + userProfile.cashBalance;

  // 2. Total Invested Amount (From mock profile + mock calculation)
  const totalInvestedAmount = userProfile.totalInvested;

  // 3. Total Profit/Loss
  const totalProfitLoss = totalPortfolioValue - totalInvestedAmount;

  // 4. Return Percentage
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
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading portfolio data...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-background">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Portfolio</h2>
        <p className="text-muted-foreground mt-1 text-sm">Track your investment performance and distribution</p>
      </div>

      {/* Top Metrics Row - Simple Minimalist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-card border border-border/60 shadow-sm rounded-xl">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-foreground mb-1">
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6 bg-card border border-border/60 shadow-sm rounded-xl">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Invested Amount</p>
          <p className="text-3xl font-bold text-foreground mb-1">
            ${totalInvestedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card className="p-6 bg-card border border-border/60 shadow-sm rounded-xl">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Profit/Loss</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${totalProfitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border/60 shadow-sm rounded-xl">
          <p className="text-sm font-medium text-muted-foreground mb-1">Return Percentage</p>
          <p className={`text-3xl font-bold ${parseFloat(returnPercentage) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(returnPercentage) >= 0 ? '+' : ''}{returnPercentage}%
          </p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Allocation Pie Chart */}
        <Card className="p-6 bg-card border border-border/60 shadow-sm rounded-xl flex flex-col min-h-[380px]">
          <h3 className="text-base font-semibold text-foreground mb-2 flex-shrink-0">Portfolio Allocation</h3>
          <div className="flex-1 min-h-[200px] relative -mt-5">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={liveAssetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {liveAssetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 50, fontSize: '13px' }}
                  itemStyle={{ color: 'var(--card-foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-1 pt-4 border-t border-border/50 shrink-0">
            {liveAssetAllocation.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-sm mr-2 shrink-0"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="truncate flex-1 font-medium text-muted-foreground">{entry.name}</span>
                <span className="font-bold text-foreground ml-1">{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Investment Tracker */}
        <Card className="p-6 bg-card border border-border/60 shadow-sm rounded-xl lg:col-span-2 flex flex-col min-h-[380px]">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h3 className="text-base font-semibold text-foreground">Monthly Investment Tracker</h3>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyInvestmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Invested']}
                  contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="invested"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Insight Card */}
      <Card className="p-5 mb-8 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-base text-foreground mb-1">AI Portfolio Insight</h4>
            <p className="text-muted-foreground text-sm max-w-4xl leading-relaxed">
              Your portfolio is performing consistently, mostly driven by strong equity gains. However, your <strong className="text-foreground">Cash & Crypto</strong> allocation is relatively high right now. Consider dollar-cost averaging your cash balance into your ETF holdings for steadier long-term compounding.
            </p>
          </div>
        </div>
      </Card>

      {/* Holdings List */}
      <Card className="bg-card border border-border/60 shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="p-5 border-b border-border/50">
          <h3 className="text-base font-semibold text-foreground">Holdings</h3>
        </div>
        <div className="overflow-x-auto flex-1 p-2">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Stock Name</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Average Buy Price</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Current Price</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              {liveHoldings.map((holding) => (
                <tr key={holding.symbol} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-foreground">{holding.symbol}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{holding.name}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-foreground">{holding.shares}</td>
                  <td className="py-4 px-4 text-right font-medium text-foreground">
                    ${holding.avgCost.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-foreground">
                    ${holding.currentPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`font-semibold ${holding.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}${Math.abs(holding.gainLoss).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Lightbulb, AlertTriangle, Lock } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trendingStocks, marketNews, aiInsights, userProfile, generatePriceHistory } from "../data/mockData";
import { Badge } from "./ui/badge";
import { formatCurrency, getCurrencySymbol } from "../utils/formatters";

export function Dashboard() {
  const [liveNews, setLiveNews] = useState(marketNews);
  const [profile, setProfile] = useState(userProfile);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('investorProfile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...userProfile,
          totalInvested: parseFloat(parsed.investedAmount) || userProfile.totalInvested,
          portfolioValue: parseFloat(parsed.currentValue) || userProfile.portfolioValue,
          riskTolerance: parsed.riskLevel || userProfile.riskTolerance,
          tradingStyle: parsed.tradingStyle || userProfile.tradingStyle
        });
      }
    } catch (e) {
      console.error("Error parsing profile", e);
    }

    const fetchNews = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/market/news');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setLiveNews(data);
        }
      } catch (error) {
        console.error("Error fetching live news:", error);
      }
    };
    fetchNews();
  }, []);

  const portfolioHistory = generatePriceHistory(profile.portfolioValue, 30);

  const totalGainLoss = profile.portfolioValue - profile.totalInvested;
  const totalGainLossPercent = ((totalGainLoss / profile.totalInvested) * 100).toFixed(2);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'tip': return <Lightbulb className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'tip': return 'bg-primary/10 border-primary/30 text-primary';
      case 'alert': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-muted/50 border-border text-muted-foreground';
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Immersive Global Dashboard Background matching the requested aesthetic */}
      <div className="fixed inset-0 -z-10 bg-[#0f172a] dark:bg-black">
         <img 
           src="/dashboard-bg.png" 
           alt="Dashboard High-Tech Background" 
           className="w-full h-full object-cover opacity-70 mix-blend-screen dark:mix-blend-lighten pointer-events-none"
         />
         {/* Atmospheric overlays for text readability */}
         <div className="absolute inset-0 bg-background/50 dark:bg-background/40 backdrop-blur-[2px] pointer-events-none" />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/90 pointer-events-none" />
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 relative z-10 w-full">
      {/* Portfolio Overview Cards - Premium Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Current Value</p>
              <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {formatCurrency(profile.portfolioValue)}
            </p>
            <div className={`mt-4 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${parseFloat(totalGainLossPercent) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {parseFloat(totalGainLossPercent) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {parseFloat(totalGainLossPercent) >= 0 ? '+' : ''}{totalGainLossPercent}%
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Overall Profit/Loss</p>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${totalGainLoss >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
            </div>
            <p className={`text-3xl font-black tabular-nums ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
            </p>
            <p className="text-xs text-muted-foreground mt-4 font-bold opacity-60">
              {totalGainLoss >= 0 ? 'Great news! Your portfolio is up' : 'You are currently down'} {Math.abs(parseFloat(totalGainLossPercent))}% based on current market value.
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Total Invested</p>
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {formatCurrency(profile.totalInvested)}
            </p>
            <p className="text-xs text-indigo-400/80 mt-4 font-bold">Your starting capital 💰</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 premium-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground/70">Risk Profile</p>
              <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground capitalize">
              {profile.riskTolerance}
            </p>
            <p className="text-xs text-muted-foreground mt-4 font-bold italic">"{profile.tradingStyle}" strategy</p>
          </Card>
        </motion.div>
      </div>

      {/* Structured into perfectly aligned 1/3 Left, 2/3 Right layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (1/3 Width) - Live Market Pulse */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="h-full">
          <Card className="p-8 premium-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-indigo-400 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Market Pulse
              </h3>
            </div>
            <div className="space-y-4 flex-1">
              {liveNews.slice(0, 4).map((news: any) => (
                <div key={news.id} className="group p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-indigo-500/30 transition-all hover:bg-black/10 dark:hover:bg-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-700 dark:text-indigo-200">{news.source}</Badge>
                      <span className="text-[10px] font-black text-muted-foreground">{news.timestamp}</span>
                    </div>
                    <h4 className="font-black text-sm leading-tight text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{news.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Right Column (2/3 Width) - AI Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2 h-full"
        >
          <Card className="p-8 premium-card h-full flex flex-col">
            <h3 className="text-xl font-black text-purple-400 mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              AI Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex flex-col justify-between ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getInsightIcon(insight.type)}</div>
                    <div>
                      <p className="text-[15px] font-black tracking-tight leading-tight">{insight.title}</p>
                      <p className="text-sm mt-3 font-semibold leading-relaxed opacity-90">{insight.message}</p>
                    </div>
                  </div>
                  {insight.stocks && insight.stocks.length > 0 && (
                    <div className="flex gap-2 mt-4 ml-7">
                      {insight.stocks.map(s => (
                        <Badge key={s} variant="secondary" className="text-xs font-black uppercase tracking-tighter bg-black/10 dark:bg-white/10 border-none">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 
        =========================================
        MASSIVE HERO CHART (Exact Image Replica)
        =========================================
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        <Card className="p-0 premium-card h-[400px] flex flex-col justify-center relative overflow-hidden group shadow-[0_0_40px_rgba(99,102,241,0.15)] border-indigo-500/20">
          

          <div className="absolute inset-0 z-10 w-full h-full overflow-hidden">
             
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 400">
              <defs>
                 <linearGradient id="glowgrad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                  <stop offset="30%" stopColor="#ea580c" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
                <filter id="ultra-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="15" result="blur1" />
                  <feGaussianBlur stdDeviation="6" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1"/>
                    <feMergeNode in="blur2"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="white-core">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                {/* 3D Glass Bar Gradient (Dark Mode) */}
                <linearGradient id="bar-grad-dark" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                   <stop offset="20%" stopColor="#ffffff" stopOpacity="0.1" />
                   <stop offset="80%" stopColor="#ffffff" stopOpacity="0.1" />
                   <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
                </linearGradient>
                {/* 3D Glass Bar Gradient (Light Mode) */}
                <linearGradient id="bar-grad-light" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                   <stop offset="20%" stopColor="#6366f1" stopOpacity="0.1" />
                   <stop offset="80%" stopColor="#6366f1" stopOpacity="0.1" />
                   <stop offset="100%" stopColor="#312e81" stopOpacity="0.5" />
                </linearGradient>
                <marker id="neonArrow-dark" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                   <path d="M 0 1 L 10 5 L 0 9 z" fill="#ffffff" filter="url(#white-core)"/>
                </marker>
                <marker id="neonArrow-light" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                   <path d="M 0 1 L 10 5 L 0 9 z" fill="#4f46e5" filter="url(#white-core)"/>
                </marker>
              </defs>

              {/* High-Fidelity 3D Pillars (Dark Mode) */}
              <g className="hidden dark:block relative" opacity="0.8">
                 <rect x="50" y="300" width="50" height="150" fill="url(#bar-grad-dark)" stroke="#ffffff20" strokeWidth="1" />
                 <polygon points="50,300 75,285 125,285 100,300" fill="#ffffff40" />
                 <rect x="180" y="270" width="60" height="180" fill="url(#bar-grad-dark)" stroke="#ffffff20" strokeWidth="1" />
                 <polygon points="180,270 210,250 270,250 240,270" fill="#ffffff50" />
                 <rect x="330" y="210" width="70" height="240" fill="url(#bar-grad-dark)" stroke="#ffffff20" strokeWidth="1" />
                 <polygon points="330,210 365,185 435,185 400,210" fill="#ffffff60" />
                 <rect x="520" y="140" width="80" height="310" fill="url(#bar-grad-dark)" stroke="#ffffff20" strokeWidth="1" />
                 <polygon points="520,140 560,110 640,110 600,140" fill="#ffffff80" />
                 <rect x="730" y="100" width="90" height="350" fill="url(#bar-grad-dark)" stroke="#ffffff20" strokeWidth="1" />
                 <polygon points="730,100 775,65 865,65 820,100" fill="#ffffff90" />
              </g>

              {/* High-Fidelity 3D Pillars (Light Mode) */}
              <g className="block dark:hidden relative" opacity="0.3">
                 <rect x="50" y="300" width="50" height="150" fill="url(#bar-grad-light)" stroke="#6366f120" strokeWidth="1" />
                 <polygon points="50,300 75,285 125,285 100,300" fill="#6366f140" />
                 <rect x="180" y="270" width="60" height="180" fill="url(#bar-grad-light)" stroke="#6366f120" strokeWidth="1" />
                 <polygon points="180,270 210,250 270,250 240,270" fill="#6366f150" />
                 <rect x="330" y="210" width="70" height="240" fill="url(#bar-grad-light)" stroke="#6366f120" strokeWidth="1" />
                 <polygon points="330,210 365,185 435,185 400,210" fill="#6366f160" />
                 <rect x="520" y="140" width="80" height="310" fill="url(#bar-grad-light)" stroke="#6366f120" strokeWidth="1" />
                 <polygon points="520,140 560,110 640,110 600,140" fill="#6366f180" />
                 <rect x="730" y="100" width="90" height="350" fill="url(#bar-grad-light)" stroke="#6366f120" strokeWidth="1" />
                 <polygon points="730,100 775,65 865,65 820,100" fill="#6366f190" />
              </g>

              {/* The Glowing Moving Chart Line (Dark Mode) */}
              <g className="hidden dark:block">
                <path d="M -50 480 L 80 290 L 160 320 L 250 180 L 320 220 L 450 120 L 520 180 L 700 80 L 780 120 L 980 20 L 1050 -20" fill="none" stroke="url(#glowgrad)" strokeWidth="20" strokeLinejoin="miter" strokeLinecap="square" filter="url(#ultra-glow)" strokeDasharray="3000" strokeDashoffset="3000">
                  <animate attributeName="stroke-dashoffset" values="3000;0" dur="2.5s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1" keyTimes="0;1" />
                </path>
                <path d="M -50 480 L 80 290 L 160 320 L 250 180 L 320 220 L 450 120 L 520 180 L 700 80 L 780 120 L 980 20 L 1050 -20" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="miter" strokeLinecap="square" filter="url(#white-core)" markerEnd="url(#neonArrow-dark)" strokeDasharray="3000" strokeDashoffset="3000">
                  <animate attributeName="stroke-dashoffset" values="3000;0" dur="2.5s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1" keyTimes="0;1" />
                </path>
              </g>

              {/* The Glowing Moving Chart Line (Light Mode) */}
              <g className="block dark:hidden">
                <path d="M -50 480 L 80 290 L 160 320 L 250 180 L 320 220 L 450 120 L 520 180 L 700 80 L 780 120 L 980 20 L 1050 -20" fill="none" stroke="#4f46e5" strokeOpacity="0.3" strokeWidth="20" strokeLinejoin="miter" strokeLinecap="square" filter="url(#ultra-glow)" strokeDasharray="3000" strokeDashoffset="3000">
                  <animate attributeName="stroke-dashoffset" values="3000;0" dur="2.5s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1" keyTimes="0;1" />
                </path>
                <path d="M -50 480 L 80 290 L 160 320 L 250 180 L 320 220 L 450 120 L 520 180 L 700 80 L 780 120 L 980 20 L 1050 -20" fill="none" stroke="#4f46e5" strokeWidth="5" strokeLinejoin="miter" strokeLinecap="square" filter="url(#white-core)" markerEnd="url(#neonArrow-light)" strokeDasharray="3000" strokeDashoffset="3000">
                  <animate attributeName="stroke-dashoffset" values="3000;0" dur="2.5s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1" keyTimes="0;1" />
                </path>
              </g>
            </svg>
          </div>

          <div className="absolute top-8 left-8 z-20">
             <div className="flex items-center gap-3 bg-card/40 backdrop-blur-md px-4 py-2 rounded-xl border border-border/50 mb-2 shadow-sm">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-foreground font-bold tracking-widest text-sm">USDT / USD</span>
             </div>
             <p className="text-6xl font-black text-foreground tabular-nums drop-shadow-md">
                $2,148<span className="text-2xl text-green-500 ml-2">▲ 41.5%</span>
             </p>
             <p className="text-xl text-primary font-bold mt-2 tracking-wide uppercase drop-shadow-sm">
                Profit Generating...
             </p>
          </div>

        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Right Section (Full Width Now) - Hot Trending */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="lg:col-span-2 h-full">
          <Card className="p-8 premium-card h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-primary flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Hot Trending Stocks
              </h3>
              <Badge variant="outline" className="text-xs font-black border-primary/30 text-primary/80">LIVE UPDATES</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {trendingStocks.map((stock) => (
                <div key={stock.symbol} className="group flex items-center justify-between p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-black/10 dark:hover:border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary group-hover:scale-110 hover:rotate-12 transition-transform">
                      {stock.symbol[0]}
                    </div>
                    <div>
                      <p className="font-black text-base tracking-tight">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="font-black text-base tabular-nums">{formatCurrency(stock.price, stock.currency, stock.symbol)}</p>
                    <p className={`text-sm font-black mt-1 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent >= 0 ? '🚀' : '🔻'} {Math.abs(stock.changePercent).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      </div>
    </div>
  );
}

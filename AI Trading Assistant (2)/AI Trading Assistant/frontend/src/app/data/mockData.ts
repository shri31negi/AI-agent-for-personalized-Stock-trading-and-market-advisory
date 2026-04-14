export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe?: number;
  sector: string;
  currency?: string; // New field for USD, INR, etc.
}


export interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  stocks?: string[];
}

export const trendingStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.92,
    change: 1.25,
    changePercent: 0.68,
    volume: 52000000,
    marketCap: 2800000000000,
    pe: 29.5,
    sector: "Technology",
    currency: "USD"
  },
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    price: 2950.45,
    change: 45.20,
    changePercent: 1.55,
    volume: 5000000,
    marketCap: 20000000000000,
    pe: 25.8,
    sector: "Energy",
    currency: "INR"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 726.13,
    change: 15.42,
    changePercent: 2.17,
    volume: 44000000,
    marketCap: 1800000000000,
    pe: 95.2,
    sector: "Technology",
    currency: "USD"
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    price: 4120.10,
    change: -12.30,
    changePercent: -0.30,
    volume: 2000000,
    marketCap: 15000000000000,
    pe: 30.2,
    sector: "Technology",
    currency: "INR"
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Limited",
    price: 1450.25,
    change: 5.10,
    changePercent: 0.35,
    volume: 15000000,
    marketCap: 11000000000000,
    pe: 18.5,
    sector: "Financial Services",
    currency: "INR"
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 181.06,
    change: -3.45,
    changePercent: -1.87,
    volume: 105000000,
    marketCap: 570000000000,
    pe: 45.3,
    sector: "Automotive",
    currency: "USD"
  }
];


export const portfolioHoldings: PortfolioHolding[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 25,
    avgCost: 165.50,
    currentPrice: 178.42,
    totalValue: 4460.50,
    gainLoss: 323.00,
    gainLossPercent: 7.81
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    shares: 10,
    avgCost: 725.00,
    currentPrice: 875.28,
    totalValue: 8752.80,
    gainLoss: 1502.80,
    gainLossPercent: 20.73
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 15,
    avgCost: 390.00,
    currentPrice: 412.56,
    totalValue: 6188.40,
    gainLoss: 338.40,
    gainLossPercent: 5.79
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 30,
    avgCost: 135.00,
    currentPrice: 142.18,
    totalValue: 4265.40,
    gainLoss: 215.40,
    gainLossPercent: 5.32
  }
];

export const marketNews: MarketNews[] = [
  {
    id: "1",
    title: "Tech sector showing strong momentum",
    summary: "Technology companies are showing strong growth this week due to good earnings reports.",
    source: "Market Update",
    timestamp: "2 hours ago",
    sentiment: "positive"
  },
  {
    id: "2",
    title: "Energy sector seeing some changes",
    summary: "Energy prices are shifting, which might cause some movement in energy-related investments.",
    source: "Daily Brief",
    timestamp: "4 hours ago",
    sentiment: "neutral"
  },
  {
    id: "3",
    title: "Market remains steady today",
    summary: "The overall market is staying very calm as people wait for upcoming economic updates.",
    source: "Update",
    timestamp: "5 hours ago",
    sentiment: "neutral"
  },
  {
    id: "4",
    title: "Retail stores reporting good sales",
    summary: "Many stores are doing better than expected, which is a good sign for retail investments.",
    source: "Retail News",
    timestamp: "1 day ago",
    sentiment: "positive"
  }
];

export const aiInsights: AIInsight[] = [
  {
    id: "1",
    type: "opportunity",
    title: "BUY - Strong upward trend",
    message: "The current trend looks upward and recent news is very positive. You may want to consider this option.",
    timestamp: "1 hour ago",
    stocks: ["MSFT"]
  },
  {
    id: "2",
    type: "warning",
    title: "HOLD - Market uncertain",
    message: "The overall market direction is a bit unclear right now. It might be better to wait for a clearer signal.",
    timestamp: "3 hours ago",
    stocks: ["TSLA"]
  },
  {
    id: "3",
    type: "tip",
    title: "Tech Sector Momentum",
    message: "IT sector showing strong momentum this week due to positive earnings outlook.",
    timestamp: "1 day ago",
    stocks: []
  },
  {
    id: "4",
    type: "alert",
    title: "Market Volatility",
    message: "Market volatility is high today. It might be best to avoid sudden decisions right now.",
    timestamp: "1 day ago",
    stocks: ["NVDA"]
  }
];

// Historical price data for charts
export const generatePriceHistory = (basePrice: number, days: number = 30) => {
  const data = [];
  let price = basePrice;
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * (basePrice * 0.02);
    price = Math.max(price + change, basePrice * 0.8);

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 20000000
    });
  }

  return data;
};

export const userProfile = {
  name: "Alex Johnson",
  riskTolerance: "moderate" as const,
  investmentGoal: "growth" as const,
  tradingStyle: "swing" as const,
  experience: "intermediate" as const,
  portfolioValue: 23667.10,
  cashBalance: 5420.50,
  totalInvested: 19200.00
};

// Historical portfolio performance for 1W, 1M, 1Y
export const portfolioPerformanceData = {
  '1W': [
    { date: 'Mon', value: 23150 },
    { date: 'Tue', value: 23280 },
    { date: 'Wed', value: 23100 },
    { date: 'Thu', value: 23450 },
    { date: 'Fri', value: 23667 },
  ],
  '1M': [
    { date: 'Week 1', value: 22800 },
    { date: 'Week 2', value: 23050 },
    { date: 'Week 3', value: 22900 },
    { date: 'Week 4', value: 23667 },
  ],
  '1Y': [
    { date: 'Jan', value: 19500 },
    { date: 'Feb', value: 20100 },
    { date: 'Mar', value: 19800 },
    { date: 'Apr', value: 20500 },
    { date: 'May', value: 21200 },
    { date: 'Jun', value: 21500 },
    { date: 'Jul', value: 22000 },
    { date: 'Aug', value: 21800 },
    { date: 'Sep', value: 22300 },
    { date: 'Oct', value: 22900 },
    { date: 'Nov', value: 23400 },
    { date: 'Dec', value: 23667 },
  ]
};

// Asset Allocation for general portfolio distribution
export const assetAllocationData = [
  { name: 'Stocks', value: 15400, percentage: 65.1 },
  { name: 'ETFs', value: 4500, percentage: 19.0 },
  { name: 'Crypto', value: 1200, percentage: 5.1 },
  { name: 'Cash', value: 2567.1, percentage: 10.8 },
];

// Monthly investment tracker
export const monthlyInvestmentData = [
  { month: 'Oct', invested: 1200 },
  { month: 'Nov', invested: 1500 },
  { month: 'Dec', invested: 800 },
  { month: 'Jan', invested: 2000 },
  { month: 'Feb', invested: 1400 },
  { month: 'Mar', invested: 900 },
];

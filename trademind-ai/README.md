# TradeMind AI

An AI-powered trading companion with portfolio management, market analysis, and personalized investment insights.

## Features

### 🎨 Dark/Light Theme
- Toggle between dark and light modes
- Persistent theme preference
- Purple accent design (#7c3aed)

### 📊 Dashboard
- Portfolio overview with performance charts
- AI-generated insights and recommendations
- Trending stocks and market news
- Real-time gain/loss tracking

### 💬 AI Trading Advisor
- Interactive chat interface
- Personalized stock analysis
- Risk-based recommendations
- Entry/exit strategy suggestions

### 💼 Portfolio Management
- Detailed holdings table
- Allocation pie chart
- Performance tracking
- Gain/loss visualization

### 📈 Market Analysis
- Stock search and research
- Interactive price charts (1D to 1Y)
- Technical indicators (RSI, Moving Averages)
- Analyst ratings and price targets

### ⚙️ Settings
- Investment goals configuration
- Risk tolerance adjustment
- Trading style preferences
- Notification management

## Tech Stack

- **React 18** + TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Radix UI** for accessible components

## Getting Started

### Installation

```bash
cd trademind-ai/frontend
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
```

## Project Structure

```
trademind-ai/frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AIAdvisor.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── MarketAnalysis.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Layout.tsx
│   │   └── data/
│   │       └── mockData.ts
│   └── styles/
│       └── theme.css
└── package.json
```

## Key Features Explained

**Dashboard**: Quick overview of portfolio performance, AI insights, and market trends

**AI Advisor**: Ask questions about stocks, get personalized recommendations based on your risk profile

**Portfolio**: Track all holdings, view allocation, and monitor gains/losses

**Market Analysis**: Research stocks with charts, technical indicators, and AI-powered analysis

**Settings**: Customize your experience by setting investment goals, risk tolerance, and trading style

## Color Palette

### Dark Mode
- Background: `#0d0d1a`
- Cards: `#1a1a2e`
- Primary: `#7c3aed` (purple)
- Success: `#10b981` (green)
- Danger: `#ef4444` (red)

### Light Mode
- Background: `#f8f9fc`
- Cards: `#ffffff`
- Primary: `#7c3aed` (purple)
- Headings: `#4c1d95` (dark purple)

## Current Status

This is a frontend demo using mock data. Future enhancements will include:
- Real-time market data integration
- Live trading execution
- Backend API connection
- User authentication

## License

MIT

---

**Built with ❤️ for smarter trading decisions**

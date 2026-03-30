import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Bot, User, TrendingUp, AlertTriangle, Lightbulb, Activity, Target, ShieldAlert, LineChart } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface StructuredData {
  recommendation: 'Buy' | 'Hold' | 'Avoid';
  confidenceScore: number;
  keyReasons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  suggestedAllocation?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  stocks?: string[];
  structuredData?: StructuredData;
}

export function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Trading Advisor. I've synced with your portfolio and noticed you hold **40% Tech** and **20% Financials**. \n\nI can help you analyze your portfolio, evaluate stocks, and answer your investing questions. How can we optimize your strategy today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiResponses: { [key: string]: Message } = {
    'default': {
      id: '',
      role: 'assistant',
      content: "I've analyzed that from multiple angles. Based on your current portfolio consisting of heavy Tech exposure, I'd suggest reviewing sector correlation before making a move. Can we narrow down your focus to a specific sector or ticker?",
      timestamp: new Date(),
    },
    'reliance|ril': {
      id: '',
      role: 'assistant',
      content: "Reliance Industries (RIL) is trading near strong support levels. Considering their ongoing expansion in retail and telecom, it continues to show fundamental strength. Here is my structured analysis:",
      timestamp: new Date(),
      stocks: ['RIL'],
      structuredData: {
        recommendation: 'Buy',
        confidenceScore: 82,
        keyReasons: [
          "Retail segment EBITDA margin expansion by 120bps",
          "Telecom ARPU (Average Revenue Per User) growth",
          "Trading at favorable valuation compared to historical P/E"
        ],
        riskLevel: 'Low',
        suggestedAllocation: '3-5% of portfolio',
        sentiment: 'bullish'
      }
    },
    'down today|portfolio down': {
      id: '',
      role: 'assistant',
      content: "Your portfolio is down 1.2% today primarily due to pressure on the Technology sector. CPI data released this morning showed higher-than-expected inflation, triggering a broad market sell-off in growth stocks.\n\nHowever, your Financial holdings (like HDFC) are up 0.5%, acting as a hedge. I don't recommend panic selling. If anything, this presents a buying opportunity for quality tech names over a 6-month horizon.",
      timestamp: new Date(),
    },
    'sectors|performing well': {
      id: '',
      role: 'assistant',
      content: "This week, Defensive and Value sectors are outperforming due to macroeconomic uncertainty. Specifically:\n\n1. **Consumer Staples (+2.4%)** - Investors shifting to cash-generating businesses.\n2. **Energy (+1.8%)** - Crude oil prices stabilizing around $82/bbl.\n3. **Healthcare (+1.1%)** - Solid earnings beats from pharma majors.\n\nGiven your portfolio is overweight on Tech, you might consider rotating some profits into Healthcare for better risk-adjusted returns.",
      timestamp: new Date(),
    },
    'risky|risk': {
      id: '',
      role: 'assistant',
      content: "Looking at your connected portfolio, your overall risk beta is 1.35 (which is 35% more volatile than the broader market). \n\nThe main source of risk is your high concentration in Mid-Cap IT and Green Energy stocks. While they offer high growth, they are vulnerable to interest rate hikes.",
      timestamp: new Date(),
      structuredData: {
        recommendation: 'Hold',
        confidenceScore: 78,
        keyReasons: [
          "Beta is above desired 1.1 threshold",
          "Overweight in high-beta sectors",
          "Not enough defensive allocation (e.g., FMCG, Pharma)"
        ],
        riskLevel: 'High',
        suggestedAllocation: 'Rebalance to increase large-cap exposure'
      }
    }
  };

  const getAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();

    for (const [key, response] of Object.entries(aiResponses)) {
      const keywords = key.split('|');
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return { ...response, id: Date.now().toString() };
      }
    }

    return { ...aiResponses.default, id: Date.now().toString() };
  };

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (text === input) setInput("");

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage = getAIResponse(text);
      setMessages(prev => [...prev, aiMessage]);
    }, 1200);
  };

  const quickActions = [
    { label: "Analyze My Portfolio", icon: <Target className="w-4 h-4 mr-2 text-blue-400" /> },
    { label: "Suggest Stocks", icon: <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" /> },
    { label: "Identify Risky Holdings", icon: <ShieldAlert className="w-4 h-4 mr-2 text-red-400" /> },
    { label: "Market Trend Summary", icon: <Activity className="w-4 h-4 mr-2 text-green-400" /> }
  ];

  const examplePrompts = [
    "Should I buy Reliance now?",
    "Why is my portfolio down today?",
    "What sectors are performing well this week?",
    "Is my portfolio too risky?"
  ];

  const renderStructuredDataCard = (data: StructuredData) => {
    const recColors = {
      Buy: 'bg-green-500/10 text-green-400 border-green-500/30',
      Hold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      Avoid: 'bg-red-500/10 text-red-400 border-red-500/30',
    };

    const riskColors = {
      Low: 'text-green-400',
      Medium: 'text-yellow-400',
      High: 'text-red-400',
    };

    return (
      <Card className="mt-4 p-5 bg-card border border-border/50 rounded-xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Recommendation:</span>
            <Badge variant="outline" className={`${recColors[data.recommendation]} px-3 py-1 font-semibold`}>
              {data.recommendation}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Risk Level:</span>
            <span className={`text-sm font-bold ${riskColors[data.riskLevel]}`}>{data.riskLevel}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground font-medium">AI Confidence Score</span>
            <span className="text-sm font-bold text-primary">{data.confidenceScore}%</span>
          </div>
          <Progress value={data.confidenceScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <span className="text-sm text-muted-foreground font-medium">Key Reasons:</span>
          <ul className="space-y-1">
            {data.keyReasons.map((reason, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-foreground/90">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {data.suggestedAllocation && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Suggested Allocation:</span>
            <span className="text-sm font-semibold">{data.suggestedAllocation}</span>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-purple-400">AI Trading Advisor</h2>
        <p className="text-muted-foreground mt-1">Your intelligent copilot for portfolio analysis and market insights</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col bg-card border-border shadow-md">
          {/* Quick Actions Bar */}
          <div className="p-4 border-b border-border bg-muted/20 overflow-x-auto flex gap-3 hide-scrollbar">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="whitespace-nowrap rounded-full bg-background border-border/60 hover:bg-muted"
                onClick={() => handleSend(action.label)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${message.role === 'user'
                    ? 'bg-primary'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`rounded-2xl p-4 shadow-sm ${message.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-muted/40 text-foreground border border-border/50 rounded-tl-none'
                    }`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {message.stocks && message.stocks.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {message.stocks.map((stock) => (
                          <Badge key={stock} variant="secondary" className="text-xs bg-background">
                            {stock}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {message.structuredData && renderStructuredDataCard(message.structuredData)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 px-1 font-medium">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-muted/10 border-t border-border mt-auto">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mr-2 self-center">Try asking:</span>
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-background border border-border hover:border-primary/50 hover:text-primary transition-colors text-muted-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center bg-background border border-border focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all rounded-xl p-1.5 pl-4 shadow-sm">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your AI Copilot about stocks or portfolio performance..."
                className="flex-1 border-0 focus-visible:ring-0 shadow-none bg-transparent"
              />
              <Button onClick={() => handleSend()} size="icon" className="rounded-lg h-10 w-10 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

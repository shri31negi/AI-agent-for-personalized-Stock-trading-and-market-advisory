const { spawn } = require('child_process');
const path = require('path');

class AIIntegrationService {
  constructor() {
    // Use full path to ensure Node.js child_process finds the correct Python
    // regardless of Windows PATH differences between terminal and spawned processes
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.aiModulePath = path.join(__dirname, '../../ai_integration');
  }

  async buildUserProfile(userData) {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [
        path.join(this.aiModulePath, 'main.py')
      ]);

      const input = JSON.stringify({
        action: 'profile',
        data: userData
      });

      let result = '';
      let error = '';

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.stdin.write(input);
      python.stdin.end();

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

      setTimeout(() => {
        python.kill();
        reject(new Error('AI service timeout'));
      }, 30000);
    });
  }

  async generateRecommendation(profile, marketData, portfolioValue) {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [
        path.join(this.aiModulePath, 'main.py')
      ]);

      const input = JSON.stringify({
        action: 'recommend',
        data: {
          profile,
          market_data: marketData,
          portfolio_value: portfolioValue
        }
      });

      let result = '';
      let error = '';

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.stdin.write(input);
      python.stdin.end();

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

      setTimeout(() => {
        python.kill();
        reject(new Error('AI service timeout'));
      }, 30000);
    });
  }

  mapInputToProfileData(input) {
    const riskMap = {
      'low': { trades: 3, position_size: 5, volatility: 0.10, drawdown: 8 },
      'medium': { trades: 10, position_size: 12, volatility: 0.20, drawdown: 15 },
      'high': { trades: 20, position_size: 20, volatility: 0.35, drawdown: 25 }
    };

    const horizonMap = {
      'short': 'short',
      'medium': 'medium',
      'long': 'long'
    };

    const risk = riskMap[input.risk_preference] || riskMap['medium'];

    return {
      trades_per_month: risk.trades,
      avg_position_size_pct: risk.position_size,
      portfolio_value: input.investment_amount,
      uses_leverage: input.risk_preference === 'high',
      leverage_ratio: input.risk_preference === 'high' ? 1.5 : 1.0,
      asset_classes: input.risk_preference === 'high' ? ['stocks', 'options'] : ['stocks', 'bonds'],
      portfolio_volatility: risk.volatility,
      max_drawdown_tolerance: risk.drawdown,
      age: input.age,
      experience_years: this.estimateExperience(input.age, input.monthly_income),
      investment_horizon: horizonMap[input.investment_horizon] || 'medium',
      win_rate: 0.55,
      uses_stop_loss: true,
      stop_loss_adherence: 0.80,
      monthly_income: input.monthly_income,
      financial_goal: input.financial_goal
    };
  }

  async getMarketDataAction(subAction, symbol = null, period = '1mo') {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [
        path.join(this.aiModulePath, 'main.py')
      ]);

      const input = JSON.stringify({
        action: 'market_data',
        data: {
          sub_action: subAction,
          symbol,
          period
        }
      });

      let result = '';
      let error = '';

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.stdin.write(input);
      python.stdin.end();

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
    });
  }

  async getPrediction(symbol, modelType = 'arima') {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [
        path.join(this.aiModulePath, 'main.py')
      ]);

      const input = JSON.stringify({
        action: 'predict',
        data: {
          symbol,
          model_type: modelType
        }
      });

      let result = '';
      let error = '';

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.stdin.write(input);
      python.stdin.end();

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
    });
  }

  estimateExperience(age, income) {
    if (age < 25) return 1;
    if (age < 30) return 2;
    if (age < 40 && income > 100000) return 5;
    if (age < 40) return 3;
    if (age < 50) return 7;
    return 10;
  }

  async getMarketData() {
    try {
      const result = await this.getMarketDataAction('trending');
      if (result.success) {
        return {
          stocks: result.data,
          conditions: {
            trend: 'bullish',
            volatility: 'medium'
          }
        };
      }
      throw new Error(result.error);
    } catch (error) {
      console.error('Error in getMarketData:', error);
      // Fallback to mock data if AI service fails
      return {
        stocks: [
          { symbol: 'AAPL', price: 175, volatility: 0.22, beta: 1.2, momentum: 0.15, pe_ratio: 28, growth_rate: 0.12, dividend_yield: 0.005 },
          { symbol: 'MSFT', price: 380, volatility: 0.20, beta: 1.1, momentum: 0.18, pe_ratio: 32, growth_rate: 0.15, dividend_yield: 0.008 }
        ],
        conditions: { trend: 'bullish', volatility: 'medium' }
      };
    }
  }
}

module.exports = new AIIntegrationService();

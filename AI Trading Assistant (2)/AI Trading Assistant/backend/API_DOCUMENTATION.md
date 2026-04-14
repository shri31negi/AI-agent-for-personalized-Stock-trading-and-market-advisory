# TradeMind AI - API Documentation

## Pre-Login Portfolio Builder System

### Guest Portfolio Builder

#### POST /api/guest/build-portfolio

Build investor profile and portfolio recommendation for guest users.

**Request Body:**
```json
{
  "age": 35,
  "monthly_income": 8000,
  "investment_amount": 50000,
  "risk_preference": "medium",
  "investment_horizon": "medium",
  "financial_goal": "retirement"
}
```

**Validation:**
- `age`: 18-100
- `monthly_income`: > 0
- `investment_amount`: >= 1000
- `risk_preference`: "low" | "medium" | "high"
- `investment_horizon`: "short" | "medium" | "long"
- `financial_goal`: string (optional)

**Response:**
```json
{
  "success": true,
  "session_id": "uuid-v4-string",
  "profile": {
    "risk_score": 60,
    "stability_score": 70,
    "discipline_score": 85,
    "profile_type": "Moderate",
    "characteristics": {
      "risk_tolerance": "Medium",
      "recommended_allocation": {
        "stocks": 60,
        "bonds": 30,
        "cash": 10
      },
      "max_position_size": 10,
      "preferred_assets": ["diversified_stocks", "etfs"],
      "trading_frequency": "Medium",
      "description": "Balanced growth and income strategy"
    }
  },
  "portfolio": {
    "allocation": {
      "profile_type": "Moderate",
      "total_value": 50000,
      "allocation": {
        "stocks": {
          "percentage": 60,
          "amount": 30000
        },
        "bonds": {
          "percentage": 30,
          "amount": 15000
        },
        "cash": {
          "percentage": 10,
          "amount": 5000
        }
      }
    },
    "selected_stocks": [
      {
        "symbol": "AAPL",
        "price": 175,
        "volatility": 0.22,
        "beta": 1.2,
        "recommendation_score": 85.5,
        "risk_level": 55
      }
    ],
    "strategy": {
      "name": "Growth & Income",
      "approach": "Blend",
      "rebalancing": "Monthly"
    },
    "recommended_actions": [
      "Mix of growth and value stocks",
      "Sector rotation based on trends"
    ]
  },
  "top_stocks": [
    {
      "symbol": "AAPL",
      "score": 85.5,
      "risk_level": 55
    }
  ]
}
```

#### GET /api/guest/session/:session_id

Retrieve guest session data.

**Response:**
```json
{
  "success": true,
  "profile": { ... },
  "portfolio": { ... },
  "input_data": {
    "age": 35,
    "monthly_income": 8000,
    "investment_amount": 50000,
    "risk_preference": "medium",
    "investment_horizon": "medium",
    "financial_goal": "retirement"
  },
  "created_at": "2024-01-01T00:00:00.000Z",
  "expires_at": "2024-01-02T00:00:00.000Z"
}
```

#### POST /api/guest/refresh-session

Extend guest session expiration.

**Request Body:**
```json
{
  "session_id": "uuid-v4-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session refreshed",
  "expires_at": "2024-01-03T00:00:00.000Z"
}
```

### Authentication with Portfolio Merge

#### POST /api/auth/register

Register new user and optionally merge guest portfolio.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "session_id": "uuid-v4-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "portfolio_merged": true
}
```

#### POST /api/auth/login

Login and optionally merge guest portfolio.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "session_id": "uuid-v4-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "portfolio_merged": true
}
```

### Portfolio Management (Authenticated)

#### POST /api/portfolio/save

Save or update user portfolio.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "profile": { ... },
  "portfolio": { ... },
  "session_id": "uuid-v4-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio saved successfully",
  "profile": { ... }
}
```

#### GET /api/portfolio

Get user portfolio.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "profile": { ... },
  "portfolio": { ... },
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/portfolio/update

Update user portfolio.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "profile": { ... },
  "portfolio": { ... }
}
```

#### DELETE /api/portfolio

Delete user portfolio.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

## Frontend Integration Flow

### 1. Guest Portfolio Builder

```javascript
// Step 1: Build portfolio (no auth required)
const response = await fetch('/api/guest/build-portfolio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age: 35,
    monthly_income: 8000,
    investment_amount: 50000,
    risk_preference: 'medium',
    investment_horizon: 'medium',
    financial_goal: 'retirement'
  })
});

const { session_id, profile, portfolio, top_stocks } = await response.json();

// Step 2: Store session_id in localStorage
localStorage.setItem('guest_session_id', session_id);
```

### 2. Handle Page Refresh

```javascript
// On page load, check for existing session
const sessionId = localStorage.getItem('guest_session_id');

if (sessionId) {
  const response = await fetch(`/api/guest/session/${sessionId}`);
  const data = await response.json();
  
  if (data.success) {
    // Restore portfolio data
    displayPortfolio(data.profile, data.portfolio);
  } else {
    // Session expired, clear localStorage
    localStorage.removeItem('guest_session_id');
  }
}
```

### 3. Login/Register with Portfolio Merge

```javascript
// On login/register, include session_id
const sessionId = localStorage.getItem('guest_session_id');

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    session_id: sessionId
  })
});

const { token, portfolio_merged } = await response.json();

// Store token
localStorage.setItem('auth_token', token);

// Clear guest session
localStorage.removeItem('guest_session_id');

if (portfolio_merged) {
  console.log('Portfolio successfully merged to your account!');
}
```

### 4. Refresh Session (Optional)

```javascript
// Extend session before expiration
const sessionId = localStorage.getItem('guest_session_id');

await fetch('/api/guest/refresh-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session_id: sessionId })
});
```

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Session Management

- Guest sessions expire after 24 hours
- Sessions can be refreshed to extend expiration
- Expired sessions are automatically deleted from database
- Merged sessions are marked and retained for audit purposes

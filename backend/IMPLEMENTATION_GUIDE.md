# Pre-Login Portfolio Builder - Implementation Guide

## System Architecture

```
┌─────────────────┐
│  Guest User     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  POST /api/guest/build-portfolio        │
│  - Collect user input                   │
│  - Call AI profiling service            │
│  - Generate portfolio recommendation    │
│  - Create guest session                 │
│  - Return session_id + portfolio        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Guest Session Storage (MongoDB)        │
│  - session_id (UUID)                    │
│  - profile (AI generated)               │
│  - portfolio (AI generated)             │
│  - input_data (user input)              │
│  - expires_at (24 hours)                │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Frontend: Store session_id             │
│  localStorage.setItem('guest_session')  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  User Logs In / Registers               │
│  POST /api/auth/login                   │
│  - Include session_id in request        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Merge Guest Portfolio                  │
│  - Fetch guest session                  │
│  - Create/Update InvestorProfile        │
│  - Link to user_id                      │
│  - Mark guest session as merged         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  User Portfolio (Persisted)             │
│  - Linked to user account               │
│  - Available across sessions            │
└─────────────────────────────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install express mongoose bcryptjs jsonwebtoken uuid dotenv cors
```

### 2. Environment Variables

Create `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/trademind
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or local installation
mongod --dbpath /path/to/data
```

### 4. Start Backend Server

```bash
cd backend
node server.js
```

### 5. Start AI Service

```bash
cd ai_integration
python api_server.py
```

## Database Schemas

### GuestSession Collection

```javascript
{
  _id: ObjectId,
  session_id: "uuid-v4-string",
  profile: {
    risk_score: 60,
    stability_score: 70,
    discipline_score: 85,
    profile_type: "Moderate",
    characteristics: { ... },
    metadata: { ... }
  },
  portfolio: {
    allocation: { ... },
    selected_stocks: [ ... ],
    strategy: { ... }
  },
  input_data: {
    age: 35,
    monthly_income: 8000,
    investment_amount: 50000,
    risk_preference: "medium",
    investment_horizon: "medium",
    financial_goal: "retirement"
  },
  created_at: ISODate("2024-01-01T00:00:00Z"),
  expires_at: ISODate("2024-01-02T00:00:00Z"),
  merged_to_user: false,
  user_id: null
}
```

### InvestorProfile Collection

```javascript
{
  _id: ObjectId,
  user_id: ObjectId("user-id"),
  profile: { ... },
  portfolio: { ... },
  created_at: ISODate("2024-01-01T00:00:00Z"),
  updated_at: ISODate("2024-01-01T00:00:00Z"),
  from_guest_session: true
}
```

## Frontend Implementation

### React Example

```jsx
import { useState, useEffect } from 'react';

function PortfolioBuilder() {
  const [sessionId, setSessionId] = useState(null);
  const [portfolio, setPortfolio] = useState(null);

  // Load existing session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('guest_session_id');
    if (savedSessionId) {
      loadGuestSession(savedSessionId);
    }
  }, []);

  const buildPortfolio = async (formData) => {
    const response = await fetch('/api/guest/build-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (data.success) {
      setSessionId(data.session_id);
      setPortfolio(data);
      localStorage.setItem('guest_session_id', data.session_id);
    }
  };

  const loadGuestSession = async (sessionId) => {
    const response = await fetch(`/api/guest/session/${sessionId}`);
    const data = await response.json();
    
    if (data.success) {
      setPortfolio(data);
      setSessionId(sessionId);
    } else {
      localStorage.removeItem('guest_session_id');
    }
  };

  const handleLogin = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        session_id: sessionId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('auth_token', data.token);
      localStorage.removeItem('guest_session_id');
      
      if (data.portfolio_merged) {
        alert('Your portfolio has been saved to your account!');
      }
    }
  };

  return (
    <div>
      {!portfolio ? (
        <PortfolioForm onSubmit={buildPortfolio} />
      ) : (
        <PortfolioDisplay 
          portfolio={portfolio} 
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
```

### Vanilla JavaScript Example

```javascript
// Build portfolio
async function buildPortfolio(formData) {
  const response = await fetch('/api/guest/build-portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('guest_session_id', data.session_id);
    displayPortfolio(data);
  }
}

// Check for existing session on page load
window.addEventListener('DOMContentLoaded', async () => {
  const sessionId = localStorage.getItem('guest_session_id');
  
  if (sessionId) {
    const response = await fetch(`/api/guest/session/${sessionId}`);
    const data = await response.json();
    
    if (data.success) {
      displayPortfolio(data);
    } else {
      localStorage.removeItem('guest_session_id');
    }
  }
});

// Login with portfolio merge
async function login(email, password) {
  const sessionId = localStorage.getItem('guest_session_id');
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      session_id: sessionId
    })
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('auth_token', data.token);
    localStorage.removeItem('guest_session_id');
    
    if (data.portfolio_merged) {
      showNotification('Portfolio saved to your account!');
    }
  }
}
```

## Testing

### Test Guest Portfolio Builder

```bash
curl -X POST http://localhost:5000/api/guest/build-portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "monthly_income": 8000,
    "investment_amount": 50000,
    "risk_preference": "medium",
    "investment_horizon": "medium",
    "financial_goal": "retirement"
  }'
```

### Test Session Retrieval

```bash
curl http://localhost:5000/api/guest/session/{session_id}
```

### Test Login with Merge

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "session_id": "{session_id}"
  }'
```

## Cleanup Tasks

### Auto-Delete Expired Sessions

MongoDB TTL index automatically deletes expired sessions.

### Manual Cleanup Script

```javascript
// cleanup.js
const GuestSession = require('./models/GuestSession');

async function cleanupExpiredSessions() {
  const result = await GuestSession.deleteMany({
    expires_at: { $lt: new Date() },
    merged_to_user: false
  });
  
  console.log(`Deleted ${result.deletedCount} expired sessions`);
}

// Run daily
setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000);
```

## Security Considerations

1. **Session ID**: Use UUID v4 for unpredictable session IDs
2. **Expiration**: Sessions expire after 24 hours
3. **Rate Limiting**: Implement rate limiting on guest endpoints
4. **Input Validation**: Validate all user inputs
5. **CORS**: Configure CORS properly for production
6. **HTTPS**: Use HTTPS in production

## Performance Optimization

1. **Caching**: Cache market data for 5-10 minutes
2. **Indexing**: Add indexes on session_id and expires_at
3. **Connection Pooling**: Use MongoDB connection pooling
4. **AI Service**: Consider process pooling for Python calls
5. **CDN**: Serve static assets from CDN

## Monitoring

```javascript
// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Track guest portfolio conversions
async function trackConversion(sessionId, userId) {
  // Log to analytics service
  console.log(`Guest session ${sessionId} converted to user ${userId}`);
}
```

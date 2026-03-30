# Authentication Flow Testing Guide

## Overview
The TradeMind AI application now has a complete authentication flow with signup, login, and onboarding.

## Flow Diagram

### New User Flow:
1. Visit app → Redirected to `/signup`
2. Fill signup form → Click "Create Account"
3. Redirected to `/onboarding`
4. Complete 5-question quiz
5. Redirected to `/dashboard`

### Returning User Flow:
1. Visit app → Redirected to `/login`
2. Enter credentials → Click "Log In"
3. Redirected to `/dashboard`

## Testing Instructions

### Test 1: New User Signup
1. Open http://localhost:5173
2. You should see the Signup page
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Phone: (optional)
4. Click "Create Account"
5. You should be redirected to Onboarding

### Test 2: Onboarding Quiz
1. After signup, you should see the welcome screen
2. Click "Let's Begin"
3. Answer the 5 questions:
   - Investment experience level
   - Risk tolerance
   - Investment goal
   - Monthly investment range
   - Investment time horizon
4. Click "Complete Setup"
5. You should be redirected to the Dashboard

### Test 3: Logout
1. From the Dashboard, click "Logout" in the sidebar
2. You should be redirected to the Login page
3. localStorage should be cleared

### Test 4: Returning User Login
1. After logout, you should see the Login page
2. Enter any email and password
3. Click "Log In"
4. You should be redirected to the Dashboard (skipping onboarding)

### Test 5: Direct URL Access
1. Try accessing `/dashboard` directly without login
2. You should be redirected to `/signup`
3. Try accessing `/onboarding` without signup
4. You should be redirected to `/signup`

## Features

### Signup Page
- Required fields: Full Name, Email, Password
- Optional field: Phone Number
- Password validation (min 8 characters)
- Email format validation
- Link to Login page

### Login Page
- Required fields: Email, Password
- "Forgot Password" link (placeholder)
- Link to Signup page
- Auto-redirect based on user status

### Onboarding Quiz
- Welcome screen with progress bar
- 5 questions with radio/select inputs
- Back/Next navigation
- Skip option (redirects to dashboard)
- Saves investor profile to localStorage

### Protected Routes
- Dashboard, AI Advisor, Portfolio, Market, Settings
- All require authentication
- Auto-redirect to signup if not authenticated
- Auto-redirect to onboarding if profile incomplete

### Logout
- Clears user data from localStorage
- Redirects to login page
- Accessible from sidebar

## Data Storage (Demo)

All data is stored in localStorage:
- `user`: User account info (name, email, phone, isNewUser flag)
- `investorProfile`: Onboarding quiz responses
- `darkMode`: Theme preference

## Next Steps for Production

1. Replace localStorage with API calls
2. Implement actual authentication (JWT tokens)
3. Add password reset functionality
4. Add email verification
5. Add session management
6. Add form validation on backend
7. Add loading states during API calls
8. Add error handling for failed requests

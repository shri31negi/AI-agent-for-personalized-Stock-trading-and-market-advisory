#!/usr/bin/env node
/**
 * TradeMind AI - Integration Test Script
 * Tests all API endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let sessionId = null;
let authToken = null;

console.log('='.repeat(60));
console.log('TradeMind AI - Integration Test');
console.log('='.repeat(60));

async function testHealthCheck() {
  console.log('\n1️⃣  Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testGuestPortfolioBuilder() {
  console.log('\n2️⃣  Testing Guest Portfolio Builder...');
  try {
    const response = await axios.post(`${BASE_URL}/api/guest/build-portfolio`, {
      age: 35,
      monthly_income: 8000,
      investment_amount: 50000,
      risk_preference: 'medium',
      investment_horizon: 'medium',
      financial_goal: 'retirement'
    });
    
    console.log('✅ Portfolio Built Successfully!');
    console.log('   Session ID:', response.data.session_id);
    console.log('   Profile Type:', response.data.profile?.profile_type);
    console.log('   Risk Score:', response.data.profile?.risk_score);
    console.log('   Top Stocks:', response.data.top_stocks?.length || 0);
    
    sessionId = response.data.session_id;
    return true;
  } catch (error) {
    console.error('❌ Portfolio Builder Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetGuestSession() {
  console.log('\n3️⃣  Testing Get Guest Session...');
  if (!sessionId) {
    console.log('⚠️  Skipped - No session ID available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/guest/session/${sessionId}`);
    console.log('✅ Session Retrieved Successfully!');
    console.log('   Profile Type:', response.data.profile?.profile_type);
    console.log('   Created At:', response.data.created_at);
    return true;
  } catch (error) {
    console.error('❌ Get Session Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRegister() {
  console.log('\n4️⃣  Testing User Registration...');
  try {
    const testEmail = `test${Date.now()}@example.com`;
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User',
      email: testEmail,
      password: 'TestPassword123!',
      session_id: sessionId
    });
    
    console.log('✅ Registration Successful!');
    console.log('   User ID:', response.data.user?.id);
    console.log('   Portfolio Merged:', response.data.portfolio_merged);
    
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error('❌ Registration Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetPortfolio() {
  console.log('\n5️⃣  Testing Get User Portfolio...');
  if (!authToken) {
    console.log('⚠️  Skipped - No auth token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/portfolio`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Portfolio Retrieved Successfully!');
    console.log('   Profile Type:', response.data.profile?.profile_type);
    console.log('   Risk Score:', response.data.profile?.risk_score);
    return true;
  } catch (error) {
    console.error('❌ Get Portfolio Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMarketData() {
  console.log('\n6️⃣  Testing Market Data...');
  try {
    const response = await axios.get(`${BASE_URL}/api/market/quote/AAPL`);
    console.log('✅ Market Data Retrieved!');
    console.log('   Symbol:', response.data.symbol);
    return true;
  } catch (error) {
    console.error('❌ Market Data Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testNews() {
  console.log('\n7️⃣  Testing News Feed...');
  try {
    const response = await axios.get(`${BASE_URL}/api/news`);
    console.log('✅ News Retrieved!');
    console.log('   Articles:', response.data.length);
    return true;
  } catch (error) {
    console.error('❌ News Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Starting Integration Tests...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    guestPortfolio: await testGuestPortfolioBuilder(),
    getSession: await testGetGuestSession(),
    register: await testRegister(),
    getPortfolio: await testGetPortfolio(),
    marketData: await testMarketData(),
    news: await testNews()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Results Summary');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Tests Passed: ${passed}/${total}`);
  console.log('='.repeat(60));
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! System is fully operational.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.\n');
  }
}

// Wait for server to start
setTimeout(() => {
  runTests().catch(error => {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  });
}, 2000);

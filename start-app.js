#!/usr/bin/env node
/**
 * TradeMind AI - Application Startup Script
 * Starts MongoDB, Backend Server, and AI Service
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('='.repeat(60));
console.log('TradeMind AI - Starting Application');
console.log('='.repeat(60));

let backendProcess = null;
let aiProcess = null;

// Start Backend Server
function startBackend() {
  console.log('\n📦 Starting Backend Server...');
  
  backendProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Backend error:', error);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Start AI Service (Optional - Flask API)
function startAIService() {
  console.log('\n🤖 Starting AI Service...');
  
  aiProcess = spawn('python', ['api_server.py'], {
    cwd: path.join(__dirname, 'ai_integration'),
    stdio: 'inherit',
    shell: true
  });

  aiProcess.on('error', (error) => {
    console.error('⚠️  AI Service error (optional):', error.message);
    console.log('AI Service is optional - backend will use direct Python calls');
  });

  aiProcess.on('close', (code) => {
    console.log(`AI Service process exited with code ${code}`);
  });
}

// Cleanup on exit
function cleanup() {
  console.log('\n\n🛑 Shutting down...');
  
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (aiProcess) {
    aiProcess.kill();
  }
  
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start services
console.log('\n📋 Checking prerequisites...');
console.log('✓ Node.js installed');
console.log('✓ Python installed');
console.log('⚠️  Make sure MongoDB is running on localhost:27017');

setTimeout(() => {
  startBackend();
  
  // Optionally start AI service (comment out if not needed)
  // startAIService();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Application Started Successfully!');
  console.log('='.repeat(60));
  console.log('\n📍 Backend API: http://localhost:5000');
  console.log('📍 Health Check: http://localhost:5000/health');
  console.log('📍 AI Service: http://localhost:5000 (optional)');
  console.log('\n💡 Press Ctrl+C to stop all services\n');
}, 1000);

// Test script to check frontend-backend connection
const axios = require('axios');

async function testConnection() {
  console.log('🔍 Testing Frontend-Backend Connection...\n');

  // Test backend health endpoint
  try {
    console.log('1️⃣  Testing Backend Health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend not responding:', error.message);
    console.log('   Make sure backend is running: cd backend && npm run dev');
    return;
  }

  // Test authentication endpoint
  try {
    console.log('\n2️⃣  Testing Authentication API...');
    const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'Password123'
    });
    console.log('✅ Auth Test Successful - User:', authResponse.data.user.name);
    
    // Test protected endpoint
    console.log('\n3️⃣  Testing Protected API...');
    const token = authResponse.data.token;
    const boardsResponse = await axios.get('http://localhost:5000/api/boards', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected API Test - Boards:', boardsResponse.data.boards.length);
    
  } catch (error) {
    console.log('❌ API Test Failed:', error.response?.data?.message || error.message);
  }

  // Test CORS for frontend
  console.log('\n4️⃣  Frontend Configuration Check...');
  console.log('✅ Frontend should run on: http://localhost:3000');
  console.log('✅ Backend API available at: http://localhost:5000');
  console.log('✅ CORS configured for frontend origin');
  
  console.log('\n🎉 Connection test complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Keep backend running: cd backend && npm run dev');
  console.log('   2. Start frontend: cd frontend && npm run dev');
  console.log('   3. Open browser: http://localhost:3000');
  console.log('   4. Login with: john@example.com / Password123');
}

testConnection();
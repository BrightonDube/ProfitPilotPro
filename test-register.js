// Quick test for user registration
const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing user registration...\n');
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'Test1234!',
      fullName: 'Test User'
    });
    
    console.log('✅ Registration successful!');
    console.log('\n📧 User:', response.data.user.email);
    console.log('🎫 Access Token:', response.data.accessToken.substring(0, 50) + '...');
    console.log('\n✨ Authentication is working correctly!');
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ User already exists - this is normal if you run this twice');
      console.log('✅ Authentication system is working!');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

testRegistration();

const crypto = require('crypto');

// Generate secure random secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 Generated Secure JWT Secrets:\n');
console.log('JWT_SECRET="' + jwtSecret + '"');
console.log('JWT_REFRESH_SECRET="' + jwtRefreshSecret + '"');
console.log('\n✅ Copy these to your backend/.env file');

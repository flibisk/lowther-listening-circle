const bcrypt = require('bcryptjs');

// Generate a secure password hash
async function generateHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('Usage: node generate-admin-hash.js <password>');
    process.exit(1);
  }
  
  const saltRounds = 12; // High security
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('\n🔐 Admin Password Hash Generated');
  console.log('================================');
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('\n📝 Add this to your .env.local file:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log('\n⚠️  Keep this hash secure and never commit it to version control!');
}

generateHash().catch(console.error);

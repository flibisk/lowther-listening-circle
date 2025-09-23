const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsers() {
  console.log('Checking all users in database...');
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        refCode: true,
        createdAt: true
      }
    });
    
    console.log('Total users found:', users.length);
    console.log('Users:', users);
    
    if (users.length === 0) {
      console.log('No users found in database!');
    } else {
      console.log('Users found:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}, ${user.tier}) - Ref: ${user.refCode}`);
      });
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();

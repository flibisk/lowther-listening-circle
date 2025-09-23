const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsersStatus() {
  console.log('Checking users status...');
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        role: true,
        tier: true,
        isApproved: true,
        approvedAt: true,
        createdAt: true
      }
    });
    
    console.log('Total users found:', users.length);
    console.log('Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - Name: ${user.fullName || user.name || 'N/A'}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Tier: ${user.tier}`);
      console.log(`   - Approved: ${user.isApproved}`);
      console.log(`   - Created: ${user.createdAt}`);
      console.log(`   - Approved At: ${user.approvedAt || 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsersStatus();

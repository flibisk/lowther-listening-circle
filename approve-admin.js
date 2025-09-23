const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveAdmin() {
  console.log('Approving admin user...');
  try {
    const adminUser = await prisma.user.update({
      where: { email: 'admin@lowtherlisteningcircle.com' },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        role: 'ADMIN',
        tier: 'AMBASSADOR'
      }
    });
    
    console.log('Admin user updated:', adminUser);
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveAdmin();

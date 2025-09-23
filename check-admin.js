const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  console.log('Checking admin user...');
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@lowtherlisteningcircle.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        refCode: true
      }
    });
    
    console.log('Admin user:', adminUser);
    
    if (!adminUser) {
      console.log('Admin user not found!');
    } else if (adminUser.role !== 'ADMIN') {
      console.log('Admin user role is not ADMIN:', adminUser.role);
    } else {
      console.log('Admin user is correctly configured');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

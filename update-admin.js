const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateAdmin() {
  try {
    console.log('Updating admin user...')
    
    // Update the existing admin user
    const user = await prisma.user.update({
      where: { email: "admin@lowtherlisteningcircle.com" },
      data: { 
        role: "ADMIN",
        tier: "AMBASSADOR"
      }
    })
    
    console.log('Admin user updated:', user)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdmin()

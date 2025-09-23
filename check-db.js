const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('Checking database...')
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        refCode: true
      }
    })
    console.log('Users:', users)
    
    // Check clicks
    const clicks = await prisma.click.findMany({
      select: {
        id: true,
        userId: true,
        url: true,
        createdAt: true
      }
    })
    console.log('Clicks:', clicks)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()

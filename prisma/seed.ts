import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  // Admin placeholder
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lowtherlisteningcircle.com' },
    update: {},
    create: {
      email: 'admin@lowtherlisteningcircle.com',
      name: 'Admin',
      role: 'ADMIN',
      tier: 'AMBASSADOR',
      refCode: 'LW-ADMIN'
    }
  })
  // Optional global rule examples
  await prisma.commissionRule.upsert({
    where: { id: 'storewide' },
    update: {},
    create: { id: 'storewide', scope: 'storewide', rateType: 'percent', rateValue: 0.10, active: true }
  })
  console.log('Seed complete', admin.email)
}
main().finally(()=>prisma.$disconnect())

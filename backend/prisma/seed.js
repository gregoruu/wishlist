import 'dotenv/config'
import pkg from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const { PrismaClient } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  const existing = await prisma.user.findFirst()
  if (existing) {
    console.log("Skip")
    return
  }

  console.log("Seeding test data.")

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "hashedpassword",
      name: "Gregor",
      address: "Tartu",
    },
  })

  const wishlist = await prisma.wishlist.create({
    data: {
      ownerId: user.id,
      title: "Christmas Wishlist",
      description: "All items I want for christmas",
    },
  })

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      name: "Nintendo Switch",
      price: 299.99,
      description: "Gaming console",
      link: "https://example.com",
    },
  })

  console.log("Seed completed")
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })

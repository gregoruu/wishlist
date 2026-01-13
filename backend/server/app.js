import express from 'express'
import cors from 'cors'
import { prisma } from './prisma.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/wishlists', async (req, res) => {
  try {
    const wishlists = await prisma.wishlist.findMany({
      include: {
        items: true,
      },
      orderBy: { id: 'asc' }
    })

    const formatted = wishlists.map(w => ({
      id: w.id,
      owner_id: w.ownerId,
      title: w.title,
      description: w.description,
      created_at: w.createdAt,
      itemCount: w.items.length
    }))

    res.json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

export default app

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const JWT_SECRET = process.env.JWT_SECRET || 'strongestsecretKEY'

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

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, address } = req.body

    if (!email || !password || !name || !address) {
      return res.status(400).json({ error: 'Email, password, adress and name are required' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        address
      }
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2d' }
    )

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address
      },
      token
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2d' }
    )

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address
      },
      token
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken')
  res.json({ message: 'Logged out' })
})

export default app

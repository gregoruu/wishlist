import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma.js'
import puppeteer from 'puppeteer'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const JWT_SECRET = process.env.JWT_SECRET || 'strongestsecretKEY'

const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken || req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

app.get('/api/wishlists', authenticateToken, async (req, res) => {
  try {
    const wishlists = await prisma.wishlist.findMany({
      where: {
        ownerId: req.user.userId
      },
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

app.post('/api/parse-url', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await new Promise(resolve => setTimeout(resolve, 1500))

    const metadata = await page.evaluate(() => {
      const clean = (t) => (t || '').replace(/<[^>]*>/g, '').trim()
      const get = (sel, attr = 'content') =>
        document.querySelector(sel)?.getAttribute(attr) || null

      const og = {
        title: get('meta[property="og:title"]'),
        description: get('meta[property="og:description"]'),
        image: get('meta[property="og:image"]'),
        price:
          get('meta[property="product:price:amount"]') ||
          get('meta[property="og:price:amount"]')
      }

      if (og.title || og.description || og.image || og.price) {
        return {
          title: clean(og.title || ''),
          description: clean(og.description || '').substring(0, 500),
          image: og.image || '',
          price: og.price || ''
        }
      }

      const title =
        clean(document.querySelector('h1')?.innerText ||
        document.title ||
        '')

      const description =
        clean(
          document.querySelector('meta[name="description"]')?.getAttribute('content') ||
          document.querySelector('p')?.innerText ||
          ''
        ).substring(0, 500)

      let image = ''
      const dyn = document.querySelector('img[data-a-dynamic-image]')
      if (dyn) {
        try {
          const obj = JSON.parse(dyn.getAttribute('data-a-dynamic-image'))
          const first = Object.keys(obj)[0]
          if (first) image = first
        } catch (e) {}
      }

      return {
        title,
        description,
        image,
        price: ''
      }
    })

    await browser.close()
    res.json(metadata)

  } catch (err) {
    console.error('Parse error:', err)
    res.json({
      title: '',
      description: '',
      image: '',
      price: '',
      error: 'Could not parse this URL. Please enter details manually.'
    })
  }
})

app.post('/api/wishlists', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        title,
        description: description || null,
        ownerId: req.user.userId
      }
    })

    res.status(201).json(wishlist)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/wishlists/:id/items', authenticateToken, async (req, res) => {
  try {
    const wishlistId = parseInt(req.params.id)
    const { name, price, description, link, image } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId }
    })

    if (!wishlist || wishlist.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId,
        name,
        price: price ? parseFloat(price) : null,
        description: description || null,
        link: link || null,
        image: image || null
      }
    })

    res.status(201).json(item)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default app

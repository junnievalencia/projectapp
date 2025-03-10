require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3001

// File paths for data persistence
const usersFilePath = path.join(__dirname, 'users.json')
const ordersFilePath = path.join(__dirname, 'orders.json')

// Function to save users to file
const saveUsers = () => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
    console.log(`Saved ${users.length} users to storage`)
  } catch (error) {
    console.error('Error saving users to file:', error)
  }
}

// Function to save orders to file
const saveOrders = () => {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify({ orders }, null, 2))
    console.log(`Saved ${orders.length} orders to storage`)
  } catch (error) {
    console.error('Error saving orders to file:', error)
  }
}

// Load users from file or initialize empty array
let users = []
try {
  if (fs.existsSync(usersFilePath)) {
    const userData = fs.readFileSync(usersFilePath, 'utf8')
    users = JSON.parse(userData)
    console.log(`Loaded ${users.length} users from storage`)
  }
} catch (error) {
  console.error('Error loading users from file:', error)
}

// Load orders from file or initialize empty array
let orders = []
try {
  if (fs.existsSync(ordersFilePath)) {
    const ordersData = fs.readFileSync(ordersFilePath, 'utf8')
    orders = JSON.parse(ordersData).orders
    console.log(`Loaded ${orders.length} orders from storage`)
  }
} catch (error) {
  console.error('Error loading orders from file:', error)
}

// Add a test user if no users exist
if (users.length === 0) {
  const testUser = {
    id: '1234567890',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$XQCg1z4YSl5K1PYqQJ3NyeRq8o.WyFyTBtOuhcuYfR1zHnmYRUKPy' // hashed 'password123'
  }
  users.push(testUser)
  saveUsers()
  console.log('Added test user: test@example.com / password123')
}

const otpStore = {}

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Middleware
app.use(cors())
app.use(express.json())

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Auth Routes
// Send OTP route
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with email (with 10 minute expiry)
    otpStore[email] = {
      code: otp,
      expiry: Date.now() + 10 * 60 * 1000 // 10 minutes
    }

    // In a real app, send the OTP via email
    console.log(`OTP for ${email}: ${otp}`)

    res.json({ success: true, message: 'OTP sent successfully' })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ success: false, message: 'Failed to send OTP' })
  }
})

// Verify OTP route (for login)
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' })
    }

    // Check if OTP exists and is valid
    const otpData = otpStore[email]
    if (!otpData || otpData.code !== otp || Date.now() > otpData.expiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' })
    }

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })

    // Clear OTP
    delete otpStore[email]

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ success: false, message: 'Failed to verify OTP' })
  }
})

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    // Check if OTP exists and is valid
    const otpData = otpStore[email]
    if (!otpData || otpData.code !== otp || Date.now() > otpData.expiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' })
    }

    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ success: false, message: 'User already exists' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    }

    // Save user
    users.push(newUser)
    
    // Save users to file
    saveUsers()

    // Clear OTP
    delete otpStore[email]

    res.json({ success: true, message: 'Registration successful' })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ success: false, message: 'Registration failed' })
  }
})

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })

    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
})

// Get current user route
app.get('/api/auth/me', (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Find user
    const user = users.find(u => u.id === decoded.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Return user data (excluding password)
    const { password, ...userData } = user
    res.json({ success: true, user: userData })
  } catch (error) {
    console.error('Get current user error:', error)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
    res.status(500).json({ success: false, message: 'Failed to get user data' })
  }
})

// Logout route
app.post('/api/auth/logout', (req, res) => {
  // In a real app, you would invalidate the token in a token blacklist
  // For this simple example, we'll just return success
  res.json({ success: true, message: 'Logged out successfully' })
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
    res.status(500).json({ success: false, message: 'Failed to authenticate token' })
  }
}

// Orders Routes
// Get all orders for current user
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    const userOrders = orders.filter(order => order.userId === req.user.id)
    res.json(userOrders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ success: false, message: 'Failed to get orders' })
  }
})

// Get order by ID
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id && o.userId === req.user.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ success: false, message: 'Failed to get order' })
  }
})

// Create new order
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { restaurant, items, total } = req.body

    if (!restaurant || !items || !total) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      userId: req.user.id,
      date: new Date().toISOString(),
      restaurant,
      items,
      total,
      status: 'Processing'
    }

    orders.push(newOrder)
    saveOrders()

    res.json({ success: true, order: newOrder })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ success: false, message: 'Failed to create order' })
  }
})

// Cancel order
app.put('/api/orders/:id/cancel', authenticateToken, (req, res) => {
  try {
    const orderIndex = orders.findIndex(o => o.id === req.params.id && o.userId === req.user.id)
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    if (orders[orderIndex].status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel delivered order' })
    }

    orders[orderIndex].status = 'Cancelled'
    saveOrders()

    res.json({ success: true, order: orders[orderIndex] })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ success: false, message: 'Failed to cancel order' })
  }
})

// Track order
app.get('/api/orders/:id/track', authenticateToken, (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id && o.userId === req.user.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.json({
      success: true,
      tracking: {
        orderId: order.id,
        status: order.status,
        estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes from now
      }
    })
  } catch (error) {
    console.error('Track order error:', error)
    res.status(500).json({ success: false, message: 'Failed to track order' })
  }
})

// Reorder from past order
app.post('/api/orders/:id/reorder', authenticateToken, (req, res) => {
  try {
    const pastOrder = orders.find(o => o.id === req.params.id && o.userId === req.user.id)
    if (!pastOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      userId: req.user.id,
      date: new Date().toISOString(),
      restaurant: pastOrder.restaurant,
      items: pastOrder.items,
      total: pastOrder.total,
      status: 'Processing'
    }

    orders.push(newOrder)
    saveOrders()

    res.json({ success: true, order: newOrder })
  } catch (error) {
    console.error('Reorder error:', error)
    res.status(500).json({ success: false, message: 'Failed to create reorder' })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

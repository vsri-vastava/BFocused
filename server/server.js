
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

// Import routes
const applicationRoutes = require('./routes/applicationRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Home route
app.get('/', (req, res) => {
  res.send('BFocused Backend is running!')
})

// API routes
app.use('/api/applications', applicationRoutes)
app.use('/api/auth', authRoutes)

// Diagnostic: Display registered authentication routes
console.log(
  'Auth routes:',
  authRoutes.stack
    .filter(layer => layer.route)
    .map(layer => ({
      path: layer.route.path,
      methods: layer.route.methods,
    }))
)

// Server configuration
const PORT = process.env.PORT || 5000

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!')

    app.listen(PORT, () => {
      console.log(`BFocused server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
  })

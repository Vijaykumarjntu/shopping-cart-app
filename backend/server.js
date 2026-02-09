// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// // Import routes
// const userRoutes = require('./routes/userRoutes');
// const itemRoutes = require('./routes/itemRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const orderRoutes = require('./routes/orderRoutes');

// const app = express();
// console.log("cors working");

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database connection
// // mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // })
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart')
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api/items', itemRoutes);
// app.use('/api/carts', cartRoutes);
// app.use('/api/orders', orderRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date() });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ========== CORS Configuration ==========
const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed domains/patterns
    const allowedPatterns = [
      'localhost:3000',        // Local development
      'localhost:5173',        // Vite dev server
      '.vercel.app',           // All Vercel deployments
      '.onrender.com',         // All Render deployments
      '.web.app',              // Firebase
      '.github.io',            // GitHub Pages
    ];
    
    // Allow requests with no origin (server-to-server, curl, etc)
    if (!origin) return callback(null, true);
    
    // Development mode - allow everything
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedPatterns.some(pattern => {
      if (pattern.startsWith('.')) {
        // Pattern like ".vercel.app" - check if origin ends with it
        return origin.endsWith(pattern);
      } else {
        // Exact match for patterns like "localhost:3000"
        return origin.includes(pattern);
      }
    });
    
    if (isAllowed) {
      console.log(`✅ CORS Allowed: ${origin}`);
      return callback(null, true);
    }
    
    // Also allow if origin is in environment variable
    if (process.env.ALLOWED_ORIGINS) {
      const allowedFromEnv = process.env.ALLOWED_ORIGINS.split(',');
      if (allowedFromEnv.includes(origin)) {
        console.log(`✅ CORS Allowed via ENV: ${origin}`);
        return callback(null, true);
      }
    }
    
    // Block if not allowed
    console.warn(`🚫 CORS Blocked: ${origin}`);
    console.log(`📋 Allowed patterns: ${allowedPatterns.join(', ')}`);
    return callback(new Error('Not allowed by CORS policy'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== MongoDB Connection ==========
const connectDB = async () => {
  try {
    // MongoDB URI priority:
    // 1. MONGODB_URI (Render provides this for MongoDB service)
    // 2. RENDER_EXTERNAL_MONGODB_URI (Render provides this for external MongoDB)
    // 3. Local MongoDB for development
    const mongoURI = process.env.MONGODB_URI || 
                     process.env.RENDER_EXTERNAL_MONGODB_URI || 
                     'mongodb://localhost:27017/shopping-cart';
    
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    
    // Check if we have items
    const Item = require('./models/Item');
    const itemCount = await Item.countDocuments();
    console.log(`📊 Found ${itemCount} items in database`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('🔄 Retrying in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

// ========== Database Config Endpoint ==========
app.get('/api/config', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    service: 'Shopping Cart API',
    status: 'running',
    nodeEnv: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    corsPolicy: 'Allows: localhost, *.vercel.app, *.onrender.com',
    endpoints: {
      users: '/api/users',
      items: '/api/items',
      carts: '/api/carts',
      orders: '/api/orders',
      health: '/health',
      config: '/api/config'
    }
  });
});

// ========== Routes ==========
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);

// ========== Health Check ==========
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'shopping-cart-api',
    database: dbStatus,
    uptime: process.uptime()
  });
});

// ========== Root Endpoint ==========
app.get('/', (req, res) => {
  res.json({
    message: '🛒 Shopping Cart API',
    version: '1.0.0',
    docs: {
      health: '/health',
      config: '/api/config',
      api: '/api/*'
    }
  });
});

// ========== Seed Endpoint (Development/Admin Only) ==========
app.post('/api/seed', async (req, res) => {
  // Protect this endpoint in production
  if (process.env.NODE_ENV === 'production' && !req.headers['admin-key']) {
    return res.status(403).json({ error: 'Admin key required in production' });
  }
  
  try {
    const { seedDatabase } = require('./seed');
    await seedDatabase();
    res.json({ 
      success: true, 
      message: 'Database seeded successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== Error Handling ==========
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.message);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
📡 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health: http://localhost:${PORT}/health
⚙️  Config: http://localhost:${PORT}/api/config
🌱 Seed: POST http://localhost:${PORT}/api/seed
    `);
  });
};

startServer();
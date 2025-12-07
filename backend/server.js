// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); 
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const { protect, admin } = require('./middleware/auth'); 
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Cloudinary

const { getStats, getLatestOrders, updateOrderStatus } = require('./controllers/adminController'); 

const app = express();

// ---------------------------------------------------
// SÉCURITÉ
// ---------------------------------------------------
app.use(helmet());

// ---------------------------------------------------
// CORS (CORRIGÉ ET ROBUSTE)
// ---------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://cosmetics-shop-nine.vercel.app', 
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------------------------------
// RATE LIMIT
// ---------------------------------------------------
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes, réessayez dans 15 minutes',
  })
);

// ---------------------------------------------------
// BODY PARSER
// ---------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------
// ROUTES API
// ---------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); 

app.get('/api/admin/add-product', protect, admin, (req, res) => {
  res.json({
    message: `✅ Bienvenue Admin ${req.user.name}`,
    users: 120, 
    orders: 45,
    revenue: 12345.67
  });
});

app.get('/api/admin/stats', protect, admin, getStats); 
app.get('/api/admin/latest-orders', protect, admin, getLatestOrders);
app.put('/api/admin/orders/:id/status', protect, admin, updateOrderStatus); 

app.get('/api', (req, res) => {
  res.json({
    message: '✅ API Cosmétiques - Fonctionnelle',
    version: '1.0.0',
  });
});

// ---------------------------------------------------
// HANDLER GLOBAL
// ---------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------
// CONNECTION MONGODB
// ---------------------------------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur MongoDB :', error.message);
    process.exit(1);
  }
};

// ---------------------------------------------------
// SERVEUR
// ---------------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 Serveur démarré sur le port ${PORT}
🌍 Mode: ${process.env.NODE_ENV || 'development'}
📡 API Local: http://localhost:${PORT}/api
    `);
  });
});

// ---------------------------------------------------
// ERREURS NON GÉRÉES
// ---------------------------------------------------
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err.message);
  process.exit(1);
});
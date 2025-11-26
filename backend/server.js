// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const compression = require('compression');

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');


const app = express();

app.use(compression());

// 🔒 Sécurité HTTP
app.use(helmet());

// 🔒 CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.6:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin?.startsWith('http://192.168.') ||
      origin?.startsWith('http://10.')
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Dev mode : tout autoriser
    }
  },
  credentials: true
}));

// 🔒 Rate limit
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes, réessayez plus tard'
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({
    message: '✅ API Cosmétiques - Fonctionnelle',
    version: '1.0.0'
  });
});

// Error handler (dernier)
app.use(errorHandler);

// 🗄️ Connexion MongoDB 🟢 (CORRIGÉ)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 Serveur démarré sur le port ${PORT}
🌍 Mode: ${process.env.NODE_ENV || 'development'}
📡 API Local: http://localhost:${PORT}/api
🌐 API Réseau: http://[192.168.1.6]:${PORT}/api
    `);
  });
});

// Catch global errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err.message);
  process.exit(1);
});

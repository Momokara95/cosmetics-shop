// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ---------------------------------------------------
// SÉCURITÉ
// ---------------------------------------------------
app.set('trust proxy', 1);
app.use(helmet());

// ---------------------------------------------------
// CORS
// ---------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://cosmetics-shop-nine.vercel.app', // 🔥 FRONT VERCEL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
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
// FICHIERS STATIQUES
// ---------------------------------------------------
app.use('/uploads', express.static('uploads'));

// ---------------------------------------------------
// ROUTES API
// ---------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

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

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
const productRoutes = require('./routes/productRoutes'); // ✅ CORRIGÉ
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 

// 🚨 Importations du contrôleur Admin (mise à jour)
const { getStats, updateOrderStatus, getOrders } = require('./controllers/adminController'); 

const app = express();

// ---------------------------------------------------
// CONFIGURATION EXPRESS / PROXY
// ---------------------------------------------------
// 🚀 CORRECTION CRITIQUE : FAIRE CONFIANCE AU PREMIER PROXY
// Corrige la ValidationError et l'invalidation du rate limit.
app.set('trust proxy', 1); // Fait confiance au Load Balancer de Railway/Vercel

// ---------------------------------------------------
// SÉCURITÉ & MIDDLEWARES
// ---------------------------------------------------
app.use(helmet());

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

// RATE LIMIT (Appliqué uniquement aux requêtes non statiques)
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes, réessayez dans 15 minutes',
    // 🌟 CORRECTION CORS : Permet aux requêtes OPTIONS (Preflight) de passer
    skip: (req) => req.method === 'OPTIONS', 
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------
// ROUTES API
// ---------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); 

// ROUTES ADMIN (Utilisation des routes mises à jour)
app.get('/api/admin/stats', protect, admin, getStats); 
app.put('/api/admin/orders/:id/status', protect, admin, updateOrderStatus); 
app.get('/api/admin/orders', protect, admin, getOrders); // 🚨 ROUTE PAGINÉE (Corrige 404)

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
let server; 

connectDB().then(() => {
    server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`
🚀 Serveur démarré sur le port ${PORT}
🌍 Mode: ${process.env.NODE_ENV || 'development'}
📡 API Local: http://localhost:${PORT}/api
        `);
    });
});


// ---------------------------------------------------
// 🚨 GESTION D'ARRÊT PROPRE (SIGTERM / SIGINT)
// ---------------------------------------------------

const gracefulShutdown = (signal) => {
    console.log(`\n🚦 Signal ${signal} reçu. Arrêt propre du serveur...`);
    
    server.close(async (err) => {
        if (err) {
            console.error('❌ Erreur lors de l\'arrêt du serveur HTTP:', err);
            process.exit(1);
        }
        
        await mongoose.disconnect();
        console.log('✅ Connexion MongoDB déconnectée.');

        console.log('✨ Serveur et ressources fermés. Sortie du processus.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
    console.error('❌ Erreur non gérée:', err.message);
    if (server) server.close(() => process.exit(1)); 
    else process.exit(1);
});
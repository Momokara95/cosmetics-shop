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
const productRoutes = require('//...autres routes...'); // Remplacer par vos routes réelles
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 

// 🚨 NOUVEL IMPORT de getOrders (doit être créé dans adminController.js)
const { getStats, getLatestOrders, updateOrderStatus, getOrders } = require('./controllers/adminController'); 

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

// ROUTES ADMIN (Utilisation de la nouvelle route paginée)
app.get('/api/admin/stats', protect, admin, getStats); 
app.put('/api/admin/orders/:id/status', protect, admin, updateOrderStatus); 

// 🚨 NOUVELLE ROUTE POUR LA PAGINATION ET LE FILTRAGE (Corrige 404)
app.get('/api/admin/orders', protect, admin, getOrders); 
// Note: Si vous aviez besoin de l'ancienne '/latest-orders' pour une raison,
// vous pouvez la conserver, mais la nouvelle route 'orders' est plus complète.

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
let server; // Déclaration pour être accessible par gracefulShutdown

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
    
    // Arrêter le serveur HTTP
    server.close(async (err) => {
        if (err) {
            console.error('❌ Erreur lors de l\'arrêt du serveur HTTP:', err);
            process.exit(1);
        }
        
        // Arrêter la connexion MongoDB
        await mongoose.disconnect();
        console.log('✅ Connexion MongoDB déconnectée.');

        console.log('✨ Serveur et ressources fermés. Sortie du processus.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Garder la gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
    console.error('❌ Erreur non gérée:', err.message);
    // Fermer le serveur si possible avant de quitter
    if (server) server.close(() => process.exit(1)); 
    else process.exit(1);
});
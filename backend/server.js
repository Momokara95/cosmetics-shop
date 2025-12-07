// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// 🚨 AJOUT : Importation du module path (bonne pratique)
const path = require('path'); 
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const { protect, admin } = require('./middleware/auth'); 
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
// ✅ NOUVEL IMPORT : La route pour l'upload permanent via Cloudinary
const uploadRoutes = require('./routes/uploadRoutes'); 

const { getStats, getLatestOrders, updateOrderStatus } = require('./controllers/adminController'); 

const app = express();

// ---------------------------------------------------
// SÉCURITÉ
// ---------------------------------------------------
app.use(helmet());

// ---------------------------------------------------
// CORS (SOLUTION ROBUSTE CONTRE LE BLOCAGE)
// ---------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://cosmetics-shop-nine.vercel.app', // 🔥 VOTRE FRONT VERCEL
];

app.use(
  cors({
    origin: allowedOrigins, // Utilisation du tableau direct pour la robustesse
    credentials: true,
    // Précision des méthodes et headers pour les requêtes OPTIONS (Preflight)
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
// FICHIERS STATIQUES (Supprimé car Cloudinary gère l'hébergement)
// ---------------------------------------------------
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
// (La ligne précédente a été supprimée ou commentée car elle n'est plus utile avec Cloudinary)


// ---------------------------------------------------
// ROUTES API
// ---------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); // ✅ ROUTE D'UPLOAD CLOUDINARY ACTIVÉE

// Exemple de route admin protégée (Inchangé)
app.get('/api/admin/add-product', protect, admin, (req, res) => {
  res.json({
    message: `✅ Bienvenue Admin ${req.user.name}`,
    users: 120, 
    orders: 45,
    revenue: 12345.67
  });
});

// ✅ Route pour les statistiques générales (Inchangé)
app.get('/api/admin/stats', protect, admin, getStats); 

// ✅ Route pour les dernières commandes (Inchangé)
app.get('/api/admin/latest-orders', protect, admin, getLatestOrders);

// ⚙️ NOUVELLE ROUTE : Mise à jour du statut (Méthode PUT) (Inchangé)
app.put('/api/admin/orders/:id/status', protect, admin, updateOrderStatus); 

app.get('/api', (req, res) => {
  res.json({
    message: '✅ API Cosmétiques - Fonctionnelle',
    version: '1.0.0',
  });
});

// ---------------------------------------------------
// HANDLER GLOBAL (Inchangé)
// ---------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------
// CONNECTION MONGODB (Inchangé)
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
// SERVEUR (Inchangé)
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
// ERREURS NON GÉRÉES (Inchangé)
// ---------------------------------------------------
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err.message);
  process.exit(1);
});
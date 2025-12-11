// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getBestSellers,
  getAdminProducts // 🟢 ASSUREZ-VOUS QUE CECI EST BIEN IMPORTÉ
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/auth');

// =========================================================
// 1. ROUTES PUBLIQUES (Doivent être listées AVANT les routes génériques)
// =========================================================

// Meilleures Ventes (Route nommée)
router.get('/best-sellers', getBestSellers); 

// Produits en vedette (Route nommée)
router.get('/featured', getFeaturedProducts);

// =========================================================
// 2. ROUTES ADMIN
// =========================================================

// 🟢 ROUTE LISTE & CRÉATION ADMIN (Cible: /api/products/admin)
router.route('/admin')
    .get(protect, admin, getAdminProducts)   // 🟢 FIX : Répond au GET /api/products/admin
    .post(protect, admin, createProduct);    // 🟢 FIX : Répond au POST /api/products/admin (Corrige le 405)


// MISE À JOUR & SUPPRESSION (Cible: /api/products/admin/:id)
router.route('/admin/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// ROUTE STATS ADMIN (Cible: /api/products/admin/stats)
// L'intégrer dans le routeur principal si nécessaire
router.get('/admin/stats', protect, admin, async (req, res) => {
  // ... (Logique de stats) ...
});

// =========================================================
// 3. ROUTES PUBLIQUES GÉNÉRIQUES (Doivent être listées APRÈS les routes nommées)
// =========================================================

// Liste publique (Cible: /api/products)
router.route('/')
  .get(getProducts);

// Détails produit par slug (Cible: /api/products/:slug)
// Attention : doit être la DERNIÈRE pour ne pas capturer les noms de routes ci-dessus.
router.route('/:slug')
  .get(getProduct);


module.exports = router;
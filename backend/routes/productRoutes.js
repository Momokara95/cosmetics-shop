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
  getBestSellers // ⬅️ NOUVEL IMPORT
} = require('../controllers/productController');

const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order'); 

const { protect, admin } = require('../middleware/auth');

// =========================================================
// ROUTES PRODUITS
// =========================================================

// Tous les produits + création produit (admin)
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// Produits en vedette
router.get('/featured', getFeaturedProducts);

// ➡️ NOUVELLE ROUTE : Meilleures Ventes (DOIT ÊTRE DEVANT le slug)
router.get('/best-sellers', getBestSellers); 

// Détails produit par slug
router.route('/:slug')
  .get(getProduct);

// Update + delete produit admin
router.route('/admin/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// =========================================================
// 🔥 ROUTE DASHBOARD ADMIN (Note : Ces routes sont maintenant mieux placées dans adminRoutes)
// =========================================================

// J'ai renommé le endpoint pour éviter la confusion avec les routes produits ci-dessus.
// La convention serait de le mettre dans un fichier adminRoutes.js, mais je le laisse ici pour l'instant.
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = Order ? await Order.countDocuments() : 0;

    res.json({
      success: true,
      data: {
        products: totalProducts,
        users: totalUsers,
        orders: totalOrders
      }
    });

  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des statistiques"
    });
  }
});

module.exports = router;
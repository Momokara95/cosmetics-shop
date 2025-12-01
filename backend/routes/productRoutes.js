// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
} = require('../controllers/productController');

const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order'); // Si tu n'as pas encore Order, dis-moi je te le crée

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

// Détails produit par slug
router.route('/:slug')
  .get(getProduct);

// Update + delete produit admin
router.route('/admin/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// =========================================================
// 🔥 ROUTE DASHBOARD ADMIN
// =========================================================

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

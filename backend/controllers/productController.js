// backend/controllers/productController.js
const Product = require('../models/Product');

// @desc    Récupère tous les produits avec filtres et pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // Filtres et pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Construire les filtres
    let queryObj = { isActive: true };

    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    if (req.query.brand) {
      queryObj.brand = req.query.brand;
    }

    if (req.query.search) {
      queryObj.$text = { $search: req.query.search };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Tri
    let sortOption = {};
    if (req.query.sort === 'price_asc') sortOption.price = 1;
    else if (req.query.sort === 'price_desc') sortOption.price = -1;
    else if (req.query.sort === 'name') sortOption.name = 1;
    else if (req.query.sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    const products = await Product.find(queryObj)
      .sort(sortOption)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des produits'
    });
  }
};

// @desc    Récupère un produit par slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Erreur récupération produit:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du produit'
    });
  }
};

// @desc    Crée un nouveau produit
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du produit'
    });
  }
};

// @desc    Met à jour un produit
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du produit'
    });
  }
};

// @desc    Supprime un produit
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du produit'
    });
  }
};

// @desc    Récupère les produits en vedette
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true, isActive: true })
      .limit(8)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur produits vedette:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des produits en vedette'
    });
  }
};
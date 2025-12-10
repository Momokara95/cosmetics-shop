const Product = require('../models/Product');
const mongoose = require('mongoose'); 

// ---------------------------------------------------
// 💡 Fonctions PUBLIQUES (Définies en tant que CONST)
// ---------------------------------------------------

/**
 * @desc    Récupère tous les produits avec filtres et pagination (PUBLIC)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => { // CHANGEMENT: De exports.getProducts à const getProducts
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

/**
 * @desc    Récupère un produit par slug (PUBLIC)
 * @route   GET /api/products/:slug
 * @access  Public
 */
const getProduct = async (req, res) => { // CHANGEMENT: De exports.getProduct à const getProduct
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('❌ Erreur récupération produit:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération du produit' });
  }
};

/**
 * @desc    Récupère les produits en vedette (PUBLIC)
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res) => { // CHANGEMENT: De exports.getFeaturedProducts à const getFeaturedProducts
    try {
        const products = await Product.find({ featured: true, isActive: true })
          .limit(8)
          .sort('-createdAt');
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('❌ Erreur produits vedette:', error);
        res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération des produits en vedette' });
    }
};

/**
 * @desc    Récupérer les 8 meilleurs produits (PUBLIC)
 * @route   GET /api/products/best-sellers
 * @access  Public
 */
const getBestSellers = async (req, res, next) => { // CHANGEMENT: De exports.getBestSellers à const getBestSellers
    try {
        const bestSellers = await Product.aggregate([
            { $match: { isActive: true } }, 
            {
                $lookup: {
                    from: 'orders',
                    let: { productId: '$_id' }, 
                    pipeline: [
                        { $unwind: "$items" },
                        { $match: { $expr: { $eq: ["$items.product", "$$productId"] } } },
                        { $project: { quantity: "$items.quantity" } }
                    ],
                    as: 'sales' 
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    image: 1,
                    totalSold: { $sum: "$sales.quantity" } 
                }
            },
            { $match: { totalSold: { $gt: 0 } } },
            { $sort: { totalSold: -1 } },
            { $limit: 8 }
        ]);

        res.status(200).json({
            message: "Top 8 des meilleurs vendeurs récupérés.",
            data: bestSellers
        });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des meilleurs vendeurs:", error);
        next(error); 
    }
};


// ---------------------------------------------------
// 🛡️ Fonctions ADMIN (Gestion CRUD - Définies en tant que CONST)
// ---------------------------------------------------

/**
 * @desc    Récupérer la liste complète des produits avec pagination et filtres (ADMIN)
 * @route   GET /api/products/admin
 * @access  Private/Admin
 */
const getAdminProducts = async (req, res) => { // CHANGEMENT: De exports.getAdminProducts à const getAdminProducts
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const isActiveFilter = req.query.isActive; 
        
        const skip = (page - 1) * limit;

        let queryFilter = {};

        if (isActiveFilter === 'true') {
            queryFilter.isDeleted = { $ne: true }; 
        } else if (isActiveFilter === 'false') {
            queryFilter.isDeleted = true; 
        } 

        const keyword = req.query.keyword ? {
            name: { $regex: req.query.keyword, $options: 'i' }
        } : {};
        
        const finalFilter = { ...queryFilter, ...keyword };

        const [products, totalItems] = await Promise.all([
            Product.find(finalFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('_id name price stock countInStock category isDeleted createdAt'), 

            Product.countDocuments(finalFilter)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            data: {
                products: products,
                totalItems: totalItems,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération produits ADMIN:', error);
        res.status(500).json({ message: error.message || 'Erreur lors de la récupération des produits' });
    }
};


/**
 * @desc    Crée un nouveau produit (ADMIN)
 * @route   POST /api/products/admin
 * @access  Private/Admin
 */
const createProduct = async (req, res) => { // CHANGEMENT: De exports.createProduct à const createProduct
    try {
        const product = new Product({
            name: 'Nouveau Produit',
            price: 0,
            user: req.user._id, 
            image: '/images/sample.jpg',
            brand: 'Marque inconnue',
            category: 'Catégorie inconnue',
            countInStock: 0,
            stock: 0,
            description: 'Description par défaut...',
            isDeleted: false 
        });

        const createdProduct = await product.save();
        res.status(201).json({ 
            success: true,
            message: "Produit par défaut créé",
            data: createdProduct 
        });
    } catch (error) {
        console.error('❌ Erreur création produit ADMIN:', error);
        res.status(500).json({ success: false, message: error.message || 'Erreur lors de la création du produit' });
    }
};

/**
 * @desc    Met à jour un produit existant (ADMIN)
 * @route   PUT /api/products/admin/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res) => { // CHANGEMENT: De exports.updateProduct à const updateProduct
    try {
        const productId = req.params.id;
        const updatedFields = req.body;
        
        if (updatedFields.countInStock !== undefined) {
            updatedFields.stock = updatedFields.countInStock;
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            updatedFields,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
        }

        res.status(200).json({ 
            success: true,
            message: `Produit ${productId} mis à jour.`,
            data: product 
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour produit ADMIN:', error);
        res.status(500).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du produit' });
    }
};

/**
 * @desc    Supprime un produit (Hard Delete) - Maintenu pour la complétude, mais souvent déconseillé.
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res) => { // CHANGEMENT: De exports.deleteProduct à const deleteProduct
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Produit non trouvé' });
        }

        res.status(200).json({ success: true, message: "Produit supprimé", data: {} });
    } catch (error) {
        console.error('❌ Erreur suppression produit:', error);
        res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression du produit' });
    }
};


// ---------------------------------------------------
// EXPORTATION FINALE
// ---------------------------------------------------
module.exports = { 
    getProducts, 
    getProduct, 
    getFeaturedProducts,
    getBestSellers,

    // Exportations ADMIN
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};
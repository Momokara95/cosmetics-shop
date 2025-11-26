// backend/controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const {
  sendOrderConfirmationToClient,
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdate
} = require('../utils/emailService');

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  console.log('🔍 DEBUG: Début createOrder');
  
  try {
    console.log('🔍 DEBUG: Body reçu:', req.body);
    console.log('🔍 DEBUG: User:', req.user);
    
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    } = req.body;

    if (!items || items.length === 0) {
      console.log('❌ DEBUG: Aucun article');
      return res.status(400).json({
        success: false,
        message: 'Aucun article dans la commande'
      });
    }

    console.log('🔍 DEBUG: Création de la commande...');
    
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    console.log('✅ DEBUG: Commande créée:', order.orderNumber);

    // Récupérer les infos complètes de l'utilisateur
    const user = await User.findById(req.user._id);
    
    console.log('✅ DEBUG: User récupéré:', user.email);

    // 📧 ENVOI DES EMAILS
    try {
      console.log('📧 Envoi des emails...');
      
      // Email au client
      await sendOrderConfirmationToClient(order, user);
      console.log('✅ Email client envoyé');
      
      // Email à l'admin
      await sendOrderNotificationToAdmin(order, user);
      console.log('✅ Email admin envoyé');
      
    } catch (emailError) {
      console.error('⚠️ Erreur envoi emails:', emailError);
      // On ne bloque pas la création de commande si l'email échoue
    }

    console.log('🔍 DEBUG: Envoi de la réponse...');
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Commande créée avec succès. Vous recevrez un email de confirmation.'
    });
    
    console.log('✅ DEBUG: Réponse envoyée');
    
  } catch (error) {
    console.error('❌ DEBUG: Erreur dans createOrder:', error);
    console.error('❌ DEBUG: Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la commande'
    });
  }
};

// @desc    Récupère les commandes de l'utilisateur
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name slug');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des commandes'
    });
  }
};

// @desc    Récupère une commande par ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name slug');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifie que l'utilisateur est le propriétaire ou admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à voir cette commande'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Erreur récupération commande:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la commande'
    });
  }
};

// @desc    Met à jour le statut de la commande (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const oldStatus = order.status;
    order.status = status;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    // 📧 Envoyer un email de mise à jour au client
    try {
      console.log('📧 Envoi email de mise à jour...');
      await sendOrderStatusUpdate(order, order.user, oldStatus, status);
      console.log('✅ Email de mise à jour envoyé au client');
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email:', emailError);
    }

    res.status(200).json({
      success: true,
      data: order,
      message: `Statut mis à jour. Le client a été notifié par email.`
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du statut'
    });
  }
};

// @desc    Marquer la commande comme payée
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.payer?.email_address
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('❌ Erreur paiement commande:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du paiement'
    });
  }
};

// @desc    Récupère toutes les commandes (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('❌ Erreur récupération commandes admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des commandes'
    });
  }
};
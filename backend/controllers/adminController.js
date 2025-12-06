// backend/controllers/adminController.js

const User = require('../models/User'); 
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * @desc    Récupérer les statistiques globales (nombre total)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
    try {
        // ✅ Récupération dynamique des comptes
        const usersCount = await User.countDocuments();
        const productsCount = await Product.countDocuments({ isDeleted: { $ne: true } }); 
        const ordersCount = await Order.countDocuments(); 
        
        res.status(200).json({
            data: {
                users: usersCount,
                products: productsCount,
                orders: ordersCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Récupérer les 10 dernières commandes avec les détails du client
 * @route   GET /api/admin/latest-orders
 * @access  Private/Admin
 */
const getLatestOrders = async (req, res, next) => {
    try {
        const latestOrders = await Order.find({})
            .sort({ createdAt: -1 }) // Trie par date de création (plus récent)
            .limit(10)          
            // ✅ CORRECTION POPULATE : Récupère le nom du client via la référence 'user'
            .populate('user', 'name email') 
            .select('_id totalAmount status createdAt user'); // Sélectionne les champs nécessaires
        
        const formattedOrders = latestOrders.map(order => ({
            _id: order._id,
            // Utilise le nom peuplé, avec un fallback si l'utilisateur est introuvable
            clientName: order.user ? order.user.name : "Utilisateur Supprimé", 
            totalAmount: order.totalAmount,
            status: order.status,
            date: order.createdAt 
        }));

        res.status(200).json({
            data: formattedOrders
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getStats, getLatestOrders };
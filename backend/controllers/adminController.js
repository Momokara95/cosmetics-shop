// backend/controllers/adminController.js

const User = require('../models/User'); 
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * @desc    Récupérer les statistiques globales pour le tableau de bord
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
    try {
        // 1. Nombre total d'utilisateurs
        const usersCount = await User.countDocuments();
        
        // 2. Nombre de produits actifs (suppose un champ 'isActive' ou 'isDeleted')
        // Si vous n'avez pas de champ de statut, utilisez simplement Product.countDocuments()
        const productsCount = await Product.countDocuments({ isDeleted: { $ne: true } }); 
        
        // 3. Nombre total de commandes
        const ordersCount = await Order.countDocuments(); 
        
        res.status(200).json({
            data: {
                users: usersCount,
                products: productsCount,
                orders: ordersCount
            }
        });
    } catch (error) {
        // Le middleware errorHandler prendra le relais
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
            // Trie par date de création décroissante (plus récent en premier)
            .sort({ createdAt: -1 }) 
            .limit(10)          
            // Peuplement (populate) des données de l'utilisateur (seulement le nom et l'email)
            .populate('user', 'name email') 
            // Sélectionne uniquement les champs nécessaires pour l'affichage
            .select('_id totalAmount status createdAt user'); 
        
        // Formate les données pour correspondre exactement à ce que le frontend OrdersTable attend
        const formattedOrders = latestOrders.map(order => ({
            _id: order._id,
            // Récupère le nom de l'utilisateur peuplé. Utilise un fallback si l'utilisateur n'existe plus.
            clientName: order.user ? order.user.name : "Utilisateur Inconnu", 
            totalAmount: order.totalAmount,
            status: order.status,
            date: order.createdAt // Utilise la date de création pour l'affichage
        }));

        res.status(200).json({
            data: formattedOrders
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getStats, getLatestOrders };
// backend/controllers/adminController.js

const User = require('../models/User'); 
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * @desc    Récupérer les statistiques globales
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
    try {
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
            .sort({ createdAt: -1 }) 
            // ✅ Utilise populate pour récupérer le nom du client
            .populate('user', 'name email') 
            .limit(10)          
            .select('_id totalAmount status createdAt user'); 
        
        const formattedOrders = latestOrders.map(order => ({
            _id: order._id,
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

/**
 * @desc    Mettre à jour le statut d'une commande (Fonctionnalité ajoutée)
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body; 

        if (!status) {
            return res.status(400).json({ message: "Le statut de la commande est requis." });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        // Met à jour le statut et sauvegarde
        order.status = status;
        await order.save();

        res.status(200).json({
            message: `Statut de la commande ${orderId} mis à jour à : ${status}`,
            data: order 
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getStats, getLatestOrders, updateOrderStatus }; // ⬅️ EXPORT FINAL
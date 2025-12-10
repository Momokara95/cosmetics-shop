// backend/controllers/adminController.js

const User = require('../models/User'); 
const Product = require('../models/Product');
const Order = require('../models/Order');

// ---------------------------------------------------
// 💡 Liste des statuts valides pour le Backend et le Frontend
const VALID_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"]; 
// ---------------------------------------------------

/**
 * @desc    Récupérer les statistiques globales (avec ajout du revenu)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
    try {
        const [usersCount, productsCount, ordersCount, totalRevenueResult] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments({ isDeleted: { $ne: true } }), 
            Order.countDocuments(),
            // 💰 Ajout du revenu total (utilisation de l'agrégation Mongoose)
            Order.aggregate([
                { 
                    $match: { status: { $ne: 'Cancelled' } } // On exclut généralement les commandes annulées du revenu
                },
                { 
                    $group: { 
                        _id: null, 
                        total: { $sum: "$totalAmount" } 
                    } 
                }
            ])
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
        
        res.status(200).json({
            data: {
                users: usersCount,
                products: productsCount,
                orders: ordersCount,
                revenue: totalRevenue
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Récupérer les commandes avec Pagination et Filtrage
 * @route   GET /api/admin/orders?page=X&limit=Y&status=Z
 * @access  Private/Admin
 */
const getOrders = async (req, res, next) => {
    try {
        // 1. Extraction des paramètres de requête (Query)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const statusFilter = req.query.status;
        
        // Calcul des offsets
        const skip = (page - 1) * limit;

        // 2. Construction de l'objet de recherche (Filter Query)
        let queryFilter = {};
        
        if (statusFilter && statusFilter !== 'All') {
            // 🛡️ S'assurer que le statut est valide avant de filtrer
            if (!VALID_STATUSES.includes(statusFilter)) {
                 return res.status(400).json({ 
                    message: `Statut de filtre non valide: ${statusFilter}. Statuts autorisés : ${VALID_STATUSES.join(', ')}` 
                });
            }
            queryFilter.status = statusFilter;
        }

        // 3. Exécution des requêtes (Commandes, Total de Commandes, Total de Pages)
        const [orders, totalItems] = await Promise.all([
            // Récupérer les commandes paginées et filtrées
            Order.find(queryFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email')
                .select('_id totalAmount status createdAt user'),

            // Compter le nombre total d'éléments correspondant au filtre
            Order.countDocuments(queryFilter)
        ]);

        // 4. Calcul de la pagination
        const totalPages = Math.ceil(totalItems / limit);

        // 5. Formatter la réponse pour le Front-end
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            // S'assurer que le nom du client est présent
            clientName: order.user ? order.user.name : "Utilisateur Supprimé", 
            totalAmount: order.totalAmount,
            status: order.status,
            date: order.createdAt 
        }));

        res.status(200).json({
            data: {
                orders: formattedOrders,
                totalItems: totalItems,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mettre à jour le statut d'une commande
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
        
        // 🛡️ Vérification de la validité du statut
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Statut non valide: ${status}. Statuts autorisés : ${VALID_STATUSES.join(', ')}`
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

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

// ---------------------------------------------------
// EXPORTATION (Toutes les fonctions sont maintenant définies au-dessus)
// ---------------------------------------------------
module.exports = { 
    getStats, 
    getOrders, 
    updateOrderStatus // ✅ CORRIGÉ: updateOrderStatus est maintenant défini juste au-dessus.
};
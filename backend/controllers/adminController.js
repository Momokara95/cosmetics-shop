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
                revenue: totalRevenue // 🌟 NOUVEAU
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
                    message: `Statut de filtre non valide: ${statusFilter}.` 
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


// 🗑️ Suppression de getLatestOrders, car getOrders est plus complet.
// Mais pour assurer la compatibilité avec le code initial, nous le conservons
// ou nous le mettons à jour pour appeler la nouvelle fonction.
const getLatestOrders = async (req, res, next) => {
    // Appel à getOrders avec les paramètres par défaut
    req.query.page = 1;
    req.query.limit = 10;
    req.query.status = 'All'; 
    return getOrders(req, res, next);
};

// ... (updateOrderStatus reste inchangé, mais on ajoute 'getOrders' à l'export)

// ---------------------------------------------------
// Exportation
// ---------------------------------------------------
module.exports = { 
    getStats, 
    getOrders, // 🌟 NOUVEAU
    updateOrderStatus 
};

// Note: J'ai retiré 'getLatestOrders' de l'exportation pour n'avoir que 'getOrders', 
// mais j'ai inclus la fonction ci-dessus si vous devez la conserver pour la compatibilité.
// L'important est d'utiliser 'getOrders' dans server.js pour la route /api/admin/orders
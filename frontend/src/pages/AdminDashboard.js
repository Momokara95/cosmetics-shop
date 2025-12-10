import { useEffect, useState } from "react";
import axios from "axios";
import { 
    FaUsers, FaBox, FaShoppingBag, FaHistory, FaEuroSign, 
    FaSpinner, FaCheckCircle, FaExclamationCircle, FaAngleLeft, FaAngleRight 
} from 'react-icons/fa'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import "./AdminDashboard.css"; 

// --- Constantes globales ---
const STATUS_OPTIONS = ["Pending", "Shipped", "Delivered", "Cancelled"]; 
const API_BASE_URL = "https://cosmetics-shop-production.up.railway.app/api/admin";
const ITEMS_PER_PAGE = 10; // Nombre d'éléments par page

// ---------------------------------------------------
// Composant 1 : StatCard 
// ---------------------------------------------------
const StatCard = ({ icon, title, value, detail, className = '' }) => (
    <div className={`stat-card ${className}`}>
        <div className="card-icon">{icon}</div>
        <div className="card-content">
            <h3>{title}</h3>
            <p className="stat-value">{value}</p>
            <span className="stat-detail">{detail}</span>
        </div>
    </div>
);

// ---------------------------------------------------
// Composant 2 : Contrôles de Pagination 
// ---------------------------------------------------
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
    <div className="pagination-controls">
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
        >
            <FaAngleLeft /> Précédent
        </button>
        
        <span className="page-info">
            Page **{currentPage}** sur **{totalPages}**
        </span>
        
        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="pagination-button"
        >
            Suivant <FaAngleRight />
        </button>
    </div>
);


// ---------------------------------------------------
// Composant 3 : Tableau des Commandes (OrdersTable)
// ---------------------------------------------------
const OrdersTable = ({ orders, onStatusChange, statusOptions }) => (
    <table className="orders-table">
        <thead>
            <tr>
                <th>ID Commande</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            {orders.map((order) => (
                <tr key={order._id}>
                    <td data-label="ID Commande">#{order._id.slice(-6)}</td>
                    <td data-label="Client">{order.clientName}</td>
                    <td data-label="Montant">
                        {(order.totalAmount ?? 0).toFixed(2) + ' €'}
                    </td>
                    <td data-label="Statut">
                        <select 
                            className={`status-select status-${order.status.toLowerCase()} ${order.isUpdating ? 'status-updating' : ''}`}
                            value={order.status}
                            disabled={order.isUpdating} 
                            onChange={(e) => onStatusChange(order._id, e.target.value)}
                        >
                            {/* Option temporaire pour l'UX pendant la mise à jour */}
                            {order.isUpdating && <option disabled>{order.status} (Mise à jour...)</option>}
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </td>
                    <td data-label="Date">
                        {new Date(order.date).toLocaleString('fr-FR')}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);


// ---------------------------------------------------
// Composant Principal AdminDashboard
// ---------------------------------------------------
export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
    const [latestOrders, setLatestOrders] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // États pour la Pagination et le Filtrage
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('All'); // 'All' ou un statut de STATUS_OPTIONS

    // 🔄 Gérer la mise à jour du statut (avec Toasts et Rollback)
    const handleStatusUpdate = async (orderId, newStatus) => {
        const token = localStorage.getItem("token");
        if (!token) {
             toast.error("Session expirée. Veuillez vous reconnecter.", { icon: <FaExclamationCircle /> });
             return; 
        }

        const oldStatus = latestOrders.find(o => o._id === orderId)?.status;
        const shortId = orderId.slice(-6);

        // Mise à jour Optimiste (pour l'UX)
        setLatestOrders(prevOrders => 
            prevOrders.map(order => 
                order._id === orderId ? { ...order, status: newStatus, isUpdating: true } : order
            )
        );

        try {
            await axios.put(
                `${API_BASE_URL}/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Succès: Notification Toast
            toast.success(
                <span>Statut **#{shortId}** mis à jour en **{newStatus}**</span>, 
                { icon: <FaCheckCircle /> }
            );

            // Retrait de l'état d'Updating
            setLatestOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId ? { ...order, isUpdating: false } : order
                )
            );

        } catch (err) {
            console.error("Erreur lors de la mise à jour du statut:", err);
            
            // Rollback & Notification d'Échec
            if (oldStatus) {
                setLatestOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === orderId ? { ...order, status: oldStatus, isUpdating: false } : order
                    )
                );
            }

            const backendMessage = err.response?.data?.message || "Erreur de connexion. Veuillez réessayer.";
            toast.error(
                <span>Échec de la mise à jour de **#{shortId}**: {backendMessage}</span>,
                { icon: <FaExclamationCircle /> }
            );
        }
    };


    // 🔗 Fonction de chargement des données (dépend de la page et du filtre)
    const fetchStatsAndOrders = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentification requise.");
            }
            
            // Construction des Query Parameters
            let ordersUrl = `${API_BASE_URL}/orders?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
            if (filterStatus !== 'All') {
                ordersUrl += `&status=${filterStatus}`;
            }

            // Appels API
            const [statsResponse, ordersResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(ordersUrl, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            // Extraction des données du Backend
            const { orders, totalPages: backendTotalPages } = ordersResponse.data.data;

            const ordersWithStatusFlag = orders.map(order => ({
                ...order,
                isUpdating: false
            }));
            
            setStats(statsResponse.data.data);
            setLatestOrders(ordersWithStatusFlag); 
            setTotalPages(backendTotalPages); 
            setLastUpdated(new Date());

        } catch (err) {
            console.error("Erreur de récupération des données initiales:", err);
            const errorMsg = err.response?.status === 401 || err.response?.status === 403 
                            ? "Session expirée ou droits insuffisants. Veuillez vous reconnecter."
                            : "Impossible de charger les données. Vérifiez l'état du Backend.";
            setError(errorMsg);
        } finally {
            setLoading(false); 
        }
    };

    // ➡️ useEffect : relance le chargement si la page ou le filtre change
    useEffect(() => {
        fetchStatsAndOrders();
    }, [currentPage, filterStatus]); 

    
    // Fonctions de contrôle UI
    const handleFilterChange = (newStatus) => {
        setFilterStatus(newStatus);
        setCurrentPage(1); // Retourne toujours à la première page
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };


    if (loading && latestOrders.length === 0) {
        return (
            <div className="loading-spinner">
                <FaSpinner className="spinner-icon pulse" />
                <p>Analyse des données en cours...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Composant principal de Toastify */}
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {/* Affiche l'erreur de chargement critique */}
            {error && <p className="critical-error-message">{error}</p>}

            <div className="dashboard-header">
                <h1>👋 Dashboard Administrateur</h1>
                <p>Aperçu des performances. Dernière mise à jour à {lastUpdated.toLocaleTimeString('fr-FR')}.</p>
            </div>
            
            {/* 📊 Grille de Statistiques */}
            <div className="stats-grid">
                <StatCard icon={<FaUsers />} title="Utilisateurs" value={stats.users} detail="Total enregistré" className="stat-users" />
                <StatCard icon={<FaBox />} title="Produits Actifs" value={stats.products} detail="Articles disponibles" className="stat-products" />
                <StatCard icon={<FaShoppingBag />} title="Commandes Total" value={stats.orders} detail="Commandes enregistrées" className="stat-orders" />
                <StatCard 
                    icon={<FaEuroSign />}
                    title="Revenu Total"
                    value={stats.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} 
                    detail="Généré depuis le début"
                    className="stat-revenue"
                />
            </div>
            
            <div className="latest-orders-section">
                <h2><FaHistory /> Liste des Commandes</h2>

                {/* ⚙️ Contrôles de Filtre */}
                <div className="orders-controls">
                    <label htmlFor="status-filter">Filtrer par statut : </label>
                    <select 
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="filter-select"
                        disabled={loading}
                    >
                        <option value="All">Toutes les commandes</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Condition de chargement spécifique pour le tableau */}
                {loading && latestOrders.length > 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#007bff' }}>
                        <FaSpinner className="spinner-icon pulse" size={20} /> Rechargement des données...
                    </div>
                ) : latestOrders.length === 0 ? (
                    <p className="placeholder">Aucune commande ne correspond au filtre **{filterStatus}**.</p>
                ) : (
                    <>
                        <OrdersTable 
                            orders={latestOrders} 
                            onStatusChange={handleStatusUpdate} 
                            statusOptions={STATUS_OPTIONS}
                        />

                        {/* ➡️ Contrôles de Pagination */}
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
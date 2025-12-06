import { useEffect, useState } from "react";
import axios from "axios";
// ... (imports existants)
import { FaUsers, FaBox, FaShoppingBag, FaChartLine, FaHistory } from 'react-icons/fa'; // Ajout de FaHistory
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  // NOUVEL ÉTAT POUR LES COMMANDES
  const [latestOrders, setLatestOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatsAndOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // 1. Fetch des Statistiques (déjà fait)
        const statsResponse = await axios.get(
          "https://cosmetics-shop-production.up.railway.app/api/admin/stats",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(statsResponse.data.data);

        // 2. Fetch des Dernières Commandes (NOUVEAU)
        // ATTENTION : Cette route doit exister dans le backend !
        const ordersResponse = await axios.get(
            "https://cosmetics-shop-production.up.railway.app/api/admin/latest-orders",
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // On suppose que l'API renvoie un tableau d'objets commandes.
        setLatestOrders(ordersResponse.data.data); 

      } catch (err) {
        console.error("Erreur de récupération des données:", err);
        // Si l'erreur est juste la route des commandes qui manque, on affiche quand même les stats.
        setError("Impossible de charger toutes les données du tableau de bord. La route 'latest-orders' est-elle déployée ?");
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndOrders();
  }, []);

  // ... (if (loading) et if (error) restent inchangés)

  return (
    <div className="admin-dashboard">
      
      {/* 🌟 SECTION BIENVENUE */}
      <div className="dashboard-header">
        <h1>👋 Dashboard Administrateur</h1>
        <p>Aperçu des performances de la boutique en ligne. Dernière mise à jour le {new Date().toLocaleTimeString()}.</p>
      </div>
      
      {/* 💳 GRILLE DES STATISTIQUES */}
      <div className="stats-grid">
        {/* (Contenu des cartes stat-card reste le même) */}
      </div>
      
      {/* 📦 NOUVELLE SECTION : DERNIÈRES COMMANDES */}
      <div className="latest-orders-section">
        <h2><FaHistory /> Dernières Commandes Récentes</h2>
        {latestOrders.length === 0 && !loading ? (
            <p className="placeholder">Aucune commande récente à afficher.</p>
        ) : (
            <OrdersTable orders={latestOrders} />
        )}
      </div>

    </div>
  );
}

// Composant pour afficher le tableau des commandes
const OrdersTable = ({ orders }) => (
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
                    <td data-label="Montant">{order.totalAmount.toFixed(2)} €</td>
                    <td data-label="Statut">
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                            {order.status}
                        </span>
                    </td>
                    <td data-label="Date">{new Date(order.date).toLocaleDateString()}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
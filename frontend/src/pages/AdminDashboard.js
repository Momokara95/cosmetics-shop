import { useEffect, useState } from "react";
import axios from "axios";
// Importation des icônes pour la mise en page
import { FaUsers, FaBox, FaShoppingBag, FaChartLine, FaHistory } from 'react-icons/fa'; 
import "./AdminDashboard.css";

// ---------------------------------------------------
// Composant pour l'affichage du Tableau des Commandes
// ---------------------------------------------------
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
                    {/* Assurez-vous que la date est formatée correctement */}
                    <td data-label="Date">{new Date(order.date).toLocaleDateString()}</td>
                </tr>
            ))}
        </tbody>
    </table>
);


// ---------------------------------------------------
// Composant Principal
// ---------------------------------------------------
export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [latestOrders, setLatestOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchStatsAndOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Exécute les deux requêtes API en parallèle
        const [statsResponse, ordersResponse] = await Promise.all([
          axios.get(
            "https://cosmetics-shop-production.up.railway.app/api/admin/stats",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            "https://cosmetics-shop-production.up.railway.app/api/admin/latest-orders",
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);
        
        // Mise à jour des états avec les données dynamiques
        setStats(statsResponse.data.data);
        setLatestOrders(ordersResponse.data.data); 

      } catch (err) {
        console.error("Erreur de récupération des données:", err);
        setError("Impossible de charger toutes les données. Vérifiez la connexion API.");
      } finally {
        // CORRECTION DU PROBLÈME INITIAL : arrête le chargement quoi qu'il arrive
        setLoading(false); 
      }
    };

    fetchStatsAndOrders();
  }, []);

  if (loading) {
    return (
        <div className="loading-spinner">
            <FaChartLine className="spinner-icon" />
            <p>Analyse des données en cours...</p>
        </div>
    );
  }

  if (error) {
    return <p className="error-message">❌ Erreur : {error}</p>;
  }

  return (
    <div className="admin-dashboard">
      
      {/* 🌟 SECTION BIENVENUE */}
      <div className="dashboard-header">
        <h1>👋 Dashboard Administrateur</h1>
        <p>Aperçu des performances de la boutique en ligne. Dernière mise à jour le {new Date().toLocaleTimeString()}.</p>
      </div>
      
      {/* 💳 GRILLE DES STATISTIQUES */}
      <div className="stats-grid">
        
        <div className="stat-card stat-users">
          <div className="card-icon"><FaUsers /></div>
          <div className="card-content">
            <h3>Utilisateurs</h3>
            <p className="stat-value">{stats.users}</p>
            <span className="stat-detail">Total enregistré</span>
          </div>
        </div>

        <div className="stat-card stat-products">
          <div className="card-icon"><FaBox /></div>
          <div className="card-content">
            <h3>Produits Actifs</h3>
            <p className="stat-value">{stats.products}</p>
            <span className="stat-detail">Articles disponibles à la vente</span>
          </div>
        </div>

        <div className="stat-card stat-orders">
          <div className="card-icon"><FaShoppingBag /></div>
          <div className="card-content">
            <h3>Commandes Total</h3>
            <p className="stat-value">{stats.orders}</p>
            <span className="stat-detail">Commandes enregistrées</span>
          </div>
        </div>
        
      </div>
      
      {/* 📦 SECTION : DERNIÈRES COMMANDES */}
      <div className="latest-orders-section">
        <h2><FaHistory /> Dernières Commandes Récentes</h2>
        {latestOrders.length === 0 ? (
            <p className="placeholder">Aucune commande récente à afficher.</p>
        ) : (
            <OrdersTable orders={latestOrders} />
        )}
      </div>

    </div>
  );
}
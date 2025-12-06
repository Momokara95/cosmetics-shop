import { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaBox, FaShoppingBag, FaChartLine } from 'react-icons/fa'; // NÉCESSITE react-icons
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Ajout pour la gestion des erreurs d'affichage

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // CORRECTION DE L'ERREUR 404 (méthode finally pour gérer le chargement)
        const { data } = await axios.get(
          "https://cosmetics-shop-production.up.railway.app/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats(data.data);
      } catch (err) {
        console.error("Erreur de récupération des stats:", err);
        setError("Impossible de charger les données du tableau de bord. Vérifiez les logs.");
      } finally {
        setLoading(false); // S'assure que le chargement s'arrête en cas de succès ou d'échec
      }
    };

    fetchStats();
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
      
      {/* 🌟 NOUVELLE SECTION BIENVENUE */}
      <div className="dashboard-header">
        <h1>👋 Dashboard Administrateur</h1>
        <p>Aperçu des performances de la boutique en ligne. Dernière mise à jour il y a quelques secondes.</p>
      </div>
      
      <div className="stats-grid">
        
        {/* 💳 Carte Utilisateurs */}
        <div className="stat-card stat-users">
          <div className="card-icon"><FaUsers /></div>
          <div className="card-content">
            <h3>Nouveaux Utilisateurs</h3>
            <p className="stat-value">{stats.users}</p>
            <span className="stat-detail">Total depuis le début du mois</span>
          </div>
        </div>

        {/* 💳 Carte Produits */}
        <div className="stat-card stat-products">
          <div className="card-icon"><FaBox /></div>
          <div className="card-content">
            <h3>Produits Actifs</h3>
            <p className="stat-value">{stats.products}</p>
            <span className="stat-detail">Articles disponibles à la vente</span>
          </div>
        </div>

        {/* 💳 Carte Commandes */}
        <div className="stat-card stat-orders">
          <div className="card-icon"><FaShoppingBag /></div>
          <div className="card-content">
            <h3>Commandes Finalisées</h3>
            <p className="stat-value">{stats.orders}</p>
            <span className="stat-detail">Commandes traitées aujourd'hui</span>
          </div>
        </div>
        
      </div>
      
      {/* 📊 Espace pour les graphiques futurs */}
      <div className="charts-area">
        <h2>Statistiques Détaillées</h2>
        <p className="placeholder">Bientôt, un graphique de revenus hebdomadaires et des produits les plus vendus ici !</p>
      </div>

    </div>
  );
}
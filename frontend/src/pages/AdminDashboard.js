import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          "https://cosmetics-shop-production.up.railway.app/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats(data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Admin</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Utilisateurs</h3>
          <p>{stats.users}</p>
        </div>

        <div className="stat-card">
          <h3>Produits</h3>
          <p>{stats.products}</p>
        </div>

        <div className="stat-card">
          <h3>Commandes</h3>
          <p>{stats.orders}</p>
        </div>
      </div>
    </div>
  );
}

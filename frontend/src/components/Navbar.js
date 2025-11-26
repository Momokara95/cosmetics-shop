// frontend/src/components/Navbar.js
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">✨</span>
          BeautéShop
        </Link>

        <div className="nav-links">
          <Link to="/">Accueil</Link>
          <Link to="/products">Produits</Link>
          
          <Link to="/cart" className="cart-link">
            🛒 Panier
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </Link>

          {user ? (
            <>
              <span className="user-name">Bonjour, {user.name}</span>
              <button onClick={logout} className="btn-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-link">Connexion</Link>
              <Link to="/register" className="btn-primary">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
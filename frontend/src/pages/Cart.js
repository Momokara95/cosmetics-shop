// frontend/src/pages/Cart.js
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  // Panier vide
  if (!cart || cart.length === 0) {
    return (
      <>
        <Helmet>
          <title>Panier - BeautéShop</title>
          <meta name="description" content="Votre panier est vide. Découvrez nos produits cosmétiques." />
        </Helmet>
        <div className="cart-page empty">
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos produits et ajoutez-les à votre panier</p>
            <Link to="/products" className="btn-primary">
              Voir les produits
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Calcul du total
  const total = getCartTotal();
  const shippingCost = total >= 50 ? 0 : 5;
  const finalTotal = total + shippingCost;

  // Panier avec articles
  return (
    <>
      <Helmet>
        <title>Mon Panier - BeautéShop</title>
        <meta name="description" content="Consultez votre panier et finalisez votre commande" />
      </Helmet>

      <div className="cart-page">
        <div className="container">
          <h1>Mon Panier</h1>

          <div className="cart-content">
            <div className="cart-items">
              {cart.map(item => (
                <div key={item._id} className="cart-item">
                  <img
                    src={item.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.name}
                    className="item-image"
                  />
                  
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-brand">{item.brand}</p>
                    <p className="item-price">{item.price}€</p>
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="qty-btn"
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    {(item.price * item.quantity).toFixed(2)}€
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="remove-btn"
                    title="Retirer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Résumé de la commande</h3>
              
              <div className="summary-line">
                <span>Sous-total</span>
                <span>{total.toFixed(2)}€</span>
              </div>

              <div className="summary-line">
                <span>Livraison</span>
                <span>{shippingCost === 0 ? 'Gratuite' : `${shippingCost.toFixed(2)}€`}</span>
              </div>

              <div className="summary-line total">
                <span>Total</span>
                <span>{finalTotal.toFixed(2)}€</span>
              </div>

              {total < 50 && (
                <p className="free-shipping-notice">
                  Encore {(50 - total).toFixed(2)}€ pour la livraison gratuite!
                </p>
              )}

              <button onClick={handleCheckout} className="btn-checkout">
                Passer la commande
              </button>

              <Link to="/products" className="continue-shopping">
                ← Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
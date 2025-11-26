// frontend/src/pages/Checkout.js
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
    paymentMethod: 'card'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Vous devez être connecté pour passer commande');
        navigate('/login?redirect=checkout');
        return;
      }

      // Préparer les données de la commande
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0]?.url || ''
        })),
        shippingAddress: {
          name: formData.name,
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: getCartTotal(),
        shippingPrice: getCartTotal() >= 50 ? 0 : 5,
        taxPrice: 0,
        totalPrice: getCartTotal() + (getCartTotal() >= 50 ? 0 : 5)
      };

      console.log('📦 Envoi de la commande...', orderData);

      // Envoyer la commande au backend
      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Commande créée avec succès:', data);

      // Vider le panier
      clearCart();

      // Message de succès
      alert(`✅ Commande passée avec succès !

📧 Vous allez recevoir un email de confirmation.

📬 Vous serez notifié par email à chaque étape :
   ⚙️ Préparation
   🚚 Expédition
   ✅ Livraison

Merci pour votre confiance ! 💜`);
      
      // Redirection vers la page d'accueil
      navigate('/');

    } catch (err) {
      console.error('❌ Erreur lors de la commande:', err);
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      
      // Scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Rediriger si le panier est vide
  if (!cart || cart.length === 0) {
    navigate('/cart');
    return null;
  }

  // Calculs
  const total = getCartTotal();
  const shippingCost = total >= 50 ? 0 : 5;
  const finalTotal = total + shippingCost;

  return (
    <>
      <Helmet>
        <title>Finaliser ma commande - BeautéShop</title>
        <meta name="description" content="Finalisez votre commande en toute sécurité" />
      </Helmet>

      <div className="checkout-page">
        <div className="container">
          <h1>Finaliser ma commande</h1>

          <div className="checkout-layout">
            {/* Formulaire */}
            <div className="checkout-form">
              {error && (
                <div className="alert alert-error">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Informations personnelles */}
                <div className="form-section">
                  <h2>📋 Informations personnelles</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Nom complet *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="jean.dupont@email.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Téléphone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                {/* Adresse de livraison */}
                <div className="form-section">
                  <h2>📍 Adresse de livraison</h2>

                  <div className="form-group">
                    <label htmlFor="street">Adresse *</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      placeholder="123 Rue de la Paix"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">Ville *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Paris"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="postalCode">Code postal *</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        placeholder="75001"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Pays *</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    >
                      <option value="France">France</option>
                      <option value="Italie">Italie</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Angleterre">Angleterre</option>
                      <option value="Sénégal">Sénégal</option>
                    </select>
                  </div>
                </div>

                {/* Méthode de paiement */}
                <div className="form-section">
                  <h2>💳 Méthode de paiement</h2>

                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                      />
                      <span>💳 Carte bancaire</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={handleChange}
                      />
                      <span>🅿️ PayPal</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleChange}
                      />
                      <span>💵 Paiement à la livraison</span>
                    </label>
                  </div>
                </div>

                {/* Boutons */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    ← Retour au panier
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Traitement en cours...' : `💳 Payer ${finalTotal.toFixed(2)}€`}
                  </button>
                </div>
              </form>
            </div>

            {/* Résumé de commande */}
            <div className="order-summary">
              <h2>Résumé de la commande</h2>

              <div className="summary-items">
                {cart.map(item => (
                  <div key={item._id} className="summary-item">
                    <img 
                      src={item.images?.[0]?.url || '/placeholder.jpg'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantité : {item.quantity}</p>
                    </div>
                    <span className="item-price">
                      {(item.price * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-line">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <div className="summary-line">
                  <span>Livraison</span>
                  <span>{shippingCost === 0 ? 'Gratuite ✨' : `${shippingCost.toFixed(2)}€`}</span>
                </div>
                <div className="summary-line total">
                  <span>Total</span>
                  <span>{finalTotal.toFixed(2)}€</span>
                </div>
              </div>

              {total < 50 && (
                <div className="free-shipping-notice">
                  🚚 Encore {(50 - total).toFixed(2)}€ pour la livraison gratuite !
                </div>
              )}

              <div className="security-badges">
                <div className="badge">🔒 Paiement sécurisé</div>
                <div className="badge">✓ Satisfait ou remboursé</div>
                <div className="badge">📧 Suivi par email</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
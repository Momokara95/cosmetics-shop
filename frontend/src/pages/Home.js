// frontend/src/pages/Home.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoProducts, setPromoProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isPromoAnimating, setIsPromoAnimating] = useState(false);

  useEffect(() => {
    let interval;

    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axios.get('https://cosmetics-shop-production.up.railway.app/api/products/featured');
        setFeaturedProducts(data.data);
        
        // Simulation de données pour les nouvelles sections
        // En production, vous devrez créer ces endpoints dans votre API
        setPromoProducts(data.data.slice(0, 5).map(product => ({
          ...product,
          discount: Math.floor(Math.random() * 40) + 10 // 10-50% de réduction
        })));
        
        setBestSellers(data.data.slice().sort(() => Math.random() - 0.5).slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    // 🔥 1. Charger au démarrage
    fetchFeaturedProducts();

    // 🔥 2. Auto-refresh toutes les 5 secondes
    interval = setInterval(fetchFeaturedProducts, 5000);

    // 🔥 3. Animation de la bande promo
    const promoInterval = setInterval(() => {
      setIsPromoAnimating(true);
      setTimeout(() => setIsPromoAnimating(false), 500);
    }, 3000);

    // 🔥 4. Nettoyage
    return () => {
      clearInterval(interval);
      clearInterval(promoInterval);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>BeautéShop - Cosmétiques de Qualité | Accueil</title>
        <meta name="description" content="Découvrez notre sélection de produits cosmétiques naturels et de qualité pour sublimer votre beauté au quotidien." />
        <meta name="keywords" content="cosmétiques, beauté, soins, maquillage, naturel" />
      </Helmet>

      <div className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>✨ Révélez Votre Beauté Naturelle</h1>
            <p>Des produits cosmétiques d'exception pour prendre soin de vous</p>
            <Link to="/products" className="cta-button">
              Découvrir nos produits
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="categories">
          <div className="container">
            <h2>Nos Catégories</h2>
            <div className="category-grid">
              <Link to="/products?category=visage" className="category-card">
                <span className="category-icon">💆‍♀️</span>
                <h3>Soins Visage</h3>
              </Link>
              <Link to="/products?category=corps" className="category-card">
                <span className="category-icon">🧴</span>
                <h3>Soins Corps</h3>
              </Link>
              <Link to="/products?category=cheveux" className="category-card">
                <span className="category-icon">💇‍♀️</span>
                <h3>Soins Cheveux</h3>
              </Link>
              <Link to="/products?category=maquillage" className="category-card">
                <span className="category-icon">💄</span>
                <h3>Maquillage</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products">
          <div className="container">
            <h2>Produits en Vedette</h2>

            {loading ? (
              <div className="loading">Chargement...</div>
            ) : (
              <div className="products-grid">
                {featuredProducts.map(product => (
                  <div key={product._id} className="product-card">
                    <Link to={`/products/${product.slug}`}>
                      <div className="product-image">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} />
                        ) : (
                          <div className="no-image">Pas d'image</div>
                        )}
                      </div>
                      <h3>{product.name}</h3>
                      <p className="product-brand">{product.brand}</p>
                      <div className="product-price">
                        <span className="current-price">{product.price}€</span>
                        {product.compareAtPrice && (
                          <span className="old-price">{product.compareAtPrice}€</span>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Benefits */}
        <section className="benefits">
          <div className="container">
            <div className="benefits-grid">
              <div className="benefit-card">
                <span className="benefit-icon">🚚</span>
                <h3>Livraison Gratuite</h3>
                <p>Dès 50€ d'achat</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🔒</span>
                <h3>Paiement Sécurisé</h3>
                <p>100% sécurisé</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">♻️</span>
                <h3>Éco-responsable</h3>
                <p>Produits naturels</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">💝</span>
                <h3>Satisfait ou Remboursé</h3>
                <p>Garantie 30 jours</p>
              </div>
            </div>
          </div>
        </section>

        {/* NOUVELLE SECTION: Bande promo animée */}
        <div className={`promo-banner ${isPromoAnimating ? 'pulse' : ''}`}>
          <div className="promo-marquee">
            <div className="marquee-content">
              <span>🔥 PROMO FLASH : -50% SUR TOUTE LA GAMME MAQUILLAGE 🔥</span>
              <span>🎁 LIVRAISON OFFERTE SANS MINIMUM D'ACHAT 🎁</span>
              <span>⭐ PROFITEZ DE -30% SUR LES SOINS VISAGE ⭐</span>
              <span>💝 CODE : BEAUTE20 POUR -20% IMMÉDIAT 💝</span>
            </div>
            <div className="marquee-content" aria-hidden="true">
              <span>🔥 PROMO FLASH : -50% SUR TOUTE LA GAMME MAQUILLAGE 🔥</span>
              <span>🎁 LIVRAISON OFFERTE SANS MINIMUM D'ACHAT 🎁</span>
              <span>⭐ PROFITEZ DE -30% SUR LES SOINS VISAGE ⭐</span>
              <span>💝 CODE : BEAUTE20 POUR -20% IMMÉDIAT 💝</span>
            </div>
          </div>
        </div>

        {/* NOUVELLE SECTION: Carousel des Promos */}
        <section className="promo-carousel-section">
          <div className="container">
            <div className="section-header">
              <h2>🔥 Promotions Exclusives</h2>
              <p>Ne manquez pas nos offres limitées dans le temps</p>
            </div>
            
            {!loading && (
              <div className="promo-carousel">
                {promoProducts.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="promo-slide"
                    style={{ 
                      animationDelay: `${index * 0.2}s`,
                      '--discount': `${product.discount}%`
                    }}
                  >
                    <Link to={`/products/${product.slug}`} className="promo-card">
                      <div className="promo-badge">{product.discount}%</div>
                      <div className="promo-image">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} />
                        ) : (
                          <div className="no-image">Pas d'image</div>
                        )}
                      </div>
                      <div className="promo-info">
                        <h3>{product.name}</h3>
                        <p className="promo-brand">{product.brand}</p>
                        <div className="promo-price">
                          <span className="new-price">
                            {(product.price * (100 - product.discount) / 100).toFixed(2)}€
                          </span>
                          <span className="old-price">{product.price}€</span>
                        </div>
                        <div className="promo-timer">
                          <span className="timer-icon">⏳</span>
                          <span>Offre limitée</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* NOUVELLE SECTION: Carousel Meilleures Ventes */}
        <section className="bestsellers-section">
          <div className="container">
            <div className="section-header">
              <h2>🏆 Nos Meilleures Ventes</h2>
              <p>Les produits préférés de notre communauté</p>
            </div>
            
            {!loading && (
              <div className="bestsellers-carousel">
                {bestSellers.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="bestseller-slide"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link to={`/products/${product.slug}`} className="bestseller-card">
                      <div className="rank-badge">#{index + 1}</div>
                      <div className="bestseller-image">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} />
                        ) : (
                          <div className="no-image">Pas d'image</div>
                        )}
                      </div>
                      <div className="bestseller-info">
                        <h3>{product.name}</h3>
                        <div className="stars">
                          {'★'.repeat(5)}
                          <span className="rating">4.8</span>
                        </div>
                        <div className="bestseller-price">
                          <span className="current-price">{product.price}€</span>
                          {product.compareAtPrice && (
                            <span className="old-price">{product.compareAtPrice}€</span>
                          )}
                        </div>
                        <div className="sales-badge">
                          <span>🔥 {Math.floor(Math.random() * 500) + 100} ventes ce mois</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* NOUVELLE SECTION: Animation Historique */}
        <section className="history-section">
          <div className="container">
            <div className="section-header">
              <h2>📜 Notre Histoire</h2>
              <p>Une passion pour la beauté naturelle depuis 2010</p>
            </div>
            
            <div className="history-timeline">
              <div className="timeline-item" style={{ '--order': 1 }}>
                <div className="timeline-year">2010</div>
                <div className="timeline-content">
                  <h3>Fondation de BeautéShop</h3>
                  <p>Début de notre aventure avec 3 produits phares</p>
                </div>
                <div className="timeline-dot"></div>
              </div>
              
              <div className="timeline-item" style={{ '--order': 2 }}>
                <div className="timeline-year">2015</div>
                <div className="timeline-content">
                  <h3>Expansion Internationale</h3>
                  <p>Ouverture de notre boutique en ligne internationale</p>
                </div>
                <div className="timeline-dot"></div>
              </div>
              
              <div className="timeline-item" style={{ '--order': 3 }}>
                <div className="timeline-year">2020</div>
                <div className="timeline-content">
                  <h3>Engagement Éco-responsable</h3>
                  <p>Transition vers des emballages 100% recyclables</p>
                </div>
                <div className="timeline-dot"></div>
              </div>
              
              <div className="timeline-item" style={{ '--order': 4 }}>
                <div className="timeline-year">2024</div>
                <div className="timeline-content">
                  <h3>Innovation Continue</h3>
                  <p>Lancement de notre gamme de cosmétiques bio</p>
                </div>
                <div className="timeline-dot"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
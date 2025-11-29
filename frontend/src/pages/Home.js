// frontend/src/pages/Home.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axios.get('https://cosmetics-shop-production.up.railway.app/api/products/featured');
        setFeaturedProducts(data.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Témoignages
  const testimonials = [
    {
      id: 1,
      name: "Marie L.",
      text: "Des produits d'une qualité exceptionnelle ! Ma peau n'a jamais été aussi belle.",
      rating: 5
    },
    {
      id: 2,
      name: "Sophie D.",
      text: "Livraison rapide et produits naturels. Je recommande vivement !",
      rating: 5
    },
    {
      id: 3,
      name: "Emma T.",
      text: "Le service client est au top et les produits sont efficaces.",
      rating: 4
    }
  ];

  // Nouveautés
  const newArrivals = [
    {
      id: 1,
      title: "Nouvelle Collection Printemps",
      description: "Découvrez nos nouveaux produits fraîcheur pour le printemps",
      image: "🌸",
      link: "/products?collection=printemps"
    },
    {
      id: 2,
      title: "Soins Bio",
      description: "Une gamme 100% naturelle et certifiée bio",
      image: "🌿",
      link: "/products?category=bio"
    },
    {
      id: 3,
      title: "Maquillage Vegan",
      description: "Des produits cruelty-free et respectueux de l'environnement",
      image: "🐰",
      link: "/products?category=vegan"
    }
  ];

  // Rotation des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
          <div className="hero-background"></div>
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title fade-in-up">✨ Révélez Votre Beauté Naturelle</h1>
              <p className="hero-subtitle fade-in-up delay-1">Des produits cosmétiques d'exception pour prendre soin de vous au quotidien</p>
              <Link to="/products" className="cta-button fade-in-up delay-2">
                Découvrir nos produits
              </Link>
            </div>
          </div>
        </section>

        {/* Section Nouveautés */}
        <section className="new-arrivals">
          <div className="container">
            <h2 className="section-title slide-in-left">🌟 Nouveautés</h2>
            <div className="new-arrivals-grid">
              {newArrivals.map((item, index) => (
                <div key={item.id} className={`new-arrival-card fade-in delay-${index + 1}`}>
                  <Link to={item.link} className="new-arrival-link">
                    <div className="arrival-icon">{item.image}</div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="arrival-cta">Découvrir →</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="categories">
          <div className="container">
            <h2 className="section-title slide-in-right">📁 Nos Catégories</h2>
            <div className="category-grid">
              <Link to="/products?category=visage" className="category-card hover-lift">
                <span className="category-icon">💆‍♀️</span>
                <h3>Soins Visage</h3>
                <p>Crèmes, sérums, nettoyants</p>
              </Link>
              <Link to="/products?category=corps" className="category-card hover-lift">
                <span className="category-icon">🧴</span>
                <h3>Soins Corps</h3>
                <p>Lotions, huiles, gommages</p>
              </Link>
              <Link to="/products?category=cheveux" className="category-card hover-lift">
                <span className="category-icon">💇‍♀️</span>
                <h3>Soins Cheveux</h3>
                <p>Shampoings, masques, soins</p>
              </Link>
              <Link to="/products?category=maquillage" className="category-card hover-lift">
                <span className="category-icon">💄</span>
                <h3>Maquillage</h3>
                <p>Fonds de teint, rouges à lèvres</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products">
          <div className="container">
            <h2 className="section-title slide-in-left">⭐ Produits en Vedette</h2>
            
            {loading ? (
              <div className="loading pulse">Chargement des produits...</div>
            ) : (
              <div className="products-grid">
                {featuredProducts.map((product, index) => (
                  <div 
                    key={product._id} 
                    className={`product-card fade-in-up delay-${index % 3}`}
                  >
                    <Link to={`/products/${product.slug}`} className="product-link">
                      <div className="product-image hover-scale">
                        {product.images && product.images[0] ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="no-image">🖼️ Pas d'image</div>
                        )}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="discount-badge">
                            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-brand">{product.brand}</p>
                        <div className="product-price">
                          <span className="current-price">{product.price}€</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="old-price">{product.compareAtPrice}€</span>
                          )}
                        </div>
                      </div>
                      <button className="quick-view-btn">👁️ Voir rapidement</button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="testimonials">
          <div className="container">
            <h2 className="section-title slide-in-right">💬 Ils Parlent de Nous</h2>
            <div className="testimonials-carousel">
              <div className="testimonial-track">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id}
                    className={`testimonial-card ${index === currentTestimonial ? 'active' : ''}`}
                  >
                    <div className="testimonial-rating">
                      {'⭐'.repeat(testimonial.rating)}
                    </div>
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <p className="testimonial-author">- {testimonial.name}</p>
                  </div>
                ))}
              </div>
              <div className="carousel-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                    aria-label={`Aller au témoignage ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section Newsletter */}
        <section className="newsletter">
          <div className="container">
            <div className="newsletter-content fade-in">
              <h2>📧 Restez Informé</h2>
              <p>Recevez nos offres exclusives et nouveautés en avant-première</p>
              <form className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  required 
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">
                  S'abonner
                </button>
              </form>
              <p className="newsletter-note">🔒 Nous respectons votre vie privée. Désabonnez-vous à tout moment.</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="benefits">
          <div className="container">
            <h2 className="section-title slide-in-left">🎁 Pourquoi Nous Choisir ?</h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-in">
                <span className="benefit-icon hover-bounce">🚚</span>
                <h3>Livraison Gratuite</h3>
                <p>Dès 50€ d'achat en France métropolitaine</p>
              </div>
              <div className="benefit-card fade-in delay-1">
                <span className="benefit-icon hover-bounce">🔒</span>
                <h3>Paiement Sécurisé</h3>
                <p>Transactions 100% sécurisées avec cryptage SSL</p>
              </div>
              <div className="benefit-card fade-in delay-2">
                <span className="benefit-icon hover-bounce">♻️</span>
                <h3>Éco-responsable</h3>
                <p>Produits naturels et emballages recyclables</p>
              </div>
              <div className="benefit-card fade-in delay-3">
                <span className="benefit-icon hover-bounce">💝</span>
                <h3>Satisfait ou Remboursé</h3>
                <p>Garantie 30 jours satisfait ou remboursé</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Instagram/RS */}
        <section className="social-section">
          <div className="container">
            <h2 className="section-title slide-in-left">📱 Suivez-nous</h2>
            <p className="social-subtitle">Rejoignez notre communauté et découvrez nos astuces beauté</p>
            <div className="social-grid">
              <a href="#" className="social-card hover-shake" aria-label="Suivez-nous sur Instagram">
                <span className="social-icon">📷</span>
                Instagram
              </a>
              <a href="#" className="social-card hover-shake" aria-label="Suivez-nous sur Facebook">
                <span className="social-icon">👍</span>
                Facebook
              </a>
              <a href="#" className="social-card hover-shake" aria-label="Suivez-nous sur Twitter">
                <span className="social-icon">🐦</span>
                Twitter
              </a>
              <a href="#" className="social-card hover-shake" aria-label="Suivez-nous sur Pinterest">
                <span className="social-icon">📌</span>
                Pinterest
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
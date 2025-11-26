// frontend/src/pages/Home.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products/featured');
        setFeaturedProducts(data.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
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
      </div>
    </>
  );
};

export default Home;
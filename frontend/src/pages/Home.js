import React, { useState, useEffect } from "react";
// ✅ CORRECTIONS : Importations obligatoires pour axios, Helmet, Link et Slider
import axios from 'axios'; 
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Slider from 'react-slick'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// ------------------------------------
import "./Home.css";

// ⚙️ Définition de sliderSettings (Correction de l'erreur 'is not defined')
const sliderSettings = {
    dots: true,
    infinite: true, 
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
        { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
        { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ]
};

// Fonction utilitaire pour obtenir l'URL de la première image de manière sécurisée
const getProductImageUrl = (product) => {
    // Utilise l'opérateur de chaînage optionnel (?.) pour accéder à la première image.
    // Si la structure est correcte, retourne l'URL.
    if (product.images?.[0]?.url) {
        return product.images[0].url;
    }
    // Retourne une image par défaut si aucune image n'est trouvée.
    return "https://dummyimage.com/600x400/ccc/000.png&text=Image+Non+Disponible";
};

const Home = () => {
    // Initialisation des états à un tableau vide []
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
              const { data } = await axios.get(
                    "https://cosmetics-shop-production.up.railway.app/api/products/featured"
                );
              setFeaturedProducts(data.data || []);
            } catch (error) {
              console.error("Erreur récupération produits vedette:", error);
            }
        };

        const fetchBestSellers = async () => {
            try {
              const { data } = await axios.get(
                    "https://cosmetics-shop-production.up.railway.app/api/products/best-sellers"
                );
              setBestSellers(data.data || []);
            } catch (error) {
              console.error("Erreur récupération meilleurs vendeurs:", error);
            } finally {
              setLoading(false);
            }
        };

        Promise.all([fetchFeaturedProducts(), fetchBestSellers()])
            .catch(err => {
                console.error("Erreur globale de chargement :", err);
                setLoading(false);
            });

    }, []);

    if (loading) {
        return <p style={{ textAlign: "center", padding: "100px 0" }}>Chargement des produits...</p>;
    }


    return (
        <>
            <Helmet>
              <title>BeautéShop - Accueil</title>
            </Helmet>

            <div className="home-container">

              {/* 🎁 HERO SECTION (Contenu restauré) */}
              <section className="hero-section">
                <h1>Découvrez les essentiels beauté du moment</h1>
                <p>Jusqu'à 40% de réduction sur une sélection d'articles.</p>
                <Link to="/products" className="btn-shop-now">Acheter maintenant</Link>
              </section>

              {/* 🛍️ CATEGORIES (Contenu restauré) */}
              <section className="categories-preview">
                <h2>Nos Catégories</h2>
                <div className="category-grid">
                    <div className="category-card"><Link to="/category/visage">Soins Visage</Link></div>
                    <div className="category-card"><Link to="/category/corps">Soins Corps</Link></div>
                    <div className="category-card"><Link to="/category/maquillage">Maquillage</Link></div>
                </div>
              </section>

              {/* FEATURED PRODUCTS */}
              <section className="featured-products">
                  <h2>Nouveautés</h2>
                  {featuredProducts.length === 0 ? (
                      <p style={{ textAlign: "center" }}>Aucun nouveau produit à afficher.</p>
                  ) : (
                      <Slider {...sliderSettings} className="product-slider">
                        {featuredProducts.map((product) => (
                          <div key={product._id} className="product-card">
                            <Link to={`/products/${product.slug}`}>
                              <div className="product-img-container">
                                  {/* 🎯 Utilisation de la fonction d'aide */}
                                  <img
                                    src={getProductImageUrl(product)} 
                                    alt={product.name}
                                    className="product-img"
                                  />
                              </div>
                              <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="product-brand">{product.brand}</p>
                                <div className="product-price">
                                  <span>{product.price}€</span>
                                  {product.compareAtPrice && (
                                    <span className="old-price">{product.compareAtPrice}€</span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </Slider>
                  )}
              </section>

              {/* 🟣 BEST SELLERS */}
              <section className="best-sellers">
                  <h2>Meilleures Ventes</h2>
                  {bestSellers.length === 0 ? (
                      <p style={{ textAlign: "center" }}>Aucun meilleur vendeur à afficher.</p>
                  ) : (
                      <div className="best-sellers-grid">
                        {bestSellers.map((product) => (
                          <Link
                            to={`/products/${product.slug}`}
                            key={product._id}
                            className="best-item"
                          >
                              {/* 🎯 Utilisation de la fonction d'aide */}
                              <img src={getProductImageUrl(product)} alt={product.name} />
                              
                            <h3>{product.name}</h3>
                            <p>{product.price}€</p>
                          </Link>
                        ))}
                      </div>
                  )}
              </section>

              {/* ⭐ CUSTOMER REVIEWS (Contenu restauré) */}
              <section className="customer-reviews">
                <h2>Ce que nos clients disent</h2>
                <div className="review-box">
                    <p>"Produits incroyables et livraison rapide !" - Julie D.</p>
                </div>
              </section>

              {/* 📰 BEAUTY BLOG (Contenu restauré) */}
              <section className="beauty-blog">
                <h2>Notre Blog Beauté</h2>
                <Link to="/blog/dernier-article">Lire le dernier article : Les tendances de l'hiver</Link>
              </section>

              {/* ✉️ NEWSLETTER (Contenu restauré) */}
              <section className="newsletter-signup">
                <h2>Abonnez-vous à notre Newsletter</h2>
                <p>Recevez 10% de réduction sur votre première commande.</p>
                <form><input type="email" placeholder="Votre email" /></form>
              </section>

              {/* BRANDS (Contenu restauré) */}
              <section className="brands-logos">
                <h2>Nos Marques Partenaires</h2>
                <div className="logo-placeholder">Logo A, Logo B, Logo C</div>
              </section>

              {/* Benefits (Contenu restauré) */}
              <section className="benefits-strip">
                <p>Livraison rapide | Paiement sécurisé | Retours faciles</p>
              </section>

              {/* FOOTER (Contenu restauré) */}
              <footer className="site-footer">
                <p>&copy; 2025 BeautéShop. Tous droits réservés.</p>
              </footer>

            </div>
        </>
    );
};

export default Home;
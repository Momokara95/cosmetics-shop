import React, { useState, useEffect } from "react";
// ✅ Imports Corrigés
import axios from 'axios'; 
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Slider from 'react-slick'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// (Assurez-vous d'avoir ici tous les autres imports de composants si nécessaire)

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
    if (product.images?.[0]?.url) {
        return product.images[0].url;
    }
    return "https://dummyimage.com/600x400/ccc/000.png&text=Image+Non+Disponible";
};

const Home = () => {
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

              {/* HERO (Inchangé) */}
              {/* CATEGORIES (Inchangé) */}

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
                              <img src={getProductImageUrl(product)} alt={product.name} />
                              
                            <h3>{product.name}</h3>
                            <p>{product.price}€</p>
                          </Link>
                        ))}
                      </div>
                  )}
              </section>

              {/* ⭐ CUSTOMER REVIEWS (Inchangé) */}
              {/* 📰 BEAUTY BLOG (Inchangé) */}
              {/* ✉️ NEWSLETTER (Inchangé) */}
              {/* BRANDS (Inchangé) */}
              {/* Benefits (Inchangé) */}
              {/* FOOTER (Inchangé) */}

            </div>
        </>
    );
};

export default Home;
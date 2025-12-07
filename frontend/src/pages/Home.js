import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import Slider from "react-slick";
import { FaSpa, FaTruck, FaLock, FaLeaf, FaHeart, FaStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

const Home = () => {
    // ➡️ CORRECTION 1 : Initialisation des états à un tableau vide [] pour éviter .map() sur undefined
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
              const { data } = await axios.get(
                    "https://cosmetics-shop-production.up.railway.app/api/products/featured"
                );
              setFeaturedProducts(data.data || []); // Assurez-vous d'utiliser un tableau si data.data est undefined
            } catch (error) {
              console.error("Erreur récupération produits vedette:", error);
            }
        };

        const fetchBestSellers = async () => {
            try {
              const { data } = await axios.get(
                    "https://cosmetics-shop-production.up.railway.app/api/products/best-sellers"
                );
              setBestSellers(data.data || []); // Assurez-vous d'utiliser un tableau
            } catch (error) {
              console.error("Erreur récupération meilleurs vendeurs:", error);
            } finally {
              setLoading(false);
            }
        };

        // Utilisation de Promise.all pour exécuter les deux fetch en parallèle (optimisation)
        Promise.all([fetchFeaturedProducts(), fetchBestSellers()])
            .catch(err => {
                console.error("Erreur globale de chargement :", err);
                setLoading(false);
            });

    }, []);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <>
            <Helmet>
              <title>BeautéShop - Accueil</title>
            </Helmet>

            <div className="home-container">

              {/* HERO */}
              <section className="hero">
                <img
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
                    alt="Bannière"
                    className="hero-bg"
                />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Révélez Votre Beauté Naturelle</h1>
                    <p>Des soins élégants pour sublimer votre peau</p>
                    <Link to="/products" className="cta-button">
                        Voir les produits
                    </Link>
                </div>
              </section>

              {/* CATEGORIES */}
              <section className="categories">
                  <h2>Nos Catégories</h2>
                  <div className="category-grid">
                      <Link to="/products?category=visage" className="category-card">
                        <FaSpa className="icon" />
                        <h3>Soins Visage</h3>
                      </Link>
                      <Link to="/products?category=corps" className="category-card">
                        <FaHeart className="icon" />
                        <h3>Soins Corps</h3>
                      </Link>
                      <Link to="/products?category=cheveux" className="category-card">
                        <FaLeaf className="icon" />
                        <h3>Soins Cheveux</h3>
                      </Link>
                      <Link to="/products?category=maquillage" className="category-card">
                        <FaHeart className="icon" />
                        <h3>Maquillage</h3>
                      </Link>
                  </div>
              </section>

              {/* FEATURED PRODUCTS */}
              <section className="featured-products">
                  <h2>Nouveautés</h2>
                  {loading ? (
                      <p style={{ textAlign: "center" }}>Chargement...</p>
                  ) : (
                      <Slider {...sliderSettings} className="product-slider">
                        {featuredProducts.map((product) => (
                          <div key={product._id} className="product-card">
                            <Link to={`/products/${product.slug}`}>
                              <div className="product-img-container">
                                  {product.images?.[0]?.url ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="product-img"
                                  />
                                  ) : (
                                  <div className="no-image">Pas d'image</div>
                                  )}
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
                  <div className="best-sellers-grid">
                      {bestSellers.map((product) => (
                        <Link
                          to={`/products/${product.slug}`}
                          key={product._id}
                          className="best-item"
                        >
                            {/* ➡️ CORRECTION 2 : Ajout de la vérification optionnelle pour 'images[0].url' */}
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} />
                          ) : (
                                <div className="no-image">Pas d'image</div>
                            )}
                            
                          <h3>{product.name}</h3>
                          <p>{product.price}€</p>
                        </Link>
                      ))}
                  </div>
              </section>

              {/* ⭐ CUSTOMER REVIEWS */}
              <section className="reviews">
                  <h2>Avis Clients</h2>
                  <div className="reviews-grid">

                      <div className="review-card">
                        <FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" />
                        <p>“Produits exceptionnel ! Ma peau est beaucoup plus douce.”</p>
                        <h4>- Aïcha</h4>
                      </div>

                      <div className="review-card">
                        <FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" />
                        <p>“Livraison rapide et service client au top.”</p>
                        <h4>- Mariama</h4>
                      </div>

                      <div className="review-card">
                        <FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" />
                        <p>“Les meilleurs produits naturels que j’ai testés.”</p>
                        <h4>- Fatou</h4>
                      </div>

                  </div>
              </section>

              {/* 📰 BEAUTY BLOG */}
              <section className="blog-section">
                  <h2>Conseils Beauté</h2>
                  <div className="blog-grid">
                      <div className="blog-card">
                        <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2" alt="" />
                        <h3>Comment avoir une peau parfaite ?</h3>
                        <p>Découvrez les secrets d’une routine simple et efficace.</p>
                      </div>

                      <div className="blog-card">
                        <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702" alt="" />
                        <h3>Top 5 des masques naturels</h3>
                        <p>Des recettes maison à base d’ingrédients naturels.</p>
                      </div>

                      <div className="blog-card">
                        <img src="https://images.unsplash.com/photo-1563225409-d6f6f1f6e6c9" alt="" />
                        <h3>Maquillage : tendances 2025</h3>
                        <p>Découvrez les looks les plus tendances du moment.</p>
                      </div>
                  </div>
              </section>

              {/* ✉️ NEWSLETTER */}
              <section className="newsletter">
                  <h2>Restez informé</h2>
                  <p>Recevez nos nouveautés et promotions exclusives.</p>
                  <form className="newsletter-form">
                      <input type="email" placeholder="Votre email" />
                      <button type="submit">S'inscrire</button>
                  </form>
              </section>

              {/* BRANDS */}
              <section className="brands">
                  <h2>Nos Marques</h2>
                  <div className="brands-row">
                      <img src="https://dummyimage.com/120x50/ccc/000.png&text=Brand+1" alt="" />
                      <img src="https://dummyimage.com/120x50/ccc/000.png&text=Brand+2" alt="" />
                      <img src="https://dummyimage.com/120x50/ccc/000.png&text=Brand+3" alt="" />
                      <img src="https://dummyimage.com/120x50/ccc/000.png&text=Brand+4" alt="" />
                  </div>
              </section>

              {/* Benefits */}
              <section className="benefits">
                  <div className="benefit-card">
                      <FaTruck className="icon" />
                      <h3>Livraison Rapide</h3>
                      <p>Sous 48h</p>
                  </div>
                  <div className="benefit-card">
                      <FaLock className="icon" />
                      <h3>Paiement Sécurisé</h3>
                      <p>Protection totale</p>
                  </div>
                  <div className="benefit-card">
                      <FaLeaf className="icon" />
                      <h3>Éco-responsable</h3>
                      <p>Formules clean</p>
                  </div>
                  <div className="benefit-card">
                      <FaHeart className="icon" />
                      <h3>Satisfait ou Remboursé</h3>
                      <p>30 jours</p>
                  </div>
              </section>

              {/* FOOTER */}
              <footer className="footer">
                  <div className="footer-content">
                      <p>&copy; 2025 BeautéShop. Tous droits réservés.</p>
                      <div className="footer-links">
                        <Link to="/about">À propos</Link>
                        <Link to="/contact">Contact</Link>
                        <Link to="/terms">Conditions</Link>
                      </div>
                  </div>
              </footer>

            </div>
        </>
    );
};

export default Home;
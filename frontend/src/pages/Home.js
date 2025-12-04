import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import Slider from "react-slick";
import { FaSpa, FaTruck, FaLock, FaLeaf, FaHeart } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axios.get(
          "https://cosmetics-shop-production.up.railway.app/api/products/featured"
        );
        setFeaturedProducts(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    fetchFeaturedProducts();
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
        <title>BeautéShop - Cosmétiques de Qualité | Accueil</title>
      </Helmet>

      <div className="home-container">

        {/* Hero Section */}
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

        {/* Categories Section */}
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

        {/* Featured Products Carousel */}
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

        {/* Benefits Section */}
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

      </div>
    </>
  );
};

export default Home;

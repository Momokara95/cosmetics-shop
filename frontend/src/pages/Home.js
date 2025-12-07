import { useState, useEffect } from "react";
// ... (imports)
import "./Home.css";

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

    // ... (sliderSettings inchangé)

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
                  {loading ? (
                      <p style={{ textAlign: "center" }}>Chargement...</p>
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
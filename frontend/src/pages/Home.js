import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import Slider from "react-slick";
import { FaSpa, FaTruck, FaLock, FaLeaf, FaHeart } from "react-icons/fa";

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

  // 🔥 Carrousel Slick settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
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

      <div className="w-full">

        {/* Banner */}
        <section className="relative w-full h-[70vh] flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9')",
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="relative z-10 text-center text-white px-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Révélez Votre Beauté Naturelle
            </h1>
            <p className="text-lg md:text-xl mb-6">
              Des soins élégants pour sublimer votre peau
            </p>
            <Link
              to="/products"
              className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-full text-white font-medium shadow-lg"
            >
              Voir les produits
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Nos Catégories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8 max-w-6xl mx-auto">

            <Link className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition">
              <FaSpa className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Soins Visage</h3>
            </Link>

            <Link className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition">
              <FaHeart className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Soins Corps</h3>
            </Link>

            <Link className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition">
              <FaLeaf className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Soins Cheveux</h3>
            </Link>

            <Link className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition">
              <FaHeart className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Maquillage</h3>
            </Link>

          </div>
        </section>

        {/* Nouveaux Produits - Carrousel */}
        <section className="py-16">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Nouveautés
          </h2>

          {loading ? (
            <p className="text-center">Chargement...</p>
          ) : (
            <div className="px-6 max-w-7xl mx-auto">
              <Slider {...sliderSettings}>
                {featuredProducts.map((product) => (
                  <div key={product._id} className="p-4">
                    <Link
                      to={`/products/${product.slug}`}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition block"
                    >
                      <div className="h-56 overflow-hidden rounded-t-xl">
                        <img
                          src={product.images?.[0]?.url}
                          className="w-full h-full object-cover"
                          alt={product.name}
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <div className="mt-2">
                          <span className="text-pink-600 font-semibold">
                            {product.price}€
                          </span>
                          {product.compareAtPrice && (
                            <span className="line-through text-gray-400 ml-2">
                              {product.compareAtPrice}€
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </section>

        {/* Benefits */}
        <section className="py-16 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto gap-6 px-6">

            <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
              <FaTruck className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Livraison Rapide</h3>
              <p className="text-sm text-gray-500">Sous 48h</p>
            </div>

            <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
              <FaLock className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Paiement Sécurisé</h3>
              <p className="text-sm text-gray-500">Protection totale</p>
            </div>

            <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
              <FaLeaf className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Éco-responsable</h3>
              <p className="text-sm text-gray-500">Formules clean</p>
            </div>

            <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
              <FaHeart className="text-4xl text-pink-500 mb-2" />
              <h3 className="font-medium">Satisfait ou Remboursé</h3>
              <p className="text-sm text-gray-500">30 jours</p>
            </div>

          </div>
        </section>

      </div>
    </>
  );
};

export default Home;

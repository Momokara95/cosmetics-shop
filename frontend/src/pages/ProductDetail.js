// frontend/src/pages/ProductDetail.js
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const { slug } = useParams();
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${slug}`);
        setProduct(data.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return <div className="loading">Chargement du produit...</div>;
  }

  if (!product) {
    return (
      <div className="container" style={{padding: '4rem 2rem', textAlign: 'center'}}>
        <h2>Produit non trouvé</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Retour aux produits
        </button>
      </div>
    );
  }

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} - BeautéShop</title>
        <meta name="description" content={product.description} />
        {product.seoKeywords && product.seoKeywords.length > 0 && (
          <meta name="keywords" content={product.seoKeywords.join(', ')} />
        )}
        
        {/* Open Graph */}
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        {product.images && product.images[0] && (
          <meta property="og:image" content={product.images[0].url} />
        )}
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images?.[0]?.url,
            "brand": product.brand,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "EUR",
              "availability": product.stock > 0 ? "InStock" : "OutOfStock"
            }
          })}
        </script>
      </Helmet>

      <div className="product-detail">
        <div className="container">
          {showSuccess && (
            <div className="success-banner">
              ✓ Produit ajouté au panier !
            </div>
          )}

          <div className="product-layout">
            {/* Images Gallery */}
            <div className="product-gallery">
              <div className="main-image">
                {product.images && product.images[selectedImage] ? (
                  <img 
                    src={product.images[selectedImage].url} 
                    alt={product.images[selectedImage].alt || product.name}
                  />
                ) : (
                  <div className="no-image">Pas d'image disponible</div>
                )}
                {discount > 0 && (
                  <span className="discount-badge">-{discount}%</span>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="thumbnail-gallery">
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={img.url}
                      alt={img.alt || `Image ${index + 1}`}
                      className={selectedImage === index ? 'active' : ''}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info-detail">
              <div className="product-meta">
                <span className="category-badge">{product.category}</span>
                <span className="brand-badge">{product.brand}</span>
              </div>

              <h1>{product.name}</h1>

              <div className="product-rating">
                <span className="stars">{'⭐'.repeat(Math.round(product.rating || 0))}</span>
                <span className="reviews">({product.numReviews || 0} avis)</span>
              </div>

              <div className="product-price-section">
                <div className="price-group">
                  <span className="current-price">{product.price}€</span>
                  {product.compareAtPrice && (
                    <span className="old-price">{product.compareAtPrice}€</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="save-amount">Économisez {(product.compareAtPrice - product.price).toFixed(2)}€</span>
                )}
              </div>

              <p className="product-description">{product.description}</p>

              {/* Quantity & Add to Cart */}
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label>Quantité:</label>
                  <div className="qty-controls">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {product.stock > 0 ? (
                  <>
                    <button onClick={handleAddToCart} className="btn-add-to-cart">
                      🛒 Ajouter au panier
                    </button>
                    <p className="stock-info">
                      {product.stock < 10 && `Plus que ${product.stock} en stock !`}
                    </p>
                  </>
                ) : (
                  <div className="out-of-stock-banner">Rupture de stock</div>
                )}
              </div>

              {/* Product Details Tabs */}
              <div className="product-tabs">
                {product.ingredients && product.ingredients.length > 0 && (
                  <div className="tab-content">
                    <h3>🌿 Ingrédients</h3>
                    <ul>
                      {product.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.benefits && product.benefits.length > 0 && (
                  <div className="tab-content">
                    <h3>✨ Bienfaits</h3>
                    <ul>
                      {product.benefits.map((ben, i) => (
                        <li key={i}>{ben}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.howToUse && (
                  <div className="tab-content">
                    <h3>📝 Mode d'emploi</h3>
                    <p>{product.howToUse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
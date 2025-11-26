// frontend/src/pages/Products.js
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/products?';
        if (category) url += `category=${category}&`;
        if (search) url += `search=${search}&`;

        const { data } = await axios.get(url);
        setProducts(data.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search]);

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchValue = formData.get('search');
    
    const params = new URLSearchParams(searchParams);
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Tous nos Produits - BeautéShop</title>
        <meta name="description" content="Parcourez notre gamme complète de produits cosmétiques de qualité." />
      </Helmet>

      <div className="products-page">
        <div className="container">
          {/* Search and Filters */}
          <div className="filters-section">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                name="search"
                placeholder="Rechercher un produit..."
                defaultValue={search}
                className="search-input"
              />
              <button type="submit" className="search-btn">🔍</button>
            </form>

            <div className="categories-filter">
              <button
                className={!category ? 'active' : ''}
                onClick={() => handleCategoryChange('')}
              >
                Tous
              </button>
              <button
                className={category === 'visage' ? 'active' : ''}
                onClick={() => handleCategoryChange('visage')}
              >
                Visage
              </button>
              <button
                className={category === 'corps' ? 'active' : ''}
                onClick={() => handleCategoryChange('corps')}
              >
                Corps
              </button>
              <button
                className={category === 'cheveux' ? 'active' : ''}
                onClick={() => handleCategoryChange('cheveux')}
              >
                Cheveux
              </button>
              <button
                className={category === 'maquillage' ? 'active' : ''}
                onClick={() => handleCategoryChange('maquillage')}
              >
                Maquillage
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading">Chargement des produits...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>Aucun produit trouvé</p>
            </div>
          ) : (
            <>
              <p className="products-count">{products.length} produit(s) trouvé(s)</p>
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <Link to={`/products/${product.slug}`}>
                      <div className="product-image">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} />
                        ) : (
                          <div className="no-image">Pas d'image</div>
                        )}
                        {product.compareAtPrice && (
                          <span className="badge-sale">PROMO</span>
                        )}
                      </div>
                      <div className="product-info">
                        <span className="product-category">{product.category}</span>
                        <h3>{product.name}</h3>
                        <p className="product-brand">{product.brand}</p>
                        <div className="product-price">
                          <span className="current-price">{product.price}€</span>
                          {product.compareAtPrice && (
                            <span className="old-price">{product.compareAtPrice}€</span>
                          )}
                        </div>
                        {product.stock === 0 && (
                          <span className="out-of-stock">Rupture de stock</span>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
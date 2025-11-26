// frontend/src/pages/admin/AddProduct.js
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './AddProduct.css';

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: 'visage',
    brand: '',
    stock: '',
    featured: false,
    ingredients: '',
    benefits: '',
    howToUse: '',
    imageUrl: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vérifie si l'utilisateur est admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>⛔ Accès refusé</h2>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      // Préparer les données
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        category: formData.category,
        brand: formData.brand,
        stock: parseInt(formData.stock),
        featured: formData.featured,
        images: formData.imageUrl ? [{
          url: formData.imageUrl,
          alt: formData.name
        }] : [],
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : [],
        benefits: formData.benefits ? formData.benefits.split(',').map(b => b.trim()) : [],
        howToUse: formData.howToUse,
        seoTitle: formData.seoTitle || formData.name,
        seoDescription: formData.seoDescription || formData.description,
        seoKeywords: formData.seoKeywords ? formData.seoKeywords.split(',').map(k => k.trim()) : []
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/products',
        productData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('✅ Produit ajouté avec succès !');
      
      // Réinitialiser le formulaire
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Ajouter un produit - Admin</title>
      </Helmet>

      <div className="add-product-page">
        <div className="container">
          <h1>➕ Ajouter un nouveau produit</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="product-form">
            {/* Informations de base */}
            <div className="form-section">
              <h2>📝 Informations de base</h2>

              <div className="form-group">
                <label htmlFor="name">Nom du produit *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Crème Hydratante Bio"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Décrivez le produit en détail..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="brand">Marque *</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    placeholder="Ex: BeautéNature"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Catégorie *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="visage">Visage</option>
                    <option value="corps">Corps</option>
                    <option value="cheveux">Cheveux</option>
                    <option value="maquillage">Maquillage</option>
                    <option value="parfum">Parfum</option>
                    <option value="soins">Soins</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Prix et stock */}
            <div className="form-section">
              <h2>💰 Prix et stock</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Prix (€) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="29.99"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="compareAtPrice">Prix barré (€)</label>
                  <input
                    type="number"
                    id="compareAtPrice"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="39.99"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <span>⭐ Produit en vedette</span>
                </label>
              </div>
            </div>

            {/* Image */}
            <div className="form-section">
              <h2>📸 Image</h2>
              <div className="form-group">
                <label htmlFor="imageUrl">URL de l'image</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                <small>Utilisez des images depuis Unsplash ou votre serveur</small>
              </div>
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Aperçu" />
                </div>
              )}
            </div>

            {/* Détails produit */}
            <div className="form-section">
              <h2>🌿 Détails du produit</h2>

              <div className="form-group">
                <label htmlFor="ingredients">Ingrédients (séparés par des virgules)</label>
                <input
                  type="text"
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  placeholder="Acide Hyaluronique, Beurre de Karité, Vitamine E"
                />
              </div>

              <div className="form-group">
                <label htmlFor="benefits">Bienfaits (séparés par des virgules)</label>
                <input
                  type="text"
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Hydratation 24h, Anti-âge, Apaise"
                />
              </div>

              <div className="form-group">
                <label htmlFor="howToUse">Mode d'emploi</label>
                <textarea
                  id="howToUse"
                  name="howToUse"
                  value={formData.howToUse}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Appliquer matin et soir..."
                />
              </div>
            </div>

            {/* SEO */}
            <div className="form-section">
              <h2>🔍 SEO (Optionnel)</h2>

              <div className="form-group">
                <label htmlFor="seoTitle">Titre SEO</label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  placeholder="Laissez vide pour utiliser le nom du produit"
                  maxLength="60"
                />
                <small>Maximum 60 caractères</small>
              </div>

              <div className="form-group">
                <label htmlFor="seoDescription">Description SEO</label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Laissez vide pour utiliser la description"
                  maxLength="155"
                />
                <small>Maximum 155 caractères</small>
              </div>

              <div className="form-group">
                <label htmlFor="seoKeywords">Mots-clés SEO (séparés par des virgules)</label>
                <input
                  type="text"
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                  placeholder="crème hydratante, bio, naturel"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Ajout en cours...' : '✅ Ajouter le produit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
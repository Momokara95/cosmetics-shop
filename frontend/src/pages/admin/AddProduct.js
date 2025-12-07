import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./AddProduct.css";

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "visage",
    brand: "",
    stock: "",
    featured: false,
    ingredients: "",
    benefits: "",
    howToUse: "",
    // Retiré : imageUrl: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // 📸 Images uploadées ou ajoutées par URL
  const [images, setImages] = useState([]);
  // 🔗 État temporaire pour la saisie d'une URL
  const [tempImageUrl, setTempImageUrl] = useState("");

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Admin check
  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2>⛔ Accès refusé</h2>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    );
  }

  // 🔹 Inputs change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔹 Upload Multi Images
  const handleMultiImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const uploadedImages = [];

      for (let file of files) {
        const form = new FormData();
        form.append("image", file);

        const { data } = await axios.post(
          "https://cosmetics-shop-production.up.railway.app/api/upload",
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (evt) => {
              const percent = Math.round((evt.loaded * 100) / evt.total);
              setUploadProgress(percent);
            },
          }
        );

        // Les images uploadées ont maintenant une URL
        uploadedImages.push({
          url: data.url,
          alt: formData.name || "Photo produit",
        });
      }

      setImages([...images, ...uploadedImages]);
      setUploading(false);
      setUploadProgress(0);
    } catch (err) {
      setUploading(false);
      setError("Erreur lors de l'upload des images");
    }
  };

  // 🔹 Ajouter une image par URL (NOUVEAU)
  const handleAddImageUrl = () => {
    if (tempImageUrl.trim()) {
      const newImage = {
        url: tempImageUrl.trim(),
        alt: formData.name || "Photo produit",
      };
      // Ajoute la nouvelle image au tableau 'images'
      setImages([...images, newImage]);
      // Réinitialise le champ de saisie
      setTempImageUrl("");
    }
  };

  // 🔹 Supprimer une image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 🔹 Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        category: formData.category,
        brand: formData.brand,
        stock: parseInt(formData.stock),
        featured: formData.featured,

        // Images : Utilise directement l'état 'images' qui contient toutes les URLs
        images: images,

        ingredients: formData.ingredients
          ? formData.ingredients.split(",").map((i) => i.trim())
          : [],

        benefits: formData.benefits
          ? formData.benefits.split(",").map((b) => b.trim())
          : [],

        howToUse: formData.howToUse,

        seoTitle: formData.seoTitle || formData.name,
        seoDescription: formData.seoDescription || formData.description,
        seoKeywords: formData.seoKeywords
          ? formData.seoKeywords.split(",").map((k) => k.trim())
          : [],
      };

      await axios.post(
        "https://cosmetics-shop-production.up.railway.app/api/products",
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Produit ajouté avec succès ✔");

      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Ajouter un produit</title>
      </Helmet>

      <div className="add-product-page">
        <div className="container">
          <h1>➕ Ajouter un nouveau produit</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="product-form">

            {/* 📝 Informations de base (Inchangé) */}
            <div className="form-section">
              <h2>📝 Informations de base</h2>

              <div className="form-group">
                <label>Nom *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Marque *</label>
                  <input
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Catégorie *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
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

            <hr/>

            {/* 💰 Prix et stock (Inchangé) */}
            <div className="form-section">
              <h2>💰 Prix et stock</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prix barré</label>
                  <input
                    type="number"
                    name="compareAtPrice"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span>⭐ Produit en vedette</span>
              </label>
            </div>

            <hr/>

            {/* 📸 Images (MISE À JOUR) */}
            <div className="form-section">
              <h2>📸 Images</h2>

              {/* 1. UPLOAD DE FICHIERS */}
              <div className="form-group">
                <label>Importer des images (Fichiers)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultiImageUpload}
                />

                {uploading && (
                  <div className="upload-progress">
                    Upload {uploadProgress}%
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: uploadProgress + "%" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
             
              <p style={{textAlign: 'center', margin: '1rem 0'}}>— OU —</p>

              {/* 2. URL IMAGE */}
              <div className="form-group">
                <label>URL image (optionnel)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="url"
                    placeholder="Coller l'URL ici..."
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddImageUrl}
                    disabled={!tempImageUrl.trim()}
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* 3. PRÉVISUALISATION DES IMAGES */}
              {images.length > 0 && (
                <div className="images-preview-grid">
                  {images.map((img, i) => (
                    <div className="preview-box" key={i}>
                      <img src={img.url} alt={img.alt || 'produit'} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(i)}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr/>

            {/* 🌿 Détails (Inchangé) */}
            <div className="form-section">
              <h2>🌿 Détails</h2>

              <div className="form-group">
                <label>Ingrédients</label>
                <input
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  placeholder="Séparez les ingrédients par des virgules (ex: Eau, Glycérine, Huile d'amande)"
                />
              </div>

              <div className="form-group">
                <label>Bienfaits</label>
                <input
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Séparez les bienfaits par des virgules (ex: Hydrate, Anti-âge, Illumine)"
                />
              </div>

              <div className="form-group">
                <label>Comment utiliser ?</label>
                <textarea
                  name="howToUse"
                  value={formData.howToUse}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <hr/>

            {/* 🔍 SEO (Inchangé) */}
            <div className="form-section">
              <h2>🔍 SEO</h2>

              <div className="form-group">
                <label>Titre SEO</label>
                <input
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description SEO</label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Mots-clés</label>
                <input
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                />
              </div>
            </div>

            <hr/>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                Annuler
              </button>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Ajout..." : "Ajouter ✔"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
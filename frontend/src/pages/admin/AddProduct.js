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
    // ⚠️ Suppression de imageUrl ici
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // Images uploadées ou ajoutées par URL
  const [images, setImages] = useState([]);
  // État temporaire pour la saisie d'une URL
  const [tempImageUrl, setTempImageUrl] = useState("");

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Admin check (inchange)
  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2>⛔ Accès refusé</h2>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    );
  }

  // 🔹 Inputs change (inchange)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔹 Upload Multi Images (inchange)
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

  // 🔹 Ajouter une image par URL (NOUVELLE FONCTION)
  const handleAddImageUrl = () => {
    if (tempImageUrl.trim()) {
      const newImage = {
        url: tempImageUrl.trim(),
        alt: formData.name || "Photo produit",
      };
      setImages([...images, newImage]);
      setTempImageUrl("");
    }
  };


  // 🔹 Supprimer une image (inchange)
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 🔹 Form Submit (MISE À JOUR)
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

        // Images : On utilise uniquement l'état 'images'
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

            {/* 📝 Infos (inchangé) */}
            {/* ... */}
            

            {/* 💰 Prix et stock (inchangé) */}
            {/* ... */}

            {/* 📸 Images */}
            <div className="form-section">
              <h2>📸 Images</h2>

              {/* UPLOAD DE FICHIERS */}
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
             
             <hr className="separator" />

              {/* 🎯 URL IMAGE (MAJ) */}
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


              {/* PRÉVISUALISATION DES IMAGES (Inchangé) */}
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

            {/* 🌿 Détails (inchangé) */}
            {/* 🔍 SEO (inchangé) */}
            {/* Actions (inchangé) */}
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
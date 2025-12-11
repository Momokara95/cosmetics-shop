import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    FaSave, FaTimes, FaSpinner, FaImage 
} from 'react-icons/fa';

const API_ADMIN_URL = "/api/products/admin"; 

export default function ProductEditForm({ initialProduct, onSaveSuccess, onCancel }) {
    
    // État local pour gérer les modifications du produit
    const [product, setProduct] = useState(initialProduct);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Synchronisation de l'état initial
    useEffect(() => {
        setProduct(initialProduct);
    }, [initialProduct]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        const numericValue = name === 'price' ? parseFloat(value) : parseInt(value, 10);
        setProduct(prev => ({
            ...prev,
            [name]: isNaN(numericValue) ? 0 : numericValue
        }));
    };

    const handleActiveToggle = (e) => {
        // isDeleted est l'inverse de l'état "Actif"
        setProduct(p => ({ ...p, isDeleted: !e.target.checked }));
    };
    
    const handleImageChange = () => {
        // Fonctionnalité d'upload non implémentée ici
        toast.info("La logique d'upload d'image doit être implémentée ici.");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return toast.error("Veuillez vous reconnecter.");
        }
        
        if (!product.name || product.price === undefined || product.countInStock === undefined) {
            setLoading(false);
            return toast.error("Le nom, le prix et le stock sont obligatoires.");
        }

        try {
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };
            
            const productDataToSend = {
                ...product,
                price: parseFloat(product.price),
                countInStock: parseInt(product.countInStock, 10)
            };

            // Utilise l'ID existant pour la mise à jour (PUT)
            const response = await axios.put(`${API_ADMIN_URL}/${product._id}`, productDataToSend, authConfig);
            
            toast.success("Produit enregistré avec succès !", { icon: <FaSave /> });
            onSaveSuccess(response.data.data);
            
        } catch (err) {
            console.error("Erreur de sauvegarde:", err.response || err);
            const msg = err.response?.data?.message || "Échec de l'enregistrement. Vérifiez la connexion API.";
            setError(msg);
            toast.error(msg, { icon: <FaTimes /> });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-edit-form-container">
            <h2 className="form-title">
                {product._id ? `Éditer le produit: ${product.name || 'Sans Nom'}` : "Création d'un nouveau produit"}
            </h2>

            {error && <p className="form-error-message">{error}</p>}
            
            <form onSubmit={handleSubmit} className="product-form">
                
                {/* LIGNE 1 : Nom */}
                <div className="form-group full-width">
                    <label htmlFor="name">Nom du Produit *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={product.name || ''}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                {/* LIGNE 2 : Description */}
                <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={product.description || ''}
                        onChange={handleChange}
                        rows="4"
                        disabled={loading}
                    />
                </div>
                
                {/* LIGNE 3 : Prix & Stock */}
                <div className="form-row">
                    <div className="form-group half-width">
                        <label htmlFor="price">Prix (€) *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={product.price?.toFixed(2) || '0.00'}
                            onChange={handleNumericChange}
                            step="0.01"
                            min="0"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group half-width">
                        <label htmlFor="countInStock">Stock *</label>
                        <input
                            type="number"
                            id="countInStock"
                            name="countInStock"
                            value={product.countInStock || 0}
                            onChange={handleNumericChange}
                            min="0"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LIGNE 4 : Catégorie & Image */}
                <div className="form-row">
                    <div className="form-group half-width">
                        <label htmlFor="category">Catégorie</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={product.category || ''}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group half-width">
                        <label htmlFor="image">Image URL / Fichier</label>
                        <div className="image-upload-control">
                            <input
                                type="text"
                                id="image"
                                name="image"
                                value={product.image || ''}
                                placeholder="URL de l'image"
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <button type="button" onClick={handleImageChange} className="btn-upload" disabled={loading}>
                                <FaImage /> Upload
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* LIGNE 5 : Statut */}
                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={!product.isDeleted}
                        onChange={handleActiveToggle}
                        disabled={loading}
                    />
                    <label htmlFor="isActive">Produit Actif / Visible dans le magasin</label>
                </div>

                {/* Boutons d'action */}
                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
                        <FaTimes /> Annuler
                    </button>
                    <button 
                        type="submit" 
                        className="btn-success" 
                        disabled={loading || !product.name || product.price === undefined || product.countInStock === undefined}
                    >
                        {loading ? <FaSpinner className="spinner-icon spin" /> : <FaSave />} 
                        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </form>
        </div>
    );
}
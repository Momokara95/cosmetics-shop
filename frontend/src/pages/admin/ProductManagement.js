// frontend/src/pages/admin/ProductManagement.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle, 
    FaAngleLeft, FaAngleRight, FaBox, FaSpinner, FaSearch, FaTimes
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import du composant de formulaire d'édition
import ProductEditForm from '../../components/admin/ProductEditForm'; 

// Styles
import './ProductManagement.css'; 
// Assurez-vous d'importer les styles pour ProductEditForm si vous utilisez des fichiers CSS séparés
// import '../../components/admin/ProductEditForm.css'; 

// --- Constantes globales ---
const ITEMS_PER_PAGE = 10;
// Utilisez l'URL de base pour les produits d'administration
const API_ADMIN_URL = "/api/products/admin"; 
// Note : Si votre backend est sur un autre domaine/port, utilisez l'URL complète.

// ---------------------------------------------------
// Composant Principal ProductManagement
// ---------------------------------------------------
export default function ProductManagement() {
    
    // État de la liste
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    
    // État de la pagination et des filtres
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterActive, setFilterActive] = useState('All'); // 'true', 'false', 'All'
    const [searchKeyword, setSearchKeyword] = useState('');

    // 🆕 État pour l'édition (Contient le produit à éditer ou null si on est en mode liste)
    const [editingProduct, setEditingProduct] = useState(null); 


    // 🔗 Fonction de chargement des données
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                // Gestion si l'utilisateur n'est pas connecté
                throw new Error("Authentification requise. Redirection...");
            }
            
            // Construction des Query Parameters
            let url = `${API_ADMIN_URL}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
            if (filterActive !== 'All') {
                // Note: La valeur 'true' ou 'false' correspond au filtre 'isActive' du backend
                // qui gère en interne le champ 'isDeleted'.
                url += `&isActive=${filterActive}`;
            }
            if (searchKeyword) {
                url += `&keyword=${searchKeyword}`;
            }

            const authConfig = { headers: { Authorization: `Bearer ${token}` } };
            
            const response = await axios.get(url, authConfig);
            
            const { products: fetchedProducts, totalPages: backendTotalPages } = response.data.data;
            
            setProducts(fetchedProducts); 
            setTotalPages(backendTotalPages); 

        } catch (err) {
            console.error("Erreur de récupération des produits:", err);
            const errorMsg = err.response?.status === 401 || err.response?.status === 403 
                            ? "Session expirée ou droits insuffisants."
                            : "Impossible de charger les produits. Vérifiez la connexion API.";
            setError(errorMsg);
        } finally {
            setLoading(false); 
        }
    };

    // ➡️ useEffect : relance le chargement si la page, le filtre ou le mot-clé change
    useEffect(() => {
        fetchProducts();
    }, [currentPage, filterActive, searchKeyword]); 

    
    // --- Handlers UI ---
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Début de la recherche à la première page
    }

    // 🆕 Gère la création d'un produit par défaut et l'ouverture immédiate du formulaire
    const handleCreateProduct = async () => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Veuillez vous reconnecter.");

        try {
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };
            // Le backend crée un produit par défaut minimal
            const response = await axios.post(API_ADMIN_URL, {}, authConfig);
            
            toast.info("Produit par défaut créé. Veuillez compléter les informations.", { icon: <FaInfoCircle /> });
            
            // Ouvre le formulaire d'édition avec le nouveau produit minimal
            setEditingProduct(response.data.data); 

        } catch (err) {
            console.error("Erreur lors de la création du produit:", err);
            toast.error("Échec de la création du produit.", { icon: <FaExclamationCircle /> });
        }
    };
    
    const handleEditClick = (product) => {
        setEditingProduct(product); // Ouvre le formulaire en mode édition
    };

    const handleCancelEdit = () => {
        setEditingProduct(null); // Ferme le formulaire
    }

    const handleSaveSuccess = (updatedProduct) => {
        // 1. Fermer le formulaire d'édition
        setEditingProduct(null); 
        
        // 2. Si c'est une mise à jour d'un produit existant, mettre à jour la liste sans re-fetch complet
        const exists = products.some(p => p._id === updatedProduct._id);
        if (exists) {
            setProducts(prevProducts => 
                prevProducts.map(p => 
                    p._id === updatedProduct._id ? updatedProduct : p
                )
            );
        } else {
            // Si c'est une création (devrait déjà être dans la liste si on a géré 'handleCreateProduct'), 
            // le plus simple est de recharger la page pour s'assurer que le nouveau produit est affiché.
            fetchProducts();
        }
    };
    
    // 💡 Gérer la suppression logicielle (soft delete via isDeleted)
    const handleStatusToggle = async (product) => {
        const newState = !product.isDeleted; // Le nouvel état (actif ou désactivé)

        if (!window.confirm(`Êtes-vous sûr de vouloir ${newState ? 'désactiver' : 'réactiver'} le produit : ${product.name} ?`)) {
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return toast.error("Veuillez vous reconnecter.");

        try {
            await axios.put(
                `${API_ADMIN_URL}/${product._id}`, 
                { isDeleted: newState }, // Envoie uniquement le champ isDeleted
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success(`Produit ${product.name} ${newState ? 'désactivé' : 'réactivé'} avec succès.`, { icon: <FaCheckCircle /> });
            
            // Mise à jour de l'état local immédiatement
            setProducts(prevProducts => 
                prevProducts.map(p => 
                    p._id === product._id ? { ...p, isDeleted: newState } : p
                )
            );

        } catch (err) {
            console.error("Erreur lors de la mise à jour du statut:", err);
            toast.error("Échec de la mise à jour du statut du produit.", { icon: <FaExclamationCircle /> });
        }
    };


    // --- RENDU Conditionnel ---
    
    // Si nous sommes en mode édition/création, afficher le formulaire à la place de la liste
    if (editingProduct) {
        // 
        return (
            <div className="admin-product-management-wrapper">
                <ToastContainer />
                <ProductEditForm 
                    initialProduct={editingProduct} 
                    onSaveSuccess={handleSaveSuccess} 
                    onCancel={handleCancelEdit} 
                />
            </div>
        );
    }

    if (loading && products.length === 0) {
        return (
            <div className="loading-spinner">
                <FaSpinner className="spinner-icon pulse" />
                <p>Chargement des produits...</p>
            </div>
        );
    }

    // --- Rendu de la LISTE (Tableau) ---
    return (
        <div className="admin-product-management">
            <ToastContainer />

            <div className="product-header">
                <h1><FaBox /> Gestion des Produits</h1>
                <button onClick={handleCreateProduct} className="btn-primary create-btn">
                    <FaPlus /> Ajouter un Produit
                </button>
            </div>

            {error && <p className="critical-error-message">{error}</p>}
            
            {/* ⚙️ Contrôles de Filtre & Recherche */}
            <div className="product-controls">
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn-search"><FaSearch /></button>
                </form>

                <div className="filter-group">
                    <label htmlFor="active-filter">Statut : </label>
                    <select 
                        id="active-filter"
                        value={filterActive}
                        onChange={(e) => {
                            setFilterActive(e.target.value);
                            setCurrentPage(1); // Réinitialiser la page lors du changement de filtre
                        }}
                        className="filter-select"
                        disabled={loading}
                    >
                        <option value="All">Tous</option>
                        <option value="true">Actifs</option>
                        <option value="false">Désactivés</option>
                    </select>
                </div>
            </div>


            {/* 📋 Tableau des Produits */}
            <div className="product-list-container">
                {products.length === 0 && !loading ? (
                    <p className="placeholder">Aucun produit trouvé avec ces critères.</p>
                ) : (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Prix</th>
                                <th>Stock</th>
                                <th>Catégorie</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id} className={product.isDeleted ? 'deleted-row' : ''}>
                                    <td>#{product._id.slice(-6)}</td>
                                    <td className="product-name-cell">{product.name}</td>
                                    <td>{product.price.toFixed(2)} €</td>
                                    <td className={product.countInStock < 5 ? 'low-stock' : ''}>
                                        {product.countInStock}
                                    </td>
                                    <td>{product.category}</td>
                                    <td>
                                        <span className={`status-badge status-${product.isDeleted ? 'disabled' : 'active'}`}>
                                            {product.isDeleted ? 'Désactivé' : 'Actif'}
                                        </span>
                                    </td>
                                    <td className="action-cell">
                                        <button onClick={() => handleEditClick(product)} className="btn-action btn-edit" title="Éditer">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleStatusToggle(product)} className={`btn-action ${product.isDeleted ? 'btn-activate' : 'btn-delete'}`} title={product.isDeleted ? 'Réactiver' : 'Désactiver'}>
                                            {product.isDeleted ? <FaCheckCircle /> : <FaTrash />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* ➡️ Contrôles de Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            <FaAngleLeft /> Précédent
                        </button>
                        
                        <span className="page-info">
                            Page **{currentPage}** sur **{totalPages}**
                        </span>
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="pagination-button"
                        >
                            Suivant <FaAngleRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
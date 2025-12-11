// frontend/src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";

// Composants Admin
import ProductManagement from "./pages/admin/ProductManagement"; // ✅ Nouveau
import AddProduct from "./pages/admin/AddProduct";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  // Note: Le routage est maintenant configuré pour supporter le monorepo Vercel.
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Navbar />

              <main className="main-content">
                <Routes>
                  {/* ======================= Routes Publiques ======================= */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/checkout" element={<Checkout />} />

                  {/* ======================= Routes Administrateur ======================= */}
                  
                  {/* Dashboard principal de l'administration */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* 🟢 ROUTE CRUCIALE AJOUTÉE : Gestion complète des produits */}
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedAdminRoute>
                        <ProductManagement /> 
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* Route d'ajout de produit (si c'est une page séparée) */}
                  <Route
                    path="/admin/add-product"
                    element={
                      <ProtectedAdminRoute>
                        <AddProduct />
                      </ProtectedAdminRoute>
                    }
                  />
                  
                  {/* Route d'édition spécifique par ID (pour l'édition détaillée) */}
                  <Route
                    path="/admin/products/:id/edit"
                    element={
                      <ProtectedAdminRoute>
                        {/* Ici, vous pouvez soit réutiliser ProductManagement si l'édition est modale,
                          soit créer une page spécifique si l'édition prend toute la page.
                          Pour l'instant, nous utiliserons AddProduct comme placeholder ou créerons ProductEditPage.
                        */}
                        <AddProduct /> 
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* Route Catch-all pour les pages non trouvées */}
                  <Route path="*" element={<Home />} /> 

                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
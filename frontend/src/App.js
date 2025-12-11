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

import AddProduct from "./pages/admin/AddProduct";
import AdminDashboard from "./pages/AdminDashboard";
// 🟢 CORRECTION 1 : Importez le composant de gestion des produits
import ProductManagement from "./pages/admin/ProductManagement"; 

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Navbar />

              <main className="main-content">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/checkout" element={<Checkout />} />

                  {/* Admin */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* 🟢 CORRECTION 2 : Ajoutez la route manquante pour la gestion des produits */}
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedAdminRoute>
                        <ProductManagement /> 
                      </ProtectedAdminRoute>
                    }
                  />

                  <Route
                    path="/admin/add-product"
                    element={
                      <ProtectedAdminRoute>
                        <AddProduct />
                      </ProtectedAdminRoute>
                    }
                  />
                  {/* Note: Il vous faudra probablement aussi une route pour l'édition : /admin/product/:id/edit */}
                </Routes>
              </main>
                    // Note: Le routage est maintenant configuré pour supporter le monorepo Vercel.
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
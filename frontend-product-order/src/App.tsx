import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { login, handleCallback } from "./components/Security/auth";
import { useAuth } from "./components/Security/useAuth";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { ProductsPage } from "./components/products/ProductsPage";
import { OrdersPage } from "./components/orders/OrdersPage";
import "./styles/index.css";

function App() {
  const {
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    refreshTokenFunction,
    logout,
    updateAuthState,
  } = useAuth();

  useEffect(() => {
    // Si estamos en /callback, intercambiar el código por el token
    if (window.location.pathname === "/callback") {
      handleCallback()
        .then((newAccessToken) => {
          if (newAccessToken) {
            updateAuthState(); // Actualizar el estado después del login
            window.history.replaceState({}, "", "/"); // Limpiar la URL
          }
        })
        .catch((error) => {
          console.error("Error handling callback:", error);
        });
    }
  }, [updateAuthState]);

  if (isLoading)
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <main className="main-content">
          <div className="auth-section">
            <h2 className="auth-title">Iniciar sesión</h2>
            <button className="btn btn-primary btn-lg" onClick={login}>
              Login con OAuth2
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navigation onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  accessToken={accessToken}
                  refreshToken={refreshToken}
                  onRefreshToken={refreshTokenFunction}
                />
              }
            />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

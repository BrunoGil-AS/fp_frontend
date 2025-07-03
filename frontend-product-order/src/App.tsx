import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { login } from "./components/Security/auth";
import { useAuth } from "./components/Security/useAuth";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { ProductsPage } from "./components/products/ProductsPage";
import { OrdersPage } from "./components/orders/OrdersPage";
import { UserPage } from "./components/user/UserPage";
import { CallbackPage } from "./components/CallbackPage";
import "./styles/index.css";

function App() {
  const { accessToken, isAuthenticated, isLoading, logout, updateAuthState } =
    useAuth();

  if (isLoading)
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    );

  if (!isAuthenticated) {
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-container">
          <Routes>
            <Route
              path="/callback"
              element={<CallbackPage onAuthUpdate={updateAuthState} />}
            />
            <Route
              path="*"
              element={
                <main className="main-content">
                  <div className="auth-section">
                    <h2 className="auth-title">Iniciar sesión</h2>
                    <button className="btn btn-primary btn-lg" onClick={login}>
                      Login con OAuth2
                    </button>
                  </div>
                </main>
              }
            />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-container">
        <Navigation onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={<Dashboard accessToken={accessToken} />}
            />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<UserPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

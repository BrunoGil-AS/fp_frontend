import { Link, useLocation } from "react-router-dom";
import "../styles/components/navigation.css";

interface NavigationProps {
  onLogout: () => void;
}

export function Navigation({ onLogout }: NavigationProps) {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>Product Store</h1>
      </div>
      <div className="nav-links">
        <Link
          to="/dashboard"
          className={`nav-link ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/products"
          className={`nav-link ${
            location.pathname === "/products" ? "active" : ""
          }`}
        >
          Products
        </Link>
        <Link
          to="/orders"
          className={`nav-link ${
            location.pathname === "/orders" ? "active" : ""
          }`}
        >
          Orders
        </Link>
      </div>
      <div className="nav-actions">
        <Link
          to="/profile"
          className={`btn btn-outline ${
            location.pathname === "/profile" ? "active" : ""
          }`}
        >
          Perfil
        </Link>
        <button className="btn btn-danger btn-sm" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

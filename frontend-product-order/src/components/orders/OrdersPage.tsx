import { Link } from "react-router-dom";
import { useUser } from "../Security/useUser";

export function OrdersPage() {
  const { hasProfile, isLoading, currentUserInfo, error, retryLoadUserData } =
    useUser();

  if (isLoading) {
    return (
      <div className="container">
        <h2 className="auth-title">Orders</h2>
        <div className="card">
          <div className="card-body">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Verificando perfil de usuario...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje de error con opción de retry
  if (error) {
    return (
      <div className="container">
        <h2 className="auth-title">Orders</h2>
        <div className="card">
          <div className="card-body">
            <div className="error-container">
              <h3>Error de Conexión</h3>
              <p className="error-message">{error}</p>
              <div className="mt-3">
                <button onClick={retryLoadUserData} className="btn btn-primary">
                  Intentar de Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario no tiene perfil, mostrar mensaje para crear perfil
  if (!hasProfile) {
    return (
      <div className="container">
        <h2 className="auth-title">Orders</h2>
        <div className="card">
          <div className="card-body">
            <div className="profile-required">
              <h3>Perfil de Usuario Requerido</h3>
              <p>
                Para acceder a sus órdenes, necesita completar su perfil de
                usuario primero.
              </p>
              <p>
                <strong>Email:</strong> {currentUserInfo?.subject}
              </p>
              <div className="mt-3">
                <Link to="/profile" className="btn btn-primary">
                  Actualizar Perfil de Usuario
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario tiene perfil, mostrar la página de órdenes normal
  return (
    <div className="container">
      <h2 className="auth-title">Orders</h2>
      <div className="card">
        <div className="card-body">
          <p>Orders page under development...</p>
          <p>User orders will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}

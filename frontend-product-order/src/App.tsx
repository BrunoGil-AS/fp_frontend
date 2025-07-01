import { useEffect, useState } from "react";
import {
  login,
  handleCallback,
  authenticatedFetch,
} from "./components/Security/auth";
import { useAuth } from "./components/Security/useAuth";
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
  const [apiResponse, setApiResponse] = useState<string>("");

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
          setApiResponse(`Error en callback: ${error.message}`);
        });
    }
  }, [updateAuthState]);

  const handleRefreshToken = async () => {
    try {
      setApiResponse("Refrescando token...");
      const success = await refreshTokenFunction();
      if (success) {
        setApiResponse("✅ Token refrescado exitosamente!");
      } else {
        setApiResponse(
          "❌ Error al refrescar el token. Es posible que necesites hacer login nuevamente."
        );
      }
    } catch (error) {
      console.error("Error in handleRefreshToken:", error);
      setApiResponse(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const testAuthenticatedRequest = async () => {
    try {
      // Ejemplo de request autenticado (puedes cambiar la URL por tu API)
      const response = await authenticatedFetch(
        "http://localhost:8080/gateway/test",
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const data = await response.text();
        setApiResponse(`API Response: ${data}`);
      } else {
        setApiResponse(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiResponse(`Request Error: ${error}`);
    }
  };

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
    <div className="app-container">
      <main className="main-content">
        <div className="container">
          <h2 className="auth-title">¡Autenticado!</h2>

          <div className="token-section">
            <h3>Access Token:</h3>
            <code className="token-display">{accessToken}</code>
          </div>

          {refreshToken && (
            <div className="token-section">
              <h3>Refresh Token:</h3>
              <code className="token-display">{refreshToken}</code>
            </div>
          )}

          <div className="button-group">
            <button className="btn btn-secondary" onClick={handleRefreshToken}>
              Refrescar Token
            </button>
            <button
              className="btn btn-primary"
              onClick={testAuthenticatedRequest}
            >
              Probar Request Autenticado
            </button>
            <button className="btn btn-danger" onClick={logout}>
              Cerrar sesión
            </button>
          </div>

          {apiResponse && (
            <div className="api-response">
              <h3>Respuesta:</h3>
              <pre>{apiResponse}</pre>
            </div>
          )}

          {/* Aquí irá la UI de productos y órdenes */}
        </div>
      </main>
    </div>
  );
}

export default App;

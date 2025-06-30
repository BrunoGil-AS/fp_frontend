import { useEffect, useState } from "react";
import { login, handleCallback, authenticatedFetch } from "./auth";
import { useAuth } from "./useAuth";
import "./App.css";

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

  if (isLoading) return <p>Cargando...</p>;

  if (!isAuthenticated) {
    return (
      <div className="container">
        <h2>Iniciar sesión</h2>
        <button onClick={login}>Login con OAuth2</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>¡Autenticado!</h2>

      <div className="token-section">
        <p>
          <strong>Access Token:</strong>
        </p>
        <code className="token-display">{accessToken}</code>
      </div>

      {refreshToken && (
        <div className="token-section">
          <p>
            <strong>Refresh Token:</strong>
          </p>
          <code className="token-display">{refreshToken}</code>
        </div>
      )}

      <div className="button-group">
        <button onClick={handleRefreshToken}>Refrescar Token</button>
        <button onClick={testAuthenticatedRequest}>
          Probar Request Autenticado
        </button>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      {apiResponse && (
        <div className="api-response">
          <p>
            <strong>Respuesta:</strong>
          </p>
          <pre>{apiResponse}</pre>
        </div>
      )}

      {/* Aquí irá la UI de productos y órdenes */}
    </div>
  );
}

export default App;

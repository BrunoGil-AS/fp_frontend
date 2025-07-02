import { useState } from "react";
import { authenticatedFetch } from "./Security/auth";

interface DashboardProps {
  accessToken: string | null;
  refreshToken: string | null;
  onRefreshToken: () => Promise<boolean>;
}

export function Dashboard({
  accessToken,
  refreshToken,
  onRefreshToken,
}: DashboardProps) {
  const [apiResponse, setApiResponse] = useState<string>("");

  const handleRefreshToken = async () => {
    try {
      setApiResponse("Refrescando token...");
      const success = await onRefreshToken();
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
      setApiResponse("Probando conexión...");
      const response = await authenticatedFetch(
        "http://localhost:8080/gateway/test",
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const data = await response.text();
        setApiResponse(`✅ API Response: ${data}`);
      } else {
        setApiResponse(
          `❌ API Error: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      setApiResponse(`❌ Request Error: ${error}`);
    }
  };

  return (
    <div className="container">
      <h2 className="auth-title">Dashboard</h2>

      <div className="card">
        <div className="card-header">
          <h3>Estado de Autenticación</h3>
        </div>
        <div className="card-body">
          <div className="token-section">
            <h4>Access Token:</h4>
            <code className="token-display">
              {accessToken
                ? accessToken.substring(0, 50) + "..."
                : "No disponible"}
            </code>
          </div>

          {refreshToken && (
            <div className="token-section">
              <h4>Refresh Token:</h4>
              <code className="token-display">
                {refreshToken.substring(0, 50) + "..."}
              </code>
            </div>
          )}

          <div className="button-group">
            <button className="btn btn-secondary" onClick={handleRefreshToken}>
              🔄 Refrescar Token
            </button>
            <button
              className="btn btn-primary"
              onClick={testAuthenticatedRequest}
            >
              🧪 Probar Conexión API
            </button>
          </div>

          {apiResponse && (
            <div className="api-response">
              <h4>Respuesta:</h4>
              <pre>{apiResponse}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

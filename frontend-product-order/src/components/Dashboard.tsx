import { useState } from "react";
import { authenticatedFetch, redirectToReauth } from "./Security/auth";
import { useOrders } from "./Security/useOrders";
import { Link } from "react-router-dom";
import { OrderTestComponent } from "./orders/OrderTestComponent";

interface DashboardProps {
  accessToken: string | null;
}

export function Dashboard({ accessToken }: DashboardProps) {
  const [apiResponse, setApiResponse] = useState<string>("");
  const { draftOrder } = useOrders();

  const handleReauth = async () => {
    try {
      setApiResponse("Redirigiendo para reauthenticación...");
      await redirectToReauth();
      setApiResponse("✅ Redirigiendo para obtener nuevo token...");
    } catch (error) {
      console.error("Error in handleReauth:", error);
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

          <div className="button-group">
            <button className="btn btn-secondary" onClick={handleReauth}>
              🔄 Renovar Token
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

      <div className="card">
        <div className="card-header">
          <h3>Estado de Órdenes</h3>
        </div>
        <div className="card-body">
          {draftOrder ? (
            <div className="draft-order-summary">
              <h4>🛒 Orden en Progreso</h4>
              <div className="order-details">
                <p>
                  <strong>Productos:</strong> {draftOrder.items.length}
                </p>
                <p>
                  <strong>Total:</strong> $
                  {draftOrder.total?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="button-group">
                <Link to="/orders" className="btn btn-primary">
                  Ver Detalles de la Orden
                </Link>
                <Link to="/products" className="btn btn-secondary">
                  Agregar Más Productos
                </Link>
              </div>
            </div>
          ) : (
            <div className="no-draft-order">
              <p>No hay órdenes en progreso.</p>
              <div className="button-group">
                <Link to="/products" className="btn btn-primary">
                  Explorar Productos
                </Link>
                <Link to="/orders" className="btn btn-secondary">
                  Ver Mis Órdenes
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Componente de prueba temporal */}
      <OrderTestComponent />
    </div>
  );
}

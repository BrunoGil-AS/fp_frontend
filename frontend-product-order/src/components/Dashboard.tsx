import { useState } from "react";
import { authenticatedFetch, redirectToReauth } from "./Security/auth";

interface DashboardProps {
  accessToken: string | null;
}

export function Dashboard({ accessToken }: DashboardProps) {
  const [apiResponse, setApiResponse] = useState<string>("");

  const handleReauth = async () => {
    try {
      setApiResponse("Redirecting for re-authentication...");
      await redirectToReauth();
      setApiResponse("✅ Redirecting to obtain new token...");
    } catch (error) {
      setApiResponse(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const testAuthenticatedRequest = async () => {
    try {
      setApiResponse("Testing connection...");
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
          <h3>Authentication Status</h3>
        </div>
        <div className="card-body">
          <div className="token-section">
            <h4>Access Token:</h4>
            <code className="token-display">
              {accessToken
                ? accessToken.substring(0, 50) + "..."
                : "Not available"}
            </code>
          </div>

          <div className="button-group">
            <button className="btn btn-secondary" onClick={handleReauth}>
              🔄 Renew Token
            </button>
            <button
              className="btn btn-primary"
              onClick={testAuthenticatedRequest}
            >
              🧪 Test API Connection
            </button>
          </div>

          {apiResponse && (
            <div className="api-response">
              <h4>Response:</h4>
              <pre>{apiResponse}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

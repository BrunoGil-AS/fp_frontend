import { useEffect, useState } from "react";
import { login, handleCallback, getAccessToken, logout } from "./auth";
import "./App.css";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si estamos en /callback, intercambiar el código por el token
    if (window.location.pathname === "/callback") {
      handleCallback()
        .then((accessToken) => {
          setToken(accessToken);
          window.history.replaceState({}, "", "/"); // Limpiar la URL
        })
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    } else {
      setToken(getAccessToken());
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Cargando...</p>;

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>Iniciar sesión</h2>
        <button onClick={login}>Login con OAuth2</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>¡Autenticado!</h2>
      <p>
        <b>Access Token:</b>
        <br />
        <code style={{ wordBreak: "break-all" }}>{token}</code>
      </p>
      <button onClick={logout}>Cerrar sesión</button>
      {/* Aquí irá la UI de productos y órdenes */}
    </div>
  );
}

export default App;

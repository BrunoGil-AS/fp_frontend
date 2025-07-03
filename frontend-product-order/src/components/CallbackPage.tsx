// CallbackPage.tsx: Componente para manejar el callback de OAuth2
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "./Security/auth";

interface CallbackPageProps {
  onAuthUpdate: () => void;
}

export function CallbackPage({ onAuthUpdate }: CallbackPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("Procesando callback OAuth2...");
        const newAccessToken = await handleCallback();

        if (newAccessToken) {
          console.log("Token obtenido exitosamente, actualizando estado...");
          onAuthUpdate(); // Actualizar el estado después del login
          navigate("/", { replace: true }); // Redirigir al dashboard
        } else {
          console.error("No se pudo obtener el token");
          navigate("/", { replace: true }); // Redirigir de vuelta al login
        }
      } catch (error) {
        console.error("Error procesando callback:", error);
        navigate("/", { replace: true }); // Redirigir de vuelta al login
      }
    };

    processCallback();
  }, [navigate, onAuthUpdate]);

  return (
    <div className="loading-container">
      <div className="loading large"></div>
      <p className="loading-text">Procesando autenticación...</p>
      <p className="callback-info">
        Por favor espere mientras completamos el proceso de login.
      </p>
    </div>
  );
}

// config.ts: Centraliza las URLs y configuraciones de endpoints
// Modifica aquí para cambiar direcciones de servicios en toda la app

// Configuración para desarrollo con proxy
const isDevelopment = import.meta.env.DEV;

// Si estamos en desarrollo, usar el proxy de Vite
export const GATEWAY = isDevelopment ? "/api" : "http://localhost:8080";
export const AUTH_BASE_URL = "http://localhost:8081";
export const PRODUCT_SERVICE = `${GATEWAY}/product-service`;
export const ORDER_SERVICE = `${GATEWAY}/order-service`;
export const USER_SERVICE = `${GATEWAY}/user-service`;

// Agrega aquí más endpoints según sea necesario, siguiendo el patrón:
// export const OTRO_SERVICE = `${GATEWAY}/otro-service`;

export const CLIENT_CONFIG = {
  CLIENT_ID: "fp_frontend",
  REDIRECT_URI: "http://localhost:3000/callback",
  SCOPE: "openid profile api.read api.write",
};

// config.ts: Centraliza las URLs y configuraciones de endpoints
// Modifica aquí para cambiar direcciones de servicios en toda la app

// Alternativa recomendada: exportar constantes para URLs
export const GATEWAY = "http://localhost:8080";
export const AUTH_BASE_URL = "http://localhost:8081";
export const PRODUCT_SERVICE = `${GATEWAY}/product-service`;
// Agrega aquí más endpoints según sea necesario, siguiendo el patrón:
// export const OTRO_SERVICE = `${GATEWAY}/otro-service`;

export const CLIENT_CONFIG = {
  CLIENT_ID: "fp_frontend",
  REDIRECT_URI: "http://localhost:3000/callback",
  SCOPE: "openid profile api.read api.write",
};

// auth.ts: funciones para el flujo OAuth2 con PKCE
import { generateCodeVerifier, generateCodeChallenge } from "../../pkce";

const AUTH_BASE_URL = "http://localhost:8081";
const CLIENT_ID = "fp_frontend";
const REDIRECT_URI = "http://localhost:3000/callback";
const SCOPE = "openid profile api.read api.write";

// Función para decodificar JWT sin verificar la firma (solo para leer claims)
function decodeJWT(
  token: string
): { exp?: number; [key: string]: unknown } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

// Función para verificar si un token está próximo a expirar (dentro de 2 minutos)
export function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const twoMinutesInMs = 2 * 60 * 1000;

  return expirationTime - currentTime <= twoMinutesInMs;
}

// Función para verificar si un token ha expirado
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

export async function login() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  window.location.href = `${AUTH_BASE_URL}/oauth2/authorize?${params.toString()}`;
}

export async function handleCallback(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search); //URLSearchParams get query parameters from the URL
  const code = params.get("code");
  if (!code) return null;
  const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
  console.log("PKCE code_verifier:", codeVerifier);
  if (!codeVerifier) throw new Error("No PKCE code_verifier found");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });
  console.log("Token exchange request:", {
    url: `${AUTH_BASE_URL}/oauth2/token`,
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const resp = await fetch(`${AUTH_BASE_URL}/oauth2/token`, {
    //mode: "no-cors",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  console.log("Response status:", resp);
  if (!resp.ok) throw new Error("Token exchange failed");
  const data = await resp.json();
  console.log("Token exchange response:", data);
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("id_token", data.id_token);
  // Guardar refresh token si está presente
  if (data.refresh_token) {
    console.log("Storing refresh token:", data.refresh_token);
    sessionStorage.setItem("refresh_token", data.refresh_token);
  }
  return data.access_token;
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem("refresh_token");
}

// Función para refrescar el access token usando el refresh token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log("No refresh token available");
    return null;
  }

  // Verificar si el refresh token ha expirado
  if (isTokenExpired(refreshToken)) {
    console.log("Refresh token has expired, user needs to login again");
    logout();
    return null;
  }

  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    });

    console.log("Refreshing token request:", {
      url: `${AUTH_BASE_URL}/oauth2/token`,
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const resp = await fetch(`${AUTH_BASE_URL}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(
        "Token refresh failed:",
        resp.status,
        resp.statusText,
        errorText
      );

      // Si el refresh token es inválido (400/401), limpiar tokens y forzar re-login
      if (resp.status === 400 || resp.status === 401) {
        console.log("Invalid refresh token, clearing session");
        logout();
      }
      return null;
    }

    const data = await resp.json();
    console.log("Token refresh response:", data);

    // Actualizar tokens en sessionStorage
    sessionStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      sessionStorage.setItem("refresh_token", data.refresh_token);
    }
    if (data.id_token) {
      sessionStorage.setItem("id_token", data.id_token);
    }

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // En caso de error de red, no limpiar tokens automáticamente
    // El usuario puede intentar más tarde
    return null;
  }
}

// Función para hacer requests autenticados con refresh automático
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Agregar Authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Si la respuesta es 401 (Unauthorized), intentar refrescar el token
  if (response.status === 401) {
    console.log("Access token expired, attempting to refresh...");

    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      // Reintentar la request con el nuevo token
      const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } else {
      // Si no se pudo refrescar, redirigir al login
      throw new Error("Unable to refresh token, please login again");
    }
  }

  return response;
}

export function logout() {
  sessionStorage.clear();
  window.location.href = "/";
}

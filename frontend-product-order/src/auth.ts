// auth.ts: funciones para el flujo OAuth2 con PKCE
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";

const AUTH_BASE_URL = "http://localhost:8081";
const CLIENT_ID = "fp_frontend";
const REDIRECT_URI = "http://localhost:3000/callback";
const SCOPE = "openid profile api.read";

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
  const params = new URLSearchParams(window.location.search);
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
  return data.access_token;
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem("access_token");
}

export function logout() {
  sessionStorage.clear();
  window.location.href = "/";
}

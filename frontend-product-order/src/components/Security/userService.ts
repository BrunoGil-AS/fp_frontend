// userService.ts: Servicio para manejar operaciones de usuario
import { authenticatedFetch } from "./auth";
import { USER_SERVICE } from "../../config";

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
}

export interface AppResponse<T> {
  message: string;
  data: T;
}

export interface CurrentUserInfo {
  subject: string;
  email: string;
  name: string;
  authorities: Array<{ authority: string }>;
  isAuthenticated: boolean;
}

// Función para obtener información del usuario actual del JWT
export async function getCurrentUserInfo(): Promise<CurrentUserInfo> {
  try {
    const response = await authenticatedFetch(
      `${USER_SERVICE}/users/me/current`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    //console.log("Response:", response);
    const result: AppResponse<CurrentUserInfo> = await response.json();
    //console.log("Current user info:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error getting current user info:", error);
    // Si es un error de CORS o de red, intentar continuar con datos del token local
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.warn(
        "CORS error detected, trying to extract info from local token"
      );
      return extractUserInfoFromToken();
    }
    throw error;
  }
}

// Función auxiliar para extraer información del token local cuando hay problemas de CORS
function extractUserInfoFromToken(): CurrentUserInfo {
  const token = sessionStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token available");
  }

  try {
    // Decodificar el JWT para extraer la información
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    return {
      subject: payload.sub || payload.username || "",
      email: payload.email || payload.sub || "",
      name: payload.name || payload.given_name || "",
      authorities: payload.scope?.split(" ").map((scope: string) => ({
        authority: `ROLE_${scope.toUpperCase()}`,
      })) || [{ authority: "ROLE_USER" }],
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Error extracting user info from token:", error);
    throw new Error("Unable to extract user information from token");
  }
}

// Función para verificar si el perfil de usuario existe
export async function checkUserProfile(email: string): Promise<User | null> {
  try {
    const response = await authenticatedFetch(
      `${USER_SERVICE}/users/me?email=${encodeURIComponent(email)}`
    );

    if (response.status === 404) {
      return null; // Usuario no encontrado
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: AppResponse<User> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error checking user profile:", error);
    // Si es un error de CORS o de red, asumir que el usuario no tiene perfil
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.warn(
        "CORS error detected while checking user profile, assuming no profile exists"
      );
      return null;
    }
    throw error;
  }
}

// Función para crear un perfil de usuario
export async function createUserProfile(
  userData: Omit<User, "id">
): Promise<User> {
  try {
    const response = await authenticatedFetch(
      `${USER_SERVICE}/users/me/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(
        errorResult.message ||
          `Error ${response.status}: ${response.statusText}`
      );
    }

    const result: AppResponse<User> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating user profile:", error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Error de conexión con el servidor. Por favor, verifica que el backend esté funcionando y la configuración de CORS sea correcta."
      );
    }
    throw error;
  }
}

// Función para actualizar un perfil de usuario
export async function updateUserProfile(userData: User): Promise<User> {
  try {
    console.log("Updating user profile with data:", JSON.stringify(userData));
    const response = await authenticatedFetch(
      `${USER_SERVICE}/users/me/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(
        errorResult.message ||
          `Error ${response.status}: ${response.statusText}`
      );
    }

    const result: AppResponse<User> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Error de conexión con el servidor. Por favor, verifica que el backend esté funcionando y la configuración de CORS sea correcta."
      );
    }
    throw error;
  }
}

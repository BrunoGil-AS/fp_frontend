import { useState, useEffect, useCallback } from "react";
import {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  isTokenExpiringSoon,
  logout as authLogout,
} from "./auth";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Función para actualizar el estado de autenticación
  const updateAuthState = useCallback(() => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    setAuthState({
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
      isLoading: false,
    });
  }, []);

  // Función para refrescar el token
  const refreshTokenFunction = useCallback(async (): Promise<boolean> => {
    try {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        updateAuthState();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  }, [updateAuthState]);

  // Función para logout
  const logout = useCallback(() => {
    authLogout();
    setAuthState({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Auto-refresh del token antes de que expire
  useEffect(() => {
    if (authState.accessToken && authState.refreshToken) {
      // Verificar cada minuto si el token está próximo a expirar
      const interval = setInterval(async () => {
        if (isTokenExpiringSoon(authState.accessToken)) {
          console.log("Access token expiring soon, refreshing...");
          const success = await refreshTokenFunction();
          if (!success) {
            console.log("Auto-refresh failed, user will need to login again");
          }
        }
      }, 60 * 1000); // Verificar cada minuto

      return () => clearInterval(interval);
    }
  }, [authState.accessToken, authState.refreshToken, refreshTokenFunction]);

  // Inicializar el estado de autenticación
  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  return {
    ...authState,
    refreshTokenFunction,
    logout,
    updateAuthState,
  };
}

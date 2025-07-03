// useUser.ts: Hook personalizado para manejar el estado del usuario
import { useState, useEffect } from "react";
import type { User, CurrentUserInfo } from "./userService";
import { getCurrentUserInfo, checkUserProfile } from "./userService";

export interface UserState {
  currentUserInfo: CurrentUserInfo | null;
  userProfile: User | null;
  hasProfile: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useUser() {
  const [userState, setUserState] = useState<UserState>({
    currentUserInfo: null,
    userProfile: null,
    hasProfile: false,
    isLoading: true,
    error: null,
  });

  const loadUserData = async () => {
    try {
      setUserState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Primero obtener información del JWT
      const currentUserInfo = await getCurrentUserInfo();
      console.log("Current user info:", currentUserInfo);

      // Luego verificar si existe el perfil en el user service
      const userProfile = await checkUserProfile(currentUserInfo.subject);

      setUserState({
        currentUserInfo,
        userProfile,
        hasProfile: userProfile !== null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading user data:", error);

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
          errorMessage =
            "Error de conexión con el servidor. Verifica que el backend esté funcionando.";
        } else {
          errorMessage = error.message;
        }
      }

      setUserState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const refreshUserProfile = async () => {
    if (!userState.currentUserInfo) return;

    try {
      const userProfile = await checkUserProfile(
        userState.currentUserInfo.email
      );
      setUserState((prev) => ({
        ...prev,
        userProfile,
        hasProfile: userProfile !== null,
        error: null, // Limpiar errores en refresh exitoso
      }));
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      setUserState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Error al actualizar perfil",
      }));
    }
  };

  const clearError = () => {
    setUserState((prev) => ({ ...prev, error: null }));
  };

  const retryLoadUserData = async () => {
    clearError();
    await loadUserData();
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
    ...userState,
    refreshUserProfile,
    reloadUserData: loadUserData,
    clearError,
    retryLoadUserData,
  };
}

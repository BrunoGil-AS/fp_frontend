// UserPage.tsx: Página principal para gestión de usuario
import { useUser } from "../Security/useUser";
import { UserProfile } from "./UserProfile";

export function UserPage() {
  const {
    currentUserInfo,
    userProfile,
    hasProfile,
    isLoading,
    error,
    refreshUserProfile,
  } = useUser();

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <h3>Error al cargar información del usuario</h3>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!currentUserInfo) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <h3>Error de autenticación</h3>
          <p>No se pudo obtener la información del usuario autenticado.</p>
        </div>
      </div>
    );
  }
  console.log("Current user info:", currentUserInfo);
  console.log("User profile:", userProfile);

  return (
    <UserProfile
      userProfile={userProfile}
      userEmail={currentUserInfo.subject} //subject contains the email
      userName={currentUserInfo.name}
      onProfileUpdated={refreshUserProfile}
      isCreating={!hasProfile}
    />
  );
}

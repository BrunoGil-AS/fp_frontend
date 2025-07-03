// UserProfile.tsx: Componente para mostrar y editar el perfil de usuario
import { useState, useEffect } from "react";
import type { User } from "../Security/userService";
import { createUserProfile, updateUserProfile } from "../Security/userService";
import "../../styles/components/userprofile.css";

interface UserProfileProps {
  userProfile: User | null;
  userEmail: string;
  userName?: string;
  onProfileUpdated: () => void;
  isCreating?: boolean;
}

export function UserProfile({
  userProfile,
  userEmail,
  userName,
  onProfileUpdated,
  isCreating = false,
}: UserProfileProps) {
  const [formData, setFormData] = useState<Omit<User, "id">>({
    firstName: "",
    lastName: "",
    email: userEmail,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      console.log("User profile loaded:", userProfile);
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
      });
    } else if (userName) {
      console.log("User name from JWT:", userName);
      // Si tenemos el nombre del JWT, intentar parsearlo
      const nameParts = userName.split(" ");
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: userEmail,
      });
    }
  }, [userProfile, userEmail, userName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isCreating || !userProfile) {
        await createUserProfile(formData);
        setSuccessMessage("Perfil creado exitosamente");
      } else {
        await updateUserProfile({ ...formData, id: userProfile.id });
        setSuccessMessage("Perfil actualizado exitosamente");
      }

      onProfileUpdated();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar el perfil"
      );
    } finally {
      setIsLoading(false);
    }
  };
  console.log("Form data:", formData);
  return (
    <div className="container">
      <div className="user-profile-container">
        <div className="user-profile-header">
          <h2 className="auth-title">
            {isCreating || !userProfile
              ? "Crear Perfil de Usuario"
              : "Actualizar Perfil"}
          </h2>
          {isCreating && (
            <p className="profile-info">
              Complete su perfil para acceder a todas las funcionalidades de la
              aplicación.
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-body">
            {error && (
              <div className="alert alert-error">
                <i className="icon-error"></i>
                {error}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                <i className="icon-success"></i>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="user-profile-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled
                  required
                />
                <small className="form-text">
                  El email no se puede modificar
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Ingrese su nombre"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Ingrese su apellido"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn ${
                    isCreating || !userProfile ? "btn-primary" : "btn-secondary"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      {isCreating || !userProfile
                        ? "Crear Perfil"
                        : "Actualizar Perfil"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

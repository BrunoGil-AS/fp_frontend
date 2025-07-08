import { Link } from "react-router-dom";
import { useUser } from "../Security/useUser";
import { useOrdersStore } from "../Security/useOrdersStore";
import { OrderCard } from "./OrderCard";
import "../../styles/components/orders.css";

export function OrdersPage() {
  const {
    hasProfile,
    isLoading: userLoading,
    currentUserInfo,
    error: userError,
    retryLoadUserData,
  } = useUser();
  const {
    orders,
    draftOrder,
    isLoading: ordersLoading,
    error: ordersError,
    createDraftOrder,
    updateProductQuantity,
    removeProductFromOrder,
    confirmDraftOrder,
    removeOrder,
    cancelDraftOrder,
    retryLoadOrders,
  } = useOrdersStore();

  // Mostrar loading si está cargando usuario o órdenes
  if (userLoading) {
    return (
      <div className="container">
        <h2 className="auth-title">Orders</h2>
        <div className="card">
          <div className="card-body">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Verificando perfil de usuario...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error del usuario, mostrar mensaje de error con opción de retry
  if (userError) {
    return (
      <div className="container">
        <h2 className="auth-title">Orders</h2>
        <div className="card">
          <div className="card-body">
            <div className="error-container">
              <h3>Error de Conexión</h3>
              <p className="error-message">{userError}</p>
              <div className="mt-3">
                <button onClick={retryLoadUserData} className="btn btn-primary">
                  Intentar de Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario no tiene perfil, mostrar mensaje para crear perfil
  if (!hasProfile) {
    return (
      <div className="container">
        <h2 className="auth-title">Orders</h2>
        <div className="card">
          <div className="card-body">
            <div className="profile-required">
              <h3>Perfil de Usuario Requerido</h3>
              <p>
                Para acceder a sus órdenes, necesita completar su perfil de
                usuario primero.
              </p>
              <p>
                <strong>Email:</strong> {currentUserInfo?.subject}
              </p>
              <div className="mt-3">
                <Link to="/profile" className="btn btn-primary">
                  Actualizar Perfil de Usuario
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateNewOrder = async () => {
    try {
      await createDraftOrder();
    } catch (error) {
      console.error("Error creating new order:", error);
    }
  };

  const handleUpdateQuantity = (
    orderId: number | "draft",
    productId: number,
    newQuantity: number
  ) => {
    updateProductQuantity(orderId, productId, newQuantity);
  };

  const handleRemoveProduct = (
    orderId: number | "draft",
    productId: number
  ) => {
    removeProductFromOrder(orderId, productId);
  };

  const handleConfirmDraftOrder = async () => {
    try {
      await confirmDraftOrder();
    } catch (error) {
      console.error("Error confirming draft order:", error);
      alert(
        "Error al crear la orden: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await removeOrder(orderId);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert(
        "Error al eliminar la orden: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  // Si el usuario tiene perfil, mostrar la página de órdenes
  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2 className="orders-title">Mis Órdenes</h2>
        <button
          className="btn btn-primary"
          onClick={handleCreateNewOrder}
          disabled={!!draftOrder}
        >
          {draftOrder ? "Ya hay una orden en progreso" : "Nueva Orden"}
        </button>
      </div>

      {ordersLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando órdenes...</p>
        </div>
      )}

      {ordersError && (
        <div className="error-container">
          <h3>Error al cargar órdenes</h3>
          <p className="error-message">{ordersError}</p>
          <button onClick={retryLoadOrders} className="btn btn-primary">
            Intentar de Nuevo
          </button>
        </div>
      )}

      {!ordersLoading && !ordersError && (
        <>
          {/* Orden borrador */}
          {draftOrder && (
            <div className="draft-order-section">
              <h3>Orden en progreso</h3>
              <OrderCard
                order={draftOrder}
                isDraft={true}
                onUpdateQuantity={(productId, newQuantity) =>
                  handleUpdateQuantity("draft", productId, newQuantity)
                }
                onRemoveProduct={(productId) =>
                  handleRemoveProduct("draft", productId)
                }
                onConfirmOrder={handleConfirmDraftOrder}
                onCancelDraft={cancelDraftOrder}
              />
            </div>
          )}

          {/* Órdenes existentes */}
          <div className="existing-orders-section">
            {orders.length === 0 && !draftOrder ? (
              <div className="empty-orders">
                <h3>No tienes órdenes aún</h3>
                <p>
                  Crea tu primera orden agregando productos desde el catálogo.
                </p>
                <Link to="/products" className="btn btn-primary">
                  Ver Catálogo de Productos
                </Link>
              </div>
            ) : (
              <>
                {orders.length > 0 && <h3>Órdenes anteriores</h3>}
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isDraft={false}
                    onUpdateQuantity={(productId, newQuantity) =>
                      handleUpdateQuantity(order.id!, productId, newQuantity)
                    }
                    onRemoveProduct={(productId) =>
                      handleRemoveProduct(order.id!, productId)
                    }
                    onDeleteOrder={() => handleDeleteOrder(order.id!)}
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

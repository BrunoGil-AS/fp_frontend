// OrderCard.tsx: Componente para mostrar una orden individual
import { useState } from "react";
import type { Order } from "../Security/orderService";

interface OrderCardProps {
  order: Order;
  isDraft?: boolean;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveProduct: (productId: number) => void;
  onConfirmOrder?: () => void;
  onDeleteOrder?: () => void;
  onCancelDraft?: () => void;
}

export function OrderCard({
  order,
  isDraft = false,
  onUpdateQuantity,
  onRemoveProduct,
  onConfirmOrder,
  onDeleteOrder,
  onCancelDraft,
}: OrderCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (!onConfirmOrder) return;

    setIsLoading(true);
    try {
      await onConfirmOrder();
    } catch (error) {
      console.error("Error confirming order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (
      !onDeleteOrder ||
      !confirm("¿Estás seguro de que deseas eliminar esta orden?")
    )
      return;

    setIsLoading(true);
    try {
      await onDeleteOrder();
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatus = () => {
    if (isDraft) return "Nueva";
    return "Creada";
  };

  const getOrderStatusClass = () => {
    if (isDraft) return "pending";
    return "delivered";
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-info">
          <div className="order-number">
            {isDraft ? "Nueva Orden" : `Orden #${order.id}`}
          </div>
          <div className="order-date">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </div>
        </div>
        <div className={`order-status ${getOrderStatusClass()}`}>
          {getOrderStatus()}
        </div>
      </div>

      <div className="order-body">
        {order.items.length === 0 ? (
          <div className="empty-order">
            <p>Esta orden está vacía</p>
            <small>Agrega productos desde el catálogo</small>
          </div>
        ) : (
          <div className="order-items">
            {order.items
              .map((item, index) => {
                // Validar que el item y el product existen
                if (!item || !item.product) {
                  console.warn("Invalid order item:", item);
                  return null;
                }

                return (
                  <div
                    key={`${item.product.id}-${index}`}
                    className="order-item"
                  >
                    {item.product.imageUrl ? (
                      <img
                        className="item-image"
                        src={item.product.imageUrl}
                        alt={item.product.name || "Producto"}
                      />
                    ) : (
                      <div className="item-image-placeholder">Sin imagen</div>
                    )}

                    <div className="item-details">
                      <div className="item-name">
                        {item.product.name || "Producto sin nombre"}
                      </div>
                      <div className="item-info">
                        <span className="item-price">
                          ${item.product.price.toFixed(2)}
                        </span>
                        <span className="item-subtotal">
                          Subtotal: $
                          {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="item-quantity">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        disabled={isLoading}
                      >
                        -
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        disabled={isLoading}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="btn btn-danger btn-sm remove-item-btn"
                      onClick={() => onRemoveProduct(item.product.id)}
                      disabled={isLoading}
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
              .filter(Boolean)}
          </div>
        )}

        {order.items.length > 0 && (
          <div className="order-summary">
            <div className="summary-row">
              <span>Productos ({order.items.length}):</span>
              <span>${order.total?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${order.total?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="order-actions">
        {isDraft ? (
          <>
            <button
              className="btn btn-outline"
              onClick={onCancelDraft}
              disabled={isLoading}
            >
              Cancelar
            </button>
            {order.items.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleConfirmOrder}
                disabled={isLoading}
              >
                {isLoading ? "Creando..." : "Crear Orden"}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="btn btn-danger"
              onClick={handleDeleteOrder}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedFetch } from "../Security/auth";
import { PRODUCT_SERVICE } from "../../config";
import { useOrdersStore } from "../Security/useOrdersStore";
import { OrderSelectionModal } from "../orders/OrderSelectionModal";
import type { Product } from "../Security/orderService";
import "../../styles/components/products.css";

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [showOrderModal, setShowOrderModal] = useState(false);

  const { orders, draftOrder, createDraftOrder, addProductToOrder } =
    useOrdersStore();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const productsUrl = `${PRODUCT_SERVICE}/products`;
        console.log("🚀 Solicitando productos desde:", productsUrl);

        const response = await authenticatedFetch(productsUrl);

        console.log("📡 Respuesta del servidor:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Products:", data.data);
        setProducts(data.data);

        // Inicializar cantidades con 1 para cada producto
        const initialQuantities = data.data.reduce(
          (acc: { [key: number]: number }, product: Product) => {
            acc[product.id] = 1;
            return acc;
          },
          {}
        );
        setQuantities(initialQuantities);
      } catch (err: unknown) {
        console.error("Error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al obtener productos");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };
  const handleAddToOrder = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    setSelectedProduct(product);
    setSelectedQuantity(quantity);

    // Si hay una orden borrador, agregar directamente
    if (draftOrder) {
      addProductToOrder("draft", product, quantity);
      // Mostrar un mensaje más descriptivo
      const existingItem = draftOrder.items.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        alert(
          `✅ ${product.name} actualizado en tu orden (${
            existingItem.quantity + quantity
          } unidades)`
        );
      } else {
        alert(
          `✅ ${product.name} agregado a tu orden en progreso (${quantity} ${
            quantity === 1 ? "unidad" : "unidades"
          })`
        );
      }
      return;
    }

    // Si no hay orden borrador, mostrar modal de selección
    setShowOrderModal(true);
  };

  const handleCreateNewOrder = async () => {
    if (!selectedProduct) return;

    try {
      await createDraftOrder();
      addProductToOrder("draft", selectedProduct, selectedQuantity);
      alert(`${selectedProduct.name} agregado a nueva orden`);
    } catch (error) {
      console.error("Error creating new order:", error);
      alert("Error al crear nueva orden");
    }
  };

  const handleSelectExistingOrder = (orderId: number) => {
    if (!selectedProduct) return;

    addProductToOrder(orderId, selectedProduct, selectedQuantity);
    alert(`${selectedProduct.name} agregado a la orden #${orderId}`);
  };

  if (loading) return <div className="loading-text">Loading Products...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  console.log("Productos cargados:", products);
  if (!products.length) return <div>Not available products.</div>;

  return (
    <>
      {/* Indicador de orden en progreso */}
      {draftOrder && (
        <div className="draft-order-indicator">
          <div className="draft-order-content">
            <div className="draft-order-info">
              <span className="draft-order-icon">🛒</span>
              <div className="draft-order-text">
                <strong>Orden en progreso:</strong> {draftOrder.items.length}{" "}
                {draftOrder.items.length === 1 ? "producto" : "productos"} -
                Total: ${draftOrder.total?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="draft-order-actions">
              <Link to="/orders" className="btn btn-primary btn-sm">
                Ver Orden
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="products-container">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            {product.imageUrl ? (
              <img
                className="product-image"
                src={product.imageUrl}
                alt={product.name}
              />
            ) : (
              <div className="product-image-placeholder">Sin imagen</div>
            )}
            <div className="product-info">
              <div className="product-title">{product.name}</div>
              <div className="product-description">{product.description}</div>
              <div className="product-price">${product.price.toFixed(2)}</div>

              <div className="product-actions">
                <div className="quantity-selector">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(product.id, -1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [product.id]: Math.max(
                          1,
                          parseInt(e.target.value) || 1
                        ),
                      }))
                    }
                    min="1"
                    title={`Cantidad para ${product.name}`}
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(product.id, 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="btn btn-primary add-to-order-btn"
                  onClick={() => handleAddToOrder(product)}
                  title={
                    draftOrder
                      ? `Agregar ${product.name} a tu orden en progreso`
                      : `Agregar ${product.name} a una nueva orden`
                  }
                >
                  {draftOrder ? (
                    <>🛒 Agregar a Mi Orden</>
                  ) : (
                    <>➕ Agregar a Orden</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <OrderSelectionModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        product={selectedProduct!}
        quantity={selectedQuantity}
        orders={orders}
        onCreateNewOrder={handleCreateNewOrder}
        onSelectExistingOrder={handleSelectExistingOrder}
      />
    </>
  );
}

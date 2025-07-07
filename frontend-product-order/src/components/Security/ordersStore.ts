// ordersStore.ts: Store global simple para las órdenes
import type { Order, OrderItem, Product } from "./orderService";
import {
  getUserOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  calculateOrderTotal,
} from "./orderService";
import { getCurrentUserInfo } from "./userService";

// Estado global de las órdenes
interface OrdersState {
  orders: Order[];
  draftOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

// Clave para localStorage
const DRAFT_ORDER_STORAGE_KEY = "draftOrder";

class OrdersStore {
  private state: OrdersState = {
    orders: [],
    draftOrder: null,
    isLoading: false, // Cambiar a false inicialmente
    error: null,
  };

  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    // No inicializar automáticamente
    console.log("📦 OrdersStore created but not initialized yet");
  }

  // Inicializar el store de forma manual
  async initialize() {
    if (this.initialized) {
      console.log("📦 OrdersStore already initialized, skipping");
      return;
    }

    console.log("🚀 Initializing OrdersStore...");
    this.initialized = true;

    // Cargar orden borrador sin validación async
    this.loadDraftOrderFromStorage();

    // Validar la orden borrador y cargar órdenes
    await this.validateDraftOrder();
    await this.loadOrders();
  }

  // Verificar si está inicializado
  isInitialized(): boolean {
    return this.initialized;
  }

  // Reset del store (útil para logout)
  reset() {
    console.log("🔄 Resetting orders store...");
    this.initialized = false;
    this.state = {
      orders: [],
      draftOrder: null,
      isLoading: false,
      error: null,
    };
    this.notify();
  }

  // Suscribirse a cambios en el estado
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Obtener estado actual
  getState(): OrdersState {
    return { ...this.state };
  }

  // Notificar a los suscriptores
  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Actualizar estado
  private setState(newState: Partial<OrdersState>) {
    this.state = { ...this.state, ...newState };
    console.log("🔄 Orders store state updated:", this.state);
    this.notify();
  }

  // Cargar orden borrador desde localStorage (sin validación async)
  private loadDraftOrderFromStorage() {
    try {
      const stored = localStorage.getItem(DRAFT_ORDER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Recalcular el total por si acaso
        if (parsed.items) {
          parsed.total = calculateOrderTotal(parsed.items);
        }

        console.log(
          "📦 Draft order loaded from localStorage (pending validation):",
          parsed
        );
        this.setState({ draftOrder: parsed });
      }
    } catch (error) {
      console.error("Error loading draft order from localStorage:", error);
      localStorage.removeItem(DRAFT_ORDER_STORAGE_KEY);
    }
  }

  // Validar orden borrador asíncronamente
  async validateDraftOrder() {
    if (!this.state.draftOrder) return;

    try {
      const userInfo = await getCurrentUserInfo();
      if (this.state.draftOrder.user?.email !== userInfo.subject) {
        console.log("❌ Draft order belongs to different user, clearing...");
        localStorage.removeItem(DRAFT_ORDER_STORAGE_KEY);
        this.setState({ draftOrder: null });
      } else {
        console.log("✅ Draft order validated for current user");
      }
    } catch (userError) {
      console.error("Error validating user for draft order:", userError);
      localStorage.removeItem(DRAFT_ORDER_STORAGE_KEY);
      this.setState({ draftOrder: null });
    }
  }

  // Guardar orden borrador en localStorage
  private saveDraftOrderToStorage(draftOrder: Order | null) {
    try {
      if (draftOrder) {
        const serialized = JSON.stringify(draftOrder);
        localStorage.setItem(DRAFT_ORDER_STORAGE_KEY, serialized);
        console.log("💾 Draft order saved to localStorage:", {
          user: draftOrder.user?.email,
          itemsCount: draftOrder.items.length,
          total: draftOrder.total,
        });
      } else {
        localStorage.removeItem(DRAFT_ORDER_STORAGE_KEY);
        console.log("🗑️ Draft order removed from localStorage");
      }
    } catch (error) {
      console.error("❌ Error saving draft order to localStorage:", error);
    }
  }

  // Cargar órdenes del usuario
  async loadOrders() {
    try {
      this.setState({ isLoading: true, error: null });
      const orders = await getUserOrders();
      this.setState({ orders, isLoading: false });
    } catch (error) {
      console.error("Error loading orders:", error);
      let errorMessage = "Error al cargar las órdenes";
      if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
          errorMessage =
            "Error de conexión con el servidor. Verifica que el backend esté funcionando.";
        } else {
          errorMessage = error.message;
        }
      }
      this.setState({ isLoading: false, error: errorMessage });
    }
  }

  // Crear una nueva orden borrador
  async createDraftOrder() {
    try {
      const userInfo = await getCurrentUserInfo();
      const newDraftOrder: Order = {
        user: { email: userInfo.subject },
        items: [],
      };
      this.setState({ draftOrder: newDraftOrder });
      this.saveDraftOrderToStorage(newDraftOrder);
      return newDraftOrder;
    } catch (error) {
      console.error("Error creating draft order:", error);
      throw error;
    }
  }

  // Agregar producto a una orden
  addProductToOrder(
    orderId: number | "draft",
    product: Product,
    quantity: number = 1
  ) {
    console.log(`➕ Adding product to ${orderId}:`, {
      productId: product.id,
      productName: product.name,
      quantity,
    });

    const newItem: OrderItem = { product, quantity };

    if (orderId === "draft") {
      if (!this.state.draftOrder) {
        console.warn("⚠️ No draft order exists, cannot add product");
        return;
      }

      const existingItemIndex = this.state.draftOrder.items.findIndex(
        (item) => item.product.id === product.id
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = this.state.draftOrder.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log("📝 Updated existing product quantity");
      } else {
        updatedItems = [...this.state.draftOrder.items, newItem];
        console.log("✨ Added new product to draft order");
      }

      const updatedDraftOrder = {
        ...this.state.draftOrder,
        items: updatedItems,
        total: calculateOrderTotal(updatedItems),
      };

      this.setState({ draftOrder: updatedDraftOrder });
      this.saveDraftOrderToStorage(updatedDraftOrder);

      console.log("📊 Draft order updated:", {
        itemsCount: updatedDraftOrder.items.length,
        total: updatedDraftOrder.total,
      });
    } else {
      // Agregar a orden existente (por implementar si es necesario)
      console.log("Adding to existing order not implemented yet");
    }
  }

  // Confirmar orden borrador
  async confirmDraftOrder(): Promise<Order> {
    if (!this.state.draftOrder || this.state.draftOrder.items.length === 0) {
      throw new Error("La orden está vacía");
    }

    try {
      const createdOrder = await createOrder(this.state.draftOrder);

      // Actualizar estado local
      this.setState({
        orders: [createdOrder, ...this.state.orders],
        draftOrder: null,
      });

      this.saveDraftOrderToStorage(null);
      return createdOrder;
    } catch (error) {
      console.error("Error confirming draft order:", error);
      throw error;
    }
  }

  // Cancelar orden borrador
  cancelDraftOrder() {
    this.setState({ draftOrder: null });
    this.saveDraftOrderToStorage(null);
  }

  // Remover producto de una orden
  removeProductFromOrder(orderId: number | "draft", productId: number) {
    if (orderId === "draft" && this.state.draftOrder) {
      const updatedItems = this.state.draftOrder.items.filter(
        (item) => item.product.id !== productId
      );

      const updatedDraftOrder = {
        ...this.state.draftOrder,
        items: updatedItems,
        total: calculateOrderTotal(updatedItems),
      };

      this.setState({ draftOrder: updatedDraftOrder });
      this.saveDraftOrderToStorage(updatedDraftOrder);
    }
  }

  // Actualizar cantidad de un producto en una orden
  updateProductQuantity(
    orderId: number | "draft",
    productId: number,
    newQuantity: number
  ) {
    if (newQuantity <= 0) {
      this.removeProductFromOrder(orderId, productId);
      return;
    }

    if (orderId === "draft" && this.state.draftOrder) {
      const updatedItems = this.state.draftOrder.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );

      const updatedDraftOrder = {
        ...this.state.draftOrder,
        items: updatedItems,
        total: calculateOrderTotal(updatedItems),
      };

      this.setState({ draftOrder: updatedDraftOrder });
      this.saveDraftOrderToStorage(updatedDraftOrder);
    }
  }

  // Actualizar orden existente en el backend
  async updateExistingOrder(orderId: number): Promise<Order> {
    const orderToUpdate = this.state.orders.find(
      (order) => order.id === orderId
    );
    if (!orderToUpdate) {
      throw new Error("Orden no encontrada");
    }

    try {
      const updatedOrder = await updateOrder(orderToUpdate);

      // Actualizar estado local
      this.setState({
        orders: this.state.orders.map((order) =>
          order.id === orderId ? updatedOrder : order
        ),
      });

      return updatedOrder;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  // Eliminar orden
  async removeOrder(orderId: number): Promise<boolean> {
    try {
      const success = await deleteOrder(orderId);

      if (success) {
        // Actualizar estado local
        this.setState({
          orders: this.state.orders.filter((order) => order.id !== orderId),
        });
      }

      return success;
    } catch (error) {
      console.error("Error removing order:", error);
      throw error;
    }
  }

  // Limpiar errores
  clearError() {
    this.setState({ error: null });
  }
}

// Instancia única del store
export const ordersStore = new OrdersStore();

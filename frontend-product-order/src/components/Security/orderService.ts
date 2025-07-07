// orderService.ts: Servicio para manejar operaciones de órdenes
import { authenticatedFetch } from "./auth";
import { ORDER_SERVICE } from "../../config";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface OrderItem {
  id?: number;
  product: Product;
  quantity: number;
}

export interface Order {
  id?: number;
  user?: {
    email: string;
  };
  items: OrderItem[];
  createdAt?: string;
  total?: number;
}

export interface AppResponse<T> {
  message: string;
  data: T;
}

// Función para obtener las órdenes del usuario autenticado
export async function getUserOrders(): Promise<Order[]> {
  try {
    const response = await authenticatedFetch(`${ORDER_SERVICE}/orders/me`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: AppResponse<Order[]> = await response.json();
    console.log("User Orders:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
}

// Función para crear una nueva orden
export async function createOrder(order: Order): Promise<Order> {
  try {
    const response = await authenticatedFetch(`${ORDER_SERVICE}/orders/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    const result: AppResponse<Order> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

// Función para actualizar una orden existente
export async function updateOrder(order: Order): Promise<Order> {
  try {
    const response = await authenticatedFetch(`${ORDER_SERVICE}/orders/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    const result: AppResponse<Order> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

// Función para eliminar una orden
export async function deleteOrder(orderId: number): Promise<boolean> {
  try {
    const response = await authenticatedFetch(
      `${ORDER_SERVICE}/orders/me?id=${orderId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    const result: AppResponse<boolean> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

// Función auxiliar para calcular el total de una orden
export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
}

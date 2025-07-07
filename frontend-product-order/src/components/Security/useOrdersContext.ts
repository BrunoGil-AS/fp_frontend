// useOrdersContext.ts: Hook para usar el contexto de órdenes
import { useContext } from "react";
import { OrdersContext } from "./OrdersContext";
import type { OrdersContextType } from "./OrdersContext";

export function useOrdersContext(): OrdersContextType {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrdersContext must be used within an OrdersProvider");
  }
  return context;
}

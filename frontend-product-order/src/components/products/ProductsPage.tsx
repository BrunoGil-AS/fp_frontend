import { ProductsList } from "./ProductsList";

export function ProductsPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h2 className="auth-title">Product Catalog</h2>
        <p className="page-description">
          Browse our products and add them to your order using the{" "}
          <strong>➕ Add to Order</strong> button on each card.
        </p>
      </div>
      <ProductsList />
    </div>
  );
}

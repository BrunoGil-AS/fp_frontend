import { ProductsList } from "./ProductsList";

export function ProductsPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h2 className="auth-title">Catálogo de Productos</h2>
        <p className="page-description">
          Explora nuestros productos y agrégalos a tu orden usando el botón{" "}
          <strong>➕ Agregar a Orden</strong> en cada tarjeta.
        </p>
      </div>
      <ProductsList />
    </div>
  );
}

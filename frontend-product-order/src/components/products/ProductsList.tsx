import { useEffect, useState } from "react";
import { authenticatedFetch } from "../Security/auth";
import "../../styles/components/products.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        console.log(
          "🚀 Solicitando productos desde: http://localhost:8080/product-service/products"
        );

        const response = await authenticatedFetch(
          "http://localhost:8080/product-service/products"
        );

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

  if (loading) return <div className="loading-text">Cargando productos...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  console.log("Productos cargados:", products);
  if (!products.length) return <div>No hay productos disponibles.</div>;

  return (
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
            {/* Aquí puedes agregar botones para agregar al carrito, etc. */}
          </div>
        </div>
      ))}
    </div>
  );
}

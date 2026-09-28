"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CheckoutResponse {
  total?: number;
  error?: string;
}

export default function CheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Failed to load products");
        }
        const data = await res.json();
        setProducts(data);

        // Initialize quantities to 0 for all products
        const initialQuantities: Record<string, number> = {};
        for (const product of data) {
          initialQuantities[product.id] = 0;
        }
        setQuantities(initialQuantities);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    // Build items array with only products that have quantity > 0
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => ({
        productId,
        quantity: qty,
      }));

    if (items.length === 0) {
      setError("Please select at least one item with quantity > 0");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "guest",
          items,
        }),
      });

      const data = (await res.json()) as CheckoutResponse;

      if (!res.ok) {
        setResult(data);
        setError(data.error || "Checkout failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Checkout request failed";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Checkout</h1>
        <p>Loading products...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Checkout</h1>

      {error && <div className="error-message">{error}</div>}

      {result && result.total !== undefined && (
        <div className="success-message">
          ✓ Checkout successful! Total: ${result.total.toFixed(2)}
        </div>
      )}

      <div className="card">
        <h2>Products</h2>

        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-form">
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                <div className="quantity-controls">
                  <label htmlFor={`qty-${product.id}`}>Qty:</label>
                  <input
                    id={`qty-${product.id}`}
                    type="number"
                    min="0"
                    max="999"
                    value={quantities[product.id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(
                        product.id,
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Submit Order"}
            </button>
          </form>
        )}
      </div>

      {result && result.total !== undefined && (
        <div className="total-section">
          <h2>Order Total</h2>
          <div className="total-amount">${result.total.toFixed(2)}</div>
        </div>
      )}
    </main>
  );
}

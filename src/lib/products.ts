export interface Product {
  id: string;
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { id: "prod-001", name: "Enamel Mug", price: 12.5 },
  { id: "prod-002", name: "Canvas Tote", price: 18.0 },
  { id: "prod-003", name: "Wool Beanie", price: 22.75 },
];

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

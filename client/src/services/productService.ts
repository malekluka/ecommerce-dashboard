// src/services/productService.ts

const APP_LINK = import.meta.env.VITE_APP_URL || "http://localhost:5173";


export interface Product {
  productId?: string;
  _id?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  description?: string;
  price: number;
  cost: number; // <-- add this line
  stock: number;
  category: string;
  image: string;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${APP_LINK}/api/products`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

export const addProduct = async (product: Product) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${APP_LINK}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error('Failed to add product');
  }
  return response.json();
};
import React, { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { fetchProducts, addProduct } from "../services/productService";
import type { Product } from "../services/productService";
import { useNavigate } from "react-router-dom";

// Add API configuration
const APP_LINK = import.meta.env.VITE_APP_URL || "http://localhost:5173";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canFetch, setCanFetch] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({
    productId: "",
    name: "",
    price: undefined,
    cost: undefined,
    stock: undefined,
    category: "",
    image: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    stock: "",
    priceMin: "",
    priceMax: "",
    category: "",
  });
  const [sort, setSort] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "",
    direction: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableSectionElement>(null);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    fetch(`${APP_LINK}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setCanFetch(true);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // Fetch products function
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err instanceof Error ? err.message : "Failed to load products" 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canFetch) {
      fetchAllProducts();
    }
  }, [canFetch, fetchAllProducts]);

  // Auto-focus name input when editing
  useEffect(() => {
    if (editId && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editId]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock" || name === "cost") {
      setForm(prev => ({ ...prev, [name]: value === "" ? undefined : Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Authentication required" });
        return;
      }

      if (editId) {
        const response = await fetch(`${APP_LINK}/api/products/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update product");
        }

        setMessage({ type: "success", text: "Product updated successfully!" });
      } else {
        await addProduct(form as Product);
        setMessage({ type: "success", text: "Product added successfully!" });
      }

      // Reset form and refresh data
      setForm({
        productId: "",
        name: "",
        price: undefined,
        cost: undefined,
        stock: undefined,
        category: "",
        image: "",
      });
      setEditId(null);
      setShowForm(false);
      await fetchAllProducts();

      // Scroll to new/updated item
      setTimeout(() => {
        if (tableRef.current) {
          const lastRow = tableRef.current.querySelector("tr:last-child");
          if (lastRow) lastRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err instanceof Error ? err.message : "Failed to save product" 
      });
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      productId: product.productId || "",
      name: product.name,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      category: product.category,
      image: product.image || "",
    });
    setEditId(product._id || product.productId || null);
    setShowForm(true);
    setMessage(null);
  };

  const handleAddNew = () => {
    setForm({
      productId: "",
      name: "",
      price: undefined,
      cost: undefined,
      stock: undefined,
      category: "",
      image: "",
    });
    setEditId(null);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    setDeletingId(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Authentication required" });
        return;
      }

      const response = await fetch(`${APP_LINK}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setMessage({ type: "success", text: "Product deleted successfully!" });
      setDeletingId(null);
      await fetchAllProducts();
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err instanceof Error ? err.message : "Failed to delete product" 
      });
      setDeletingId(null);
    }
  };

  // Form validation
  const isFormValid = Boolean(
    form.name &&
    form.price !== undefined &&
    form.price > 0 &&
    form.cost !== undefined &&
    form.cost >= 0 &&
    form.stock !== undefined &&
    form.stock >= 0 &&
    form.category &&
    typeof form.name === "string" &&
    typeof form.category === "string"
  );

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    const stockOk =
      filter.stock === "" ||
      (filter.stock === "in" && product.stock > 0) ||
      (filter.stock === "out" && product.stock === 0);
    const priceMinOk =
      filter.priceMin === "" || product.price >= Number(filter.priceMin);
    const priceMaxOk =
      filter.priceMax === "" || product.price <= Number(filter.priceMax);
    const categoryOk =
      filter.category === "" ||
      product.category.toLowerCase().includes(filter.category.toLowerCase());
    return stockOk && priceMinOk && priceMaxOk && categoryOk;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sort.field) return 0;
    let aValue = a[sort.field as keyof Product];
    let bValue = b[sort.field as keyof Product];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
      if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
      return 0;
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const clearFilters = () => {
    setFilter({ stock: "", priceMin: "", priceMax: "", category: "" });
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      productId: "",
      name: "",
      price: undefined,
      cost: undefined,
      stock: undefined,
      category: "",
      image: "",
    });
    setEditId(null);
    setMessage(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <div className="min-h-screen bg-[#111422] font-sans p-6">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-white text-3xl font-bold">Products</h1>
                <button
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#07b151] to-[#0bda65] text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#07b151]/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65] active:scale-95"
                  onClick={handleAddNew}
                >
                  Add Product
                </button>
              </div>

              {/* Filters Section */}
              <div className="mb-8 p-6 bg-[#1a1e32] rounded-xl border border-[#343b65]">
                <h2 className="text-white text-lg font-semibold mb-4">Filters</h2>
                <form className="flex flex-wrap gap-4 items-end" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2" htmlFor="stock">
                      Stock Status
                    </label>
                    <select
                      id="stock"
                      name="stock"
                      value={filter.stock}
                      onChange={(e) => setFilter(f => ({ ...f, stock: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    >
                      <option value="">All Stock</option>
                      <option value="in">In Stock</option>
                      <option value="out">Out of Stock</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2" htmlFor="priceMin">
                      Min Price
                    </label>
                    <input
                      id="priceMin"
                      type="number"
                      name="priceMin"
                      placeholder="0.00"
                      value={filter.priceMin}
                      onChange={(e) => setFilter(f => ({ ...f, priceMin: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2" htmlFor="priceMax">
                      Max Price
                    </label>
                    <input
                      id="priceMax"
                      type="number"
                      name="priceMax"
                      placeholder="999.99"
                      value={filter.priceMax}
                      onChange={(e) => setFilter(f => ({ ...f, priceMax: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2" htmlFor="category">
                      Category
                    </label>
                    <input
                      id="category"
                      type="text"
                      name="category"
                      placeholder="Search category..."
                      value={filter.category}
                      onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="px-4 py-3 rounded-lg bg-[#343b65] text-white font-medium border border-[#343b65] transition-all duration-200 hover:bg-[#4751a3] hover:scale-105 active:scale-95"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </form>
              </div>

              {/* Messages */}
              {message && (
                <div className={`mb-6 px-4 py-3 rounded-lg flex items-center justify-between ${
                  message.type === "success" 
                    ? "bg-green-600/20 border border-green-500/30 text-green-100" 
                    : "bg-red-600/20 border border-red-500/30 text-red-100"
                }`}>
                  <span className="font-medium">{message.text}</span>
                  <button
                    className="ml-4 text-current hover:opacity-70 transition-opacity"
                    onClick={() => setMessage(null)}
                    aria-label="Dismiss message"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Product Form Modal */}
              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="bg-[#1a1e32] p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-[#343b65]">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-white text-2xl font-bold">
                        {editId ? "Edit Product" : "Add New Product"}
                      </h2>
                      <button
                        className="text-[#939bc8] hover:text-white transition-colors text-xl"
                        onClick={closeForm}
                        aria-label="Close form"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Product ID
                          </label>
                          <input
                            type="text"
                            name="productId"
                            placeholder="Enter product ID"
                            value={form.productId || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Product Name *
                          </label>
                          <input
                            ref={nameInputRef}
                            type="text"
                            name="name"
                            placeholder="Enter product name"
                            value={form.name || ""}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Price *
                          </label>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={form.price === undefined ? "" : form.price}
                            onChange={handleChange}
                            required
                            min={0.01}
                            step={0.01}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Cost *
                          </label>
                          <input
                            type="number"
                            name="cost"
                            placeholder="0.00"
                            value={form.cost === undefined ? "" : form.cost}
                            onChange={handleChange}
                            required
                            min={0}
                            step={0.01}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Stock Quantity *
                          </label>
                          <input
                            type="number"
                            name="stock"
                            placeholder="0"
                            value={form.stock === undefined ? "" : form.stock}
                            onChange={handleChange}
                            required
                            min={0}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Category *
                          </label>
                          <input
                            type="text"
                            name="category"
                            placeholder="Enter category"
                            value={form.category || ""}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#939bc8] text-sm font-medium mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          name="image"
                          placeholder="https://example.com/image.jpg"
                          value={form.image || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Price vs Cost Warning */}
                      {form.price !== undefined && form.cost !== undefined && form.price < form.cost && (
                        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-200 text-sm font-medium">
                            ⚠️ Warning: Price is less than cost. This will result in a loss.
                          </p>
                        </div>
                      )}

                      {/* Image Preview */}
                      {form.image && (
                        <div className="flex justify-center">
                          <img
                            src={form.image}
                            alt="Product preview"
                            className="w-24 h-24 object-cover rounded-lg border border-[#343b65]"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#07b151] to-[#0bda65] text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#07b151]/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                          disabled={!isFormValid}
                          title={isFormValid ? undefined : "Please fill all required fields"}
                        >
                          {editId ? "Update Product" : "Add Product"}
                        </button>
                        <button
                          type="button"
                          onClick={closeForm}
                          className="flex-1 px-6 py-3 rounded-lg bg-[#242a47] text-white font-bold border border-[#343b65] transition-all duration-200 hover:bg-[#343b65] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#939bc8]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="overflow-hidden rounded-xl border border-[#343b65] bg-[#1a1e32]">
                <div className="overflow-x-auto">
                  <table className="min-w-[800px] w-full">
                    <thead className="bg-[#242a47]">
                      <tr>
                        <th 
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("productId")}
                        >
                          <div className="flex items-center gap-2">
                            Product ID
                            {sort.field === "productId" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-2">
                            Name
                            {sort.field === "name" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("stock")}
                        >
                          <div className="flex items-center gap-2">
                            Stock
                            {sort.field === "stock" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("price")}
                        >
                          <div className="flex items-center gap-2">
                            Price
                            {sort.field === "price" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center gap-2">
                            Category
                            {sort.field === "category" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          Image
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody ref={tableRef} className="divide-y divide-[#343b65]">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bda65]"></div>
                              <span>Loading products...</span>
                            </div>
                          </td>
                        </tr>
                      ) : sortedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <span className="text-4xl">📦</span>
                              <span>No products found</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sortedProducts.map((product) => {
                          const id = product._id ?? product.productId ?? "";
                          return (
                            <tr key={id} className="hover:bg-[#1f2439] transition-colors">
                              <td className="px-6 py-4 text-white font-medium">
                                {product.productId || product._id}
                              </td>
                              <td className="px-6 py-4 text-[#939bc8]">
                                {product.name}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  product.stock > 0 
                                    ? "bg-green-600/20 text-green-200" 
                                    : "bg-red-600/20 text-red-200"
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[#0bda65] font-semibold">
                                ${product.price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-[#939bc8]">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-[#343b65] text-white text-sm">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg border border-[#343b65] bg-white"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-[#343b65] rounded-lg flex items-center justify-center">
                                    <span className="text-[#939bc8] text-xs">No Image</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 rounded-lg bg-[#343b65] text-white text-sm font-medium transition-all duration-200 hover:bg-[#4751a3] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                                    title="Edit product"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product._id || product.productId)}
                                    className="p-2 rounded-lg bg-red-600 text-white text-sm font-medium transition-all duration-200 hover:bg-red-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                    title="Delete product"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="bg-[#1a1e32] p-8 rounded-2xl shadow-2xl max-w-md mx-4 border border-[#343b65]">
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-600/20">
                          <span className="text-red-400 text-xl">⚠️</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Delete Product
                      </h3>
                      <p className="text-[#939bc8] mb-6">
                        Are you sure you want to delete this product? This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-white font-medium transition-all duration-200 hover:bg-red-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          onClick={() => confirmDelete(deletingId)}
                        >
                          Yes, Delete
                        </button>
                        <button
                          className="flex-1 px-4 py-2 bg-[#343b65] rounded-lg text-white font-medium transition-all duration-200 hover:bg-[#4751a3] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#939bc8]"
                          onClick={() => setDeletingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="mt-6 text-center">
                <p className="text-[#939bc8] text-sm">
                  Showing {sortedProducts.length} of {products.length} products
                  {(filter.stock || filter.priceMin || filter.priceMax || filter.category) && (
                    <span className="ml-1">(filtered)</span>
                  )}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
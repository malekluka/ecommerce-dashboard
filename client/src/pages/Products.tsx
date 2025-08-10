import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { fetchProducts, addProduct } from "../services/productService";
import type { Product } from "../services/productService";
import { useNavigate } from "react-router-dom";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canFetch, setCanFetch] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({
    productId: "", // <-- add productId
    name: "",
    price: 0,
    cost: 0,
    stock: 0,
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

  useEffect(() => {
    // Token verification logic
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("https://malek-ecommerce-dashboard.up.railway.app/api/auth/me", {
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

  // Fetch products (refresh)
  const fetchAllProducts = () => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setMessage({ type: "error", text: err.message || "Failed to load products" });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!canFetch) return;
    fetchAllProducts();
  }, [canFetch]);

  useEffect(() => {
    if (editId && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editId]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock" || name === "cost") {
      setForm({ ...form, [name]: value === "" ? "" : Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const submitAction = editId
      ? fetch(`https://malek-ecommerce-dashboard.up.railway.app/api/products/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      }).then((res) => res.json())
      : addProduct(form as Product);

    submitAction
      .then((data) => {
        if (data && data._id) {
          setMessage({ type: "success", text: editId ? "Product updated!" : "Product added!" });
          setForm({ name: "", price: undefined, cost: undefined, stock: undefined, category: "", image: "", productId: "" });
          setEditId(null);
          setShowForm(false); // Close popup after add/edit
          fetchAllProducts();
          setTimeout(() => {
            if (tableRef.current) {
              const lastRow = tableRef.current.querySelector("tr:last-child");
              if (lastRow) lastRow.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 500);
        } else {
          setMessage({ type: "error", text: data.message || "Failed to save product." });
        }
      })
      .catch((err) => {
        setMessage({ type: "error", text: err.message || "Failed to save product." });
      });
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
    setShowForm(true); // Show popup on edit
  };

  const handleAddNew = () => {
    setForm({ productId: "", name: "", price: undefined, cost: undefined, stock: undefined, category: "", image: "" });
    setEditId(null);
    setShowForm(true);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    setDeletingId(id);
  };

  const confirmDelete = (id: string) => {
    const token = localStorage.getItem("token");
    fetch(`https://malek-ecommerce-dashboard.up.railway.app/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setMessage({ type: "success", text: "Product deleted!" });
        setDeletingId(null);
        fetchAllProducts();
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to delete product." });
        setDeletingId(null);
      });
  };

  const isFormValid =
    form.name &&
    form.price !== undefined &&
    form.price > 0 &&
    form.cost !== undefined &&
    form.cost >= 0 &&
    form.stock !== undefined &&
    form.stock >= 0 &&
    form.category &&
    typeof form.name === "string" &&
    typeof form.category === "string" &&
    form.productId !== undefined; // allow empty but must exist

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

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <div className="min-h-screen bg-[#111422] font-sans p-6">
              <div className="flex items-center justify-between mb-8">
              <h1 className="text-white text-3xl font-bold">Products</h1>
              <button
                      className="px-4 py-2 rounded bg-[#07b151] text-white font-bold transition-all duration-150 hover:bg-[#0bda65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                      onClick={handleAddNew}
                    >
                      Add Product
                    </button>
              </div>
              {/* Filters Section */}
              <div className="mb-6">
                  <form
                    className="flex flex-wrap gap-4 items-end"
                    onSubmit={(e) => e.preventDefault()}
                  >
                  <div className="flex-1 min-w-[160px]">
                      <label className="block text-[#939bc8] text-xs mb-1" htmlFor="stock">Stock</label>
                      <select
                        id="stock"
                        name="stock"
                        value={filter.stock}
                        onChange={(e) => setFilter((f) => ({ ...f, stock: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                      >
                        <option value="">All Stock</option>
                        <option value="in">In Stock</option>
                        <option value="out">Out of Stock</option>
                      </select>
                    </div>
                  <div className="flex-1 min-w-[160px]">
                      <label className="block text-[#939bc8] text-xs mb-1" htmlFor="priceMin">Minimum Price</label>
                      <input
                        id="priceMin"
                        type="number"
                        name="priceMin"
                        placeholder="Min Price"
                        value={filter.priceMin}
                        onChange={(e) => setFilter((f) => ({ ...f, priceMin: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  <div className="flex-1 min-w-[160px]">
                      <label className="block text-[#939bc8] text-xs mb-1" htmlFor="priceMax">Maximum Price</label>
                      <input
                        id="priceMax"
                        type="number"
                        name="priceMax"
                        placeholder="Max Price"
                        value={filter.priceMax}
                        onChange={(e) => setFilter((f) => ({ ...f, priceMax: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  <div className="flex-1 min-w-[160px]">
                      <label className="block text-[#939bc8] text-xs mb-1" htmlFor="category">Category</label>
                      <input
                        id="category"
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={filter.category}
                        onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                      />
                    </div>
                    <button
                      type="button"
                      className="px-3 py-2 rounded bg-[#343b65] text-white font-bold border border-[#343b65] transition-all duration-150 hover:bg-[#4751a3] hover:scale-105"
                      onClick={() =>
                        setFilter({ stock: "", priceMin: "", priceMax: "", category: "" })
                      }
                    >
                      Clear Filters
                    </button>
                  </form>
              </div>
              {message && (
                <div
                  className={`mb-4 px-4 py-2 rounded ${message.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"
                    }`}
                >
                  {message.text}
                  <button
                    className="ml-4 text-white underline"
                    onClick={() => setMessage(null)}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {/* Popup Form */}
              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-[#1a1e32] p-8 rounded-xl shadow-2xl w-full max-w-lg relative">
                    <button
                      className="absolute top-2 right-2 text-white text-xl"
                      onClick={() => setShowForm(false)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                      <input
                        type="text"
                        name="productId"
                        placeholder="Product ID"
                        value={form.productId || ""}
                        onChange={handleChange}
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        ref={nameInputRef}
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={form.name || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                        autoFocus={!editId}
                      />
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={form.price === undefined ? "" : form.price}
                        onChange={handleChange}
                        required
                        min={0.01}
                        step={0.01}
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="number"
                        name="stock"
                        placeholder="Stock"
                        value={form.stock === undefined ? "" : form.stock}
                        onChange={handleChange}
                        required
                        min={0}
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={form.category || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="url"
                        name="image"
                        placeholder="Image URL"
                        value={form.image || ""}
                        onChange={handleChange}
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="number"
                        name="cost"
                        placeholder="Cost"
                        value={form.cost === undefined ? "" : form.cost}
                        onChange={handleChange}
                        required
                        min={0}
                        step={0.01}
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      {form.price !== undefined && form.cost !== undefined && form.price < form.cost && (
                        <div className="w-full text-center text-sm text-yellow-300 bg-yellow-900 bg-opacity-30 rounded p-2 mb-2">
                          <span className="font-semibold">Note:</span> Price is less than cost!
                        </div>
                      )}
                      {form.image && (
                        <div className="w-full flex justify-center">
                          <img
                            src={form.image}
                            alt="Preview"
                            className="w-20 h-20 object-contain rounded border border-[#343b65] bg-white"
                            style={{ display: "block" }}
                          />
                        </div>
                      )}
                      <div className="flex gap-2 justify-center mt-1 w-full">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded bg-[#07b151] text-white font-bold transition-all duration-150 hover:bg-[#07b151] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                          disabled={!isFormValid}
                          title={isFormValid ? undefined : "Fill all fields correctly"}
                        >
                          {editId ? "Update" : "Add"} Product
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setForm({ name: "", price: undefined, cost: undefined, stock: undefined, category: "", image: "", productId: "" });
                            setEditId(null);
                          }}
                          className="px-4 py-2 rounded bg-[#242a47] text-white font-bold border border-[#343b65] transition-all duration-150 hover:bg-[#343b65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#939bc8]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
                <table className="min-w-[700px] w-full">
                  <thead>
                    <tr className="bg-[#1a1e32]">
                      <th
                        className="px-4 py-3 text-left text-white text-base font-medium cursor-pointer select-none"
                        onClick={() =>
                          setSort((s) => ({
                            field: "productId",
                            direction: s.field === "productId" && s.direction === "asc" ? "desc" : "asc",
                          }))
                        }
                      >
                        Product ID {sort.field === "productId" ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-white text-base font-medium cursor-pointer select-none"
                        onClick={() =>
                          setSort((s) => ({
                            field: "name",
                            direction: s.field === "name" && s.direction === "asc" ? "desc" : "asc",
                          }))
                        }
                      >
                        Name {sort.field === "name" ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-white text-base font-medium cursor-pointer select-none"
                        onClick={() =>
                          setSort((s) => ({
                            field: "stock",
                            direction: s.field === "stock" && s.direction === "asc" ? "desc" : "asc",
                          }))
                        }
                      >
                        Stock {sort.field === "stock" ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-white text-base font-medium cursor-pointer select-none"
                        onClick={() =>
                          setSort((s) => ({
                            field: "price",
                            direction: s.field === "price" && s.direction === "asc" ? "desc" : "asc",
                          }))
                        }
                      >
                        Price {sort.field === "price" ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-white text-base font-medium cursor-pointer select-none"
                        onClick={() =>
                          setSort((s) => ({
                            field: "category",
                            direction: s.field === "category" && s.direction === "asc" ? "desc" : "asc",
                          }))
                        }
                      >
                        Category {sort.field === "category" ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Image</th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody ref={tableRef}>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center text-white py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product) => {
                        const id = product._id ?? product.productId ?? "";
                        return (
                          <tr key={id} className="border-t border-[#343b65]">
                            <td className="px-4 py-2 text-white">{product.productId || product._id}</td>
                            <td className="px-4 py-2 text-[#939bc8]">{product.name}</td>
                            <td className="px-4 py-2 text-white">{product.stock}</td>
                            <td className="px-4 py-2 text-[#0bda65]">${product.price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-white">{product.category}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-16 h-16 object-contain rounded border border-[#343b65] bg-white"
                                    style={{ display: "block" }}
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="px-2 py-1 rounded bg-[#343b65] text-white text-xs flex items-center transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                                  title="Edit"
                                >
                                  <span className="material-icons text-base mr-1" aria-hidden="true">Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id || product.productId)}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-xs flex items-center transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                  title="Delete"
                                >
                                  <span className="material-icons text-base mr-1" aria-hidden="true">Delete</span>
                                </button>
                                {deletingId === (product._id || product.productId) && (
                                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                    <div className="bg-[#1a1e32] p-6 rounded shadow-lg text-white">
                                      <p>Are you sure you want to delete this product?</p>
                                      <div className="mt-4 flex justify-center gap-2">
                                        <button
                                          className="px-4 py-2 bg-red-600 rounded text-white transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                          onClick={() => confirmDelete(product._id || product.productId!)}
                                        >
                                          Yes, Delete
                                        </button>
                                        <button
                                          className="px-4 py-2 bg-[#343b65] rounded text-white transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#939bc8]"
                                          onClick={() => setDeletingId(null)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;

// Add this to your global CSS or Tailwind config for fade-in (if not already available):
// .animate-fade-in { animation: fadeIn 0.18s ease; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);}
// @keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);}

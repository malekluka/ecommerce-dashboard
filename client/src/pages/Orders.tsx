import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { MdCheckCircle, MdError } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../services/productService";

// add API base from env
const API = (import.meta.env.VITE_API_PUBLIC_LINK || "http://localhost:3000").replace(/\/$/, "");

interface ProductRef {
  _id: string;
  name?: string;
  price?: number;
  productId?: string;
}

interface Order {
  _id: string;
  orderId: string;
  customer?: {
    _id?: string;
    customerId?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  } | string;
  products: {
    product: string | ProductRef;
    quantity: number;
  }[];
  status: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  payment: string;
  createdAt: string;
  updatedAt?: string;
  total?: number;
}

interface Discount {
  _id: string;
  code: string;
  percentage: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [canFetch, setCanFetch] = useState(false);
  const [form, setForm] = useState<Partial<Order> & { discount?: string }>({
    orderId: "",
    customer: "",
    products: [{ product: "", quantity: 1 }],
    status: "",
    payment: "",
    total: 0,
    discount: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    payment: "",
    customer: "",
    date: "",
  });
  const [customers, setCustomers] = useState<{ _id: string, firstName?: string, lastName?: string, username?: string }[]>([]);
  const [productsList, setProductsList] = useState<{ _id: string, name: string, price: number, productId?: string }[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
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

  const fetchAllOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      let errorMessage = "Failed to fetch orders";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canFetch) return;
    fetchAllOrders();
  }, [canFetch]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(() => setCustomers([]));
  }, []);

  useEffect(() => {
    fetchProducts()
      .then(data =>
        setProductsList(
          data.map(prod => ({
            _id: prod._id || prod.productId || "",
            name: prod.name,
            price: prod.price,
            productId: prod.productId
          }))
        )
      )
      .catch(() => setProductsList([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/discounts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = new Date();
          setDiscounts(
            data.filter((d: Discount) => new Date(d.endDate) > now)
          );
        } else {
          setDiscounts([]);
        }
      })
      .catch(() => setDiscounts([]));
  }, []);

  const getProductId = (product: string | ProductRef): string => {
    return typeof product === 'string' ? product : product?._id || "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("product-")) {
      const idx = parseInt(name.split("-")[1], 10);
      const products = [...(form.products || [])];

      if (!products[idx]) {
        products[idx] = { product: "", quantity: 1 };
      }

      const selectedProduct = productsList.find(p => p._id === value);

      setForm(prev => ({
        ...prev,
        products: products.map((item, i) =>
          i === idx
            ? {
              ...item,
              product: value,
              quantity: item.quantity
            }
            : item
        ),
        total: selectedProduct
          ? (prev.products?.[idx]?.quantity || 1) * selectedProduct.price
          : prev.total
      }));

    } else if (name.startsWith("quantity-")) {
      const idx = parseInt(name.split("-")[1], 10);
      const quantity = Math.max(1, parseInt(value) || 1);

      setForm(prev => {
        const products = [...(prev.products || [])];

        if (!products[idx]) {
          products[idx] = { product: "", quantity: 1 };
        } else {
          products[idx] = {
            ...products[idx],
            quantity
          };
        }

        const productId = products[idx].product;
        const product = productsList.find(p => p._id === productId);

        return {
          ...prev,
          products,
          total: product
            ? quantity * product.price
            : prev.total
        };
      });

    } else if (name === "discount") {
      setSelectedDiscountId(value);
      setForm(prev => ({ ...prev, discount: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProductRow = () => {
    setForm(f => ({
      ...f,
      products: [...(f.products || []), { product: "", quantity: 1 }]
    }));
  };

  const handleRemoveProductRow = (idx: number) => {
    setForm(f => ({
      ...f,
      products: (f.products || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const token = localStorage.getItem("token");
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${API}/api/orders/${editId}`
      : `${API}/api/orders`;

    const products = (form.products || []).map(p => ({
      product: p.product,
      quantity: p.quantity
    }));

    const discount: string | null = selectedDiscountId || form.discount || null;

    if (editId) {
      const oldOrder = orders.find(o => o._id === editId);
      if (oldOrder) {
        const oldDiscount = (oldOrder as { discount?: string }).discount || "";
        const oldProducts = oldOrder.products.map(p => ({
          product: typeof p.product === "string" ? p.product : p.product._id,
          quantity: p.quantity
        }));
        const newProducts = products.map(p => ({
          product: p.product,
          quantity: p.quantity
        }));

        let total = 0;
        newProducts.forEach(p => {
          const prod = productsList.find(
            pr => pr._id === p.product || pr.productId === p.product
          );
          if (prod && p.quantity) {
            total += prod.price * p.quantity;
          }
        });
        let discountPercent = 0;
        if (discount) {
          const discountObj = discounts.find(d => d._id === discount);
          if (discountObj) discountPercent = discountObj.percentage;
        }
        const newDiscountedTotal = discountPercent > 0 ? total * (1 - discountPercent / 100) : total;

        if (
          oldOrder.orderId === form.orderId &&
          (typeof oldOrder.customer === "string"
            ? oldOrder.customer
            : oldOrder.customer?._id || "") === form.customer &&
          oldOrder.status === form.status &&
          oldOrder.payment === form.payment &&
          (oldDiscount || "") === (discount || "") &&
          JSON.stringify(oldProducts) === JSON.stringify(newProducts) &&
          Math.abs(oldOrder.total! - newDiscountedTotal) < 0.01
        ) {
          setMessage({ type: "error", text: "No changes detected. Nothing updated." });
          setTimeout(() => {
            if (messageRef.current) {
              messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 50);
          return;
        }
      }
    }

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        products,
        discount,
        total: (() => {
          let total = 0;
          products.forEach(p => {
            const prod = productsList.find(
              pr => pr._id === p.product || pr.productId === p.product
            );
            if (prod && p.quantity) {
              total += prod.price * p.quantity;
            }
          });
          let discountPercent = 0;
          if (discount) {
            const discountObj = discounts.find(d => d._id === discount);
            if (discountObj) discountPercent = discountObj.percentage;
          }
          return discountPercent > 0 ? total * (1 - discountPercent / 100) : total;
        })()
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setMessage({ type: "success", text: editId ? "Order updated!" : "Order added!" });
          setTimeout(() => {
            if (messageRef.current) {
              messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 50);
          fetchAllOrders();
          if (editId) {
            setTimeout(() => {
              setShowForm(false);
              setForm({
                orderId: "",
                customer: "",
                products: [{ product: "", quantity: 1 }],
                status: "",
                payment: "",
                total: 0
              });
              setEditId(null);
            }, 800);
          }
        } else {
          setMessage({ type: "error", text: data.error || data.message || "Failed to save order." });
          setTimeout(() => {
            if (messageRef.current) {
              messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 50);
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to save order." });
        setTimeout(() => {
          if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 50);
      });
  };

  const handleEdit = (order: Order) => {
    const products = order.products?.length > 0
      ? order.products.map(p => {
        if (typeof p.product !== 'string' && !(p.product as ProductRef)?._id) {
          console.warn('Invalid product reference in order:', p.product);
          return { product: "", quantity: p.quantity };
        }
        return {
          product: typeof p.product === 'string' ? p.product : p.product._id,
          quantity: p.quantity
        };
      })
      : [{ product: "", quantity: 1 }];

    setForm({
      orderId: order.orderId,
      customer: typeof order.customer === "string" ? order.customer : order.customer?._id || "",
      products,
      status: order.status,
      payment: order.payment,
      total: order.total || 0,
      createdAt: order.createdAt,
      discount: (order as { discount?: string }).discount || "",
    });
    setSelectedDiscountId((order as { discount?: string }).discount || "");
    setEditId(order._id);
    setMessage(null);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setForm({
      orderId: "",
      customer: "",
      products: [{ product: "", quantity: 1 }],
      status: "",
      payment: "",
      total: 0
    });
    setEditId(null);
    setMessage(null);
    setShowForm(true);
    setSelectedDiscountId(null);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    setDeletingId(id);
  };

  const confirmDelete = (id: string) => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/orders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setMessage({ type: "success", text: "Order deleted!" });
        setDeletingId(null);
        fetchAllOrders();
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to delete order." });
        setDeletingId(null);
      });
  };

  const isFormValid =
    form.customer &&
    form.status &&
    form.payment &&
    typeof form.customer === "string" &&
    typeof form.status === "string" &&
    typeof form.payment === "string" &&
    Array.isArray(form.products) &&
    (form.products || []).length > 0 &&
    (form.products || []).every(p => p.product && p.quantity > 0);

  const [discountedTotal, setDiscountedTotal] = useState<number>(0);
  useEffect(() => {
    if (!showForm) return;

    const products = form.products || [];
    let total = 0;

    products.forEach(p => {
      const prod = productsList.find(
        pr => pr._id === p.product || pr.productId === p.product
      );
      if (prod && p.quantity) {
        total += prod.price * p.quantity;
      }
    });

    let discountPercent = 0;
    if (selectedDiscountId) {
      const discount = discounts.find(d => d._id === selectedDiscountId);
      if (discount) discountPercent = discount.percentage;
    }
    const discounted = discountPercent > 0 ? total * (1 - discountPercent / 100) : total;
    setDiscountedTotal(discounted);
    setForm(f => ({ ...f, total }));
  }, [form.products, productsList, showForm, selectedDiscountId, discounts]);

  const filteredOrders = orders.filter((order) => {
    const statusOk = !filter.status || order.status === filter.status;
    const paymentOk = !filter.payment || order.payment === filter.payment;
    const customerName =
      typeof order.customer === "object" && order.customer
        ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim().toLowerCase()
        : typeof order.customer === "string"
          ? order.customer.toLowerCase()
          : "";
    const customerOk =
      !filter.customer ||
      (customerName && customerName.includes(filter.customer.toLowerCase()));
    const dateString = order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : "";
    const dateOk =
      !filter.date ||
      (dateString && dateString === filter.date);
    return statusOk && paymentOk && customerOk && dateOk;
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <div className="min-h-screen bg-[#111422] font-sans p-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-white text-3xl font-bold">Orders</h1>
                <button
                  className="px-4 py-2 rounded bg-[#07b151] text-white font-bold transition-all duration-150 hover:bg-[#0bda65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                  onClick={handleAddNew}
                >
                  Add Order
                </button>
              </div>

              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div
                    className="bg-[#1a1e32] p-6 rounded-xl shadow-2xl w-full max-w-md relative flex flex-col"
                    style={{
                      maxHeight: "90vh",
                      minHeight: "auto",
                      width: "95%",
                      maxWidth: "500px",
                    }}
                  >
                    <button
                      className="absolute top-0 right-2 text-white text-xl hover:text-gray-300"
                      onClick={() => {
                        setShowForm(false);
                        setMessage(null);
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>

                    {/* Message */}
                    {message && (
                      <div
                        ref={messageRef}
                        className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border-l-4 ${message.type === "success"
                          ? "bg-green-600 text-white border-green-300"
                          : "bg-red-600 text-white border-red-300"
                          }`}
                      >
                        {message.type === "success" ? (
                          <MdCheckCircle className="text-2xl" />
                        ) : (
                          <MdError className="text-2xl" />
                        )}
                        <span className="flex-1 font-semibold">{message.text}</span>
                        <button
                          onClick={() => setMessage(null)}
                          className="text-white hover:text-gray-200"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto pr-3
    scrollbar-thin 
    scrollbar-thumb-[#3a4161] 
    scrollbar-track-[#242a47]
    hover:scrollbar-thumb-[#4a526f]
    scroll-smooth">
                      <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="grid gap-3"
                      >
                        {/* Order ID */}
                        <div>
                          <label className="block text-[#939bc8] text-xs mb-1">Order ID</label>
                          <input
                            type="text"
                            name="orderId"
                            placeholder="Order ID"
                            value={form.orderId || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                          />
                        </div>

                        {/* Customer */}
                        <div>
                          <label className="block text-[#939bc8] text-xs mb-1">Customer</label>
                          <select
                            name="customer"
                            value={typeof form.customer === "string" ? form.customer : ""}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                          >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                              <option key={c._id} value={c._id}>
                                {c.firstName || ""} {c.lastName || ""} {c.username ? `(${c.username})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Products */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-[#939bc8] text-xs">Products</label>
                            <button
                              type="button"
                              className="px-2 py-1 text-xs font-bold rounded bg-[#07b151] text-white"
                              onClick={handleAddProductRow}
                            >
                              + Add Product
                            </button>
                          </div>

                          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2
                           scrollbar-thin 
                           scrollbar-thumb-[#3a4161] 
                          scrollbar-track-[#242a47]">   
                         {(form.products || []).map((p, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <select
                                name={`product-${idx}`}
                                value={getProductId(p.product)}
                                onChange={handleChange}
                                className="flex-1 px-2 py-1 rounded bg-[#242a47] text-white text-sm"
                                required
                              >
                                <option value="">Select Product</option>
                                {productsList.map(prod => (
                                  <option key={prod._id} value={prod._id}>
                                    {prod.name} ({prod.productId})
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                name={`quantity-${idx}`}
                                value={p.quantity || 1}
                                min={1}
                                onChange={(e) => {
                                  const value = Math.max(1, parseInt(e.target.value) || 1);
                                  handleChange({
                                    target: {
                                      name: e.target.name,
                                      value: value.toString()
                                    }
                                  } as React.ChangeEvent<HTMLInputElement>);
                                }}
                                className="w-16 px-2 py-1 rounded bg-[#242a47] text-white text-sm"
                                required
                              />
                              {(form.products?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  className="px-2 py-1 rounded bg-red-600 text-white text-sm"
                                  onClick={() => handleRemoveProductRow(idx)}
                                  title="Remove"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          </div>
                        </div>

                        {/* Status & Payment */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#939bc8] text-xs mb-1">Status</label>
                            <select
                              name="status"
                              value={form.status || ""}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 rounded bg-[#242a47] text-white text-sm"
                            >
                              <option value="">Select status</option>
                              <option value="pending">🕒 Pending</option>
                              <option value="shipped">🚚 Shipped</option>
                              <option value="delivered">✅ Delivered</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#939bc8] text-xs mb-1">Payment</label>
                            <select
                              name="payment"
                              value={form.payment || ""}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 rounded bg-[#242a47] text-white text-sm"
                            >
                              <option value="">Select payment</option>
                              <option value="Paid">💵 Paid</option>
                              <option value="UnPaid">❌ UnPaid</option>
                              <option value="Partially Paid">🟡 Partially Paid</option>
                            </select>
                          </div>
                        </div>

                        {/* Discount */}
                        <div>
                          <label className="block text-[#939bc8] text-xs mb-1">Discount</label>
                          <select
                            name="discount"
                            value={selectedDiscountId || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded bg-[#242a47] text-white text-sm"
                          >
                            <option value="">No Discount</option>
                            {discounts.map(d => (
                              <option key={d._id} value={d._id}>
                                {d.code} ({d.percentage}%)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Total */}
                        <div>
                          <label className="block text-[#939bc8] text-xs mb-1">Total</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              name="total"
                              placeholder="Total"
                              value={form.total ?? ""}
                              readOnly
                              className="flex-1 px-3 py-2 rounded bg-[#242a47] text-[#0bda65] font-bold"
                              style={{ backgroundColor: "#181c2f" }}
                            />
                            {selectedDiscountId && (
                              <span className="text-[#07b151] text-sm font-bold whitespace-nowrap">
                                ${discountedTotal.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <label className="block text-[#939bc8] text-xs mb-1">Order Date</label>
                          <input
                            type="date"
                            name="createdAt"
                            value={
                              form.createdAt
                                ? new Date(form.createdAt).toISOString().slice(0, 10)
                                : ""
                            }
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                createdAt: e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : "",
                              }))
                            }
                            className="w-full px-3 py-2 rounded bg-[#242a47] text-white text-sm"
                          />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded bg-[#07b151] text-white font-bold hover:bg-[#0bda65] transition-colors"
                            disabled={!isFormValid}
                          >
                            {editId ? "Update Order" : "Add Order"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowForm(false);
                              setForm({
                                orderId: "",
                                customer: "",
                                products: [{ product: "", quantity: 1 }],
                                status: "",
                                payment: "",
                                total: 0
                              });
                              setEditId(null);
                              setMessage(null);
                            }}
                            className="flex-1 px-4 py-2 rounded bg-[#242a47] text-white font-bold border border-[#343b65] hover:bg-[#343b65] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <form className="flex flex-wrap gap-4 items-end" onSubmit={e => e.preventDefault()}>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-status">Status</label>
                    <select
                      id="filter-status"
                      name="status"
                      value={filter.status}
                      onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    >
                      <option value="">All Status</option>
                      <option value="pending">🕒 Pending</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="delivered">✅ Delivered</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-payment">Payment</label>
                    <select
                      id="filter-payment"
                      name="payment"
                      value={filter.payment}
                      onChange={e => setFilter(f => ({ ...f, payment: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    >
                      <option value="">All Payment</option>
                      <option value="Paid">💵 Paid</option>
                      <option value="UnPaid">❌ UnPaid</option>
                      <option value="Partially Paid">🟡 Partially Paid</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-customer">Customer Name</label>
                    <input
                      id="filter-customer"
                      type="text"
                      name="customer"
                      placeholder="Customer Name"
                      value={filter.customer}
                      onChange={e => setFilter(f => ({ ...f, customer: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-date">Date</label>
                    <input
                      id="filter-date"
                      type="date"
                      name="date"
                      placeholder="Date"
                      value={filter.date}
                      onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-[#343b65] text-white font-bold border border-[#343b65] transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 mt-6"
                    onClick={() => setFilter({ status: "", payment: "", customer: "", date: "" })}
                  >
                    Clear Filters
                  </button>
                </form>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
                <table className="min-w-[700px] w-full">
                  <thead>
                    <tr className="bg-[#1a1e32]">
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Order ID</th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Payment</th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Total</th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center text-white py-4">Loading...</td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="border-t border-[#343b65]">
                          <td className="px-4 py-2 text-white">{order.orderId || order._id}</td>
                          <td className="px-4 py-2 text-[#939bc8]">
                            {typeof order.customer === "object" && order.customer
                              ? (
                                (order.customer.firstName || order.customer.lastName)
                                  ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
                                  : order.customer.customerId || order.customer.username || "N/A"
                              )
                              : typeof order.customer === "string" && order.customer
                                ? order.customer
                                : "N/A"}
                          </td>
                          <td className="px-4 py-2 text-[#939bc8]">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-block rounded-xl px-3 py-1 text-sm font-medium bg-[#242a47] text-white">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-block rounded-xl px-3 py-1 text-sm font-medium bg-[#242a47] text-white">
                              {order.payment}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-[#939bc8]">
                            {typeof order.total === "number"
                              ? `$${order.total.toFixed(2)}`
                              : order.total || "$0.00"}
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              onClick={() => handleEdit(order)}
                              className="px-2 py-1 rounded bg-[#343b65] text-white text-xs flex items-center transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                              title="Edit"
                            >
                              <span className="material-icons text-base mr-1" aria-hidden="true">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(order._id)}
                              className="px-2 py-1 rounded bg-red-600 text-white text-xs flex items-center transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                              title="Delete"
                            >
                              <span className="material-icons text-base mr-1" aria-hidden="true">Delete</span>
                            </button>
                            {deletingId === order._id && (
                              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                <div className="bg-[#1a1e32] p-6 rounded shadow-lg text-white">
                                  <p>Are you sure you want to delete this order?</p>
                                  <div className="mt-4 flex justify-center gap-2">
                                    <button
                                      className="px-4 py-2 bg-red-600 rounded text-white transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                      onClick={() => confirmDelete(order._id)}
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
                          </td>
                        </tr>
                      ))
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

export default Orders;
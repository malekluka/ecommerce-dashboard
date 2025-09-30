import React, { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { MdCheckCircle, MdError, MdWarning } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../services/productService";

// Add API configuration
const APP_LINK = import.meta.env.VITE_APP_URL || "http://localhost:5173";

interface ProductRef {
  _id: string;
  name?: string;
  price?: number;
  productId?: string;
}

interface Customer {
  _id?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

interface Order {
  _id: string;
  orderId: string;
  customer?: Customer | string;
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
  discount?: string;
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
    status: "pending",
    payment: "UnPaid",
    total: 0,
    discount: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    payment: "",
    customer: "",
    date: "",
    orderId: "",
  });
  const [sort, setSort] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "createdAt",
    direction: "desc",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productsList, setProductsList] = useState<{ _id: string, name: string, price: number, productId?: string }[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${APP_LINK}/api/auth/me`, {
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

  // Fetch all orders
  const fetchAllOrders = useCallback(async () => {
    if (!canFetch) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_LINK}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch orders");
      }

      // In fetchAllOrders function, after getting the data:
      const data = await res.json();
      console.log('Orders from API:', data); // Add this line
      setOrders(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to fetch orders"
      });
    } finally {
      setLoading(false);
    }
  }, [canFetch]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_LINK}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.warn("Failed to fetch customers:", err);
      setCustomers([]);
    }
  }, []);

  // Fetch products
  const fetchProductsList = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProductsList(
        data.map(prod => ({
          _id: prod._id || prod.productId || "",
          name: prod.name,
          price: prod.price,
          productId: prod.productId
        }))
      );
    } catch (err) {
      console.warn("Failed to fetch products:", err);
      setProductsList([]);
    }
  }, []);

  // Fetch discounts
  const fetchDiscounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_LINK}/api/discounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const now = new Date();
          setDiscounts(
            data.filter((d: Discount) => new Date(d.endDate) > now)
          );
        }
      }
    } catch (err) {
      console.warn("Failed to fetch discounts:", err);
      setDiscounts([]);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (canFetch) {
      fetchAllOrders();
      fetchCustomers();
      fetchProductsList();
      fetchDiscounts();
    }
  }, [canFetch, fetchAllOrders, fetchCustomers, fetchProductsList, fetchDiscounts]);

  // Calculate total whenever products or discount changes
  const calculateTotal = useCallback(() => {
    if (!form.products) return 0;

    let subtotal = 0;
    form.products.forEach(p => {
      const product = productsList.find(
        pr => pr._id === p.product || pr.productId === p.product
      );
      if (product && p.quantity) {
        subtotal += product.price * p.quantity;
      }
    });

    let discountPercent = 0;
    if (selectedDiscountId) {
      const discount = discounts.find(d => d._id === selectedDiscountId);
      if (discount) discountPercent = discount.percentage;
    }

    return discountPercent > 0 ? subtotal * (1 - discountPercent / 100) : subtotal;
  }, [form.products, productsList, selectedDiscountId, discounts]);

  // Update total when dependencies change
  useEffect(() => {
    if (showForm) {
      const newTotal = calculateTotal();
      setForm(prev => ({ ...prev, total: newTotal }));
    }
  }, [showForm, calculateTotal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("product-")) {
      const idx = parseInt(name.split("-")[1], 10);
      setForm(prev => ({
        ...prev,
        products: (prev.products || []).map((item, i) =>
          i === idx ? { ...item, product: value } : item
        )
      }));
    } else if (name.startsWith("quantity-")) {
      const idx = parseInt(name.split("-")[1], 10);
      const quantity = Math.max(1, parseInt(value) || 1);
      setForm(prev => ({
        ...prev,
        products: (prev.products || []).map((item, i) =>
          i === idx ? { ...item, quantity } : item
        )
      }));
    } else if (name === "discount") {
      setSelectedDiscountId(value || null);
      setForm(prev => ({ ...prev, discount: value }));
    } else if (name === "createdAt") {
      // Handle date without timezone conversion
      setForm(prev => ({ ...prev, createdAt: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const addProductRow = () => {
    setForm(prev => ({
      ...prev,
      products: [...(prev.products || []), { product: "", quantity: 1 }]
    }));
  };

  const removeProductRow = (idx: number) => {
    setForm(prev => ({
      ...prev,
      products: (prev.products || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const products = (form.products || []).map(p => ({
        product: p.product,
        quantity: p.quantity
      }));

      // Don't send total - let backend calculate it
      const orderData = {
        orderId: form.orderId,
        customer: form.customer,
        products,
        status: form.status,
        payment: form.payment,
        address: form.address,
        discount: selectedDiscountId || form.discount || null,
        ...(form.createdAt && { createdAt: form.createdAt })
      };

      const method = editId ? "PUT" : "POST";
      const url = editId ? `${APP_LINK}/api/orders/${editId}` : `${APP_LINK}/api/orders`;

      // Check for changes if editing
      // Check for changes if editing
if (editId) {
  const oldOrder = orders.find(o => o._id === editId);
  if (oldOrder) {
    // Normalize dates for comparison (convert to date strings)
    const oldDate = oldOrder.createdAt ? new Date(oldOrder.createdAt).toISOString().slice(0, 10) : "";
    const newDate = form.createdAt ? (form.createdAt.includes('T') ? new Date(form.createdAt).toISOString().slice(0, 10) : form.createdAt) : "";
    
    const hasChanges =
      oldOrder.orderId !== form.orderId ||
      (typeof oldOrder.customer === "string" ? oldOrder.customer : oldOrder.customer?._id || "") !== form.customer ||
      oldOrder.status !== form.status ||
      oldOrder.payment !== form.payment ||
      (oldOrder.discount || "") !== (selectedDiscountId || form.discount || "") ||
      oldDate !== newDate ||  // Add this line for date comparison
      JSON.stringify(oldOrder.products.map(p => ({
        product: typeof p.product === "string" ? p.product : p.product._id,
        quantity: p.quantity
      }))) !== JSON.stringify(products);

    if (!hasChanges) {
      setMessage({ type: "warning", text: "No changes detected" });
      return;
    }
  }
}

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Failed to save order");
      }

      const result = await response.json();
      if (result && result._id) {
        setMessage({
          type: "success",
          text: editId ? "Order updated successfully!" : "Order created successfully!"
        });

        await fetchAllOrders();
        closeForm();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save order"
      });
    }
  };

  const handleEdit = (order: Order) => {
    const products = order.products?.length > 0
      ? order.products.map(p => ({
        product: typeof p.product === 'string' ? p.product : p.product._id || "",
        quantity: p.quantity
      }))
      : [{ product: "", quantity: 1 }];

    setForm({
      orderId: order.orderId,
      customer: typeof order.customer === "string" ? order.customer : order.customer?._id || "",
      products,
      status: order.status,
      payment: order.payment,
      total: order.total || 0,
      createdAt: order.createdAt,
      discount: order.discount || "",
    });

    setSelectedDiscountId(order.discount || null);
    setEditId(order._id);
    setMessage(null);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setForm({
      orderId: "",
      customer: "",
      products: [{ product: "", quantity: 1 }],
      status: "pending",
      payment: "UnPaid",
      total: 0,
      discount: "",
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

  const confirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${APP_LINK}/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      setMessage({ type: "success", text: "Order deleted successfully!" });
      setDeletingId(null);
      await fetchAllOrders();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete order"
      });
      setDeletingId(null);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      orderId: "",
      customer: "",
      products: [{ product: "", quantity: 1 }],
      status: "pending",
      payment: "UnPaid",
      total: 0,
      discount: "",
    });
    setEditId(null);
    setMessage(null);
    setSelectedDiscountId(null);
  };

  // Form validation
  const isFormValid = Boolean(
    form.customer &&
    form.status &&
    form.payment &&
    Array.isArray(form.products) &&
    form.products.length > 0 &&
    form.products.every(p => p.product && p.quantity > 0)
  );

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    const statusOk = !filter.status || order.status === filter.status;
    const paymentOk = !filter.payment || order.payment === filter.payment;
    const orderIdOk = !filter.orderId ||
      order.orderId.toLowerCase().includes(filter.orderId.toLowerCase()) ||
      order._id.toLowerCase().includes(filter.orderId.toLowerCase());

    const customerName = typeof order.customer === "object" && order.customer
      ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim().toLowerCase()
      : typeof order.customer === "string" ? order.customer.toLowerCase() : "";
    const customerOk = !filter.customer ||
      (customerName && customerName.includes(filter.customer.toLowerCase()));

    const dateString = order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : "";
    const dateOk = !filter.date || (dateString && dateString === filter.date);

    return statusOk && paymentOk && customerOk && dateOk && orderIdOk;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sort.field) return 0;

    let aValue: string | number | undefined;
    let bValue: string | number | undefined;

    // Handle customer sorting specially
    if (sort.field === "customer") {
      aValue = typeof a.customer === "object" && a.customer
        ? `${a.customer.firstName || ""} ${a.customer.lastName || ""}`.trim()
        : typeof a.customer === "string" ? a.customer : "";
      bValue = typeof b.customer === "object" && b.customer
        ? `${b.customer.firstName || ""} ${b.customer.lastName || ""}`.trim()
        : typeof b.customer === "string" ? b.customer : "";
    }
    // Handle date sorting specially
    else if (sort.field === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }
    // Handle other fields
    else {
      aValue = a[sort.field as keyof Order] as string | number | undefined;
      bValue = b[sort.field as keyof Order] as string | number | undefined;
    }

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    // String comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      const aLower = aValue.toLowerCase();
      const bLower = bValue.toLowerCase();
      if (aLower < bLower) return sort.direction === "asc" ? -1 : 1;
      if (aLower > bLower) return sort.direction === "asc" ? 1 : -1;
      return 0;
    }

    // Number comparison
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
    setFilter({ status: "", payment: "", customer: "", date: "", orderId: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-600/20 text-yellow-200 border-yellow-500/30";
      case "shipped":
        return "bg-blue-600/20 text-blue-200 border-blue-500/30";
      case "delivered":
        return "bg-green-600/20 text-green-200 border-green-500/30";
      default:
        return "bg-gray-600/20 text-gray-200 border-gray-500/30";
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment.toLowerCase()) {
      case "paid":
        return "bg-green-600/20 text-green-200 border-green-500/30";
      case "unpaid":
        return "bg-red-600/20 text-red-200 border-red-500/30";
      case "partially paid":
        return "bg-orange-600/20 text-orange-200 border-orange-500/30";
      default:
        return "bg-gray-600/20 text-gray-200 border-gray-500/30";
    }
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
                <h1 className="text-white text-3xl font-bold">Orders</h1>
                <button
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#07b151] to-[#0bda65] text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#07b151]/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65] active:scale-95"
                  onClick={handleAddNew}
                >
                  Add Order
                </button>
              </div>

              {/* Messages */}
              {message && (
                <div
                  ref={messageRef}
                  className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 ${message.type === "success"
                    ? "bg-green-600/20 border border-green-500/30 text-green-100"
                    : message.type === "warning"
                      ? "bg-yellow-600/20 border border-yellow-500/30 text-yellow-100"
                      : "bg-red-600/20 border border-red-500/30 text-red-100"
                    }`}
                >
                  {message.type === "success" ? (
                    <MdCheckCircle className="text-xl flex-shrink-0" />
                  ) : message.type === "warning" ? (
                    <MdWarning className="text-xl flex-shrink-0" />
                  ) : (
                    <MdError className="text-xl flex-shrink-0" />
                  )}
                  <span className="flex-1 font-medium">{message.text}</span>
                  <button
                    onClick={() => setMessage(null)}
                    className="text-current hover:opacity-70 transition-opacity"
                    aria-label="Dismiss message"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Order Form Modal */}
              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="bg-[#1a1e32] p-6 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-[#343b65] max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-white text-2xl font-bold">
                        {editId ? "Edit Order" : "Create New Order"}
                      </h2>
                      <button
                        className="text-[#939bc8] hover:text-white transition-colors text-xl"
                        onClick={closeForm}
                        aria-label="Close form"
                      >
                        ×
                      </button>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                      {/* Order ID and Customer */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Order ID
                          </label>
                          <input
                            type="text"
                            name="orderId"
                            placeholder="Enter order ID"
                            value={form.orderId || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Customer *
                          </label>
                          <select
                            name="customer"
                            value={typeof form.customer === "string" ? form.customer : ""}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                              <option key={c._id} value={c._id}>
                                {c.firstName || ""} {c.lastName || ""} {c.username ? `(${c.username})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Products */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-[#939bc8] text-sm font-medium">Products *</label>
                          <button
                            type="button"
                            className="px-3 py-1 text-sm font-medium rounded-lg bg-[#07b151] text-white hover:bg-[#0bda65] transition-colors"
                            onClick={addProductRow}
                          >
                            + Add Product
                          </button>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3a4161] scrollbar-track-[#242a47]">
                          {(form.products || []).map((p, idx) => (
                            <div key={idx} className="flex gap-3 items-center p-4 bg-[#242a47] rounded-lg border border-[#343b65]">
                              <div className="flex-1">
                                <select
                                  name={`product-${idx}`}
                                  value={typeof p.product === 'string' ? p.product : p.product._id || ""}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 rounded-lg bg-[#1a1e32] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors text-sm"
                                  required
                                >
                                  <option value="">Select Product</option>
                                  {productsList.map(prod => (
                                    <option key={prod._id} value={prod._id}>
                                      {prod.name} - ${prod.price.toFixed(2)} {prod.productId ? `(${prod.productId})` : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-20">
                                <input
                                  type="number"
                                  name={`quantity-${idx}`}
                                  value={p.quantity || 1}
                                  min={1}
                                  onChange={handleChange}
                                  className="w-full px-2 py-2 rounded-lg bg-[#1a1e32] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors text-sm text-center"
                                  required
                                />
                              </div>
                              {(form.products?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                                  onClick={() => removeProductRow(idx)}
                                  title="Remove product"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status, Payment, Discount */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">Status *</label>
                          <select
                            name="status"
                            value={form.status || "pending"}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          >
                            <option value="pending">🕒 Pending</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="delivered">✅ Delivered</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">Payment *</label>
                          <select
                            name="payment"
                            value={form.payment || "UnPaid"}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          >
                            <option value="Paid">💵 Paid</option>
                            <option value="UnPaid">❌ UnPaid</option>
                            <option value="Partially Paid">🟡 Partially Paid</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">Discount</label>
                          <select
                            name="discount"
                            value={selectedDiscountId || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          >
                            <option value="">No Discount</option>
                            {discounts.map(d => (
                              <option key={d._id} value={d._id}>
                                {d.code} ({d.percentage}% off)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Order Date and Total */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">Order Date</label>
                          <input
                            type="date"
                            name="createdAt"
                            value={
                              form.createdAt
                                ? new Date(form.createdAt).toISOString().slice(0, 10)
                                : ""
                            }
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">Total Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="total"
                              value={form.total?.toFixed(2) || "0.00"}
                              readOnly
                              className="w-full px-4 py-3 rounded-lg bg-[#1a1e32] text-[#0bda65] border border-[#343b65] font-bold text-lg"
                            />
                            {selectedDiscountId && (
                              <div className="absolute -top-6 right-0 text-xs text-[#939bc8]">
                                After {discounts.find(d => d._id === selectedDiscountId)?.percentage}% discount
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#07b151] to-[#0bda65] text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#07b151]/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                          disabled={!isFormValid}
                        >
                          {editId ? "Update Order" : "Create Order"}
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


              {/* Filters Section */}
              <div className="mb-8 p-6 bg-[#1a1e32] rounded-xl border border-[#343b65]">
                <h2 className="text-white text-lg font-semibold mb-4">Filters</h2>
                <form className="flex flex-wrap gap-4 items-end" onSubmit={e => e.preventDefault()}>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2">Order ID</label>
                    <input
                      type="text"
                      placeholder="Search order ID..."
                      value={filter.orderId}
                      onChange={e => setFilter(f => ({ ...f, orderId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2">Status</label>
                    <select
                      value={filter.status}
                      onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    >
                      <option value="">All Status</option>
                      <option value="pending">🕒 Pending</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="delivered">✅ Delivered</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2">Payment</label>
                    <select
                      value={filter.payment}
                      onChange={e => setFilter(f => ({ ...f, payment: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    >
                      <option value="">All Payment</option>
                      <option value="Paid">💵 Paid</option>
                      <option value="UnPaid">❌ UnPaid</option>
                      <option value="Partially Paid">🟡 Partially Paid</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2">Customer</label>
                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={filter.customer}
                      onChange={e => setFilter(f => ({ ...f, customer: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={filter.date}
                      onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
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

              {/* Orders Table */}
              <div className="overflow-hidden rounded-xl border border-[#343b65] bg-[#1a1e32]">
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full">
                    <thead className="bg-[#242a47]">
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("orderId")}
                        >
                          <div className="flex items-center gap-2">
                            Order ID
                            {sort.field === "orderId" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("customer")}
                        >
                          <div className="flex items-center gap-2">
                            Customer
                            {sort.field === "customer" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {sort.field === "createdAt" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            {sort.field === "status" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("payment")}
                        >
                          <div className="flex items-center gap-2">
                            Payment
                            {sort.field === "payment" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-white text-sm font-semibold cursor-pointer select-none hover:bg-[#2d3451] transition-colors"
                          onClick={() => handleSort("total")}
                        >
                          <div className="flex items-center gap-2">
                            Total
                            {sort.field === "total" && (
                              <span className="text-[#0bda65]">
                                {sort.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#343b65]">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bda65]"></div>
                              <span>Loading orders...</span>
                            </div>
                          </td>
                        </tr>
                      ) : sortedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <span className="text-4xl">📋</span>
                              <span>No orders found</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sortedOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-[#1f2439] transition-colors">
                            <td className="px-6 py-4 text-white font-medium">
                              {order.orderId || order._id}
                            </td>
                            <td className="px-6 py-4 text-[#939bc8]">
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
                            <td className="px-6 py-4 text-[#939bc8]">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPaymentColor(order.payment)}`}>
                                {order.payment}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#0bda65] font-semibold">
                              {(() => {
                                // If total exists and is greater than 0, show it
                                if (order.total && order.total > 0) {
                                  return `$${order.total.toFixed(2)}`;
                                }

                                // Otherwise calculate from populated products
                                let calculatedTotal = 0;
                                if (order.products && Array.isArray(order.products)) {
                                  order.products.forEach(item => {
                                    if (typeof item.product === 'object' && item.product && item.product.price) {
                                      calculatedTotal += item.product.price * item.quantity;
                                    }
                                  });
                                }

                                // Apply discount if exists
                                if (order.discount && calculatedTotal > 0) {
                                  const discount = discounts.find(d => d._id === order.discount);
                                  if (discount) {
                                    calculatedTotal = calculatedTotal * (1 - discount.percentage / 100);
                                  }
                                }

                                return calculatedTotal > 0 ? `$${calculatedTotal.toFixed(2)}` : "$0.00";
                              })()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleEdit(order)}
                                  className="p-2 rounded-lg bg-[#343b65] text-white text-sm font-medium transition-all duration-200 hover:bg-[#4751a3] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                                  title="Edit order"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(order._id)}
                                  className="p-2 rounded-lg bg-red-600 text-white text-sm font-medium transition-all duration-200 hover:bg-red-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                  title="Delete order"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
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
                        Delete Order
                      </h3>
                      <p className="text-[#939bc8] mb-6">
                        Are you sure you want to delete this order? This action cannot be undone.
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
                  Showing {sortedOrders.length} of {orders.length} orders
                  {(filter.status || filter.payment || filter.customer || filter.date || filter.orderId) && (
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

export default Orders;
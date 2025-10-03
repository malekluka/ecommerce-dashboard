import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { MdCheckCircle } from "react-icons/md";

const APP_LINK = import.meta.env.VITE_APP_URL || "http://localhost:5173";


interface Discount {
  _id?: string;
  code: string;
  percentage: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

const Discounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: '',
    percentage: 0,
    startDate: '',
    endDate: ''
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [canFetch, setCanFetch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    code: "",
    status: "",
    date: "",
  });
  const [formTimeout, setFormTimeout] = useState<number | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchDiscounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${APP_LINK}/api/discounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch discounts");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const now = new Date();
        const discountsActive = data.map((discount: Discount) => ({
          ...discount,
          isActive: new Date(discount.endDate) > now,
        }));
        setDiscounts(discountsActive);
      } else {
        setDiscounts([]);
      }
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setMessage({ type: "error", text: "Failed to load discounts" });
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Token verification logic
    const token = localStorage.getItem("token");
    if (!token) {
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

  useEffect(() => {
    if (!canFetch) return;
    fetchDiscounts();
  }, [canFetch]);

  useEffect(() => {
    if (editId && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const method = editId ? 'PUT' : 'POST';
      const url = editId
        ? `${APP_LINK}/api/discounts/${editId}`
        : `${APP_LINK}/api/discounts`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save discount");
      }

      setMessage({ type: "success", text: editId ? "Discount updated successfully!" : "Discount added successfully!" });
      setForm({ code: '', percentage: 0, startDate: '', endDate: '' });
      setEditId(null);
      await fetchDiscounts();

      // Auto-close form after success
      if (formTimeout) clearTimeout(formTimeout);
      const timeout = window.setTimeout(() => {
        setShowForm(false);
        setMessage(null);
      }, 800);
      setFormTimeout(timeout);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save discount"
      });
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (formTimeout) clearTimeout(formTimeout);
    };
  }, [formTimeout]);

  const handleEdit = (discount: Discount) => {
    setForm({
      code: discount.code,
      percentage: discount.percentage,
      startDate: discount.startDate.slice(0, 10),
      endDate: discount.endDate.slice(0, 10)
    });
    setEditId(discount._id || null);
    setShowForm(true);
    setMessage(null); // Add this line
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    setDeletingId(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${APP_LINK}/api/discounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to delete discount");
      }

      setMessage({ type: "success", text: "Discount deleted successfully!" });
      setDeletingId(null);
      await fetchDiscounts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete discount"
      });
      setDeletingId(null);
    }
  };

  const isFormValid =
    form.code.trim() &&
    form.percentage > 0 &&
    form.percentage <= 100 &&
    form.startDate &&
    form.endDate &&
    form.startDate <= form.endDate;

  // Filtering logic
  const filteredDiscounts = discounts.filter((discount) => {
    const codeOk = !filter.code || discount.code.toLowerCase().includes(filter.code.toLowerCase());
    const statusOk =
      !filter.status ||
      (filter.status === "active" && discount.isActive) ||
      (filter.status === "inactive" && !discount.isActive);
    const dateString = discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 10) : "";
    const dateOk = !filter.date || (dateString && dateString === filter.date);
    return codeOk && statusOk && dateOk;
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <div className="min-h-screen bg-[#111422] font-sans p-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-white text-3xl font-bold">Discounts</h1>
                <button
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#07b151] to-[#0bda65] text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#07b151]/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65] active:scale-95"
                  onClick={() => { setShowForm(true); setEditId(null); setForm({ code: '', percentage: 0, startDate: '', endDate: '' }); setMessage(null); }}
                >
                  Add Discount
                </button>
              </div>
              {/* Popup Form */}
              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="bg-[#1a1e32] p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-[#343b65]">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-white text-2xl font-bold">
                        {editId ? "Edit Discount" : "Add New Discount"}
                      </h2>
                      <button
                        className="text-[#939bc8] hover:text-white transition-colors text-xl"
                        onClick={() => { setShowForm(false); setMessage(null); setEditId(null); }}
                        aria-label="Close form"
                      >
                        ×
                      </button>
                    </div>
                    {/* Success/Error message styled like Orders page */}
                    {message && (
                      <div
                        className={`mb-6 px-4 py-3 rounded-lg flex items-center justify-between ${message.type === "success"
                          ? "bg-green-600/20 border border-green-500/30 text-green-100"
                          : "bg-red-600/20 border border-red-500/30 text-red-100"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {message.type === "success" ? (
                            <MdCheckCircle className="text-2xl" />
                          ) : (
                            <span className="text-xl">⚠️</span>
                          )}
                          <span className="font-medium">{message.text}</span>
                        </div>
                        <button
                          onClick={() => setMessage(null)}
                          className="ml-4 text-current hover:opacity-70 transition-opacity"
                          aria-label="Dismiss message"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Discount Code *
                          </label>
                          <input
                            ref={codeInputRef}
                            type="text"
                            name="code"
                            placeholder="Enter discount code"
                            value={form.code}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                            autoFocus={!editId}
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Percentage *
                          </label>
                          <input
                            type="number"
                            name="percentage"
                            placeholder="Enter percentage (1-100)"
                            value={form.percentage}
                            onChange={handleChange}
                            required
                            min={1}
                            max={100}
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[#939bc8] text-sm font-medium mb-2">
                            End Date *
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#07b151] to-[#0bda65] text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#07b151]/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                          disabled={!isFormValid}
                          title={isFormValid ? undefined : "Please fill all fields correctly"}
                        >
                          {editId ? 'Update Discount' : 'Add Discount'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ code: '', percentage: 0, startDate: '', endDate: '' });
                            setEditId(null);
                            setShowForm(false);
                            setMessage(null);
                          }}
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
                    <label className="block text-[#939bc8] text-sm font-medium mb-2" htmlFor="filter-code">
                      Code
                    </label>
                    <input
                      id="filter-code"
                      type="text"
                      name="code"
                      placeholder="Search code..."
                      value={filter.code}
                      onChange={e => setFilter(f => ({ ...f, code: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2" htmlFor="filter-status">
                      Status
                    </label>
                    <select
                      id="filter-status"
                      name="status"
                      value={filter.status}
                      onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-sm font-medium mb-2" htmlFor="filter-date">
                      Start Date
                    </label>
                    <input
                      id="filter-date"
                      type="date"
                      name="date"
                      value={filter.date}
                      onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#242a47] text-white border border-[#343b65] focus:border-[#0bda65] focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="button"
                    className="px-4 py-3 rounded-lg bg-[#343b65] text-white font-medium border border-[#343b65] transition-all duration-200 hover:bg-[#4751a3] hover:scale-105 active:scale-95"
                    onClick={() => setFilter({ code: "", status: "", date: "" })}
                  >
                    Clear Filters
                  </button>
                </form>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#343b65] bg-[#1a1e32]">
                <div className="overflow-x-auto">
                  <table className="min-w-[700px] w-full">
                    <thead className="bg-[#242a47]">
                      <tr>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          Code
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          Percentage
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          Start Date
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          End Date
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#343b65]">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bda65]"></div>
                              <span>Loading discounts...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredDiscounts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <span className="text-4xl">🎟️</span>
                              <span>No discounts found</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredDiscounts.map((discount) => (
                          <tr
                            key={discount._id || discount.code}
                            className="hover:bg-[#1f2439] transition-colors"
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              {discount.code}
                            </td>
                            <td className="px-6 py-4 text-[#0bda65] font-semibold">
                              {discount.percentage}%
                            </td>
                            <td className="px-6 py-4 text-[#939bc8]">
                              {new Date(discount.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-[#939bc8]">
                              {new Date(discount.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${discount.isActive
                                  ? "bg-green-600/20 text-green-200 border-green-500/30"
                                  : "bg-gray-600/20 text-gray-300 border-gray-500/30"
                                  }`}
                              >
                                {discount.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => { handleEdit(discount); setShowForm(true); }}
                                  className="p-2 rounded-lg bg-[#343b65] text-white text-sm font-medium transition-all duration-200 hover:bg-[#4751a3] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                                  title="Edit discount"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(discount._id)}
                                  className="p-2 rounded-lg bg-red-600 text-white text-sm font-medium transition-all duration-200 hover:bg-red-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                  title="Delete discount"
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
                        Delete Discount
                      </h3>
                      <p className="text-[#939bc8] mb-6">
                        Are you sure you want to delete this discount? This action cannot be undone.
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
                  Showing {filteredDiscounts.length} of {discounts.length} discounts
                  {(filter.code || filter.status || filter.date) && (
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

export default Discounts;

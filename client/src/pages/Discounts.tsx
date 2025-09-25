import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { MdCheckCircle } from "react-icons/md";

// add API base from env
const API = (import.meta.env.VITE_API_PUBLIC_LINK || "http://localhost:5000").replace(/\/$/, "");

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

  const fetchDiscounts = () => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/discounts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const now = new Date();
          const discountsActive = data.map((discount: Discount) => {
            const isActive = new Date(discount.endDate) > now;
            return {
              ...discount,
              isActive,
            };
          });
          setDiscounts(discountsActive);
        } else {
          setDiscounts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching discounts:", err);
        setDiscounts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Token verification logic
    const token = localStorage.getItem("token");
    if (!token) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `https://malek-ecommerce-dashboard.up.railway.app/api/discounts/${editId}`
      : 'https://malek-ecommerce-dashboard.up.railway.app/api/discounts';
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then(() => {
        setForm({ code: '', percentage: 0, startDate: '', endDate: '' });
        setEditId(null);
        setMessage({ type: "success", text: editId ? "Discount updated!" : "Discount added!" });
        fetchDiscounts();
        // Auto-close form after 800ms (same as Orders)
        if (formTimeout) clearTimeout(formTimeout);
        const timeout = window.setTimeout(() => {
          setShowForm(false);
          setMessage(null);
        }, 800);
        setFormTimeout(timeout);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to save discount." });
      });
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
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    setDeletingId(id);
  };

  const confirmDelete = (id: string) => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/discounts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setMessage({ type: "success", text: "Discount deleted!" });
        setDeletingId(null);
        fetchDiscounts();
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to delete discount." });
        setDeletingId(null);
      });
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
                  className="px-4 py-2 rounded bg-[#07b151] text-white font-bold transition-all duration-150 hover:bg-[#0bda65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                  onClick={() => { setShowForm(true); setEditId(null); setForm({ code: '', percentage: 0, startDate: '', endDate: '' }); }}
                >
                  Add Discount
                </button>
              </div>
              {/* Popup Form */}
              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-[#1a1e32] p-8 rounded-xl shadow-2xl w-full max-w-lg relative">
                    <button
                      className="absolute top-2 right-2 text-white text-xl"
                      onClick={() => { setShowForm(false); setMessage(null); setEditId(null); }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    {/* Success/Error message styled like Orders page */}
                    {message && (
                      <div
                        className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border-l-4 ${
                          message.type === "success"
                            ? "bg-green-600 text-white border-green-300"
                            : "bg-red-600 text-white border-red-300"
                        }`}
                      >
                        {message.type === "success" ? (
                          <MdCheckCircle className="text-2xl" />
                        ) : (
                          <span className="material-icons">error</span>
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
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                      <input
                        ref={codeInputRef}
                        type="text"
                        name="code"
                        placeholder="Code"
                        value={form.code}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                        autoFocus={!editId}
                      />
                      <input
                        type="number"
                        name="percentage"
                        placeholder="Percentage"
                        value={form.percentage}
                        onChange={handleChange}
                        required
                        min={1}
                        max={100}
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <div className="flex gap-2 justify-center mt-4 w-full">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded bg-[#07b151] text-white font-bold transition-all duration-150 hover:bg-[#0bda65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                          disabled={!isFormValid}
                          title={isFormValid ? undefined : "Fill all fields correctly"}
                        >
                          {editId ? 'Update' : 'Add'} Discount
                        </button>
                        <button
                          type="button"
                          onClick={() => { setForm({ code: '', percentage: 0, startDate: '', endDate: '' }); setEditId(null); setShowForm(false); }}
                          className="px-4 py-2 rounded bg-[#242a47] text-white font-bold border border-[#343b65] transition-all duration-150 hover:bg-[#343b65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#939bc8]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {/* Filters */}
              <div className="mb-6">
                <form className="flex flex-wrap gap-4 items-end" onSubmit={e => e.preventDefault()}>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-code">Code</label>
                    <input
                      id="filter-code"
                      type="text"
                      name="code"
                      placeholder="Discount Code"
                      value={filter.code}
                      onChange={e => setFilter(f => ({ ...f, code: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-date">Start Date</label>
                    <input
                      id="filter-date"
                      type="date"
                      name="date"
                      placeholder="Start Date"
                      value={filter.date}
                      onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-[#343b65] text-white font-bold border border-[#343b65] transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 mt-6"
                    onClick={() => setFilter({ code: "", status: "", date: "" })}
                  >
                    Clear Filters
                  </button>
                </form>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
                <table className="min-w-[700px] w-full">
                  <thead>
                    <tr className="bg-[#1a1e32]">
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Percentage
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        End Date
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center text-white py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      filteredDiscounts.map((discount) => (
                        <tr
                          key={discount._id || discount.code}
                          className="border-t border-[#343b65]"
                        >
                          <td className="px-4 py-2 text-white">
                            {discount.code}
                          </td>
                          <td className="px-4 py-2 text-[#0bda65]">
                            {discount.percentage}%
                          </td>
                          <td className="px-4 py-2 text-white">
                            {new Date(discount.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-white">
                            {new Date(discount.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-block rounded-xl px-3 py-1 text-sm font-medium ${
                                discount.isActive
                                  ? "bg-[#07b151] text-white"
                                  : "bg-[#242a47] text-[#939bc8]"
                              }`}
                            >
                              {discount.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              onClick={() => { handleEdit(discount); setShowForm(true); }}
                              className="px-2 py-1 rounded bg-[#343b65] text-white text-xs flex items-center transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                              title="Edit"
                            >
                              <span className="material-icons text-base mr-1" aria-hidden="true">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(discount._id)}
                              className="px-2 py-1 rounded bg-red-600 text-white text-xs flex items-center transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                              title="Delete"
                            >
                              <span className="material-icons text-base mr-1" aria-hidden="true">Delete</span>
                            </button>
                            {deletingId === discount._id && (
                              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                <div className="bg-[#1a1e32] p-6 rounded shadow-lg  text-white">
                                  <p>Are you sure you want to delete this discount?</p>
                                  <div className="mt-4 flex justify-center gap-2">
                                    <button
                                      className="px-4 py-2 bg-red-600 rounded text-white transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                      onClick={() => confirmDelete(discount._id!)}
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

export default Discounts;

import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { MdCheckCircle } from "react-icons/md";

interface Customer {
  _id: string;
  customerId: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [canFetch, setCanFetch] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [formTouched, setFormTouched] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Token verification logic
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("/api/auth/me", {
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

  const fetchAllCustomers = () => {
    const token = localStorage.getItem("token");
    fetch("/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!canFetch) return;
    fetchAllCustomers();
  }, [canFetch]);

  useEffect(() => {
    if (editId && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};


  // Validation helper
  const validateForm = (form: Partial<Customer>) => {
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      form.username?.trim() &&
      form.email &&
      emailRegex.test(form.email) &&
      (editId || form.password) &&
      form.firstName?.trim() &&
      form.lastName?.trim() &&
      form.address?.trim() &&
      form.phone
    );
  };

  const isFormValid = validateForm(form);

  useEffect(() => {
    if (isFormValid && formTouched) {
      setFormTouched(false);
    }
  }, [isFormValid, formTouched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isFormValid) {
      setFormTouched(true);
      setMessage(null); // Don't show the old message
      return;
    }

    const token = localStorage.getItem("token");
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/customers/${editId}` : `/api/customers`;

    // Prepare payload: omit password if editing and password is empty
    const payload = { ...form };
    if (editId && !form.password) {
      delete payload.password;
    }

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setMessage({ type: "success", text: editId ? "Customer updated!" : "Customer added!" });
          fetchAllCustomers();
          setTimeout(() => {
            setShowForm(false);
            setForm({ username: "", email: "", password: "", firstName: "", lastName: "", address: "", phone: "" });
            setEditId(null);
            setMessage(null);
          }, 800);
        } else {
          setMessage({ type: "error", text: data.message || "Failed to save customer." });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Failed to save customer." }));
  };

  const handleEdit = (customer: Customer) => {
    setForm({
      username: customer.username,
      email: customer.email,
      password: "",
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      address: customer.address || "",
      phone: customer.phone || "",
    });
    setEditId(customer._id);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    setDeletingId(id);
  };

  const confirmDelete = (id: string) => {
    const token = localStorage.getItem("token");
    fetch(`/api/customers/${id}`, {
       method: "DELETE",
       headers: { Authorization: `Bearer ${token}` },
     })
       .then(() => {
         setMessage({ type: "success", text: "Customer deleted!" });
         setDeletingId(null);
         fetchAllCustomers();
       })
       .catch(() => {
         setMessage({ type: "error", text: "Failed to delete customer." });
         setDeletingId(null);
       });
  };

  // Filtering logic (case-insensitive, partial match)
  const filteredCustomers = customers.filter((customer) => {
    const usernameOk = !filter.username || customer.username.toLowerCase().includes(filter.username.toLowerCase());
    const emailOk = !filter.email || customer.email.toLowerCase().includes(filter.email.toLowerCase());
    const firstNameOk = !filter.firstName || (customer.firstName || "").toLowerCase().includes(filter.firstName.toLowerCase());
    const lastNameOk = !filter.lastName || (customer.lastName || "").toLowerCase().includes(filter.lastName.toLowerCase());
    return usernameOk && emailOk && firstNameOk && lastNameOk;
  });

  // Add this function to always clear the form for adding a new customer
  const handleAddNew = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
    });
    setEditId(null);
    setShowForm(true);
    setMessage(null);
  };

  // Helper to get field error messages
const getFieldErrors = (form: Partial<Customer>) => {
  const errors: { [key: string]: string } = {};
  if (!form.username?.trim()) errors.username = "Username is required.";
  if (!form.email) errors.email = "Email is required.";
  else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) errors.email = "Email is invalid.";
  }
  if (!editId && !form.password) errors.password = "Password is required.";
  if (!form.firstName?.trim()) errors.firstName = "First name is required.";
  if (!form.lastName?.trim()) errors.lastName = "Last name is required.";
  if (!form.address?.trim()) errors.address = "Address is required.";
  if (!form.phone) errors.phone = "Phone is required.";
  return errors;
};

const fieldErrors = formTouched ? getFieldErrors(form) : {};

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <div className="min-h-screen bg-[#111422] font-sans p-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-white text-3xl font-bold">Customers</h1>
                <button
                  className="px-4 py-2 rounded bg-[#07b151] text-white font-bold transition-all duration-150 hover:bg-[#0bda65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                  onClick={handleAddNew}
                >
                  Add Customer
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
                    {/* Success/Error message with icon, same as Orders */}
                    {message && (
                      <div
                        className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border-l-4 ${message.type === "success"
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
                    <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-wrap gap-4 items-end">
                      <input
                        ref={usernameInputRef}
                        type="text"
                        name="username"
                        autoComplete="off"
                        placeholder="Username"
                        value={form.username || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                        autoFocus={!editId}
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        title="Enter a valid email address"
                      />
                      <input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder={editId ? "New Password (optional)" : "Password"}
                        value={form.password || ""}
                        onChange={handleChange}
                        required={!editId}
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={form.address || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                        required
                        className="px-3 py-2 rounded bg-[#242a47] text-white w-full"
                      />
                      {/* Show specific field warnings after submit attempt */}
                      {formTouched && !isFormValid && (
                        <div className="w-full text-red-400 font-semibold text-sm text-left flex flex-col gap-1 mb-2">
                          {Object.entries(fieldErrors).map(([field, msg]) => (
                            <span key={field}>{msg}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 justify-center mt-4 w-full">
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded bg-[#07b151] text-white font-bold transition-all duration-150 hover:bg-[#0bda65] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65] ${
                            !isFormValid ? "opacity-50" : ""
                          }`}
                          title={isFormValid ? undefined : "Fill all fields correctly"}
                        >
                          {formTouched && !isFormValid ? (
        <span className="text-red-300 font-semibold text-sm">
          Please fill all fields correctly
        </span>
      ) : (
        <>{editId ? "Update" : "Add"} Customer</>
      )}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowForm(false); setEditId(null); setMessage(null); setForm({ username: "", email: "", password: "", firstName: "", lastName: "", address: "", phone: "" }); }}
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
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-username">Username</label>
                    <input
                      id="filter-username"
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={filter.username}
                      onChange={e => setFilter(f => ({ ...f, username: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-email">Email</label>
                    <input
                      id="filter-email"
                      type="text"
                      name="email"
                      placeholder="Email"
                      value={filter.email}
                      onChange={e => setFilter(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-firstName">First Name</label>
                    <input
                      id="filter-firstName"
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={filter.firstName}
                      onChange={e => setFilter(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[#939bc8] text-xs mb-1" htmlFor="filter-lastName">Last Name</label>
                    <input
                      id="filter-lastName"
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={filter.lastName}
                      onChange={e => setFilter(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#242a47] text-white"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-[#343b65] text-white font-bold border border-[#343b65] transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 mt-6"
                    onClick={() => setFilter({ username: "", email: "", firstName: "", lastName: "" })}
                  >
                    Clear Filters
                  </button>
                </form>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
                <table className="min-w-[900px] w-full">
                  <thead>
                    <tr className="bg-[#1a1e32]">
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Customer ID
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        First Name
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Last Name
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-white text-base font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-2 text-white text-center">Loading...</td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-2 text-white text-center">No customers found.</td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer._id} className="border-t border-[#343b65]">
                          <td className="px-4 py-2 text-white">
                            {customer.customerId}
                          </td>
                          <td className="px-4 py-2 text-[#939bc8]">
                            {customer.username}
                          </td>
                          <td className="px-4 py-2 text-[#939bc8]">
                            {customer.email}
                          </td>
                          <td className="px-4 py-2 text-white">
                            {customer.firstName || "-"}
                          </td>
                          <td className="px-4 py-2 text-white">
                            {customer.lastName || "-"}
                          </td>
                          <td className="px-4 py-2 text-white">
                            {customer.address || "-"}
                          </td>
                          <td className="px-4 py-2 text-white">
                            {customer.phone || "-"}
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              onClick={() => { handleEdit(customer); setShowForm(true); }}
                              className="px-2 py-1 rounded bg-[#343b65] text-white text-xs flex items-center transition-all duration-150 hover:bg-[#4751a3] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0bda65]"
                              title="Edit"
                            >
                              <span className="material-icons text-base mr-1" aria-hidden="true">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="px-2 py-1 rounded bg-red-600 text-white text-xs flex items-center transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                              title="Delete"
                            >
                              <span className="material-icons text-base mr-1" aria-hidden="true">Delete</span>
                            </button>
                            {deletingId === customer._id && (
                              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                <div className="bg-[#1a1e32] p-6 rounded shadow-lg text-white">
                                  <p>Are you sure you want to delete this customer?</p>
                                  <div className="mt-4 flex justify-center gap-2">
                                    <button
                                      className="px-4 py-2 bg-red-600 rounded text-white transition-all duration-150 hover:bg-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                      onClick={() => confirmDelete(customer._id)}
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
              {/* ...existing code for message... */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Customers;

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { getAnalyticsStats } from "../utils/analytics";
import type { Order, Customer } from "../utils/analytics";
import {

  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const APP_LINK = import.meta.env.VITE_APP_URL || "http://localhost:5173";


const Dashboard: React.FC = () => {
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesTrendData, setSalesTrendData] = useState<{
    date: string;
    total: number;
  }[]>([]);
  const navigate = useNavigate(); // moved inside component

  const decodeToken = (token: string) => {
    try {
      return jwtDecode<{ exp: number }>(token);
    } catch {
      return null; // Invalid token
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1. Check if token exists
    if (!token) {
      navigate("/login");
      return;
    }

    // 2. Decode token to check expiry (client-side check)
    const decodedToken = decodeToken(token);

    // Add null check before accessing decodedToken.exp
    if (!decodedToken || decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    // 3. Proceed with API calls if token is valid
    axios.get(`${APP_LINK}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setAdminUsername(res.data.user.username);
      })
      .catch((err) => {
        console.error("Error fetching user info", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });

    Promise.all([
      fetch(`${APP_LINK}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${APP_LINK}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(async ([ordersRes, customersRes]) => {
        const ordersData: Order[] = await ordersRes.json();
        const customersData: Customer[] = await customersRes.json();
        setOrders(ordersData);
        setCustomers(customersData);

        // --- Calculate sales trend from first day of current month through today ---
        const today = new Date();
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        const days: { [date: string]: number } = {};
        for (let d = new Date(last30Days); d <= today; d.setDate(d.getDate() + 1)) {
          const key = new Date(d).toISOString().split("T")[0];
          days[key] = 0;
        }
        ordersData.forEach((order) => {
          if (!order.createdAt || typeof order.total !== "number") return;
          const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
          if (dateKey in days) {
            days[dateKey] += order.total;
          }
        });
        const chartData = Object.entries(days)
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
          .map(([date, total]) => ({
            date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            total,
          }));
        setSalesTrendData(chartData);

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const { totalSales, orderCount, revenue, customerCount } = getAnalyticsStats(
    orders,
    customers
  );

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#111422] dark group/design-root overflow-x-hidden font-sans"
      style={{
        fontFamily:
          'Inter, "Noto Sans", "Segoe UI", "Helvetica Neue", Arial, "Liberation Sans", sans-serif',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <div className="flex flex-wrap justify-between gap-2 md:gap-3 p-2 md:p-4">
              <div className="flex min-w-0 flex-col gap-1 md:gap-3">
                <p className="text-white tracking-light text-3xl font-bold tracking-tight md:text-[32px]">
                  Hi{adminUsername ? `, ${adminUsername}!` : " there!"}
                </p>
                <p className="text-slate-300 md:text-base text-base font-medium leading-normal">
                  Here's what's happening with your shop today
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 p-4">
              {/* Total Sales */}
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#1a1e32] border border-[#343b65]">
                <p className="text-[#939bc8] text-sm font-medium">
                  Total Sales
                </p>
                <p className="text-white text-2xl font-bold">
                  {loading ? "..." : `$${totalSales.toLocaleString()}`}
                </p>
              </div>

              {/* Orders */}
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#1a1e32] border border-[#343b65]">
                <p className="text-[#939bc8] text-sm font-medium">
                  Orders
                </p>
                <p className="text-white text-2xl font-bold">
                  {loading ? "..." : orderCount}
                </p>
              </div>

              {/* Revenue */}
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#1a1e32] border border-[#343b65]">
                <p className="text-[#939bc8] text-sm font-medium">
                  Revenue
                </p>
                <p className="text-white text-2xl font-bold">
                  {loading ? "..." : `$${revenue.toLocaleString()}`}
                </p>
              </div>

              {/* Customers */}
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#1a1e32] border border-[#343b65]">
                <p className="text-[#939bc8] text-sm font-medium">
                  Customers
                </p>
                <p className="text-white text-2xl font-bold">
                  {loading ? "..." : customerCount}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 px-4 py-6">
              <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-[#343b65] bg-[#1a1e32] p-6">
                <p className="text-[#939bc8] text-base font-medium">
                  Sales for the past 30 days
                </p>
                <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
                  {loading ? (
                    <div className="text-[#939bc8] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bda65]"></div>
                        <span>Loading chart...</span>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={salesTrendData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0bda65" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0bda65" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <CartesianGrid stroke="#343b65" strokeDasharray="3 3" />
                        <Tooltip contentStyle={{ backgroundColor: "#1e2235", border: "none", color: "#fff" }} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#0bda65"
                          fillOpacity={1}
                          fill="url(#colorTotal)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                  )}
                </div>
              </div>
            </div>
            <h2 className="text-white text-[22px] font-bold px-4 pb-3 pt-5">
              Recent Orders
            </h2>
            <div className="px-4 py-3">
              <div className="overflow-hidden rounded-xl border border-[#343b65] bg-[#1a1e32]">
                <div className="overflow-x-auto">
                  <table className="min-w-[600px] w-full">
                    <thead className="bg-[#242a47]">
                      <tr>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Name</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Date</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Payment</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#343b65]">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bda65]"></div>
                              <span>Loading orders...</span>
                            </div>
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-[#939bc8] py-12">
                            <div className="flex flex-col items-center gap-3">
                              <span className="text-4xl">📦</span>
                              <span>No orders yet</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        [...orders]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 3)
                          .map((order) => (
                            <tr key={order._id} className="hover:bg-[#1f2439] transition-colors">
                              <td className="px-6 py-4 text-white font-medium">
                                {order.orderId ? `Order #${order.orderId}` : order._id}
                              </td>
                              <td className="px-6 py-4 text-[#939bc8]">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#242a47] text-white border border-[#343b65]">
                                  {order.status || "Unknown"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#242a47] text-white border border-[#343b65]">
                                  {order.payment || "Unknown"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[#0bda65] font-semibold">
                                {typeof order.total === "number" ? `$${order.total.toFixed(2)}` : "$0.00"}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

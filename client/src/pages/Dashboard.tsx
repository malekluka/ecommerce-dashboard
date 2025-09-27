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
  axios.get("/api/auth/me", {
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
      fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch("/api/customers", {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(async ([ordersRes, customersRes]) => {
        const ordersData: Order[] = await ordersRes.json();
        const customersData: Customer[] = await customersRes.json();
        setOrders(ordersData);
        setCustomers(customersData);

        // --- Calculate sales trend for June 2024 (2024-06-01 to 2024-06-30) ---
        const days: { [date: string]: number } = {};
        for (let i = 1; i <= 30; i++) {
          const d = new Date(2024, 5, i); // June is month 5 (0-based)
          const key = d.toISOString().split("T")[0];
          days[key] = 0;
        }
        ordersData.forEach((order) => {
          if (!order.createdAt || typeof order.total !== "number") return;
          const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
          if (dateKey in days) {
            days[dateKey] += order.total;
          }
        });
        const chartData = Object.entries(days).map(([date, total]) => ({
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
            <div className="flex flex-wrap gap-2 md:gap-4 p-2 md:p-4">
              {/* Dashboard cards with real analytics */}
              <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
                <p className="text-slate-300 md:text-base text-base font-medium leading-normal">
                  Total Sales
                </p>
                <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                  {loading ? "..." : `$${totalSales.toLocaleString()}`}
                </p>
              </div>
              <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
                <p className="text-slate-300 md:text-base text-base font-medium leading-normal">
                  Orders
                </p>
                <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                  {loading ? "..." : orderCount}
                </p>
              </div>
              <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
                <p className="text-slate-300 md:text-base text-base font-medium leading-normal">
                  Revenue
                </p>
                <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                  {loading ? "..." : `$${revenue.toLocaleString()}`}
                </p>
              </div>
              <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
                <p className="text-slate-300 md:text-base text-base font-medium leading-normal">
                  Customers
                </p>
                <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                  {loading ? "..." : customerCount}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 px-2 md:px-4 py-4 md:py-6">
              <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-2 rounded-xl border border-[#343b65] p-4 md:p-6">
                <p className="text-slate-300 md:text-base text-base font-medium leading-normal">
                  Sales for the past 30 days
                </p>
                <div className="flex min-h-[120px] md:min-h-[180px] flex-1 flex-col gap-4 md:gap-8 py-2 md:py-4">
                  {loading ? (
                    <div className="text-white">Loading chart...</div>
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
            <h2 className="text-white text-lg md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 md:px-4 pb-2 md:pb-3 pt-3 md:pt-5">
              Recent Orders
            </h2>
            <div className="px-2 md:px-4 py-2 md:py-3 @container">
              <div className="flex overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
                <table className="flex-1 min-w-[600px]">
                  <thead>
                    <tr className="bg-[#1a1e32]">
                      <th className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120 px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
                        Name
                      </th>
                      <th className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240 px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
                        Date
                      </th>
                      <th className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360 px-4 py-3 text-left text-white w-60 text-sm font-medium leading-normal">
                        Fulfillment Status
                      </th>
                      <th className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480 px-4 py-3 text-left text-white w-60 text-sm font-medium leading-normal">
                        Payment Status
                      </th>
                      <th className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600 px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center text-white py-4">Loading...</td>
                      </tr>
                    ) : (
                      // Show 3 most recent orders
                      [...orders]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map((order) => (
                          <tr key={order._id} className="border-t border-t-[#343b65]">
                            <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120 h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
                              {order.orderId ? `Order #${order.orderId}` : order._id}
                            </td>
                            <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "N/A"}
                            </td>
                            <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                                <span className="truncate">{order.status || "Unknown"}</span>
                              </button>
                            </td>
                            <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                                <span className="truncate">{order.payment || "Unknown"}</span>
                              </button>
                            </td>
                            <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                              {typeof order.total === "number" ? `$${order.total.toFixed(2)}` : "$0.00"}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
              <style>
                {`
                  @container(max-width:120px){.table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120{display: none;}}
                  @container(max-width:240px){.table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240{display: none;}}
                  @container(max-width:360px){.table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360{display: none;}}
                  @container(max-width:480px){.table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480{display: none;}}
                  @container(max-width:600px){.table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600{display: none;}}
                `}
              </style>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

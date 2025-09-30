import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Order, Customer } from "../utils/analytics";
import { useNavigate } from "react-router-dom";

const Analytics: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [ordersRes, customersRes] = await Promise.all([
          fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const ordersData = await ordersRes.json();
        const customersData = await customersRes.json();
        setOrders(ordersData);
        setCustomers(customersData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper to get date ranges
  const getDateRanges = () => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    return { currentMonthStart, lastMonthStart, lastMonthEnd, now };
  };

  // Calculate proper metrics
  const calculateMetrics = () => {
    const { currentMonthStart, lastMonthStart, lastMonthEnd } = getDateRanges();
    
    // Current month metrics
    const currentOrders = orders.filter(o => new Date(o.createdAt) >= currentMonthStart);
    const currentSales = currentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const currentRevenue = currentOrders.reduce((sum, o) => sum + ((o.total || 0) - (o.cost || 0)), 0);
    
    // Last month metrics
    const lastMonthOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + ((o.total || 0) - (o.cost || 0)), 0);
    
    // Calculate growth percentages
    const salesGrowth = lastMonthSales > 0 
      ? ((currentSales - lastMonthSales) / lastMonthSales) * 100 
      : 0;
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    const ordersGrowth = lastMonthOrders.length > 0 
      ? ((currentOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 
      : 0;
    
    return {
      currentSales,
      currentRevenue,
      currentOrderCount: currentOrders.length,
      salesGrowth,
      revenueGrowth,
      ordersGrowth,
      totalOrders: orders.length,
      totalCustomers: customers.length,
    };
  };

  // Build chart data
  const buildChartData = () => {
    const { currentMonthStart, now } = getDateRanges();
    const salesByDay: Record<string, number> = {};
    
    // Initialize all days
    for (let d = new Date(currentMonthStart); d <= now; d.setDate(d.getDate() + 1)) {
      const key = new Date(d).toISOString().split("T")[0];
      salesByDay[key] = 0;
    }
    
    // Aggregate orders
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= currentMonthStart) {
        const isoDate = orderDate.toISOString().split("T")[0];
        if (isoDate in salesByDay) {
          salesByDay[isoDate] += order.total || 0;
        }
      }
    });
    
    // Sort by ISO date FIRST, then format
    return Object.entries(salesByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([isoDate, total]) => ({
        date: new Date(isoDate).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        }),
        total,
      }));
  };

  const metrics = calculateMetrics();
  const chartData = buildChartData();

  const stats = [
    {
      label: "Total Sales",
      value: `$${metrics.currentSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      growth: metrics.salesGrowth,
      showGrowth: true,
    },
    {
      label: "Orders",
      value: metrics.currentOrderCount.toString(),
      growth: metrics.ordersGrowth,
      showGrowth: true,
      subtext: `${metrics.totalOrders} total`,
    },
    {
      label: "Revenue",
      value: `$${metrics.currentRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      growth: metrics.revenueGrowth,
      showGrowth: true,
    },
    {
      label: "Customers",
      value: metrics.totalCustomers.toString(),
      showGrowth: false,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <div className="min-h-screen bg-[#111422] font-sans p-6">
              <div className="mb-8">
                <h1 className="text-white text-3xl font-bold mb-2">Analytics</h1>
                <p className="text-[#939bc8] text-sm">
                  Comparing current month vs. previous month
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mb-8">
                {loading ? (
                  <div className="text-center text-[#939bc8] py-12 w-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bda65]"></div>
                      <span>Loading analytics...</span>
                    </div>
                  </div>
                ) : (
                  stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#343b65] bg-[#1a1e32] hover:bg-[#1f2439] transition-colors"
                    >
                      <p className="text-[#939bc8] text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className="text-white text-3xl font-bold">
                        {stat.value}
                      </p>
                      {stat.showGrowth && stat.growth !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-semibold ${stat.growth >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {stat.growth >= 0 ? "↑" : "↓"} {Math.abs(stat.growth).toFixed(1)}%
                          </span>
                          <span className="text-xs text-[#939bc8]">vs last month</span>
                        </div>
                      )}
                      {stat.subtext && (
                        <span className="text-xs text-[#939bc8]">{stat.subtext}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="rounded-xl border border-[#343b65] bg-[#1a1e32] p-6">
                <h2 className="text-white text-lg font-semibold mb-6">
                  Sales Trend (This Month)
                </h2>
                <div className="flex min-h-[180px] items-center justify-center w-full">
                  {loading ? (
                    <div className="text-center text-[#939bc8] py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bda65]"></div>
                        <span>Loading chart...</span>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="#343b65" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          stroke="#939bc8"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis
                          stroke="#939bc8"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1e32",
                            border: "1px solid #343b65",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#939bc8" }}
                          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Sales"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#0bda65"
                          strokeWidth={3}
                          dot={{ fill: "#0bda65", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
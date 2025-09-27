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
import { getAnalyticsStats } from "../utils/analytics";
import type { Order, Customer } from "../utils/analytics";
import { useNavigate } from "react-router-dom";

const Analytics: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
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

  const { totalSales, revenue, orderCount, customerCount } = getAnalyticsStats(
    orders,
    customers
  );

  // --- Calculate analytics directly here ---
  // Group orders by day
  const salesStatsByDay: Record<string, { sales: number; orders: number; revenue: number }> = {};
  orders.forEach(order => {
    const isoDate = new Date(order.createdAt).toISOString().split('T')[0];
    if (!salesStatsByDay[isoDate]) salesStatsByDay[isoDate] = { sales: 0, orders: 0, revenue: 0 };
    salesStatsByDay[isoDate].sales += order.total || 0;
    salesStatsByDay[isoDate].orders += 1;
    salesStatsByDay[isoDate].revenue += (order.total || 0) - (order.cost || 0);
  });

  const sortedDays = Object.entries(salesStatsByDay).sort((a, b) => b[1].sales - a[1].sales);

  let highestSalesDate: string | null = null;
  let secondHighestSalesDate: string | null = null;
  let highestStats = { sales: 0, revenue: 0, orders: 0 };
  let secondStats = { sales: 0, revenue: 0, orders: 0 };

  if (sortedDays.length > 0) {
    highestSalesDate = sortedDays[0][0];
    highestStats = sortedDays[0][1];
  }
  if (sortedDays.length > 1) {
    secondHighestSalesDate = sortedDays[1][0];
    secondStats = sortedDays[1][1];
  }

  const salesIncrease = highestStats.sales - secondStats.sales;
  const revenueIncrease = highestStats.revenue - secondStats.revenue;

  // Orders created since the second highest sales date (exclusive)
  let ordersAfter = 0;
  if (secondHighestSalesDate) {
    const secondDateTime = new Date(secondHighestSalesDate + 'T23:59:59.999Z').getTime();
    ordersAfter = orders.filter(order =>
      new Date(order.createdAt).getTime() > secondDateTime
    ).length;
  }

  const ordersIncreasePercent = orderCount > 0 ? (ordersAfter / orderCount) * 100 : 0;
  const salesIncreasePercent = secondStats.sales
    ? (salesIncrease / secondStats.sales) * 100
    : 0;
  const revenueIncreasePercent = secondStats.revenue
    ? (revenueIncrease / secondStats.revenue) * 100
    : 0;

  const salesByDay: { [date: string]: number } = {};
  orders.forEach((order) => {
    const isoDate = new Date(order.createdAt).toISOString().split("T")[0];
    salesByDay[isoDate] = (salesByDay[isoDate] || 0) + (order.total || 0);
  });

  const chartSalesByDay: { [date: string]: number } = {};
  Object.entries(salesByDay).forEach(([isoDate, total]) => {
    const localDate = new Date(isoDate).toLocaleDateString();
    chartSalesByDay[localDate] = total;
  });

  const startDate = new Date(2024, 5, 1);
  const startDateStr = startDate.toLocaleDateString();
  if (!chartSalesByDay[startDateStr]) {
    chartSalesByDay[startDateStr] = 0;
  }

  const salesTrendData = Object.entries(chartSalesByDay)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const stats = [
    {
      label: "Total Sales",
      value: `$${totalSales.toLocaleString()}`,
      extra:
        !loading && secondHighestSalesDate ? (
          <div className="flex flex-col items-start">
            <span className="text-green-400 text-base font-semibold mt-1">
              +${salesIncrease.toLocaleString()} ({salesIncreasePercent.toFixed(1)}%)
            </span>
          </div>
        ) : null,
    },
    {
      label: "Orders",
      value: orderCount.toString(),
      extra:
        !loading && highestSalesDate ? (
          <div className="flex flex-col items-start">
            <span className="text-green-400 text-base font-semibold mt-1">
              +{ordersAfter} ({ordersIncreasePercent.toFixed(1)}%)
            </span>
            <span className="text-xs text-[#aaa] mt-1">
              Highest: {highestSalesDate}
            </span>
          </div>
        ) : null,
    },
    {
      label: "Revenue",
      value: `$${revenue.toLocaleString()}`,
      extra:
        !loading && secondHighestSalesDate ? (
          <div className="flex flex-col items-start">
            <span className="text-green-400 text-base font-semibold mt-1">
              +${revenueIncrease.toLocaleString()} ({revenueIncreasePercent.toFixed(1)}%)
            </span>
          </div>
        ) : null,
    },
    {
      label: "Customers",
      value: customerCount.toString(),
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
          <Sidebar />
          <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
            <h1 className="text-white text-3xl font-bold mb-6">Analytics</h1>
            <div className="flex flex-wrap gap-4 mb-8">
              {loading ? (
                <div className="text-white">Loading...</div>
              ) : (
                stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#343b65] "
                  >
                    <p className="text-slate-300 md:text-base text-base font-medium leading-normal">
                      {stat.label}
                    </p>
                    <p className="text-white text-2xl font-bold flex items-center">
                      {stat.value}
                    </p>
                    {stat.extra}
                  </div>
                ))
              )}
            </div>
            <div className="rounded-xl border border-[#343b65] bg-[#111422] p-6">
              <p className="text-white text-base font-medium mb-4">
                Sales Trend
              </p>
              <div className="flex min-h-[180px] items-center justify-center w-full">
                {loading ? (
                  <div className="text-white">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={salesTrendData}>
                      <CartesianGrid stroke="#343b65" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e2235",
                          border: "none",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#0bda65"
                        strokeWidth={3}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

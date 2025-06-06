import React from "react";
import Sidebar from "../components/Sidebar";

const orders = [
  { id: "1234", customer: "John Doe", date: "Sep 1", status: "Unfulfilled", payment: "Paid", total: "$123.45" },
  { id: "5678", customer: "Jane Smith", date: "Sep 2", status: "Fulfilled", payment: "Paid", total: "$234.56" },
  { id: "9012", customer: "Alice Lee", date: "Sep 3", status: "Unfulfilled", payment: "Refunded", total: "$345.67" },
  { id: "3456", customer: "Bob Brown", date: "Sep 4", status: "Fulfilled", payment: "Unpaid", total: "$456.78" },
  { id: "7890", customer: "Charlie Black", date: "Sep 5", status: "Unfulfilled", payment: "Partially paid", total: "$567.89" },
];

const Orders: React.FC = () => (
  <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
    <div className="layout-container flex h-full grow flex-col">
      <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
        <Sidebar />
        <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
          <div className="min-h-screen bg-[#111422] font-sans p-6">
            <h1 className="text-white text-3xl font-bold mb-6">Orders</h1>
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
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-[#343b65]">
                      <td className="px-4 py-2 text-white">{order.id}</td>
                      <td className="px-4 py-2 text-[#939bc8]">{order.customer}</td>
                      <td className="px-4 py-2 text-[#939bc8]">{order.date}</td>
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
                      <td className="px-4 py-2 text-[#939bc8]">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);

export default Orders;

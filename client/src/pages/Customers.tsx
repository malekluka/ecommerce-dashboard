import React from "react";
import Sidebar from "../components/Sidebar";

const customers = [
  { id: "C-001", name: "John Doe", email: "john@example.com", orders: 5, spent: "$500.00" },
  { id: "C-002", name: "Jane Smith", email: "jane@example.com", orders: 3, spent: "$320.00" },
  { id: "C-003", name: "Alice Lee", email: "alice@example.com", orders: 7, spent: "$780.00" },
  { id: "C-004", name: "Bob Brown", email: "bob@example.com", orders: 2, spent: "$120.00" },
  { id: "C-005", name: "Charlie Black", email: "charlie@example.com", orders: 4, spent: "$410.00" },
];

const Customers: React.FC = () => (
  <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
    <div className="layout-container flex h-full grow flex-col">
      <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
        <Sidebar />
        <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
          <div className="min-h-screen bg-[#111422] font-sans p-6">
            <h1 className="text-white text-3xl font-bold mb-6">Customers</h1>
            <div className="overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
              <table className="min-w-[700px] w-full">
                <thead>
                  <tr className="bg-[#1a1e32]">
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Customer ID</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Orders</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-[#343b65]">
                      <td className="px-4 py-2 text-white">{customer.id}</td>
                      <td className="px-4 py-2 text-[#939bc8]">{customer.name}</td>
                      <td className="px-4 py-2 text-[#939bc8]">{customer.email}</td>
                      <td className="px-4 py-2 text-white">{customer.orders}</td>
                      <td className="px-4 py-2 text-[#0bda65]">{customer.spent}</td>
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

export default Customers;

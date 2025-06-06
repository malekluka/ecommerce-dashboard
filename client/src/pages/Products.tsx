import React from "react";
import Sidebar from "../components/Sidebar";

const products = [
  { id: "P-1001", name: "Wireless Mouse", stock: 120, price: "$25.00", sales: 340 },
  { id: "P-1002", name: "Bluetooth Headphones", stock: 80, price: "$59.99", sales: 210 },
  { id: "P-1003", name: "USB-C Charger", stock: 200, price: "$19.99", sales: 400 },
  { id: "P-1004", name: "Laptop Stand", stock: 60, price: "$39.99", sales: 150 },
  { id: "P-1005", name: "Webcam", stock: 45, price: "$49.99", sales: 95 },
];

const Products: React.FC = () => (
  <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
    <div className="layout-container flex h-full grow flex-col">
      <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
        <Sidebar />
        <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
          <div className="min-h-screen bg-[#111422] font-sans p-6">
            <h1 className="text-white text-3xl font-bold mb-6">Products</h1>
            <div className="overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
              <table className="min-w-[700px] w-full">
                <thead>
                  <tr className="bg-[#1a1e32]">
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Product ID</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Stock</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Price</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-[#343b65]">
                      <td className="px-4 py-2 text-white">{product.id}</td>
                      <td className="px-4 py-2 text-[#939bc8]">{product.name}</td>
                      <td className="px-4 py-2 text-white">{product.stock}</td>
                      <td className="px-4 py-2 text-[#0bda65]">{product.price}</td>
                      <td className="px-4 py-2 text-white">{product.sales}</td>
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

export default Products;

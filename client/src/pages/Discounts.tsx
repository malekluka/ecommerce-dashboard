import React from "react";
import Sidebar from "../components/Sidebar";

const discounts = [
  { code: "SUMMER10", type: "Percentage", value: "10%", usage: 120, active: true },
  { code: "WELCOME5", type: "Fixed", value: "$5", usage: 80, active: true },
  { code: "FREESHIP", type: "Free Shipping", value: "-", usage: 45, active: false },
  { code: "VIP20", type: "Percentage", value: "20%", usage: 30, active: true },
  { code: "BLACKFRIDAY", type: "Percentage", value: "50%", usage: 10, active: false },
];

const Discounts: React.FC = () => (
  <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
    <div className="layout-container flex h-full grow flex-col">
      <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
        <Sidebar />
        <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
          <div className="min-h-screen bg-[#111422] font-sans p-6">
            <h1 className="text-white text-3xl font-bold mb-6">Discounts</h1>
            <div className="overflow-x-auto rounded-xl border border-[#343b65] bg-[#111422]">
              <table className="min-w-[700px] w-full">
                <thead>
                  <tr className="bg-[#1a1e32]">
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Code</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Value</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Usage</th>
                    <th className="px-4 py-3 text-left text-white text-base font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.code} className="border-t border-[#343b65]">
                      <td className="px-4 py-2 text-white">{discount.code}</td>
                      <td className="px-4 py-2 text-[#939bc8]">{discount.type}</td>
                      <td className="px-4 py-2 text-[#0bda65]">{discount.value}</td>
                      <td className="px-4 py-2 text-white">{discount.usage}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block rounded-xl px-3 py-1 text-sm font-medium ${discount.active ? "bg-[#0bda65] text-white" : "bg-[#242a47] text-[#939bc8]"}`}>
                          {discount.active ? "Active" : "Inactive"}
                        </span>
                      </td>
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

export default Discounts;

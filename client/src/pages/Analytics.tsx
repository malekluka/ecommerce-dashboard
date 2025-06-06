import React from "react";
import Sidebar from "../components/Sidebar";

const stats = [
  { label: "Total Sales", value: "$12,345", change: "+10%" },
  { label: "Orders", value: "123", change: "+8%" },
  { label: "Revenue", value: "$11,111", change: "+7%" },
  { label: "Customers", value: "234", change: "+5%" },
];

const Analytics: React.FC = () => (
  <div className="relative flex min-h-screen flex-col bg-[#111422] font-sans">
    <div className="layout-container flex h-full grow flex-col">
      <div className="flex flex-1 justify-center py-5 gap-1 px-2 md:px-6">
        <Sidebar />
        <main className="layout-content-container flex flex-col flex-1 min-w-0 max-w-full">
          <h1 className="text-white text-3xl font-bold mb-6">Analytics</h1>
          <div className="flex flex-wrap gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#343b65]">
                <p className="text-white text-base font-medium">{stat.label}</p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
                <p className="text-[#0bda65] text-base font-medium">{stat.change}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[#343b65] bg-[#111422] p-6">
            <p className="text-white text-base font-medium mb-4">Sales Trend (Fake Data)</p>
            <div className="flex min-h-[180px] items-center justify-center">
              {/* Placeholder for chart */}
              <svg width="100%" height="120" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0 100 Q 50 80 100 90 Q 150 110 200 60 Q 250 20 300 40 Q 350 80 400 30" stroke="#0bda65" strokeWidth="4" fill="none"/>
                <circle cx="0" cy="100" r="4" fill="#0bda65"/>
                <circle cx="100" cy="90" r="4" fill="#0bda65"/>
                <circle cx="200" cy="60" r="4" fill="#0bda65"/>
                <circle cx="300" cy="40" r="4" fill="#0bda65"/>
                <circle cx="400" cy="30" r="4" fill="#0bda65"/>
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);

export default Analytics;

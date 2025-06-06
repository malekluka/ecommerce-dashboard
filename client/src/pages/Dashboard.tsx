import React from "react";
import Sidebar from "../components/Sidebar";

const Dashboard: React.FC = () => (
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
              <p className="text-white tracking-light text-2xl md:text-[32px] font-bold leading-tight">
                Hi, Acme Co.!
              </p>
              <p className="text-[#939bc8] text-xs md:text-sm font-normal leading-normal">
                Here's what's happening with your shop today
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 p-2 md:p-4">
            {/* Dashboard cards */}
            <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
              <p className="text-white text-sm md:text-base font-medium leading-normal">
                Total Sales
              </p>
              <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                $12,345
              </p>
              <p className="text-[#0bda65] text-sm md:text-base font-medium leading-normal">
                +10%
              </p>
            </div>
            <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
              <p className="text-white text-sm md:text-base font-medium leading-normal">
                Orders
              </p>
              <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                123
              </p>
              <p className="text-[#0bda65] text-sm md:text-base font-medium leading-normal">
                +10%
              </p>
            </div>
            <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
              <p className="text-white text-sm md:text-base font-medium leading-normal">
                Revenue
              </p>
              <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                $11,111
              </p>
              <p className="text-[#0bda65] text-sm md:text-base font-medium leading-normal">
                +10%
              </p>
            </div>
            <div className="flex min-w-[140px] md:min-w-[158px] flex-1 flex-col gap-1 md:gap-2 rounded-xl p-4 md:p-6 border border-[#343b65]">
              <p className="text-white text-sm md:text-base font-medium leading-normal">
                Customers
              </p>
              <p className="text-white tracking-light text-xl md:text-2xl font-bold leading-tight">
                234
              </p>
              <p className="text-[#0bda65] text-sm md:text-base font-medium leading-normal">
                +10%
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 px-2 md:px-4 py-4 md:py-6">
            <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-2 rounded-xl border border-[#343b65] p-4 md:p-6">
              <p className="text-white text-sm md:text-base font-medium leading-normal">
                Sales in the last 30 days
              </p>
              <div className="flex min-h-[120px] md:min-h-[180px] flex-1 flex-col gap-4 md:gap-8 py-2 md:py-4">
                {/* ...existing SVG chart... */}
                <svg
                  width="100%"
                  height="148"
                  viewBox="-3 0 478 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                    fill="url(#paint0_linear_1131_5935)"
                  ></path>
                  <path
                    d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                    stroke="#939bc8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  ></path>
                  <defs>
                    <linearGradient
                      id="paint0_linear_1131_5935"
                      x1="236"
                      y1="1"
                      x2="236"
                      y2="149"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#242a47"></stop>
                      <stop offset="1" stopColor="#242a47" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-around">
                  <p className="text-[#939bc8] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    Mon, Jul 1
                  </p>
                  <p className="text-[#939bc8] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    Fri, Aug 1
                  </p>
                  <p className="text-[#939bc8] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    Wed, Sep 1
                  </p>
                  <p className="text-[#939bc8] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    Mon, Oct 1
                  </p>
                </div>
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
                  {/* ...existing table rows... */}
                  <tr className="border-t border-t-[#343b65]">
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120 h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
                      Order #1234
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      Sep 1
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Unfulfilled</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Paid</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      $123.45
                    </td>
                  </tr>
                  {/* ...other rows unchanged... */}
                  <tr className="border-t border-t-[#343b65]">
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120 h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
                      Order #5678
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      Sep 2
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Fulfilled</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Paid</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      $234.56
                    </td>
                  </tr>
                  <tr className="border-t border-t-[#343b65]">
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120 h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
                      Order #9012
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      Sep 3
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Unfulfilled</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Refunded</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      $345.67
                    </td>
                  </tr>
                  <tr className="border-t border-t-[#343b65]">
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120 h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
                      Order #3456
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      Sep 4
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Fulfilled</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Unpaid</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      $456.78
                    </td>
                  </tr>
                  <tr className="border-t border-t-[#343b65]">
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-120 h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
                      Order #7890
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      Sep 5
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-360 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Unfulfilled</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#242a47] text-white text-sm font-medium leading-normal w-full">
                        <span className="truncate">Partially paid</span>
                      </button>
                    </td>
                    <td className="table-bf1de0b8-7603-4c65-9746-4b9c74e6cddd-column-600 h-[72px] px-4 py-2 w-[400px] text-[#939bc8] text-sm font-normal leading-normal">
                      $567.89
                    </td>
                  </tr>
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

export default Dashboard;

import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";

const RevenueManagement = () => {
  const transactions = [
    {
      id: "57783333",
      status: "Success",
      amount: "₹1.00",
      charger: "mvzg yu",
      hub: "--",
      tariff: "test1",
      usage: "0.00 kWh",
      owner: "Host",
      hostDetails: "SHUBHAJIT...",
      driverDetails: "Nikshith trans",
      timestamp: "09/05/2024 04:07 PM",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* HEADER */}
        {/* PAGE HEADER */}
<div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    {/* LEFT */}
    <div>
      <h1 className="text-2xl font-semibold text-white">
        Revenue Management
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        Track transactions, earnings and settlements
      </p>

    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-3">
      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm">
        Export
      </button>

      <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium shadow">
        May 2024
      </button>
    </div>

  </div>
</div>


        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">₹1.10</p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-sm text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold text-white">
              {transactions.length}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-sm text-gray-400">Settlement Status</p>
            <p className="text-2xl font-bold text-green-400">Completed</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <input
            placeholder="Search by transaction, charger, driver..."
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm w-full md:w-96 focus:ring-2 focus:ring-blue-500"
          />

          <select className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm">
            <option>All</option>
            <option>Success</option>
            <option>Failed</option>
          </select>

          <select className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm">
            <option>All Hubs</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-xs uppercase text-gray-400">
                {[
                  "Transaction ID",
                  "Status",
                  "Amount",
                  "Charger",
                  "Hub",
                  "Tariff",
                  "Usage",
                  "Owner",
                  "Host",
                  "Driver",
                  "Timestamp",
                ].map((h) => (
                  <th key={h} className="px-4 py-4 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3">{t.id}</td>

                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {t.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-white">
                    {t.amount}
                  </td>

                  <td className="px-4 py-3">{t.charger}</td>
                  <td className="px-4 py-3">{t.hub}</td>
                  <td className="px-4 py-3">{t.tariff}</td>
                  <td className="px-4 py-3">{t.usage}</td>
                  <td className="px-4 py-3">{t.owner}</td>
                  <td className="px-4 py-3">{t.hostDetails}</td>
                  <td className="px-4 py-3">{t.driverDetails}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {t.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;

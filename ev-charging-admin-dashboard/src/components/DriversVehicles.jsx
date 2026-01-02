// src/DriversVehicles.js

import React, { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import {
  Users,
  Car,
  RefreshCcw,
  Plus,
  Search,
  Settings,
} from "lucide-react";

const DriversVehicles = () => {
  const [activeTab, setActiveTab] = useState("drivers");

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* HEADER */}
        {/* PAGE HEADER */}
<div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    {/* LEFT: Title + Summary */}
    <div>
      <h1 className="text-2xl font-semibold text-white">
        Drivers & Vehicles
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        Manage your drivers, vehicles and assignments seamlessly
      </p>

      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
        <span>
          Total Drivers <strong className="text-white">0</strong>
        </span>
        <span className="w-1 h-1 bg-gray-500 rounded-full" />
        <span>
          Total Vehicles <strong className="text-white">0</strong>
        </span>
      </div>
    </div>

    {/* RIGHT: Actions */}
    <div className="flex items-center gap-3">
      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm">
        Export
      </button>

      <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium shadow">
        This Month
      </button>
    </div>

  </div>
</div>

        {/* TABS */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("drivers")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl border transition
              ${
                activeTab === "drivers"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
          >
            <Users size={18} />
            Drivers
          </button>

          <button
            onClick={() => setActiveTab("vehicles")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl border transition
              ${
                activeTab === "vehicles"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
          >
            <Car size={18} />
            Vehicles
          </button>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder={`Search ${activeTab}`}
                className="bg-[#111827] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              <RefreshCcw size={16} />
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              <Settings size={16} />
              Columns
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              This Month
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition shadow">
              <Plus size={16} />
              Add {activeTab === "drivers" ? "Driver" : "Vehicle"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            {activeTab === "drivers" ? (
              <Users className="text-blue-400" />
            ) : (
              <Car className="text-blue-400" />
            )}
          </div>

          <h3 className="text-lg font-semibold text-white mb-1">
            No {activeTab === "drivers" ? "Drivers" : "Vehicles"} Found
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Start by adding your first{" "}
            {activeTab === "drivers" ? "driver" : "vehicle"} to the system.
          </p>

          <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition">
            <Plus size={16} />
            Add {activeTab === "drivers" ? "Driver" : "Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriversVehicles;

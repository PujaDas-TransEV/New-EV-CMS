// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowLeft,
  FaTachometerAlt,
  FaBatteryFull,
  FaWallet,
  FaCar,
  FaBell,
  FaHeadset,
} from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", icon: FaTachometerAlt, path: "/dashboard" },
  { name: "Chargers / Sessions", icon: FaBatteryFull, path: "/charger-session" },
  { name: "Revenue Management", icon: FaWallet, path: "/revenue" },
  { name: "Drivers / Vehicles", icon: FaCar, path: "/vd-management" },
  { name: "Alerts", icon: FaBell, path: "/alerts" },
  { name: "Support", icon: FaHeadset, path: "/support" },
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  return (
    <div
      className={`h-screen sticky top-0 z-40 flex flex-col justify-between
      bg-gray-900 text-gray-200 border-r border-gray-800
      transition-all duration-300 ease-in-out
      ${isExpanded ? "w-64" : "w-20"}
      `}
    >
      {/* LOGO / BRAND */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {isExpanded && (
          <h1 className="text-lg font-bold tracking-wide text-white">
            ⚡ TransEV
          </h1>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
        >
          {isExpanded ? (
            <FaArrowLeft className="text-white" size={16} />
          ) : (
            <FaArrowRight className="text-white" size={16} />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="mt-4 flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                group relative flex items-center gap-4 px-4 py-3 rounded-xl
                transition-colors duration-200
                ${isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "hover:bg-gray-800 hover:text-white text-gray-300"
                }
              `}
            >
              {/* ACTIVE INDICATOR */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-500"></span>
              )}

              <Icon size={18} className="flex-shrink-0" />

              {/* ITEM TEXT */}
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}

              {/* TOOLTIP WHEN COLLAPSED */}
              {!isExpanded && (
                <span className="absolute left-20 top-1/2 -translate-y-1/2
                bg-gray-800 text-xs text-white px-3 py-1 rounded-lg opacity-0
                group-hover:opacity-100 transition-all shadow-lg whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-3 pb-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center text-xs text-gray-400">
          {isExpanded ? "EV Admin Panel v1.0" : "v1.0"}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

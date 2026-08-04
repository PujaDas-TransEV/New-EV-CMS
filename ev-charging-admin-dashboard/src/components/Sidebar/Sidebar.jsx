// // src/components/Sidebar.jsx
// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   FaArrowRight,
//   FaArrowLeft,
//   FaTachometerAlt,
//   FaBatteryFull,
//   FaWallet,
//   FaCar,
//   FaBell,
//   FaHeadset,
//   FaReceipt,  
// } from "react-icons/fa";

// const menuItems = [
//   { name: "Dashboard", icon: FaTachometerAlt, path: "/dashboard" },
//   { name: "Chargers / Sessions", icon: FaBatteryFull, path: "/charger-session" },
//   { name: "Revenue Management", icon: FaWallet, path: "/revenue" },
//   { name: "Bill Management", icon: FaReceipt, path: "/bills" },      
//   { name: "Drivers / Vehicles", icon: FaCar, path: "/vd-management" },
//   { name: "Alerts", icon: FaBell, path: "/alerts" },
//   { name: "Support", icon: FaHeadset, path: "/support" },
// ];

// const Sidebar = () => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const location = useLocation();

//   return (
//     <div
//       className={`h-screen sticky top-0 z-40 flex flex-col justify-between
//       bg-gray-900 text-gray-200 border-r border-gray-800
//       transition-all duration-300 ease-in-out
//       ${isExpanded ? "w-64" : "w-20"}
//       `}
//     >
//       {/* LOGO / BRAND */}
//       <div className="flex items-center justify-between p-4 border-b border-gray-800">
//         {isExpanded && (
//           <h1 className="text-lg font-bold tracking-wide text-white">
//             ⚡ TransEV
//           </h1>
//         )}

//         <button
//           onClick={() => setIsExpanded(!isExpanded)}
//           className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
//         >
//           {isExpanded ? (
//             <FaArrowLeft className="text-white" size={16} />
//           ) : (
//             <FaArrowRight className="text-white" size={16} />
//           )}
//         </button>
//       </div>

//       {/* NAVIGATION */}
//       <nav className="mt-4 flex-1 px-2 space-y-1">
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = location.pathname === item.path;

//           return (
//             <Link
//               key={item.name}
//               to={item.path}
//               className={`
//                 group relative flex items-center gap-4 px-4 py-3 rounded-xl
//                 transition-colors duration-200
//                 ${isActive
//                   ? "bg-blue-600/20 text-blue-400"
//                   : "hover:bg-gray-800 hover:text-white text-gray-300"
//                 }
//               `}
//             >
//               {/* ACTIVE INDICATOR */}
//               {isActive && (
//                 <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-500"></span>
//               )}

//               <Icon size={18} className="flex-shrink-0" />

//               {/* ITEM TEXT */}
//               {isExpanded && (
//                 <span className="text-sm font-medium whitespace-nowrap">
//                   {item.name}
//                 </span>
//               )}

//               {/* TOOLTIP WHEN COLLAPSED */}
//               {!isExpanded && (
//                 <span className="absolute left-20 top-1/2 -translate-y-1/2
//                 bg-gray-800 text-xs text-white px-3 py-1 rounded-lg opacity-0
//                 group-hover:opacity-100 transition-all shadow-lg whitespace-nowrap">
//                   {item.name}
//                 </span>
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* FOOTER */}
//       <div className="px-3 pb-4">
//         <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center text-xs text-gray-400">
//           {isExpanded ? "EV Admin Panel v1.0" : "v1.0"}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   FaArrowRight,
//   FaArrowLeft,
//   FaTachometerAlt,
//   FaChargingStation,
//   FaDollarSign,
//   FaUsers,
//   FaBalanceScale,
//   FaTools,
//   FaBell,
//   FaChartBar,
//   FaMobileAlt,
//   FaEllipsisH,
//   FaUserCircle,
//   FaSignOutAlt,
//   FaSun,
//   FaMoon,
//   FaHome,
//   FaHeadset,
//   FaQuestionCircle,
//   FaLifeRing,
//   FaWallet
// } from "react-icons/fa";
// import { MdElectricBolt } from "react-icons/md";

// const Sidebar = ({ isDarkMode = false, onThemeToggle }) => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const location = useLocation();

//   // Menu items exactly as shown in the image
//   const menuItems = [
//     { name: "Dashboard", icon: FaHome, path: "/dashboard" },
//     { name: "Chargers & Sessions", icon: FaChargingStation, path: "/chargers" },
//      { name: "Revenue Management", icon: FaWallet, path: "/revenue" },
//     { name: "Drivers & Vehicles", icon: FaUsers, path: "/drivers" },
//     { name: "Load Balancing", icon: FaBalanceScale, path: "/load-balancing" },
//     { name: "Operations & Maintenance", icon: FaTools, path: "/operations" },
//     { name: "Alerts", icon: FaBell, path: "/alerts" },
//     { name: "Reports & Analytics", icon: FaChartBar, path: "/reports" },
//     { name: "App Management", icon: FaMobileAlt, path: "/app-management" },
//     { name: "Help & Support", icon: FaHeadset, path: "/help-support" },
   
//   ];

//   const isDark = isDarkMode;

//   const sidebarClasses = `
//     h-screen sticky top-0 z-40 flex flex-col
//     transition-all duration-300 ease-in-out
//     bg-gradient-to-b from-green-800 via-green-700 to-green-900
//     text-white
//     ${isExpanded ? "w-64" : "w-20"}
//     shadow-2xl shadow-green-900/50
//     border-r border-green-600/30
//   `;

//   return (
//     <div className={sidebarClasses}>
//       {/* Custom scrollbar styles */}
//       <style>
//         {`
//           .sidebar-scroll::-webkit-scrollbar {
//             width: 4px;
//           }
//           .sidebar-scroll::-webkit-scrollbar-track {
//             background: #065f46;
//           }
//           .sidebar-scroll::-webkit-scrollbar-thumb {
//             background: #34d399;
//             border-radius: 20px;
//           }
//           .sidebar-scroll::-webkit-scrollbar-thumb:hover {
//             background: #6ee7b7;
//           }
//         `}
//       </style>

//       {/* LOGO / BRAND */}
//       <div className={`flex items-center justify-between p-4 border-b border-green-600/30`}>
//         <div className="flex items-center gap-3 overflow-hidden">
//           <div className="relative flex-shrink-0">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
//               <MdElectricBolt className="text-green-900 text-2xl" />
//             </div>
//             {isExpanded && (
//               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-green-800 animate-pulse" />
//             )}
//           </div>
//           {isExpanded && (
//             <div className="flex flex-col">
//               <h1 className="text-2xl font-bold tracking-tight text-white">
//                 TransEV
//               </h1>
//               <span className="text-[10px] uppercase tracking-wider text-green-300/80">
//                 EV Management Platform
//               </span>
//             </div>
//           )}
//         </div>

//         <button
//           onClick={() => setIsExpanded(!isExpanded)}
//           className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/10 text-white`}
//         >
//           {isExpanded ? <FaArrowLeft size={14} /> : <FaArrowRight size={14} />}
//         </button>
//       </div>

//       {/* NAVIGATION */}
//       <nav className="mt-4 flex-1 px-3 overflow-y-auto max-h-[calc(100vh-220px)] sidebar-scroll">
//         <div className="space-y-1">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.path;

//             return (
//               <Link
//                 key={item.name}
//                 to={item.path}
//                 className={`
//                   group relative flex items-center gap-4 px-4 py-3 rounded-xl
//                   transition-all duration-200 ease-in-out
//                   ${isActive
//                     ? "bg-white/20 text-white border border-white/20 shadow-lg shadow-green-900/30"
//                     : "text-white/90 hover:bg-white/10 hover:text-white"
//                   }
//                   ${!isExpanded && "justify-center px-2"}
//                   hover:translate-x-1
//                 `}
//               >
//                 {isActive && (
//                   <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-r-full shadow-lg shadow-yellow-400/50" />
//                 )}

//                 <div
//                   className={`
//                     relative flex-shrink-0 transition-transform duration-200
//                     group-hover:scale-110
//                     ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}
//                   `}
//                 >
//                   <Icon size={20} />
//                 </div>

//                 {isExpanded && (
//                   <span className={`text-sm font-medium whitespace-nowrap ${
//                     isActive ? "text-white" : "text-white/90 group-hover:text-white"
//                   }`}>
//                     {item.name}
//                   </span>
//                 )}

//                 {/* TOOLTIP WHEN COLLAPSED */}
//                 {!isExpanded && (
//                   <span className={`
//                     absolute left-20 top-1/2 -translate-y-1/2
//                     px-3 py-1.5 rounded-lg text-xs font-medium
//                     bg-green-800 text-white border border-green-600/50
//                     shadow-xl whitespace-nowrap pointer-events-none
//                     transition-all duration-200 delay-100
//                     opacity-0 group-hover:opacity-100
//                   `}>
//                     {item.name}
//                   </span>
//                 )}
//               </Link>
//             );
//           })}
//         </div>
//       </nav>

//       {/* FOOTER */}
//       <div className="flex-shrink-0 px-3 pb-4 space-y-3">
//         <div className="border-t border-green-600/30" />

//         {/* User Profile */}
//         <div
//           className={`
//             flex items-center gap-3 p-2.5 rounded-xl
//             transition-all duration-300
//             hover:bg-white/10
//             ${!isExpanded && "justify-center"}
//           `}
//         >
//           <div className="relative flex-shrink-0">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
//               <FaUserCircle className="text-green-900 text-xl" />
//             </div>
//             <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-green-800" />
//           </div>

//           {isExpanded && (
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold truncate text-white">
//                 Admin User
//               </p>
//               <div className="flex items-center gap-1.5 mt-0.5">
//                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
//                 <span className="text-[10px] text-green-300/80 truncate">
//                   admin@transev.com
//                 </span>
//               </div>
//             </div>
//           )}

//           {isExpanded && (
//             <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors">
//               <FaSignOutAlt size={14} />
//             </button>
//           )}
//         </div>

//         {/* Bottom Controls */}
//         <div
//           className={`
//             flex items-center gap-2
//             ${isExpanded ? "justify-between" : "justify-center"}
//             px-2
//           `}
//         >
//           {isExpanded && (
//             <span className="text-[10px] text-green-300/60">v2.0.1</span>
//           )}

//           <button
//             onClick={onThemeToggle}
//             className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/10 text-white/80 hover:text-white ${
//               !isExpanded && "mx-auto"
//             }`}
//           >
//             {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
//           </button>

//           {isExpanded && (
//             <div className="flex items-center gap-1.5">
//               <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
//               <span className="text-[10px] text-green-300/60">Online</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowLeft,
  FaTachometerAlt,
  FaChargingStation,
  FaDollarSign,
  FaUsers,
  FaBalanceScale,
  FaTools,
  FaBell,
  FaChartBar,
  FaMobileAlt,
  FaEllipsisH,
  FaUserCircle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaHome,
  FaHeadset,
  FaQuestionCircle,
  FaLifeRing,
  FaWallet
} from "react-icons/fa";
import { MdElectricBolt } from "react-icons/md";

const Sidebar = ({ isDarkMode = false, onThemeToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  // Menu items
  const menuItems = [
    { name: "Dashboard", icon: FaHome, path: "/dashboard" },
    { name: "Chargers & Sessions", icon: FaChargingStation, path: "/charger-session" },
    { name: "Revenue Management", icon: FaWallet, path: "/revenue" },
    { name: "Drivers & Vehicles", icon: FaUsers, path: "/drivers" },
    { name: "Load Balancing", icon: FaBalanceScale, path: "/load-balancing" },
    { name: "Operations & Maintenance", icon: FaTools, path: "/operations" },
    { name: "Alerts", icon: FaBell, path: "/alerts" },
    { name: "Reports & Analytics", icon: FaChartBar, path: "/reports" },
    { name: "App Management", icon: FaMobileAlt, path: "/app-management" },
    { name: "Help & Support", icon: FaHeadset, path: "/help-support" },
  ];

  const isDark = isDarkMode;

  const sidebarClasses = `
    h-screen sticky top-0 z-40 flex flex-col
    transition-all duration-300 ease-in-out
    bg-gradient-to-b from-green-800 via-green-700 to-green-900
    text-white
    ${isExpanded ? "w-64" : "w-20"}
    shadow-2xl shadow-green-900/50
    border-r border-green-600/30
    flex-shrink-0
  `;

  return (
    <div className={sidebarClasses}>
      {/* Custom scrollbar styles */}
      <style>
        {`
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: #065f46;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #34d399;
            border-radius: 20px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #6ee7b7;
          }
        `}
      </style>

      {/* LOGO / BRAND */}
      <div className={`flex items-center justify-between p-4 border-b border-green-600/30 flex-shrink-0`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <MdElectricBolt className="text-green-900 text-2xl" />
            </div>
            {isExpanded && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-green-800 animate-pulse" />
            )}
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                TransEV
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-green-300/80">
                EV Management Platform
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/10 text-white flex-shrink-0`}
        >
          {isExpanded ? <FaArrowLeft size={14} /> : <FaArrowRight size={14} />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="mt-4 flex-1 px-3 overflow-y-auto max-h-[calc(100vh-220px)] sidebar-scroll">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  group relative flex items-center gap-4 px-4 py-3 rounded-xl
                  transition-all duration-200 ease-in-out
                  ${isActive
                    ? "bg-white/20 text-white border border-white/20 shadow-lg shadow-green-900/30"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                  }
                  ${!isExpanded && "justify-center px-2"}
                  hover:translate-x-1
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-r-full shadow-lg shadow-yellow-400/50" />
                )}

                <div
                  className={`
                    relative flex-shrink-0 transition-transform duration-200
                    group-hover:scale-110
                    ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}
                  `}
                >
                  <Icon size={20} />
                </div>

                {isExpanded && (
                  <span className={`text-sm font-medium whitespace-nowrap ${
                    isActive ? "text-white" : "text-white/90 group-hover:text-white"
                  }`}>
                    {item.name}
                  </span>
                )}

                {/* TOOLTIP WHEN COLLAPSED */}
                {!isExpanded && (
                  <span className={`
                    absolute left-20 top-1/2 -translate-y-1/2
                    px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-green-800 text-white border border-green-600/50
                    shadow-xl whitespace-nowrap pointer-events-none
                    transition-all duration-200 delay-100
                    opacity-0 group-hover:opacity-100
                  `}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="flex-shrink-0 px-3 pb-4 space-y-3">
        <div className="border-t border-green-600/30" />

        {/* User Profile */}
        <div
          className={`
            flex items-center gap-3 p-2.5 rounded-xl
            transition-all duration-300
            hover:bg-white/10
            ${!isExpanded && "justify-center"}
          `}
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <FaUserCircle className="text-green-900 text-xl" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-green-800" />
          </div>

          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">
                Admin User
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-300/80 truncate">
                  admin@transev.com
                </span>
              </div>
            </div>
          )}

          {isExpanded && (
            <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors flex-shrink-0">
              <FaSignOutAlt size={14} />
            </button>
          )}
        </div>

        {/* Bottom Controls */}
        <div
          className={`
            flex items-center gap-2
            ${isExpanded ? "justify-between" : "justify-center"}
            px-2
          `}
        >
          {isExpanded && (
            <span className="text-[10px] text-green-300/60">v2.0.1</span>
          )}

          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/10 text-white/80 hover:text-white ${
              !isExpanded && "mx-auto"
            }`}
          >
            {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>

          {isExpanded && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-300/60">Online</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
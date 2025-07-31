
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {FaArrowRight,FaArrowLeft,FaTachometerAlt,FaBatteryFull,FaWallet,FaCar,FaBell,FaHeadset,} from 'react-icons/fa';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`bg-gray-800 h-screen p-5 flex flex-col transition-width duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
     
      <div
        className="flex justify-end mb-4 cursor-pointer"
        onClick={toggleExpand}
      >
        {isExpanded ? (
          <FaArrowLeft className="text-white" size={20} />
        ) : (
          <FaArrowRight className="text-white" size={20} />
        )}
      </div>

      <ul className="flex flex-col gap-4">
        <li className="nav-item">
          <Link
            className="flex items-center gap-4 p-2 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            to="/dashboard"
          >
            <FaTachometerAlt size={20} />
            {isExpanded && <span>Dashboard</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="flex items-center gap-4 p-2 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            to="/charger-session"
          >
            <FaBatteryFull size={20} />
            {isExpanded && <span>Chargers / Sessions</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="flex items-center gap-4 p-2 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            to="/revenue"
          >
            <FaWallet size={20} />
            {isExpanded && <span>Revenue Management</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="flex items-center gap-4 p-2 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            to="/vd-management"
          >
            <FaCar size={20} />
            {isExpanded && <span>Drivers / Vehicles</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="flex items-center gap-4 p-2 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            to="/alerts"
          >
            <FaBell size={20} />
            {isExpanded && <span>Alerts</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="flex items-center gap-4 p-2 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            to="/maintenance"
          >
            <FaHeadset size={20} />
            {isExpanded && <span>Support</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

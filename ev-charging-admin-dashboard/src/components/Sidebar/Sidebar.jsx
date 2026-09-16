import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import {
  FaArrowRight,
  FaArrowLeft,
  FaHome,
  FaChargingStation,
  FaWallet,
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
  FaHeadset,
  FaQuestionCircle,
  FaLifeRing,
  FaCreditCard,
  FaTicketAlt,
  FaUserShield,
  FaExclamationTriangle
} from "react-icons/fa";
import { MdElectricBolt } from "react-icons/md";

// API Configuration — bearer + X-CPO-App-ID headers are attached centrally
// by AuthContext.authenticatedRequest. No token handling here.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
};

/* ------------------------------------------------------------------
   Module-level org cache
   ------------------------------------------------------------------ */
let cachedOrgData = null;     // only set on a successful fetch
let orgFetchPromise = null;   // in-flight dedupe across concurrent mounts

const Sidebar = ({ isDarkMode = false, onThemeToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    authenticatedRequest,
    logout,
    isRefreshing,
    isAuthenticated,
    user,
  } = useAuth();

  /* Derive identity directly from the context — no refetch, no flash. */
  const userName = user?.name || 'Admin User';
  const userEmail = user?.email || 'admin@transev.com';
  const userRole = user?.role || '';

  const [orgData, setOrgData] = useState(cachedOrgData);
  const [orgLoading, setOrgLoading] = useState(!cachedOrgData);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ------------------------------------------------------------------
     Menu items
     ------------------------------------------------------------------ */
  const allMenuItems = useMemo(() => ([
    { name: "Dashboard", icon: FaHome, path: "/dashboard" },
    { name: "Chargers & Sessions", icon: FaChargingStation, path: "/charger-session" },
    { name: "Revenue Management", icon: FaWallet, path: "/revenue/overview" },
    { name: "Customers & Vehicles", icon: FaUsers, path: "/customers" },
    // { name: "Load Balancing", icon: FaBalanceScale, path: "/load-balancing" },
    // { name: "Operations & Maintenance", icon: FaTools, path: "/operations" },
    { name: "Alerts", icon: FaBell, path: "/alerts" },
    { name: "Reports & Analytics", icon: FaChartBar, path: "/reports" },
    { name: "App Management", icon: FaMobileAlt, path: "/app-management" },
    { name: "Payment Gateway", icon: FaCreditCard, path: "/payment-integration", adminOnly: true },
    { name: "Support Tickets", icon: FaTicketAlt, path: "/support-ticket" },
    { name: "User Access Control", icon: FaUserShield, path: "/user-access", adminOnly: true },
    { name: "Help & Support", icon: FaHeadset, path: "/help-support" },
  ]), []);

  const menuItems = useMemo(() => (
    allMenuItems.filter(item => {
      if (item.adminOnly) return userRole === 'ADMIN';
      return true;
    })
  ), [allMenuItems, userRole]);

  /* ------------------------------------------------------------------
     Fetch org data — cached across mounts
     ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isAuthenticated) {
      setOrgLoading(false);
      return undefined;
    }

    if (cachedOrgData) {
      setOrgData(cachedOrgData);
      setOrgLoading(false);
      return undefined;
    }

    if (orgFetchPromise) {
      let cancelled = false;
      orgFetchPromise
        .then((data) => {
          if (cancelled) return;
          if (data) setOrgData(data);
          setOrgLoading(false);
        })
        .catch(() => {
          if (!cancelled) setOrgLoading(false);
        });
      return () => { cancelled = true; };
    }

    let cancelled = false;
    setOrgLoading(true);

    orgFetchPromise = authenticatedRequest(API_CONFIG.ORGANIZATION_API, { method: 'GET' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          cachedOrgData = data;
          if (!cancelled) setOrgData(data);
        } else if (!cancelled) {
          setOrgData({ business_name: 'TransEV' });
        }
        return data;
      })
      .catch((error) => {
        console.error('Error fetching organization in sidebar:', error);
        if (!cancelled) setOrgData({ business_name: 'TransEV' });
        return null;
      })
      .finally(() => {
        orgFetchPromise = null;
        if (!cancelled) setOrgLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, authenticatedRequest]);

  /* ------------------------------------------------------------------
     Logout — now two-step: open confirm modal, then actually logout
     ------------------------------------------------------------------ */
  const handleLogoutClick = () => {
    if (isLoggingOut || isRefreshing) return;
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut || isRefreshing) return;

    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    if (isLoggingOut) return;
    setShowLogoutConfirm(false);
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!showLogoutConfirm) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleCancelLogout();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLogoutConfirm]);

  const getOrgName = () => {
    if (orgData?.business_name) return orgData.business_name;
    if (orgLoading && !cachedOrgData) return 'TransEV';
    return 'TransEV';
  };

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
    <>
      <div className={sidebarClasses}>
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
                  <span className="text-orange-500">Trans</span>
                  <span className="text-green-500">EV</span>
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
              const isActive = location.pathname.startsWith(item.path);

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
                  {getOrgName()}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-green-300/80 truncate">
                    {userEmail}
                  </span>
                </div>
              </div>
            )}

            {isExpanded && (
              <button
                onClick={handleLogoutClick}
                disabled={isLoggingOut || isRefreshing}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Logout"
              >
                {isLoggingOut || isRefreshing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaSignOutAlt size={14} />
                )}
              </button>
            )}
          </div>

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

      {/* ------------------------------------------------------------------
         LOGOUT CONFIRMATION MODAL
         ------------------------------------------------------------------ */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={handleCancelLogout}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden animate-[popIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col items-center px-6 pt-6 pb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-3">
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
              <h3
                id="logout-modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white text-center"
              >
                Confirm Logout
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6 pt-2">
              <button
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <FaSignOutAlt size={13} />
                    Yes, Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
// import React, { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
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
//   FaWallet,
//   FaCreditCard
// } from "react-icons/fa";
// import { MdElectricBolt } from "react-icons/md";

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
//   LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
//   REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
// };

// // Token Refresh Functions
// const refreshAccessToken = async () => {
//   const refreshToken = localStorage.getItem('refresh_token');
  
//   if (!refreshToken) {
//     console.log('No refresh token found');
//     return { success: false, error: 'No refresh token available' };
//   }

//   try {
//     const response = await fetch(API_CONFIG.REFRESH_TOKEN_API, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-CPO-App-ID': CPO_APP_ID
//       },
//       body: JSON.stringify({
//         refresh_token: refreshToken
//       })
//     });

//     const data = await response.json();
//     console.log('Refresh token response:', data);

//     if (response.ok && data.access_token) {
//       localStorage.setItem('token', data.access_token);
      
//       if (data.expires_in) {
//         localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));
//       }
      
//       if (data.refresh_token) {
//         localStorage.setItem('refresh_token', data.refresh_token);
//       }

//       return { success: true, token: data.access_token };
//     } else {
//       console.log('Refresh token failed:', data);
//       return { success: false, error: data.message || 'Failed to refresh token' };
//     }
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     return { success: false, error: error.message };
//   }
// };

// const fetchWithTokenRefresh = async (url, options = {}, retryCount = 2) => {
//   const token = localStorage.getItem('token');
  
//   if (!token) {
//     throw new Error('No token found');
//   }

//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...options.headers,
//         'Authorization': `Bearer ${token}`,
//         'X-CPO-App-ID': CPO_APP_ID,
//         'Content-Type': 'application/json',
//       }
//     });

//     if (response.status === 401 && retryCount > 0) {
//       console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
      
//       const refreshResult = await refreshAccessToken();
      
//       if (refreshResult.success) {
//         const newToken = localStorage.getItem('token');
//         console.log('Token refreshed successfully, retrying request...');
        
//         const retryResponse = await fetch(url, {
//           ...options,
//           headers: {
//             ...options.headers,
//             'Authorization': `Bearer ${newToken}`,
//             'X-CPO-App-ID': CPO_APP_ID,
//             'Content-Type': 'application/json',
//           }
//         });
        
//         if (retryResponse.ok) {
//           return retryResponse;
//         } else if (retryResponse.status === 401 && retryCount > 1) {
//           return fetchWithTokenRefresh(url, options, retryCount - 1);
//         }
//       } else {
//         console.log('Refresh token failed, redirecting to login...');
//         localStorage.removeItem('token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('token_expiry');
//         localStorage.removeItem('userInfo');
//         throw new Error('Session expired. Please login again.');
//       }
//     }

//     return response;
//   } catch (error) {
//     console.error('Fetch error:', error);
//     throw error;
//   }
// };

// const Sidebar = ({ isDarkMode = false, onThemeToggle }) => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // Organization state
//   const [orgData, setOrgData] = useState(null);
//   const [orgLoading, setOrgLoading] = useState(true);
//   const [orgError, setOrgError] = useState('');
//   const [userEmail, setUserEmail] = useState('');
//   const [userName, setUserName] = useState('');
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   // Menu items with Payment Gateway added
//   const menuItems = [
//     { name: "Dashboard", icon: FaHome, path: "/dashboard" },
//     { name: "Chargers & Sessions", icon: FaChargingStation, path: "/charger-session" },
//     { name: "Revenue Management", icon: FaWallet, path: "/revenue/overview" },
//     { name: "Customers & Vehicles", icon: FaUsers, path: "/customers" },
//     { name: "Load Balancing", icon: FaBalanceScale, path: "/load-balancing" },
//     { name: "Operations & Maintenance", icon: FaTools, path: "/operations" },
//     { name: "Alerts", icon: FaBell, path: "/alerts" },
//     { name: "Reports & Analytics", icon: FaChartBar, path: "/reports" },
//     { name: "App Management", icon: FaMobileAlt, path: "/app-management" },
//     { name: "Payment Gateway", icon: FaCreditCard, path: "/payment-integration" },
//     { name: "Help & Support", icon: FaHeadset, path: "/help-support" },
//   ];

//   // Fetch organization data on mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       fetchUserInfo();
//       fetchOrganizationData();
//     }
//   }, []);

//   const fetchUserInfo = async () => {
//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
//         method: 'GET'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('User info in sidebar:', data);
        
//         const email = data.user?.email || '';
//         const name = data.user?.full_name || data.user?.name || 'Admin User';
        
//         setUserEmail(email);
//         setUserName(name);
        
//         const userInfo = {
//           name: name,
//           email: email,
//           role: data.role || '',
//           ...data
//         };
//         localStorage.setItem('userInfo', JSON.stringify(userInfo));
//       }
//     } catch (error) {
//       console.error('Error fetching user info in sidebar:', error);
//     }
//   };

//   const fetchOrganizationData = async () => {
//     setOrgLoading(true);
//     setOrgError('');
//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.ORGANIZATION_API, {
//         method: 'GET'
//       });

//       const data = await response.json();
//       console.log('Organization data in sidebar:', data);

//       if (response.ok) {
//         setOrgData(data);
//       } else {
//         setOrgError(data.message || data.error?.message || 'Failed to fetch organization data');
//       }
//     } catch (error) {
//       console.error('Error fetching organization in sidebar:', error);
//       setOrgError(error.message || 'An error occurred while fetching organization data');
//     } finally {
//       setOrgLoading(false);
//     }
//   };

//   // Handle Logout with API call
//   const handleLogout = async () => {
//     if (isLoggingOut) return;
    
//     setIsLoggingOut(true);
//     const token = localStorage.getItem('token');

//     try {
//       if (token) {
//         // Call logout API
//         const response = await fetch(API_CONFIG.LOGOUT_API, {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'X-CPO-App-ID': CPO_APP_ID,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (response.ok) {
//           console.log('Logout successful');
//         } else {
//           console.log('Logout API call failed, proceeding with local cleanup');
//         }
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       // Always clear local storage and redirect
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       localStorage.removeItem('user');
      
//       setIsLoggingOut(false);
//       navigate('/signin');
//     }
//   };

//   // Get organization name
//   const getOrgName = () => {
//     if (orgLoading) return 'Loading...';
//     if (orgError) return 'Organization';
//     return orgData?.business_name || 'TransEV';
//   };

//   // Get user email for display
//   const getUserEmail = () => {
//     return userEmail || 'admin@transev.com';
//   };

//   // Get user name
//   const getUserName = () => {
//     return userName || 'Admin User';
//   };

//   const isDark = isDarkMode;

//   const sidebarClasses = `
//     h-screen sticky top-0 z-40 flex flex-col
//     transition-all duration-300 ease-in-out
//     bg-gradient-to-b from-green-800 via-green-700 to-green-900
//     text-white
//     ${isExpanded ? "w-64" : "w-20"}
//     shadow-2xl shadow-green-900/50
//     border-r border-green-600/30
//     flex-shrink-0
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
//       <div className={`flex items-center justify-between p-4 border-b border-green-600/30 flex-shrink-0`}>
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
//                 <span className="text-orange-500">Trans</span>
//                 <span className="text-green-500">EV</span>
//               </h1>
//               <span className="text-[10px] uppercase tracking-wider text-green-300/80">
//                 EV Management Platform
//               </span>
//             </div>
//           )}
//         </div>

//         <button
//           onClick={() => setIsExpanded(!isExpanded)}
//           className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/10 text-white flex-shrink-0`}
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

//         {/* User Profile with Organization Name */}
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
//               {/* Organization Name - from API */}
//               <p className="text-sm font-semibold truncate text-white">
//                 {getOrgName()}
//               </p>
//               {/* User Email */}
//               <div className="flex items-center gap-1.5 mt-0.5">
//                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
//                 <span className="text-[10px] text-green-300/80 truncate">
//                   {getUserEmail()}
//                 </span>
//               </div>
//             </div>
//           )}

//           {isExpanded && (
//             <button 
//               onClick={handleLogout}
//               disabled={isLoggingOut}
//               className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
//               title="Logout"
//             >
//               {isLoggingOut ? (
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//               ) : (
//                 <FaSignOutAlt size={14} />
//               )}
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

/// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
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
  FaWallet,
  FaCreditCard
} from "react-icons/fa";
import { MdElectricBolt } from "react-icons/md";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const Sidebar = ({ isDarkMode = false, onThemeToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
  // Organization state
  const [orgData, setOrgData] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Menu items
  const menuItems = [
    { name: "Dashboard", icon: FaHome, path: "/dashboard" },
    { name: "Chargers & Sessions", icon: FaChargingStation, path: "/charger-session" },
    { name: "Revenue Management", icon: FaWallet, path: "/revenue/overview" },
    { name: "Customers & Vehicles", icon: FaUsers, path: "/customers" },
    { name: "Load Balancing", icon: FaBalanceScale, path: "/load-balancing" },
    { name: "Operations & Maintenance", icon: FaTools, path: "/operations" },
    { name: "Alerts", icon: FaBell, path: "/alerts" },
    { name: "Reports & Analytics", icon: FaChartBar, path: "/reports" },
    { name: "App Management", icon: FaMobileAlt, path: "/app-management" },
    { name: "Payment Gateway", icon: FaCreditCard, path: "/payment-integration" },
    { name: "Help & Support", icon: FaHeadset, path: "/help-support" },
  ];

  // Fetch organization data on mount
  useEffect(() => {
    if (isAuthenticated) {
      if (!fetchAttempted || user) {
        setFetchAttempted(true);
        fetchUserInfo();
        fetchOrganizationData();
      }
    } else {
      const storedInfo = localStorage.getItem('userInfo');
      if (storedInfo) {
        try {
          const parsedInfo = JSON.parse(storedInfo);
          setUserName(parsedInfo.name || 'Admin User');
          setUserEmail(parsedInfo.email || 'admin@transev.com');
        } catch (e) {
          console.error('Error parsing stored user info:', e);
        }
      }
      setOrgLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info in sidebar:', data);
        
        const email = data.user?.email || user?.email || '';
        const name = data.user?.full_name || data.user?.name || user?.name || 'Admin User';
        
        setUserEmail(email);
        setUserName(name);
        
        const userInfo = {
          name: name,
          email: email,
          role: data.role || '',
          ...data
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        console.error('Failed to fetch user info:', response.status);
        const storedInfo = localStorage.getItem('userInfo');
        if (storedInfo) {
          try {
            const parsedInfo = JSON.parse(storedInfo);
            setUserName(parsedInfo.name || 'Admin User');
            setUserEmail(parsedInfo.email || 'admin@transev.com');
          } catch (e) {
            console.error('Error parsing stored user info:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user info in sidebar:', error);
      const storedInfo = localStorage.getItem('userInfo');
      if (storedInfo) {
        try {
          const parsedInfo = JSON.parse(storedInfo);
          setUserName(parsedInfo.name || 'Admin User');
          setUserEmail(parsedInfo.email || 'admin@transev.com');
        } catch (e) {
          console.error('Error parsing stored user info:', e);
        }
      }
    }
  };

  const fetchOrganizationData = async () => {
    setOrgLoading(true);
    setOrgError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.ORGANIZATION_API, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Organization data in sidebar:', data);

      if (response.ok) {
        setOrgData(data);
      } else {
        setOrgError(data.message || data.error?.message || 'Failed to fetch organization data');
        setOrgData({ business_name: 'TransEV' });
      }
    } catch (error) {
      console.error('Error fetching organization in sidebar:', error);
      setOrgError(error.message || 'An error occurred while fetching organization data');
      setOrgData({ business_name: 'TransEV' });
    } finally {
      setOrgLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut || isRefreshing) return;
    
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('user');
      navigate('/signin');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getOrgName = () => {
    if (orgLoading) return 'Loading...';
    if (orgError) return 'TransEV';
    return orgData?.business_name || 'TransEV';
  };

  const getUserEmail = () => {
    return userEmail || 'admin@transev.com';
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
                  {getUserEmail()}
                </span>
              </div>
            </div>
          )}

          {isExpanded && (
            <button 
              onClick={handleLogout}
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
  );
};

export default Sidebar;
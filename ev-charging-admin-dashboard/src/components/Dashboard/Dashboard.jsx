// import React, { useState, useRef, useEffect } from "react";
// import {
//   Bell,
//   MapPin,
//   Zap,
//   Power,
//   AlertTriangle,
//   X,
//   RefreshCw,
//   Wifi,
//   WifiOff,
//   Plug,
//   Battery,
//   Building,
//   Users,
//   Server,
//   Activity,
//   DollarSign,
//   CheckCircle,
//   AlertCircle,
//   Settings,
//   TrendingUp,
//   Calendar,
//   LogOut,
//   User as UserIcon,
//   Plus,
//   ChevronDown,
//   ChevronRight,
//   Menu,
//   Grid,
//   List,
//   Eye,
//   EyeOff,
//   GripVertical,
//   Search,
//   Filter,
//   Globe,
//   Smartphone,
//   Monitor,
//   Cloud,
//   Shield,
//   Clock,
//   Home,
//   BarChart3,
//   Layers,
//   Upload,
//   Download,
//   Edit,
//   Trash2,
//   MoreVertical,
//   Circle,
//   CircleDot,
//   CircleOff,
//   CircleCheck,
//   CircleAlert,
//   CirclePower,
//   CircleSlash,
//   CircleX,
//   Wallet,
//   Map,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../Sidebar/Sidebar";

// // ==================== TOKEN REFRESH FUNCTIONS ====================
// const API_CONFIG = {
//   USER_INFO_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/me'
//   },
//   LOGOUT_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/logout'
//   },
//   REFRESH_TOKEN_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/refresh'
//   }
// };

// // Refresh access token using refresh token
// const refreshAccessToken = async () => {
//   const refreshToken = localStorage.getItem('refresh_token');
  
//   if (!refreshToken) {
//     console.log('No refresh token found');
//     return { success: false, error: 'No refresh token available' };
//   }

//   try {
//     const response = await fetch(API_CONFIG.REFRESH_TOKEN_API.BASE_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
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

// // Check if token is expired or near expiry
// const isTokenExpired = (bufferTime = 5 * 60 * 1000) => {
//   const token = localStorage.getItem('token');
//   const expiry = localStorage.getItem('token_expiry');
  
//   if (!token) {
//     return true;
//   }

//   // If no expiry time is stored, assume token is valid (it was just created)
//   if (!expiry) {
//     return false;
//   }

//   const currentTime = Date.now();
//   const expiryTime = parseInt(expiry);
  
//   // If expiry time is not a valid number, assume token is valid
//   if (isNaN(expiryTime)) {
//     return false;
//   }
  
//   return (expiryTime - currentTime) < bufferTime;
// };

// // Get valid token, refresh if necessary
// const getValidToken = async (bufferTime = 5 * 60 * 1000) => {
//   // Check if token exists
//   const token = localStorage.getItem('token');
//   if (!token) {
//     return { success: false, error: 'No token found' };
//   }

//   // Check if token is expired
//   if (!isTokenExpired(bufferTime)) {
//     return { success: true, token: token };
//   }

//   console.log('Token expired or near expiry, attempting to refresh...');
//   const result = await refreshAccessToken();
  
//   if (result.success) {
//     return result;
//   }

//   // Only clear tokens and redirect if refresh actually failed
//   console.log('Refresh failed, clearing tokens...');
//   localStorage.removeItem('token');
//   localStorage.removeItem('refresh_token');
//   localStorage.removeItem('token_expiry');
//   localStorage.removeItem('userInfo');
  
//   return { success: false, error: 'Session expired. Please login again.' };
// };

// // API wrapper with token refresh
// const fetchWithTokenRefresh = async (url, options = {}, retryCount = 1) => {
//   const tokenResult = await getValidToken();
  
//   if (!tokenResult.success) {
//     // Don't redirect here, let the caller handle it
//     throw new Error('Session expired. Please login again.');
//   }

//   const token = tokenResult.token;
  
//   const response = await fetch(url, {
//     ...options,
//     headers: {
//       ...options.headers,
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     }
//   });

//   // If unauthorized and we have retries left, try refreshing token and retry
//   if (response.status === 401 && retryCount > 0) {
//     console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
    
//     const refreshResult = await refreshAccessToken();
    
//     if (refreshResult.success) {
//       return fetchWithTokenRefresh(url, options, retryCount - 1);
//     } else {
//       // Refresh failed, clear tokens
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('token_expiry');
//       localStorage.removeItem('userInfo');
//       throw new Error('Session expired. Please login again.');
//     }
//   }

//   return response;
// };

// // ==================== KPI CARD ====================
// const KpiCard = ({ title, value, subValue, percentage, icon, color, noData, onClick }) => {
//   return (
//     <div
//       onClick={onClick}
//       className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <p className="text-sm text-gray-500 font-medium">{title}</p>
//           <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
//           {subValue && <p className="text-sm text-gray-400">{subValue}</p>}
//         </div>
//         <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
//           {icon}
//         </div>
//       </div>
//       <div className="mt-3 flex items-center justify-between">
//         <span className="text-xs text-gray-400">{percentage || "0%"}</span>
//         {noData && (
//           <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
//             No Data Found
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };

// // ==================== MAIN DASHBOARD ====================
// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [showCustomizePopup, setShowCustomizePopup] = useState(false);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedFilter, setSelectedFilter] = useState("This Month");
//   const [selectedState, setSelectedState] = useState("West Bengal");
//   const [selectedNetwork, setSelectedNetwork] = useState("All Network");
//   const [selectedCharger, setSelectedCharger] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewMode, setViewMode] = useState("grid");
//   const [selectedHub, setSelectedHub] = useState("All Hubs");
//   const [showFilterDropdown, setShowFilterDropdown] = useState(false);
//   const [showStateDropdown, setShowStateDropdown] = useState(false);
//   const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
//   const [showHubDropdown, setShowHubDropdown] = useState(false);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [connectorFilter, setConnectorFilter] = useState("All");
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
  
//   // User info states
//   const [userName, setUserName] = useState("User");
//   const [userEmail, setUserEmail] = useState("");
//   const [userAvatar, setUserAvatar] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [loadingUser, setLoadingUser] = useState(true);

//   // Dummy charger data
//   const dummyChargers = [
//     {
//       id: "CH-001",
//       name: "Benny 7.4kWh",
//       type: "AC Charger - Fast",
//       status: "Online",
//       connectors: 2,
//       location: "Action Area III, Newtown, Kolkata",
//       lat: 22.5726,
//       lng: 88.3639,
//       hub: "Newtown Hub",
//       capacity: "7.4kWh",
//       online: true,
//       available: 1,
//       busy: 1,
//       error: 0,
//     },
//     {
//       id: "CH-002",
//       name: "Transev 60kWh",
//       type: "DC Charger - Fast",
//       status: "Online",
//       connectors: 2,
//       location: "Action Area III, Newtown, Kolkata",
//       lat: 22.5726,
//       lng: 88.3639,
//       hub: "Newtown Hub",
//       capacity: "60kWh",
//       online: true,
//       available: 0,
//       busy: 2,
//       error: 0,
//     },
//     {
//       id: "CH-003",
//       name: "EcoCharge 22kWh",
//       type: "AC Charger - Fast",
//       status: "Offline",
//       connectors: 1,
//       location: "Salt Lake, Kolkata",
//       lat: 22.5776,
//       lng: 88.4176,
//       hub: "Salt Lake Hub",
//       capacity: "22kWh",
//       online: false,
//       available: 0,
//       busy: 0,
//       error: 1,
//     },
//     {
//       id: "CH-004",
//       name: "PowerMax 150kWh",
//       type: "DC Charger - Ultra Fast",
//       status: "Online",
//       connectors: 2,
//       location: "Rajarhat, Kolkata",
//       lat: 22.5926,
//       lng: 88.4576,
//       hub: "Rajarhat Hub",
//       capacity: "150kWh",
//       online: true,
//       available: 2,
//       busy: 0,
//       error: 0,
//     },
//   ];

//   // Filter options
//   const filterOptions = ["Today", "Yesterday", "This Week", "This Month", "This Year"];
//   const stateOptions = ["All States", "West Bengal"];
//   const networkOptions = ["All Network", "Online", "Offline"];
//   const hubOptions = ["All Hubs", "Newtown Hub", "Salt Lake Hub", "Rajarhat Hub"];

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   // Fetch user info from API with token refresh
//   const fetchUserInfo = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.log('No token found, redirecting to login');
//       navigate('/signin');
//       return;
//     }

//     setLoadingUser(true);
//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API.BASE_URL, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('User info fetched successfully:', data);
        
//         const userData = data.user || data;
//         const name = userData.full_name || userData.name || userData.firstname || 'User';
//         const email = userData.email || userData.userEmail || '';
//         const role = data.role || data.userRole || data.userType || userData.role || '';
//         const avatar = userData.avatar || userData.profileImage || null;
        
//         setUserName(name);
//         setUserEmail(email);
//         setUserRole(role);
//         setUserAvatar(avatar);
        
//         localStorage.setItem('userInfo', JSON.stringify({
//           name,
//           email,
//           role,
//           avatar,
//           ...data
//         }));
//       } else if (response.status === 401) {
//         console.log('Unauthorized, trying to refresh token...');
//         const refreshResult = await refreshAccessToken();
//         if (refreshResult.success) {
//           console.log('Token refreshed, retrying fetch...');
//           await fetchUserInfo();
//           return;
//         } else {
//           console.log('Refresh failed, redirecting to login');
//           localStorage.removeItem('token');
//           localStorage.removeItem('refresh_token');
//           localStorage.removeItem('token_expiry');
//           localStorage.removeItem('userInfo');
//           navigate('/signin');
//         }
//       } else {
//         console.log('Failed to fetch user info:', response.status);
//         // Try to get from localStorage fallback
//         const storedInfo = localStorage.getItem('userInfo');
//         if (storedInfo) {
//           const parsedInfo = JSON.parse(storedInfo);
//           setUserName(parsedInfo.name || 'User');
//           setUserEmail(parsedInfo.email || '');
//           setUserRole(parsedInfo.role || '');
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//       // Check if error is due to session expiry
//       if (error.message && error.message.includes('Session expired')) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('token_expiry');
//         localStorage.removeItem('userInfo');
//         navigate('/signin');
//       } else {
//         // Try to get from localStorage fallback
//         const storedInfo = localStorage.getItem('userInfo');
//         if (storedInfo) {
//           const parsedInfo = JSON.parse(storedInfo);
//           setUserName(parsedInfo.name || 'User');
//           setUserEmail(parsedInfo.email || '');
//           setUserRole(parsedInfo.role || '');
//         }
//       }
//     } finally {
//       setLoadingUser(false);
//     }
//   };

//   // Handle logout
//   const handleLogout = async () => {
//     const token = localStorage.getItem('token');
    
//     try {
//       const response = await fetch(API_CONFIG.LOGOUT_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         console.log('Logout successful');
//       } else {
//         console.log('Logout API response:', await response.text());
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('token_expiry');
//       localStorage.removeItem('userInfo');
//       navigate('/signin');
//     }
//   };

//   // Refresh dashboard data
//   const refreshDashboard = () => {
//     console.log('Refreshing dashboard...');
//     setRefreshKey(prev => prev + 1);
//     fetchUserInfo();
//   };

//   // Fetch user info on mount
//   useEffect(() => {
//     // Check if token exists before fetching
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//   }, []);

//   // Auto-refresh effect
//   useEffect(() => {
//     let intervalId = null;
    
//     if (autoRefresh) {
//       console.log('Auto-refresh enabled');
//       intervalId = setInterval(() => {
//         refreshDashboard();
//       }, 30000);
//     } else {
//       console.log('Auto-refresh disabled');
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [autoRefresh]);

//   // Token refresh timer - only run if token exists
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     const tokenCheckInterval = setInterval(async () => {
//       // Only check if token might be expired
//       if (isTokenExpired(10 * 60 * 1000)) {
//         console.log('Token near expiry, refreshing...');
//         const result = await refreshAccessToken();
//         if (!result.success) {
//           console.log('Token refresh failed, redirecting to login');
//           localStorage.removeItem('token');
//           localStorage.removeItem('refresh_token');
//           localStorage.removeItem('token_expiry');
//           localStorage.removeItem('userInfo');
//           navigate('/signin');
//         }
//       }
//     }, 60000); // Check every minute

//     return () => clearInterval(tokenCheckInterval);
//   }, [navigate]);

//   // Filter chargers
//   const filteredChargers = dummyChargers.filter((charger) => {
//     const matchesSearch = charger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                           charger.id.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesNetwork = selectedNetwork === "All Network" || 
//                           (selectedNetwork === "Online" && charger.online) ||
//                           (selectedNetwork === "Offline" && !charger.online);
//     const matchesHub = selectedHub === "All Hubs" || charger.hub === selectedHub;
    
//     let matchesConnectorStatus = true;
//     if (connectorFilter === "Busy") {
//       matchesConnectorStatus = charger.busy > 0;
//     } else if (connectorFilter === "Available") {
//       matchesConnectorStatus = charger.available > 0;
//     } else if (connectorFilter === "Error") {
//       matchesConnectorStatus = charger.error > 0;
//     }
    
//     return matchesSearch && matchesNetwork && matchesHub && matchesConnectorStatus;
//   });

//   // Settings dropdown menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
//             {userAvatar ? (
//               <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
//             ) : (
//               userName.charAt(0).toUpperCase()
//             )}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">{userName}</h4>
//             <p className="text-sm text-gray-400 truncate">{userEmail || 'user@transev.com'}</p>
//             {userRole && (
//               <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
//                 {userRole}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
      
//       <div className="p-2">
//         <button 
//           onClick={() => {
//             setShowSettingsMenu(false);
//             navigate('/profile');
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <UserIcon size={16} className="text-gray-500" /> 
//           <span>Profile</span>
//         </button>
//         <button 
//           onClick={() => {
//             setShowSettingsMenu(false);
//             navigate('/organization');
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Building size={16} className="text-gray-500" /> 
//           <span>Organization</span>
//         </button>
//         <div className="border-t border-gray-700 my-1"></div>
//         <button 
//           onClick={handleLogout}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
//         >
//           <LogOut size={16} className="text-red-500" /> 
//           <span>Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Add dropdown menu
//   const AddMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
//       <div className="p-3">
//         <button 
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate("/add-hub");
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Plus size={18} className="text-gray-500" /> Add Hub
//         </button>
//         <button 
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate("/add-charger");
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Plus size={18} className="text-gray-500" /> Add Charger
//         </button>
//       </div>
//     </div>
//   );

//   // Calendar popup
//   const CalendarPopup = () => {
//     const [currentMonth, setCurrentMonth] = useState(new Date());
//     const [localSelectedDate, setLocalSelectedDate] = useState(null);

//     const daysInMonth = (date) => {
//       const year = date.getFullYear();
//       const month = date.getMonth();
//       const days = new Date(year, month + 1, 0).getDate();
//       const firstDay = new Date(year, month, 1).getDay();
//       return { days, firstDay };
//     };

//     const { days, firstDay } = daysInMonth(currentMonth);
//     const monthName = currentMonth.toLocaleString('default', { month: 'long' });
//     const year = currentMonth.getFullYear();

//     const handleDateSelect = (day) => {
//       const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//       setLocalSelectedDate(date);
//       setSelectedDate(date);
//       setSelectedFilter(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
//       setShowCalendar(false);
//     };

//     return (
//       <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 w-[320px]">
//         <div className="flex items-center justify-between mb-4">
//           <button
//             onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
//             className="p-1 hover:bg-gray-100 rounded-lg"
//           >
//             <ChevronDown size={18} className="rotate-90" />
//           </button>
//           <span className="font-semibold text-gray-800">{monthName} {year}</span>
//           <button
//             onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
//             className="p-1 hover:bg-gray-100 rounded-lg"
//           >
//             <ChevronDown size={18} className="-rotate-90" />
//           </button>
//         </div>
//         <div className="grid grid-cols-7 gap-1 text-center mb-2">
//           {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
//             <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
//           ))}
//         </div>
//         <div className="grid grid-cols-7 gap-1">
//           {Array.from({ length: firstDay }, (_, i) => (
//             <div key={`empty-${i}`} className="py-1" />
//           ))}
//           {Array.from({ length: days }, (_, i) => {
//             const day = i + 1;
//             const isToday = new Date().getDate() === day && 
//                            new Date().getMonth() === currentMonth.getMonth() &&
//                            new Date().getFullYear() === currentMonth.getFullYear();
//             const isSelected = localSelectedDate && 
//                               localSelectedDate.getDate() === day &&
//                               localSelectedDate.getMonth() === currentMonth.getMonth() &&
//                               localSelectedDate.getFullYear() === currentMonth.getFullYear();
//             return (
//               <button
//                 key={day}
//                 onClick={() => handleDateSelect(day)}
//                 className={`py-1 rounded-lg text-sm transition ${
//                   isSelected ? 'bg-blue-600 text-white' :
//                   isToday ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 {day}
//               </button>
//             );
//           })}
//         </div>
//         <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
//           <button
//             onClick={() => {
//               setSelectedFilter("Today");
//               setSelectedDate(new Date());
//               setShowCalendar(false);
//             }}
//             className="text-xs text-blue-600 font-medium hover:underline"
//           >
//             Today
//           </button>
//           <button
//             onClick={() => setShowCalendar(false)}
//             className="text-xs text-gray-500 hover:text-gray-700"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Customize popup - Slide from right
//   const CustomizePopup = () => {
//     const [selectedKPIs, setSelectedKPIs] = useState([
//       { id: 'revenue', title: 'Revenue', icon: 'wallet', color: 'bg-green-100' },
//       { id: 'sessions', title: 'No of Sessions', icon: 'activity', color: 'bg-blue-100' },
//       { id: 'usage', title: 'Usage', icon: 'zap', color: 'bg-yellow-100' },
//       { id: 'online', title: 'Online Percentage/Charger', icon: 'wifi', color: 'bg-purple-100' },
//     ]);
    
//     const [availableKPIs, setAvailableKPIs] = useState([
//       { id: 'energy', title: 'Total Energy', icon: 'battery', color: 'bg-indigo-100' },
//       { id: 'active', title: 'Active Sessions', icon: 'activity', color: 'bg-pink-100' },
//       { id: 'revenuePerCharger', title: 'Revenue per Charger', icon: 'dollar', color: 'bg-orange-100' },
//     ]);

//     const [localSelected, setLocalSelected] = useState([...selectedKPIs]);
//     const [localAvailable, setLocalAvailable] = useState([...availableKPIs]);
//     const [dragItem, setDragItem] = useState(null);

//     const handleDragStart = (e, item, type) => {
//       setDragItem({ item, type });
//       e.dataTransfer.effectsAllowed = 'move';
//     };

//     const handleDragOver = (e) => {
//       e.preventDefault();
//       e.dataTransfer.dropEffect = 'move';
//     };

//     const handleDrop = (e, targetType, targetIndex) => {
//       e.preventDefault();
//       if (!dragItem) return;

//       const { item, type } = dragItem;
      
//       if (type === 'selected' && targetType === 'selected') {
//         const newSelected = [...localSelected];
//         const fromIndex = newSelected.findIndex(k => k.id === item.id);
//         newSelected.splice(fromIndex, 1);
//         newSelected.splice(targetIndex, 0, item);
//         setLocalSelected(newSelected);
//       } else if (type === 'selected' && targetType === 'available') {
//         const newSelected = localSelected.filter(k => k.id !== item.id);
//         const newAvailable = [...localAvailable, item];
//         setLocalSelected(newSelected);
//         setLocalAvailable(newAvailable);
//       } else if (type === 'available' && targetType === 'available') {
//         const newAvailable = [...localAvailable];
//         const fromIndex = newAvailable.findIndex(k => k.id === item.id);
//         newAvailable.splice(fromIndex, 1);
//         newAvailable.splice(targetIndex, 0, item);
//         setLocalAvailable(newAvailable);
//       } else if (type === 'available' && targetType === 'selected') {
//         const newAvailable = localAvailable.filter(k => k.id !== item.id);
//         const newSelected = [...localSelected, item];
//         setLocalSelected(newSelected);
//         setLocalAvailable(newAvailable);
//       }
      
//       setDragItem(null);
//     };

//     const handleApply = () => {
//       setShowCustomizePopup(false);
//     };

//     const handleReset = () => {
//       setLocalSelected([
//         { id: 'revenue', title: 'Revenue', icon: 'wallet', color: 'bg-green-100' },
//         { id: 'sessions', title: 'No of Sessions', icon: 'activity', color: 'bg-blue-100' },
//         { id: 'usage', title: 'Usage', icon: 'zap', color: 'bg-yellow-100' },
//         { id: 'online', title: 'Online Percentage/Charger', icon: 'wifi', color: 'bg-purple-100' },
//       ]);
//       setLocalAvailable([
//         { id: 'energy', title: 'Total Energy', icon: 'battery', color: 'bg-indigo-100' },
//         { id: 'active', title: 'Active Sessions', icon: 'activity', color: 'bg-pink-100' },
//         { id: 'revenuePerCharger', title: 'Revenue per Charger', icon: 'dollar', color: 'bg-orange-100' },
//       ]);
//     };

//     const getIcon = (iconName) => {
//       switch(iconName) {
//         case 'wallet': return <Wallet size={16} className="text-green-600" />;
//         case 'activity': return <Activity size={16} className="text-blue-600" />;
//         case 'zap': return <Zap size={16} className="text-yellow-600" />;
//         case 'wifi': return <Wifi size={16} className="text-purple-600" />;
//         case 'battery': return <Battery size={16} className="text-indigo-600" />;
//         case 'dollar': return <DollarSign size={16} className="text-orange-600" />;
//         default: return <Activity size={16} className="text-gray-600" />;
//       }
//     };

//     return (
//       <>
//         <div 
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
//           onClick={() => setShowCustomizePopup(false)}
//         />
        
//         <div 
//           className="fixed top-0 right-0 h-full w-[480px] max-w-[90vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden"
//           style={{ animation: 'slideInRight 0.3s ease-out' }}
//         >
//           <style>{`
//             @keyframes slideInRight {
//               from { transform: translateX(100%); }
//               to { transform: translateX(0); }
//             }
//             .custom-scrollbar::-webkit-scrollbar {
//               width: 4px;
//             }
//             .custom-scrollbar::-webkit-scrollbar-track {
//               background: transparent;
//             }
//             .custom-scrollbar::-webkit-scrollbar-thumb {
//               background: linear-gradient(180deg, #3b82f6, #8b5cf6);
//               border-radius: 10px;
//             }
//             .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//               background: linear-gradient(180deg, #2563eb, #7c3aed);
//             }
//             .custom-scrollbar {
//               scrollbar-width: thin;
//               scrollbar-color: #3b82f6 transparent;
//             }
//             .drag-item {
//               transition: all 0.2s ease;
//             }
//             .drag-item:active {
//               cursor: grabbing;
//             }
//           `}</style>
          
//           {/* Header */}
//           <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
//                   <Settings size={20} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold text-white">Customize KPIs</h3>
//                   <p className="text-xs text-blue-100 mt-0.5">Drag and drop to rearrange</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowCustomizePopup(false)}
//                 className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white hover:rotate-90 duration-200"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
          
//           {/* Content */}
//           <div className="p-6 overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
//             <div className="space-y-6">
//               {/* Selected KPIs */}
//               <div>
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-1.5 h-5 rounded-full bg-blue-500" />
//                     <p className="text-sm font-semibold text-gray-700">Selected KPIs</p>
//                   </div>
//                   <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {localSelected.length} of {selectedKPIs.length + availableKPIs.length}
//                   </span>
//                 </div>
//                 <div className="space-y-2 min-h-[120px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl p-3 border-2 border-dashed border-blue-200">
//                   {localSelected.map((kpi, index) => (
//                     <div
//                       key={kpi.id}
//                       draggable
//                       onDragStart={(e) => handleDragStart(e, kpi, 'selected')}
//                       onDragOver={handleDragOver}
//                       onDrop={(e) => handleDrop(e, 'selected', index)}
//                       className="drag-item flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200 cursor-grab hover:shadow-md hover:border-blue-300 transition-all group"
//                     >
//                       <GripVertical size={16} className="text-gray-300 group-hover:text-blue-400 transition" />
//                       <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center shadow-sm`}>
//                         {getIcon(kpi.icon)}
//                       </div>
//                       <span className="text-sm font-medium text-gray-700 flex-1">{kpi.title}</span>
//                       <div className="flex items-center gap-1">
//                         <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
//                           #{index + 1}
//                         </span>
//                         <Eye size={15} className="text-blue-500" />
//                       </div>
//                     </div>
//                   ))}
//                   {localSelected.length === 0 && (
//                     <div className="text-center py-6 text-gray-400 text-sm">
//                       <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
//                         <Plus size={20} className="text-gray-300" />
//                       </div>
//                       <p className="font-medium text-gray-500">Drop KPIs here</p>
//                       <p className="text-xs text-gray-400 mt-0.5">Drag from below to add</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Available KPIs */}
//               <div>
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-1.5 h-5 rounded-full bg-gray-400" />
//                     <p className="text-sm font-semibold text-gray-700">More KPIs</p>
//                   </div>
//                   <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {localAvailable.length} available
//                   </span>
//                 </div>
//                 <div className="space-y-2 min-h-[80px] bg-gradient-to-b from-gray-50/50 to-transparent rounded-xl p-3 border-2 border-dashed border-gray-200">
//                   {localAvailable.map((kpi, index) => (
//                     <div
//                       key={kpi.id}
//                       draggable
//                       onDragStart={(e) => handleDragStart(e, kpi, 'available')}
//                       onDragOver={handleDragOver}
//                       onDrop={(e) => handleDrop(e, 'available', index)}
//                       className="drag-item flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-grab hover:shadow-md hover:border-gray-300 transition-all group"
//                     >
//                       <GripVertical size={16} className="text-gray-300 group-hover:text-gray-400 transition" />
//                       <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center shadow-sm`}>
//                         {getIcon(kpi.icon)}
//                       </div>
//                       <span className="text-sm font-medium text-gray-700 flex-1">{kpi.title}</span>
//                       <div className="flex items-center gap-1">
//                         <EyeOff size={15} className="text-gray-300 group-hover:text-gray-400 transition" />
//                       </div>
//                     </div>
//                   ))}
//                   {localAvailable.length === 0 && (
//                     <div className="text-center py-6 text-gray-400 text-sm">
//                       <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
//                         <CheckCircle size={20} className="text-gray-300" />
//                       </div>
//                       <p className="font-medium text-gray-500">All KPIs selected</p>
//                       <p className="text-xs text-gray-400 mt-0.5">Drag some back to add</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Footer */}
//           <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
//             <div className="flex gap-3">
//               <button
//                 onClick={handleApply}
//                 className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02]"
//               >
//                 Apply Changes
//               </button>
//               <button
//                 onClick={handleReset}
//                 className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200"
//               >
//                 Reset
//               </button>
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   };

//   // Filter Dropdown
//   const FilterDropdown = ({ options, selected, onSelect, onClose }) => (
//     <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
//       {options.map((opt) => (
//         <button
//           key={opt}
//           onClick={() => { onSelect(opt); onClose(); }}
//           className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
//             selected === opt ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"
//           }`}
//         >
//           {opt}
//         </button>
//       ))}
//     </div>
//   );

//   // Calculate stats
//   const totalChargers = filteredChargers.length;
//   const totalConnectors = filteredChargers.reduce((sum, c) => sum + c.connectors, 0);
//   const totalAvailable = filteredChargers.reduce((sum, c) => sum + c.available, 0);
//   const totalBusy = filteredChargers.reduce((sum, c) => sum + c.busy, 0);
//   const totalError = filteredChargers.reduce((sum, c) => sum + c.error, 0);
//   const nonConfigured = 1;

//   const handleConnectorStatusClick = (status) => {
//     setConnectorFilter(status);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex" key={refreshKey}>
//       <Sidebar 
//         isDarkMode={isDarkMode} 
//         onThemeToggle={handleThemeToggle}
//         userName={userName}
//         userEmail={userEmail}
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         {/* HEADER */}
//         <header className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <h1 className="text-xl font-semibold text-gray-800">
//                 Welcome, <span className="text-gray-900">{userName}</span>
//                 <span className="text-sm font-normal text-blue-600 ml-2">/ Trans ev</span>
//               </h1>
            
//             </div>
//             <div className="flex items-center gap-2 relative">
//               {/* Auto Refresh Toggle */}
//               <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
//                 <span className="text-[15px] text-gray-600 font-medium">Auto Refresh</span>
//                 <button
//                   onClick={() => {
//                     setAutoRefresh(!autoRefresh);
//                     if (!autoRefresh) {
//                       refreshDashboard();
//                     }
//                   }}
//                   className={`w-7 h-3.5 rounded-full transition-all relative ${
//                     autoRefresh ? "bg-blue-600" : "bg-gray-300"
//                   }`}
//                 >
//                   <div
//                     className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${
//                       autoRefresh ? "right-0.5" : "left-0.5"
//                     }`}
//                   />
//                 </button>
//               </div>

//              {/* Settings Icon with Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => setShowSettingsMenu(!showSettingsMenu)}
//                   className="p-1.5 hover:bg-gray-100 rounded-lg transition"
//                 >
//                   <Settings size={18} className="text-gray-600" />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               {/* Add Button with Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => setShowAddMenu(!showAddMenu)}
//                   className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
//                 >
//                   <Plus size={16} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* FILTER SECTION */}
//         <div className="bg-white border-b border-gray-200 px-6 py-5 flex flex-wrap items-center justify-between gap-3">
//           <div className="flex items-center gap-2 flex-wrap">
//             <div className="relative">
//               <button
//                 onClick={() => setShowFilterDropdown(!showFilterDropdown)}
//                 className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium transition flex items-center gap-1"
//               >
//                 {selectedFilter} <ChevronDown size={14} />
//               </button>
//               {showFilterDropdown && (
//                 <FilterDropdown
//                   options={filterOptions}
//                   selected={selectedFilter}
//                   onSelect={setSelectedFilter}
//                   onClose={() => setShowFilterDropdown(false)}
//                 />
//               )}
//             </div>

//             <div className="relative">
//               <button
//                 onClick={() => setShowCalendar(!showCalendar)}
//                 className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
//               >
//                 <Calendar size={14} /> Calendar
//               </button>
//               {showCalendar && <CalendarPopup />}
//             </div>
//           </div>

//           <div className="flex items-center gap-2 flex-wrap">
//             <div className="relative">
//               <button
//                 onClick={() => setShowStateDropdown(!showStateDropdown)}
//                 className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
//               >
//                 {selectedState} <ChevronDown size={14} />
//               </button>
//               {showStateDropdown && (
//                 <FilterDropdown
//                   options={stateOptions}
//                   selected={selectedState}
//                   onSelect={setSelectedState}
//                   onClose={() => setShowStateDropdown(false)}
//                 />
//               )}
//             </div>

//             <div className="relative">
//               <button
//                 onClick={() => setShowHubDropdown(!showHubDropdown)}
//                 className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
//               >
//                 {selectedHub} <ChevronDown size={14} />
//               </button>
//               {showHubDropdown && (
//                 <FilterDropdown
//                   options={hubOptions}
//                   selected={selectedHub}
//                   onSelect={setSelectedHub}
//                   onClose={() => setShowHubDropdown(false)}
//                 />
//               )}
//             </div>

//             <button
//               onClick={() => setShowCustomizePopup(true)}
//               className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
//             >
//               <Settings size={14} /> Customize
//             </button>
//           </div>
//         </div>

//         {/* KPI CARDS */}
//         <div className="p-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//             <KpiCard
//               title="Revenue"
//               value="₹ 0.00"
//               subValue="₹ 0.00"
//               percentage="0%"
//               icon={<Wallet size={18} className="text-green-600" />}
//               color="bg-green-100"
//               noData={true}
//             />
//             <KpiCard
//               title="No of Sessions"
//               value="0"
//               percentage="0%"
//               icon={<Activity size={18} className="text-blue-600" />}
//               color="bg-blue-100"
//               noData={true}
//             />
//             <KpiCard
//               title="Usage"
//               value="0.00 Wh"
//               percentage="0%"
//               icon={<Zap size={18} className="text-yellow-600" />}
//               color="bg-yellow-100"
//               noData={true}
//             />
//             <KpiCard
//               title="Online Percentage/Charger"
//               value="0%"
//               percentage="0%"
//               icon={<Wifi size={18} className="text-purple-600" />}
//               color="bg-purple-100"
//               noData={true}
//             />
//           </div>

//         {/* CHARGER STATUS ROW */}
// <div className="space-y-4 mt-4">
//   <div className="w-full">
//     <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
//             <Plug size={24} className="text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-medium text-gray-500">Total Chargers</p>
//             <div className="flex items-center gap-2">
//               <p className="text-3xl font-bold text-gray-800">{totalChargers}</p>
//               <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//                 Online: {dummyChargers.filter(c => c.online).length}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-3">
//           {/* Connectors Count */}
//           <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
//             <div className="w-2 h-2 rounded-full bg-blue-500" />
//             <span className="text-xs font-medium text-gray-600">{totalConnectors} Connectors</span>
//           </div>

//           {/* Non Configured - Clickable */}
//           <button
//             onClick={() => navigate('/chargers')}
//             className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-1.5 rounded-xl border border-amber-200/60 hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
//           >
//             <div className="relative">
//               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
//               <div className="absolute -inset-1 rounded-full bg-amber-500/20 animate-ping" />
//             </div>
//             <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-800">
//               {nonConfigured} Non Configured
//             </span>
//             <ChevronRight size={14} className="text-amber-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform" />
//           </button>
//           </div>
//           </div>
//           </div></div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {/* Charger Network */}
//               <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl border border-green-200/60 p-2.5 shadow-sm hover:shadow-md transition-all duration-200">
//                 <div className="flex items-center justify-between">
//                   <div className="relative flex-1">
//                     <div className="flex items-center gap-2">
//                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                       <p className="text-[10px] font-medium text-green-700 uppercase tracking-wider">Network</p>
//                     </div>
//                     <button
//                       onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
//                       className="text-sm font-semibold text-gray-800 bg-transparent border-0 p-0 focus:ring-0 outline-none flex items-center gap-1 mt-0.5 hover:text-green-700 transition-colors"
//                     >
//                       <span className="flex items-center gap-1.5">
//                         <Wifi size={14} className="text-green-600" />
//                         {selectedNetwork}
//                       </span>
//                       <ChevronDown size={12} className="text-gray-400 group-hover:text-green-600" />
//                     </button>
//                     {showNetworkDropdown && (
//                       <FilterDropdown
//                         options={networkOptions}
//                         selected={selectedNetwork}
//                         onSelect={setSelectedNetwork}
//                         onClose={() => setShowNetworkDropdown(false)}
//                       />
//                     )}
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
//                       {selectedNetwork === "All Network" ? "All" : selectedNetwork}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Charger Connector Status */}
//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200/60 p-2.5 shadow-sm hover:shadow-md transition-all duration-200">
//                 <div className="flex items-center justify-between">
//                   <div className="relative flex-1">
//                     <div className="flex items-center gap-2">
//                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
//                       <p className="text-[10px] font-medium text-blue-700 uppercase tracking-wider">Connector Status</p>
//                     </div>
//                     <div className="flex items-center gap-1.5 mt-1 flex-wrap">
//                       <button
//                         onClick={() => handleConnectorStatusClick("All")}
//                         className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
//                           connectorFilter === "All" 
//                             ? "bg-green-600 text-white shadow-sm shadow-green-200 scale-105" 
//                             : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 hover:scale-105"
//                         }`}
//                       >
//                         <Circle size={8} className={connectorFilter === "All" ? "text-white" : "text-gray-400"} />
//                         All ({totalConnectors})
//                       </button>
//                       <button
//                         onClick={() => handleConnectorStatusClick("Busy")}
//                         className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
//                           connectorFilter === "Busy" 
//                             ? "bg-yellow-500 text-white shadow-sm shadow-yellow-200 scale-105" 
//                             : "bg-gray-100 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 hover:scale-105"
//                         }`}
//                       >
//                         <CircleDot size={8} className={connectorFilter === "Busy" ? "text-white" : "text-yellow-500"} />
//                         Busy ({totalBusy})
//                       </button>
//                       <button
//                         onClick={() => handleConnectorStatusClick("Available")}
//                         className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
//                           connectorFilter === "Available" 
//                             ? "bg-green-500 text-white shadow-sm shadow-green-200 scale-105" 
//                             : "bg-gray-100 text-green-600 hover:bg-green-100 hover:text-green-700 hover:scale-105"
//                         }`}
//                       >
//                         <CircleCheck size={8} className={connectorFilter === "Available" ? "text-white" : "text-green-500"} />
//                         Available ({totalAvailable})
//                       </button>
//                       <button
//                         onClick={() => handleConnectorStatusClick("Error")}
//                         className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
//                           connectorFilter === "Error" 
//                             ? "bg-red-500 text-white shadow-sm shadow-red-200 scale-105" 
//                             : "bg-gray-100 text-red-600 hover:bg-red-100 hover:text-red-700 hover:scale-105"
//                         }`}
//                       >
//                         <CircleX size={8} className={connectorFilter === "Error" ? "text-white" : "text-red-500"} />
//                         Error ({totalError})
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* SEARCH & CHARGER LIST + MAP */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//               <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
//                 <div className="flex items-center gap-2 flex-1">
//                   <Search size={16} className="text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search chargers..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="flex-1 bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-700 placeholder:text-gray-400 font-medium"
//                   />
//                   {searchQuery && (
//                     <button
//                       onClick={() => setSearchQuery("")}
//                       className="text-gray-400 hover:text-gray-600 transition"
//                     >
//                       <X size={14} />
//                     </button>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <span className="text-xs text-gray-400 mr-1">
//                     {filteredChargers.length} chargers
//                   </span>
//                   <button
//                     onClick={() => setViewMode("grid")}
//                     className={`p-1.5 rounded-lg transition ${
//                       viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
//                     }`}
//                   >
//                     <Grid size={16} />
//                   </button>
//                   <button
//                     onClick={() => setViewMode("list")}
//                     className={`p-1.5 rounded-lg transition ${
//                       viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
//                     }`}
//                   >
//                     <List size={16} />
//                   </button>
//                 </div>
//               </div>
              
//               <style>{`
//                 .charger-list::-webkit-scrollbar {
//                   width: 6px;
//                   height: 6px;
//                 }
//                 .charger-list::-webkit-scrollbar-track {
//                   background: #f1f1f1;
//                   border-radius: 10px;
//                 }
//                 .charger-list::-webkit-scrollbar-thumb {
//                   background: linear-gradient(180deg, #3b82f6, #2563eb);
//                   border-radius: 10px;
//                 }
//                 .charger-list::-webkit-scrollbar-thumb:hover {
//                   background: #1d4ed8;
//                 }
//                 .charger-list {
//                   scrollbar-width: thin;
//                   scrollbar-color: #3b82f6 #f1f1f1;
//                 }
//                 @keyframes fadeIn {
//                   from { opacity: 0; transform: translateY(-5px); }
//                   to { opacity: 1; transform: translateY(0); }
//                 }
//                 .animate-fadeIn {
//                   animation: fadeIn 0.3s ease-out forwards;
//                 }
//               `}</style>
              
//               <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto charger-list">
//                 {filteredChargers.length === 0 ? (
//                   <div className="text-center py-12 text-gray-400">
//                     <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                       <Plug size={32} className="text-gray-300" />
//                     </div>
//                     <p className="text-sm font-medium text-gray-500">No chargers found</p>
//                     <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
//                   </div>
//                 ) : (
//                   filteredChargers.map((charger) => (
//                     <div
//                       key={charger.id}
//                       onClick={() => setSelectedCharger(charger.id === selectedCharger ? null : charger.id)}
//                       className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
//                         selectedCharger === charger.id
//                           ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100/50"
//                           : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3 flex-1 min-w-0">
//                           <div className="relative flex-shrink-0">
//                             <div className={`w-3 h-3 rounded-full ${
//                               charger.online ? "bg-green-500" : "bg-red-500"
//                             }`}>
//                               <div className={`absolute -inset-1 rounded-full animate-ping ${
//                                 charger.online ? "bg-green-500/30" : "bg-red-500/30"
//                               }`} />
//                             </div>
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2">
//                               <p className="text-sm font-semibold text-gray-800 truncate">{charger.name}</p>
//                               <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
//                                 charger.online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                               }`}>
//                                 {charger.online ? "Online" : "Offline"}
//                               </span>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-0.5">{charger.id} • {charger.type}</p>
//                             <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
//                               <MapPin size={10} className="text-gray-400 flex-shrink-0" />
//                               <span className="truncate">{charger.location}</span>
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs text-gray-500">{charger.connectors} Connectors</span>
//                             <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
//                               {charger.capacity}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-1.5 mt-1">
//                             <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
//                               {charger.available} Avail
//                             </span>
//                             <span className="text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
//                               {charger.busy} Busy
//                             </span>
//                             {charger.error > 0 && (
//                               <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
//                                 {charger.error} Error
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
                      
//                       {selectedCharger === charger.id && (
//                         <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap items-center gap-3 text-xs animate-fadeIn">
//                           <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
//                             <CircleCheck size={12} className="text-green-500" />
//                             <span className="text-green-700 font-medium">Available: {charger.available}</span>
//                           </div>
//                           <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg">
//                             <CircleDot size={12} className="text-yellow-500" />
//                             <span className="text-yellow-700 font-medium">Busy: {charger.busy}</span>
//                           </div>
//                           <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg">
//                             <CircleX size={12} className="text-red-500" />
//                             <span className="text-red-700 font-medium">Error: {charger.error}</span>
//                           </div>
//                           <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
//                             <Building size={12} className="text-gray-500" />
//                             <span className="text-gray-600 font-medium">{charger.hub}</span>
//                           </div>
//                           <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg ml-auto">
//                             <Clock size={12} className="text-blue-500" />
//                             <span className="text-blue-600 font-medium">Last updated: 2 min ago</span>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//               <div className="p-3 border-b border-gray-200 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-medium text-gray-700">Map</span>
//                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
//                     <Map size={12} /> OpenStreetMap
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-1 text-xs text-gray-400">
//                   <MapPin size={14} />
//                   <span>Newtown, Kolkata</span>
//                 </div>
//               </div>
//               <div className="relative h-[400px] bg-[#f0f0f0]">
//                 <div className="absolute inset-0">
//                   <div className="w-full h-full" style={{
//                     backgroundImage: `
//                       radial-gradient(circle at 20% 30%, rgba(200, 220, 240, 0.4) 0%, transparent 50%),
//                       radial-gradient(circle at 80% 70%, rgba(200, 220, 240, 0.3) 0%, transparent 50%),
//                       linear-gradient(180deg, #e8f0f8 0%, #d4e4f0 100%)
//                     `
//                   }}>
//                     <div className="absolute inset-0" style={{
//                       backgroundImage: `
//                         linear-gradient(rgba(180, 200, 220, 0.2) 1px, transparent 1px),
//                         linear-gradient(90deg, rgba(180, 200, 220, 0.2) 1px, transparent 1px)
//                       `,
//                       backgroundSize: '40px 40px'
//                     }} />
                    
//                     <div className="absolute inset-0">
//                       <div className="absolute top-1/4 left-0 right-0 h-[2px] bg-[#c8d8e8]/40" />
//                       <div className="absolute top-3/4 left-0 right-0 h-[2px] bg-[#c8d8e8]/40" />
//                       <div className="absolute left-1/4 top-0 bottom-0 w-[2px] bg-[#c8d8e8]/40" />
//                       <div className="absolute left-3/4 top-0 bottom-0 w-[2px] bg-[#c8d8e8]/40" />
//                       <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#d4dce8]/20" />
//                       <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#d4dce8]/20" />
//                     </div>

//                     {filteredChargers.map((charger) => (
//                       <div
//                         key={charger.id}
//                         className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
//                         style={{
//                           left: `${30 + (charger.lng - 88.36) * 180}%`,
//                           top: `${30 - (charger.lat - 22.57) * 250}%`,
//                         }}
//                       >
//                         <div className="relative">
//                           <div className={`p-1.5 rounded-full shadow-lg transition-transform group-hover:scale-110 ${
//                             charger.online ? "bg-green-500" : "bg-red-500"
//                           } text-white border-2 border-white`}>
//                             <MapPin size={14} />
//                           </div>
//                           <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-white px-2 py-0.5 rounded text-[10px] shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
//                             {charger.name}
//                           </div>
//                         </div>
//                       </div>
//                     ))}

//                     <div className="absolute top-[15%] left-[20%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
//                       Salt Lake
//                     </div>
//                     <div className="absolute top-[40%] left-[45%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
//                       Newtown
//                     </div>
//                     <div className="absolute top-[60%] left-[65%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
//                       Rajarhat
//                     </div>
//                     <div className="absolute top-[75%] left-[30%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
//                       Airport
//                     </div>

//                     <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm">
//                       Kolkata Metropolitan Area
//                     </div>
//                   </div>
//                 </div>

//                 <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-full text-xs shadow-sm text-gray-600 flex items-center gap-1 border border-gray-200">
//                   <MapPin size={12} className="text-blue-600" /> Newtown, Kolkata
//                 </div>

//                 <div className="absolute top-3 left-3 bg-white/90 px-3 py-1.5 rounded-full text-xs shadow-sm text-gray-600 border border-gray-200">
//                   {filteredChargers.length} Chargers • {totalConnectors} Connectors
//                 </div>

//                 <div className="absolute top-3 right-3 flex flex-col gap-1">
//                   <button className="w-8 h-8 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">
//                     +
//                   </button>
//                   <button className="w-8 h-8 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">
//                     −
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Popups */}
//       {showCustomizePopup && <CustomizePopup />}
//     </div>
//   );
// };

// export default Dashboard;

// src/components/Dashboard/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  MapPin,
  Zap,
  Power,
  AlertTriangle,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Plug,
  Battery,
  Building,
  Users,
  Server,
  Activity,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Settings,
  TrendingUp,
  Calendar,
  LogOut,
  User as UserIcon,
  Plus,
  ChevronDown,
  ChevronRight,
  Menu,
  Grid,
  List,
  Eye,
  EyeOff,
  GripVertical,
  Search,
  Filter,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  Shield,
  Clock,
  Home,
  BarChart3,
  Layers,
  Upload,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Circle,
  CircleDot,
  CircleOff,
  CircleCheck,
  CircleAlert,
  CirclePower,
  CircleSlash,
  CircleX,
  Wallet,
  Map,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import Sidebar from "../Sidebar/Sidebar";

// API Configuration
const API_CONFIG = {
  USER_INFO_API: {
    BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/me'
  },
  LOGOUT_API: {
    BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/logout'
  },
  DASHBOARD_STATS_API: {
    BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/dashboard/stats'
  },
  CHARGERS_API: {
    BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/chargers'
  }
};

// ==================== KPI CARD ====================
const KpiCard = ({ title, value, subValue, percentage, icon, color, noData, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subValue && <p className="text-sm text-gray-400">{subValue}</p>}
        </div>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">{percentage || "0%"}</span>
        {noData && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            No Data Found
          </span>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    user, 
    logout, 
    authenticatedRequest, 
    isRefreshing,
    isAuthenticated 
  } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showCustomizePopup, setShowCustomizePopup] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("This Month");
  const [selectedState, setSelectedState] = useState("West Bengal");
  const [selectedNetwork, setSelectedNetwork] = useState("All Network");
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedHub, setSelectedHub] = useState("All Hubs");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showHubDropdown, setShowHubDropdown] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [connectorFilter, setConnectorFilter] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // User info states
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Dashboard data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingChargers, setLoadingChargers] = useState(false);
  const [error, setError] = useState('');

  // Dummy charger data (fallback if API fails)
  const dummyChargers = [
    {
      id: "CH-001",
      name: "Benny 7.4kWh",
      type: "AC Charger - Fast",
      status: "Online",
      connectors: 2,
      location: "Action Area III, Newtown, Kolkata",
      lat: 22.5726,
      lng: 88.3639,
      hub: "Newtown Hub",
      capacity: "7.4kWh",
      online: true,
      available: 1,
      busy: 1,
      error: 0,
    },
    {
      id: "CH-002",
      name: "Transev 60kWh",
      type: "DC Charger - Fast",
      status: "Online",
      connectors: 2,
      location: "Action Area III, Newtown, Kolkata",
      lat: 22.5726,
      lng: 88.3639,
      hub: "Newtown Hub",
      capacity: "60kWh",
      online: true,
      available: 0,
      busy: 2,
      error: 0,
    },
    {
      id: "CH-003",
      name: "EcoCharge 22kWh",
      type: "AC Charger - Fast",
      status: "Offline",
      connectors: 1,
      location: "Salt Lake, Kolkata",
      lat: 22.5776,
      lng: 88.4176,
      hub: "Salt Lake Hub",
      capacity: "22kWh",
      online: false,
      available: 0,
      busy: 0,
      error: 1,
    },
    {
      id: "CH-004",
      name: "PowerMax 150kWh",
      type: "DC Charger - Ultra Fast",
      status: "Online",
      connectors: 2,
      location: "Rajarhat, Kolkata",
      lat: 22.5926,
      lng: 88.4576,
      hub: "Rajarhat Hub",
      capacity: "150kWh",
      online: true,
      available: 2,
      busy: 0,
      error: 0,
    },
  ];

  // Filter options
  const filterOptions = ["Today", "Yesterday", "This Week", "This Month", "This Year"];
  const stateOptions = ["All States", "West Bengal"];
  const networkOptions = ["All Network", "Online", "Offline"];
  const hubOptions = ["All Hubs", "Newtown Hub", "Salt Lake Hub", "Rajarhat Hub"];

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // Fetch dashboard data using authenticatedRequest
  const fetchDashboardData = async () => {
    setError('');
    
    // Fetch dashboard stats
    setLoadingStats(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.DASHBOARD_STATS_API.BASE_URL);
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
        console.log('Dashboard stats fetched:', data);
      } else {
        console.log('Failed to fetch dashboard stats:', response.status);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }

    // Fetch chargers
    setLoadingChargers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGERS_API.BASE_URL);
      if (response.ok) {
        const data = await response.json();
        setChargers(data);
        console.log('Chargers fetched:', data);
      } else {
        console.log('Failed to fetch chargers:', response.status);
        // Use dummy data as fallback
        setChargers(dummyChargers);
      }
    } catch (err) {
      console.error('Error fetching chargers:', err);
      // Use dummy data as fallback
      setChargers(dummyChargers);
    } finally {
      setLoadingChargers(false);
    }
  };

  // Fetch user info using authenticatedRequest
  const fetchUserInfo = async () => {
    setLoadingUser(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API.BASE_URL);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User info fetched successfully:', data);
        
        const userData = data.user || data;
        const name = userData.full_name || userData.name || userData.firstname || 'User';
        const email = userData.email || userData.userEmail || '';
        const role = data.role || data.userRole || data.userType || userData.role || '';
        const avatar = userData.avatar || userData.profileImage || null;
        
        setUserName(name);
        setUserEmail(email);
        setUserRole(role);
        setUserAvatar(avatar);
        
        // Update user info in localStorage
        const userInfo = {
          name,
          email,
          role,
          avatar,
          ...data
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        console.log('Failed to fetch user info:', response.status);
        // Try to get from localStorage fallback
        const storedInfo = localStorage.getItem('userInfo');
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo);
          setUserName(parsedInfo.name || 'User');
          setUserEmail(parsedInfo.email || '');
          setUserRole(parsedInfo.role || '');
        } else if (user) {
          // Use user from auth context
          setUserName(user.name || 'User');
          setUserEmail(user.email || '');
          setUserRole(user.role || '');
        }
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      // Try to get from localStorage fallback
      const storedInfo = localStorage.getItem('userInfo');
      if (storedInfo) {
        const parsedInfo = JSON.parse(storedInfo);
        setUserName(parsedInfo.name || 'User');
        setUserEmail(parsedInfo.email || '');
        setUserRole(parsedInfo.role || '');
      } else if (user) {
        // Use user from auth context
        setUserName(user.name || 'User');
        setUserEmail(user.email || '');
        setUserRole(user.role || '');
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // Handle logout using auth context
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authenticatedRequest(API_CONFIG.LOGOUT_API.BASE_URL, {
          method: 'POST'
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout(); // Use auth context logout
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    console.log('Refreshing dashboard...');
    setRefreshKey(prev => prev + 1);
    fetchUserInfo();
    fetchDashboardData();
  };

  // Check authentication and fetch data on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    fetchUserInfo();
    fetchDashboardData();
  }, [isAuthenticated]);

  // Auto-refresh effect
  useEffect(() => {
    let intervalId = null;
    
    if (autoRefresh && isAuthenticated) {
      console.log('Auto-refresh enabled');
      intervalId = setInterval(() => {
        refreshDashboard();
      }, 30000);
    } else {
      console.log('Auto-refresh disabled');
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, isAuthenticated]);

  // Get chargers data (real or dummy)
  const displayChargers = chargers.length > 0 ? chargers : dummyChargers;

  // Filter chargers
  const filteredChargers = displayChargers.filter((charger) => {
    const matchesSearch = charger.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNetwork = selectedNetwork === "All Network" || 
                          (selectedNetwork === "Online" && charger.online) ||
                          (selectedNetwork === "Offline" && !charger.online);
    const matchesHub = selectedHub === "All Hubs" || charger.hub === selectedHub;
    
    let matchesConnectorStatus = true;
    if (connectorFilter === "Busy") {
      matchesConnectorStatus = (charger.busy || 0) > 0;
    } else if (connectorFilter === "Available") {
      matchesConnectorStatus = (charger.available || 0) > 0;
    } else if (connectorFilter === "Error") {
      matchesConnectorStatus = (charger.error || 0) > 0;
    }
    
    return matchesSearch && matchesNetwork && matchesHub && matchesConnectorStatus;
  });

  // Settings dropdown menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">{userName}</h4>
            <p className="text-sm text-gray-400 truncate">{userEmail || 'user@transev.com'}</p>
            {userRole && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
                {userRole}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/profile');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <UserIcon size={16} className="text-gray-500" /> 
          <span>Profile</span>
        </button>
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/organization');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Building size={16} className="text-gray-500" /> 
          <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
        >
          <LogOut size={16} className="text-red-500" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add dropdown menu
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-hub");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Plus size={18} className="text-gray-500" /> Add Hub
        </button>
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-charger");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Plus size={18} className="text-gray-500" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Calendar popup (keep existing implementation)
  const CalendarPopup = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [localSelectedDate, setLocalSelectedDate] = useState(null);

    const daysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      return { days, firstDay };
    };

    const { days, firstDay } = daysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const year = currentMonth.getFullYear();

    const handleDateSelect = (day) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setLocalSelectedDate(date);
      setSelectedDate(date);
      setSelectedFilter(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      setShowCalendar(false);
    };

    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 w-[320px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <ChevronDown size={18} className="rotate-90" />
          </button>
          <span className="font-semibold text-gray-800">{monthName} {year}</span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <ChevronDown size={18} className="-rotate-90" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="py-1" />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentMonth.getMonth() &&
                           new Date().getFullYear() === currentMonth.getFullYear();
            const isSelected = localSelectedDate && 
                              localSelectedDate.getDate() === day &&
                              localSelectedDate.getMonth() === currentMonth.getMonth() &&
                              localSelectedDate.getFullYear() === currentMonth.getFullYear();
            return (
              <button
                key={day}
                onClick={() => handleDateSelect(day)}
                className={`py-1 rounded-lg text-sm transition ${
                  isSelected ? 'bg-blue-600 text-white' :
                  isToday ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => {
              setSelectedFilter("Today");
              setSelectedDate(new Date());
              setShowCalendar(false);
            }}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Today
          </button>
          <button
            onClick={() => setShowCalendar(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Customize popup (keep existing implementation)
  const CustomizePopup = () => {
    const [selectedKPIs, setSelectedKPIs] = useState([
      { id: 'revenue', title: 'Revenue', icon: 'wallet', color: 'bg-green-100' },
      { id: 'sessions', title: 'No of Sessions', icon: 'activity', color: 'bg-blue-100' },
      { id: 'usage', title: 'Usage', icon: 'zap', color: 'bg-yellow-100' },
      { id: 'online', title: 'Online Percentage/Charger', icon: 'wifi', color: 'bg-purple-100' },
    ]);
    
    const [availableKPIs, setAvailableKPIs] = useState([
      { id: 'energy', title: 'Total Energy', icon: 'battery', color: 'bg-indigo-100' },
      { id: 'active', title: 'Active Sessions', icon: 'activity', color: 'bg-pink-100' },
      { id: 'revenuePerCharger', title: 'Revenue per Charger', icon: 'dollar', color: 'bg-orange-100' },
    ]);

    const [localSelected, setLocalSelected] = useState([...selectedKPIs]);
    const [localAvailable, setLocalAvailable] = useState([...availableKPIs]);
    const [dragItem, setDragItem] = useState(null);

    const handleDragStart = (e, item, type) => {
      setDragItem({ item, type });
      e.dataTransfer.effectsAllowed = 'move';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetType, targetIndex) => {
      e.preventDefault();
      if (!dragItem) return;

      const { item, type } = dragItem;
      
      if (type === 'selected' && targetType === 'selected') {
        const newSelected = [...localSelected];
        const fromIndex = newSelected.findIndex(k => k.id === item.id);
        newSelected.splice(fromIndex, 1);
        newSelected.splice(targetIndex, 0, item);
        setLocalSelected(newSelected);
      } else if (type === 'selected' && targetType === 'available') {
        const newSelected = localSelected.filter(k => k.id !== item.id);
        const newAvailable = [...localAvailable, item];
        setLocalSelected(newSelected);
        setLocalAvailable(newAvailable);
      } else if (type === 'available' && targetType === 'available') {
        const newAvailable = [...localAvailable];
        const fromIndex = newAvailable.findIndex(k => k.id === item.id);
        newAvailable.splice(fromIndex, 1);
        newAvailable.splice(targetIndex, 0, item);
        setLocalAvailable(newAvailable);
      } else if (type === 'available' && targetType === 'selected') {
        const newAvailable = localAvailable.filter(k => k.id !== item.id);
        const newSelected = [...localSelected, item];
        setLocalSelected(newSelected);
        setLocalAvailable(newAvailable);
      }
      
      setDragItem(null);
    };

    const handleApply = () => {
      setShowCustomizePopup(false);
    };

    const handleReset = () => {
      setLocalSelected([
        { id: 'revenue', title: 'Revenue', icon: 'wallet', color: 'bg-green-100' },
        { id: 'sessions', title: 'No of Sessions', icon: 'activity', color: 'bg-blue-100' },
        { id: 'usage', title: 'Usage', icon: 'zap', color: 'bg-yellow-100' },
        { id: 'online', title: 'Online Percentage/Charger', icon: 'wifi', color: 'bg-purple-100' },
      ]);
      setLocalAvailable([
        { id: 'energy', title: 'Total Energy', icon: 'battery', color: 'bg-indigo-100' },
        { id: 'active', title: 'Active Sessions', icon: 'activity', color: 'bg-pink-100' },
        { id: 'revenuePerCharger', title: 'Revenue per Charger', icon: 'dollar', color: 'bg-orange-100' },
      ]);
    };

    const getIcon = (iconName) => {
      switch(iconName) {
        case 'wallet': return <Wallet size={16} className="text-green-600" />;
        case 'activity': return <Activity size={16} className="text-blue-600" />;
        case 'zap': return <Zap size={16} className="text-yellow-600" />;
        case 'wifi': return <Wifi size={16} className="text-purple-600" />;
        case 'battery': return <Battery size={16} className="text-indigo-600" />;
        case 'dollar': return <DollarSign size={16} className="text-orange-600" />;
        default: return <Activity size={16} className="text-gray-600" />;
      }
    };

    return (
      <>
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setShowCustomizePopup(false)}
        />
        
        <div 
          className="fixed top-0 right-0 h-full w-[480px] max-w-[90vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #3b82f6, #8b5cf6);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #2563eb, #7c3aed);
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #3b82f6 transparent;
            }
            .drag-item {
              transition: all 0.2s ease;
            }
            .drag-item:active {
              cursor: grabbing;
            }
          `}</style>
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Settings size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Customize KPIs</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Drag and drop to rearrange</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomizePopup(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white hover:rotate-90 duration-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
            <div className="space-y-6">
              {/* Selected KPIs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-blue-500" />
                    <p className="text-sm font-semibold text-gray-700">Selected KPIs</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {localSelected.length} of {selectedKPIs.length + availableKPIs.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[120px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl p-3 border-2 border-dashed border-blue-200">
                  {localSelected.map((kpi, index) => (
                    <div
                      key={kpi.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, kpi, 'selected')}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'selected', index)}
                      className="drag-item flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200 cursor-grab hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                      <GripVertical size={16} className="text-gray-300 group-hover:text-blue-400 transition" />
                      <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center shadow-sm`}>
                        {getIcon(kpi.icon)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 flex-1">{kpi.title}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          #{index + 1}
                        </span>
                        <Eye size={15} className="text-blue-500" />
                      </div>
                    </div>
                  ))}
                  {localSelected.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus size={20} className="text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-500">Drop KPIs here</p>
                      <p className="text-xs text-gray-400 mt-0.5">Drag from below to add</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Available KPIs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">More KPIs</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {localAvailable.length} available
                  </span>
                </div>
                <div className="space-y-2 min-h-[80px] bg-gradient-to-b from-gray-50/50 to-transparent rounded-xl p-3 border-2 border-dashed border-gray-200">
                  {localAvailable.map((kpi, index) => (
                    <div
                      key={kpi.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, kpi, 'available')}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'available', index)}
                      className="drag-item flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-grab hover:shadow-md hover:border-gray-300 transition-all group"
                    >
                      <GripVertical size={16} className="text-gray-300 group-hover:text-gray-400 transition" />
                      <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center shadow-sm`}>
                        {getIcon(kpi.icon)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 flex-1">{kpi.title}</span>
                      <div className="flex items-center gap-1">
                        <EyeOff size={15} className="text-gray-300 group-hover:text-gray-400 transition" />
                      </div>
                    </div>
                  ))}
                  {localAvailable.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} className="text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-500">All KPIs selected</p>
                      <p className="text-xs text-gray-400 mt-0.5">Drag some back to add</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <button
                onClick={handleApply}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02]"
              >
                Apply Changes
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Filter Dropdown
  const FilterDropdown = ({ options, selected, onSelect, onClose }) => (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => { onSelect(opt); onClose(); }}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
            selected === opt ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  // Calculate stats
  const totalChargers = filteredChargers.length;
  const totalConnectors = filteredChargers.reduce((sum, c) => sum + (c.connectors || 0), 0);
  const totalAvailable = filteredChargers.reduce((sum, c) => sum + (c.available || 0), 0);
  const totalBusy = filteredChargers.reduce((sum, c) => sum + (c.busy || 0), 0);
  const totalError = filteredChargers.reduce((sum, c) => sum + (c.error || 0), 0);
  const nonConfigured = 1;

  const handleConnectorStatusClick = (status) => {
    setConnectorFilter(status);
  };

  // Show loading if refreshing
  if (isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Refreshing session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" key={refreshKey}>
      <Sidebar 
        isDarkMode={isDarkMode} 
        onThemeToggle={handleThemeToggle}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-800">
                Welcome, <span className="text-gray-900">{userName}</span>
                <span className="text-sm font-normal text-blue-600 ml-2">/ Trans ev</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 relative">
              {/* Auto Refresh Toggle */}
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                <span className="text-[15px] text-gray-600 font-medium">Auto Refresh</span>
                <button
                  onClick={() => {
                    setAutoRefresh(!autoRefresh);
                    if (!autoRefresh) {
                      refreshDashboard();
                    }
                  }}
                  className={`w-7 h-3.5 rounded-full transition-all relative ${
                    autoRefresh ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${
                      autoRefresh ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Settings Icon with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <Settings size={18} className="text-gray-600" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              {/* Add Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus size={16} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* FILTER SECTION */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium transition flex items-center gap-1"
              >
                {selectedFilter} <ChevronDown size={14} />
              </button>
              {showFilterDropdown && (
                <FilterDropdown
                  options={filterOptions}
                  selected={selectedFilter}
                  onSelect={setSelectedFilter}
                  onClose={() => setShowFilterDropdown(false)}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
              >
                <Calendar size={14} /> Calendar
              </button>
              {showCalendar && <CalendarPopup />}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowStateDropdown(!showStateDropdown)}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
              >
                {selectedState} <ChevronDown size={14} />
              </button>
              {showStateDropdown && (
                <FilterDropdown
                  options={stateOptions}
                  selected={selectedState}
                  onSelect={setSelectedState}
                  onClose={() => setShowStateDropdown(false)}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowHubDropdown(!showHubDropdown)}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
              >
                {selectedHub} <ChevronDown size={14} />
              </button>
              {showHubDropdown && (
                <FilterDropdown
                  options={hubOptions}
                  selected={selectedHub}
                  onSelect={setSelectedHub}
                  onClose={() => setShowHubDropdown(false)}
                />
              )}
            </div>

            <button
              onClick={() => setShowCustomizePopup(true)}
              className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
            >
              <Settings size={14} /> Customize
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              title="Revenue"
              value={dashboardStats?.revenue ? `₹ ${dashboardStats.revenue}` : "₹ 0.00"}
              subValue={dashboardStats?.revenueSub || "₹ 0.00"}
              percentage={`${dashboardStats?.revenuePercentage || 0}%`}
              icon={<Wallet size={18} className="text-green-600" />}
              color="bg-green-100"
              noData={!dashboardStats?.revenue}
            />
            <KpiCard
              title="No of Sessions"
              value={dashboardStats?.sessions || 0}
              percentage={`${dashboardStats?.sessionsPercentage || 0}%`}
              icon={<Activity size={18} className="text-blue-600" />}
              color="bg-blue-100"
              noData={!dashboardStats?.sessions}
            />
            <KpiCard
              title="Usage"
              value={dashboardStats?.usage ? `${dashboardStats.usage} Wh` : "0.00 Wh"}
              percentage={`${dashboardStats?.usagePercentage || 0}%`}
              icon={<Zap size={18} className="text-yellow-600" />}
              color="bg-yellow-100"
              noData={!dashboardStats?.usage}
            />
            <KpiCard
              title="Online Percentage/Charger"
              value={dashboardStats?.onlinePercentage ? `${dashboardStats.onlinePercentage}%` : "0%"}
              percentage={`${dashboardStats?.onlinePercentage || 0}%`}
              icon={<Wifi size={18} className="text-purple-600" />}
              color="bg-purple-100"
              noData={!dashboardStats?.onlinePercentage}
            />
          </div>

          {/* CHARGER STATUS ROW */}
          <div className="space-y-4 mt-4">
            <div className="w-full">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Plug size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Chargers</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-gray-800">{totalChargers}</p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Online: {displayChargers.filter(c => c.online).length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Connectors Count */}
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-gray-600">{totalConnectors} Connectors</span>
                    </div>

                    {/* Non Configured - Clickable */}
                    <button
                      onClick={() => navigate('/chargers')}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-1.5 rounded-xl border border-amber-200/60 hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <div className="absolute -inset-1 rounded-full bg-amber-500/20 animate-ping" />
                      </div>
                      <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                        {nonConfigured} Non Configured
                      </span>
                      <ChevronRight size={14} className="text-amber-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Charger Network */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl border border-green-200/60 p-2.5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[10px] font-medium text-green-700 uppercase tracking-wider">Network</p>
                    </div>
                    <button
                      onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                      className="text-sm font-semibold text-gray-800 bg-transparent border-0 p-0 focus:ring-0 outline-none flex items-center gap-1 mt-0.5 hover:text-green-700 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Wifi size={14} className="text-green-600" />
                        {selectedNetwork}
                      </span>
                      <ChevronDown size={12} className="text-gray-400 group-hover:text-green-600" />
                    </button>
                    {showNetworkDropdown && (
                      <FilterDropdown
                        options={networkOptions}
                        selected={selectedNetwork}
                        onSelect={setSelectedNetwork}
                        onClose={() => setShowNetworkDropdown(false)}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {selectedNetwork === "All Network" ? "All" : selectedNetwork}
                    </span>
                  </div>
                </div>
              </div>

              {/* Charger Connector Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200/60 p-2.5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <p className="text-[10px] font-medium text-blue-700 uppercase tracking-wider">Connector Status</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <button
                        onClick={() => handleConnectorStatusClick("All")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "All" 
                            ? "bg-green-600 text-white shadow-sm shadow-green-200 scale-105" 
                            : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 hover:scale-105"
                        }`}
                      >
                        <Circle size={8} className={connectorFilter === "All" ? "text-white" : "text-gray-400"} />
                        All ({totalConnectors})
                      </button>
                      <button
                        onClick={() => handleConnectorStatusClick("Busy")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "Busy" 
                            ? "bg-yellow-500 text-white shadow-sm shadow-yellow-200 scale-105" 
                            : "bg-gray-100 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 hover:scale-105"
                        }`}
                      >
                        <CircleDot size={8} className={connectorFilter === "Busy" ? "text-white" : "text-yellow-500"} />
                        Busy ({totalBusy})
                      </button>
                      <button
                        onClick={() => handleConnectorStatusClick("Available")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "Available" 
                            ? "bg-green-500 text-white shadow-sm shadow-green-200 scale-105" 
                            : "bg-gray-100 text-green-600 hover:bg-green-100 hover:text-green-700 hover:scale-105"
                        }`}
                      >
                        <CircleCheck size={8} className={connectorFilter === "Available" ? "text-white" : "text-green-500"} />
                        Available ({totalAvailable})
                      </button>
                      <button
                        onClick={() => handleConnectorStatusClick("Error")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "Error" 
                            ? "bg-red-500 text-white shadow-sm shadow-red-200 scale-105" 
                            : "bg-gray-100 text-red-600 hover:bg-red-100 hover:text-red-700 hover:scale-105"
                        }`}
                      >
                        <CircleX size={8} className={connectorFilter === "Error" ? "text-white" : "text-red-500"} />
                        Error ({totalError})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH & CHARGER LIST + MAP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2 flex-1">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search chargers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-700 placeholder:text-gray-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 mr-1">
                    {filteredChargers.length} chargers
                  </span>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
              
              <style>{`
                .charger-list::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                .charger-list::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                .charger-list::-webkit-scrollbar-thumb {
                  background: linear-gradient(180deg, #3b82f6, #2563eb);
                  border-radius: 10px;
                }
                .charger-list::-webkit-scrollbar-thumb:hover {
                  background: #1d4ed8;
                }
                .charger-list {
                  scrollbar-width: thin;
                  scrollbar-color: #3b82f6 #f1f1f1;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-5px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                  animation: fadeIn 0.3s ease-out forwards;
                }
              `}</style>
              
              <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto charger-list">
                {loadingChargers ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-3">Loading chargers...</p>
                  </div>
                ) : filteredChargers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plug size={32} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No chargers found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredChargers.map((charger) => (
                    <div
                      key={charger.id}
                      onClick={() => setSelectedCharger(charger.id === selectedCharger ? null : charger.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                        selectedCharger === charger.id
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100/50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${
                              charger.online ? "bg-green-500" : "bg-red-500"
                            }`}>
                              <div className={`absolute -inset-1 rounded-full animate-ping ${
                                charger.online ? "bg-green-500/30" : "bg-red-500/30"
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800 truncate">{charger.name}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                charger.online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {charger.online ? "Online" : "Offline"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{charger.id} • {charger.type}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{charger.location}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{charger.connectors} Connectors</span>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                              {charger.capacity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                              {charger.available} Avail
                            </span>
                            <span className="text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                              {charger.busy} Busy
                            </span>
                            {charger.error > 0 && (
                              <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                {charger.error} Error
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {selectedCharger === charger.id && (
                        <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap items-center gap-3 text-xs animate-fadeIn">
                          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                            <CircleCheck size={12} className="text-green-500" />
                            <span className="text-green-700 font-medium">Available: {charger.available}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            <CircleDot size={12} className="text-yellow-500" />
                            <span className="text-yellow-700 font-medium">Busy: {charger.busy}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg">
                            <CircleX size={12} className="text-red-500" />
                            <span className="text-red-700 font-medium">Error: {charger.error}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Building size={12} className="text-gray-500" />
                            <span className="text-gray-600 font-medium">{charger.hub}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg ml-auto">
                            <Clock size={12} className="text-blue-500" />
                            <span className="text-blue-600 font-medium">Last updated: 2 min ago</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Map</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Map size={12} /> OpenStreetMap
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={14} />
                  <span>Newtown, Kolkata</span>
                </div>
              </div>
              <div className="relative h-[400px] bg-[#f0f0f0]">
                <div className="absolute inset-0">
                  <div className="w-full h-full" style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 30%, rgba(200, 220, 240, 0.4) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(200, 220, 240, 0.3) 0%, transparent 50%),
                      linear-gradient(180deg, #e8f0f8 0%, #d4e4f0 100%)
                    `
                  }}>
                    <div className="absolute inset-0" style={{
                      backgroundImage: `
                        linear-gradient(rgba(180, 200, 220, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(180, 200, 220, 0.2) 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px'
                    }} />
                    
                    <div className="absolute inset-0">
                      <div className="absolute top-1/4 left-0 right-0 h-[2px] bg-[#c8d8e8]/40" />
                      <div className="absolute top-3/4 left-0 right-0 h-[2px] bg-[#c8d8e8]/40" />
                      <div className="absolute left-1/4 top-0 bottom-0 w-[2px] bg-[#c8d8e8]/40" />
                      <div className="absolute left-3/4 top-0 bottom-0 w-[2px] bg-[#c8d8e8]/40" />
                      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#d4dce8]/20" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#d4dce8]/20" />
                    </div>

                    {filteredChargers.map((charger) => (
                      <div
                        key={charger.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{
                          left: `${30 + (charger.lng - 88.36) * 180}%`,
                          top: `${30 - (charger.lat - 22.57) * 250}%`,
                        }}
                      >
                        <div className="relative">
                          <div className={`p-1.5 rounded-full shadow-lg transition-transform group-hover:scale-110 ${
                            charger.online ? "bg-green-500" : "bg-red-500"
                          } text-white border-2 border-white`}>
                            <MapPin size={14} />
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-white px-2 py-0.5 rounded text-[10px] shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {charger.name}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="absolute top-[15%] left-[20%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
                      Salt Lake
                    </div>
                    <div className="absolute top-[40%] left-[45%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
                      Newtown
                    </div>
                    <div className="absolute top-[60%] left-[65%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
                      Rajarhat
                    </div>
                    <div className="absolute top-[75%] left-[30%] text-[10px] text-gray-500 font-medium bg-white/60 px-2 py-0.5 rounded shadow-sm">
                      Airport
                    </div>

                    <div className="absolute top-[5%] left-[50%] transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                      Kolkata Metropolitan Area
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-full text-xs shadow-sm text-gray-600 flex items-center gap-1 border border-gray-200">
                  <MapPin size={12} className="text-blue-600" /> Newtown, Kolkata
                </div>

                <div className="absolute top-3 left-3 bg-white/90 px-3 py-1.5 rounded-full text-xs shadow-sm text-gray-600 border border-gray-200">
                  {filteredChargers.length} Chargers • {totalConnectors} Connectors
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <button className="w-8 h-8 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">
                    +
                  </button>
                  <button className="w-8 h-8 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">
                    −
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showCustomizePopup && <CustomizePopup />}
    </div>
  );
};

export default Dashboard;
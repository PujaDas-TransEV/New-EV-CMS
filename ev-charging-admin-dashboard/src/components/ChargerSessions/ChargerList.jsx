// src/components/ChargerSessions/ChargerList.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../Authentication/AuthContext';
// import {
//   Settings,
//   Plus,
//   ChevronDown,
//   User,
//   Building,
//   LogOut,
//   Search,
//   Filter,
//   Wifi,
//   WifiOff,
//   Zap,
//   Plug,
//   Battery,
//   Activity,
//   Clock,
//   Calendar,
//   MapPin,
//   Globe,
//   Smartphone,
//   Monitor,
//   Server,
//   Shield,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Circle,
//   CircleDot,
//   CircleCheck,
//   CircleX,
//   Grid,
//   List,
//   ChevronRight,
//   X,
//   Power,
//   RefreshCw,
//   Download,
//   Upload,
//   Edit,
//   Trash2,
//   MoreVertical,
//   Eye,
//   EyeOff,
//   GripVertical,
//   ChevronLeft,
//   ChevronRight as ChevronRightIcon,
//   Loader2,
//   CircleOff,
//   CircleAlert,
//   PowerOff,
//   Power as PowerIcon,
//   TrendingUp,
//   TrendingDown,
//   BarChart3,
//   PieChart,
//   LayoutGrid,
//   List as ListIcon,
//   Table as TableIcon,
//   ChevronLeft as ChevronLeftIcon
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
// };

// const ChargersAndSessions = () => {
//   const navigate = useNavigate();
//   const { 
//     authenticatedRequest, 
//     logout, 
//     isRefreshing,
//     isAuthenticated,
//     user 
//   } = useAuth();
  
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('chargers');
  
//   // Chargers state
//   const [chargers, setChargers] = useState([]);
//   const [pagination, setPagination] = useState({
//     before: null,
//     before_id: null,
//     limit: 50,
//     has_more: false,
//     total: 0
//   });
//   const [loadingMore, setLoadingMore] = useState(false);
  
//   // Filter states
//   const [connectorStatusFilter, setConnectorStatusFilter] = useState('All');
//   const [chargerStatusFilter, setChargerStatusFilter] = useState('All');

//   // Dummy sessions data
//   const dummySessions = [
//     {
//       id: "SES-001",
//       session_id: "SES-2026-001",
//       hub_name: "Newtown Hub",
//       charger_name: "Benny 7.4kWh",
//       driver_name: "John Doe",
//       start_time: "2026-08-03T14:30:00+05:30",
//       duration_minutes: 135,
//       energy_consumed: 45.5,
//       status: "Completed",
//       cost: "₹ 386.75",
//       anomaly_detected: false
//     }
//   ];

//   // Check authentication on mount
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//     fetchChargers();
//   }, [isAuthenticated, navigate]);

//   // Fetch chargers using authenticatedRequest
//   const fetchChargers = useCallback(async (before = null, before_id = null) => {
//     if (loadingMore) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       let url = `${API_CONFIG.CHARGERS_API}?limit=${pagination.limit}`;
//       if (before) {
//         url += `&before=${before}`;
//       }
//       if (before_id) {
//         url += `&before_id=${before_id}`;
//       }

//       const response = await authenticatedRequest(url, {
//         method: 'GET'
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const chargersData = data.chargers || data.data || data || [];
//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;
//         const total = data.total || chargersData.length;

//         setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
//         setPagination({
//           before: nextBefore,
//           before_id: nextBeforeId,
//           limit: pagination.limit,
//           has_more: hasMore,
//           total: total
//         });
//       } else {
//         setError(data.message || data.error?.message || 'Failed to fetch chargers');
//       }
//     } catch (error) {
//       console.error('Error fetching chargers:', error);
//       setError(error.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   }, [pagination.limit, loadingMore, authenticatedRequest]);

//   // Load more chargers
//   const loadMoreChargers = () => {
//     if (pagination.has_more && !loadingMore && !loading) {
//       setLoadingMore(true);
//       fetchChargers(pagination.before, pagination.before_id);
//     }
//   };

//   // Fetch user info using authenticatedRequest
//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
//         method: 'GET'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUserData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       navigate('/signin');
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   // Navigate to charger details
//   const handleViewCharger = (chargerId) => {
//     navigate(`/charger-details/${chargerId}`);
//   };

//   // Navigate to sessions
//   const handleGoToSessions = () => {
//     navigate('/sessions');
//   };

//   // Settings Dropdown Menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
//             {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">
//               {userData?.user?.full_name || user?.name || 'User'}
//             </h4>
//             <p className="text-sm text-gray-400 truncate">
//               {userData?.user?.email || user?.email || 'user@transev.com'}
//             </p>
//             {userData?.role && (
//               <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
//                 {userData.role}
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
//           <User size={16} className="text-gray-500" /> 
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
//           onClick={() => {
//             setShowSettingsMenu(false);
//             handleLogout();
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
//         >
//           <LogOut size={16} className="text-red-500" /> 
//           <span>Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Add Dropdown Menu
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
//           <Plus size={18} className="text-gray-400" /> Add Hub
//         </button>
//         <button 
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate("/add-charger");
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Zap size={18} className="text-gray-400" /> Add Charger
//         </button>
//       </div>
//     </div>
//   );

//   // Get charger status color
//   const getChargerStatusColor = (status) => {
//     const colors = {
//       'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
//       'CHARGING': 'bg-blue-100 text-blue-700 border-blue-200',
//       'PREPARING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
//       'SUSPENDED_EV': 'bg-orange-100 text-orange-700 border-orange-200',
//       'SUSPENDED_EVSE': 'bg-orange-100 text-orange-700 border-orange-200',
//       'FINISHING': 'bg-purple-100 text-purple-700 border-purple-200',
//       'RESERVED': 'bg-indigo-100 text-indigo-700 border-indigo-200',
//       'UNAVAILABLE': 'bg-red-100 text-red-700 border-red-200',
//       'FAULTED': 'bg-red-100 text-red-700 border-red-200',
//       'OFFLINE': 'bg-gray-100 text-gray-700 border-gray-200',
//       'UNDER_MAINTENANCE': 'bg-amber-100 text-amber-700 border-amber-200',
//       'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
//       'INACTIVE': 'bg-red-100 text-red-700 border-red-200',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
//   };

//   const getChargerStatusIcon = (status) => {
//     switch(status?.toUpperCase()) {
//       case 'AVAILABLE':
//       case 'ACTIVE':
//         return <CheckCircle className="w-3 h-3" />;
//       case 'CHARGING':
//         return <Zap className="w-3 h-3" />;
//       case 'OFFLINE':
//         return <WifiOff className="w-3 h-3" />;
//       case 'FAULTED':
//       case 'UNAVAILABLE':
//       case 'INACTIVE':
//         return <AlertCircle className="w-3 h-3" />;
//       case 'UNDER_MAINTENANCE':
//         return <Wifi className="w-3 h-3" />;
//       default:
//         return <Clock className="w-3 h-3" />;
//     }
//   };

//   // Filter chargers based on search and filters
//   const filteredChargers = chargers.filter(charger => {
//     const matchesSearch = 
//       (charger.charger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (charger.charger_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (charger.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (charger.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
//     // Connector status filter
//     let matchesConnectorStatus = true;
//     if (connectorStatusFilter !== 'All') {
//       const status = charger.status?.toUpperCase() || '';
//       if (connectorStatusFilter === 'Available') {
//         matchesConnectorStatus = status === 'AVAILABLE' || status === 'ACTIVE';
//       } else if (connectorStatusFilter === 'Busy') {
//         matchesConnectorStatus = status === 'CHARGING' || status === 'PREPARING';
//       } else if (connectorStatusFilter === 'Error') {
//         matchesConnectorStatus = status === 'FAULTED' || status === 'UNAVAILABLE';
//       } else if (connectorStatusFilter === 'Unavailable') {
//         matchesConnectorStatus = status === 'OFFLINE' || status === 'UNDER_MAINTENANCE' || status === 'INACTIVE';
//       }
//     }
    
//     // Charger status filter
//     const matchesChargerStatus = chargerStatusFilter === 'All' || 
//       charger.status?.toUpperCase() === chargerStatusFilter.toUpperCase();
    
//     return matchesSearch && matchesConnectorStatus && matchesChargerStatus;
//   });

//   // Stats
//   const totalChargers = chargers.length;
//   const activeChargers = chargers.filter(c => c.status === 'ACTIVE' || c.status === 'AVAILABLE' || c.status === 'CHARGING').length;
//   const inactiveChargers = chargers.filter(c => c.status === 'INACTIVE' || c.status === 'OFFLINE' || c.status === 'UNAVAILABLE').length;
//   const faultedChargers = chargers.filter(c => c.status === 'FAULTED').length;

//   // Connector status counts
//   const availableCount = chargers.filter(c => c.status === 'AVAILABLE' || c.status === 'ACTIVE').length;
//   const busyCount = chargers.filter(c => c.status === 'CHARGING' || c.status === 'PREPARING').length;
//   const errorCount = chargers.filter(c => c.status === 'FAULTED' || c.status === 'UNAVAILABLE').length;
//   const unavailableCount = chargers.filter(c => c.status === 'OFFLINE' || c.status === 'UNDER_MAINTENANCE' || c.status === 'INACTIVE').length;

//   // Show loading if refreshing
//   if (isRefreshing && loading) {
//     return (
//       <div className="min-h-screen bg-white flex">
//         <Sidebar />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600">Refreshing session...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex">
//       <Sidebar 
//         isDarkMode={isDarkMode} 
//         onThemeToggle={handleThemeToggle}
//         userName={userData?.user?.full_name || user?.name || 'User'}
//         userEmail={userData?.user?.email || user?.email || ''}
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         {/* HEADER */}
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1 text-sm text-gray-500">
//                  <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
//                 <button 
//                   onClick={() => navigate('/dashboard')}
//                   className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
//                 >
//                     /  Dashboard
//                 </button>
//                 <span className="text-gray-400">/</span>
//                 <span className="text-gray-700 font-medium">Chargers</span>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2 relative">
//               <div className="relative">
//                 <button
//                   onClick={() => setShowSettingsMenu(!showSettingsMenu)}
//                   className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
//                 >
//                   <Settings size={20} />
//                   <ChevronDown size={16} />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowAddMenu(!showAddMenu)}
//                   className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//                 >
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Title */}
//         <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-green-700">Charger Management</h1>
//               <p className="text-sm text-gray-500 mt-0.5">Manage all EV charging stations and monitor sessions</p>
//             </div>
//             <button
//               onClick={() => navigate('/add-charger')}
//               className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25"
//             >
//               <Plus size={18} />
//               Add Charger
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white border-b border-gray-200 px-6">
//           <div className="flex items-center gap-8">
//             <button
//               onClick={() => setActiveTab('chargers')}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 activeTab === 'chargers' 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <Zap size={18} />
//               <span className="font-medium">Chargers</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{totalChargers}</span>
//             </button>
//             <button
//               onClick={handleGoToSessions}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 activeTab === 'sessions' 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <Activity size={18} />
//               <span className="font-medium">Sessions</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{dummySessions.length}</span>
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Chargers</p>
//                   <p className="text-2xl font-bold text-gray-900 mt-1">{totalChargers}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
//                   <Zap className="w-5 h-5 text-blue-600" />
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">
//                 {activeChargers} active • {inactiveChargers} inactive
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Active</p>
//                   <p className="text-2xl font-bold text-emerald-600 mt-1">{activeChargers}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
//                   <PowerIcon className="w-5 h-5 text-emerald-600" />
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">
//                 {totalChargers > 0 ? Math.round((activeChargers / totalChargers) * 100) : 0}% online
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Inactive</p>
//                   <p className="text-2xl font-bold text-gray-600 mt-1">{inactiveChargers}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center">
//                   <PowerOff className="w-5 h-5 text-gray-600" />
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">
//                 Needs attention
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Faulted</p>
//                   <p className="text-2xl font-bold text-red-600 mt-1">{faultedChargers}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
//                   <AlertCircle className="w-5 h-5 text-red-600" />
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">
//                 Requires immediate action
//               </p>
//             </div>
//           </div>

//           {/* Filters Row */}
//           <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//             {/* Left Side - Connector Status */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Plug size={16} className="text-blue-500" />
//                 Connector Status:
//               </span>
//               <div className="flex items-center gap-1.5 flex-wrap">
//                 <button
//                   onClick={() => setConnectorStatusFilter('All')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'All'
//                       ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Circle className="w-3 h-3 text-blue-500" />
//                   All ({totalChargers})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Available')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Available'
//                       ? 'bg-green-50 text-green-700 border-green-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <CheckCircle className="w-3 h-3 text-green-500" />
//                   Available ({availableCount})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Busy')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Busy'
//                       ? 'bg-yellow-50 text-yellow-700 border-yellow-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Zap className="w-3 h-3 text-yellow-500" />
//                   Busy ({busyCount})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Error')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Error'
//                       ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <AlertCircle className="w-3 h-3 text-red-500" />
//                   Error ({errorCount})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Unavailable')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Unavailable'
//                       ? 'bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <CircleOff className="w-3 h-3 text-gray-500" />
//                   Unavailable ({unavailableCount})
//                 </button>
//               </div>
//             </div>

//             {/* Right Side - Charger Status with Search */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Battery size={16} className="text-blue-500" />
//                 Charger Status:
//               </span>
//               <select
//                 value={chargerStatusFilter}
//                 onChange={(e) => setChargerStatusFilter(e.target.value)}
//                 className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All Status</option>
//                 <option value="AVAILABLE">Available</option>
//                 <option value="CHARGING">Charging</option>
//                 <option value="OFFLINE">Offline</option>
//                 <option value="FAULTED">Faulted</option>
//                 <option value="UNAVAILABLE">Unavailable</option>
//                 <option value="UNDER_MAINTENANCE">Under Maintenance</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="INACTIVE">Inactive</option>
//               </select>

//               <div className="relative">
//                 <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search chargers..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 bg-white"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//             {loading && chargers.length === 0 ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                   <p className="mt-4 text-gray-600">Loading chargers...</p>
//                 </div>
//               </div>
//             ) : error ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                   <p className="text-gray-600">{error}</p>
//                   <button
//                     onClick={() => fetchChargers()}
//                     className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//                   >
//                     Retry
//                   </button>
//                 </div>
//               </div>
//             ) : filteredChargers.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-16">
//                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                   <Plug className="w-10 h-10 text-gray-300" />
//                 </div>
//                 <p className="text-lg font-semibold text-gray-600">No Chargers Found</p>
//                 <p className="text-sm text-gray-400 mt-1">
//                   {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first charger'}
//                 </p>
//                 {!searchQuery && connectorStatusFilter === 'All' && chargerStatusFilter === 'All' && (
//                   <button
//                     onClick={() => navigate('/add-charger')}
//                     className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
//                   >
//                     <Plus size={18} />
//                     Add Charger
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gradient-to-r from-blue-50/80 to-gray-50/80 border-b border-gray-200">
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger ID</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Power</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connectors</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredChargers.map((charger, index) => (
//                         <tr key={charger.id || charger.charger_id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
//                           <td className="px-4 py-3 text-sm text-gray-400 font-medium">{String(index + 1).padStart(2, '0')}</td>
//                           <td className="px-4 py-3 text-sm font-mono text-gray-600">
//                             {charger.charger_id || charger.id?.slice(0, 6) || 'N/A'}
//                           </td>
//                           <td className="px-4 py-3 text-sm font-medium text-gray-800">
//                             {charger.charger_name || charger.name || 'Unnamed'}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-500">
//                             {charger.serial_number || 'N/A'}
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                               {charger.charger_type || 'N/A'}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getChargerStatusColor(charger.status)}`}>
//                               {getChargerStatusIcon(charger.status)}
//                               {charger.status || 'PENDING'}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3 text-sm font-medium text-gray-700">
//                             {charger.max_power_kw || 0} kW
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-600">
//                             <span className="inline-flex items-center gap-1">
//                               <Plug size={14} className="text-blue-400" />
//                               {charger.connectors?.length || 0}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             <button
//                               onClick={() => handleViewCharger(charger.charger_id || charger.id)}
//                               className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs flex items-center gap-1 shadow-sm shadow-blue-500/25"
//                             >
//                               <Eye size={14} />
//                               View
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination / Load More */}
//                 {pagination.has_more && (
//                   <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
//                     <button
//                       onClick={loadMoreChargers}
//                       disabled={loadingMore}
//                       className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loadingMore ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Loading...
//                         </>
//                       ) : (
//                         <>
//                           <RefreshCw size={16} />
//                           Load More Chargers
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}

//                 {/* Total count */}
//                 <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
//                   <span>Showing {filteredChargers.length} of {pagination.total || chargers.length} chargers</span>
//                   <div className="flex items-center gap-3">
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
//                       Active: {activeChargers}
//                     </span>
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-gray-400"></span>
//                       Inactive: {inactiveChargers}
//                     </span>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: scale(0.95); }
//           to { opacity: 1; transform: scale(1); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ChargersAndSessions;

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../Authentication/AuthContext';
// import {
//   Settings,
//   Plus,
//   ChevronDown,
//   User,
//   Building,
//   LogOut,
//   Search,
//   Wifi,
//   WifiOff,
//   Zap,
//   Plug,
//   Battery,
//   Activity,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Circle,
//   CircleDot,
//   CircleCheck,
//   CircleX,
//   X,
//   Power,
//   RefreshCw,
//   Eye,
//   EyeOff,
//   Loader2,
//   CircleOff,
//   PowerOff,
//   Power as PowerIcon,
//   History,
//   RadioTower,
//   Wrench,
//   Info,
//   Trash2,
//   Pause,
//   Signal
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
//   FLEET_OPERATIONS_API: `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
//   OPERATIONAL_CHARGER_API: (chargerId) => `${API_BASE_URL}/api/v1/cpo/operations/chargers/${chargerId}`,
//   OPERATIONAL_EVENTS_API: `${API_BASE_URL}/api/v1/cpo/operations/events`,
// };

// const ChargersAndSessions = () => {
//   const navigate = useNavigate();
//   const { 
//     authenticatedRequest, 
//     logout, 
//     isRefreshing,
//     isAuthenticated,
//     user 
//   } = useAuth();
  
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('chargers');
//   const [showEvents, setShowEvents] = useState(false);
  
//   // Chargers state
//   const [chargers, setChargers] = useState([]);
//   const [pagination, setPagination] = useState({
//     before: null,
//     before_id: null,
//     limit: 50,
//     has_more: false,
//     total: 0
//   });
//   const [loadingMore, setLoadingMore] = useState(false);
  
//   // Operational states
//   const [fleetData, setFleetData] = useState(null);
//   const [operationalStatus, setOperationalStatus] = useState({});
//   const [operationalEvents, setOperationalEvents] = useState([]);
//   const [operationalLoading, setOperationalLoading] = useState(false);
  
//   // Connector detail modal
//   const [selectedConnector, setSelectedConnector] = useState(null);
//   const [showConnectorDetail, setShowConnectorDetail] = useState(false);
  
//   // Filter states
//   const [connectorStatusFilter, setConnectorStatusFilter] = useState('All');
//   const [chargerStatusFilter, setChargerStatusFilter] = useState('All');
//   const [operationalStatusFilter, setOperationalStatusFilter] = useState('All');

//   // Dummy sessions data
//   const dummySessions = [
//     {
//       id: "SES-001",
//       session_id: "SES-2026-001",
//       hub_name: "Newtown Hub",
//       charger_name: "Benny 7.4kWh",
//       driver_name: "John Doe",
//       start_time: "2026-08-03T14:30:00+05:30",
//       duration_minutes: 135,
//       energy_consumed: 45.5,
//       status: "Completed",
//       cost: "₹ 386.75",
//       anomaly_detected: false
//     }
//   ];

//   // Check authentication on mount
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//     fetchChargers();
//     fetchOperationalData();
//   }, [isAuthenticated, navigate]);

//   // Fetch operational data
//   const fetchOperationalData = async () => {
//     setOperationalLoading(true);
//     try {
//       // Fetch fleet summary
//       const fleetResponse = await authenticatedRequest(API_CONFIG.FLEET_OPERATIONS_API, {
//         method: 'GET'
//       });
//       if (fleetResponse.ok) {
//         const fleetData = await fleetResponse.json();
//         setFleetData(fleetData);
//       }

//       // Fetch operational events
//       const eventsResponse = await authenticatedRequest(
//         `${API_CONFIG.OPERATIONAL_EVENTS_API}?limit=50`,
//         { method: 'GET' }
//       );
//       if (eventsResponse.ok) {
//         const eventsData = await eventsResponse.json();
//         setOperationalEvents(eventsData.events || eventsData.data || []);
//       }

//       // Fetch operational status for each charger
//       if (chargers.length > 0) {
//         const statusPromises = chargers.map(async (charger) => {
//           try {
//             const chargerShortId = charger.charger_id || charger.id;
//             if (!chargerShortId) return null;
            
//             const response = await authenticatedRequest(
//               API_CONFIG.OPERATIONAL_CHARGER_API(chargerShortId),
//               { method: 'GET' }
//             );
//             if (response.ok) {
//               const data = await response.json();
//               return { 
//                 chargerId: chargerShortId, 
//                 operational: data.live || data 
//               };
//             }
//             return null;
//           } catch (err) {
//             console.error('Error fetching operational status:', err);
//             return null;
//           }
//         });

//         const results = await Promise.all(statusPromises);
//         const statusMap = {};
//         results.forEach(result => {
//           if (result) {
//             statusMap[result.chargerId] = result.operational;
//           }
//         });
//         setOperationalStatus(statusMap);
//       }
//     } catch (error) {
//       console.error('Error fetching operational data:', error);
//     } finally {
//       setOperationalLoading(false);
//     }
//   };

//   // Fetch chargers
//   const fetchChargers = useCallback(async (before = null, before_id = null) => {
//     if (loadingMore) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       let url = `${API_CONFIG.CHARGERS_API}?limit=${pagination.limit}`;
//       if (before) {
//         url += `&before=${before}`;
//       }
//       if (before_id) {
//         url += `&before_id=${before_id}`;
//       }

//       const response = await authenticatedRequest(url, {
//         method: 'GET'
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const chargersData = data.chargers || data.data || data || [];
//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;
//         const total = data.total || chargersData.length;

//         setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
//         setPagination({
//           before: nextBefore,
//           before_id: nextBeforeId,
//           limit: pagination.limit,
//           has_more: hasMore,
//           total: total
//         });

//         if (chargersData.length > 0) {
//           const statusPromises = chargersData.map(async (charger) => {
//             try {
//               const chargerShortId = charger.charger_id || charger.id;
//               if (!chargerShortId) return null;
              
//               const response = await authenticatedRequest(
//                 API_CONFIG.OPERATIONAL_CHARGER_API(chargerShortId),
//                 { method: 'GET' }
//               );
//               if (response.ok) {
//                 const data = await response.json();
//                 return { 
//                   chargerId: chargerShortId, 
//                   operational: data.live || data 
//                 };
//               }
//               return null;
//             } catch (err) {
//               return null;
//             }
//           });

//           const results = await Promise.all(statusPromises);
//           const statusMap = {};
//           results.forEach(result => {
//             if (result) {
//               statusMap[result.chargerId] = result.operational;
//             }
//           });
//           setOperationalStatus(prev => ({ ...prev, ...statusMap }));
//         }
//       } else {
//         setError(data.message || data.error?.message || 'Failed to fetch chargers');
//       }
//     } catch (error) {
//       console.error('Error fetching chargers:', error);
//       setError(error.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   }, [pagination.limit, loadingMore, authenticatedRequest]);

//   // Load more chargers
//   const loadMoreChargers = () => {
//     if (pagination.has_more && !loadingMore && !loading) {
//       setLoadingMore(true);
//       fetchChargers(pagination.before, pagination.before_id);
//     }
//   };

//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
//         method: 'GET'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUserData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       navigate('/signin');
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   const handleViewCharger = (chargerId) => {
//     navigate(`/charger-details/${chargerId}`);
//   };

//   const handleGoToSessions = () => {
//     navigate('/sessions');
//   };

//   // Status display functions
//   const getConnectionStatusDisplay = (status) => {
//     const map = {
//       'ONLINE': { label: 'Online', icon: <Wifi className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
//       'OFFLINE': { label: 'Offline', icon: <WifiOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
//       'UNKNOWN': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' }
//     };
//     return map[status] || map['UNKNOWN'];
//   };

//   const getAdminStatusDisplay = (status) => {
//     const map = {
//       'ACTIVE': { label: 'Active', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
//       'INACTIVE': { label: 'Inactive', icon: <PowerOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
//       'SUSPENDED': { label: 'Suspended', icon: <Pause className="w-3 h-3 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
//       'UNDERMAINTENANCE': { label: 'Under Maintenance', icon: <Wrench className="w-3 h-3 text-amber-500" />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
//       'DECOMMISSIONED': { label: 'Decommissioned', icon: <Trash2 className="w-3 h-3 text-gray-500" />, color: 'bg-gray-100 text-gray-700 border-gray-200' }
//     };
//     return map[status] || { label: status || 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' };
//   };

//   // Get connector OCPP status display
//   const getConnectorOCPPStatusDisplay = (status) => {
//     const map = {
//       'Available': { label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
//       'Preparing': { label: 'Preparing', icon: <Clock className="w-3 h-3 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
//       'Charging': { label: 'Charging', icon: <Zap className="w-3 h-3 text-blue-500" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
//       'Finishing': { label: 'Finishing', icon: <CheckCircle className="w-3 h-3 text-purple-500" />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
//       'Faulted': { label: 'Faulted', icon: <AlertCircle className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' }
//     };
//     return map[status] || { label: status || 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' };
//   };

//   // Get connector availability status
//   const getConnectorAvailabilityDisplay = (availability) => {
//     const map = {
//       'AVAILABLE': { label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
//       'UNAVAILABLE': { label: 'Unavailable', icon: <CircleOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' }
//     };
//     return map[availability] || { label: availability || 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' };
//   };

//   // Get connector details for modal
//   const getConnectorDetail = (chargerId, connectorNumber) => {
//     const op = operationalStatus[chargerId];
//     if (!op || !op.connectors) return null;
//     return op.connectors.find(c => c.connector_number === connectorNumber) || null;
//   };

//   // Settings Dropdown Menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
//             {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">
//               {userData?.user?.full_name || user?.name || 'User'}
//             </h4>
//             <p className="text-sm text-gray-400 truncate">
//               {userData?.user?.email || user?.email || 'user@transev.com'}
//             </p>
//             {userData?.role && (
//               <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
//                 {userData.role}
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
//           <User size={16} className="text-gray-500" /> 
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
//           onClick={() => {
//             setShowSettingsMenu(false);
//             handleLogout();
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
//         >
//           <LogOut size={16} className="text-red-500" /> 
//           <span>Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Add Dropdown Menu
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
//           <Plus size={18} className="text-gray-400" /> Add Hub
//         </button>
//         <button 
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate("/add-charger");
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Zap size={18} className="text-gray-400" /> Add Charger
//         </button>
//       </div>
//     </div>
//   );

//   // Get charger status color (CMS status)
//   const getChargerStatusColor = (status) => {
//     const adminStatus = getAdminStatusDisplay(status);
//     return adminStatus.color;
//   };

//   const getChargerStatusIcon = (status) => {
//     const adminStatus = getAdminStatusDisplay(status);
//     return adminStatus.icon;
//   };

//   // Filter chargers
//   const filteredChargers = chargers.filter(charger => {
//     const chargerShortId = charger.charger_id || charger.id;
//     const matchesSearch = 
//       (charger.charger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (chargerShortId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (charger.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    
//     let matchesConnectorStatus = true;
//     if (connectorStatusFilter !== 'All') {
//       const status = charger.status?.toUpperCase() || '';
//       if (connectorStatusFilter === 'Available') {
//         matchesConnectorStatus = status === 'AVAILABLE' || status === 'ACTIVE';
//       } else if (connectorStatusFilter === 'Busy') {
//         matchesConnectorStatus = status === 'CHARGING' || status === 'PREPARING';
//       } else if (connectorStatusFilter === 'Error') {
//         matchesConnectorStatus = status === 'FAULTED' || status === 'UNAVAILABLE';
//       } else if (connectorStatusFilter === 'Unavailable') {
//         matchesConnectorStatus = status === 'OFFLINE' || status === 'UNDER_MAINTENANCE' || status === 'INACTIVE' || status === 'SUSPENDED' || status === 'DECOMMISSIONED';
//       }
//     }
    
//     const matchesChargerStatus = chargerStatusFilter === 'All' || 
//       charger.status?.toUpperCase() === chargerStatusFilter.toUpperCase();
    
//     let matchesOperationalStatus = true;
//     if (operationalStatusFilter !== 'All') {
//       const op = operationalStatus[chargerShortId];
//       const connectionStatus = op?.live_state?.connection_status || op?.connection_status || 'UNKNOWN';
//       if (operationalStatusFilter === 'Online') {
//         matchesOperationalStatus = connectionStatus === 'ONLINE';
//       } else if (operationalStatusFilter === 'Offline') {
//         matchesOperationalStatus = connectionStatus === 'OFFLINE';
//       } else if (operationalStatusFilter === 'Unknown') {
//         matchesOperationalStatus = connectionStatus === 'UNKNOWN';
//       }
//     }
    
//     return matchesSearch && matchesConnectorStatus && matchesChargerStatus && matchesOperationalStatus;
//   });

//   // Stats
//   const totalChargers = chargers.length;
//   const activeChargers = chargers.filter(c => c.status === 'ACTIVE' || c.status === 'AVAILABLE' || c.status === 'CHARGING').length;
//   const inactiveChargers = chargers.filter(c => c.status === 'INACTIVE' || c.status === 'OFFLINE' || c.status === 'UNAVAILABLE' || c.status === 'SUSPENDED' || c.status === 'DECOMMISSIONED').length;
//   const faultedChargers = chargers.filter(c => c.status === 'FAULTED').length;

//   const operationalStats = fleetData?.connectors || {
//     total: 0,
//     available: 0,
//     charging: 0,
//     faulted: 0,
//     unavailable: 0
//   };

//   const availableCount = chargers.filter(c => c.status === 'AVAILABLE' || c.status === 'ACTIVE').length;
//   const busyCount = chargers.filter(c => c.status === 'CHARGING' || c.status === 'PREPARING').length;
//   const errorCount = chargers.filter(c => c.status === 'FAULTED' || c.status === 'UNAVAILABLE').length;
//   const unavailableCount = chargers.filter(c => c.status === 'OFFLINE' || c.status === 'UNDER_MAINTENANCE' || c.status === 'INACTIVE' || c.status === 'SUSPENDED' || c.status === 'DECOMMISSIONED').length;

//   // Connector Detail Modal
//   const ConnectorDetailModal = () => {
//     if (!selectedConnector) return null;
    
//     const connector = selectedConnector;
//     const connectorInfo = getConnectorDetail(selectedConnector.chargerId, connector.connector_number);
//     const adminStatus = getAdminStatusDisplay(connector.status);
//     const ocppStatus = connectorInfo?.live_state?.last_ocpp_status || 'Unknown';
//     const ocppDisplay = getConnectorOCPPStatusDisplay(ocppStatus);
//     const availability = connectorInfo?.live_state?.availability || 'UNAVAILABLE';
//     const availabilityDisplay = getConnectorAvailabilityDisplay(availability);
//     const freshness = connectorInfo?.live_state?.freshness || 'FRESH';
    
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//         <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//           <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//               <Plug className="w-5 h-5 text-blue-600" />
//               Connector #{connector.connector_number} Details
//             </h3>
//             <button
//               onClick={() => {
//                 setShowConnectorDetail(false);
//                 setSelectedConnector(null);
//               }}
//               className="p-2 hover:bg-gray-100 rounded-xl transition"
//             >
//               <X className="w-5 h-5 text-gray-500" />
//             </button>
//           </div>
          
//           <div className="p-6 space-y-4">
//             {/* Basic Info */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-500">Connector Number</p>
//                 <p className="text-lg font-semibold text-gray-900">#{connector.connector_number}</p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-500">Connector Type</p>
//                 <p className="text-lg font-semibold text-gray-900">{connector.connector_type || 'N/A'}</p>
//               </div>
//             </div>

//             {/* Status Section */}
//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Activity size={16} className="text-blue-500" />
//                 Status Information
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Administrative Status</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${adminStatus.color}`}>
//                     {adminStatus.icon}
//                     {adminStatus.label}
//                   </span>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">OCPP Status</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${ocppDisplay.color}`}>
//                     {ocppDisplay.icon}
//                     {ocppDisplay.label}
//                   </span>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Availability</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${availabilityDisplay.color}`}>
//                     {availabilityDisplay.icon}
//                     {availabilityDisplay.label}
//                   </span>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Data Freshness</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${freshness === 'FRESH' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
//                     {freshness === 'FRESH' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
//                     {freshness}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Capacity & ID */}
//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Info size={16} className="text-blue-500" />
//                 Technical Details
//               </h4>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Total Capacity</p>
//                   <p className="text-base font-semibold text-gray-900">{connector.connector_total_capacity || 0} kW</p>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Connector ID</p>
//                   <p className="text-sm font-mono text-gray-600">{connector.id || 'N/A'}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Timestamps */}
//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Clock size={16} className="text-blue-500" />
//                 Timestamps
//               </h4>
//               <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
//                 <div>
//                   <p>Created: {connector.created_at ? new Date(connector.created_at).toLocaleString() : 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p>Updated: {connector.updated_at ? new Date(connector.updated_at).toLocaleString() : 'N/A'}</p>
//                 </div>
//                 {connectorInfo?.live_state?.last_ocpp_status_at && (
//                   <div className="col-span-2">
//                     <p>Last OCPP Update: {new Date(connectorInfo.live_state.last_ocpp_status_at).toLocaleString()}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Close Button */}
//             <div className="border-t border-gray-200 pt-4">
//               <button
//                 onClick={() => {
//                   setShowConnectorDetail(false);
//                   setSelectedConnector(null);
//                 }}
//                 className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (isRefreshing && loading) {
//     return (
//       <div className="min-h-screen bg-white flex">
//         <Sidebar />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600">Refreshing session...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex">
//       <Sidebar 
//         isDarkMode={isDarkMode} 
//         onThemeToggle={handleThemeToggle}
//         userName={userData?.user?.full_name || user?.name || 'User'}
//         userEmail={userData?.user?.email || user?.email || ''}
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         {/* HEADER */}
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1 text-sm text-gray-500">
//                  <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
//                 <button 
//                   onClick={() => navigate('/dashboard')}
//                   className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
//                 >
//                     /  Dashboard
//                 </button>
//                 <span className="text-gray-400">/</span>
//                 <span className="text-gray-700 font-medium">Chargers</span>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2 relative">
//               <button
//                 onClick={fetchOperationalData}
//                 disabled={operationalLoading}
//                 className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 hover:text-gray-800 disabled:opacity-50"
//                 title="Refresh operational status"
//               >
//                 <RefreshCw size={18} className={operationalLoading ? 'animate-spin' : ''} />
//               </button>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowSettingsMenu(!showSettingsMenu)}
//                   className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
//                 >
//                   <Settings size={20} />
//                   <ChevronDown size={16} />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowAddMenu(!showAddMenu)}
//                   className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//                 >
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Title */}
//         <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-green-700">Charger Management</h1>
//               <p className="text-sm text-gray-500 mt-0.5">Manage all EV charging stations and monitor sessions</p>
//             </div>
//             <button
//               onClick={() => navigate('/add-charger')}
//               className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25"
//             >
//               <Plus size={18} />
//               Add Charger
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white border-b border-gray-200 px-6">
//           <div className="flex items-center gap-8">
//             <button
//               onClick={() => setActiveTab('chargers')}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 activeTab === 'chargers' 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <Zap size={18} />
//               <span className="font-medium">Chargers</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{totalChargers}</span>
//             </button>
//             <button
//               onClick={handleGoToSessions}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 activeTab === 'sessions' 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <Activity size={18} />
//               <span className="font-medium">Sessions</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{dummySessions.length}</span>
//             </button>
//             <button
//               onClick={() => setShowEvents(!showEvents)}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 showEvents 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <History size={18} />
//               <span className="font-medium">Events</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{operationalEvents.length}</span>
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Operational Fleet Stats - OCPP Status */}
//           {fleetData && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Total Connectors</p>
//                     <p className="text-xl font-bold text-gray-900">{operationalStats.total || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
//                     <Plug className="w-5 h-5 text-blue-600" />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Available</p>
//                     <p className="text-xl font-bold text-green-600">{operationalStats.available || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Available</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Charging</p>
//                     <p className="text-xl font-bold text-blue-600">{operationalStats.charging || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
//                     <Zap className="w-5 h-5 text-blue-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Charging</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Faulted</p>
//                     <p className="text-xl font-bold text-red-600">{operationalStats.faulted || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
//                     <AlertCircle className="w-5 h-5 text-red-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Faulted</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Unavailable</p>
//                     <p className="text-xl font-bold text-gray-600">{operationalStats.unavailable || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
//                     <CircleOff className="w-5 h-5 text-gray-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Unavailable</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Active Sessions</p>
//                     <p className="text-xl font-bold text-purple-600">{fleetData.active_sessions || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
//                     <Activity className="w-5 h-5 text-purple-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">Current sessions</p>
//               </div>
//             </div>
//           )}

//           {/* Events Panel */}
//           {showEvents && (
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
//               <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                   <RadioTower size={18} className="text-blue-600" />
//                   Operational Events ({operationalEvents.length})
//                 </h3>
//                 <button
//                   onClick={() => setShowEvents(false)}
//                   className="p-1 hover:bg-gray-100 rounded-lg transition"
//                 >
//                   <X size={16} className="text-gray-500" />
//                 </button>
//               </div>
//               <div className="max-h-64 overflow-y-auto">
//                 {operationalEvents.length === 0 ? (
//                   <div className="p-8 text-center text-gray-500 text-sm">No events available</div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Resource</th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Time</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {operationalEvents.map((event, idx) => (
//                         <tr key={event.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
//                           <td className="px-4 py-2 text-xs text-gray-400 font-mono">{event.id || 'N/A'}</td>
//                           <td className="px-4 py-2 text-xs text-gray-600">
//                             <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
//                               {event.type || 'Unknown'}
//                             </span>
//                           </td>
//                           <td className="px-4 py-2 text-xs text-gray-700">
//                             {event.resource_type}: {event.resource_id}
//                           </td>
//                           <td className="px-4 py-2 text-xs text-gray-500">
//                             {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : 'N/A'}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Filters Row */}
//           <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//             {/* Left Side - Connector Status */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Plug size={16} className="text-blue-500" />
//                 Connector Status:
//               </span>
//               <div className="flex items-center gap-1.5 flex-wrap">
//                 <button
//                   onClick={() => setConnectorStatusFilter('All')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'All'
//                       ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Circle className="w-3 h-3 text-blue-500" />
//                   All ({totalChargers})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Available')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Available'
//                       ? 'bg-green-50 text-green-700 border-green-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <CheckCircle className="w-3 h-3 text-green-500" />
//                   Available ({availableCount})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Busy')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Busy'
//                       ? 'bg-yellow-50 text-yellow-700 border-yellow-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Zap className="w-3 h-3 text-yellow-500" />
//                   Busy ({busyCount})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Error')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Error'
//                       ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <AlertCircle className="w-3 h-3 text-red-500" />
//                   Error ({errorCount})
//                 </button>
//                 <button
//                   onClick={() => setConnectorStatusFilter('Unavailable')}
//                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                     connectorStatusFilter === 'Unavailable'
//                       ? 'bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <CircleOff className="w-3 h-3 text-gray-500" />
//                   Unavailable ({unavailableCount})
//                 </button>
//               </div>
//             </div>

//             {/* Right Side - Filters */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Battery size={16} className="text-blue-500" />
//                 Admin Status:
//               </span>
//               <select
//                 value={chargerStatusFilter}
//                 onChange={(e) => setChargerStatusFilter(e.target.value)}
//                 className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All Status</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="INACTIVE">Inactive</option>
//                 <option value="SUSPENDED">Suspended</option>
//                 <option value="UNDERMAINTENANCE">Under Maintenance</option>
//                 <option value="DECOMMISSIONED">Decommissioned</option>
//               </select>

//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Wifi size={16} className="text-blue-500" />
//                 OCPP Status:
//               </span>
//               <select
//                 value={operationalStatusFilter}
//                 onChange={(e) => setOperationalStatusFilter(e.target.value)}
//                 className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All</option>
//                 <option value="Online">Online</option>
//                 <option value="Offline">Offline</option>
//                 <option value="Unknown">Unknown</option>
//               </select>

//               <div className="relative">
//                 <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search chargers..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 bg-white"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//             {loading && chargers.length === 0 ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                   <p className="mt-4 text-gray-600">Loading chargers...</p>
//                 </div>
//               </div>
//             ) : error ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                   <p className="text-gray-600">{error}</p>
//                   <button
//                     onClick={() => fetchChargers()}
//                     className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//                   >
//                     Retry
//                   </button>
//                 </div>
//               </div>
//             ) : filteredChargers.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-16">
//                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                   <Plug className="w-10 h-10 text-gray-300" />
//                 </div>
//                 <p className="text-lg font-semibold text-gray-600">No Chargers Found</p>
//                 <p className="text-sm text-gray-400 mt-1">
//                   {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first charger'}
//                 </p>
//                 {!searchQuery && connectorStatusFilter === 'All' && chargerStatusFilter === 'All' && (
//                   <button
//                     onClick={() => navigate('/add-charger')}
//                     className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
//                   >
//                     <Plus size={18} />
//                     Add Charger
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gradient-to-r from-blue-50/80 to-gray-50/80 border-b border-gray-200">
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger ID</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin Status</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">OCPP Status</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Power</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connectors</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredChargers.map((charger, index) => {
//                         const chargerShortId = charger.charger_id || charger.id;
//                         const opStatus = getConnectionStatusDisplay(
//                           operationalStatus[chargerShortId]?.live_state?.connection_status || 
//                           operationalStatus[chargerShortId]?.connection_status || 
//                           'UNKNOWN'
//                         );
//                         const adminStatus = getAdminStatusDisplay(charger.status);
                        
//                         return (
//                           <tr key={charger.id || charger.charger_id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
//                             <td className="px-4 py-3 text-sm text-gray-400 font-medium">{String(index + 1).padStart(2, '0')}</td>
//                             <td className="px-4 py-3 text-sm font-mono text-gray-600">
//                               {charger.charger_id || charger.id?.slice(0, 6) || 'N/A'}
//                             </td>
//                             <td className="px-4 py-3 text-sm font-medium text-gray-800">
//                               {charger.charger_name || charger.name || 'Unnamed'}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-500">
//                               {charger.serial_number || 'N/A'}
//                             </td>
//                             <td className="px-4 py-3 text-sm">
//                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${adminStatus.color}`}>
//                                 {adminStatus.icon}
//                                 {adminStatus.label}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-sm">
//                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${opStatus.color}`}>
//                                 {opStatus.icon}
//                                 {opStatus.label}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-sm font-medium text-gray-700">
//                               {charger.max_power_kw || 0} kW
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-600">
//                               <div className="flex items-center gap-2 flex-wrap">
//                                 <span className="inline-flex items-center gap-1">
//                                   <Plug size={14} className="text-blue-400" />
//                                   {charger.connectors?.length || 0}
//                                 </span>
//                                 {charger.connectors && charger.connectors.length > 0 && (
//                                   <div className="flex items-center gap-1 flex-wrap">
//                                     {charger.connectors.map((conn, idx) => {
//                                       const connInfo = getConnectorDetail(chargerShortId, conn.connector_number);
//                                       const ocppStatus = connInfo?.live_state?.last_ocpp_status || 'Unknown';
//                                       const ocppDisplay = getConnectorOCPPStatusDisplay(ocppStatus);
//                                       const availability = connInfo?.live_state?.availability || 'UNAVAILABLE';
//                                       const availDisplay = getConnectorAvailabilityDisplay(availability);
                                      
//                                       return (
//                                         <button
//                                           key={idx}
//                                           onClick={() => {
//                                             setSelectedConnector({
//                                               ...conn,
//                                               chargerId: chargerShortId
//                                             });
//                                             setShowConnectorDetail(true);
//                                           }}
//                                           className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer transition"
//                                           title={`Connector ${conn.connector_number}: ${ocppDisplay.label} (${availDisplay.label})`}
//                                         >
//                                           {availDisplay.icon}
//                                           {conn.connector_number}
//                                         </button>
//                                       );
//                                     })}
//                                   </div>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3 text-sm">
//                               <button
//                                 onClick={() => handleViewCharger(chargerShortId)}
//                                 className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs flex items-center gap-1 shadow-sm shadow-blue-500/25"
//                               >
//                                 <Eye size={14} />
//                                 View
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination / Load More */}
//                 {pagination.has_more && (
//                   <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
//                     <button
//                       onClick={loadMoreChargers}
//                       disabled={loadingMore}
//                       className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loadingMore ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Loading...
//                         </>
//                       ) : (
//                         <>
//                           <RefreshCw size={16} />
//                           Load More Chargers
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}

//                 {/* Total count */}
//                 <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
//                   <span>Showing {filteredChargers.length} of {pagination.total || chargers.length} chargers</span>
//                   <div className="flex items-center gap-3">
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-green-500"></span>
//                       Active: {activeChargers}
//                     </span>
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-gray-400"></span>
//                       Inactive: {inactiveChargers}
//                     </span>
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-red-500"></span>
//                       Faulted: {faultedChargers}
//                     </span>
//                     {fleetData && (
//                       <span className="inline-flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
//                         <Wifi size={12} className="text-green-500" />
//                         {operationalStats.available || 0} avail
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Connector Detail Modal */}
//       {showConnectorDetail && <ConnectorDetailModal />}

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: scale(0.95); }
//           to { opacity: 1; transform: scale(1); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ChargersAndSessions;




// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../Authentication/AuthContext';
// import {
//   Settings,
//   Plus,
//   ChevronDown,
//   User,
//   Building,
//   LogOut,
//   Search,
//   Wifi,
//   WifiOff,
//   Zap,
//   Plug,
//   Battery,
//   Activity,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Circle,
//   CircleDot,
//   CircleCheck,
//   CircleX,
//   X,
//   Power,
//   RefreshCw,
//   Eye,
//   EyeOff,
//   Loader2,
//   CircleOff,
//   PowerOff,
//   Power as PowerIcon,
//   History,
//   RadioTower,
//   Wrench,
//   Info,
//   Trash2,
//   Pause,
//   Signal,
//   Timer,
//   ZapOff,
//   AlertTriangle,
//   Gauge,
//   Thermometer,
//   ShieldCheck
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
//   FLEET_OPERATIONS_API: `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
//   OPERATIONAL_CHARGER_API: (chargerId) => `${API_BASE_URL}/api/v1/cpo/operations/chargers/${chargerId}`,
//   OPERATIONAL_EVENTS_API: `${API_BASE_URL}/api/v1/cpo/operations/events`,
// };

// // OCPP Status Constants
// const OCPP_STATUS = {
//   AVAILABLE: 'Available',
//   PREPARING: 'Preparing',
//   CHARGING: 'Charging',
//   FINISHING: 'Finishing',
//   FAULTED: 'Faulted',
//   UNKNOWN: 'Unknown'
// };

// // OCPP Status Display Configurations
// const OCPP_STATUS_CONFIG = {
//   'Available': { label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200', dotColor: 'bg-green-500' },
//   'Preparing': { label: 'Preparing', icon: <Clock className="w-3 h-3 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-500' },
//   'Charging': { label: 'Charging', icon: <Zap className="w-3 h-3 text-blue-500" />, color: 'bg-blue-100 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
//   'Finishing': { label: 'Finishing', icon: <CheckCircle className="w-3 h-3 text-purple-500" />, color: 'bg-purple-100 text-purple-700 border-purple-200', dotColor: 'bg-purple-500' },
//   'Faulted': { label: 'Faulted', icon: <AlertCircle className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200', dotColor: 'bg-red-500' },
//   'Unknown': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200', dotColor: 'bg-gray-400' }
// };

// // Availability Status Display
// const AVAILABILITY_STATUS_CONFIG = {
//   'AVAILABLE': { label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
//   'UNAVAILABLE': { label: 'Unavailable', icon: <CircleOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' }
// };

// // Connection Status Display
// const CONNECTION_STATUS_CONFIG = {
//   'ONLINE': { label: 'Online', icon: <Wifi className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
//   'OFFLINE': { label: 'Offline', icon: <WifiOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
//   'UNKNOWN': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' }
// };

// // Admin Status Display
// const ADMIN_STATUS_CONFIG = {
//   'ACTIVE': { label: 'Active', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
//   'INACTIVE': { label: 'Inactive', icon: <PowerOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
//   'SUSPENDED': { label: 'Suspended', icon: <Pause className="w-3 h-3 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
//   'UNDERMAINTENANCE': { label: 'Under Maintenance', icon: <Wrench className="w-3 h-3 text-amber-500" />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
//   'DECOMMISSIONED': { label: 'Decommissioned', icon: <Trash2 className="w-3 h-3 text-gray-500" />, color: 'bg-gray-100 text-gray-700 border-gray-200' }
// };

// // OCPP Status Filter Options (for dropdown)
// const OCPP_FILTER_OPTIONS = [
//   { value: 'All', label: 'All OCPP Status', icon: <Circle className="w-3 h-3 text-gray-400" /> },
//   { value: 'Available', label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" /> },
//   { value: 'Preparing', label: 'Preparing', icon: <Clock className="w-3 h-3 text-yellow-500" /> },
//   { value: 'Charging', label: 'Charging', icon: <Zap className="w-3 h-3 text-blue-500" /> },
//   { value: 'Finishing', label: 'Finishing', icon: <CheckCircle className="w-3 h-3 text-purple-500" /> },
//   { value: 'Faulted', label: 'Faulted', icon: <AlertCircle className="w-3 h-3 text-red-500" /> }
// ];

// const ChargersAndSessions = () => {
//   const navigate = useNavigate();
//   const { 
//     authenticatedRequest, 
//     logout, 
//     isRefreshing,
//     isAuthenticated,
//     user 
//   } = useAuth();
  
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('chargers');
//   const [showEvents, setShowEvents] = useState(false);
  
//   // Chargers state
//   const [chargers, setChargers] = useState([]);
//   const [pagination, setPagination] = useState({
//     before: null,
//     before_id: null,
//     limit: 50,
//     has_more: false,
//     total: 0
//   });
//   const [loadingMore, setLoadingMore] = useState(false);
  
//   // Operational states
//   const [fleetData, setFleetData] = useState(null);
//   const [operationalStatus, setOperationalStatus] = useState({});
//   const [operationalEvents, setOperationalEvents] = useState([]);
//   const [operationalLoading, setOperationalLoading] = useState(false);
  
//   // Connector detail modal
//   const [selectedConnector, setSelectedConnector] = useState(null);
//   const [showConnectorDetail, setShowConnectorDetail] = useState(false);
  
//   // Filter states - CHANGED: CMS Status replaced with OCPP Connector Status
//   const [chargerStatusFilter, setChargerStatusFilter] = useState('All');
//   const [operationalStatusFilter, setOperationalStatusFilter] = useState('All');
//   const [ocppStatusFilter, setOcppStatusFilter] = useState('All'); // This now filters by OCPP connector status

//   // Dummy sessions data
//   const dummySessions = [
//     {
//       id: "SES-001",
//       session_id: "SES-2026-001",
//       hub_name: "Newtown Hub",
//       charger_name: "Benny 7.4kWh",
//       driver_name: "John Doe",
//       start_time: "2026-08-03T14:30:00+05:30",
//       duration_minutes: 135,
//       energy_consumed: 45.5,
//       status: "Completed",
//       cost: "₹ 386.75",
//       anomaly_detected: false
//     }
//   ];

//   // Check authentication on mount
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//     fetchChargers();
//     fetchOperationalData();
//   }, [isAuthenticated, navigate]);

//   // Fetch operational data
//   const fetchOperationalData = async () => {
//     setOperationalLoading(true);
//     try {
//       // Fetch fleet summary
//       const fleetResponse = await authenticatedRequest(API_CONFIG.FLEET_OPERATIONS_API, {
//         method: 'GET'
//       });
//       if (fleetResponse.ok) {
//         const fleetData = await fleetResponse.json();
//         setFleetData(fleetData);
//       }

//       // Fetch operational events
//       const eventsResponse = await authenticatedRequest(
//         `${API_CONFIG.OPERATIONAL_EVENTS_API}?limit=50`,
//         { method: 'GET' }
//       );
//       if (eventsResponse.ok) {
//         const eventsData = await eventsResponse.json();
//         setOperationalEvents(eventsData.events || eventsData.data || []);
//       }

//       // Fetch operational status for each charger
//       if (chargers.length > 0) {
//         const statusPromises = chargers.map(async (charger) => {
//           try {
//             const chargerShortId = charger.charger_id || charger.id;
//             if (!chargerShortId) return null;
            
//             const response = await authenticatedRequest(
//               API_CONFIG.OPERATIONAL_CHARGER_API(chargerShortId),
//               { method: 'GET' }
//             );
//             if (response.ok) {
//               const data = await response.json();
//               return { 
//                 chargerId: chargerShortId, 
//                 operational: data.live || data 
//               };
//             }
//             return null;
//           } catch (err) {
//             console.error('Error fetching operational status:', err);
//             return null;
//           }
//         });

//         const results = await Promise.all(statusPromises);
//         const statusMap = {};
//         results.forEach(result => {
//           if (result) {
//             statusMap[result.chargerId] = result.operational;
//           }
//         });
//         setOperationalStatus(statusMap);
//       }
//     } catch (error) {
//       console.error('Error fetching operational data:', error);
//     } finally {
//       setOperationalLoading(false);
//     }
//   };

//   // Fetch chargers
//   const fetchChargers = useCallback(async (before = null, before_id = null) => {
//     if (loadingMore) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       let url = `${API_CONFIG.CHARGERS_API}?limit=${pagination.limit}`;
//       if (before) {
//         url += `&before=${before}`;
//       }
//       if (before_id) {
//         url += `&before_id=${before_id}`;
//       }

//       const response = await authenticatedRequest(url, {
//         method: 'GET'
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const chargersData = data.chargers || data.data || data || [];
//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;
//         const total = data.total || chargersData.length;

//         setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
//         setPagination({
//           before: nextBefore,
//           before_id: nextBeforeId,
//           limit: pagination.limit,
//           has_more: hasMore,
//           total: total
//         });

//         if (chargersData.length > 0) {
//           const statusPromises = chargersData.map(async (charger) => {
//             try {
//               const chargerShortId = charger.charger_id || charger.id;
//               if (!chargerShortId) return null;
              
//               const response = await authenticatedRequest(
//                 API_CONFIG.OPERATIONAL_CHARGER_API(chargerShortId),
//                 { method: 'GET' }
//               );
//               if (response.ok) {
//                 const data = await response.json();
//                 return { 
//                   chargerId: chargerShortId, 
//                   operational: data.live || data 
//                 };
//               }
//               return null;
//             } catch (err) {
//               return null;
//             }
//           });

//           const results = await Promise.all(statusPromises);
//           const statusMap = {};
//           results.forEach(result => {
//             if (result) {
//               statusMap[result.chargerId] = result.operational;
//             }
//           });
//           setOperationalStatus(prev => ({ ...prev, ...statusMap }));
//         }
//       } else {
//         setError(data.message || data.error?.message || 'Failed to fetch chargers');
//       }
//     } catch (error) {
//       console.error('Error fetching chargers:', error);
//       setError(error.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   }, [pagination.limit, loadingMore, authenticatedRequest]);

//   // Load more chargers
//   const loadMoreChargers = () => {
//     if (pagination.has_more && !loadingMore && !loading) {
//       setLoadingMore(true);
//       fetchChargers(pagination.before, pagination.before_id);
//     }
//   };

//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
//         method: 'GET'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUserData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       navigate('/signin');
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   const handleViewCharger = (chargerId) => {
//     navigate(`/charger-details/${chargerId}`);
//   };

//   const handleGoToSessions = () => {
//     navigate('/sessions');
//   };

//   // Status display functions using config objects
//   const getConnectionStatusDisplay = (status) => {
//     return CONNECTION_STATUS_CONFIG[status] || CONNECTION_STATUS_CONFIG['UNKNOWN'];
//   };

//   const getAdminStatusDisplay = (status) => {
//     return ADMIN_STATUS_CONFIG[status] || { label: status || 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' };
//   };

//   const getOcppStatusDisplay = (status) => {
//     return OCPP_STATUS_CONFIG[status] || OCPP_STATUS_CONFIG['Unknown'];
//   };

//   const getAvailabilityDisplay = (availability) => {
//     return AVAILABILITY_STATUS_CONFIG[availability] || { label: availability || 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' };
//   };

//   // Get connector details for modal
//   const getConnectorDetail = (chargerId, connectorNumber) => {
//     const op = operationalStatus[chargerId];
//     if (!op || !op.connectors) return null;
//     return op.connectors.find(c => c.connector_number === connectorNumber) || null;
//   };

//   // Get OCPP status for a connector
//   const getConnectorOcppStatus = (chargerId, connectorNumber) => {
//     const conn = getConnectorDetail(chargerId, connectorNumber);
//     return conn?.live_state?.last_ocpp_status || 'Unknown';
//   };

//   // Get connector availability
//   const getConnectorAvailability = (chargerId, connectorNumber) => {
//     const conn = getConnectorDetail(chargerId, connectorNumber);
//     return conn?.live_state?.availability || 'UNAVAILABLE';
//   };

//   // Settings Dropdown Menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
//             {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">
//               {userData?.user?.full_name || user?.name || 'User'}
//             </h4>
//             <p className="text-sm text-gray-400 truncate">
//               {userData?.user?.email || user?.email || 'user@transev.com'}
//             </p>
//             {userData?.role && (
//               <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
//                 {userData.role}
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
//           <User size={16} className="text-gray-500" /> 
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
//           onClick={() => {
//             setShowSettingsMenu(false);
//             handleLogout();
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
//         >
//           <LogOut size={16} className="text-red-500" /> 
//           <span>Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Add Dropdown Menu
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
//           <Plus size={18} className="text-gray-400" /> Add Hub
//         </button>
//         <button 
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate("/add-charger");
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Zap size={18} className="text-gray-400" /> Add Charger
//         </button>
//       </div>
//     </div>
//   );

//   // Get charger status color (CMS status)
//   const getChargerStatusColor = (status) => {
//     const adminStatus = getAdminStatusDisplay(status);
//     return adminStatus.color;
//   };

//   const getChargerStatusIcon = (status) => {
//     const adminStatus = getAdminStatusDisplay(status);
//     return adminStatus.icon;
//   };

//   // Filter chargers - UPDATED: OCPP connector status filter instead of CMS status
//   const filteredChargers = chargers.filter(charger => {
//     const chargerShortId = charger.charger_id || charger.id;
//     const matchesSearch = 
//       (charger.charger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (chargerShortId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (charger.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    
//     // NEW: OCPP Connector Status filter (replaces CMS status)
//     let matchesOcppStatus = true;
//     if (ocppStatusFilter !== 'All') {
//       const connectors = charger.connectors || [];
//       let hasMatchingStatus = false;
//       for (const conn of connectors) {
//         const ocppStatus = getConnectorOcppStatus(chargerShortId, conn.connector_number);
//         if (ocppStatus === ocppStatusFilter) {
//           hasMatchingStatus = true;
//           break;
//         }
//       }
//       // If no connectors, check if charger has matching status
//       if (connectors.length === 0) {
//         const chargerOcppStatus = operationalStatus[chargerShortId]?.live_state?.last_ocpp_status || 'Unknown';
//         matchesOcppStatus = chargerOcppStatus === ocppStatusFilter;
//       } else {
//         matchesOcppStatus = hasMatchingStatus;
//       }
//     }
    
//     // Charger status filter (Admin status)
//     const matchesChargerStatus = chargerStatusFilter === 'All' || 
//       charger.status?.toUpperCase() === chargerStatusFilter.toUpperCase();
    
//     // Operational connection status filter
//     let matchesOperationalStatus = true;
//     if (operationalStatusFilter !== 'All') {
//       const op = operationalStatus[chargerShortId];
//       const connectionStatus = op?.live_state?.connection_status || op?.connection_status || 'UNKNOWN';
//       if (operationalStatusFilter === 'Online') {
//         matchesOperationalStatus = connectionStatus === 'ONLINE';
//       } else if (operationalStatusFilter === 'Offline') {
//         matchesOperationalStatus = connectionStatus === 'OFFLINE';
//       } else if (operationalStatusFilter === 'Unknown') {
//         matchesOperationalStatus = connectionStatus === 'UNKNOWN';
//       }
//     }
    
//     return matchesSearch && matchesOcppStatus && matchesChargerStatus && matchesOperationalStatus;
//   });

//   // Stats
//   const totalChargers = chargers.length;
//   const activeChargers = chargers.filter(c => c.status === 'ACTIVE' || c.status === 'AVAILABLE' || c.status === 'CHARGING').length;
//   const inactiveChargers = chargers.filter(c => c.status === 'INACTIVE' || c.status === 'OFFLINE' || c.status === 'UNAVAILABLE' || c.status === 'SUSPENDED' || c.status === 'DECOMMISSIONED').length;
//   const faultedChargers = chargers.filter(c => c.status === 'FAULTED').length;

//   const operationalStats = fleetData?.connectors || {
//     total: 0,
//     available: 0,
//     charging: 0,
//     faulted: 0,
//     unavailable: 0
//   };

//   // Count connectors by OCPP status
//   const getConnectorStatusCounts = () => {
//     const counts = { Available: 0, Preparing: 0, Charging: 0, Finishing: 0, Faulted: 0, Unknown: 0 };
//     chargers.forEach(charger => {
//       const chargerShortId = charger.charger_id || charger.id;
//       const connectors = charger.connectors || [];
//       connectors.forEach(conn => {
//         const status = getConnectorOcppStatus(chargerShortId, conn.connector_number);
//         if (counts[status] !== undefined) {
//           counts[status]++;
//         } else {
//           counts.Unknown++;
//         }
//       });
//     });
//     return counts;
//   };
//   const connectorStatusCounts = getConnectorStatusCounts();

//   // Connector Detail Modal
//   const ConnectorDetailModal = () => {
//     if (!selectedConnector) return null;
    
//     const connector = selectedConnector;
//     const connectorInfo = getConnectorDetail(selectedConnector.chargerId, connector.connector_number);
//     const adminStatus = getAdminStatusDisplay(connector.status);
//     const ocppStatus = connectorInfo?.live_state?.last_ocpp_status || 'Unknown';
//     const ocppDisplay = getOcppStatusDisplay(ocppStatus);
//     const availability = connectorInfo?.live_state?.availability || 'UNAVAILABLE';
//     const availabilityDisplay = getAvailabilityDisplay(availability);
//     const freshness = connectorInfo?.live_state?.freshness || 'FRESH';
//     const connectionStatus = connectorInfo?.live_state?.connection_status || 'UNKNOWN';
//     const connectionDisplay = getConnectionStatusDisplay(connectionStatus);
    
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//         <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//           <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//               <Plug className="w-5 h-5 text-blue-600" />
//               Connector #{connector.connector_number} Details
//             </h3>
//             <button
//               onClick={() => {
//                 setShowConnectorDetail(false);
//                 setSelectedConnector(null);
//               }}
//               className="p-2 hover:bg-gray-100 rounded-xl transition"
//             >
//               <X className="w-5 h-5 text-gray-500" />
//             </button>
//           </div>
          
//           <div className="p-6 space-y-4">
//             {/* Basic Info */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-500">Connector Number</p>
//                 <p className="text-lg font-semibold text-gray-900">#{connector.connector_number}</p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-500">Connector Type</p>
//                 <p className="text-lg font-semibold text-gray-900">{connector.connector_type || 'N/A'}</p>
//               </div>
//             </div>

//             {/* Status Section */}
//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Activity size={16} className="text-blue-500" />
//                 Status Information
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Administrative Status</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${adminStatus.color}`}>
//                     {adminStatus.icon}
//                     {adminStatus.label}
//                   </span>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">OCPP Status</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${ocppDisplay.color}`}>
//                     {ocppDisplay.icon}
//                     {ocppDisplay.label}
//                   </span>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Availability</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${availabilityDisplay.color}`}>
//                     {availabilityDisplay.icon}
//                     {availabilityDisplay.label}
//                   </span>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Connection Status</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${connectionDisplay.color}`}>
//                     {connectionDisplay.icon}
//                     {connectionDisplay.label}
//                   </span>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Data Freshness</p>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${freshness === 'FRESH' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
//                     {freshness === 'FRESH' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
//                     {freshness}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Capacity & ID */}
//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Info size={16} className="text-blue-500" />
//                 Technical Details
//               </h4>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Total Capacity</p>
//                   <p className="text-base font-semibold text-gray-900">{connector.connector_total_capacity || 0} kW</p>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">Connector ID</p>
//                   <p className="text-sm font-mono text-gray-600">{connector.id || 'N/A'}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Timestamps */}
//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Clock size={16} className="text-blue-500" />
//                 Timestamps
//               </h4>
//               <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
//                 <div>
//                   <p>Created: {connector.created_at ? new Date(connector.created_at).toLocaleString() : 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p>Updated: {connector.updated_at ? new Date(connector.updated_at).toLocaleString() : 'N/A'}</p>
//                 </div>
//                 {connectorInfo?.live_state?.last_ocpp_status_at && (
//                   <div className="col-span-2">
//                     <p>Last OCPP Update: {new Date(connectorInfo.live_state.last_ocpp_status_at).toLocaleString()}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Close Button */}
//             <div className="border-t border-gray-200 pt-4">
//               <button
//                 onClick={() => {
//                   setShowConnectorDetail(false);
//                   setSelectedConnector(null);
//                 }}
//                 className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (isRefreshing && loading) {
//     return (
//       <div className="min-h-screen bg-white flex">
//         <Sidebar />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600">Refreshing session...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex">
//       <Sidebar 
//         isDarkMode={isDarkMode} 
//         onThemeToggle={handleThemeToggle}
//         userName={userData?.user?.full_name || user?.name || 'User'}
//         userEmail={userData?.user?.email || user?.email || ''}
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         {/* HEADER */}
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1 text-sm text-gray-500">
//                  <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
//                 <button 
//                   onClick={() => navigate('/dashboard')}
//                   className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
//                 >
//                     /  Dashboard
//                 </button>
//                 <span className="text-gray-400">/</span>
//                 <span className="text-gray-700 font-medium">Chargers</span>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2 relative">
//               <button
//                 onClick={fetchOperationalData}
//                 disabled={operationalLoading}
//                 className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 hover:text-gray-800 disabled:opacity-50"
//                 title="Refresh operational status"
//               >
//                 <RefreshCw size={18} className={operationalLoading ? 'animate-spin' : ''} />
//               </button>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowSettingsMenu(!showSettingsMenu)}
//                   className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
//                 >
//                   <Settings size={20} />
//                   <ChevronDown size={16} />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowAddMenu(!showAddMenu)}
//                   className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//                 >
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Title */}
//         <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-green-700">Charger Management</h1>
//               <p className="text-sm text-gray-500 mt-0.5">Manage all EV charging stations and monitor sessions</p>
//             </div>
//             <button
//               onClick={() => navigate('/add-charger')}
//               className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25"
//             >
//               <Plus size={18} />
//               Add Charger
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white border-b border-gray-200 px-6">
//           <div className="flex items-center gap-8">
//             <button
//               onClick={() => setActiveTab('chargers')}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 activeTab === 'chargers' 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <Zap size={18} />
//               <span className="font-medium">Chargers</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{totalChargers}</span>
//             </button>
//             <button
//               onClick={handleGoToSessions}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 activeTab === 'sessions' 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <Activity size={18} />
//               <span className="font-medium">Sessions</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{dummySessions.length}</span>
//             </button>
//             <button
//               onClick={() => setShowEvents(!showEvents)}
//               className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
//                 showEvents 
//                   ? 'border-blue-600 text-blue-600' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <History size={18} />
//               <span className="font-medium">Events</span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{operationalEvents.length}</span>
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Operational Fleet Stats - OCPP Status */}
//           {fleetData && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Total Connectors</p>
//                     <p className="text-xl font-bold text-gray-900">{operationalStats.total || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
//                     <Plug className="w-5 h-5 text-blue-600" />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Available</p>
//                     <p className="text-xl font-bold text-green-600">{operationalStats.available || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Available</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Charging</p>
//                     <p className="text-xl font-bold text-blue-600">{operationalStats.charging || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
//                     <Zap className="w-5 h-5 text-blue-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Charging</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Faulted</p>
//                     <p className="text-xl font-bold text-red-600">{operationalStats.faulted || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
//                     <AlertCircle className="w-5 h-5 text-red-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Faulted</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Unavailable</p>
//                     <p className="text-xl font-bold text-gray-600">{operationalStats.unavailable || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
//                     <CircleOff className="w-5 h-5 text-gray-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">OCPP Unavailable</p>
//               </div>

//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs text-gray-500">Active Sessions</p>
//                     <p className="text-xl font-bold text-purple-600">{fleetData.active_sessions || 0}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
//                     <Activity className="w-5 h-5 text-purple-600" />
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">Current sessions</p>
//               </div>
//             </div>
//           )}

//           {/* Events Panel */}
//           {showEvents && (
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
//               <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                   <RadioTower size={18} className="text-blue-600" />
//                   Operational Events ({operationalEvents.length})
//                 </h3>
//                 <button
//                   onClick={() => setShowEvents(false)}
//                   className="p-1 hover:bg-gray-100 rounded-lg transition"
//                 >
//                   <X size={16} className="text-gray-500" />
//                 </button>
//               </div>
//               <div className="max-h-64 overflow-y-auto">
//                 {operationalEvents.length === 0 ? (
//                   <div className="p-8 text-center text-gray-500 text-sm">No events available</div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Resource</th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Time</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {operationalEvents.map((event, idx) => (
//                         <tr key={event.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
//                           <td className="px-4 py-2 text-xs text-gray-400 font-mono">{event.id || 'N/A'}</td>
//                           <td className="px-4 py-2 text-xs text-gray-600">
//                             <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
//                               {event.type || 'Unknown'}
//                             </span>
//                           </td>
//                           <td className="px-4 py-2 text-xs text-gray-700">
//                             {event.resource_type}: {event.resource_id}
//                           </td>
//                           <td className="px-4 py-2 text-xs text-gray-500">
//                             {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : 'N/A'}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Filters Row - UPDATED: OCPP Connector Status dropdown replaces CMS status buttons */}
//           <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//             {/* Left Side - OCPP Connector Status Dropdown */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Plug size={16} className="text-blue-500" />
//                 OCPP Connector Status:
//               </span>
//               <div className="relative">
//                 <select
//                   value={ocppStatusFilter}
//                   onChange={(e) => setOcppStatusFilter(e.target.value)}
//                   className="text-sm px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10 min-w-[180px]"
//                 >
//                   <option value="All">All OCPP Status</option>
//                   <option value="Available">Available ({connectorStatusCounts.Available})</option>
//                   <option value="Preparing">Preparing ({connectorStatusCounts.Preparing})</option>
//                   <option value="Charging">Charging ({connectorStatusCounts.Charging})</option>
//                   <option value="Finishing">Finishing ({connectorStatusCounts.Finishing})</option>
//                   <option value="Faulted">Faulted ({connectorStatusCounts.Faulted})</option>
//                 </select>
//                 <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
//               </div>

//               {/* Quick filter pills for OCPP status */}
//               <div className="flex items-center gap-1.5 flex-wrap">
//                 {OCPP_FILTER_OPTIONS.map((option) => (
//                   <button
//                     key={option.value}
//                     onClick={() => setOcppStatusFilter(option.value)}
//                     className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
//                       ocppStatusFilter === option.value
//                         ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
//                         : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     {option.icon}
//                     {option.value === 'All' ? 'All' : option.label}
//                     {option.value !== 'All' && (
//                       <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
//                         {connectorStatusCounts[option.value] || 0}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Right Side - Filters with Search */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Battery size={16} className="text-blue-500" />
//                 Administrative Charger Status:
//               </span>
//               <select
//                 value={chargerStatusFilter}
//                 onChange={(e) => setChargerStatusFilter(e.target.value)}
//                 className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All Status</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="INACTIVE">Inactive</option>
//                 <option value="SUSPENDED">Suspended</option>
//                 <option value="UNDERMAINTENANCE">Under Maintenance</option>
//                 <option value="DECOMMISSIONED">Decommissioned</option>
//               </select>

//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Wifi size={16} className="text-blue-500" />
//                 OCPP Charger Connection:
//               </span>
//               <select
//                 value={operationalStatusFilter}
//                 onChange={(e) => setOperationalStatusFilter(e.target.value)}
//                 className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All</option>
//                 <option value="Online">Online</option>
//                 <option value="Offline">Offline</option>
//                 <option value="Unknown">Unknown</option>
//               </select>

//               {/* Search Bar - Moved to extreme right side */}
//               <div className="relative">
//                 <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search chargers..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 bg-white"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//             {loading && chargers.length === 0 ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                   <p className="mt-4 text-gray-600">Loading chargers...</p>
//                 </div>
//               </div>
//             ) : error ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                   <p className="text-gray-600">{error}</p>
//                   <button
//                     onClick={() => fetchChargers()}
//                     className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//                   >
//                     Retry
//                   </button>
//                 </div>
//               </div>
//             ) : filteredChargers.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-16">
//                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                   <Plug className="w-10 h-10 text-gray-300" />
//                 </div>
//                 <p className="text-lg font-semibold text-gray-600">No Chargers Found</p>
//                 <p className="text-sm text-gray-400 mt-1">
//                   {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first charger'}
//                 </p>
//                 {!searchQuery && ocppStatusFilter === 'All' && chargerStatusFilter === 'All' && (
//                   <button
//                     onClick={() => navigate('/add-charger')}
//                     className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
//                   >
//                     <Plus size={18} />
//                     Add Charger
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gradient-to-r from-blue-50/80 to-gray-50/80 border-b border-gray-200">
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger ID</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Administrative Charger Status</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">OCPP Charger Connection</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connectors Status</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Power</th>
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredChargers.map((charger, index) => {
//                         const chargerShortId = charger.charger_id || charger.id;
//                         const opStatus = getConnectionStatusDisplay(
//                           operationalStatus[chargerShortId]?.live_state?.connection_status || 
//                           operationalStatus[chargerShortId]?.connection_status || 
//                           'UNKNOWN'
//                         );
//                         const adminStatus = getAdminStatusDisplay(charger.status);
//                         const connectors = charger.connectors || [];
                        
//                         return (
//                           <tr key={charger.id || charger.charger_id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
//                             <td className="px-4 py-3 text-sm text-gray-400 font-medium">{String(index + 1).padStart(2, '0')}</td>
//                             <td className="px-4 py-3 text-sm font-mono text-gray-600">
//                               {charger.charger_id || charger.id?.slice(0, 6) || 'N/A'}
//                             </td>
//                             <td className="px-4 py-3 text-sm font-medium text-gray-800">
//                               {charger.charger_name || charger.name || 'Unnamed'}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-500">
//                               {charger.serial_number || 'N/A'}
//                             </td>
//                             <td className="px-4 py-3 text-sm">
//                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${adminStatus.color}`}>
//                                 {adminStatus.icon}
//                                 {adminStatus.label}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-sm">
//                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${opStatus.color}`}>
//                                 {opStatus.icon}
//                                 {opStatus.label}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-600">
//                               <div className="flex flex-col gap-1.5">
//                                 <span className="inline-flex items-center gap-1 text-xs text-gray-500">
//                                   <Plug size={14} className="text-blue-400" />
//                                   {connectors.length} connector{connectors.length > 1 ? 's' : ''}
//                                 </span>
//                                 {connectors.length > 0 && (
//                                   <div className="flex flex-wrap items-center gap-1.5">
//                                     {connectors.map((conn, idx) => {
//                                       const ocppStatus = getConnectorOcppStatus(chargerShortId, conn.connector_number);
//                                       const ocppDisplay = getOcppStatusDisplay(ocppStatus);
//                                       const availability = getConnectorAvailability(chargerShortId, conn.connector_number);
//                                       const isAvailable = availability === 'AVAILABLE';
                                      
//                                       return (
//                                         <button
//                                           key={idx}
//                                           onClick={() => {
//                                             const connInfo = getConnectorDetail(chargerShortId, conn.connector_number);
//                                             setSelectedConnector({
//                                               ...conn,
//                                               chargerId: chargerShortId,
//                                               live_state: connInfo?.live_state || null
//                                             });
//                                             setShowConnectorDetail(true);
//                                           }}
//                                           className={`group inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer ${
//                                             ocppDisplay.color
//                                           } ${isAvailable ? 'border-green-300' : 'border-red-300'}`}
//                                           title={`Connector ${conn.connector_number}: ${ocppDisplay.label} (${availability})`}
//                                         >
//                                           {/* Connector icon with availability indicator */}
//                                           <div className="relative">
//                                             <Plug size={12} className={isAvailable ? 'text-green-600' : 'text-red-500'} />
//                                             <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
//                                           </div>
//                                           <span className="font-semibold">#{conn.connector_number}</span>
//                                           <span className="text-[8px] opacity-75 hidden sm:inline">{ocppDisplay.label}</span>
//                                           <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
//                                             {isAvailable ? '✓' : '✗'}
//                                           </span>
//                                         </button>
//                                       );
//                                     })}
//                                   </div>
//                                 )}
//                                 {/* Live update indicator */}
//                                 <div className="flex items-center gap-1 mt-0.5">
//                                   <span className="relative flex h-2 w-2">
//                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                                     <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                                   </span>
//                                   <span className="text-[8px] text-gray-400">Live</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-4 py-3 text-sm font-medium text-gray-700">
//                               {charger.max_power_kw || 0} kW
//                             </td>
//                             <td className="px-4 py-3 text-sm">
//                               <button
//                                 onClick={() => handleViewCharger(chargerShortId)}
//                                 className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs flex items-center gap-1 shadow-sm shadow-green-500/25"
//                               >
//                                 <Eye size={14} />
//                                 View
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination / Load More */}
//                 {pagination.has_more && (
//                   <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
//                     <button
//                       onClick={loadMoreChargers}
//                       disabled={loadingMore}
//                       className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loadingMore ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Loading...
//                         </>
//                       ) : (
//                         <>
//                           <RefreshCw size={16} />
//                           Load More Chargers
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}

//                 {/* Total count */}
//                 <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
//                   <span>Showing {filteredChargers.length} of {pagination.total || chargers.length} chargers</span>
//                   <div className="flex items-center gap-3">
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-green-500"></span>
//                       Active: {activeChargers}
//                     </span>
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-gray-400"></span>
//                       Inactive: {inactiveChargers}
//                     </span>
//                     <span className="inline-flex items-center gap-1">
//                       <span className="w-2 h-2 rounded-full bg-red-500"></span>
//                       Faulted: {faultedChargers}
//                     </span>
//                     {fleetData && (
//                       <span className="inline-flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
//                         <Wifi size={12} className="text-green-500" />
//                         {operationalStats.available || 0} avail
//                       </span>
//                     )}
//                     <span className="inline-flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
//                       <span className="relative flex h-2 w-2">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                         <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                       </span>
//                       Live
//                     </span>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Connector Detail Modal */}
//       {showConnectorDetail && <ConnectorDetailModal />}

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: scale(0.95); }
//           to { opacity: 1; transform: scale(1); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out forwards;
//         }
//         @keyframes pulse-dot {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.2); }
//         }
//         .pulse-dot {
//           animation: pulse-dot 1.5s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ChargersAndSessions;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  Search,
  Wifi,
  WifiOff,
  Zap,
  Plug,
  Battery,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  X,
  Power,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2,
  CircleOff,
  PowerOff,
  Power as PowerIcon,
  History,
  RadioTower,
  Wrench,
  Info,
  Trash2,
  Pause,
  Signal,
  Timer,
  ZapOff,
  AlertTriangle,
  Gauge,
  Thermometer,
  ShieldCheck
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  FLEET_OPERATIONS_API: `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
  OPERATIONAL_EVENTS_API: `${API_BASE_URL}/api/v1/cpo/operations/events`,
};

// OCPP Status Constants
const OCPP_STATUS = {
  AVAILABLE: 'Available',
  PREPARING: 'Preparing',
  CHARGING: 'Charging',
  FINISHING: 'Finishing',
  FAULTED: 'Faulted',
  UNKNOWN: 'Unknown'
};

// OCPP Status Display Configurations
const OCPP_STATUS_CONFIG = {
  'Available': { label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200', dotColor: 'bg-green-500' },
  'Preparing': { label: 'Preparing', icon: <Clock className="w-3 h-3 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-500' },
  'Charging': { label: 'Charging', icon: <Zap className="w-3 h-3 text-blue-500" />, color: 'bg-blue-100 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
  'Finishing': { label: 'Finishing', icon: <CheckCircle className="w-3 h-3 text-purple-500" />, color: 'bg-purple-100 text-purple-700 border-purple-200', dotColor: 'bg-purple-500' },
  'Faulted': { label: 'Faulted', icon: <AlertCircle className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200', dotColor: 'bg-red-500' },
  'Unknown': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200', dotColor: 'bg-gray-400' }
};

// Availability Status Display
const AVAILABILITY_STATUS_CONFIG = {
  'AVAILABLE': { label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
  'UNAVAILABLE': { label: 'Unavailable', icon: <CircleOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' }
};

// Connection Status Display
const CONNECTION_STATUS_CONFIG = {
  'ONLINE': { label: 'Online', icon: <Wifi className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
  'OFFLINE': { label: 'Offline', icon: <WifiOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
  'UNKNOWN': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

// Freshness Display
const FRESHNESS_CONFIG = {
  'FRESH': { label: 'Fresh', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
  'STALE': { label: 'Stale', icon: <Clock className="w-3 h-3 text-orange-500" />, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'UNKNOWN': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

// Admin Status Display
const ADMIN_STATUS_CONFIG = {
  'ACTIVE': { label: 'Active', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
  'INACTIVE': { label: 'Inactive', icon: <PowerOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
  'SUSPENDED': { label: 'Suspended', icon: <Pause className="w-3 h-3 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  'UNDERMAINTENANCE': { label: 'Under Maintenance', icon: <Wrench className="w-3 h-3 text-amber-500" />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'DECOMMISSIONED': { label: 'Decommissioned', icon: <Trash2 className="w-3 h-3 text-gray-500" />, color: 'bg-gray-100 text-gray-700 border-gray-200' }
};

// OCPP Status Filter Options (for dropdown)
const OCPP_FILTER_OPTIONS = [
  { value: 'All', label: 'All OCPP Status', icon: <Circle className="w-3 h-3 text-gray-400" /> },
  { value: 'Available', label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" /> },
  { value: 'Preparing', label: 'Preparing', icon: <Clock className="w-3 h-3 text-yellow-500" /> },
  { value: 'Charging', label: 'Charging', icon: <Zap className="w-3 h-3 text-blue-500" /> },
  { value: 'Finishing', label: 'Finishing', icon: <CheckCircle className="w-3 h-3 text-purple-500" /> },
  { value: 'Faulted', label: 'Faulted', icon: <AlertCircle className="w-3 h-3 text-red-500" /> }
];

// Helper function to get status display
const getStatusDisplay = (status, config) => {
  return config[status] || config['Unknown'] || { label: status || 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' };
};

const ChargersAndSessions = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chargers');
  const [showEvents, setShowEvents] = useState(false);
  
  // Chargers state
  const [chargers, setChargers] = useState([]);
  const [pagination, setPagination] = useState({
    before: null,
    before_id: null,
    limit: 50,
    has_more: false,
    total: 0
  });
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Operational states
  const [fleetData, setFleetData] = useState(null);
  const [operationalEvents, setOperationalEvents] = useState([]);
  const [operationalLoading, setOperationalLoading] = useState(false);
  
  // Connector detail modal
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showConnectorDetail, setShowConnectorDetail] = useState(false);
  
  // Filter states
  const [chargerStatusFilter, setChargerStatusFilter] = useState('All');
  const [operationalStatusFilter, setOperationalStatusFilter] = useState('All');
  const [ocppStatusFilter, setOcppStatusFilter] = useState('All');

  // Dummy sessions data
  const dummySessions = [
    {
      id: "SES-001",
      session_id: "SES-2026-001",
      hub_name: "Newtown Hub",
      charger_name: "Benny 7.4kWh",
      driver_name: "John Doe",
      start_time: "2026-08-03T14:30:00+05:30",
      duration_minutes: 135,
      energy_consumed: 45.5,
      status: "Completed",
      cost: "₹ 386.75",
      anomaly_detected: false
    }
  ];

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchChargers();
    fetchOperationalData();
  }, [isAuthenticated, navigate]);

  // Fetch operational data (fleet stats and events)
  const fetchOperationalData = async () => {
    setOperationalLoading(true);
    try {
      // Fetch fleet summary
      const fleetResponse = await authenticatedRequest(API_CONFIG.FLEET_OPERATIONS_API, {
        method: 'GET'
      });
      if (fleetResponse.ok) {
        const fleetData = await fleetResponse.json();
        setFleetData(fleetData);
      }

      // Fetch operational events
      const eventsResponse = await authenticatedRequest(
        `${API_CONFIG.OPERATIONAL_EVENTS_API}?limit=50`,
        { method: 'GET' }
      );
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setOperationalEvents(eventsData.events || eventsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching operational data:', error);
    } finally {
      setOperationalLoading(false);
    }
  };

  // Fetch chargers - Now includes live data in response
  const fetchChargers = useCallback(async (before = null, before_id = null) => {
    if (loadingMore) return;
    
    setLoading(true);
    setError('');
    
    try {
      let url = `${API_CONFIG.CHARGERS_API}?limit=${pagination.limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      const response = await authenticatedRequest(url, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const chargersData = data.chargers || data.data || data || [];
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || chargersData.length;

        setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
        setPagination({
          before: nextBefore,
          before_id: nextBeforeId,
          limit: pagination.limit,
          has_more: hasMore,
          total: total
        });
      } else {
        setError(data.message || data.error?.message || 'Failed to fetch chargers');
      }
    } catch (error) {
      console.error('Error fetching chargers:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.limit, loadingMore, authenticatedRequest]);

  // Load more chargers
  const loadMoreChargers = () => {
    if (pagination.has_more && !loadingMore && !loading) {
      setLoadingMore(true);
      fetchChargers(pagination.before, pagination.before_id);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const handleViewCharger = (chargerId) => {
    navigate(`/charger-details/${chargerId}`);
  };

  const handleGoToSessions = () => {
    navigate('/sessions');
  };

  // Status display functions using config objects
  const getConnectionStatusDisplay = (status) => {
    return getStatusDisplay(status, CONNECTION_STATUS_CONFIG);
  };

  const getAdminStatusDisplay = (status) => {
    return getStatusDisplay(status, ADMIN_STATUS_CONFIG);
  };

  const getOcppStatusDisplay = (status) => {
    return getStatusDisplay(status, OCPP_STATUS_CONFIG);
  };

  const getAvailabilityDisplay = (status) => {
    return getStatusDisplay(status, AVAILABILITY_STATUS_CONFIG);
  };

  const getFreshnessDisplay = (status) => {
    return getStatusDisplay(status, FRESHNESS_CONFIG);
  };

  // Get live data for a charger
  const getChargerLiveData = (charger) => {
    return charger?.live || null;
  };

  // Get connector live data for a specific connector
  const getConnectorLiveData = (charger, connectorNumber) => {
    const live = charger?.live;
    if (!live || !live.connectors) return null;
    return live.connectors.find(c => c.connector_number === connectorNumber) || null;
  };

  // Get OCPP status for a connector from live data
  const getConnectorOcppStatus = (charger, connectorNumber) => {
    const connLive = getConnectorLiveData(charger, connectorNumber);
    return connLive?.last_ocpp_status || 'Unknown';
  };

  // Get availability for a connector from live data
  const getConnectorAvailability = (charger, connectorNumber) => {
    const connLive = getConnectorLiveData(charger, connectorNumber);
    return connLive?.availability || 'UNAVAILABLE';
  };

  // Get connection status from live data
  const getChargerConnectionStatus = (charger) => {
    const live = getChargerLiveData(charger);
    return live?.charger?.connection_state || 'UNKNOWN';
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || user?.name || 'User'}
            </h4>
            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email || user?.email || 'user@transev.com'}
            </p>
            {userData?.role && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
                {userData.role}
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
          <User size={16} className="text-gray-500" /> 
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
          onClick={() => {
            setShowSettingsMenu(false);
            handleLogout();
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
        >
          <LogOut size={16} className="text-red-500" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add Dropdown Menu
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
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-charger");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Filter chargers
  const filteredChargers = chargers.filter(charger => {
    const chargerShortId = charger.charger_id || charger.id;
    const matchesSearch = 
      (charger.charger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chargerShortId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (charger.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // OCPP Connector Status filter
    let matchesOcppStatus = true;
    if (ocppStatusFilter !== 'All') {
      const connectors = charger.connectors || [];
      let hasMatchingStatus = false;
      for (const conn of connectors) {
        const ocppStatus = getConnectorOcppStatus(charger, conn.connector_number);
        if (ocppStatus === ocppStatusFilter) {
          hasMatchingStatus = true;
          break;
        }
      }
      matchesOcppStatus = hasMatchingStatus;
    }
    
    // Charger status filter (Admin status)
    const matchesChargerStatus = chargerStatusFilter === 'All' || 
      charger.status?.toUpperCase() === chargerStatusFilter.toUpperCase();
    
    // Operational connection status filter
    let matchesOperationalStatus = true;
    if (operationalStatusFilter !== 'All') {
      const connectionStatus = getChargerConnectionStatus(charger);
      if (operationalStatusFilter === 'Online') {
        matchesOperationalStatus = connectionStatus === 'ONLINE';
      } else if (operationalStatusFilter === 'Offline') {
        matchesOperationalStatus = connectionStatus === 'OFFLINE';
      } else if (operationalStatusFilter === 'Unknown') {
        matchesOperationalStatus = connectionStatus === 'UNKNOWN';
      }
    }
    
    return matchesSearch && matchesOcppStatus && matchesChargerStatus && matchesOperationalStatus;
  });

  // Stats
  const totalChargers = chargers.length;
  const activeChargers = chargers.filter(c => c.status === 'ACTIVE' || c.status === 'AVAILABLE' || c.status === 'CHARGING').length;
  const inactiveChargers = chargers.filter(c => c.status === 'INACTIVE' || c.status === 'OFFLINE' || c.status === 'UNAVAILABLE' || c.status === 'SUSPENDED' || c.status === 'DECOMMISSIONED').length;
  const faultedChargers = chargers.filter(c => c.status === 'FAULTED').length;

  const operationalStats = fleetData?.connectors || {
    total: 0,
    available: 0,
    charging: 0,
    faulted: 0,
    unavailable: 0
  };

  // Count connectors by OCPP status from live data
  const getConnectorStatusCounts = () => {
    const counts = { Available: 0, Preparing: 0, Charging: 0, Finishing: 0, Faulted: 0, Unknown: 0 };
    chargers.forEach(charger => {
      const connectors = charger.connectors || [];
      connectors.forEach(conn => {
        const status = getConnectorOcppStatus(charger, conn.connector_number);
        if (counts[status] !== undefined) {
          counts[status]++;
        } else {
          counts.Unknown++;
        }
      });
    });
    return counts;
  };
  const connectorStatusCounts = getConnectorStatusCounts();

  // Connector Detail Modal - Uses live data from charger response
  const ConnectorDetailModal = () => {
    if (!selectedConnector) return null;
    
    const connector = selectedConnector;
    const charger = selectedConnector.charger;
    const connectorLive = getConnectorLiveData(charger, connector.connector_number);
    const chargerLive = getChargerLiveData(charger);
    
    const adminStatus = getAdminStatusDisplay(connector.status);
    const ocppStatus = connectorLive?.last_ocpp_status || 'Unknown';
    const ocppDisplay = getOcppStatusDisplay(ocppStatus);
    const availability = connectorLive?.availability || 'UNAVAILABLE';
    const availabilityDisplay = getAvailabilityDisplay(availability);
    const freshness = connectorLive?.freshness || 'UNKNOWN';
    const freshnessDisplay = getFreshnessDisplay(freshness);
    const connectionStatus = connectorLive?.parent_connection_state || chargerLive?.charger?.connection_state || 'UNKNOWN';
    const connectionDisplay = getConnectionStatusDisplay(connectionStatus);
    const observedAt = connectorLive?.observed_at;
    const statusSequence = connectorLive?.status_sequence;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plug className="w-5 h-5 text-blue-600" />
              Connector #{connector.connector_number} Details
            </h3>
            <button
              onClick={() => {
                setShowConnectorDetail(false);
                setSelectedConnector(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Connector Number</p>
                <p className="text-lg font-semibold text-gray-900">#{connector.connector_number}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Connector Type</p>
                <p className="text-lg font-semibold text-gray-900">{connector.connector_type || 'N/A'}</p>
              </div>
            </div>

            {/* Status Section */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-blue-500" />
                Status Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Administrative Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${adminStatus.color}`}>
                    {adminStatus.icon}
                    {adminStatus.label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">OCPP Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${ocppDisplay.color}`}>
                    {ocppDisplay.icon}
                    {ocppDisplay.label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Availability</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${availabilityDisplay.color}`}>
                    {availabilityDisplay.icon}
                    {availabilityDisplay.label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Parent Connection</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${connectionDisplay.color}`}>
                    {connectionDisplay.icon}
                    {connectionDisplay.label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Data Freshness</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${freshnessDisplay.color}`}>
                    {freshnessDisplay.icon}
                    {freshnessDisplay.label}
                  </span>
                </div>
                {statusSequence !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Status Sequence</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">#{statusSequence}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Capacity & ID */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                Technical Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Total Capacity</p>
                  <p className="text-base font-semibold text-gray-900">{connector.connector_total_capacity || 0} kW</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Connector ID</p>
                  <p className="text-sm font-mono text-gray-600">{connector.id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Timestamps
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p>Created: {connector.created_at ? new Date(connector.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p>Updated: {connector.updated_at ? new Date(connector.updated_at).toLocaleString() : 'N/A'}</p>
                </div>
                {observedAt && (
                  <div className="col-span-2">
                    <p>Last OCPP Update: {new Date(observedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  setShowConnectorDetail(false);
                  setSelectedConnector(null);
                }}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Refreshing session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar 
        isDarkMode={isDarkMode} 
        onThemeToggle={handleThemeToggle}
        userName={userData?.user?.full_name || user?.name || 'User'}
        userEmail={userData?.user?.email || user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                 <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                >
                    /  Dashboard
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700 font-medium">Chargers</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button
                onClick={fetchOperationalData}
                disabled={operationalLoading}
                className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 hover:text-gray-800 disabled:opacity-50"
                title="Refresh operational status"
              >
                <RefreshCw size={18} className={operationalLoading ? 'animate-spin' : ''} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
                >
                  <Settings size={20} />
                  <ChevronDown size={16} />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Page Title */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700">Charger Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage all EV charging stations and monitor sessions</p>
            </div>
            <button
              onClick={() => navigate('/add-charger')}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25"
            >
              <Plus size={18} />
              Add Charger
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('chargers')}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'chargers' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap size={18} />
              <span className="font-medium">Chargers</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{totalChargers}</span>
            </button>
            <button
              onClick={handleGoToSessions}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'sessions' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity size={18} />
              <span className="font-medium">Sessions</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{dummySessions.length}</span>
            </button>
            <button
              onClick={() => setShowEvents(!showEvents)}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                showEvents 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History size={18} />
              <span className="font-medium">Events</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{operationalEvents.length}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Operational Fleet Stats - OCPP Status */}
          {fleetData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Connectors</p>
                    <p className="text-xl font-bold text-gray-900">{operationalStats.total || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Plug className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="text-xl font-bold text-green-600">{operationalStats.available || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">OCPP Available</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Charging</p>
                    <p className="text-xl font-bold text-blue-600">{operationalStats.charging || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">OCPP Charging</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Faulted</p>
                    <p className="text-xl font-bold text-red-600">{operationalStats.faulted || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">OCPP Faulted</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Unavailable</p>
                    <p className="text-xl font-bold text-gray-600">{operationalStats.unavailable || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <CircleOff className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">OCPP Unavailable</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Active Sessions</p>
                    <p className="text-xl font-bold text-purple-600">{fleetData.active_sessions || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Current sessions</p>
              </div>
            </div>
          )}

          {/* Events Panel */}
          {showEvents && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <RadioTower size={18} className="text-blue-600" />
                  Operational Events ({operationalEvents.length})
                </h3>
                <button
                  onClick={() => setShowEvents(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {operationalEvents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No events available</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Resource</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operationalEvents.map((event, idx) => (
                        <tr key={event.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                          <td className="px-4 py-2 text-xs text-gray-400 font-mono">{event.id || 'N/A'}</td>
                          <td className="px-4 py-2 text-xs text-gray-600">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {event.type || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-700">
                            {event.resource_type}: {event.resource_id}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-500">
                            {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Left Side - OCPP Connector Status Dropdown */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Plug size={16} className="text-blue-500" />
                OCPP Connector Status:
              </span>
              <div className="relative">
                <select
                  value={ocppStatusFilter}
                  onChange={(e) => setOcppStatusFilter(e.target.value)}
                  className="text-sm px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10 min-w-[180px]"
                >
                  <option value="All">All OCPP Status</option>
                  <option value="Available">Available ({connectorStatusCounts.Available})</option>
                  <option value="Preparing">Preparing ({connectorStatusCounts.Preparing})</option>
                  <option value="Charging">Charging ({connectorStatusCounts.Charging})</option>
                  <option value="Finishing">Finishing ({connectorStatusCounts.Finishing})</option>
                  <option value="Faulted">Faulted ({connectorStatusCounts.Faulted})</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Quick filter pills for OCPP status */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {OCPP_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOcppStatusFilter(option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                      ocppStatusFilter === option.value
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.icon}
                    {option.value === 'All' ? 'All' : option.label}
                    {option.value !== 'All' && (
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {connectorStatusCounts[option.value] || 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Filters with Search */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Battery size={16} className="text-blue-500" />
                Administrative Charger Status:
              </span>
              <select
                value={chargerStatusFilter}
                onChange={(e) => setChargerStatusFilter(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="UNDERMAINTENANCE">Under Maintenance</option>
                <option value="DECOMMISSIONED">Decommissioned</option>
              </select>

              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Wifi size={16} className="text-blue-500" />
                OCPP Charger Connection:
              </span>
              <select
                value={operationalStatusFilter}
                onChange={(e) => setOperationalStatusFilter(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Unknown">Unknown</option>
              </select>

              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chargers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading && chargers.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading chargers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={() => fetchChargers()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredChargers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plug className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-lg font-semibold text-gray-600">No Chargers Found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first charger'}
                </p>
                {!searchQuery && ocppStatusFilter === 'All' && chargerStatusFilter === 'All' && (
                  <button
                    onClick={() => navigate('/add-charger')}
                    className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Charger
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50/80 to-gray-50/80 border-b border-gray-200">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger ID</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Administrative Charger Status</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">OCPP Charger Connection</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connectors Status</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Power</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChargers.map((charger, index) => {
                        const chargerShortId = charger.charger_id || charger.id;
                        const connectionStatus = getChargerConnectionStatus(charger);
                        const opStatus = getConnectionStatusDisplay(connectionStatus);
                        const adminStatus = getAdminStatusDisplay(charger.status);
                        const connectors = charger.connectors || [];
                        const chargerLive = getChargerLiveData(charger);
                        const freshness = chargerLive?.charger?.connection_freshness || 'UNKNOWN';
                        const freshnessDisplay = getFreshnessDisplay(freshness);
                        
                        return (
                          <tr key={charger.id || charger.charger_id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
                            <td className="px-4 py-3 text-sm text-gray-400 font-medium">{String(index + 1).padStart(2, '0')}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600">
                              {charger.charger_id || charger.id?.slice(0, 6) || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              {charger.charger_name || charger.name || 'Unnamed'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {charger.serial_number || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${adminStatus.color}`}>
                                {adminStatus.icon}
                                {adminStatus.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${opStatus.color}`}>
                                  {opStatus.icon}
                                  {opStatus.label}
                                </span>
                                {freshness !== 'UNKNOWN' && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${freshnessDisplay.color}`}>
                                    {freshnessDisplay.icon}
                                    {freshnessDisplay.label}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <div className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <Plug size={14} className="text-blue-400" />
                                  {connectors.length} connector{connectors.length > 1 ? 's' : ''}
                                </span>
                                {connectors.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {connectors.map((conn, idx) => {
                                      const ocppStatus = getConnectorOcppStatus(charger, conn.connector_number);
                                      const ocppDisplay = getOcppStatusDisplay(ocppStatus);
                                      const availability = getConnectorAvailability(charger, conn.connector_number);
                                      const isAvailable = availability === 'AVAILABLE';
                                      const connLive = getConnectorLiveData(charger, conn.connector_number);
                                      const connFreshness = connLive?.freshness || 'UNKNOWN';
                                      const connFreshnessDisplay = getFreshnessDisplay(connFreshness);
                                      
                                      return (
                                        <button
                                          key={idx}
                                          onClick={() => {
                                            setSelectedConnector({
                                              ...conn,
                                              charger: charger,
                                              live_state: connLive || null
                                            });
                                            setShowConnectorDetail(true);
                                          }}
                                          className={`group inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer ${ocppDisplay.color} ${isAvailable ? 'border-green-300' : 'border-red-300'}`}
                                          title={`Connector ${conn.connector_number}: ${ocppDisplay.label} (${availability})`}
                                        >
                                          <div className="relative">
                                            <Plug size={12} className={isAvailable ? 'text-green-600' : 'text-red-500'} />
                                            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                          </div>
                                          <span className="font-semibold">#{conn.connector_number}</span>
                                          <span className="text-[8px] opacity-75 hidden sm:inline">{ocppDisplay.label}</span>
                                          <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {isAvailable ? '✓' : '✗'}
                                          </span>
                                          {connFreshness !== 'UNKNOWN' && (
                                            <span className={`text-[8px] px-1 py-0.5 rounded ${connFreshnessDisplay.color}`}>
                                              {connFreshnessDisplay.label}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                {/* Live update indicator */}
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  <span className="text-[8px] text-gray-400">Live</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              {charger.max_power_kw || 0} kW
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => handleViewCharger(chargerShortId)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs flex items-center gap-1 shadow-sm shadow-green-500/25"
                              >
                                <Eye size={14} />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination / Load More */}
                {pagination.has_more && (
                  <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
                    <button
                      onClick={loadMoreChargers}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Load More Chargers
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Total count */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                  <span>Showing {filteredChargers.length} of {pagination.total || chargers.length} chargers</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Active: {activeChargers}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      Inactive: {inactiveChargers}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Faulted: {faultedChargers}
                    </span>
                    {fleetData && (
                      <span className="inline-flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
                        <Wifi size={12} className="text-green-500" />
                        {operationalStats.available || 0} avail
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Connector Detail Modal */}
      {showConnectorDetail && <ConnectorDetailModal />}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChargersAndSessions;
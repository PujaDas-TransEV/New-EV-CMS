// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Settings,
//   Plus,
//   ChevronDown,
//   User,
//   Building,
//   LogOut,
//   Search,
//   Filter,
//   Activity,
//   Clock,
//   Calendar,
//   MapPin,
//   Globe,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   X,
//   ArrowLeft,
//   RefreshCw,
//   Download,
//   Zap,
//   Plug,
//   Wifi,
//   WifiOff,
//   Loader2,
//   ChevronLeft,
//   ChevronRight,
//   Eye,
//   MoreVertical,
//   FileText,
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   Battery,
//   Smartphone,
//   Monitor,
//   Server,
//   Circle,
//   CircleDot,
//   CircleCheck,
//   CircleX,
//   Grid,
//   List
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   SESSIONS_API: `${API_BASE_URL}/api/v1/app/auth/sessions`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
//   LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
//   REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`
// };

// // Token Refresh Functions
// const refreshAccessToken = async () => {
//   const refreshToken = localStorage.getItem('refresh_token');
  
//   if (!refreshToken) {
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
//       const refreshResult = await refreshAccessToken();
      
//       if (refreshResult.success) {
//         const newToken = localStorage.getItem('token');
        
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

// const Sessions = () => {
//   const navigate = useNavigate();
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [showFilterPopup, setShowFilterPopup] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   // Sessions state
//   const [sessions, setSessions] = useState([]);
//   const [pagination, setPagination] = useState({
//     before: null,
//     before_id: null,
//     limit: 50,
//     has_more: false,
//     total: 0
//   });
//   const [loadingMore, setLoadingMore] = useState(false);
  
//   // Filter states
//   const [selectedFilter, setSelectedFilter] = useState('All');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [sessionTypeFilter, setSessionTypeFilter] = useState('All');

//   // Dummy sessions data (since actual sessions API might not have data yet)
//   const dummySessions = [
//     {
//       id: "SES-001",
//       session_id: "SES-2026-001",
//       hub_name: "Newtown Hub",
//       charger_id: "CH-001",
//       charger_name: "Benny 7.4kWh",
//       connector_id: "CON-001",
//       connector_type: "Type 2",
//       start_time: "2026-08-03T14:30:00+05:30",
//       end_time: "2026-08-03T16:45:00+05:30",
//       duration_minutes: 135,
//       energy_consumed: 45.5,
//       status: "Completed",
//       vehicle_details: "Tesla Model 3",
//       driver_name: "John Doe",
//       driver_email: "john@example.com",
//       id_tag: "RFID-12345",
//       mac_id: "AA:BB:CC:DD:EE:FF",
//       firmware_version: "v2.1.3",
//       protocol: "OCPP",
//       segment: "Premium",
//       start_criteria: "RFID",
//       address: "Action Area III",
//       city: "Kolkata",
//       state: "West Bengal",
//       cost: "₹ 386.75",
//       anomaly_detected: false
//     },
//     {
//       id: "SES-002",
//       session_id: "SES-2026-002",
//       hub_name: "Salt Lake Hub",
//       charger_id: "CH-004",
//       charger_name: "PowerMax 150kWh",
//       connector_id: "CON-004",
//       connector_type: "CCS",
//       start_time: "2026-08-03T10:15:00+05:30",
//       end_time: "2026-08-03T11:30:00+05:30",
//       duration_minutes: 75,
//       energy_consumed: 78.2,
//       status: "Completed",
//       vehicle_details: "Hyundai IONIQ 5",
//       driver_name: "Jane Smith",
//       driver_email: "jane@example.com",
//       id_tag: "RFID-67890",
//       mac_id: "FF:EE:DD:CC:BB:AA",
//       firmware_version: "v3.0.0",
//       protocol: "OCPP",
//       segment: "Premium",
//       start_criteria: "App",
//       address: "Salt Lake Sector V",
//       city: "Kolkata",
//       state: "West Bengal",
//       cost: "₹ 625.60",
//       anomaly_detected: false
//     },
//     {
//       id: "SES-003",
//       session_id: "SES-2026-003",
//       hub_name: "Rajarhat Hub",
//       charger_id: "CH-002",
//       charger_name: "Transev 60kWh",
//       connector_id: "CON-002",
//       connector_type: "Type 2",
//       start_time: "2026-08-02T09:00:00+05:30",
//       end_time: "2026-08-02T11:30:00+05:30",
//       duration_minutes: 150,
//       energy_consumed: 55.8,
//       status: "Ongoing",
//       vehicle_details: "MG ZS EV",
//       driver_name: "Raj Kumar",
//       driver_email: "raj@example.com",
//       id_tag: "RFID-11111",
//       mac_id: "AA:BB:CC:DD:EE:11",
//       firmware_version: "v1.8.2",
//       protocol: "OCPP",
//       segment: "Standard",
//       start_criteria: "RFID",
//       address: "Rajarhat Main Road",
//       city: "Kolkata",
//       state: "West Bengal",
//       cost: "₹ 446.40",
//       anomaly_detected: false
//     },
//     {
//       id: "SES-004",
//       session_id: "SES-2026-004",
//       hub_name: "Airport Hub",
//       charger_id: "CH-003",
//       charger_name: "EcoCharge 22kWh",
//       connector_id: "CON-003",
//       connector_type: "Type 1",
//       start_time: "2026-08-01T13:00:00+05:30",
//       end_time: "2026-08-01T13:45:00+05:30",
//       duration_minutes: 45,
//       energy_consumed: 12.3,
//       status: "Completed",
//       vehicle_details: "Tata Nexon EV",
//       driver_name: "Priya Singh",
//       driver_email: "priya@example.com",
//       id_tag: "RFID-22222",
//       mac_id: "BB:CC:DD:EE:FF:22",
//       firmware_version: "v1.0.1",
//       protocol: "Kazam",
//       segment: "Standard",
//       start_criteria: "App",
//       address: "Airport Road",
//       city: "Kolkata",
//       state: "West Bengal",
//       cost: "₹ 83.03",
//       anomaly_detected: true
//     },
//     {
//       id: "SES-005",
//       session_id: "SES-2026-005",
//       hub_name: "Eco Park Hub",
//       charger_id: "CH-005",
//       charger_name: "Delta 75kWh",
//       connector_id: "CON-005",
//       connector_type: "CCS",
//       start_time: "2026-08-02T16:00:00+05:30",
//       end_time: "2026-08-02T17:30:00+05:30",
//       duration_minutes: 90,
//       energy_consumed: 65.4,
//       status: "Completed",
//       vehicle_details: "BYD Atto 3",
//       driver_name: "Amit Das",
//       driver_email: "amit@example.com",
//       id_tag: "RFID-33333",
//       mac_id: "CC:DD:EE:FF:AA:33",
//       firmware_version: "v2.0.5",
//       protocol: "OCPP",
//       segment: "Premium",
//       start_criteria: "RFID",
//       address: "Eco Park, New Town",
//       city: "Kolkata",
//       state: "West Bengal",
//       cost: "₹ 523.20",
//       anomaly_detected: false
//     }
//   ];

//   // Fetch user info
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//     fetchSessions();
//   }, []);

//   const fetchUserInfo = async () => {
//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
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

//   const fetchSessions = useCallback(async (before = null, before_id = null) => {
//     if (loadingMore) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
//       if (before) {
//         url += `&before=${before}`;
//       }
//       if (before_id) {
//         url += `&before_id=${before_id}`;
//       }

//       const response = await fetchWithTokenRefresh(url, {
//         method: 'GET'
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // If API returns data, use it; otherwise use dummy data
//         const sessionsData = data.sessions || data.data || data || dummySessions;
//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;
//         const total = data.total || sessionsData.length;

//         setSessions(prev => before ? [...prev, ...sessionsData] : sessionsData);
//         setPagination({
//           before: nextBefore,
//           before_id: nextBeforeId,
//           limit: pagination.limit,
//           has_more: hasMore,
//           total: total
//         });
//       } else {
//         // If API fails, use dummy data
//         setSessions(dummySessions);
//         setPagination({
//           before: null,
//           before_id: null,
//           limit: 50,
//           has_more: false,
//           total: dummySessions.length
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching sessions:', error);
//       // Use dummy data on error
//       setSessions(dummySessions);
//       setPagination({
//         before: null,
//         before_id: null,
//         limit: 50,
//         has_more: false,
//         total: dummySessions.length
//       });
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   }, [pagination.limit]);

//   const loadMoreSessions = () => {
//     if (pagination.has_more && !loadingMore && !loading) {
//       setLoadingMore(true);
//       fetchSessions(pagination.before, pagination.before_id);
//     }
//   };

//   const handleLogout = async () => {
//     const token = localStorage.getItem('token');
    
//     try {
//       if (token) {
//         await fetch(API_CONFIG.LOGOUT_API, {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'X-CPO-App-ID': CPO_APP_ID,
//             'Content-Type': 'application/json'
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       navigate('/signin');
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatDuration = (minutes) => {
//     if (!minutes) return 'N/A';
//     const hrs = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     if (hrs > 0) {
//       return `${hrs}h ${mins}m`;
//     }
//     return `${mins}m`;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'Completed': 'bg-green-100 text-green-700 border-green-200',
//       'Ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
//       'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
//       'Failed': 'bg-red-100 text-red-700 border-red-200',
//       'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
//   };

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'Completed':
//         return <CheckCircle className="w-3 h-3" />;
//       case 'Ongoing':
//         return <Activity className="w-3 h-3" />;
//       case 'Pending':
//         return <Clock className="w-3 h-3" />;
//       case 'Failed':
//         return <AlertCircle className="w-3 h-3" />;
//       default:
//         return <Circle className="w-3 h-3" />;
//     }
//   };

//   // Settings Dropdown Menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
//             {userData?.user?.full_name?.charAt(0) || 'U'}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">
//               {userData?.user?.full_name || 'User'}
//             </h4>
//             <p className="text-sm text-gray-400 truncate">
//               {userData?.user?.email || 'user@transev.com'}
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

//   // Filter Popup
//   const FilterPopup = () => (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//             <Filter size={18} className="text-green-600" />
//             Filters
//           </h3>
//           <button
//             onClick={() => setShowFilterPopup(false)}
//             className="p-1 hover:bg-gray-100 rounded-lg transition"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
//             >
//               <option value="All">All Status</option>
//               <option value="Completed">Completed</option>
//               <option value="Ongoing">Ongoing</option>
//               <option value="Pending">Pending</option>
//               <option value="Failed">Failed</option>
//               <option value="Cancelled">Cancelled</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Type</label>
//             <select
//               value={sessionTypeFilter}
//               onChange={(e) => setSessionTypeFilter(e.target.value)}
//               className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
//             >
//               <option value="All">All Types</option>
//               <option value="Normal">Normal</option>
//               <option value="Anomaly">Anomaly</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Protocol</label>
//             <select
//               value={selectedFilter}
//               onChange={(e) => setSelectedFilter(e.target.value)}
//               className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
//             >
//               <option value="All">All Protocols</option>
//               <option value="OCPP">OCPP</option>
//               <option value="Kazam">Kazam</option>
//             </select>
//           </div>

//           <div className="flex gap-3 pt-2">
//             <button
//               onClick={() => {
//                 setShowFilterPopup(false);
//               }}
//               className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-lg shadow-green-500/25"
//             >
//               Apply Filters
//             </button>
//             <button
//               onClick={() => {
//                 setStatusFilter('All');
//                 setSessionTypeFilter('All');
//                 setSelectedFilter('All');
//               }}
//               className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
//             >
//               Clear All
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Filter sessions
//   const filteredSessions = sessions.filter(session => {
//     const matchesSearch = 
//       (session.session_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (session.hub_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (session.charger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (session.driver_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (session.charger_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
//     const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
//     const matchesType = sessionTypeFilter === 'All' || 
//                         (sessionTypeFilter === 'Anomaly' && session.anomaly_detected) ||
//                         (sessionTypeFilter === 'Normal' && !session.anomaly_detected);
//     const matchesProtocol = selectedFilter === 'All' || session.protocol === selectedFilter;
    
//     return matchesSearch && matchesStatus && matchesType && matchesProtocol;
//   });

//   // Stats
//   const totalSessions = sessions.length;
//   const completedSessions = sessions.filter(s => s.status === 'Completed').length;
//   const ongoingSessions = sessions.filter(s => s.status === 'Ongoing').length;
//   const anomalySessions = sessions.filter(s => s.anomaly_detected).length;

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <Sidebar 
//         isDarkMode={isDarkMode} 
//         onThemeToggle={handleThemeToggle}
//         userName={userData?.user?.full_name || 'User'}
//         userEmail={userData?.user?.email || ''}
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         {/* HEADER */}
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
          
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
//                 <p className="text-sm text-gray-500">View all charging sessions</p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2 relative">
//               <div className="relative">
//                 <button
//                   onClick={() => setShowSettingsMenu(!showSettingsMenu)}
//                   className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5"
//                 >
//                   <Settings size={20} className="text-gray-600" />
//                   <ChevronDown size={16} className="text-gray-400" />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowAddMenu(!showAddMenu)}
//                   className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition shadow-lg shadow-green-500/25"
//                 >
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Content */}
//         <div className="p-6">
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Sessions</p>
//                   <p className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
//                   <Activity className="w-5 h-5 text-blue-600" />
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Completed</p>
//                   <p className="text-2xl font-bold text-emerald-600 mt-1">{completedSessions}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
//                   <CheckCircle className="w-5 h-5 text-emerald-600" />
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Ongoing</p>
//                   <p className="text-2xl font-bold text-blue-600 mt-1">{ongoingSessions}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
//                   <Clock className="w-5 h-5 text-blue-600" />
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Anomaly Detected</p>
//                   <p className="text-2xl font-bold text-red-600 mt-1">{anomalySessions}</p>
//                 </div>
//                 <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
//                   <AlertCircle className="w-5 h-5 text-red-600" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => {
//                   setStatusFilter('All');
//                   setSessionTypeFilter('All');
//                   setSelectedFilter('All');
//                   setSearchQuery('');
//                 }}
//                 className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
//               >
//                 Clear Filters
//               </button>
//             </div>

//             <div className="flex items-center gap-2">
//               <div className="relative">
//                 <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search sessions..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-56 bg-gray-50"
//                 />
//               </div>
//               <button
//                 onClick={() => setShowFilterPopup(true)}
//                 className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium text-gray-700"
//               >
//                 <Filter size={16} className="text-gray-500" />
//                 Filter
//               </button>
//               {showFilterPopup && <FilterPopup />}
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//             {loading && sessions.length === 0 ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                   <p className="mt-4 text-gray-600">Loading sessions...</p>
//                 </div>
//               </div>
//             ) : filteredSessions.length === 0 ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <Activity className="w-16 h-16 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500 font-medium">No Sessions Found</p>
//                   <p className="text-sm text-gray-400 mt-1">
//                     {searchQuery ? 'Try adjusting your search' : 'No sessions available'}
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gray-50 border-b border-gray-200">
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Session ID</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hub</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Energy</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Anomaly</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
//                         <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredSessions.map((session, index) => (
//                         <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
//                           <td className="px-3 py-2.5 text-sm text-gray-500">{index + 1}</td>
//                           <td className="px-3 py-2.5 text-sm font-mono text-gray-600">
//                             {session.session_id || session.id}
//                           </td>
//                           <td className="px-3 py-2.5 text-sm text-gray-700">{session.hub_name || 'N/A'}</td>
//                           <td className="px-3 py-2.5 text-sm text-gray-700">
//                             {session.charger_name || session.charger_id || 'N/A'}
//                           </td>
//                           <td className="px-3 py-2.5 text-sm text-gray-700">{session.driver_name || 'N/A'}</td>
//                           <td className="px-3 py-2.5 text-sm text-gray-600">{formatDate(session.start_time)}</td>
//                           <td className="px-3 py-2.5 text-sm text-gray-700">
//                             {formatDuration(session.duration_minutes)}
//                           </td>
//                           <td className="px-3 py-2.5 text-sm text-gray-700">
//                             {session.energy_consumed || 0} kWh
//                           </td>
//                           <td className="px-3 py-2.5 text-sm">
//                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
//                               {getStatusIcon(session.status)}
//                               {session.status || 'N/A'}
//                             </span>
//                           </td>
//                           <td className="px-3 py-2.5 text-sm">
//                             {session.anomaly_detected ? (
//                               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
//                                 <AlertCircle size={12} />
//                                 Yes
//                               </span>
//                             ) : (
//                               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
//                                 <CheckCircle size={12} />
//                                 No
//                               </span>
//                             )}
//                           </td>
//                           <td className="px-3 py-2.5 text-sm font-medium text-gray-700">
//                             {session.cost || 'N/A'}
//                           </td>
//                           <td className="px-3 py-2.5 text-sm">
//                             <button
//                               className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
//                               title="View Details"
//                             >
//                               <Eye size={16} />
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
//                       onClick={loadMoreSessions}
//                       disabled={loadingMore}
//                       className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loadingMore ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Loading...
//                         </>
//                       ) : (
//                         <>
//                           <RefreshCw size={16} />
//                           Load More Sessions
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}

//                 {/* Total count */}
//                 <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
//                   Showing {filteredSessions.length} of {pagination.total || sessions.length} sessions
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

// export default Sessions;

// src/components/ChargerSessions/Session.jsx
// src/components/ChargerSessions/Session.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Filter,
  Activity,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
  RefreshCw,
  Download,
  Zap,
  Plug,
  Wifi,
  WifiOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Battery,
  Smartphone,
  Monitor,
  Server,
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  Grid,
  List
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  SESSIONS_API: `${API_BASE_URL}/api/v1/app/auth/sessions`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const Sessions = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user,
    refreshToken  // ✅ যোগ করুন
  } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({
    before: null,
    before_id: null,
    limit: 50,
    has_more: false,
    total: 0
  });
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filter states
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('All');

  // Dummy sessions data (fallback)
  const dummySessions = [
    {
      id: "SES-001",
      session_id: "SES-2026-001",
      hub_name: "Newtown Hub",
      charger_id: "CH-001",
      charger_name: "Benny 7.4kWh",
      connector_id: "CON-001",
      connector_type: "Type 2",
      start_time: "2026-08-03T14:30:00+05:30",
      end_time: "2026-08-03T16:45:00+05:30",
      duration_minutes: 135,
      energy_consumed: 45.5,
      status: "Completed",
      vehicle_details: "Tesla Model 3",
      driver_name: "John Doe",
      driver_email: "john@example.com",
      id_tag: "RFID-12345",
      mac_id: "AA:BB:CC:DD:EE:FF",
      firmware_version: "v2.1.3",
      protocol: "OCPP",
      segment: "Premium",
      start_criteria: "RFID",
      address: "Action Area III",
      city: "Kolkata",
      state: "West Bengal",
      cost: "₹ 386.75",
      anomaly_detected: false
    },
    {
      id: "SES-002",
      session_id: "SES-2026-002",
      hub_name: "Salt Lake Hub",
      charger_id: "CH-004",
      charger_name: "PowerMax 150kWh",
      connector_id: "CON-004",
      connector_type: "CCS",
      start_time: "2026-08-03T10:15:00+05:30",
      end_time: "2026-08-03T11:30:00+05:30",
      duration_minutes: 75,
      energy_consumed: 78.2,
      status: "Completed",
      vehicle_details: "Hyundai IONIQ 5",
      driver_name: "Jane Smith",
      driver_email: "jane@example.com",
      id_tag: "RFID-67890",
      mac_id: "FF:EE:DD:CC:BB:AA",
      firmware_version: "v3.0.0",
      protocol: "OCPP",
      segment: "Premium",
      start_criteria: "App",
      address: "Salt Lake Sector V",
      city: "Kolkata",
      state: "West Bengal",
      cost: "₹ 625.60",
      anomaly_detected: false
    },
    {
      id: "SES-003",
      session_id: "SES-2026-003",
      hub_name: "Rajarhat Hub",
      charger_id: "CH-002",
      charger_name: "Transev 60kWh",
      connector_id: "CON-002",
      connector_type: "Type 2",
      start_time: "2026-08-02T09:00:00+05:30",
      end_time: "2026-08-02T11:30:00+05:30",
      duration_minutes: 150,
      energy_consumed: 55.8,
      status: "Ongoing",
      vehicle_details: "MG ZS EV",
      driver_name: "Raj Kumar",
      driver_email: "raj@example.com",
      id_tag: "RFID-11111",
      mac_id: "AA:BB:CC:DD:EE:11",
      firmware_version: "v1.8.2",
      protocol: "OCPP",
      segment: "Standard",
      start_criteria: "RFID",
      address: "Rajarhat Main Road",
      city: "Kolkata",
      state: "West Bengal",
      cost: "₹ 446.40",
      anomaly_detected: false
    },
    {
      id: "SES-004",
      session_id: "SES-2026-004",
      hub_name: "Airport Hub",
      charger_id: "CH-003",
      charger_name: "EcoCharge 22kWh",
      connector_id: "CON-003",
      connector_type: "Type 1",
      start_time: "2026-08-01T13:00:00+05:30",
      end_time: "2026-08-01T13:45:00+05:30",
      duration_minutes: 45,
      energy_consumed: 12.3,
      status: "Completed",
      vehicle_details: "Tata Nexon EV",
      driver_name: "Priya Singh",
      driver_email: "priya@example.com",
      id_tag: "RFID-22222",
      mac_id: "BB:CC:DD:EE:FF:22",
      firmware_version: "v1.0.1",
      protocol: "Kazam",
      segment: "Standard",
      start_criteria: "App",
      address: "Airport Road",
      city: "Kolkata",
      state: "West Bengal",
      cost: "₹ 83.03",
      anomaly_detected: true
    },
    {
      id: "SES-005",
      session_id: "SES-2026-005",
      hub_name: "Eco Park Hub",
      charger_id: "CH-005",
      charger_name: "Delta 75kWh",
      connector_id: "CON-005",
      connector_type: "CCS",
      start_time: "2026-08-02T16:00:00+05:30",
      end_time: "2026-08-02T17:30:00+05:30",
      duration_minutes: 90,
      energy_consumed: 65.4,
      status: "Completed",
      vehicle_details: "BYD Atto 3",
      driver_name: "Amit Das",
      driver_email: "amit@example.com",
      id_tag: "RFID-33333",
      mac_id: "CC:DD:EE:FF:AA:33",
      firmware_version: "v2.0.5",
      protocol: "OCPP",
      segment: "Premium",
      start_criteria: "RFID",
      address: "Eco Park, New Town",
      city: "Kolkata",
      state: "West Bengal",
      cost: "₹ 523.20",
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
    fetchSessions();
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user info:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchSessions = useCallback(async (before = null, before_id = null) => {
    if (loadingMore) return;
    
    setLoading(true);
    setError('');
    
    try {
      let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      console.log('📤 Fetching sessions:', url);
      const response = await authenticatedRequest(url, {
        method: 'GET'
      });

      console.log('📥 Sessions response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Sessions data:', data);
        
        const sessionsData = data.sessions || data.data || data || dummySessions;
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || sessionsData.length;

        setSessions(prev => before ? [...prev, ...sessionsData] : sessionsData);
        setPagination({
          before: nextBefore,
          before_id: nextBeforeId,
          limit: pagination.limit,
          has_more: hasMore,
          total: total
        });
      } else if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Session expired');
        setError('Session expired. Please login again.');
        // Try to refresh token
        const newToken = await refreshToken();
        if (newToken) {
          // Retry the request
          const retryResponse = await authenticatedRequest(url, {
            method: 'GET'
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            const sessionsData = data.sessions || data.data || data || dummySessions;
            setSessions(sessionsData);
            setPagination({
              before: null,
              before_id: null,
              limit: 50,
              has_more: false,
              total: sessionsData.length
            });
            setLoading(false);
            setLoadingMore(false);
            return;
          }
        }
        // If refresh fails, use dummy data
        setSessions(dummySessions);
        setPagination({
          before: null,
          before_id: null,
          limit: 50,
          has_more: false,
          total: dummySessions.length
        });
      } else {
        console.error('❌ Failed to fetch sessions:', response.status);
        setSessions(dummySessions);
        setPagination({
          before: null,
          before_id: null,
          limit: 50,
          has_more: false,
          total: dummySessions.length
        });
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      setSessions(dummySessions);
      setPagination({
        before: null,
        before_id: null,
        limit: 50,
        has_more: false,
        total: dummySessions.length
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.limit, authenticatedRequest, refreshToken]);

  const loadMoreSessions = () => {
    if (pagination.has_more && !loadingMore && !loading) {
      setLoadingMore(true);
      fetchSessions(pagination.before, pagination.before_id);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Failed': 'bg-red-100 text-red-700 border-red-200',
      'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'Ongoing':
        return <Activity className="w-3 h-3" />;
      case 'Pending':
        return <Clock className="w-3 h-3" />;
      case 'Failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
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

  // Filter Popup
  const FilterPopup = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter size={18} className="text-green-600" />
            Filters
          </h3>
          <button
            onClick={() => setShowFilterPopup(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Type</label>
            <select
              value={sessionTypeFilter}
              onChange={(e) => setSessionTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="All">All Types</option>
              <option value="Normal">Normal</option>
              <option value="Anomaly">Anomaly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Protocol</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="All">All Protocols</option>
              <option value="OCPP">OCPP</option>
              <option value="Kazam">Kazam</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowFilterPopup(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-lg shadow-green-500/25"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setStatusFilter('All');
                setSessionTypeFilter('All');
                setSelectedFilter('All');
              }}
              className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      (session.session_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.hub_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.charger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.driver_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.charger_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
    const matchesType = sessionTypeFilter === 'All' || 
                        (sessionTypeFilter === 'Anomaly' && session.anomaly_detected) ||
                        (sessionTypeFilter === 'Normal' && !session.anomaly_detected);
    const matchesProtocol = selectedFilter === 'All' || session.protocol === selectedFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesProtocol;
  });

  // Stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'Completed').length;
  const ongoingSessions = sessions.filter(s => s.status === 'Ongoing').length;
  const anomalySessions = sessions.filter(s => s.anomaly_detected).length;

  // Show loading if refreshing
  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Refreshing session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isDarkMode={isDarkMode} 
        onThemeToggle={handleThemeToggle}
        userName={userData?.user?.full_name || user?.name || 'User'}
        userEmail={userData?.user?.email || user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
                <p className="text-sm text-gray-500">View all charging sessions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition shadow-lg shadow-green-500/25"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</p>
                </div>
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{completedSessions}</p>
                </div>
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ongoing</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{ongoingSessions}</p>
                </div>
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Anomaly Detected</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{anomalySessions}</p>
                </div>
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setSessionTypeFilter('All');
                  setSelectedFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-56 bg-gray-50"
                />
              </div>
              <button
                onClick={() => setShowFilterPopup(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium text-gray-700"
              >
                <Filter size={16} className="text-gray-500" />
                Filter
              </button>
              {showFilterPopup && <FilterPopup />}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading && sessions.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading sessions...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    fetchSessions();
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No Sessions Found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery ? 'Try adjusting your search' : 'No sessions available'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Session ID</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hub</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Energy</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Anomaly</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map((session, index) => (
                        <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                          <td className="px-3 py-2.5 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2.5 text-sm font-mono text-gray-600">
                            {session.session_id || session.id}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.hub_name || 'N/A'}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">
                            {session.charger_name || session.charger_id || 'N/A'}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.driver_name || 'N/A'}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-600">{formatDate(session.start_time)}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">
                            {formatDuration(session.duration_minutes)}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">
                            {session.energy_consumed || 0} kWh
                          </td>
                          <td className="px-3 py-2.5 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              {session.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-sm">
                            {session.anomaly_detected ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <AlertCircle size={12} />
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle size={12} />
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-sm font-medium text-gray-700">
                            {session.cost || 'N/A'}
                          </td>
                          <td className="px-3 py-2.5 text-sm">
                            <button
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination / Load More */}
                {pagination.has_more && (
                  <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
                    <button
                      onClick={loadMoreSessions}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Load More Sessions
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Total count */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                  Showing {filteredSessions.length} of {pagination.total || sessions.length} sessions
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Sessions;
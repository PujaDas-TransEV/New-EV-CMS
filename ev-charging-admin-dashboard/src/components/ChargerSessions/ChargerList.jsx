// // src/components/Revenue/ChargerList.jsx
// import React, {
//   useState,
//   useEffect,
//   useCallback
// } from 'react';

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
//   X,
//   Eye,
//   Loader2,
//   CircleOff,
//   PowerOff,
//   History,
//   RadioTower,
//   Wrench,
//   Info,
//   Trash2,
//   Pause,
//   RefreshCw
// } from 'lucide-react';

// import Sidebar from '../Sidebar/Sidebar';

// const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL ||
//   'https://dev-evcmsnew.transev.site';

// const API_CONFIG = {
//   CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
//   FLEET_OPERATIONS_API:
//     `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
//   OPERATIONAL_EVENTS_API:
//     `${API_BASE_URL}/api/v1/cpo/operations/events`
// };

// // ============================================================================
// // OCPP STATUS CONFIG - Based on API Response
// // ============================================================================
// const OCPP_STATUS_CONFIG = {
//   'Available': {
//     label: 'Available',
//     icon: <CheckCircle className="w-3 h-3 text-green-500" />,
//     color: 'bg-green-100 text-green-700 border-green-200'
//   },
//   'Preparing': {
//     label: 'Preparing',
//     icon: <Clock className="w-3 h-3 text-yellow-500" />,
//     color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
//   },
//   'Charging': {
//     label: 'Charging',
//     icon: <Zap className="w-3 h-3 text-blue-500" />,
//     color: 'bg-blue-100 text-blue-700 border-blue-200'
//   },
//   'Finishing': {
//     label: 'Finishing',
//     icon: <CheckCircle className="w-3 h-3 text-purple-500" />,
//     color: 'bg-purple-100 text-purple-700 border-purple-200'
//   },
//   'Faulted': {
//     label: 'Faulted',
//     icon: <AlertCircle className="w-3 h-3 text-red-500" />,
//     color: 'bg-red-100 text-red-700 border-red-200'
//   },
//   'Unknown': {
//     label: 'Unknown',
//     icon: <Circle className="w-3 h-3 text-gray-400" />,
//     color: 'bg-gray-100 text-gray-600 border-gray-200'
//   }
// };

// // ============================================================================
// // AVAILABILITY STATUS CONFIG - Based on API Response
// // ============================================================================
// const AVAILABILITY_STATUS_CONFIG = {
//   'AVAILABLE': {
//     label: 'Available',
//     icon: <CheckCircle className="w-3 h-3 text-green-500" />,
//     color: 'bg-green-100 text-green-700 border-green-200'
//   },
//   'UNAVAILABLE': {
//     label: 'Unavailable',
//     icon: <CircleOff className="w-3 h-3 text-red-500" />,
//     color: 'bg-red-100 text-red-700 border-red-200'
//   },
//   'CHARGING': {
//     label: 'Charging',
//     icon: <Zap className="w-3 h-3 text-blue-500" />,
//     color: 'bg-blue-100 text-blue-700 border-blue-200'
//   },
//   'PREPARING': {
//     label: 'Preparing',
//     icon: <Clock className="w-3 h-3 text-yellow-500" />,
//     color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
//   },
//   'FAULTED': {
//     label: 'Faulted',
//     icon: <AlertCircle className="w-3 h-3 text-red-500" />,
//     color: 'bg-red-100 text-red-700 border-red-200'
//   },
//   'FINISHING': {
//     label: 'Finishing',
//     icon: <CheckCircle className="w-3 h-3 text-purple-500" />,
//     color: 'bg-purple-100 text-purple-700 border-purple-200'
//   },
//   'UNKNOWN': {
//     label: 'Unknown',
//     icon: <Circle className="w-3 h-3 text-gray-400" />,
//     color: 'bg-gray-100 text-gray-600 border-gray-200'
//   }
// };

// const CONNECTION_STATUS_CONFIG = {
//   'ONLINE': {
//     label: 'Online',
//     icon: <Wifi className="w-3 h-3 text-green-500" />,
//     color: 'bg-green-100 text-green-700 border-green-200'
//   },
//   'OFFLINE': {
//     label: 'Offline',
//     icon: <WifiOff className="w-3 h-3 text-red-500" />,
//     color: 'bg-red-100 text-red-700 border-red-200'
//   },
//   'UNKNOWN': {
//     label: 'Unknown',
//     icon: <Circle className="w-3 h-3 text-gray-400" />,
//     color: 'bg-gray-100 text-gray-600 border-gray-200'
//   }
// };

// const FRESHNESS_CONFIG = {
//   'FRESH': {
//     label: 'Fresh',
//     icon: <CheckCircle className="w-3 h-3 text-green-500" />,
//     color: 'bg-green-100 text-green-700 border-green-200'
//   },
//   'STALE': {
//     label: 'Stale',
//     icon: <Clock className="w-3 h-3 text-orange-500" />,
//     color: 'bg-orange-100 text-orange-700 border-orange-200'
//   },
//   'UNKNOWN': {
//     label: 'Unknown',
//     icon: <Circle className="w-3 h-3 text-gray-400" />,
//     color: 'bg-gray-100 text-gray-600 border-gray-200'
//   }
// };

// const ADMIN_STATUS_CONFIG = {
//   'ACTIVE': {
//     label: 'Active',
//     icon: <CheckCircle className="w-3 h-3 text-green-500" />,
//     color: 'bg-green-100 text-green-700 border-green-200'
//   },
//   'INACTIVE': {
//     label: 'Inactive',
//     icon: <PowerOff className="w-3 h-3 text-red-500" />,
//     color: 'bg-red-100 text-red-700 border-red-200'
//   },
//   'SUSPENDED': {
//     label: 'Suspended',
//     icon: <Pause className="w-3 h-3 text-yellow-500" />,
//     color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
//   },
//   'UNDERMAINTENANCE': {
//     label: 'Under Maintenance',
//     icon: <Wrench className="w-3 h-3 text-amber-500" />,
//     color: 'bg-amber-100 text-amber-700 border-amber-200'
//   },
//   'DECOMMISSIONED': {
//     label: 'Decommissioned',
//     icon: <Trash2 className="w-3 h-3 text-gray-500" />,
//     color: 'bg-gray-100 text-gray-700 border-gray-200'
//   }
// };

// const getStatusDisplay = (status, config) => {
//   return (
//     config[status] ||
//     config['Unknown'] ||
//     config['UNKNOWN'] || {
//       label: status || 'Unknown',
//       icon: <Circle className="w-3 h-3 text-gray-400" />,
//       color: 'bg-gray-100 text-gray-600 border-gray-200'
//     }
//   );
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

//   const [showSettingsMenu, setShowSettingsMenu] =
//     useState(false);
//   const [showAddMenu, setShowAddMenu] =
//     useState(false);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const [activeTab, setActiveTab] =
//     useState('chargers');
//   const [showEvents, setShowEvents] =
//     useState(false);

//   const [chargers, setChargers] = useState([]);

//   const [pagination, setPagination] = useState({
//     before: null,
//     before_id: null,
//     limit: 50,
//     has_more: false,
//     total: 0
//   });

//   const [loadingMore, setLoadingMore] =
//     useState(false);

//   const [fleetData, setFleetData] = useState(null);
//   const [operationalEvents, setOperationalEvents] =
//     useState([]);
//   const [operationalLoading, setOperationalLoading] =
//     useState(false);

//   const [selectedConnector, setSelectedConnector] =
//     useState(null);
//   const [showConnectorDetail, setShowConnectorDetail] =
//     useState(false);

//   const [chargerStatusFilter, setChargerStatusFilter] =
//     useState('All');
//   const [operationalStatusFilter, setOperationalStatusFilter] =
//     useState('All');
//   const [ocppStatusFilter, setOcppStatusFilter] =
//     useState('All');

//   const dummySessions = [
//     {
//       id: 'SES-001',
//       session_id: 'SES-2026-001',
//       hub_name: 'Newtown Hub',
//       charger_name: 'Benny 7.4kWh',
//       driver_name: 'John Doe',
//       start_time: '2026-08-03T14:30:00+05:30',
//       duration_minutes: 135,
//       energy_consumed: 45.5,
//       status: 'Completed',
//       cost: '₹ 386.75',
//       anomaly_detected: false
//     }
//   ];

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/signin');
//       return;
//     }

//     fetchUserInfo();
//     fetchChargers();
//     fetchOperationalData();
//   }, [isAuthenticated, navigate]);

//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(
//         API_CONFIG.USER_INFO_API,
//         {
//           method: 'GET'
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setUserData(data);
//       }
//     } catch (err) {
//       console.error('User info error:', err);
//     }
//   };

//   const fetchOperationalData = async () => {
//     setOperationalLoading(true);

//     try {
//       const fleetResponse = await authenticatedRequest(
//         API_CONFIG.FLEET_OPERATIONS_API,
//         {
//           method: 'GET'
//         }
//       );

//       if (fleetResponse.ok) {
//         const data = await fleetResponse.json();
//         setFleetData(data);
//       }

//       const eventsResponse = await authenticatedRequest(
//         `${API_CONFIG.OPERATIONAL_EVENTS_API}?limit=50`,
//         {
//           method: 'GET'
//         }
//       );

//       if (eventsResponse.ok) {
//         const data = await eventsResponse.json();

//         setOperationalEvents(
//           data.events ||
//           data.data ||
//           []
//         );
//       }
//     } catch (err) {
//       console.error('Operational data error:', err);
//     } finally {
//       setOperationalLoading(false);
//     }
//   };

//   const fetchChargers = useCallback(
//     async (before = null, beforeId = null) => {
//       if (loadingMore) return;

//       if (before) {
//         setLoadingMore(true);
//       } else {
//         setLoading(true);
//       }

//       setError('');

//       try {
//         let url =
//           `${API_CONFIG.CHARGERS_API}?limit=${pagination.limit}`;

//         if (before) {
//           url += `&before=${encodeURIComponent(before)}`;
//         }

//         if (beforeId) {
//           url += `&before_id=${encodeURIComponent(beforeId)}`;
//         }

//         const response = await authenticatedRequest(url, {
//           method: 'GET'
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data.message ||
//             data.error?.message ||
//             'Failed to fetch chargers'
//           );
//         }

//         const chargersData = Array.isArray(data.chargers)
//           ? data.chargers
//           : Array.isArray(data.data)
//             ? data.data
//             : Array.isArray(data)
//               ? data
//               : [];

//         const nextBefore =
//           data.next_before || null;

//         const nextBeforeId =
//           data.next_before_id || null;

//         const hasMore =
//           Boolean(data.has_more);

//         setChargers(previous =>
//           before
//             ? [...previous, ...chargersData]
//             : chargersData
//         );

//         setPagination(previous => ({
//           ...previous,
//           before: nextBefore,
//           before_id: nextBeforeId,
//           has_more: hasMore,
//           total:
//             data.total ||
//             (before
//               ? previous.total + chargersData.length
//               : chargersData.length)
//         }));
//       } catch (err) {
//         console.error('Chargers fetch error:', err);
//         setError(err.message || 'An error occurred');
//       } finally {
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [
//       authenticatedRequest,
//       loadingMore,
//       pagination.limit
//     ]
//   );

//   const loadMoreChargers = () => {
//     if (
//       pagination.has_more &&
//       !loadingMore &&
//       !loading
//     ) {
//       fetchChargers(
//         pagination.before,
//         pagination.before_id
//       );
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (err) {
//       console.error('Logout error:', err);

//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');

//       navigate('/signin');
//     }
//   };

//   const handleViewCharger = chargerId => {
//     navigate(`/charger-details/${chargerId}`);
//   };

//   // ============================================================================
//   // HELPER FUNCTIONS - FIXED TO CORRECTLY READ LIVE DATA
//   // ============================================================================

//   const getChargerLiveData = charger => {
//     return charger?.live || null;
//   };

//   /*
//    * IMPORTANT FIX:
//    * API live.connectors has connector_id.
//    * Master charger.connectors has id.
//    * Match by connector.id === live.connector_id
//    * ALSO match by connector_number as fallback
//    */
//   const getConnectorLiveData = (
//     charger,
//     connector
//   ) => {
//     if (!charger || !connector) return null;
    
//     const liveConnectors =
//       charger?.live?.connectors || [];

//     if (liveConnectors.length === 0) return null;

//     // First try to match by connector_id (UUID)
//     let found = liveConnectors.find(
//       liveConnector =>
//         String(liveConnector.connector_id) ===
//         String(connector.id)
//     );

//     // If not found, try by connector_number
//     if (!found) {
//       found = liveConnectors.find(
//         liveConnector =>
//           Number(liveConnector.connector_number) ===
//           Number(connector.connector_number)
//       );
//     }

//     return found || null;
//   };

//   const getConnectorOcppStatus = (
//     charger,
//     connector
//   ) => {
//     const liveConnector =
//       getConnectorLiveData(charger, connector);

//     return (
//       liveConnector?.last_ocpp_status ||
//       'Unknown'
//     );
//   };

//   const getConnectorAvailability = (
//     charger,
//     connector
//   ) => {
//     const liveConnector =
//       getConnectorLiveData(charger, connector);

//     return (
//       liveConnector?.availability ||
//       'UNKNOWN'
//     );
//   };

//   const getChargerConnectionStatus = charger => {
//     return (
//       charger?.live?.charger?.connection_state ||
//       'UNKNOWN'
//     );
//   };

//   const getConnectorConnectionStatus = (
//     charger,
//     connector
//   ) => {
//     const liveConnector =
//       getConnectorLiveData(charger, connector);

//     return (
//       liveConnector?.parent_connection_state ||
//       getChargerConnectionStatus(charger) ||
//       'UNKNOWN'
//     );
//   };

//   const getConnectorFreshness = (
//     charger,
//     connector
//   ) => {
//     const liveConnector =
//       getConnectorLiveData(charger, connector);

//     return liveConnector?.freshness || 'UNKNOWN';
//   };

//   // ============================================================================
//   // LIVE CONNECTOR STATS
//   // ============================================================================

//   const getLiveConnectorStats = () => {
//     const stats = {
//       total: 0,
//       available: 0,
//       preparing: 0,
//       charging: 0,
//       finishing: 0,
//       faulted: 0,
//       unavailable: 0,
//       unknown: 0,
//       online: 0,
//       offline: 0
//     };

//     chargers.forEach(charger => {
//       const connectors =
//         charger.connectors || [];

//       connectors.forEach(connector => {
//         stats.total++;

//         const liveConnector =
//           getConnectorLiveData(
//             charger,
//             connector
//           );

//         const ocppStatus =
//           liveConnector?.last_ocpp_status ||
//           'Unknown';

//         const availability =
//           liveConnector?.availability ||
//           'UNKNOWN';

//         const connectionStatus =
//           liveConnector?.parent_connection_state ||
//           getChargerConnectionStatus(charger);

//         if (ocppStatus === 'Available') {
//           stats.available++;
//         } else if (ocppStatus === 'Preparing') {
//           stats.preparing++;
//         } else if (ocppStatus === 'Charging') {
//           stats.charging++;
//         } else if (ocppStatus === 'Finishing') {
//           stats.finishing++;
//         } else if (ocppStatus === 'Faulted') {
//           stats.faulted++;
//         } else {
//           stats.unknown++;
//         }

//         if (availability === 'UNAVAILABLE') {
//           stats.unavailable++;
//         }

//         if (connectionStatus === 'ONLINE') {
//           stats.online++;
//         }

//         if (connectionStatus === 'OFFLINE') {
//           stats.offline++;
//         }
//       });
//     });

//     return stats;
//   };

//   const liveConnectorStats =
//     getLiveConnectorStats();

//   const getConnectorStatusCounts = () => {
//     const counts = {
//       Available: 0,
//       Preparing: 0,
//       Charging: 0,
//       Finishing: 0,
//       Faulted: 0,
//       Unknown: 0
//     };

//     chargers.forEach(charger => {
//       const connectors =
//         charger.connectors || [];

//       connectors.forEach(connector => {
//         const status =
//           getConnectorOcppStatus(
//             charger,
//             connector
//           );

//         if (
//           Object.prototype.hasOwnProperty.call(
//             counts,
//             status
//           )
//         ) {
//           counts[status]++;
//         } else {
//           counts.Unknown++;
//         }
//       });
//     });

//     return counts;
//   };

//   const connectorStatusCounts =
//     getConnectorStatusCounts();

//   const totalChargers = chargers.length;

//   const activeChargers = chargers.filter(
//     charger =>
//       charger.status === 'ACTIVE'
//   ).length;

//   const inactiveChargers = chargers.filter(
//     charger =>
//       charger.status === 'INACTIVE'
//   ).length;

//   const faultedChargers = chargers.filter(
//     charger =>
//       charger.status === 'FAULTED'
//   ).length;

//   // ============================================================================
//   // FILTER CHARGERS
//   // ============================================================================

//   const filteredChargers = chargers.filter(
//     charger => {
//       const chargerShortId =
//         charger.charger_id ||
//         charger.id ||
//         '';

//       const searchText =
//         searchQuery.toLowerCase();

//       const matchesSearch =
//         (charger.charger_name || '')
//           .toLowerCase()
//           .includes(searchText) ||
//         chargerShortId
//           .toLowerCase()
//           .includes(searchText) ||
//         (charger.serial_number || '')
//           .toLowerCase()
//           .includes(searchText);

//       const matchesOcppStatus =
//         ocppStatusFilter === 'All' ||
//         (charger.connectors || []).some(
//           connector =>
//             getConnectorOcppStatus(
//               charger,
//               connector
//             ) === ocppStatusFilter
//         );

//       const matchesChargerStatus =
//         chargerStatusFilter === 'All' ||
//         charger.status?.toUpperCase() ===
//           chargerStatusFilter.toUpperCase();

//       const connectionStatus =
//         getChargerConnectionStatus(charger);

//       let matchesOperationalStatus = true;

//       if (
//         operationalStatusFilter === 'Online'
//       ) {
//         matchesOperationalStatus =
//           connectionStatus === 'ONLINE';
//       }

//       if (
//         operationalStatusFilter === 'Offline'
//       ) {
//         matchesOperationalStatus =
//           connectionStatus === 'OFFLINE';
//       }

//       if (
//         operationalStatusFilter === 'Unknown'
//       ) {
//         matchesOperationalStatus =
//           connectionStatus === 'UNKNOWN';
//       }

//       return (
//         matchesSearch &&
//         matchesOcppStatus &&
//         matchesChargerStatus &&
//         matchesOperationalStatus
//       );
//     }
//   );

//   const closeConnectorModal = () => {
//     setSelectedConnector(null);
//     setShowConnectorDetail(false);
//   };

//   // ============================================================================
//   // SETTINGS & ADD MENUS
//   // ============================================================================

//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
//             {(userData?.user?.full_name ||
//               user?.name ||
//               'U'
//             ).charAt(0)}
//           </div>

//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">
//               {userData?.user?.full_name ||
//                 user?.name ||
//                 'User'}
//             </h4>

//             <p className="text-sm text-gray-400 truncate">
//               {userData?.user?.email ||
//                 user?.email ||
//                 'user@transev.com'}
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
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
//         >
//           <User size={16} />
//           Profile
//         </button>

//         <button
//           onClick={() => {
//             setShowSettingsMenu(false);
//             navigate('/organization');
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
//         >
//           <Building size={16} />
//           Organization
//         </button>

//         <div className="border-t border-gray-700 my-1" />

//         <button
//           onClick={() => {
//             setShowSettingsMenu(false);
//             handleLogout();
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 flex items-center gap-3"
//         >
//           <LogOut size={16} />
//           Sign Out
//         </button>
//       </div>
//     </div>
//   );

//   const AddMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
//       <div className="p-3">
//         <button
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate('/add-hub');
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
//         >
//           <Plus size={18} />
//           Add Hub
//         </button>

//         <button
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate('/add-charger');
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
//         >
//           <Zap size={18} />
//           Add Charger
//         </button>
//       </div>
//     </div>
//   );

//   // ============================================================================
//   // CONNECTOR DETAIL MODAL
//   // ============================================================================

//   const ConnectorDetailModal = () => {
//     if (!selectedConnector) return null;

//     const connector = selectedConnector;
//     const charger = selectedConnector.charger;

//     const connectorLive =
//       getConnectorLiveData(
//         charger,
//         connector
//       );

//     const adminStatus = getStatusDisplay(
//       connector.status,
//       ADMIN_STATUS_CONFIG
//     );

//     const ocppStatus =
//       connectorLive?.last_ocpp_status ||
//       'Unknown';

//     const ocppDisplay = getStatusDisplay(
//       ocppStatus,
//       OCPP_STATUS_CONFIG
//     );

//     const availability =
//       connectorLive?.availability ||
//       'UNKNOWN';

//     const availabilityDisplay =
//       getStatusDisplay(
//         availability,
//         AVAILABILITY_STATUS_CONFIG
//       );

//     const connectionStatus =
//       connectorLive?.parent_connection_state ||
//       getChargerConnectionStatus(charger);

//     const connectionDisplay =
//       getStatusDisplay(
//         connectionStatus,
//         CONNECTION_STATUS_CONFIG
//       );

//     const freshness =
//       connectorLive?.freshness ||
//       'UNKNOWN';

//     const freshnessDisplay =
//       getStatusDisplay(
//         freshness,
//         FRESHNESS_CONFIG
//       );

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//         <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
//           <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//               <Plug className="w-5 h-5 text-blue-600" />
//               Connector #{connector.connector_number} Details
//             </h3>

//             <button
//               onClick={closeConnectorModal}
//               className="p-2 hover:bg-gray-100 rounded-xl"
//             >
//               <X className="w-5 h-5 text-gray-500" />
//             </button>
//           </div>

//           <div className="p-6 space-y-5">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-500">
//                   Connector Number
//                 </p>
//                 <p className="text-lg font-semibold text-gray-900">
//                   #{connector.connector_number}
//                 </p>
//               </div>

//               <div className="bg-gray-50 rounded-xl p-4">
//                 <p className="text-xs text-gray-500">
//                   Connector Type
//                 </p>
//                 <p className="text-lg font-semibold text-gray-900">
//                   {connector.connector_type || 'N/A'}
//                 </p>
//               </div>
//             </div>

//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Activity size={16} className="text-blue-500" />
//                 Status Information
//               </h4>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Administrative Status
//                   </p>
//                   <span
//                     className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${adminStatus.color}`}
//                   >
//                     {adminStatus.icon}
//                     {adminStatus.label}
//                   </span>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Last OCPP Status
//                   </p>
//                   <span
//                     className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${ocppDisplay.color}`}
//                   >
//                     {ocppDisplay.icon}
//                     {ocppDisplay.label}
//                   </span>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Availability
//                   </p>
//                   <span
//                     className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${availabilityDisplay.color}`}
//                   >
//                     {availabilityDisplay.icon}
//                     {availabilityDisplay.label}
//                   </span>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Parent Connection
//                   </p>
//                   <span
//                     className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${connectionDisplay.color}`}
//                   >
//                     {connectionDisplay.icon}
//                     {connectionDisplay.label}
//                   </span>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Data Freshness
//                   </p>
//                   <span
//                     className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${freshnessDisplay.color}`}
//                   >
//                     {freshnessDisplay.icon}
//                     {freshnessDisplay.label}
//                   </span>
//                 </div>

//                 {connectorLive?.status_sequence !== undefined && (
//                   <div className="bg-gray-50 rounded-xl p-3">
//                     <p className="text-xs text-gray-500">
//                       Status Sequence
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">
//                       #{connectorLive.status_sequence}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Info size={16} className="text-blue-500" />
//                 Technical Details
//               </h4>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Total Capacity
//                   </p>
//                   <p className="text-base font-semibold text-gray-900">
//                     {connector.connector_total_capacity || 0} kW
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Connector ID
//                   </p>
//                   <p className="text-xs font-mono text-gray-600 break-all">
//                     {connector.id || 'N/A'}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-3">
//                   <p className="text-xs text-gray-500">
//                     Live Connector ID
//                   </p>
//                   <p className="text-xs font-mono text-gray-600 break-all">
//                     {connectorLive?.connector_id || 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Clock size={16} className="text-blue-500" />
//                 Timestamps
//               </h4>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
//                 <p>
//                   Created:{' '}
//                   {connector.created_at
//                     ? new Date(
//                         connector.created_at
//                       ).toLocaleString()
//                     : 'N/A'}
//                 </p>

//                 <p>
//                   Updated:{' '}
//                   {connector.updated_at
//                     ? new Date(
//                         connector.updated_at
//                       ).toLocaleString()
//                     : 'N/A'}
//                 </p>

//                 <p>
//                   Last OCPP Update:{' '}
//                   {connectorLive?.observed_at
//                     ? new Date(
//                         connectorLive.observed_at
//                       ).toLocaleString()
//                     : 'N/A'}
//                 </p>
//               </div>
//             </div>

//             <button
//               onClick={closeConnectorModal}
//               className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
//             >
//               Close
//             </button>
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
//             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
//             <p className="mt-4 text-gray-600">
//               Refreshing session...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex">
//       <Sidebar
//         isDarkMode={isDarkMode}
//         onThemeToggle={() =>
//           setIsDarkMode(previous => !previous)
//         }
//         userName={
//           userData?.user?.full_name ||
//           user?.name ||
//           'User'
//         }
//         userEmail={
//           userData?.user?.email ||
//           user?.email ||
//           ''
//         }
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-1 text-sm text-gray-500">
//               <h1 className="text-2xl font-bold text-gray-800">
//                 Chargers & Sessions
//               </h1>

//               <button
//                 onClick={() => navigate('/dashboard')}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 / Dashboard
//               </button>

//               <span className="text-gray-400">/</span>
//               <span className="text-gray-700 font-medium">
//                 Chargers
//               </span>
//             </div>

//             <div className="flex items-center gap-2 relative">
//               <button
//                 onClick={() => {
//                   fetchChargers();
//                   fetchOperationalData();
//                 }}
//                 disabled={
//                   operationalLoading || loading
//                 }
//                 className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 disabled:opacity-50"
//                 title="Refresh live status"
//               >
//                 <RefreshCw
//                   size={18}
//                   className={
//                     operationalLoading || loading
//                       ? 'animate-spin'
//                       : ''
//                   }
//                 />
//               </button>

//               <div className="relative">
//                 <button
//                   onClick={() =>
//                     setShowSettingsMenu(
//                       previous => !previous
//                     )
//                   }
//                   className="p-2 hover:bg-gray-100 rounded-xl flex items-center gap-1.5 text-gray-600"
//                 >
//                   <Settings size={20} />
//                   <ChevronDown size={16} />
//                 </button>

//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() =>
//                     setShowAddMenu(
//                       previous => !previous
//                     )
//                   }
//                   className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
//                 >
//                   <Plus size={18} />
//                 </button>

//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-green-700">
//                 Charger Management
//               </h1>

//               <p className="text-sm text-gray-500 mt-0.5">
//                 Manage all EV charging stations and monitor live OCPP status
//               </p>
//             </div>

//             <button
//               onClick={() => navigate('/add-charger')}
//               className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700"
//             >
//               <Plus size={18} />
//               Add Charger
//             </button>
//           </div>
//         </div>

//         <div className="bg-white border-b border-gray-200 px-6">
//           <div className="flex items-center gap-8">
//             <button
//               onClick={() => setActiveTab('chargers')}
//               className={`py-3 px-1 border-b-2 flex items-center gap-2 ${
//                 activeTab === 'chargers'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500'
//               }`}
//             >
//               <Zap size={18} />
//               <span className="font-medium">
//                 Chargers
//               </span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
//                 {totalChargers}
//               </span>
//             </button>

//             <button
//               onClick={() => navigate('/sessions')}
//               className="py-3 px-1 border-b-2 border-transparent text-gray-500 flex items-center gap-2"
//             >
//               <Activity size={18} />
//               <span className="font-medium">
//                 Sessions
//               </span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
//                 {dummySessions.length}
//               </span>
//             </button>

//             <button
//               onClick={() =>
//                 setShowEvents(previous => !previous)
//               }
//               className={`py-3 px-1 border-b-2 flex items-center gap-2 ${
//                 showEvents
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500'
//               }`}
//             >
//               <History size={18} />
//               <span className="font-medium">
//                 Events
//               </span>
//               <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
//                 {operationalEvents.length}
//               </span>
//             </button>
//           </div>
//         </div>

//         <div className="p-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <p className="text-xs text-gray-500">
//                 Total Chargers
//               </p>
//               <p className="text-xl font-bold text-gray-900">
//                 {totalChargers}
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <p className="text-xs text-gray-500">
//                 Total Connectors
//               </p>
//               <p className="text-xl font-bold text-blue-600">
//                 {liveConnectorStats.total}
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <p className="text-xs text-gray-500">
//                 Available
//               </p>
//               <p className="text-xl font-bold text-green-600">
//                 {liveConnectorStats.available}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 Live OCPP Available
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <p className="text-xs text-gray-500">
//                 Charging
//               </p>
//               <p className="text-xl font-bold text-blue-600">
//                 {liveConnectorStats.charging}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 Live OCPP Charging
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <p className="text-xs text-gray-500">
//                 Faulted
//               </p>
//               <p className="text-xl font-bold text-red-600">
//                 {liveConnectorStats.faulted}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 Live OCPP Faulted
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <p className="text-xs text-gray-500">
//                 Unknown
//               </p>
//               <p className="text-xl font-bold text-gray-600">
//                 {liveConnectorStats.unknown}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 No live OCPP status
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
//               <p className="text-xs text-gray-500">
//                 Online Connectors
//               </p>
//               <p className="text-xl font-bold text-green-600">
//                 {liveConnectorStats.online}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 Parent connection online
//               </p>
//             </div>
//           </div>

//           {showEvents && (
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
//               <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                   <RadioTower size={18} className="text-blue-600" />
//                   Operational Events ({operationalEvents.length})
//                 </h3>

//                 <button
//                   onClick={() => setShowEvents(false)}
//                   className="p-1 hover:bg-gray-100 rounded-lg"
//                 >
//                   <X size={16} className="text-gray-500" />
//                 </button>
//               </div>

//               <div className="max-h-64 overflow-y-auto">
//                 {operationalEvents.length === 0 ? (
//                   <div className="p-8 text-center text-gray-500 text-sm">
//                     No events available
//                   </div>
//                 ) : (
//                   <table className="w-full">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
//                           ID
//                         </th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
//                           Type
//                         </th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
//                           Resource
//                         </th>
//                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
//                           Time
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {operationalEvents.map(
//                         (event, index) => (
//                           <tr
//                             key={event.id || index}
//                             className="border-b border-gray-100"
//                           >
//                             <td className="px-4 py-2 text-xs text-gray-400 font-mono">
//                               {event.id || 'N/A'}
//                             </td>

//                             <td className="px-4 py-2 text-xs text-gray-600">
//                               <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
//                                 {event.type || 'Unknown'}
//                               </span>
//                             </td>

//                             <td className="px-4 py-2 text-xs text-gray-700">
//                               {event.resource_type || 'N/A'}:{' '}
//                               {event.resource_id || 'N/A'}
//                             </td>

//                             <td className="px-4 py-2 text-xs text-gray-500">
//                               {event.occurred_at
//                                 ? new Date(
//                                     event.occurred_at
//                                   ).toLocaleString()
//                                 : 'N/A'}
//                             </td>
//                           </tr>
//                         )
//                       )}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </div>
//           )}

       
//             <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//   {/* Left Side - OCPP Connector Status Tabs with Icons & Colors */}
//   <div className="flex items-center gap-2 flex-wrap">
//     <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//       <Plug size={16} className="text-blue-500" />
//       OCPP Status:
//     </span>

//     <div className="flex items-center gap-1.5 flex-wrap">
//       {[
//         { value: 'All', label: 'All', icon: null, color: 'blue' },
//         { value: 'Available', label: 'Available', icon: <CheckCircle className="w-3 h-3" />, color: 'green' },
//         { value: 'Preparing', label: 'Preparing', icon: <Clock className="w-3 h-3" />, color: 'yellow' },
//         { value: 'Charging', label: 'Charging', icon: <Zap className="w-3 h-3" />, color: 'blue' },
//         { value: 'Finishing', label: 'Finishing', icon: <CheckCircle className="w-3 h-3" />, color: 'purple' },
//         { value: 'Faulted', label: 'Faulted', icon: <AlertCircle className="w-3 h-3" />, color: 'red' },
//         { value: 'Unknown', label: 'Unknown', icon: <Circle className="w-3 h-3" />, color: 'gray' }
//       ].map(({ value, label, icon, color }) => {
//         const isActive = ocppStatusFilter === value;
//         const count = value === 'All' 
//           ? chargers.reduce((acc, c) => acc + (c.connectors?.length || 0), 0)
//           : connectorStatusCounts[value] || 0;

//         const colorClasses = {
//           green: {
//             active: 'bg-green-500 text-white border-green-500 shadow-green-200',
//             inactive: 'text-green-700 border-green-200 hover:bg-green-50',
//             badge: 'bg-green-100 text-green-700'
//           },
//           yellow: {
//             active: 'bg-yellow-500 text-white border-yellow-500 shadow-yellow-200',
//             inactive: 'text-yellow-700 border-yellow-200 hover:bg-yellow-50',
//             badge: 'bg-yellow-100 text-yellow-700'
//           },
//           blue: {
//             active: 'bg-blue-500 text-white border-blue-500 shadow-blue-200',
//             inactive: 'text-blue-700 border-blue-200 hover:bg-blue-50',
//             badge: 'bg-blue-100 text-blue-700'
//           },
//           purple: {
//             active: 'bg-purple-500 text-white border-purple-500 shadow-purple-200',
//             inactive: 'text-purple-700 border-purple-200 hover:bg-purple-50',
//             badge: 'bg-purple-100 text-purple-700'
//           },
//           red: {
//             active: 'bg-red-500 text-white border-red-500 shadow-red-200',
//             inactive: 'text-red-700 border-red-200 hover:bg-red-50',
//             badge: 'bg-red-100 text-red-700'
//           },
//           gray: {
//             active: 'bg-gray-500 text-white border-gray-500 shadow-gray-200',
//             inactive: 'text-gray-600 border-gray-300 hover:bg-gray-50',
//             badge: 'bg-gray-100 text-gray-600'
//           }
//         };

//         const classes = isActive ? colorClasses[color].active : colorClasses[color].inactive;

//         return (
//           <button
//             key={value}
//             onClick={() => setOcppStatusFilter(value)}
//             className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shadow-sm hover:shadow-md ${
//               isActive ? 'ring-2 ring-offset-1 ring-' + color + '-400' : ''
//             } ${classes}`}
//           >
//             {icon && <span className={isActive ? 'text-white' : ''}>{icon}</span>}
//             {label}
//             <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
//               isActive ? 'bg-white/20 text-white' : colorClasses[color].badge
//             }`}>
//               {count}
//             </span>
//           </button>
//         );
//       })}
//     </div>
//   </div>

//             <div className="flex items-center gap-3 flex-wrap">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Battery size={16} className="text-blue-500" />
//                 Admin Status:
//               </span>

//               <select
//                 value={chargerStatusFilter}
//                 onChange={event =>
//                   setChargerStatusFilter(
//                     event.target.value
//                   )
//                 }
//                 className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700"
//               >
//                 <option value="All">
//                   All Status
//                 </option>
//                 <option value="ACTIVE">
//                   Active
//                 </option>
//                 <option value="INACTIVE">
//                   Inactive
//                 </option>
//                 <option value="SUSPENDED">
//                   Suspended
//                 </option>
//                 <option value="UNDERMAINTENANCE">
//                   Under Maintenance
//                 </option>
//                 <option value="DECOMMISSIONED">
//                   Decommissioned
//                 </option>
//               </select>

//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Wifi size={16} className="text-blue-500" />
//                 OCPP Connection:
//               </span>

//               <select
//                 value={operationalStatusFilter}
//                 onChange={event =>
//                   setOperationalStatusFilter(
//                     event.target.value
//                   )
//                 }
//                 className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700"
//               >
//                 <option value="All">
//                   All
//                 </option>
//                 <option value="Online">
//                   Online
//                 </option>
//                 <option value="Offline">
//                   Offline
//                 </option>
//                 <option value="Unknown">
//                   Unknown
//                 </option>
//               </select>

//               <div className="relative">
//                 <Search
//                   size={16}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 />

//                 <input
//                   type="text"
//                   placeholder="Search chargers..."
//                   value={searchQuery}
//                   onChange={event =>
//                     setSearchQuery(event.target.value)
//                   }
//                   className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 bg-white"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//             {loading && chargers.length === 0 ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
//                   <p className="mt-4 text-gray-600">
//                     Loading chargers...
//                   </p>
//                 </div>
//               </div>
//             ) : error ? (
//               <div className="flex items-center justify-center py-16">
//                 <div className="text-center">
//                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                   <p className="text-gray-600">
//                     {error}
//                   </p>

//                   <button
//                     onClick={() => fetchChargers()}
//                     className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
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

//                 <p className="text-lg font-semibold text-gray-600">
//                   No Chargers Found
//                 </p>

//                 <p className="text-sm text-gray-400 mt-1">
//                   Try adjusting your search or filters
//                 </p>
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gradient-to-r from-blue-50/80 to-gray-50/80 border-b border-gray-200">
//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           SI
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Charger ID
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Name
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Serial
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Admin Status
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           OCPP Charger Connection
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Connector Status
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Power
//                         </th>

//                         <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
//                           Action
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {filteredChargers.map(
//                         (charger, index) => {
//                           const chargerShortId =
//                             charger.charger_id ||
//                             charger.id;

//                           const connectionStatus =
//                             getChargerConnectionStatus(
//                               charger
//                             );

//                           const connectionDisplay =
//                             getStatusDisplay(
//                               connectionStatus,
//                               CONNECTION_STATUS_CONFIG
//                             );

//                           const adminDisplay =
//                             getStatusDisplay(
//                               charger.status,
//                               ADMIN_STATUS_CONFIG
//                             );

//                           const freshness =
//                             charger?.live?.charger
//                               ?.connection_freshness ||
//                             'UNKNOWN';

//                           const freshnessDisplay =
//                             getStatusDisplay(
//                               freshness,
//                               FRESHNESS_CONFIG
//                             );

//                           const connectors =
//                             charger.connectors || [];

//                           return (
//                             <tr
//                               key={
//                                 charger.id ||
//                                 charger.charger_id
//                               }
//                               className="border-b border-gray-100 hover:bg-blue-50/30 transition"
//                             >
//                               <td className="px-4 py-3 text-sm text-gray-400 font-medium">
//                                 {String(index + 1).padStart(
//                                   2,
//                                   '0'
//                                 )}
//                               </td>

//                               <td className="px-4 py-3 text-sm font-mono text-gray-600">
//                                 {charger.charger_id ||
//                                   charger.id?.slice(
//                                     0,
//                                     8
//                                   ) ||
//                                   'N/A'}
//                               </td>

//                               <td className="px-4 py-3 text-sm font-medium text-gray-800">
//                                 {charger.charger_name ||
//                                   charger.name ||
//                                   'Unnamed'}
//                               </td>

//                               <td className="px-4 py-3 text-sm text-gray-500">
//                                 {charger.serial_number ||
//                                   'N/A'}
//                               </td>

//                               <td className="px-4 py-3 text-sm">
//                                 <span
//                                   className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${adminDisplay.color}`}
//                                 >
//                                   {adminDisplay.icon}
//                                   {adminDisplay.label}
//                                 </span>
//                               </td>

//                               <td className="px-4 py-3 text-sm">
//                                 {(() => {
//                                   const status = String(
//                                     connectionDisplay?.label || ''
//                                   ).toLowerCase();

//                                   const isOnline = status === 'online';
//                                   const isOffline = status === 'offline';
//                                   const isUnknown = !isOnline && !isOffline;

//                                   return (
//                                     <span
//                                       className={`
//                                         inline-flex items-center gap-1.5
//                                         px-2.5 py-1.5
//                                         rounded-full
//                                         text-xs font-semibold
//                                         transition-all duration-200
//                                         ${
//                                           isOnline
//                                             ? 'bg-green-50 text-green-700 border border-green-200'
//                                             : isOffline
//                                             ? 'bg-red-50 text-red-700 border border-red-200'
//                                             : 'bg-amber-50 text-amber-700 border border-dashed border-amber-300'
//                                         }
//                                       `}
//                                     >
//                                       {isOnline && (
//                                         <span className="relative flex h-2.5 w-2.5">
//                                           <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-ping" />
//                                           <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
//                                         </span>
//                                       )}

//                                       {isOffline && (
//                                         <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
//                                       )}

//                                       {isUnknown && (
//                                         <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-amber-200 text-amber-700 text-[9px] font-bold">
//                                           ?
//                                         </span>
//                                       )}

//                                       <span>
//                                         {isOnline
//                                           ? 'Online'
//                                           : isOffline
//                                           ? 'Offline'
//                                           : 'Unknown'}
//                                       </span>
//                                     </span>
//                                   );
//                                 })()}
//                               </td>

//                               <td className="px-4 py-3 text-sm text-gray-600">
//                                 <div className="flex flex-col gap-2">
//                                   <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
//                                     <Plug
//                                       size={14}
//                                       className="text-blue-400"
//                                     />

//                                     {connectors.length}{' '}
//                                     connector
//                                     {connectors.length !== 1 ? 's' : ''}
//                                   </span>

//                                   <div className="flex flex-wrap items-center gap-4">
//                                     {connectors.map(connector => {
//                                       /*
//                                        * FIXED: Match connector.id with live.connectors[].connector_id
//                                        */
//                                       const liveConnector =
//                                         getConnectorLiveData(
//                                           charger,
//                                           connector
//                                         );

//                                       /*
//                                        * OCPP status comes from: live.connectors[].last_ocpp_status
//                                        */
//                                       const ocppStatus =
//                                         liveConnector?.last_ocpp_status ||
//                                         'Unknown';

//                                       /*
//                                        * Availability comes from: live.connectors[].availability
//                                        */
//                                       const availability =
//                                         liveConnector?.availability ||
//                                         'UNKNOWN';

//                                       const ocppDisplay =
//                                         getStatusDisplay(
//                                           ocppStatus,
//                                           OCPP_STATUS_CONFIG
//                                         );

//                                       const availabilityDisplay =
//                                         getStatusDisplay(
//                                           availability,
//                                           AVAILABILITY_STATUS_CONFIG
//                                         );

//                                       const isAvailable =
//                                         availability === 'AVAILABLE';
//                                       const isCharging =
//                                         availability === 'CHARGING';
//                                       const isPreparing =
//                                         availability === 'PREPARING';
//                                       const isFaulted =
//                                         availability === 'FAULTED';
//                                       const isUnavailable =
//                                         availability === 'UNAVAILABLE';

//                                       let connectorIconColor =
//                                         'text-gray-400';

//                                       if (isAvailable) {
//                                         connectorIconColor =
//                                           'text-green-600';
//                                       } else if (isCharging) {
//                                         connectorIconColor =
//                                           'text-blue-600';
//                                       } else if (isPreparing) {
//                                         connectorIconColor =
//                                           'text-yellow-600';
//                                       } else if (isFaulted) {
//                                         connectorIconColor =
//                                           'text-red-600';
//                                       } else if (isUnavailable) {
//                                         connectorIconColor =
//                                           'text-gray-500';
//                                       }

//                                       return (
//                                         <button
//                                           key={
//                                             connector.id ||
//                                             connector.connector_number
//                                           }
//                                           type="button"
//                                           onClick={() => {
//                                             setSelectedConnector({
//                                               ...connector,
//                                               charger,
//                                               live_state:
//                                                 liveConnector || null
//                                             });

//                                             setShowConnectorDetail(true);
//                                           }}
//                                           title={`Connector ${
//                                             connector.connector_number
//                                           } | OCPP: ${ocppStatus} | Availability: ${availability}`}
//                                           className="group flex flex-col items-center min-w-[110px] hover:scale-105 transition-transform cursor-pointer"
//                                         >
//                                           <div className="mb-1.5">
//                                             <Plug
//                                               size={32}
//                                               strokeWidth={2.2}
//                                               className={`${connectorIconColor} transition-colors duration-200`}
//                                             />
//                                           </div>

//                                           <span className="text-xs font-semibold text-gray-700 mb-1">
//                                             Connector {connector.connector_number}
//                                           </span>

//                                           {/* OCPP Status */}
//                                           <span
//                                             className={`inline-flex items-center justify-center gap-1 text-[10px] font-medium ${ocppDisplay.color}`}
//                                           >
//                                             {ocppDisplay.icon}
//                                             <span>
//                                               OCPP: {ocppDisplay.label}
//                                             </span>
//                                           </span>

//                                           {/* Availability Status - FIXED */}
//                                           <span
//                                             className={`inline-flex items-center justify-center gap-1 text-[10px] font-medium ${availabilityDisplay.color}`}
//                                           >
//                                             {availabilityDisplay.icon}
//                                             <span>
//                                               {availabilityDisplay.label}
//                                             </span>
//                                           </span>
//                                         </button>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               </td>

//                               <td className="px-4 py-3 text-sm font-medium text-gray-700">
//                                 {charger.max_power_kw || 0} kW
//                               </td>

//                               <td className="px-4 py-3 text-sm">
//                                 <button
//                                   onClick={() =>
//                                     handleViewCharger(
//                                       chargerShortId
//                                     )
//                                   }
//                                   className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs flex items-center gap-1"
//                                 >
//                                   <Eye size={14} />
//                                   View
//                                 </button>
//                               </td>
//                             </tr>
//                           );
//                         }
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {pagination.has_more && (
//                   <div className="px-4 py-4 border-t border-gray-200 flex justify-center">
//                     <button
//                       onClick={loadMoreChargers}
//                       disabled={loadingMore}
//                       className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
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

//                 <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-3">
//                   <span>
//                     Showing {filteredChargers.length} of{' '}
//                     {pagination.total || chargers.length}{' '}
//                     chargers
//                   </span>

//                   <div className="flex flex-wrap items-center gap-3">
//                     <span>
//                       Active: {activeChargers}
//                     </span>

//                     <span>
//                       Inactive: {inactiveChargers}
//                     </span>

//                     <span>
//                       Faulted: {faultedChargers}
//                     </span>

//                     <span className="border-l border-gray-200 pl-3">
//                       Available connectors:{' '}
//                       {liveConnectorStats.available}
//                     </span>

//                     <span className="border-l border-gray-200 pl-3">
//                       Online connectors:{' '}
//                       {liveConnectorStats.online}
//                     </span>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {showConnectorDetail && (
//         <ConnectorDetailModal />
//       )}
//     </div>
//   );
// };

// export default ChargersAndSessions;

// src/components/Revenue/ChargerList.jsx
import React, {
  useState,
  useEffect,
  useCallback
} from 'react';

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
  X,
  Eye,
  Loader2,
  CircleOff,
  PowerOff,
  History,
  RadioTower,
  Wrench,
  Info,
  Trash2,
  Pause,
  RefreshCw,
  Phone
} from 'lucide-react';

import Sidebar from '../Sidebar/Sidebar';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  FLEET_OPERATIONS_API:
    `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
  OPERATIONAL_EVENTS_API:
    `${API_BASE_URL}/api/v1/cpo/operations/events`
};

// ============================================================================
// OCPP STATUS CONFIG - Based on API Response
// ============================================================================
const OCPP_STATUS_CONFIG = {
  'Available': {
    label: 'Available',
    icon: <CheckCircle className="w-3 h-3 text-green-500" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  'Preparing': {
    label: 'Preparing',
    icon: <Clock className="w-3 h-3 text-yellow-500" />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'Charging': {
    label: 'Charging',
    icon: <Zap className="w-3 h-3 text-blue-500" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  'Finishing': {
    label: 'Finishing',
    icon: <CheckCircle className="w-3 h-3 text-purple-500" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  'Faulted': {
    label: 'Faulted',
    icon: <AlertCircle className="w-3 h-3 text-red-500" />,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  'Unknown': {
    label: 'Unknown',
    icon: <Circle className="w-3 h-3 text-gray-400" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200'
  }
};

// ============================================================================
// AVAILABILITY STATUS CONFIG - Based on API Response
// ============================================================================
const AVAILABILITY_STATUS_CONFIG = {
  'AVAILABLE': {
    label: 'Available',
    icon: <CheckCircle className="w-3 h-3 text-green-500" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  'UNAVAILABLE': {
    label: 'Unavailable',
    icon: <CircleOff className="w-3 h-3 text-red-500" />,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  'CHARGING': {
    label: 'Charging',
    icon: <Zap className="w-3 h-3 text-blue-500" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  'PREPARING': {
    label: 'Preparing',
    icon: <Clock className="w-3 h-3 text-yellow-500" />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'FAULTED': {
    label: 'Faulted',
    icon: <AlertCircle className="w-3 h-3 text-red-500" />,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  'FINISHING': {
    label: 'Finishing',
    icon: <CheckCircle className="w-3 h-3 text-purple-500" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  'UNKNOWN': {
    label: 'Unknown',
    icon: <Circle className="w-3 h-3 text-gray-400" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200'
  }
};

const CONNECTION_STATUS_CONFIG = {
  'ONLINE': {
    label: 'Online',
    icon: <Wifi className="w-3 h-3 text-green-500" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  'OFFLINE': {
    label: 'Offline',
    icon: <WifiOff className="w-3 h-3 text-red-500" />,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  'UNKNOWN': {
    label: 'Unknown',
    icon: <Circle className="w-3 h-3 text-gray-400" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200'
  }
};

const FRESHNESS_CONFIG = {
  'FRESH': {
    label: 'Fresh',
    icon: <CheckCircle className="w-3 h-3 text-green-500" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  'STALE': {
    label: 'Stale',
    icon: <Clock className="w-3 h-3 text-orange-500" />,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  'UNKNOWN': {
    label: 'Unknown',
    icon: <Circle className="w-3 h-3 text-gray-400" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200'
  }
};

const ADMIN_STATUS_CONFIG = {
  'ACTIVE': {
    label: 'Active',
    icon: <CheckCircle className="w-3 h-3 text-green-500" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  'INACTIVE': {
    label: 'Inactive',
    icon: <PowerOff className="w-3 h-3 text-red-500" />,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  'SUSPENDED': {
    label: 'Suspended',
    icon: <Pause className="w-3 h-3 text-yellow-500" />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'UNDERMAINTENANCE': {
    label: 'Under Maintenance',
    icon: <Wrench className="w-3 h-3 text-amber-500" />,
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  'DECOMMISSIONED': {
    label: 'Decommissioned',
    icon: <Trash2 className="w-3 h-3 text-gray-500" />,
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  }
};

const getStatusDisplay = (status, config) => {
  return (
    config[status] ||
    config['Unknown'] ||
    config['UNKNOWN'] || {
      label: status || 'Unknown',
      icon: <Circle className="w-3 h-3 text-gray-400" />,
      color: 'bg-gray-100 text-gray-600 border-gray-200'
    }
  );
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

  const [showSettingsMenu, setShowSettingsMenu] =
    useState(false);
  const [showAddMenu, setShowAddMenu] =
    useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] =
    useState('chargers');
  const [showEvents, setShowEvents] =
    useState(false);

  const [chargers, setChargers] = useState([]);

  const [pagination, setPagination] = useState({
    before: null,
    before_id: null,
    limit: 50,
    has_more: false,
    total: 0
  });

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [fleetData, setFleetData] = useState(null);
  const [operationalEvents, setOperationalEvents] =
    useState([]);
  const [operationalLoading, setOperationalLoading] =
    useState(false);

  const [selectedConnector, setSelectedConnector] =
    useState(null);
  const [showConnectorDetail, setShowConnectorDetail] =
    useState(false);

  const [chargerStatusFilter, setChargerStatusFilter] =
    useState('All');
  const [operationalStatusFilter, setOperationalStatusFilter] =
    useState('All');
  const [ocppStatusFilter, setOcppStatusFilter] =
    useState('All');

  // const dummySessions = [
  //   {
  //     id: 'SES-001',
  //     session_id: 'SES-2026-001',
  //     hub_name: 'Newtown Hub',
  //     charger_name: 'Benny 7.4kWh',
  //     driver_name: 'John Doe',
  //     start_time: '2026-08-03T14:30:00+05:30',
  //     duration_minutes: 135,
  //     energy_consumed: 45.5,
  //     status: 'Completed',
  //     cost: '₹ 386.75',
  //     anomaly_detected: false
  //   }
  // ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    fetchUserInfo();
    fetchChargers();
    fetchOperationalData();
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(
        API_CONFIG.USER_INFO_API,
        {
          method: 'GET'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('User info error:', err);
    }
  };

  const fetchOperationalData = async () => {
    setOperationalLoading(true);

    try {
      const fleetResponse = await authenticatedRequest(
        API_CONFIG.FLEET_OPERATIONS_API,
        {
          method: 'GET'
        }
      );

      if (fleetResponse.ok) {
        const data = await fleetResponse.json();
        setFleetData(data);
      }

      const eventsResponse = await authenticatedRequest(
        `${API_CONFIG.OPERATIONAL_EVENTS_API}?limit=50`,
        {
          method: 'GET'
        }
      );

      if (eventsResponse.ok) {
        const data = await eventsResponse.json();

        setOperationalEvents(
          data.events ||
          data.data ||
          []
        );
      }
    } catch (err) {
      console.error('Operational data error:', err);
    } finally {
      setOperationalLoading(false);
    }
  };

  const fetchChargers = useCallback(
    async (before = null, beforeId = null) => {
      if (loadingMore) return;

      if (before) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        let url =
          `${API_CONFIG.CHARGERS_API}?limit=${pagination.limit}`;

        if (before) {
          url += `&before=${encodeURIComponent(before)}`;
        }

        if (beforeId) {
          url += `&before_id=${encodeURIComponent(beforeId)}`;
        }

        const response = await authenticatedRequest(url, {
          method: 'GET'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error?.message ||
            'Failed to fetch chargers'
          );
        }

        const chargersData = Array.isArray(data.chargers)
          ? data.chargers
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

        const nextBefore =
          data.next_before || null;

        const nextBeforeId =
          data.next_before_id || null;

        const hasMore =
          Boolean(data.has_more);

        setChargers(previous =>
          before
            ? [...previous, ...chargersData]
            : chargersData
        );

        setPagination(previous => ({
          ...previous,
          before: nextBefore,
          before_id: nextBeforeId,
          has_more: hasMore,
          total:
            data.total ||
            (before
              ? previous.total + chargersData.length
              : chargersData.length)
        }));
      } catch (err) {
        console.error('Chargers fetch error:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      authenticatedRequest,
      loadingMore,
      pagination.limit
    ]
  );

  const loadMoreChargers = () => {
    if (
      pagination.has_more &&
      !loadingMore &&
      !loading
    ) {
      fetchChargers(
        pagination.before,
        pagination.before_id
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);

      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');

      navigate('/signin');
    }
  };

  const handleViewCharger = chargerId => {
    navigate(`/charger-details/${chargerId}`);
  };

  // ============================================================================
  // HELPER FUNCTIONS - FIXED TO CORRECTLY READ LIVE DATA
  // ============================================================================

  const getChargerLiveData = charger => {
    return charger?.live || null;
  };

  /*
   * IMPORTANT FIX:
   * API live.connectors has connector_id.
   * Master charger.connectors has id.
   * Match by connector.id === live.connector_id
   * ALSO match by connector_number as fallback
   */
  const getConnectorLiveData = (
    charger,
    connector
  ) => {
    if (!charger || !connector) return null;
    
    const liveConnectors =
      charger?.live?.connectors || [];

    if (liveConnectors.length === 0) return null;

    // First try to match by connector_id (UUID)
    let found = liveConnectors.find(
      liveConnector =>
        String(liveConnector.connector_id) ===
        String(connector.id)
    );

    // If not found, try by connector_number
    if (!found) {
      found = liveConnectors.find(
        liveConnector =>
          Number(liveConnector.connector_number) ===
          Number(connector.connector_number)
      );
    }

    return found || null;
  };

  const getConnectorOcppStatus = (
    charger,
    connector
  ) => {
    const liveConnector =
      getConnectorLiveData(charger, connector);

    return (
      liveConnector?.last_ocpp_status ||
      'Unknown'
    );
  };

  const getConnectorAvailability = (
    charger,
    connector
  ) => {
    const liveConnector =
      getConnectorLiveData(charger, connector);

    return (
      liveConnector?.availability ||
      'UNKNOWN'
    );
  };

  const getChargerConnectionStatus = charger => {
    return (
      charger?.live?.charger?.connection_state ||
      'UNKNOWN'
    );
  };

  const getConnectorConnectionStatus = (
    charger,
    connector
  ) => {
    const liveConnector =
      getConnectorLiveData(charger, connector);

    return (
      liveConnector?.parent_connection_state ||
      getChargerConnectionStatus(charger) ||
      'UNKNOWN'
    );
  };

  const getConnectorFreshness = (
    charger,
    connector
  ) => {
    const liveConnector =
      getConnectorLiveData(charger, connector);

    return liveConnector?.freshness || 'UNKNOWN';
  };

  // ============================================================================
  // LIVE CONNECTOR STATS
  // ============================================================================

  const getLiveConnectorStats = () => {
    const stats = {
      total: 0,
      available: 0,
      preparing: 0,
      charging: 0,
      finishing: 0,
      faulted: 0,
      unavailable: 0,
      unknown: 0,
      online: 0,
      offline: 0
    };

    chargers.forEach(charger => {
      const connectors =
        charger.connectors || [];

      connectors.forEach(connector => {
        stats.total++;

        const liveConnector =
          getConnectorLiveData(
            charger,
            connector
          );

        const ocppStatus =
          liveConnector?.last_ocpp_status ||
          'Unknown';

        const availability =
          liveConnector?.availability ||
          'UNKNOWN';

        const connectionStatus =
          liveConnector?.parent_connection_state ||
          getChargerConnectionStatus(charger);

        if (ocppStatus === 'Available') {
          stats.available++;
        } else if (ocppStatus === 'Preparing') {
          stats.preparing++;
        } else if (ocppStatus === 'Charging') {
          stats.charging++;
        } else if (ocppStatus === 'Finishing') {
          stats.finishing++;
        } else if (ocppStatus === 'Faulted') {
          stats.faulted++;
        } else {
          stats.unknown++;
        }

        if (availability === 'UNAVAILABLE') {
          stats.unavailable++;
        }

        if (connectionStatus === 'ONLINE') {
          stats.online++;
        }

        if (connectionStatus === 'OFFLINE') {
          stats.offline++;
        }
      });
    });

    return stats;
  };

  const liveConnectorStats =
    getLiveConnectorStats();

  const getConnectorStatusCounts = () => {
    const counts = {
      Available: 0,
      Preparing: 0,
      Charging: 0,
      Finishing: 0,
      Faulted: 0,
      Unknown: 0
    };

    chargers.forEach(charger => {
      const connectors =
        charger.connectors || [];

      connectors.forEach(connector => {
        const status =
          getConnectorOcppStatus(
            charger,
            connector
          );

        if (
          Object.prototype.hasOwnProperty.call(
            counts,
            status
          )
        ) {
          counts[status]++;
        } else {
          counts.Unknown++;
        }
      });
    });

    return counts;
  };

  const connectorStatusCounts =
    getConnectorStatusCounts();

  const totalChargers = chargers.length;

  const activeChargers = chargers.filter(
    charger =>
      charger.status === 'ACTIVE'
  ).length;

  const inactiveChargers = chargers.filter(
    charger =>
      charger.status === 'INACTIVE'
  ).length;

  const faultedChargers = chargers.filter(
    charger =>
      charger.status === 'FAULTED'
  ).length;

  // ============================================================================
  // FILTER CHARGERS
  // ============================================================================

  const filteredChargers = chargers.filter(
    charger => {
      const chargerShortId =
        charger.charger_id ||
        charger.id ||
        '';

      const searchText =
        searchQuery.toLowerCase();

      const matchesSearch =
        (charger.charger_name || '')
          .toLowerCase()
          .includes(searchText) ||
        chargerShortId
          .toLowerCase()
          .includes(searchText) ||
        (charger.serial_number || '')
          .toLowerCase()
          .includes(searchText) ||
        (charger.hub_name || '')
          .toLowerCase()
          .includes(searchText);

      const matchesOcppStatus =
        ocppStatusFilter === 'All' ||
        (charger.connectors || []).some(
          connector =>
            getConnectorOcppStatus(
              charger,
              connector
            ) === ocppStatusFilter
        );

      const matchesChargerStatus =
        chargerStatusFilter === 'All' ||
        charger.status?.toUpperCase() ===
          chargerStatusFilter.toUpperCase();

      const connectionStatus =
        getChargerConnectionStatus(charger);

      let matchesOperationalStatus = true;

      if (
        operationalStatusFilter === 'Online'
      ) {
        matchesOperationalStatus =
          connectionStatus === 'ONLINE';
      }

      if (
        operationalStatusFilter === 'Offline'
      ) {
        matchesOperationalStatus =
          connectionStatus === 'OFFLINE';
      }

      if (
        operationalStatusFilter === 'Unknown'
      ) {
        matchesOperationalStatus =
          connectionStatus === 'UNKNOWN';
      }

      return (
        matchesSearch &&
        matchesOcppStatus &&
        matchesChargerStatus &&
        matchesOperationalStatus
      );
    }
  );

  const closeConnectorModal = () => {
    setSelectedConnector(null);
    setShowConnectorDetail(false);
  };

  // ============================================================================
  // SETTINGS & ADD MENUS
  // ============================================================================

  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
            {(userData?.user?.full_name ||
              user?.name ||
              'U'
            ).charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name ||
                user?.name ||
                'User'}
            </h4>

            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email ||
                user?.email ||
                'user@transev.com'}
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
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
        >
          <User size={16} />
          Profile
        </button>

        <button
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/organization');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
        >
          <Building size={16} />
          Organization
        </button>

        <div className="border-t border-gray-700 my-1" />

        <button
          onClick={() => {
            setShowSettingsMenu(false);
            handleLogout();
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 flex items-center gap-3"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button
          onClick={() => {
            setShowAddMenu(false);
            navigate('/add-hub');
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
        >
          <Plus size={18} />
          Add Hub
        </button>

        <button
          onClick={() => {
            setShowAddMenu(false);
            navigate('/add-charger');
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3"
        >
          <Zap size={18} />
          Add Charger
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // CONNECTOR DETAIL MODAL
  // ============================================================================

  const ConnectorDetailModal = () => {
    if (!selectedConnector) return null;

    const connector = selectedConnector;
    const charger = selectedConnector.charger;

    const connectorLive =
      getConnectorLiveData(
        charger,
        connector
      );

    const adminStatus = getStatusDisplay(
      connector.status,
      ADMIN_STATUS_CONFIG
    );

    const ocppStatus =
      connectorLive?.last_ocpp_status ||
      'Unknown';

    const ocppDisplay = getStatusDisplay(
      ocppStatus,
      OCPP_STATUS_CONFIG
    );

    const availability =
      connectorLive?.availability ||
      'UNKNOWN';

    const availabilityDisplay =
      getStatusDisplay(
        availability,
        AVAILABILITY_STATUS_CONFIG
      );

    const connectionStatus =
      connectorLive?.parent_connection_state ||
      getChargerConnectionStatus(charger);

    const connectionDisplay =
      getStatusDisplay(
        connectionStatus,
        CONNECTION_STATUS_CONFIG
      );

    const freshness =
      connectorLive?.freshness ||
      'UNKNOWN';

    const freshnessDisplay =
      getStatusDisplay(
        freshness,
        FRESHNESS_CONFIG
      );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plug className="w-5 h-5 text-blue-600" />
              Connector #{connector.connector_number} Details
            </h3>

            <button
              onClick={closeConnectorModal}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Connector Number
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  #{connector.connector_number}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Connector Type
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {connector.connector_type || 'N/A'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-blue-500" />
                Status Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Administrative Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${adminStatus.color}`}
                  >
                    {adminStatus.icon}
                    {adminStatus.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Last OCPP Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${ocppDisplay.color}`}
                  >
                    {ocppDisplay.icon}
                    {ocppDisplay.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Availability
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${availabilityDisplay.color}`}
                  >
                    {availabilityDisplay.icon}
                    {availabilityDisplay.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Parent Connection
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${connectionDisplay.color}`}
                  >
                    {connectionDisplay.icon}
                    {connectionDisplay.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Data Freshness
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${freshnessDisplay.color}`}
                  >
                    {freshnessDisplay.icon}
                    {freshnessDisplay.label}
                  </span>
                </div>

                {connectorLive?.status_sequence !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">
                      Status Sequence
                    </p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      #{connectorLive.status_sequence}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                Technical Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Total Capacity
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {connector.connector_total_capacity || 0} kW
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Connector ID
                  </p>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {connector.id || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Live Connector ID
                  </p>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {connectorLive?.connector_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Timestamps
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                <p>
                  Created:{' '}
                  {connector.created_at
                    ? new Date(
                        connector.created_at
                      ).toLocaleString()
                    : 'N/A'}
                </p>

                <p>
                  Updated:{' '}
                  {connector.updated_at
                    ? new Date(
                        connector.updated_at
                      ).toLocaleString()
                    : 'N/A'}
                </p>

                <p>
                  Last OCPP Update:{' '}
                  {connectorLive?.observed_at
                    ? new Date(
                        connectorLive.observed_at
                      ).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <button
              onClick={closeConnectorModal}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Close
            </button>
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
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">
              Refreshing session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        isDarkMode={isDarkMode}
        onThemeToggle={() =>
          setIsDarkMode(previous => !previous)
        }
        userName={
          userData?.user?.full_name ||
          user?.name ||
          'User'
        }
        userEmail={
          userData?.user?.email ||
          user?.email ||
          ''
        }
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <h1 className="text-2xl font-bold text-gray-800">
                Chargers & Sessions
              </h1>

              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                / Dashboard
              </button>

              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">
                Chargers
              </span>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => {
                  fetchChargers();
                  fetchOperationalData();
                }}
                disabled={
                  operationalLoading || loading                }
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 disabled:opacity-50"
                title="Refresh live status"
              >
                <RefreshCw
                  size={18}
                  className={
                    operationalLoading || loading
                      ? 'animate-spin'
                      : ''
                  }
                />
              </button>

              <div className="relative">
                <button
                  onClick={() =>
                    setShowSettingsMenu(
                      previous => !previous
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-xl flex items-center gap-1.5 text-gray-600"
                >
                  <Settings size={20} />
                  <ChevronDown size={16} />
                </button>

                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setShowAddMenu(
                      previous => !previous
                    )
                  }
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                >
                  <Plus size={18} />
                </button>

                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700">
                Charger Management
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                Manage all EV charging stations and monitor live OCPP status
              </p>
            </div>

            <button
              onClick={() => navigate('/add-charger')}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              <Plus size={18} />
              Add Charger
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('chargers')}
              className={`py-3 px-1 border-b-2 flex items-center gap-2 ${
                activeTab === 'chargers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <Zap size={18} />
              <span className="font-medium">
                Chargers
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {totalChargers}
              </span>
            </button>

            <button
              onClick={() => navigate('/sessions')}
              className="py-3 px-1 border-b-2 border-transparent text-gray-500 flex items-center gap-2"
            >
              <Activity size={18} />
              <span className="font-medium">
                Sessions
              </span>
           
            </button>

            <button
              onClick={() =>
                setShowEvents(previous => !previous)
              }
              className={`py-3 px-1 border-b-2 flex items-center gap-2 ${
                showEvents
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <History size={18} />
              <span className="font-medium">
                Events
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {operationalEvents.length}
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Total Chargers
              </p>
              <p className="text-xl font-bold text-gray-900">
                {totalChargers}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Total Connectors
              </p>
              <p className="text-xl font-bold text-blue-600">
                {liveConnectorStats.total}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Available
              </p>
              <p className="text-xl font-bold text-green-600">
                {liveConnectorStats.available}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Live OCPP Available
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Charging
              </p>
              <p className="text-xl font-bold text-blue-600">
                {liveConnectorStats.charging}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Live OCPP Charging
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Faulted
              </p>
              <p className="text-xl font-bold text-red-600">
                {liveConnectorStats.faulted}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Live OCPP Faulted
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Unknown
              </p>
              <p className="text-xl font-bold text-gray-600">
                {liveConnectorStats.unknown}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                No live OCPP status
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Online Connectors
              </p>
              <p className="text-xl font-bold text-green-600">
                {liveConnectorStats.online}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Parent connection online
              </p>
            </div>
          </div>

          {showEvents && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <RadioTower size={18} className="text-blue-600" />
                  Operational Events ({operationalEvents.length})
                </h3>

                <button
                  onClick={() => setShowEvents(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {operationalEvents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No events available
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                          Resource
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                          Time
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {operationalEvents.map(
                        (event, index) => (
                          <tr
                            key={event.id || index}
                            className="border-b border-gray-100"
                          >
                            <td className="px-4 py-2 text-xs text-gray-400 font-mono">
                              {event.id || 'N/A'}
                            </td>

                            <td className="px-4 py-2 text-xs text-gray-600">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                {event.type || 'Unknown'}
                              </span>
                            </td>

                            <td className="px-4 py-2 text-xs text-gray-700">
                              {event.resource_type || 'N/A'}:{' '}
                              {event.resource_id || 'N/A'}
                            </td>

                            <td className="px-4 py-2 text-xs text-gray-500">
                              {event.occurred_at
                                ? new Date(
                                    event.occurred_at
                                  ).toLocaleString()
                                : 'N/A'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

       
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
  {/* Left Side - OCPP Connector Status Tabs with Icons & Colors */}
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
      <Plug size={16} className="text-blue-500" />
      OCPP Status:
    </span>

    <div className="flex items-center gap-1.5 flex-wrap">
      {[
        { value: 'All', label: 'All', icon: null, color: 'blue' },
        { value: 'Available', label: 'Available', icon: <CheckCircle className="w-3 h-3" />, color: 'green' },
        { value: 'Preparing', label: 'Preparing', icon: <Clock className="w-3 h-3" />, color: 'yellow' },
        { value: 'Charging', label: 'Charging', icon: <Zap className="w-3 h-3" />, color: 'blue' },
        { value: 'Finishing', label: 'Finishing', icon: <CheckCircle className="w-3 h-3" />, color: 'purple' },
        { value: 'Faulted', label: 'Faulted', icon: <AlertCircle className="w-3 h-3" />, color: 'red' },
        { value: 'Unknown', label: 'Unknown', icon: <Circle className="w-3 h-3" />, color: 'gray' }
      ].map(({ value, label, icon, color }) => {
        const isActive = ocppStatusFilter === value;
        const count = value === 'All' 
          ? chargers.reduce((acc, c) => acc + (c.connectors?.length || 0), 0)
          : connectorStatusCounts[value] || 0;

        const colorClasses = {
          green: {
            active: 'bg-green-500 text-white border-green-500 shadow-green-200',
            inactive: 'text-green-700 border-green-200 hover:bg-green-50',
            badge: 'bg-green-100 text-green-700'
          },
          yellow: {
            active: 'bg-yellow-500 text-white border-yellow-500 shadow-yellow-200',
            inactive: 'text-yellow-700 border-yellow-200 hover:bg-yellow-50',
            badge: 'bg-yellow-100 text-yellow-700'
          },
          blue: {
            active: 'bg-blue-500 text-white border-blue-500 shadow-blue-200',
            inactive: 'text-blue-700 border-blue-200 hover:bg-blue-50',
            badge: 'bg-blue-100 text-blue-700'
          },
          purple: {
            active: 'bg-purple-500 text-white border-purple-500 shadow-purple-200',
            inactive: 'text-purple-700 border-purple-200 hover:bg-purple-50',
            badge: 'bg-purple-100 text-purple-700'
          },
          red: {
            active: 'bg-red-500 text-white border-red-500 shadow-red-200',
            inactive: 'text-red-700 border-red-200 hover:bg-red-50',
            badge: 'bg-red-100 text-red-700'
          },
          gray: {
            active: 'bg-gray-500 text-white border-gray-500 shadow-gray-200',
            inactive: 'text-gray-600 border-gray-300 hover:bg-gray-50',
            badge: 'bg-gray-100 text-gray-600'
          }
        };

        const classes = isActive ? colorClasses[color].active : colorClasses[color].inactive;

        return (
          <button
            key={value}
            onClick={() => setOcppStatusFilter(value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shadow-sm hover:shadow-md ${
              isActive ? 'ring-2 ring-offset-1 ring-' + color + '-400' : ''
            } ${classes}`}
          >
            {icon && <span className={isActive ? 'text-white' : ''}>{icon}</span>}
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              isActive ? 'bg-white/20 text-white' : colorClasses[color].badge
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Battery size={16} className="text-blue-500" />
                Admin Status:
              </span>

              <select
                value={chargerStatusFilter}
                onChange={event =>
                  setChargerStatusFilter(
                    event.target.value
                  )
                }
                className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700"
              >
                <option value="All">
                  All Status
                </option>
                <option value="ACTIVE">
                  Active
                </option>
                <option value="INACTIVE">
                  Inactive
                </option>
                <option value="SUSPENDED">
                  Suspended
                </option>
                <option value="UNDERMAINTENANCE">
                  Under Maintenance
                </option>
                <option value="DECOMMISSIONED">
                  Decommissioned
                </option>
              </select>

              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Wifi size={16} className="text-blue-500" />
                OCPP Connection:
              </span>

              <select
                value={operationalStatusFilter}
                onChange={event =>
                  setOperationalStatusFilter(
                    event.target.value
                  )
                }
                className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700"
              >
                <option value="All">
                  All
                </option>
                <option value="Online">
                  Online
                </option>
                <option value="Offline">
                  Offline
                </option>
                <option value="Unknown">
                  Unknown
                </option>
              </select>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search chargers..."
                  value={searchQuery}
                  onChange={event =>
                    setSearchQuery(event.target.value)
                  }
                  className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading && chargers.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-gray-600">
                    Loading chargers...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {error}
                  </p>

                  <button
                    onClick={() => fetchChargers()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
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

                <p className="text-lg font-semibold text-gray-600">
                  No Chargers Found
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50/80 to-gray-50/80 border-b border-gray-200">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          SI
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Charger ID
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Charger Name
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Hub Name
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Serial Number
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Charger Type
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Power
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          OCPP Version
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          OCPP Identity
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Host Name
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Host Phone
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Admin Status
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          OCPP Connection
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Connector Status
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredChargers.map(
                        (charger, index) => {
                          const chargerShortId =
                            charger.charger_id ||
                            charger.id;

                          const connectionStatus =
                            getChargerConnectionStatus(
                              charger
                            );

                          const connectionDisplay =
                            getStatusDisplay(
                              connectionStatus,
                              CONNECTION_STATUS_CONFIG
                            );

                          const adminDisplay =
                            getStatusDisplay(
                              charger.status,
                              ADMIN_STATUS_CONFIG
                            );

                          const freshness =
                            charger?.live?.charger
                              ?.connection_freshness ||
                            'UNKNOWN';

                          const freshnessDisplay =
                            getStatusDisplay(
                              freshness,
                              FRESHNESS_CONFIG
                            );

                          const connectors =
                            charger.connectors || [];

                          return (
                            <tr
                              key={
                                charger.id ||
                                charger.charger_id
                              }
                              className="border-b border-gray-100 hover:bg-blue-50/30 transition"
                            >
                              <td className="px-4 py-3 text-sm text-gray-400 font-medium">
                                {String(index + 1).padStart(
                                  2,
                                  '0'
                                )}
                              </td>

                              <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                {charger.charger_id ||
                                  charger.id?.slice(
                                    0,
                                    8
                                  ) ||
                                  'N/A'}
                              </td>

                              <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                {charger.charger_name ||
                                  charger.name ||
                                  'Unnamed'}
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-600">
                                {charger.hub_name || 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-500">
                                {charger.serial_number || 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-600">
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                  {charger.charger_type || 'N/A'}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                {charger.max_power_kw || 0} kW
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-500">
                                {charger.ocpp_version || charger.protocol || 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-sm font-mono text-gray-500">
                                {charger.ocpp_identity || 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-600">
                                {charger.charger_host_name || 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Phone size={14} className="text-gray-400" />
                                  <span>{charger.charger_host_phone_no || 'N/A'}</span>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${adminDisplay.color}`}
                                >
                                  {adminDisplay.icon}
                                  {adminDisplay.label}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-sm">
                                {(() => {
                                  const status = String(
                                    connectionDisplay?.label || ''
                                  ).toLowerCase();

                                  const isOnline = status === 'online';
                                  const isOffline = status === 'offline';
                                  const isUnknown = !isOnline && !isOffline;

                                  return (
                                    <span
                                      className={`
                                        inline-flex items-center gap-1.5
                                        px-2.5 py-1.5
                                        rounded-full
                                        text-xs font-semibold
                                        transition-all duration-200
                                        ${
                                          isOnline
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : isOffline
                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                            : 'bg-amber-50 text-amber-700 border border-dashed border-amber-300'
                                        }
                                      `}
                                    >
                                      {isOnline && (
                                        <span className="relative flex h-2.5 w-2.5">
                                          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-ping" />
                                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                                        </span>
                                      )}

                                      {isOffline && (
                                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                                      )}

                                      {isUnknown && (
                                        <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-amber-200 text-amber-700 text-[9px] font-bold">
                                          ?
                                        </span>
                                      )}

                                      <span>
                                        {isOnline
                                          ? 'Online'
                                          : isOffline
                                          ? 'Offline'
                                          : 'Unknown'}
                                      </span>
                                    </span>
                                  );
                                })()}
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-600">
                                <div className="flex flex-col gap-2">
                                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                    <Plug
                                      size={14}
                                      className="text-blue-400"
                                    />

                                    {connectors.length}{' '}
                                    connector
                                    {connectors.length !== 1 ? 's' : ''}
                                  </span>

                                  <div className="flex flex-wrap items-center gap-4">
                                    {connectors.map(connector => {
                                      const liveConnector =
                                        getConnectorLiveData(
                                          charger,
                                          connector
                                        );

                                      const ocppStatus =
                                        liveConnector?.last_ocpp_status ||
                                        'Unknown';

                                      const availability =
                                        liveConnector?.availability ||
                                        'UNKNOWN';

                                      const ocppDisplay =
                                        getStatusDisplay(
                                          ocppStatus,
                                          OCPP_STATUS_CONFIG
                                        );

                                      const availabilityDisplay =
                                        getStatusDisplay(
                                          availability,
                                          AVAILABILITY_STATUS_CONFIG
                                        );

                                      const isAvailable =
                                        availability === 'AVAILABLE';
                                      const isCharging =
                                        availability === 'CHARGING';
                                      const isPreparing =
                                        availability === 'PREPARING';
                                      const isFaulted =
                                        availability === 'FAULTED';
                                      const isUnavailable =
                                        availability === 'UNAVAILABLE';

                                      let connectorIconColor =
                                        'text-gray-400';

                                      if (isAvailable) {
                                        connectorIconColor =
                                          'text-green-600';
                                      } else if (isCharging) {
                                        connectorIconColor =
                                          'text-blue-600';
                                      } else if (isPreparing) {
                                        connectorIconColor =
                                          'text-yellow-600';
                                      } else if (isFaulted) {
                                        connectorIconColor =
                                          'text-red-600';
                                      } else if (isUnavailable) {
                                        connectorIconColor =
                                          'text-gray-500';
                                      }

                                      return (
                                        <button
                                          key={
                                            connector.id ||
                                            connector.connector_number
                                          }
                                          type="button"
                                          onClick={() => {
                                            setSelectedConnector({
                                              ...connector,
                                              charger,
                                              live_state:
                                                liveConnector || null
                                            });

                                            setShowConnectorDetail(true);
                                          }}
                                          title={`Connector ${
                                            connector.connector_number
                                          } | OCPP: ${ocppStatus} | Availability: ${availability}`}
                                          className="group flex flex-col items-center min-w-[110px] hover:scale-105 transition-transform cursor-pointer"
                                        >
                                          <div className="mb-1.5">
                                            <Plug
                                              size={32}
                                              strokeWidth={2.2}
                                              className={`${connectorIconColor} transition-colors duration-200`}
                                            />
                                          </div>

                                          <span className="text-xs font-semibold text-gray-700 mb-1">
                                            Connector {connector.connector_number}
                                          </span>

                                          <span
                                            className={`inline-flex items-center justify-center gap-1 text-[10px] font-medium ${ocppDisplay.color}`}
                                          >
                                            {ocppDisplay.icon}
                                            <span>
                                              OCPP: {ocppDisplay.label}
                                            </span>
                                          </span>

                                          <span
                                            className={`inline-flex items-center justify-center gap-1 text-[10px] font-medium ${availabilityDisplay.color}`}
                                          >
                                            {availabilityDisplay.icon}
                                            <span>
                                              {availabilityDisplay.label}
                                            </span>
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={() =>
                                    handleViewCharger(
                                      chargerShortId
                                    )
                                  }
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs flex items-center gap-1"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {pagination.has_more && (
                  <div className="px-4 py-4 border-t border-gray-200 flex justify-center">
                    <button
                      onClick={loadMoreChargers}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
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

                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-3">
                  <span>
                    Showing {filteredChargers.length} of{' '}
                    {pagination.total || chargers.length}{' '}
                    chargers
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      Active: {activeChargers}
                    </span>

                    <span>
                      Inactive: {inactiveChargers}
                    </span>

                    <span>
                      Faulted: {faultedChargers}
                    </span>

                    <span className="border-l border-gray-200 pl-3">
                      Available connectors:{' '}
                      {liveConnectorStats.available}
                    </span>

                    <span className="border-l border-gray-200 pl-3">
                      Online connectors:{' '}
                      {liveConnectorStats.online}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showConnectorDetail && (
        <ConnectorDetailModal />
      )}
    </div>
  );
};

export default ChargersAndSessions;


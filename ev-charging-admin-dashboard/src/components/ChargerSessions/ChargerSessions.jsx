// import React, { useEffect, useState, useRef } from "react";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import SearchIcon from "@mui/icons-material/Search";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import WarningIcon from "@mui/icons-material/Warning";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import ErrorIcon from "@mui/icons-material/Error";
// import BuildIcon from "@mui/icons-material/Build";
// import FlashOnIcon from "@mui/icons-material/FlashOn";
// import Sidebar from "../Sidebar/Sidebar";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// const ChargerList = () => {
//   const [chargers, setChargers] = useState([]);
//   const [userDetails, setUserDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [statusLoading, setStatusLoading] = useState({});
  
//   // Refs to track mounted state and prevent duplicate API calls
//   const isMounted = useRef(true);
//   const fetchInProgress = useRef(false);
//   const statusFetchPromises = useRef({});

//   // Get admin ID from token
//   const getAdminIdFromToken = () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         return null;
//       }
      
//       const decoded = jwtDecode(token);
//       return decoded.adminid || decoded.adminId || decoded.userid || decoded.userId || decoded.id || decoded.user_id || "5mrv";
//     } catch (err) {
//       console.error("Error decoding token:", err);
//       return "5mrv";
//     }
//   };

//   // Fetch charger status from API
//   const fetchChargerStatus = async (chargerId) => {
//     // Return cached promise if already fetching
//     if (statusFetchPromises.current[chargerId]) {
//       return statusFetchPromises.current[chargerId];
//     }

//     const fetchPromise = (async () => {
//       try {
//         setStatusLoading(prev => ({ ...prev, [chargerId]: true }));
        
//         const STATUS_API_URL = "https://dev-ocpphalapi.transev.site/api/status";
//         const STATUS_API_KEY = "J9YtyNYdbLD8N4qMwU2WQrr9XV2SJn4Q3qrCLEcHa8wwaZC34xhAd3RotuYdHwiB";
        
//         console.log(`Fetching status for charger: ${chargerId}`);
        
//         const response = await axios.post(
//           STATUS_API_URL,
//           { uid: chargerId },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               "x-api-key": STATUS_API_KEY,
//             },
//             timeout: 5000,
//           }
//         );

//         console.log(`Status API response for ${chargerId}:`, response.data);
//         return response.data;
//       } catch (err) {
//         console.error(`Error fetching status for charger ${chargerId}:`, err);
        
//         if (err.response) {
//           console.error(`Status API error ${err.response.status}:`, err.response.data);
          
//           if (err.response.status === 401) {
//             return { error: "api_key_error" };
//           }
          
//           if (err.response.status === 404) {
//             return { error: "not_found", charger_id: chargerId };
//           }
//         }
        
//         return { error: "request_failed", charger_id: chargerId };
//       } finally {
//         setStatusLoading(prev => ({ ...prev, [chargerId]: false }));
//       }
//     })();

//     // Store the promise in cache
//     statusFetchPromises.current[chargerId] = fetchPromise;
    
//     // Clean up promise from cache after completion
//     fetchPromise.finally(() => {
//       delete statusFetchPromises.current[chargerId];
//     });
    
//     return fetchPromise;
//   };

//   // Extract online/offline status from API response
//   const extractOnlineStatus = (statusData) => {
//     if (!statusData) return "offline";
    
//     if (statusData.error) {
//       return statusData.error === "api_key_error" ? "api_error" : "offline";
//     }
    
//     if (statusData.online) {
//       return statusData.online.toLowerCase() === "online" ? "online" : "offline";
//     }
    
//     if (statusData.connectors && typeof statusData.connectors === 'object') {
//       const connectorStatuses = Object.values(statusData.connectors).map(conn => conn?.status);
//       const hasAvailableConnectors = connectorStatuses.some(status => 
//         status?.toLowerCase().includes("available")
//       );
//       return hasAvailableConnectors ? "online" : "offline";
//     }
    
//     return "offline";
//   };

//   // Extract charger status from API response
//   const extractChargerStatus = (statusData) => {
//     if (!statusData) return "unknown";
    
//     if (statusData.error) {
//       return statusData.error;
//     }
    
//     if (statusData.status) {
//       const status = statusData.status.toLowerCase();
      
//       if (status.includes("active") || status.includes("available") || status.includes("ready")) {
//         return "available";
//       } else if (status.includes("charging") || status.includes("busy") || status.includes("occupied")) {
//         return "busy";
//       } else if (status.includes("inactive") || status.includes("offline") || status.includes("maintenance")) {
//         return "maintenance";
//       } else if (status.includes("error") || status.includes("fault") || status.includes("unavailable")) {
//         return "error";
//       }
//     }
    
//     if (statusData.connectors && typeof statusData.connectors === 'object') {
//       const connectorStatuses = Object.values(statusData.connectors).map(conn => conn?.status);
      
//       if (connectorStatuses.some(status => 
//         status?.toLowerCase().includes("charging") || 
//         status?.toLowerCase().includes("busy") ||
//         status?.toLowerCase().includes("occupied")
//       )) {
//         return "busy";
//       }
      
//       if (connectorStatuses.some(status => 
//         status?.toLowerCase().includes("available") || 
//         status?.toLowerCase().includes("ready")
//       )) {
//         return "available";
//       }
      
//       if (connectorStatuses.some(status => 
//         status?.toLowerCase().includes("error") || 
//         status?.toLowerCase().includes("fault") ||
//         status?.toLowerCase().includes("unavailable")
//       )) {
//         return "error";
//       }
//     }
    
//     return "unknown";
//   };

//   // Get latest message time
//   const getLastOnlineTime = (statusData) => {
//     if (!statusData) return null;
    
//     if (statusData.latest_message_received_time) {
//       return statusData.latest_message_received_time;
//     }
    
//     return null;
//   };

//   // Get connector details
//   const getConnectorDetails = (statusData) => {
//     if (!statusData || !statusData.connectors) return { available: 0, total: 0 };
    
//     const connectors = Object.values(statusData.connectors);
//     const availableConnectors = connectors.filter(conn => 
//       conn?.status?.toLowerCase().includes("available")
//     ).length;
    
//     return {
//       available: availableConnectors,
//       total: connectors.length
//     };
//   };

//   const fetchAllChargerStatuses = async (chargerList) => {
//     const CONCURRENT_LIMIT = 3;
//     const results = new Array(chargerList.length).fill(null);
    
//     const processBatch = async (startIdx, batchSize) => {
//       const batchPromises = [];
//       for (let i = startIdx; i < Math.min(startIdx + batchSize, chargerList.length); i++) {
//         const charger = chargerList[i];
//         batchPromises.push(
//           fetchChargerStatus(charger.uid)
//             .then(statusData => ({ index: i, uid: charger.uid, statusData }))
//             .catch(err => ({ index: i, uid: charger.uid, statusData: null, error: err }))
//         );
//       }
//       return Promise.all(batchPromises);
//     };
    

//     for (let i = 0; i < chargerList.length; i += CONCURRENT_LIMIT) {
//       const batchResults = await processBatch(i, CONCURRENT_LIMIT);
//       batchResults.forEach(result => {
//         if (result.statusData) {
//           results[result.index] = result;
//         }
//       });
//     }

//     const updatedChargers = chargerList.map((charger, index) => {
//       const result = results[index];
//       let statusData = null;
      
//       if (result && result.statusData) {
//         statusData = result.statusData;
//       }
      
//       const onlineStatus = extractOnlineStatus(statusData);
//       const chargerStatus = extractChargerStatus(statusData);
//       const lastOnlineTime = getLastOnlineTime(statusData);
//       const connectorDetails = getConnectorDetails(statusData);
      
//       let chargerType = "DC";
//       if (charger.Chargertype?.toLowerCase().includes("ac")) {
//         chargerType = "AC";
//       }
      
//       let capacity = parseInt(charger.Total_Capacity) || parseInt(charger.connector_total_capacity) || 0;
      
//       return {
//         ...charger,
//         status: chargerStatus,
//         onlineStatus: onlineStatus,
//         chargerType: chargerType,
//         capacity: capacity,
//         protocol: "OCPP 1.6",
//         firmware: "v2.1.4",
//         lastOnline: lastOnlineTime || charger.createdAt,
//         uptime: "98%",
//         statusData: statusData,
//         availableConnectors: connectorDetails.available,
//         totalConnectors: connectorDetails.total || charger.number_of_connectors
//       };
//     });
    
//     return updatedChargers;
//   };

//   // Fetch chargers from API
//   const fetchChargers = async () => {
//     // Prevent multiple simultaneous fetches
//     if (fetchInProgress.current) {
//       console.log("Fetch already in progress, skipping...");
//       return;
//     }
    
//     fetchInProgress.current = true;
//     setLoading(true);
//     setError(null);

//     try {
//       const adminId = getAdminIdFromToken();
//       console.log("Admin ID from token:", adminId);

//       const API_KEY = "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru";
//       const API_URL = "https://be.cms.ocpp.transev.site/admin/getchargersforadminuid";
      
//       console.log("Making API request to:", API_URL);
      
//       const payload = { adminuid: adminId };
//       console.log("Request payload:", payload);

//       const response = await axios.post(
//         API_URL,
//         payload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "apiauthkey": API_KEY,
//           },
//           timeout: 10000,
//         }
//       );

//       console.log("API Response received");

//       if (response.data && response.data.user_chargerunit_details) {
//         const chargerData = response.data.user_chargerunit_details;
//         const userData = response.data.userdetails;
        
//         console.log(`Fetched ${chargerData.length} chargers`);
        
//         // Fetch status for all chargers
//         const chargersWithStatus = await fetchAllChargerStatuses(chargerData);
        
//         if (isMounted.current) {
//           setChargers(chargersWithStatus);
//           setUserDetails(userData);
//         }
//       } else {
//         throw new Error("Invalid API response structure");
//       }

//     } catch (err) {
//       console.error("Error fetching chargers:", err);
      
//       if (isMounted.current) {
//         if (err.response) {
//           setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
//         } else if (err.request) {
//           setError("No response from server. Please check your connection.");
//         } else {
//           setError(`Request failed: ${err.message}`);
//         }
        
//         // Load demo data matching the API structure
//         loadDemoChargers();
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//       }
//       fetchInProgress.current = false;
//     }
//   };

//   // Load demo chargers matching API structure
//   const loadDemoChargers = async () => {
//     console.log("Loading demo charger data...");
//     const demoChargers = [
      
//       {
//         uid: "5bvyd1",
//         Chargerserialnum: "240100327",
//         ChargerName: "Benny 7.4kwh",
//         Chargerhost: "transev",
//         Segment: "public",
//         Subsegment: "parking",
//         Total_Capacity: "7.4kwh",
//         Chargertype: "Ac charger - fast",
//         parking: "yes",
//         number_of_connectors: "1",
//         Connector_type: "CCS2",
//         connector_total_capacity: "7.4kwh",
//         lattitude: "22.5771494",
//         longitute: "88.4867072",
//         full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
//         charger_use_type: "charging",
//         twenty_four_seven_open_status: "yes",
//         userId: "5mrv",
//         createdAt: "2025-06-25T04:56:22.594Z",
//         firstname: "Rajrup",
//         phonenumber: "9836487998",
//         chargerType: "AC",
//         capacity: 7.4,
//         protocol: "OCPP 1.6",
//         firmware: "v1.8.2",
//         uptime: "95%"
//       },
//       // {
//       //   uid: "wdmjwx",
//       //   Chargerserialnum: "2401003290",
//       //   ChargerName: "Transev 60kwh second",
//       //   Chargerhost: "transev",
//       //   Segment: "public",
//       //   Subsegment: "parking",
//       //   Total_Capacity: "60kwh",
//       //   Chargertype: "DC charger - fast",
//       //   parking: "yes",
//       //   number_of_connectors: "2",
//       //   Connector_type: "CCS2",
//       //   connector_total_capacity: "60kwh",
//       //   lattitude: "22.5771494",
//       //   longitute: "88.4867072",
//       //   full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
//       //   charger_use_type: "charging",
//       //   twenty_four_seven_open_status: "yes",
//       //   userId: "5mrv",
//       //   createdAt: "2025-06-27T11:05:10.332Z",
//       //   firstname: "Rajrup",
//       //   phonenumber: "9836487998",
//       //   chargerType: "DC",
//       //   capacity: 60,
//       //   protocol: "OCPP 2.0",
//       //   firmware: "v3.0.1",
//       //   uptime: "92%"
//       // },
//     ];
    
//     // Fetch real statuses for demo chargers
//     const chargersWithStatus = await fetchAllChargerStatuses(demoChargers);
    
//     if (isMounted.current) {
//       setChargers(chargersWithStatus);
//       setUserDetails({
//         uid: "999z",
//         firstname: "Rajrup",
//         lastname: "Das",
//         email: "transmogrify17@outlook.com",
//         role: "superadmin"
//       });
//       console.log(`Demo data loaded: ${chargersWithStatus.length} chargers`);
//     }
//   };

//   // Function to refresh a single charger's status
//   const refreshChargerStatus = async (chargerId) => {
//     try {
//       const statusData = await fetchChargerStatus(chargerId);
//       const onlineStatus = extractOnlineStatus(statusData);
//       const chargerStatus = extractChargerStatus(statusData);
//       const lastOnlineTime = getLastOnlineTime(statusData);
//       const connectorDetails = getConnectorDetails(statusData);
      
//       setChargers(prevChargers => 
//         prevChargers.map(charger => 
//           charger.uid === chargerId 
//             ? { 
//                 ...charger, 
//                 status: chargerStatus,
//                 onlineStatus: onlineStatus,
//                 lastOnline: lastOnlineTime || charger.lastOnline,
//                 statusData: statusData,
//                 availableConnectors: connectorDetails.available,
//                 totalConnectors: connectorDetails.total || charger.number_of_connectors
//               }
//             : charger
//         )
//       );
      
//       return { chargerStatus, onlineStatus };
//     } catch (err) {
//       console.error(`Error refreshing status for charger ${chargerId}:`, err);
//       return { chargerStatus: "error", onlineStatus: "offline" };
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "—";
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMinutes = Math.floor(diffMs / (1000 * 60));
//       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
//       if (diffMinutes < 1) {
//         return "Just now";
//       } else if (diffMinutes < 60) {
//         return `${diffMinutes}m ago`;
//       } else if (diffHours < 24) {
//         return `${diffHours}h ago`;
//       } else if (diffDays === 0) {
//         return "Today";
//       } else if (diffDays === 1) {
//         return "Yesterday";
//       } else if (diffDays < 7) {
//         return `${diffDays} days ago`;
//       } else {
//         return date.toLocaleDateString('en-IN', {
//           day: 'numeric',
//           month: 'short',
//           year: 'numeric'
//         });
//       }
//     } catch (err) {
//       return dateString;
//     }
//   };

//   // Get status color and icon
//   const getStatusInfo = (status, onlineStatus) => {
//     if (onlineStatus === "offline") {
//       return {
//         color: 'text-gray-400',
//         bg: 'bg-gray-400/10',
//         icon: <ErrorIcon fontSize="small" />,
//         text: 'Offline'
//       };
//     }
    
//     if (onlineStatus === "api_error") {
//       return {
//         color: 'text-red-400',
//         bg: 'bg-red-400/10',
//         icon: <WarningIcon fontSize="small" />,
//         text: 'API Error'
//       };
//     }
    
//     switch (status?.toLowerCase()) {
//       case 'available':
//         return {
//           color: 'text-green-400',
//           bg: 'bg-green-400/10',
//           icon: <CheckCircleIcon fontSize="small" />,
//           text: 'Available'
//         };
//       case 'busy':
//         return {
//           color: 'text-yellow-400',
//           bg: 'bg-yellow-400/10',
//           icon: <FlashOnIcon fontSize="small" />,
//           text: 'Busy'
//         };
//       case 'maintenance':
//         return {
//           color: 'text-orange-400',
//           bg: 'bg-orange-400/10',
//           icon: <BuildIcon fontSize="small" />,
//           text: 'Maintenance'
//         };
//       case 'error':
//         return {
//           color: 'text-red-400',
//           bg: 'bg-red-400/10',
//           icon: <ErrorIcon fontSize="small" />,
//           text: 'Error'
//         };
//       case 'unknown':
//         return {
//           color: 'text-gray-400',
//           bg: 'bg-gray-400/10',
//           icon: <WarningIcon fontSize="small" />,
//           text: 'Unknown'
//         };
//       default:
//         return {
//           color: 'text-gray-400',
//           bg: 'bg-gray-400/10',
//           icon: <WarningIcon fontSize="small" />,
//           text: status || 'Unknown'
//         };
//     }
//   };

//   // Get charger type color
//   const getChargerTypeColor = (type) => {
//     switch (type?.toLowerCase()) {
//       case 'dc':
//         return 'text-blue-400 bg-blue-400/10';
//       case 'ac':
//         return 'text-purple-400 bg-purple-400/10';
//       default:
//         return 'text-gray-400 bg-gray-400/10';
//     }
//   };

//   // Get online status indicator
//   const getOnlineIndicator = (onlineStatus) => {
//     switch (onlineStatus) {
//       case 'online':
//         return (
//           <div className="flex items-center gap-1">
//             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//             <span className="text-green-400 text-xs">Online</span>
//           </div>
//         );
//       case 'offline':
//         return (
//           <div className="flex items-center gap-1">
//             <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//             <span className="text-gray-400 text-xs">Offline</span>
//           </div>
//         );
//       case 'api_error':
//         return (
//           <div className="flex items-center gap-1">
//             <div className="w-2 h-2 rounded-full bg-red-500"></div>
//             <span className="text-red-400 text-xs">API Error</span>
//           </div>
//         );
//       default:
//         return (
//           <div className="flex items-center gap-1">
//             <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//             <span className="text-gray-400 text-xs">Unknown</span>
//           </div>
//         );
//     }
//   };

//   // Calculate statistics
//   const totalConnectors = chargers.reduce(
//     (sum, c) => sum + (parseInt(c.totalConnectors) || parseInt(c.number_of_connectors) || 0),
//     0
//   );
  
//   const totalCapacity = chargers.reduce(
//     (sum, c) => sum + (parseFloat(c.Total_Capacity) || parseFloat(c.connector_total_capacity) || 0),
//     0
//   );
  
//   const onlineChargers = chargers.filter(c => c.onlineStatus === 'online').length;
//   const availableChargers = chargers.filter(c => c.status === 'available' && c.onlineStatus === 'online').length;
//   const dcChargers = chargers.filter(c => c.chargerType === 'DC').length;

//   // Filter chargers
//   const filteredChargers = chargers.filter(charger => {
//     if (statusFilter !== "All" && charger.status?.toLowerCase() !== statusFilter.toLowerCase()) {
//       return false;
//     }
    
//     if (typeFilter !== "All" && charger.chargerType?.toLowerCase() !== typeFilter.toLowerCase()) {
//       return false;
//     }
    
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       return (
//         (charger.uid && charger.uid.toLowerCase().includes(query)) ||
//         (charger.ChargerName && charger.ChargerName.toLowerCase().includes(query)) ||
//         (charger.Chargerserialnum && charger.Chargerserialnum.toLowerCase().includes(query)) ||
//         (charger.Chargerhost && charger.Chargerhost.toLowerCase().includes(query)) ||
//         (charger.firstname && charger.firstname.toLowerCase().includes(query))
//       );
//     }
    
//     return true;
//   });

//   // Handle refresh
//   const handleRefresh = () => {
//     fetchChargers();
//   };

//   // Handle refresh for a single charger
//   const handleRefreshCharger = async (chargerId) => {
//     await refreshChargerStatus(chargerId);
//   };

//   useEffect(() => {
//     console.log("ChargerList component mounted");
//     isMounted.current = true;
    
//     // Use a flag to prevent duplicate calls in development
//     const fetchTimeout = setTimeout(() => {
//       fetchChargers();
//     }, 100);
    
//     return () => {
//       console.log("ChargerList component unmounting");
//       isMounted.current = false;
//       fetchInProgress.current = false;
//       clearTimeout(fetchTimeout);
      
//       // Clear all status fetch promises
//       statusFetchPromises.current = {};
//     };
//   }, []);

//   return (
//     <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
//       <Sidebar />

//       <div className="flex-1 p-6 space-y-6">
//         {/* PAGE HEADER */}
//         <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             {/* LEFT */}
//             <div>
//               <h1 className="text-2xl font-semibold text-white">
//                 Charger Management
//               </h1>

//               <p className="text-sm text-gray-400 mt-1">
//                 Manage all EV charging stations and monitor real-time status
//               </p>
              
//               <div className="flex items-center gap-4 mt-3 text-sm">
//                 {userDetails && (
//                   <div className="flex items-center gap-2">
//                     {/* <div className="w-2 h-2 rounded-full bg-green-500"></div> */}
//                     {/* <span className="text-gray-400">
//                       Logged in under <span className="text-white font-medium">{userDetails.firstname} {userDetails.lastname}</span>
//                       <span className="text-blue-400 ml-2">({userDetails.role})</span>
//                     </span> */}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* RIGHT */}
//             <div className="flex gap-3">
//               <button
//                 onClick={handleRefresh}
//                 disabled={loading}
//                 className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
//               >
//                 <RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//                 {loading ? "Refreshing..." : "Refresh All"}
//               </button>
              
//               <Link to="/add-charger">
//                 <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-medium shadow-md flex items-center gap-2">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                   </svg>
//                   Add Charger
//                 </button>
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
//             <p className="text-gray-400 text-sm">Total Chargers</p>
//             <p className="text-2xl font-bold text-white">{chargers.length}</p>
//             <p className="text-xs text-gray-400 mt-1">
//               {onlineChargers} online • {dcChargers} DC • {chargers.length - dcChargers} AC
//             </p>
//           </div>

//           <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
//             <p className="text-gray-400 text-sm">Total Connectors</p>
//             <p className="text-2xl font-bold text-white">{totalConnectors}</p>
//             <p className="text-xs text-gray-400 mt-1">
//               {chargers.reduce((sum, c) => sum + (c.availableConnectors || 0), 0)} available
//             </p>
//           </div>

//           <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
//             <p className="text-gray-400 text-sm">Total Capacity</p>
//             <p className="text-2xl font-bold text-white">{totalCapacity.toFixed(1)} kW</p>
//             <p className="text-xs text-gray-400 mt-1">
//               Combined charging power
//             </p>
//           </div>

//           <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
//             <p className="text-gray-400 text-sm">Network Status</p>
//             <div className="flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${onlineChargers > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
//               <p className={`text-2xl font-bold ${onlineChargers > 0 ? 'text-green-400' : 'text-red-400'}`}>
//                 {onlineChargers > 0 ? 'Online' : 'Offline'}
//               </p>
//             </div>
//             <p className="text-xs text-gray-400 mt-1">
//               {onlineChargers} of {chargers.length} chargers online
//             </p>
//           </div>
//         </div>

//         {/* FILTER BAR */}
//         <div className="flex flex-wrap gap-4 items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
//           <select 
//             className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="All">All Status ({chargers.length})</option>
//             <option value="Available">Available ({chargers.filter(c => c.status === 'available').length})</option>
//             <option value="Busy">Busy ({chargers.filter(c => c.status === 'busy').length})</option>
//             <option value="Maintenance">Maintenance ({chargers.filter(c => c.status === 'maintenance').length})</option>
//             <option value="Error">Error ({chargers.filter(c => c.status === 'error').length})</option>
//             <option value="Unknown">Unknown ({chargers.filter(c => c.status === 'unknown').length})</option>
//           </select>

//           <select 
//             className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             value={typeFilter}
//             onChange={(e) => setTypeFilter(e.target.value)}
//           >
//             <option value="All">All Types</option>
//             <option value="DC">DC Fast Chargers ({chargers.filter(c => c.chargerType === 'DC').length})</option>
//             <option value="AC">AC Chargers ({chargers.filter(c => c.chargerType === 'AC').length})</option>
//           </select>

//           <button className="p-2 rounded-xl bg-[#111827] border border-white/10 hover:bg-white/10 transition">
//             <FilterListIcon />
//           </button>

//           <div className="relative ml-auto">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               placeholder="Search by ID, name, serial..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="bg-[#111827] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
//             />
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
//           {loading ? (
//             <div className="p-10 text-center">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//               <p className="mt-3 text-gray-400">Loading charger data...</p>
//             </div>
//           ) : error ? (
//             <div className="p-10 text-center">
//               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-3">
//                 <ErrorIcon className="w-6 h-6 text-red-400" />
//               </div>
//               <p className="text-red-400 mb-2">{error}</p>
//               <p className="text-sm text-gray-400 mb-4">Showing demo data for reference</p>
//               <button
//                 onClick={fetchChargers}
//                 className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : filteredChargers.length === 0 ? (
//             <div className="p-10 text-center">
//               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
//                 <SearchIcon className="w-6 h-6 text-blue-400" />
//               </div>
//               <p className="text-white mb-2">No chargers found</p>
//               <p className="text-sm text-gray-400">
//                 {searchQuery || statusFilter !== "All" || typeFilter !== "All"
//                   ? "Try adjusting your filters or search terms" 
//                   : "No chargers are registered yet"}
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead className="bg-white/5">
//                   <tr className="text-gray-400 uppercase text-xs">
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Charger ID</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Status</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Serial No.</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Charger Name</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Type</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Capacity</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Connectors</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Host</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Location</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Last Online</th>
//                     <th className="px-4 py-4 text-left whitespace-nowrap">Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-white/10">
//                   {filteredChargers.map((charger) => {
//                     const statusInfo = getStatusInfo(charger.status, charger.onlineStatus);
//                     const typeColor = getChargerTypeColor(charger.chargerType);
                    
//                     return (
//                       <tr key={charger.uid} className="hover:bg-white/5 transition">
//                         <td className="px-4 py-3">
//                           <div className="font-mono text-sm">{charger.uid}</div>
//                           {getOnlineIndicator(charger.onlineStatus)}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusInfo.color} ${statusInfo.bg}`}>
//                               {statusLoading[charger.uid] ? (
//                                 <div className="w-3 h-3 border-b-2 border-current rounded-full animate-spin"></div>
//                               ) : (
//                                 statusInfo.icon
//                               )}
//                               {statusInfo.text}
//                             </span>
//                             <button
//                               onClick={() => handleRefreshCharger(charger.uid)}
//                               disabled={statusLoading[charger.uid]}
//                               className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
//                               title="Refresh status"
//                             >
//                               <RefreshIcon className={`w-3 h-3 ${statusLoading[charger.uid] ? "animate-spin" : ""}`} />
//                             </button>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="font-mono text-xs text-gray-400">{charger.Chargerserialnum}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="font-medium">{charger.ChargerName}</div>
//                           <div className="text-xs text-gray-400">{charger.Chargerhost}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${typeColor}`}>
//                             {charger.chargerType || charger.Chargertype?.split('-')[0]?.trim()}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="font-medium">{charger.capacity || charger.Total_Capacity || charger.connector_total_capacity || "N/A"}</div>
//                           <div className="text-xs text-gray-400">kW</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="font-medium">
//                               {charger.availableConnectors !== undefined ? 
//                                 `${charger.availableConnectors}/${charger.totalConnectors}` : 
//                                 charger.number_of_connectors
//                               }
//                             </div>
//                             <div className="text-xs text-gray-400">{charger.Connector_type}</div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div>{charger.firstname}</div>
//                           <div className="text-xs text-gray-400">{charger.phonenumber}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-xs text-gray-400 max-w-[200px] truncate" title={charger.full_address}>
//                             {charger.full_address}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-sm">{formatDate(charger.lastOnline || charger.createdAt)}</div>
//                           <div className="text-xs text-gray-400">Uptime: {charger.uptime || "N/A"}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <Link to={`/charger/${charger.uid}`}>
//                               <button className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-xs">
//                                 View
//                               </button>
//                             </Link>
//                             <button className="px-3 py-1 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition text-xs">
//                               Edit
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* SUMMARY FOOTER */}
//         <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
//           <div className="flex items-center justify-between text-sm text-gray-400">
//             <div>
//               Showing <span className="text-white font-medium">{filteredChargers.length}</span> of{" "}
//               <span className="text-white font-medium">{chargers.length}</span> chargers
//               {Object.values(statusLoading).some(v => v) && (
//                 <span className="ml-3 text-blue-400">
//                   <RefreshIcon className="w-3 h-3 inline mr-1 animate-spin" />
//                   Refreshing status...
//                 </span>
//               )}
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                 <span>Online: {onlineChargers}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
//                 <span>Available: {availableChargers}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-orange-500"></div>
//                 <span>Offline: {chargers.filter(c => c.onlineStatus === 'offline').length}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChargerList;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  Search,
  Filter,
  Wifi,
  WifiOff,
  Zap,
  Plug,
  Battery,
  Activity,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Server,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  Grid,
  List,
  ChevronRight,
  X,
  Power,
  RefreshCw,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_CONFIG = {
  USER_INFO_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/me',
  SESSIONS_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/sessions',
  LOGOUT_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/logout',
  REFRESH_TOKEN_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/refresh'
};

const ChargersAndSessions = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('chargers');
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('This Month');
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [selectedProtocol, setSelectedProtocol] = useState('All');
  const [selectedConnectorType, setSelectedConnectorType] = useState('All');
  const [selectedMake, setSelectedMake] = useState('All');
  const [selectedConfigStatus, setSelectedConfigStatus] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [connectorFilter, setConnectorFilter] = useState('All');
  const [sessions, setSessions] = useState([]);
  
  // Session filter states
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('All');
  const [showSessionFilterPopup, setShowSessionFilterPopup] = useState(false);
  const [sessionNetworkType, setSessionNetworkType] = useState('All');
  const [sessionProtocol, setSessionProtocol] = useState('All');
  const [sessionStatus, setSessionStatus] = useState('All');
  const [sessionConnectorType, setSessionConnectorType] = useState('All');
  const [sessionMake, setSessionMake] = useState('All');
  const [sessionTransactionType, setSessionTransactionType] = useState('All');
  const [sessionAnomalyReason, setSessionAnomalyReason] = useState('All');
  const [sessionState, setSessionState] = useState('All');
  const [sessionHub, setSessionHub] = useState('All');

  // Dummy charger data
  const dummyChargers = [
    {
      id: "CH-001",
      name: "Benny 7.4kWh",
      sessions: 156,
      usage: "342.5 kWh",
      avgUtilization: "67%",
      onlinePercent: "98%",
      connectors: 2,
      geoState: "West Bengal",
      hostDetails: "Host-01",
      make: "Benny",
      protocol: "OCPP",
      fwVersion: "v2.1.3",
      fwUpdate: "Available",
      configStatus: "Configured",
      tariff: "₹ 8.50/kWh",
      online: true,
      available: 1,
      busy: 1,
      error: 0
    },
    {
      id: "CH-002",
      name: "Transev 60kWh",
      sessions: 89,
      usage: "245.2 kWh",
      avgUtilization: "54%",
      onlinePercent: "95%",
      connectors: 2,
      geoState: "West Bengal",
      hostDetails: "Host-02",
      make: "Transev",
      protocol: "OCPP",
      fwVersion: "v1.8.2",
      fwUpdate: "Up to date",
      configStatus: "Configured",
      tariff: "₹ 10.00/kWh",
      online: true,
      available: 0,
      busy: 2,
      error: 0
    },
    {
      id: "CH-003",
      name: "EcoCharge 22kWh",
      sessions: 45,
      usage: "120.8 kWh",
      avgUtilization: "32%",
      onlinePercent: "0%",
      connectors: 1,
      geoState: "West Bengal",
      hostDetails: "Host-03",
      make: "EcoCharge",
      protocol: "Kazam",
      fwVersion: "v1.0.1",
      fwUpdate: "Update required",
      configStatus: "Non Configured",
      tariff: "₹ 6.75/kWh",
      online: false,
      available: 0,
      busy: 0,
      error: 1
    },
    {
      id: "CH-004",
      name: "PowerMax 150kWh",
      sessions: 234,
      usage: "589.7 kWh",
      avgUtilization: "82%",
      onlinePercent: "100%",
      connectors: 2,
      geoState: "West Bengal",
      hostDetails: "Host-04",
      make: "PowerMax",
      protocol: "OCPP",
      fwVersion: "v3.0.0",
      fwUpdate: "Up to date",
      configStatus: "Configured",
      tariff: "₹ 12.00/kWh",
      online: true,
      available: 2,
      busy: 0,
      error: 0
    }
  ];

  // Dummy sessions data
  const dummySessions = [
    {
      id: "SES-001",
      hubName: "Newtown Hub",
      sessionId: "SES-2026-001",
      startCriteria: "RFID",
      chargerId: "CH-001",
      connectorId: "CON-001",
      connector: "Type 2",
      startTime: "2026-08-03 14:30:00",
      endTime: "2026-08-03 16:45:00",
      duration: "2h 15m",
      usage: "45.5",
      status: "Completed",
      vehicleDetails: "Tesla Model 3",
      macId: "AA:BB:CC:DD:EE:FF",
      idTag: "RFID-12345",
      driverDetails: "John Doe",
      firmwareVersion: "v2.1.3",
      segment: "Premium",
      protocol: "OCPP",
      deviceName: "Benny 7.4kWh",
      address: "Action Area III",
      city: "Kolkata",
      state: "West Bengal"
    },
    {
      id: "SES-002",
      hubName: "Salt Lake Hub",
      sessionId: "SES-2026-002",
      startCriteria: "App",
      chargerId: "CH-004",
      connectorId: "CON-004",
      connector: "CCS",
      startTime: "2026-08-03 10:15:00",
      endTime: "2026-08-03 11:30:00",
      duration: "1h 15m",
      usage: "78.2",
      status: "Completed",
      vehicleDetails: "Hyundai IONIQ 5",
      macId: "FF:EE:DD:CC:BB:AA",
      idTag: "RFID-67890",
      driverDetails: "Jane Smith",
      firmwareVersion: "v3.0.0",
      segment: "Premium",
      protocol: "OCPP",
      deviceName: "PowerMax 150kWh",
      address: "Salt Lake Sector V",
      city: "Kolkata",
      state: "West Bengal"
    }
  ];

  useEffect(() => {
    fetchUserInfo();
    fetchSessions();
  }, []);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch(API_CONFIG.USER_INFO_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userInfo');
        navigate('/signin');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchSessions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(API_CONFIG.SESSIONS_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      if (token) {
        await fetch(API_CONFIG.LOGOUT_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || 'User'}
            </h4>
            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email || 'user@transev.com'}
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

  // Charger Filter Popup - Centered
  const ChargerFilterPopup = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Network Type</label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">Select network type</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="GSM">GSM</option>
              <option value="BLE">BLE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Protocol</label>
            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">Select device protocol</option>
              <option value="Kazam">Kazam</option>
              <option value="OCPP">OCPP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Connector Type</label>
            <select
              value={selectedConnectorType}
              onChange={(e) => setSelectedConnectorType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">Select connector type</option>
              <option value="three_pin">Three Pin</option>
              <option value="ccs">CCS</option>
              <option value="industrial_three_pin">Industrial Three Pin</option>
              <option value="gbt">GBT</option>
              <option value="type_1">Type 1</option>
              <option value="type_2">Type 2</option>
              <option value="type_6">Type 6</option>
              <option value="type_7">Type 7</option>
              <option value="chogori">Chogori</option>
              <option value="chademo">Chademo</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Make</label>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">Select device make</option>
              <option value="No-Make">No-Make</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Configuration Status</label>
            <select
              value={selectedConfigStatus}
              onChange={(e) => setSelectedConfigStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">Select status</option>
              <option value="Configured">Configured</option>
              <option value="Non Configured">Non Configured</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowFilterPopup(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setSelectedNetwork('All');
                setSelectedProtocol('All');
                setSelectedConnectorType('All');
                setSelectedMake('All');
                setSelectedConfigStatus('All');
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

  // Session Filter Popup - Centered
  const SessionFilterPopup = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[550px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            Filters
          </h3>
          <button
            onClick={() => setShowSessionFilterPopup(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Network Type</label>
              <select
                value={sessionNetworkType}
                onChange={(e) => setSessionNetworkType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select network type</option>
                <option>Wi-Fi</option>
                <option>GSM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Protocol</label>
              <select
                value={sessionProtocol}
                onChange={(e) => setSessionProtocol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select protocol</option>
                <option>OCPP</option>
                <option>Kazam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={sessionStatus}
                onChange={(e) => setSessionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select status</option>
                <option>Completed</option>
                <option>Ongoing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Connector Type</label>
              <select
                value={sessionConnectorType}
                onChange={(e) => setSessionConnectorType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select connector type</option>
                <option>Type 2</option>
                <option>CCS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Make</label>
              <select
                value={sessionMake}
                onChange={(e) => setSessionMake(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select make</option>
                <option>Benny</option>
                <option>Transev</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction Type</label>
              <select
                value={sessionTransactionType}
                onChange={(e) => setSessionTransactionType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select transaction type</option>
                <option>Anomaly</option>
                <option>Non Anomaly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Anomaly Reason</label>
              <select
                value={sessionAnomalyReason}
                onChange={(e) => setSessionAnomalyReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select anomaly reason</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <select
                value={sessionState}
                onChange={(e) => setSessionState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select state</option>
                <option>West Bengal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hub</label>
              <select
                value={sessionHub}
                onChange={(e) => setSessionHub(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">Select hub</option>
                <option>Newtown Hub</option>
                <option>Salt Lake Hub</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => {
                setShowSessionFilterPopup(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Apply
            </button>
            <button 
              onClick={() => {
                setSessionNetworkType('All');
                setSessionProtocol('All');
                setSessionStatus('All');
                setSessionConnectorType('All');
                setSessionMake('All');
                setSessionTransactionType('All');
                setSessionAnomalyReason('All');
                setSessionState('All');
                setSessionHub('All');
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

  const totalChargers = dummyChargers.length;
  const totalConnectors = dummyChargers.reduce((sum, c) => sum + c.connectors, 0);
  const totalAvailable = dummyChargers.reduce((sum, c) => sum + c.available, 0);
  const totalBusy = dummyChargers.reduce((sum, c) => sum + c.busy, 0);
  const totalError = dummyChargers.reduce((sum, c) => sum + c.error, 0);
  const nonConfigured = dummyChargers.filter(c => c.configStatus === 'Non Configured').length;

  // Filter chargers based on search and status
  const filteredChargers = dummyChargers.filter(charger => {
    const matchesSearch = charger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Online' && charger.online) ||
                          (statusFilter === 'Offline' && !charger.online);
    const matchesConnector = connectorFilter === 'All' ||
                             (connectorFilter === 'Available' && charger.available > 0) ||
                             (connectorFilter === 'Busy' && charger.busy > 0) ||
                             (connectorFilter === 'Error' && charger.error > 0) ||
                             (connectorFilter === 'Non Configured' && charger.configStatus === 'Non Configured');
    const matchesNetwork = selectedNetwork === 'All' || charger.protocol === selectedNetwork;
    const matchesProtocol = selectedProtocol === 'All' || charger.protocol === selectedProtocol;
    const matchesMake = selectedMake === 'All' || charger.make === selectedMake;
    const matchesConfig = selectedConfigStatus === 'All' || charger.configStatus === selectedConfigStatus;
    
    return matchesSearch && matchesStatus && matchesConnector && 
           matchesNetwork && matchesProtocol && matchesMake && matchesConfig;
  });

  // Filter sessions
  const filteredSessions = dummySessions.filter(session => {
    const matchesSearch = session.sessionId.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
                          session.hubName.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
                          session.chargerId.toLowerCase().includes(sessionSearchQuery.toLowerCase());
    const matchesFilter = sessionFilter === 'All' || session.status === sessionFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isDarkMode={isDarkMode} 
        onThemeToggle={handleThemeToggle}
        userName={userData?.user?.full_name || 'User'}
        userEmail={userData?.user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
                <span className="text-gray-300 font-light">/</span>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                >
                  Dashboard
                </button>
                <span className="text-gray-300 font-light">/</span>
                <span className="text-sm text-gray-600 font-medium">
                  {activeTab === 'chargers' ? 'Chargers' : 'Sessions'}
                </span>
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
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setActiveTab('chargers');
              }}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'chargers' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap size={18} />
              <span className="font-medium">Chargers</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sessions');
              }}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'sessions' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity size={18} />
              <span className="font-medium">Sessions</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">0</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'chargers' ? (
          <div className="p-6">
            {/* Stats Cards - Compact */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <Zap size={14} className="text-blue-600" />
                <span className="text-xs text-gray-500">Total Chargers</span>
                <span className="text-sm font-bold text-gray-800">{totalChargers}</span>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <Plug size={14} className="text-purple-600" />
                <span className="text-xs text-gray-500">Connectors</span>
                <span className="text-sm font-bold text-gray-800">{totalConnectors}</span>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-xs text-gray-500">Online</span>
                <span className="text-sm font-bold text-gray-800">{dummyChargers.filter(c => c.online).length}</span>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <AlertCircle size={14} className="text-amber-600" />
                <span className="text-xs text-gray-500">Non Configured</span>
                <span className="text-sm font-bold text-gray-800">{nonConfigured}</span>
              </div>
            </div>

            {/* Connector Status - Compact Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden inline-block">
              <div className="flex divide-x divide-gray-200">
                <button
                  onClick={() => setConnectorFilter('All')}
                  className={`px-4 py-2 text-center transition ${
                    connectorFilter === 'All' ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs text-gray-500 block">All</span>
                  <span className={`text-base font-bold ${connectorFilter === 'All' ? 'text-green-600' : 'text-gray-700'}`}>
                    {totalConnectors}
                  </span>
                </button>
                <button
                  onClick={() => setConnectorFilter('Available')}
                  className={`px-4 py-2 text-center transition ${
                    connectorFilter === 'Available' ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs text-gray-500 block">Available</span>
                  <span className={`text-base font-bold ${connectorFilter === 'Available' ? 'text-green-600' : 'text-gray-700'}`}>
                    {totalAvailable}
                  </span>
                </button>
                <button
                  onClick={() => setConnectorFilter('Busy')}
                  className={`px-4 py-2 text-center transition ${
                    connectorFilter === 'Busy' ? 'bg-yellow-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs text-gray-500 block">Busy</span>
                  <span className={`text-base font-bold ${connectorFilter === 'Busy' ? 'text-yellow-600' : 'text-gray-700'}`}>
                    {totalBusy}
                  </span>
                </button>
                <button
                  onClick={() => setConnectorFilter('Error')}
                  className={`px-4 py-2 text-center transition ${
                    connectorFilter === 'Error' ? 'bg-red-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs text-gray-500 block">Error</span>
                  <span className={`text-base font-bold ${connectorFilter === 'Error' ? 'text-red-600' : 'text-gray-700'}`}>
                    {totalError}
                  </span>
                </button>
                <button
                  onClick={() => setConnectorFilter('Non Configured')}
                  className={`px-4 py-2 text-center transition ${
                    connectorFilter === 'Non Configured' ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs text-gray-500 block">Non Config</span>
                  <span className={`text-base font-bold ${connectorFilter === 'Non Configured' ? 'text-amber-600' : 'text-gray-700'}`}>
                    {nonConfigured}
                  </span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>This Month</option>
                  <option>This Week</option>
                  <option>Yesterday</option>
                  <option>Today</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search chargers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56"
                  />
                </div>
                <button
                  onClick={() => setShowFilterPopup(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium text-gray-700"
                >
                  <Filter size={16} className="text-gray-500" />
                  Filter
                </button>
                {showFilterPopup && <ChargerFilterPopup />}
              </div>
            </div>

            {/* Table - Larger Text */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SL</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sessions</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Util</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Online %</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connectors</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Geo State</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Host</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Make</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Protocol</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FW Version</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FW Update</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Config</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tariff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChargers.length === 0 ? (
                      <tr>
                        <td colSpan="16" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Plug size={48} className="text-gray-300 mb-3" />
                            <p className="text-base font-medium text-gray-500">No Data Found</p>
                            <p className="text-sm text-gray-400 mt-1">No chargers available</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredChargers.map((charger, index) => (
                        <tr key={charger.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{charger.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.sessions}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.usage}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.avgUtilization}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.onlinePercent}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.connectors}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.geoState}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.hostDetails}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.make}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.protocol}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.fwVersion}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              charger.fwUpdate === 'Available' || charger.fwUpdate === 'Update required'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {charger.fwUpdate}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              charger.configStatus === 'Configured'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {charger.configStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{charger.tariff}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Sessions Tab
          <div className="p-6">
            {/* Sessions Stats - Compact */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <Activity size={14} className="text-blue-600" />
                <span className="text-xs text-gray-500">Total Sessions</span>
                <span className="text-sm font-bold text-gray-800">{dummySessions.length}</span>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-xs text-gray-500">Completed</span>
                <span className="text-sm font-bold text-gray-800">{dummySessions.filter(s => s.status === 'Completed').length}</span>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <Clock size={14} className="text-yellow-600" />
                <span className="text-xs text-gray-500">Ongoing</span>
                <span className="text-sm font-bold text-gray-800">0</span>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                <AlertCircle size={14} className="text-red-600" />
                <span className="text-xs text-gray-500">Anomaly</span>
                <span className="text-sm font-bold text-gray-800">0</span>
              </div>
            </div>

            {/* Sessions Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button 
                onClick={() => setSessionFilter('All')}
                className={`text-xs px-3 py-1.5 rounded-full transition ${
                  sessionFilter === 'All' 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setSessionFilter('Ongoing')}
                className={`text-xs px-3 py-1.5 rounded-full transition ${
                  sessionFilter === 'Ongoing' 
                    ? 'bg-yellow-500 text-white font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ongoing
              </button>
              <button 
                onClick={() => setSessionFilter('Completed')}
                className={`text-xs px-3 py-1.5 rounded-full transition ${
                  sessionFilter === 'Completed' 
                    ? 'bg-green-600 text-white font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>This Month</option>
                  <option>This Week</option>
                  <option>Yesterday</option>
                  <option>Today</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={sessionSearchQuery}
                    onChange={(e) => setSessionSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56"
                  />
                </div>
                <button
                  onClick={() => setShowSessionFilterPopup(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium text-gray-700"
                >
                  <Filter size={16} className="text-gray-500" />
                  Filter
                </button>
                {showSessionFilterPopup && <SessionFilterPopup />}
              </div>
            </div>

            {/* Sessions Table - Larger Text */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hub</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Session ID</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Criteria</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger ID</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Conn ID</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connector</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mac ID</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Tag</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FW</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Segment</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Protocol</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">City</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan="22" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Activity size={48} className="text-gray-300 mb-3" />
                            <p className="text-base font-medium text-gray-500">No Data Found</p>
                            <p className="text-sm text-gray-400 mt-1">No sessions available</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((session, index) => (
                        <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.hubName}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.sessionId}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.startCriteria}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.chargerId}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.connectorId}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.connector}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.startTime}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.endTime}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.duration}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.usage}</td>
                          <td className="px-3 py-2.5 text-sm">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              session.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.vehicleDetails}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.macId}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.idTag}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.driverDetails}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.firmwareVersion}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.segment}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.protocol}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.deviceName}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.address}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.city}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{session.state}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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

export default ChargersAndSessions;
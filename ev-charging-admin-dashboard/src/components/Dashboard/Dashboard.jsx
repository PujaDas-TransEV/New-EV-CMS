// import React, { useEffect, useState, useRef } from "react";
// import Sidebar from "../Sidebar/Sidebar";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Bell,
//   MapPin,
//   Zap,
//   Sun,
//   Moon,
//   Power,
//   AlertTriangle,
//   X,
//   RefreshCw,
//   Wifi,
//   WifiOff,
//   Key,
//   Plug,
//   PlugZap,
//   Battery,
//   Building,
//   Users,
//   Server,
//   ExternalLink,
//   Activity,
//   DollarSign,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   Play,
//   StopCircle,
//   Settings,
//   TrendingUp,
//   BatteryCharging,
//   Calendar,
//   Trash2,
//   LogOut,
//   User as UserIcon,
// } from "lucide-react";

// // API Configuration with separate keys for different endpoints
// const API_CONFIG = {
//   ADMIN_API: {
//     BASE_URL: "https://be.cms.ocpp.transev.site/admin/getchargerbyadminid",
//     API_KEY: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
//     KEY_HEADER: "apiauthkey"
//   },
//   STATUS_API: {
//     BASE_URL: "https://dev-ocpphalapi.transev.site/api/status",
//     API_KEY: "J9YtyNYdbLD8N4qMwU2WQrr9XV2SJn4Q3qrCLEcHa8wwaZC34xhAd3RotuYdHwiB",
//     KEY_HEADER: "x-api-key"
//   },
//   DELETE_API: {
//     BASE_URL: "https://be.cms.ocpp.transev.site/admin/deleteacharger",
//     API_KEY: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
//     KEY_HEADER: "apiauthkey"
//   }
// };

// /* ---------------- MAIN DASHBOARD ---------------- */
// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [userName, setUserName] = useState("User");
//   const [userDetails, setUserDetails] = useState(null);
//   const [darkMode, setDarkMode] = useState(true);
//   const [alerts, setAlerts] = useState([]);
//   const [selectedCharger, setSelectedCharger] = useState(null);
//   const [selectedConnector, setSelectedConnector] = useState(null);
//   const [chargersData, setChargersData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [adminApiStatus, setAdminApiStatus] = useState("active");
//   const [statusApiStatus, setStatusApiStatus] = useState("active");
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [chargerToDelete, setChargerToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [deleteError, setDeleteError] = useState(null);
//   const [deleteSuccess, setDeleteSuccess] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [adminId, setAdminId] = useState(null);
  
//   // Refs to prevent duplicate API calls
//   const isMounted = useRef(true);
//   const fetchInProgress = useRef(false);
//   const statusFetchPromises = useRef({});

//   // Get user ID from token - Enhanced with robust token parsing
//   const getUserID = () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("No token found in localStorage");
//         navigate("/signin");
//         return null;
//       }
      
//       const decoded = jwtDecode(token);
//       console.log("Decoded token:", decoded); // Debug log
      
//       // Try different possible field names for user ID
//       const userId = decoded.userId || decoded.userid || decoded.id || decoded.user_id || decoded.UserID;
      
//       if (!userId) {
//         console.error("No user ID found in token:", decoded);
//         navigate("/signin");
//         return null;
//       }
      
//       console.log("Extracted user ID:", userId);
//       return userId;
      
//     } catch (err) {
//       console.error("Error decoding token:", err);
//       navigate("/signin");
//       return null;
//     }
//   };

//   // Get admin ID from token (if available) - Enhanced with robust token parsing
//   const getAdminID = () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("No token found in localStorage");
//         navigate("/signin");
//         return null;
//       }
      
//       const decoded = jwtDecode(token);
//       console.log("Decoded token for admin:", decoded); // Debug log
      
//       // Try different possible field names for admin ID
//       const adminId = decoded.adminId || decoded.admin_id || decoded.adminid || decoded.AdminID || decoded.adminID;
      
//       if (!adminId) {
//         console.error("No admin ID found in token:", decoded);
//         // If no admin ID, try to use user ID as fallback for admin operations
//         const userId = decoded.userId || decoded.userid || decoded.id;
//         console.log("No admin ID found, using user ID as fallback:", userId);
//         return userId;
//       }
      
//       console.log("Extracted admin ID:", adminId);
//       return adminId;
      
//     } catch (err) {
//       console.error("Error decoding token for admin ID:", err);
//       return null;
//     }
//   };

//   // Logout function
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/signin");
//   };

//   // Fetch chargers by admin ID - Updated to use admin/getchargerbyadminid
//   const fetchAdminChargers = async () => {
//     const currentAdminId = getAdminID();
//     if (!currentAdminId) {
//       setError("Admin ID not found. Please login again.");
//       navigate("/signin");
//       return [];
//     }

//     try {
//       console.log("Fetching admin chargers for admin ID:", currentAdminId);
//       console.log("Using API key:", API_CONFIG.ADMIN_API.API_KEY.substring(0, 20) + "...");
      
//       const response = await fetch(API_CONFIG.ADMIN_API.BASE_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           [API_CONFIG.ADMIN_API.KEY_HEADER]: API_CONFIG.ADMIN_API.API_KEY,
//         },
//         body: JSON.stringify({ 
//           adminid: currentAdminId,
//           // Note: get_charger_id is optional - we're not specifying it to get all chargers
//         }),
//       });

//       console.log("Admin API response status:", response.status);
      
//       if (response.status === 401 || response.status === 403) {
//         setAdminApiStatus("invalid");
//         throw new Error("Admin API authentication failed - Invalid apiauthkey");
//       }
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Admin API error! status: ${response.status}, message: ${errorText}`);
//       }

//       const data = await response.json();
//       console.log("Admin API response data:", data);
      
//       // Assuming the response structure is similar to the user API
//       // It might return chargers directly or under a different key
//       let chargers = [];
      
//       if (data.user_chargerunit_details) {
//         chargers = data.user_chargerunit_details;
//         console.log("Chargers found (user_chargerunit_details):", chargers.length);
//       } else if (data.chargerunit_details) {
//         chargers = data.chargerunit_details;
//         console.log("Chargers found (chargerunit_details):", chargers.length);
//       } else if (data.chargers) {
//         chargers = data.chargers;
//         console.log("Chargers found (chargers):", chargers.length);
//       } else if (Array.isArray(data)) {
//         chargers = data;
//         console.log("Chargers found (array):", chargers.length);
//       } else {
//         console.log("No chargers found in response:", data);
//       }
      
//       if (isMounted.current) {
//         setUserDetails(data.userdetails || data.admindetails || {});
//         setAdminApiStatus("active");
        
//         // Try multiple possible field names for name
//         const firstName = data.userdetails?.firstname || 
//                          data.admindetails?.firstname ||
//                          data.userdetails?.firstName || 
//                          data.admindetails?.firstName ||
//                          data.userdetails?.name || 
//                          data.admindetails?.name ||
//                          data.userdetails?.userName ||
//                          data.admindetails?.adminName;
        
//         if (firstName) {
//           setUserName(firstName);
//         }
//       }
      
//       return chargers;
      
//     } catch (err) {
//       console.error("Error fetching admin chargers:", err);
//       if (isMounted.current) {
//         setAdminApiStatus("error");
//       }
      
//       // Fallback demo data for testing
//       const demoChargers = [
//         {
//           uid: "5bvyd1",
//           ChargerName: "Benny 7.4kwh",
//           Total_Capacity: "7.4kwh",
//           number_of_connectors: "2",
//           Chargertype: "AC charger - fast",
//           full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
//         },
//         {
//           uid: "5t7env",
//           ChargerName: "Transev 60kwh",
//           Total_Capacity: "60kwh",
//           number_of_connectors: "2",
//           Chargertype: "DC charger - fast",
//           full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
//         },
//       ];
      
//       return demoChargers;
//     }
//   };

//   // Fetch status for a single charger
//   const fetchChargerStatus = async (chargerId, chargerInfo) => {
//     // Return cached promise if already fetching
//     if (statusFetchPromises.current[chargerId]) {
//       return statusFetchPromises.current[chargerId];
//     }

//     const fetchPromise = (async () => {
//       try {
//         console.log(`Fetching status for charger ${chargerId} with API key:`, API_CONFIG.STATUS_API.API_KEY.substring(0, 20) + "...");
        
//         const response = await fetch(API_CONFIG.STATUS_API.BASE_URL, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             [API_CONFIG.STATUS_API.KEY_HEADER]: API_CONFIG.STATUS_API.API_KEY,
//           },
//           body: JSON.stringify({ uid: chargerId }),
//         });

//         if (response.status === 401 || response.status === 403) {
//           if (isMounted.current) {
//             setStatusApiStatus("invalid");
//           }
//           throw new Error("Status API authentication failed - Invalid x-api-key");
//         }
        
//         if (!response.ok) {
//           throw new Error(`Status API error! status: ${response.status} for charger ${chargerId}`);
//         }

//         const statusData = await response.json();
//         console.log(`Status data received for ${chargerId}:`, statusData);
        
//         if (isMounted.current) {
//           setStatusApiStatus("active");
//         }
        
//         return {
//           chargerInfo,
//           statusData,
//           lastUpdated: new Date(),
//           error: null
//         };
        
//       } catch (err) {
//         console.error(`Error fetching status for charger ${chargerId}:`, err);
//         if (isMounted.current) {
//           setStatusApiStatus("error");
//         }
        
//         // Return fallback data for this charger
//         return {
//           chargerInfo,
//           statusData: {
//             charger_id: chargerId,
//             status: "Unknown",
//             connectors: {
//               "0": {
//                 status: "Unknown",
//                 latest_meter_value: null,
//                 latest_transaction_consumption_kwh: 0.0,
//                 error_code: "ConnectionError",
//                 latest_transaction_id: null
//               }
//             },
//             online: "Offline",
//             latest_message_received_time: null
//           },
//           lastUpdated: new Date(),
//           error: err.message
//         };
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

//   // Fetch status for all chargers with controlled concurrency
//   const fetchAllChargersStatus = async () => {
//     // Prevent multiple simultaneous fetches
//     if (fetchInProgress.current) {
//       console.log("Fetch already in progress, skipping...");
//       return;
//     }
    
//     fetchInProgress.current = true;
    
//     if (isMounted.current) {
//       setLoading(true);
//       setError(null);
//     }
    
//     try {
//       // First get admin's chargers using the ADMIN API with apiauthkey
//       console.log("Step 1: Fetching admin chargers...");
//       const chargers = await fetchAdminChargers();
      
//       if (!chargers || chargers.length === 0) {
//         if (isMounted.current) {
//           setError("No chargers found for this admin.");
//           setLoading(false);
//         }
//         return;
//       }
      
//       console.log(`Step 2: Found ${chargers.length} chargers. Fetching status for each...`);
      
//       // Limit concurrent status API calls to prevent overwhelming the server
//       const CONCURRENT_LIMIT = 3;
//       const results = new Array(chargers.length).fill(null);
      
//       // Process in batches
//       const processBatch = async (startIdx, batchSize) => {
//         const batchPromises = [];
//         for (let i = startIdx; i < Math.min(startIdx + batchSize, chargers.length); i++) {
//           const charger = chargers[i];
//           batchPromises.push(
//             fetchChargerStatus(charger.uid, charger)
//               .then(statusData => ({ index: i, uid: charger.uid, ...statusData }))
//               .catch(err => ({ 
//                 index: i, 
//                 uid: charger.uid, 
//                 chargerInfo: charger,
//                 statusData: {
//                   charger_id: charger.uid,
//                   status: "Error",
//                   connectors: {},
//                   online: "Offline",
//                   latest_message_received_time: null
//                 },
//                 lastUpdated: new Date(),
//                 error: err.message 
//               }))
//           );
//         }
//         return Promise.all(batchPromises);
//       };
      
//       // Process in batches
//       for (let i = 0; i < chargers.length; i += CONCURRENT_LIMIT) {
//         const batchResults = await processBatch(i, CONCURRENT_LIMIT);
//         batchResults.forEach(result => {
//           results[result.index] = result;
//         });
//       }
      
//       // Process results
//       const chargersDataMap = {};
//       const newAlerts = [];
      
//       results.forEach((result) => {
//         if (result) {
//           const { uid, chargerInfo, statusData, error } = result;
          
//           chargersDataMap[uid] = {
//             chargerInfo,
//             statusData,
//             lastUpdated: new Date(),
//             error
//           };
          
//           // Add alerts based on status
//           if (statusData.online === "Offline") {
//             newAlerts.push(`${chargerInfo.ChargerName} is offline`);
//           }
          
//           if (statusData.status === "Faulted") {
//             newAlerts.push(`${chargerInfo.ChargerName} has a fault`);
//           }
          
//           // Check connectors
//           Object.entries(statusData.connectors || {}).forEach(([connectorId, connector]) => {
//             if (connector.error_code !== "NoError") {
//               newAlerts.push(`${chargerInfo.ChargerName} - Port ${parseInt(connectorId) + 1}: ${connector.error_code}`);
//             }
            
//             if (connector.status === "Unavailable") {
//               newAlerts.push(`${chargerInfo.ChargerName} - Port ${parseInt(connectorId) + 1} is unavailable`);
//             }
//           });
//         }
//       });
      
//       if (isMounted.current) {
//         setChargersData(chargersDataMap);
//         setAlerts(newAlerts);
//         setLastUpdated(new Date());
//       }
      
//       console.log(`Step 3: Data loaded successfully. ${Object.keys(chargersDataMap).length} chargers updated.`);
      
//     } catch (err) {
//       console.error("Error in fetchAllChargersStatus:", err);
//       if (isMounted.current) {
//         setError("Failed to load charger status. Please try again.");
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//       }
//       fetchInProgress.current = false;
//     }
//   };

//   // Calculate KPIs from all chargers
//   const calculateKPIs = () => {
//     const chargers = Object.values(chargersData);
    
//     if (chargers.length === 0) {
//       return {
//         totalChargers: 0,
//         onlineChargers: 0,
//         activeSessions: 0,
//         totalEnergy: "0 kWh",
//         revenue: "₹0.00",
//         availability: "0%",
//         totalConnectors: 0,
//         availableConnectors: 0,
//         totalCapacity: "0 kW",
//       };
//     }

//     let totalChargers = chargers.length;
//     let onlineChargers = 0;
//     let activeSessions = 0;
//     let totalEnergy = 0;
//     let totalConnectors = 0;
//     let availableConnectors = 0;
//     let totalCapacity = 0;

//     chargers.forEach(({ chargerInfo, statusData }) => {
//       if (statusData.online === "Online") {
//         onlineChargers++;
//       }
      
//       const capacityMatch = chargerInfo?.Total_Capacity?.match(/(\d+(\.\d+)?)/);
//       if (capacityMatch) {
//         totalCapacity += parseFloat(capacityMatch[1]);
//       }
      
//       Object.values(statusData.connectors || {}).forEach(connector => {
//         totalConnectors++;
        
//         if (connector.status === "Available") {
//           availableConnectors++;
//         }
        
//         if (connector.status === "Charging") {
//           activeSessions++;
//         }
        
//         totalEnergy += connector.latest_transaction_consumption_kwh || 0;
//       });
//     });
    
//     const revenue = totalEnergy * 9.5;
//     const availability = totalConnectors > 0 
//       ? ((availableConnectors / totalConnectors) * 100).toFixed(1)
//       : "0";
    
//     const onlinePercentage = totalChargers > 0 
//       ? ((onlineChargers / totalChargers) * 100).toFixed(1)
//       : "0";

//     return {
//       totalChargers,
//       onlineChargers,
//       onlinePercentage: `${onlinePercentage}%`,
//       activeSessions,
//       totalEnergy: `${totalEnergy.toFixed(2)} kWh`,
//       revenue: `₹${revenue.toFixed(2)}`,
//       availability: `${availability}%`,
//       totalConnectors,
//       availableConnectors,
//       totalCapacity: `${totalCapacity.toFixed(1)} kW`,
//     };
//   };

//   // Handle charger deletion - Updated with better error handling
//   const handleDeleteCharger = async () => {
//     if (!chargerToDelete) return;
    
//     setIsDeleting(true);
//     setDeleteError(null);
//     setDeleteSuccess(false);
    
//     try {
//       const currentUserId = getUserID();
//       const currentAdminId = getAdminID();
      
//       if (!currentUserId && !currentAdminId) {
//         throw new Error("No user or admin ID found. Please login again.");
//       }
      
//       // Prepare request body according to API spec
//       const requestBody = {
//         charger_uid: chargerToDelete.uid,
//       };
      
//       // Add user_id or admin_id based on what's available
//       if (currentAdminId) {
//         requestBody.admin_id = currentAdminId;
//         console.log("Using admin authorization with admin_id:", currentAdminId);
//       } else {
//         requestBody.user_id = currentUserId;
//         console.log("Using user authorization with user_id:", currentUserId);
//       }
      
//       console.log("Deleting charger with body:", requestBody);
//       console.log("Using API key:", API_CONFIG.DELETE_API.API_KEY.substring(0, 20) + "...");
      
//       const response = await fetch(API_CONFIG.DELETE_API.BASE_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           [API_CONFIG.DELETE_API.KEY_HEADER]: API_CONFIG.DELETE_API.API_KEY,
//         },
//         body: JSON.stringify(requestBody),
//       });
      
//       const responseText = await response.text();
//       console.log("Delete API response status:", response.status);
//       console.log("Delete API response text:", responseText);
      
//       if (!response.ok) {
//         throw new Error(`Delete failed with status ${response.status}: ${responseText}`);
//       }
      
//       let result;
//       try {
//         result = JSON.parse(responseText);
//       } catch (e) {
//         result = { success: true, message: "Charger deleted successfully" };
//       }
      
//       console.log("Delete API response parsed:", result);
      
//       // Update the UI by removing the deleted charger
//       const updatedChargers = { ...chargersData };
//       delete updatedChargers[chargerToDelete.uid];
//       setChargersData(updatedChargers);
      
//       setDeleteSuccess(true);
      
//       // Close modal and refresh data after a short delay
//       setTimeout(() => {
//         setShowDeleteModal(false);
//         setChargerToDelete(null);
//         fetchAllChargersStatus(); // Refresh the data
//       }, 1500);
      
//     } catch (err) {
//       console.error("Error deleting charger:", err);
//       setDeleteError(err.message || "Failed to delete charger. Please try again.");
      
//       // If token is invalid, redirect to signin
//       if (err.message.includes("login") || err.message.includes("token")) {
//         setTimeout(() => {
//           navigate("/signin");
//         }, 2000);
//       }
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Open delete confirmation modal
//   const confirmDeleteCharger = (charger) => {
//     setChargerToDelete(charger);
//     setShowDeleteModal(true);
//     setDeleteError(null);
//     setDeleteSuccess(false);
//   };

//   const kpis = calculateKPIs();

//   useEffect(() => {
//     isMounted.current = true;
    
//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.error("No token found, redirecting to signin");
//       navigate("/signin");
//       return;
//     }
    
//     try {
//       const decoded = jwtDecode(token);
//       console.log("Dashboard - Decoded token:", decoded); // Debug log
      
//       // Set user name from token with multiple fallbacks
//       const firstName = decoded.firstname || decoded.firstName || decoded.name || decoded.userName || "User";
//       setUserName(firstName);
      
//       // Set user ID and admin ID
//       const currentUserId = decoded.userId || decoded.userid || decoded.id;
//       const currentAdminId = decoded.adminId || decoded.admin_id || decoded.adminid;
      
//       setUserId(currentUserId);
//       setAdminId(currentAdminId);
      
//       if (!currentUserId && !currentAdminId) {
//         console.error("No user ID or admin ID in token, redirecting to signin");
//         navigate("/signin");
//         return;
//       }
      
//     } catch (err) {
//       console.error("Invalid token:", err);
//       navigate("/signin");
//       return;
//     }

//     // Use a timeout to prevent double calls in development mode
//     const fetchTimeout = setTimeout(() => {
//       if (isMounted.current) {
//         fetchAllChargersStatus();
//       }
//     }, 100);

//     // Set up polling every 30 seconds
//     const intervalId = setInterval(() => {
//       if (isMounted.current && !fetchInProgress.current) {
//         fetchAllChargersStatus();
//       }
//     }, 30000);

//     return () => {
//       clearTimeout(fetchTimeout);
//       clearInterval(intervalId);
//       isMounted.current = false;
//       fetchInProgress.current = false;
//       // Clear all cached promises
//       statusFetchPromises.current = {};
//     };
//   }, [navigate]);

//   // Generate live power data from all chargers
//   const generateLivePowerData = () => {
//     const baseData = [
//       { time: "10:00", power: 1.2 },
//       { time: "11:00", power: 1.8 },
//       { time: "12:00", power: 2.4 },
//       { time: "13:00", power: 2.1 },
//       { time: "14:00", power: 2.9 },
//     ];
    
//     if (Object.keys(chargersData).length > 0) {
//       let totalPower = 0;
//       Object.values(chargersData).forEach(({ statusData }) => {
//         Object.values(statusData.connectors || {}).forEach(connector => {
//           if (connector.latest_meter_value !== null && connector.latest_meter_value !== undefined) {
//             totalPower += parseFloat(connector.latest_meter_value);
//           }
//         });
//       });
      
//       if (totalPower > 0) {
//         const now = new Date();
//         const currentTime = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
//         return [...baseData.slice(-4), { time: currentTime, power: parseFloat(totalPower.toFixed(2)) }];
//       }
//     }
    
//     return baseData;
//   };

//   const livePowerData = generateLivePowerData();

//   // Handle connector selection
//   const handleConnectorClick = (chargerId, connectorId, connectorData) => {
//     const chargerData = chargersData[chargerId];
//     setSelectedConnector({
//       chargerId,
//       connectorId,
//       ...connectorData,
//       charger_id: chargerId,
//       charger_status: chargerData?.statusData?.status,
//       online: chargerData?.statusData?.online,
//       latest_message_received_time: chargerData?.statusData?.latest_message_received_time,
//       chargerInfo: chargerData?.chargerInfo
//     });
//   };

//   const handleChargerAction = async (action, chargerId, connectorId) => {
//     console.log(`${action} for charger ${chargerId}, connector ${connectorId}`);
    
//     try {
//       console.log(`Action ${action} would be sent to API with headers including ${API_CONFIG.STATUS_API.KEY_HEADER}`);
      
//       // Refresh data after action
//       fetchAllChargersStatus();
      
//     } catch (err) {
//       console.error(`Error performing ${action}:`, err);
//     }
//   };

//   // Get connector status color
//   const getConnectorStatusColor = (status) => {
//     switch(status) {
//       case "Available": return "bg-green-500/20 text-green-400";
//       case "Charging": return "bg-blue-500/20 text-blue-400";
//       case "Unavailable": return "bg-red-500/20 text-red-400";
//       case "Preparing": 
//       case "Finishing": 
//         return "bg-yellow-500/20 text-yellow-400";
//       default: return "bg-gray-500/20 text-gray-400";
//     }
//   };

//   // Get charger status color
//   const getChargerStatusColor = (status) => {
//     switch(status) {
//       case "Active": return "bg-green-500/20 text-green-400";
//       case "Inactive": return "bg-gray-500/20 text-gray-400";
//       case "Faulted": return "bg-red-500/20 text-red-400";
//       default: return "bg-gray-500/20 text-gray-400";
//     }
//   };

//   // Get connector icon
//   const getConnectorIcon = (connectorId) => {
//     return connectorId === "0" ? <Plug size={20} /> : <PlugZap size={20} />;
//   };

//   // Get charger type icon
//   const getChargerTypeIcon = (type) => {
//     if (type?.includes("DC")) return <Zap className="text-blue-400" />;
//     if (type?.includes("AC")) return <Power className="text-green-400" />;
//     return <Plug className="text-gray-400" />;
//   };

//   // Format time
//   const formatTime = (timestamp) => {
//     if (!timestamp) return "Never";
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Get API status display
//   const getApiStatusDisplay = () => {
//     if (adminApiStatus === "active" && statusApiStatus === "active") {
//       return { text: "All APIs Active", color: "bg-green-500/20 text-green-400" };
//     }
//     if (adminApiStatus === "invalid" || statusApiStatus === "invalid") {
//       return { text: "API Auth Error", color: "bg-red-500/20 text-red-400" };
//     }
//     if (adminApiStatus === "error" || statusApiStatus === "error") {
//       return { text: "API Connection Error", color: "bg-yellow-500/20 text-yellow-400" };
//     }
//     return { text: "API Status Unknown", color: "bg-gray-500/20 text-gray-400" };
//   };

//   const apiStatus = getApiStatusDisplay();

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-200">
//         <Sidebar />

//         <div className="flex-1 p-6 space-y-6">
//           {/* TOP BAR */}
//           <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
//             <div>
//               <h1 className="text-2xl font-bold text-white">Welcome, {userName}</h1>
//               <p className="text-sm text-gray-400">Enterprise EV Charging Control Center</p>
//               <div className="flex items-center gap-2 mt-1">
//                 {lastUpdated && (
//                   <p className="text-xs text-gray-500">
//                     Last updated: {lastUpdated.toLocaleTimeString()}
//                   </p>
//                 )}
//                 <button 
//                   onClick={fetchAllChargersStatus} 
//                   className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
//                   disabled={loading || fetchInProgress.current}
//                 >
//                   <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> 
//                   {loading ? "Refreshing..." : "Refresh"}
//                 </button>
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex flex-col items-end">
//                 <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${apiStatus.color}`}>
//                   <Key size={12} />
//                   <span>{apiStatus.text}</span>
//                 </div>
//                 <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
//                   <UserIcon size={10} />
//                   {adminId ? (
//                     <>
//                       Admin ID: {adminId ? `${String(adminId).substring(0, 8)}...` : "Unknown"}
//                       <span className="ml-2 text-blue-400">• Admin Mode</span>
//                     </>
//                   ) : (
//                     <>
//                       User ID: {userId ? `${String(userId).substring(0, 8)}...` : "Unknown"}
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
//                 <Building size={12} />
//                 <span>{kpis.totalChargers} Stations</span>
//               </div>
//               <button
//                 onClick={() => setDarkMode(!darkMode)}
//                 className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700"
//                 title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
//               >
//                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
//               </button>
//               <div className="relative">
//                 <button className="p-2 hover:bg-gray-800 rounded-xl">
//                   <Bell />
//                 </button>
//                 {alerts.length > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-1.5 rounded-full">
//                     {alerts.length}
//                   </span>
//                 )}
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors flex items-center gap-2"
//                 title="Logout"
//               >
//                 <LogOut size={16} />
//                 <span className="text-sm">Logout</span>
//               </button>
//             </div>
//           </div>

//           {/* KPI SECTION */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
//             <Kpi 
//               title="Total Stations" 
//               value={kpis.totalChargers} 
//               icon={<Building />} 
//               color="from-blue-500 to-cyan-600" 
//             />
//             <Kpi 
//               title="Online Stations" 
//               value={kpis.onlineChargers} 
//               icon={<Wifi />} 
//               color="from-green-500 to-emerald-600" 
//             />
//             <Kpi 
//               title="Active Sessions" 
//               value={kpis.activeSessions} 
//               icon={<Activity />} 
//               color="from-purple-500 to-indigo-600" 
//             />
//             <Kpi 
//               title="Total Revenue" 
//               value={kpis.revenue} 
//               icon={<DollarSign />} 
//               color="from-yellow-500 to-orange-500" 
//             />
//           </div>

//           {/* CHARGERS LIST */}
//           <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <h2 className="text-lg font-semibold">Charging Stations</h2>
//                 <p className="text-sm text-gray-400">All stations with real-time status</p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                   kpis.onlineChargers === kpis.totalChargers ? "bg-green-500/20 text-green-400" : 
//                   kpis.onlineChargers > 0 ? "bg-yellow-500/20 text-yellow-400" : 
//                   "bg-red-500/20 text-red-400"
//                 }`}>
//                   {kpis.onlineChargers}/{kpis.totalChargers} Online
//                 </div>
//                 <div className="text-xs text-gray-400">
//                   Using 2 different API keys
//                 </div>
//               </div>
//             </div>
            
//             {loading ? (
//               <div className="flex flex-col items-center justify-center py-10">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
//                 <p className="text-gray-400">Loading charging stations...</p>
//                 <p className="text-xs text-gray-500 mt-2">Fetching data from multiple APIs...</p>
//               </div>
//             ) : error && Object.keys(chargersData).length === 0 ? (
//               <div className="text-center py-6">
//                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4">
//                   <AlertTriangle className="text-red-400" size={24} />
//                 </div>
//                 <p className="text-yellow-400 mb-2">{error}</p>
//                 <div className="text-xs text-gray-400 mb-3">
//                   {adminApiStatus !== "active" && <p>Admin API: {adminApiStatus}</p>}
//                   {statusApiStatus !== "active" && <p>Status API: {statusApiStatus}</p>}
//                 </div>
//                 <button 
//                   onClick={fetchAllChargersStatus}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
//                 >
//                   Retry Connection
//                 </button>
//               </div>
//             ) : Object.keys(chargersData).length === 0 ? (
//               <div className="text-center py-10 text-gray-400">
//                 <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
//                   <Plug size={24} />
//                 </div>
//                 <p>No charging stations found</p>
//                 <p className="text-sm mt-1">Add your first charging station to get started</p>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {Object.entries(chargersData).map(([chargerId, { chargerInfo, statusData, error: chargerError }]) => {
//                   const connectors = Object.entries(statusData?.connectors || {});
//                   const capacityMatch = chargerInfo?.Total_Capacity?.match(/(\d+(\.\d+)?)/);
//                   const capacity = capacityMatch ? capacityMatch[1] : "0";
                  
//                   return (
//                     <div
//                       key={chargerId}
//                       className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6 hover:shadow-2xl transition-all hover:border-gray-600 group"
//                     >
//                       {/* Charger Header */}
//                       <div className="flex items-center justify-between mb-6">
//                         <div className="flex items-center gap-4">
//                           <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
//                             {getChargerTypeIcon(chargerInfo?.Chargertype)}
//                           </div>
//                           <div>
//                             <h3 className="text-xl font-bold">{chargerInfo?.ChargerName || `Charger ${chargerId}`}</h3>
//                             <p className="text-sm text-gray-400">Station ID: {chargerId} • {capacity} kW</p>
//                             <p className="text-xs text-gray-500 mt-1">{chargerInfo?.full_address || "Address not available"}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getChargerStatusColor(statusData?.status)}`}>
//                             {statusData?.status || "Unknown"}
//                           </span>
//                           <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                             statusData?.online === "Online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
//                           }`}>
//                             {statusData?.online || "Offline"}
//                           </span>
//                           <button
//                             onClick={() => confirmDeleteCharger({uid: chargerId, ...chargerInfo})}
//                             className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
//                             title="Delete Charger"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </div>

//                       {/* Connectors Grid */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {connectors.length > 0 ? (
//                           connectors.map(([connectorId, connector]) => (
//                             <div
//                               key={connectorId}
//                               onClick={() => handleConnectorClick(chargerId, connectorId, connector)}
//                               className="cursor-pointer bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 group transition-all"
//                             >
//                               <div className="flex justify-between items-start mb-3">
//                                 <div className="flex items-center gap-3">
//                                   <div className="p-2 bg-gray-900 rounded-lg">
//                                     {getConnectorIcon(connectorId)}
//                                   </div>
//                                   <div>
//                                     <h4 className="font-semibold">Connector {parseInt(connectorId) + 1}</h4>
//                                     <p className="text-xs text-gray-400">Port {connectorId}</p>
//                                   </div>
//                                 </div>
//                                 <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConnectorStatusColor(connector.status)}`}>
//                                   {connector.status}
//                                 </span>
//                               </div>
                              
//                               <div className="grid grid-cols-2 gap-3">
//                                 <div className="bg-gray-900/50 p-2 rounded-lg">
//                                   <p className="text-xs text-gray-400">Power</p>
//                                   <p className="font-bold">
//                                     {connector.latest_meter_value ? `${connector.latest_meter_value} kW` : "0.0 kW"}
//                                   </p>
//                                 </div>
//                                 <div className="bg-gray-900/50 p-2 rounded-lg">
//                                   <p className="text-xs text-gray-400">Energy</p>
//                                   <p className="font-bold">
//                                     {connector.latest_transaction_consumption_kwh?.toFixed(2) || "0.00"} kWh
//                                   </p>
//                                 </div>
//                               </div>
                              
//                               {connector.error_code !== "NoError" && (
//                                 <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
//                                   <div className="flex items-center gap-2 text-red-400 text-xs">
//                                     <AlertTriangle size={12} />
//                                     {connector.error_code}
//                                   </div>
//                                 </div>
//                               )}
                              
//                               <div className="mt-3 pt-2 border-t border-gray-700">
//                                 <p className="text-xs text-gray-400">Click for details</p>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <div className="col-span-2 text-center py-6 text-gray-400">
//                             <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
//                               <Plug size={20} />
//                             </div>
//                             <p>No connector data available</p>
//                           </div>
//                         )}
//                       </div>
                      
//                       {chargerError && (
//                         <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
//                           <div className="flex items-center gap-2 text-red-400">
//                             <AlertTriangle size={14} />
//                             <span className="text-sm">{chargerError}</span>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* GRAPH + ALERTS */}
//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//             {/* Power Graph */}
//             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold">Live Power Consumption</h2>
//                 <div className="text-sm text-gray-400">
//                   Total: {livePowerData[livePowerData.length - 1]?.power || 0} kW
//                 </div>
//               </div>
//               <ResponsiveContainer width="100%" height={260}>
//                 <LineChart data={livePowerData}>
//                   <XAxis dataKey="time" stroke="#9CA3AF" />
//                   <YAxis stroke="#9CA3AF" />
//                   <Tooltip formatter={(value) => [`${value} kW`, "Power"]} />
//                   <Line 
//                     type="monotone" 
//                     dataKey="power" 
//                     stroke="#3B82F6" 
//                     strokeWidth={3}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Alerts */}
//             {alerts.length > 0 ? (
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
//                 <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <AlertTriangle className="text-red-400" /> System Alerts
//                 </h2>
//                 <ul className="space-y-3">
//                   {alerts.slice(0, 5).map((alert, i) => (
//                     <li key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm flex items-start gap-2">
//                       <span className="text-red-400 mt-0.5">⚠</span>
//                       <span>{alert}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ) : (
//               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
//                 <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <AlertTriangle className="text-green-400" /> System Status
//                 </h2>
//                 <div className="text-center py-8">
//                   <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
//                     <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   </div>
//                   <p className="text-gray-400">All systems operational</p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* STATS SECTION */}
//           <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
//             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <MapPin /> Stations Overview
//             </h2>
//             <div className="h-[300px] rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center text-gray-400 p-4">
//               {Object.keys(chargersData).length > 0 ? (
//                 <>
//                   <div className="text-center mb-6">
//                     <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
//                       <Wifi size={24} />
//                     </div>
//                     <h3 className="text-xl font-bold mb-2">{kpis.totalChargers} Charging Stations</h3>
//                     <p className={`text-sm ${kpis.onlineChargers > 0 ? "text-green-400" : "text-red-400"}`}>
//                       {kpis.onlineChargers} Online • {kpis.totalChargers - kpis.onlineChargers} Offline
//                     </p>
//                   </div>
//                   <div className="flex gap-6">
//                     <div className="text-center">
//                       <div className="text-2xl font-bold">{kpis.totalConnectors}</div>
//                       <div className="text-xs text-gray-400">Total Ports</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold">{kpis.availableConnectors}</div>
//                       <div className="text-xs text-gray-400">Available</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold">{kpis.activeSessions}</div>
//                       <div className="text-xs text-gray-400">Active</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold">{kpis.totalCapacity}</div>
//                       <div className="text-xs text-gray-400">Total kW</div>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center">
//                   <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
//                     <MapPin size={24} />
//                   </div>
//                   <p>Station locations visualization</p>
//                   <p className="text-sm mt-2">Add stations to see their locations</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* CONNECTOR DRAWER */}
//         {selectedConnector && (
//           <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
//             <div className="w-full sm:w-[450px] bg-gray-900 h-full p-6 space-y-6 overflow-y-auto">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-xl font-bold">Connector {parseInt(selectedConnector.connectorId) + 1}</h2>
//                   <p className="text-sm text-gray-400">
//                     {selectedConnector.chargerInfo?.ChargerName} • ID: {selectedConnector.charger_id}
//                   </p>
//                 </div>
//                 <button 
//                   onClick={() => setSelectedConnector(null)}
//                   className="p-2 hover:bg-gray-800 rounded-lg transition"
//                 >
//                   <X />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-gray-800/50 p-4 rounded-xl">
//                     <p className="text-sm text-gray-400">Connector Status</p>
//                     <p className={`text-lg font-semibold mt-1 ${getConnectorStatusColor(selectedConnector.status).replace('bg-', 'text-').split(' ')[0]}`}>
//                       {selectedConnector.status}
//                     </p>
//                   </div>
                  
//                   <div className="bg-gray-800/50 p-4 rounded-xl">
//                     <p className="text-sm text-gray-400">Charger Status</p>
//                     <p className={`text-lg font-semibold mt-1 ${
//                       selectedConnector.charger_status === "Active" ? "text-green-400" : 
//                       selectedConnector.charger_status === "Inactive" ? "text-gray-400" : 
//                       "text-red-400"
//                     }`}>
//                       {selectedConnector.charger_status}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="bg-gray-800/50 p-4 rounded-xl">
//                   <p className="text-sm text-gray-400">Connection</p>
//                   <p className={`text-lg font-semibold mt-1 ${
//                     selectedConnector.online === "Online" ? "text-green-400" : "text-red-400"
//                   }`}>
//                     {selectedConnector.online}
//                   </p>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-gray-800/50 p-4 rounded-xl">
//                     <p className="text-sm text-gray-400">Power Output</p>
//                     <p className="text-2xl font-bold mt-1">
//                       {selectedConnector.latest_meter_value !== null ? `${selectedConnector.latest_meter_value} kW` : "0.0 kW"}
//                     </p>
//                   </div>
                  
//                   <div className="bg-gray-800/50 p-4 rounded-xl">
//                     <p className="text-sm text-gray-400">Energy Consumed</p>
//                     <p className="text-2xl font-bold mt-1">
//                       {selectedConnector.latest_transaction_consumption_kwh?.toFixed(2) || "0.00"} kWh
//                     </p>
//                   </div>
//                 </div>
                
//                 {selectedConnector.error_code !== "NoError" && (
//                   <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
//                     <div className="flex items-center gap-2 text-red-400">
//                       <AlertTriangle size={18} />
//                       <p className="font-semibold">Error Detected</p>
//                     </div>
//                     <p className="text-sm mt-1">Code: {selectedConnector.error_code}</p>
//                   </div>
//                 )}
                
//                 {selectedConnector.latest_transaction_id && (
//                   <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
//                     <p className="text-sm text-gray-400">Last Transaction ID</p>
//                     <p className="text-sm font-mono mt-1">{selectedConnector.latest_transaction_id}</p>
//                   </div>
//                 )}
                
//                 <div className="bg-gray-800/50 p-4 rounded-xl">
//                   <p className="text-sm text-gray-400">Charger Info</p>
//                   <p className="text-sm mt-1">{selectedConnector.chargerInfo?.ChargerName}</p>
//                   <p className="text-xs text-gray-400 mt-1">{selectedConnector.chargerInfo?.full_address}</p>
//                 </div>
                
//                 <div className="bg-gray-800/50 p-4 rounded-xl">
//                   <p className="text-sm text-gray-400">Last Message Received</p>
//                   <p className="text-sm mt-1">
//                     {selectedConnector.latest_message_received_time 
//                       ? new Date(selectedConnector.latest_message_received_time).toLocaleString()
//                       : "No data available"}
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-3 pt-4 border-t border-gray-700">
//                 <button 
//                   onClick={() => handleChargerAction('start', selectedConnector.charger_id, selectedConnector.connectorId)}
//                   className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={selectedConnector.status !== "Available" || selectedConnector.online !== "Online"}
//                 >
//                   Start Charging Session
//                 </button>
//                 <button 
//                   onClick={() => handleChargerAction('stop', selectedConnector.charger_id, selectedConnector.connectorId)}
//                   className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={selectedConnector.status !== "Charging"}
//                 >
//                   Stop Charging Session
//                 </button>
//                 <button 
//                   onClick={() => handleChargerAction('reset', selectedConnector.charger_id, selectedConnector.connectorId)}
//                   className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold transition-all"
//                 >
//                   Reset Connector
//                 </button>
//                 <div className="text-xs text-gray-500 text-center pt-2">
//                   Actions use {API_CONFIG.STATUS_API.KEY_HEADER} authentication
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* DELETE CHARGER MODAL */}
//         {showDeleteModal && (
//           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-bold text-white">Delete Charger</h2>
//                 <button
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setChargerToDelete(null);
//                     setDeleteError(null);
//                   }}
//                   className="p-2 hover:bg-gray-800 rounded-lg transition"
//                   disabled={isDeleting}
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               {deleteSuccess ? (
//                 <div className="text-center py-6">
//                   <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
//                     <CheckCircle className="text-green-400" size={32} />
//                   </div>
//                   <h3 className="text-lg font-semibold text-green-400 mb-2">Charger Deleted Successfully</h3>
//                   <p className="text-gray-400">
//                     {chargerToDelete?.ChargerName || `Charger ${chargerToDelete?.uid}`} has been removed.
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="mb-6">
//                     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4 mx-auto">
//                       <AlertTriangle className="text-red-400" size={24} />
//                     </div>
//                     <h3 className="text-lg font-semibold text-center mb-2">Confirm Deletion</h3>
//                     <p className="text-gray-400 text-center mb-4">
//                       Are you sure you want to delete <span className="font-semibold text-white">{chargerToDelete?.ChargerName || `Charger ${chargerToDelete?.uid}`}</span>?
//                     </p>
//                     <div className="bg-gray-800/50 p-4 rounded-xl mb-4">
//                       <p className="text-sm text-gray-400">Charger Details:</p>
//                       <p className="text-sm mt-1">ID: {chargerToDelete?.uid}</p>
//                       {chargerToDelete?.Total_Capacity && (
//                         <p className="text-sm">Capacity: {chargerToDelete.Total_Capacity}</p>
//                       )}
//                       {chargerToDelete?.Chargertype && (
//                         <p className="text-sm">Type: {chargerToDelete.Chargertype}</p>
//                       )}
//                     </div>
//                     <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
//                       <p className="text-sm text-yellow-400 flex items-center gap-2">
//                         <AlertTriangle size={14} />
//                         This action cannot be undone. All charging data will be lost.
//                       </p>
//                     </div>
//                   </div>

//                   {deleteError && (
//                     <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
//                       <p className="text-sm text-red-400">{deleteError}</p>
//                     </div>
//                   )}

//                   <div className="flex gap-3">
//                     <button
//                       onClick={() => {
//                         setShowDeleteModal(false);
//                         setChargerToDelete(null);
//                         setDeleteError(null);
//                       }}
//                       className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 font-semibold transition-all disabled:opacity-50"
//                       disabled={isDeleting}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleDeleteCharger}
//                       className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={isDeleting}
//                     >
//                       {isDeleting ? (
//                         <div className="flex items-center justify-center gap-2">
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                           Deleting...
//                         </div>
//                       ) : (
//                         "Delete Charger"
//                       )}
//                     </button>
//                   </div>

//                   <div className="mt-4 text-xs text-gray-500 text-center">
//                     <p>Using {API_CONFIG.DELETE_API.KEY_HEADER} authentication</p>
//                     <p className="mt-1">
//                       Authorization: {adminId ? `admin_id: ${String(adminId).substring(0, 8)}...` : `user_id: ${String(userId).substring(0, 8)}...`}
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const Kpi = ({ title, value, icon, color }) => (
//   <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-xl hover:scale-[1.03] transition-all duration-300`}>
//     <div className="flex justify-between items-center">
//       <p className="text-sm opacity-90">{title}</p>
//       {icon}
//     </div>
//     <h2 className="text-3xl font-bold mt-2">{value}</h2>
//   </div>
// );

// export default Dashboard;


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
import Sidebar from "../Sidebar/Sidebar";

// ==================== TOKEN REFRESH FUNCTIONS ====================
const API_CONFIG = {
  USER_INFO_API: {
    BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/me'
  },
  LOGOUT_API: {
    BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/logout'
  },
  REFRESH_TOKEN_API: {
    BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/refresh'
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.log('No refresh token found');
    return { success: false, error: 'No refresh token available' };
  }

  try {
    const response = await fetch(API_CONFIG.REFRESH_TOKEN_API.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await response.json();
    console.log('Refresh token response:', data);

    if (response.ok && data.access_token) {
      localStorage.setItem('token', data.access_token);
      
      if (data.expires_in) {
        localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));
      }
      
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return { success: true, token: data.access_token };
    } else {
      console.log('Refresh token failed:', data);
      return { success: false, error: data.message || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

// Check if token is expired or near expiry
const isTokenExpired = (bufferTime = 5 * 60 * 1000) => {
  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('token_expiry');
  
  if (!token) {
    return true;
  }

  // If no expiry time is stored, assume token is valid (it was just created)
  if (!expiry) {
    return false;
  }

  const currentTime = Date.now();
  const expiryTime = parseInt(expiry);
  
  // If expiry time is not a valid number, assume token is valid
  if (isNaN(expiryTime)) {
    return false;
  }
  
  return (expiryTime - currentTime) < bufferTime;
};

// Get valid token, refresh if necessary
const getValidToken = async (bufferTime = 5 * 60 * 1000) => {
  // Check if token exists
  const token = localStorage.getItem('token');
  if (!token) {
    return { success: false, error: 'No token found' };
  }

  // Check if token is expired
  if (!isTokenExpired(bufferTime)) {
    return { success: true, token: token };
  }

  console.log('Token expired or near expiry, attempting to refresh...');
  const result = await refreshAccessToken();
  
  if (result.success) {
    return result;
  }

  // Only clear tokens and redirect if refresh actually failed
  console.log('Refresh failed, clearing tokens...');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('userInfo');
  
  return { success: false, error: 'Session expired. Please login again.' };
};

// API wrapper with token refresh
const fetchWithTokenRefresh = async (url, options = {}, retryCount = 1) => {
  const tokenResult = await getValidToken();
  
  if (!tokenResult.success) {
    // Don't redirect here, let the caller handle it
    throw new Error('Session expired. Please login again.');
  }

  const token = tokenResult.token;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  // If unauthorized and we have retries left, try refreshing token and retry
  if (response.status === 401 && retryCount > 0) {
    console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
    
    const refreshResult = await refreshAccessToken();
    
    if (refreshResult.success) {
      return fetchWithTokenRefresh(url, options, retryCount - 1);
    } else {
      // Refresh failed, clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('userInfo');
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
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
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
  
  // User info states
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  // Dummy charger data
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

  // Fetch user info from API with token refresh
  const fetchUserInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/signin');
      return;
    }

    setLoadingUser(true);
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API.BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

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
        
        localStorage.setItem('userInfo', JSON.stringify({
          name,
          email,
          role,
          avatar,
          ...data
        }));
      } else if (response.status === 401) {
        console.log('Unauthorized, trying to refresh token...');
        const refreshResult = await refreshAccessToken();
        if (refreshResult.success) {
          console.log('Token refreshed, retrying fetch...');
          await fetchUserInfo();
          return;
        } else {
          console.log('Refresh failed, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_expiry');
          localStorage.removeItem('userInfo');
          navigate('/signin');
        }
      } else {
        console.log('Failed to fetch user info:', response.status);
        // Try to get from localStorage fallback
        const storedInfo = localStorage.getItem('userInfo');
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo);
          setUserName(parsedInfo.name || 'User');
          setUserEmail(parsedInfo.email || '');
          setUserRole(parsedInfo.role || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Check if error is due to session expiry
      if (error.message && error.message.includes('Session expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('userInfo');
        navigate('/signin');
      } else {
        // Try to get from localStorage fallback
        const storedInfo = localStorage.getItem('userInfo');
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo);
          setUserName(parsedInfo.name || 'User');
          setUserEmail(parsedInfo.email || '');
          setUserRole(parsedInfo.role || '');
        }
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(API_CONFIG.LOGOUT_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Logout successful');
      } else {
        console.log('Logout API response:', await response.text());
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('userInfo');
      navigate('/signin');
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    console.log('Refreshing dashboard...');
    setRefreshKey(prev => prev + 1);
    fetchUserInfo();
  };

  // Fetch user info on mount
  useEffect(() => {
    // Check if token exists before fetching
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    let intervalId = null;
    
    if (autoRefresh) {
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
  }, [autoRefresh]);

  // Token refresh timer - only run if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const tokenCheckInterval = setInterval(async () => {
      // Only check if token might be expired
      if (isTokenExpired(10 * 60 * 1000)) {
        console.log('Token near expiry, refreshing...');
        const result = await refreshAccessToken();
        if (!result.success) {
          console.log('Token refresh failed, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_expiry');
          localStorage.removeItem('userInfo');
          navigate('/signin');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);

  // Filter chargers
  const filteredChargers = dummyChargers.filter((charger) => {
    const matchesSearch = charger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNetwork = selectedNetwork === "All Network" || 
                          (selectedNetwork === "Online" && charger.online) ||
                          (selectedNetwork === "Offline" && !charger.online);
    const matchesHub = selectedHub === "All Hubs" || charger.hub === selectedHub;
    
    let matchesConnectorStatus = true;
    if (connectorFilter === "Busy") {
      matchesConnectorStatus = charger.busy > 0;
    } else if (connectorFilter === "Available") {
      matchesConnectorStatus = charger.available > 0;
    } else if (connectorFilter === "Error") {
      matchesConnectorStatus = charger.error > 0;
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

  // Calendar popup
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

  // Customize popup - Slide from right
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
  const totalConnectors = filteredChargers.reduce((sum, c) => sum + c.connectors, 0);
  const totalAvailable = filteredChargers.reduce((sum, c) => sum + c.available, 0);
  const totalBusy = filteredChargers.reduce((sum, c) => sum + c.busy, 0);
  const totalError = filteredChargers.reduce((sum, c) => sum + c.error, 0);
  const nonConfigured = 1;

  const handleConnectorStatusClick = (status) => {
    setConnectorFilter(status);
  };

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
              value="₹ 0.00"
              subValue="₹ 0.00"
              percentage="0%"
              icon={<Wallet size={18} className="text-green-600" />}
              color="bg-green-100"
              noData={true}
            />
            <KpiCard
              title="No of Sessions"
              value="0"
              percentage="0%"
              icon={<Activity size={18} className="text-blue-600" />}
              color="bg-blue-100"
              noData={true}
            />
            <KpiCard
              title="Usage"
              value="0.00 Wh"
              percentage="0%"
              icon={<Zap size={18} className="text-yellow-600" />}
              color="bg-yellow-100"
              noData={true}
            />
            <KpiCard
              title="Online Percentage/Charger"
              value="0%"
              percentage="0%"
              icon={<Wifi size={18} className="text-purple-600" />}
              color="bg-purple-100"
              noData={true}
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
                Online: {dummyChargers.filter(c => c.online).length}
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
          </div></div>

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
                {filteredChargers.length === 0 ? (
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
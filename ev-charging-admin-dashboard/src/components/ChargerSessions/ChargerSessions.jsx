import React, { useEffect, useState, useRef } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import BuildIcon from "@mui/icons-material/Build";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Sidebar from "../Sidebar/Sidebar";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ChargerList = () => {
  const [chargers, setChargers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusLoading, setStatusLoading] = useState({});
  
  // Refs to track mounted state and prevent duplicate API calls
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);
  const statusFetchPromises = useRef({});

  // Get admin ID from token
  const getAdminIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }
      
      const decoded = jwtDecode(token);
      return decoded.adminid || decoded.adminId || decoded.userid || decoded.userId || decoded.id || decoded.user_id || "5mrv";
    } catch (err) {
      console.error("Error decoding token:", err);
      return "5mrv";
    }
  };

  // Fetch charger status from API
  const fetchChargerStatus = async (chargerId) => {
    // Return cached promise if already fetching
    if (statusFetchPromises.current[chargerId]) {
      return statusFetchPromises.current[chargerId];
    }

    const fetchPromise = (async () => {
      try {
        setStatusLoading(prev => ({ ...prev, [chargerId]: true }));
        
        const STATUS_API_URL = "https://api.ocpphal.transev.site/api/status";
        const STATUS_API_KEY = "J9YtyNYdbLD8N4qMwU2WQrr9XV2SJn4Q3qrCLEcHa8wwaZC34xhAd3RotuYdHwiB";
        
        console.log(`Fetching status for charger: ${chargerId}`);
        
        const response = await axios.post(
          STATUS_API_URL,
          { uid: chargerId },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": STATUS_API_KEY,
            },
            timeout: 5000,
          }
        );

        console.log(`Status API response for ${chargerId}:`, response.data);
        return response.data;
      } catch (err) {
        console.error(`Error fetching status for charger ${chargerId}:`, err);
        
        if (err.response) {
          console.error(`Status API error ${err.response.status}:`, err.response.data);
          
          if (err.response.status === 401) {
            return { error: "api_key_error" };
          }
          
          if (err.response.status === 404) {
            return { error: "not_found", charger_id: chargerId };
          }
        }
        
        return { error: "request_failed", charger_id: chargerId };
      } finally {
        setStatusLoading(prev => ({ ...prev, [chargerId]: false }));
      }
    })();

    // Store the promise in cache
    statusFetchPromises.current[chargerId] = fetchPromise;
    
    // Clean up promise from cache after completion
    fetchPromise.finally(() => {
      delete statusFetchPromises.current[chargerId];
    });
    
    return fetchPromise;
  };

  // Extract online/offline status from API response
  const extractOnlineStatus = (statusData) => {
    if (!statusData) return "offline";
    
    if (statusData.error) {
      return statusData.error === "api_key_error" ? "api_error" : "offline";
    }
    
    if (statusData.online) {
      return statusData.online.toLowerCase() === "online" ? "online" : "offline";
    }
    
    if (statusData.connectors && typeof statusData.connectors === 'object') {
      const connectorStatuses = Object.values(statusData.connectors).map(conn => conn?.status);
      const hasAvailableConnectors = connectorStatuses.some(status => 
        status?.toLowerCase().includes("available")
      );
      return hasAvailableConnectors ? "online" : "offline";
    }
    
    return "offline";
  };

  // Extract charger status from API response
  const extractChargerStatus = (statusData) => {
    if (!statusData) return "unknown";
    
    if (statusData.error) {
      return statusData.error;
    }
    
    if (statusData.status) {
      const status = statusData.status.toLowerCase();
      
      if (status.includes("active") || status.includes("available") || status.includes("ready")) {
        return "available";
      } else if (status.includes("charging") || status.includes("busy") || status.includes("occupied")) {
        return "busy";
      } else if (status.includes("inactive") || status.includes("offline") || status.includes("maintenance")) {
        return "maintenance";
      } else if (status.includes("error") || status.includes("fault") || status.includes("unavailable")) {
        return "error";
      }
    }
    
    if (statusData.connectors && typeof statusData.connectors === 'object') {
      const connectorStatuses = Object.values(statusData.connectors).map(conn => conn?.status);
      
      if (connectorStatuses.some(status => 
        status?.toLowerCase().includes("charging") || 
        status?.toLowerCase().includes("busy") ||
        status?.toLowerCase().includes("occupied")
      )) {
        return "busy";
      }
      
      if (connectorStatuses.some(status => 
        status?.toLowerCase().includes("available") || 
        status?.toLowerCase().includes("ready")
      )) {
        return "available";
      }
      
      if (connectorStatuses.some(status => 
        status?.toLowerCase().includes("error") || 
        status?.toLowerCase().includes("fault") ||
        status?.toLowerCase().includes("unavailable")
      )) {
        return "error";
      }
    }
    
    return "unknown";
  };

  // Get latest message time
  const getLastOnlineTime = (statusData) => {
    if (!statusData) return null;
    
    if (statusData.latest_message_received_time) {
      return statusData.latest_message_received_time;
    }
    
    return null;
  };

  // Get connector details
  const getConnectorDetails = (statusData) => {
    if (!statusData || !statusData.connectors) return { available: 0, total: 0 };
    
    const connectors = Object.values(statusData.connectors);
    const availableConnectors = connectors.filter(conn => 
      conn?.status?.toLowerCase().includes("available")
    ).length;
    
    return {
      available: availableConnectors,
      total: connectors.length
    };
  };

  // Fetch all charger statuses with controlled concurrency
  const fetchAllChargerStatuses = async (chargerList) => {
    // Limit concurrent requests to 3 at a time
    const CONCURRENT_LIMIT = 3;
    const results = new Array(chargerList.length).fill(null);
    
    const processBatch = async (startIdx, batchSize) => {
      const batchPromises = [];
      for (let i = startIdx; i < Math.min(startIdx + batchSize, chargerList.length); i++) {
        const charger = chargerList[i];
        batchPromises.push(
          fetchChargerStatus(charger.uid)
            .then(statusData => ({ index: i, uid: charger.uid, statusData }))
            .catch(err => ({ index: i, uid: charger.uid, statusData: null, error: err }))
        );
      }
      return Promise.all(batchPromises);
    };
    
    // Process in batches
    for (let i = 0; i < chargerList.length; i += CONCURRENT_LIMIT) {
      const batchResults = await processBatch(i, CONCURRENT_LIMIT);
      batchResults.forEach(result => {
        if (result.statusData) {
          results[result.index] = result;
        }
      });
    }
    
    // Update chargers with their statuses
    const updatedChargers = chargerList.map((charger, index) => {
      const result = results[index];
      let statusData = null;
      
      if (result && result.statusData) {
        statusData = result.statusData;
      }
      
      const onlineStatus = extractOnlineStatus(statusData);
      const chargerStatus = extractChargerStatus(statusData);
      const lastOnlineTime = getLastOnlineTime(statusData);
      const connectorDetails = getConnectorDetails(statusData);
      
      let chargerType = "DC";
      if (charger.Chargertype?.toLowerCase().includes("ac")) {
        chargerType = "AC";
      }
      
      let capacity = parseInt(charger.Total_Capacity) || parseInt(charger.connector_total_capacity) || 0;
      
      return {
        ...charger,
        status: chargerStatus,
        onlineStatus: onlineStatus,
        chargerType: chargerType,
        capacity: capacity,
        protocol: "OCPP 1.6",
        firmware: "v2.1.4",
        lastOnline: lastOnlineTime || charger.createdAt,
        uptime: "98%",
        statusData: statusData,
        availableConnectors: connectorDetails.available,
        totalConnectors: connectorDetails.total || charger.number_of_connectors
      };
    });
    
    return updatedChargers;
  };

  // Fetch chargers from API
  const fetchChargers = async () => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping...");
      return;
    }
    
    fetchInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const adminId = getAdminIdFromToken();
      console.log("Admin ID from token:", adminId);

      const API_KEY = "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru";
      const API_URL = "https://be.cms.ocpp.transev.site/admin/getchargersforadminuid";
      
      console.log("Making API request to:", API_URL);
      
      const payload = { adminuid: adminId };
      console.log("Request payload:", payload);

      const response = await axios.post(
        API_URL,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "apiauthkey": API_KEY,
          },
          timeout: 10000,
        }
      );

      console.log("API Response received");

      if (response.data && response.data.user_chargerunit_details) {
        const chargerData = response.data.user_chargerunit_details;
        const userData = response.data.userdetails;
        
        console.log(`Fetched ${chargerData.length} chargers`);
        
        // Fetch status for all chargers
        const chargersWithStatus = await fetchAllChargerStatuses(chargerData);
        
        if (isMounted.current) {
          setChargers(chargersWithStatus);
          setUserDetails(userData);
        }
      } else {
        throw new Error("Invalid API response structure");
      }

    } catch (err) {
      console.error("Error fetching chargers:", err);
      
      if (isMounted.current) {
        if (err.response) {
          setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else if (err.request) {
          setError("No response from server. Please check your connection.");
        } else {
          setError(`Request failed: ${err.message}`);
        }
        
        // Load demo data matching the API structure
        loadDemoChargers();
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      fetchInProgress.current = false;
    }
  };

  // Load demo chargers matching API structure
  const loadDemoChargers = async () => {
    console.log("Loading demo charger data...");
    const demoChargers = [
      {
        uid: "5t7env",
        Chargerserialnum: "240100337",
        ChargerName: "Transev 60kwh",
        Chargerhost: "transev",
        Segment: "public",
        Subsegment: "parking",
        Total_Capacity: "60kwh",
        Chargertype: "DC charger - fast",
        parking: "yes",
        number_of_connectors: "2",
        Connector_type: "CCS2",
        connector_total_capacity: "60kwh",
        lattitude: "22.5771494",
        longitute: "88.4867072",
        full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
        charger_use_type: "charging",
        twenty_four_seven_open_status: "yes",
        userId: "5mrv",
        createdAt: "2025-06-27T11:04:25.880Z",
        firstname: "Rajrup",
        phonenumber: "9836487998",
        chargerType: "DC",
        capacity: 60,
        protocol: "OCPP 1.6",
        firmware: "v2.1.4",
        uptime: "98%"
      },
      {
        uid: "5bvyd1",
        Chargerserialnum: "240100327",
        ChargerName: "Benny 7.4kwh",
        Chargerhost: "transev",
        Segment: "public",
        Subsegment: "parking",
        Total_Capacity: "7.4kwh",
        Chargertype: "Ac charger - fast",
        parking: "yes",
        number_of_connectors: "1",
        Connector_type: "CCS2",
        connector_total_capacity: "7.4kwh",
        lattitude: "22.5771494",
        longitute: "88.4867072",
        full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
        charger_use_type: "charging",
        twenty_four_seven_open_status: "yes",
        userId: "5mrv",
        createdAt: "2025-06-25T04:56:22.594Z",
        firstname: "Rajrup",
        phonenumber: "9836487998",
        chargerType: "AC",
        capacity: 7.4,
        protocol: "OCPP 1.6",
        firmware: "v1.8.2",
        uptime: "95%"
      },
      {
        uid: "wdmjwx",
        Chargerserialnum: "2401003290",
        ChargerName: "Transev 60kwh second",
        Chargerhost: "transev",
        Segment: "public",
        Subsegment: "parking",
        Total_Capacity: "60kwh",
        Chargertype: "DC charger - fast",
        parking: "yes",
        number_of_connectors: "2",
        Connector_type: "CCS2",
        connector_total_capacity: "60kwh",
        lattitude: "22.5771494",
        longitute: "88.4867072",
        full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
        charger_use_type: "charging",
        twenty_four_seven_open_status: "yes",
        userId: "5mrv",
        createdAt: "2025-06-27T11:05:10.332Z",
        firstname: "Rajrup",
        phonenumber: "9836487998",
        chargerType: "DC",
        capacity: 60,
        protocol: "OCPP 2.0",
        firmware: "v3.0.1",
        uptime: "92%"
      },
    ];
    
    // Fetch real statuses for demo chargers
    const chargersWithStatus = await fetchAllChargerStatuses(demoChargers);
    
    if (isMounted.current) {
      setChargers(chargersWithStatus);
      setUserDetails({
        uid: "999z",
        firstname: "Rajrup",
        lastname: "Das",
        email: "transmogrify17@outlook.com",
        role: "superadmin"
      });
      console.log(`Demo data loaded: ${chargersWithStatus.length} chargers`);
    }
  };

  // Function to refresh a single charger's status
  const refreshChargerStatus = async (chargerId) => {
    try {
      const statusData = await fetchChargerStatus(chargerId);
      const onlineStatus = extractOnlineStatus(statusData);
      const chargerStatus = extractChargerStatus(statusData);
      const lastOnlineTime = getLastOnlineTime(statusData);
      const connectorDetails = getConnectorDetails(statusData);
      
      setChargers(prevChargers => 
        prevChargers.map(charger => 
          charger.uid === chargerId 
            ? { 
                ...charger, 
                status: chargerStatus,
                onlineStatus: onlineStatus,
                lastOnline: lastOnlineTime || charger.lastOnline,
                statusData: statusData,
                availableConnectors: connectorDetails.available,
                totalConnectors: connectorDetails.total || charger.number_of_connectors
              }
            : charger
        )
      );
      
      return { chargerStatus, onlineStatus };
    } catch (err) {
      console.error(`Error refreshing status for charger ${chargerId}:`, err);
      return { chargerStatus: "error", onlineStatus: "offline" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) {
        return "Just now";
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (err) {
      return dateString;
    }
  };

  // Get status color and icon
  const getStatusInfo = (status, onlineStatus) => {
    if (onlineStatus === "offline") {
      return {
        color: 'text-gray-400',
        bg: 'bg-gray-400/10',
        icon: <ErrorIcon fontSize="small" />,
        text: 'Offline'
      };
    }
    
    if (onlineStatus === "api_error") {
      return {
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        icon: <WarningIcon fontSize="small" />,
        text: 'API Error'
      };
    }
    
    switch (status?.toLowerCase()) {
      case 'available':
        return {
          color: 'text-green-400',
          bg: 'bg-green-400/10',
          icon: <CheckCircleIcon fontSize="small" />,
          text: 'Available'
        };
      case 'busy':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10',
          icon: <FlashOnIcon fontSize="small" />,
          text: 'Busy'
        };
      case 'maintenance':
        return {
          color: 'text-orange-400',
          bg: 'bg-orange-400/10',
          icon: <BuildIcon fontSize="small" />,
          text: 'Maintenance'
        };
      case 'error':
        return {
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          icon: <ErrorIcon fontSize="small" />,
          text: 'Error'
        };
      case 'unknown':
        return {
          color: 'text-gray-400',
          bg: 'bg-gray-400/10',
          icon: <WarningIcon fontSize="small" />,
          text: 'Unknown'
        };
      default:
        return {
          color: 'text-gray-400',
          bg: 'bg-gray-400/10',
          icon: <WarningIcon fontSize="small" />,
          text: status || 'Unknown'
        };
    }
  };

  // Get charger type color
  const getChargerTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'dc':
        return 'text-blue-400 bg-blue-400/10';
      case 'ac':
        return 'text-purple-400 bg-purple-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Get online status indicator
  const getOnlineIndicator = (onlineStatus) => {
    switch (onlineStatus) {
      case 'online':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400 text-xs">Online</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-gray-400 text-xs">Offline</span>
          </div>
        );
      case 'api_error':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-red-400 text-xs">API Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-gray-400 text-xs">Unknown</span>
          </div>
        );
    }
  };

  // Calculate statistics
  const totalConnectors = chargers.reduce(
    (sum, c) => sum + (parseInt(c.totalConnectors) || parseInt(c.number_of_connectors) || 0),
    0
  );
  
  const totalCapacity = chargers.reduce(
    (sum, c) => sum + (parseFloat(c.Total_Capacity) || parseFloat(c.connector_total_capacity) || 0),
    0
  );
  
  const onlineChargers = chargers.filter(c => c.onlineStatus === 'online').length;
  const availableChargers = chargers.filter(c => c.status === 'available' && c.onlineStatus === 'online').length;
  const dcChargers = chargers.filter(c => c.chargerType === 'DC').length;

  // Filter chargers
  const filteredChargers = chargers.filter(charger => {
    if (statusFilter !== "All" && charger.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    
    if (typeFilter !== "All" && charger.chargerType?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (charger.uid && charger.uid.toLowerCase().includes(query)) ||
        (charger.ChargerName && charger.ChargerName.toLowerCase().includes(query)) ||
        (charger.Chargerserialnum && charger.Chargerserialnum.toLowerCase().includes(query)) ||
        (charger.Chargerhost && charger.Chargerhost.toLowerCase().includes(query)) ||
        (charger.firstname && charger.firstname.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Handle refresh
  const handleRefresh = () => {
    fetchChargers();
  };

  // Handle refresh for a single charger
  const handleRefreshCharger = async (chargerId) => {
    await refreshChargerStatus(chargerId);
  };

  useEffect(() => {
    console.log("ChargerList component mounted");
    isMounted.current = true;
    
    // Use a flag to prevent duplicate calls in development
    const fetchTimeout = setTimeout(() => {
      fetchChargers();
    }, 100);
    
    return () => {
      console.log("ChargerList component unmounting");
      isMounted.current = false;
      fetchInProgress.current = false;
      clearTimeout(fetchTimeout);
      
      // Clear all status fetch promises
      statusFetchPromises.current = {};
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* PAGE HEADER */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* LEFT */}
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Charger Management
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Manage all EV charging stations and monitor real-time status
              </p>
              
              <div className="flex items-center gap-4 mt-3 text-sm">
                {userDetails && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-400">
                      Logged in under <span className="text-white font-medium">{userDetails.firstname} {userDetails.lastname}</span>
                      <span className="text-blue-400 ml-2">({userDetails.role})</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing..." : "Refresh All"}
              </button>
              
              <Link to="/add-charger">
                <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-medium shadow-md flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Charger
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Chargers</p>
            <p className="text-2xl font-bold text-white">{chargers.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {onlineChargers} online • {dcChargers} DC • {chargers.length - dcChargers} AC
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Connectors</p>
            <p className="text-2xl font-bold text-white">{totalConnectors}</p>
            <p className="text-xs text-gray-400 mt-1">
              {chargers.reduce((sum, c) => sum + (c.availableConnectors || 0), 0)} available
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Capacity</p>
            <p className="text-2xl font-bold text-white">{totalCapacity.toFixed(1)} kW</p>
            <p className="text-xs text-gray-400 mt-1">
              Combined charging power
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Network Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${onlineChargers > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <p className={`text-2xl font-bold ${onlineChargers > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {onlineChargers > 0 ? 'Online' : 'Offline'}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {onlineChargers} of {chargers.length} chargers online
            </p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-4 items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <select 
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status ({chargers.length})</option>
            <option value="Available">Available ({chargers.filter(c => c.status === 'available').length})</option>
            <option value="Busy">Busy ({chargers.filter(c => c.status === 'busy').length})</option>
            <option value="Maintenance">Maintenance ({chargers.filter(c => c.status === 'maintenance').length})</option>
            <option value="Error">Error ({chargers.filter(c => c.status === 'error').length})</option>
            <option value="Unknown">Unknown ({chargers.filter(c => c.status === 'unknown').length})</option>
          </select>

          <select 
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="DC">DC Fast Chargers ({chargers.filter(c => c.chargerType === 'DC').length})</option>
            <option value="AC">AC Chargers ({chargers.filter(c => c.chargerType === 'AC').length})</option>
          </select>

          <button className="p-2 rounded-xl bg-[#111827] border border-white/10 hover:bg-white/10 transition">
            <FilterListIcon />
          </button>

          <div className="relative ml-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by ID, name, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111827] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-400">Loading charger data...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-3">
                <ErrorIcon className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 mb-2">{error}</p>
              <p className="text-sm text-gray-400 mb-4">Showing demo data for reference</p>
              <button
                onClick={fetchChargers}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredChargers.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
                <SearchIcon className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-white mb-2">No chargers found</p>
              <p className="text-sm text-gray-400">
                {searchQuery || statusFilter !== "All" || typeFilter !== "All"
                  ? "Try adjusting your filters or search terms" 
                  : "No chargers are registered yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr className="text-gray-400 uppercase text-xs">
                    <th className="px-4 py-4 text-left whitespace-nowrap">Charger ID</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Status</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Serial No.</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Charger Name</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Type</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Capacity</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Connectors</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Host</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Location</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Last Online</th>
                    <th className="px-4 py-4 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredChargers.map((charger) => {
                    const statusInfo = getStatusInfo(charger.status, charger.onlineStatus);
                    const typeColor = getChargerTypeColor(charger.chargerType);
                    
                    return (
                      <tr key={charger.uid} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm">{charger.uid}</div>
                          {getOnlineIndicator(charger.onlineStatus)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusInfo.color} ${statusInfo.bg}`}>
                              {statusLoading[charger.uid] ? (
                                <div className="w-3 h-3 border-b-2 border-current rounded-full animate-spin"></div>
                              ) : (
                                statusInfo.icon
                              )}
                              {statusInfo.text}
                            </span>
                            <button
                              onClick={() => handleRefreshCharger(charger.uid)}
                              disabled={statusLoading[charger.uid]}
                              className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                              title="Refresh status"
                            >
                              <RefreshIcon className={`w-3 h-3 ${statusLoading[charger.uid] ? "animate-spin" : ""}`} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-gray-400">{charger.Chargerserialnum}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{charger.ChargerName}</div>
                          <div className="text-xs text-gray-400">{charger.Chargerhost}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${typeColor}`}>
                            {charger.chargerType || charger.Chargertype?.split('-')[0]?.trim()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{charger.capacity || charger.Total_Capacity || charger.connector_total_capacity || "N/A"}</div>
                          <div className="text-xs text-gray-400">kW</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {charger.availableConnectors !== undefined ? 
                                `${charger.availableConnectors}/${charger.totalConnectors}` : 
                                charger.number_of_connectors
                              }
                            </div>
                            <div className="text-xs text-gray-400">{charger.Connector_type}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{charger.firstname}</div>
                          <div className="text-xs text-gray-400">{charger.phonenumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-400 max-w-[200px] truncate" title={charger.full_address}>
                            {charger.full_address}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{formatDate(charger.lastOnline || charger.createdAt)}</div>
                          <div className="text-xs text-gray-400">Uptime: {charger.uptime || "N/A"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link to={`/charger/${charger.uid}`}>
                              <button className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-xs">
                                View
                              </button>
                            </Link>
                            <button className="px-3 py-1 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition text-xs">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SUMMARY FOOTER */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              Showing <span className="text-white font-medium">{filteredChargers.length}</span> of{" "}
              <span className="text-white font-medium">{chargers.length}</span> chargers
              {Object.values(statusLoading).some(v => v) && (
                <span className="ml-3 text-blue-400">
                  <RefreshIcon className="w-3 h-3 inline mr-1 animate-spin" />
                  Refreshing status...
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Online: {onlineChargers}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Available: {availableChargers}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Offline: {chargers.filter(c => c.onlineStatus === 'offline').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargerList;
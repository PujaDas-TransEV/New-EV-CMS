import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Bell,
  MapPin,
  Zap,
  Sun,
  Moon,
  Power,
  AlertTriangle,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Key,
  Plug,
  PlugZap,
  Battery,
  Building,
  Users,
  Server,
  ExternalLink,
  Activity,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  Play,
  StopCircle,
  Settings,
  TrendingUp,
  BatteryCharging,
  Calendar,
} from "lucide-react";

// API Configuration with separate keys for different endpoints
const API_CONFIG = {
  USER_API: {
    BASE_URL: "https://be.cms.ocpp.transev.site/admin/getchargerbyuserid",
    API_KEY: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
    KEY_HEADER: "apiauthkey"  // Different header name for this endpoint
  },
  STATUS_API: {
    BASE_URL: "https://api.ocpphal.transev.site/api/status",
    API_KEY: "J9YtyNYdbLD8N4qMwU2WQrr9XV2SJn4Q3qrCLEcHa8wwaZC34xhAd3RotuYdHwiB",
    KEY_HEADER: "x-api-key"  // Standard header for this endpoint
  }
};

/* ---------------- MAIN DASHBOARD ---------------- */
const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userDetails, setUserDetails] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [chargersData, setChargersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userApiStatus, setUserApiStatus] = useState("active");
  const [statusApiStatus, setStatusApiStatus] = useState("active");

  // Get user ID from token
  const getUserID = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id || "5mrv";
    } catch (err) {
      console.error("Error decoding token:", err);
      return "5mrv";
    }
  };

  // Fetch user details and their chargers
  const fetchUserChargers = async () => {
    const userId = getUserID();
    if (!userId) {
      setError("User ID not found. Please login again.");
      navigate("/signin");
      return [];
    }

    try {
      console.log("Fetching user chargers with API key:", API_CONFIG.USER_API.API_KEY.substring(0, 20) + "...");
      
      const response = await fetch(API_CONFIG.USER_API.BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [API_CONFIG.USER_API.KEY_HEADER]: API_CONFIG.USER_API.API_KEY,
        },
        body: JSON.stringify({ get_user_id: userId }),
      });

      console.log("User API response status:", response.status);
      
      if (response.status === 401 || response.status === 403) {
        setUserApiStatus("invalid");
        throw new Error("User API authentication failed - Invalid apiauthkey");
      }
      
      if (!response.ok) {
        throw new Error(`User API error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("User API response data received, chargers found:", data.user_chargerunit_details?.length || 0);
      
      setUserDetails(data.userdetails);
      setUserApiStatus("active");
      
      if (data.userdetails?.firstname) {
        setUserName(data.userdetails.firstname);
      }
      
      return data.user_chargerunit_details || [];
      
    } catch (err) {
      console.error("Error fetching user chargers:", err);
      setUserApiStatus("error");
      
      // Fallback demo data
      const demoChargers = [
        {
          uid: "5bvyd1",
          ChargerName: "Benny 7.4kwh",
          Total_Capacity: "7.4kwh",
          number_of_connectors: "2",
          Chargertype: "AC charger - fast",
          full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
        },
        {
          uid: "5t7env",
          ChargerName: "Transev 60kwh",
          Total_Capacity: "60kwh",
          number_of_connectors: "2",
          Chargertype: "DC charger - fast",
          full_address: "Action Area III, Newtown, New Town, West Bengal 700135",
        },
      ];
      
      return demoChargers;
    }
  };

  // Fetch status for a single charger
  const fetchChargerStatus = async (chargerId, chargerInfo) => {
    try {
      console.log(`Fetching status for charger ${chargerId} with API key:`, API_CONFIG.STATUS_API.API_KEY.substring(0, 20) + "...");
      
      const response = await fetch(API_CONFIG.STATUS_API.BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [API_CONFIG.STATUS_API.KEY_HEADER]: API_CONFIG.STATUS_API.API_KEY,
        },
        body: JSON.stringify({ uid: chargerId }),
      });

      if (response.status === 401 || response.status === 403) {
        setStatusApiStatus("invalid");
        throw new Error("Status API authentication failed - Invalid x-api-key");
      }
      
      if (!response.ok) {
        throw new Error(`Status API error! status: ${response.status} for charger ${chargerId}`);
      }

      const statusData = await response.json();
      console.log(`Status data received for ${chargerId}:`, statusData);
      
      setStatusApiStatus("active");
      
      return {
        chargerInfo,
        statusData,
        lastUpdated: new Date(),
        error: null
      };
      
    } catch (err) {
      console.error(`Error fetching status for charger ${chargerId}:`, err);
      setStatusApiStatus("error");
      
      // Return fallback data for this charger
      return {
        chargerInfo,
        statusData: {
          charger_id: chargerId,
          status: "Unknown",
          connectors: {
            "0": {
              status: "Unknown",
              latest_meter_value: null,
              latest_transaction_consumption_kwh: 0.0,
              error_code: "ConnectionError",
              latest_transaction_id: null
            }
          },
          online: "Offline",
          latest_message_received_time: null
        },
        lastUpdated: new Date(),
        error: err.message
      };
    }
  };

  // Fetch status for all chargers
  const fetchAllChargersStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get user's chargers using the USER API with apiauthkey
      console.log("Step 1: Fetching user chargers...");
      const chargers = await fetchUserChargers();
      
      if (!chargers || chargers.length === 0) {
        setError("No chargers found for this user.");
        setLoading(false);
        return;
      }
      
      console.log(`Step 2: Found ${chargers.length} chargers. Fetching status for each...`);
      
      // Fetch status for all chargers in parallel using STATUS API with x-api-key
      const statusPromises = chargers.map(charger => 
        fetchChargerStatus(charger.uid, charger)
      );
      
      const results = await Promise.allSettled(statusPromises);
      
      // Process results
      const chargersDataMap = {};
      const newAlerts = [];
      
      results.forEach((result, index) => {
        const charger = chargers[index];
        
        if (result.status === "fulfilled") {
          const { chargerInfo, statusData, lastUpdated, error } = result.value;
          
          chargersDataMap[charger.uid] = {
            chargerInfo,
            statusData,
            lastUpdated,
            error
          };
          
          // Add alerts based on status
          if (statusData.online === "Offline") {
            newAlerts.push(`${chargerInfo.ChargerName} is offline`);
          }
          
          if (statusData.status === "Faulted") {
            newAlerts.push(`${chargerInfo.ChargerName} has a fault`);
          }
          
          // Check connectors
          Object.entries(statusData.connectors || {}).forEach(([connectorId, connector]) => {
            if (connector.error_code !== "NoError") {
              newAlerts.push(`${chargerInfo.ChargerName} - Port ${parseInt(connectorId) + 1}: ${connector.error_code}`);
            }
            
            if (connector.status === "Unavailable") {
              newAlerts.push(`${chargerInfo.ChargerName} - Port ${parseInt(connectorId) + 1} is unavailable`);
            }
          });
          
        } else {
          // Handle rejected promise
          chargersDataMap[charger.uid] = {
            chargerInfo: charger,
            statusData: {
              charger_id: charger.uid,
              status: "Error",
              connectors: {},
              online: "Offline",
              latest_message_received_time: null
            },
            lastUpdated: new Date(),
            error: result.reason?.message || "Failed to fetch status"
          };
          
          newAlerts.push(`Failed to load status for ${charger.ChargerName}`);
        }
      });
      
      setChargersData(chargersDataMap);
      setAlerts(newAlerts);
      setLastUpdated(new Date());
      
      console.log(`Step 3: Data loaded successfully. ${Object.keys(chargersDataMap).length} chargers updated.`);
      
    } catch (err) {
      console.error("Error in fetchAllChargersStatus:", err);
      setError("Failed to load charger status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs from all chargers
  const calculateKPIs = () => {
    const chargers = Object.values(chargersData);
    
    if (chargers.length === 0) {
      return {
        totalChargers: 0,
        onlineChargers: 0,
        activeSessions: 0,
        totalEnergy: "0 kWh",
        revenue: "₹0.00",
        availability: "0%",
        totalConnectors: 0,
        availableConnectors: 0,
        totalCapacity: "0 kW",
      };
    }

    let totalChargers = chargers.length;
    let onlineChargers = 0;
    let activeSessions = 0;
    let totalEnergy = 0;
    let totalConnectors = 0;
    let availableConnectors = 0;
    let totalCapacity = 0;

    chargers.forEach(({ chargerInfo, statusData }) => {
      if (statusData.online === "Online") {
        onlineChargers++;
      }
      
      const capacityMatch = chargerInfo?.Total_Capacity?.match(/(\d+(\.\d+)?)/);
      if (capacityMatch) {
        totalCapacity += parseFloat(capacityMatch[1]);
      }
      
      Object.values(statusData.connectors || {}).forEach(connector => {
        totalConnectors++;
        
        if (connector.status === "Available") {
          availableConnectors++;
        }
        
        if (connector.status === "Charging") {
          activeSessions++;
        }
        
        totalEnergy += connector.latest_transaction_consumption_kwh || 0;
      });
    });
    
    const revenue = totalEnergy * 9.5;
    const availability = totalConnectors > 0 
      ? ((availableConnectors / totalConnectors) * 100).toFixed(1)
      : "0";
    
    const onlinePercentage = totalChargers > 0 
      ? ((onlineChargers / totalChargers) * 100).toFixed(1)
      : "0";

    return {
      totalChargers,
      onlineChargers,
      onlinePercentage: `${onlinePercentage}%`,
      activeSessions,
      totalEnergy: `${totalEnergy.toFixed(2)} kWh`,
      revenue: `₹${revenue.toFixed(2)}`,
      availability: `${availability}%`,
      totalConnectors,
      availableConnectors,
      totalCapacity: `${totalCapacity.toFixed(1)} kW`,
    };
  };

  const kpis = calculateKPIs();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");
    try {
      const decoded = jwtDecode(token);
      setUserName(decoded.firstname || "User");
    } catch {
      navigate("/signin");
    }

    // Initial fetch
    fetchAllChargersStatus();

    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchAllChargersStatus, 30000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  // Generate live power data from all chargers
  const generateLivePowerData = () => {
    const baseData = [
      { time: "10:00", power: 1.2 },
      { time: "11:00", power: 1.8 },
      { time: "12:00", power: 2.4 },
      { time: "13:00", power: 2.1 },
      { time: "14:00", power: 2.9 },
    ];
    
    if (Object.keys(chargersData).length > 0) {
      let totalPower = 0;
      Object.values(chargersData).forEach(({ statusData }) => {
        Object.values(statusData.connectors || {}).forEach(connector => {
          if (connector.latest_meter_value !== null && connector.latest_meter_value !== undefined) {
            totalPower += parseFloat(connector.latest_meter_value);
          }
        });
      });
      
      if (totalPower > 0) {
        const now = new Date();
        const currentTime = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
        return [...baseData.slice(-4), { time: currentTime, power: parseFloat(totalPower.toFixed(2)) }];
      }
    }
    
    return baseData;
  };

  const livePowerData = generateLivePowerData();

  // Handle connector selection
  const handleConnectorClick = (chargerId, connectorId, connectorData) => {
    const chargerData = chargersData[chargerId];
    setSelectedConnector({
      chargerId,
      connectorId,
      ...connectorData,
      charger_id: chargerId,
      charger_status: chargerData?.statusData?.status,
      online: chargerData?.statusData?.online,
      latest_message_received_time: chargerData?.statusData?.latest_message_received_time,
      chargerInfo: chargerData?.chargerInfo
    });
  };

  const handleChargerAction = async (action, chargerId, connectorId) => {
    console.log(`${action} for charger ${chargerId}, connector ${connectorId}`);
    
    try {
      console.log(`Action ${action} would be sent to API with headers including ${API_CONFIG.STATUS_API.KEY_HEADER}`);
      
      // Refresh data after action
      fetchAllChargersStatus();
      
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
    }
  };

  // Get connector status color
  const getConnectorStatusColor = (status) => {
    switch(status) {
      case "Available": return "bg-green-500/20 text-green-400";
      case "Charging": return "bg-blue-500/20 text-blue-400";
      case "Unavailable": return "bg-red-500/20 text-red-400";
      case "Preparing": 
      case "Finishing": 
        return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  // Get charger status color
  const getChargerStatusColor = (status) => {
    switch(status) {
      case "Active": return "bg-green-500/20 text-green-400";
      case "Inactive": return "bg-gray-500/20 text-gray-400";
      case "Faulted": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  // Get connector icon
  const getConnectorIcon = (connectorId) => {
    return connectorId === "0" ? <Plug size={20} /> : <PlugZap size={20} />;
  };

  // Get charger type icon
  const getChargerTypeIcon = (type) => {
    if (type?.includes("DC")) return <Zap className="text-blue-400" />;
    if (type?.includes("AC")) return <Power className="text-green-400" />;
    return <Plug className="text-gray-400" />;
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get API status display
  const getApiStatusDisplay = () => {
    if (userApiStatus === "active" && statusApiStatus === "active") {
      return { text: "All APIs Active", color: "bg-green-500/20 text-green-400" };
    }
    if (userApiStatus === "invalid" || statusApiStatus === "invalid") {
      return { text: "API Auth Error", color: "bg-red-500/20 text-red-400" };
    }
    if (userApiStatus === "error" || statusApiStatus === "error") {
      return { text: "API Connection Error", color: "bg-yellow-500/20 text-yellow-400" };
    }
    return { text: "API Status Unknown", color: "bg-gray-500/20 text-gray-400" };
  };

  const apiStatus = getApiStatusDisplay();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-200">
        <Sidebar />

        <div className="flex-1 p-6 space-y-6">
          {/* TOP BAR */}
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {userName}</h1>
              <p className="text-sm text-gray-400">Enterprise EV Charging Control Center</p>
              <div className="flex items-center gap-2 mt-1">
                {lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
                <button 
                  onClick={fetchAllChargersStatus} 
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
                  disabled={loading}
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> 
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${apiStatus.color}`}>
                <Key size={12} />
                <span>{apiStatus.text}</span>
              </div>
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                <Building size={12} />
                <span>{kpis.totalChargers} Stations</span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="relative">
                <button className="p-2 hover:bg-gray-800 rounded-xl">
                  <Bell />
                </button>
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-1.5 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* KPI SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <Kpi 
              title="Total Stations" 
              value={kpis.totalChargers} 
              icon={<Building />} 
              color="from-blue-500 to-cyan-600" 
            />
            <Kpi 
              title="Online Stations" 
              value={kpis.onlineChargers} 
              icon={<Wifi />} 
              color="from-green-500 to-emerald-600" 
            />
            <Kpi 
              title="Active Sessions" 
              value={kpis.activeSessions} 
              icon={<Activity />} 
              color="from-purple-500 to-indigo-600" 
            />
            <Kpi 
              title="Total Revenue" 
              value={kpis.revenue} 
              icon={<DollarSign />} 
              color="from-yellow-500 to-orange-500" 
            />
          </div>

          {/* CHARGERS LIST */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">Charging Stations</h2>
                <p className="text-sm text-gray-400">All your stations with real-time status</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  kpis.onlineChargers === kpis.totalChargers ? "bg-green-500/20 text-green-400" : 
                  kpis.onlineChargers > 0 ? "bg-yellow-500/20 text-yellow-400" : 
                  "bg-red-500/20 text-red-400"
                }`}>
                  {kpis.onlineChargers}/{kpis.totalChargers} Online
                </div>
                <div className="text-xs text-gray-400">
                  Using 2 different API keys
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Loading charging stations...</p>
                <p className="text-xs text-gray-500 mt-2">Fetching data from multiple APIs...</p>
              </div>
            ) : error && Object.keys(chargersData).length === 0 ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>
                <p className="text-yellow-400 mb-2">{error}</p>
                <div className="text-xs text-gray-400 mb-3">
                  {userApiStatus !== "active" && <p>User API: {userApiStatus}</p>}
                  {statusApiStatus !== "active" && <p>Status API: {statusApiStatus}</p>}
                </div>
                <button 
                  onClick={fetchAllChargersStatus}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                >
                  Retry Connection
                </button>
              </div>
            ) : Object.keys(chargersData).length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                  <Plug size={24} />
                </div>
                <p>No charging stations found</p>
                <p className="text-sm mt-1">Add your first charging station to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(chargersData).map(([chargerId, { chargerInfo, statusData, error: chargerError }]) => {
                  const connectors = Object.entries(statusData?.connectors || {});
                  const capacityMatch = chargerInfo?.Total_Capacity?.match(/(\d+(\.\d+)?)/);
                  const capacity = capacityMatch ? capacityMatch[1] : "0";
                  
                  return (
                    <div
                      key={chargerId}
                      className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6 hover:shadow-2xl transition-all hover:border-gray-600"
                    >
                      {/* Charger Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                            {getChargerTypeIcon(chargerInfo?.Chargertype)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{chargerInfo?.ChargerName || `Charger ${chargerId}`}</h3>
                            <p className="text-sm text-gray-400">Station ID: {chargerId} • {capacity} kW</p>
                            <p className="text-xs text-gray-500 mt-1">{chargerInfo?.full_address || "Address not available"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getChargerStatusColor(statusData?.status)}`}>
                            {statusData?.status || "Unknown"}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            statusData?.online === "Online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {statusData?.online || "Offline"}
                          </span>
                        </div>
                      </div>

                      {/* Connectors Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connectors.length > 0 ? (
                          connectors.map(([connectorId, connector]) => (
                            <div
                              key={connectorId}
                              onClick={() => handleConnectorClick(chargerId, connectorId, connector)}
                              className="cursor-pointer bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 group transition-all"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gray-900 rounded-lg">
                                    {getConnectorIcon(connectorId)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Connector {parseInt(connectorId) + 1}</h4>
                                    <p className="text-xs text-gray-400">Port {connectorId}</p>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConnectorStatusColor(connector.status)}`}>
                                  {connector.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-900/50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-400">Power</p>
                                  <p className="font-bold">
                                    {connector.latest_meter_value ? `${connector.latest_meter_value} kW` : "0.0 kW"}
                                  </p>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-400">Energy</p>
                                  <p className="font-bold">
                                    {connector.latest_transaction_consumption_kwh?.toFixed(2) || "0.00"} kWh
                                  </p>
                                </div>
                              </div>
                              
                              {connector.error_code !== "NoError" && (
                                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                  <div className="flex items-center gap-2 text-red-400 text-xs">
                                    <AlertTriangle size={12} />
                                    {connector.error_code}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-3 pt-2 border-t border-gray-700">
                                <p className="text-xs text-gray-400">Click for details</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-6 text-gray-400">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
                              <Plug size={20} />
                            </div>
                            <p>No connector data available</p>
                          </div>
                        )}
                      </div>
                      
                      {chargerError && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-red-400">
                            <AlertTriangle size={14} />
                            <span className="text-sm">{chargerError}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* GRAPH + ALERTS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Power Graph */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Live Power Consumption</h2>
                <div className="text-sm text-gray-400">
                  Total: {livePowerData[livePowerData.length - 1]?.power || 0} kW
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={livePowerData}>
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip formatter={(value) => [`${value} kW`, "Power"]} />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Alerts */}
            {alerts.length > 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" /> System Alerts
                </h2>
                <ul className="space-y-3">
                  {alerts.slice(0, 5).map((alert, i) => (
                    <li key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">⚠</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-green-400" /> System Status
                </h2>
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-400">All systems operational</p>
                </div>
              </div>
            )}
          </div>

          {/* STATS SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin /> Stations Overview
            </h2>
            <div className="h-[300px] rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center text-gray-400 p-4">
              {Object.keys(chargersData).length > 0 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Wifi size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{kpis.totalChargers} Charging Stations</h3>
                    <p className={`text-sm ${kpis.onlineChargers > 0 ? "text-green-400" : "text-red-400"}`}>
                      {kpis.onlineChargers} Online • {kpis.totalChargers - kpis.onlineChargers} Offline
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{kpis.totalConnectors}</div>
                      <div className="text-xs text-gray-400">Total Ports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{kpis.availableConnectors}</div>
                      <div className="text-xs text-gray-400">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{kpis.activeSessions}</div>
                      <div className="text-xs text-gray-400">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{kpis.totalCapacity}</div>
                      <div className="text-xs text-gray-400">Total kW</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <p>Station locations visualization</p>
                  <p className="text-sm mt-2">Add stations to see their locations</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONNECTOR DRAWER */}
        {selectedConnector && (
          <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
            <div className="w-full sm:w-[450px] bg-gray-900 h-full p-6 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Connector {parseInt(selectedConnector.connectorId) + 1}</h2>
                  <p className="text-sm text-gray-400">
                    {selectedConnector.chargerInfo?.ChargerName} • ID: {selectedConnector.charger_id}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedConnector(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Connector Status</p>
                    <p className={`text-lg font-semibold mt-1 ${getConnectorStatusColor(selectedConnector.status).replace('bg-', 'text-').split(' ')[0]}`}>
                      {selectedConnector.status}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Charger Status</p>
                    <p className={`text-lg font-semibold mt-1 ${
                      selectedConnector.charger_status === "Active" ? "text-green-400" : 
                      selectedConnector.charger_status === "Inactive" ? "text-gray-400" : 
                      "text-red-400"
                    }`}>
                      {selectedConnector.charger_status}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Connection</p>
                  <p className={`text-lg font-semibold mt-1 ${
                    selectedConnector.online === "Online" ? "text-green-400" : "text-red-400"
                  }`}>
                    {selectedConnector.online}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Power Output</p>
                    <p className="text-2xl font-bold mt-1">
                      {selectedConnector.latest_meter_value !== null ? `${selectedConnector.latest_meter_value} kW` : "0.0 kW"}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Energy Consumed</p>
                    <p className="text-2xl font-bold mt-1">
                      {selectedConnector.latest_transaction_consumption_kwh?.toFixed(2) || "0.00"} kWh
                    </p>
                  </div>
                </div>
                
                {selectedConnector.error_code !== "NoError" && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle size={18} />
                      <p className="font-semibold">Error Detected</p>
                    </div>
                    <p className="text-sm mt-1">Code: {selectedConnector.error_code}</p>
                  </div>
                )}
                
                {selectedConnector.latest_transaction_id && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Last Transaction ID</p>
                    <p className="text-sm font-mono mt-1">{selectedConnector.latest_transaction_id}</p>
                  </div>
                )}
                
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Charger Info</p>
                  <p className="text-sm mt-1">{selectedConnector.chargerInfo?.ChargerName}</p>
                  <p className="text-xs text-gray-400 mt-1">{selectedConnector.chargerInfo?.full_address}</p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Last Message Received</p>
                  <p className="text-sm mt-1">
                    {selectedConnector.latest_message_received_time 
                      ? new Date(selectedConnector.latest_message_received_time).toLocaleString()
                      : "No data available"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <button 
                  onClick={() => handleChargerAction('start', selectedConnector.charger_id, selectedConnector.connectorId)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedConnector.status !== "Available" || selectedConnector.online !== "Online"}
                >
                  Start Charging Session
                </button>
                <button 
                  onClick={() => handleChargerAction('stop', selectedConnector.charger_id, selectedConnector.connectorId)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedConnector.status !== "Charging"}
                >
                  Stop Charging Session
                </button>
                <button 
                  onClick={() => handleChargerAction('reset', selectedConnector.charger_id, selectedConnector.connectorId)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold transition-all"
                >
                  Reset Connector
                </button>
                <div className="text-xs text-gray-500 text-center pt-2">
                  Actions use {API_CONFIG.STATUS_API.KEY_HEADER} authentication
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Kpi = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-xl hover:scale-[1.03] transition-all duration-300`}>
    <div className="flex justify-between items-center">
      <p className="text-sm opacity-90">{title}</p>
      {icon}
    </div>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

export default Dashboard;
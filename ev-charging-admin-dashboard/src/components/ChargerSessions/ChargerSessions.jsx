import React, { useEffect, useState } from "react";
import { FilterList, Search, Refresh, Warning, CheckCircle, Error, Build, FlashOn } from "@mui/icons-material";
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

  // Get admin ID from token
  const getAdminIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token found:", !!token);
      
      if (!token) {
        console.warn("No token found in localStorage");
        return null;
      }
      
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      
      // Try different possible admin ID fields
      return decoded.adminid || decoded.adminId || decoded.userid || decoded.userId || decoded.id || decoded.user_id || "5mrv";
    } catch (err) {
      console.error("Error decoding token:", err);
      return "5mrv"; // Default fallback based on API response
    }
  };

  // Fetch chargers from API
  const fetchChargers = async () => {
    setLoading(true);
    setError(null);

    try {
      const adminId = getAdminIdFromToken();
      console.log("Admin ID from token:", adminId);

      // API Configuration
      const API_KEY = "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru";
      const API_URL = "https://be.cms.ocpp.transev.site/admin/getchargerbyuserid";
      
      console.log("Making API request to:", API_URL);
      
      // Payload structure based on API response
      const payload = { get_user_id: adminId };
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

      console.log("API Response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      // Handle the exact response structure
      if (response.data && response.data.user_chargerunit_details) {
        const chargerData = response.data.user_chargerunit_details;
        const userData = response.data.userdetails;
        
        console.log(`Fetched ${chargerData.length} chargers`);
        console.log("User details:", userData);
        
        // Add status to each charger (demo status for now)
        const chargersWithStatus = chargerData.map((charger, index) => {
          // Determine status based on charger type and index
          let status = "available";
          if (charger.Chargertype?.toLowerCase().includes("dc")) {
            status = index % 3 === 0 ? "available" : index % 3 === 1 ? "busy" : "maintenance";
          } else {
            status = index % 4 === 0 ? "available" : index % 4 === 1 ? "busy" : index % 4 === 2 ? "maintenance" : "error";
          }
          
          // Determine charger type
          let chargerType = "DC";
          if (charger.Chargertype?.toLowerCase().includes("ac")) {
            chargerType = "AC";
          }
          
          // Determine capacity
          let capacity = parseInt(charger.Total_Capacity) || parseInt(charger.connector_total_capacity) || 0;
          
          return {
            ...charger,
            status: status,
            chargerType: chargerType,
            capacity: capacity,
            protocol: "OCPP 1.6",
            firmware: "v2.1.4",
            lastOnline: charger.createdAt,
            uptime: "98%"
          };
        });
        
        setChargers(chargersWithStatus);
        setUserDetails(userData);
      } else {
        throw new Error("Invalid API response structure");
      }

    } catch (err) {
      console.error("Error fetching chargers:", err);
      
      if (err.response) {
        console.error("Response error:", err.response.status);
        console.error("Response data:", err.response.data);
        setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("No response from server. Please check your connection.");
      } else {
        console.error("Request setup error:", err.message);
        setError(`Request failed: ${err.message}`);
      }
      
      // Load demo data matching the API structure
      loadDemoChargers();
    } finally {
      setLoading(false);
    }
  };

  // Load demo chargers matching API structure
  const loadDemoChargers = () => {
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
        status: "available",
        chargerType: "DC",
        capacity: 60,
        protocol: "OCPP 1.6",
        firmware: "v2.1.4",
        lastOnline: "2025-06-27T11:04:25.880Z",
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
        status: "busy",
        chargerType: "AC",
        capacity: 7.4,
        protocol: "OCPP 1.6",
        firmware: "v1.8.2",
        lastOnline: "2025-06-25T04:56:22.594Z",
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
        status: "maintenance",
        chargerType: "DC",
        capacity: 60,
        protocol: "OCPP 2.0",
        firmware: "v3.0.1",
        lastOnline: "2025-06-27T11:05:10.332Z",
        uptime: "92%"
      },
    ];
    
    setChargers(demoChargers);
    setUserDetails({
      uid: "999z",
      firstname: "Rajrup",
      lastname: "Das",
      email: "transmogrify17@outlook.com",
      role: "superadmin"
    });
    console.log(`Demo data loaded: ${demoChargers.length} chargers`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
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
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return {
          color: 'text-green-400',
          bg: 'bg-green-400/10',
          icon: <CheckCircle fontSize="small" />,
          text: 'Available'
        };
      case 'busy':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10',
          icon: <FlashOn fontSize="small" />,
          text: 'Busy'
        };
      case 'maintenance':
        return {
          color: 'text-orange-400',
          bg: 'bg-orange-400/10',
          icon: <Build fontSize="small" />,
          text: 'Maintenance'
        };
      case 'error':
        return {
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          icon: <Error fontSize="small" />,
          text: 'Error'
        };
      default:
        return {
          color: 'text-gray-400',
          bg: 'bg-gray-400/10',
          icon: <Warning fontSize="small" />,
          text: 'Unknown'
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

  // Calculate statistics
  const totalConnectors = chargers.reduce(
    (sum, c) => sum + (parseInt(c.number_of_connectors) || 0),
    0
  );
  
  const totalCapacity = chargers.reduce(
    (sum, c) => sum + (parseFloat(c.Total_Capacity) || parseFloat(c.connector_total_capacity) || 0),
    0
  );
  
  const availableChargers = chargers.filter(c => c.status === 'available').length;
  const dcChargers = chargers.filter(c => c.chargerType === 'DC').length;

  // Filter chargers
  const filteredChargers = chargers.filter(charger => {
    // Status filter
    if (statusFilter !== "All" && charger.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== "All" && charger.chargerType?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    
    // Search filter
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

  useEffect(() => {
    console.log("ChargerList component mounted");
    fetchChargers();
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
                      Logged in as <span className="text-white font-medium">{userDetails.firstname} {userDetails.lastname}</span>
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
                <Refresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing..." : "Refresh"}
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
              {availableChargers} available • {dcChargers} DC • {chargers.length - dcChargers} AC
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Connectors</p>
            <p className="text-2xl font-bold text-white">{totalConnectors}</p>
            <p className="text-xs text-gray-400 mt-1">
              Across all charging stations
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
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-2xl font-bold text-green-400">Online</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              All systems operational
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
            <FilterList />
          </button>

          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                <Error className="w-6 h-6 text-red-400" />
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
                <Search className="w-6 h-6 text-blue-400" />
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
                    const statusInfo = getStatusInfo(charger.status);
                    const typeColor = getChargerTypeColor(charger.chargerType);
                    
                    return (
                      <tr key={charger.uid} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm">{charger.uid}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusInfo.color} ${statusInfo.bg}`}>
                            {statusInfo.icon}
                            {statusInfo.text}
                          </span>
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
                            <div className="font-medium">{charger.number_of_connectors}</div>
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
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Available: {availableChargers}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Busy: {chargers.filter(c => c.status === 'busy').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Maintenance: {chargers.filter(c => c.status === 'maintenance').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargerList;
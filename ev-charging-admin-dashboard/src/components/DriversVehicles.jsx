import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import {
  Users,
  Car,
  RefreshCw,
  Plus,
  Search,
  Settings,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Battery,
  Zap,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
} from "lucide-react";

const DriversVehicles = () => {
  const [activeTab, setActiveTab] = useState("drivers");
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // API Configuration
  const API_CONFIG = {
    BASE_URL: "https://be.cms.ocpp.transev.site/admin/adminasvehilces",
    API_KEY: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
    KEY_HEADER: "apiauthkey"
  };

  // Get admin ID from JWT token
  const getAdminId = () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token found in localStorage:", !!token);
      
      if (token) {
        // Decode JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(window.atob(base64));
        
        console.log("Decoded JWT:", decoded);
        
        // Extract adminid from the token (based on your sample response)
        if (decoded.adminid) {
          console.log("Admin ID from token:", decoded.adminid);
          return decoded.adminid;
        }
        
        // Fallback to other possible fields
        if (decoded.userId) return decoded.userId;
        if (decoded.id) return decoded.id;
        if (decoded.user_id) return decoded.user_id;
      }
      
      // Check localStorage for admin_id
      const localStorageAdminId = localStorage.getItem("admin_id");
      if (localStorageAdminId) {
        console.log("Admin ID from localStorage:", localStorageAdminId);
        return localStorageAdminId;
      }
      
      // Fallback for testing - using the admin ID from the API response
      console.warn("No admin ID found, using fallback '5mrv'");
      return "5mrv";
      
    } catch (err) {
      console.error("Error getting admin ID:", err);
      console.error("Full error details:", {
        message: err.message,
        stack: err.stack
      });
      
      // Fallback to localStorage or default
      const localStorageAdminId = localStorage.getItem("admin_id");
      if (localStorageAdminId) {
        return localStorageAdminId;
      }
      
      return "5mrv"; // Default to '5mrv' based on API response
    }
  };

  // Fetch drivers and vehicles data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const adminId = getAdminId();
    console.log("Using admin ID for API request:", adminId);
    
    try {
      console.log("Fetching data for admin:", adminId);
      console.log("API URL:", API_CONFIG.BASE_URL);
      
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [API_CONFIG.KEY_HEADER]: API_CONFIG.API_KEY,
        },
        body: JSON.stringify({ adminid: adminId }),
      });

      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      
      // Check for success flag or status in response
      if (data.error) {
        throw new Error(data.message || data.error || "API returned an error");
      }
      
      // Process the API response according to the new structure you provided
      if (data.message === "your details" && data.vehicle) {
        console.log("Processing vehicle data from API");
        
        // Process vehicles data from API response
        if (data.vehicle && Array.isArray(data.vehicle)) {
          const processedVehicles = data.vehicle.map((vehicle, index) => {
            // Extract vehicle details
            const vehicleName = vehicle.vehiclename || "Unknown Vehicle";
            const vehicleModel = vehicle.vehiclemodel || "Unknown Model";
            const licensePlate = vehicle.vehiclelicense || "N/A";
            const vin = vehicle.vehiclevin || vehicle.id || `VIN-${vehicle.id?.substring(0, 8) || index}`;
            
            // Determine battery capacity and range from API data or defaults
            let batteryCapacity = vehicle.vehiclebatterycapacity !== "0" ? `${vehicle.vehiclebatterycapacity} kWh` : "Unknown";
            let range = vehicle.vehiclerange !== "0" ? `${vehicle.vehiclerange} km` : "Unknown";
            
            // Set defaults if not provided
            if (batteryCapacity === "Unknown" || range === "Unknown") {
              if (vehicleName.toLowerCase().includes("nexon")) {
                batteryCapacity = "40.5 kWh";
                range = "453 km";
              } else if (vehicleName.toLowerCase().includes("creta") || vehicleName.toLowerCase().includes("creata")) {
                batteryCapacity = "40 kWh";
                range = "400 km";
              } else if (vehicleName.toLowerCase().includes("tigor")) {
                batteryCapacity = "26 kWh";
                range = "315 km";
              } else if (vehicleName.toLowerCase().includes("mg")) {
                batteryCapacity = "50.3 kWh";
                range = "461 km";
              } else if (vehicleName.toLowerCase().includes("kona")) {
                batteryCapacity = "39.2 kWh";
                range = "452 km";
              } else {
                // Default values for EVs
                batteryCapacity = "40 kWh";
                range = "400 km";
              }
            }
            
            // Determine vehicle status based on ownership
            let status = "available";
            if (vehicle.vehicleowner) {
              status = "in-use";
            }
            
            // Get current driver from owner information
            let currentDriver = "None";
            if (vehicle.vehicleowner && vehicle.ownerUser) {
              currentDriver = vehicle.ownerUser.username || vehicle.ownerUser.email || vehicle.vehicleowner;
            } else if (vehicle.vehicleowner) {
              currentDriver = vehicle.vehicleowner;
            }
            
            // Calculate total trips based on vehicle age (demo data)
            const createdAt = new Date(vehicle.createdAt || new Date());
            const daysSinceCreation = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
            const totalTrips = Math.floor(daysSinceCreation * 1.5); // Average 1.5 trips per day
            
            // Calculate average efficiency (demo data)
            const avgEfficiency = `${(Math.random() * 2 + 5).toFixed(1)} km/kWh`;
            
            // Vehicle color based on index
            const colors = ["Midnight Black", "Glacier White", "Ocean Blue", "Forest Green", "Ruby Red"];
            const color = colors[index % colors.length];
            
            // Avatar color based on index
            const avatarColors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];
            const avatarColor = avatarColors[index % avatarColors.length];
            
            return {
              id: vehicle.id || `vehicle-${index}`,
              uid: vehicle.uid || `uid-${index}`,
              make: vehicleName.split(' ')[0] || "EV",
              model: vehicleName.split(' ').slice(1).join(' ') || vehicleModel || "Model",
              year: createdAt.getFullYear(),
              licensePlate: licensePlate,
              vin: vin,
              batteryCapacity: batteryCapacity,
              range: range,
              status: status,
              lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
              nextService: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
              currentDriver: currentDriver,
              totalTrips: totalTrips > 0 ? totalTrips : 156,
              avgEfficiency: avgEfficiency,
              color: color,
              avatarColor: avatarColor,
              originalData: vehicle, // Keep original data for reference
              vehicleType: vehicle.vehicletype || "EV",
              vehicleCategory: vehicle.vehiclecategory || "Automatic",
              createdAt: vehicle.createdAt,
              ownerEmail: vehicle.vehicleowner,
              ownerInfo: vehicle.ownerUser
            };
          });
          
          setVehicles(processedVehicles);
          console.log(`Processed ${processedVehicles.length} vehicles from API`);
          
          // Extract drivers from vehicle owner information
          const driverSet = new Set();
          const processedDrivers = [];
          
          data.vehicle.forEach((vehicle, index) => {
            if (vehicle.vehicleowner && vehicle.ownerUser) {
              const driverKey = vehicle.ownerUser.userid || vehicle.vehicleowner;
              
              if (!driverSet.has(driverKey)) {
                driverSet.add(driverKey);
                
                // Create driver object from owner information
                const driver = {
                  id: vehicle.ownerUser.userid || `driver-${index}`,
                  name: vehicle.ownerUser.username || "Unknown Driver",
                  email: vehicle.ownerUser.email || vehicle.vehicleowner,
                  phone: vehicle.ownerUser.phonenumber ? `+91 ${vehicle.ownerUser.phonenumber}` : "Not provided",
                  licenseNumber: vehicle.vehiclelicense || "N/A",
                  status: "active",
                  assignedVehicle: vehicle.vehiclename || "Unknown Vehicle",
                  joinDate: vehicle.createdAt ? vehicle.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                  tripsCompleted: Math.floor(Math.random() * 200) + 50, // Random trips between 50-250
                  rating: parseFloat((Math.random() * 1 + 4).toFixed(1)), // Random rating between 4.0-5.0
                  location: "Delhi, IN", // Default location
                  avatarColor: `bg-${['blue', 'purple', 'green', 'orange'][index % 4]}-500`,
                  originalData: vehicle.ownerUser
                };
                
                processedDrivers.push(driver);
              }
            }
          });
          
          // If no drivers found in API response, create demo drivers
          if (processedDrivers.length === 0) {
            console.log("No drivers found in API response, creating demo drivers");
            const demoDrivers = [
              {
                id: 1,
                name: "Rajesh Kumar",
                email: "rajesh.kumar@example.com",
                phone: "+91 98765 43210",
                licenseNumber: "DL04 2019 1234567",
                status: "active",
                assignedVehicle: "Tata Nexon EV",
                joinDate: "2024-01-15",
                tripsCompleted: 156,
                rating: 4.7,
                location: "New Delhi, DL",
                avatarColor: "bg-blue-500",
              },
              {
                id: 2,
                name: "Priya Sharma",
                email: "priya.sharma@example.com",
                phone: "+91 87654 32109",
                licenseNumber: "MH01 2020 7654321",
                status: "active",
                assignedVehicle: "MG ZS EV",
                joinDate: "2024-02-20",
                tripsCompleted: 92,
                rating: 4.9,
                location: "Mumbai, MH",
                avatarColor: "bg-purple-500",
              },
            ];
            
            setDrivers(demoDrivers);
          } else {
            setDrivers(processedDrivers);
            console.log(`Processed ${processedDrivers.length} drivers from API`);
          }
        } else {
          console.log("No vehicles array found in API response");
          loadDemoData();
        }
      } else {
        console.log("Unexpected API response format, loading demo data");
        loadDemoData();
      }
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to load data: ${err.message}`);
      
      // Load demo data for testing
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Load demo data for testing with Indian context
  const loadDemoData = () => {
    console.log("Loading demo data with Indian context...");
    
    const demoDrivers = [
      {
        id: 1,
        name: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        phone: "+91 98765 43210",
        licenseNumber: "DL04 2019 1234567",
        status: "active",
        assignedVehicle: "Tata Nexon EV",
        joinDate: "2024-01-15",
        tripsCompleted: 156,
        rating: 4.7,
        location: "New Delhi, DL",
        avatarColor: "bg-blue-500",
      },
      {
        id: 2,
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 87654 32109",
        licenseNumber: "MH01 2020 7654321",
        status: "active",
        assignedVehicle: "MG ZS EV",
        joinDate: "2024-02-20",
        tripsCompleted: 92,
        rating: 4.9,
        location: "Mumbai, MH",
        avatarColor: "bg-purple-500",
      },
    ];

    const demoVehicles = [
      {
        id: "1675c4c3-911b-4640-a4aa-66a4c50d6d86",
        uid: "dede",
        make: "Creata",
        model: "EV",
        year: 2023,
        licensePlate: "DL04 2019 1234567",
        vin: "1675c4c3-911b-4dsds",
        batteryCapacity: "40 kWh",
        range: "400 km",
        status: "in-use",
        lastService: "2024-05-15",
        nextService: "2024-08-15",
        currentDriver: "ghoshchitradeep76@gmail.com",
        totalTrips: 156,
        avgEfficiency: "6.5 km/kWh",
        color: "Midnight Black",
        avatarColor: "bg-red-500",
        vehicleType: "Ev",
        vehicleCategory: "Automatic",
      },
      {
        id: "63a07b4e-1b11-4ee7-946c-e74cae6efca2",
        uid: "klok",
        make: "Creata",
        model: "EV",
        year: 2023,
        licensePlate: "DL04 EV 1235",
        vin: "63a07b4e-1b11-4ee7-946c-e74cae6efca2",
        batteryCapacity: "40 kWh",
        range: "400 km",
        status: "available",
        lastService: "2024-04-20",
        nextService: "2024-07-20",
        currentDriver: "None",
        totalTrips: 92,
        avgEfficiency: "6.2 km/kWh",
        color: "Glacier White",
        avatarColor: "bg-blue-500",
        vehicleType: "EV",
        vehicleCategory: "automatic",
      },
    ];

    setDrivers(demoDrivers);
    setVehicles(demoVehicles);
    console.log(`Demo data loaded: ${demoDrivers.length} drivers, ${demoVehicles.length} vehicles`);
  };

  useEffect(() => {
    console.log("DriversVehicles component mounted");
    fetchData();
  }, []);

  // Filter data based on search query
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone.includes(searchQuery) ||
    driver.licenseNumber.includes(searchQuery)
  );

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.vin.includes(searchQuery)
  );

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "available":
        return "bg-green-500/20 text-green-400";
      case "in-use":
        return "bg-blue-500/20 text-blue-400";
      case "inactive":
        return "bg-gray-500/20 text-gray-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "maintenance":
        return "bg-red-500/20 text-red-400";
      case "charging":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
      case "available":
        return <CheckCircle size={14} />;
      case "in-use":
        return <Clock size={14} />;
      case "inactive":
        return <XCircle size={14} />;
      case "pending":
      case "maintenance":
      case "charging":
        return <Settings size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  // Format date in Indian format (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format Indian phone number with spacing
  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Indian mobile number
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
    }
    
    return phone;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* PAGE HEADER */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* LEFT: Title + Summary */}
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Drivers & Vehicles
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Manage your EV drivers, vehicles and assignments
              </p>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span>
                  Total Drivers <strong className="text-white">{drivers.length}</strong>
                </span>
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span>
                  Total Vehicles <strong className="text-white">{vehicles.length}</strong>
                </span>
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span>
                  Active Drivers <strong className="text-white">{drivers.filter(d => d.status === 'active').length}</strong>
                </span>
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span>
                  Available Vehicles <strong className="text-white">{vehicles.filter(v => v.status === 'available').length}</strong>
                </span>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm flex items-center gap-2">
                <Download size={14} />
                Export
              </button>

              <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium shadow flex items-center gap-2">
                <Calendar size={14} />
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("drivers")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl border transition
              ${
                activeTab === "drivers"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
          >
            <Users size={18} />
            Drivers ({drivers.length})
          </button>

          <button
            onClick={() => setActiveTab("vehicles")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl border transition
              ${
                activeTab === "vehicles"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
          >
            <Car size={18} />
            Vehicles ({vehicles.length})
          </button>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
              />
            </div>

            <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              <Filter size={16} />
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm">
              <Settings size={16} />
              Columns
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm">
              All Status
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition shadow text-sm">
              <Plus size={16} />
              Add {activeTab === "drivers" ? "Driver" : "Vehicle"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-1">Loading {activeTab}...</h3>
            <p className="text-sm text-gray-400">Fetching data from server</p>
          </div>
        ) : error ? (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <XCircle className="text-red-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Error Loading Data</h3>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        ) : activeTab === "drivers" && filteredDrivers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Users className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No Drivers Found</h3>
            <p className="text-sm text-gray-400 mb-6">
              {searchQuery ? "No drivers match your search. Try different keywords." : "Start by adding your first driver to the system."}
            </p>
            <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition">
              <Plus size={16} />
              Add Driver
            </button>
          </div>
        ) : activeTab === "vehicles" && filteredVehicles.length === 0 ? (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Car className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No Vehicles Found</h3>
            <p className="text-sm text-gray-400 mb-6">
              {searchQuery ? "No vehicles match your search. Try different keywords." : "Start by adding your first vehicle to the system."}
            </p>
            <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition">
              <Plus size={16} />
              Add Vehicle
            </button>
          </div>
        ) : activeTab === "drivers" ? (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Driver</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">License</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Vehicle</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Trips</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Rating</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${driver.avatarColor}`}>
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{driver.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={10} />
                              {driver.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-2">
                            <Phone size={12} className="text-gray-400" />
                            {formatPhoneNumber(driver.phone)}
                          </p>
                          <p className="text-sm flex items-center gap-2">
                            <Mail size={12} className="text-gray-400" />
                            {driver.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-gray-400" />
                          <span className="font-mono text-sm">{driver.licenseNumber}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                          {getStatusIcon(driver.status)}
                          {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Car size={14} className="text-gray-400" />
                          <span className="text-sm">{driver.assignedVehicle}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{driver.tripsCompleted}</p>
                          <p className="text-xs text-gray-400">Joined {formatDate(driver.joinDate)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(driver.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm">{driver.rating > 0 ? `${driver.rating}/5` : "No rating"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Vehicle</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Details</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Battery & Range</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Driver</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Service</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Trips</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${vehicle.avatarColor}`}>
                            <Car size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{vehicle.make} {vehicle.model}</p>
                            <p className="text-xs text-gray-400">{vehicle.year} • {vehicle.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-mono">{vehicle.licensePlate}</p>
                          <p className="text-xs text-gray-400">VIN: {vehicle.vin.substring(0, 15)}...</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Battery size={12} className="text-gray-400" />
                            <span className="text-sm">{vehicle.batteryCapacity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap size={12} className="text-gray-400" />
                            <span className="text-sm">{vehicle.range} range</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {getStatusIcon(vehicle.status)}
                          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="text-sm">{vehicle.currentDriver || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm">Last: {formatDate(vehicle.lastService)}</p>
                          <p className="text-xs text-gray-400">Next: {formatDate(vehicle.nextService)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{vehicle.totalTrips} trips</p>
                          <p className="text-xs text-gray-400">{vehicle.avgEfficiency} avg</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Driver Details Modal */}
        {selectedDriver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedDriver.avatarColor}`}>
                      <User size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedDriver.name}</h2>
                      <p className="text-sm text-gray-400">{selectedDriver.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDriver(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <XCircle />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Contact Information</p>
                    <div className="mt-3 space-y-2">
                      <p className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{formatPhoneNumber(selectedDriver.phone)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span>{selectedDriver.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{selectedDriver.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Driver Information</p>
                    <div className="mt-3 space-y-2">
                      <p>
                        <span className="text-gray-400">License:</span> {selectedDriver.licenseNumber}
                      </p>
                      <p>
                        <span className="text-gray-400">Joined:</span> {formatDate(selectedDriver.joinDate)}
                      </p>
                      <p>
                        <span className="text-gray-400">Trips Completed:</span> {selectedDriver.tripsCompleted}
                      </p>
                      <p>
                        <span className="text-gray-400">Rating:</span> {selectedDriver.rating > 0 ? `${selectedDriver.rating}/5` : "No rating"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-3">Current Assignment</p>
                  <div className="flex items-center gap-3">
                    <Car size={20} className="text-blue-400" />
                    <div>
                      <p className="font-medium">{selectedDriver.assignedVehicle}</p>
                      <p className="text-sm text-gray-400">
                        Status: <span className={`${getStatusColor(selectedDriver.status)} px-2 py-1 rounded-full text-xs`}>
                          {selectedDriver.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition">
                    Edit Driver
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition">
                    Assign Vehicle
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 transition">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Details Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedVehicle.avatarColor}`}>
                      <Car size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedVehicle.make} {selectedVehicle.model}</h2>
                      <p className="text-sm text-gray-400">{selectedVehicle.year} • {selectedVehicle.color}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <XCircle />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Vehicle Details</p>
                    <div className="mt-3 space-y-2">
                      <p>
                        <span className="text-gray-400">License Plate:</span> {selectedVehicle.licensePlate}
                      </p>
                      <p>
                        <span className="text-gray-400">VIN:</span> {selectedVehicle.vin}
                      </p>
                      <p>
                        <span className="text-gray-400">Year:</span> {selectedVehicle.year}
                      </p>
                      <p>
                        <span className="text-gray-400">Color:</span> {selectedVehicle.color}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Battery & Performance</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Battery size={14} className="text-gray-400" />
                        <span>Capacity: {selectedVehicle.batteryCapacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-gray-400" />
                        <span>Range: {selectedVehicle.range}</span>
                      </div>
                      <p>
                        <span className="text-gray-400">Avg Efficiency:</span> {selectedVehicle.avgEfficiency}
                      </p>
                      <p>
                        <span className="text-gray-400">Total Trips:</span> {selectedVehicle.totalTrips}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Service Information</p>
                    <div className="mt-3 space-y-2">
                      <p>
                        <span className="text-gray-400">Last Service:</span> {formatDate(selectedVehicle.lastService)}
                      </p>
                      <p>
                        <span className="text-gray-400">Next Service:</span> {formatDate(selectedVehicle.nextService)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Current Assignment</p>
                    <div className="mt-3">
                      <div className="flex items-center gap-3">
                        <User size={20} className="text-blue-400" />
                        <div>
                          <p className="font-medium">{selectedVehicle.currentDriver || "Unassigned"}</p>
                          <p className="text-sm text-gray-400">
                            Status: <span className={`${getStatusColor(selectedVehicle.status)} px-2 py-1 rounded-full text-xs`}>
                              {selectedVehicle.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition">
                    Edit Vehicle
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition">
                    Assign Driver
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 transition">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriversVehicles;
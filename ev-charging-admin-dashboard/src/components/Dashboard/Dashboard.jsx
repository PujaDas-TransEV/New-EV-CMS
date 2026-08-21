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
  CircleCheck as CircleCheckIcon,
  CircleAlert,
  CirclePower,
  CircleSlash,
  CircleX,
  Wallet,
  Map,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  PowerOff,
  Power as PowerIcon,
  RefreshCcw,
  Info,
  Sparkles,
  Gauge,
  Radar,
  Navigation,
  Locate,
  Compass,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import Sidebar from "../Sidebar/Sidebar";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  FLEET_API: `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
  CHARGER_DETAIL_API: (chargerId) => `${API_BASE_URL}/api/v1/cpo/operations/chargers/${chargerId}`,
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  HUB_CHARGERS_API: (hubId) => `${API_BASE_URL}/api/v1/cpo/hubs/${hubId}/chargers`,
  ANALYTICS_API: `${API_BASE_URL}/api/v1/cpo/analytics`,
};

// ==================== KPI CARD ====================
const KpiCard = ({ title, value, subValue, icon, color, noData, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value || '—'}</p>
          {subValue && <p className="text-sm text-gray-400">{subValue}</p>}
        </div>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center">
        {noData && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle size={10} /> No Data
          </span>
        )}
        {!noData && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <CheckCircle size={10} className="text-green-500" /> Live
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
  const [fleetData, setFleetData] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [chargerDetails, setChargerDetails] = useState({});
  const [hubs, setHubs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [hubChargers, setHubChargers] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(false);
  const [loadingChargers, setLoadingChargers] = useState(false);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingHubChargers, setLoadingHubChargers] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // KPI customization state - loaded from localStorage
  const [selectedKPIs, setSelectedKPIs] = useState(() => {
    const saved = localStorage.getItem('dashboard_kpis_selected');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          { id: 'revenue', title: 'Revenue', icon: 'wallet', color: 'bg-green-100' },
          { id: 'sessions', title: 'No of Sessions', icon: 'activity', color: 'bg-blue-100' },
          { id: 'usage', title: 'Usage', icon: 'zap', color: 'bg-yellow-100' },
          { id: 'online', title: 'Online Percentage', icon: 'wifi', color: 'bg-purple-100' },
        ];
      }
    }
    return [
      { id: 'revenue', title: 'Revenue', icon: 'wallet', color: 'bg-green-100' },
      { id: 'sessions', title: 'No of Sessions', icon: 'activity', color: 'bg-blue-100' },
      { id: 'usage', title: 'Usage', icon: 'zap', color: 'bg-yellow-100' },
      { id: 'online', title: 'Online Percentage', icon: 'wifi', color: 'bg-purple-100' },
    ];
  });

  const [availableKPIs, setAvailableKPIs] = useState(() => {
    const saved = localStorage.getItem('dashboard_kpis_available');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          { id: 'energy', title: 'Total Energy', icon: 'battery', color: 'bg-indigo-100' },
          { id: 'active', title: 'Active Sessions', icon: 'activity', color: 'bg-pink-100' },
          { id: 'revenuePerCharger', title: 'Revenue per Charger', icon: 'dollar', color: 'bg-orange-100' },
        ];
      }
    }
    return [
      { id: 'energy', title: 'Total Energy', icon: 'battery', color: 'bg-indigo-100' },
      { id: 'active', title: 'Active Sessions', icon: 'activity', color: 'bg-pink-100' },
      { id: 'revenuePerCharger', title: 'Revenue per Charger', icon: 'dollar', color: 'bg-orange-100' },
    ];
  });

  // Filter options
  const filterOptions = ["Today", "Yesterday", "This Week", "This Month", "This Year"];
  const stateOptions = [
    "All States", 
    "West Bengal", 
  ];
  
  // Network options with OCPP status
  const networkOptions = [
    { value: "All Network", label: "All Network", icon: <Signal size={14} className="text-gray-500" /> },
    { value: "Online", label: "Online (OCPP)", icon: <Wifi size={14} className="text-green-500" /> },
    { value: "Offline", label: "Offline (OCPP)", icon: <WifiOff size={14} className="text-red-500" /> }
  ];

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // Fetch fleet data
  const fetchFleetData = async () => {
    setLoadingFleet(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.FLEET_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFleetData(data);
        console.log('Fleet data fetched:', data);
      } else {
        console.log('Failed to fetch fleet data:', response.status);
      }
    } catch (err) {
      console.error('Error fetching fleet data:', err);
      setError('Failed to load fleet data');
    } finally {
      setLoadingFleet(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.ANALYTICS_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        console.log('Analytics data fetched:', data);
      } else {
        console.log('Failed to fetch analytics:', response.status);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch charger details
  const fetchChargerDetails = async (chargerId) => {
    if (chargerDetails[chargerId]) return;

    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGER_DETAIL_API(chargerId), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChargerDetails(prev => ({
          ...prev,
          [chargerId]: data
        }));
        console.log('Charger details fetched for', chargerId, data);
      }
    } catch (err) {
      console.error('Error fetching charger details:', err);
    }
  };

  // Fetch all chargers
  const fetchChargers = async () => {
    setLoadingChargers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGERS_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chargersList = data.chargers || data.data || data || [];
        setChargers(chargersList);
        console.log('Chargers fetched:', chargersList);
      } else {
        console.log('Failed to fetch chargers:', response.status);
        setChargers([]);
      }
    } catch (err) {
      console.error('Error fetching chargers:', err);
      setChargers([]);
    } finally {
      setLoadingChargers(false);
    }
  };

  // Fetch hubs
  const fetchHubs = async () => {
    setLoadingHubs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUBS_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const hubsList = data.hubs || data.data || data || [];
        setHubs(hubsList);
        console.log('Hubs fetched:', hubsList);
      } else {
        console.log('Failed to fetch hubs:', response.status);
        setHubs([]);
      }
    } catch (err) {
      console.error('Error fetching hubs:', err);
      setHubs([]);
    } finally {
      setLoadingHubs(false);
    }
  };

  // Fetch hub-wise chargers
  const fetchHubChargers = async (hubId) => {
    setLoadingHubChargers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUB_CHARGERS_API(hubId), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chargersList = data.chargers || data.data || data || [];
        setHubChargers(chargersList);
        console.log('Hub chargers fetched for', hubId, ':', chargersList);
      } else {
        console.log('Failed to fetch hub chargers:', response.status);
        setHubChargers([]);
      }
    } catch (err) {
      console.error('Error fetching hub chargers:', err);
      setHubChargers([]);
    } finally {
      setLoadingHubChargers(false);
    }
  };

  // Fetch user info
  const fetchUserInfo = async () => {
    setLoadingUser(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('User info fetched:', data);
        
        const userData = data.user || data;
        const name = userData.full_name || userData.name || userData.firstname || 'User';
        const email = userData.email || userData.userEmail || '';
        const role = data.role || userData.role || '';
        const avatar = userData.avatar || userData.profileImage || null;
        
        setUserName(name);
        setUserEmail(email);
        setUserRole(role);
        setUserAvatar(avatar);
      } else {
        console.log('Failed to fetch user info:', response.status);
        if (user) {
          setUserName(user.name || 'User');
          setUserEmail(user.email || '');
          setUserRole(user.role || '');
        }
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      if (user) {
        setUserName(user.name || 'User');
        setUserEmail(user.email || '');
        setUserRole(user.role || '');
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authenticatedRequest(API_CONFIG.LOGOUT_API, {
          method: 'POST'
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    console.log('Refreshing dashboard...');
    const timestamp = new Date().toLocaleTimeString();
    setLastUpdated(timestamp);
    fetchUserInfo();
    fetchFleetData();
    fetchAnalytics();
    fetchChargers();
    fetchHubs();
    
    // If a hub is selected, fetch its chargers
    if (selectedHub !== "All Hubs") {
      const hub = hubs.find(h => h.name === selectedHub || h.id === selectedHub);
      if (hub) {
        fetchHubChargers(hub.id);
      }
    }
  };

  // Check authentication and fetch data on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    refreshDashboard();
  }, [isAuthenticated]);

  // Auto-refresh effect
  useEffect(() => {
    let intervalId = null;
    
    if (autoRefresh && isAuthenticated) {
      console.log('Auto-refresh enabled');
      intervalId = setInterval(() => {
        refreshDashboard();
      }, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, isAuthenticated]);

  // Fetch charger details when selected
  useEffect(() => {
    if (selectedCharger && !chargerDetails[selectedCharger]) {
      fetchChargerDetails(selectedCharger);
    }
  }, [selectedCharger]);

  // Fetch hub chargers when hub changes
  useEffect(() => {
    if (selectedHub !== "All Hubs") {
      const hub = hubs.find(h => h.name === selectedHub || h.id === selectedHub);
      if (hub) {
        fetchHubChargers(hub.id);
      }
    } else {
      setHubChargers([]);
    }
  }, [selectedHub, hubs]);

  // Get stats from fleet data
  const getFleetStats = () => {
    if (!fleetData) {
      return {
        totalChargers: 0,
        onlineChargers: 0,
        offlineChargers: 0,
        availableConnectors: 0,
        busyConnectors: 0,
        preparingConnectors: 0,
        totalConnectors: 0,
        chargingConnectors: 0,
        errorConnectors: 0,
      };
    }

    const stats = fleetData.summary || fleetData || {};
    return {
      totalChargers: stats.total_chargers || 0,
      onlineChargers: stats.online_chargers || 0,
      offlineChargers: stats.offline_chargers || 0,
      availableConnectors: stats.available_connectors || 0,
      busyConnectors: stats.busy_connectors || 0,
      preparingConnectors: stats.preparing_connectors || 0,
      totalConnectors: stats.total_connectors || 0,
      chargingConnectors: stats.charging_connectors || 0,
      errorConnectors: stats.error_connectors || 0,
    };
  };

  const stats = getFleetStats();

  // Get analytics data
  const getAnalyticsStats = () => {
    if (!analyticsData) {
      return {
        revenue: 0,
        sessions: 0,
        usage: 0,
        onlinePercentage: 0,
        totalChargers: 0,
        totalConnectors: 0,
      };
    }

    const data = analyticsData.data || analyticsData || {};
    return {
      revenue: data.revenue || 0,
      sessions: data.sessions || 0,
      usage: data.usage || 0,
      onlinePercentage: data.online_percentage || 0,
      totalChargers: data.total_chargers || stats.totalChargers || 0,
      totalConnectors: data.total_connectors || stats.totalConnectors || 0,
    };
  };

  const analytics = getAnalyticsStats();

  // Get charger status from fleet data (OCPP connection status)
  const getChargerStatus = (chargerId) => {
    if (!fleetData?.chargers) return null;
    return fleetData.chargers.find(c => c.charger_id === chargerId || c.id === chargerId);
  };

  // Get charger OCPP connection status
  const getChargerOCPPStatus = (chargerId) => {
    const status = getChargerStatus(chargerId);
    return {
      isOnline: status?.online || false,
      lastSeen: status?.last_seen || null,
      ocppStatus: status?.ocpp_status || 'unknown',
      connectorStatus: status?.connectors || []
    };
  };

  // Get connector status color
  const getConnectorStatusColor = (status) => {
    const colors = {
      'AVAILABLE': 'bg-green-500',
      'BUSY': 'bg-yellow-500',
      'CHARGING': 'bg-blue-500',
      'PREPARING': 'bg-orange-400',
      'FINISHING': 'bg-purple-400',
      'RESERVED': 'bg-indigo-400',
      'ERROR': 'bg-red-500',
      'UNAVAILABLE': 'bg-gray-400',
      'OFFLINE': 'bg-gray-500',
      'unknown': 'bg-gray-300',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getConnectorStatusLabel = (status) => {
    const labels = {
      'AVAILABLE': 'Available',
      'BUSY': 'Busy',
      'CHARGING': 'Charging',
      'PREPARING': 'Preparing',
      'FINISHING': 'Finishing',
      'RESERVED': 'Reserved',
      'ERROR': 'Error',
      'UNAVAILABLE': 'Unavailable',
      'OFFLINE': 'Offline',
      'unknown': 'Unknown',
    };
    return labels[status] || status || 'Unknown';
  };

  const getConnectorStatusIcon = (status) => {
    switch(status) {
      case 'AVAILABLE': return <CircleCheckIcon size={12} className="text-green-500" />;
      case 'BUSY': return <CircleDot size={12} className="text-yellow-500" />;
      case 'CHARGING': return <Zap size={12} className="text-blue-500" />;
      case 'PREPARING': return <Clock size={12} className="text-orange-400" />;
      case 'ERROR': return <CircleX size={12} className="text-red-500" />;
      case 'OFFLINE': return <WifiOff size={12} className="text-gray-400" />;
      default: return <Circle size={12} className="text-gray-400" />;
    }
  };

  // Filter chargers based on connector status
  const getFilteredByConnectorStatus = (chargersList) => {
    if (connectorFilter === "All") return chargersList;
    
    return chargersList.filter(charger => {
      const statusInfo = getChargerStatus(charger.id || charger.charger_id);
      if (!statusInfo?.connectors) return false;
      
      return statusInfo.connectors.some(conn => conn.status === connectorFilter);
    });
  };

  // Get chargers to display (hub-specific or all)
  const getDisplayChargers = () => {
    if (selectedHub !== "All Hubs" && hubChargers.length > 0) {
      return hubChargers;
    }
    return chargers;
  };

  const displayChargers = getDisplayChargers();

  // Filter chargers
  const filteredChargers = getFilteredByConnectorStatus(displayChargers.filter((charger) => {
    const matchesSearch = charger.charger_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.charger_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const { isOnline } = getChargerOCPPStatus(charger.id || charger.charger_id);
    
    const matchesNetwork = selectedNetwork === "All Network" || 
                          (selectedNetwork === "Online" && isOnline) ||
                          (selectedNetwork === "Offline" && !isOnline);
    
    return matchesSearch && matchesNetwork;
  }));

  // Get unique hubs for dropdown
  const hubOptions = ["All Hubs", ...new Set(hubs.map(h => h.name || h.id).filter(Boolean))];

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

  // Customize popup with localStorage persistence
  const CustomizePopup = () => {
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
      setSelectedKPIs([...localSelected]);
      setAvailableKPIs([...localAvailable]);
      
      localStorage.setItem('dashboard_kpis_selected', JSON.stringify(localSelected));
      localStorage.setItem('dashboard_kpis_available', JSON.stringify(localAvailable));
      
      setShowCustomizePopup(false);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>KPIs updated successfully!</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
      }, 3000);
    };

    const handleReset = () => {
      const defaultSelected = [
        { id: 'revenue', title: 'Revenue', icon: 'wallet', color: 'bg-green-100' },
        { id: 'sessions', title: 'No of Sessions', icon: 'activity', color: 'bg-blue-100' },
        { id: 'usage', title: 'Usage', icon: 'zap', color: 'bg-yellow-100' },
        { id: 'online', title: 'Online Percentage', icon: 'wifi', color: 'bg-purple-100' },
      ];
      const defaultAvailable = [
        { id: 'energy', title: 'Total Energy', icon: 'battery', color: 'bg-indigo-100' },
        { id: 'active', title: 'Active Sessions', icon: 'activity', color: 'bg-pink-100' },
        { id: 'revenuePerCharger', title: 'Revenue per Charger', icon: 'dollar', color: 'bg-orange-100' },
      ];
      
      setLocalSelected(defaultSelected);
      setLocalAvailable(defaultAvailable);
      setSelectedKPIs(defaultSelected);
      setAvailableKPIs(defaultAvailable);
      localStorage.setItem('dashboard_kpis_selected', JSON.stringify(defaultSelected));
      localStorage.setItem('dashboard_kpis_available', JSON.stringify(defaultAvailable));
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
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
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
          
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Settings size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Customize KPIs</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Drag and drop to rearrange • Changes saved automatically</p>
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
          
          <div className="p-6 overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-blue-500" />
                    <p className="text-sm font-semibold text-gray-700">Selected KPIs</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {localSelected.length} selected
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

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">Available KPIs</p>
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

              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-800 font-medium">Drag & Drop Customization</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Drag KPIs between sections to customize your dashboard layout. 
                      Changes are saved automatically to your browser.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
                Reset Default
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
      {options.map((opt) => {
        const isObject = typeof opt === 'object';
        const value = isObject ? opt.value : opt;
        const label = isObject ? opt.label : opt;
        const icon = isObject ? opt.icon : null;
        
        return (
          <button
            key={value}
            onClick={() => { onSelect(value); onClose(); }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
              selected === value ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"
            }`}
          >
            {icon && <span>{icon}</span>}
            {label}
          </button>
        );
      })}
    </div>
  );

  // Show loading if refreshing
  if (isRefreshing || loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">{isRefreshing ? 'Refreshing session...' : 'Loading...'}</p>
      </div>
    );
  }

  // Render KPI cards based on selected KPIs
  const renderKpiCards = () => {
    const kpiMap = {
      revenue: {
        title: "Revenue",
        value: analytics.revenue ? `₹ ${Number(analytics.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "—",
        subValue: analytics.sessions ? `${analytics.sessions} sessions` : "No sessions",
        icon: <Wallet size={18} className="text-green-600" />,
        color: "bg-green-100",
        noData: !analytics.revenue
      },
      sessions: {
        title: "No of Sessions",
        value: analytics.sessions || 0,
        subValue: analytics.totalChargers ? `${analytics.totalChargers} chargers` : "No chargers",
        icon: <Activity size={18} className="text-blue-600" />,
        color: "bg-blue-100",
        noData: !analytics.sessions
      },
      usage: {
        title: "Usage",
        value: analytics.usage ? `${Number(analytics.usage).toFixed(2)} kWh` : "—",
        subValue: analytics.totalConnectors ? `${analytics.totalConnectors} connectors` : "No connectors",
        icon: <Zap size={18} className="text-yellow-600" />,
        color: "bg-yellow-100",
        noData: !analytics.usage
      },
      online: {
        title: "Online Percentage",
        value: analytics.onlinePercentage ? `${analytics.onlinePercentage}%` : "—",
        subValue: stats.onlineChargers ? `${stats.onlineChargers} online` : "No online chargers",
        icon: <Wifi size={18} className="text-purple-600" />,
        color: "bg-purple-100",
        noData: !analytics.onlinePercentage
      },
      energy: {
        title: "Total Energy",
        value: analytics.usage ? `${Number(analytics.usage).toFixed(2)} kWh` : "—",
        subValue: `${analytics.totalChargers || 0} chargers`,
        icon: <Battery size={18} className="text-indigo-600" />,
        color: "bg-indigo-100",
        noData: !analytics.usage
      },
      active: {
        title: "Active Sessions",
        value: analytics.sessions || 0,
        subValue: `${analytics.totalChargers || 0} chargers active`,
        icon: <Activity size={18} className="text-pink-600" />,
        color: "bg-pink-100",
        noData: !analytics.sessions
      },
      revenuePerCharger: {
        title: "Revenue per Charger",
        value: analytics.totalChargers > 0 && analytics.revenue ? `₹ ${Number(analytics.revenue / analytics.totalChargers).toFixed(2)}` : "—",
        subValue: `${analytics.totalChargers || 0} chargers`,
        icon: <DollarSign size={18} className="text-orange-600" />,
        color: "bg-orange-100",
        noData: !analytics.revenue || analytics.totalChargers === 0
      }
    };

    return selectedKPIs.map((kpi) => {
      const data = kpiMap[kpi.id];
      if (!data) return null;
      
      return (
        <KpiCard
          key={kpi.id}
          title={data.title}
          value={data.value}
          subValue={data.subValue}
          icon={data.icon}
          color={data.color}
          noData={data.noData}
        />
      );
    }).filter(Boolean);
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
                <Globe size={14} />
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

            {/* Hub Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHubDropdown(!showHubDropdown)}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
              >
                <Building size={14} />
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

        {/* KPI CARDS - Dynamically rendered from selected KPIs */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {renderKpiCards()}
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
                        <p className="text-3xl font-bold text-gray-800">{analytics.totalChargers || stats.totalChargers}</p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Online: {stats.onlineChargers}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-gray-600">{analytics.totalConnectors || stats.totalConnectors} Connectors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Network Filter */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl border border-green-200/60 p-2.5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[10px] font-medium text-green-700 uppercase tracking-wider">Network (OCPP)</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                        className="text-sm font-semibold text-gray-800 bg-transparent border-0 p-0 focus:ring-0 outline-none flex items-center gap-1 hover:text-green-700 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          {selectedNetwork === "Online" && <Wifi size={14} className="text-green-500" />}
                          {selectedNetwork === "Offline" && <WifiOff size={14} className="text-red-500" />}
                          {selectedNetwork === "All Network" && <Signal size={14} className="text-gray-500" />}
                          {selectedNetwork}
                        </span>
                        <ChevronDown size={12} className="text-gray-400" />
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
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {selectedNetwork === "All Network" ? "All" : selectedNetwork}
                    </span>
                  </div>
                </div>
              </div>

              {/* Charger Connector Status - Clickable Filters */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200/60 p-2.5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <p className="text-[10px] font-medium text-blue-700 uppercase tracking-wider">Connector Status</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <button
                        onClick={() => setConnectorFilter("All")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "All" 
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200 scale-105" 
                            : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 hover:scale-105"
                        }`}
                      >
                        <Circle size={8} className={connectorFilter === "All" ? "text-white" : "text-gray-400"} />
                        All ({stats.totalConnectors})
                      </button>
                      <button
                        onClick={() => setConnectorFilter("CHARGING")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "CHARGING" 
                            ? "bg-blue-500 text-white shadow-sm shadow-blue-200 scale-105" 
                            : "bg-gray-100 text-blue-600 hover:bg-blue-100 hover:text-blue-700 hover:scale-105"
                        }`}
                      >
                        <Zap size={8} className={connectorFilter === "CHARGING" ? "text-white" : "text-blue-500"} />
                        Charging ({stats.chargingConnectors || 0})
                      </button>
                      <button
                        onClick={() => setConnectorFilter("AVAILABLE")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "AVAILABLE" 
                            ? "bg-green-500 text-white shadow-sm shadow-green-200 scale-105" 
                            : "bg-gray-100 text-green-600 hover:bg-green-100 hover:text-green-700 hover:scale-105"
                        }`}
                      >
                        <CircleCheckIcon size={8} className={connectorFilter === "AVAILABLE" ? "text-white" : "text-green-500"} />
                        Available ({stats.availableConnectors || 0})
                      </button>
                      <button
                        onClick={() => setConnectorFilter("BUSY")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "BUSY" 
                            ? "bg-yellow-500 text-white shadow-sm shadow-yellow-200 scale-105" 
                            : "bg-gray-100 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 hover:scale-105"
                        }`}
                      >
                        <CircleDot size={8} className={connectorFilter === "BUSY" ? "text-white" : "text-yellow-500"} />
                        Busy ({stats.busyConnectors || 0})
                      </button>
                      <button
                        onClick={() => setConnectorFilter("PREPARING")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "PREPARING" 
                            ? "bg-orange-400 text-white shadow-sm shadow-orange-200 scale-105" 
                            : "bg-gray-100 text-orange-600 hover:bg-orange-100 hover:text-orange-700 hover:scale-105"
                        }`}
                      >
                        <Clock size={8} className={connectorFilter === "PREPARING" ? "text-white" : "text-orange-500"} />
                        Preparing ({stats.preparingConnectors || 0})
                      </button>
                      <button
                        onClick={() => setConnectorFilter("ERROR")}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 font-medium ${
                          connectorFilter === "ERROR" 
                            ? "bg-red-500 text-white shadow-sm shadow-red-200 scale-105" 
                            : "bg-gray-100 text-red-600 hover:bg-red-100 hover:text-red-700 hover:scale-105"
                        }`}
                      >
                        <CircleX size={8} className={connectorFilter === "ERROR" ? "text-white" : "text-red-500"} />
                        Error ({stats.errorConnectors || 0})
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
                    placeholder={selectedHub !== "All Hubs" ? `Search chargers in ${selectedHub}...` : "Search chargers..."}
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
                    {selectedHub !== "All Hubs" && ` in ${selectedHub}`}
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
                .no-data-icon {
                  animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
              `}</style>
              
              <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto charger-list">
                {loadingChargers || loadingHubChargers ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-3">Loading chargers...</p>
                  </div>
                ) : filteredChargers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="no-data-icon w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border-2 border-dashed border-blue-300">
                      <Plug size={40} className="text-blue-300" />
                    </div>
                    <p className="text-base font-semibold text-gray-600">No Chargers Found</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                      {connectorFilter !== "All" 
                        ? `No chargers with "${getConnectorStatusLabel(connectorFilter)}" connectors found`
                        : selectedHub !== "All Hubs"
                          ? `No chargers found in "${selectedHub}"`
                          : searchQuery || selectedNetwork !== "All Network"
                            ? 'Try adjusting your search or filters'
                            : 'No chargers registered yet'
                      }
                    </p>
                    {(searchQuery || selectedHub !== "All Hubs" || selectedNetwork !== "All Network" || connectorFilter !== "All") && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedHub('All Hubs');
                          setSelectedNetwork('All Network');
                          setConnectorFilter('All');
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredChargers.map((charger) => {
                    const { isOnline, lastSeen, connectorStatus } = getChargerOCPPStatus(charger.id || charger.charger_id);
                    const chargerName = charger.charger_name || charger.name || charger.id || 'Unnamed Charger';
                    const chargerId = charger.id || charger.charger_id;
                    const hubName = hubs.find(h => h.id === charger.hub_id || h.id === charger.hub)?.name || charger.hub || 'No Hub';
                    
                    return (
                      <div
                        key={chargerId}
                        onClick={() => setSelectedCharger(chargerId === selectedCharger ? null : chargerId)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                          selectedCharger === chargerId
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100/50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}>
                                <div className={`absolute -inset-1 rounded-full animate-ping ${isOnline ? "bg-green-500/30" : "bg-red-500/30"}`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-800 truncate">{chargerName}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {isOnline ? "Online" : "Offline"}
                                </span>
                                {lastSeen && !isOnline && (
                                  <span className="text-[9px] text-gray-400 flex-shrink-0">
                                    Last seen: {new Date(lastSeen).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{chargerId}</p>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Building size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{hubName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <Signal size={12} className={isOnline ? "text-green-500" : "text-red-400"} />
                              <span className="text-[9px] text-gray-500">OCPP</span>
                            </div>
                            {connectorStatus && connectorStatus.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1 justify-end">
                                {connectorStatus.slice(0, 4).map((conn, idx) => (
                                  <div key={idx} className="flex items-center gap-0.5">
                                    <div className={`w-2 h-2 rounded-full ${getConnectorStatusColor(conn.status)}`} />
                                    <span className="text-[8px] text-gray-500">{conn.connector_id}</span>
                                  </div>
                                ))}
                                {connectorStatus.length > 4 && (
                                  <span className="text-[8px] text-gray-400">+{connectorStatus.length - 4}</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                              {connectorStatus && connectorStatus.slice(0, 3).map((conn, idx) => (
                                <span key={idx} className="text-[8px] text-gray-600 bg-gray-50 px-1 py-0.5 rounded">
                                  {getConnectorStatusLabel(conn.status).slice(0, 4)}
                                </span>
                              ))}
                              {connectorStatus && connectorStatus.length > 3 && (
                                <span className="text-[8px] text-gray-400">+{connectorStatus.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {selectedCharger === chargerId && connectorStatus && connectorStatus.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap items-center gap-2 text-xs animate-fadeIn">
                            {connectorStatus.map((conn, idx) => (
                              <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${getConnectorStatusColor(conn.status)}/10 border border-${getConnectorStatusColor(conn.status)}/20`}>
                                {getConnectorStatusIcon(conn.status)}
                                <span className="font-medium text-gray-700">
                                  {conn.connector_id}: {getConnectorStatusLabel(conn.status)}
                                </span>
                                {conn.power && (
                                  <span className="text-gray-400">• {conn.power} kW</span>
                                )}
                              </div>
                            ))}
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg ml-auto">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-gray-500">OCPP {isOnline ? 'Connected' : 'Disconnected'}</span>
                              {lastSeen && (
                                <span className="text-gray-400">• {new Date(lastSeen).toLocaleTimeString()}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Charger Locations</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Map size={12} /> OpenStreetMap
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={14} />
                  <span>{filteredChargers.length} chargers</span>
                  {selectedHub !== "All Hubs" && <span className="text-gray-300">in {selectedHub}</span>}
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

                    {filteredChargers.slice(0, 15).map((charger, index) => {
                      const { isOnline } = getChargerOCPPStatus(charger.id || charger.charger_id);
                      const angle = (index / filteredChargers.length) * 2 * Math.PI;
                      const radius = 20 + (index % 3) * 10;
                      const centerX = 50;
                      const centerY = 50;
                      const x = centerX + radius * Math.cos(angle);
                      const y = centerY + radius * Math.sin(angle);
                      
                      return (
                        <div
                          key={charger.id || charger.charger_id || index}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                        >
                          <div className="relative">
                            <div className={`p-1.5 rounded-full shadow-lg transition-transform group-hover:scale-110 ${isOnline ? "bg-green-500" : "bg-red-500"} text-white border-2 border-white`}>
                              <MapPin size={14} />
                            </div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-white px-2 py-0.5 rounded text-[10px] shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              {charger.charger_name || charger.name || charger.id?.slice(0, 8)}
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                              <span className="text-[8px] text-gray-500 bg-white px-1 rounded shadow">
                                {isOnline ? '🟢' : '🔴'} OCPP
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

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
                  {filteredChargers.length} Chargers • {stats.totalConnectors} Connectors
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



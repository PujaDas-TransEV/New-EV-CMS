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
  ChevronLeft,
  CheckCircleIcon,
  TrendingDown,
  Minus,
  ChevronRight as ChevronRightIcon,
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

// ==================== CONNECTOR STATUS CONFIG ====================
const CONNECTOR_STATUS_CONFIG = {
  'AVAILABLE': {
    label: 'Available',
    icon: <CheckCircleIcon size={16} className="text-green-500" />,
    color: 'bg-green-500',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'green'
  },
  'CHARGING': {
    label: 'Charging',
    icon: <Zap size={16} className="text-blue-500" />,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    dotColor: 'blue'
  },
  'BUSY': {
    label: 'Busy',
    icon: <CircleDot size={16} className="text-yellow-500" />,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    dotColor: 'yellow'
  },
  'PREPARING': {
    label: 'Preparing',
    icon: <Clock size={16} className="text-orange-400" />,
    color: 'bg-orange-400',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    dotColor: 'orange'
  },
  'FINISHING': {
    label: 'Finishing',
    icon: <CheckCircle size={16} className="text-purple-500" />,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    dotColor: 'purple'
  },
  'RESERVED': {
    label: 'Reserved',
    icon: <Clock size={16} className="text-indigo-400" />,
    color: 'bg-indigo-400',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    dotColor: 'indigo'
  },
  'FAULTED': {
    label: 'Faulted',
    icon: <AlertCircle size={16} className="text-red-500" />,
    color: 'bg-red-500',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    dotColor: 'red'
  },
  'ERROR': {
    label: 'Error',
    icon: <CircleX size={16} className="text-red-600" />,
    color: 'bg-red-600',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    dotColor: 'red'
  },
  'UNAVAILABLE': {
    label: 'Unavailable',
    icon: <CircleOff size={16} className="text-gray-400" />,
    color: 'bg-gray-400',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    dotColor: 'gray'
  },
  'OFFLINE': {
    label: 'Offline',
    icon: <WifiOff size={16} className="text-gray-500" />,
    color: 'bg-gray-500',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    dotColor: 'gray'
  },
  'UNKNOWN': {
    label: 'Unknown',
    icon: <Circle size={16} className="text-gray-400" />,
    color: 'bg-gray-300',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    dotColor: 'gray'
  }
};

// ==================== GET CONNECTOR STATUS ====================
const getConnectorStatusDisplay = (status) => {
  if (!status) return CONNECTOR_STATUS_CONFIG['UNKNOWN'];
  const upperStatus = status.toUpperCase();
  return CONNECTOR_STATUS_CONFIG[upperStatus] || CONNECTOR_STATUS_CONFIG['UNKNOWN'];
};

// ==================== CURVE GRAPH CARD ====================
const CurveGraphCard = ({ title, value, subValue, icon, color, graphData, trend, trendValue, noData }) => {
  const maxValue = graphData && graphData.length > 0 ? Math.max(...graphData) : 1;
  const width = 160;
  const height = 45;
  const padding = 2;
  
  const points = graphData && graphData.length > 0 ? graphData.map((val, idx) => {
    const x = padding + (idx / (graphData.length - 1)) * (width - padding * 2);
    const y = height - padding - (val / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ') : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group">
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
      
      {graphData && graphData.length > 0 && (
        <div className="mt-2">
          <svg width="100%" height="45" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {graphData.length > 1 && (
              <polygon points={`${padding},${height} ${points} ${width - padding},${height}`} fill={`url(#gradient-${title})`} />
            )}
            {graphData.length > 1 && (
              <polyline points={points} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {graphData.map((val, idx) => {
              const x = padding + (idx / (graphData.length - 1)) * (width - padding * 2);
              const y = height - padding - (val / maxValue) * (height - padding * 2);
              return <circle key={idx} cx={x} cy={y} r="2.5" fill="#3B82F6" className="transition-all duration-300 hover:r-4 hover:fill-blue-400" />;
            })}
          </svg>
        </div>
      )}
      
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <>
            {trend === 'up' ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{trendValue || '0%'}</span>
            <span className="text-xs text-gray-400">vs last month</span>
          </>
        )}
        {noData && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={10} /> No Data</span>}
      </div>
    </div>
  );
};

// ==================== OCPP STATUS TAB ====================
const OcppStatusTab = ({ label, icon, count, color, isActive, onClick }) => {
  const colorClasses = {
    green: { active: 'bg-green-500 text-white border-green-500', inactive: 'text-green-700 border-green-200 hover:bg-green-50' },
    blue: { active: 'bg-blue-500 text-white border-blue-500', inactive: 'text-blue-700 border-blue-200 hover:bg-blue-50' },
    yellow: { active: 'bg-yellow-500 text-white border-yellow-500', inactive: 'text-yellow-700 border-yellow-200 hover:bg-yellow-50' },
    orange: { active: 'bg-orange-400 text-white border-orange-400', inactive: 'text-orange-700 border-orange-200 hover:bg-orange-50' },
    purple: { active: 'bg-purple-500 text-white border-purple-500', inactive: 'text-purple-700 border-purple-200 hover:bg-purple-50' },
    red: { active: 'bg-red-500 text-white border-red-500', inactive: 'text-red-700 border-red-200 hover:bg-red-50' },
    gray: { active: 'bg-gray-500 text-white border-gray-500', inactive: 'text-gray-600 border-gray-300 hover:bg-gray-50' }
  };

  const classes = isActive ? colorClasses[color].active : colorClasses[color].inactive;

  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shadow-sm hover:shadow-md ${isActive ? 'ring-2 ring-offset-1 ring-' + color + '-400' : ''} ${classes}`}>
      {icon && <span className={isActive ? 'text-white' : ''}>{icon}</span>}
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : `bg-${color}-100 text-${color}-700`}`}>{count}</span>
    </button>
  );
};

// ==================== FILTER DROPDOWN ====================
const FilterDropdown = ({ options, selected, onSelect, onClose }) => (
  <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
    {options.map((opt) => {
      const isObject = typeof opt === 'object';
      const value = isObject ? opt.value : opt;
      const label = isObject ? opt.label : opt;
      const icon = isObject ? opt.icon : null;
      return (
        <button key={value} onClick={() => { onSelect(value); onClose(); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${selected === value ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}>
          {icon && <span>{icon}</span>}{label}
        </button>
      );
    })}
  </div>
);

// ==================== MAIN DASHBOARD ====================
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, authenticatedRequest, isRefreshing, isAuthenticated } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showCustomizePopup, setShowCustomizePopup] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("This Month");
  const [selectedState, setSelectedState] = useState("All States");
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hubChargersMap, setHubChargersMap] = useState({});
  const [ocppStatusFilter, setOcppStatusFilter] = useState("All");
  const [filteredRevenue, setFilteredRevenue] = useState(null);
  const [filteredSessions, setFilteredSessions] = useState(null);
  const [filteredUsage, setFilteredUsage] = useState(null);
  
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

  // Filter options
  const filterOptions = ["Today", "Yesterday", "This Week", "This Month", "This Year"];
  const stateOptions = ["All States", "West Bengal"];
  
  const networkOptions = [
    { value: "All Network", label: "All Network", icon: <Signal size={14} className="text-gray-500" /> },
    { value: "Online", label: "Online (OCPP)", icon: <Wifi size={14} className="text-green-500" /> },
    { value: "Offline", label: "Offline (OCPP)", icon: <WifiOff size={14} className="text-red-500" /> }
  ];

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // ==================== FETCH FUNCTIONS ====================
  const fetchFleetData = async () => {
    setLoadingFleet(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.FLEET_API, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setFleetData(data);
        console.log('Fleet data fetched:', data);
      }
    } catch (err) {
      console.error('Error fetching fleet data:', err);
    } finally {
      setLoadingFleet(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.ANALYTICS_API, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        console.log('Analytics data fetched:', data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchChargers = async () => {
    setLoadingChargers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGERS_API, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const chargersList = data.chargers || data.data || data || [];
        setChargers(chargersList);
        console.log('Chargers fetched:', chargersList);
      }
    } catch (err) {
      console.error('Error fetching chargers:', err);
      setChargers([]);
    } finally {
      setLoadingChargers(false);
    }
  };

  const fetchHubs = async () => {
    setLoadingHubs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUBS_API, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const hubsList = data.hubs || data.data || data || [];
        setHubs(hubsList);
        console.log('Hubs fetched:', hubsList);
      }
    } catch (err) {
      console.error('Error fetching hubs:', err);
      setHubs([]);
    } finally {
      setLoadingHubs(false);
    }
  };

  const fetchHubChargers = async (hubId) => {
    if (!hubId) return;
    setLoadingHubChargers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUB_CHARGERS_API(hubId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const chargersList = data.chargers || data.data || data || [];
        setHubChargers(chargersList);
        setHubChargersMap(prev => ({ ...prev, [hubId]: chargersList }));
        console.log(`Hub chargers fetched for ${hubId}:`, chargersList);
      } else {
        setHubChargers([]);
      }
    } catch (err) {
      console.error('Error fetching hub chargers:', err);
      setHubChargers([]);
    } finally {
      setLoadingHubChargers(false);
    }
  };

  const fetchUserInfo = async () => {
    setLoadingUser(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        setUserName(userData.full_name || userData.name || userData.firstname || 'User');
        setUserEmail(userData.email || userData.userEmail || '');
        setUserRole(data.role || userData.role || '');
        setUserAvatar(userData.avatar || userData.profileImage || null);
      } else if (user) {
        setUserName(user.name || 'User');
        setUserEmail(user.email || '');
        setUserRole(user.role || '');
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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authenticatedRequest(API_CONFIG.LOGOUT_API, { method: 'POST' });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
    }
  };

  const refreshDashboard = () => {
    console.log('Refreshing dashboard...');
    setLastUpdated(new Date().toLocaleTimeString());
    fetchUserInfo();
    fetchFleetData();
    fetchAnalytics();
    fetchChargers();
    fetchHubs();
    if (selectedHub !== "All Hubs") {
      const hub = hubs.find(h => h.name === selectedHub || h.id === selectedHub);
      if (hub) fetchHubChargers(hub.id);
    }
  };

  // ==================== USE EFFECTS ====================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    refreshDashboard();
  }, [isAuthenticated]);

  useEffect(() => {
    let intervalId = null;
    if (autoRefresh && isAuthenticated) {
      intervalId = setInterval(refreshDashboard, 30000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [autoRefresh, isAuthenticated]);

  useEffect(() => {
    if (selectedHub !== "All Hubs") {
      const hub = hubs.find(h => h.name === selectedHub || h.id === selectedHub);
      if (hub) {
        if (hubChargersMap[hub.id]) {
          setHubChargers(hubChargersMap[hub.id]);
        } else {
          fetchHubChargers(hub.id);
        }
      }
    } else {
      setHubChargers([]);
    }
  }, [selectedHub, hubs]);

  // ==================== GET DATA FUNCTIONS ====================
  const getAnalyticsSummary = () => {
    if (!analyticsData) {
      return { total_chargers: 0, total_connectors: 0, total_revenue: '0', total_usage: '0', total_sessions: 0 };
    }
    const data = analyticsData.data || analyticsData || {};
    return {
      total_chargers: data.total_chargers || 0,
      total_connectors: data.total_connectors || 0,
      total_revenue: data.total_revenue || '0',
      total_usage: data.total_usage || '0',
      total_sessions: data.total_sessions || 0
    };
  };

  const getFleetStats = () => {
    if (!fleetData) {
      return { totalChargers: 0, onlineChargers: 0, offlineChargers: 0, availableConnectors: 0, busyConnectors: 0, preparingConnectors: 0, totalConnectors: 0, chargingConnectors: 0, errorConnectors: 0 };
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

  const getChargerLiveData = (charger) => charger?.live || null;
  
  const getChargerConnectionState = (charger) => {
    const live = getChargerLiveData(charger);
    return live?.charger?.connection_state || 'UNKNOWN';
  };

  const getChargerLastSeen = (charger) => {
    const live = getChargerLiveData(charger);
    return live?.charger?.connection_observed_at || null;
  };

  const getConnectorLiveData = (charger, connector) => {
    const live = getChargerLiveData(charger);
    if (!live?.connectors) return null;
    let found = live.connectors.find(lc => String(lc.connector_id) === String(connector.id));
    if (!found) {
      found = live.connectors.find(lc => Number(lc.connector_number) === Number(connector.connector_number));
    }
    return found || null;
  };

  const getConnectorOCPPStatus = (charger, connector) => {
    const liveConn = getConnectorLiveData(charger, connector);
    return liveConn?.last_ocpp_status || 'UNKNOWN';
  };

  const getConnectorAvailability = (charger, connector) => {
    const liveConn = getConnectorLiveData(charger, connector);
    return liveConn?.availability || 'UNKNOWN';
  };

  const isChargerOnline = (charger) => {
    const state = getChargerConnectionState(charger);
    return state === 'ONLINE';
  };

  const getConnectorStatusCounts = (charger) => {
    const counts = {};
    const connectors = charger?.connectors || [];
    connectors.forEach(connector => {
      const status = getConnectorOCPPStatus(charger, connector);
      const key = status.toUpperCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  };

  const getLiveConnectorStats = () => {
    const stats = { total: 0, available: 0, charging: 0, busy: 0, preparing: 0, finishing: 0, faulted: 0, unavailable: 0, unknown: 0, online: 0, offline: 0 };
    chargers.forEach(charger => {
      const connectors = charger?.connectors || [];
      connectors.forEach(connector => {
        stats.total++;
        const ocppStatus = getConnectorOCPPStatus(charger, connector);
        const availability = getConnectorAvailability(charger, connector);
        const statusKey = ocppStatus.toUpperCase();
        if (statusKey === 'AVAILABLE') stats.available++;
        else if (statusKey === 'CHARGING') stats.charging++;
        else if (statusKey === 'BUSY' || statusKey === 'OCCUPIED') stats.busy++;
        else if (statusKey === 'PREPARING') stats.preparing++;
        else if (statusKey === 'FINISHING') stats.finishing++;
        else if (statusKey === 'FAULTED' || statusKey === 'ERROR') stats.faulted++;
        else if (availability === 'UNAVAILABLE') stats.unavailable++;
        else stats.unknown++;
        if (getChargerConnectionState(charger) === 'ONLINE') stats.online++;
        else if (getChargerConnectionState(charger) === 'OFFLINE') stats.offline++;
      });
    });
    return stats;
  };

  const analyticsSummary = getAnalyticsSummary();
  const stats = getFleetStats();
  const liveConnectorStats = getLiveConnectorStats();

  // ==================== GET OCPP STATUS COUNTS ====================
  const getOcppStatusCounts = () => {
    const counts = {
      All: 0,
      Available: 0,
      Charging: 0,
      Busy: 0,
      Preparing: 0,
      Finishing: 0,
      Faulted: 0,
      Unknown: 0
    };
    
    chargers.forEach(charger => {
      const connectors = charger?.connectors || [];
      connectors.forEach(connector => {
        const status = getConnectorOCPPStatus(charger, connector);
        const key = status.toUpperCase();
        counts.All++;
        if (key === 'AVAILABLE') counts.Available++;
        else if (key === 'CHARGING') counts.Charging++;
        else if (key === 'BUSY' || key === 'OCCUPIED') counts.Busy++;
        else if (key === 'PREPARING') counts.Preparing++;
        else if (key === 'FINISHING') counts.Finishing++;
        else if (key === 'FAULTED' || key === 'ERROR') counts.Faulted++;
        else counts.Unknown++;
      });
    });
    return counts;
  };

  const ocppCounts = getOcppStatusCounts();

  // ==================== GET HUB NAME BY ID ====================
  const getHubName = (hubId) => {
    if (!hubId) return 'No Hub';
    const hub = hubs.find(h => h.id === hubId);
    return hub?.name || hub?.hub_name || 'No Hub';
  };

  // ==================== FILTER CHARGERS ====================
  const getDisplayChargers = () => {
    if (selectedHub !== "All Hubs") return hubChargers;
    return chargers;
  };

  const displayChargers = getDisplayChargers();

  const filteredChargers = displayChargers.filter((charger) => {
    const matchesSearch = charger.charger_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.charger_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charger.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const online = isChargerOnline(charger);
    const matchesNetwork = selectedNetwork === "All Network" || 
                          (selectedNetwork === "Online" && online) ||
                          (selectedNetwork === "Offline" && !online);
    let matchesConnectorStatus = true;
    if (connectorFilter !== "All") {
      const connectors = charger?.connectors || [];
      matchesConnectorStatus = connectors.some(conn => {
        const status = getConnectorOCPPStatus(charger, conn);
        return status.toUpperCase() === connectorFilter.toUpperCase();
      });
    }
    let matchesOcppStatus = true;
    if (ocppStatusFilter !== "All") {
      const connectors = charger?.connectors || [];
      matchesOcppStatus = connectors.some(conn => {
        const status = getConnectorOCPPStatus(charger, conn);
        return status.toUpperCase() === ocppStatusFilter.toUpperCase();
      });
    }
    return matchesSearch && matchesNetwork && matchesConnectorStatus && matchesOcppStatus;
  });

  const hubOptions = ["All Hubs", ...new Set(hubs.map(h => h.name || h.id).filter(Boolean))];

  // ==================== CALENDAR FUNCTIONS ====================
  const daysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setSelectedFilter(formattedDate);
    setShowCalendar(false);
    setShowFilterDropdown(false);
    filterDataByDate(date);
  };

  const filterDataByDate = (date) => {
    console.log('Filtering data for date:', date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    setFilteredRevenue(analyticsSummary.total_revenue);
    setFilteredSessions(analyticsSummary.total_sessions);
    setFilteredUsage(analyticsSummary.total_usage);
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-6 z-50 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span>Showing data for ${formattedDate}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  const { days, firstDay } = daysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  // ==================== GENERATE GRAPH DATA ====================
  const generateGraphData = () => [15, 25, 20, 35, 30, 45, 40, 55, 50, 65, 60, 70];
  const graphData = generateGraphData();

  // ==================== SETTINGS MENU ====================
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userAvatar ? <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" /> : userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">{userName}</h4>
            <p className="text-sm text-gray-400 truncate">{userEmail || 'user@transev.com'}</p>
            {userRole && <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">{userRole}</span>}
          </div>
        </div>
      </div>
      <div className="p-2">
        <button onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <UserIcon size={16} className="text-gray-500" /> <span>Profile</span>
        </button>
        <button onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Building size={16} className="text-gray-500" /> <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1" />
        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition">
          <LogOut size={16} className="text-red-500" /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Plus size={18} className="text-gray-500" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Plus size={18} className="text-gray-500" /> Add Charger
        </button>
      </div>
    </div>
  );

  // ==================== CUSTOMIZE POPUP ====================
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

  // ==================== CLICK OUTSIDE HANDLER ====================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
      if (showStateDropdown && !event.target.closest('.state-dropdown-container')) {
        setShowStateDropdown(false);
      }
      if (showNetworkDropdown && !event.target.closest('.network-dropdown-container')) {
        setShowNetworkDropdown(false);
      }
      if (showHubDropdown && !event.target.closest('.hub-dropdown-container')) {
        setShowHubDropdown(false);
      }
      if (showCalendar && !event.target.closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown, showStateDropdown, showNetworkDropdown, showHubDropdown, showCalendar]);

  // ==================== RENDER KPI CARDS ====================
  const renderKpiCards = () => {
    const revenue = filteredRevenue !== null ? filteredRevenue : analyticsSummary.total_revenue;
    const sessions = filteredSessions !== null ? filteredSessions : analyticsSummary.total_sessions;
    const usage = filteredUsage !== null ? filteredUsage : analyticsSummary.total_usage;
    
    const kpiMap = {
      revenue: {
        title: "Revenue",
        value: revenue ? `₹ ${Number(revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "—",
        subValue: `${sessions || 0} sessions`,
        icon: <Wallet size={18} className="text-green-600" />,
        color: "bg-green-100",
        noData: !revenue || revenue === '0'
      },
      sessions: {
        title: "No of Sessions",
        value: sessions || 0,
        subValue: `${analyticsSummary.total_chargers} chargers`,
        icon: <Activity size={18} className="text-blue-600" />,
        color: "bg-blue-100",
        noData: !sessions
      },
      usage: {
        title: "Usage",
        value: usage ? `${Number(usage).toFixed(2)} kWh` : "—",
        subValue: `${analyticsSummary.total_connectors} connectors`,
        icon: <Zap size={18} className="text-yellow-600" />,
        color: "bg-yellow-100",
        noData: !usage || usage === '0'
      },
      online: {
        title: "Online Percentage",
        value: stats.totalChargers > 0 ? `${Math.round((stats.onlineChargers / stats.totalChargers) * 100)}%` : '—',
        subValue: `${stats.onlineChargers} online · ${stats.offlineChargers} offline`,
        icon: <Wifi size={18} className="text-purple-600" />,
        color: "bg-purple-100",
        noData: stats.totalChargers === 0
      }
    };

    return selectedKPIs.map((kpi) => {
      const data = kpiMap[kpi.id];
      if (!data) return null;
      
      return (
        <CurveGraphCard
          key={kpi.id}
          title={data.title}
          value={data.value}
          subValue={data.subValue}
          icon={data.icon}
          color={data.color}
          graphData={graphData}
          trend="up"
          trendValue="12%"
          noData={data.noData}
        />
      );
    }).filter(Boolean);
  };

  // ==================== LOADING STATE ====================
  if (isRefreshing || loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">{isRefreshing ? 'Refreshing session...' : 'Loading...'}</p>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
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
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                <span className="text-[15px] text-gray-600 font-medium">Auto Refresh</span>
                <button onClick={() => { setAutoRefresh(!autoRefresh); if (!autoRefresh) refreshDashboard(); }} className={`w-7 h-3.5 rounded-full transition-all relative ${autoRefresh ? "bg-blue-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${autoRefresh ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <Settings size={18} className="text-gray-600" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm">
                  <Plus size={16} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* ==================== FILTER SECTION ==================== */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Left Side - Filter Dropdown with Calendar */}
            <div className="flex items-center gap-4 relative filter-dropdown-container">
              <div className="relative">
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
                  className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200"
                >
                  <Calendar size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{selectedFilter}</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 min-w-[200px]">
                    <div className="space-y-1">
                      {["Today", "Yesterday", "This Week", "This Month", "This Year"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedFilter(option);
                            setShowFilterDropdown(false);
                            setFilteredRevenue(null);
                            setFilteredSessions(null);
                            setFilteredUsage(null);
                            if (option === "Today") {
                              setSelectedDate(new Date());
                              filterDataByDate(new Date());
                            }
                          }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition ${
                            selectedFilter === option 
                              ? "bg-blue-50 text-blue-600 font-medium" 
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <button
                      onClick={() => {
                        setShowFilterDropdown(false);
                        setShowCalendar(true);
                      }}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Calendar size={16} className="text-gray-400" />
                      <span>Calendar</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Calendar Popup */}
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 w-[340px] calendar-container">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
                    <span className="font-semibold text-gray-800">{monthName} {year}</span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRightIcon size={18} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="py-1" />)}
                    {Array.from({ length: days }, (_, i) => {
                      const day = i + 1;
                      const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
                      const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                      return (
                        <button 
                          key={day} 
                          onClick={() => handleDateSelect(day)} 
                          className={`py-1 rounded-lg text-sm transition ${isSelected ? 'bg-blue-600 text-white' : isToday ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
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
                        setFilteredRevenue(null);
                        setFilteredSessions(null);
                        setFilteredUsage(null);
                        filterDataByDate(new Date());
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
              )}
            </div>

            {/* Right Side - Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative state-dropdown-container">
                <button onClick={() => setShowStateDropdown(!showStateDropdown)} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1">
                  <Globe size={14} /> {selectedState} <ChevronDown size={14} />
                </button>
                {showStateDropdown && <FilterDropdown options={stateOptions} selected={selectedState} onSelect={setSelectedState} onClose={() => setShowStateDropdown(false)} />}
              </div>

              <div className="relative hub-dropdown-container">
                <button onClick={() => setShowHubDropdown(!showHubDropdown)} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1">
                  <Building size={14} /> {selectedHub} <ChevronDown size={14} />
                </button>
                {showHubDropdown && <FilterDropdown options={hubOptions} selected={selectedHub} onSelect={setSelectedHub} onClose={() => setShowHubDropdown(false)} />}
              </div>

              <button onClick={() => setShowCustomizePopup(true)} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1">
                <Settings size={14} /> Customize
              </button>

              {/* <button onClick={refreshDashboard} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500" title="Refresh">
                <RefreshCw size={16} className={loadingChargers || loadingFleet ? 'animate-spin' : ''} />
              </button>
              {lastUpdated && <span className="text-xs text-gray-400">Last updated: {lastUpdated}</span>} */}
            </div>
          </div>
        </div>

        {/* ==================== KPI CARDS ==================== */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {renderKpiCards()}
          </div>

          {/* ==================== STATS ROW ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Plug size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Chargers</p>
                  <p className="text-2xl font-bold text-gray-800">{analyticsSummary.total_chargers}</p>
                  <p className="text-xs text-gray-400">{stats.onlineChargers} online · {stats.offlineChargers} offline</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                  <Battery size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Connectors</p>
                  <p className="text-2xl font-bold text-gray-800">{analyticsSummary.total_connectors}</p>
                  <p className="text-xs text-gray-400">{liveConnectorStats.available} available · {liveConnectorStats.charging} charging</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                  <Wifi size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Online Chargers (OCPP)</p>
                  <p className="text-2xl font-bold text-green-600">{stats.onlineChargers}</p>
                  <p className="text-xs text-gray-400">{stats.totalChargers > 0 ? `${Math.round((stats.onlineChargers / stats.totalChargers) * 100)}% online` : 'No data'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== OCPP STATUS TABS & CHARGER LIST ==================== */}
        <div className="px-6 pt-0 pb-6">
          {/* OCPP Status Tabs & Network Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5 shadow-sm network-dropdown-container">
              <Signal size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Charger Network:</span>
              <div className="relative">
                <button onClick={() => setShowNetworkDropdown(!showNetworkDropdown)} className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  {selectedNetwork === "Online" && <Wifi size={14} className="text-green-500" />}
                  {selectedNetwork === "Offline" && <WifiOff size={14} className="text-red-500" />}
                  {selectedNetwork === "All Network" && <Signal size={14} className="text-gray-500" />}
                  {selectedNetwork} <ChevronDown size={14} className="text-gray-400" />
                </button>
                {showNetworkDropdown && <FilterDropdown options={networkOptions} selected={selectedNetwork} onSelect={setSelectedNetwork} onClose={() => setShowNetworkDropdown(false)} />}
              </div>
            </div>

            {/* OCPP Status Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-gray-500 mr-1">OCPP Status:</span>
              {[
                { value: 'All', label: 'All', icon: null, color: 'blue' },
                { value: 'Available', label: 'Available', icon: <CheckCircleIcon size={12} className="text-green-500" />, color: 'green' },
                { value: 'Charging', label: 'Charging', icon: <Zap size={12} className="text-blue-500" />, color: 'blue' },
                { value: 'Busy', label: 'Busy', icon: <CircleDot size={12} className="text-yellow-500" />, color: 'yellow' },
                { value: 'Preparing', label: 'Preparing', icon: <Clock size={12} className="text-orange-400" />, color: 'orange' },
                { value: 'Finishing', label: 'Finishing', icon: <CheckCircle size={12} className="text-purple-500" />, color: 'purple' },
                { value: 'Faulted', label: 'Faulted', icon: <AlertCircle size={12} className="text-red-500" />, color: 'red' },
                { value: 'Unknown', label: 'Unknown', icon: <Circle size={12} className="text-gray-400" />, color: 'gray' }
              ].map(({ value, label, icon, color }) => {
                const count = ocppCounts[value] || 0;
                return (
                  <OcppStatusTab
                    key={value}
                    label={label}
                    icon={icon}
                    count={count}
                    color={color}
                    isActive={ocppStatusFilter === value}
                    onClick={() => setOcppStatusFilter(value)}
                  />
                );
              })}
            </div>

            <div className="flex-1 min-w-[150px]">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5 shadow-sm">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chargers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 focus:ring-0 outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
                {searchQuery && <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}>
                <Grid size={16} />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}>
                <List size={16} />
              </button>
            </div>
          </div>

          {/* ==================== CHARGER LIST & MAP ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Charger List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <span className="text-sm font-medium text-gray-700">
                  Chargers ({filteredChargers.length})
                  {selectedHub !== "All Hubs" && <span className="text-xs text-gray-400 ml-1">in {selectedHub}</span>}
                </span>
                <span className="text-xs text-gray-400">Click to expand</span>
              </div>

              <style>{`
                .charger-list::-webkit-scrollbar { width: 6px; height: 6px; }
                .charger-list::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .charger-list::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #3b82f6, #2563eb); border-radius: 10px; }
                .charger-list { scrollbar-width: thin; scrollbar-color: #3b82f6 #f1f1f1; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .charger-name { font-weight: 700; font-size: 1rem; }
                .connector-status-dot { transition: all 0.2s ease; }
                .connector-status-dot:hover { transform: scale(1.3); }
              `}</style>

              <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto charger-list">
                {loadingChargers || loadingHubChargers ? (
                  <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="text-sm text-gray-500 mt-3">Loading chargers...</p></div>
                ) : filteredChargers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border-2 border-dashed border-blue-300">
                      <Plug size={40} className="text-blue-300" />
                    </div>
                    <p className="text-base font-semibold text-gray-600">No Chargers Found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredChargers.map((charger) => {
                    const chargerId = charger.id || charger.charger_id;
                    const chargerName = charger.charger_name || charger.name || 'Unnamed Charger';
                    // Get hub name from hubs list using hub_id
                    const hubId = charger.hub_id || charger.hub;
                    const hubName = getHubName(hubId);
                    const isOnline = isChargerOnline(charger);
                    const lastSeen = getChargerLastSeen(charger);
                    const connectorCounts = getConnectorStatusCounts(charger);
                    const totalConnectors = charger.connectors?.length || 0;
                    const connectionState = getChargerConnectionState(charger);

                    return (
                      <div key={chargerId} onClick={() => setSelectedCharger(chargerId === selectedCharger ? null : chargerId)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${selectedCharger === chargerId ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100/50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="relative flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}>
                                <div className={`absolute -inset-1 rounded-full animate-ping ${isOnline ? "bg-green-500/30" : "bg-red-500/30"}`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="charger-name text-gray-900 truncate">{chargerName}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {isOnline ? "Online" : "Offline"}
                                </span>
                                {connectionState !== 'ONLINE' && connectionState !== 'OFFLINE' && (
                                  <span className="text-[9px] text-gray-400 flex-shrink-0">{connectionState}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{chargerId}</p>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Building size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate font-medium text-gray-600">{hubName}</span>
                                <span className="text-[9px] text-gray-300">• {charger.charger_type || 'N/A'}</span>
                                <span className="text-[9px] text-gray-300">• {charger.max_power_kw || 0} kW</span>
                              </p>
                              {lastSeen && !isOnline && <p className="text-[9px] text-gray-400 mt-0.5">Last seen: {new Date(lastSeen).toLocaleTimeString()}</p>}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <Signal size={12} className={isOnline ? "text-green-500" : "text-red-400"} />
                              <span className="text-[9px] text-gray-500">OCPP</span>
                            </div>
                            {totalConnectors > 0 ? (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 justify-end">
                                {Object.keys(connectorCounts).map((status) => {
                                  const config = getConnectorStatusDisplay(status);
                                  const count = connectorCounts[status];
                                  return (
                                    <div key={status} className="flex items-center gap-0.5 connector-status-dot group/conn" title={`${config.label}: ${count} connector${count > 1 ? 's' : ''}`}>
                                      <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                                      <span className="text-[8px] text-gray-600 font-medium group-hover/conn:text-gray-900 transition">{count}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-[9px] text-gray-400">No connectors</span>
                            )}
                            {totalConnectors > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-0.5 justify-end">
                                {Object.keys(connectorCounts).slice(0, 3).map((status) => {
                                  const config = getConnectorStatusDisplay(status);
                                  const count = connectorCounts[status];
                                  return (
                                    <span key={status} className={`text-[8px] ${config.textColor} ${config.bgColor} px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
                                      {config.icon} {count}
                                    </span>
                                  );
                                })}
                                {Object.keys(connectorCounts).length > 3 && <span className="text-[8px] text-gray-400">+{Object.keys(connectorCounts).length - 3}</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedCharger === chargerId && charger.connectors && charger.connectors.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap items-center gap-2 text-xs animate-fadeIn">
                            {charger.connectors.map((conn, idx) => {
                              const ocppStatus = getConnectorOCPPStatus(charger, conn);
                              const config = getConnectorStatusDisplay(ocppStatus);
                              return (
                                <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                                  {config.icon}
                                  <span className="font-medium text-gray-700">Conn {conn.connector_number || idx + 1}</span>
                                  <span className="text-gray-600">{config.label}</span>
                                  {conn.connector_type && <span className="text-gray-400 text-[10px]">• {conn.connector_type}</span>}
                                  {conn.connector_total_capacity && <span className="text-gray-400 text-[10px]">• {conn.connector_total_capacity} kW</span>}
                                </div>
                              );
                            })}
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg ml-auto">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-gray-500">OCPP {isOnline ? 'Connected' : 'Disconnected'}</span>
                              {lastSeen && <span className="text-gray-400">• {new Date(lastSeen).toLocaleTimeString()}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ==================== MAP VIEW ==================== */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Charger Locations</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Map size={12} /> Google Maps
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={14} />
                  <span>{filteredChargers.length} chargers</span>
                  {selectedHub !== "All Hubs" && <span className="text-gray-300">in {selectedHub}</span>}
                </div>
              </div>
              <div className="relative h-[500px] bg-[#e8f0f8]">
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
                      <div className="absolute top-1/3 left-0 right-0 h-[3px] bg-[#d4dce8]/60" />
                      <div className="absolute top-2/3 left-0 right-0 h-[3px] bg-[#d4dce8]/60" />
                      <div className="absolute left-1/3 top-0 bottom-0 w-[3px] bg-[#d4dce8]/60" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-[3px] bg-[#d4dce8]/60" />
                    </div>

                    {filteredChargers.slice(0, 20).map((charger, index) => {
                      const online = isChargerOnline(charger);
                      const angle = (index / Math.min(filteredChargers.length, 20)) * 2 * Math.PI;
                      const radius = 25 + (index % 4) * 8;
                      const centerX = 50;
                      const centerY = 50;
                      const x = centerX + radius * Math.cos(angle);
                      const y = centerY + radius * Math.sin(angle);
                      
                      return (
                        <div key={charger.id || charger.charger_id || index} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" style={{ left: `${x}%`, top: `${y}%` }}>
                          <div className="relative">
                            <div className={`relative ${online ? 'text-green-500' : 'text-red-500'}`}>
                              <div className={`w-8 h-8 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110`}>
                                <MapPin size={16} fill="white" />
                              </div>
                              {online && <div className="absolute -inset-2 rounded-full bg-green-500/30 animate-ping" />}
                            </div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 min-w-[180px]">
                              <div className="p-3">
                                <p className="text-sm font-semibold text-gray-800">{charger.charger_name || charger.name || 'Unnamed'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{charger.charger_id}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {online ? '🟢 Online' : '🔴 Offline'}
                                  </span>
                                  <span className="text-xs text-gray-400">{charger.charger_type || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200" />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="absolute top-[12%] left-[18%] bg-white/90 px-3 py-1.5 rounded-lg shadow-md border border-gray-200/50 text-xs font-medium text-gray-600 flex items-center gap-1">
                      <MapPin size={12} className="text-blue-500" /> Salt Lake
                    </div>
                    <div className="absolute top-[35%] left-[48%] bg-white/90 px-3 py-1.5 rounded-lg shadow-md border border-gray-200/50 text-xs font-medium text-gray-600 flex items-center gap-1">
                      <MapPin size={12} className="text-blue-500" /> Newtown
                    </div>
                    <div className="absolute top-[55%] left-[68%] bg-white/90 px-3 py-1.5 rounded-lg shadow-md border border-gray-200/50 text-xs font-medium text-gray-600 flex items-center gap-1">
                      <MapPin size={12} className="text-blue-500" /> Rajarhat
                    </div>
                    <div className="absolute top-[72%] left-[28%] bg-white/90 px-3 py-1.5 rounded-lg shadow-md border border-gray-200/50 text-xs font-medium text-gray-600 flex items-center gap-1">
                      <MapPin size={12} className="text-blue-500" /> Airport
                    </div>
                    <div className="absolute top-[85%] left-[55%] bg-white/90 px-3 py-1.5 rounded-lg shadow-md border border-gray-200/50 text-xs font-medium text-gray-600 flex items-center gap-1">
                      <MapPin size={12} className="text-blue-500" /> Howrah
                    </div>

                    <div className="absolute top-[4%] left-[50%] transform -translate-x-1/2 bg-white/95 px-6 py-2 rounded-full shadow-lg border border-gray-200">
                      <span className="text-xs font-bold text-gray-700">Kolkata Metropolitan Area</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-1 shadow-lg">
                  <button className="w-10 h-10 bg-white rounded-t-lg hover:bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-200 transition active:bg-gray-100">
                    <Plus size={20} />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-b-lg hover:bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-200 border-t-0 transition active:bg-gray-100">
                    <Minus size={20} />
                  </button>
                </div>

                <div className="absolute top-3 left-3 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:bg-gray-50 cursor-pointer transition">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                    <Compass size={20} />
                  </div>
                </div>

                <div className="absolute bottom-24 right-3 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:bg-gray-50 cursor-pointer transition">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-24 left-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-[10px] text-gray-500">
                  Zoom: 15
                </div>

                <div className="absolute bottom-3 left-3 bg-white/95 px-4 py-2 rounded-lg shadow-md border border-gray-200 text-xs text-gray-600 flex items-center gap-3">
                  <MapPin size={12} className="text-blue-600" />
                  <span className="font-medium">{filteredChargers.length} Chargers</span>
                  <span className="w-px h-4 bg-gray-300" />
                  <span>{liveConnectorStats.total} Connectors</span>
                  <span className="w-px h-4 bg-gray-300" />
                  <span className={`${stats.onlineChargers > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>
                    {stats.onlineChargers} Online
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-[9px] text-gray-400">
                  Map data © Google Maps
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Popup */}
      {showCustomizePopup && <CustomizePopup />}
    </div>
  );
};

export default Dashboard;
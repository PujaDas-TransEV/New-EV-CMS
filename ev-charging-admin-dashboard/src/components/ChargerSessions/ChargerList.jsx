import React, { useState, useEffect, useCallback } from 'react';
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
  GripVertical,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2,
  CircleOff,
  CircleAlert,
  PowerOff,
  Power as PowerIcon,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return { success: false, error: 'No refresh token available' };
  }

  try {
    const response = await fetch(API_CONFIG.REFRESH_TOKEN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CPO-App-ID': CPO_APP_ID
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await response.json();

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
      return { success: false, error: data.message || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

const fetchWithTokenRefresh = async (url, options = {}, retryCount = 2) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'X-CPO-App-ID': CPO_APP_ID,
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 401 && retryCount > 0) {
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
          }
        });
        
        if (retryResponse.ok) {
          return retryResponse;
        } else if (retryResponse.status === 401 && retryCount > 1) {
          return fetchWithTokenRefresh(url, options, retryCount - 1);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('userInfo');
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const ChargersAndSessions = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chargers');
  
  // Chargers state
  const [chargers, setChargers] = useState([]);
  const [pagination, setPagination] = useState({
    before: null,
    before_id: null,
    limit: 50,
    has_more: false,
    total: 0
  });
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filter states
  const [connectorStatusFilter, setConnectorStatusFilter] = useState('All');
  const [chargerStatusFilter, setChargerStatusFilter] = useState('All');

  // Dummy sessions data
  const dummySessions = [
    {
      id: "SES-001",
      session_id: "SES-2026-001",
      hub_name: "Newtown Hub",
      charger_name: "Benny 7.4kWh",
      driver_name: "John Doe",
      start_time: "2026-08-03T14:30:00+05:30",
      duration_minutes: 135,
      energy_consumed: 45.5,
      status: "Completed",
      cost: "₹ 386.75",
      anomaly_detected: false
    }
  ];

  // Fetch chargers
  const fetchChargers = useCallback(async (before = null, before_id = null) => {
    if (loadingMore) return;
    
    setLoading(true);
    setError('');
    
    try {
      let url = `${API_CONFIG.CHARGERS_API}?limit=${pagination.limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      const response = await fetchWithTokenRefresh(url, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const chargersData = data.chargers || data.data || data || [];
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || chargersData.length;

        setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
        setPagination({
          before: nextBefore,
          before_id: nextBeforeId,
          limit: pagination.limit,
          has_more: hasMore,
          total: total
        });
      } else {
        setError(data.message || data.error?.message || 'Failed to fetch chargers');
      }
    } catch (error) {
      console.error('Error fetching chargers:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.limit]);

  // Load more chargers
  const loadMoreChargers = () => {
    if (pagination.has_more && !loadingMore && !loading) {
      setLoadingMore(true);
      fetchChargers(pagination.before, pagination.before_id);
    }
  };

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchChargers();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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
            'X-CPO-App-ID': CPO_APP_ID,
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

  // Navigate to charger details
  const handleViewCharger = (chargerId) => {
    navigate(`/charger-details/${chargerId}`);
  };

  // Navigate to sessions
  const handleGoToSessions = () => {
    navigate('/sessions');
  };

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

  // Get charger status color
  const getChargerStatusColor = (status) => {
    const colors = {
      'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
      'CHARGING': 'bg-blue-100 text-blue-700 border-blue-200',
      'PREPARING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'SUSPENDED_EV': 'bg-orange-100 text-orange-700 border-orange-200',
      'SUSPENDED_EVSE': 'bg-orange-100 text-orange-700 border-orange-200',
      'FINISHING': 'bg-purple-100 text-purple-700 border-purple-200',
      'RESERVED': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'UNAVAILABLE': 'bg-red-100 text-red-700 border-red-200',
      'FAULTED': 'bg-red-100 text-red-700 border-red-200',
      'OFFLINE': 'bg-gray-100 text-gray-700 border-gray-200',
      'UNDER_MAINTENANCE': 'bg-amber-100 text-amber-700 border-amber-200',
      'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
      'INACTIVE': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getChargerStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'AVAILABLE':
      case 'ACTIVE':
        return <CheckCircle className="w-3 h-3" />;
      case 'CHARGING':
        return <Zap className="w-3 h-3" />;
      case 'OFFLINE':
        return <WifiOff className="w-3 h-3" />;
      case 'FAULTED':
      case 'UNAVAILABLE':
      case 'INACTIVE':
        return <AlertCircle className="w-3 h-3" />;
      case 'UNDER_MAINTENANCE':
        return <Wifi className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Filter chargers based on search and filters
  const filteredChargers = chargers.filter(charger => {
    const matchesSearch = 
      (charger.charger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (charger.charger_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (charger.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (charger.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Connector status filter
    let matchesConnectorStatus = true;
    if (connectorStatusFilter !== 'All') {
      const status = charger.status?.toUpperCase() || '';
      if (connectorStatusFilter === 'Available') {
        matchesConnectorStatus = status === 'AVAILABLE' || status === 'ACTIVE';
      } else if (connectorStatusFilter === 'Busy') {
        matchesConnectorStatus = status === 'CHARGING' || status === 'PREPARING';
      } else if (connectorStatusFilter === 'Error') {
        matchesConnectorStatus = status === 'FAULTED' || status === 'UNAVAILABLE';
      } else if (connectorStatusFilter === 'Unavailable') {
        matchesConnectorStatus = status === 'OFFLINE' || status === 'UNDER_MAINTENANCE' || status === 'INACTIVE';
      }
    }
    
    // Charger status filter
    const matchesChargerStatus = chargerStatusFilter === 'All' || 
      charger.status?.toUpperCase() === chargerStatusFilter.toUpperCase();
    
    return matchesSearch && matchesConnectorStatus && matchesChargerStatus;
  });

  // Stats
  const totalChargers = chargers.length;
  const activeChargers = chargers.filter(c => c.status === 'ACTIVE' || c.status === 'AVAILABLE' || c.status === 'CHARGING').length;
  const inactiveChargers = chargers.filter(c => c.status === 'INACTIVE' || c.status === 'OFFLINE' || c.status === 'UNAVAILABLE').length;
  const faultedChargers = chargers.filter(c => c.status === 'FAULTED').length;

  // Connector status counts
  const availableCount = chargers.filter(c => c.status === 'AVAILABLE' || c.status === 'ACTIVE').length;
  const busyCount = chargers.filter(c => c.status === 'CHARGING' || c.status === 'PREPARING').length;
  const errorCount = chargers.filter(c => c.status === 'FAULTED' || c.status === 'UNAVAILABLE').length;
  const unavailableCount = chargers.filter(c => c.status === 'OFFLINE' || c.status === 'UNDER_MAINTENANCE' || c.status === 'INACTIVE').length;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar 
        isDarkMode={isDarkMode} 
        onThemeToggle={handleThemeToggle}
        userName={userData?.user?.full_name || 'User'}
        userEmail={userData?.user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                 <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                >
                    /  Dashboard
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700 font-medium">Chargers</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
                >
                  <Settings size={20} />
                  <ChevronDown size={16} />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Page Title */}
       <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-green-700">Charger Management</h1>
      <p className="text-sm text-gray-500 mt-0.5">Manage all EV charging stations and monitor sessions</p>
    </div>
    <button
      onClick={() => navigate('/add-charger')}
      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25"
    >
      <Plus size={18} />
      Add Charger
    </button>
  </div>
</div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('chargers')}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'chargers' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap size={18} />
              <span className="font-medium">Chargers</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{totalChargers}</span>
            </button>
            <button
              onClick={handleGoToSessions}
              className={`py-3 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'sessions' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity size={18} />
              <span className="font-medium">Sessions</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{dummySessions.length}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Chargers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalChargers}</p>
                </div>
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {activeChargers} active • {inactiveChargers} inactive
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{activeChargers}</p>
                </div>
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <PowerIcon className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {totalChargers > 0 ? Math.round((activeChargers / totalChargers) * 100) : 0}% online
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">{inactiveChargers}</p>
                </div>
                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center">
                  <PowerOff className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Needs attention
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Faulted</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{faultedChargers}</p>
                </div>
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Requires immediate action
              </p>
            </div>
          </div>

          {/* Filters Row - Left: Connector Status, Right: Charger Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Left Side - Connector Status */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Plug size={16} className="text-blue-500" />
                Connector Status:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setConnectorStatusFilter('All')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                    connectorStatusFilter === 'All'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Circle className="w-3 h-3 text-blue-500" />
                  All ({totalChargers})
                </button>
                <button
                  onClick={() => setConnectorStatusFilter('Available')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                    connectorStatusFilter === 'Available'
                      ? 'bg-green-50 text-green-700 border-green-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Available ({availableCount})
                </button>
                <button
                  onClick={() => setConnectorStatusFilter('Busy')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                    connectorStatusFilter === 'Busy'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-3 h-3 text-yellow-500" />
                  Busy ({busyCount})
                </button>
                <button
                  onClick={() => setConnectorStatusFilter('Error')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                    connectorStatusFilter === 'Error'
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  Error ({errorCount})
                </button>
                <button
                  onClick={() => setConnectorStatusFilter('Unavailable')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                    connectorStatusFilter === 'Unavailable'
                      ? 'bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CircleOff className="w-3 h-3 text-gray-500" />
                  Unavailable ({unavailableCount})
                </button>
              </div>
            </div>

            {/* Right Side - Charger Status with Search */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Battery size={16} className="text-blue-500" />
                Charger Status:
              </span>
              <select
                value={chargerStatusFilter}
                onChange={(e) => setChargerStatusFilter(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="CHARGING">Charging</option>
                <option value="OFFLINE">Offline</option>
                <option value="FAULTED">Faulted</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chargers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading && chargers.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading chargers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={() => fetchChargers()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
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
                <p className="text-lg font-semibold text-gray-600">No Chargers Found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first charger'}
                </p>
                {!searchQuery && connectorStatusFilter === 'All' && chargerStatusFilter === 'All' && (
                  <button
                    onClick={() => navigate('/add-charger')}
                    className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Charger
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50/80 to-gray-50/80 border-b border-gray-200">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger ID</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Power</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connectors</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChargers.map((charger, index) => (
                        <tr key={charger.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
                          <td className="px-4 py-3 text-sm text-gray-400 font-medium">{String(index + 1).padStart(2, '0')}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">
                            {charger.charger_id || charger.id?.slice(0, 6) || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {charger.charger_name || charger.name || 'Unnamed'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {charger.serial_number || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {charger.charger_type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getChargerStatusColor(charger.status)}`}>
                              {getChargerStatusIcon(charger.status)}
                              {charger.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">
                            {charger.max_power_kw || 0} kW
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Plug size={14} className="text-blue-400" />
                              {charger.connectors?.length || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleViewCharger(charger.charger_id || charger.id)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs flex items-center gap-1 shadow-sm shadow-blue-500/25"
                            >
                              <Eye size={14} />
                              View
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
                      onClick={loadMoreChargers}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Total count */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                  <span>Showing {filteredChargers.length} of {pagination.total || chargers.length} chargers</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active: {activeChargers}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      Inactive: {inactiveChargers}
                    </span>
                  </div>
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

export default ChargersAndSessions;
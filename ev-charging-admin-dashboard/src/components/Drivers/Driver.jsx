import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Edit,
  Trash2,
  Users,
  AlertTriangle,
  UserCheck,
  UserX,
  Car,
  Shield,
  Mail,
  Phone,
  MapPin,
  Loader2,
  RefreshCw,
  MoreVertical,
  Menu,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Smartphone,
  Clock as ClockIcon,
  Activity,
  Ban,
  Check,
  Zap,
  Wifi,
  WifiOff,
  Globe,
  UserPlus,
  UserCog,
  UserMinus
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  DRIVERS_API: `${API_BASE_URL}/api/v1/cpo/drivers`,
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

const Drivers = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('drivers');
  
  // Driver data state
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('this_month');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    before: null,
    before_id: null,
    limit: 10,
    has_more: false,
    total: 0
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'alerts', label: 'Driver Alerts', icon: AlertTriangle },
    { id: 'groups', label: 'Driver Groups', icon: UserCog },
    { id: 'vehicles', label: 'Vehicles', icon: Car }
  ];

  // Filter options
  const filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchDrivers();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async (before = null, before_id = null) => {
    setDriversLoading(true);
    
    try {
      let url = `${API_CONFIG.DRIVERS_API}?limit=${pagination.limit}`;
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
        const driversData = data.drivers || data.data || data || [];
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || driversData.length;

        setDrivers(prev => before ? [...prev, ...driversData] : driversData);
        setPagination({
          before: nextBefore,
          before_id: nextBeforeId,
          has_more: hasMore,
          total: total,
          limit: pagination.limit
        });
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setDriversLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreDrivers = () => {
    if (pagination.has_more && !loadingMore) {
      setLoadingMore(true);
      fetchDrivers(pagination.before, pagination.before_id);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'alerts') {
      navigate('/driver-alerts');
    } else if (tabId === 'groups') {
      navigate('/driver-groups');
    } else if (tabId === 'vehicles') {
      navigate('/vehicles');
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

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
      'INACTIVE': 'bg-red-100 text-red-700 border-red-200',
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'BLOCKED': 'bg-red-100 text-red-700 border-red-200',
      'VERIFIED': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'ACTIVE':
      case 'VERIFIED':
        return <CheckCircle className="w-3 h-3" />;
      case 'INACTIVE':
      case 'BLOCKED':
        return <Ban className="w-3 h-3" />;
      case 'PENDING':
        return <Clock className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
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
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-driver");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <UserPlus size={18} className="text-gray-400" /> Add Driver
        </button>
      </div>
    </div>
  );

  // Driver Detail Modal
  const DriverModal = () => {
    if (!selectedDriver) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl font-bold text-white">
                {selectedDriver.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedDriver.name || 'Unnamed Driver'}</h2>
                <p className="text-sm text-gray-500">Driver Details</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDriverModal(false);
                setSelectedDriver(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{selectedDriver.email || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{selectedDriver.phone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedDriver.status)}`}>
                  {getStatusIcon(selectedDriver.status)}
                  {selectedDriver.status || 'PENDING'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Vehicle</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{selectedDriver.vehicle || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Joined</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(selectedDriver.created_at)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Last Active</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(selectedDriver.last_active)}</p>
              </div>
            </div>

            {selectedDriver.address && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Address</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{selectedDriver.address}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Edit size={16} />
                Edit Driver
              </button>
              <button className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2 border border-red-200">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading drivers...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Drivers & Vehicles</h1>
                <p className="text-sm text-blue-600 font-medium">/ Drivers</p>
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
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Section */}
        <div className="px-6 pt-6 border-b border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="p-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drivers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white w-full sm:w-40"
                  >
                    {filterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <button className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25 flex items-center gap-2">
                  <RefreshCw size={18} />
                  <span className="hidden sm:inline text-sm">Refresh</span>
                </button>
              </div>
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Driver</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Joined</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driversLoading && drivers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12">
                          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
                          <p className="mt-2 text-gray-500">Loading drivers...</p>
                        </td>
                      </tr>
                    ) : drivers.filter(d => 
                      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.phone?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No Drivers Found</p>
                          <p className="text-sm text-gray-400 mt-1">Add a new driver to get started</p>
                          <button
                            onClick={() => navigate('/add-driver')}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            <Plus size={18} />
                            Add Driver
                          </button>
                        </td>
                      </tr>
                    ) : (
                      drivers
                        .filter(d => 
                          d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.phone?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((driver, index) => (
                          <tr key={driver.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                  {driver.name?.charAt(0) || 'D'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{driver.name || 'Unnamed'}</p>
                                  <p className="text-xs text-gray-400">ID: {driver.driver_id || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{driver.email || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-600">{driver.phone || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Car size={14} className="text-gray-400" />
                                <span className="text-gray-600">{driver.vehicle || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                                {getStatusIcon(driver.status)}
                                {driver.status || 'PENDING'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(driver.created_at)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setSelectedDriver(driver);
                                  setShowDriverModal(true);
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs flex items-center gap-1 shadow-sm"
                              >
                                <Eye size={14} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Load More */}
              {pagination.has_more && drivers.length > 0 && (
                <div className="text-center py-4 border-t border-gray-200">
                  <button
                    onClick={loadMoreDrivers}
                    disabled={loadingMore}
                    className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Drivers'}
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400">
                <span>Showing {drivers.length} of {pagination.total} drivers</span>
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Modal */}
      {showDriverModal && <DriverModal />}
    </div>
  );
};

export default Drivers;
// src/pages/HubDetails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  Building,
  Mail,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  MapPin,
  Globe,
  Hash,
  FileText,
  ExternalLink,
  Search,
  Phone,
  Loader2,
  Home,
  Menu,
  Link as LinkIcon,
  ArrowLeft,
  Edit,
  Trash2,
  Power,
  Wifi,
  Zap,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  Circle,
  Info,
  Map,
  Navigation,
  Target,
  List,
  Grid,
  Radio,
  RadioButton,
  Search as SearchIcon,
  Gauge,
  Database,
  RefreshCw,
  Globe2,
  Crosshair,
  Compass,
  AlertTriangle,
  CreditCard,
  Banknote,
  Landmark,
  File,
  Users,
  Server,
  Activity,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Award,
  Star,
  UserCheck,
  UserX,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Printer,
  Share2,
  Copy,
  Link
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

console.log('API Base URL:', API_BASE_URL);
console.log('CPO App ID:', CPO_APP_ID);

const API_CONFIG = {
  HUB_DETAILS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.log('No refresh token found');
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

const fetchWithTokenRefresh = async (url, options = {}, retryCount = 2) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  console.log('Fetching URL:', url);

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
      console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
      
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        console.log('Token refreshed successfully, retrying request...');
        
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
        console.log('Refresh token failed, redirecting to login...');
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

// Mock Data
const mockHubData = {
  id: "hub_001",
  name: "TransEV Manicasadona",
  sap_code: "SAP-2024-001",
  load_limit: "150 KW",
  load_limit_strategy: "Dynamic Load Balancing",
  sanction_load: "120 KVA",
  address: "Street Number 372, IIF, Newtown, Kolkata, West Bengal, 700160",
  latitude: "22.5524",
  longitude: "88.3521",
  open_24_hours: true,
  created_at: "2026-01-15T10:30:00Z",
  updated_at: "2026-08-04T05:02:04.626Z",
  status: "ACTIVE",
  bill_details: {
    name: "West Bengal State Electricity Distribution Company Limited",
    state: "West Bengal",
    bill_no: "1234566",
    connection_type: "CCS2",
    phone_number: "+91 7412365896"
  },
  bank_details: {
    account_name: "TransEV Solutions Pvt Ltd",
    account_no: "1234567890",
    ifsc_code: "SBIN0001234"
  }
};

const mockChargers = [
  {
    id: "chg_001",
    charger_id: "CHG-001",
    name: "Delta AC Charger 22KW",
    status: "ACTIVE",
    device_id: "DEV-001",
    created_at: "2026-01-20T10:30:00Z",
    last_active: "2026-08-04T05:00:00Z",
    type: "AC",
    power: "22KW"
  },
  {
    id: "chg_002",
    charger_id: "CHG-002",
    name: "ABB DC Fast Charger 50KW",
    status: "ACTIVE",
    device_id: "DEV-002",
    created_at: "2026-02-15T14:20:00Z",
    last_active: "2026-08-04T04:45:00Z",
    type: "DC",
    power: "50KW"
  },
  {
    id: "chg_003",
    charger_id: "CHG-003",
    name: "Siemens AC Charger 11KW",
    status: "INACTIVE",
    device_id: "DEV-003",
    created_at: "2026-03-10T09:15:00Z",
    last_active: "2026-07-28T12:00:00Z",
    type: "AC",
    power: "11KW"
  }
];

const allAvailableChargers = [
  {
    id: "chg_004",
    charger_id: "CHG-004",
    name: "Delta AC Charger 7KW",
    status: "ACTIVE",
    device_id: "DEV-004",
    created_at: "2026-04-01T11:00:00Z",
    type: "AC",
    power: "7KW"
  },
  {
    id: "chg_005",
    charger_id: "CHG-005",
    name: "ABB DC Fast Charger 100KW",
    status: "PENDING",
    device_id: "DEV-005",
    created_at: "2026-05-20T16:30:00Z",
    type: "DC",
    power: "100KW"
  },
  {
    id: "chg_006",
    charger_id: "CHG-006",
    name: "Siemens AC Charger 22KW",
    status: "ACTIVE",
    device_id: "DEV-006",
    created_at: "2026-06-10T08:45:00Z",
    type: "AC",
    power: "22KW"
  }
];

const HubDetails = () => {
  const navigate = useNavigate();
  const { hubId } = useParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hub data state
  const [hubData, setHubData] = useState(null);
  const [hubLoading, setHubLoading] = useState(false);
  const [hubError, setHubError] = useState('');
  
  // Chargers state
  const [chargers, setChargers] = useState([]);
  const [chargersLoading, setChargersLoading] = useState(false);
  const [chargerSearchTerm, setChargerSearchTerm] = useState('');
  const [selectedChargers, setSelectedChargers] = useState([]);
  
  // Modal states
  const [showEditHubModal, setShowEditHubModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [showAddChargersModal, setShowAddChargersModal] = useState(false);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    sap_code: '',
    load_type: 'KVA',
    load_limit: '',
    load_limit_strategy: '',
    sanction_load: ''
  });
  
  const [editLocationData, setEditLocationData] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });
  
  const [editBankData, setEditBankData] = useState({
    account_name: '',
    account_no: '',
    ifsc_code: ''
  });

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchHubDetails();
    fetchHubChargers();
  }, [hubId]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info:', data);
        setUserData(data);
        
        const userInfo = {
          name: data.user?.full_name || data.user?.name || 'User',
          email: data.user?.email || '',
          role: data.role || '',
          ...data
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHubDetails = async () => {
    setHubLoading(true);
    setHubError('');
    try {
      // Replace with actual API call
      // const response = await fetchWithTokenRefresh(`${API_CONFIG.HUB_DETAILS_API}/${hubId}`, {
      //   method: 'GET'
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   setHubData(data.data || data);
      // } else {
      //   setHubError(data.message || 'Failed to fetch hub details');
      // }
      
      // Using mock data
      setTimeout(() => {
        setHubData(mockHubData);
        setHubLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching hub details:', error);
      setHubError(error.message || 'An error occurred');
      setHubLoading(false);
    }
  };

  const fetchHubChargers = async () => {
    setChargersLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetchWithTokenRefresh(`${API_CONFIG.CHARGERS_API}?hub_id=${hubId}&limit=50`, {
      //   method: 'GET'
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   setChargers(data.data || data.chargers || []);
      // }
      
      // Using mock data
      setTimeout(() => {
        setChargers(mockChargers);
        setChargersLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching chargers:', error);
      setChargersLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    setLoggingOut(true);

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
      setLoggingOut(false);
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'ACTIVE':
        return <CheckCircle className="w-3 h-3" />;
      case 'PENDING':
        return <Clock className="w-3 h-3" />;
      case 'INACTIVE':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
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

  // Edit Hub Modal
  const EditHubModal = () => {
    const [localFormData, setLocalFormData] = useState({
      name: hubData?.name || '',
      sap_code: hubData?.sap_code || '',
      load_type: hubData?.load_type || 'KVA',
      load_limit: hubData?.load_limit || '',
      load_limit_strategy: hubData?.load_limit_strategy || '',
      sanction_load: hubData?.sanction_load || ''
    });

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setLocalFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
      // Update hub data
      setHubData(prev => ({ ...prev, ...localFormData }));
      setShowEditHubModal(false);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditHubModal(false)} />
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-full max-w-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Hub Details</h2>
              <button
                onClick={() => setShowEditHubModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hub Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={localFormData.name}
                    onChange={handleLocalChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hub SAP Code
                  </label>
                  <input
                    type="text"
                    name="sap_code"
                    value={localFormData.sap_code}
                    onChange={handleLocalChange}
                    placeholder="Enter SAP code"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Load Type
                    </label>
                    <select
                      name="load_type"
                      value={localFormData.load_type}
                      onChange={handleLocalChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="KVA">KVA</option>
                      <option value="KW">KW</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Load Limit
                    </label>
                    <input
                      type="text"
                      name="load_limit"
                      value={localFormData.load_limit}
                      onChange={handleLocalChange}
                      placeholder="Enter load limit"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Load Limit Strategy
                  </label>
                  <input
                    type="text"
                    name="load_limit_strategy"
                    value={localFormData.load_limit_strategy}
                    onChange={handleLocalChange}
                    placeholder="Enter load limit strategy"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sanction Load
                  </label>
                  <input
                    type="text"
                    name="sanction_load"
                    value={localFormData.sanction_load}
                    onChange={handleLocalChange}
                    placeholder="Enter sanction load"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditHubModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Location Modal
  const EditLocationModal = () => {
    const [localLocationData, setLocalLocationData] = useState({
      latitude: hubData?.latitude || '',
      longitude: hubData?.longitude || '',
      address: hubData?.address || ''
    });

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setLocalLocationData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
      setHubData(prev => ({ ...prev, ...localLocationData }));
      setShowEditLocationModal(false);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditLocationModal(false)} />
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-full max-w-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Hub Location</h2>
              <button
                onClick={() => setShowEditLocationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Get Coordinates
                  </label>
                  <button
                    type="button"
                    onClick={() => window.open('https://www.latlong.net/', '_blank')}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition"
                  >
                    <Compass className="w-4 h-4" />
                    Get Coordinates
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={localLocationData.latitude}
                      onChange={handleLocalChange}
                      placeholder="Enter latitude"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={localLocationData.longitude}
                      onChange={handleLocalChange}
                      placeholder="Enter longitude"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={localLocationData.address}
                      onChange={handleLocalChange}
                      placeholder="Enter address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditLocationModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Bank Modal
  const EditBankModal = () => {
    const [localBankData, setLocalBankData] = useState({
      account_name: hubData?.bank_details?.account_name || '',
      account_no: hubData?.bank_details?.account_no || '',
      ifsc_code: hubData?.bank_details?.ifsc_code || ''
    });

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setLocalBankData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
      setHubData(prev => ({
        ...prev,
        bank_details: { ...localBankData }
      }));
      setShowEditBankModal(false);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditBankModal(false)} />
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-full max-w-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Hub Bank Details</h2>
              <button
                onClick={() => setShowEditBankModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="account_name"
                    value={localBankData.account_name}
                    onChange={handleLocalChange}
                    placeholder="Enter Account Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Account No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="account_no"
                    value={localBankData.account_no}
                    onChange={handleLocalChange}
                    placeholder="Enter Account No"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Account IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={localBankData.ifsc_code}
                    onChange={handleLocalChange}
                    placeholder="Enter Account IFSC Code"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditBankModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add Chargers Modal
  const AddChargersModal = () => {
    const [selectedChargerIds, setSelectedChargerIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableChargers, setAvailableChargers] = useState(allAvailableChargers);

    const toggleChargerSelection = (chargerId) => {
      setSelectedChargerIds(prev => {
        if (prev.includes(chargerId)) {
          return prev.filter(id => id !== chargerId);
        } else {
          return [...prev, chargerId];
        }
      });
    };

    const handleAddChargers = () => {
      // Add selected chargers to hub
      const newChargers = availableChargers.filter(c => selectedChargerIds.includes(c.id));
      setChargers(prev => [...prev, ...newChargers]);
      setShowAddChargersModal(false);
    };

    const filteredChargers = availableChargers.filter(charger =>
      charger.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charger.charger_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charger.device_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddChargersModal(false)} />
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-full max-w-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Chargers in <span className="text-green-600">{hubData?.name}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Note: Selected chargers location will be changed to -- {hubData?.address}
                </p>
              </div>
              <button
                onClick={() => setShowAddChargersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {/* Search */}
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by charger name, ID or device ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Chargers List */}
              {filteredChargers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No chargers available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
                  {filteredChargers.map((charger) => {
                    const isSelected = selectedChargerIds.includes(charger.id);
                    return (
                      <div
                        key={charger.id}
                        onClick={() => toggleChargerSelection(charger.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 shadow-sm shadow-green-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <h4 className="font-medium text-gray-900">{charger.name}</h4>
                            </div>
                            <div className="ml-7 mt-1 space-y-1">
                              <p className="text-xs text-gray-500">ID: {charger.charger_id}</p>
                              <p className="text-xs text-gray-500">Device: {charger.device_id}</p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                                {charger.status}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleAddChargers}
                  disabled={selectedChargerIds.length === 0}
                  className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected Chargers ({selectedChargerIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddChargersModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || hubLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hub details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hubError) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600">{hubError}</p>
            <button
              onClick={() => navigate('/manage-hubs')}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Back to Hubs
            </button>
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Building size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                </div>
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

        {/* Back and Add Chargers Button */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <button
            onClick={() => navigate('/manage-hubs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <button
            onClick={() => setShowAddChargersModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={18} />
            Add Chargers to Hub
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Hub Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-xl">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Hub Detail</h2>
                        <p className="text-sm text-gray-500">Complete information about the hub</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(hubData?.status)}`}>
                      {getStatusIcon(hubData?.status)}
                      {hubData?.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Hub Name */}
                  <div>
                    <p className="text-xs text-gray-500">Hub Name</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.name}</p>
                  </div>

                  {/* Hub SAP Code */}
                  <div>
                    <p className="text-xs text-gray-500">Hub SAP Code</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.sap_code || '----'}</p>
                  </div>

                  {/* Load Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Load Limit</p>
                      <p className="text-base font-semibold text-gray-900">{hubData?.load_limit || '----'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Load Limit Strategy</p>
                      <p className="text-base font-semibold text-gray-900">{hubData?.load_limit_strategy || '----'}</p>
                    </div>
                  </div>

                  {/* Sanction Load */}
                  <div>
                    <p className="text-xs text-gray-500">Sanction Load</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.sanction_load || '----'}</p>
                  </div>

                  {/* Hub Location */}
                  <div>
                    <p className="text-xs text-gray-500">Hub Location</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Lat: {hubData?.latitude}</span>
                      <span>Lng: {hubData?.longitude}</span>
                    </div>
                  </div>

                  {/* Hub Bill Detail */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Hub Bill Detail</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bill_details?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">State</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bill_details?.state}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bill No</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bill_details?.bill_no}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Connection Type</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bill_details?.connection_type}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bill_details?.phone_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hub Bank Detail */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Banknote className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Hub Bank Detail</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Account Name</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bank_details?.account_name || '----'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Account No</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bank_details?.account_no || '----'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Account IFSC Code</p>
                        <p className="text-sm font-medium text-gray-900">{hubData?.bank_details?.ifsc_code || '----'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chargers */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold text-gray-900">Chargers</h3>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Total: {chargers.length}</span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Search */}
                  <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID..."
                      value={chargerSearchTerm}
                      onChange={(e) => setChargerSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {chargersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                    </div>
                  ) : chargers.filter(c => 
                    c.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                    c.name?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No chargers found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {chargers
                        .filter(c => 
                          c.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                          c.name?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
                        )
                        .map((charger) => (
                          <div key={charger.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{charger.name}</p>
                                <p className="text-xs text-gray-500">ID: {charger.charger_id}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                                {charger.status}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditHubModal && <EditHubModal />}
      {showEditLocationModal && <EditLocationModal />}
      {showEditBankModal && <EditBankModal />}
      {showAddChargersModal && <AddChargersModal />}
    </div>
  );
};

export default HubDetails;
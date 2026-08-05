// src/pages/HubDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Chargers state
  const [chargers, setChargers] = useState([]);
  const [chargersLoading, setChargersLoading] = useState(false);
  const [chargerSearchTerm, setChargerSearchTerm] = useState('');
  
  // Available chargers for adding
  const [availableChargers, setAvailableChargers] = useState([]);
  const [availableChargersLoading, setAvailableChargersLoading] = useState(false);
  const [availableChargerPagination, setAvailableChargerPagination] = useState({
    before: null,
    before_id: null,
    limit: 50,
    has_more: false,
    total: 0
  });
  const [loadingMoreAvailable, setLoadingMoreAvailable] = useState(false);
  
  // Modal states
  const [showEditHubModal, setShowEditHubModal] = useState(false);
  const [showAddChargersModal, setShowAddChargersModal] = useState(false);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    open_24_hours: false,
    sanction_load: ''
  });

  // Refs to prevent double submission - using refs that persist across renders
  const isUpdatingRef = useRef(false);
  const isAddingChargersRef = useRef(false);
  const isModalOpenRef = useRef(false);

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
      const response = await fetchWithTokenRefresh(`${API_CONFIG.HUB_DETAILS_API}/${hubId}`, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Hub details response:', data);

      if (response.ok) {
        setHubData(data);
        setEditFormData({
          name: data.name || '',
          address: data.address || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          open_24_hours: data.open_24_hours || false,
          sanction_load: data.sanction_load || ''
        });
      } else {
        setHubError(data.message || data.error?.message || 'Failed to fetch hub details');
      }
    } catch (error) {
      console.error('Error fetching hub details:', error);
      setHubError(error.message || 'An error occurred');
    } finally {
      setHubLoading(false);
    }
  };

  const fetchHubChargers = async () => {
    setChargersLoading(true);
    try {
      const response = await fetchWithTokenRefresh(`${API_CONFIG.HUB_DETAILS_API}/${hubId}/chargers?limit=50`, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Hub chargers response:', data);

      if (response.ok) {
        const chargersData = data.chargers || data.data || data || [];
        setChargers(chargersData);
      }
    } catch (error) {
      console.error('Error fetching hub chargers:', error);
    } finally {
      setChargersLoading(false);
    }
  };

  const fetchAvailableChargers = useCallback(async (before = null, before_id = null) => {
    if (availableChargersLoading) return;
    
    setAvailableChargersLoading(true);
    
    try {
      let url = `${API_CONFIG.CHARGERS_API}?limit=${availableChargerPagination.limit}`;
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
      console.log('Available chargers response:', data);

      if (response.ok) {
        const chargersData = data.chargers || data.data || data || [];
        const existingChargerIds = chargers.map(c => c.id);
        const filteredChargers = chargersData.filter(c => !existingChargerIds.includes(c.id));
        
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || chargersData.length;

        setAvailableChargers(prev => before ? [...prev, ...filteredChargers] : filteredChargers);
        setAvailableChargerPagination({
          before: nextBefore,
          before_id: nextBeforeId,
          has_more: hasMore,
          total: total,
          limit: availableChargerPagination.limit
        });
      }
    } catch (error) {
      console.error('Error fetching available chargers:', error);
    } finally {
      setAvailableChargersLoading(false);
      setLoadingMoreAvailable(false);
    }
  }, [availableChargerPagination.limit, chargers]);

  const loadMoreAvailableChargers = () => {
    if (availableChargerPagination.has_more && !loadingMoreAvailable && !availableChargersLoading) {
      setLoadingMoreAvailable(true);
      fetchAvailableChargers(availableChargerPagination.before, availableChargerPagination.before_id);
    }
  };

  // FIXED: Update hub using PATCH method with proper form data handling
  const handleUpdateHub = useCallback(async (formData) => {
    // CRITICAL: Check if already updating
    if (isUpdatingRef.current) {
      console.log('Update already in progress, skipping...');
      return;
    }
    
    // Set the ref immediately to prevent any other clicks
    isUpdatingRef.current = true;
    setIsSubmitting(true);
    setHubError('');
    
    // Build payload from the passed formData
    const payload = {};
    
    if (formData.name !== hubData?.name) {
      payload.name = formData.name;
    }
    if (formData.address !== hubData?.address) {
      payload.address = formData.address;
    }
    if (formData.latitude && parseFloat(formData.latitude) !== hubData?.latitude) {
      payload.latitude = parseFloat(formData.latitude);
    }
    if (formData.longitude && parseFloat(formData.longitude) !== hubData?.longitude) {
      payload.longitude = parseFloat(formData.longitude);
    }
    if (formData.open_24_hours !== hubData?.open_24_hours) {
      payload.open_24_hours = formData.open_24_hours;
    }
    if (formData.sanction_load && parseFloat(formData.sanction_load) !== hubData?.sanction_load) {
      payload.sanction_load = parseFloat(formData.sanction_load);
    }

    // If no changes, close modal and reset
    if (Object.keys(payload).length === 0) {
      setShowEditHubModal(false);
      setIsSubmitting(false);
      isUpdatingRef.current = false;
      return;
    }

    console.log('Updating hub with payload:', payload);

    try {
      const response = await fetchWithTokenRefresh(`${API_CONFIG.HUB_DETAILS_API}/${hubId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Update hub response:', data);

      if (response.ok) {
        // Update hub data with response
        setHubData(data);
        setEditFormData({
          name: data.name || '',
          address: data.address || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          open_24_hours: data.open_24_hours || false,
          sanction_load: data.sanction_load || ''
        });
        setShowEditHubModal(false);
        await fetchHubChargers();
        // Reset ref on success
        isUpdatingRef.current = false;
      } else {
        setHubError(data.message || data.error?.message || 'Failed to update hub');
        // Reset ref on error so user can retry
        isUpdatingRef.current = false;
      }
    } catch (error) {
      console.error('Error updating hub:', error);
      setHubError(error.message || 'An error occurred');
      // Reset ref on error so user can retry
      isUpdatingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [hubData, hubId, fetchHubChargers]);

  // Add chargers to hub - with prevent double submission
  const handleAddChargers = useCallback(async (selectedChargerIds) => {
    if (selectedChargerIds.length === 0) return;
    if (isAddingChargersRef.current) return;
    isAddingChargersRef.current = true;

    setIsSubmitting(true);
    setHubError('');

    try {
      for (const chargerId of selectedChargerIds) {
        const response = await fetchWithTokenRefresh(`${API_CONFIG.HUB_DETAILS_API}/${hubId}/chargers`, {
          method: 'POST',
          body: JSON.stringify({ charger_id: chargerId })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || data.error?.message || 'Failed to add charger');
        }
      }

      await fetchHubChargers();
      setShowAddChargersModal(false);
      setAvailableChargers([]);
      setAvailableChargerPagination({
        before: null,
        before_id: null,
        limit: 50,
        has_more: false,
        total: 0
      });
    } catch (error) {
      console.error('Error adding chargers:', error);
      setHubError(error.message || 'An error occurred while adding chargers');
    } finally {
      setIsSubmitting(false);
      isAddingChargersRef.current = false;
    }
  }, [hubId]);

  // Remove charger from hub
  const handleRemoveCharger = useCallback(async (chargerId) => {
    if (!window.confirm('Are you sure you want to remove this charger from the hub?')) return;

    setChargersLoading(true);
    try {
      const response = await fetchWithTokenRefresh(`${API_CONFIG.HUB_DETAILS_API}/${hubId}/chargers/${chargerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChargers(prev => prev.filter(c => c.id !== chargerId));
        if (showAddChargersModal) {
          setAvailableChargers([]);
          setAvailableChargerPagination({
            before: null,
            before_id: null,
            limit: 50,
            has_more: false,
            total: 0
          });
          fetchAvailableChargers();
        }
      } else {
        const data = await response.json();
        alert(data.message || data.error?.message || 'Failed to remove charger');
      }
    } catch (error) {
      console.error('Error removing charger:', error);
      alert('An error occurred while removing charger');
    } finally {
      setChargersLoading(false);
    }
  }, [hubId, showAddChargersModal, fetchAvailableChargers]);

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
      'OFFLINE': 'bg-gray-100 text-gray-800 border-gray-200',
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'offline': 'bg-gray-100 text-gray-800 border-gray-200'
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

  // FIXED: Edit Hub Modal with proper save handler
  const EditHubModal = () => {
    const [localFormData, setLocalFormData] = useState({
      name: hubData?.name || '',
      address: hubData?.address || '',
      latitude: hubData?.latitude || '',
      longitude: hubData?.longitude || '',
      open_24_hours: hubData?.open_24_hours || false,
      sanction_load: hubData?.sanction_load || ''
    });

    const handleLocalChange = (e) => {
      const { name, value, type, checked } = e.target;
      setLocalFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    // FIXED: Save handler that directly calls update with local data
    const handleSave = () => {
      // Prevent multiple clicks using ref
      if (isUpdatingRef.current) {
        console.log('Save already in progress');
        return;
      }
      
      // Directly call handleUpdateHub with localFormData
      handleUpdateHub(localFormData);
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
                    Hub Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={localFormData.name}
                    onChange={handleLocalChange}
                    placeholder="Enter hub name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={localFormData.address}
                      onChange={handleLocalChange}
                      placeholder="Enter address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={localFormData.latitude}
                      onChange={handleLocalChange}
                      placeholder="Enter latitude"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={localFormData.longitude}
                      onChange={handleLocalChange}
                      placeholder="Enter longitude"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sanction Load
                  </label>
                  <input
                    type="number"
                    name="sanction_load"
                    value={localFormData.sanction_load}
                    onChange={handleLocalChange}
                    step="any"
                    placeholder="Enter sanction load"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="open_24_hours"
                    id="edit_open_24_hours"
                    checked={localFormData.open_24_hours}
                    onChange={handleLocalChange}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="edit_open_24_hours" className="text-sm font-medium text-gray-700">
                    Open 24/7
                  </label>
                </div>

                {hubError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {hubError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isUpdatingRef.current || isSubmitting}
                    className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditHubModal(false);
                      setHubError('');
                    }}
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
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
      if (showAddChargersModal && !isModalOpenRef.current) {
        isModalOpenRef.current = true;
        setAvailableChargers([]);
        setAvailableChargerPagination({
          before: null,
          before_id: null,
          limit: 50,
          has_more: false,
          total: 0
        });
        fetchAvailableChargers();
      }
      return () => {
        if (!showAddChargersModal) {
          isModalOpenRef.current = false;
        }
      };
    }, [showAddChargersModal, fetchAvailableChargers]);

    const toggleChargerSelection = (chargerId) => {
      setSelectedChargerIds(prev => {
        if (prev.includes(chargerId)) {
          return prev.filter(id => id !== chargerId);
        } else {
          return [...prev, chargerId];
        }
      });
    };

    const handleAddSelectedChargers = async () => {
      if (selectedChargerIds.length === 0) return;
      if (isAdding || isSubmitting || isAddingChargersRef.current) return;
      setIsAdding(true);
      await handleAddChargers(selectedChargerIds);
      setIsAdding(false);
      setSelectedChargerIds([]);
    };

    const filteredAvailableChargers = availableChargers.filter(charger =>
      charger.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charger.charger_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charger.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {
          setShowAddChargersModal(false);
          isModalOpenRef.current = false;
        }} />
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-full max-w-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Chargers to <span className="text-green-600">{hubData?.name}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select chargers to associate with this hub
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddChargersModal(false);
                  isModalOpenRef.current = false;
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by charger name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {availableChargersLoading && availableChargers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              ) : filteredAvailableChargers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No Chargers Found</p>
                  <p className="text-sm text-gray-400 mt-1">All chargers are already assigned to this hub</p>
                  <button
                    onClick={() => {
                      setShowAddChargersModal(false);
                      isModalOpenRef.current = false;
                      navigate('/add-charger');
                    }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Charger
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
                  {filteredAvailableChargers.map((charger) => {
                    const chargerId = charger.id || charger.charger_id;
                    const isSelected = selectedChargerIds.includes(chargerId);
                    return (
                      <div
                        key={chargerId}
                        onClick={() => toggleChargerSelection(chargerId)}
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
                              <h4 className="font-medium text-gray-900">{charger.name || 'Unnamed Charger'}</h4>
                            </div>
                            <div className="ml-7 mt-1 space-y-1">
                              <p className="text-xs text-gray-500">ID: {charger.charger_id || charger.id}</p>
                              {charger.status && (
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                                  {charger.status || 'PENDING'}
                                </span>
                              )}
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

              {availableChargerPagination.has_more && filteredAvailableChargers.length > 0 && (
                <div className="text-center pt-2">
                  <button
                    onClick={loadMoreAvailableChargers}
                    disabled={loadingMoreAvailable || availableChargersLoading}
                    className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                  >
                    {loadingMoreAvailable ? 'Loading...' : 'Load More Chargers'}
                  </button>
                </div>
              )}

              {filteredAvailableChargers.length > 0 && (
                <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleAddSelectedChargers}
                    disabled={selectedChargerIds.length === 0 || isAdding || isSubmitting || isAddingChargersRef.current}
                    className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAdding || isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      `Add Selected Chargers (${selectedChargerIds.length})`
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddChargersModal(false);
                      isModalOpenRef.current = false;
                    }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
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
            onClick={() => {
              setShowAddChargersModal(true);
              isModalOpenRef.current = false;
            }}
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
                    <button
                      onClick={() => setShowEditHubModal(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      title="Edit Hub"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-xs text-gray-500">Hub Name</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.address || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-gray-900">Lat: {hubData?.latitude || 'N/A'}</span>
                      <span className="font-medium text-gray-900">Lng: {hubData?.longitude || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Sanction Load</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.sanction_load || 0} kW</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Open 24/7</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.open_24_hours ? 'Yes' : 'No'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(hubData?.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(hubData?.updated_at)}</p>
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
                  <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID or name..."
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
                    c.name?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                    c.id?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No chargers in this hub</p>
                      <button
                        onClick={() => {
                          setShowAddChargersModal(true);
                          isModalOpenRef.current = false;
                        }}
                        className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Add chargers
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {chargers
                        .filter(c => 
                          c.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                          c.name?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                          c.id?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
                        )
                        .map((charger) => (
                          <div key={charger.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{charger.name || 'Unnamed Charger'}</p>
                                <p className="text-xs text-gray-500">ID: {charger.charger_id || charger.id}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {charger.status && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                                    {charger.status || 'PENDING'}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleRemoveCharger(charger.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                  title="Remove from hub"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
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
      {showAddChargersModal && <AddChargersModal />}
    </div>
  );
};

export default HubDetails;
// src/components/Revenue/AddCustomerTariff.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  Mail,
  Phone,
  Menu,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserPlus,
  MoreVertical,
  Circle,
  CircleCheck,
  CircleX,
  CircleAlert,
  UserRound,
  BadgeCheck,
  Activity,
  Power,
  PowerOff,
  Save,
  ArrowRight,
  Info,
  Sparkles,
  Award,
  Star,
  Zap,
  Layers,
  Gift,
  Crown,
  Check,
  List,
  Grid,
  Search as SearchIcon,
  FileText,
  Tag,
  DollarSign,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Percent,
  IndianRupee,
  Globe,
  MapPin,
  Wifi,
  Plug,
  Battery,
  Gauge,
  RadioTower,
  Link as LinkIcon,
  CreditCard,
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Settings as SettingsIcon,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  Timer,
  Infinity,
  Package,
  Repeat,
  Landmark,
  Banknote,
  File,
  Server,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Cpu,
  HardDrive,
  Network,
  Radio,
  Bluetooth,
  Thermometer,
  Wind,
  Droplet,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudWind,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  CloudSleet,
  CloudThunder,
  CloudTornado,
  CloudHurricane,
  CloudTyphoon,
  CloudCyclone,
  CloudStorm,
  CloudRainbow,
  CloudSun,
  CloudMoon,
  CloudStar,
  CloudComet,
  CloudAsteroid,
  CloudMeteor,
  CloudGalaxy,
  CloudUniverse,
  CloudMultiverse,
  Shield,
  AlertCircle,
  CalendarRange
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// ============================================================================
// API Configuration
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
  USER_GROUP_TARIFFS_API: (groupId) => `${API_BASE_URL}/api/v1/cpo/user-groups/${groupId}/tariffs`,
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// ============================================================================
// SECTION 12 - Canonical Pricing Model
// ============================================================================
const PRICE_TYPE_MAP = {
  'Energy': 'energy',
  'Time': 'time',
  'Sessions': 'sessions'
};

const UNITS_MAP = {
  'kWh': 'kwh',
  'minutes': 'minutes'
};

const PRICE_TYPE_DISPLAY = {
  'energy': 'Energy',
  'time': 'Time',
  'sessions': 'Sessions'
};

const UNITS_DISPLAY = {
  'kwh': 'kWh',
  'minutes': 'Minutes'
};

// ============================================================================
// SECTION 55 - Recommended Terminology Glossary
// ============================================================================
const TARIFF_ROLE_DISPLAY = {
  'root': 'Root Fallback',
  'baseline': 'Open-ended Baseline',
  'temporary': 'Temporary Override'
};

const AddCustomerTariff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  
  // Optional resources - only for display
  const [hubs, setHubs] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const [loadingChargers, setLoadingChargers] = useState(false);
  
  // ============================================================================
  // SECTION 29 - Form State with Temporal Role
  // ============================================================================
  const [formData, setFormData] = useState({
    price_per_unit: '',
    idle_fee_per_min: '0',
    currency: 'INR',
    is_active: true,
    start_date: '',
    end_date: '',
    tariff_type: 'Standard',
    price_type: 'Energy',
    units: 'kWh',
    temporal_role: 'root' // 'root' | 'baseline' | 'temporary'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchUserGroups();
    fetchHubs();
    fetchChargers();
    
    const state = location.state;
    if (state && state.groupId) {
      const group = userGroups.find(g => g.id === state.groupId);
      if (group) {
        setSelectedGroup(group);
      } else {
        // Wait for groups to load
        const checkGroup = () => {
          const found = userGroups.find(g => g.id === state.groupId);
          if (found) {
            setSelectedGroup(found);
          } else {
            setTimeout(checkGroup, 100);
          }
        };
        checkGroup();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, location]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
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

  const fetchUserGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_GROUPS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const groups = data.user_groups || data.data || data || [];
        setUserGroups(groups);
        
        const state = location.state;
        if (state && state.groupId) {
          const group = groups.find(g => g.id === state.groupId);
          if (group) {
            setSelectedGroup(group);
          }
        }
      } else {
        setError('Failed to fetch customer groups');
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setError('An error occurred while fetching groups');
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest, location.state]);

  const fetchHubs = useCallback(async () => {
    setLoadingHubs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUBS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const hubsData = data.hubs || data.data || data || [];
        setHubs(hubsData);
      } else {
        setHubs([]);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
      setHubs([]);
    } finally {
      setLoadingHubs(false);
    }
  }, [authenticatedRequest]);

  const fetchChargers = useCallback(async () => {
    setLoadingChargers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGERS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const chargersData = data.chargers || data.data || data || [];
        setChargers(chargersData);
      } else {
        setChargers([]);
      }
    } catch (error) {
      console.error('Error fetching chargers:', error);
      setChargers([]);
    } finally {
      setLoadingChargers(false);
    }
  }, [authenticatedRequest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setShowGroupDropdown(false);
  };

  // ============================================================================
  // SECTION 29 - Temporal Role Selection
  // ============================================================================
  const setTemporalRole = (role) => {
    setFormData(prev => ({ ...prev, temporal_role: role }));
    
    const today = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    
    switch(role) {
      case 'root':
        // Root: start_date and end_date are optional - clear them
        setFormData(prev => ({ ...prev, start_date: '', end_date: '' }));
        break;
      case 'baseline':
        setFormData(prev => ({ ...prev, start_date: today.toISOString().split('T')[0], end_date: '' }));
        break;
      case 'temporary':
        setFormData(prev => ({ 
          ...prev, 
          start_date: today.toISOString().split('T')[0], 
          end_date: future.toISOString().split('T')[0] 
        }));
        break;
      default:
        break;
    }
  };

  // ============================================================================
  // SECTION 30 - Client-side Validation
  // ============================================================================
  const validateForm = () => {
    const errors = {};
    
    if (!selectedGroup) {
      errors.group = 'Please select a customer group';
    }
    
    if (formData.price_per_unit === '' || formData.price_per_unit === null || formData.price_per_unit === undefined) {
      errors.price_per_unit = 'Price is required';
    } else if (isNaN(formData.price_per_unit) || parseFloat(formData.price_per_unit) < 0) {
      errors.price_per_unit = 'Please enter a valid price';
    }
    
    if (formData.idle_fee_per_min && (isNaN(formData.idle_fee_per_min) || parseFloat(formData.idle_fee_per_min) < 0)) {
      errors.idle_fee_per_min = 'Please enter a valid idle fee';
    }
    
    // SECTION 6 - Invalid date shapes
    // Only validate date range if both are provided (for root, dates are optional)
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (start >= end) {
        errors.date_range = 'Start date must be before end date';
      }
    }
    
    // SECTION 6 - End without start is invalid (unless it's root with both empty)
    if (!formData.start_date && formData.end_date) {
      errors.date_range = 'End date without start date is not allowed';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // SECTION 18 - Create Semantics
  // ============================================================================
  const buildApiPayload = () => {
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
    const idleFeePerMin = parseFloat(formData.idle_fee_per_min) || 0;
    
    const payload = {
      price_per_unit: Number(pricePerUnit.toFixed(4)).toString(),
      idle_fee_per_min: Number(idleFeePerMin.toFixed(4)).toString(),
      currency: formData.currency,
      is_active: formData.is_active,
      tariff_type: 'fixed',
      price_type: PRICE_TYPE_MAP[formData.price_type] || 'energy',
    };

    // SECTION 12 - Sessions pricing omits units
    if (formData.price_type === 'Energy') {
      payload.units = 'kwh';
    } else if (formData.price_type === 'Time') {
      payload.units = 'minutes';
    }
    // For Sessions, omit units

    // SECTION 5 - Temporal roles
    if (formData.temporal_role === 'root') {
      // Root: start=null, end=null (dates are optional)
      payload.start_date = null;
      payload.end_date = null;
    } else if (formData.temporal_role === 'baseline' && formData.start_date) {
      // Baseline: start=date, end=null
      payload.start_date = new Date(formData.start_date).toISOString();
      payload.end_date = null;
    } else if (formData.temporal_role === 'temporary' && formData.start_date && formData.end_date) {
      // Temporary: start=date, end=date
      payload.start_date = new Date(formData.start_date).toISOString();
      payload.end_date = new Date(formData.end_date).toISOString();
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const apiPayload = buildApiPayload();

      console.log('📤 UI Display Values:', {
        temporal_role: formData.temporal_role,
        price_type_display: formData.price_type,
        units_display: formData.units || 'omitted'
      });
      console.log('📤 Full API Payload:', JSON.stringify(apiPayload, null, 2));

      const response = await authenticatedRequest(
        API_CONFIG.USER_GROUP_TARIFFS_API(selectedGroup.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(apiPayload)
        }
      );

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', data);

      if (response.ok) {
        setSuccess('User group tariff created successfully!');
        setFormData({
          price_per_unit: '',
          idle_fee_per_min: '0',
          currency: 'INR',
          is_active: true,
          start_date: '',
          end_date: '',
          tariff_type: 'Standard',
          price_type: 'Energy',
          units: 'kWh',
          temporal_role: 'root'
        });
        setSelectedGroup(null);
        
        setTimeout(() => {
          navigate('/revenue/customer-tariffs');
        }, 2000);
      } else {
        let errorMessage = 'Failed to create tariff';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        } else if (data.error?.code) {
          // SECTION 32 - Error Code Mapping
          if (data.error.code === 'tariff_temporal_conflict') {
            errorMessage = 'This tariff conflicts with another tariff on the same group. Adjust the schedule or keep it disabled.';
          } else {
            errorMessage = `${data.error.code}: ${data.error.message || 'Unknown error'}`;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating tariff:', error);
      setError(error.message || 'An error occurred while creating the tariff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (isActive) => {
    return isActive 
      ? <CheckCircle className="w-3 h-3" />
      : <XCircle className="w-3 h-3" />;
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-80 shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || user?.name || 'User'}
            </h4>
            <p className="text-sm text-white/80 truncate">
              {userData?.user?.email || user?.email || 'user@transev.com'}
            </p>
            {userData?.role && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white border border-white/30">
                {userData.role}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <button onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <User size={16} className="text-gray-400" /> <span>Profile</span>
        </button>
        <button onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Building size={16} className="text-gray-400" /> <span>Organization</span>
        </button>
        <div className="border-t border-gray-100 my-1"></div>
        <button onClick={() => { setShowSettingsMenu(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-3 transition">
          <LogOut size={16} className="text-red-500" /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add Dropdown Menu
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-64 shadow-2xl border border-gray-100 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Refreshing session...</p>
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
        userName={userData?.user?.full_name || user?.name || 'User'}
        userEmail={userData?.user?.email || user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-100 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/revenue/customer-tariffs')} 
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Add Customer Tariff</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-green-500 font-medium mt-1">User Group Tariff</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-center hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-6 max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={24} className="text-green-600" />
                  Create User Group Tariff
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set up pricing for a specific customer group. Multiple tariffs can coexist with different temporal roles.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <DollarSign size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Pricing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-green-600" />
                Tariff Configuration
              </h3>
              <p className="text-sm text-gray-500 mt-1">Configure the pricing and rules for this user group tariff</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Group Selection - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Group <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                      formErrors.group ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-gray-400" />
                      <span className={selectedGroup ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedGroup ? selectedGroup.name : 'Select a customer group'}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${showGroupDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showGroupDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg z-50 max-h-60 overflow-y-auto">
                      {userGroups.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Users size={24} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No groups available</p>
                        </div>
                      ) : (
                        userGroups.map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => handleGroupSelect(group)}
                            className={`w-full text-left px-4 py-3 hover:bg-green-50 transition flex items-center gap-3 ${
                              selectedGroup?.id === group.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {group.name?.charAt(0) || 'G'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{group.name}</p>
                              <p className="text-xs text-gray-500">{group.member_count || 0} members</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(group.is_active)}`}>
                                  {getStatusIcon(group.is_active)}
                                  {group.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formErrors.group && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.group}
                  </p>
                )}
              </div>

              {/* SECTION 29 - Temporal Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Temporal Role <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTemporalRole('root')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition border-2 ${
                      formData.temporal_role === 'root'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Crown size={18} className={formData.temporal_role === 'root' ? 'text-purple-500' : 'text-gray-400'} />
                      <span>Root</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Timeless fallback</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemporalRole('baseline')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition border-2 ${
                      formData.temporal_role === 'baseline'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <CalendarRange size={18} className={formData.temporal_role === 'baseline' ? 'text-blue-500' : 'text-gray-400'} />
                      <span>Baseline</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Open-ended fallback</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemporalRole('temporary')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition border-2 ${
                      formData.temporal_role === 'temporary'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Timer size={18} className={formData.temporal_role === 'temporary' ? 'text-orange-500' : 'text-gray-400'} />
                      <span>Temporary</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Bounded override</p>
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {formData.temporal_role === 'root' && 'Root: start=null, end=null - timeless fallback'}
                  {formData.temporal_role === 'baseline' && 'Baseline: start=date, end=null - open-ended fallback from date'}
                  {formData.temporal_role === 'temporary' && 'Temporary: start=date, end=date - bounded override [start, end)'}
                </p>
                <p className="mt-1 text-xs text-green-600">
                  <Info size={14} className="inline mr-1" />
                  Multiple tariffs with different roles can coexist on the same group.
                </p>
              </div>

              {/* Date Range - Optional for Root, Required for others */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  {formData.temporal_role === 'root' && (
                    <span className="text-xs text-gray-400">(Optional for Root)</span>
                  )}
                  {formData.temporal_role === 'baseline' && (
                    <span className="text-xs text-red-500">(Start Date Required)</span>
                  )}
                  {formData.temporal_role === 'temporary' && (
                    <span className="text-xs text-red-500">(Start & End Date Required)</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start Date {formData.temporal_role === 'root' ? '(Optional)' : <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <CalendarDays size={18} />
                      </div>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 hover:bg-white ${
                          formData.temporal_role === 'root' ? 'border-dashed border-gray-300' : ''
                        }`}
                        required={formData.temporal_role !== 'root'}
                      />
                    </div>
                    {formData.temporal_role === 'root' && (
                      <p className="mt-1 text-xs text-gray-400">Leave empty for root tariff</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      End Date {formData.temporal_role === 'root' ? '(Optional)' : formData.temporal_role === 'temporary' ? <span className="text-red-500">*</span> : '(Optional)'}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <CalendarDays size={18} />
                      </div>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        disabled={formData.temporal_role === 'baseline'}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 hover:bg-white ${
                          formData.temporal_role === 'baseline' ? 'bg-gray-100 cursor-not-allowed' : ''
                        } ${formData.temporal_role === 'root' ? 'border-dashed border-gray-300' : ''}`}
                        required={formData.temporal_role === 'temporary'}
                      />
                    </div>
                    {formData.temporal_role === 'baseline' && (
                      <p className="mt-1 text-xs text-gray-400">Baseline has no expiry</p>
                    )}
                    {formData.temporal_role === 'root' && (
                      <p className="mt-1 text-xs text-gray-400">Leave empty for root tariff</p>
                    )}
                  </div>
                </div>
                {formErrors.date_range && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.date_range}
                  </p>
                )}
              </div>

              {/* Price per Unit - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price per Unit <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <IndianRupee size={18} />
                  </div>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={formData.price_per_unit}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.price_per_unit ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                    required
                  />
                </div>
                {formErrors.price_per_unit && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.price_per_unit}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {formData.price_type === 'Energy' && 'Enter price per kWh (e.g., 18.50)'}
                  {formData.price_type === 'Time' && 'Enter price per minute (e.g., 2.50)'}
                  {formData.price_type === 'Sessions' && 'Enter price per session (e.g., 100.00)'}
                </p>
              </div>

              {/* Idle Fee per Minute - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Idle Fee per Minute
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Clock size={18} />
                  </div>
                  <input
                    type="number"
                    name="idle_fee_per_min"
                    value={formData.idle_fee_per_min}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.idle_fee_per_min ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                  />
                </div>
                {formErrors.idle_fee_per_min && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.idle_fee_per_min}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Must be 0 (idle fee is not supported)</p>
              </div>

              {/* Currency, Price Type, Units */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Currency <span className="text-red-500 text-lg">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Globe size={18} />
                    </div>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price Type <span className="text-red-500 text-lg">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DollarSign size={18} />
                    </div>
                    <select
                      name="price_type"
                      value={formData.price_type}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                    >
                      <option value="Energy">Energy (per kWh)</option>
                      <option value="Time">Time (per minute)</option>
                      <option value="Sessions">Sessions (per session)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Units <span className="text-red-500 text-lg">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Gauge size={18} />
                    </div>
                    <select
                      name="units"
                      value={formData.units}
                      onChange={handleChange}
                      disabled={formData.price_type === 'Sessions'}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                    >
                      {formData.price_type === 'Energy' && (
                        <option value="kWh">kWh</option>
                      )}
                      {formData.price_type === 'Time' && (
                        <option value="minutes">Minutes</option>
                      )}
                      {formData.price_type === 'Sessions' && (
                        <option value="">Units omitted for Sessions</option>
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {formData.price_type === 'Sessions' && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <Info size={14} className="inline mr-1" />
                    Sessions pricing: One fixed amount for one completed session. Units are omitted.
                  </p>
                </div>
              )}

              {/* SECTION 9 - is_active semantics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                        formData.is_active ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5 shadow-md`}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {formData.is_active ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formData.is_active 
                        ? 'Tariff participates in resolution' 
                        : 'Tariff ignored by resolver'}
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-green-600">
                  <Info size={14} className="inline mr-1" />
                  Multiple tariffs can be enabled on the same group with different temporal roles.
                </p>
              </div>

              {/* SECTION 4 - Scope Precedence Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">User Group Tariff Overview</p>
                    <p className="text-sm text-green-700 mt-1">
                      This tariff applies at the <strong>User Group</strong> level and takes precedence over
                      Charger and Hub tariffs.
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      <strong>Temporal Role:</strong> {formData.temporal_role === 'root' ? 'Root (no expiry)' : formData.temporal_role === 'baseline' ? 'Baseline (open-ended)' : 'Temporary (bounded)'}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>Temporal Hierarchy:</strong> Temporary Override &gt; Latest Baseline &gt; Root
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>API Mapping:</strong> Price Type: {formData.price_type} → {PRICE_TYPE_MAP[formData.price_type]}, 
                      Units: {formData.price_type === 'Sessions' ? 'omitted' : (formData.units || 'kWh')}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>GST Note:</strong> GST is managed separately at the Hub level and is not included in tariff creation.
                    </p>
                    <p className="text-sm text-green-700 mt-1 font-medium">
                      💡 You can create multiple tariffs on the same group with different roles (Root, Baseline, Temporary).
                    </p>
                    {formData.temporal_role === 'root' && (
                      <p className="text-sm text-purple-700 mt-2 font-medium">
                        🔵 Root Tariff: Dates are optional. Leave both empty for a permanent fallback.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-700">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Tariff...
                    </>
                  ) : (
                    <>
                      <Users size={20} />
                      Create Tariff
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/revenue/customer-tariffs')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Group Specific Pricing</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Create custom pricing structures for different customer groups
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Flexible Pricing</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Support for Energy (per kWh), Time (per minute), and Sessions pricing models
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Infinity className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Validity Period</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Set optional start and end dates for tariff validity
              </p>
            </div>
          </div>

          {/* Multi-Tariff Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Multiple Tariffs Support</p>
                <p className="text-sm text-green-700 mt-1">
                  You can create multiple tariffs on the same group with different temporal roles:
                </p>
                <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                  <li><strong>Root:</strong> Timeless fallback (start=null, end=null) - <span className="text-purple-600">Dates optional</span></li>
                  <li><strong>Baseline:</strong> Open-ended fallback (start=date, end=null)</li>
                  <li><strong>Temporary:</strong> Bounded override (start=date, end=date)</li>
                </ul>
                <p className="text-sm text-green-700 mt-1">
                  The resolver selects the most appropriate tariff based on scope and temporal precedence.
                </p>
                <p className="text-sm text-green-700 mt-1 font-medium">
                  UserGroup &gt; Charger &gt; Hub
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerTariff;
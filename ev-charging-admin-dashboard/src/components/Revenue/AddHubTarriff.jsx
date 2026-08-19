// src/components/Revenue/AddHubTariff.jsx
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
  Loader2,
  ArrowLeft,
  Info,
  Sparkles,
  Zap,
  Layers,
  Tag,
  DollarSign,
  IndianRupee,
  Globe,
  CalendarDays,
  Clock,
  Shield,
  Receipt,
  AlertCircle,
  ArrowRight,
  Gauge,
  AlertTriangle,
  Calendar,
  Crown,
  Infinity
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  HUB_TARIFFS_API: (hubId) => `${API_BASE_URL}/api/v1/cpo/hubs/${hubId}/tariffs`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Mapping UI labels to Backend Enum Values - Based on contract
const TARIFF_TYPE_MAP = {
  'Standard': 'fixed',
  'Premium': 'premium',
  'Discount': 'discount',
  'Peak': 'peak',
  'Off-Peak': 'off_peak'
};

const PRICE_TYPE_MAP = {
  'Energy': 'energy',
  'Time': 'time',
  'Sessions': 'sessions'
};

const UNITS_MAP = {
  'kWh': 'kwh',
  'minutes': 'minutes'
};

// Reverse mappings for display
const TARIFF_TYPE_DISPLAY = {
  'fixed': 'Standard',
  'premium': 'Premium',
  'discount': 'Discount',
  'peak': 'Peak',
  'off_peak': 'Off-Peak'
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

const AddHubTariff = () => {
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
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(null);
  const [showHubDropdown, setShowHubDropdown] = useState(false);
  const [chargers, setChargers] = useState([]);
  const [filteredChargers, setFilteredChargers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loadingChargers, setLoadingChargers] = useState(false);
  const [loadingUserGroups, setLoadingUserGroups] = useState(false);
  const [showChargerSelect, setShowChargerSelect] = useState(false);
  const [activeTariffExists, setActiveTariffExists] = useState(false);
  const [rootTariffExists, setRootTariffExists] = useState(false);
  const [checkingActiveTariff, setCheckingActiveTariff] = useState(false);
  const [isRootTariff, setIsRootTariff] = useState(false);
  const [hubVisibility, setHubVisibility] = useState(false);
  
  // Form state - Stores display values (UI labels)
  const [formData, setFormData] = useState({
    hub_id: '',
    charger_id: '',
    user_group_id: '',
    price_per_unit: '',
    idle_fee_per_min: '0',
    currency: 'INR',
    is_active: true,
    start_date: '',
    end_date: '',
    tariff_type: 'Standard',
    price_type: 'Energy',
    units: 'kWh'
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch user info and data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchHubs();
    fetchChargers();
    fetchUserGroups();
    
    const state = location.state;
    if (state && state.hubId) {
      setSelectedHub({ id: state.hubId, name: state.hubName });
      setFormData(prev => ({ ...prev, hub_id: state.hubId }));
      checkHubTariffs(state.hubId);
      checkHubVisibility(state.hubId);
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

  const fetchHubs = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
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

  const fetchUserGroups = useCallback(async () => {
    setLoadingUserGroups(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_GROUPS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const groups = data.user_groups || data.data || data || [];
        setUserGroups(groups);
      } else {
        setUserGroups([]);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setUserGroups([]);
    } finally {
      setLoadingUserGroups(false);
    }
  }, [authenticatedRequest]);

  // Check hub tariffs
  const checkHubTariffs = useCallback(async (hubId) => {
    if (!hubId) return;
    setCheckingActiveTariff(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUB_TARIFFS_API(hubId), {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const tariffData = data.tariffs || data.data || data || [];
        
        // Check if there's an active tariff
        const hasActive = tariffData.some(t => t.is_active === true);
        setActiveTariffExists(hasActive);
        
        // Check if there's a root tariff (no start_date and no end_date)
        const hasRoot = tariffData.some(t => !t.start_date && !t.end_date);
        setRootTariffExists(hasRoot);
      } else {
        setActiveTariffExists(false);
        setRootTariffExists(false);
      }
    } catch (error) {
      console.error('Error checking hub tariffs:', error);
      setActiveTariffExists(false);
      setRootTariffExists(false);
    } finally {
      setCheckingActiveTariff(false);
    }
  }, [authenticatedRequest]);

  // Check hub visibility
  const checkHubVisibility = useCallback(async (hubId) => {
    if (!hubId) return;
    try {
      const hub = hubs.find(h => h.id === hubId);
      if (hub) {
        setHubVisibility(hub.customer_visible || false);
      }
    } catch (error) {
      console.error('Error checking hub visibility:', error);
    }
  }, [hubs]);

  // Filter chargers based on selected hub
  useEffect(() => {
    if (formData.hub_id) {
      const filtered = chargers.filter(c => c.hub_id === formData.hub_id);
      setFilteredChargers(filtered);
    } else {
      setFilteredChargers([]);
    }
  }, [formData.hub_id, chargers]);

  // Check hub tariffs when hub changes
  useEffect(() => {
    if (formData.hub_id) {
      checkHubTariffs(formData.hub_id);
      checkHubVisibility(formData.hub_id);
    }
  }, [formData.hub_id, checkHubTariffs, checkHubVisibility]);

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

  const handleHubSelect = (hub) => {
    setSelectedHub(hub);
    setFormData(prev => ({ ...prev, hub_id: hub.id, charger_id: '' }));
    setShowHubDropdown(false);
    setShowChargerSelect(false);
    checkHubTariffs(hub.id);
    checkHubVisibility(hub.id);
  };

  const handleChargerToggle = () => {
    setShowChargerSelect(!showChargerSelect);
    if (!showChargerSelect) {
      setFormData(prev => ({ ...prev, charger_id: '' }));
    }
  };

  const handleRootTariffToggle = () => {
    setIsRootTariff(!isRootTariff);
    if (!isRootTariff) {
      // If enabling root tariff, clear dates
      setFormData(prev => ({
        ...prev,
        start_date: '',
        end_date: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.hub_id) {
      errors.hub_id = 'Please select a hub';
    }
    if (formData.price_per_unit === '' || formData.price_per_unit === null || formData.price_per_unit === undefined) {
      errors.price_per_unit = 'Price is required';
    } else if (isNaN(formData.price_per_unit) || parseFloat(formData.price_per_unit) < 0) {
      errors.price_per_unit = 'Please enter a valid price';
    }
    if (formData.idle_fee_per_min && (isNaN(formData.idle_fee_per_min) || parseFloat(formData.idle_fee_per_min) < 0)) {
      errors.idle_fee_per_min = 'Please enter a valid idle fee';
    }
    
    // Root tariff must have no dates
    if (!isRootTariff) {
      // Validate date range if both are provided
      if (formData.start_date && formData.end_date) {
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        if (start >= end) {
          errors.date_range = 'Start date must be before end date';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Build API payload based on contract
  const buildApiPayload = () => {
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
    const idleFeePerMin = parseFloat(formData.idle_fee_per_min) || 0;
    
    const payload = {
      price_per_unit: Number(pricePerUnit.toFixed(4)).toString(),
      idle_fee_per_min: Number(idleFeePerMin.toFixed(4)).toString(),
      currency: formData.currency,
      is_active: formData.is_active,
      tariff_type: 'fixed', // Always fixed as per contract
      price_type: PRICE_TYPE_MAP[formData.price_type] || 'energy',
    };

    // For Sessions, omit units
    if (formData.price_type !== 'Sessions') {
      payload.units = UNITS_MAP[formData.units] || 'kwh';
    }

    // Root tariff: no dates
    if (isRootTariff) {
      // Don't include start_date or end_date
    } else {
      // Add date range if provided
      if (formData.start_date && formData.end_date) {
        payload.start_date = new Date(formData.start_date).toISOString();
        payload.end_date = new Date(formData.end_date).toISOString();
      } else if (formData.start_date && !formData.end_date) {
        payload.start_date = new Date(formData.start_date).toISOString();
      }
    }

    return payload;
  };

  // Submit to CreateHubTariff API
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if root tariff exists when trying to create root tariff
    if (isRootTariff && rootTariffExists) {
      setError('A root tariff already exists for this hub. Only one root tariff is allowed.');
      return;
    }

    // If hub is visible, root tariff must exist
    if (hubVisibility && !rootTariffExists && !isRootTariff) {
      setError('This hub is visible. You must create a root tariff first before adding other tariffs.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const apiPayload = buildApiPayload();

      console.log('📤 UI Display Values:', {
        tariff_type_display: formData.tariff_type,
        price_type_display: formData.price_type,
        units_display: formData.units || 'omitted',
        is_root: isRootTariff
      });
      console.log('📤 Full API Payload:', JSON.stringify(apiPayload, null, 2));

      const response = await authenticatedRequest(
        API_CONFIG.HUB_TARIFFS_API(formData.hub_id),
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
        setSuccess(isRootTariff ? 'Root tariff created successfully!' : 'Hub tariff created successfully!');
        // Reset form
        setFormData({
          hub_id: '',
          charger_id: '',
          user_group_id: '',
          price_per_unit: '',
          idle_fee_per_min: '0',
          currency: 'INR',
          is_active: true,
          start_date: '',
          end_date: '',
          tariff_type: 'Standard',
          price_type: 'Energy',
          units: 'kWh'
        });
        setSelectedHub(null);
        setShowChargerSelect(false);
        setIsRootTariff(false);
        setActiveTariffExists(false);
        setRootTariffExists(false);
        // Navigate back to tariffs list after delay
        setTimeout(() => {
          navigate('/revenue/hub-tariffs');
        }, 2000);
      } else {
        let errorMessage = 'Failed to create hub tariff';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        } else if (data.error?.code) {
          errorMessage = `${data.error.code}: ${data.error.message || 'Unknown error'}`;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating hub tariff:', error);
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
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusIcon = (isActive) => {
    return isActive 
      ? <CheckCircle className="w-3 h-3" />
      : <XCircle className="w-3 h-3" />;
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || user?.name || 'User'}
            </h4>
            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email || user?.email || 'user@transev.com'}
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
        <button onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <User size={16} className="text-gray-500" /> <span>Profile</span>
        </button>
        <button onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Building size={16} className="text-gray-500" /> <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button onClick={() => { setShowSettingsMenu(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition">
          <LogOut size={16} className="text-red-500" /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add Dropdown Menu
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/revenue/hub-tariffs')} 
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Add Hub Tariff</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-orange-500 font-medium mt-1">New Tariff</span>
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
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25">
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
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Layers size={24} className="text-orange-600" />
                  Create Hub Tariff
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set up pricing for a specific hub
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-orange-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-orange-600" />
                  <span className="text-orange-700 font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-orange-200 rounded-xl shadow-sm">
                  <DollarSign size={16} className="text-orange-600" />
                  <span className="text-orange-700 font-medium">Pricing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hub Status Info */}
          {selectedHub && (
            <div className={`rounded-2xl p-4 mb-6 flex items-start gap-3 ${
              hubVisibility ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <Info size={20} className={hubVisibility ? 'text-blue-600' : 'text-yellow-600'} />
              <div>
                <p className={`text-sm font-medium ${hubVisibility ? 'text-blue-800' : 'text-yellow-800'}`}>
                  Hub Status: {hubVisibility ? 'Visible' : 'Hidden'}
                </p>
                <p className={`text-sm ${hubVisibility ? 'text-blue-700' : 'text-yellow-700'}`}>
                  {hubVisibility 
                    ? 'This hub is visible to customers. A root tariff is required for visibility.'
                    : 'This hub is hidden. You can create tariffs before making it visible.'
                  }
                  {hubVisibility && !rootTariffExists && (
                    <span className="block mt-1 font-medium text-red-600">
                      ⚠️ Root tariff required for visibility!
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Root Tariff Info */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Crown size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800">What is a Root Tariff?</p>
              <p className="text-sm text-purple-700 mt-1">
                A Root Tariff is the base tariff for a hub with no start/end dates (always active).
                <strong className="block mt-1">
                  {rootTariffExists 
                    ? '✅ Root tariff already exists for this hub.' 
                    : '⚠️ No root tariff exists. You must create one to make the hub visible.'}
                </strong>
              </p>
            </div>
          </div>

          {/* Active Tariff Warning */}
          {activeTariffExists && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Active Tariff Exists</p>
                <p className="text-sm text-yellow-700">
                  This hub already has an active tariff. You can still create additional tariffs.
                </p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-orange-600" />
                Tariff Configuration
              </h3>
              <p className="text-sm text-gray-500 mt-1">Configure the pricing and rules for this hub tariff</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Hub Selection - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hub <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHubDropdown(!showHubDropdown)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                      formErrors.hub_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers size={18} className="text-gray-400" />
                      <span className={selectedHub ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedHub ? selectedHub.name : 'Select a hub'}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${showHubDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showHubDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                          <p className="text-sm">Loading hubs...</p>
                        </div>
                      ) : hubs.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Layers size={24} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No hubs available</p>
                        </div>
                      ) : (
                        hubs.map((hub) => (
                          <button
                            key={hub.id}
                            type="button"
                            onClick={() => handleHubSelect(hub)}
                            className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition flex items-center gap-3 ${
                              selectedHub?.id === hub.id ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              <Layers size={14} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{hub.name}</p>
                              <p className="text-xs text-gray-500">{hub.address || 'No address'}</p>
                              <p className="text-xs text-gray-400">{hub.open_24_hours ? '24/7' : 'Timed'}</p>
                              <p className="text-xs text-gray-400">
                                {hub.customer_visible ? '👁️ Visible' : '👁️ Hidden'}
                                {!hub.customer_visible && ' (Root tariff required)'}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formErrors.hub_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.hub_id}
                  </p>
                )}
              </div>

              {/* Root Tariff Toggle */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="is_root_tariff"
                        checked={isRootTariff}
                        onChange={handleRootTariffToggle}
                        disabled={rootTariffExists}
                        className="sr-only"
                      />
                      <div
                        onClick={() => {
                          if (!rootTariffExists) {
                            handleRootTariffToggle();
                          }
                        }}
                        className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                          isRootTariff ? 'bg-purple-600' : 'bg-gray-300'
                        } ${rootTariffExists ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            isRootTariff ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5 shadow-md`}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Crown size={16} className="text-purple-600" />
                        Create as Root Tariff
                      </p>
                      <p className="text-xs text-gray-500">
                        {rootTariffExists 
                          ? 'Root tariff already exists for this hub' 
                          : 'Root tariff has no start/end dates and is always active'}
                      </p>
                    </div>
                  </div>
                  {rootTariffExists && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      ✅ Already exists
                    </span>
                  )}
                </div>
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
                      formErrors.price_per_unit ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
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
                      formErrors.idle_fee_per_min ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                  />
                </div>
                {formErrors.idle_fee_per_min && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.idle_fee_per_min}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Must be 0 (idle fee is not supported for new tariffs)</p>
              </div>

              {/* Currency, Tariff Type, Price Type - Required */}
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
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
                    Tariff Type <span className="text-red-500 text-lg">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Tag size={18} />
                    </div>
                    <select
                      name="tariff_type"
                      value={formData.tariff_type}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Discount">Discount</option>
                      <option value="Peak">Peak</option>
                      <option value="Off-Peak">Off-Peak</option>
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
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
              </div>

              {/* Units - Required for Energy and Time */}
              {formData.price_type !== 'Sessions' && (
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                    >
                      {formData.price_type === 'Energy' && (
                        <option value="kWh">kWh</option>
                      )}
                      {formData.price_type === 'Time' && (
                        <option value="minutes">Minutes</option>
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.price_type === 'Energy' && 'Energy priced per kWh'}
                    {formData.price_type === 'Time' && 'Time priced per minute'}
                  </p>
                </div>
              )}

              {formData.price_type === 'Sessions' && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <Info size={14} className="inline mr-1" />
                    Sessions pricing: One fixed amount for one completed session. Units are omitted.
                  </p>
                </div>
              )}

              {/* Date Range - Only shown if not root tariff */}
              {!isRootTariff && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      Schedule Type (Non-Root Tariff)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            start_date: '',
                            end_date: ''
                          }));
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${
                          !formData.start_date && !formData.end_date
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className={!formData.start_date && !formData.end_date ? 'text-orange-500' : 'text-gray-400'} />
                          Unbounded (No dates)
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Always active</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          const future = new Date();
                          future.setMonth(future.getMonth() + 1);
                          setFormData(prev => ({
                            ...prev,
                            start_date: today.toISOString().split('T')[0],
                            end_date: future.toISOString().split('T')[0]
                          }));
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${
                          formData.start_date && formData.end_date
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className={formData.start_date && formData.end_date ? 'text-orange-500' : 'text-gray-400'} />
                          Bounded
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Fixed date range</p>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Start Date <span className="text-gray-400 text-sm">(optional)</span>
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        End Date <span className="text-gray-400 text-sm">(optional)</span>
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  {formErrors.date_range && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors.date_range}
                    </p>
                  )}
                </>
              )}

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
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
                        formData.is_active ? 'bg-orange-600' : 'bg-gray-300'
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
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formData.is_active 
                        ? 'Tariff will be available for use' 
                        : 'Tariff will be hidden and inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">What is a Hub Tariff?</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Hub tariffs define the pricing structure for a specific hub.
                      You can optionally link it to a specific charger or customer group.
                      GST is managed separately at the Hub level and is not included in tariff creation.
                    </p>
                    <p className="text-sm text-orange-700 mt-2">
                      <strong>Important:</strong> A <strong>Root Tariff</strong> (no start/end dates) is required for hub visibility.
                      You can create multiple tariffs, but only one root tariff is allowed per hub.
                    </p>
                    <p className="text-sm text-orange-700 mt-2">
                      <strong>API Mapping:</strong> Tariff Type: {formData.tariff_type} → {TARIFF_TYPE_MAP[formData.tariff_type]}, 
                      Price Type: {formData.price_type} → {PRICE_TYPE_MAP[formData.price_type]}, 
                      Units: {formData.price_type === 'Sessions' ? 'omitted' : (formData.units || 'kWh')}
                    </p>
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
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || (hubVisibility && !rootTariffExists && !isRootTariff)}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed ${
                    !(hubVisibility && !rootTariffExists && !isRootTariff) ? 'hover:from-orange-700 hover:to-amber-700' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Tariff...
                    </>
                  ) : (hubVisibility && !rootTariffExists && !isRootTariff) ? (
                    <>
                      <AlertCircle size={20} />
                      Create Root Tariff First
                    </>
                  ) : (
                    <>
                      <Layers size={20} />
                      {isRootTariff ? 'Create Root Tariff' : 'Create Tariff'}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/revenue/hub-tariffs')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Layers className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Hub Level Pricing</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Set custom pricing for entire hubs with a single tariff configuration
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Charger Specific</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Optionally target specific chargers within the hub for granular control
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Root Tariff Support</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Create a root tariff (no expiry) for hub visibility, plus additional tariffs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHubTariff;
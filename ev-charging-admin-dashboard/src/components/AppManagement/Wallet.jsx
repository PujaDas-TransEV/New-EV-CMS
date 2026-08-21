
// src/components/Revenue/WalletSettings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CalendarRange,
  Wallet as WalletIcon,
  Coins,
  PiggyBank,
  TrendingUp as TrendingUpIcon,
  AlertTriangle,
  Edit2,
  Save as SaveIcon,
  AppWindow,
  Smartphone as SmartphoneIcon,
  RefreshCw as RefreshIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// ============================================================================
// API Configuration
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  SETTINGS_API: `${API_BASE_URL}/api/v1/cpo/settings`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const WalletSettings = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Wallet Settings State
  const [walletSettings, setWalletSettings] = useState({
    wallet_min_balance: 0,
    wallet_buffer_min_balance: 0
  });
  
  // Form State for Editing
  const [editFormData, setEditFormData] = useState({
    wallet_min_balance: 0,
    wallet_buffer_min_balance: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = useCallback(async () => {
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
  }, [authenticatedRequest]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.SETTINGS_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Extract wallet settings from response
        const settings = data.settings || data.data || data || {};
        
        const minBalance = settings.wallet_min_balance !== undefined ? settings.wallet_min_balance : 0;
        const bufferBalance = settings.wallet_buffer_min_balance !== undefined ? settings.wallet_buffer_min_balance : 0;
        
        setWalletSettings({
          wallet_min_balance: minBalance,
          wallet_buffer_min_balance: bufferBalance
        });
        
        setEditFormData({
          wallet_min_balance: minBalance,
          wallet_buffer_min_balance: bufferBalance
        });
      } else {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setError(data.message || 'Failed to fetch wallet settings');
        } catch {
          setError('Failed to fetch wallet settings');
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('An error occurred while fetching settings');
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form to current values when entering edit mode
      setEditFormData({
        wallet_min_balance: walletSettings.wallet_min_balance,
        wallet_buffer_min_balance: walletSettings.wallet_buffer_min_balance
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  // ============================================================================
  // Build FormData for multipart/form-data request
  // ============================================================================
  const buildFormData = () => {
    const formData = new FormData();
    
    // Add wallet_min_balance as string
    formData.append('wallet_min_balance', String(editFormData.wallet_min_balance));
    formData.append('wallet_buffer_min_balance', String(editFormData.wallet_buffer_min_balance));
    
    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = buildFormData();

      console.log('📤 Updating Wallet Settings (FormData):');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      const response = await authenticatedRequest(
        API_CONFIG.SETTINGS_API,
        {
          method: 'POST',
          headers: {
            // Do NOT set Content-Type header - browser will set it with boundary
            'Accept': 'application/json'
          },
          body: formData
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

      if (response.ok) {
        setSuccess('Wallet settings updated successfully!');
        
        // Update local state
        setWalletSettings({
          wallet_min_balance: editFormData.wallet_min_balance,
          wallet_buffer_min_balance: editFormData.wallet_buffer_min_balance
        });
        
        setIsEditing(false);
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        let errorMessage = 'Failed to update wallet settings';
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
      console.error('Error updating settings:', error);
      setError(error.message || 'An error occurred while updating settings');
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

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ 0';
    return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-80 shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
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

  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
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
        {/* HEADER - App Management */}
        <header className="bg-white border-b-2 border-gray-100 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AppWindow size={24} className="text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">App Management</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-600 font-medium mt-1">Wallet Settings</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button
                onClick={fetchSettings}
                className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 hover:text-gray-800"
                title="Refresh settings"
              >
                <RefreshIcon size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* SINGLE TAB - Wallet Settings */}
        <div className="border-b border-gray-100 bg-white px-6">
          <div className="flex flex-wrap items-center gap-1">
            <button 
              className="flex items-center gap-2 px-5 py-5 rounded-t-xl text-sm font-medium transition bg-blue-50 text-blue-600 border-b-2 border-blue-600"
            >
              <SmartphoneIcon size={18} />
              Wallet Settings
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-6 max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <WalletIcon size={24} className="text-blue-600" />
                  Wallet Configuration
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure wallet balance limits for your customers
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-blue-600" />
                  <span className="text-blue-700 font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-xl shadow-sm">
                  <Wallet size={16} className="text-blue-600" />
                  <span className="text-blue-700 font-medium">Wallet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Success</p>
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Wallet Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Minimum Balance Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Minimum Balance</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {formatCurrency(walletSettings.wallet_min_balance)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Minimum wallet balance required for charging
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                        <PiggyBank className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Info size={14} className="text-blue-500" />
                        <span>Users must maintain this minimum balance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buffer Balance Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Buffer Balance</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {formatCurrency(walletSettings.wallet_buffer_min_balance)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Buffer amount to handle pending transactions
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                        <Coins className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Info size={14} className="text-purple-500" />
                        <span>Buffer for successful transaction completion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <WalletIcon size={20} className="text-blue-600" />
                      Wallet Configuration
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure wallet balance settings for your CPO platform
                    </p>
                  </div>
                  {!isEditing ? (
                    <button 
                      onClick={handleEditToggle} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25"
                    >
                      <Edit2 size={16} />
                      Edit Settings
                    </button>
                  ) : (
                    <button 
                      onClick={handleEditToggle} 
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2 font-medium"
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {isEditing ? (
                    // Edit Form
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Minimum Balance */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Minimum Balance <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <IndianRupee size={18} />
                            </div>
                            <input
                              type="number"
                              name="wallet_min_balance"
                              value={editFormData.wallet_min_balance}
                              onChange={handleEditChange}
                              placeholder="0"
                              step="1"
                              min="0"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                              required
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            Minimum wallet balance users must maintain (whole currency amount)
                          </p>
                        </div>

                        {/* Buffer Balance */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Buffer Balance <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <IndianRupee size={18} />
                            </div>
                            <input
                              type="number"
                              name="wallet_buffer_min_balance"
                              value={editFormData.wallet_buffer_min_balance}
                              onChange={handleEditChange}
                              placeholder="0"
                              step="1"
                              min="0"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                              required
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            Buffer amount for pending transactions (whole currency amount)
                          </p>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">About Wallet Settings</p>
                            <p className="text-sm text-blue-700 mt-1">
                              <strong>Minimum Balance:</strong> The minimum wallet balance required for users to start a charging session.
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              <strong>Buffer Balance:</strong> The buffer amount held to ensure successful transaction completion.
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              These settings help maintain smooth wallet operations and transaction processing.
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              ⚡ Values are stored as whole currency amounts (e.g., 100 = ₹100)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <SaveIcon size={20} />
                              Save Settings
                              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleEditToggle}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <div className="space-y-6">
                      {/* Current Settings Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <PiggyBank size={20} className="text-blue-600" />
                            <p className="text-sm font-medium text-gray-700">Minimum Balance</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(walletSettings.wallet_min_balance)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Users must maintain this balance
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                          <div className="flex items-center gap-3 mb-2">
                            <Coins size={20} className="text-purple-600" />
                            <p className="text-sm font-medium text-gray-700">Buffer Balance</p>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(walletSettings.wallet_buffer_min_balance)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Buffer for pending transactions
                          </p>
                        </div>
                      </div>

                      {/* Information */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <Info size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Current Configuration</p>
                            <p className="text-sm text-gray-500 mt-1">
                              These wallet settings determine the balance requirements for all users on your CPO platform.
                            </p>
                            <ul className="text-sm text-gray-500 mt-2 list-disc list-inside space-y-1">
                              <li><strong>Minimum Balance:</strong> {formatCurrency(walletSettings.wallet_min_balance)}</li>
                              <li><strong>Buffer Balance:</strong> {formatCurrency(walletSettings.wallet_buffer_min_balance)}</li>
                            </ul>
                            <p className="text-xs text-gray-400 mt-2">
                              Click "Edit Settings" to update these values
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                      <PiggyBank className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Minimum Balance</h4>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Set the minimum wallet balance required for users to start charging
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                      <Coins className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Buffer Balance</h4>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Configure buffer amount for pending transaction completion
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Easy Management</h4>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Simple and intuitive wallet balance management for CPO administrators
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;
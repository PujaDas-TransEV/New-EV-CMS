// src/components/Revenue/ChargerTariff.jsx
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
  Search,
  Users,
  UserCog,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Tag,
  FileText,
  Layers,
  Percent,
  Receipt,
  BarChart,
  PieChart,
  Zap,
  Calendar,
  Clock,
  X,
  AlertCircle,
  Shield,
  ArrowLeft,
  IndianRupee,
  Globe,
  CalendarDays,
  Info,
  Sparkles,
  DollarSign,
  Link as LinkIcon,
  Wifi,
  Plug,
  Battery,
  Gauge,
  RadioTower,
  Power,
  PowerOff,
  Activity,
  MoreVertical,
  Filter,
  RefreshCw,
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  CHARGER_TARIFFS_API: (chargerId) => `${API_BASE_URL}/api/v1/cpo/chargers/${chargerId}/tariffs`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const ChargerTariff = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chargers, setChargers] = useState([]);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [loadingTariffs, setLoadingTariffs] = useState(false);
  const [showTariffDetail, setShowTariffDetail] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/revenue/overview' },
    { id: 'driver_tariffs', label: 'Customer Tariffs', icon: Users, path: '/revenue/customer-tariffs' },
    { id: 'charger_tariffs', label: 'Charger Tariffs', icon: Zap, path: '/revenue/charger-tariffs' },
    { id: 'hub_tariffs', label: 'Hub Tariffs', icon: Layers, path: '/revenue/hub-tariffs' },
    { id: 'tax', label: 'Tax', icon: Receipt, path: '/revenue/tax' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/revenue/settings' }
  ];

  // Fetch user info and chargers
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchChargers();
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

  // Fetch chargers using GET /api/v1/cpo/chargers
  const fetchChargers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGERS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const chargersData = data.chargers || data.data || data || [];
        setChargers(chargersData);
        if (chargersData.length > 0) {
          setSelectedCharger(chargersData[0]);
          fetchTariffs(chargersData[0].id);
        }
      } else {
        setError('Failed to fetch chargers');
      }
    } catch (error) {
      console.error('Error fetching chargers:', error);
      setError('An error occurred while fetching chargers');
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  // Fetch tariffs for a specific charger
  const fetchTariffs = useCallback(async (chargerId) => {
    setLoadingTariffs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGER_TARIFFS_API(chargerId), {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const tariffData = data.tariffs || data.data || data || [];
        setTariffs(tariffData);
      } else {
        setTariffs([]);
      }
    } catch (error) {
      console.error('Error fetching charger tariffs:', error);
      setTariffs([]);
    } finally {
      setLoadingTariffs(false);
    }
  }, [authenticatedRequest]);

  const handleChargerSelect = (charger) => {
    setSelectedCharger(charger);
    fetchTariffs(charger.id);
    setShowTariffDetail(false);
    setSelectedTariff(null);
  };

  const handleTariffClick = (tariff) => {
    setSelectedTariff(tariff);
    setShowTariffDetail(true);
  };

  // Handle Add Tariff - Navigate to Add Charger Tariff page
  const handleAddTariff = () => {
    if (selectedCharger) {
      navigate('/revenue/add-charger-tariff', { 
        state: { chargerId: selectedCharger.id, chargerName: selectedCharger.charger_name || selectedCharger.charger_id }
      });
    } else {
      navigate('/revenue/add-charger-tariff');
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

  const handleTabClick = (tabId, path) => {
    if (tabId === 'charger_tariffs') return;
    navigate(path);
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

  const formatCurrency = (amount) => {
    if (!amount) return '₹ 0';
    return `₹ ${parseFloat(amount).toLocaleString('en-IN')}`;
  };

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

  const getChargerStatusColor = (status) => {
    const statusMap = {
      'active': 'bg-green-100 text-green-700 border-green-200',
      'inactive': 'bg-gray-100 text-gray-700 border-gray-200',
      'maintenance': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'offline': 'bg-red-100 text-red-700 border-red-200',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getChargerStatusIcon = (status) => {
    if (status?.toLowerCase() === 'active') return <Power className="w-3 h-3" />;
    if (status?.toLowerCase() === 'inactive') return <PowerOff className="w-3 h-3" />;
    if (status?.toLowerCase() === 'maintenance') return <Activity className="w-3 h-3" />;
    return <PowerOff className="w-3 h-3" />;
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

  // Tariff Detail Component
  const TariffDetail = ({ tariff, onClose, onEdit }) => {
    if (!tariff) return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Charger Tariff Details</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(tariff)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit Tariff"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Tariff ID</p>
              <p className="text-sm font-semibold text-gray-900">{tariff.id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(tariff.is_active)}`}>
                {getStatusIcon(tariff.is_active)}
                {tariff.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Price per kWh</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(tariff.price_per_kwh)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Idle Fee per Minute</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(tariff.idle_fee_per_min || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Currency</p>
              <p className="text-sm font-medium text-gray-900">{tariff.currency || 'INR'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Tariff Type</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {tariff.tariff_type || 'Standard'}
              </span>
            </div>
          </div>

          {tariff.start_date || tariff.end_date ? (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Validity Period</p>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(tariff.start_date)}</p>
                </div>
                <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(tariff.end_date)}</p>
                </div>
              </div>
            </div>
          ) : null}

          {tariff.user_group_id && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Group</p>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-sm font-medium text-gray-900">Group ID: {tariff.user_group_id}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => onEdit(tariff)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
            >
              <Edit size={16} />
              Edit Tariff
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Revenue Management</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-600 font-medium mt-1">Charger Tariffs</span>
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

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === 'charger_tariffs';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`flex items-center gap-2 px-5 py-5 rounded-t-xl text-sm font-medium transition ${
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

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chargers List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Chargers</h3>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {chargers.length}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by charger..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                  ) : chargers.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No chargers found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {chargers
                        .filter(c => 
                          (c.charger_name || c.charger_id || '')
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((charger) => (
                          <button
                            key={charger.id}
                            onClick={() => handleChargerSelect(charger)}
                            className={`w-full text-left p-3 rounded-xl border transition ${
                              selectedCharger?.id === charger.id
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                  <Zap size={14} className="text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {charger.charger_name || charger.charger_id || 'Unnamed Charger'}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                    ID: {charger.charger_id}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getChargerStatusColor(charger.status)}`}>
                                {getChargerStatusIcon(charger.status)}
                                {charger.status || 'Unknown'}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span>Power: {charger.max_power_kw || 0} kW</span>
                              <span>Connectors: {charger.number_of_connectors || 0}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Tariffs List */}
            <div className="lg:col-span-2">
              {selectedCharger ? (
                <>
                  {/* Charger Info Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {selectedCharger.charger_name || selectedCharger.charger_id || 'Unnamed Charger'}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {selectedCharger.charger_id}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>Status: {selectedCharger.status || 'Unknown'}</span>
                            <span>Power: {selectedCharger.max_power_kw || 0} kW</span>
                            <span>Connectors: {selectedCharger.number_of_connectors || 0}</span>
                          </div>
                        </div>
                      </div>
                      {/* Add Tariff Button */}
                      <button
                        onClick={handleAddTariff}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                      >
                        <Plus size={18} />
                        Add Tariff
                      </button>
                    </div>
                  </div>

                  {/* Tariffs List */}
                  {loadingTariffs ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-gray-200">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : tariffs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <Zap className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No Tariffs Found</p>
                      <p className="text-sm text-gray-400 mt-1">Create your first tariff for this charger</p>
                      <button
                        onClick={handleAddTariff}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Plus size={16} className="inline mr-1" />
                        Create Tariff
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {tariffs.map((tariff) => (
                        <div
                          key={tariff.id}
                          onClick={() => handleTariffClick(tariff)}
                          className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden hover:border-blue-300"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                                  <Tag className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">Tariff #{tariff.id?.slice(0, 8) || 'N/A'}</h4>
                                  <p className="text-sm text-gray-500">
                                    Price: {formatCurrency(tariff.price_per_kwh)} / kWh
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tariff.is_active)}`}>
                                      {getStatusIcon(tariff.is_active)}
                                      {tariff.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    {tariff.tariff_type && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                        {tariff.tariff_type}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Idle Fee</p>
                                <p className="text-sm font-bold text-gray-900">{formatCurrency(tariff.idle_fee_per_min || 0)}/min</p>
                                <p className="text-xs text-gray-400">{tariff.currency || 'INR'}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {tariff.start_date && (
                                  <span>Valid: {formatDate(tariff.start_date)} - {formatDate(tariff.end_date) || '∞'}</span>
                                )}
                                {tariff.user_group_id && (
                                  <span>Group: {tariff.user_group_id?.slice(0, 8)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTariffClick(tariff);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                    setSelectedTariff(tariff);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Edit Tariff"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <Zap className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Select a Charger</p>
                  <p className="text-sm text-gray-400 mt-1">Choose a charger from the left to view its tariffs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargerTariff;
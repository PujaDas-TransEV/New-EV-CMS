// src/components/Revenue/CustomerTariff.jsx
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
  Users as UsersIcon,
  UserCog,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
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
  Zap,
  DollarSign,
  Tag,
  FileText,
  Layers,
  Grid,
  List,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Crown,
  Wallet,
  CreditCard,
  Receipt,
  BarChart,
  PieChart,
  LineChart,
  Percent,
  IndianRupee,
  XCircle,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
  USER_GROUP_TARIFFS_API: (groupId) => `${API_BASE_URL}/api/v1/cpo/user-groups/${groupId}/tariffs`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const CustomerTariff = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [loadingTariffs, setLoadingTariffs] = useState(false);
  const [showTariffDetail, setShowTariffDetail] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/revenue/overview' },
    { id: 'driver_tariffs', label: 'Driver Tariffs', icon: Tag, path: '/revenue/driver-tariffs' },
    { id: 'charger_tariffs', label: 'Charger Tariffs', icon: Zap, path: '/revenue/charger-tariffs' },
    { id: 'aggregation', label: 'Aggregation Fee', icon: Percent, path: '/revenue/aggregation' },
    { id: 'tax', label: 'Tax', icon: Receipt, path: '/revenue/tax' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/revenue/settings' }
  ];

  // Fetch user info and groups
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchUserGroups();
  }, [isAuthenticated, navigate]);

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
        if (groups.length > 0) {
          setSelectedGroup(groups[0]);
          fetchTariffs(groups[0].id);
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
  }, [authenticatedRequest]);

  const fetchTariffs = useCallback(async (groupId) => {
    setLoadingTariffs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_GROUP_TARIFFS_API(groupId), {
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
      console.error('Error fetching tariffs:', error);
      setTariffs([]);
    } finally {
      setLoadingTariffs(false);
    }
  }, [authenticatedRequest]);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    fetchTariffs(group.id);
    setShowTariffDetail(false);
    setSelectedTariff(null);
  };

  const handleTariffClick = (tariff) => {
    setSelectedTariff(tariff);
    setShowTariffDetail(true);
  };

  // ✅ Handle Add Tariff - Navigate to Add Customer Tariff page with group ID
  const handleAddTariff = () => {
    if (selectedGroup) {
      navigate('/revenue/add-customer-tariff', { 
        state: { groupId: selectedGroup.id, groupName: selectedGroup.name }
      });
    } else {
      navigate('/revenue/add-customer-tariff');
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
    if (tabId === 'driver_tariffs') return;
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
    return `₹ ${amount.toLocaleString('en-IN')}`;
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
          <Plus size={18} className="text-gray-400" /> Add Hub
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
            <Tag className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Tariff Details</h3>
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
              <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
              <p className="text-sm font-semibold text-gray-900">{tariff.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
              <p className="text-sm text-gray-700">{tariff.description || '----'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Tariff Type</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {tariff.tariff_type || 'Flat Tariff'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Validity</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(tariff.valid_from)} -- {formatDate(tariff.valid_to)}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pricing</p>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Price Type</p>
                  <p className="text-sm font-medium text-gray-900">{tariff.price_type || 'Fixed'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(tariff.amount)}</p>
                </div>
                {tariff.unit && (
                  <div>
                    <p className="text-xs text-gray-500">Unit</p>
                    <p className="text-sm font-medium text-gray-900">{tariff.unit}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assigned Assets</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <Zap size={12} />
                Chargers: {tariff.charger_count || 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <Layers size={12} />
                Hubs: {tariff.hub_count || 0}
              </span>
            </div>
          </div>

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
                <span className="text-sm text-blue-400 font-medium mt-1">Driver Tariffs</span>
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
              const isActive = tab.id === 'driver_tariffs';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
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

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Groups List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Customer Groups</h3>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {userGroups.length}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by group name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                    </div>
                  ) : userGroups.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No groups found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {userGroups
                        .filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((group) => (
                          <button
                            key={group.id}
                            onClick={() => handleGroupSelect(group)}
                            className={`w-full text-left p-3 rounded-xl border transition ${
                              selectedGroup?.id === group.id
                                ? 'border-green-500 bg-green-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                  {group.name?.charAt(0) || 'G'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{group.name}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                    {group.description || 'No description'}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(group.is_active)}`}>
                                {getStatusIcon(group.is_active)}
                                {group.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span>Members: {group.member_count || 0}</span>
                              <span>Created: {formatDate(group.created_at)}</span>
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
              {selectedGroup ? (
                <>
                  {/* Group Info Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                          <UserCog className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{selectedGroup.name}</h3>
                          <p className="text-sm text-gray-500">{selectedGroup.description || 'No description'}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>Total Drivers: {selectedGroup.member_count || 0}</span>
                            <span>Created: {formatDate(selectedGroup.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {/* ✅ Add Tariff Button - Navigates to Add Customer Tariff page */}
                      <button
                        onClick={handleAddTariff}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25"
                      >
                        <Plus size={18} />
                        Add Tariff
                      </button>
                    </div>
                  </div>

                  {/* Tariffs List */}
                  {loadingTariffs ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-gray-200">
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                  ) : tariffs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <Tag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No Tariffs Found</p>
                      <p className="text-sm text-gray-400 mt-1">Create your first tariff for this group</p>
                      <button
                        onClick={handleAddTariff}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0">
                                  <Tag className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{tariff.name}</h4>
                                  <p className="text-sm text-gray-500">{tariff.description || 'No description'}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                      {tariff.tariff_type || 'Flat Tariff'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tariff.is_active)}`}>
                                      {getStatusIcon(tariff.is_active)}
                                      {tariff.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(tariff.amount)}</p>
                                <p className="text-xs text-gray-400">{tariff.price_type || 'Fixed'}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Valid: {formatDate(tariff.valid_from)} - {formatDate(tariff.valid_to)}</span>
                                <span>Chargers: {tariff.charger_count || 0}</span>
                                <span>Hubs: {tariff.hub_count || 0}</span>
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
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Select a Customer Group</p>
                  <p className="text-sm text-gray-400 mt-1">Choose a group from the left to view its tariffs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTariff;
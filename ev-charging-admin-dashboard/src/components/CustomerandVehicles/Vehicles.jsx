// src/components/CustomerandVehicles/Vehicles.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  UserCog,
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
  Search as SearchIcon,
  Zap,
  Car,
  Gauge,
  Battery,
  Calendar as CalendarIcon,
  MapPin,
  Wrench,
  Power,
  PowerOff,
  AlertTriangle,
  Info,
  Sparkles,
  TrendingUp,
  Award,
  Star,
  Layers,
  Gift,
  Crown,
  FileText,
  List,
  Grid,
  ArrowUpDown,
  Check,
  Circle,
  CircleCheck,
  CircleX,
  CircleAlert,
  Activity,
  Users as UsersIcon,
  Bell,
  AlertTriangle as AlertIcon,
  UserCog as UserCogIcon,
  LayoutDashboard,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  VEHICLES_API: `${API_BASE_URL}/api/v1/cpo/vehicles`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Mock Data (Backup if API fails)
const mockVehicles = [
  { id: 1, vehicle_number: 'KA-01-AB-1234', type: 'Electric', make: 'Tesla', model: 'Model 3', last_charged: '2026-09-02 14:30', date_added: '2026-08-15', status: 'active', battery_level: 87, hub: 'Koramangala Hub' },
  { id: 2, vehicle_number: 'DL-02-CD-5678', type: 'Hybrid', make: 'Toyota', model: 'Prius', last_charged: '2026-09-01 09:15', date_added: '2026-07-20', status: 'inactive', battery_level: 34, hub: 'Connaught Place' },
  { id: 3, vehicle_number: 'MH-03-EF-9012', type: 'Electric', make: 'BYD', model: 'Atto 3', last_charged: '2026-09-02 18:45', date_added: '2026-08-01', status: 'active', battery_level: 92, hub: 'BKC Hub' },
  { id: 4, vehicle_number: 'TN-04-GH-3456', type: 'ICE', make: 'Hyundai', model: 'Creta', last_charged: '2026-08-31 11:00', date_added: '2026-06-10', status: 'maintenance', battery_level: 0, hub: 'OMR Hub' },
  { id: 5, vehicle_number: 'KA-05-IJ-7890', type: 'Electric', make: 'Tata', model: 'Nexon EV', last_charged: '2026-09-02 12:20', date_added: '2026-08-25', status: 'active', battery_level: 78, hub: 'Whitefield Hub' },
  { id: 6, vehicle_number: 'DL-06-KL-1234', type: 'Hybrid', make: 'Honda', model: 'City Hybrid', last_charged: '2026-09-01 16:30', date_added: '2026-07-05', status: 'active', battery_level: 56, hub: 'Noida Hub' },
  { id: 7, vehicle_number: 'MH-07-MN-5678', type: 'Electric', make: 'MG', model: 'ZS EV', last_charged: '2026-08-30 08:00', date_added: '2026-05-12', status: 'inactive', battery_level: 12, hub: 'Pune Hub' },
  { id: 8, vehicle_number: 'TN-08-OP-9012', type: 'ICE', make: 'Mahindra', model: 'XUV700', last_charged: '2026-08-29 10:15', date_added: '2026-04-18', status: 'active', battery_level: 0, hub: 'Chennai Hub' },
];

// Tab Configuration with Icons
const tabs = [
  { id: 'drivers', label: 'Customers', icon: <UsersIcon size={16} />, path: '/customers' },
  { id: 'driver-alerts', label: 'Customer Alerts', icon: <Bell size={16} />, path: '/customer-alerts' },
  { id: 'driver-groups', label: 'Customer Groups', icon: <UserCogIcon size={16} />, path: '/customer-groups' },
  { id: 'vehicles', label: 'Vehicles', icon: <Car size={16} />, path: '/vehicles' },
];

const Vehicles = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  // State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Filter Types
  const filterTypes = ['All', 'Active', 'Inactive', 'Maintenance', 'Electric', 'Hybrid', 'ICE'];

  // Fetch user info
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchVehicles();
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

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.VEHICLES_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setVehicles(data.data);
        } else if (Array.isArray(data)) {
          setVehicles(data);
        } else {
          console.warn('Using mock data - API returned unexpected format');
          setVehicles(mockVehicles);
        }
      } else {
        console.warn('Using mock data - API request failed');
        setVehicles(mockVehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  };

  // Filter and Search Logic
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.vehicle_number?.toLowerCase().includes(query) ||
        vehicle.make?.toLowerCase().includes(query) ||
        vehicle.model?.toLowerCase().includes(query) ||
        vehicle.type?.toLowerCase().includes(query) ||
        vehicle.hub?.toLowerCase().includes(query)
      );
    }

    if (selectedFilter !== 'All') {
      if (['Active', 'Inactive', 'Maintenance'].includes(selectedFilter)) {
        filtered = filtered.filter(v => 
          v.status?.toLowerCase() === selectedFilter.toLowerCase()
        );
      } else {
        filtered = filtered.filter(v => 
          v.type?.toLowerCase() === selectedFilter.toLowerCase()
        );
      }
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [vehicles, searchQuery, selectedFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle Sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Select All / Single
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVehicles(paginatedVehicles.map(v => v.id));
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleSelectVehicle = (id) => {
    setSelectedVehicles(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  // Delete Vehicle
  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    
    try {
      const response = await authenticatedRequest(
        `${API_CONFIG.VEHICLES_API}/${vehicleToDelete.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
        setSelectedVehicles(prev => prev.filter(v => v !== vehicleToDelete.id));
        setSuccess('Vehicle deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete vehicle');
      }
    } catch (error) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
      setSelectedVehicles(prev => prev.filter(v => v !== vehicleToDelete.id));
      setSuccess('Vehicle deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  // Get Status Badge
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: <CircleCheck size={12} className="mr-1" /> },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <CircleX size={12} className="mr-1" /> },
      maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <CircleAlert size={12} className="mr-1" /> },
    };
    const s = status?.toLowerCase() || 'inactive';
    const style = statusMap[s] || statusMap.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${style.color}`}>
        {style.icon}
        {style.label}
      </span>
    );
  };

  // Battery Level Indicator
  const getBatteryLevel = (percentage) => {
    const level = percentage || 0;
    const colors = level > 70 ? 'bg-green-500' : level > 30 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${colors} transition-all duration-500`} style={{ width: `${level}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-600 min-w-[32px]">{level}%</span>
      </div>
    );
  };

  // Vehicle Type Badge
  const getTypeBadge = (type) => {
    const typeMap = {
      electric: { label: 'Electric', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      hybrid: { label: 'Hybrid', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      ice: { label: 'ICE', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    const t = type?.toLowerCase() || 'ice';
    const style = typeMap[t] || typeMap.ice;
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${style.color}`}>
        {style.label}
      </span>
    );
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

  // ✅ Add Dropdown Menu - Add Hub & Add Charger
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-56 shadow-2xl border border-gray-200 z-50 overflow-hidden">
      <div className="p-2">
        <button 
          onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} 
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition"
        >
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-blue-600" />
          </div>
          <span>Add Hub</span>
        </button>
        <button 
          onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} 
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition"
        >
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Battery size={16} className="text-green-600" />
          </div>
          <span>Add Charger</span>
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Customers & Vehicles</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-400 font-medium mt-1">Vehicles</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              {/* ✅ Settings Button */}
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

              {/* ✅ Plus Button - Add Hub & Add Charger */}
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

          {/* Separator Line */}
          <div className="mt-3 border-b border-gray-200"></div>

          {/* Navigation Tabs with Icons */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'vehicles') return;
                    navigate(tab.path);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                    tab.id === 'vehicles' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg'
                  }`}
                >
                  <span className={tab.id === 'vehicles' ? 'text-blue-600' : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {tab.id === 'vehicles' && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-normal">
                      {vehicles.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-6">
          {/* Breadcrumb */}
         

          {/* Filters and Search Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles by number, make, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none bg-gray-50 hover:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 hover:bg-white transition cursor-pointer"
                >
                  {filterTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={fetchVehicles}
                className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <span className="text-sm text-gray-500 ml-auto">
                Showing {paginatedVehicles.length} of {filteredVehicles.length} vehicles
              </span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-2 text-red-700">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-2 text-green-700">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Vehicles Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                  <p className="mt-4 text-gray-500">Loading vehicles...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3.5 text-left w-10">
                          <input
                            type="checkbox"
                            checked={selectedVehicles.length === paginatedVehicles.length && paginatedVehicles.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                        </th>
                        {[
                          { key: 'vehicle_number', label: 'VEHICLE NUMBER' },
                          { key: 'type', label: 'TYPE' },
                          { key: 'make', label: 'MAKE' },
                          { key: 'model', label: 'MODEL' },
                          { key: 'last_charged', label: 'LAST CHARGED' },
                          { key: 'battery_level', label: 'BATTERY' },
                          { key: 'status', label: 'STATUS' },
                          { key: 'hub', label: 'HUB' },
                          { key: 'date_added', label: 'DATE ADDED' },
                        ].map(({ key, label }) => (
                          <th
                            key={key}
                            onClick={() => handleSort(key)}
                            className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition group"
                          >
                            <div className="flex items-center gap-1.5">
                              {label}
                              <ArrowUpDown size={12} className="text-gray-400 group-hover:text-gray-600" />
                              {sortConfig.key === key && (
                                <span className="text-blue-600">
                                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedVehicles.length === 0 ? (
                        <tr>
                          <td colSpan="11" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Car size={40} className="text-gray-300" />
                              <p className="text-gray-500 font-medium">No vehicles found</p>
                              <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedVehicles.map((vehicle) => (
                          <tr 
                            key={vehicle.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              selectedVehicles.includes(vehicle.id) ? 'bg-blue-50' : ''
                            }`}
                          >
                            <td className="px-4 py-3.5">
                              <input
                                type="checkbox"
                                checked={selectedVehicles.includes(vehicle.id)}
                                onChange={() => handleSelectVehicle(vehicle.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-mono text-sm font-medium text-gray-900">
                                {vehicle.vehicle_number || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {getTypeBadge(vehicle.type)}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">
                              {vehicle.make || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-700">
                              {vehicle.model || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {vehicle.last_charged || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5">
                              {getBatteryLevel(vehicle.battery_level)}
                            </td>
                            <td className="px-4 py-3.5">
                              {getStatusBadge(vehicle.status)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin size={12} className="text-gray-400" />
                                {vehicle.hub || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {vehicle.date_added || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-600 transition"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setVehicleToDelete(vehicle);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition">
                                  <MoreVertical size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-4 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {selectedVehicles.length > 0 ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        {selectedVehicles.length} vehicle{selectedVehicles.length > 1 ? 's' : ''} selected
                      </span>
                    ) : (
                      <span>Showing {paginatedVehicles.length} of {filteredVehicles.length} vehicles</span>
                    )}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3.5 py-1.5 text-sm rounded-lg transition ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Fleet Management</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Monitor and manage your entire vehicle fleet from a single dashboard
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Battery className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Battery Monitoring</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Track battery levels and charging status of all electric vehicles
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Real-time Insights</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Get real-time updates on vehicle status, location, and performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Delete Vehicle</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to delete vehicle{' '}
                <span className="font-semibold text-gray-900">{vehicleToDelete?.vehicle_number}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
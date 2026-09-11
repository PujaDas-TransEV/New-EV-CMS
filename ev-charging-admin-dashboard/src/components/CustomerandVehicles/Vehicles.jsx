// src/components/CustomerandVehicles/Vehicles.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  LogOut,
  Users as UsersIcon,
  UserCog as UserCogIcon,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Mail,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search as SearchIcon,
  Zap,
  Car,
  Battery,
  Bell,
  ArrowUpDown,
  CircleCheck,
  CircleX,
  CircleAlert,
  Activity,
  Hash,
  Calendar as CalendarIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  VEHICLES_API: `${API_BASE_URL}/api/v1/cpo/vehicles`
};

// Tab Configuration with Icons
const tabs = [
  { id: 'drivers', label: 'Customers', icon: <UsersIcon size={16} />, path: '/customers' },
  { id: 'driver-alerts', label: 'Customer Alerts', icon: <Bell size={16} />, path: '/customer-alerts' },
  { id: 'driver-groups', label: 'Customer Groups', icon: <UserCogIcon size={16} />, path: '/customer-groups' },
  { id: 'vehicles', label: 'Vehicles', icon: <Car size={16} />, path: '/vehicles' },
];

// ============================================================================
// Helpers
// ============================================================================
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Vehicle body-type → badge colour
const getTypeBadgeStyle = (type) => {
  const t = String(type || '').toLowerCase();
  if (t.includes('sedan')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (t.includes('suv')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (t.includes('hatch')) return 'bg-purple-100 text-purple-700 border-purple-200';
  if (t.includes('coupe')) return 'bg-pink-100 text-pink-700 border-pink-200';
  if (t.includes('truck')) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (t.includes('van')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (t.includes('bike') || t.includes('scooter') || t.includes('motorcycle'))
    return 'bg-cyan-100 text-cyan-700 border-cyan-200';
  if (t.includes('electric')) return 'bg-green-100 text-green-700 border-green-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

// ============================================================================
// Vehicles Page
// ============================================================================
const Vehicles = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();

  // ---------------- State ----------------
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Vehicles data
  const [vehicles, setVehicles] = useState([]);

  // Client-side UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date_added', direction: 'desc' });

  // Pagination (keyset: before + before_id)
  const [nextBefore, setNextBefore] = useState(null);
  const [nextBeforeId, setNextBeforeId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState([]); // stack of { before, beforeId }

  const itemsPerPage = 50;
  const isMountedRef = useRef(true);

  // ---------------- User info ----------------
  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(`${API_BASE_URL}/api/v1/auth/me`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (isMountedRef.current) setUserData(data);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  // ---------------- Fetch vehicles ----------------
  const fetchVehicles = useCallback(async (cursorBefore = null, cursorBeforeId = null) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError('');
    try {
      let url = `${API_CONFIG.VEHICLES_API}?limit=${itemsPerPage}`;
      if (cursorBefore && cursorBeforeId) {
        url += `&before=${encodeURIComponent(cursorBefore)}&before_id=${encodeURIComponent(cursorBeforeId)}`;
      }

      const response = await authenticatedRequest(url, { method: 'GET' });

      if (!isMountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        // Per API: { vehicles: [...], has_more: bool, next_before?, next_before_id? }
        const list = Array.isArray(data.vehicles) ? data.vehicles : [];
        setVehicles(list);
        setNextBefore(data.next_before || null);
        setNextBeforeId(data.next_before_id || null);
        setHasMore(!!data.has_more);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || 'Failed to fetch vehicles');
        setVehicles([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      if (isMountedRef.current) {
        setError('An error occurred while fetching vehicles');
        setVehicles([]);
        setHasMore(false);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [authenticatedRequest, itemsPerPage]);

  // ---------------- Initial load ----------------
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    isMountedRef.current = true;
    fetchUserInfo();
    fetchVehicles();
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  // ---------------- Pagination controls ----------------
  const loadNextPage = () => {
    if (!hasMore || !nextBefore || !nextBeforeId) return;
    // Push current cursor to stack so we can go back
    setPageCursors(prev => [...prev, { before: nextBefore, beforeId: nextBeforeId }]);
    setCurrentPage(prev => prev + 1);
    fetchVehicles(nextBefore, nextBeforeId);
  };

  const loadPrevPage = () => {
    if (pageCursors.length === 0) return;
    const newStack = [...pageCursors];
    newStack.pop();
    setPageCursors(newStack);
    setCurrentPage(prev => Math.max(prev - 1, 1));
    // Re-fetch: first page has no cursor; subsequent pages use last cursor in stack
    const last = newStack[newStack.length - 1];
    if (last) fetchVehicles(last.before, last.beforeId);
    else fetchVehicles();
  };

  const resetToFirstPage = () => {
    setPageCursors([]);
    setCurrentPage(1);
    fetchVehicles();
  };

  // ---------------- Derived: type options from loaded data ----------------
  const typeOptions = useMemo(() => {
    const set = new Set();
    vehicles.forEach(v => {
      if (v.type && String(v.type).trim()) set.add(String(v.type).trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [vehicles]);

  // ---------------- Filter / search / sort ----------------
  const filteredVehicles = useMemo(() => {
    let list = vehicles;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v =>
        (v.vehicle_number || '').toLowerCase().includes(q) ||
        (v.make || '').toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q) ||
        (v.type || '').toLowerCase().includes(q) ||
        (v.customer_name || '').toLowerCase().includes(q) ||
        (v.customer_email || '').toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== 'All') {
      list = list.filter(v => (v.type || '').toLowerCase() === selectedType.toLowerCase());
    }

    // Sort
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        const av = a[sortConfig.key] ?? '';
        const bv = b[sortConfig.key] ?? '';
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [vehicles, searchQuery, selectedType, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // ---------------- Logout / theme ----------------
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/signin');
    }
  };
  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // ---------------- Settings menu ----------------
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

  // ---------------- Add menu ----------------
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-56 shadow-2xl border border-gray-200 z-50 overflow-hidden">
      <div className="p-2">
        <button
          onClick={() => { setShowAddMenu(false); navigate('/add-hub'); }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition"
        >
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-blue-600" />
          </div>
          <span>Add Hub</span>
        </button>
        <button
          onClick={() => { setShowAddMenu(false); navigate('/add-charger'); }}
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
                <span className="text-sm text-blue-500 font-medium mt-1">Vehicles</span>
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

          <div className="mt-3 border-b border-gray-200"></div>

          {/* Tabs */}
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
          {/* Filters and Search Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px] relative">
                <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by number, make, model, customer, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none bg-gray-50 hover:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 hover:bg-white transition cursor-pointer"
                >
                  {typeOptions.map(t => (
                    <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetToFirstPage}
                className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                title="Refresh"
              >
                <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <span className="text-sm text-gray-500 ml-auto">
                {filteredVehicles.length !== vehicles.length
                  ? `Showing ${filteredVehicles.length} of ${vehicles.length} (Page ${currentPage})`
                  : `Showing ${vehicles.length} vehicles (Page ${currentPage})`}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-2 text-red-700">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
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
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                      <tr>
                        {[
                          { key: 'vehicle_number', label: 'VEHICLE NUMBER' },
                          { key: 'type', label: 'TYPE' },
                          { key: 'make', label: 'MAKE' },
                          { key: 'model', label: 'MODEL' },
                          { key: 'customer_name', label: 'CUSTOMER' },
                          { key: 'customer_email', label: 'EMAIL' },
                          { key: 'date_added', label: 'DATE ADDED' },
                          { key: 'updated_at', label: 'LAST UPDATED' },
                        ].map(({ key, label }) => (
                          <th
                            key={key}
                            onClick={() => handleSort(key)}
                            className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition group whitespace-nowrap"
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVehicles.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Car size={44} className="text-gray-300" />
                              <p className="text-gray-500 font-medium">No vehicles found</p>
                              <p className="text-sm text-gray-400">
                                {vehicles.length === 0
                                  ? 'No vehicles have been added yet.'
                                  : 'Try adjusting your search or filter.'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredVehicles.map((vehicle) => (
                          <tr
                            key={vehicle.id}
                            className="hover:bg-blue-50/40 transition-colors"
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Car size={15} className="text-blue-600" />
                                </div>
                                <span className="font-mono text-sm font-semibold text-gray-900">
                                  {vehicle.vehicle_number || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getTypeBadgeStyle(vehicle.type)}`}>
                                {vehicle.type || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">
                              {vehicle.make || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-700">
                              {vehicle.model || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-700">
                              {vehicle.customer_name || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-[180px]" title={vehicle.customer_email}>
                                  {vehicle.customer_email || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon size={14} className="text-gray-400 flex-shrink-0" />
                                {formatDateOnly(vehicle.date_added || vehicle.created_at)}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                              {formatDateTime(vehicle.updated_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer / Pagination */}
                <div className="px-4 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {filteredVehicles.length !== vehicles.length
                      ? `Showing ${filteredVehicles.length} of ${vehicles.length} vehicles (Page ${currentPage})`
                      : `Showing ${vehicles.length} vehicles (Page ${currentPage})`}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadPrevPage}
                      disabled={currentPage <= 1 || pageCursors.length === 0}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Prev
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={loadNextPage}
                      disabled={!hasMore || !nextBefore || !nextBeforeId}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
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

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.55) rgba(243, 244, 246, 0.75);
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.85);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.55), rgba(79, 70, 229, 0.7));
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, rgba(79, 70, 229, 0.8), rgba(67, 56, 202, 0.9));
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }
      `}</style>
    </div>
  );
};

export default Vehicles;
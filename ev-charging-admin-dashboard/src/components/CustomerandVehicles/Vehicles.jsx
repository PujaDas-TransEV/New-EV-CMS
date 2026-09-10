// src/components/CustomerandVehicles/Vehicles.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  UsersIcon,
  UserCog as UserCogIcon,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Mail,
  Phone,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MoreVertical,
  Search as SearchIcon,
  Zap,
  Car,
  Battery,
  Calendar as CalendarIcon,
  MapPin,
  Bell,
  ArrowUpDown,
  CircleCheck,
  CircleX,
  CircleAlert,
  Activity
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
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Pagination state (cursor-based)
  const [nextBefore, setNextBefore] = useState(null);
  const [nextBeforeId, setNextBeforeId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // We'll store a stack of page cursors to allow going back
  const [pageCursors, setPageCursors] = useState([]);

  const itemsPerPage = 50;

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
      const response = await authenticatedRequest(`${API_BASE_URL}/api/v1/auth/me`, {
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

  // Fetch vehicles with cursor-based pagination
  const fetchVehicles = useCallback(async (direction = 'next', cursorBefore = null, cursorBeforeId = null) => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_CONFIG.VEHICLES_API}?limit=${itemsPerPage}`;

      if (direction === 'next' && cursorBefore && cursorBeforeId) {
        url += `&before=${encodeURIComponent(cursorBefore)}&before_id=${encodeURIComponent(cursorBeforeId)}`;
      }

      const response = await authenticatedRequest(url, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const vehicleList = data.vehicles || [];
        setVehicles(vehicleList);
        setNextBefore(data.next_before || null);
        setNextBeforeId(data.next_before_id || null);
        setHasMore(data.has_more || false);

        // Update pagination state
        if (direction === 'next') {
          // Store the current cursor for going back
          if (cursorBefore && cursorBeforeId) {
            setPageCursors(prev => [...prev, { before: cursorBefore, beforeId: cursorBeforeId }]);
          }
          setCurrentPage(prev => prev + 1);
        } else if (direction === 'prev') {
          // Remove the last cursor from stack
          setPageCursors(prev => {
            const newStack = [...prev];
            newStack.pop();
            return newStack;
          });
          setCurrentPage(prev => Math.max(prev - 1, 1));
        }

        // Calculate total pages (approximate based on hasMore)
        // We don't know the exact total, but we can estimate
        if (!data.has_more && vehicleList.length < itemsPerPage) {
          setTotalPages(currentPage);
        } else if (data.has_more) {
          setTotalPages(currentPage + 1);
        }
      } else {
        setError('Failed to fetch vehicles');
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('An error occurred while fetching vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest, itemsPerPage, currentPage]);

  // Load next page
  const loadNextPage = () => {
    if (hasMore && nextBefore && nextBeforeId) {
      fetchVehicles('next', nextBefore, nextBeforeId);
    }
  };

  // Load previous page
  const loadPrevPage = () => {
    if (pageCursors.length > 0) {
      const prevCursor = pageCursors[pageCursors.length - 1];
      fetchVehicles('prev', prevCursor.before, prevCursor.beforeId);
    }
  };

  // Reset to first page
  const resetToFirstPage = () => {
    setPageCursors([]);
    setCurrentPage(1);
    setTotalPages(1);
    fetchVehicles('next', null, null);
  };

  // Filter and Search Logic (client-side filtering on current page)
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.vehicle_number?.toLowerCase().includes(query) ||
        vehicle.make?.toLowerCase().includes(query) ||
        vehicle.model?.toLowerCase().includes(query) ||
        vehicle.type?.toLowerCase().includes(query) ||
        vehicle.customer_name?.toLowerCase().includes(query)
      );
    }

    if (selectedFilter !== 'All') {
      if (['Active', 'Inactive', 'Maintenance'].includes(selectedFilter)) {
        // Note: The API may not return a 'status' field. We'll use a fallback or derive from other data.
        // For now, we'll filter by type if it matches, otherwise show all.
        // Since the API doesn't have status, we'll just filter by type.
        if (['Electric', 'Hybrid', 'ICE'].includes(selectedFilter)) {
          filtered = filtered.filter(v =>
            v.type?.toLowerCase() === selectedFilter.toLowerCase()
          );
        }
        // For status filters, we'll just show all since the API doesn't provide status
        // You can add a status field if the API returns it
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

  // Handle Sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get Status Badge (fallback - API may not have status)
  const getStatusBadge = (vehicle) => {
    // If the API returns a status field, use it. Otherwise, derive from other data.
    const status = vehicle.status || 'active';
    const statusMap = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: <CircleCheck size={12} className="mr-1" /> },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <CircleX size={12} className="mr-1" /> },
      maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <CircleAlert size={12} className="mr-1" /> },
    };
    const s = status?.toLowerCase() || 'active';
    const style = statusMap[s] || statusMap.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${style.color}`}>
        {style.icon}
        {style.label}
      </span>
    );
  };

  // Battery Level Indicator (if battery_level is available)
  const getBatteryLevel = (percentage) => {
    if (percentage === undefined || percentage === null) {
      return <span className="text-xs text-gray-400">N/A</span>;
    }
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

  // Add Dropdown Menu - Add Hub & Add Charger
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
              {/* Settings Button */}
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

              {/* Plus Button - Add Hub & Add Charger */}
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
                onClick={resetToFirstPage}
                className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <span className="text-sm text-gray-500 ml-auto">
                Showing {vehicles.length} vehicles (Page {currentPage})
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
                        {[
                          { key: 'vehicle_number', label: 'VEHICLE NUMBER' },
                          { key: 'type', label: 'TYPE' },
                          { key: 'make', label: 'MAKE' },
                          { key: 'model', label: 'MODEL' },
                          { key: 'customer_name', label: 'CUSTOMER' },
                          { key: 'customer_email', label: 'EMAIL' },
                          { key: 'last_charged', label: 'LAST CHARGED' },
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVehicles.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Car size={40} className="text-gray-300" />
                              <p className="text-gray-500 font-medium">No vehicles found</p>
                              <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredVehicles.map((vehicle) => (
                          <tr
                            key={vehicle.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
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
                            <td className="px-4 py-3.5 text-sm text-gray-700">
                              {vehicle.customer_name || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail size={14} className="text-gray-400" />
                                {vehicle.customer_email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {vehicle.last_charged
                                ? new Date(vehicle.last_charged).toLocaleString()
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {vehicle.date_added
                                ? new Date(vehicle.date_added).toLocaleDateString()
                                : vehicle.created_at
                                  ? new Date(vehicle.created_at).toLocaleDateString()
                                  : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Pagination */}
                <div className="px-4 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Showing {vehicles.length} vehicles (Page {currentPage})
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadPrevPage}
                      disabled={currentPage <= 1 || pageCursors.length === 0}
                      className="px-3.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={loadNextPage}
                      disabled={!hasMore}
                      className="px-3.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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
    </div>
  );
};

export default Vehicles;
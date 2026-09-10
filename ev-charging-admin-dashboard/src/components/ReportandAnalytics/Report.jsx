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
  Zap,
  Loader2,
  Filter,
  RefreshCw,
  ArrowLeft,
  Circle,
  CircleCheck,
  CircleX,
  CircleAlert,
  Activity,
  Info,
  FileText,
  IndianRupee,
  MapPin,
  Car,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  Calendar as CalendarIcon4,
  ChevronUp,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// ============================================================================
// API Configuration
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

// ============================================================================
// Helpers
// ============================================================================
// Compares a raw datetime string with a 'YYYY-MM-DD' string by local calendar day.
// This is timezone-safe: '2026-09-10T15:23:16+05:30' will match '2026-09-10'.
const isSameLocalDay = (rawDate, yyyymmdd) => {
  if (!rawDate || !yyyymmdd) return false;
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return false;
  const [y, m, day] = yyyymmdd.split('-').map(Number);
  return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === day;
};

// Returns the item's best "creation" date for filtering purposes.
const getItemCreatedDate = (item) => {
  if (!item) return null;
  return (
    item.created_at ||
    item.createdAt ||
    item.date_added ||
    item.timestamp ||
    item.transaction_date ||
    item.date ||
    null
  );
};

// ============================================================================
// Report Analytics Page Component
// ============================================================================
const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Report State
  const [selectedReportType, setSelectedReportType] = useState('chargers');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // Stats for selected report
  const [selectedStats, setSelectedStats] = useState({
    total: 0, active: 0, inactive: 0, utilization: 0, growth: 0, change: 0,
    totalRevenue: 0, chargingRevenue: 0, subscriptionRevenue: 0,
    totalTransactions: 0, completedTransactions: 0, failedTransactions: 0
  });

  // Report Types — Revenue uses IndianRupee icon
  const reportTypes = [
    { id: 'chargers', label: 'Chargers', icon: Zap,          color: 'blue',   bgColor: 'bg-blue-50',   textColor: 'text-blue-600',   borderColor: 'border-blue-500' },
    { id: 'vehicles', label: 'Vehicles', icon: Car,          color: 'green',  bgColor: 'bg-green-50',  textColor: 'text-green-600',  borderColor: 'border-green-500' },
    { id: 'drivers',  label: 'Drivers',  icon: Users,        color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-500' },
    { id: 'revenue',  label: 'Revenue',  icon: IndianRupee,  color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', borderColor: 'border-yellow-500' }
  ];

  // ============================================================================
  // Filter helper — used by both filterByDate and the search filter
  // ============================================================================
  const filterByDateStr = (items, dateStr) => {
    if (!dateStr) return items;
    return items.filter(item => isSameLocalDay(getItemCreatedDate(item), dateStr));
  };

  // ============================================================================
  // Process Detail Data
  // ============================================================================
  const processDetailData = (type, data, effectiveDate) => {
    let items = [];
    let stats = {
      total: 0, active: 0, inactive: 0, utilization: 0, growth: 0, change: 0,
      totalRevenue: 0, chargingRevenue: 0, subscriptionRevenue: 0,
      totalTransactions: 0, completedTransactions: 0, failedTransactions: 0
    };

    switch(type) {
      case 'chargers':
        items = data.chargers || data.data || data || [];
        items = items.map(item => ({
          ...item,
          hub_name: item.hub_name || item.hub?.name || 'N/A',
          charger_name: item.charger_name || item.name || 'Unnamed'
        }));
        stats = {
          total: items.length,
          active: items.filter(c => c.status === 'active' || c.is_active || c.status === 'ACTIVE').length,
          inactive: items.filter(c => c.status !== 'active' && !c.is_active && c.status !== 'ACTIVE').length,
          utilization: items.length > 0 ? Math.round((items.filter(c => c.status === 'active' || c.is_active || c.status === 'ACTIVE').length / items.length) * 100) : 0,
          growth: 12.5, change: 8.2,
          totalRevenue: 0, chargingRevenue: 0, subscriptionRevenue: 0,
          totalTransactions: 0, completedTransactions: 0, failedTransactions: 0
        };
        break;

      case 'vehicles':
        // API shape: { vehicles: [ { id, customer_id, customer_name, customer_email,
        //   vehicle_number, type, make, model, date_added, created_at, updated_at } ], has_more }
        items = data.vehicles || data.data || data || [];
        items = items.map(v => ({
          ...v,
          vehicle_number: v.vehicle_number || 'N/A',
          type: v.type || 'N/A',
          make: v.make || 'N/A',
          model: v.model || 'N/A',
          customer_name: v.customer_name || 'N/A',
          customer_email: v.customer_email || 'N/A',
          date_added: v.date_added || v.created_at || null
        }));
        stats = {
          total: items.length,
          active: items.length,
          inactive: 0,
          utilization: items.length > 0 ? 100 : 0,
          growth: 15.3, change: 6.7,
          totalRevenue: 0, chargingRevenue: 0, subscriptionRevenue: 0,
          totalTransactions: 0, completedTransactions: 0, failedTransactions: 0
        };
        break;

      case 'drivers':
        items = data.customers || data.data || data || [];
        stats = {
          total: items.length,
          active: items.filter(c => c.status === 'active' || c.is_active).length,
          inactive: items.filter(c => c.status !== 'active' && !c.is_active).length,
          utilization: items.length > 0 ? Math.round((items.filter(c => c.status === 'active' || c.is_active).length / items.length) * 100) : 0,
          growth: 18.2, change: 9.8,
          totalRevenue: 0, chargingRevenue: 0, subscriptionRevenue: 0,
          totalTransactions: 0, completedTransactions: 0, failedTransactions: 0
        };
        break;

      case 'revenue':
        let transactions = data.transactions || data.data || data || [];
        transactions = transactions.map(tx => ({
          ...tx,
          charger_name: tx.charger_name || tx.charger?.name || 'N/A',
          hub_name: tx.hub || tx.charger?.hub_name || 'N/A',
          customer_name: tx.customer_details?.name || tx.customer_name || 'N/A',
          charger_id: tx.charger_id || tx.charger?.charger_id || 'N/A',
          // Normalize created-at-like field for the client-side date filter
          created_at: tx.created_at || tx.timestamp || tx.transaction_date || tx.date || null
        }));
        items = transactions;

        // Stats computed over ALL items (the API already scoped by date range)
        let totalRevenue = 0, completedRevenue = 0, completedCount = 0, failedCount = 0;
        transactions.forEach(transaction => {
          const amount = parseFloat(transaction.billed_amount) || 0;
          totalRevenue += amount;
          if (transaction.payment_status === 'COMPLETED' || transaction.session_status === 'COMPLETED') {
            completedRevenue += amount;
            completedCount++;
          } else {
            failedCount++;
          }
        });
        stats = {
          total: transactions.length,
          active: completedCount,
          inactive: failedCount,
          utilization: transactions.length > 0 ? Math.round((completedCount / transactions.length) * 100) : 0,
          growth: 22.8, change: 14.2,
          totalRevenue: totalRevenue,
          chargingRevenue: completedRevenue,
          subscriptionRevenue: 0,
          totalTransactions: transactions.length,
          completedTransactions: completedCount,
          failedTransactions: failedCount
        };
        break;

      default:
        break;
    }

    // Store raw items and set the filtered view using the *effective* date
    setDetailData(items);

    // For revenue we already scoped via API, so no extra filtering needed.
    // For everything else we filter locally by creation date.
    if (type === 'revenue') {
      setFilteredData(items);
      recalculateRevenue(items);
    } else {
      const filtered = filterByDateStr(items, effectiveDate);
      setFilteredData(filtered);
      // Recompute stats for the filtered subset (non-revenue)
      setSelectedStats({
        ...stats,
        total: filtered.length,
        active: type === 'vehicles' ? filtered.length : filtered.filter(c => c.status === 'active' || c.is_active || c.status === 'ACTIVE').length,
        inactive: type === 'vehicles' ? 0 : filtered.filter(c => c.status !== 'active' && !c.is_active && c.status !== 'ACTIVE').length
      });
      return;
    }

    setSelectedStats(stats);
  };

  // ============================================================================
  // Fetch Data from API
  // ============================================================================
  const fetchData = useCallback(async (type, overrideDate) => {
    setLoading(true);
    setError('');

    // The caller can pass an explicit date (e.g. from handleDateSelect) so we
    // don't depend on the stale `selectedDateStr` closure.
    const effectiveDate = overrideDate !== undefined ? overrideDate : selectedDateStr;

    try {
      const reportType = reportTypes.find(r => r.id === type);
      if (!reportType) return;

      let apiUrl = '';

      switch(type) {
        case 'chargers':
          apiUrl = `${API_BASE_URL}/api/v1/cpo/chargers?limit=100`;
          break;
        case 'vehicles':
          apiUrl = `${API_BASE_URL}/api/v1/cpo/vehicles?limit=100`;
          break;
        case 'drivers':
          apiUrl = `${API_BASE_URL}/api/v1/cpo/customers?limit=100`;
          break;
        case 'revenue': {
          const startDate = effectiveDate || new Date().toISOString().split('T')[0];
          const endDate = effectiveDate || new Date().toISOString().split('T')[0];
          apiUrl = `${API_BASE_URL}/api/v1/cpo/charger-transactions?limit=100&start_date=${startDate}&end_date=${endDate}`;
          break;
        }
        default:
          return;
      }

      console.log(`📊 Fetching ${type} from:`, apiUrl);

      const response = await authenticatedRequest(apiUrl, { method: 'GET' });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 ${type} data:`, data);
        processDetailData(type, data, effectiveDate);
        if (effectiveDate) {
          setSuccess(`Filtered data for ${new Date(effectiveDate).toLocaleDateString()}`);
        } else {
          setSuccess(`${type} data loaded successfully!`);
        }
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Failed to fetch ${type} data`);
        setTimeout(() => setError(''), 5000);
        setDetailData([]);
        setFilteredData([]);
        setSelectedStats({
          total: 0, active: 0, inactive: 0, utilization: 0, growth: 0, change: 0,
          totalRevenue: 0, chargingRevenue: 0, subscriptionRevenue: 0,
          totalTransactions: 0, completedTransactions: 0, failedTransactions: 0
        });
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(error.message || `Failed to fetch ${type} data`);
      setTimeout(() => setError(''), 5000);
      setDetailData([]);
      setFilteredData([]);
      setSelectedStats({
        total: 0, active: 0, inactive: 0, utilization: 0, growth: 0, change: 0,
        totalRevenue: 0, chargingRevenue: 0, subscriptionRevenue: 0,
        totalTransactions: 0, completedTransactions: 0, failedTransactions: 0
      });
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest, selectedDateStr]);

  // ============================================================================
  // Recalculate Revenue for Filtered Data
  // ============================================================================
  const recalculateRevenue = (items) => {
    let totalRevenue = 0, completedRevenue = 0, completedCount = 0, failedCount = 0;
    items.forEach(transaction => {
      const amount = parseFloat(transaction.billed_amount) || 0;
      totalRevenue += amount;
      if (transaction.payment_status === 'COMPLETED' || transaction.session_status === 'COMPLETED') {
        completedRevenue += amount;
        completedCount++;
      } else {
        failedCount++;
      }
    });
    setSelectedStats(prev => ({
      ...prev,
      totalRevenue: totalRevenue,
      chargingRevenue: completedRevenue,
      totalTransactions: items.length,
      completedTransactions: completedCount,
      failedTransactions: failedCount,
      active: completedCount,
      inactive: failedCount,
      utilization: items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0
    }));
  };

  // ============================================================================
  // Handle Date Selection — now refetches with the new date passed in explicitly
  // ============================================================================
  const handleDateSelect = (e) => {
    const dateValue = e.target.value;
    setSelectedDateStr(dateValue);

    if (dateValue) {
      const date = new Date(dateValue);
      setSelectedDate(date);
      setShowDatePicker(false);
      // Pass the date explicitly so fetchData uses the NEW value (not stale state)
      fetchData(selectedReportType, dateValue);
    } else {
      // Cleared — refetch fresh (no date)
      fetchData(selectedReportType, '');
    }
  };

  const handleClearDate = () => {
    setSelectedDateStr('');
    setShowDatePicker(false);
    fetchData(selectedReportType, '');
  };

  // ============================================================================
  // Search Data
  // ============================================================================
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Search operates on top of the date-filtered set
    const base = selectedDateStr ? filterByDateStr(detailData, selectedDateStr) : detailData;

    if (!term) {
      setFilteredData(base);
      if (selectedReportType === 'revenue') recalculateRevenue(base);
      return;
    }

    const filtered = base.filter(item => {
      const searchableFields = [
        'transaction_id', 'session_id', 'charger_name', 'charger_id',
        'customer_details', 'hub', 'payment_status', 'session_status',
        'billed_amount', 'ocpp_transaction_id', 'hub_name',
        'name', 'email', 'phone',
        'vehicle_number', 'type', 'make', 'model', 'customer_name', 'customer_email'
      ];
      return searchableFields.some(field => {
        const value = typeof item[field] === 'object' ? JSON.stringify(item[field]) : item[field];
        return value && value.toString().toLowerCase().includes(term);
      });
    });

    setFilteredData(filtered);
    if (selectedReportType === 'revenue') recalculateRevenue(filtered);
  };

  // ============================================================================
  // Download/Generate Report
  // ============================================================================
  const generateAndDownloadReport = async () => {
    setIsDownloading(true);
    setSuccess('');
    setError('');

    try {
      const reportType = reportTypes.find(r => r.id === selectedReportType);
      const reportLabel = reportType?.label || selectedReportType;
      const dateStr = selectedDateStr || new Date().toISOString().split('T')[0];

      const dataToDownload = filteredData.length > 0 ? filteredData : detailData;

      if (!dataToDownload || dataToDownload.length === 0) {
        setError('No data available for the selected date');
        setTimeout(() => setError(''), 5000);
        setIsDownloading(false);
        return;
      }

      const headers = Object.keys(dataToDownload[0] || {});
      let csvRows = [headers.join(',')];

      dataToDownload.forEach(item => {
        const row = headers.map(key => {
          const value = typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportLabel}_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`${reportLabel} report for ${dateStr} downloaded successfully!`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to generate report.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================================
  // Initialization
  // ============================================================================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchData(selectedReportType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Refetch when the report type changes, keeping the current date filter
    fetchData(selectedReportType, selectedDateStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportType]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(`${API_BASE_URL}/api/v1/auth/me`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleReportSelect = (type) => {
    setSelectedReportType(type);
    setIsDropdownOpen(false);
    setSearchTerm('');
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

  // Full amount formatter with rupee sign, Indian grouping
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '₹0.00';
    const amount = Number(num);
    if (!isFinite(amount)) return '₹0.00';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return 'N/A'; }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': 'bg-green-100 text-green-700',
      'inactive': 'bg-red-100 text-red-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'failed': 'bg-red-100 text-red-700',
      'cancelled': 'bg-gray-100 text-gray-700',
      'success': 'bg-green-100 text-green-700',
      'available': 'bg-green-100 text-green-700',
      'occupied': 'bg-yellow-100 text-yellow-700',
      'maintenance': 'bg-red-100 text-red-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'SETTLED': 'bg-blue-100 text-blue-700',
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'ACTIVE': 'bg-green-100 text-green-700',
      'INACTIVE': 'bg-red-100 text-red-700'
    };
    return statusMap[status?.toUpperCase()] || statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  // ============================================================================
  // Menus
  // ============================================================================
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

  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-64 shadow-2xl border border-gray-100 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate('/add-hub'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate('/add-charger'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
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
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-800">Reports & Analytics</h1>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report
              </span>
              {selectedDateStr && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                  📅 {new Date(selectedDateStr).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Settings size={20} className="text-gray-600" />
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
        <div className="p-6 max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-2 text-red-700">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-center gap-2 text-emerald-700">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Report Type Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Select Report Type</span>
              <div className="flex flex-wrap gap-2">
                {reportTypes.map((type) => {
                  const isSelected = selectedReportType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleReportSelect(type.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                        isSelected
                          ? `${type.bgColor} ${type.textColor} border-2 ${type.borderColor} shadow-sm`
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <type.icon size={16} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
              <div className="ml-auto flex items-center gap-2">
                {/* Calendar Date Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                      selectedDateStr ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CalendarIcon4 size={16} />
                    {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString() : 'Select Date'}
                    <ChevronDown size={14} className={showDatePicker ? 'rotate-180' : ''} />
                  </button>

                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 w-72">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Select Date</h4>
                        <button
                          onClick={handleClearDate}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Clear
                        </button>
                      </div>
                      <input
                        type="date"
                        value={selectedDateStr}
                        onChange={handleDateSelect}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="mt-2 text-xs text-gray-400">
                        {selectedDateStr
                          ? `Showing records created on ${new Date(selectedDateStr).toLocaleDateString()}`
                          : 'Select a date to filter by creation date'}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={generateAndDownloadReport}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Generate Report
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition flex items-center gap-1.5"
                >
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={12} className={showFilters ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const value = e.target.value;
                        const base = selectedDateStr ? filterByDateStr(detailData, selectedDateStr) : detailData;
                        if (value === 'all') {
                          setFilteredData(base);
                          if (selectedReportType === 'revenue') recalculateRevenue(base);
                        } else {
                          const filtered = base.filter(item => {
                            const status = (item.payment_status || item.session_status || item.status || '').toUpperCase();
                            return status === value.toUpperCase();
                          });
                          setFilteredData(filtered);
                          if (selectedReportType === 'revenue') recalculateRevenue(filtered);
                        }
                      }}
                    >
                      <option value="all">All</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="SETTLED">Settled</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const value = e.target.value;
                        const sorted = [...filteredData];
                        if (value === 'newest') {
                          sorted.sort((a, b) => new Date(getItemCreatedDate(b) || 0) - new Date(getItemCreatedDate(a) || 0));
                        } else if (value === 'oldest') {
                          sorted.sort((a, b) => new Date(getItemCreatedDate(a) || 0) - new Date(getItemCreatedDate(b) || 0));
                        } else if (value === 'highest') {
                          sorted.sort((a, b) => (parseFloat(b.billed_amount) || 0) - (parseFloat(a.billed_amount) || 0));
                        } else if (value === 'lowest') {
                          sorted.sort((a, b) => (parseFloat(a.billed_amount) || 0) - (parseFloat(b.billed_amount) || 0));
                        }
                        setFilteredData(sorted);
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Amount</option>
                      <option value="lowest">Lowest Amount</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {reportTypes.filter(type => type.id === selectedReportType).map((type) => {
              const data = selectedStats;
              return (
                <div key={type.id} className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${type.borderColor} border-2`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${type.bgColor} ${type.textColor}`}>
                      <type.icon size={20} />
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      data.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {data.growth > 0 ? '↑' : '↓'} {Math.abs(data.growth || 0)}%
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{type.label}</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {type.id === 'revenue' ? formatNumber(data.totalRevenue || 0) : (data.total || 0)}
                  </p>

                  {type.id === 'revenue' && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Total Revenue:</span>
                        <span className="font-medium text-blue-600">{formatNumber(data.totalRevenue || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Completed:</span>
                        <span className="font-medium text-green-600">{data.completedTransactions || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Failed:</span>
                        <span className="font-medium text-red-600">{data.failedTransactions || 0}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Change:</span>
                    <span className={data.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {data.change > 0 ? '+' : ''}{data.change || 0}%
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500">Active: {data.active || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} List
                {selectedDateStr && (
                  <span className="text-xs text-gray-400 ml-2">
                    (Created on: {new Date(selectedDateStr).toLocaleDateString()})
                  </span>
                )}
              </h3>
              <span className="text-xs text-gray-400">{filteredData.length} records</span>
            </div>
            <div className="p-4 overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No data available</p>
                  <p className="text-sm text-gray-400">
                    {selectedDateStr
                      ? `No records found created on ${new Date(selectedDateStr).toLocaleDateString()}`
                      : 'Try selecting a date or adjusting your filters'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      {selectedReportType === 'chargers' && (
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">SI</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Charger Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Charger ID</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Hub Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Serial Number</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Max Power</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">OCPP Version</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Created At</th>
                        </tr>
                      )}
                      {selectedReportType === 'vehicles' && (
                        <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">SI</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Vehicle Number</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Make</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Model</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Email</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Date Added</th>
                        </tr>
                      )}
                      {selectedReportType === 'drivers' && (
                        <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">SI</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Email</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Phone</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Created At</th>
                        </tr>
                      )}
                      {selectedReportType === 'revenue' && (
                        <tr className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">SI</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Transaction ID</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Charger ID</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Charger Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Hub Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Payment Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Session Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Timestamp</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => {
                        if (selectedReportType === 'chargers') {
                          return (
                            <tr key={item.id || index} className="border-b border-gray-100 hover:bg-blue-50/30 transition duration-150">
                              <td className="py-3 px-4 text-gray-500 text-xs">{index + 1}</td>
                              <td className="py-3 px-4 font-medium text-gray-800">{item.charger_name}</td>
                              <td className="py-3 px-4 font-mono text-xs text-gray-500">{item.charger_id || '-'}</td>
                              <td className="py-3 px-4 text-gray-600">
                                <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full text-xs">
                                  <MapPinIcon size={12} className="text-blue-500" />
                                  {item.hub_name}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600 font-mono text-xs">{item.serial_number || '-'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                                  {item.status || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{item.max_power_kw || 0} kW</td>
                              <td className="py-3 px-4 text-gray-600">{item.ocpp_version || '-'}</td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(item.created_at)}</td>
                            </tr>
                          );
                        }
                        if (selectedReportType === 'vehicles') {
                          return (
                            <tr key={item.id || index} className="border-b border-gray-100 hover:bg-green-50/30 transition duration-150">
                              <td className="py-3 px-4 text-gray-500 text-xs">{index + 1}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Car size={14} className="text-green-600" />
                                  </div>
                                  <span className="font-mono text-sm font-semibold">
                                    {item.vehicle_number || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                                  {item.type || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-700 font-medium">{item.make || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-700">{item.model || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-700">{item.customer_name || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <MailIcon size={13} className="text-gray-400 flex-shrink-0" />
                                  <span className="truncate max-w-[200px]" title={item.customer_email}>
                                    {item.customer_email || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                                {formatDate(item.date_added || item.created_at)}
                              </td>
                            </tr>
                          );
                        }
                        if (selectedReportType === 'drivers') {
                          return (
                            <tr key={item.id || index} className="border-b border-gray-100 hover:bg-purple-50/30 transition duration-150">
                              <td className="py-3 px-4 text-gray-500 text-xs">{index + 1}</td>
                              <td className="py-3 px-4 font-medium text-gray-800">{item.name || item.full_name || 'Unnamed'}</td>
                              <td className="py-3 px-4 text-gray-600">{item.email || '-'}</td>
                              <td className="py-3 px-4 text-gray-600">{item.phone || '-'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                                  {item.status || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{item.user_type || 'Customer'}</td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(item.created_at)}</td>
                            </tr>
                          );
                        }
                        if (selectedReportType === 'revenue') {
                          return (
                            <tr key={item.id || item.transaction_id || index} className="border-b border-gray-100 hover:bg-yellow-50/30 transition duration-150">
                              <td className="py-3 px-4 text-gray-500 text-xs">{index + 1}</td>
                              <td className="py-3 px-4 font-mono text-xs text-gray-600 truncate max-w-xs">{item.transaction_id || '-'}</td>
                              <td className="py-3 px-4 font-mono text-xs text-gray-500">{item.charger_id || '-'}</td>
                              <td className="py-3 px-4 font-medium text-gray-800">{item.charger_name}</td>
                              <td className="py-3 px-4 text-gray-600">
                                <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full text-xs">
                                  <MapPinIcon size={12} className="text-blue-500" />
                                  {item.hub_name}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{item.customer_name}</td>
                              <td className="py-3 px-4 font-semibold text-gray-800">{formatNumber(parseFloat(item.billed_amount) || 0)}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.payment_status)}`}>
                                  {item.payment_status || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.session_status)}`}>
                                  {item.session_status || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(item.timestamp || item.created_at)}</td>
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">About Reports</p>
                <p className="text-sm text-blue-700 mt-1">
                  Showing {filteredData.length} records for {selectedReportType}.
                  {selectedDateStr
                    ? ` Filtered by creation date: ${new Date(selectedDateStr).toLocaleDateString()}.`
                    : ' Use the calendar to filter by creation date.'}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-blue-600">
                  {selectedReportType === 'revenue' ? (
                    <>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-yellow-600" /> Total Revenue: {formatNumber(selectedStats.totalRevenue || 0)}</span>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-green-600" /> Completed: {selectedStats.completedTransactions || 0}</span>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-red-600" /> Failed: {selectedStats.failedTransactions || 0}</span>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-blue-600" /> Total Transactions: {selectedStats.totalTransactions || 0}</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-blue-600" /> Total: {selectedStats.total || 0}</span>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-green-600" /> Active: {selectedStats.active || 0}</span>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-red-600" /> Inactive: {selectedStats.inactive || 0}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
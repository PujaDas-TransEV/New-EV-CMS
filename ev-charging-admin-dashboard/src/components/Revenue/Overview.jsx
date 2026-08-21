// src/pages/RevenueManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Link,
  Wallet,
  Receipt,
  Coins,
  Ticket,
  GripVertical,
  ChevronRight as ChevronRightIcon,
  Minus,
  Plus as PlusIcon,
  FileDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon2
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  TRANSACTIONS_API: `${API_BASE_URL}/api/v1/cpo/charger-transactions`,
  WALLET_TRANSACTIONS_API: `${API_BASE_URL}/api/v1/cpo/wallet-transactions`,
  ANALYTICS_API: `${API_BASE_URL}/api/v1/cpo/analytics`,
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
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
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        
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

const RevenueManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Revenue state
  const [transactions, setTransactions] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [transactionTab, setTransactionTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hubFilter, setHubFilter] = useState('All Hubs');
  const [hubs, setHubs] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const [error, setError] = useState('');
  
  // Date filter state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalSessions: 0,
    totalUsage: 0,
    onlinePercentage: 0
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    next_before: null,
    next_before_id: null,
    has_more: false,
    limit: 50
  });
  const [walletPagination, setWalletPagination] = useState({
    next_before: null,
    next_before_id: null,
    has_more: false,
    limit: 50
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMoreWallet, setLoadingMoreWallet] = useState(false);

  // Sidebar tabs
  const sidebarTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/revenue/overview' },
    { id: 'driver-tariffs', label: 'Customer Tariffs', icon: Users, path: '/revenue/customer-tariffs' },
    { id: 'charger-tariffs', label: 'Charger Tariffs', icon: Zap, path: '/revenue/charger-tariffs' },
    { id: 'aggregation-fee', label: 'Hub Tariffs', icon: Layers, path: '/revenue/hub-tariffs' },
    { id: 'tax', label: 'Tax', icon: Percent, path: '/revenue/tax' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/revenue/settings' }
  ];

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchAnalytics();
    fetchTransactions();
    fetchWalletTransactions();
    fetchHubs();
  }, []);

  // Re-fetch when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
      fetchTransactions();
      fetchWalletTransactions();
    }
  }, [startDate, endDate]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
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

  // Fetch hubs for filter
  const fetchHubs = useCallback(async () => {
    setLoadingHubs(true);
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.HUBS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const hubsData = data.hubs || data.data || data || [];
        setHubs(hubsData);
        console.log('Hubs fetched:', hubsData);
      } else {
        setHubs([]);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
      setHubs([]);
    } finally {
      setLoadingHubs(false);
    }
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      let url = API_CONFIG.ANALYTICS_API;
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await fetchWithTokenRefresh(url, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Analytics fetched:', data);
        const analytics = data.data || data || {};
        setAnalyticsData({
          totalRevenue: analytics.total_revenue || analytics.revenue || 0,
          totalSessions: analytics.total_sessions || analytics.sessions || 0,
          totalUsage: analytics.total_usage || analytics.usage || 0,
          onlinePercentage: analytics.online_percentage || analytics.percentage || 0
        });
      } else {
        console.log('Failed to fetch analytics:', response.status);
        setAnalyticsData({
          totalRevenue: 0,
          totalSessions: 0,
          totalUsage: 0,
          onlinePercentage: 0
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [startDate, endDate]);

  const fetchTransactions = useCallback(async (before = null, before_id = null) => {
    setLoadingTransactions(true);
    setError('');
    
    try {
      let url = `${API_CONFIG.TRANSACTIONS_API}?limit=${pagination.limit}`;
      
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      if (endDate) {
        url += `&end_date=${endDate}`;
      }
      
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      const response = await fetchWithTokenRefresh(url, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Transactions fetched:', data);
        
        const transactionsData = data.transactions || data.data || data || [];
        
        setTransactions(prev => before ? [...prev, ...transactionsData] : transactionsData);
        setPagination({
          next_before: data.next_before || null,
          next_before_id: data.next_before_id || null,
          has_more: data.has_more || false,
          limit: pagination.limit
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'An error occurred while fetching transactions');
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
      setLoadingMore(false);
    }
  }, [startDate, endDate, pagination.limit]);

  const fetchWalletTransactions = useCallback(async (before = null, before_id = null) => {
    setLoadingWallet(true);
    
    try {
      let url = `${API_CONFIG.WALLET_TRANSACTIONS_API}?limit=${walletPagination.limit}`;
      
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      if (endDate) {
        url += `&end_date=${endDate}`;
      }
      
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      const response = await fetchWithTokenRefresh(url, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Wallet transactions fetched:', data);
        const walletData = data.transactions || data.data || data || [];
        
        setWalletTransactions(prev => before ? [...prev, ...walletData] : walletData);
        setWalletPagination({
          next_before: data.next_before || null,
          next_before_id: data.next_before_id || null,
          has_more: data.has_more || false,
          limit: walletPagination.limit
        });
      } else {
        console.log('Failed to fetch wallet transactions:', response.status);
        setWalletTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setWalletTransactions([]);
    } finally {
      setLoadingWallet(false);
      setLoadingMoreWallet(false);
    }
  }, [startDate, endDate, walletPagination.limit]);

  const loadMoreTransactions = () => {
    if (pagination.has_more && !loadingMore) {
      setLoadingMore(true);
      fetchTransactions(pagination.next_before, pagination.next_before_id);
    }
  };

  const loadMoreWalletTransactions = () => {
    if (walletPagination.has_more && !loadingMoreWallet) {
      setLoadingMoreWallet(true);
      fetchWalletTransactions(walletPagination.next_before, walletPagination.next_before_id);
    }
  };

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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ 0.00';
    return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUCCESS': 'bg-green-100 text-green-800 border-green-200',
      'success': 'bg-green-100 text-green-800 border-green-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
      'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'CREDIT': 'bg-green-100 text-green-800 border-green-200',
      'DEBIT': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'SUCCESS':
      case 'CREDIT':
        return <CheckCircle className="w-3 h-3" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="w-3 h-3" />;
      case 'FAILED':
      case 'DEBIT':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  // Get unique hub names from transactions
  const getUniqueHubsFromTransactions = () => {
    const hubNames = transactions
      .map(t => t.hub)
      .filter(hub => hub && hub !== '');
    return [...new Set(hubNames)];
  };

  // Get hub names from hubs API
  const getHubNamesFromAPI = () => {
    return hubs.map(h => h.name).filter(name => name);
  };

  // Combine both sources for filter
  const allHubOptions = ['All Hubs', ...new Set([...getUniqueHubsFromTransactions(), ...getHubNamesFromAPI()])];

  // Filter transactions by hub
  const filteredTransactions = transactions.filter(t => {
    const transactionId = t.transaction_id || t.id || '';
    const chargerId = t.charger_id || '';
    const customerName = t.customer_details?.name || '';
    const hub = t.hub || '';
    
    const matchesSearch = transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chargerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.payment_status?.toUpperCase() === statusFilter.toUpperCase();
    const matchesHub = hubFilter === 'All Hubs' || hub === hubFilter;
    return matchesSearch && matchesStatus && matchesHub;
  });

  // Filter wallet transactions - no hub filter needed
  const filteredWallet = walletTransactions.filter(t => {
    const transactionId = t.id || t.transaction_id || '';
    const customerName = t.customer_name || '';
    const matchesSearch = transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          <Plus size={18} className="text-gray-500" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Plus size={18} className="text-gray-500" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Charger Transaction Table Component - Full Table with all API fields
  const ChargerTransactionTable = ({ data }) => {
    return (
      <div className="overflow-x-auto">
        {loadingTransactions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <table className="w-full min-w-[1400px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">SI</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TRANSACTION ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAYMENT STATUS</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">BILLED AMOUNT</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">CHARGER ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">DURATION</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">HUB</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TARIFF</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">USAGE (kWh)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">OWNER</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">HOST DETAILS</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">CUSTOMER DETAILS</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TIMESTAMP</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">REASON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="14" className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Receipt className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">No Data Found</p>
                      <p className="text-sm text-gray-400 mt-1">No charger transactions available for the selected filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((transaction, index) => {
                  const transactionId = transaction.transaction_id || transaction.id || `TX-${index}`;
                  
                  return (
                    <tr key={transactionId} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-3 text-sm text-gray-500">
                        <span>{index + 1}</span>
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900 max-w-[120px] truncate">
                        {transactionId}
                      </td>
                      {/* <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(transaction.payment_status)}`}>
                          {getStatusIcon(transaction.payment_status)}
                          {transaction.payment_status || 'N/A'}
                        </span>
                      </td> */}
                      <td className="px-3 py-3">
  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${
    transaction.payment_status?.toUpperCase() === 'COMPLETED' || 
    transaction.payment_status?.toUpperCase() === 'SUCCESS' || 
    transaction.payment_status?.toUpperCase() === 'PAID'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : transaction.payment_status?.toUpperCase() === 'PENDING'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : transaction.payment_status?.toUpperCase() === 'FAILED'
      ? 'bg-red-100 text-red-700 border-red-200'
      : transaction.payment_status?.toUpperCase() === 'REFUNDED'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-gray-100 text-gray-700 border-gray-200'
  }`}>
    {transaction.payment_status?.toUpperCase() === 'COMPLETED' || 
     transaction.payment_status?.toUpperCase() === 'SUCCESS' || 
     transaction.payment_status?.toUpperCase() === 'PAID' ? (
      <CheckCircle className="w-3 h-3" />
    ) : transaction.payment_status?.toUpperCase() === 'PENDING' ? (
      <Clock className="w-3 h-3" />
    ) : transaction.payment_status?.toUpperCase() === 'FAILED' ? (
      <AlertCircle className="w-3 h-3" />
    ) : transaction.payment_status?.toUpperCase() === 'REFUNDED' ? (
      <RefreshCw className="w-3 h-3" />
    ) : (
      <Circle className="w-3 h-3" />
    )}
    {transaction.payment_status?.toUpperCase() === 'COMPLETED' || 
     transaction.payment_status?.toUpperCase() === 'SUCCESS' || 
     transaction.payment_status?.toUpperCase() === 'PAID' ? 'Success' 
     : transaction.payment_status || 'N/A'}
  </span>
</td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.billed_amount || 0)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[100px] truncate">
                        {transaction.charger_id || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {transaction.duration || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                        {transaction.hub || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {transaction.tariff || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {transaction.usage_kwh || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[100px] truncate">
                        {transaction.owner || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                        {transaction.host_details?.name || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                        {transaction.customer_details?.name || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 max-w-[150px] truncate">
                        {formatDate(transaction.timestamp)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 max-w-[120px] truncate">
                        {transaction.reason || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Wallet Transaction Table Component - Based on wallet transactions API response
  const WalletTransactionTable = ({ data }) => {
    return (
      <div className="overflow-x-auto">
        {loadingWallet ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">SI</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TRANSACTION ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">CUSTOMER</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">AMOUNT</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">CURRENCY</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TYPE</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">DESCRIPTION</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">SESSION ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">No Data Found</p>
                      <p className="text-sm text-gray-400 mt-1">No wallet transactions available for the selected date range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((transaction, index) => {
                  const transactionId = transaction.id || transaction.transaction_id || `WTX-${index}`;
                  
                  return (
                    <tr key={transactionId} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-3 text-sm text-gray-500">
                        <span>{index + 1}</span>
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900 max-w-[120px] truncate">
                        {transactionId}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                        {transaction.customer_name || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount || 0)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {transaction.currency || 'INR'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${transaction.transaction_type === 'CREDIT' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                          {transaction.transaction_type === 'CREDIT' ? <CheckCircle className="w-3 h-3 text-green-600" /> : <AlertCircle className="w-3 h-3 text-orange-600" />}
                          {transaction.transaction_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[150px] truncate">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                        {transaction.session_id || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 max-w-[150px] truncate">
                        {formatDate(transaction.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Revenue Management</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-600 font-medium mt-1">Overview</span>
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

        {/* Sidebar Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex gap-0 overflow-x-auto">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'overview') {
                      // Stay on overview
                    } else {
                      navigate(tab.path);
                    }
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'border-green-600 text-green-700 bg-green-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Content */}
        <div className="p-6">
          {/* Revenue Card - Simple and Clean */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 mb-6 shadow-lg shadow-green-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-white/80" />
                <p className="text-white/80 text-sm font-medium">Total Revenue</p>
              </div>
              <h2 className="text-4xl font-bold text-white">{formatCurrency(analyticsData.totalRevenue)}</h2>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-green-100 text-sm">
                  {startDate && endDate ? (
                    <>
                      {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
                    </>
                  ) : (
                    'All time'
                  )}
                </p>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Date Picker */}
          {showDatePicker && (
            <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      fetchAnalytics();
                      fetchTransactions();
                      fetchWalletTransactions();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Transactions Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-gray-900">Transactions</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Charger: {transactions.length}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Wallet: {walletTransactions.length}
                </span>
              </div>
            </div>

            {/* Transaction Tabs */}
            <div className="border-b border-gray-200 px-4">
              <div className="flex gap-0">
                <button
                  onClick={() => setTransactionTab('transactions')}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                    transactionTab === 'transactions'
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Charger Transactions ({transactions.length})
                </button>
                <button
                  onClick={() => setTransactionTab('wallet')}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                    transactionTab === 'wallet'
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Wallet Transactions ({walletTransactions.length})
                </button>
              </div>
            </div>

            {/* Filters and Search - Only for Charger Transactions */}
            {transactionTab === 'transactions' && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID, Charger ID or Customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="FAILED">Failed</option>
                  </select>

                  <select
                    value={hubFilter}
                    onChange={(e) => setHubFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="All Hubs">All Hubs</option>
                    {allHubOptions.filter(opt => opt !== 'All Hubs').map(hub => (
                      <option key={hub} value={hub}>{hub}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Search for Wallet Transactions */}
            {transactionTab === 'wallet' && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID or Customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Table - Charger Transactions */}
            {transactionTab === 'transactions' && (
              <>
                <ChargerTransactionTable data={filteredTransactions} />

                {/* Pagination */}
                {pagination.has_more && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center">
                    <button
                      onClick={loadMoreTransactions}
                      disabled={loadingMore}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">Total Transactions: <span className="font-semibold text-gray-900">
                        {filteredTransactions.length}
                      </span></p>
                      <div className="h-6 w-px bg-gray-300"></div>
                      <p className="text-sm text-gray-600">Total Revenue: <span className="font-semibold text-green-600">
                        {formatCurrency(analyticsData.totalRevenue)}
                      </span></p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Table - Wallet Transactions */}
            {transactionTab === 'wallet' && (
              <>
                <WalletTransactionTable data={filteredWallet} />

                {/* Pagination */}
                {walletPagination.has_more && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center">
                    <button
                      onClick={loadMoreWalletTransactions}
                      disabled={loadingMoreWallet}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMoreWallet ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">Total Wallet Transactions: <span className="font-semibold text-gray-900">
                        {filteredWallet.length}
                      </span></p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
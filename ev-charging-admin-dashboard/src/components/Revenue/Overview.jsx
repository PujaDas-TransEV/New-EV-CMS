// src/pages/RevenueManagement.jsx
import React, { useState, useEffect } from 'react';
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
  GripVertical
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

console.log('API Base URL:', API_BASE_URL);
console.log('CPO App ID:', CPO_APP_ID);

const API_CONFIG = {
  REVENUE_API: `${API_BASE_URL}/api/v1/revenue`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.log('No refresh token found');
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
    console.log('Refresh token response:', data);

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
      console.log('Refresh token failed:', data);
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

  console.log('Fetching URL:', url);

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
      console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
      
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        console.log('Token refreshed successfully, retrying request...');
        
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
        console.log('Refresh token failed, redirecting to login...');
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

// Mock Data
const mockTransactions = [
  {
    id: 'TRX-2024-001',
    payment_status: 'Success',
    billed_amount: '₹250.00',
    charger_id: 'CHG-001',
    duration: '45 mins',
    hub: 'Bangalore Central Hub',
    tariff: '₹5.00/kWh',
    usage: '50 kWh',
    owner: 'TransEV Solutions',
    host_details: 'Park Street Host',
    driver_details: 'Rahul Kumar (DL-2024-001)',
    timestamp: '2026-08-04T10:30:00Z',
    reason: null,
    otp_attempts: null
  },
  {
    id: 'TRX-2024-002',
    payment_status: 'Processing',
    billed_amount: '₹180.00',
    charger_id: 'CHG-002',
    duration: '30 mins',
    hub: 'Mumbai Hub',
    tariff: '₹6.00/kWh',
    usage: '30 kWh',
    owner: 'TransEV Solutions',
    host_details: 'Bandra Host',
    driver_details: 'Priya Sharma (DL-2024-002)',
    timestamp: '2026-08-04T09:15:00Z',
    reason: null,
    otp_attempts: null
  },
  {
    id: 'TRX-2024-003',
    payment_status: 'Failed',
    billed_amount: '₹0.00',
    charger_id: 'CHG-003',
    duration: '15 mins',
    hub: 'Delhi NCR Hub',
    tariff: '₹4.50/kWh',
    usage: '0 kWh',
    owner: 'TransEV Solutions',
    host_details: 'Cyber City Host',
    driver_details: 'Amit Singh (DL-2024-003)',
    timestamp: '2026-08-04T08:00:00Z',
    reason: 'Payment timeout',
    otp_attempts: null
  }
];

const mockSuspenseTransactions = [
  {
    id: 'SUS-2024-001',
    payment_status: 'Pending',
    billed_amount: '₹300.00',
    charger_id: 'CHG-004',
    tariff: '₹5.50/kWh',
    usage: '55 kWh',
    host_details: 'Electronic City Host',
    driver_details: 'Sneha Patel (DL-2024-004)',
    timestamp: '2026-08-04T07:45:00Z',
    otp_attempts: '3',
    reason: 'OTP verification failed'
  },
  {
    id: 'SUS-2024-002',
    payment_status: 'Pending',
    billed_amount: '₹120.00',
    charger_id: 'CHG-005',
    tariff: '₹4.00/kWh',
    usage: '30 kWh',
    host_details: 'Whitefield Host',
    driver_details: 'Vikram Raj (DL-2024-005)',
    timestamp: '2026-08-04T06:30:00Z',
    otp_attempts: '5',
    reason: 'Invalid OTP'
  }
];

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
  const [transactions, setTransactions] = useState(mockTransactions);
  const [suspenseTransactions, setSuspenseTransactions] = useState(mockSuspenseTransactions);
  const [transactionTab, setTransactionTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hostFilter, setHostFilter] = useState('all');
  const [hubFilter, setHubFilter] = useState('all');

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info:', data);
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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Success': 'bg-green-100 text-green-800 border-green-200',
      'success': 'bg-green-100 text-green-800 border-green-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-blue-100 text-blue-800 border-blue-200',
      'pending': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-3 h-3" />;
      case 'processing':
        return <Clock className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  // Sidebar tabs
  const sidebarTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/revenue/overview' },
    { id: 'driver-tariffs', label: 'Customer Tariffs', icon: Users, path: '/revenue/customer-tariffs' },
    { id: 'charger-tariffs', label: 'Charger Tariffs', icon: Zap, path: '/revenue/charger-tariffs' },
    { id: 'aggregation-fee', label: 'Hub Tariffs', icon: Coins, path: '/revenue/hub-tariffs' },
    { id: 'tax', label: 'Tax', icon: Percent, path: '/revenue/tax' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/revenue/settings' }
  ];

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
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/profile');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <User size={16} className="text-gray-500" /> 
          <span>Profile</span>
        </button>
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/organization');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Building size={16} className="text-gray-500" /> 
          <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            handleLogout();
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
        >
          <LogOut size={16} className="text-red-500" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add Dropdown Menu
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-hub");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Plus size={18} className="text-gray-500" /> Add Hub
        </button>
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-charger");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Plus size={18} className="text-gray-500" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.charger_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.driver_details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.payment_status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesHost = hostFilter === 'all' || t.host_details?.toLowerCase().includes(hostFilter.toLowerCase());
    const matchesHub = hubFilter === 'all' || t.hub?.toLowerCase().includes(hubFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesHost && matchesHub;
  });

  // Filter suspense transactions
  const filteredSuspense = suspenseTransactions.filter(t => {
    const matchesSearch = t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.charger_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.driver_details?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get unique hosts and hubs for filters
  const uniqueHosts = [...new Set(transactions.map(t => t.host_details).filter(Boolean))];
  const uniqueHubs = [...new Set(transactions.map(t => t.hub).filter(Boolean))];

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
                    // Navigate to respective page
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
          {/* Revenue Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 mb-6 shadow-lg shadow-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                </div>
                <h2 className="text-4xl font-bold text-white">₹ 0.00</h2>
                <p className="text-green-100 text-sm mt-1">showing revenue of 01 Aug - 04 Aug</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Transactions Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-gray-900">Suspense Transaction</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {suspenseTransactions.length}
                  </span>
                </div>
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
                  Transactions ({transactions.length})
                </button>
                <button
                  onClick={() => setTransactionTab('suspense')}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                    transactionTab === 'suspense'
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Suspense ({suspenseTransactions.length})
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, Charger ID or Driver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>

                {transactionTab === 'transactions' && (
                  <>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="Success">Success</option>
                      <option value="Processing">Processing</option>
                      <option value="Failed">Failed</option>
                    </select>

                    <select
                      value={hostFilter}
                      onChange={(e) => setHostFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="all">All Hosts</option>
                      {uniqueHosts.map(host => (
                        <option key={host} value={host}>{host}</option>
                      ))}
                    </select>

                    <select
                      value={hubFilter}
                      onChange={(e) => setHubFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="all">All Hubs</option>
                      {uniqueHubs.map(hub => (
                        <option key={hub} value={hub}>{hub}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {transactionTab === 'transactions' ? (
                filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No Data Found</p>
                    <p className="text-sm text-gray-400">No transactions available</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billed Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charger ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tariff</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage (kWh)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.id}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(transaction.payment_status)}`}>
                              {getStatusIcon(transaction.payment_status)}
                              {transaction.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.billed_amount}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.charger_id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.duration}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.hub}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.tariff}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.usage}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.owner}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.host_details}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.driver_details}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(transaction.timestamp)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{transaction.reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                // Suspense Table
                filteredSuspense.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No Data Found</p>
                    <p className="text-sm text-gray-400">No suspense transactions available</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billed Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charger ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tariff</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage (kWh)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTP Attempts</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSuspense.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.id}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(transaction.payment_status)}`}>
                              {getStatusIcon(transaction.payment_status)}
                              {transaction.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.billed_amount}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.charger_id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.tariff}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.usage}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.host_details}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{transaction.driver_details}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(transaction.timestamp)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.otp_attempts}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{transaction.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
// src/components/CustomerandVehicles/Customer.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Loader2,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Activity,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Server,
  Filter,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  ArrowLeft,
  UserPlus,
  MoreVertical,
  Circle,
  CircleCheck,
  CircleX,
  CircleAlert,
  UserRound,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Lock,
  Unlock,
  Award,
  Star,
  BadgeCheck,
  Zap,
  Car,
  AlertTriangle,
  UserCog,
  Users as UsersIcon,
  UserMinus,
  UserPlus as UserPlusIcon,
  Power,
  PowerOff,
  Wallet,
  TrendingUp,
  BarChart,
  PieChart,
  CreditCard,
  Coins,
  DollarSign,
  IndianRupee,
  Sparkles,
  Crown,
  Medal,
  Trophy,
  Gift,
  Gem,
  Diamond,
  Target,
  Flag,
  Rocket,
  Plane,
  Train,
  Bus,
  Bike,
  Scooter,
  Truck,
  Ship,
  Anchor,
  Compass,
  Map,
  Pin,
  Navigation,
  Route,
  Signpost,
  TrafficCone,
  Parking,
  Fuel,
  Battery,
  Plug,
  Zap as ZapIcon,
  Wifi,
  Bluetooth,
  Thermometer,
  Wind,
  Droplet,
  Sun,
  Moon,
  Cloud,
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
  Infinity,
  RotateCw,
  RotateCcw,
  RefreshCw as RefreshIcon,
  Filter as FilterIcon,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Layers,
  Grid,
  List,
  LayoutGrid,
  LayoutList,
  Columns,
  Rows,
  Table,
  Sheet,
  FileText,
  FileSpreadsheet,
  FileSearch,
  FileCheck,
  FileX,
  FileMinus,
  FilePlus,
  FileSignature,
  FileBadge,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileZip,
  FileRar,
  File7z,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileJson,
  FileXml,
  FileCsv,
  FileTxt,
  FileMarkdown,
  FileHtml,
  FileCss,
  FileJs,
  FileTs,
  FilePy,
  FileJava,
  FileCpp,
  FileGo,
  FileRust,
  FilePhp,
  FileRuby,
  FileSwift,
  FileKotlin,
  FileDart,
  FileScala,
  FileClojure,
  FileElixir,
  FileErlang,
  FileHaskell,
  FileLua,
  FilePerl,
  FileR,
  FileMatlab,
  FileJulia,
  FileCrystal,
  FileNim,
  FileZig,
  FileV,
  FileOdin,
  FileJai,
  FileHaxe,
  FileNeko,
  FilePython,
  FileJavaScript,
  FileTypeScript,
  FileCSharp,
  FileFSharp,
  FileVb,
  FileSql,
  FileGraphql,
  FileProtobuf,
  FileThrift,
  FileAvro,
  FileParquet,
  FileOrc,
  FileArrow,
  FileFeather,
  Minus
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  CUSTOMERS_API: `${API_BASE_URL}/api/v1/cpo/customers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
};

const Drivers = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('drivers');
  
  // Customer data state
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  
  // Wallet Transactions state
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletPagination, setWalletPagination] = useState({
    next_before: null,
    next_before_id: null,
    has_more: false,
    limit: 50
  });
  const [walletLoadingMore, setWalletLoadingMore] = useState(false);
  const [selectedCustomerForWallet, setSelectedCustomerForWallet] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    next_before: null,
    next_before_id: null,
    limit: 10,
    has_more: false,
    total: 0
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'drivers', label: 'Customers', icon: UsersIcon },
    { id: 'alerts', label: 'Customer Alerts', icon: AlertTriangle },
    { id: 'groups', label: 'Customer Groups', icon: UserCog },
    { id: 'vehicles', label: 'Vehicles', icon: Car }
  ];

  // Filter status options
  const statusFilterOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'BLOCKED', label: 'Blocked' }
  ];

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchCustomers();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (before = null, before_id = null) => {
    setCustomersLoading(true);
    
    try {
      let url = `${API_CONFIG.CUSTOMERS_API}?limit=${pagination.limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }
      if (searchTerm) {
        url += `&q=${encodeURIComponent(searchTerm)}`;
      }

      const response = await authenticatedRequest(url, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const customersData = data.customers || data.data || data || [];
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || customersData.length;

        setCustomers(prev => before ? [...prev, ...customersData] : customersData);
        setPagination({
          next_before: nextBefore,
          next_before_id: nextBeforeId,
          has_more: hasMore,
          total: total,
          limit: pagination.limit
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreCustomers = () => {
    if (pagination.has_more && !loadingMore) {
      setLoadingMore(true);
      fetchCustomers(pagination.next_before, pagination.next_before_id);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await authenticatedRequest(`${API_CONFIG.CUSTOMERS_API}/${customerId}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const customerData = data.customer || data.data || data;
        setSelectedCustomer(customerData);
        setShowCustomerModal(true);
        setStatusUpdateError('');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  // Fetch Wallet Transactions
  const fetchWalletTransactions = async (customerId, before = null, before_id = null) => {
    setWalletLoading(true);
    
    try {
      let url = `${API_CONFIG.CUSTOMERS_API}/${customerId}/wallet-transactions?limit=${walletPagination.limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      console.log('Fetching wallet transactions:', url);
      const response = await authenticatedRequest(url, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Wallet Transactions Response:', data);

      if (response.ok) {
        const transactions = data.transactions || data.data || [];
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;

        setWalletTransactions(prev => before ? [...prev, ...transactions] : transactions);
        setWalletPagination({
          next_before: nextBefore,
          next_before_id: nextBeforeId,
          has_more: hasMore,
          limit: walletPagination.limit
        });
      } else {
        console.error('Failed to fetch wallet transactions:', data);
      }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
    } finally {
      setWalletLoading(false);
      setWalletLoadingMore(false);
    }
  };

  const loadMoreWalletTransactions = () => {
    if (walletPagination.has_more && !walletLoadingMore && selectedCustomerForWallet) {
      setWalletLoadingMore(true);
      fetchWalletTransactions(
        selectedCustomerForWallet.id,
        walletPagination.next_before,
        walletPagination.next_before_id
      );
    }
  };

  const openWalletModal = (customer) => {
    setSelectedCustomerForWallet(customer);
    setWalletTransactions([]);
    setWalletPagination({
      next_before: null,
      next_before_id: null,
      has_more: false,
      limit: 50
    });
    setShowWalletModal(true);
    fetchWalletTransactions(customer.id);
  };

  const updateCustomerStatus = async (customerId, newStatus) => {
    setUpdatingStatus(true);
    setStatusUpdateError('');
    
    try {
      const response = await authenticatedRequest(`${API_CONFIG.CUSTOMERS_API}/${customerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        // Update the customer in the list
        setCustomers(prev => 
          prev.map(c => 
            c.id === customerId ? { ...c, status: newStatus } : c
          )
        );
        
        // Update selected customer
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer({ ...selectedCustomer, status: newStatus });
        }
        
        // Refresh the list
        setCustomers([]);
        setPagination({
          next_before: null,
          next_before_id: null,
          limit: 10,
          has_more: false,
          total: 0
        });
        fetchCustomers();
        
        setStatusUpdateError('');
        alert(`Customer status updated to ${newStatus} successfully!`);
      } else {
        setStatusUpdateError(data.message || data.error?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      setStatusUpdateError(error.message || 'An error occurred');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'alerts') {
      navigate('/customer-alerts');
    } else if (tabId === 'groups') {
      navigate('/customer-groups');
    } else if (tabId === 'vehicles') {
      navigate('/vehicles');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
      'INACTIVE': 'bg-red-100 text-red-700 border-red-200',
      'BLOCKED': 'bg-red-100 text-red-700 border-red-200',
      'SUSPENDED': 'bg-orange-100 text-orange-700 border-orange-200',
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[status?.toUpperCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const statusUpper = status?.toUpperCase();
    switch(statusUpper) {
      case 'ACTIVE':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'INACTIVE':
      case 'BLOCKED':
        return <XCircle className="w-3 h-3 text-red-600" />;
      case 'SUSPENDED':
        return <AlertCircle className="w-3 h-3 text-orange-600" />;
      case 'PENDING':
        return <Clock className="w-3 h-3 text-yellow-600" />;
      default:
        return <Circle className="w-3 h-3 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-500',
      'INACTIVE': 'bg-red-500',
      'BLOCKED': 'bg-red-600',
      'SUSPENDED': 'bg-orange-500',
      'PENDING': 'bg-yellow-500'
    };
    return colors[status?.toUpperCase()] || 'bg-gray-500';
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      'CREDIT': 'text-green-600 bg-green-50 border-green-200',
      'DEBIT': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[type?.toUpperCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTransactionStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
      'FAILED': 'bg-red-100 text-red-700 border-red-200',
      'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status?.toUpperCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ 0';
    return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatUsage = (usage) => {
    if (!usage && usage !== 0) return '0 kWh';
    return `${Number(usage).toLocaleString('en-IN', { maximumFractionDigits: 2 })} kWh`;
  };

  // Filter customers based on status
  const getFilteredCustomers = () => {
    let filtered = customers;

    if (filterStatus !== 'all') {
      filtered = customers.filter(c => c.status?.toUpperCase() === filterStatus);
    }

    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

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
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-charger");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Wallet Transactions Modal
  const WalletModal = () => {
    if (!selectedCustomerForWallet) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100 rounded-t-3xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-green-500/25">
                <Wallet size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Wallet Transactions</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedCustomerForWallet.full_name || 'Unnamed Customer'}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-sm text-gray-500">
                    Balance: {formatCurrency(selectedCustomerForWallet.wallet_balance)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowWalletModal(false);
                setSelectedCustomerForWallet(null);
                setWalletTransactions([]);
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {walletLoading && walletTransactions.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading transactions...</p>
                </div>
              </div>
            ) : walletTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet size={40} className="text-gray-300" />
                </div>
                <p className="text-lg font-semibold text-gray-600">No Transactions Found</p>
                <p className="text-sm text-gray-400 mt-1">This customer has no wallet transactions yet</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Currency</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletTransactions.map((transaction, index) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-400">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getTransactionTypeColor(transaction.transaction_type)}`}>
                              {transaction.transaction_type === 'CREDIT' ? (
                                <Plus size={12} className="text-green-600" />
                              ) : (
                                <Minus size={12} className="text-red-600" />
                              )}
                              {transaction.transaction_type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${transaction.transaction_type === 'CREDIT' ? 'text-green-700' : 'text-red-700'}`}>
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-600">
                              {transaction.currency || 'INR'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getTransactionStatusColor(transaction.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                transaction.status?.toUpperCase() === 'PENDING' ? 'bg-yellow-500' :
                                transaction.status?.toUpperCase() === 'COMPLETED' ? 'bg-green-500' :
                                transaction.status?.toUpperCase() === 'FAILED' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`}></span>
                              {transaction.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600 truncate max-w-[150px] block">
                              {transaction.description || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500">{formatDate(transaction.created_at)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Load More */}
                {walletPagination.has_more && (
                  <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
                    <button
                      onClick={loadMoreWalletTransactions}
                      disabled={walletLoadingMore}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {walletLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Load More
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-b-2xl">
                  <span>Showing {walletTransactions.length} transactions</span>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Credits: {walletTransactions.filter(t => t.transaction_type?.toUpperCase() === 'CREDIT').length}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Debits: {walletTransactions.filter(t => t.transaction_type?.toUpperCase() === 'DEBIT').length}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      Pending: {walletTransactions.filter(t => t.status?.toUpperCase() === 'PENDING').length}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-600"></span>
                      Completed: {walletTransactions.filter(t => t.status?.toUpperCase() === 'COMPLETED').length}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Customer Detail Modal
  const CustomerModal = () => {
    if (!selectedCustomer) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100 rounded-t-3xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/25">
                {selectedCustomer.full_name?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.full_name || 'Unnamed Customer'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">ID: {selectedCustomer.id?.slice(0, 8) || 'N/A'}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                    {getStatusIcon(selectedCustomer.status)}
                    {selectedCustomer.status || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowCustomerModal(false);
                setSelectedCustomer(null);
                setStatusUpdateError('');
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <UserRound size={16} className="text-gray-500" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MailIcon size={16} className="text-blue-600" />
                    <p className="text-xs text-blue-600 font-medium">Email</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <PhoneIcon size={16} className="text-purple-600" />
                    <p className="text-xs text-purple-600 font-medium">Phone</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <BadgeCheck size={16} className="text-green-600" />
                    <p className="text-xs text-green-600 font-medium">Verification Status</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCustomer.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <CheckCircle size={16} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <XCircle size={16} />
                        Not Verified
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={16} className="text-yellow-600" />
                    <p className="text-xs text-yellow-600 font-medium">Account Status</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                    {getStatusIcon(selectedCustomer.status)}
                    {selectedCustomer.status || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage & Wallet */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-500" />
                Usage & Wallet
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Battery size={16} className="text-blue-600" />
                    <p className="text-xs text-blue-600 font-medium">Total Usage</p>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{formatUsage(selectedCustomer.total_usage_kwh)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet size={16} className="text-green-600" />
                    <p className="text-xs text-green-600 font-medium">Wallet Balance</p>
                  </div>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(selectedCustomer.wallet_balance)}</p>
                </div>
              </div>
            </div>

            {/* Group Assignment */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <UsersIcon size={16} className="text-gray-500" />
                Group Assignment
              </h4>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <UserCog size={16} className="text-purple-600" />
                  <p className="text-xs text-purple-600 font-medium">User Group</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCustomer.usergroup_assigned ? (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <CheckCircle size={16} />
                      Assigned to Group
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <AlertCircle size={16} />
                      Not Assigned
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-gray-500" />
                Activity & Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <UserPlus size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-500">{formatDate(selectedCustomer.created_at)}</p>
                  </div>
                </div>
                {selectedCustomer.last_login_at && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Login</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedCustomer.last_login_at)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <RefreshCw size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(selectedCustomer.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Power size={16} className="text-gray-500" />
                Update Status
              </h4>
              
              {statusUpdateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-3">
                  {statusUpdateError}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {selectedCustomer.status === 'ACTIVE' ? (
                  <>
                    <button
                      onClick={() => updateCustomerStatus(selectedCustomer.id, 'SUSPENDED')}
                      disabled={updatingStatus}
                      className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserMinus size={16} />
                          Suspend
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => updateCustomerStatus(selectedCustomer.id, 'INACTIVE')}
                      disabled={updatingStatus}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <PowerOff size={16} />
                          Deactivate
                        </>
                      )}
                    </button>
                  </>
                ) : selectedCustomer.status === 'SUSPENDED' ? (
                  <>
                    <button
                      onClick={() => updateCustomerStatus(selectedCustomer.id, 'ACTIVE')}
                      disabled={updatingStatus}
                      className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlusIcon size={16} />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => updateCustomerStatus(selectedCustomer.id, 'INACTIVE')}
                      disabled={updatingStatus}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <PowerOff size={16} />
                          Deactivate
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateCustomerStatus(selectedCustomer.id, 'ACTIVE')}
                    disabled={updatingStatus}
                    className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 disabled:opacity-50"
                  >
                    {updatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlusIcon size={16} />
                        Activate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading if refreshing
  if (isRefreshing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isRefreshing ? 'Refreshing session...' : 'Loading customers...'}
            </p>
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Customer & Vehicles</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-400 font-medium mt-1">Manage Customers</span>
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
        </header>

        {/* Tabs Section */}
        <div className="px-6 pt-6 border-b border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
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

        {/* Content - Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="p-6">
            {/* Search and Filter Bar - Simplified with just customer count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <UsersIcon size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">{pagination.total || customers.length}</strong> Customers
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 sm:flex-none min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value === '') {
                        setCustomers([]);
                        setPagination({
                          next_before: null,
                          next_before_id: null,
                          limit: 10,
                          has_more: false,
                          total: 0
                        });
                        fetchCustomers();
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && fetchCustomers()}
                    className="w-full sm:w-56 pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  />
                </div>

                <div className="relative flex-1 sm:flex-none min-w-[130px]">
                  <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full sm:w-36 text-sm"
                  >
                    {statusFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setCustomers([]);
                    setPagination({
                      next_before: null,
                      next_before_id: null,
                      limit: 10,
                      has_more: false,
                      total: 0
                    });
                    fetchCustomers();
                  }}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                  title="Reset filters"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {customersLoading && customers.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading customers...</p>
                  </div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">No Customers Found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'No customers registered yet'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Verified</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Group</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"> Total Usage</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Wallet</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((customer, index) => (
                          <tr key={customer.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-400">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-blue-500/25">
                                  {customer.full_name?.charAt(0) || 'D'}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">
                                    {customer.full_name || 'Unnamed'}
                                  </p>
                                  <p className="text-xs text-gray-400">ID: {customer.id?.slice(0, 8) || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <MailIcon size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600 truncate max-w-[140px]">{customer.email || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <PhoneIcon size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600">{customer.phone || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadgeColor(customer.status)}`}></span>
                                {customer.status || 'PENDING'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {customer.is_verified ? (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle size={14} />
                                  <span className="text-xs font-medium">Verified</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600">
                                  <XCircle size={14} />
                                  <span className="text-xs font-medium">Not Verified</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {customer.usergroup_assigned ? (
                                <span className="inline-flex items-center gap-1 text-blue-600">
                                  <UserCheck size={14} />
                                  <span className="text-xs font-medium">Assigned</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                  <UserX size={14} />
                                  <span className="text-xs font-medium">Not Assigned</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Battery size={14} className="text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">{formatUsage(customer.total_usage_kwh)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Wallet size={14} className="text-green-500" />
                                <span className="text-sm font-medium text-gray-700">{formatCurrency(customer.wallet_balance)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-500">{formatDate(customer.created_at)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => fetchCustomerDetails(customer.id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition text-xs flex items-center gap-1 shadow-lg shadow-green-500/25"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                                <button
                                  onClick={() => openWalletModal(customer)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition text-xs flex items-center gap-1 shadow-lg shadow-blue-500/25"
                                >
                                  <Wallet size={14} />
                                  Wallet
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination / Load More */}
                  {pagination.has_more && (
                    <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
                      <button
                        onClick={loadMoreCustomers}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Load More Customers
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span>Showing {filteredCustomers.length} of {pagination.total || customers.length} customers</span>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Active: {customers.filter(c => c.status?.toUpperCase() === 'ACTIVE').length}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Inactive: {customers.filter(c => c.status?.toUpperCase() === 'INACTIVE' || c.status?.toUpperCase() === 'BLOCKED').length}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Pending: {customers.filter(c => c.status?.toUpperCase() === 'PENDING').length}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Suspended: {customers.filter(c => c.status?.toUpperCase() === 'SUSPENDED').length}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showCustomerModal && <CustomerModal />}

      {/* Wallet Transactions Modal */}
      {showWalletModal && <WalletModal />}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Drivers;
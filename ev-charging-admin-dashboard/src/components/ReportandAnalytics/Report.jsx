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
  CalendarDays,
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
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings as SettingsIcon,
  Sliders,
  ToggleLeft,
  ToggleRight,
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
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Power as PowerIcon,
  Wifi as WifiIcon,
  Radio as RadioIcon,
  Gauge as GaugeIcon,
  Calendar as CalendarIcon2,
  Clock as ClockIcon2,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  IndianRupee as IndianRupeeIcon,
  Zap as ZapIcon,
  FileText as FileTextIcon,
  Tag as TagIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  Car,
  ChargingStation,
  Fuel,
  Map,
  Navigation,
  Compass,
  Target,
  Flag,
  Award as AwardIcon,
  Medal,
  Trophy,
  Gift as GiftIcon,
  Star as StarIcon,
  Crown as CrownIcon,
  Sparkles as SparklesIcon,
  Layers as LayersIcon,
  Package as PackageIcon,
  Repeat as RepeatIcon,
  Landmark as LandmarkIcon,
  Banknote as BanknoteIcon,
  File as FileIcon,
  Server as ServerIcon,
  Database as DatabaseIcon,
  Cloud as CloudIcon,
  Smartphone as SmartphoneIcon,
  Monitor as MonitorIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  Network as NetworkIcon,
  Radio as RadioIcon2,
  Bluetooth as BluetoothIcon,
  Thermometer as ThermometerIcon,
  Wind as WindIcon,
  Droplet as DropletIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  CloudWind as CloudWindIcon,
  CloudFog as CloudFogIcon,
  CloudDrizzle as CloudDrizzleIcon,
  CloudHail as CloudHailIcon,
  CloudSleet as CloudSleetIcon,
  CloudThunder as CloudThunderIcon,
  CloudTornado as CloudTornadoIcon,
  CloudHurricane as CloudHurricaneIcon,
  CloudTyphoon as CloudTyphoonIcon,
  CloudCyclone as CloudCycloneIcon,
  CloudStorm as CloudStormIcon,
  CloudRainbow as CloudRainbowIcon,
  CloudSun as CloudSunIcon,
  CloudMoon as CloudMoonIcon,
  CloudStar as CloudStarIcon,
  CloudComet as CloudCometIcon,
  CloudAsteroid as CloudAsteroidIcon,
  CloudMeteor as CloudMeteorIcon,
  CloudGalaxy as CloudGalaxyIcon,
  CloudUniverse as CloudUniverseIcon,
  CloudMultiverse as CloudMultiverseIcon,
  Shield as ShieldIcon,
  AlertCircle as AlertCircleIcon,
  CalendarRange as CalendarRangeIcon,
  Sliders as SlidersIcon,
  ToggleLeft as ToggleLeftIcon,
  ToggleRight as ToggleRightIcon,
  ChevronUp,
  Download,
  Calendar as CalendarIcon3,
  Filter as FilterIcon,
  X,
  Printer,
  Share2,
  BarChart3,
  PieChart as PieChartIcon2,
  AreaChart,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Calendar as CalendarIcon4,
  Hash,
  Link as LinkIcon2,
  HardDrive as HardDriveIcon2
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// ============================================================================
// API Configuration
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

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
    total: 0,
    active: 0,
    inactive: 0,
    utilization: 0,
    growth: 0,
    change: 0,
    totalRevenue: 0,
    chargingRevenue: 0,
    subscriptionRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0
  });

  // Report Types
  const reportTypes = [
    { id: 'chargers', label: 'Chargers', icon: Zap, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-500' },
    { id: 'vehicles', label: 'Vehicles', icon: Car, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600', borderColor: 'border-green-500' },
    { id: 'drivers', label: 'Drivers', icon: Users, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-500' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', borderColor: 'border-yellow-500' }
  ];

  // ============================================================================
  // Fetch Data from API
  // ============================================================================
  const fetchData = useCallback(async (type) => {
    setLoading(true);
    setError('');
    
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
        case 'revenue':
          let startDate = '';
          let endDate = '';
          if (selectedDateStr) {
            startDate = selectedDateStr;
            endDate = selectedDateStr;
          } else {
            const today = new Date();
            startDate = today.toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
          }
          apiUrl = `${API_BASE_URL}/api/v1/cpo/charger-transactions?limit=100&start_date=${startDate}&end_date=${endDate}`;
          break;
        default:
          return;
      }

      console.log(`📊 Fetching ${type} from:`, apiUrl);

      const response = await authenticatedRequest(apiUrl, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 ${type} data:`, data);
        processDetailData(type, data);
        setSuccess(`${type} data loaded successfully!`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Failed to fetch ${type} data`);
        setTimeout(() => setError(''), 5000);
        setDetailData([]);
        setFilteredData([]);
        setSelectedStats({ 
          total: 0, 
          active: 0, 
          inactive: 0, 
          utilization: 0, 
          growth: 0, 
          change: 0,
          totalRevenue: 0,
          chargingRevenue: 0,
          subscriptionRevenue: 0,
          totalTransactions: 0,
          completedTransactions: 0,
          failedTransactions: 0
        });
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(error.message || `Failed to fetch ${type} data`);
      setTimeout(() => setError(''), 5000);
      setDetailData([]);
      setFilteredData([]);
      setSelectedStats({ 
        total: 0, 
        active: 0, 
        inactive: 0, 
        utilization: 0, 
        growth: 0, 
        change: 0,
        totalRevenue: 0,
        chargingRevenue: 0,
        subscriptionRevenue: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        failedTransactions: 0
      });
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest, selectedDateStr]);

  // ============================================================================
  // Process Detail Data
  // ============================================================================
  const processDetailData = (type, data) => {
    let items = [];
    let stats = { 
      total: 0, 
      active: 0, 
      inactive: 0, 
      utilization: 0, 
      growth: 0, 
      change: 0,
      totalRevenue: 0,
      chargingRevenue: 0,
      subscriptionRevenue: 0,
      totalTransactions: 0,
      completedTransactions: 0,
      failedTransactions: 0
    };

    switch(type) {
      case 'chargers':
        items = data.chargers || data.data || data || [];
        // Extract hub_name from each item
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
          growth: 12.5,
          change: 8.2,
          totalRevenue: 0,
          chargingRevenue: 0,
          subscriptionRevenue: 0,
          totalTransactions: 0,
          completedTransactions: 0,
          failedTransactions: 0
        };
        break;
      case 'vehicles':
        items = data.vehicles || data.data || data || [];
        stats = {
          total: items.length,
          active: items.filter(v => v.status === 'active' || v.is_active).length,
          inactive: items.filter(v => v.status !== 'active' && !v.is_active).length,
          utilization: items.length > 0 ? Math.round((items.filter(v => v.status === 'active' || v.is_active).length / items.length) * 100) : 0,
          growth: 15.3,
          change: 6.7,
          totalRevenue: 0,
          chargingRevenue: 0,
          subscriptionRevenue: 0,
          totalTransactions: 0,
          completedTransactions: 0,
          failedTransactions: 0
        };
        break;
      case 'drivers':
        items = data.customers || data.data || data || [];
        stats = {
          total: items.length,
          active: items.filter(c => c.status === 'active' || c.is_active).length,
          inactive: items.filter(c => c.status !== 'active' && !c.is_active).length,
          utilization: items.length > 0 ? Math.round((items.filter(c => c.status === 'active' || c.is_active).length / items.length) * 100) : 0,
          growth: 18.2,
          change: 9.8,
          totalRevenue: 0,
          chargingRevenue: 0,
          subscriptionRevenue: 0,
          totalTransactions: 0,
          completedTransactions: 0,
          failedTransactions: 0
        };
        break;
      case 'revenue':
        // Get transactions from response
        let transactions = data.transactions || data.data || data || [];
        // Enhance transactions with charger and hub info if available
        transactions = transactions.map(tx => ({
          ...tx,
          charger_name: tx.charger_name || tx.charger?.name || 'N/A',
          hub_name: tx.hub || tx.charger?.hub_name || 'N/A',  // <<-- Use 'hub' field directly
          customer_name: tx.customer_details?.name || tx.customer_name || 'N/A',
          charger_id: tx.charger_id || tx.charger?.charger_id || 'N/A'
        }));
        items = transactions;
        
        // Calculate revenue from billed_amount
        let totalRevenue = 0;
        let completedRevenue = 0;
        let completedCount = 0;
        let failedCount = 0;
        
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
          growth: 22.8,
          change: 14.2,
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

    setDetailData(items);
    // Filter by selected date
    filterByDate(items);
    setSelectedStats(stats);
  };

  // ============================================================================
  // Filter Data by Selected Date
  // ============================================================================
  const filterByDate = (items = detailData) => {
    if (!selectedDateStr) {
      setFilteredData(items);
      // Recalculate revenue for filtered data
      if (selectedReportType === 'revenue') {
        recalculateRevenue(items);
      }
      return;
    }

    const selected = new Date(selectedDateStr);
    const filtered = items.filter(item => {
      const itemDate = new Date(item.timestamp || item.created_at || item.createdAt || item.date || item.transaction_date);
      return itemDate.toDateString() === selected.toDateString();
    });

    setFilteredData(filtered);
    
    // Recalculate revenue for filtered data if revenue type
    if (selectedReportType === 'revenue') {
      recalculateRevenue(filtered);
    }
  };

  // ============================================================================
  // Recalculate Revenue for Filtered Data
  // ============================================================================
  const recalculateRevenue = (items) => {
    let totalRevenue = 0;
    let completedRevenue = 0;
    let completedCount = 0;
    let failedCount = 0;
    
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
  // Handle Date Selection
  // ============================================================================
  const handleDateSelect = (e) => {
    const dateValue = e.target.value;
    setSelectedDateStr(dateValue);
    if (dateValue) {
      const date = new Date(dateValue);
      setSelectedDate(date);
      setShowDatePicker(false);
      // Refetch data with new date
      fetchData(selectedReportType);
      setSuccess(`Filtered data for ${date.toLocaleDateString()}`);
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setFilteredData(detailData);
      if (selectedReportType === 'revenue') {
        recalculateRevenue(detailData);
      }
      setSuccess('Cleared date filter');
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  // ============================================================================
  // Search Data
  // ============================================================================
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredData(detailData);
      return;
    }

    const filtered = detailData.filter(item => {
      const searchableFields = [
        'transaction_id', 'session_id', 'charger_name', 'charger_id', 
        'customer_details', 'hub', 'payment_status', 'session_status',
        'billed_amount', 'transaction_id', 'ocpp_transaction_id',
        'hub_name', 'charger_name', 'name', 'email', 'phone'
      ];
      return searchableFields.some(field => {
        const value = typeof item[field] === 'object' ? JSON.stringify(item[field]) : item[field];
        return value && value.toString().toLowerCase().includes(term);
      });
    });

    setFilteredData(filtered);
    if (selectedReportType === 'revenue') {
      recalculateRevenue(filtered);
    }
  };

  // ============================================================================
  // Download/Generate Report Function
  // ============================================================================
  const generateAndDownloadReport = async () => {
    setIsDownloading(true);
    setSuccess('');
    setError('');

    try {
      const reportType = reportTypes.find(r => r.id === selectedReportType);
      const reportLabel = reportType?.label || selectedReportType;
      const dateStr = selectedDateStr || new Date().toISOString().split('T')[0];
      
      let dataToDownload = filteredData.length > 0 ? filteredData : detailData;

      if (!dataToDownload || dataToDownload.length === 0) {
        setError('No data available for the selected date');
        setTimeout(() => setError(''), 5000);
        setIsDownloading(false);
        return;
      }

      // Prepare CSV data
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
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchData(selectedReportType);
  }, [selectedReportType, fetchData]);

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

  const handleReportSelect = (type) => {
    setSelectedReportType(type);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
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

  // Format number for display
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    if (num >= 1000000) return `₹${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // ============================================================================
  // Get status badge color
  // ============================================================================
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
  // Settings Dropdown Menu
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

  // ============================================================================
  // Add Dropdown Menu
  // ============================================================================
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

  const getReportIcon = (type) => {
    const found = reportTypes.find(r => r.id === type);
    if (found) {
      const Icon = found.icon;
      return <Icon size={20} className={found.textColor} />;
    }
    return <BarChartIcon size={20} className="text-gray-600" />;
  };

  const getReportColor = (type) => {
    const found = reportTypes.find(r => r.id === type);
    return found?.color || 'gray';
  };

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
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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
          {/* Error/Success Messages */}
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
                          onClick={() => {
                            setSelectedDateStr('');
                            setShowDatePicker(false);
                            setFilteredData(detailData);
                            if (selectedReportType === 'revenue') {
                              recalculateRevenue(detailData);
                            }
                            setSuccess('Cleared date filter');
                            setTimeout(() => setSuccess(''), 3000);
                          }}
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
                        {selectedDateStr ? `Showing data for ${new Date(selectedDateStr).toLocaleDateString()}` : 'Select a date to filter data'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Report / Download Button */}
                <button
                  onClick={generateAndDownloadReport}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Generate Report
                </button>
                
                {/* Filters Toggle */}
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

            {/* Filters Section */}
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
                        if (value === 'all') {
                          setFilteredData(detailData);
                          if (selectedReportType === 'revenue') {
                            recalculateRevenue(detailData);
                          }
                        } else {
                          const filtered = detailData.filter(item => {
                            const status = (item.payment_status || item.session_status || item.status || '').toUpperCase();
                            return status === value.toUpperCase();
                          });
                          setFilteredData(filtered);
                          if (selectedReportType === 'revenue') {
                            recalculateRevenue(filtered);
                          }
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
                          sorted.sort((a, b) => new Date(b.timestamp || b.created_at || b.date) - new Date(a.timestamp || a.created_at || a.date));
                        } else if (value === 'oldest') {
                          sorted.sort((a, b) => new Date(a.timestamp || a.created_at || a.date) - new Date(b.timestamp || b.created_at || b.date));
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

          {/* Stats Cards - Only show selected report type with revenue details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {reportTypes.filter(type => type.id === selectedReportType).map((type) => {
              const data = selectedStats;
              
              return (
                <div 
                  key={type.id}
                  className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${type.borderColor} border-2`}
                >
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
                  
                  {/* Revenue specific details */}
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

          {/* Data Table - Enhanced with Hub Name and larger, more beautiful design */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} List
                {selectedDateStr && (
                  <span className="text-xs text-gray-400 ml-2">
                    (Filtered: {new Date(selectedDateStr).toLocaleDateString()})
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
                      ? `No records found for ${new Date(selectedDateStr).toLocaleDateString()}`
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
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">SI</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Vehicle Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Registration</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Owner</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Created At</th>
                        </tr>
                      )}
                      {selectedReportType === 'drivers' && (
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
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
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
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
                            <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/30 transition duration-150">
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
                            <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/30 transition duration-150">
                              <td className="py-3 px-4 text-gray-500 text-xs">{index + 1}</td>
                              <td className="py-3 px-4 font-medium text-gray-800">{item.vehicle_name || item.name || 'Unnamed'}</td>
                              <td className="py-3 px-4 text-gray-600">{item.registration || item.registration_number || '-'}</td>
                              <td className="py-3 px-4 text-gray-600">{item.type || item.vehicle_type || '-'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                                  {item.status || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{item.owner_name || '-'}</td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(item.created_at)}</td>
                            </tr>
                          );
                        }
                        if (selectedReportType === 'drivers') {
                          return (
                            <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/30 transition duration-150">
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
                            <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/30 transition duration-150">
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
                              <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(item.timestamp)}</td>
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
                  {selectedDateStr ? ` Filtered for ${new Date(selectedDateStr).toLocaleDateString()}.` : ' Use the calendar to filter by date.'}
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
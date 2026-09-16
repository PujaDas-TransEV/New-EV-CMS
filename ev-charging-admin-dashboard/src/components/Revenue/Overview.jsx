// src/pages/RevenueManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Settings, LogOut, Plus, ChevronDown, Building, Mail, Calendar, Clock,
  Shield, CheckCircle, AlertCircle, X, Layers, MapPin, Globe, Hash, FileText,
  ExternalLink, Search, Phone, Loader2, Home, Menu, Link as LinkIcon, ArrowLeft,
  Edit, Trash2, Power, Wifi, Zap, MoreVertical, Eye, ChevronLeft, ChevronRight,
  ArrowRight, Check, Circle, Info, Map, Navigation, Target, List, Grid, Radio,
  RadioButton, Search as SearchIcon, Gauge, Database, RefreshCw, Globe2, Crosshair,
  Compass, AlertTriangle, CreditCard, Banknote, Landmark, File, Users, Server,
  Activity, BarChart, PieChart, TrendingUp, TrendingDown, DollarSign, Percent,
  Award, Star, UserCheck, UserX, Clock as ClockIcon, Calendar as CalendarIcon,
  Filter, Download, Printer, Share2, Copy, Link, Wallet, Receipt, Coins, Ticket,
  GripVertical, ChevronRight as ChevronRightIcon, Minus, Plus as PlusIcon, FileDown,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon2, FileSpreadsheet
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';
import { useAuth } from '../Authentication/AuthContext';

// API Configuration — bearer + App-ID headers are attached centrally
// by AuthContext.authenticatedRequest. No token handling lives here.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  TRANSACTIONS_API: `${API_BASE_URL}/api/v1/cpo/charger-transactions`,
  WALLET_TRANSACTIONS_API: `${API_BASE_URL}/api/v1/cpo/wallet-transactions`,
  ANALYTICS_API: `${API_BASE_URL}/api/v1/cpo/analytics`,
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  SESSION_INVOICE_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}/invoice`,
};

// ============================================================
// INVOICE ROW — Horizontal table strip
// Columns: INVOICE NUMBER | DATE | NAME | AMOUNT | DOWNLOAD INVOICE
// ============================================================
const InvoiceRow = ({ invoice, sessionId, fallbackData, onDownload, downloading }) => {
  const safe = invoice || {};
  const fb = fallbackData || {};

  const invoiceNumber =
    safe.invoice_number || safe.invoiceNumber || safe.invoice_id || safe.invoiceId ||
    safe.number || safe.id || safe.invoice?.number || safe.invoice?.id ||
    fb.invoice_number || fb.transaction_id || fb.id || sessionId || 'N/A';

  const invoiceDate =
    safe.invoice_date || safe.invoiceDate || safe.date ||
    safe.created_at || safe.timestamp ||
    safe.invoice?.date || fb.timestamp;

  const customerName =
    safe.customer_details?.name || safe.customer?.name || safe.customer_name ||
    safe.invoice?.customer_name ||
    fb.customer_name || fb.customer_details?.name || '-';

  const amount =
    safe.total ?? safe.total_amount ?? safe.grand_total ??
    safe.amount ?? safe.billed_amount ?? safe.subtotal ??
    fb.billed_amount ?? 0;

  const currency = safe.currency || fb.currency || 'INR';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '';

  const fmtAmount = (amt) =>
    `${currencySymbol} ${Number(amt || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const fmtDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return String(d); }
  };

  return (
    <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 border-y border-green-200/60">
      <table className="w-full min-w-[1400px]">
        <thead className="bg-green-100/50">
          <tr>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
              Invoice Number
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
              Date
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
              Name
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
              Download Invoice
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-3 py-3 text-sm font-mono text-gray-800 max-w-[240px] truncate">
              {String(invoiceNumber).slice(0, 60)}
            </td>
            <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
              {fmtDate(invoiceDate)}
            </td>
            <td className="px-3 py-3 text-sm text-gray-700 max-w-[180px] truncate">
              {customerName}
            </td>
            <td className="px-3 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
              {fmtAmount(amount)}
            </td>
            <td className="px-3 py-3">
              <button
                onClick={onDownload}
                disabled={downloading}
                className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading…
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Download Invoice
                  </>
                )}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const RevenueManagement = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const [expandedInvoices, setExpandedInvoices] = useState({});
  const [invoiceData, setInvoiceData] = useState({});
  const [loadingInvoice, setLoadingInvoice] = useState({});
  const [downloadingInvoice, setDownloadingInvoice] = useState({});
  const [invoiceErrors, setInvoiceErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0, totalSessions: 0, totalUsage: 0, onlinePercentage: 0,
    avgSessionDuration: 0, totalCustomers: 0, period: 'all', fromDate: null, toDate: null
  });
  const [analyticsError, setAnalyticsError] = useState('');

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date(); date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [pagination, setPagination] = useState({ next_before: null, next_before_id: null, has_more: false, limit: 50 });
  const [walletPagination, setWalletPagination] = useState({ next_before: null, next_before_id: null, has_more: false, limit: 50 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMoreWallet, setLoadingMoreWallet] = useState(false);

  const sidebarTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/revenue/overview' },
    { id: 'driver-tariffs', label: 'Customer Tariffs', icon: Users, path: '/revenue/customer-tariffs' },
    { id: 'charger-tariffs', label: 'Charger Tariffs', icon: Zap, path: '/revenue/charger-tariffs' },
    { id: 'aggregation-fee', label: 'Hub Tariffs', icon: Layers, path: '/revenue/hub-tariffs' },
    { id: 'tax', label: 'Tax', icon: Percent, path: '/revenue/tax' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/revenue/settings' }
  ];

  const periodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Universal status → display status
  const getDisplayStatus = (rawStatus) => {
    if (!rawStatus) return 'N/A';
    const upper = String(rawStatus).toUpperCase().trim();
    if (upper === 'COMPLETED' || upper === 'SUCCESS' || upper === 'SUCCESSFUL' || upper === 'PAID' || upper === 'SETTLED') {
      return 'Success';
    }
    if (upper === 'PENDING' || upper === 'INITIATED' || upper === 'CREATED') return 'Pending';
    if (upper === 'PROCESSING' || upper === 'IN_PROGRESS' || upper === 'INITIATING') return 'Processing';
    if (upper === 'FAILED' || upper === 'FAILURE' || upper === 'DECLINED' || upper === 'REJECTED' || upper === 'CANCELLED') {
      return 'Failed';
    }
    if (upper === 'REFUNDED' || upper === 'REVERSED') return 'Refunded';
    return 'N/A';
  };

  const getStatusBadgeStyle = (displayStatus) => {
    const styles = {
      'Success': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'Failed': 'bg-red-100 text-red-700 border-red-200',
      'Refunded': 'bg-purple-100 text-purple-700 border-purple-200',
      'N/A': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return styles[displayStatus] || styles['N/A'];
  };

  const getStatusIcon = (displayStatus) => {
    switch (displayStatus) {
      case 'Success': return <CheckCircle className="w-3 h-3" />;
      case 'Pending': return <Clock className="w-3 h-3" />;
      case 'Processing': return <RefreshCw className="w-3 h-3" />;
      case 'Failed': return <AlertCircle className="w-3 h-3" />;
      case 'Refunded': return <ArrowLeft className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const getSessionId = (transaction) => {
    if (!transaction) return null;
    return (
      transaction.session_id ||
      transaction.sessionId ||
      transaction.charging_session_id ||
      transaction.session?.id ||
      transaction.session?.session_id ||
      null
    );
  };

  const fetchInvoice = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setLoadingInvoice(prev => ({ ...prev, [sessionId]: true }));
    setInvoiceErrors(prev => ({ ...prev, [sessionId]: '' }));

    try {
      const url = API_CONFIG.SESSION_INVOICE_API(sessionId);
      const response = await authenticatedRequest(url, { method: 'GET' });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = { __nonJson: true };
        }
        setInvoiceData(prev => ({ ...prev, [sessionId]: data.data || data }));
      } else {
        let errMsg = 'Failed to load invoice';
        try {
          const errorData = await response.json();
          errMsg = errorData.message || errorData.error?.message || errMsg;
        } catch { /* ignore */ }
        setInvoiceErrors(prev => ({ ...prev, [sessionId]: errMsg }));
      }
    } catch (err) {
      setInvoiceErrors(prev => ({
        ...prev,
        [sessionId]: err?.status === 401
          ? 'Session expired. Please sign in again.'
          : (err.message || 'Error loading invoice'),
      }));
    } finally {
      setLoadingInvoice(prev => ({ ...prev, [sessionId]: false }));
    }
  }, [authenticatedRequest]);

  const downloadInvoice = useCallback(async (sessionId, fallbackFilename) => {
    if (!sessionId) return;
    setDownloadingInvoice(prev => ({ ...prev, [sessionId]: true }));

    try {
      const url = API_CONFIG.SESSION_INVOICE_API(sessionId);
      // authenticatedRequest attaches bearer + X-CPO-App-ID centrally.
      const response = await authenticatedRequest(url, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`Failed to download invoice (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      const blob = await response.blob();

      let ext = 'pdf';
      if (contentType.includes('pdf')) ext = 'pdf';
      else if (contentType.includes('json')) ext = 'json';
      else if (contentType.includes('html')) ext = 'html';
      else if (contentType.includes('octet-stream')) ext = 'pdf';

      const filename = fallbackFilename || `invoice-${sessionId}.${ext}`;

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      showToast('Invoice downloaded successfully', 'success');
    } catch (err) {
      console.error('Invoice download failed:', err);
      const msg = err?.status === 401
        ? 'Session expired. Please sign in again.'
        : (err.message || 'Download failed');
      setInvoiceErrors(prev => ({ ...prev, [sessionId]: msg }));
      showToast(msg, 'error');
    } finally {
      setDownloadingInvoice(prev => ({ ...prev, [sessionId]: false }));
    }
  }, [authenticatedRequest]);

  const toggleInvoice = useCallback((sessionId) => {
    if (!sessionId) return;
    setExpandedInvoices(prev => {
      const isOpen = prev[sessionId];
      const next = { ...prev, [sessionId]: !isOpen };
      if (!isOpen && !invoiceData[sessionId] && !loadingInvoice[sessionId]) {
        fetchInvoice(sessionId);
      }
      return next;
    });
  }, [invoiceData, loadingInvoice, fetchInvoice]);

  // ---- FETCHERS -------------------------------------------------------------

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  const fetchHubs = useCallback(async () => {
    setLoadingHubs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUBS_API, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setHubs(data.hubs || data.data || data || []);
      } else { setHubs([]); }
    } catch { setHubs([]); }
    finally { setLoadingHubs(false); }
  }, [authenticatedRequest]);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setAnalyticsError('');
    try {
      let url = API_CONFIG.ANALYTICS_API;
      const params = new URLSearchParams();
      if (selectedPeriod && selectedPeriod !== 'all') params.append('period', selectedPeriod);
      if (selectedDate) params.append('date', selectedDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await authenticatedRequest(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        const analytics = data.data || data || {};
        setAnalyticsData({
          totalRevenue: analytics.total_revenue || analytics.revenue || analytics.totalRevenue || 0,
          totalSessions: analytics.total_sessions || analytics.sessions || analytics.totalSessions || 0,
          totalUsage: analytics.total_usage || analytics.usage || analytics.totalUsage || 0,
          onlinePercentage: analytics.online_percentage || analytics.percentage || analytics.onlinePercentage || 0,
          avgSessionDuration: analytics.avg_session_duration || analytics.avgDuration || analytics.avgSessionDuration || 0,
          totalCustomers: analytics.total_customers || analytics.customers || analytics.totalCustomers || 0,
          period: selectedPeriod,
          fromDate: analytics.from_date || analytics.fromDate || null,
          toDate: analytics.to_date || analytics.toDate || null
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setAnalyticsError(errorData.message || errorData.error?.message || 'Failed to fetch analytics data');
        setAnalyticsData({ totalRevenue: 0, totalSessions: 0, totalUsage: 0, onlinePercentage: 0, avgSessionDuration: 0, totalCustomers: 0, period: selectedPeriod, fromDate: null, toDate: null });
      }
    } catch (err) {
      setAnalyticsError(
        err?.status === 401
          ? 'Session expired. Please sign in again.'
          : (err.message || 'An error occurred while fetching analytics'),
      );
      setAnalyticsData({ totalRevenue: 0, totalSessions: 0, totalUsage: 0, onlinePercentage: 0, avgSessionDuration: 0, totalCustomers: 0, period: selectedPeriod, fromDate: null, toDate: null });
    } finally { setLoadingAnalytics(false); }
  }, [authenticatedRequest, selectedDate, selectedPeriod]);

  const fetchTransactions = useCallback(async (before = null, before_id = null) => {
    setLoadingTransactions(true);
    setError('');
    try {
      let url = `${API_CONFIG.TRANSACTIONS_API}?limit=${pagination.limit}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (before) url += `&before=${encodeURIComponent(new Date(before).toISOString())}`;
      if (before_id) url += `&before_id=${encodeURIComponent(before_id)}`;

      const response = await authenticatedRequest(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        const transactionsData = data.transactions || data.data || data || [];
        setTransactions(prev => before ? [...prev, ...transactionsData] : transactionsData);
        setPagination({
          next_before: data.next_before || null,
          next_before_id: data.next_before_id || null,
          has_more: data.has_more || false,
          limit: pagination.limit
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error?.message || 'Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (err) {
      setError(
        err?.status === 401
          ? 'Session expired. Please sign in again.'
          : (err.message || 'An error occurred while fetching transactions'),
      );
      setTransactions([]);
    } finally { setLoadingTransactions(false); setLoadingMore(false); }
  }, [authenticatedRequest, startDate, endDate, pagination.limit]);

  const fetchWalletTransactions = useCallback(async (before = null, before_id = null) => {
    setLoadingWallet(true);
    try {
      let url = `${API_CONFIG.WALLET_TRANSACTIONS_API}?limit=${walletPagination.limit}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (before) url += `&before=${encodeURIComponent(new Date(before).toISOString())}`;
      if (before_id) url += `&before_id=${encodeURIComponent(before_id)}`;

      const response = await authenticatedRequest(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        const walletData = data.transactions || data.data || data || [];
        setWalletTransactions(prev => before ? [...prev, ...walletData] : walletData);
        setWalletPagination({
          next_before: data.next_before || null,
          next_before_id: data.next_before_id || null,
          has_more: data.has_more || false,
          limit: walletPagination.limit
        });
      } else { setWalletTransactions([]); }
    } catch { setWalletTransactions([]); }
    finally { setLoadingWallet(false); setLoadingMoreWallet(false); }
  }, [authenticatedRequest, startDate, endDate, walletPagination.limit]);

  // ---- EFFECTS --------------------------------------------------------------

  // Bootstrap data only once the context confirms we're authenticated.
  // The AuthContext also redirects unauthenticated users via ProtectedRoute,
  // so no local "no token → /signin" check is needed here.
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUserInfo();
    fetchAnalytics();
    fetchTransactions();
    fetchWalletTransactions();
    fetchHubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (selectedDate || selectedPeriod) fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedPeriod]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (startDate && endDate) {
      fetchTransactions();
      fetchWalletTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // ---- PAGINATION -----------------------------------------------------------

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

  // ---- LOGOUT ---------------------------------------------------------------
  // AuthContext owns token cleanup, and the backend call is already made
  // inside logout(). We just wait for it and let it clear state.
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // ---- FORMATTERS -----------------------------------------------------------

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ 0.00';
    return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPeriodLabel = (period) => {
    const options = { 'all': 'All Time', 'day': 'Today', 'week': 'This Week', 'month': 'This Month', 'year': 'This Year' };
    return options[period] || period;
  };

  // ---- HUB OPTIONS ----------------------------------------------------------

  const getUniqueHubsFromTransactions = () => {
    const hubNames = transactions.map(t => t.hub).filter(hub => hub && hub !== '');
    return [...new Set(hubNames)];
  };

  const getHubNamesFromAPI = () => hubs.map(h => h.name).filter(name => name);

  const allHubOptions = ['All Hubs', ...new Set([...getUniqueHubsFromTransactions(), ...getHubNamesFromAPI()])];

  const filteredTransactions = transactions.filter(t => {
    const transactionId = t.transaction_id || t.id || '';
    const chargerId = t.charger_id || '';
    const customerName = t.customer_details?.name || '';
    const hub = t.hub || '';
    const matchesSearch = transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chargerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const displayStatus = getDisplayStatus(t.payment_status);
    const matchesStatus = statusFilter === 'all' || displayStatus === statusFilter;
    const matchesHub = hubFilter === 'All Hubs' || hub === hubFilter;
    return matchesSearch && matchesStatus && matchesHub;
  });

  const filteredWallet = walletTransactions.filter(t => {
    const transactionId = t.id || t.transaction_id || '';
    const customerName = t.customer_name || '';
    return transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ---- MENUS ---------------------------------------------------------------

  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
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

  // ============================================================
  // CHARGER TRANSACTION TABLE (no SI column — toggle next to ID)
  // ============================================================
  const ChargerTransactionTable = ({ data }) => {
    if (loadingTransactions) {
      return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
    }
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-600">No Data Found</p>
          <p className="text-sm text-gray-400 mt-1">No charger transactions available for the selected filters</p>
        </div>
      );
    }

    const TOTAL_COLUMNS = 13;

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
            <tr>
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
            {data.map((transaction, index) => {
              const transactionId = transaction.transaction_id || transaction.id || `TX-${index}`;
              const displayStatus = getDisplayStatus(transaction.payment_status);
              const badgeStyle = getStatusBadgeStyle(displayStatus);
              const icon = getStatusIcon(displayStatus);

              const sessionId = getSessionId(transaction);
              const isExpanded = sessionId ? !!expandedInvoices[sessionId] : false;
              const isInvoiceLoading = sessionId ? !!loadingInvoice[sessionId] : false;
              const isDownloading = sessionId ? !!downloadingInvoice[sessionId] : false;
              const invoiceError = sessionId ? invoiceErrors[sessionId] : '';
              const inv = sessionId ? invoiceData[sessionId] : null;

              return (
                <React.Fragment key={transactionId}>
                  <tr className={`hover:bg-gray-50 transition ${isExpanded ? 'bg-green-50/40' : ''}`}>
                    <td className="px-3 py-3 text-sm max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => sessionId && toggleInvoice(sessionId)}
                          disabled={!sessionId}
                          title={!sessionId ? 'No session ID available' : isExpanded ? 'Hide invoice' : 'Show invoice'}
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 flex-shrink-0 ${
                            !sessionId
                              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                              : isExpanded
                                ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100'
                                : 'border-green-500 bg-green-50 text-green-600 hover:bg-green-100 hover:scale-110'
                          }`}
                        >
                          {isInvoiceLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isExpanded ? (
                            <Minus className="w-3 h-3" strokeWidth={3} />
                          ) : (
                            <PlusIcon className="w-3 h-3" strokeWidth={3} />
                          )}
                        </button>
                        <span className="font-medium text-gray-900 truncate">{transactionId}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${badgeStyle}`}>
                        {icon}{displayStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{formatCurrency(transaction.billed_amount || 0)}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 max-w-[100px] truncate">{transaction.charger_id || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{transaction.duration || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">{transaction.hub || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{transaction.tariff || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{transaction.usage_kwh || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 max-w-[100px] truncate">{transaction.owner || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">{transaction.host_details?.name || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">{transaction.customer_details?.name || '-'}</td>
                    <td className="px-3 py-3 text-sm text-gray-500 max-w-[150px] truncate">{formatDate(transaction.timestamp)}</td>
                    <td className="px-3 py-3 text-sm text-gray-500 max-w-[120px] truncate">{transaction.reason || '-'}</td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-gray-50/80">
                      <td colSpan={TOTAL_COLUMNS} className="p-0">
                        {isInvoiceLoading ? (
                          <div className="flex items-center justify-center py-6 gap-3 bg-green-50/60 border-y border-green-200/60">
                            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                            <span className="text-sm text-gray-600">Loading invoice…</span>
                          </div>
                        ) : invoiceError && !inv ? (
                          <div className="m-3 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-700">Failed to load invoice</p>
                              <p className="text-xs text-red-600 mt-1">{invoiceError}</p>
                            </div>
                            <button
                              onClick={() => sessionId && fetchInvoice(sessionId)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3 h-3" /> Retry
                            </button>
                          </div>
                        ) : (
                          <InvoiceRow
                            invoice={inv}
                            sessionId={sessionId}
                            fallbackData={transaction}
                            onDownload={() => downloadInvoice(sessionId, `invoice-${sessionId}.pdf`)}
                            downloading={isDownloading}
                          />
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================
  // WALLET TRANSACTION TABLE (no SI column)
  // ============================================================
  const WalletTransactionTable = ({ data }) => {
    if (loadingWallet) {
      return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
    }
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-600">No Data Found</p>
          <p className="text-sm text-gray-400 mt-1">No wallet transactions available for the selected date range</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
            <tr>
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
            {data.map((transaction, index) => {
              const transactionId = transaction.id || transaction.transaction_id || `WTX-${index}`;

              const rawStatus = transaction.status || transaction.payment_status || '';
              const displayStatus = getDisplayStatus(rawStatus);
              const badgeStyle = getStatusBadgeStyle(displayStatus);
              const statusIcon = getStatusIcon(displayStatus);

              const txType = String(transaction.transaction_type || '').toUpperCase();
              const isCredit = txType === 'CREDIT' || txType === 'CR';

              return (
                <tr key={transactionId} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 max-w-[140px] truncate">{transactionId}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">{transaction.customer_name || '-'}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900">{formatCurrency(transaction.amount || 0)}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{transaction.currency || 'INR'}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${
                      isCredit
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-orange-100 text-orange-700 border-orange-200'
                    }`}>
                      {isCredit
                        ? <CheckCircle className="w-3 h-3 text-green-600" />
                        : <AlertCircle className="w-3 h-3 text-orange-600" />}
                      {transaction.transaction_type || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${badgeStyle}`}>
                      {statusIcon}
                      {displayStatus}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 max-w-[150px] truncate">{transaction.description || '-'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">{transaction.session_id || '-'}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 max-w-[150px] truncate">{formatDate(transaction.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
        userName={userData?.user?.full_name || user?.name || 'User'}
        userEmail={userData?.user?.email || user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
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
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

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
                    if (tab.id !== 'overview') navigate(tab.path);
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isActive ? 'border-green-600 text-green-700 bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 mb-6 shadow-lg shadow-green-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                </div>
                <h2 className="text-4xl font-bold text-white">
                  {loadingAnalytics ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin inline" />
                  ) : (
                    formatCurrency(analyticsData.totalRevenue)
                  )}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <p className="text-green-100 text-sm">
                    {selectedPeriod === 'all' ? (<>All Time Revenue</>) : selectedDate ? (
                      <>{getPeriodLabel(selectedPeriod)} - {formatDateDisplay(selectedDate)}</>
                    ) : (<>{getPeriodLabel(selectedPeriod)}</>)}
                  </p>
                  <button onClick={() => setShowDatePicker(!showDatePicker)} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Wallet className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {analyticsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />{analyticsError}
            </div>
          )}

          {showDatePicker && (
            <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Period</label>
                  <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    {periodOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <button onClick={() => { setShowDatePicker(false); fetchAnalytics(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">Apply</button>
                  <button onClick={() => setShowDatePicker(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-gray-900">Transactions</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Charger: {transactions.length}</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Wallet: {walletTransactions.length}</span>
              </div>
            </div>

            <div className="border-b border-gray-200 px-4">
              <div className="flex gap-0">
                <button onClick={() => setTransactionTab('transactions')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${transactionTab === 'transactions' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Charger Transactions
                </button>
                <button onClick={() => setTransactionTab('wallet')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${transactionTab === 'wallet' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Wallet Transactions
                </button>
              </div>
            </div>

            {transactionTab === 'transactions' && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by ID, Charger ID or Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm" />
                  </div>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white">
                    <option value="all">All Status</option>
                    <option value="Success">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Failed">Failed</option>
                    <option value="N/A">N/A</option>
                  </select>
                  <select value={hubFilter} onChange={(e) => setHubFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white">
                    <option value="All Hubs">All Hubs</option>
                    {allHubOptions.filter(opt => opt !== 'All Hubs').map(hub => (<option key={hub} value={hub}>{hub}</option>))}
                  </select>
                </div>
              </div>
            )}

            {transactionTab === 'wallet' && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by ID or Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm" />
                  </div>
                </div>
              </div>
            )}

            {transactionTab === 'transactions' && (
              <>
                <ChargerTransactionTable data={filteredTransactions} />
                {pagination.has_more && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center">
                    <button onClick={loadMoreTransactions} disabled={loadingMore} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {loadingMore ? (<><Loader2 className="w-4 h-4 animate-spin" />Loading...</>) : ('Load More')}
                    </button>
                  </div>
                )}
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">Total Transactions: <span className="font-semibold text-gray-900">{filteredTransactions.length}</span></p>
                      <div className="h-6 w-px bg-gray-300"></div>
                      <p className="text-sm text-gray-600">Total Revenue: <span className="font-semibold text-green-600">{formatCurrency(analyticsData.totalRevenue)}</span></p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {transactionTab === 'wallet' && (
              <>
                <WalletTransactionTable data={filteredWallet} />
                {walletPagination.has_more && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center">
                    <button onClick={loadMoreWalletTransactions} disabled={loadingMoreWallet} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {loadingMoreWallet ? (<><Loader2 className="w-4 h-4 animate-spin" />Loading...</>) : ('Load More')}
                    </button>
                  </div>
                )}
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">Total Wallet Transactions: <span className="font-semibold text-gray-900">{filteredWallet.length}</span></p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default RevenueManagement;
// src/components/CustomerandVehicles/CustomerAlerts.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Users as UsersIcon,
  UserCog,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Eye,
  Loader2,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  Activity,
  MapPin,
  Zap,
  Clock,
  Mail,
  Phone,
  ShieldAlert,
  CheckCheck,
  Car
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  CUSTOMER_ALERTS_API: `${API_BASE_URL}/api/v1/cpo/customer-alerts`
};

// ---------------------------------------------------------------------------
// DUMMY DATA (fallback / demo). Backend response pele eita replace hoye jabe.
// ---------------------------------------------------------------------------
const DUMMY_ALERTS = [
  {
    id: 'ALT-1001',
    type: 'charger_offline',
    severity: 'critical',
    status: 'active',
    title: 'Charger Offline',
    message:
      'Charger CHG-0142 has been unreachable for more than 30 minutes. Customer was unable to start a charging session.',
    customer: {
      id: 'CUST-2031',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210'
    },
    vehicle: { id: 'VEH-8821', name: 'Tata Nexon EV', plate: 'MH 02 AB 1234' },
    hub: 'Andheri East Hub',
    charger: 'CHG-0142',
    created_at: '2026-02-14T09:12:00Z'
  },
  {
    id: 'ALT-1002',
    type: 'payment_failed',
    severity: 'critical',
    status: 'active',
    title: 'Payment Failed',
    message:
      'Auto-debit of ₹640 failed for the last charging session. Wallet balance is below the minimum threshold.',
    customer: {
      id: 'CUST-2104',
      name: 'Priya Nair',
      email: 'priya.nair@example.com',
      phone: '+91 91234 56780'
    },
    vehicle: { id: 'VEH-9012', name: 'MG ZS EV', plate: 'KA 05 CD 7788' },
    hub: 'Koramangala Hub',
    charger: 'CHG-0088',
    created_at: '2026-02-14T08:40:00Z'
  },
  {
    id: 'ALT-1003',
    type: 'session_error',
    severity: 'warning',
    status: 'acknowledged',
    title: 'Charging Session Aborted',
    message:
      'Session terminated unexpectedly at 62% SOC. Connector lock release was reported by the charger.',
    customer: {
      id: 'CUST-1988',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 99887 76655'
    },
    vehicle: { id: 'VEH-7745', name: 'Hyundai Ioniq 5', plate: 'DL 8C AA 0099' },
    hub: 'Cyber Hub, Gurugram',
    charger: 'CHG-0231',
    created_at: '2026-02-14T07:15:00Z'
  },
  {
    id: 'ALT-1004',
    type: 'low_balance',
    severity: 'warning',
    status: 'active',
    title: 'Low Wallet Balance',
    message:
      'Customer wallet balance is ₹45, which is below the ₹100 threshold. Upcoming auto-debit may fail.',
    customer: {
      id: 'CUST-2233',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@example.com',
      phone: '+91 90123 45678'
    },
    vehicle: { id: 'VEH-6650', name: 'Tata Tiago EV', plate: 'MH 12 GH 4521' },
    hub: 'Hinjewadi Phase 1',
    charger: 'CHG-0399',
    created_at: '2026-02-13T19:05:00Z'
  },
  {
    id: 'ALT-1005',
    type: 'rfid_issue',
    severity: 'warning',
    status: 'resolved',
    title: 'RFID Card Not Recognised',
    message:
      'Customer RFID card was rejected 3 times at the charger. Card has been re-synced from the CMS.',
    customer: {
      id: 'CUST-2044',
      name: 'Imran Khan',
      email: 'imran.khan@example.com',
      phone: '+91 88997 66554'
    },
    vehicle: { id: 'VEH-5590', name: 'BYD Atto 3', plate: 'TS 09 EF 3311' },
    hub: 'Hitech City Hub',
    charger: 'CHG-0117',
    created_at: '2026-02-13T16:22:00Z',
    resolved_at: '2026-02-13T17:02:00Z'
  },
  {
    id: 'ALT-1006',
    type: 'connector_fault',
    severity: 'critical',
    status: 'active',
    title: 'Connector Fault Detected',
    message:
      'Ground fault detected on Connector B. Charger has been locked out automatically for safety.',
    customer: {
      id: 'CUST-2311',
      name: 'Deepa Iyer',
      email: 'deepa.iyer@example.com',
      phone: '+91 97654 32109'
    },
    vehicle: { id: 'VEH-4412', name: 'Kia EV6', plate: 'TN 10 KL 8899' },
    hub: 'Guindy Hub, Chennai',
    charger: 'CHG-0056',
    created_at: '2026-02-13T14:48:00Z'
  },
  {
    id: 'ALT-1007',
    type: 'idle_charger',
    severity: 'info',
    status: 'acknowledged',
    title: 'Idle Fee Applied',
    message:
      'Vehicle remained connected for 45 minutes after charging completed. Idle fee of ₹90 has been applied.',
    customer: {
      id: 'CUST-1876',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 96543 21098'
    },
    vehicle: { id: 'VEH-3320', name: 'Mahindra XUV400', plate: 'UP 16 XY 2244' },
    hub: 'Sector 62, Noida',
    charger: 'CHG-0455',
    created_at: '2026-02-13T11:30:00Z'
  },
  {
    id: 'ALT-1008',
    type: 'session_error',
    severity: 'info',
    status: 'resolved',
    title: 'Session Started After Retry',
    message:
      'Initial handshake failed but the session started successfully on retry. No revenue impact.',
    customer: {
      id: 'CUST-2199',
      name: 'Ananya Bose',
      email: 'ananya.bose@example.com',
      phone: '+91 95432 10987'
    },
    vehicle: { id: 'VEH-2210', name: 'Tata Punch EV', plate: 'WB 20 PQ 6611' },
    hub: 'Salt Lake, Kolkata',
    charger: 'CHG-0290',
    created_at: '2026-02-12T18:10:00Z',
    resolved_at: '2026-02-12T18:12:00Z'
  }
];

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    badge: 'bg-red-100 text-red-700 border-red-200',
    iconBox: 'bg-red-50 text-red-600',
    leftBorder: 'border-l-red-500'
  },
  warning: {
    label: 'Warning',
    icon: AlertCircle,
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    iconBox: 'bg-amber-50 text-amber-600',
    leftBorder: 'border-l-amber-500'
  },
  info: {
    label: 'Info',
    icon: Info,
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBox: 'bg-blue-50 text-blue-600',
    leftBorder: 'border-l-blue-500'
  }
};

const STATUS_CONFIG = {
  active: { label: 'Active', badge: 'bg-red-50 text-red-600 border-red-200' },
  acknowledged: { label: 'Acknowledged', badge: 'bg-blue-50 text-blue-600 border-blue-200' },
  resolved: { label: 'Resolved', badge: 'bg-green-50 text-green-600 border-green-200' }
};

const ALERTS_PER_PAGE = 6;

const CustomerAlerts = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'customers', label: 'Customers', icon: UsersIcon, path: '/customers' },
    { id: 'alerts', label: 'Customer Alerts', icon: AlertCircle, path: '/customer-alerts' },
    { id: 'groups', label: 'Customer Groups', icon: UserCog, path: '/customer-groups' },
    { id: 'vehicles', label: 'Vehicles', icon: Activity, path: '/vehicles' }
  ];

  // -------------------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchCustomerAlerts();
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  const fetchCustomerAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.CUSTOMER_ALERTS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const list = data.alerts || data.customer_alerts || data.data || data || [];
        setAlerts(Array.isArray(list) && list.length > 0 ? list : DUMMY_ALERTS);
      } else {
        // Backend e endpoint na thakle dummy data diye demo cholbe
        setAlerts(DUMMY_ALERTS);
      }
    } catch (err) {
      console.warn('Falling back to demo alerts:', err);
      setAlerts(DUMMY_ALERTS);
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  // -------------------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------------------
  const handleAcknowledge = async (alertId) => {
    setIsUpdating(true);
    try {
      const response = await authenticatedRequest(
        `${API_CONFIG.CUSTOMER_ALERTS_API}/${alertId}/acknowledge`,
        { method: 'PATCH' }
      );
      // Backend fail korleo UI update kore dei (demo mode)
      if (!response.ok) {
        console.warn('Acknowledge API failed, updating UI locally');
      }
    } catch (err) {
      console.warn('Acknowledge error, updating UI locally:', err);
    } finally {
      setAlerts(prev =>
        prev.map(a => (a.id === alertId ? { ...a, status: 'acknowledged' } : a))
      );
      setSelectedAlert(prev =>
        prev && prev.id === alertId ? { ...prev, status: 'acknowledged' } : prev
      );
      setIsUpdating(false);
    }
  };

  const handleResolve = async (alertId) => {
    setIsUpdating(true);
    try {
      const response = await authenticatedRequest(
        `${API_CONFIG.CUSTOMER_ALERTS_API}/${alertId}/resolve`,
        { method: 'PATCH' }
      );
      if (!response.ok) {
        console.warn('Resolve API failed, updating UI locally');
      }
    } catch (err) {
      console.warn('Resolve error, updating UI locally:', err);
    } finally {
      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId
            ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() }
            : a
        )
      );
      setSelectedAlert(prev =>
        prev && prev.id === alertId
          ? { ...prev, status: 'resolved', resolved_at: new Date().toISOString() }
          : prev
      );
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const handleTabClick = (tabId, path) => {
    if (tabId === 'alerts') return;
    navigate(path);
  };

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------
  const formatDateTime = (dateString) => {
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

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // -------------------------------------------------------------------------
  // FILTER + PAGINATION
  // -------------------------------------------------------------------------
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        alert.title?.toLowerCase().includes(q) ||
        alert.message?.toLowerCase().includes(q) ||
        alert.id?.toLowerCase().includes(q) ||
        alert.customer?.name?.toLowerCase().includes(q) ||
        alert.charger?.toLowerCase().includes(q) ||
        alert.hub?.toLowerCase().includes(q);

      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE));
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * ALERTS_PER_PAGE,
    currentPage * ALERTS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, severityFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
      warning: alerts.filter(a => a.severity === 'warning' && a.status !== 'resolved').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };
  }, [alerts]);

  const severityCounts = useMemo(() => {
    return {
      all: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length
    };
  }, [alerts]);

  // -------------------------------------------------------------------------
  // SUB-COMPONENTS
  // -------------------------------------------------------------------------
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
          onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <User size={16} className="text-gray-500" /> <span>Profile</span>
        </button>
        <button
          onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Building size={16} className="text-gray-500" /> <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button
          onClick={() => { setShowSettingsMenu(false); handleLogout(); }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
        >
          <LogOut size={16} className="text-red-500" /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button
          onClick={() => { setShowAddMenu(false); navigate('/add-hub'); }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
        <button
          onClick={() => { setShowAddMenu(false); navigate('/add-charger'); }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Alert Detail Modal
  const AlertDetailModal = ({ alert, onClose, onAcknowledge, onResolve }) => {
    if (!alert) return null;
    const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
    const st = STATUS_CONFIG[alert.status] || STATUS_CONFIG.active;
    const SevIcon = sev.icon;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${sev.iconBox}`}>
                <SevIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">{alert.title}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sev.badge}`}>
                    {sev.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.badge}`}>
                    {st.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">{alert.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal body */}
          <div className="p-6 space-y-5">
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-800 leading-relaxed">{alert.message}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Customer
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {alert.customer?.name?.charAt(0) || 'C'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{alert.customer?.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{alert.customer?.id}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{alert.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{alert.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Vehicle
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {alert.vehicle?.name || 'Unknown Vehicle'}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{alert.vehicle?.plate || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{alert.charger || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{alert.hub || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Timeline
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500 w-24">Triggered</span>
                  <span className="text-gray-800 font-medium">{formatDateTime(alert.created_at)}</span>
                </div>
                {alert.resolved_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCheck size={15} className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-500 w-24">Resolved</span>
                    <span className="text-gray-800 font-medium">{formatDateTime(alert.resolved_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex items-center gap-3 p-6 border-t border-gray-100">
            {alert.status === 'active' && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye size={18} />}
                Acknowledge
              </button>
            )}
            {alert.status !== 'resolved' && (
              <button
                onClick={() => onResolve(alert.id)}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={18} />}
                Mark Resolved
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // LOADING (session refresh)
  // -------------------------------------------------------------------------
  if (isRefreshing && loading) {
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

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Customer &amp; Vehicles</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-400 font-medium mt-1">Manage Customer Alerts</span>
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

        {/* TABS */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === 'alerts';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`flex items-center gap-2 px-5 py-5 rounded-t-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.id === 'alerts' && stats.total > 0 && (
                    <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                      {stats.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/25">
                  <BellRing className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Critical</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Warnings</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.warning}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Severity pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'All', color: 'text-gray-600' },
                  { key: 'critical', label: 'Critical', color: 'text-red-600' },
                  { key: 'warning', label: 'Warning', color: 'text-amber-600' },
                  { key: 'info', label: 'Info', color: 'text-blue-600' }
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSeverityFilter(s.key)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition border ${
                      severityFilter === s.key
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                    <span className="ml-1.5 text-xs opacity-70">{severityCounts[s.key]}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              {/* Status dropdown */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh */}
              <button
                onClick={fetchCustomerAlerts}
                disabled={loading}
                className="p-2.5 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Search */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts, customers, chargers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* ALERTS LIST */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No Alerts Found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || severityFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search'
                  : 'All clear — no customer alerts right now'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedAlerts.map((alert) => {
                  const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                  const st = STATUS_CONFIG[alert.status] || STATUS_CONFIG.active;
                  const SevIcon = sev.icon;

                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${sev.leftBorder} shadow-sm hover:shadow-md transition-all cursor-pointer`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${sev.iconBox}`}>
                              <SevIcon className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sev.badge}`}>
                                  {sev.label}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.badge}`}>
                                  {st.label}
                                </span>
                              </div>

                              <p className="text-sm text-gray-500 mt-1.5">{alert.message}</p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1.5">
                                  <User size={13} className="text-gray-400" />
                                  {alert.customer?.name || 'Unknown'}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Zap size={13} className="text-gray-400" />
                                  {alert.charger}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin size={13} className="text-gray-400" />
                                  {alert.hub}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock size={13} className="text-gray-400" />
                                  {timeAgo(alert.created_at)}
                                </span>
                                <span className="font-mono text-gray-400">{alert.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {alert.status === 'active' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id); }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Acknowledge"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            {alert.status !== 'resolved' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResolve(alert.id); }}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Mark Resolved"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedAlert(alert); }}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                              title="View Details"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
                  <p className="text-sm text-gray-500">
                    Showing{' '}
                    <span className="font-medium text-gray-700">
                      {(currentPage - 1) * ALERTS_PER_PAGE + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-gray-700">
                      {Math.min(currentPage * ALERTS_PER_PAGE, filteredAlerts.length)}
                    </span>{' '}
                    of <span className="font-medium text-gray-700">{filteredAlerts.length}</span> alerts
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                          currentPage === page
                            ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ALERT DETAIL MODAL */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
};

export default CustomerAlerts;
// src/components/Alerts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Menu,
  RefreshCw,
  ArrowLeft,
  MoreVertical,
  FileText,
  Layers,
  Grid,
  List,
  DollarSign,
  Percent,
  IndianRupee,
  Receipt,
  BarChart,
  PieChart,
  Zap,
  Home,
  Briefcase,
  Calendar,
  Clock,
  X,
  AlertCircle,
  Shield,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Crown,
  Bell,
  BellOff,
  Info,
  HelpCircle,
  Check,
  AlertTriangle,
  Smartphone,
  Monitor,
  Tablet,
  Moon,
  Sun,
  Lock,
  Key,
  BellRing,
  BellPlus,
  BellMinus,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Bookmark,
  BookmarkCheck,
  Send,
  Inbox,
  Clock as ClockIcon,
  CalendarDays,
  Timer,
  Package,
  Repeat,
  Landmark,
  Banknote,
  File,
  Server,
  Database,
  Cloud,
  Smartphone as SmartphoneIcon,
  Monitor as MonitorIcon,
  Tablet as TabletIcon,
  Laptop,
  Cpu,
  HardDrive,
  Network,
  Radio,
  Bluetooth,
  Thermometer,
  Wind,
  Droplet,
  Sun as SunIcon,
  Moon as MoonIcon,
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
  X as XIcon,
  BellDot,
  BellElectric,
} from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  NOTIFICATIONS_API: `${API_BASE_URL}/api/v1/cpo/notifications`,
  NOTIFICATION_READ_API: (notificationId) => `${API_BASE_URL}/api/v1/platform/notifications/${notificationId}/read`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const Alerts = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationDetail, setShowNotificationDetail] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [before, setBefore] = useState(null);
  const [beforeId, setBeforeId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(50);

  // Fetch user info
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = useCallback(async () => {
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
  }, [authenticatedRequest]);

  // Fetch notifications using GET /api/v1/cpo/notifications
  const fetchNotifications = useCallback(async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('unread_only', unreadOnly.toString());
      
      if (loadMore && before && beforeId) {
        params.append('before', before);
        params.append('before_id', beforeId);
      }
      
      const url = `${API_CONFIG.NOTIFICATIONS_API}?${params.toString()}`;
      
      const response = await authenticatedRequest(url, {
        method: 'GET',
        headers: {
          'X-CPO-App-ID': CPO_APP_ID,
        }
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.notifications || data.data || data || [];
        
        if (loadMore) {
          setNotifications(prev => [...prev, ...items]);
        } else {
          setNotifications(items);
        }
        
        // Update pagination info
        if (data.has_more !== undefined) {
          setHasMore(data.has_more);
        }
        if (data.next_before) {
          setBefore(data.next_before);
        }
        if (data.next_before_id) {
          setBeforeId(data.next_before_id);
        }
        if (data.total) {
          setTotalCount(data.total);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error?.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('An error occurred while fetching notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [authenticatedRequest, unreadOnly, before, beforeId, hasMore, limit]);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationDetail(true);
  };

  // Mark notification as read using POST /api/v1/platform/notifications/{notification_id}/read
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;
    
    try {
      const response = await authenticatedRequest(API_CONFIG.NOTIFICATION_READ_API(notificationId), {
        method: 'POST',
        headers: {
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        // Update selected notification if it's the same
        if (selectedNotification?.id === notificationId) {
          setSelectedNotification(prev => ({ ...prev, is_read: true }));
        }
        setSuccess('Notification marked as read');
        setTimeout(() => setSuccess(''), 3000);
      } else if (response.status === 404) {
        setError('Notification not found');
        setTimeout(() => setError(''), 3000);
      } else if (response.status === 403) {
        setError('You do not have permission to mark this notification as read');
        setTimeout(() => setError(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to mark notification as read');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('An error occurred while marking notification as read');
      setTimeout(() => setError(''), 3000);
    }
  }, [authenticatedRequest, selectedNotification]);

  // Mark all as read - Using the same endpoint for each notification
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length === 0) {
      setSuccess('All notifications are already read');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    try {
      // Mark each unread notification as read
      for (const notification of unreadNotifications) {
        const response = await authenticatedRequest(API_CONFIG.NOTIFICATION_READ_API(notification.id), {
          method: 'POST',
          headers: {
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          console.error(`Failed to mark notification ${notification.id} as read`);
        }
      }

      // Update all notifications as read
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      if (selectedNotification) {
        setSelectedNotification(prev => ({ ...prev, is_read: true }));
      }
      setSuccess('All notifications marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('An error occurred while marking all as read');
      setTimeout(() => setError(''), 3000);
    }
  }, [authenticatedRequest, notifications, selectedNotification]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const types = {
      'info': <Info size={18} className="text-blue-500" />,
      'success': <CheckCircle size={18} className="text-green-500" />,
      'warning': <AlertTriangle size={18} className="text-yellow-500" />,
      'error': <XCircle size={18} className="text-red-500" />,
      'system': <Bell size={18} className="text-purple-500" />,
      'billing': <DollarSign size={18} className="text-emerald-500" />,
      'charger': <Zap size={18} className="text-orange-500" />,
      'hub': <Layers size={18} className="text-blue-500" />,
      'user': <Users size={18} className="text-indigo-500" />,
    };
    return types[type] || types.info;
  };

  // Get notification type color
  const getNotificationTypeColor = (type) => {
    const colors = {
      'info': 'bg-blue-50 text-blue-700 border-blue-200',
      'success': 'bg-green-50 text-green-700 border-green-200',
      'warning': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'error': 'bg-red-50 text-red-700 border-red-200',
      'system': 'bg-purple-50 text-purple-700 border-purple-200',
      'billing': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'charger': 'bg-orange-50 text-orange-700 border-orange-200',
      'hub': 'bg-blue-50 text-blue-700 border-blue-200',
      'user': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[type] || colors.info;
  };

  // Settings Dropdown Menu - Black Background
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

  // Add Dropdown Menu - Black Background
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Notification Detail Component
  const NotificationDetail = ({ notification, onClose, onMarkRead }) => {
    if (!notification) return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getNotificationIcon(notification.type)}
            <h3 className="font-semibold text-gray-900">Notification Details</h3>
          </div>
          <div className="flex items-center gap-2">
            {!notification.is_read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Mark as Read"
              >
                <Check size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Title</p>
            <p className="text-sm font-semibold text-gray-900">{notification.title || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Message</p>
            <p className="text-sm text-gray-700 leading-relaxed">{notification.message || 'No message'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
                {notification.type || 'Info'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${notification.is_read ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.is_read ? 'Read' : 'Unread'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(notification.created_at).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {notification.updated_at && notification.updated_at !== notification.created_at && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(notification.updated_at).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            {!notification.is_read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Mark as Read
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
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

  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-600 font-medium mt-1">Alerts</span>
              </div>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {unreadCount} unread
                </span>
              )}
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
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCount || notifications.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Bell size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <BellDot size={24} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Read</p>
                  <p className="text-2xl font-bold text-green-600">{notifications.filter(n => n.is_read).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last 7 Days</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {notifications.filter(n => {
                      const sevenDaysAgo = new Date();
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                      return new Date(n.created_at) >= sevenDaysAgo;
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <CalendarDays size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  onClick={() => setUnreadOnly(!unreadOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition text-sm font-medium ${
                    unreadOnly
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye size={16} />
                  {unreadOnly ? 'Show All' : 'Unread Only'}
                </button>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={16} />
                  Mark All Read
                </button> */}
                <button
                  onClick={() => {
                    setBefore(null);
                    setBeforeId(null);
                    fetchNotifications(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Notifications List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Notifications List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">All Notifications</h3>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No notifications found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {unreadOnly ? 'You have no unread notifications' : 'All caught up!'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {notifications
                      .filter(n => 
                        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                            !notification.is_read ? 'bg-blue-50/50 hover:bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`p-2 rounded-lg ${!notification.is_read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title || 'Notification'}
                                  </p>
                                  <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                                    {notification.message}
                                  </p>
                                </div>
                                {!notification.is_read && (
                                  <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                                  {notification.type || 'Info'}
                                </span>
                                <span className="text-xs text-gray-400">{formatDate(notification.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {hasMore && !loading && (
                  <div className="p-4 border-t border-gray-200 text-center">
                    <button
                      onClick={() => fetchNotifications(true)}
                      disabled={loadingMore}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={14} />
                          Load More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Notification Detail */}
            <div className="lg:col-span-1">
              {selectedNotification ? (
                <NotificationDetail 
                  notification={selectedNotification}
                  onClose={() => {
                    setShowNotificationDetail(false);
                    setSelectedNotification(null);
                  }}
                  onMarkRead={markAsRead}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center sticky top-24">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Select a Notification</p>
                  <p className="text-sm text-gray-400 mt-1">Click on a notification to view details</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>{notifications.filter(n => n.is_read).length} read</span>
                    <span className="w-px h-4 bg-gray-300"></span>
                    <BellDot size={14} className="text-red-500" />
                    <span>{unreadCount} unread</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
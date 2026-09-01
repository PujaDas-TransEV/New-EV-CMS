import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Filter,
  Activity,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
  RefreshCw,
  Download,
  Zap,
  Plug,
  Wifi,
  WifiOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Battery,
  Smartphone,
  Monitor,
  Server,
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  Grid,
  List,
  Info,
  Link,
  ExternalLink,
  Database,
  IndianRupee,
  CalendarDays,
  Timer,
  Layers,
  Receipt,
  BarChart,
  PieChart,
  User as UserIcon,
  Award,
  Star,
  Crown,
  Wallet,
  CreditCard,
  Cloud,
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
  ToggleLeft,
  ToggleRight,
  Sliders,
  Settings as SettingsIcon,
  LineChart,
  TrendingUp as TrendingUpIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Crown as CrownIcon,
  RadioTower,
  History,
  Ticket,
  MessageSquare,
  Paperclip,
  Send,
  Check,
  Clock as ClockIcon,
  HelpCircle,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon2,
  Copy,
  RefreshCw as RefreshIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// ============================================================================
// API Configuration
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  SUPPORT_TICKETS_API: `${API_BASE_URL}/api/v1/cpo/support`,
  SUPPORT_TICKET_DETAIL_API: (ticketId) => `${API_BASE_URL}/api/v1/cpo/support/${ticketId}`,
  SUPPORT_TICKET_REPLY_API: (ticketId) => `${API_BASE_URL}/api/v1/cpo/support/${ticketId}/replies`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  ACCESS_ME_API: `${API_BASE_URL}/api/v1/cpo/access/me`
};

// ============================================================================
// Status Helpers
// ============================================================================
const getTicketStatusColor = (status) => {
  const colors = {
    'OPEN': 'bg-blue-100 text-blue-700 border-blue-200',
    'IN_PROGRESS': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'RESOLVED': 'bg-green-100 text-green-700 border-green-200',
    'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
    'PENDING': 'bg-orange-100 text-orange-700 border-orange-200',
    'WAITING': 'bg-purple-100 text-purple-700 border-purple-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getTicketStatusIcon = (status) => {
  const statusUpper = status?.toUpperCase() || '';
  switch(statusUpper) {
    case 'OPEN':
      return <HelpCircle className="w-3 h-3" />;
    case 'IN_PROGRESS':
      return <Activity className="w-3 h-3" />;
    case 'RESOLVED':
    case 'CLOSED':
      return <CheckCircleIcon2 className="w-3 h-3" />;
    case 'PENDING':
      return <ClockIcon className="w-3 h-3" />;
    case 'WAITING':
      return <AlertTriangleIcon className="w-3 h-3" />;
    default:
      return <Circle className="w-3 h-3" />;
  }
};

const getTicketStatusDisplayName = (status) => {
  const statusMap = {
    'OPEN': 'Open',
    'IN_PROGRESS': 'In Progress',
    'RESOLVED': 'Resolved',
    'CLOSED': 'Closed',
    'PENDING': 'Pending',
    'WAITING': 'Waiting'
  };
  return statusMap[status] || status || 'Unknown';
};

const getPriorityColor = (priority) => {
  const colors = {
    'LOW': 'bg-gray-100 text-gray-600 border-gray-200',
    'MEDIUM': 'bg-blue-100 text-blue-700 border-blue-200',
    'HIGH': 'bg-orange-100 text-orange-700 border-orange-200',
    'URGENT': 'bg-red-100 text-red-700 border-red-200'
  };
  return colors[priority] || 'bg-gray-100 text-gray-600 border-gray-200';
};

const getPriorityDisplayName = (priority) => {
  const priorityMap = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'URGENT': 'Urgent'
  };
  return priorityMap[priority] || priority || 'Low';
};

// ============================================================================
// Permission Check Helper
// ============================================================================
const can = (access, permission) => {
  return access?.effective?.includes(permission) || false;
};

// ============================================================================
// Main Component
// ============================================================================
const Support = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user,
    refreshToken
  } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [accessData, setAccessData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState({ visible: false, message: '', type: '' });
  
  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    limit: 20,
    has_more: false,
    next_before: null,
    next_before_id: null,
    total: 0
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  
  // Create ticket modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    body: '',
    priority: 'MEDIUM'
  });

  // ============================================================================
  // Fetch User Info & Access
  // ============================================================================
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
    }
  };

  const fetchAccessInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.ACCESS_ME_API, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        setAccessData(data);
        console.log('✅ Access info loaded:', data);
      } else {
        console.error('❌ Failed to fetch access info');
      }
    } catch (error) {
      console.error('❌ Error fetching access info:', error);
    }
  };

  // ============================================================================
  // Fetch Tickets with Pagination
  // ============================================================================
  const fetchTickets = useCallback(async (before = null, beforeId = null, isLoadMore = false) => {
    if (isLoadMore && loadingMore) return;
    
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let url = `${API_CONFIG.SUPPORT_TICKETS_API}?limit=${pagination.limit}`;
      
      // Add pagination parameters if provided
      if (before) url += `&before=${encodeURIComponent(before)}`;
      if (beforeId) url += `&before_id=${encodeURIComponent(beforeId)}`;
      
      // Add filters
      if (statusFilter !== 'All') url += `&status=${statusFilter}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      console.log('📤 Fetching support tickets:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Support tickets response:', data);
        
        // Handle response format
        let ticketsArray = data.tickets || data.data || [];
        if (!Array.isArray(ticketsArray)) ticketsArray = [];
        
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || ticketsArray.length;

        const transformedTickets = ticketsArray.map((ticket) => ({
          id: ticket.id,
          ticket_id: ticket.ticket_id || ticket.id,
          subject: ticket.subject || 'N/A',
          status: ticket.status || 'OPEN',
          priority: ticket.priority || 'MEDIUM',
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          created_by_user_id: ticket.created_by_user_id,
          messages: ticket.messages || [],
          message_count: ticket.message_count || (ticket.messages ? ticket.messages.length : 0),
          last_message_at: ticket.last_message_at,
          last_message_scope: ticket.last_message_scope,
          cpo_name: ticket.cpo_name,
          ...ticket
        }));

        console.log('📊 Transformed tickets:', transformedTickets.length);

        if (isLoadMore) {
          setTickets(prev => [...prev, ...transformedTickets]);
        } else {
          setTickets(transformedTickets);
        }

        setPagination({
          limit: pagination.limit,
          has_more: hasMore,
          next_before: nextBefore,
          next_before_id: nextBeforeId,
          total: total
        });
        
        setHasLoaded(true);
        setIsInitialLoad(false);
      } else if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token expired');
        setError('Session expired. Please refresh.');
        const newToken = await refreshToken();
        if (newToken) {
          fetchTickets(before, beforeId, isLoadMore);
          return;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch tickets:', response.status, errorData);
        setError(errorData.error?.message || 'Failed to fetch tickets');
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setError('An error occurred while fetching tickets');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.limit, refreshToken, statusFilter, searchQuery]);

  // ============================================================================
  // Fetch Ticket Detail
  // ============================================================================
  const fetchTicketDetail = useCallback(async (ticketId) => {
    if (!ticketId) return;
    
    setLoadingDetail(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = API_CONFIG.SUPPORT_TICKET_DETAIL_API(ticketId);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns the ticket directly or nested
        const ticket = data.ticket || data.data || data;
        setSelectedTicket(ticket);
        setShowDetailModal(true);
        setReplyText('');
        // Generate a new idempotency key for the reply
        setIdempotencyKey(`reply_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
      } else if (response.status === 401) {
        setError('Session expired. Please refresh.');
        const newToken = await refreshToken();
        if (newToken) {
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'X-CPO-App-ID': CPO_APP_ID,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            const ticket = data.ticket || data.data || data;
            setSelectedTicket(ticket);
            setShowDetailModal(true);
            setReplyText('');
            setIdempotencyKey(`reply_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
          }
        }
      } else if (response.status === 404) {
        setError('Ticket not found');
        showToastMessage('Ticket not found', 'error');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error?.message || 'Failed to fetch ticket details');
      }
    } catch (error) {
      console.error('❌ Error fetching ticket detail:', error);
      setError('An error occurred while fetching ticket details');
    } finally {
      setLoadingDetail(false);
    }
  }, [refreshToken]);

  // ============================================================================
  // Reply to Ticket
  // ============================================================================
  const replyToTicket = async () => {
    if (!replyText.trim()) {
      setError('Please enter a reply');
      return;
    }
    
    setSubmittingReply(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const ticketId = selectedTicket.id || selectedTicket.ticket_id;
      const url = API_CONFIG.SUPPORT_TICKET_REPLY_API(ticketId);
      
      const payload = {
        body: replyText.trim(),
        idempotency_key: idempotencyKey || `reply_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Reply sent:', data);
        setReplyText('');
        // Generate new idempotency key for next reply
        setIdempotencyKey(`reply_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
        
        // Refresh ticket detail - the response should contain the full ticket
        const updatedTicket = data.ticket || data.data || data;
        setSelectedTicket(updatedTicket);
        
        // Refresh tickets list
        fetchTickets();
        
        showToastMessage('Reply sent successfully!', 'success');
      } else if (response.status === 409) {
        // Idempotency conflict - reply already exists
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error?.message || 'This reply was already sent');
        showToastMessage('Reply already sent', 'info');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error?.message || 'Failed to send reply');
        showToastMessage(errorData.error?.message || 'Failed to send reply', 'error');
      }
    } catch (error) {
      console.error('❌ Error replying to ticket:', error);
      setError('An error occurred while sending the reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  // ============================================================================
  // Create Ticket
  // ============================================================================
  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.body.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setCreatingTicket(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        subject: newTicket.subject.trim(),
        body: newTicket.body.trim()
      };
      
      const response = await fetch(API_CONFIG.SUPPORT_TICKETS_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ticket created:', data);
        setShowCreateModal(false);
        setNewTicket({ subject: '', body: '', priority: 'MEDIUM' });
        fetchTickets();
        showToastMessage('Support ticket created successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error?.message || 'Failed to create ticket');
        showToastMessage(errorData.error?.message || 'Failed to create ticket', 'error');
      }
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      setError('An error occurred while creating the ticket');
    } finally {
      setCreatingTicket(false);
    }
  };

  // ============================================================================
  // Toast Message Helper
  // ============================================================================
  const showToastMessage = (message, type = 'success') => {
    setShowToast({ visible: true, message, type });
    setTimeout(() => {
      setShowToast({ visible: false, message: '', type: '' });
    }, 4000);
  };

  // ============================================================================
  // Load More Tickets
  // ============================================================================
  const loadMoreTickets = () => {
    if (pagination.has_more && !loadingMore && !loading) {
      fetchTickets(pagination.next_before, pagination.next_before_id, true);
    }
  };

  // ============================================================================
  // Handlers
  // ============================================================================
  const handleTicketClick = (ticketId) => {
    if (ticketId) {
      fetchTicketDetail(ticketId);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTicket(null);
    setReplyText('');
    setError('');
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewTicket({ subject: '', body: '', priority: 'MEDIUM' });
    setError('');
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
  
  const handleRefresh = () => {
    if (!loading) {
      setTickets([]);
      fetchTickets();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    const bootstrap = async () => {
      await fetchUserInfo();
      await fetchAccessInfo();
      await fetchTickets();
    };
    bootstrap();
  }, [isAuthenticated]);

  // ============================================================================
  // Filtered Tickets
  // ============================================================================
  const filteredTickets = useMemo(() => {
    let result = tickets;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ticket => {
        const idStr = String(ticket.id || ticket.ticket_id || '');
        const subjectStr = String(ticket.subject || '');
        const bodyStr = String(ticket.body || '');
        return (
          idStr.toLowerCase().includes(query) ||
          subjectStr.toLowerCase().includes(query) ||
          bodyStr.toLowerCase().includes(query)
        );
      });
    }
    
    return result;
  }, [tickets, searchQuery]);

  // ============================================================================
  // Check permissions
  // ============================================================================
  const canRead = can(accessData, 'support.read');
  const canCreate = can(accessData, 'support.create');
  const canReply = can(accessData, 'support.reply');

  // ============================================================================
  // Helper to truncate ID
  // ============================================================================
  const truncateId = (id) => {
    if (!id) return 'N/A';
    const strId = String(id);
    if (strId.length > 12) {
      return strId.substring(0, 12) + '...';
    }
    return strId;
  };

  // ============================================================================
  // Toast Component
  // ============================================================================
  const Toast = () => {
    if (!showToast.visible) return null;
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
    return (
      <div className={`fixed top-20 right-6 z-50 ${colors[showToast.type] || 'bg-blue-500'} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn`}>
        {showToast.type === 'success' && <CheckCircle className="w-5 h-5" />}
        {showToast.type === 'error' && <AlertCircle className="w-5 h-5" />}
        {showToast.type === 'info' && <Info className="w-5 h-5" />}
        <span>{showToast.message}</span>
      </div>
    );
  };

  // ============================================================================
  // Settings Menu
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
            {accessData?.role && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white border border-white/30">
                {accessData.role}
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
  // Add Menu
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
        {canCreate && (
          <button onClick={() => { setShowAddMenu(false); setShowCreateModal(true); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
            <Ticket size={18} className="text-gray-400" /> New Support Ticket
          </button>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // Filter Popup
  // ============================================================================
  const FilterPopup = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            Filters
          </h3>
          <button onClick={() => setShowFilterPopup(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="WAITING">Waiting</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowFilterPopup(false);
                setTickets([]);
                fetchTickets();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setStatusFilter('All');
                setSearchQuery('');
                setTickets([]);
                fetchTickets();
              }}
              className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // Create Ticket Modal
  // ============================================================================
  const CreateTicketModal = () => {
    const [localSubject, setLocalSubject] = useState('');
    const [localBody, setLocalBody] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
      if (showCreateModal) {
        setLocalSubject(newTicket.subject || '');
        setLocalBody(newTicket.body || '');
        setLocalError('');
      }
    }, [showCreateModal]);

    const handleCreateTicket = async () => {
      if (!localSubject.trim() || !localBody.trim()) {
        setLocalError('Please fill in all required fields');
        return;
      }
      
      setCreatingTicket(true);
      setLocalError('');
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_CONFIG.SUPPORT_TICKETS_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            subject: localSubject.trim(),
            body: localBody.trim()
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Ticket created:', data);
          setShowCreateModal(false);
          setNewTicket({ subject: '', body: '', priority: 'MEDIUM' });
          setLocalSubject('');
          setLocalBody('');
          fetchTickets();
          showToastMessage('Support ticket created successfully!', 'success');
        } else {
          const errorData = await response.json().catch(() => ({}));
          setLocalError(errorData.error?.message || 'Failed to create ticket');
        }
      } catch (error) {
        console.error('❌ Error creating ticket:', error);
        setLocalError('An error occurred while creating the ticket');
      } finally {
        setCreatingTicket(false);
      }
    };

    const handleClose = () => {
      setShowCreateModal(false);
      setNewTicket({ subject: '', body: '', priority: 'MEDIUM' });
      setLocalSubject('');
      setLocalBody('');
      setLocalError('');
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleClose}>
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Create Support Ticket</h3>
                <p className="text-sm text-white/80">Submit a new support request</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {localError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {localError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localSubject}
                  onChange={(e) => setLocalSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">{localSubject.length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={localBody}
                  onChange={(e) => setLocalBody(e.target.value)}
                  placeholder="Detailed description of your issue"
                  rows={6}
                  maxLength={10000}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{localBody.length}/10000</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={creatingTicket || !localSubject.trim() || !localBody.trim()}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingTicket ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Ticket size={18} />
                    Create Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // Ticket Detail Modal - Fixed reply textarea
  // ============================================================================
  const TicketDetailModal = () => {
    const replyTextareaRef = useRef(null);

    const isOpen = selectedTicket?.status === 'OPEN' || selectedTicket?.status === 'IN_PROGRESS' || selectedTicket?.status === 'PENDING';

    // Auto-focus the textarea when modal opens - but without interfering with cursor
    useEffect(() => {
      if (showDetailModal && isOpen && canReply) {
        // Small delay to let the modal render
        setTimeout(() => {
          if (replyTextareaRef.current) {
            replyTextareaRef.current.focus();
            // Set cursor at the end of the text
            const length = replyTextareaRef.current.value.length;
            replyTextareaRef.current.setSelectionRange(length, length);
          }
        }, 200);
      }
    }, [showDetailModal, isOpen, canReply]);

    if (!selectedTicket) return null;

    const messages = selectedTicket.messages || [];

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ticket Details</h3>
                <p className="text-sm text-white/80">
                  ID: {truncateId(selectedTicket.id || selectedTicket.ticket_id)}
                  {isOpen && (
                    <span className="ml-2 text-green-300 inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Open
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const ticketId = selectedTicket.id || selectedTicket.ticket_id;
                  if (ticketId) {
                    fetchTicketDetail(ticketId);
                  }
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
                title="Refresh"
              >
                <RefreshIcon size={18} className={loadingDetail ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={closeDetailModal}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loadingDetail ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-gray-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Ticket Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getTicketStatusColor(selectedTicket.status)}`}>
                      {getTicketStatusIcon(selectedTicket.status)}
                      {getTicketStatusDisplayName(selectedTicket.status)}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Messages</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">{messages.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                    <p className="text-sm font-medium text-emerald-600 mt-1">{formatDate(selectedTicket.created_at)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Last Activity</p>
                    <p className="text-sm font-medium text-amber-600 mt-1">{formatDate(selectedTicket.updated_at)}</p>
                  </div>
                </div>

                {/* Subject & Messages */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{selectedTicket.subject}</h4>
                  
                  {messages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
                  ) : (
                    messages.map((message, index) => {
                      const isCPO = message.author_scope === 'CPO';
                      return (
                        <div key={message.id || index} className={`mb-3 p-3 rounded-xl border ${isCPO ? 'bg-blue-50 border-blue-200 ml-4' : 'bg-white border-gray-200 mr-4'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">
                              {isCPO ? 'You (CPO)' : (message.author_scope || 'Support')}
                            </span>
                            <span className="text-xs text-gray-400">{formatDate(message.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.body}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Input - Fixed textarea behavior */}
                {isOpen && canReply ? (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Send size={16} />
                      Add Reply
                    </h4>
                    {error && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle size={14} />
                        {error}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <textarea
                        ref={replyTextareaRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={3}
                        maxLength={10000}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition resize-none"
                      />
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={replyToTicket}
                        disabled={submittingReply || !replyText.trim()}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
                      >
                        {submittingReply ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : isOpen && !canReply ? (
                  <div className="border-t border-gray-200 pt-4 text-center">
                    <p className="text-sm text-yellow-600">You don't have permission to reply to this ticket.</p>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 text-center">
                    <p className="text-sm text-gray-500">This ticket is closed. No further replies can be added.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // Loading State
  // ============================================================================
  if (isRefreshing && loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading support tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================
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
        <Toast />

        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <h1 className="text-2xl font-bold text-gray-800">
                Support Tickets
              </h1>

              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                / Dashboard
              </button>

              <span className="text-blue-600">/</span>
              <span className="text-blue-600 font-medium">
                Support
              </span>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
                title="Refresh"
              >
                {/* <RefreshCw size={20} className={loading ? 'animate-spin' : ''} /> */}
              </button>

              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats Card */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition group inline-flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                {pagination.total > 0 && (
                  <p className="text-xs text-gray-400">Total: {pagination.total}</p>
                )}
              </div>
              <div className="ml-4 flex items-center gap-3">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length} Resolved
                </span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  {tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} Open
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              {(statusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setSearchQuery('');
                    setTickets([]);
                    fetchTickets();
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center gap-1"
                >
                  <X size={12} />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === '') {
                      setTickets([]);
                      fetchTickets();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setTickets([]);
                      fetchTickets();
                    }
                  }}
                  className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56 bg-gray-50"
                />
              </div>
              <button
                onClick={() => setShowFilterPopup(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium text-gray-700"
              >
                <Filter size={16} className="text-gray-500" />
                Filter
              </button>
              {canCreate && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow-lg shadow-blue-500/25"
                >
                  <Plus size={16} />
                  New Ticket
                </button>
              )}
              {showFilterPopup && <FilterPopup />}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket ID</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Messages</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !hasLoaded && isInitialLoad ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-12 text-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">Loading tickets...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-gray-600">{error}</p>
                        <button
                          onClick={() => { setError(''); setTickets([]); fetchTickets(); }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-12 text-center">
                        <Ticket size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No Tickets Found</p>
                        <p className="text-sm text-gray-400 mt-1">No support tickets available.</p>
                        {canCreate && (
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto text-sm"
                          >
                            <Plus size={16} />
                            Create New Ticket
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket, index) => {
                      const isOpen = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';
                      const messageCount = ticket.message_count || ticket.messages?.length || 0;
                      return (
                        <tr 
                          key={ticket.id || ticket.ticket_id || index} 
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition cursor-pointer ${isOpen ? 'bg-blue-50/20' : ''}`}
                          onClick={() => handleTicketClick(ticket.id || ticket.ticket_id)}
                        >
                          <td className="px-3 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-3 py-3 text-sm font-mono text-gray-600">
                            {truncateId(ticket.id || ticket.ticket_id)}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700">
                            <div className="max-w-xs truncate">{ticket.subject}</div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-center">
                            {messageCount}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600">
                            {formatDate(ticket.created_at)}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTicketStatusColor(ticket.status)}`}>
                              {getTicketStatusIcon(ticket.status)}
                              {getTicketStatusDisplayName(ticket.status)}
                            </span>
                            {isOpen && (
                              <span className="ml-1 text-xs text-green-600">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <button
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTicketClick(ticket.id || ticket.ticket_id);
                              }}
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Load More */}
            {pagination.has_more && filteredTickets.length > 0 && !loading && (
              <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
                <button
                  onClick={loadMoreTickets}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {loadingMore ? (
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
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
              <span>
                {filteredTickets.length === 0 
                  ? 'No tickets available'
                  : `Showing ${filteredTickets.length} of ${tickets.length} tickets`
                }
                {pagination.total > 0 && (
                  <span className="ml-1">(Total: {pagination.total})</span>
                )}
              </span>
              {pagination.has_more && filteredTickets.length > 0 && (
                <span className="text-blue-600">Load more available</span>
              )}
              {!pagination.has_more && tickets.length > 0 && (
                <span className="text-gray-400">All tickets loaded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateTicketModal />}
      {showDetailModal && <TicketDetailModal />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Support;
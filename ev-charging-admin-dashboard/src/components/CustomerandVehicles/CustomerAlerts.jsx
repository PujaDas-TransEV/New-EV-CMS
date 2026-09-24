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
  Clock,
  Mail,
  Phone,
  ShieldAlert,
  CheckCheck,
  Send,
  MessageSquare,
  Lock
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// ---------------------------------------------------------------------------
// API Configuration
// ---------------------------------------------------------------------------
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  TICKETS_LIST_API: `${API_BASE_URL}/api/v1/cpo/customer-support/tickets`,
  TICKET_DETAIL_API: (ticketId) =>
    `${API_BASE_URL}/api/v1/cpo/customer-support/tickets/${ticketId}`,
  TICKET_REPLY_API: (ticketId) =>
    `${API_BASE_URL}/api/v1/cpo/customer-support/tickets/${ticketId}/replies`,
  TICKET_STATUS_API: (ticketId) =>
    `${API_BASE_URL}/api/v1/cpo/customer-support/tickets/${ticketId}/status`
};

// ---------------------------------------------------------------------------
// CONFIG — status / priority visual styling
// ---------------------------------------------------------------------------
const PRIORITY_CONFIG = {
  urgent: {
    label: 'Urgent',
    icon: AlertTriangle,
    badge: 'bg-red-100 text-red-700 border-red-200',
    iconBox: 'bg-red-50 text-red-600',
    leftBorder: 'border-l-red-500'
  },
  high: {
    label: 'High',
    icon: AlertCircle,
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    iconBox: 'bg-amber-50 text-amber-600',
    leftBorder: 'border-l-amber-500'
  },
  medium: {
    label: 'Medium',
    icon: Info,
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBox: 'bg-blue-50 text-blue-600',
    leftBorder: 'border-l-blue-500'
  },
  low: {
    label: 'Low',
    icon: Info,
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    iconBox: 'bg-gray-50 text-gray-500',
    leftBorder: 'border-l-gray-300'
  }
};

const STATUS_CONFIG = {
  open: { label: 'Open', badge: 'bg-red-50 text-red-600 border-red-200', next: 'in_progress' },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-blue-50 text-blue-600 border-blue-200',
    next: 'resolved'
  },
  resolved: {
    label: 'Resolved',
    badge: 'bg-green-50 text-green-600 border-green-200',
    next: 'closed'
  },
  closed: { label: 'Closed', badge: 'bg-gray-100 text-gray-500 border-gray-200', next: null }
};

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];
const TICKETS_PER_PAGE = 6;

// ---------------------------------------------------------------------------
// Helpers to normalise whatever shape the backend returns
// ---------------------------------------------------------------------------
const mapTicket = (raw) => ({
  id: raw.ticket_id || raw.id || raw._id || 'N/A',
  subject: raw.subject || raw.title || 'Support Ticket',
  description: raw.description || raw.message || raw.body || '',
  status: (raw.status || 'open').toLowerCase(),
  priority: (raw.priority || raw.severity || 'medium').toLowerCase(),
  customer: {
    id: raw.customer?.id || raw.customer_id || 'N/A',
    name: raw.customer?.name || raw.customer_name || 'Unknown Customer',
    email: raw.customer?.email || raw.customer_email || '',
    phone: raw.customer?.phone || raw.customer_phone || ''
  },
  created_at: raw.created_at || raw.createdAt || null,
  updated_at: raw.updated_at || raw.updatedAt || null,
  reply_count: raw.reply_count ?? raw.replies?.length ?? 0,
  replies: raw.replies || [],
  raw
});

const CustomerAlerts = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');

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
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.TICKETS_LIST_API, {
        method: 'GET'
      });

      if (!response.ok) {
        let msg = `Failed to load tickets (${response.status})`;
        try {
          const errBody = await response.json();
          msg = errBody.message || errBody.detail || msg;
        } catch (_) {
          /* ignore parse error */
        }
        setError(msg);
        setTickets([]);
        return;
      }

      const data = await response.json();
      const rawList = data.tickets || data.data || data.results || (Array.isArray(data) ? data : []);
      setTickets(Array.isArray(rawList) ? rawList.map(mapTicket) : []);
    } catch (err) {
      console.error('Error fetching customer support tickets:', err);
      setError('Could not reach the server. Please try again.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  const fetchTicketDetail = useCallback(
    async (ticketId) => {
      setTicketDetailLoading(true);
      try {
        const response = await authenticatedRequest(API_CONFIG.TICKET_DETAIL_API(ticketId), {
          method: 'GET'
        });
        if (response.ok) {
          const data = await response.json();
          const detail = mapTicket(data.ticket || data.data || data);
          setSelectedTicket(detail);
          // keep list row in sync (e.g. reply_count, replies)
          setTickets((prev) => prev.map((t) => (t.id === ticketId ? detail : t)));
        }
      } catch (err) {
        console.error('Error fetching ticket detail:', err);
      } finally {
        setTicketDetailLoading(false);
      }
    },
    [authenticatedRequest]
  );

  // -------------------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------------------
  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    setReplyError('');
    fetchTicketDetail(ticket.id);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.TICKET_STATUS_API(ticketId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        console.warn('Status update failed on server, not updating UI');
        return;
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      setSelectedTicket((prev) => (prev && prev.id === ticketId ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error('Error updating ticket status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    setReplyError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.TICKET_REPLY_API(ticketId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() })
      });

      if (!response.ok) {
        let msg = 'Failed to send reply.';
        try {
          const errBody = await response.json();
          msg = errBody.message || errBody.detail || msg;
        } catch (_) {
          /* ignore */
        }
        setReplyError(msg);
        return;
      }

      setReplyText('');
      // Refresh the ticket detail so the new reply shows up
      await fetchTicketDetail(ticketId);
    } catch (err) {
      console.error('Error sending reply:', err);
      setReplyError('Could not reach the server. Please try again.');
    } finally {
      setIsSendingReply(false);
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
    if (Number.isNaN(date.getTime())) return 'N/A';
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
    if (Number.isNaN(diff)) return '';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // -------------------------------------------------------------------------
  // FILTER + PAGINATION
  // -------------------------------------------------------------------------
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        ticket.subject?.toLowerCase().includes(q) ||
        ticket.description?.toLowerCase().includes(q) ||
        ticket.id?.toString().toLowerCase().includes(q) ||
        ticket.customer?.name?.toLowerCase().includes(q);

      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tickets, searchQuery, priorityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / TICKETS_PER_PAGE));
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      inProgress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length
    };
  }, [tickets]);

  const priorityCounts = useMemo(() => {
    return {
      all: tickets.length,
      urgent: tickets.filter((t) => t.priority === 'urgent').length,
      high: tickets.filter((t) => t.priority === 'high').length,
      medium: tickets.filter((t) => t.priority === 'medium').length,
      low: tickets.filter((t) => t.priority === 'low').length
    };
  }, [tickets]);

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
          <Activity size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Ticket Detail Modal
  const TicketDetailModal = ({ ticket, onClose }) => {
    if (!ticket) return null;
    const pr = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
    const st = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
    const PrIcon = pr.icon;
    const isClosed = ticket.status === 'closed';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${pr.iconBox}`}>
                <PrIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">{ticket.subject}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${pr.badge}`}>
                    {pr.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.badge}`}>
                    {st.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">{ticket.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal body */}
          <div className="p-6 space-y-5">
            {ticketDetailLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {ticket.description || 'No description provided.'}
                  </p>
                </div>

                {/* Customer */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Customer
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {ticket.customer?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{ticket.customer?.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{ticket.customer?.id}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{ticket.customer?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{ticket.customer?.phone || 'N/A'}</span>
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
                      <span className="text-gray-500 w-24">Created</span>
                      <span className="text-gray-800 font-medium">{formatDateTime(ticket.created_at)}</span>
                    </div>
                    {ticket.updated_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCheck size={15} className="text-green-500 flex-shrink-0" />
                        <span className="text-gray-500 w-24">Last updated</span>
                        <span className="text-gray-800 font-medium">{formatDateTime(ticket.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <MessageSquare size={14} /> Replies ({ticket.replies?.length || 0})
                  </p>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {(ticket.replies || []).length === 0 ? (
                      <p className="text-sm text-gray-400">No replies yet.</p>
                    ) : (
                      ticket.replies.map((r, idx) => (
                        <div key={r.id || idx} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-blue-700">
                              {r.author_name || r.sender || 'CPO Support'}
                            </span>
                            <span className="text-[11px] text-gray-400">{formatDateTime(r.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.message || r.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply composer */}
                  {!isClosed ? (
                    <div className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a reply to the customer..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                      />
                      {replyError && (
                        <p className="text-xs text-red-600 mt-1">{replyError}</p>
                      )}
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleSendReply(ticket.id)}
                          disabled={isSendingReply || !replyText.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                        >
                          {isSendingReply ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                          Send Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
                      <Lock size={12} /> This ticket is closed and no longer accepts replies.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Modal footer — status actions */}
          <div className="flex items-center gap-3 p-6 border-t border-gray-100">
            {st.next && (
              <button
                onClick={() => handleStatusChange(ticket.id, st.next)}
                disabled={isUpdatingStatus}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Mark as {STATUS_CONFIG[st.next].label}
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
                  <p className="text-sm text-gray-500">Total Tickets</p>
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
                  <p className="text-sm text-gray-500">Open</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.open}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolved / Closed</p>
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
              {/* Priority pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'urgent', label: 'Urgent' },
                  { key: 'high', label: 'High' },
                  { key: 'medium', label: 'Medium' },
                  { key: 'low', label: 'Low' }
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPriorityFilter(p.key)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition border ${
                      priorityFilter === p.key
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                    <span className="ml-1.5 text-xs opacity-70">{priorityCounts[p.key]}</span>
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
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh */}
              <button
                onClick={fetchTickets}
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
                  placeholder="Search tickets, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* TICKETS LIST */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </span>
              <button
                onClick={fetchTickets}
                className="text-sm font-medium underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No Tickets Found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || priorityFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search'
                  : 'All clear — no customer support tickets right now'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedTickets.map((ticket) => {
                  const pr = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
                  const st = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                  const PrIcon = pr.icon;

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${pr.leftBorder} shadow-sm hover:shadow-md transition-all cursor-pointer`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${pr.iconBox}`}>
                              <PrIcon className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${pr.badge}`}>
                                  {pr.label}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.badge}`}>
                                  {st.label}
                                </span>
                              </div>

                              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{ticket.description}</p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1.5">
                                  <User size={13} className="text-gray-400" />
                                  {ticket.customer?.name || 'Unknown'}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MessageSquare size={13} className="text-gray-400" />
                                  {ticket.reply_count} {ticket.reply_count === 1 ? 'reply' : 'replies'}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock size={13} className="text-gray-400" />
                                  {timeAgo(ticket.created_at)}
                                </span>
                                <span className="font-mono text-gray-400">{ticket.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {st.next && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(ticket.id, st.next);
                                }}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                title={`Mark as ${STATUS_CONFIG[st.next].label}`}
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTicket(ticket);
                              }}
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
                      {(currentPage - 1) * TICKETS_PER_PAGE + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-gray-700">
                      {Math.min(currentPage * TICKETS_PER_PAGE, filteredTickets.length)}
                    </span>{' '}
                    of <span className="font-medium text-gray-700">{filteredTickets.length}</span> tickets
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

      {/* TICKET DETAIL MODAL */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => {
            setSelectedTicket(null);
            setReplyText('');
            setReplyError('');
          }}
        />
      )}
    </div>
  );
};

export default CustomerAlerts;

// src/components/UserAccess/UserAccess.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Key,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Save,
  Power,
  PowerOff,
  Check,
  AlertTriangle as AlertTriangleIcon,
  Mail,
  Crown as CrownIcon2,
  UserCog,
  ShieldCheck,
  HelpCircle,
  CalendarDays as CalendarDaysIcon,
  RotateCcw,
  UserRound
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  PERMISSIONS_CATALOG: `${API_BASE_URL}/api/v1/cpo/permissions/catalog`,
  STAFF_LIST: `${API_BASE_URL}/api/v1/cpo/staff`,
  STAFF_CREATE: `${API_BASE_URL}/api/v1/cpo/staff`,
  STAFF_DETAIL: (membershipId) => `${API_BASE_URL}/api/v1/cpo/staff/${membershipId}`,
  STAFF_UPDATE: (membershipId) => `${API_BASE_URL}/api/v1/cpo/staff/${membershipId}`,
  STAFF_ACTIVATE: (membershipId) => `${API_BASE_URL}/api/v1/cpo/staff/${membershipId}/activate`,
  STAFF_SUSPEND: (membershipId) => `${API_BASE_URL}/api/v1/cpo/staff/${membershipId}/suspend`,
  STAFF_REVOKE: (membershipId) => `${API_BASE_URL}/api/v1/cpo/staff/${membershipId}/revoke`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  ACCESS_ME_API: `${API_BASE_URL}/api/v1/cpo/access/me`
};

// Permission check helper
const can = (access, permission) => {
  return access?.effective?.includes(permission) || false;
};

// Status color mapping
const getStatusColor = (status) => {
  const colors = {
    'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
    'SUSPENDED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'REVOKED': 'bg-red-100 text-red-700 border-red-200',
    'PENDING': 'bg-blue-100 text-blue-700 border-blue-200',
    'INACTIVE': 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status) => {
  const statusUpper = status?.toUpperCase() || '';
  switch(statusUpper) {
    case 'ACTIVE':
      return <UserCheck className="w-3 h-3" />;
    case 'SUSPENDED':
      return <UserMinus className="w-3 h-3" />;
    case 'REVOKED':
      return <UserX className="w-3 h-3" />;
    case 'PENDING':
      return <Clock className="w-3 h-3" />;
    default:
      return <User className="w-3 h-3" />;
  }
};

const getStatusDisplayName = (status) => {
  const statusMap = {
    'ACTIVE': 'Active',
    'SUSPENDED': 'Suspended',
    'REVOKED': 'Revoked',
    'PENDING': 'Pending',
    'INACTIVE': 'Inactive'
  };
  return statusMap[status] || status || 'Unknown';
};

// Role badge color
const getRoleBadgeColor = (role) => {
  const colors = {
    'ADMIN': 'bg-purple-100 text-purple-700 border-purple-200',
    'STAFF': 'bg-blue-100 text-blue-700 border-blue-200',
    'VIEWER': 'bg-gray-100 text-gray-700 border-gray-200',
    'OPERATOR': 'bg-green-100 text-green-700 border-green-200'
  };
  return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const UserAccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  
  // Staff state
  const [staffMembers, setStaffMembers] = useState([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState([]);
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
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionReason, setActionReason] = useState('');
  
  // Action loading states
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Permissions
  const canReadStaff = can(accessData, 'staff.read');
  const canManageStaff = can(accessData, 'staff.manage');
  const canManagePermissions = can(accessData, 'staff.permissions.manage');

  // Check if returning from add-staff page
  useEffect(() => {
    if (location.state?.refresh) {
      fetchStaff();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  // Fetch user info
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

  // Fetch access info
  const fetchAccessInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.ACCESS_ME_API, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        setAccessData(data);
        console.log('✅ Access info loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching access info:', error);
    }
  };

  // Fetch permissions catalog
  const fetchPermissionsCatalog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.PERMISSIONS_CATALOG, {
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
        let permissions = [];
        if (Array.isArray(data)) {
          permissions = data;
        } else if (data.permissions) {
          permissions = data.permissions;
        } else if (data.data) {
          permissions = data.data;
        }
        setPermissionsCatalog(permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions catalog:', error);
    }
  };

  // Fetch staff members
  const fetchStaff = useCallback(async (before = null, beforeId = null, isLoadMore = false) => {
    if (isLoadMore && loadingMore) return;
    
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let url = `${API_CONFIG.STAFF_LIST}?limit=${pagination.limit}`;
      
      if (before) url += `&next_before=${encodeURIComponent(before)}`;
      if (beforeId) url += `&next_before_id=${encodeURIComponent(beforeId)}`;
      
      if (statusFilter !== 'All') url += `&status=${statusFilter}`;
      if (roleFilter !== 'All') url += `&role=${roleFilter}`;

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
        
        let staffArray = data;
        let hasMore = false;
        let nextBefore = null;
        let nextBeforeId = null;
        let total = staffArray.length;
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          staffArray = data.staff || data.data || [];
          hasMore = data.has_more || false;
          nextBefore = data.next_before || null;
          nextBeforeId = data.next_before_id || null;
          total = data.total || staffArray.length;
        } else if (Array.isArray(data)) {
          staffArray = data;
          hasMore = data.length >= pagination.limit;
        }
        
        if (!Array.isArray(staffArray)) staffArray = [];

        const transformedStaff = staffArray.map((member) => {
          const userObj = member.user || {};
          const statusValue = member.membership_status || member.status || 'ACTIVE';
          
          return {
            id: member.id || member.membership_id,
            membership_id: member.membership_id || member.id,
            user_id: userObj.id || member.user_id || 'N/A',
            user_name: userObj.full_name || userObj.name || member.user_name || 'N/A',
            user_email: userObj.email || member.user_email || 'N/A',
            role: userObj.role || member.role || 'STAFF',
            status: statusValue,
            membership_status: statusValue,
            overrides: member.overrides || [],
            created_at: userObj.created_at || member.created_at || member.createdAt,
            updated_at: userObj.updated_at || member.updated_at || member.updatedAt,
            is_primary: member.is_primary_admin || member.is_primary || false,
            is_primary_admin: member.is_primary_admin || false,
            user: userObj,
            ...member
          };
        });

        if (isLoadMore) {
          setStaffMembers(prev => [...prev, ...transformedStaff]);
        } else {
          setStaffMembers(transformedStaff);
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
        const newToken = await refreshToken();
        if (newToken) {
          fetchStaff(before, beforeId, isLoadMore);
          return;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch staff members');
      }
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      setError('An error occurred while fetching staff members');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.limit, refreshToken, statusFilter, roleFilter]);

  // Fetch single staff member detail
  const fetchStaffDetail = useCallback(async (membershipId) => {
    if (!membershipId) return;
    
    setLoadingDetail(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = API_CONFIG.STAFF_DETAIL(membershipId);
      
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
        const member = data.staff || data.data || data;
        setSelectedMember(member);
        setShowDetailModal(true);
      } else if (response.status === 401) {
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
            const member = data.staff || data.data || data;
            setSelectedMember(member);
            setShowDetailModal(true);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch staff details');
      }
    } catch (error) {
      console.error('❌ Error fetching staff detail:', error);
      setError('An error occurred while fetching staff details');
    } finally {
      setLoadingDetail(false);
    }
  }, [refreshToken]);

  // Activate staff member
  const activateStaff = async (membershipId, reason = '') => {
    if (!membershipId) return;
    
    setActionLoading(true);
    setSelectedActionId(membershipId);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = API_CONFIG.STAFF_ACTIVATE(membershipId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Activated by admin' })
      });

      if (response.ok) {
        await fetchStaff();
        if (showDetailModal) {
          await fetchStaffDetail(membershipId);
        }
        setShowReasonModal(false);
        setActionReason('');
        setPendingAction(null);
        showToastMessage('Staff member activated successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to activate staff member');
      }
    } catch (error) {
      console.error('❌ Error activating staff:', error);
      setError('An error occurred while activating the staff member');
    } finally {
      setActionLoading(false);
      setSelectedActionId(null);
    }
  };

  // Suspend staff member
  const suspendStaff = async (membershipId, reason = '') => {
    if (!membershipId) return;
    
    setActionLoading(true);
    setSelectedActionId(membershipId);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = API_CONFIG.STAFF_SUSPEND(membershipId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Suspended by admin' })
      });

      if (response.ok) {
        await fetchStaff();
        if (showDetailModal) {
          await fetchStaffDetail(membershipId);
        }
        setShowReasonModal(false);
        setActionReason('');
        setPendingAction(null);
        showToastMessage('Staff member suspended successfully!', 'info');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to suspend staff member');
      }
    } catch (error) {
      console.error('❌ Error suspending staff:', error);
      setError('An error occurred while suspending the staff member');
    } finally {
      setActionLoading(false);
      setSelectedActionId(null);
    }
  };

  // Revoke staff member
  const revokeStaff = async (membershipId, reason = '') => {
    if (!membershipId) return;
    
    if (!window.confirm('Are you sure you want to revoke this staff member? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    setSelectedActionId(membershipId);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = API_CONFIG.STAFF_REVOKE(membershipId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Revoked by admin' })
      });

      if (response.ok) {
        await fetchStaff();
        if (showDetailModal) {
          setShowDetailModal(false);
          setSelectedMember(null);
        }
        setShowReasonModal(false);
        setActionReason('');
        setPendingAction(null);
        showToastMessage('Staff member revoked successfully!', 'error');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to revoke staff member');
      }
    } catch (error) {
      console.error('❌ Error revoking staff:', error);
      setError('An error occurred while revoking the staff member');
    } finally {
      setActionLoading(false);
      setSelectedActionId(null);
    }
  };

  // Toast message
  const showToastMessage = (message, type = 'success') => {
    setShowToast({ visible: true, message, type });
    setTimeout(() => {
      setShowToast({ visible: false, message: '', type: '' });
    }, 4000);
  };

  // Handle action with reason modal
  const handleActionWithReason = (action, membershipId) => {
    setPendingAction({ action, membershipId });
    setActionReason('');
    setShowReasonModal(true);
  };

  // Confirm action with reason
  const confirmActionWithReason = () => {
    if (!pendingAction) return;
    
    const { action, membershipId } = pendingAction;
    const reason = actionReason.trim() || `${action.charAt(0).toUpperCase() + action.slice(1)} by admin`;
    
    if (action === 'activate') {
      activateStaff(membershipId, reason);
    } else if (action === 'suspend') {
      suspendStaff(membershipId, reason);
    } else if (action === 'revoke') {
      revokeStaff(membershipId, reason);
    }
  };

  const loadMoreStaff = () => {
    if (pagination.has_more && !loadingMore && !loading) {
      fetchStaff(pagination.next_before, pagination.next_before_id, true);
    }
  };

  const handleMemberClick = (membershipId) => {
    if (membershipId && canReadStaff) {
      fetchStaffDetail(membershipId);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedMember(null);
    setError('');
  };

  const handleEdit = (member) => {
    if (canManagePermissions) {
      navigate('/add-staff', { state: { editData: member, returnTo: '/user-access' } });
    } else {
      showToastMessage('You don\'t have permission to edit staff', 'error');
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
  
  const handleRefresh = () => {
    if (!loading) {
      setStaffMembers([]);
      fetchStaff();
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

  // Initial fetch
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    const bootstrap = async () => {
      await fetchUserInfo();
      await fetchAccessInfo();
      await fetchPermissionsCatalog();
      await fetchStaff();
    };
    bootstrap();
  }, [isAuthenticated]);

  // Filter staff based on search
  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffMembers;
    const query = searchQuery.toLowerCase();
    return staffMembers.filter(member => {
      const idStr = String(member.id || member.membership_id || '');
      const userNameStr = String(member.user_name || '');
      const userEmailStr = String(member.user_email || '');
      const roleStr = String(member.role || '');
      
      return (
        idStr.toLowerCase().includes(query) ||
        userNameStr.toLowerCase().includes(query) ||
        userEmailStr.toLowerCase().includes(query) ||
        roleStr.toLowerCase().includes(query)
      );
    });
  }, [staffMembers, searchQuery]);

  // Helper to truncate ID
  const truncateId = (id) => {
    if (!id) return 'N/A';
    const strId = String(id);
    if (strId.length > 12) {
      return strId.substring(0, 12) + '...';
    }
    return strId;
  };

  // Toast Component
  const Toast = () => {
    if (!showToast.visible) return null;
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-yellow-500'
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

  // Settings Dropdown Menu
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

  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-64 shadow-2xl border border-gray-100 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
        {canManageStaff && canManagePermissions && (
          <button onClick={() => { setShowAddMenu(false); navigate("/add-staff"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
            <UserPlus size={18} className="text-gray-400" /> Add Staff Member
          </button>
        )}
      </div>
    </div>
  );

  // Filter Popup
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
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REVOKED">Revoked</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operator</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowFilterPopup(false);
                fetchStaff();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setStatusFilter('All');
                setRoleFilter('All');
                setSearchQuery('');
                fetchStaff();
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

  // Reason Modal
  const ReasonModal = () => {
    const textareaRef = useRef(null);

    useEffect(() => {
      if (showReasonModal) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 100);
      }
    }, [showReasonModal]);

    if (!showReasonModal || !pendingAction) return null;

    const actionName = pendingAction.action.charAt(0).toUpperCase() + pendingAction.action.slice(1);
    const actionColors = {
      activate: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/25',
      suspend: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-yellow-500/25',
      revoke: 'from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/25'
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{actionName} Staff Member</h3>
                <p className="text-sm text-white/80">Please provide a reason for this action</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowReasonModal(false);
                setActionReason('');
                setPendingAction(null);
                setError('');
              }}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Enter reason for ${pendingAction.action}...`}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {actionReason.length}/500 characters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setActionReason('');
                  setPendingAction(null);
                  setError('');
                }}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmActionWithReason}
                disabled={actionLoading || !actionReason.trim()}
                className={`flex-1 px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${actionColors[pendingAction.action] || 'from-blue-500 to-indigo-500'}`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Confirm {actionName}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Staff Detail Modal
  const StaffDetailModal = () => {
    if (!selectedMember) return null;

    const statusValue = selectedMember.membership_status || selectedMember.status || 'ACTIVE';
    const isActive = statusValue === 'ACTIVE';
    const isSuspended = statusValue === 'SUSPENDED';
    const isPrimary = selectedMember.is_primary_admin || selectedMember.is_primary || false;
    const user = selectedMember.user || {};
    const overrides = selectedMember.overrides || [];
    const createdAt = selectedMember.created_at || user.created_at;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Staff Details</h3>
                <p className="text-sm text-white/80">
                  {user.full_name || user.name || selectedMember.user_name || 'N/A'}
                  {isActive && (
                    <span className="ml-2 text-green-300 inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  )}
                  {isPrimary && (
                    <span className="ml-2 text-yellow-300 inline-flex items-center gap-1">
                      <CrownIcon2 size={14} />
                      Primary Admin
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={closeDetailModal}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              <X size={20} />
            </button>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(statusValue)}`}>
                      {getStatusIcon(statusValue)}
                      {getStatusDisplayName(statusValue)}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getRoleBadgeColor(selectedMember.role || user.role)}`}>
                      {selectedMember.role || user.role || 'STAFF'}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Primary Admin</p>
                    <p className="text-lg font-bold text-emerald-600 mt-1">{isPrimary ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                    <p className="text-sm font-medium text-amber-600 mt-1 flex items-center gap-1">
                      <CalendarDaysIcon size={14} className="text-amber-500" />
                      {formatDate(createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">User Information</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name</span>
                        <span className="text-gray-900 font-medium">{user.full_name || user.name || selectedMember.user_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email</span>
                        <span className="text-gray-900 font-medium">{user.email || selectedMember.user_email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">User ID</span>
                        <span className="font-mono text-gray-900 text-xs">{user.id || selectedMember.user_id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Permissions / Overrides</p>
                    {overrides && overrides.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {overrides.map((override, idx) => {
                          const displayName = typeof override === 'string' ? override : 
                            (override.name || override.key || override.permission || JSON.stringify(override));
                          return (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {displayName}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No overrides</p>
                    )}
                  </div>
                </div>

                {!isPrimary && canManageStaff && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      {isSuspended && (
                        <button
                          onClick={() => {
                            closeDetailModal();
                            handleActionWithReason('activate', selectedMember.id || selectedMember.membership_id);
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-sm shadow-md shadow-green-500/25"
                        >
                          <RotateCcw size={16} />
                          Activate Staff
                        </button>
                      )}
                      {isActive && (
                        <>
                          <button
                            onClick={() => {
                              closeDetailModal();
                              handleActionWithReason('suspend', selectedMember.id || selectedMember.membership_id);
                            }}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition flex items-center gap-2 text-sm shadow-md shadow-yellow-500/25"
                          >
                            <Lock size={16} />
                            Suspend Staff
                          </button>
                          {canManagePermissions && (
                            <button
                              onClick={() => {
                                handleEdit(selectedMember);
                                closeDetailModal();
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 text-sm shadow-md shadow-blue-500/25"
                            >
                              <Edit size={16} />
                              Edit Role & Permissions
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => {
                          closeDetailModal();
                          handleActionWithReason('revoke', selectedMember.id || selectedMember.membership_id);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2 text-sm shadow-md shadow-red-500/25"
                      >
                        <Trash2 size={16} />
                        Revoke Access
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isRefreshing && loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff members...</p>
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
        <Toast />

        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <h1 className="text-2xl font-bold text-gray-800">
                User Access Control
              </h1>

              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                / Dashboard
              </button>

              <span className="text-blue-600">/</span>
              <span className="text-blue-600 font-medium">
                User Access
              </span>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
                title="Refresh"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{staffMembers.length}</p>
                {pagination.total > 0 && (
                  <p className="text-xs text-gray-400">Total: {pagination.total}</p>
                )}
              </div>
              <div className="ml-4 flex items-center gap-3">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {staffMembers.filter(m => m.status === 'ACTIVE' || m.membership_status === 'ACTIVE').length} Active
                </span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  {staffMembers.filter(m => m.status === 'SUSPENDED' || m.membership_status === 'SUSPENDED').length} Suspended
                </span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {staffMembers.filter(m => m.status === 'REVOKED' || m.membership_status === 'REVOKED').length} Revoked
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              {(statusFilter !== 'All' || roleFilter !== 'All') && (
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setRoleFilter('All');
                    setSearchQuery('');
                    fetchStaff();
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
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {canManageStaff && canManagePermissions && (
                <button
                  onClick={() => navigate('/add-staff')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow-lg shadow-blue-500/25"
                >
                  <UserPlus size={16} />
                  Add Staff
                </button>
              )}
              {showFilterPopup && <FilterPopup />}
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Permissions</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !hasLoaded && isInitialLoad ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-12 text-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">Loading staff members...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-gray-600">{error}</p>
                        <button
                          onClick={() => { setError(''); fetchStaff(); }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-12 text-center">
                        <Users size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No Staff Members Found</p>
                        <p className="text-sm text-gray-400 mt-1">No staff members available.</p>
                        {canManageStaff && canManagePermissions && (
                          <button
                            onClick={() => navigate('/add-staff')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto text-sm"
                          >
                            <UserPlus size={16} />
                            Add Staff Member
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((member, index) => {
                      const statusValue = member.status || member.membership_status || 'ACTIVE';
                      const isActive = statusValue === 'ACTIVE';
                      const isSuspended = statusValue === 'SUSPENDED';
                      const isPrimary = member.is_primary_admin || member.is_primary || false;
                      const overrideCount = member.overrides?.length || 0;
                      
                      return (
                        <tr 
                          key={member.id || member.membership_id || index} 
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition cursor-pointer ${isActive ? 'bg-green-50/10' : ''}`}
                          onClick={() => handleMemberClick(member.id || member.membership_id)}
                        >
                          <td className="px-3 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-3 py-3 text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{member.user_name || 'N/A'}</span>
                              <span className="text-xs text-gray-400">{member.user_email || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                              {member.role || 'STAFF'}
                            </span>
                            {isPrimary && (
                              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700">
                                <CrownIcon2 size={10} className="inline mr-0.5" />
                                Primary
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusValue)}`}>
                              {getStatusIcon(statusValue)}
                              {getStatusDisplayName(statusValue)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-center">
                            {overrideCount > 0 ? (
                              <span className="text-blue-600 font-medium">{overrideCount}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600">
                            {formatDate(member.created_at)}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              {!isPrimary && canManageStaff && (
                                <>
                                  {isSuspended && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionWithReason('activate', member.id || member.membership_id);
                                      }}
                                      disabled={actionLoading && selectedActionId === (member.id || member.membership_id)}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition flex items-center gap-1"
                                      title="Activate Staff"
                                    >
                                      <RotateCcw size={16} />
                                      <span className="text-xs hidden sm:inline">Activate</span>
                                    </button>
                                  )}
                                  {isActive && (
                                    <>
                                      {canManagePermissions && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(member);
                                          }}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1"
                                          title="Edit Staff"
                                        >
                                          <Edit size={16} />
                                          <span className="text-xs hidden sm:inline">Edit</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleActionWithReason('suspend', member.id || member.membership_id);
                                        }}
                                        disabled={actionLoading && selectedActionId === (member.id || member.membership_id)}
                                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition flex items-center gap-1"
                                        title="Suspend Staff"
                                      >
                                        <Lock size={16} />
                                        <span className="text-xs hidden sm:inline">Suspend</span>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleActionWithReason('revoke', member.id || member.membership_id);
                                    }}
                                    disabled={actionLoading && selectedActionId === (member.id || member.membership_id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                                    title="Revoke Access"
                                  >
                                    <Trash2 size={16} />
                                    <span className="text-xs hidden sm:inline">Revoke</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMemberClick(member.id || member.membership_id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1"
                                title="View Details"
                              >
                                <Eye size={16} />
                                <span className="text-xs hidden sm:inline">View</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Load More */}
            {pagination.has_more && filteredStaff.length > 0 && (
              <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
                <button
                  onClick={loadMoreStaff}
                  disabled={loadingMore || loading}
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
                {filteredStaff.length === 0 
                  ? 'No staff members available'
                  : `Showing ${filteredStaff.length} of ${staffMembers.length} staff members`
                }
                {pagination.total > 0 && (
                  <span className="ml-1">(Total: {pagination.total})</span>
                )}
              </span>
              {pagination.has_more && filteredStaff.length > 0 && (
                <span className="text-blue-600">Load more available</span>
              )}
              {!pagination.has_more && staffMembers.length > 0 && (
                <span className="text-gray-400">All staff loaded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReasonModal />
      {showDetailModal && <StaffDetailModal />}

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

export default UserAccess;
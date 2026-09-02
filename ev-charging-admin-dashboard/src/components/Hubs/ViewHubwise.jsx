// src/components/Hubs/ViewHubwise.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
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
  Table,
  Columns,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  QrCode,
  Plug,
  Wrench,
  Settings as SettingsIcon,
  Battery,
  Cpu,
  Gauge as GaugeIcon,
  RadioTower,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  HUB_DETAILS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  HUB_CHARGERS_API: (hubId) => `${API_BASE_URL}/api/v1/cpo/hubs/${hubId}/chargers`,
  CHARGER_STATUS_API: (chargerId) => `${API_BASE_URL}/api/v1/cpo/chargers/${chargerId}/status`,
  HUB_VISIBILITY_API: (hubId) => `${API_BASE_URL}/api/v1/cpo/hubs/${hubId}/customer-visibility`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const HubDetails = () => {
  const navigate = useNavigate();
  const { hubId } = useParams();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hub data state
  const [hubData, setHubData] = useState(null);
  const [hubLoading, setHubLoading] = useState(false);
  const [hubError, setHubError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Chargers state
  const [chargers, setChargers] = useState([]);
  const [chargersLoading, setChargersLoading] = useState(false);
  const [chargerSearchTerm, setChargerSearchTerm] = useState('');
  const [selectedChargerIds, setSelectedChargerIds] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Charger details modal state
  const [showChargerModal, setShowChargerModal] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState(null);
  
  // All chargers for assignment (only unassigned)
  const [allChargers, setAllChargers] = useState([]);
  const [allChargersLoading, setAllChargersLoading] = useState(false);
  const [allChargersPagination, setAllChargersPagination] = useState({
    before: null,
    before_id: null,
    limit: 50,
    has_more: false,
    total: 0
  });
  const [loadingMoreAllChargers, setLoadingMoreAllChargers] = useState(false);
  
  // Modal states
  const [showEditHubModal, setShowEditHubModal] = useState(false);
  const [showAssignChargersModal, setShowAssignChargersModal] = useState(false);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    open_24_hours: false,
    sanction_load: ''
  });

  // Refs
  const isUpdatingRef = useRef(false);
  const isAssigningRef = useRef(false);
  const isModalOpenRef = useRef(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchHubDetails();
  }, [hubId, isAuthenticated, navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
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

  const fetchHubDetails = async () => {
    setHubLoading(true);
    setHubError('');
    try {
      const response = await authenticatedRequest(`${API_CONFIG.HUB_DETAILS_API}/${hubId}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        setHubData(data);
        // Extract chargers from the response
        if (data.chargers && data.chargers.chargers) {
          const hubChargers = data.chargers.chargers;
          setChargers(hubChargers);
          setSelectedChargerIds(hubChargers.map(c => c.id));
          
          // Update assigned status in the allChargers list
          setAllChargers(prev => 
            prev.map(c => {
              if (hubChargers.some(hc => hc.id === c.id)) {
                return { ...c, assigned: true };
              }
              return c;
            })
          );
        } else if (data.chargers) {
          const chargerList = Array.isArray(data.chargers) ? data.chargers : [];
          setChargers(chargerList);
          setSelectedChargerIds(chargerList.map(c => c.id));
          
          // Update assigned status
          setAllChargers(prev => 
            prev.map(c => {
              if (chargerList.some(hc => hc.id === c.id)) {
                return { ...c, assigned: true };
              }
              return c;
            })
          );
        }
        setEditFormData({
          name: data.name || '',
          address: data.address || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          open_24_hours: data.open_24_hours || false,
          sanction_load: data.sanction_load || ''
        });
      } else {
        setHubError(data.message || data.error?.message || 'Failed to fetch hub details');
      }
    } catch (error) {
      console.error('Error fetching hub details:', error);
      setHubError(error.message || 'An error occurred');
    } finally {
      setHubLoading(false);
    }
  };

  // Fetch ONLY unassigned chargers (assigned=false)
  const fetchAllChargers = useCallback(async (before = null, before_id = null) => {
    if (allChargersLoading) return;
    
    setAllChargersLoading(true);
    
    try {
      let url = `${API_CONFIG.CHARGERS_API}?limit=${allChargersPagination.limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      const response = await authenticatedRequest(url, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        let chargersData = data.chargers || data.data || data || [];
        
        // Filter to only show unassigned chargers
        chargersData = chargersData.filter(charger => charger.assigned === false);
        
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || chargersData.length;

        setAllChargers(prev => before ? [...prev, ...chargersData] : chargersData);
        setAllChargersPagination({
          before: nextBefore,
          before_id: nextBeforeId,
          has_more: hasMore,
          total: total,
          limit: allChargersPagination.limit
        });
      }
    } catch (error) {
      console.error('Error fetching unassigned chargers:', error);
    } finally {
      setAllChargersLoading(false);
      setLoadingMoreAllChargers(false);
    }
  }, [allChargersPagination.limit, authenticatedRequest]);

  const loadMoreAllChargers = () => {
    if (allChargersPagination.has_more && !loadingMoreAllChargers && !allChargersLoading) {
      setLoadingMoreAllChargers(true);
      fetchAllChargers(allChargersPagination.before, allChargersPagination.before_id);
    }
  };

  // Handle charger selection/deselection
  const handleChargerSelection = (chargerId) => {
    setSelectedChargerIds(prev => {
      if (prev.includes(chargerId)) {
        return prev.filter(id => id !== chargerId);
      } else {
        return [...prev, chargerId];
      }
    });
  };

  // Assign chargers to hub using POST /api/v1/cpo/hubs/{hub_id}/chargers
  const handleAssignChargers = async (chargerIdsToAssign) => {
    // Prevent multiple simultaneous calls
    if (isAssigningRef.current) {
      console.log('⚠️ Assignment already in progress');
      return;
    }
    
    isAssigningRef.current = true;
    setIsAssigning(true);
    setHubError('');

    try {
      // Use the passed parameter or fallback to state
      const chargerIds = chargerIdsToAssign || selectedChargerIds;
      
      // Get current charger IDs from the hub
      const currentChargerIds = chargers.map(c => c.id);
      
      // Only find chargers to add - those selected but not already in the hub
      const chargersToAdd = chargerIds.filter(id => !currentChargerIds.includes(id));

      console.log('=== Charger Assignment Started ===');
      console.log('📊 Hub ID:', hubId);
      console.log('📊 Current chargers in hub:', currentChargerIds);
      console.log('📊 Selected charger IDs:', chargerIds);
      console.log('📊 Chargers to ADD:', chargersToAdd);

      if (chargersToAdd.length === 0) {
        console.log('ℹ️ No new chargers to add. All selected chargers are already in the hub.');
        setShowAssignChargersModal(false);
        setIsAssigning(false);
        isAssigningRef.current = false;
        return;
      }

      // Add new chargers using POST
      for (const chargerId of chargersToAdd) {
        console.log(`➕ Adding charger ${chargerId} to hub ${hubId}`);
        const postUrl = API_CONFIG.HUB_CHARGERS_API(hubId);
        const payload = { charger_id: chargerId };
        console.log(`📤 POST ${postUrl}`);
        console.log(`📦 Payload:`, payload);
        
        const response = await authenticatedRequest(postUrl, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const data = await response.json();
          // If it's 409 conflict, the charger is already in the hub
          if (response.status === 409) {
            console.log(`⚠️ Charger ${chargerId} is already in the hub, skipping...`);
            continue;
          }
          throw new Error(data.message || data.error?.message || `Failed to add charger ${chargerId}`);
        }
        console.log(`✅ Successfully added charger ${chargerId}`);
      }

      // Refresh both lists to get updated data
      console.log('🔄 Refreshing hub details and charger lists...');
      await fetchHubDetails();
      // Refresh the unassigned chargers list
      setAllChargers([]); // Clear current list
      await fetchAllChargers(); // Fetch fresh list of unassigned chargers
      
      // Close modal and reset selection
      setShowAssignChargersModal(false);
      setSelectedChargerIds([]);
      
      console.log('=== ✅ Charger Assignment Completed ===');
      console.log(`✅ Successfully added ${chargersToAdd.length} new charger(s) to the hub`);
      
    } catch (error) {
      console.error('❌ Error assigning chargers:', error);
      setHubError(error.message || 'An error occurred while assigning chargers');
    } finally {
      setIsAssigning(false);
      isAssigningRef.current = false;
    }
  };

  // Update charger status using PUT /api/v1/cpo/chargers/{charger_id}/status
  const handleUpdateChargerStatus = useCallback(async (chargerId, newStatus) => {
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGER_STATUS_API(chargerId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setChargers(prev => 
          prev.map(c => 
            c.id === chargerId ? { ...c, status: newStatus } : c
          )
        );
        if (selectedCharger && selectedCharger.id === chargerId) {
          setSelectedCharger(prev => ({ ...prev, status: newStatus }));
        }
        return true;
      } else {
        const data = await response.json();
        setHubError(data.message || data.error?.message || 'Failed to update charger status');
        return false;
      }
    } catch (error) {
      console.error('Error updating charger status:', error);
      setHubError(error.message || 'An error occurred');
      return false;
    }
  }, [selectedCharger, authenticatedRequest]);

  // Update hub customer visibility using PUT /api/v1/cpo/hubs/{hub_id}/customer-visibility
  const handleToggleVisibility = useCallback(async () => {
    if (isTogglingVisibility) return;
    setIsTogglingVisibility(true);
    
    try {
      const newVisibility = !hubData?.customer_visible;
      const response = await authenticatedRequest(API_CONFIG.HUB_VISIBILITY_API(hubId), {
        method: 'PUT',
        body: JSON.stringify({ customer_visible: newVisibility })
      });

      if (response.ok) {
        const data = await response.json();
        setHubData(prev => ({ ...prev, customer_visible: data.customer_visible }));
        setHubError('');
      } else {
        const data = await response.json();
        setHubError(data.message || data.error?.message || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      setHubError(error.message || 'An error occurred');
    } finally {
      setIsTogglingVisibility(false);
    }
  }, [hubId, hubData, isTogglingVisibility, authenticatedRequest]);

  // Delete hub
  const handleDeleteHub = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setHubError('');

    try {
      const response = await authenticatedRequest(`${API_CONFIG.HUB_DETAILS_API}/${hubId}`, {
        method: 'DELETE'
      });

      if (response.status === 204) {
        navigate('/manage-hubs');
      } else {
        const data = await response.json();
        setHubError(data.message || data.error?.message || 'Failed to delete hub');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting hub:', error);
      setHubError(error.message || 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  }, [hubId, navigate, authenticatedRequest]);

  // Update hub
  const handleUpdateHub = useCallback(async (formData) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    setIsSubmitting(true);
    setHubError('');
    
    const payload = {};
    
    if (formData.name !== hubData?.name) payload.name = formData.name;
    if (formData.address !== hubData?.address) payload.address = formData.address;
    if (formData.latitude && parseFloat(formData.latitude) !== hubData?.latitude) {
      payload.latitude = parseFloat(formData.latitude);
    }
    if (formData.longitude && parseFloat(formData.longitude) !== hubData?.longitude) {
      payload.longitude = parseFloat(formData.longitude);
    }
    if (formData.open_24_hours !== hubData?.open_24_hours) {
      payload.open_24_hours = formData.open_24_hours;
    }
    if (formData.sanction_load && parseFloat(formData.sanction_load) !== hubData?.sanction_load) {
      payload.sanction_load = parseFloat(formData.sanction_load);
    }

    if (Object.keys(payload).length === 0) {
      setShowEditHubModal(false);
      setIsSubmitting(false);
      isUpdatingRef.current = false;
      return;
    }

    try {
      const response = await authenticatedRequest(`${API_CONFIG.HUB_DETAILS_API}/${hubId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setHubData(data);
        setEditFormData({
          name: data.name || '',
          address: data.address || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          open_24_hours: data.open_24_hours || false,
          sanction_load: data.sanction_load || ''
        });
        setShowEditHubModal(false);
        isUpdatingRef.current = false;
      } else {
        setHubError(data.message || data.error?.message || 'Failed to update hub');
        isUpdatingRef.current = false;
      }
    } catch (error) {
      console.error('Error updating hub:', error);
      setHubError(error.message || 'An error occurred');
      isUpdatingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [hubData, hubId, authenticatedRequest]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      navigate('/signin');
    } finally {
      setLoggingOut(false);
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
      'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
      'PREPARING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CHARGING': 'bg-blue-100 text-blue-800 border-blue-200',
      'SUSPENDED_EV': 'bg-orange-100 text-orange-800 border-orange-200',
      'SUSPENDED_EVSE': 'bg-orange-100 text-orange-800 border-orange-200',
      'FINISHING': 'bg-purple-100 text-purple-800 border-purple-200',
      'RESERVED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'UNAVAILABLE': 'bg-red-100 text-red-800 border-red-200',
      'FAULTED': 'bg-red-100 text-red-800 border-red-200',
      'OFFLINE': 'bg-gray-100 text-gray-800 border-gray-200',
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
      'UNDER_MAINTENANCE': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'AVAILABLE':
      case 'ACTIVE':
        return <CheckCircle className="w-3 h-3" />;
      case 'CHARGING':
        return <Zap className="w-3 h-3" />;
      case 'OFFLINE':
        return <Wifi className="w-3 h-3" />;
      case 'FAULTED':
      case 'UNAVAILABLE':
        return <AlertCircle className="w-3 h-3" />;
      case 'UNDER_MAINTENANCE':
        return <Wrench className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Status options - Only Active, Inactive, Under Maintenance
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  ];

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

  // Charger Details Modal with QR Code
  const ChargerDetailsModal = () => {
    const [copied, setCopied] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(selectedCharger?.status || '');
    const [isUpdating, setIsUpdating] = useState(false);

    if (!selectedCharger) return null;

    const connectionUrl = selectedCharger?.charger_connection_url_ws || 
                         selectedCharger?.charger_connection_url_wss ||
                         `ws://${selectedCharger?.charger_id || 'charger'}.transev.com`;

    const handleCopyUrl = () => {
      navigator.clipboard.writeText(connectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleStatusChange = async (newStatus) => {
      setIsUpdating(true);
      const success = await handleUpdateChargerStatus(selectedCharger.id, newStatus);
      if (success) {
        setSelectedStatus(newStatus);
        setSelectedCharger(prev => ({ ...prev, status: newStatus }));
      }
      setIsUpdating(false);
    };

    const handleDownloadQR = () => {
      const svgElement = document.querySelector('#charger-qr-code svg');
      if (svgElement) {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.download = `charger-${selectedCharger?.charger_id || 'qr'}-code.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <div className="sticky top-0 bg-white z-10 flex justify-end p-4 border-b border-gray-100">
            <button
              onClick={() => {
                setShowChargerModal(false);
                setSelectedCharger(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCharger.charger_name || 'Unnamed Charger'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                      Charger ID: {selectedCharger.charger_id || 'N/A'}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCharger.status)}`}>
                      {getStatusIcon(selectedCharger.status)}
                      {selectedCharger.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm flex items-center gap-2"
                >
                  <Download size={16} />
                  QR
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-4">
                {/* Status Update */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <SettingsIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Update Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={selectedStatus}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Serial Number</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.serial_number || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">OCPP Version</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.ocpp_version || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Max Power</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.max_power_kw || 0} kW</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Charger Type</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.charger_type || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Host Name</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.charger_host_name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Host Phone</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.charger_host_phone_no || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Segment</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.segment || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Sub Segment</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.sub_segment || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Protocol</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.protocol || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">24/7 Open</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCharger.twenty_four_seven_open_status ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">OCPP Identity</p>
                    <p className="text-sm font-mono text-gray-600 mt-0.5">{selectedCharger.ocpp_identity || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-gray-600 mt-0.5">{selectedCharger.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Connectors */}
                {selectedCharger.connectors && selectedCharger.connectors.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Plug size={16} />
                      Connectors ({selectedCharger.connectors.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCharger.connectors.map((conn, idx) => (
                        <div key={conn.id || idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              #{conn.connector_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conn.status)}`}>
                              {conn.status || 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{conn.connector_type || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Capacity: {conn.connector_total_capacity || 0} kW</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - QR Code */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                      <QrCode size={18} className="text-green-600" />
                      Charger QR Code
                    </h4>
                    <div id="charger-qr-code" className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block mx-auto">
                      <QRCodeSVG
                        value={selectedCharger.charger_id || 'charger-id'}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-800">Charger ID</p>
                      <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                        {selectedCharger.charger_id || 'N/A'}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          value={connectionUrl}
                          readOnly
                          className="flex-1 text-xs font-mono text-gray-600 bg-transparent outline-none"
                        />
                        <button
                          onClick={handleCopyUrl}
                          className="p-1.5 text-gray-500 hover:text-green-600 transition"
                          title="Copy URL"
                        >
                          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Connection URL</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Created: {formatDate(selectedCharger.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw size={12} />
                  Updated: {formatDate(selectedCharger.updated_at)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                CPO: {selectedCharger.cpo_id?.slice(0, 8) || 'N/A'}...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Hub Modal
  const EditHubModal = () => {
    const [localFormData, setLocalFormData] = useState({
      name: hubData?.name || '',
      address: hubData?.address || '',
      latitude: hubData?.latitude || '',
      longitude: hubData?.longitude || '',
      open_24_hours: hubData?.open_24_hours || false,
      sanction_load: hubData?.sanction_load || ''
    });

    const handleLocalChange = (e) => {
      const { name, value, type, checked } = e.target;
      setLocalFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    const handleSave = () => {
      if (isUpdatingRef.current) return;
      handleUpdateHub(localFormData);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditHubModal(false)} />
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-full max-w-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Hub Details</h2>
              <button
                onClick={() => setShowEditHubModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hub Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={localFormData.name}
                    onChange={handleLocalChange}
                    placeholder="Enter hub name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={localFormData.address}
                      onChange={handleLocalChange}
                      placeholder="Enter address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={localFormData.latitude}
                      onChange={handleLocalChange}
                      placeholder="Enter latitude"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={localFormData.longitude}
                      onChange={handleLocalChange}
                      placeholder="Enter longitude"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sanction Load (kW)
                  </label>
                  <input
                    type="number"
                    name="sanction_load"
                    value={localFormData.sanction_load}
                    onChange={handleLocalChange}
                    step="any"
                    placeholder="Enter sanction load"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="open_24_hours"
                    id="edit_open_24_hours"
                    checked={localFormData.open_24_hours}
                    onChange={handleLocalChange}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="edit_open_24_hours" className="text-sm font-medium text-gray-700">
                    Open 24/7
                  </label>
                </div>

                {hubError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {hubError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isUpdatingRef.current || isSubmitting}
                    className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditHubModal(false);
                      setHubError('');
                    }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete Hub</h3>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{hubData?.name}</span>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This action will permanently remove the hub and all its associated chargers. This cannot be undone.
        </p>
        {hubError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {hubError}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteHub}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Delete Hub
              </>
            )}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Assign Chargers Modal
  const AssignChargersModal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localSelectedIds, setLocalSelectedIds] = useState([]);

    useEffect(() => {
      // Only show unassigned chargers - clear any pre-selected IDs
      setLocalSelectedIds([]);
    }, []);

    useEffect(() => {
      if (showAssignChargersModal && !isModalOpenRef.current) {
        isModalOpenRef.current = true;
        // Reset the list and fetch unassigned chargers
        setAllChargers([]);
        fetchAllChargers();
      }
      return () => {
        if (!showAssignChargersModal) {
          isModalOpenRef.current = false;
        }
      };
    }, [showAssignChargersModal, fetchAllChargers]);

    const toggleSelection = (chargerId) => {
      setLocalSelectedIds(prev => {
        if (prev.includes(chargerId)) {
          return prev.filter(id => id !== chargerId);
        } else {
          return [...prev, chargerId];
        }
      });
    };

    const handleSelectAll = () => {
      const filteredIds = filteredAllChargers.map(c => c.id);
      const allSelected = filteredIds.every(id => localSelectedIds.includes(id));
      if (allSelected) {
        setLocalSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
      } else {
        setLocalSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
      }
    };

    const handleSaveAssignments = async () => {
      if (isAssigningRef.current) {
        console.log('⚠️ Assignment already in progress, skipping...');
        return;
      }
      
      const chargerIdsToAssign = localSelectedIds;
      console.log('📝 Adding selected chargers to hub:', chargerIdsToAssign);
      
      await handleAssignChargers(chargerIdsToAssign);
    };

    const filteredAllChargers = allChargers.filter(charger => {
      if (charger.assigned !== false) {
        return false;
      }
      return charger.charger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             charger.charger_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             charger.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             charger.id?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const isAllSelected = filteredAllChargers.length > 0 && 
      filteredAllChargers.every(c => localSelectedIds.includes(c.id));

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {
          setShowAssignChargersModal(false);
          isModalOpenRef.current = false;
        }} />
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-full max-w-5xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Chargers to <span className="text-green-600">{hubData?.name}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select unassigned chargers to add to this hub
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignChargersModal(false);
                  isModalOpenRef.current = false;
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search unassigned chargers by name, ID, or serial number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Selected: <strong className="text-gray-900">{localSelectedIds.length}</strong></span>
                  <span className="w-px h-4 bg-gray-300"></span>
                  <span>Available: <strong className="text-gray-900">{allChargers.filter(c => c.assigned === false).length}</strong></span>
                </div>
              </div>

              {allChargersLoading && allChargers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              ) : filteredAllChargers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No Unassigned Chargers Available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {allChargers.filter(c => c.assigned === false).length === 0 ? 
                      'All chargers are already assigned to hubs' : 
                      'No chargers match your search criteria'}
                  </p>
                  {allChargers.filter(c => c.assigned === false).length === 0 && (
                    <button
                      onClick={() => {
                        setShowAssignChargersModal(false);
                        isModalOpenRef.current = false;
                        navigate('/add-charger');
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Charger
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="font-medium text-gray-700">Select</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Charger ID</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Serial</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Power</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAllChargers.map((charger) => {
                          const isSelected = localSelectedIds.includes(charger.id);
                          return (
                            <tr 
                              key={charger.id}
                              className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                                isSelected ? 'bg-green-50' : ''
                              }`}
                              onClick={() => toggleSelection(charger.id)}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelection(charger.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                {charger.charger_id || charger.id?.slice(0, 8) || 'N/A'}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {charger.charger_name || charger.name || 'Unnamed'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {charger.serial_number || 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {charger.charger_type || 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                                  {getStatusIcon(charger.status)}
                                  {charger.status || 'PENDING'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-700">
                                  {charger.max_power_kw || 0} kW
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {allChargersPagination.has_more && filteredAllChargers.length > 0 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMoreAllChargers}
                        disabled={loadingMoreAllChargers || allChargersLoading}
                        className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                      >
                        {loadingMoreAllChargers ? 'Loading...' : 'Load More Chargers'}
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleSaveAssignments}
                      disabled={isAssigning || isSubmitting || isAssigningRef.current || localSelectedIds.length === 0}
                      className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAssigning || isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding Chargers...
                        </>
                      ) : (
                        `Add to Hub (${localSelectedIds.length} selected)`
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignChargersModal(false);
                        isModalOpenRef.current = false;
                        setLocalSelectedIds([]);
                      }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {hubError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {hubError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading if refreshing
  if (isRefreshing || loading || hubLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isRefreshing ? 'Refreshing session...' : 'Loading hub details...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hubError && !hubData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600">{hubError}</p>
            <button
              onClick={() => navigate('/manage-hubs')}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Back to Hubs
            </button>
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
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Hub Details</h1>
                </div>
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
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-green-500/25"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Back and Manage Chargers Button */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <button
            onClick={() => navigate('/manage-hubs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Hubs</span>
          </button>
          <button
            onClick={() => {
              setShowAssignChargersModal(true);
              isModalOpenRef.current = false;
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-500/25"
          >
            <Plus size={18} />
            Add Chargers To Hub
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Hub Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-xl">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Hub Details</h2>
                        <p className="text-sm text-gray-500">Complete information</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowEditHubModal(true)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        title="Edit Hub"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Hub"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Customer Visibility Toggle */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe2 size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Customer Visibility</span>
                      </div>
                      <button
                        onClick={handleToggleVisibility}
                        disabled={isTogglingVisibility}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {isTogglingVisibility ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : hubData?.customer_visible ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-green-600" />
                            <span className="text-xs font-medium text-green-600">Published</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Unpublished</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {hubData?.customer_visible 
                        ? 'Visible to customers in the User App' 
                        : 'Hidden from customers in the User App'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Hub Name</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Address</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.address || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <span className="font-medium text-gray-900">Lat: {hubData?.latitude || 'N/A'}</span>
                      <span className="font-medium text-gray-900">Lng: {hubData?.longitude || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Sanction Load</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.sanction_load || 0} kW</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Open 24/7</p>
                    <p className="text-base font-semibold text-gray-900">{hubData?.open_24_hours ? 'Yes' : 'No'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Chargers</p>
                    <p className="text-base font-semibold text-gray-900">{chargers.length}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Created At</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(hubData?.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(hubData?.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chargers Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold text-gray-900">Hub Chargers</h3>
                      <span className="ml-2 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {chargers.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, ID, or serial number..."
                      value={chargerSearchTerm}
                      onChange={(e) => setChargerSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {chargersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                  ) : chargers.filter(c => 
                    c.charger_name?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                    c.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                    c.serial_number?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                    c.id?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-12">
                      <Zap className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No Chargers in this Hub</p>
                      <p className="text-sm text-gray-400 mt-1">Assign chargers using the "Add Chargers To Hub" button</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Charger ID</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Serial</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Power</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chargers
                            .filter(c => 
                              c.charger_name?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                              c.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                              c.serial_number?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
                              c.id?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
                            )
                            .map((charger) => (
                              <tr key={charger.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                  {charger.charger_id || charger.id?.slice(0, 8) || 'N/A'}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {charger.charger_name || charger.name || 'Unnamed'}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {charger.serial_number || 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {charger.charger_type || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                                    {getStatusIcon(charger.status)}
                                    {charger.status || 'PENDING'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-medium text-gray-700">
                                    {charger.max_power_kw || 0} kW
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => {
                                      setSelectedCharger(charger);
                                      setShowChargerModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs flex items-center gap-1 shadow-sm"
                                  >
                                    <Eye size={14} />
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditHubModal && <EditHubModal />}
      {showAssignChargersModal && <AssignChargersModal />}
      {showChargerModal && <ChargerDetailsModal />}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </div>
  );
};

export default HubDetails;
// src/components/UserAccess/AddStaff.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft as ArrowLeftIcon,
  UserRound,
  BadgeCheck
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  PERMISSIONS_CATALOG: `${API_BASE_URL}/api/v1/cpo/permissions/catalog`,
  STAFF_CREATE: `${API_BASE_URL}/api/v1/cpo/staff`,
  STAFF_UPDATE: (membershipId) => `${API_BASE_URL}/api/v1/cpo/staff/${membershipId}`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Get module color
const getModuleColor = (module) => {
  const colors = {
    'organization': 'bg-blue-100 text-blue-700 border-blue-200',
    'network': 'bg-green-100 text-green-700 border-green-200',
    'commercial': 'bg-purple-100 text-purple-700 border-purple-200',
    'operations': 'bg-orange-100 text-orange-700 border-orange-200',
    'customers': 'bg-pink-100 text-pink-700 border-pink-200',
    'staff': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'support': 'bg-red-100 text-red-700 border-red-200'
  };
  return colors[module] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getModuleIcon = (module) => {
  switch(module) {
    case 'organization': return <Building size={14} />;
    case 'network': return <Network size={14} />;
    case 'commercial': return <Wallet size={14} />;
    case 'operations': return <Activity size={14} />;
    case 'customers': return <Users size={14} />;
    case 'staff': return <UserCog size={14} />;
    case 'support': return <HelpCircle size={14} />;
    default: return <Shield size={14} />;
  }
};

// Role options
const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin', icon: <CrownIcon2 size={16} className="text-purple-600" />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'OPERATOR', label: 'Operator', icon: <Activity size={16} className="text-blue-600" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'VIEWER', label: 'Viewer', icon: <Eye size={16} className="text-gray-600" />, color: 'bg-gray-100 text-gray-700 border-gray-200' }
];

const AddStaff = () => {
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
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Permissions state
  const [permissionsCatalog, setPermissionsCatalog] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'VIEWER'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Check if editing from location state
  useEffect(() => {
    if (location.state?.editData) {
      const editData = location.state.editData;
      setIsEditing(true);
      setEditId(editData.id || editData.membership_id);
      setFormData({
        email: editData.user_email || editData.email || '',
        full_name: editData.user_name || editData.full_name || '',
        role: editData.role || 'VIEWER'
      });
      // Convert overrides to selected permissions
      if (editData.overrides && Array.isArray(editData.overrides)) {
        const overrideKeys = editData.overrides.map(o => 
          typeof o === 'string' ? o : o.permission || o.key || o
        );
        setSelectedPermissions(overrideKeys);
      }
    }
  }, [location.state]);

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
        console.log('📥 Permissions catalog:', data);
        
        let permissions = [];
        if (Array.isArray(data)) {
          permissions = data;
        } else if (data.permissions) {
          permissions = data.permissions;
        } else if (data.data) {
          permissions = data.data;
        }
        
        setPermissionsCatalog(permissions);
      } else {
        console.error('Failed to fetch permissions catalog:', response.status);
      }
    } catch (error) {
      console.error('Error fetching permissions catalog:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.role.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Build the request body with overrides
      const requestBody = {
        email: formData.email,
        full_name: formData.full_name || formData.email.split('@')[0],
        role: formData.role,
        overrides: selectedPermissions.map(permission => ({
          permission: permission,
          effect: 'ALLOW'
        }))
      };

      console.log('📤 Sending request:', requestBody);

      let response;
      if (isEditing && editId) {
        // Update existing staff - use PATCH
        const url = API_CONFIG.STAFF_UPDATE(editId);
        response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            role: formData.role,
            overrides: selectedPermissions.map(permission => ({
              permission: permission,
              effect: 'ALLOW'
            }))
          })
        });
      } else {
        // Create new staff
        response = await fetch(API_CONFIG.STAFF_CREATE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Staff saved:', data);
        
        // Navigate back to User Access page with refresh flag
        navigate('/user-access', { 
          state: { refresh: true, message: isEditing ? 'Staff member updated successfully!' : 'Staff member added successfully!' }
        });
        
        // Show success message briefly before navigation
        setSuccess(isEditing ? 'Staff member updated successfully!' : 'Staff member added successfully!');
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || errorData.error?.message || `Failed to ${isEditing ? 'update' : 'create'} staff member`);
        console.error('❌ API Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error saving staff:', error);
      setError(`An error occurred while ${isEditing ? 'updating' : 'creating'} the staff member`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionKey)) {
        return prev.filter(p => p !== permissionKey);
      } else {
        return [...prev, permissionKey];
      }
    });
  };

  // Handle select all permissions
  const handleSelectAllPermissions = () => {
    const allKeys = filteredPermissions.map(p => p.key);
    const allSelected = allKeys.every(key => selectedPermissions.includes(key));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !allKeys.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...allKeys])]);
    }
  };

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    if (!permissionSearch) return permissionsCatalog;
    const query = permissionSearch.toLowerCase();
    return permissionsCatalog.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.key?.toLowerCase().includes(query) ||
      p.module?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }, [permissionsCatalog, permissionSearch]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups = {};
    filteredPermissions.forEach(p => {
      const module = p.module || 'other';
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(p);
    });
    return groups;
  }, [filteredPermissions]);

  // Initial fetch
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    fetchUserInfo();
    fetchPermissionsCatalog();
  }, [isAuthenticated]);

  // Settings Dropdown Menu
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
          <UserIcon size={16} className="text-gray-500" /> <span>Profile</span>
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
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

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

  // Get role display info
  const getRoleDisplay = (role) => {
    const found = ROLE_OPTIONS.find(r => r.value === role);
    return found || ROLE_OPTIONS[2]; // Default to Viewer
  };

  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <button
                onClick={() => navigate('/user-access')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <ArrowLeftIcon size={16} />
                Back to User Access
              </button>
              <span className="text-gray-300">/</span>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit' : 'Add'} Staff Member
              </h1>
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
          <div className="max-w-6xl mx-auto">
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEditing ? 'Update the staff member details below' : 'Fill in the details below to add a new staff member'}
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
                <CheckCircle size={20} />
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter user email"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
                          required
                          autoFocus
                          disabled={isEditing}
                        />
                      </div>
                      {isEditing && (
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed while editing</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserRound size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Enter full name"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {ROLE_OPTIONS.map((role) => {
                          const isSelected = formData.role === role.value;
                          return (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, role: role.value })}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100/50' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`p-1.5 rounded-full ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                {role.icon}
                              </div>
                              <span className={`text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                {role.label}
                              </span>
                              {isSelected && (
                                <Check size={12} className="text-blue-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Selected: <span className="font-medium text-gray-600">{getRoleDisplay(formData.role).label}</span>
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-sm text-blue-700 flex items-center gap-2">
                        <BadgeCheck size={16} />
                        <span>Selected Permissions: <strong>{selectedPermissions.length}</strong></span>
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        {selectedPermissions.length > 0 ? (
                          <span>Permissions will be applied with ALLOW effect</span>
                        ) : (
                          <span>No permissions selected</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Permissions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Permissions
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={permissionSearch}
                            onChange={(e) => setPermissionSearch(e.target.value)}
                            placeholder="Search permissions..."
                            className="pl-7 pr-2 py-1 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSelectAllPermissions}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {filteredPermissions.length > 0 && 
                            filteredPermissions.every(p => selectedPermissions.includes(p.key)) 
                            ? 'Deselect All' : 'Select All'
                          }
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                      {Object.entries(groupedPermissions).length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No permissions found
                        </div>
                      ) : (
                        Object.entries(groupedPermissions).map(([module, perms]) => (
                          <div key={module} className="border-b border-gray-100 last:border-b-0">
                            <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 sticky top-0 z-10">
                              <span className={`${getModuleColor(module)} px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1`}>
                                {getModuleIcon(module)}
                                {module.charAt(0).toUpperCase() + module.slice(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({perms.length} permissions)
                              </span>
                            </div>
                            <div className="p-2 space-y-1">
                              {perms.map((perm) => (
                                <label
                                  key={perm.key}
                                  className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition hover:bg-gray-50 ${
                                    selectedPermissions.includes(perm.key) ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.key)}
                                    onChange={() => handlePermissionToggle(perm.key)}
                                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-800">{perm.name}</span>
                                      <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">
                                        {perm.key}
                                      </code>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{perm.description}</p>
                                  </div>
                                  {selectedPermissions.includes(perm.key) && (
                                    <Check size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/user-access')}
                    className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.email.trim() || !formData.role.trim()}
                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isEditing ? 'Updating...' : 'Adding Staff...'}
                      </>
                    ) : (
                      <>
                        {isEditing ? <Edit size={18} /> : <UserPlus size={18} />}
                        {isEditing ? 'Update Staff' : 'Add Staff Member'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddStaff;
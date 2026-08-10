// src/components/CustomerandVehicles/AddCustomerGroup.jsx
import React, { useState, useEffect } from 'react';
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
  Users as UsersIcon,
  UserCog,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Edit,
  Trash2,
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
  Zap,
  Layers,
  Gift,
  Crown,
  Users as UsersIcon2,
  UserPlus as UserPlusIcon,
  Check,
  List,
  Grid,
  Search as SearchIcon,
  FileText,
  TrendingUp
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const AddCustomerGroup = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state - ✅ Backend expects 'is_active' not 'status'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true  // ✅ Changed from 'status' to 'is_active'
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch user info
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
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
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Group name is required';
    }
    if (formData.name.trim().length < 2) {
      errors.name = 'Group name must be at least 2 characters';
    }
    if (formData.name.trim().length > 50) {
      errors.name = 'Group name must be less than 50 characters';
    }
    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // ✅ Backend payload with 'is_active'
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_active: formData.is_active  // ✅ Changed from 'status' to 'is_active'
      };

      console.log('📤 Sending payload:', payload);

      const response = await authenticatedRequest(API_CONFIG.USER_GROUPS_API, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (response.ok) {
        setSuccess('Customer group created successfully!');
        setFormData({ 
          name: '', 
          description: '', 
          is_active: true 
        });
        setTimeout(() => {
          navigate('/customer-groups');
        }, 2000);
      } else {
        setError(data.message || data.error?.message || 'Failed to create customer group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('An error occurred while creating the group');
    } finally {
      setIsSubmitting(false);
    }
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

  // Add Dropdown Menu
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

  if (isRefreshing) {
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
              <button onClick={() => navigate('/customer-groups')} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Add Customer Group</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-400 font-medium mt-1">New Group</span>
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
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <UserCog size={24} className="text-green-600" />
                  Create New Customer Group
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Organize your customers into groups for better management
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <Users size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Group Management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-green-600" />
                Group Information
              </h3>
              <p className="text-sm text-gray-500 mt-1">Enter the details of the new customer group</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Group Name <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <UserCog size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter group name (e.g., Premium Customers)"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                    required
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Choose a unique and descriptive name for your group</p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 text-sm">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <FileText size={18} />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a brief description of this group..."
                    rows="4"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition resize-none bg-gray-50 hover:bg-white`}
                  />
                </div>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Add a description to help identify the purpose of this group</p>
              </div>

              {/* ✅ Active Status - Toggle Switch instead of dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Active Status
                </label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                        formData.is_active ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5 shadow-md`}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formData.is_active 
                        ? 'Group will be visible and usable' 
                        : 'Group will be hidden and inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">What is a Customer Group?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Customer groups help you organize your customers based on their characteristics,
                      behavior, or preferences. You can assign customers to specific groups for targeted
                      management and communication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Group...
                    </>
                  ) : (
                    <>
                      <UserPlusIcon size={20} />
                      Create Customer Group
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/customer-groups')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Manage Customers</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Group your customers together for better management and targeted communication
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Access Control</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Control access and permissions for different customer groups
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Analytics</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Track performance and insights for each customer group
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerGroup;
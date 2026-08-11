// src/components/Revenue/AddGSTProfile.jsx
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
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Info,
  Sparkles,
  Receipt,
  Tag,
  Percent,
  Shield,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Save,
  Building2,
  MapPin,
  Globe,
  X,
  Zap,
  Users 
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  GST_API: `${API_BASE_URL}/api/v1/cpo/gsts`,
  ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const AddGSTProfile = () => {
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
  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    sgst_rate: '',
    cgst_rate: '',
    igst_rate: '',
    is_active: true
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch user info and organization
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchOrganization();
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

  const fetchOrganization = useCallback(async () => {
    setLoadingOrg(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.ORGANIZATION_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
        // Auto-fill the state field from organization
        if (data.state) {
          setFormData(prev => ({ ...prev, state: data.state }));
        }
      } else {
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setOrganization(null);
    } finally {
      setLoadingOrg(false);
    }
  }, [authenticatedRequest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'GST profile name is required';
    }
    if (formData.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    // Validate State - Required
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    // Validate CGST rate - Required
    const cgst = parseFloat(formData.cgst_rate);
    if (isNaN(cgst) || cgst < 0 || cgst > 100) {
      errors.cgst_rate = 'CGST rate must be between 0 and 100';
    }

    // Validate SGST rate - Optional, but if provided must be valid
    if (formData.sgst_rate) {
      const sgst = parseFloat(formData.sgst_rate);
      if (isNaN(sgst) || sgst < 0 || sgst > 100) {
        errors.sgst_rate = 'SGST rate must be between 0 and 100';
      }
    }

    // Validate IGST rate - Optional, but if provided must be valid
    if (formData.igst_rate) {
      const igst = parseFloat(formData.igst_rate);
      if (isNaN(igst) || igst < 0 || igst > 100) {
        errors.igst_rate = 'IGST rate must be between 0 and 100';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit to Create GST Profile API
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        state: formData.state.trim(),
        sgst_rate: formData.sgst_rate ? parseFloat(formData.sgst_rate) : 0,
        cgst_rate: parseFloat(formData.cgst_rate),
        igst_rate: formData.igst_rate ? parseFloat(formData.igst_rate) : 0,
        is_active: formData.is_active
      };

      console.log('📤 Creating GST profile payload:', payload);

      const response = await authenticatedRequest(API_CONFIG.GST_API, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (response.ok) {
        setSuccess('GST profile created successfully!');
        // Reset form
        setFormData({
          name: '',
          state: organization?.state || '',
          sgst_rate: '',
          cgst_rate: '',
          igst_rate: '',
          is_active: true
        });
        // Navigate back to tax page after delay
        setTimeout(() => {
          navigate('/revenue/tax');
        }, 2000);
      } else {
        setError(data.message || data.error?.message || 'Failed to create GST profile');
      }
    } catch (error) {
      console.error('Error creating GST profile:', error);
      setError('An error occurred while creating the GST profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/signin');
    }
  }, [logout, navigate]);

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
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-customer"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Users size={18} className="text-gray-400" /> Add Customer
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/revenue/tax')} 
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Add GST Profile</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-500 font-medium mt-1">New GST Profile</span>
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
        <div className="p-6 max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt size={24} className="text-blue-600" />
                  Create GST Profile
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure GST tax rates for your organization
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-blue-600" />
                  <span className="text-blue-700 font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-xl shadow-sm">
                  <DollarSign size={16} className="text-blue-600" />
                  <span className="text-blue-700 font-medium">Tax</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-600" />
                GST Configuration
              </h3>
              <p className="text-sm text-gray-500 mt-1">Set up GST rates for your charging operations</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Organization Info */}
              {organization && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Organization Details</p>
                      <p className="text-sm text-blue-700">
                        <strong>Business:</strong> {organization.business_name || 'N/A'}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>State:</strong> {organization.state || 'N/A'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {organization.state ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle size={14} />
                            State auto-filled from organization
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <AlertCircle size={14} />
                            Please set up your organization state first
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Profile Name <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Tag size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Standard GST, Premium GST"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
              </div>

              {/* State - Auto-filled from organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  State <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State will be auto-filled from organization"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.state ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                    required
                    readOnly={!!organization?.state}
                  />
                </div>
                {formErrors.state && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.state}
                  </p>
                )}
                {organization?.state && (
                  <p className="mt-1 text-xs text-green-600">
                    <CheckCircle size={12} className="inline mr-1" />
                    State auto-filled from your organization
                  </p>
                )}
              </div>

              {/* Tax Rates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tax Rates
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CGST - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      CGST Rate <span className="text-red-500 text-lg">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Percent size={18} />
                      </div>
                      <input
                        type="number"
                        name="cgst_rate"
                        value={formData.cgst_rate}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        max="100"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          formErrors.cgst_rate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                        required
                      />
                    </div>
                    {formErrors.cgst_rate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {formErrors.cgst_rate}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Central GST rate (0-100%)</p>
                  </div>

                  {/* SGST - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      SGST Rate <span className="text-gray-400 text-sm">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Percent size={18} />
                      </div>
                      <input
                        type="number"
                        name="sgst_rate"
                        value={formData.sgst_rate}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        max="100"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          formErrors.sgst_rate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                      />
                    </div>
                    {formErrors.sgst_rate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {formErrors.sgst_rate}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">State GST rate (0-100%)</p>
                  </div>

                  {/* IGST - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      IGST Rate <span className="text-gray-400 text-sm">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Percent size={18} />
                      </div>
                      <input
                        type="number"
                        name="igst_rate"
                        value={formData.igst_rate}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        max="100"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          formErrors.igst_rate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                      />
                    </div>
                    {formErrors.igst_rate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {formErrors.igst_rate}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Integrated GST rate (0-100%)</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">GST Rate Rules</p>
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>State:</strong> {formData.state || 'Not set'}
                      <br />
                      <strong>CGST</strong> is mandatory for all transactions.
                      <br />
                      {formData.state ? (
                        <>
                          <strong>For transactions within {formData.state}:</strong>
                          <br />
                          SGST + CGST rates will be applied.
                          <br />
                          <strong>For inter-state transactions:</strong>
                          <br />
                          IGST rate will be applied instead.
                        </>
                      ) : (
                        'Please set the state to determine the correct GST application rules.'
                      )}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Note:</strong> SGST and IGST are optional. You can set either SGST or IGST based on your business needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
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
                        ? 'GST profile will be available for use' 
                        : 'GST profile will be hidden and inactive'}
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Create GST Profile
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/revenue/tax')}
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">GST Compliance</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ensure tax compliance with proper GST rate configuration
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">State Based</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                SGST + CGST for same state, IGST for inter-state transactions
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Flexible Configuration</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                SGST and IGST are optional - configure based on your business needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGSTProfile;
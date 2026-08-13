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
  X,
  Zap,
  Users,
  Link2,
  ChevronUp,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  GST_API: `${API_BASE_URL}/api/v1/cpo/gsts`,
  ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
};

// Indian States - same values as backend enum
const INDIAN_STATES = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  {
    value: 'Andaman and Nicobar Islands',
    label: 'Andaman and Nicobar Islands',
  },
  { value: 'Chandigarh', label: 'Chandigarh' },
  {
    value: 'Dadra and Nagar Haveli and Daman and Diu',
    label: 'Dadra and Nagar Haveli and Daman and Diu',
  },
  {
    value: 'Delhi (National Capital Territory of Delhi)',
    label: 'Delhi (National Capital Territory of Delhi)',
  },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
  { value: 'Puducherry', label: 'Puducherry' },
];

const AddGSTProfile = () => {
  const navigate = useNavigate();

  const {
    authenticatedRequest,
    logout,
    isRefreshing,
    isAuthenticated,
    user,
  } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    cgst_rate: '',
    sgst_rate: '',
    igst_rate: '',
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Controls which tax fields are visible
  const [showCgst, setShowCgst] = useState(false);
  const [showSgst, setShowSgst] = useState(false);

  // For interstate case
  const [applyIgst, setApplyIgst] = useState(false);

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
        method: 'GET',
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
      const response = await authenticatedRequest(
        API_CONFIG.ORGANIZATION_API,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
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

  /*
   * Organization state
   */
  const organizationState = useMemo(() => {
    return organization?.state?.trim() || '';
  }, [organization]);

  /*
   * Check whether GST state and organization state are same
   */
  const isSameState = useMemo(() => {
    if (!formData.state || !organizationState) {
      return false;
    }

    return (
      formData.state.trim().toLowerCase() ===
      organizationState.trim().toLowerCase()
    );
  }, [formData.state, organizationState]);

  const isDifferentState = useMemo(() => {
    if (!formData.state || !organizationState) {
      return false;
    }

    return !isSameState;
  }, [formData.state, organizationState, isSameState]);

  /*
   * Handle normal input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /*
   * Handle GST state change
   *
   * Every time CPO changes GST state:
   * - reset CGST
   * - reset SGST
   * - reset IGST
   * - hide all fields
   * - reset IGST toggle
   */
  const handleStateChange = (e) => {
    const selectedState = e.target.value;

    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      cgst_rate: '',
      sgst_rate: '',
      igst_rate: '',
    }));

    setShowCgst(false);
    setShowSgst(false);
    setApplyIgst(false);

    setFormErrors((prev) => ({
      ...prev,
      state: '',
      cgst_rate: '',
      sgst_rate: '',
      igst_rate: '',
    }));
  };

  /*
   * Add CGST field
   */
  const handleAddCgst = () => {
    setShowCgst(true);

    setFormErrors((prev) => ({
      ...prev,
      cgst_rate: '',
    }));
  };

  /*
   * Add SGST field
   */
  const handleAddSgst = () => {
    if (!showCgst) {
      setShowCgst(true);
    }

    setShowSgst(true);

    setFormErrors((prev) => ({
      ...prev,
      sgst_rate: '',
    }));
  };

  /*
   * Remove CGST
   */
  const handleRemoveCgst = () => {
    setShowCgst(false);

    setFormData((prev) => ({
      ...prev,
      cgst_rate: '',
    }));

    // SGST cannot exist without CGST
    if (showSgst) {
      setShowSgst(false);

      setFormData((prev) => ({
        ...prev,
        sgst_rate: '',
      }));
    }
  };

  /*
   * Remove SGST
   */
  const handleRemoveSgst = () => {
    setShowSgst(false);

    setFormData((prev) => ({
      ...prev,
      sgst_rate: '',
    }));
  };

  /*
   * Toggle IGST
   */
  const handleIgstToggle = (enabled) => {
    setApplyIgst(enabled);

    if (enabled) {
      // Interstate = only IGST
      setShowCgst(false);
      setShowSgst(false);

      setFormData((prev) => ({
        ...prev,
        cgst_rate: '',
        sgst_rate: '',
        igst_rate: '',
      }));

      setFormErrors((prev) => ({
        ...prev,
        cgst_rate: '',
        sgst_rate: '',
        igst_rate: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        igst_rate: '',
      }));

      setFormErrors((prev) => ({
        ...prev,
        igst_rate: '',
      }));
    }
  };

  /*
   * Validation
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'GST profile name is required';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    if (!formData.state) {
      errors.state = 'GST state is required';
    }

    /*
     * Same state:
     * CGST is mandatory once the field has been added.
     *
     * SGST is optional from UI perspective,
     * but if user adds SGST then it must have a valid value.
     */
    if (isSameState) {
      if (showCgst) {
        const cgst = parseFloat(formData.cgst_rate);

        if (
          formData.cgst_rate === '' ||
          Number.isNaN(cgst) ||
          cgst < 0 ||
          cgst > 100
        ) {
          errors.cgst_rate = 'CGST rate must be between 0 and 100';
        }
      }

      if (showSgst) {
        const sgst = parseFloat(formData.sgst_rate);

        if (
          formData.sgst_rate === '' ||
          Number.isNaN(sgst) ||
          sgst < 0 ||
          sgst > 100
        ) {
          errors.sgst_rate = 'SGST rate must be between 0 and 100';
        }
      }
    }

    /*
     * Different state:
     * IGST must be enabled and valid.
     */
    if (isDifferentState) {
      if (!applyIgst) {
        errors.igst_rate =
          'Please enable IGST because the GST state is different from the organization state';
      } else {
        const igst = parseFloat(formData.igst_rate);

        if (
          formData.igst_rate === '' ||
          Number.isNaN(igst) ||
          igst < 0 ||
          igst > 100
        ) {
          errors.igst_rate = 'IGST rate must be between 0 and 100';
        }
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /*
   * Submit
   */
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

        // Same-state configuration
        sgst_rate:
          isSameState && showSgst && formData.sgst_rate
            ? parseFloat(formData.sgst_rate)
            : 0,

        cgst_rate:
          isSameState && showCgst && formData.cgst_rate
            ? parseFloat(formData.cgst_rate)
            : 0,

        // Interstate configuration
        igst_rate:
          isDifferentState && applyIgst && formData.igst_rate
            ? parseFloat(formData.igst_rate)
            : 0,

        is_active: formData.is_active,
      };

      console.log('GST Profile Payload:', payload);

      const response = await authenticatedRequest(API_CONFIG.GST_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('GST profile created successfully!');

        setTimeout(() => {
          navigate('/revenue/tax');
        }, 2000);
      } else {
        setError(
          data.message ||
            data.error?.message ||
            'Failed to create GST profile'
        );
      }
    } catch (error) {
      console.error('Error creating GST profile:', error);
      setError('An error occurred while creating the GST profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * Logout
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/signin');
    }
  }, [logout, navigate]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  /*
   * Settings Dropdown
   */
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) ||
              user?.name?.charAt(0) ||
              'U'}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || user?.name || 'User'}
            </h4>

            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email ||
                user?.email ||
                'user@transev.com'}
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

  /*
   * Add Dropdown
   */
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button
          onClick={() => {
            setShowAddMenu(false);
            navigate('/add-hub');
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Zap size={18} className="text-gray-400" />
          Add Hub
        </button>

        <button
          onClick={() => {
            setShowAddMenu(false);
            navigate('/add-charger');
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Zap size={18} className="text-gray-400" />
          Add Charger
        </button>

        <button
          onClick={() => {
            setShowAddMenu(false);
            navigate('/add-customer');
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Users size={18} className="text-gray-400" />
          Add Customer
        </button>
      </div>
    </div>
  );

  /*
   * Tax field component
   */
  const TaxInput = ({
    label,
    name,
    value,
    onChange,
    error,
    description,
    onRemove,
    required = true,
  }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}{' '}
          {required && <span className="text-red-500 text-lg">*</span>}
        </label>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition"
            title={`Remove ${label}`}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Percent size={18} />
        </div>

        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          max="100"
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          } focus:outline-none focus:ring-2 focus:border-transparent transition bg-white`}
          required={required}
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-gray-400">
          {description}
        </p>
      )}
    </div>
  );

  /*
   * Loading state
   */
  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Refreshing session...
            </p>
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
        userName={
          userData?.user?.full_name || user?.name || 'User'
        }
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
                <h1 className="text-2xl font-bold text-gray-800">
                  Add GST Profile
                </h1>

                <span className="text-gray-300 text-xl">/</span>

                <span className="text-sm text-blue-500 font-medium mt-1">
                  New GST Profile
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button
                  onClick={() =>
                    setShowSettingsMenu(!showSettingsMenu)
                  }
                  className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown
                    size={16}
                    className="text-gray-400"
                  />
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

        {/* MAIN CONTENT */}
        <div className="p-6 max-w-5xl mx-auto">
          {/* PAGE HEADER */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt
                    size={24}
                    className="text-blue-600"
                  />
                  Create GST Profile
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Configure GST tax rates based on your organization
                  and GST state
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-xl shadow-sm">
                  <Shield
                    size={16}
                    className="text-blue-600"
                  />
                  <span className="text-blue-700 font-medium">
                    Secure
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-xl shadow-sm">
                  <DollarSign
                    size={16}
                    className="text-blue-600"
                  />
                  <span className="text-blue-700 font-medium">
                    Tax
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles
                  size={20}
                  className="text-blue-600"
                />
                GST Configuration
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Select your GST state and configure the applicable
                tax rates.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* ORGANIZATION INFO */}
              {organization && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Building2
                      size={18}
                      className="text-blue-600 mt-0.5 flex-shrink-0"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-800">
                        Organization Details
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div>
                          <p className="text-xs text-blue-600">
                            Business Name
                          </p>

                          <p className="text-sm font-medium text-blue-800">
                            {organization.business_name ||
                              'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-blue-600">
                            Organization State
                          </p>

                          <p className="text-sm font-medium text-blue-800 flex items-center gap-1">
                            <MapPin size={14} />
                            {organizationState || 'Not configured'}
                          </p>
                        </div>
                      </div>

                      {!organizationState && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <AlertCircle
                            size={15}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <span>
                            Please configure your organization
                            state before creating a GST profile.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Profile Name{' '}
                  <span className="text-red-500 text-lg">
                    *
                  </span>
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
                    placeholder="e.g., Standard GST, West Bengal GST"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
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

              {/* GST STATE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  GST State{' '}
                  <span className="text-red-500 text-lg">
                    *
                  </span>
                </label>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                    <MapPin size={18} />
                  </div>

                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border appearance-none ${
                      formErrors.state
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                    required
                  >
                    <option value="">
                      Select GST state
                    </option>

                    {INDIAN_STATES.map((state) => (
                      <option
                        key={state.value}
                        value={state.value}
                      >
                        {state.label}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDown size={18} />
                  </div>
                </div>

                {formErrors.state && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.state}
                  </p>
                )}

                {formData.state && organizationState && (
                  <div
                    className={`mt-3 rounded-xl border p-4 ${
                      isSameState
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isSameState ? (
                        <CheckCircle
                          size={19}
                          className="text-green-600 flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <AlertTriangle
                          size={19}
                          className="text-amber-600 flex-shrink-0 mt-0.5"
                        />
                      )}

                      <div>
                        {isSameState ? (
                          <>
                            <p className="text-sm font-semibold text-green-800">
                              Same State GST
                            </p>

                            <p className="text-xs text-green-700 mt-1">
                              GST state and organization state are
                              the same. CGST and SGST will be
                              applicable.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-amber-800">
                              Different State Detected
                            </p>

                            <p className="text-xs text-amber-700 mt-1">
                              Organization state is{' '}
                              <strong>
                                {organizationState}
                              </strong>{' '}
                              but the selected GST state is{' '}
                              <strong>
                                {formData.state}
                              </strong>
                              . Since the states are different,
                              IGST will be applicable.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* TAX CONFIGURATION */}
              {formData.state && organizationState && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">
                        Tax Rates
                      </label>

                      <p className="text-xs text-gray-500 mt-1">
                        Add only the tax fields applicable to this
                        GST configuration.
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {isSameState
                        ? 'Intra-State'
                        : 'Inter-State'}
                    </div>
                  </div>

                  {/* SAME STATE */}
                  {isSameState && (
                    <div className="space-y-4">
                      {/* Tax fields */}
                      <div
                        className={`grid grid-cols-1 ${
                          showCgst && showSgst
                            ? 'md:grid-cols-2'
                            : 'md:grid-cols-1'
                        } gap-4`}
                      >
                        {showCgst && (
                          <TaxInput
                            label="CGST Rate"
                            name="cgst_rate"
                            value={formData.cgst_rate}
                            onChange={handleChange}
                            error={formErrors.cgst_rate}
                            description="Central GST rate (0-100%)"
                            onRemove={
                              showSgst
                                ? handleRemoveCgst
                                : undefined
                            }
                          />
                        )}

                        {showSgst && (
                          <TaxInput
                            label="SGST Rate"
                            name="sgst_rate"
                            value={formData.sgst_rate}
                            onChange={handleChange}
                            error={formErrors.sgst_rate}
                            description="State GST rate (0-100%)"
                            onRemove={handleRemoveSgst}
                          />
                        )}
                      </div>

                      {/* Add field buttons */}
                      {!showCgst && (
                        <button
                          type="button"
                          onClick={handleAddCgst}
                          className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-xl py-4 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                          <Plus size={18} />
                          Add CGST Field
                        </button>
                      )}

                      {showCgst && !showSgst && (
                        <button
                          type="button"
                          onClick={handleAddSgst}
                          className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-xl py-4 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                          <Plus size={18} />
                          Add SGST Field
                        </button>
                      )}

                      {showCgst && showSgst && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle size={18} />
                            <p className="text-sm font-medium">
                              CGST + SGST configuration completed
                            </p>
                          </div>

                          <p className="text-xs text-green-600 mt-1 ml-6">
                            Both intra-state tax fields are now
                            configured.
                          </p>
                        </div>
                      )}

                      {!showCgst && (
                        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <Info
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span>
                            Click <strong>Add CGST Field</strong>{' '}
                            to add the Central GST rate. You can
                            then add SGST separately.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DIFFERENT STATE */}
                  {isDifferentState && (
                    <div className="space-y-4">
                      {/* Warning */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            size={20}
                            className="text-amber-600 flex-shrink-0 mt-0.5"
                          />

                          <div>
                            <p className="text-sm font-semibold text-amber-800">
                              Inter-State Tax Configuration
                            </p>

                            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                              The selected GST state{' '}
                              <strong>
                                {formData.state}
                              </strong>{' '}
                              is different from your organization
                              state{' '}
                              <strong>
                                {organizationState}
                              </strong>
                              . Therefore, IGST should be used
                              instead of CGST and SGST.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* IGST YES/NO */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              Apply IGST?
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              Enable IGST to configure the
                              inter-state tax rate.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleIgstToggle(false)
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                !applyIgst
                                  ? 'bg-gray-800 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              No
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleIgstToggle(true)
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                applyIgst
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Yes, Apply IGST
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* IGST FIELD */}
                      {applyIgst && (
                        <TaxInput
                          label="IGST Rate"
                          name="igst_rate"
                          value={formData.igst_rate}
                          onChange={handleChange}
                          error={formErrors.igst_rate}
                          description="Integrated GST rate (0-100%)"
                        />
                      )}

                      {!applyIgst && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle
                              size={18}
                              className="text-red-500 flex-shrink-0"
                            />

                            <div>
                              <p className="text-sm font-medium text-red-700">
                                IGST is required
                              </p>

                              <p className="text-xs text-red-600 mt-1">
                                Because the organization state and
                                selected GST state are different,
                                please select{' '}
                                <strong>
                                  Yes, Apply IGST
                                </strong>{' '}
                                to continue.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {applyIgst && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle size={18} />

                            <p className="text-sm font-medium">
                              IGST configuration enabled
                            </p>
                          </div>

                          <p className="text-xs text-green-600 mt-1 ml-6">
                            CGST and SGST fields are hidden because
                            this is an inter-state GST configuration.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STATE NOT SELECTED */}
              {!formData.state && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info
                      size={19}
                      className="text-blue-600 flex-shrink-0 mt-0.5"
                    />

                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Select GST State
                      </p>

                      <p className="text-xs text-blue-700 mt-1">
                        Select the GST state above to see the
                        applicable CGST/SGST or IGST configuration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE STATUS */}
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

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: !prev.is_active,
                        }))
                      }
                      className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                        formData.is_active
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          formData.is_active
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        } mt-0.5 shadow-md`}
                      />
                    </button>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {formData.is_active
                        ? 'Active'
                        : 'Inactive'}
                    </p>

                    <p className="text-xs text-gray-400">
                      {formData.is_active
                        ? 'GST profile will be available for use'
                        : 'GST profile will be hidden and inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                  <AlertCircle
                    size={18}
                    className="flex-shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
                  <CheckCircle
                    size={18}
                    className="flex-shrink-0"
                  />
                  <span>{success}</span>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.state ||
                    !organizationState
                  }
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
                      <ArrowRight
                        size={18}
                        className="transition"
                      />
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

          {/* FEATURES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>

                <h4 className="font-semibold text-gray-900">
                  GST Compliance
                </h4>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                Configure GST rates according to your state and
                tax requirements.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>

                <h4 className="font-semibold text-gray-900">
                  State Based
                </h4>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                Same state uses CGST + SGST, while different state
                uses IGST.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-purple-600" />
                </div>

                <h4 className="font-semibold text-gray-900">
                  Hub Assignment
                </h4>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                Assign GST profiles to hubs for automatic tax
                calculation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGSTProfile;
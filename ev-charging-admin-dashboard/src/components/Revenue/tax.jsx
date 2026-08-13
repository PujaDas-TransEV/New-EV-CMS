// src/components/Revenue/Tax.jsx
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
  Search,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  MoreVertical,
  Tag,
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
  Save,
  ExternalLink,
  Info,
  Sparkles,
  CalendarDays,
  Timer,
  Package,
  Repeat,
  Landmark,
  Banknote,
  Map,
  Navigation,
  Link,
  Unlink,
  Link2,
  Unlink2,
  ArrowRight,
} from 'lucide-react';

import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  GST_API: `${API_BASE_URL}/api/v1/cpo/gsts`,
  ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  HUB_GST_ASSIGN: (hubId) =>
    `${API_BASE_URL}/api/v1/cpo/hubs/${hubId}/gst`,
};

const Tax = () => {
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

  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [gstProfiles, setGstProfiles] = useState([]);
  const [selectedGst, setSelectedGst] = useState(null);

  const [showGstDetail, setShowGstDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  const [hubs, setHubs] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showAssignHubModal, setShowAssignHubModal] =
    useState(false);

  const [showUnassignConfirmModal, setShowUnassignConfirmModal] =
    useState(false);

  const [selectedHub, setSelectedHub] = useState(null);

  const [assignedHubs, setAssignedHubs] = useState([]);

  const [hubGstAssignments, setHubGstAssignments] = useState({});

  const [assigningHub, setAssigningHub] = useState(false);

  const [unassigningHub, setUnassigningHub] =
    useState(false);

  // Form state for GST Profile
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    sgst_rate: '',
    cgst_rate: '',
    igst_rate: '',
    is_active: true,
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Tabs configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart,
      path: '/revenue/overview',
    },
    {
      id: 'driver_tariffs',
      label: 'Customer Tariffs',
      icon: Users,
      path: '/revenue/customer-tariffs',
    },
    {
      id: 'charger_tariffs',
      label: 'Charger Tariffs',
      icon: Zap,
      path: '/revenue/charger-tariffs',
    },
    {
      id: 'hub_tariffs',
      label: 'Hub Tariffs',
      icon: Layers,
      path: '/revenue/hub-tariffs',
    },
    {
      id: 'tax',
      label: 'Tax',
      icon: Receipt,
      path: '/revenue/tax',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/revenue/settings',
    },
  ];

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    fetchUserInfo();
    fetchOrganization();
    fetchHubs();
    fetchGSTProfiles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await authenticatedRequest(
        API_CONFIG.USER_INFO_API,
        {
          method: 'GET',
        }
      );

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

  const fetchHubs = useCallback(async () => {
    setLoadingHubs(true);

    try {
      const response = await authenticatedRequest(
        API_CONFIG.HUBS_API,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const data = await response.json();

        const hubsData =
          data.hubs ||
          data.data ||
          data ||
          [];

        setHubs(hubsData);

        await fetchAllHubGstAssignments(hubsData);
      } else {
        setHubs([]);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
      setHubs([]);
    } finally {
      setLoadingHubs(false);
    }
  }, [authenticatedRequest]);

  const fetchAllHubGstAssignments = useCallback(
    async (hubsList) => {
      const assignments = {};

      for (const hub of hubsList) {
        try {
          const response =
            await authenticatedRequest(
              API_CONFIG.HUB_GST_ASSIGN(hub.id),
              {
                method: 'GET',
              }
            );

          if (response.ok) {
            const data = await response.json();

            assignments[hub.id] = data;
          }
        } catch (error) {
          console.error(
            `Error fetching GST for hub ${hub.id}:`,
            error
          );
        }
      }

      setHubGstAssignments(assignments);
    },
    [authenticatedRequest]
  );

  const fetchGSTProfiles = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authenticatedRequest(
        API_CONFIG.GST_API,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const data = await response.json();

        const profiles =
          data.gsts ||
          data.data ||
          data ||
          [];

        setGstProfiles(profiles);

        if (profiles.length > 0) {
          const selected = profiles[0];

          setSelectedGst(selected);
          setShowGstDetail(true);

          await fetchHubsForGst(selected.id);

          setFormData({
            name: selected.name || '',
            state:
              selected.state ||
              organization?.state ||
              '',
            sgst_rate:
              selected.sgst_rate ?? '',
            cgst_rate:
              selected.cgst_rate ?? '',
            igst_rate:
              selected.igst_rate ?? '',
            is_active:
              selected.is_active !== undefined
                ? selected.is_active
                : true,
          });
        }
      } else {
        setError('Failed to fetch GST profiles');
      }
    } catch (error) {
      console.error(
        'Error fetching GST profiles:',
        error
      );

      setError(
        'An error occurred while fetching GST profiles'
      );
    } finally {
      setLoading(false);
    }
  }, [
    authenticatedRequest,
    organization,
  ]);

  const fetchHubsForGst = useCallback(
    async (gstId) => {
      const assigned = [];

      for (const hub of hubs) {
        const assignment =
          hubGstAssignments[hub.id];

        if (
          assignment &&
          assignment.id === gstId
        ) {
          assigned.push(hub);
        }
      }

      setAssignedHubs(assigned);
    },
    [hubs, hubGstAssignments]
  );

  // --------------------------------------------------
  // GST SELECT / EDIT
  // --------------------------------------------------

  const handleGstSelect = async (gst) => {
    setSelectedGst(gst);
    setShowGstDetail(true);
    setIsEditing(false);

    setError('');
    setSuccess('');

    await fetchHubsForGst(gst.id);

    setFormData({
      name: gst.name || '',
      state:
        gst.state ||
        organization?.state ||
        '',
      sgst_rate:
        gst.sgst_rate ?? '',
      cgst_rate:
        gst.cgst_rate ?? '',
      igst_rate:
        gst.igst_rate ?? '',
      is_active:
        gst.is_active !== undefined
          ? gst.is_active
          : true,
    });
  };

  const handleEditGST = (gst) => {
    setSelectedGst(gst);

    setFormData({
      name: gst.name || '',
      state:
        gst.state ||
        organization?.state ||
        '',
      sgst_rate:
        gst.sgst_rate ?? '',
      cgst_rate:
        gst.cgst_rate ?? '',
      igst_rate:
        gst.igst_rate ?? '',
      is_active:
        gst.is_active !== undefined
          ? gst.is_active
          : true,
    });

    setShowEditModal(true);

    setError('');
    setSuccess('');
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setError('');
    setSuccess('');
    setFormErrors({});
  };

  // --------------------------------------------------
  // HUB ASSIGNMENT
  // --------------------------------------------------

  const handleOpenAssignHubModal = () => {
    setShowAssignHubModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseAssignHubModal = () => {
    setShowAssignHubModal(false);
    setError('');
    setSuccess('');
    setSelectedHub(null);
  };

  const handleAssignHub = async (hub) => {
    if (!selectedGst) return;

    setAssigningHub(true);
    setError('');
    setSuccess('');

    try {
      const response =
        await authenticatedRequest(
          API_CONFIG.HUB_GST_ASSIGN(hub.id),
          {
            method: 'POST',
            body: JSON.stringify({
              gst_id: selectedGst.id,
            }),
          }
        );

      if (response.ok) {
        setHubGstAssignments((prev) => ({
          ...prev,
          [hub.id]: selectedGst,
        }));

        setAssignedHubs((prev) => [
          ...prev,
          hub,
        ]);

        setSuccess(
          `GST "${selectedGst.name}" assigned to "${hub.name}" successfully!`
        );

        setTimeout(
          () => setSuccess(''),
          3000
        );

        handleCloseAssignHubModal();
      } else {
        const errorData =
          await response.json();

        setError(
          errorData.message ||
            errorData.error?.message ||
            'Failed to assign GST to hub'
        );
      }
    } catch (error) {
      console.error(
        'Error assigning GST to hub:',
        error
      );

      setError(
        'An error occurred while assigning GST to hub'
      );
    } finally {
      setAssigningHub(false);
    }
  };

  const handleUnassignHub = async (hubId) => {
    setUnassigningHub(true);

    setError('');
    setSuccess('');

    try {
      const response =
        await authenticatedRequest(
          API_CONFIG.HUB_GST_ASSIGN(hubId),
          {
            method: 'DELETE',
          }
        );

      if (response.ok) {
        setHubGstAssignments((prev) => {
          const newState = {
            ...prev,
          };

          delete newState[hubId];

          return newState;
        });

        setAssignedHubs((prev) =>
          prev.filter(
            (h) => h.id !== hubId
          )
        );

        setSuccess(
          'GST unassigned from hub successfully!'
        );

        setTimeout(
          () => setSuccess(''),
          3000
        );

        setShowUnassignConfirmModal(
          false
        );
      } else {
        const errorData =
          await response.json();

        setError(
          errorData.message ||
            errorData.error?.message ||
            'Failed to unassign GST from hub'
        );
      }
    } catch (error) {
      console.error(
        'Error unassigning GST from hub:',
        error
      );

      setError(
        'An error occurred while unassigning GST from hub'
      );
    } finally {
      setUnassigningHub(false);
    }
  };

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name =
        'GST profile name is required';
    }

    if (formData.name.trim().length > 100) {
      errors.name =
        'Name must be less than 100 characters';
    }

    const gstState =
      formData.state?.trim();

    const orgState =
      organization?.state?.trim();

    const isSameState =
      gstState &&
      orgState &&
      gstState.toLowerCase() ===
        orgState.toLowerCase();

    // Same state
    if (isSameState) {
      const cgst = parseFloat(
        formData.cgst_rate
      );

      if (
        isNaN(cgst) ||
        cgst < 0 ||
        cgst > 100
      ) {
        errors.cgst_rate =
          'CGST rate must be between 0 and 100';
      }

      if (formData.sgst_rate !== '') {
        const sgst = parseFloat(
          formData.sgst_rate
        );

        if (
          isNaN(sgst) ||
          sgst < 0 ||
          sgst > 100
        ) {
          errors.sgst_rate =
            'SGST rate must be between 0 and 100';
        }
      }
    }

    // Different state
    if (
      gstState &&
      orgState &&
      !isSameState
    ) {
      const igst = parseFloat(
        formData.igst_rate
      );

      if (
        isNaN(igst) ||
        igst < 0 ||
        igst > 100
      ) {
        errors.igst_rate =
          'IGST rate must be between 0 and 100';
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleUpdateGST = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsEditing(true);

    setError('');
    setSuccess('');

    try {
      const gstState =
        formData.state.trim();

      const orgState =
        organization?.state?.trim();

      const isSameState =
        gstState &&
        orgState &&
        gstState.toLowerCase() ===
          orgState.toLowerCase();

      /*
       * Same state:
       * CGST + SGST
       *
       * Different state:
       * IGST only
       */
      const payload = {
        name: formData.name.trim(),
        state: gstState,

        sgst_rate: isSameState
          ? formData.sgst_rate
            ? parseFloat(
                formData.sgst_rate
              )
            : 0
          : 0,

        cgst_rate: isSameState
          ? formData.cgst_rate
            ? parseFloat(
                formData.cgst_rate
              )
            : 0
          : 0,

        igst_rate: !isSameState
          ? formData.igst_rate
            ? parseFloat(
                formData.igst_rate
              )
            : 0
          : 0,

        is_active:
          formData.is_active,
      };

      const response =
        await authenticatedRequest(
          `${API_CONFIG.GST_API}/${selectedGst.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          }
        );

      const data =
        await response.json();

      if (response.ok) {
        const updatedGst = {
          ...selectedGst,
          ...payload,
        };

        setGstProfiles((prev) =>
          prev.map((g) =>
            g.id === updatedGst.id
              ? updatedGst
              : g
          )
        );

        setSelectedGst(updatedGst);

        setSuccess(
          'GST profile updated successfully!'
        );

        setTimeout(() => {
          handleCloseEditModal();
          setSuccess('');
        }, 1500);
      } else {
        setError(
          data.message ||
            data.error?.message ||
            'Failed to update GST profile'
        );
      }
    } catch (error) {
      console.error(
        'Error updating GST profile:',
        error
      );

      setError(
        'An error occurred while updating the GST profile'
      );
    } finally {
      setIsEditing(false);
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const handleCreateGST = () => {
    navigate('/revenue/add-gst');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        'Logout error:',
        error
      );

      navigate('/signin');
    }
  };

  const handleThemeToggle = () =>
    setIsDarkMode(!isDarkMode);

  const handleTabClick = (
    tabId,
    path
  ) => {
    if (tabId === 'tax') return;

    navigate(path);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date =
      new Date(dateString);

    return date.toLocaleDateString(
      'en-US',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getStatusColor = (
    isActive
  ) => {
    return isActive
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusIcon = (
    isActive
  ) => {
    return isActive ? (
      <CheckCircle className="w-3 h-3" />
    ) : (
      <XCircle className="w-3 h-3" />
    );
  };

  /*
   * IMPORTANT:
   *
   * Tax calculation is based on:
   *
   * GST Profile State
   *       vs
   * Organization / Hub State
   *
   * Same state:
   * CGST + SGST
   *
   * Different state:
   * IGST only
   */
  const getTaxConfiguration = (
    gstState,
    compareState,
    gst
  ) => {
    if (
      !gstState ||
      !compareState ||
      !gst
    ) {
      return null;
    }

    const sameState =
      gstState
        .trim()
        .toLowerCase() ===
      compareState
        .trim()
        .toLowerCase();

    if (sameState) {
      const cgst = Number(
        gst.cgst_rate || 0
      );

      const sgst = Number(
        gst.sgst_rate || 0
      );

      return {
        type: 'same',
        label: 'Same State',
        description:
          'CGST + SGST',
        cgst,
        sgst,
        total: cgst + sgst,
      };
    }

    const igst = Number(
      gst.igst_rate || 0
    );

    return {
      type: 'interstate',
      label: 'Inter-State',
      description: 'IGST',
      igst,
    };
  };

  /*
   * Hub tax type
   *
   * This is kept for the hub assignment
   * section.
   */
  const getTaxType = (
    gstState,
    hubState
  ) => {
    if (
      !gstState ||
      !hubState
    ) {
      return null;
    }

    const sameState =
      gstState
        .trim()
        .toLowerCase() ===
      hubState
        .trim()
        .toLowerCase();

    if (sameState) {
      return {
        type: 'SGST + CGST',
        label: 'Same State',
        color:
          'bg-green-100 text-green-700',
      };
    }

    return {
      type: 'IGST',
      label: 'Inter-State',
      color:
        'bg-yellow-100 text-yellow-700',
    };
  };

  // --------------------------------------------------
  // SETTINGS MENU
  // --------------------------------------------------

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
              {userData?.user?.full_name ||
                user?.name ||
                'User'}
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
          <User
            size={16}
            className="text-gray-500"
          />
          <span>Profile</span>
        </button>

        <button
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/organization');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Building
            size={16}
            className="text-gray-500"
          />
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
          <LogOut
            size={16}
            className="text-red-500"
          />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // --------------------------------------------------
  // ADD MENU
  // --------------------------------------------------

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
          <Zap
            size={18}
            className="text-gray-400"
          />
          Add Hub
        </button>

        <button
          onClick={() => {
            setShowAddMenu(false);
            navigate('/add-charger');
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Zap
            size={18}
            className="text-gray-400"
          />
          Add Charger
        </button>

        <button
          onClick={() => {
            setShowAddMenu(false);
            navigate('/add-customer');
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Users
            size={18}
            className="text-gray-400"
          />
          Add Customer
        </button>
      </div>
    </div>
  );

  // --------------------------------------------------
  // GST DETAIL
  // --------------------------------------------------

  const GSTDetail = ({
    gst,
    onClose,
    onEdit,
    onAssignHub,
    assignedHubsList,
  }) => {
    if (!gst) return null;

    const availableHubs =
      hubs.filter((hub) => {
        const assignment =
          hubGstAssignments[
            hub.id
          ];

        return (
          !assignment ||
          assignment.id !== gst.id
        );
      });

    /*
     * Main GST configuration is compared
     * against Organization State.
     */
    const taxConfig =
      getTaxConfiguration(
        gst.state,
        organization?.state,
        gst
      );

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />

            <h3 className="font-semibold text-gray-900 text-base">
              GST Profile Details
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onEdit(gst)
              }
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit GST Profile"
            >
              <Edit size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* BASIC DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Profile Name
              </p>

              <p className="text-base font-semibold text-gray-900 mt-1">
                {gst.name || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                Status
              </p>

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  gst.is_active
                )}`}
              >
                {getStatusIcon(
                  gst.is_active
                )}

                {gst.is_active
                  ? 'Active'
                  : 'Inactive'}
              </span>
            </div>
          </div>

          {/* STATE COMPARISON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* GST STATE */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin
                  size={17}
                  className="text-blue-600"
                />

                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  GST State
                </span>
              </div>

              <p className="text-base font-semibold text-gray-900">
                {gst.state || 'N/A'}
              </p>
            </div>

            {/* ORGANIZATION STATE */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2
                  size={17}
                  className="text-purple-600"
                />

                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  Organization State
                </span>
              </div>

              <p className="text-base font-semibold text-gray-900">
                {organization?.state ||
                  'N/A'}
              </p>
            </div>
          </div>

          {/* TAX CONFIGURATION */}
          {taxConfig && (
            <div className="border-t border-gray-200 pt-5">

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Tax Configuration
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Applied based on state
                    comparison
                  </p>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    taxConfig.type ===
                    'same'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {taxConfig.label}
                </span>
              </div>

              {/* SAME STATE */}
              {taxConfig.type ===
                'same' && (
                <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white overflow-hidden">

                  <div className="px-5 py-4 border-b border-green-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <CheckCircle
                          size={20}
                          className="text-green-600"
                        />
                      </div>

                      <div>
                        <h4 className="font-semibold text-green-800">
                          Same State GST
                        </h4>

                        <p className="text-xs text-green-600">
                          CGST + SGST
                          applicable
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      Intra-State
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* CGST */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          CGST
                        </span>

                        <Percent
                          size={17}
                          className="text-blue-500"
                        />
                      </div>

                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {taxConfig.cgst}
                        </span>

                        <span className="text-sm text-gray-500 mb-1">
                          %
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Central GST
                      </p>
                    </div>

                    {/* SGST */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          SGST
                        </span>

                        <Percent
                          size={17}
                          className="text-purple-500"
                        />
                      </div>

                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {taxConfig.sgst}
                        </span>

                        <span className="text-sm text-gray-500 mb-1">
                          %
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        State GST
                      </p>
                    </div>

                    {/* TOTAL */}
                    <div className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-xl border border-green-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-green-700">
                          Total GST
                        </span>

                        <Receipt
                          size={17}
                          className="text-green-600"
                        />
                      </div>

                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-green-800">
                          {taxConfig.total}
                        </span>

                        <span className="text-sm text-green-600 mb-1">
                          %
                        </span>
                      </div>

                      <p className="text-xs text-green-600 mt-1">
                        CGST + SGST
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* INTER STATE */}
              {taxConfig.type ===
                'interstate' && (
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white overflow-hidden">

                  <div className="px-5 py-4 border-b border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <ArrowRight
                          size={20}
                          className="text-amber-600"
                        />
                      </div>

                      <div>
                        <h4 className="font-semibold text-amber-800">
                          Inter-State GST
                        </h4>

                        <p className="text-xs text-amber-600">
                          IGST applicable
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      Inter-State
                    </span>
                  </div>

                  <div className="p-5">

                    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-md">

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Percent
                            size={18}
                            className="text-amber-600"
                          />

                          <span className="text-sm font-medium text-gray-500">
                            IGST
                          </span>
                        </div>

                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                          Applicable
                        </span>
                      </div>

                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {taxConfig.igst}
                        </span>

                        <span className="text-sm text-gray-500 mb-1">
                          %
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Integrated GST
                      </p>
                    </div>

                    <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <Info
                        size={17}
                        className="text-amber-600 flex-shrink-0 mt-0.5"
                      />

                      <p className="text-xs text-amber-700 leading-relaxed">
                        GST state{' '}
                        <strong>
                          {gst.state}
                        </strong>{' '}
                        is different from
                        organization state{' '}
                        <strong>
                          {
                            organization?.state
                          }
                        </strong>
                        . Therefore, only IGST
                        is applicable.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ASSIGNED HUBS */}
          <div className="border-t border-gray-200 pt-5">

            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                Assigned Hubs
              </p>

              <button
                onClick={() =>
                  onAssignHub()
                }
                disabled={
                  availableHubs.length === 0
                }
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition ${
                  availableHubs.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus size={16} />
                Assign Hub
              </button>
            </div>

            {assignedHubsList.length ===
            0 ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                <Layers
                  size={32}
                  className="text-gray-300 mx-auto mb-2"
                />

                <p className="text-base text-gray-400">
                  No hubs assigned to this
                  GST profile
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Click "Assign Hub" to
                  assign a hub
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedHubsList.map(
                  (hub) => {
                    const taxType =
                      getTaxType(
                        gst.state,
                        hub.state
                      );

                    return (
                      <div
                        key={hub.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building2
                              size={16}
                              className="text-gray-600"
                            />

                            <p className="text-base font-medium text-gray-900">
                              {hub.name}
                            </p>
                          </div>

                          <p className="text-sm text-gray-500 mt-1">
                            {hub.address}
                          </p>

                          <div className="flex items-center gap-3 mt-2 flex-wrap">

                            <div className="flex items-center gap-1.5">
                              <MapPin
                                size={14}
                                className="text-gray-400"
                              />

                              <span className="text-sm text-gray-600">
                                {hub.state ||
                                  'N/A'}
                              </span>
                            </div>

                            {taxType && (
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${taxType.color}`}
                              >
                                {taxType.label}:{' '}
                                {taxType.type}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedHub(
                                hub
                              );

                              setShowUnassignConfirmModal(
                                true
                              );
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Unassign GST from hub"
                          >
                            <Unlink2
                              size={18}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

            <p className="mt-4 text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <Sidebar
        isDarkMode={isDarkMode}
        onThemeToggle={
          handleThemeToggle
        }
        userName={
          userData?.user?.full_name ||
          user?.name ||
          'User'
        }
        userEmail={
          userData?.user?.email ||
          user?.email ||
          ''
        }
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">

        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  Revenue Management
                </h1>

                <span className="text-gray-300 text-xl">
                  /
                </span>

                <span className="text-sm text-blue-600 font-medium mt-1">
                  Tax
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">

              <div className="relative">
                <button
                  onClick={() =>
                    setShowSettingsMenu(
                      !showSettingsMenu
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <Settings
                    size={20}
                    className="text-gray-600"
                  />

                  <ChevronDown
                    size={16}
                    className="text-gray-400"
                  />
                </button>

                {showSettingsMenu && (
                  <SettingsMenu />
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setShowAddMenu(
                      !showAddMenu
                    )
                  }
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                >
                  <Plus size={18} />
                </button>

                {showAddMenu && (
                  <AddMenu />
                )}
              </div>

            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex flex-wrap items-center gap-1">

            {tabs.map((tab) => {
              const Icon = tab.icon;

              const isActive =
                tab.id === 'tax';

              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    handleTabClick(
                      tab.id,
                      tab.path
                    )
                  }
                  className={`flex items-center gap-2 px-5 py-5 rounded-t-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}

          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                GST Profiles
              </h2>

              <p className="text-sm text-gray-500">
                Manage your GST tax profiles
                and assign them to hubs
              </p>
            </div>

            <button
              onClick={
                handleCreateGST
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 text-sm font-medium"
            >
              <Plus size={18} />
              Add GST Profile
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-1">

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">

                {/* ORGANIZATION */}
                {organization && (
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">

                    <div className="flex items-start gap-3">

                      <Building2
                        size={18}
                        className="text-blue-600 mt-0.5 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {
                            organization.business_name
                          }
                        </p>

                        <div className="grid grid-cols-2 gap-1 mt-1">

                          <div>
                            <p className="text-xs text-gray-500">
                              State
                            </p>

                            <p className="text-sm font-medium text-gray-700">
                              {organization.state ||
                                'N/A'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              GSTIN
                            </p>

                            <p className="text-sm font-medium text-gray-700 truncate">
                              {organization.gstin ||
                                'N/A'}
                            </p>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEARCH */}
                <div className="p-3 border-b border-gray-200">

                  <div className="relative">

                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Search GST profiles..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* LIST */}
                <div className="p-3">

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                  ) : gstProfiles.length ===
                    0 ? (
                    <div className="text-center py-8">

                      <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />

                      <p className="text-gray-500 text-sm">
                        No GST profiles
                        found
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add GST
                        Profile" to
                        create one
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">

                      {gstProfiles
                        .filter((g) =>
                          g.name
                            ?.toLowerCase()
                            .includes(
                              searchQuery.toLowerCase()
                            )
                        )
                        .map((gst) => {

                          const assignedCount =
                            hubs.filter(
                              (h) => {
                                const assignment =
                                  hubGstAssignments[
                                    h.id
                                  ];

                                return (
                                  assignment &&
                                  assignment.id ===
                                    gst.id
                                );
                              }
                            ).length;

                          const taxConfig =
                            getTaxConfiguration(
                              gst.state,
                              organization?.state,
                              gst
                            );

                          return (
                            <button
                              key={gst.id}
                              onClick={() =>
                                handleGstSelect(
                                  gst
                                )
                              }
                              className={`w-full text-left p-3 rounded-xl border transition ${
                                selectedGst?.id ===
                                gst.id
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >

                              <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3">

                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                    {gst.name?.charAt(
                                      0
                                    ) || 'G'}
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {gst.name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      {taxConfig?.type ===
                                      'interstate'
                                        ? `IGST: ${taxConfig.igst}%`
                                        : `CGST: ${taxConfig?.cgst || 0}% • SGST: ${taxConfig?.sgst || 0}%`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">

                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                      gst.is_active
                                    )}`}
                                  >
                                    {getStatusIcon(
                                      gst.is_active
                                    )}

                                    {gst.is_active
                                      ? 'Active'
                                      : 'Inactive'}
                                  </span>

                                  {assignedCount >
                                    0 && (
                                    <span className="text-xs text-blue-600 font-medium">
                                      {
                                        assignedCount
                                      }{' '}
                                      hub
                                      {assignedCount >
                                      1
                                        ? 's'
                                        : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">

                                <span>
                                  State:{' '}
                                  {gst.state ||
                                    'N/A'}
                                </span>

                                <span>
                                  {taxConfig?.type ===
                                  'interstate'
                                    ? 'IGST'
                                    : 'CGST + SGST'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-2">

              {selectedGst ? (
                <GSTDetail
                  gst={selectedGst}
                  onClose={() => {
                    setShowGstDetail(
                      false
                    );

                    setSelectedGst(
                      null
                    );
                  }}
                  onEdit={
                    handleEditGST
                  }
                  onAssignHub={
                    handleOpenAssignHubModal
                  }
                  assignedHubsList={
                    assignedHubs
                  }
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">

                  <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-3" />

                  <p className="text-gray-500 font-medium">
                    Select a GST Profile
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    Choose a GST profile
                    from the left to
                    view its details
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          EDIT GST MODAL
      ===================================================== */}

      {showEditModal &&
        selectedGst && (
          <div className="fixed inset-0 z-50 overflow-y-auto">

            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-gray-500 opacity-75"
                  onClick={
                    handleCloseEditModal
                  }
                ></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">

                {/* MODAL HEADER */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Receipt className="w-5 h-5 text-blue-600" />

                      <h3 className="text-lg font-semibold text-gray-900">
                        Edit GST Profile
                      </h3>
                    </div>

                    <button
                      onClick={
                        handleCloseEditModal
                      }
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Update GST profile
                    details
                  </p>
                </div>

                {/* FORM */}
                <form
                  onSubmit={
                    handleUpdateGST
                  }
                  className="px-6 py-6 space-y-5"
                >

                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Profile Name{' '}
                      <span className="text-red-500">
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
                        value={
                          formData.name
                        }
                        onChange={
                          handleChange
                        }
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
                        {
                          formErrors.name
                        }
                      </p>
                    )}
                  </div>

                  {/* STATE */}
                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      GST State
                    </label>

                    <div className="relative">

                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <MapPin size={18} />
                      </div>

                      <input
                        type="text"
                        name="state"
                        value={
                          formData.state
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                      />
                    </div>

                    {organization?.state && (
                      <p className="mt-2 text-xs text-gray-500">
                        Organization State:{' '}
                        <strong>
                          {
                            organization.state
                          }
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* TAX PREVIEW */}
                  {formData.state &&
                    organization?.state && (
                      <div>
                        {(() => {
                          const previewGst =
                            {
                              cgst_rate:
                                formData.cgst_rate ||
                                0,
                              sgst_rate:
                                formData.sgst_rate ||
                                0,
                              igst_rate:
                                formData.igst_rate ||
                                0,
                            };

                          const preview =
                            getTaxConfiguration(
                              formData.state,
                              organization.state,
                              previewGst
                            );

                          if (
                            !preview
                          )
                            return null;

                          return (
                            <>
                              {preview.type ===
                              'same' ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">

                                  <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle
                                      size={18}
                                      className="text-green-600"
                                    />

                                    <div>
                                      <p className="text-sm font-semibold text-green-800">
                                        Same State
                                      </p>

                                      <p className="text-xs text-green-600">
                                        CGST + SGST
                                        will be
                                        used
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">

                                    <div className="bg-white rounded-lg border border-green-100 p-3">
                                      <p className="text-xs text-gray-500">
                                        CGST
                                      </p>

                                      <p className="text-lg font-bold text-gray-900">
                                        {
                                          preview.cgst
                                        }
                                        %
                                      </p>
                                    </div>

                                    <div className="bg-white rounded-lg border border-green-100 p-3">
                                      <p className="text-xs text-gray-500">
                                        SGST
                                      </p>

                                      <p className="text-lg font-bold text-gray-900">
                                        {
                                          preview.sgst
                                        }
                                        %
                                      </p>
                                    </div>

                                  </div>
                                </div>
                              ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">

                                  <div className="flex items-center gap-2 mb-3">
                                    <ArrowRight
                                      size={18}
                                      className="text-amber-600"
                                    />

                                    <div>
                                      <p className="text-sm font-semibold text-amber-800">
                                        Inter-State
                                      </p>

                                      <p className="text-xs text-amber-600">
                                        Only IGST will
                                        be used
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white rounded-lg border border-amber-100 p-3">
                                    <p className="text-xs text-gray-500">
                                      IGST
                                    </p>

                                    <p className="text-lg font-bold text-gray-900">
                                      {
                                        preview.igst
                                      }
                                      %
                                    </p>
                                  </div>

                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                  {/* TAX INPUTS */}
                  <div>

                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Tax Rates
                    </label>

                    {(() => {
                      const isSameState =
                        formData.state &&
                        organization?.state &&
                        formData.state
                          .trim()
                          .toLowerCase() ===
                          organization.state
                            .trim()
                            .toLowerCase();

                      return isSameState ? (
                        /* SAME STATE */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {/* CGST */}
                          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CGST{' '}
                              <span className="text-red-500">
                                *
                              </span>
                            </label>

                            <div className="relative">

                              <Percent
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />

                              <input
                                type="number"
                                name="cgst_rate"
                                value={
                                  formData.cgst_rate
                                }
                                onChange={
                                  handleChange
                                }
                                placeholder="0"
                                step="0.01"
                                min="0"
                                max="100"
                                className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                                  formErrors.cgst_rate
                                    ? 'border-red-300'
                                    : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                              />
                            </div>

                            {formErrors.cgst_rate && (
                              <p className="mt-1 text-xs text-red-600">
                                {
                                  formErrors.cgst_rate
                                }
                              </p>
                            )}
                          </div>

                          {/* SGST */}
                          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SGST{' '}
                              <span className="text-gray-400">
                                (optional)
                              </span>
                            </label>

                            <div className="relative">

                              <Percent
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />

                              <input
                                type="number"
                                name="sgst_rate"
                                value={
                                  formData.sgst_rate
                                }
                                onChange={
                                  handleChange
                                }
                                placeholder="0"
                                step="0.01"
                                min="0"
                                max="100"
                                className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                                  formErrors.sgst_rate
                                    ? 'border-red-300'
                                    : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                            </div>

                            {formErrors.sgst_rate && (
                              <p className="mt-1 text-xs text-red-600">
                                {
                                  formErrors.sgst_rate
                                }
                              </p>
                            )}
                          </div>

                        </div>
                      ) : (
                        /* INTER STATE */
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">

                          <label className="block text-sm font-medium text-amber-800 mb-2">
                            IGST
                          </label>

                          <div className="relative">

                            <Percent
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                              type="number"
                              name="igst_rate"
                              value={
                                formData.igst_rate
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="0"
                              step="0.01"
                              min="0"
                              max="100"
                              className={`w-full pl-9 pr-4 py-3 rounded-xl border ${
                                formErrors.igst_rate
                                  ? 'border-red-300'
                                  : 'border-amber-200'
                              } focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white`}
                            />
                          </div>

                          <p className="text-xs text-amber-700 mt-2">
                            GST state is
                            different from
                            organization state.
                            Only IGST will be
                            applied.
                          </p>

                          {formErrors.igst_rate && (
                            <p className="mt-1 text-xs text-red-600">
                              {
                                formErrors.igst_rate
                              }
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* STATUS */}
                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">

                      <div className="relative">

                        <input
                          type="checkbox"
                          name="is_active"
                          id="edit_is_active"
                          checked={
                            formData.is_active
                          }
                          onChange={
                            handleChange
                          }
                          className="sr-only"
                        />

                        <div
                          onClick={() =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                is_active:
                                  !prev.is_active,
                              })
                            )
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
                        </div>
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
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle
                        size={16}
                        className="flex-shrink-0"
                      />

                      <span>
                        {error}
                      </span>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
                      <CheckCircle
                        size={16}
                        className="flex-shrink-0"
                      />

                      <span>
                        {success}
                      </span>
                    </div>
                  )}

                  {/* ACTION */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">

                    <button
                      type="submit"
                      disabled={isEditing}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Update Profile
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleCloseEditModal
                      }
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                    >
                      Cancel
                    </button>

                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          ASSIGN HUB MODAL
      ===================================================== */}

      {showAssignHubModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">

          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={
                  handleCloseAssignHubModal
                }
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-blue-600" />

                    <h3 className="text-lg font-semibold text-gray-900">
                      Assign Hub to GST
                    </h3>
                  </div>

                  <button
                    onClick={
                      handleCloseAssignHubModal
                    }
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Select a hub to assign
                  to "
                  {selectedGst?.name}
                  "
                </p>

                {organization?.state && (
                  <p className="text-xs text-blue-600 mt-1">
                    Organization State:{' '}
                    {
                      organization.state
                    }
                  </p>
                )}
              </div>

              <div className="px-6 py-6">

                {loadingHubs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">

                    {hubs
                      .filter(
                        (hub) =>
                          !hubGstAssignments[
                            hub.id
                          ]
                      )
                      .map((hub) => {

                        const taxType =
                          getTaxType(
                            selectedGst?.state,
                            hub.state
                          );

                        return (
                          <button
                            key={hub.id}
                            onClick={() =>
                              handleAssignHub(
                                hub
                              )
                            }
                            disabled={
                              assigningHub
                            }
                            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-between group disabled:opacity-50"
                          >

                            <div className="flex-1">

                              <div className="flex items-center gap-2">

                                <Building2
                                  size={16}
                                  className="text-gray-600"
                                />

                                <p className="text-sm font-medium text-gray-900">
                                  {hub.name}
                                </p>
                              </div>

                              <p className="text-sm text-gray-500">
                                {
                                  hub.address
                                }
                              </p>

                              <div className="flex items-center gap-3 mt-2 flex-wrap">

                                <div className="flex items-center gap-1.5">
                                  <MapPin
                                    size={14}
                                    className="text-gray-400"
                                  />

                                  <span className="text-sm text-gray-600">
                                    {hub.state ||
                                      'N/A'}
                                  </span>
                                </div>

                                {taxType && (
                                  <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${taxType.color}`}
                                  >
                                    {
                                      taxType.type
                                    }
                                  </span>
                                )}

                              </div>
                            </div>

                            <div className="ml-4">
                              <Plus
                                size={20}
                                className="text-blue-600 opacity-0 group-hover:opacity-100 transition"
                              />
                            </div>

                          </button>
                        );
                      })}

                    {hubs.filter(
                      (hub) =>
                        !hubGstAssignments[
                          hub.id
                        ]
                    ).length === 0 && (
                      <div className="text-center py-8">

                        <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />

                        <p className="text-gray-500 text-sm">
                          All hubs are
                          assigned
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          All available
                          hubs already
                          have a GST
                          assigned
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle size={16} />

                    <span>
                      {error}
                    </span>
                  </div>
                )}

                {success && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle size={16} />

                    <span>
                      {success}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">

                <button
                  onClick={
                    handleCloseAssignHubModal
                  }
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          UNASSIGN CONFIRMATION MODAL
      ===================================================== */}

      {showUnassignConfirmModal &&
        selectedHub && (
          <div className="fixed inset-0 z-50 overflow-y-auto">

            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-gray-500 opacity-75"
                  onClick={() =>
                    setShowUnassignConfirmModal(
                      false
                    )
                  }
                ></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">

                <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <AlertCircle className="w-5 h-5 text-red-600" />

                      <h3 className="text-lg font-semibold text-gray-900">
                        Unassign GST
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        setShowUnassignConfirmModal(
                          false
                        )
                      }
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    Confirm unassigning
                    GST from hub
                  </p>
                </div>

                <div className="px-6 py-6">

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">

                    <p className="text-sm text-gray-700">
                      Are you sure you
                      want to unassign{' '}
                      <strong>
                        GST
                      </strong>{' '}
                      from
                      <span className="font-semibold text-gray-900">
                        {' '}
                        "{selectedHub.name}"
                      </span>
                      ?
                    </p>

                    <p className="text-xs text-yellow-600 mt-2">
                      This action cannot
                      be undone. The hub
                      will no longer have a
                      GST assigned.
                    </p>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">

                      <AlertCircle size={16} />

                      <span>
                        {error}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">

                  <button
                    onClick={() =>
                      handleUnassignHub(
                        selectedHub.id
                      )
                    }
                    disabled={
                      unassigningHub
                    }
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {unassigningHub ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Unassigning...
                      </>
                    ) : (
                      <>
                        <Unlink2
                          size={18}
                        />
                        Yes, Unassign
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setShowUnassignConfirmModal(
                        false
                      )
                    }
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Tax;
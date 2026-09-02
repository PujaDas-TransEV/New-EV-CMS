// src/components/PaymentIntegration/Payment.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import Sidebar from "../Sidebar/Sidebar";
import {
  Settings,
  Plus,
  ChevronDown,
  LogOut,
  User,
  Building,
  Shield,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  CreditCard,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Edit,
  Save,
  ArrowLeft,
  Key,
  Lock,
  Unlock,
  Check,
  AlertTriangle,
  Info,
  Globe,
  Database,
  Server,
  Clock,
  DollarSign,
  Wallet,
  Smartphone,
  QrCode,
  Copy,
  ExternalLink,
  Cloud,
  CloudOff,
  Activity,
  CheckCheck,
  Link as LinkIcon
} from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  INTEGRATIONS_API: `${API_BASE_URL}/api/v1/cpo/integrations`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const CPOPaymentIntegration = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
  // State Management
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [integration, setIntegration] = useState(null);
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    key_id: "",
    key_secret: "",
    webhook_secret: ""
  });
  
  const [showKeyId, setShowKeyId] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Check authentication on mount
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch Integration
  const fetchIntegration = useCallback(async () => {
    setIsIntegrationLoading(true);
    try {
      const response = await authenticatedRequest(`${API_CONFIG.INTEGRATIONS_API}/RAZORPAY`, {
        method: 'GET'
      });

      if (response.status === 404) {
        setIntegration(null);
      } else if (response.ok) {
        const data = await response.json();
        setIntegration(data);
      }
    } catch (error) {
      console.error('Error fetching integration:', error);
      setIntegration(null);
    } finally {
      setIsIntegrationLoading(false);
    }
  }, [authenticatedRequest]);

  useEffect(() => {
    if (userData) {
      fetchIntegration();
    }
  }, [userData, fetchIntegration]);

  // Handle Form Change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle Submit - Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsIntegrationLoading(true);

    try {
      // Validate
      if (!formData.key_id || !formData.key_secret) {
        setMessage("Key ID and Key Secret are required");
        setMessageType("error");
        setIsIntegrationLoading(false);
        return;
      }

      const payload = {
        key_id: formData.key_id,
        key_secret: formData.key_secret,
        webhook_secret: formData.webhook_secret || undefined
      };

      const url = `${API_CONFIG.INTEGRATIONS_API}/RAZORPAY`;

      const response = await authenticatedRequest(url, {
        method: 'PUT',
        headers: {
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(integration ? "Integration updated successfully!" : "Integration configured successfully!");
        setMessageType("success");
        setIntegration(data);
        setShowConfigForm(false);
        setFormData({ key_id: "", key_secret: "", webhook_secret: "" });
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(data.error?.message || 'Failed to configure integration');
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message || "Server error. Try again.");
      setMessageType("error");
    } finally {
      setIsIntegrationLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    setMessage("");
    setMessageType("");
    setIsIntegrationLoading(true);

    try {
      const response = await authenticatedRequest(`${API_CONFIG.INTEGRATIONS_API}/RAZORPAY`, {
        method: 'DELETE',
        headers: {
          'X-CPO-App-ID': CPO_APP_ID
        }
      });

      if (response.status === 204) {
        setMessage("Integration removed successfully!");
        setMessageType("success");
        setIntegration(null);
        setShowDeleteConfirm(false);
        setTimeout(() => setMessage(""), 5000);
      } else {
        const data = await response.json();
        setMessage(data.error?.message || 'Failed to remove integration');
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message || "Server error. Try again.");
      setMessageType("error");
    } finally {
      setIsIntegrationLoading(false);
    }
  };

  // Handle Logout
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

  // Render Integration Card
  const renderIntegrationCard = () => {
    if (isIntegrationLoading && !integration) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading integration details...</p>
          </div>
        </div>
      );
    }

    if (!integration) {
      return (
        <div className="bg-white rounded-2xl border-2 border-dashed border-green-300 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
              <CreditCard className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Integration Configured</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Connect your Razorpay account to start accepting payments through the platform.
            </p>
            <button
              onClick={() => setShowConfigForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-500/25"
            >
              <Plus size={20} />
              Configure Integration
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Razorpay Integration</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${
                  integration.is_active 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {integration.is_active ? (
                    <>
                      <CheckCircle size={12} />
                      Active
                    </>
                  ) : (
                    <>
                      <X size={12} />
                      Inactive
                    </>
                  )}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  Configured: {new Date(integration.configured_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFormData({
                  key_id: '',
                  key_secret: '',
                  webhook_secret: ''
                });
                setShowConfigForm(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium shadow-lg shadow-green-500/25"
            >
              <Edit size={16} />
              Update
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm flex items-center gap-2 border border-red-200"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Key ID</p>
                  <p className="font-mono text-sm text-gray-900 mt-0.5">{integration.display_hint || '••••••••••'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Key Secret</p>
                  <p className="font-mono text-sm text-gray-600 mt-0.5">••••••••••••••••</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Provider</p>
                  <p className="text-sm text-gray-900 font-medium mt-0.5">Razorpay</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Security</p>
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle size={14} />
                    Encrypted Storage
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</p>
                  <p className="text-sm text-gray-900 font-medium mt-0.5">
                    {new Date(integration.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Config Form
  const renderConfigForm = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {integration ? 'Update Razorpay Credentials' : 'Configure Razorpay Integration'}
            </h3>
            <p className="text-sm text-gray-500">
              {integration ? 'Update your existing Razorpay credentials' : 'Connect your Razorpay account for payment processing'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowConfigForm(false);
            setFormData({ key_id: "", key_secret: "", webhook_secret: "" });
          }}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Razorpay Key ID <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Key size={18} />
            </div>
            <input
              type={showKeyId ? "text" : "password"}
              name="key_id"
              value={formData.key_id}
              onChange={handleChange}
              placeholder="Enter your Razorpay Key ID"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-12 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition hover:border-green-300"
            />
            <button
              type="button"
              onClick={() => setShowKeyId(!showKeyId)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKeyId ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            Razorpay Key Secret <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type={showKeySecret ? "text" : "password"}
              name="key_secret"
              value={formData.key_secret}
              onChange={handleChange}
              placeholder="Enter your Razorpay Key Secret"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-12 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition hover:border-green-300"
            />
            <button
              type="button"
              onClick={() => setShowKeySecret(!showKeySecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKeySecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            Webhook Secret <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative mt-1.5">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Shield size={18} />
            </div>
            <input
              type={showWebhookSecret ? "text" : "password"}
              name="webhook_secret"
              value={formData.webhook_secret}
              onChange={handleChange}
              placeholder="Enter your Razorpay Webhook Secret"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-12 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition hover:border-green-300"
            />
            <button
              type="button"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showWebhookSecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Webhook secret is used to verify incoming webhook requests from Razorpay
          </p>
        </div>

        {message && (
          <div className={`border rounded-xl p-4 ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="flex items-center gap-2">
              {messageType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isIntegrationLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIntegrationLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                {integration ? 'Update Credentials' : 'Save Integration'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowConfigForm(false);
              setFormData({ key_id: "", key_secret: "", webhook_secret: "" });
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  // Delete Confirmation Modal
  const renderDeleteModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Remove Integration</h3>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove the Razorpay integration? This will permanently delete all configured credentials. This action cannot be undone.
        </p>
        {message && (
          <div className={`border rounded-xl p-4 mb-4 ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <p className="flex items-center gap-2 text-sm">
              {messageType === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={isIntegrationLoading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIntegrationLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Remove Integration
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

  // Show loading if refreshing
  if (isRefreshing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isRefreshing ? 'Refreshing session...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        userName={userData?.user?.full_name || user?.name || 'User'}
        userEmail={userData?.user?.email || user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Payment Integration</h1>
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
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard size={24} className="text-green-600" />
                  Payment Gateway Configuration
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your Razorpay integration settings for processing customer payments
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Secure Connection</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <Server size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">
                    {integration?.is_active ? 'Live' : 'Not Configured'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Card or Config Form */}
          {showConfigForm ? renderConfigForm() : renderIntegrationCard()}

          {/* Integration Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Secure Payments</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                All transactions are processed through Razorpay's secure payment gateway with SSL encryption
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Multiple Payment Methods</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Support for UPI, Credit/Debit Cards, Net Banking, and popular wallets
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <QrCode className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">QR Code Payments</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Generate QR codes for quick and easy payments using any UPI app
              </p>
            </div>
          </div>

          {/* Documentation / Help */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Need Help with Integration?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Follow our step-by-step guide to set up Razorpay integration for your CPO.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.open('https://razorpay.com/docs/payment-gateway/', '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition"
                  >
                    View Documentation
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => window.open('https://razorpay.com/support/', '_blank')}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1.5 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
                  >
                    Razorpay Support
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && renderDeleteModal()}
    </div>
  );
};

export default CPOPaymentIntegration;
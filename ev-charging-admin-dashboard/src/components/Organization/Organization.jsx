// src/pages/Organization.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Link as LinkIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// Get API Base URL from environment with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// Log to verify environment variables are loaded
console.log('API Base URL:', API_BASE_URL);
console.log('CPO App ID:', CPO_APP_ID);

// API Configuration
const API_CONFIG = {
  ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.log('No refresh token found');
    return { success: false, error: 'No refresh token available' };
  }

  try {
    const response = await fetch(API_CONFIG.REFRESH_TOKEN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CPO-App-ID': CPO_APP_ID
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await response.json();
    console.log('Refresh token response:', data);

    if (response.ok && data.access_token) {
      localStorage.setItem('token', data.access_token);
      
      if (data.expires_in) {
        localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));
      }
      
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return { success: true, token: data.access_token };
    } else {
      console.log('Refresh token failed:', data);
      return { success: false, error: data.message || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

const fetchWithTokenRefresh = async (url, options = {}, retryCount = 2) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  console.log('Fetching URL:', url); // Log the URL being called

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'X-CPO-App-ID': CPO_APP_ID,
        'Content-Type': 'application/json',
      }
    });

    // Check if token expired (401)
    if (response.status === 401 && retryCount > 0) {
      console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
      
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
          }
        });
        
        if (retryResponse.ok) {
          return retryResponse;
        } else if (retryResponse.status === 401 && retryCount > 1) {
          return fetchWithTokenRefresh(url, options, retryCount - 1);
        }
      } else {
        // Refresh failed - clear storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('userInfo');
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const Organization = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Organization state
  const [orgData, setOrgData] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState('');
  
  // Fetch user info and organization data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchUserInfo();
      await fetchOrganizationData();
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.message && error.message.includes('Session expired')) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info:', data);
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
    }
  };

  const fetchOrganizationData = async () => {
    setOrgLoading(true);
    setOrgError('');
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.ORGANIZATION_API, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Organization data:', data);

      if (response.ok) {
        setOrgData(data);
      } else {
        setOrgError(data.message || data.error?.message || 'Failed to fetch organization data');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setOrgError(error.message || 'An error occurred while fetching organization data');
    } finally {
      setOrgLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    setLoggingOut(true);

    try {
      if (token) {
        await fetch(API_CONFIG.LOGOUT_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      setLoggingOut(false);
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // Format date
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

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
      'SUSPENDED': 'bg-red-100 text-red-800 border-red-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
        return <CheckCircle className="w-3 h-3" />;
      case 'PENDING':
        return <Clock className="w-3 h-3" />;
      case 'INACTIVE':
      case 'REJECTED':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || 'User'}
            </h4>
            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email || 'user@transev.com'}
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
          <Plus size={18} className="text-gray-500" /> Add Hub
        </button>
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-charger");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Plus size={18} className="text-gray-500" /> Add Charger
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        userName={userData?.user?.full_name || 'User'}
        userEmail={userData?.user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Building size={20} className="text-white" />
                </div> */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                 
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              {/* Settings Icon */}
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

              {/* Add Button */}
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex gap-0">
            <button
              onClick={() => {}} // Stay on current page
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 border-green-600 text-green-700 bg-green-50/50`}
            >
              <Building size={16} />
              Organization
            </button>
            <button
              onClick={() => navigate('/manage-hubs')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`}
            >
              <Layers size={16} />
              Manage Hubs
            </button>
          </div>
        </div>

        {/* Content - Organization Details */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {orgLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                  <p className="text-gray-500">Loading organization data...</p>
                </div>
              </div>
            ) : orgError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{orgError}</span>
              </div>
            ) : orgData ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Card Header with Logo */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
                      <Building className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{orgData.business_name || 'Organization'}</h2>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(orgData.status)}`}>
                          {getStatusIcon(orgData.status)}
                          {orgData.status || 'PENDING'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: {orgData.slug || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Type: {orgData.company_type || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{userData?.user?.email || 'info@transev.com'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">GSTIN</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{orgData.gstin || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {orgData.city && orgData.state 
                            ? `${orgData.city}, ${orgData.state}` 
                            : 'N/A'}
                          {orgData.pincode && ` - ${orgData.pincode}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Hash className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">App ID</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{orgData.app_id || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">App ID Mode</p>
                        <p className="text-sm font-medium text-gray-900">{orgData.app_id_mode || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(orgData.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{orgData.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">City</p>
                      <p className="text-sm font-medium text-gray-900">{orgData.city || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">State</p>
                      <p className="text-sm font-medium text-gray-900">{orgData.state || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Status Changed</p>
                        <p className="text-xs font-medium text-gray-700">{formatDate(orgData.status_changed_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="text-xs font-medium text-gray-700">{formatDate(orgData.updated_at)}</p>
                      </div>
                    </div>
                    {/* Terms and Conditions Link */}
                    <a
                      href="https://transev.site/terms-conditions/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Terms and Conditions
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No organization data found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organization;
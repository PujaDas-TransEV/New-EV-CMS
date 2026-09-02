// src/components/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Smartphone,
  Monitor,
  Shield,
  CheckCircle,
  AlertCircle,
  Trash2,
  Power,
  Activity,
  Key,
  Lock,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_CONFIG = {
  USER_INFO_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/me',
  SESSIONS_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/sessions',
  DELETE_SESSION_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/sessions',
  LOGOUT_ALL_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/logout/all',
  CHANGE_PASSWORD_API: 'https://dev-evcmsnew.transev.site/api/v1/auth/password/change',
};

const Profile = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [deletingSession, setDeletingSession] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    loadProfileData();
  }, [isAuthenticated, navigate]);

  const loadProfileData = async () => {
    try {
      await Promise.all([
        fetchUserInfo(),
        fetchSessions()
      ]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
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
      } else {
        throw new Error('Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.SESSIONS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sessions:', data);
        setSessions(data.sessions || []);
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  };

  const deleteSession = async (sessionId) => {
    setDeletingSession(sessionId);
    try {
      const response = await authenticatedRequest(`${API_CONFIG.DELETE_SESSION_API}/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
      } else {
        throw new Error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setDeletingSession(null);
    }
  };

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

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);

    try {
      const response = await authenticatedRequest(API_CONFIG.LOGOUT_ALL_API, {
        method: 'POST'
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token_expiry');
        navigate('/signin');
      } else {
        throw new Error('Failed to logout all sessions');
      }
    } catch (error) {
      console.error('Logout all error:', error);
      setLoggingOutAll(false);
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

  // Get device info from user agent
  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    
    let device = 'Unknown';
    let browser = 'Unknown';
    let os = 'Unknown';

    if (userAgent.includes('Mobile')) {
      device = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      device = 'Tablet';
    } else if (userAgent.includes('Mac') || userAgent.includes('Windows') || userAgent.includes('Linux')) {
      device = 'Desktop';
    }

    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
    }

    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      os = 'iOS';
    }

    return { device, browser, os };
  };

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

  // Change Password Modal Component
  const ChangePasswordModal = () => {
    // Local state for password fields
    const [localCurrentPassword, setLocalCurrentPassword] = useState('');
    const [localNewPassword, setLocalNewPassword] = useState('');
    const [localConfirmPassword, setLocalConfirmPassword] = useState('');
    const [localShowCurrentPassword, setLocalShowCurrentPassword] = useState(false);
    const [localShowNewPassword, setLocalShowNewPassword] = useState(false);
    const [localShowConfirmPassword, setLocalShowConfirmPassword] = useState(false);
    const [localPasswordError, setLocalPasswordError] = useState('');
    const [localPasswordSuccess, setLocalPasswordSuccess] = useState('');
    const [localChangePasswordLoading, setLocalChangePasswordLoading] = useState(false);

    // Reset local states when modal closes
    useEffect(() => {
      if (!showChangePassword) {
        setLocalCurrentPassword('');
        setLocalNewPassword('');
        setLocalConfirmPassword('');
        setLocalPasswordError('');
        setLocalPasswordSuccess('');
        setLocalShowCurrentPassword(false);
        setLocalShowNewPassword(false);
        setLocalShowConfirmPassword(false);
      }
    }, [showChangePassword]);

    // Password validation function
    const validatePassword = (password) => {
      // Must be at least 10 characters
      if (password.length < 10) {
        return 'Password must be at least 10 characters long';
      }
      
      // Must contain at least one uppercase letter
      if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
      }
      
      // Must contain at least one lowercase letter
      if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
      }
      
      // Must contain at least one number
      if (!/\d/.test(password)) {
        return 'Password must contain at least one number';
      }
      
      // Must contain at least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return 'Password must contain at least one special character';
      }
      
      return null; // Password is valid
    };

    const handleLocalChangePassword = async (e) => {
      e.preventDefault();
      setLocalPasswordError('');
      setLocalPasswordSuccess('');

      // Validation
      if (!localCurrentPassword) {
        setLocalPasswordError('Current password is required');
        return;
      }

      if (!localNewPassword) {
        setLocalPasswordError('New password is required');
        return;
      }

      // Validate new password strength
      const passwordValidationError = validatePassword(localNewPassword);
      if (passwordValidationError) {
        setLocalPasswordError(passwordValidationError);
        return;
      }

      if (localNewPassword !== localConfirmPassword) {
        setLocalPasswordError('Passwords do not match');
        return;
      }

      if (localNewPassword === localCurrentPassword) {
        setLocalPasswordError('New password must be different from current password');
        return;
      }

      setLocalChangePasswordLoading(true);

      try {
        const response = await authenticatedRequest(API_CONFIG.CHANGE_PASSWORD_API, {
          method: 'POST',
          body: JSON.stringify({
            current_password: localCurrentPassword,
            new_password: localNewPassword
          })
        });

        const data = await response.json();
        console.log('Change password response:', data);

        if (response.ok) {
          setLocalPasswordSuccess('Password changed successfully!');
          setLocalCurrentPassword('');
          setLocalNewPassword('');
          setLocalConfirmPassword('');
          setTimeout(() => {
            setShowChangePassword(false);
            setLocalPasswordSuccess('');
            setLocalPasswordError('');
          }, 3000);
        } else {
          // Handle API error response
          const errorMessage = data.error?.message || data.message || 'Failed to change password. Please try again.';
          setLocalPasswordError(errorMessage);
        }
      } catch (error) {
        console.error('Change password error:', error);
        setLocalPasswordError('An error occurred. Please try again.');
      } finally {
        setLocalChangePasswordLoading(false);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => {
          setShowChangePassword(false);
          setLocalPasswordError('');
          setLocalPasswordSuccess('');
          setLocalCurrentPassword('');
          setLocalNewPassword('');
          setLocalConfirmPassword('');
        }}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Key size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Change Password</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Update your password</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setLocalPasswordError('');
                  setLocalPasswordSuccess('');
                  setLocalCurrentPassword('');
                  setLocalNewPassword('');
                  setLocalConfirmPassword('');
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white hover:rotate-90 duration-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {localPasswordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm">{localPasswordSuccess}</span>
                </div>
              </div>
            )}

            {localPasswordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm">{localPasswordError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLocalChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={localShowCurrentPassword ? "text" : "password"}
                    value={localCurrentPassword}
                    onChange={(e) => setLocalCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setLocalShowCurrentPassword(!localShowCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {localShowCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={localShowNewPassword ? "text" : "password"}
                    value={localNewPassword}
                    onChange={(e) => setLocalNewPassword(e.target.value)}
                    placeholder="Enter new password (min 10 characters)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    required
                    minLength={10}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setLocalShowNewPassword(!localShowNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {localShowNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400">Password must contain:</p>
                  <ul className="text-xs text-gray-400 space-y-0.5">
                    <li className={`flex items-center gap-1 ${localNewPassword.length >= 10 ? 'text-green-600' : ''}`}>
                      {localNewPassword.length >= 10 ? <CheckCircle size={12} /> : <span className="w-3 h-3 inline-block rounded-full border border-gray-300" />}
                      At least 10 characters
                    </li>
                    <li className={`flex items-center gap-1 ${/[A-Z]/.test(localNewPassword) ? 'text-green-600' : ''}`}>
                      {/[A-Z]/.test(localNewPassword) ? <CheckCircle size={12} /> : <span className="w-3 h-3 inline-block rounded-full border border-gray-300" />}
                      One uppercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${/[a-z]/.test(localNewPassword) ? 'text-green-600' : ''}`}>
                      {/[a-z]/.test(localNewPassword) ? <CheckCircle size={12} /> : <span className="w-3 h-3 inline-block rounded-full border border-gray-300" />}
                      One lowercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${/\d/.test(localNewPassword) ? 'text-green-600' : ''}`}>
                      {/\d/.test(localNewPassword) ? <CheckCircle size={12} /> : <span className="w-3 h-3 inline-block rounded-full border border-gray-300" />}
                      One number
                    </li>
                    <li className={`flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(localNewPassword) ? 'text-green-600' : ''}`}>
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(localNewPassword) ? <CheckCircle size={12} /> : <span className="w-3 h-3 inline-block rounded-full border border-gray-300" />}
                      One special character
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={localShowConfirmPassword ? "text" : "password"}
                    value={localConfirmPassword}
                    onChange={(e) => setLocalConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setLocalShowConfirmPassword(!localShowConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {localShowConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {localConfirmPassword && localNewPassword !== localConfirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {localConfirmPassword && localNewPassword === localConfirmPassword && localNewPassword.length >= 10 && (
                  <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={localChangePasswordLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {localChangePasswordLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock size={16} />
                      Update Password
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setLocalPasswordError('');
                    setLocalPasswordSuccess('');
                    setLocalCurrentPassword('');
                    setLocalNewPassword('');
                    setLocalConfirmPassword('');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Show loading if refreshing
  if (isRefreshing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isRefreshing ? 'Refreshing session...' : 'Loading profile...'}
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
        userName={userData?.user?.full_name || user?.name || 'User'}
        userEmail={userData?.user?.email || user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                  <p className="text-xs text-gray-500">Manage your account settings</p>
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

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - User Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/30">
                    {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">
                      {userData?.user?.full_name || user?.name || 'User'}
                    </h2>
                    <p className="text-blue-100 text-sm">{userData?.user?.email || user?.email || 'No email'}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                        {userData?.role || 'User'}
                      </span>
                      {userData?.user?.is_verified && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full text-xs text-green-200">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      )}
                      {userData?.user?.mfa_enabled && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full text-xs text-purple-200">
                          <Shield size={12} />
                          2FA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                    {userData?.user?.email || user?.email || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Scope</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {userData?.scope || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Building size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">CPO ID</span>
                  </div>
                  <span className="font-medium text-gray-800 font-mono text-xs truncate max-w-[180px]">
                    {userData?.cpo_id || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Last Login</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(userData?.user?.last_login_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Must Change Password</span>
                  </div>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                    userData?.user?.must_change_password 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {userData?.user?.must_change_password ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* Change Password Button */}
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 font-medium hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Key size={16} />
                  Change Password
                </button>
              </div>
            </div>

            {/* Right Card - Account Login Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg shadow-gray-500/25">
                      <Activity size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Account Login Activity</h3>
                      <p className="text-xs text-gray-500">{sessions.length} active sessions</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogoutAll}
                    disabled={loggingOutAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium disabled:opacity-50"
                  >
                    {loggingOutAll ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Power size={14} />
                        Logout All
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-[500px] overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No active sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => {
                      const deviceInfo = getDeviceInfo(session.user_agent);
                      const isCurrent = session.is_current;
                      
                      return (
                        <div
                          key={session.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isCurrent 
                              ? 'border-blue-500 bg-blue-50/50 shadow-sm shadow-blue-100/50'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-xl ${
                                isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                {deviceInfo.device === 'Mobile' ? (
                                  <Smartphone size={18} className={isCurrent ? 'text-blue-600' : 'text-gray-500'} />
                                ) : (
                                  <Monitor size={18} className={isCurrent ? 'text-blue-600' : 'text-gray-500'} />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {deviceInfo.os} • {deviceInfo.browser}
                                  </p>
                                  {isCurrent && (
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full">
                                      Current
                                    </span>
                                  )}
                                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                    {deviceInfo.device}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  IP: {session.ip_address || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  <Clock size={12} className="inline mr-1" />
                                  Last active: {formatDate(session.last_seen_at)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Created: {formatDate(session.created_at)}
                                </p>
                              </div>
                            </div>

                            {!isCurrent && (
                              <button
                                onClick={() => deleteSession(session.id)}
                                disabled={deletingSession === session.id}
                                className="ml-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 disabled:opacity-50"
                              >
                                {deletingSession === session.id ? (
                                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loggingOut ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogOut size={18} />
                      Sign Out Current Session
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Sign out of this device only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && <ChangePasswordModal />}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Profile;
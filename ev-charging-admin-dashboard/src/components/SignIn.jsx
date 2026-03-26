// src/components/SignIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Key,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  User
} from 'lucide-react';
import Background from "../assets/bg.jpg";

const SignIn = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Password reset states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // API Configuration
  const API_CONFIG = {
    LOGIN_API: {
      BASE_URL: 'https://be.cms.ocpp.transev.site/admin/login/userlogin',
      API_KEY: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
      KEY_HEADER: 'apiauthkey'
    },
    RESET_REQUEST_API: {
      BASE_URL: 'https://be.cms.ocpp.transev.site/admin/resetadminpassword',
      API_KEY: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
      KEY_HEADER: 'apiauthkey'
    },
    RESET_PASSWORD_API: {
      BASE_URL: 'https://be.cms.ocpp.transev.site/admin/respassword',
      API_KEY: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
      KEY_HEADER: 'apiauthkey'
    }
  };

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Detect if input is email or phone
  const detectLoginMethod = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
    
    if (emailRegex.test(input)) {
      return 'email';
    } else if (phoneRegex.test(input.replace(/\D/g, '')) && input.replace(/\D/g, '').length >= 10) {
      return 'phone';
    }
    return null; // Unknown format
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!emailOrPhone.trim()) {
      setError('Phone number or email is required');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    // Detect login method from input
    const method = detectLoginMethod(emailOrPhone);
    if (!method) {
      setError('Please enter a valid phone number or email address');
      setLoading(false);
      return;
    }
    setLoginMethod(method);

    // Prepare login payload
    const loginPayload = method === 'phone' 
      ? { phone: emailOrPhone, password }
      : { email: emailOrPhone, password };

    try {
      const response = await fetch(API_CONFIG.LOGIN_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [API_CONFIG.LOGIN_API.KEY_HEADER]: API_CONFIG.LOGIN_API.API_KEY,
        },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        const { authtoken } = data;
        localStorage.setItem('token', authtoken);
        const decodedToken = jwtDecode(authtoken);
        const userId = decodedToken.userid || decodedToken.userId;
        setSuccess(`Login successful! Redirecting...`);
        setTimeout(() => {
          navigate(`/dashboard`);
        }, 1000);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password request (send OTP)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      setOtpLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setOtpLoading(false);
      return;
    }

    try {
      const response = await fetch(API_CONFIG.RESET_REQUEST_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [API_CONFIG.RESET_REQUEST_API.KEY_HEADER]: API_CONFIG.RESET_REQUEST_API.API_KEY,
        },
        body: JSON.stringify({ getuseremail: email }),
      });

      const data = await response.json();
      console.log('Reset request response:', data);

      if (response.ok) {
        setOtpSent(true);
        setSuccess('OTP has been sent to your email address');
        setResetStep(2);
        setCountdown(60); // 60 seconds countdown
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle password reset with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');
    setSuccess('');

    // Validations
    if (!otp.trim()) {
      setError('OTP is required');
      setResetLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      setResetLoading(false);
      return;
    }

    if (!newPassword) {
      setError('New password is required');
      setResetLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch(API_CONFIG.RESET_PASSWORD_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [API_CONFIG.RESET_PASSWORD_API.KEY_HEADER]: API_CONFIG.RESET_PASSWORD_API.API_KEY,
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword
        }),
      });

      const data = await response.json();
      console.log('Reset password response:', data);

      if (response.ok) {
        setSuccess('Password reset successful! You can now login with your new password.');
        
        // Reset form and go back to login
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetStep(1);
          setEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setOtpSent(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setOtpLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(API_CONFIG.RESET_REQUEST_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [API_CONFIG.RESET_REQUEST_API.KEY_HEADER]: API_CONFIG.RESET_REQUEST_API.API_KEY,
        },
        body: JSON.stringify({ getuseremail: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New OTP has been sent to your email');
        setCountdown(60); // Reset countdown
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setOtpSent(false);
  };

  // Auto-detect login method as user types
  const handleLoginInputChange = (value) => {
    setEmailOrPhone(value);
    const method = detectLoginMethod(value);
    if (method) {
      setLoginMethod(method);
    }
  };

  // Get input placeholder based on detected method
  const getLoginInputPlaceholder = () => {
    const method = detectLoginMethod(emailOrPhone);
    if (method === 'email') {
      return 'example@domain.com';
    } else if (method === 'phone') {
      return '+91 98765 43210';
    }
    return 'Phone number or email';
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${Background})` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Login/Forgot Password box */}
      <div className="relative z-10 bg-black/60 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
        
        {/* Back button for forgot password flow */}
        {showForgotPassword && (
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
              {showForgotPassword ? (
                <Key className="text-white" size={28} />
              ) : (
                <Shield className="text-white" size={28} />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {showForgotPassword ? 'Reset Password' : 'Sign In'}
          </h1>
          <p className="text-gray-400">
            {showForgotPassword 
              ? resetStep === 1 
                ? 'Enter your email to receive OTP' 
                : 'Enter OTP and set new password'
              : 'Enterprise EV Charging Control Center'}
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={16} />
              <span className="text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        {!showForgotPassword ? (
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  {loginMethod === 'email' ? <Mail size={16} /> : <Phone size={16} />}
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                  {emailOrPhone && (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      {loginMethod === 'email' ? 'Email' : 'Phone'}
                    </span>
                  )}
                </div>
              </label>
              <input
                id="emailOrPhone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => handleLoginInputChange(e.target.value)}
                placeholder={getLoginInputPlaceholder()}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered phone number or email address
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </div>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Logging in with: <span className="font-semibold text-blue-400">
                  {loginMethod === 'email' ? 'Email' : 'Phone'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          /* Forgot Password Flow */
          <form onSubmit={resetStep === 1 ? handleForgotPassword : handleResetPassword} className="space-y-5">
            
            {/* Step 1: Enter Email */}
            {resetStep === 1 && (
              <div>
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-400 flex items-center gap-2">
                    <Mail size={14} />
                    Password reset requires email verification
                  </p>
                </div>
                
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </div>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send an OTP to your email address to verify your identity
                </p>
              </div>
            )}

            {/* Step 2: Enter OTP and New Password */}
            {resetStep === 2 && (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) setOtp(value);
                    }}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
                    maxLength="6"
                    required
                  />
                  <div className="mt-2 text-sm text-gray-400">
                    {countdown > 0 ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        Resend OTP in {countdown}s
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpLoading}
                        className="text-blue-400 hover:text-blue-300 hover:underline disabled:opacity-50"
                      >
                        {otpLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-400 text-sm">Passwords do not match</p>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={resetStep === 1 ? otpLoading : resetLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetStep === 1 ? (
                otpLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send OTP'
                )
              ) : (
                resetLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )
              )}
            </button>
          </form>
        )}

        {/* Sign up link */}
        {!showForgotPassword && (
          <p className="text-gray-400 text-sm mt-6 text-center">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              Sign Up
            </button>
          </p>
        )}

        {/* Security note */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            <Shield size={12} className="inline mr-1" />
            Login with phone or email • Password reset requires email verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
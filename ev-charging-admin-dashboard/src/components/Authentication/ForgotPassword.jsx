import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Key,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  ArrowLeft,
  Zap,
  Hash
} from 'lucide-react';
import Background from "../../assets/forgot.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Step 1: Email submission
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // Step 2: OTP, Challenge ID & New Password
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  
  // 10-minute timer for OTP expiry
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // API Configuration
  const API_CONFIG = {
    FORGOT_PASSWORD_API: {
      BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/password/forgot'
    },
    RESET_PASSWORD_API: {
      BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/password/reset'
    }
  };

  // 10-minute OTP expiry timer
  useEffect(() => {
    let timer;
    if (isOtpSent && otpTimer > 0) {
      timer = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
    } else if (otpTimer === 0 && isOtpSent) {
      setIsOtpExpired(true);
      setEmailError('OTP has expired. Please request a new one.');
    }
    return () => clearTimeout(timer);
  }, [isOtpSent, otpTimer]);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Forgot Password - Step 1: Send OTP
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');
    setEmailSuccess('');

    if (!email.trim()) {
      setEmailError('Email is required');
      setEmailLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      setEmailLoading(false);
      return;
    }

    try {
      const response = await fetch(API_CONFIG.FORGOT_PASSWORD_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Forgot password response:', data);

      if (response.ok) {
        setEmailSuccess('OTP has been sent to your email address');
        setIsOtpSent(true);
        setOtpTimer(600); // Reset 10-minute timer
        setIsOtpExpired(false);
        setChallengeId(''); // Clear previous challenge_id
        setOtp(''); // Clear previous OTP
        
        setTimeout(() => {
          document.getElementById('reset-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      } else {
        setEmailError(data.message || 'Failed to send OTP. Please try again.');
        setIsOtpSent(false);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setEmailError('An error occurred. Please try again.');
      setIsOtpSent(false);
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle Password Reset - Step 2
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    if (isOtpExpired) {
      setResetError('OTP has expired. Please request a new one.');
      setResetLoading(false);
      return;
    }

    if (!challengeId.trim()) {
      setResetError('Challenge ID is required');
      setResetLoading(false);
      return;
    }

    if (!otp.trim() || otp.length !== 6) {
      setResetError('OTP must be 6 digits');
      setResetLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      setResetLoading(false);
      return;
    }

    // Prepare payload with challenge_id, code, and new_password
    const payload = {
      challenge_id: challengeId,
      code: otp,
      new_password: newPassword
    };

    console.log('Reset password payload:', payload);

    try {
      const response = await fetch(API_CONFIG.RESET_PASSWORD_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Reset password response:', data);

      if (response.ok) {
        setResetSuccess('Password reset successful! Redirecting to login...');
        setIsOtpSent(false);
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setResetError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setResetError('An error occurred. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch(API_CONFIG.FORGOT_PASSWORD_API.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSuccess('OTP resent successfully!');
        setIsOtpSent(true);
        setIsOtpExpired(false);
        setOtpTimer(600); // Reset 10-minute timer
        setChallengeId(''); // Clear challenge_id
        setOtp(''); // Clear OTP
      } else {
        setEmailError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setEmailError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${Background})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-black/60" />
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-start pt-16 lg:pt-20 text-white p-12 w-full">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">TransEV</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Key className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-sm text-purple-400 font-medium">Password Recovery</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Oops! Forgot your password?
              </h1>
            </div>

            <p className="text-lg text-blue-100/80 mb-8">
              Reset your password using your existing email ID
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - White Form */}
      <div className="flex-1 flex items-start justify-center bg-white p-8 lg:p-12 min-h-screen pt-16 lg:pt-20">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-left mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                {isOtpSent ? 'Enter OTP & Challenge ID' : 'Password Recovery'}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {isOtpSent ? 'Verify your identity' : 'Reset your password'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isOtpSent 
                ? 'Enter the Challenge ID and 6-digit OTP sent to your email' 
                : 'Enter your registered email to receive OTP'}
            </p>
          </div>

          {/* Email Error/Success Messages */}
          {emailError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{emailError}</span>
              </div>
            </div>
          )}

          {emailSuccess && !resetSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">{emailSuccess}</span>
              </div>
            </div>
          )}

          {/* Step 1: Email Form */}
          {!isOtpSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-purple-600" />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send an OTP and Challenge ID to verify your identity
                </p>
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {emailLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </div>
                ) : (
                  <>
                    <Mail size={18} />
                    Send OTP
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/signin"
                  className="text-sm text-purple-600 hover:text-purple-700 hover:underline flex items-center justify-center gap-1"
                >
                  Don't want to reset password? Login
                </Link>
              </div>
            </form>
          ) : (
            /* Step 2: OTP, Challenge ID & New Password */
            <form onSubmit={handleResetPassword} className="space-y-5" id="reset-section">
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={16} />
                    <span className="text-sm">{resetError}</span>
                  </div>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="text-sm">{resetSuccess}</span>
                  </div>
                </div>
              )}

              {!resetSuccess && (
                <>
                  {/* Challenge ID Input */}
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-blue-600" />
                        Challenge ID
                      </div>
                    </label>
                    <input
                      type="text"
                      value={challengeId}
                      onChange={(e) => setChallengeId(e.target.value)}
                      placeholder="Enter Challenge ID from email"
                      className={`w-full px-4 py-3 rounded-xl border ${isOtpExpired ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono`}
                      required
                      disabled={isOtpExpired}
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Enter the Challenge ID sent to your email
                    </p>
                  </div>

                  {/* OTP Input with Timer */}
                  <div className={`bg-purple-50 p-4 rounded-xl border-2 ${isOtpExpired ? 'border-red-300' : 'border-purple-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Key size={16} className="text-purple-600" />
                          OTP Code
                        </div>
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={`${isOtpExpired ? 'text-red-500' : 'text-purple-600'}`} />
                        <span className={`text-sm font-mono font-bold ${isOtpExpired ? 'text-red-500' : 'text-purple-600'}`}>
                          {formatTime(otpTimer)}
                        </span>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) setOtp(value);
                      }}
                      placeholder="Enter 6-digit OTP"
                      className={`w-full px-4 py-3 rounded-xl border ${isOtpExpired ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest`}
                      maxLength="6"
                      required
                      autoFocus
                      disabled={isOtpExpired}
                    />
                    
                    {isOtpExpired && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        OTP has expired. Please request a new one.
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isOtpExpired === false}
                        className={`text-sm font-medium ${isOtpExpired ? 'text-purple-600 hover:text-purple-700' : 'text-gray-400 cursor-not-allowed'}`}
                      >
                        Resend OTP
                      </button>
                      <span className="text-xs text-gray-400">Email: {email}</span>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-purple-400" />
                        New Password
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                        required
                        disabled={isOtpExpired}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isOtpExpired}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-purple-600" />
                        Confirm New Password
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                        required
                        disabled={isOtpExpired}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isOtpExpired}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle size={14} />
                      Passwords do not match
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={resetLoading || isOtpExpired}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Resetting Password...
                      </div>
                    ) : (
                      <>
                        <Lock size={18} />
                        Reset Password
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSent(false);
                        setChallengeId('');
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setEmailSuccess('');
                        setOtpTimer(600);
                        setIsOtpExpired(false);
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <ArrowLeft size={16} />
                      Back to email
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <Shield size={12} className="inline mr-1" />
              Secure password recovery • OTP expires in 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
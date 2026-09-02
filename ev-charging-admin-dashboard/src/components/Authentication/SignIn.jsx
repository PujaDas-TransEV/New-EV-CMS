import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../Authentication/AuthContext';

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
  Building,
  LogIn,
  ShieldCheck,
  Zap,
  User
} from 'lucide-react';

import Background from '../../assets/bg.jpg';

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  LOGIN_API: `${API_BASE_URL}/api/v1/auth/login`,

  VERIFY_2FA_API:
    `${API_BASE_URL}/api/v1/auth/2fa/verify`,

  RESEND_2FA_API:
    `${API_BASE_URL}/api/v1/auth/2fa/resend`
};

// ======================================================
// SAFE ERROR MESSAGE
// ======================================================

const getApiErrorMessage = (
  data,
  fallback = 'Something went wrong'
) => {
  if (!data) {
    return fallback;
  }

  // ----------------------------------------------
  // data.message = string
  // ----------------------------------------------

  if (
    typeof data.message === 'string'
  ) {
    return data.message;
  }

  // ----------------------------------------------
  // data.message = object
  //
  // {
  //   message: {
  //      code: "...",
  //      message: "..."
  //   }
  // }
  // ----------------------------------------------

  if (
    data.message &&
    typeof data.message === 'object'
  ) {
    if (
      typeof data.message.message ===
      'string'
    ) {
      return data.message.message;
    }

    if (
      typeof data.message.code ===
      'string'
    ) {
      return data.message.code;
    }
  }

  // ----------------------------------------------
  // data.error = string
  // ----------------------------------------------

  if (
    typeof data.error === 'string'
  ) {
    return data.error;
  }

  // ----------------------------------------------
  // data.error = object
  // ----------------------------------------------

  if (
    data.error &&
    typeof data.error === 'object'
  ) {
    if (
      typeof data.error.message ===
      'string'
    ) {
      return data.error.message;
    }

    if (
      typeof data.error.code ===
      'string'
    ) {
      return data.error.code;
    }
  }

  // ----------------------------------------------
  // Direct code/message object
  // ----------------------------------------------

  if (
    typeof data.code === 'string'
  ) {
    return data.code;
  }

  // ----------------------------------------------
  // Array error
  // ----------------------------------------------

  if (Array.isArray(data)) {
    const firstError = data[0];

    if (
      typeof firstError === 'string'
    ) {
      return firstError;
    }

    if (
      firstError &&
      typeof firstError.message === 'string'
    ) {
      return firstError.message;
    }
  }

  // ----------------------------------------------
  // Final fallback
  // ----------------------------------------------

  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
};

// ======================================================
// SIGN IN COMPONENT
// ======================================================

const SignIn = () => {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
    loading: authLoading,
    isRefreshing
  } = useAuth();

  // ====================================================
  // LOGIN STATES
  // ====================================================

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [cpoId, setCpoId] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  // ====================================================
  // 2FA STATES
  // ====================================================

  const [show2FA, setShow2FA] =
    useState(false);

  const [otp, setOtp] =
    useState('');

  const [challengeId, setChallengeId] =
    useState('');

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [countdown, setCountdown] =
    useState(0);

  const [otpError, setOtpError] =
    useState('');

  const [mfaEnabled, setMfaEnabled] =
    useState(false);

  const [expiresAt, setExpiresAt] =
    useState('');

  // ====================================================
  // REDIRECT WHEN AUTHENTICATED
  // ====================================================

  useEffect(() => {
    if (
      isAuthenticated &&
      !authLoading &&
      !isRefreshing
    ) {
      navigate(
        '/dashboard',
        {
          replace: true
        }
      );
    }
  }, [
    isAuthenticated,
    authLoading,
    isRefreshing,
    navigate
  ]);

  // ====================================================
  // OTP COUNTDOWN
  // ====================================================

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer =
      setTimeout(() => {
        setCountdown(
          previous =>
            previous - 1
        );
      }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);

  // ====================================================
  // UUID VALIDATION
  // ====================================================

  const isValidUUID = (uuid) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return uuidRegex.test(uuid);
  };

  // ====================================================
  // BUILD USER INFO
  // ====================================================

  const buildUserInfo = (
    accessToken,
    emailValue,
    cpoIdValue,
    mfa = false
  ) => {
    try {
      const decodedToken =
        jwtDecode(accessToken);

      console.log(
        '🔓 Decoded Token:',
        decodedToken
      );

      const userInfo = {
        name:
          decodedToken.name ||
          decodedToken.firstname ||
          decodedToken.first_name ||
          'User',

        email:
          decodedToken.email ||
          emailValue,

        scope:
          decodedToken.scope ||
          'CPO',

        cpoId:
          cpoIdValue,

        userId:
          decodedToken.sub ||
          decodedToken.userId ||
          decodedToken.id ||
          '',

        mfaEnabled: mfa
      };

      localStorage.setItem(
        'userInfo',
        JSON.stringify(userInfo)
      );

      return userInfo;

    } catch (error) {
      console.error(
        '❌ JWT decode failed:',
        error
      );

      const fallbackUserInfo = {
        name: 'User',
        email: emailValue,
        scope: 'CPO',
        cpoId: cpoIdValue,
        userId: '',
        mfaEnabled: mfa
      };

      localStorage.setItem(
        'userInfo',
        JSON.stringify(
          fallbackUserInfo
        )
      );

      return fallbackUserInfo;
    }
  };

  // ====================================================
  // HANDLE LOGIN
  // ====================================================

  const handleSignIn = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    // -----------------------------------------------
    // EMAIL
    // -----------------------------------------------

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        'Email is required'
      );

      setLoading(false);
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        'Please enter a valid email address'
      );

      setLoading(false);
      return;
    }

    // -----------------------------------------------
    // PASSWORD
    // -----------------------------------------------

    if (!password) {
      setError(
        'Password is required'
      );

      setLoading(false);
      return;
    }

    // -----------------------------------------------
    // CPO ID
    // -----------------------------------------------

    const cleanCpoId =
      cpoId.trim();

    if (!cleanCpoId) {
      setError(
        'CPO ID is required'
      );

      setLoading(false);
      return;
    }

    if (!isValidUUID(cleanCpoId)) {
      setError(
        'Please enter a valid CPO ID in UUID format.'
      );

      setLoading(false);
      return;
    }

    // =================================================
    // LOGIN PAYLOAD
    // =================================================

    const loginPayload = {
      email: cleanEmail,
      password: password,
      scope: 'CPO',
      cpo_id: cleanCpoId
    };

    console.log(
      '📤 Login Request:',
      {
        email: cleanEmail,
        cpoId: cleanCpoId,
        scope: 'CPO'
      }
    );

    try {
      // =================================================
      // CALL LOGIN API
      // =================================================

      const response =
        await fetch(
          API_CONFIG.LOGIN_API,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json'
            },

            body:
              JSON.stringify(
                loginPayload
              )
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch (error) {
        console.error(
          '❌ Login response is not valid JSON'
        );
      }

      console.log(
        '📥 Login Status:',
        response.status
      );

      console.log(
        '📥 Login Response:',
        data
      );

      // =================================================
      // LOGIN ERROR
      // =================================================

      if (!response.ok) {
        setError(
          getApiErrorMessage(
            data,
            'Invalid credentials. Please check your credentials.'
          )
        );

        return;
      }

      // =================================================
      // CHECK 2FA
      // =================================================

      if (
        data?.challenge_id
      ) {
        console.log(
          '🔐 2FA challenge received'
        );

        setMfaEnabled(true);

        setChallengeId(
          data.challenge_id
        );

        setExpiresAt(
          data.expires_at ||
          ''
        );

        setOtp('');
        setOtpError('');

        // ---------------------------------------------
        // RESEND TIMER
        // ---------------------------------------------

        if (
          data.resend_available_at
        ) {
          const resendTime =
            new Date(
              data.resend_available_at
            ).getTime();

          const seconds =
            Math.max(
              0,
              Math.floor(
                (resendTime -
                  Date.now()) /
                  1000
              )
            );

          setCountdown(
            seconds > 0
              ? seconds
              : 60
          );

        } else {
          setCountdown(60);
        }

        setShow2FA(true);

        setSuccess(
          '2FA verification required. Please enter the OTP sent to your email.'
        );

        return;
      }

      // =================================================
      // DIRECT LOGIN
      // =================================================

      const accessToken =
        data?.access_token;

      const refreshToken =
        data?.refresh_token;

      const accessTokenExpiresAt =
        data?.access_token_expires_at;

      const sessionExpiresAt =
        data?.session_expires_at;

      console.log(
        '🔐 Token response:',
        {
          hasAccessToken:
            Boolean(accessToken),

          hasRefreshToken:
            Boolean(refreshToken),

          accessTokenExpiresAt,

          sessionExpiresAt
        }
      );

      // -----------------------------------------------
      // ACCESS TOKEN
      // -----------------------------------------------

      if (!accessToken) {
        setError(
          'Login failed: access token was not received.'
        );

        return;
      }

      // -----------------------------------------------
      // REFRESH TOKEN
      // -----------------------------------------------

      if (!refreshToken) {
        setError(
          'Login failed: refresh token was not received.'
        );

        return;
      }

      // =================================================
      // STORE BASIC DATA
      // =================================================

      localStorage.setItem(
        'userEmail',
        cleanEmail
      );

      localStorage.setItem(
        'cpoId',
        cleanCpoId
      );

      // =================================================
      // USER INFO
      // =================================================

      const userInfo =
        buildUserInfo(
          accessToken,
          cleanEmail,
          cleanCpoId,
          false
        );

      // =================================================
      // AUTH CONTEXT LOGIN
      // =================================================

      console.log(
        '🔐 Calling AuthContext.login()'
      );

      const loginResult =
        login(
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          userInfo,
          sessionExpiresAt
        );

      // login() normally doesn't need
      // to return anything.
      //
      // Only treat explicit false as failure.

      if (loginResult === false) {
        setError(
          'Unable to create authentication session.'
        );

        return;
      }

      console.log(
        '✅ Login successful'
      );

      setSuccess(
        'Login successful! Redirecting...'
      );

      // AuthContext will redirect because
      // isAuthenticated becomes true.

    } catch (error) {
      console.error(
        '❌ Login exception:',
        error
      );

      setError(
        error?.message ||
        'An error occurred while signing in. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // HANDLE 2FA VERIFY
  // ====================================================

  const handleVerify2FA = async (e) => {
    e.preventDefault();

    setOtpLoading(true);
    setOtpError('');
    setError('');
    setSuccess('');

    const cleanOtp =
      otp.trim();

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !cleanOtp ||
      cleanOtp.length !== 6
    ) {
      setOtpError(
        'Please enter a valid 6-digit OTP'
      );

      setOtpLoading(false);
      return;
    }

    if (!challengeId) {
      setOtpError(
        '2FA session has expired. Please login again.'
      );

      setOtpLoading(false);
      return;
    }

    try {
      console.log(
        '📤 Verifying 2FA...'
      );

      // =================================================
      // VERIFY API
      // =================================================

      const response =
        await fetch(
          API_CONFIG.VERIFY_2FA_API,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json'
            },

            body: JSON.stringify({
              challenge_id:
                challengeId,

              code:
                cleanOtp
            })
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch (error) {
        console.error(
          '❌ 2FA response is not valid JSON'
        );
      }

      console.log(
        '📥 2FA Status:',
        response.status
      );

      console.log(
        '📥 2FA Response:',
        data
      );

      // =================================================
      // VERIFY FAILED
      // =================================================

      if (!response.ok) {
        const message =
          getApiErrorMessage(
            data,
            'Invalid OTP. Please try again.'
          );

        console.error(
          '❌ 2FA failed:',
          message
        );

        // IMPORTANT:
        // Always convert to string.
        // React must never receive object here.

        setOtpError(
          String(message)
        );

        return;
      }

      // =================================================
      // SUCCESS TOKENS
      // =================================================

      const accessToken =
        data?.access_token;

      const refreshToken =
        data?.refresh_token;

      const accessTokenExpiresAt =
        data?.access_token_expires_at;

      const sessionExpiresAt =
        data?.session_expires_at;

      console.log(
        '🔐 2FA Tokens:',
        {
          hasAccessToken:
            Boolean(accessToken),

          hasRefreshToken:
            Boolean(refreshToken),

          accessTokenExpiresAt,

          sessionExpiresAt
        }
      );

      // =================================================
      // TOKEN VALIDATION
      // =================================================

      if (!accessToken) {
        setOtpError(
          '2FA verification succeeded but access token was not received.'
        );

        return;
      }

      if (!refreshToken) {
        setOtpError(
          '2FA verification succeeded but refresh token was not received.'
        );

        return;
      }

      // =================================================
      // STORE BASIC DATA
      // =================================================

      localStorage.setItem(
        'userEmail',
        email.trim()
      );

      localStorage.setItem(
        'cpoId',
        cpoId.trim()
      );

      // =================================================
      // BUILD USER INFO
      // =================================================

      const userInfo =
        buildUserInfo(
          accessToken,
          email.trim(),
          cpoId.trim(),
          true
        );

      // =================================================
      // LOGIN AUTH CONTEXT
      // =================================================

      console.log(
        '🔐 Updating AuthContext after 2FA...'
      );

      const loginResult =
        login(
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          userInfo,
          sessionExpiresAt
        );

      if (
        loginResult === false
      ) {
        setOtpError(
          'Unable to create authentication session.'
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        '✅ 2FA verification successful'
      );

      setOtp('');
      setOtpError('');
      setShow2FA(false);

      setSuccess(
        '2FA verified successfully! Redirecting...'
      );

      // AuthContext's isAuthenticated
      // will trigger dashboard redirect.

    } catch (error) {
      console.error(
        '❌ 2FA exception:',
        error
      );

      setOtpError(
        String(
          error?.message ||
          'An error occurred while verifying OTP. Please try again.'
        )
      );

    } finally {
      setOtpLoading(false);
    }
  };

  // ====================================================
  // RESEND OTP
  // ====================================================

  const handleResend2FA =
    async () => {

      if (
        countdown > 0 ||
        !challengeId
      ) {
        return;
      }

      setResendLoading(true);
      setOtpError('');
      setError('');
      setSuccess('');

      try {
        console.log(
          '📤 Resending OTP...'
        );

        const response =
          await fetch(
            API_CONFIG.RESEND_2FA_API,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Accept:
                  'application/json'
              },

              body: JSON.stringify({
                challenge_id:
                  challengeId
              })
            }
          );

        let data = null;

        try {
          data =
            await response.json();
        } catch (error) {
          console.error(
            '❌ Resend response invalid'
          );
        }

        console.log(
          '📥 Resend status:',
          response.status
        );

        console.log(
          '📥 Resend response:',
          data
        );

        // =================================================
        // RESEND ERROR
        // =================================================

        if (!response.ok) {
          setOtpError(
            String(
              getApiErrorMessage(
                data,
                'Failed to resend OTP.'
              )
            )
          );

          return;
        }

        // =================================================
        // NEW CHALLENGE ID
        // =================================================

        if (
          data?.challenge_id
        ) {
          setChallengeId(
            data.challenge_id
          );
        }

        // =================================================
        // NEW EXPIRY
        // =================================================

        if (
          data?.expires_at
        ) {
          setExpiresAt(
            data.expires_at
          );
        }

        // =================================================
        // NEW RESEND TIME
        // =================================================

        if (
          data?.resend_available_at
        ) {
          const resendTime =
            new Date(
              data.resend_available_at
            ).getTime();

          const seconds =
            Math.max(
              0,
              Math.floor(
                (resendTime -
                  Date.now()) /
                  1000
              )
            );

          setCountdown(
            seconds > 0
              ? seconds
              : 60
          );

        } else {
          setCountdown(60);
        }

        setOtp('');

        setSuccess(
          'OTP resent successfully!'
        );

      } catch (error) {
        console.error(
          '❌ Resend OTP exception:',
          error
        );

        setOtpError(
          String(
            error?.message ||
            'An error occurred while resending OTP.'
          )
        );

      } finally {
        setResendLoading(false);
      }
    };

  // ====================================================
  // FORGOT PASSWORD
  // ====================================================

  const handleForgotPasswordClick =
    () => {
      navigate(
        '/forgot-password'
      );
    };

  // ====================================================
  // FORMAT EXPIRY
  // ====================================================

  const formatExpiryTime =
    (dateString) => {

      if (!dateString) {
        return '';
      }

      const date =
        new Date(dateString);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return '';
      }

      return date.toLocaleTimeString();
    };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="flex min-h-screen">

      {/* ==================================================
          LEFT SIDE
      ================================================== */}

      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen bg-black">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${Background})`
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-black/60" />

        <div className="relative z-10 flex flex-col justify-start pt-16 lg:pt-20 text-white p-12 w-full">

          <div className="max-w-lg">

            <div className="flex items-center gap-3 mb-6">

              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">

                <Zap className="w-8 h-8 text-white" />

              </div>

              <span className="text-2xl font-bold">

                <span className="text-orange-500">
                  Trans
                </span>

                <span className="text-green-600">
                  EV
                </span>

              </span>

            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">

              Manage your EV chargers with

              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                charging management
              </span>

              <br />

              system

            </h1>

            <p className="text-lg text-blue-100/80 mb-6">
              All in one stop for your EV solutions
            </p>

          </div>

        </div>

      </div>

      {/* ==================================================
          RIGHT SIDE
      ================================================== */}

      <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12 min-h-screen">

        <div className="w-full max-w-md">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="text-center mb-8">

            {!show2FA ? (
              <>

                <div className="flex justify-center mb-4">

                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">

                    <User className="w-8 h-8 text-blue-600" />

                  </div>

                </div>

                <h2 className="text-3xl font-bold text-gray-900">
                  Login to your account
                </h2>

                <p className="text-gray-500 mt-2 text-sm">
                  Welcome back! Enter your credentials to continue
                </p>

              </>

            ) : (

              <>

                <div className="flex justify-center mb-4">

                  <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">

                    <ShieldCheck className="w-8 h-8 text-purple-600" />

                  </div>

                </div>

                <h2 className="text-3xl font-bold text-gray-900">
                  2FA Verification
                </h2>

                <p className="text-gray-500 mt-2 text-sm">
                  Enter the 6-digit code sent to your email
                </p>

                {expiresAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Code expires at:{' '}
                    {formatExpiryTime(
                      expiresAt
                    )}
                  </p>
                )}

              </>
            )}

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">

              <AlertCircle size={16} />

              <span className="text-sm">
                {String(error)}
              </span>

            </div>

          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && (

            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-600">

              <CheckCircle size={16} />

              <span className="text-sm">
                {String(success)}
              </span>

            </div>

          )}

          {/* ==================================================
              2FA FORM
          ================================================== */}

          {show2FA ? (

            <form
              onSubmit={
                handleVerify2FA
              }
              className="space-y-5"
            >

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  <div className="flex items-center gap-2">

                    <Key
                      size={16}
                      className="text-blue-600"
                    />

                    OTP Code

                  </div>

                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => {

                    const value =
                      e.target.value
                        .replace(
                          /\D/g,
                          ''
                        )
                        .slice(0, 6);

                    setOtp(value);

                  }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                  autoFocus
                />

                {otpError && (

                  <p className="text-red-500 text-xs mt-2">
                    {String(otpError)}
                  </p>

                )}

                <div className="mt-2 flex items-center justify-between text-sm">

                  <p className="text-gray-500">

                    {countdown > 0 ? (

                      <span className="flex items-center gap-1">

                        <Clock size={14} />

                        Resend in{' '}
                        {countdown}s

                      </span>

                    ) : (

                      <button
                        type="button"
                        onClick={
                          handleResend2FA
                        }
                        disabled={
                          resendLoading
                        }
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                      >

                        {resendLoading
                          ? 'Sending...'
                          : 'Resend OTP'}

                      </button>

                    )}

                  </p>

                  <button
                    type="button"
                    onClick={() => {

                      setShow2FA(false);
                      setOtp('');
                      setOtpError('');
                      setChallengeId('');
                      setExpiresAt('');
                      setSuccess('');
                      setCountdown(0);

                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Back to Login
                  </button>

                </div>

              </div>

              <button
                type="submit"
                disabled={
                  otpLoading ||
                  otp.length !== 6
                }
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >

                {otpLoading ? (

                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                ) : (

                  <>
                    <ShieldCheck size={18} />
                    Verify & Login
                  </>

                )}

              </button>

            </form>

          ) : (

            /* ==================================================
               LOGIN FORM
            ================================================== */

            <form
              onSubmit={
                handleSignIn
              }
              className="space-y-5"
            >

              {/* CPO ID */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  <div className="flex items-center gap-2">

                    <Building
                      size={16}
                      className="text-blue-600"
                    />

                    CPO ID (UUID)

                  </div>

                </label>

                <input
                  type="text"
                  value={cpoId}
                  onChange={(e) =>
                    setCpoId(
                      e.target.value
                    )
                  }
                  placeholder="Enter CPO UUID (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />

                <p className="text-xs text-gray-500 mt-1">
                  Enter CPO ID in UUID format
                </p>

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  <div className="flex items-center gap-2">

                    <Mail
                      size={16}
                      className="text-blue-600"
                    />

                    Email Address

                  </div>

                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  <div className="flex items-center gap-2">

                    <Lock
                      size={16}
                      className="text-blue-600"
                    />

                    Password

                  </div>

                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        previous =>
                          !previous
                      )
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >

                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}

                  </button>

                </div>

              </div>

              {/* REMEMBER / FORGOT */}

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600"
                  >
                    Remember me
                  </label>

                </div>

                <button
                  type="button"
                  onClick={
                    handleForgotPasswordClick
                  }
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>

              </div>

              {/* SIGN IN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >

                {loading ? (

                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                ) : (

                  <>
                    <LogIn size={18} />
                    Sign In
                  </>

                )}

              </button>

            </form>

          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="mt-6 pt-4 border-t border-gray-200">

            <p className="text-xs text-gray-500 text-center">

              <Shield
                size={12}
                className="inline mr-1"
              />

              Secure CPO Login •{' '}

              {mfaEnabled
                ? '2FA Enabled'
                : '2FA Disabled'}

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SignIn;


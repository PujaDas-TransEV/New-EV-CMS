// // src/components/SignIn.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import { 
//   Mail, 
//   Phone, 
//   Lock, 
//   Eye, 
//   EyeOff, 
//   ArrowLeft,
//   Key,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Shield,
//   User
// } from 'lucide-react';
// import Background from "../assets/bg.jpg";

// const SignIn = () => {
//   const [emailOrPhone, setEmailOrPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();

//   // Password reset states
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [resetLoading, setResetLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [countdown, setCountdown] = useState(0);

//   // API Configuration
//   const API_CONFIG = {
//     LOGIN_API: {
//       BASE_URL: 'https://be.cms.ocpp.transev.site/admin/login/userlogin',
//       API_KEY: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
//       KEY_HEADER: 'apiauthkey'
//     },
//     RESET_REQUEST_API: {
//       BASE_URL: 'https://be.cms.ocpp.transev.site/admin/resetadminpassword',
//       API_KEY: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
//       KEY_HEADER: 'apiauthkey'
//     },
//     RESET_PASSWORD_API: {
//       BASE_URL: 'https://be.cms.ocpp.transev.site/admin/respassword',
//       API_KEY: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
//       KEY_HEADER: 'apiauthkey'
//     }
//   };

//   // Countdown timer for OTP resend
//   React.useEffect(() => {
//     let timer;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   // Detect if input is email or phone
//   const detectLoginMethod = (input) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
    
//     if (emailRegex.test(input)) {
//       return 'email';
//     } else if (phoneRegex.test(input.replace(/\D/g, '')) && input.replace(/\D/g, '').length >= 10) {
//       return 'phone';
//     }
//     return null; // Unknown format
//   };

//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     // Basic validation
//     if (!emailOrPhone.trim()) {
//       setError('Phone number or email is required');
//       setLoading(false);
//       return;
//     }

//     if (!password) {
//       setError('Password is required');
//       setLoading(false);
//       return;
//     }

//     // Detect login method from input
//     const method = detectLoginMethod(emailOrPhone);
//     if (!method) {
//       setError('Please enter a valid phone number or email address');
//       setLoading(false);
//       return;
//     }
//     setLoginMethod(method);

//     // Prepare login payload
//     const loginPayload = method === 'phone' 
//       ? { phone: emailOrPhone, password }
//       : { email: emailOrPhone, password };

//     try {
//       const response = await fetch(API_CONFIG.LOGIN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           [API_CONFIG.LOGIN_API.KEY_HEADER]: API_CONFIG.LOGIN_API.API_KEY,
//         },
//         body: JSON.stringify(loginPayload),
//       });

//       const data = await response.json();
//       console.log('Login response:', data);

//       if (response.ok) {
//         const { authtoken } = data;
//         localStorage.setItem('token', authtoken);
//         const decodedToken = jwtDecode(authtoken);
//         const userId = decodedToken.userid || decodedToken.userId;
//         setSuccess(`Login successful! Redirecting...`);
//         setTimeout(() => {
//           navigate(`/dashboard`);
//         }, 1000);
//       } else {
//         setError(data.message || 'Login failed. Please check your credentials.');
//       }
//     } catch (error) {
//       console.error('Login failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle forgot password request (send OTP)
//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     setOtpLoading(true);
//     setError('');
//     setSuccess('');

//     if (!email.trim()) {
//       setError('Email is required');
//       setOtpLoading(false);
//       return;
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       setOtpLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(API_CONFIG.RESET_REQUEST_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           [API_CONFIG.RESET_REQUEST_API.KEY_HEADER]: API_CONFIG.RESET_REQUEST_API.API_KEY,
//         },
//         body: JSON.stringify({ getuseremail: email }),
//       });

//       const data = await response.json();
//       console.log('Reset request response:', data);

//       if (response.ok) {
//         setOtpSent(true);
//         setSuccess('OTP has been sent to your email address');
//         setResetStep(2);
//         setCountdown(60); // 60 seconds countdown
//       } else {
//         setError(data.message || 'Failed to send OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // Handle password reset with OTP
//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     setResetLoading(true);
//     setError('');
//     setSuccess('');

//     // Validations
//     if (!otp.trim()) {
//       setError('OTP is required');
//       setResetLoading(false);
//       return;
//     }

//     if (otp.length !== 6) {
//       setError('OTP must be 6 digits');
//       setResetLoading(false);
//       return;
//     }

//     if (!newPassword) {
//       setError('New password is required');
//       setResetLoading(false);
//       return;
//     }

//     if (newPassword.length < 6) {
//       setError('Password must be at least 6 characters');
//       setResetLoading(false);
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match');
//       setResetLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(API_CONFIG.RESET_PASSWORD_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           [API_CONFIG.RESET_PASSWORD_API.KEY_HEADER]: API_CONFIG.RESET_PASSWORD_API.API_KEY,
//         },
//         body: JSON.stringify({
//           email,
//           otp,
//           newPassword
//         }),
//       });

//       const data = await response.json();
//       console.log('Reset password response:', data);

//       if (response.ok) {
//         setSuccess('Password reset successful! You can now login with your new password.');
        
//         // Reset form and go back to login
//         setTimeout(() => {
//           setShowForgotPassword(false);
//           setResetStep(1);
//           setEmail('');
//           setOtp('');
//           setNewPassword('');
//           setConfirmPassword('');
//           setOtpSent(false);
//           setSuccess('');
//         }, 2000);
//       } else {
//         setError(data.message || 'Failed to reset password. Please try again.');
//       }
//     } catch (error) {
//       console.error('Reset password error:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setResetLoading(false);
//     }
//   };

//   // Resend OTP
//   const handleResendOTP = async () => {
//     if (countdown > 0) return;
    
//     setOtpLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const response = await fetch(API_CONFIG.RESET_REQUEST_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           [API_CONFIG.RESET_REQUEST_API.KEY_HEADER]: API_CONFIG.RESET_REQUEST_API.API_KEY,
//         },
//         body: JSON.stringify({ getuseremail: email }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSuccess('New OTP has been sent to your email');
//         setCountdown(60); // Reset countdown
//       } else {
//         setError(data.message || 'Failed to resend OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend OTP error:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // Handle back to login
//   const handleBackToLogin = () => {
//     setShowForgotPassword(false);
//     setResetStep(1);
//     setEmail('');
//     setOtp('');
//     setNewPassword('');
//     setConfirmPassword('');
//     setError('');
//     setSuccess('');
//     setOtpSent(false);
//   };

//   // Auto-detect login method as user types
//   const handleLoginInputChange = (value) => {
//     setEmailOrPhone(value);
//     const method = detectLoginMethod(value);
//     if (method) {
//       setLoginMethod(method);
//     }
//   };

//   // Get input placeholder based on detected method
//   const getLoginInputPlaceholder = () => {
//     const method = detectLoginMethod(emailOrPhone);
//     if (method === 'email') {
//       return 'example@domain.com';
//     } else if (method === 'phone') {
//       return '+91 98765 43210';
//     }
//     return 'Phone number or email';
//   };

//   return (
//     <div
//       className="flex items-center justify-center min-h-screen bg-cover bg-center relative"
//       style={{ backgroundImage: `url(${Background})` }}
//     >
//       {/* Overlay for better readability */}
//       <div className="absolute inset-0 bg-black/50"></div>

//       {/* Login/Forgot Password box */}
//       <div className="relative z-10 bg-black/60 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
        
//         {/* Back button for forgot password flow */}
//         {showForgotPassword && (
//           <button
//             onClick={handleBackToLogin}
//             className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
//           >
//             <ArrowLeft size={18} />
//             Back to Login
//           </button>
//         )}

//         {/* Header */}
//         <div className="mb-8 text-center">
//           <div className="flex justify-center mb-4">
//             <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
//               {showForgotPassword ? (
//                 <Key className="text-white" size={28} />
//               ) : (
//                 <Shield className="text-white" size={28} />
//               )}
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">
//             {showForgotPassword ? 'Reset Password' : 'Sign In'}
//           </h1>
//           <p className="text-gray-400">
//             {showForgotPassword 
//               ? resetStep === 1 
//                 ? 'Enter your email to receive OTP' 
//                 : 'Enter OTP and set new password'
//               : 'Enterprise EV Charging Control Center'}
//           </p>
//         </div>

//         {/* Error and Success Messages */}
//         {error && (
//           <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
//             <div className="flex items-center gap-2 text-red-400">
//               <AlertCircle size={16} />
//               <span className="text-sm">{error}</span>
//             </div>
//           </div>
//         )}

//         {success && (
//           <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
//             <div className="flex items-center gap-2 text-green-400">
//               <CheckCircle size={16} />
//               <span className="text-sm">{success}</span>
//             </div>
//           </div>
//         )}

//         {/* Login Form */}
//         {!showForgotPassword ? (
//           <form onSubmit={handleSignIn} className="space-y-5">
//             <div>
//               <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-300 mb-2">
//                 <div className="flex items-center gap-2">
//                   {loginMethod === 'email' ? <Mail size={16} /> : <Phone size={16} />}
//                   {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
//                   {emailOrPhone && (
//                     <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
//                       {loginMethod === 'email' ? 'Email' : 'Phone'}
//                     </span>
//                   )}
//                 </div>
//               </label>
//               <input
//                 id="emailOrPhone"
//                 type="text"
//                 value={emailOrPhone}
//                 onChange={(e) => handleLoginInputChange(e.target.value)}
//                 placeholder={getLoginInputPlaceholder()}
//                 className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Enter your registered phone number or email address
//               </p>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
//                 <div className="flex items-center gap-2">
//                   <Lock size={16} />
//                   Password
//                 </div>
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex justify-between items-center">
//               <div className="text-sm text-gray-400">
//                 Logging in with: <span className="font-semibold text-blue-400">
//                   {loginMethod === 'email' ? 'Email' : 'Phone'}
//                 </span>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowForgotPassword(true)}
//                 className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
//               >
//                 Forgot Password?
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Signing In...
//                 </div>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>
//         ) : (
//           /* Forgot Password Flow */
//           <form onSubmit={resetStep === 1 ? handleForgotPassword : handleResetPassword} className="space-y-5">
            
//             {/* Step 1: Enter Email */}
//             {resetStep === 1 && (
//               <div>
//                 <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
//                   <p className="text-sm text-blue-400 flex items-center gap-2">
//                     <Mail size={14} />
//                     Password reset requires email verification
//                   </p>
//                 </div>
                
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} />
//                     Email Address
//                   </div>
//                 </label>
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your registered email"
//                   className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   We'll send an OTP to your email address to verify your identity
//                 </p>
//               </div>
//             )}

//             {/* Step 2: Enter OTP and New Password */}
//             {resetStep === 2 && (
//               <>
//                 <div>
//                   <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
//                     OTP Code
//                   </label>
//                   <input
//                     id="otp"
//                     type="text"
//                     value={otp}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, '');
//                       if (value.length <= 6) setOtp(value);
//                     }}
//                     placeholder="Enter 6-digit OTP"
//                     className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
//                     maxLength="6"
//                     required
//                   />
//                   <div className="mt-2 text-sm text-gray-400">
//                     {countdown > 0 ? (
//                       <div className="flex items-center gap-2">
//                         <Clock size={14} />
//                         Resend OTP in {countdown}s
//                       </div>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleResendOTP}
//                         disabled={otpLoading}
//                         className="text-blue-400 hover:text-blue-300 hover:underline disabled:opacity-50"
//                       >
//                         {otpLoading ? 'Sending...' : 'Resend OTP'}
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
//                     New Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="newPassword"
//                       type={showNewPassword ? "text" : "password"}
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       placeholder="Enter new password (min. 6 characters)"
//                       className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowNewPassword(!showNewPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
//                     >
//                       {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
//                     Confirm New Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="confirmPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       placeholder="Confirm new password"
//                       className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
//                     >
//                       {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                 </div>

//                 {newPassword && confirmPassword && newPassword !== confirmPassword && (
//                   <p className="text-red-400 text-sm">Passwords do not match</p>
//                 )}
//               </>
//             )}

//             <button
//               type="submit"
//               disabled={resetStep === 1 ? otpLoading : resetLoading}
//               className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {resetStep === 1 ? (
//                 otpLoading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Sending OTP...
//                   </div>
//                 ) : (
//                   'Send OTP'
//                 )
//               ) : (
//                 resetLoading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Resetting Password...
//                   </div>
//                 ) : (
//                   'Reset Password'
//                 )
//               )}
//             </button>
//           </form>
//         )}

//         {/* Sign up link */}
//         {!showForgotPassword && (
//           <p className="text-gray-400 text-sm mt-6 text-center">
//             Don't have an account?{' '}
//             <button
//               onClick={() => navigate('/signup')}
//               className="text-blue-400 hover:text-blue-300 hover:underline"
//             >
//               Sign Up
//             </button>
//           </p>
//         )}

//         {/* Security note */}
//         <div className="mt-6 pt-4 border-t border-gray-700">
//           <p className="text-xs text-gray-500 text-center">
//             <Shield size={12} className="inline mr-1" />
//             Login with phone or email • Password reset requires email verification
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;
// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import { 
//   Mail, 
//   Lock, 
//   Eye, 
//   EyeOff,
//   Key,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Shield,
//   Building,
//   LogIn,
//   ShieldCheck,
//   Zap,
//   ArrowLeft,
//   Sparkles,
//   Battery,
//   Car,
//   Plug,
//   User
// } from 'lucide-react';
// import Background from "../../assets/bg.jpg";

// const SignIn = () => {
//   const navigate = useNavigate();
  
//   // Login states
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [cpoId, setCpoId] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // 2FA states
//   const [show2FA, setShow2FA] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [challengeId, setChallengeId] = useState('');
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [countdown, setCountdown] = useState(0);
//   const [otpError, setOtpError] = useState('');
//   const [mfaEnabled, setMfaEnabled] = useState(false);
//   const [userData, setUserData] = useState(null);

//   // API Configuration
//   const API_CONFIG = {
//     LOGIN_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/login'
//     },
//     VERIFY_2FA_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/verify'
//     },
//     RESEND_2FA_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/resend'
//     },
//     USER_INFO_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/me'
//     }
//   };

//   // Countdown timer for 2FA OTP resend
//   useEffect(() => {
//     let timer;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   // Validate UUID format
//   const isValidUUID = (uuid) => {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     return uuidRegex.test(uuid);
//   };

//   // Handle Login
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     // Validation
//     if (!email.trim()) {
//       setError('Email is required');
//       setLoading(false);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       setLoading(false);
//       return;
//     }

//     if (!password) {
//       setError('Password is required');
//       setLoading(false);
//       return;
//     }

//     if (!cpoId.trim()) {
//       setError('CPO ID is required');
//       setLoading(false);
//       return;
//     }

//     // Prepare login payload - always use "CPO" scope and send cpo_id as string
//     let loginPayload = {
//       email: email,
//       password: password,
//       scope: "CPO",  // Fixed to CPO scope
//     };

//     // CPO ID should always be sent as a string (UUID format)
//     // Check if the provided CPO ID is a valid UUID
//     if (isValidUUID(cpoId.trim())) {
//       loginPayload.cpo_id = cpoId.trim();
//     } else {
//       // If not a UUID, check if it's a number and convert to string
//       const numericCpoId = parseInt(cpoId.trim());
//       if (isNaN(numericCpoId) || numericCpoId <= 0) {
//         setError('Please enter a valid CPO ID (UUID format like: c821a013-5041-42f7-80c8-aa153cf9d455)');
//         setLoading(false);
//         return;
//       }
//       // Even if it's a number, send it as a string
//       loginPayload.cpo_id = cpoId.trim();
//     }

//     console.log('Login payload:', loginPayload);

//     try {
//       const response = await fetch(API_CONFIG.LOGIN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(loginPayload),
//       });

//       const data = await response.json();
//       console.log('Login response:', data);

//       if (response.ok) {
//         const { access_token, refresh_token } = data;
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('refresh_token', refresh_token);
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         try {
//           const decodedToken = jwtDecode(access_token);
//           console.log('Decoded token:', decodedToken);
          
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         // Check MFA status from user info API
//         const userInfoResponse = await fetch(API_CONFIG.USER_INFO_API.BASE_URL, {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${access_token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (userInfoResponse.ok) {
//           const userData = await userInfoResponse.json();
//           console.log('User data with MFA status:', userData);
          
//           if (userData.user && userData.user.mfa_enabled === true) {
//             setMfaEnabled(true);
//             setUserData(userData);
//             setChallengeId(data.challenge_id || userData.challenge_id);
//             setShow2FA(true);
//             setCountdown(60);
//             setSuccess('2FA verification required. Please enter the OTP sent to your email.');
//             setLoading(false);
//             return;
//           } else {
//             setSuccess('Login successful! Redirecting...');
//             setTimeout(() => {
//               navigate('/dashboard');
//             }, 1500);
//           }
//         } else {
//           setSuccess('Login successful! Redirecting...');
//           setTimeout(() => {
//             navigate('/dashboard');
//           }, 1500);
//         }
//       } else {
//         setError(data.message || 'Invalid credentials. Please check your email, password, and CPO ID.');
//       }
//     } catch (error) {
//       console.error('Login failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle 2FA Verification
//   const handleVerify2FA = async (e) => {
//     e.preventDefault();
//     setOtpLoading(true);
//     setOtpError('');
//     setError('');

//     if (!otp.trim() || otp.length !== 6) {
//       setOtpError('Please enter a valid 6-digit OTP');
//       setOtpLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(API_CONFIG.VERIFY_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           challenge_id: challengeId,
//           code: otp
//         }),
//       });

//       const data = await response.json();
//       console.log('2FA verification response:', data);

//       if (response.ok) {
//         const { access_token, refresh_token } = data;
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('refresh_token', refresh_token);
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         try {
//           const decodedToken = jwtDecode(access_token);
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id,
//             mfaEnabled: true
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         setSuccess('2FA verified! Redirecting...');
//         setShow2FA(false);
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1500);
//       } else {
//         setOtpError(data.message || 'Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('2FA verification failed:', error);
//       setOtpError('An error occurred. Please try again.');
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // Handle 2FA Resend
//   const handleResend2FA = async () => {
//     if (countdown > 0 || !challengeId) return;

//     setResendLoading(true);
//     setOtpError('');
//     setError('');

//     try {
//       const response = await fetch(API_CONFIG.RESEND_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           challenge_id: challengeId
//         }),
//       });

//       const data = await response.json();
//       console.log('2FA resend response:', data);

//       if (response.ok) {
//         setSuccess('OTP resent successfully!');
//         setCountdown(60);
//       } else {
//         setError(data.message || 'Failed to resend OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend OTP failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const handleForgotPasswordClick = () => {
//     navigate('/forgot-password');
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left Side - Background Image - Full height with cover */}
//       <div className="hidden lg:flex lg:w-1/2 relative min-h-screen bg-black">
//         <div 
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: `url(${Background})` }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-black/60" />
        
//         {/* Overlay Content - Aligned to Top */}
//         <div className="relative z-10 flex flex-col justify-start pt-16 lg:pt-20 text-white p-12 w-full">
//           <div className="max-w-lg">
//             {/* Brand Logo */}
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
//                 <Zap className="w-8 h-8 text-white" />
//               </div>
//               <span className="text-2xl font-bold text-white">TransEV</span>
//             </div>

//             {/* Main Heading */}
//             <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//               Manage your EV chargers with
//               <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">charging management</span>
//               <br />
//               system
//             </h1>

//             {/* Subtitle */}
//             <p className="text-lg text-blue-100/80 mb-6">
//               All in one stop for your EV solutions
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - White Login Form */}
//       <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12 min-h-screen">
//         <div className="w-full max-w-md">
//           {/* Logo for mobile */}
//           <div className="flex justify-center mb-8 lg:hidden">
//             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
//               <Zap className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           {/* Header Section */}
//           <div className="text-center mb-8">
//             {!show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <User className="w-8 h-8 text-blue-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   Login to your account
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Welcome back! Enter your credentials to continue
//                 </p>
//               </>
//             )}
            
//             {show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <ShieldCheck className="w-8 h-8 text-purple-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   2FA Verification
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Enter the 6-digit code sent to your email
//                 </p>
//               </>
//             )}
//           </div>

//           {/* Error and Success Messages */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//               <div className="flex items-center gap-2 text-red-600">
//                 <AlertCircle size={16} />
//                 <span className="text-sm">{error}</span>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
//               <div className="flex items-center gap-2 text-green-600">
//                 <CheckCircle size={16} />
//                 <span className="text-sm">{success}</span>
//               </div>
//             </div>
//           )}

//           {/* 2FA Verification Form */}
//           {show2FA ? (
//             <form onSubmit={handleVerify2FA} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Key size={16} className="text-blue-600" />
//                     OTP Code
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     if (value.length <= 6) setOtp(value);
//                   }}
//                   placeholder="Enter 6-digit OTP"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
//                   maxLength="6"
//                   required
//                   autoFocus
//                 />
//                 {otpError && (
//                   <p className="text-red-500 text-xs mt-1">{otpError}</p>
//                 )}
//                 <div className="mt-2 flex items-center justify-between text-sm">
//                   <p className="text-gray-500">
//                     {countdown > 0 ? (
//                       <span className="flex items-center gap-1">
//                         <Clock size={14} /> Resend in {countdown}s
//                       </span>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleResend2FA}
//                         disabled={resendLoading}
//                         className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
//                       >
//                         {resendLoading ? 'Sending...' : 'Resend OTP'}
//                       </button>
//                     )}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShow2FA(false);
//                       setOtp('');
//                       setOtpError('');
//                     }}
//                     className="text-gray-500 hover:text-gray-700"
//                   >
//                     Back to Login
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={otpLoading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {otpLoading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Verifying...
//                   </div>
//                 ) : (
//                   <>
//                     <ShieldCheck size={18} />
//                     Verify & Login
//                   </>
//                 )}
//               </button>
//             </form>
//           ) : (
//             // Main Login Form
//             <form onSubmit={handleSignIn} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Building size={16} className="text-blue-600" />
//                     CPO ID (UUID)
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={cpoId}
//                   onChange={(e) => setCpoId(e.target.value)}
//                   placeholder="Enter CPO UUID (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter CPO ID in UUID format (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-blue-600" />
//                     Email Address
//                   </div>
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email address"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Lock size={16} className="text-blue-600" />
//                     Password
//                   </div>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="remember"
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor="remember" className="text-sm text-gray-600">
//                     Remember me
//                   </label>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleForgotPasswordClick}
//                   className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Signing In...
//                   </div>
//                 ) : (
//                   <>
//                     <LogIn size={18} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>
//           )}

//           {/* Footer */}
//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <p className="text-xs text-gray-500 text-center">
//               <Shield size={12} className="inline mr-1" />
//               Secure CPO Login • {mfaEnabled ? '2FA Enabled' : '2FA Disabled'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import { 
//   Mail, 
//   Lock, 
//   Eye, 
//   EyeOff,
//   Key,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Shield,
//   Building,
//   LogIn,
//   ShieldCheck,
//   Zap,
//   ArrowLeft,
//   Sparkles,
//   Battery,
//   Car,
//   Plug,
//   User
// } from 'lucide-react';
// import Background from "../../assets/bg.jpg";

// const SignIn = () => {
//   const navigate = useNavigate();
  
//   // Login states
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [cpoId, setCpoId] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // 2FA states
//   const [show2FA, setShow2FA] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [challengeId, setChallengeId] = useState('');
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [countdown, setCountdown] = useState(0);
//   const [otpError, setOtpError] = useState('');
//   const [mfaEnabled, setMfaEnabled] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [expiresAt, setExpiresAt] = useState('');
//   const [resendAvailableAt, setResendAvailableAt] = useState('');

//   // API Configuration
//   const API_CONFIG = {
//     LOGIN_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/login'
//     },
//     VERIFY_2FA_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/verify'
//     },
//     RESEND_2FA_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/resend'
//     },
//     USER_INFO_API: {
//       BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/me'
//     }
//   };

//   // Countdown timer for 2FA OTP resend
//   useEffect(() => {
//     let timer;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   // Validate UUID format
//   const isValidUUID = (uuid) => {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     return uuidRegex.test(uuid);
//   };

//   // Handle Login
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     // Validation
//     if (!email.trim()) {
//       setError('Email is required');
//       setLoading(false);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       setLoading(false);
//       return;
//     }

//     if (!password) {
//       setError('Password is required');
//       setLoading(false);
//       return;
//     }

//     if (!cpoId.trim()) {
//       setError('CPO ID is required');
//       setLoading(false);
//       return;
//     }

//     // Prepare login payload - always use "CPO" scope and send cpo_id as string
//     let loginPayload = {
//       email: email,
//       password: password,
//       scope: "CPO",  // Fixed to CPO scope
//     };

//     // CPO ID should always be sent as a string (UUID format)
//     // Check if the provided CPO ID is a valid UUID
//     if (isValidUUID(cpoId.trim())) {
//       loginPayload.cpo_id = cpoId.trim();
//     } else {
//       // If not a UUID, check if it's a number and convert to string
//       const numericCpoId = parseInt(cpoId.trim());
//       if (isNaN(numericCpoId) || numericCpoId <= 0) {
//         setError('Please enter a valid CPO ID (UUID format like: c821a013-5041-42f7-80c8-aa153cf9d455)');
//         setLoading(false);
//         return;
//       }
//       // Even if it's a number, send it as a string
//       loginPayload.cpo_id = cpoId.trim();
//     }

//     console.log('Login payload:', loginPayload);

//     try {
//       const response = await fetch(API_CONFIG.LOGIN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(loginPayload),
//       });

//       const data = await response.json();
//       console.log('Login response:', data);

//       if (response.ok) {
//         // Check if 2FA challenge is present in the response
//         if (data.challenge_id) {
//           // 2FA is required
//           setMfaEnabled(true);
//           setChallengeId(data.challenge_id);
//           setExpiresAt(data.expires_at);
//           setResendAvailableAt(data.resend_available_at);
          
//           // Calculate initial countdown from resend_available_at
//           if (data.resend_available_at) {
//             const resendTime = new Date(data.resend_available_at).getTime();
//             const currentTime = new Date().getTime();
//             const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//             setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//           } else {
//             setCountdown(60);
//           }
          
//           setShow2FA(true);
//           setSuccess('2FA verification required. Please enter the OTP sent to your email.');
//           setLoading(false);
//           return;
//         }

//         // No 2FA required - proceed with normal login
//         const { access_token, refresh_token } = data;
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('refresh_token', refresh_token);
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         try {
//           const decodedToken = jwtDecode(access_token);
//           console.log('Decoded token:', decodedToken);
          
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         setSuccess('Login successful! Redirecting...');
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1500);
//       } else {
//         setError(data.message || 'Invalid credentials. Please check your email, password, and CPO ID.');
//       }
//     } catch (error) {
//       console.error('Login failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle 2FA Verification
//   const handleVerify2FA = async (e) => {
//     e.preventDefault();
//     setOtpLoading(true);
//     setOtpError('');
//     setError('');

//     if (!otp.trim() || otp.length !== 6) {
//       setOtpError('Please enter a valid 6-digit OTP');
//       setOtpLoading(false);
//       return;
//     }

//     // Prepare 2FA verification payload
//     const verifyPayload = {
//       challenge_id: challengeId,
//       code: otp
//     };

//     console.log('2FA Verification payload:', verifyPayload);

//     try {
//       const response = await fetch(API_CONFIG.VERIFY_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(verifyPayload),
//       });

//       const data = await response.json();
//       console.log('2FA verification response:', data);

//       if (response.ok) {
//         const { access_token, refresh_token } = data;
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('refresh_token', refresh_token);
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         try {
//           const decodedToken = jwtDecode(access_token);
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id,
//             mfaEnabled: true
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         setSuccess('2FA verified! Redirecting...');
//         setShow2FA(false);
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1500);
//       } else {
//         setOtpError(data.message || 'Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('2FA verification failed:', error);
//       setOtpError('An error occurred. Please try again.');
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // Handle 2FA Resend
//   const handleResend2FA = async () => {
//     if (countdown > 0 || !challengeId) return;

//     setResendLoading(true);
//     setOtpError('');
//     setError('');

//     // Prepare resend payload
//     const resendPayload = {
//       challenge_id: challengeId
//     };

//     console.log('2FA Resend payload:', resendPayload);

//     try {
//       const response = await fetch(API_CONFIG.RESEND_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(resendPayload),
//       });

//       const data = await response.json();
//       console.log('2FA resend response:', data);

//       if (response.ok) {
//         // Update challenge_id if provided in response
//         if (data.challenge_id) {
//           setChallengeId(data.challenge_id);
//         }
        
//         // Update resend_available_at if provided
//         if (data.resend_available_at) {
//           const resendTime = new Date(data.resend_available_at).getTime();
//           const currentTime = new Date().getTime();
//           const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//           setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//         } else {
//           setCountdown(60);
//         }
        
//         // Update expires_at if provided
//         if (data.expires_at) {
//           setExpiresAt(data.expires_at);
//         }
        
//         setSuccess('OTP resent successfully!');
//         setOtp(''); // Clear the OTP input
//       } else {
//         setError(data.message || 'Failed to resend OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend OTP failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const handleForgotPasswordClick = () => {
//     navigate('/forgot-password');
//   };

//   // Format date for display
//   const formatExpiryTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString();
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left Side - Background Image - Full height with cover */}
//       <div className="hidden lg:flex lg:w-1/2 relative min-h-screen bg-black">
//         <div 
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: `url(${Background})` }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-black/60" />
        
//         {/* Overlay Content - Aligned to Top */}
//         <div className="relative z-10 flex flex-col justify-start pt-16 lg:pt-20 text-white p-12 w-full">
//           <div className="max-w-lg">
//             {/* Brand Logo */}
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
//                 <Zap className="w-8 h-8 text-white" />
//               </div>
//               <span className="text-2xl font-bold text-white">TransEV</span>
//             </div>

//             {/* Main Heading */}
//             <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//               Manage your EV chargers with
//               <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">charging management</span>
//               <br />
//               system
//             </h1>

//             {/* Subtitle */}
//             <p className="text-lg text-blue-100/80 mb-6">
//               All in one stop for your EV solutions
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - White Login Form */}
//       <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12 min-h-screen">
//         <div className="w-full max-w-md">
//           {/* Logo for mobile */}
//           <div className="flex justify-center mb-8 lg:hidden">
//             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
//               <Zap className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           {/* Header Section */}
//           <div className="text-center mb-8">
//             {!show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <User className="w-8 h-8 text-blue-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   Login to your account
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Welcome back! Enter your credentials to continue
//                 </p>
//               </>
//             )}
            
//             {show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <ShieldCheck className="w-8 h-8 text-purple-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   2FA Verification
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Enter the 6-digit code sent to your email
//                 </p>
//                 {expiresAt && (
//                   <p className="text-xs text-gray-400 mt-1">
//                     Code expires at: {formatExpiryTime(expiresAt)}
//                   </p>
//                 )}
//               </>
//             )}
//           </div>

//           {/* Error and Success Messages */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//               <div className="flex items-center gap-2 text-red-600">
//                 <AlertCircle size={16} />
//                 <span className="text-sm">{error}</span>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
//               <div className="flex items-center gap-2 text-green-600">
//                 <CheckCircle size={16} />
//                 <span className="text-sm">{success}</span>
//               </div>
//             </div>
//           )}

//           {/* 2FA Verification Form */}
//           {show2FA ? (
//             <form onSubmit={handleVerify2FA} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Key size={16} className="text-blue-600" />
//                     OTP Code
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     if (value.length <= 6) setOtp(value);
//                   }}
//                   placeholder="Enter 6-digit OTP"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
//                   maxLength="6"
//                   required
//                   autoFocus
//                 />
//                 {otpError && (
//                   <p className="text-red-500 text-xs mt-1">{otpError}</p>
//                 )}
//                 <div className="mt-2 flex items-center justify-between text-sm">
//                   <p className="text-gray-500">
//                     {countdown > 0 ? (
//                       <span className="flex items-center gap-1">
//                         <Clock size={14} /> Resend in {countdown}s
//                       </span>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleResend2FA}
//                         disabled={resendLoading}
//                         className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
//                       >
//                         {resendLoading ? 'Sending...' : 'Resend OTP'}
//                       </button>
//                     )}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShow2FA(false);
//                       setOtp('');
//                       setOtpError('');
//                       setChallengeId('');
//                     }}
//                     className="text-gray-500 hover:text-gray-700"
//                   >
//                     Back to Login
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={otpLoading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {otpLoading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Verifying...
//                   </div>
//                 ) : (
//                   <>
//                     <ShieldCheck size={18} />
//                     Verify & Login
//                   </>
//                 )}
//               </button>
//             </form>
//           ) : (
//             // Main Login Form
//             <form onSubmit={handleSignIn} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Building size={16} className="text-blue-600" />
//                     CPO ID (UUID)
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={cpoId}
//                   onChange={(e) => setCpoId(e.target.value)}
//                   placeholder="Enter CPO UUID (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter CPO ID in UUID format (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-blue-600" />
//                     Email Address
//                   </div>
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email address"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Lock size={16} className="text-blue-600" />
//                     Password
//                   </div>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="remember"
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor="remember" className="text-sm text-gray-600">
//                     Remember me
//                   </label>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleForgotPasswordClick}
//                   className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Signing In...
//                   </div>
//                 ) : (
//                   <>
//                     <LogIn size={18} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>
//           )}

//           {/* Footer */}
//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <p className="text-xs text-gray-500 text-center">
//               <Shield size={12} className="inline mr-1" />
//               Secure CPO Login • {mfaEnabled ? '2FA Enabled' : '2FA Disabled'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import { 
//   Mail, 
//   Lock, 
//   Eye, 
//   EyeOff,
//   Key,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Shield,
//   Building,
//   LogIn,
//   ShieldCheck,
//   Zap,
//   ArrowLeft,
//   Sparkles,
//   Battery,
//   Car,
//   Plug,
//   User
// } from 'lucide-react';
// import Background from "../../assets/bg.jpg";

// // API Configuration
// const API_CONFIG = {
//   LOGIN_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/login'
//   },
//   VERIFY_2FA_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/verify'
//   },
//   RESEND_2FA_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/resend'
//   },
//   REFRESH_TOKEN_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/refresh'
//   }
// };

// const SignIn = () => {
//   const navigate = useNavigate();
  
//   // Login states
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [cpoId, setCpoId] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // 2FA states
//   const [show2FA, setShow2FA] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [challengeId, setChallengeId] = useState('');
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [countdown, setCountdown] = useState(0);
//   const [otpError, setOtpError] = useState('');
//   const [mfaEnabled, setMfaEnabled] = useState(false);
//   const [expiresAt, setExpiresAt] = useState('');
//   const [resendAvailableAt, setResendAvailableAt] = useState('');

//   // Countdown timer for 2FA OTP resend
//   useEffect(() => {
//     let timer;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   // Validate UUID format
//   const isValidUUID = (uuid) => {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     return uuidRegex.test(uuid);
//   };

//   // Handle Login
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     // Validation
//     if (!email.trim()) {
//       setError('Email is required');
//       setLoading(false);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       setLoading(false);
//       return;
//     }

//     if (!password) {
//       setError('Password is required');
//       setLoading(false);
//       return;
//     }

//     if (!cpoId.trim()) {
//       setError('CPO ID is required');
//       setLoading(false);
//       return;
//     }

//     // Prepare login payload
//     let loginPayload = {
//       email: email,
//       password: password,
//       scope: "CPO",
//     };

//     if (isValidUUID(cpoId.trim())) {
//       loginPayload.cpo_id = cpoId.trim();
//     } else {
//       const numericCpoId = parseInt(cpoId.trim());
//       if (isNaN(numericCpoId) || numericCpoId <= 0) {
//         setError('Please enter a valid CPO ID (UUID format like: c821a013-5041-42f7-80c8-aa153cf9d455)');
//         setLoading(false);
//         return;
//       }
//       loginPayload.cpo_id = cpoId.trim();
//     }

//     console.log('Login payload:', loginPayload);

//     try {
//       const response = await fetch(API_CONFIG.LOGIN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(loginPayload),
//       });

//       const data = await response.json();
//       console.log('Login response:', data);

//       if (response.ok) {
//         if (data.challenge_id) {
//           setMfaEnabled(true);
//           setChallengeId(data.challenge_id);
//           setExpiresAt(data.expires_at);
//           setResendAvailableAt(data.resend_available_at);
          
//           if (data.resend_available_at) {
//             const resendTime = new Date(data.resend_available_at).getTime();
//             const currentTime = new Date().getTime();
//             const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//             setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//           } else {
//             setCountdown(60);
//           }
          
//           setShow2FA(true);
//           setSuccess('2FA verification required. Please enter the OTP sent to your email.');
//           setLoading(false);
//           return;
//         }

//         const { access_token, refresh_token } = data;
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('refresh_token', refresh_token);
//         localStorage.setItem('token_expiry', data.expires_in ? Date.now() + (data.expires_in * 1000) : '');
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         try {
//           const decodedToken = jwtDecode(access_token);
//           console.log('Decoded token:', decodedToken);
          
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         setSuccess('Login successful! Redirecting...');
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1500);
//       } else {
//         setError(data.message || 'Invalid credentials. Please check your email, password, and CPO ID.');
//       }
//     } catch (error) {
//       console.error('Login failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle 2FA Verification
//   const handleVerify2FA = async (e) => {
//     e.preventDefault();
//     setOtpLoading(true);
//     setOtpError('');
//     setError('');

//     if (!otp.trim() || otp.length !== 6) {
//       setOtpError('Please enter a valid 6-digit OTP');
//       setOtpLoading(false);
//       return;
//     }

//     const verifyPayload = {
//       challenge_id: challengeId,
//       code: otp
//     };

//     console.log('2FA Verification payload:', verifyPayload);

//     try {
//       const response = await fetch(API_CONFIG.VERIFY_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(verifyPayload),
//       });

//       const data = await response.json();
//       console.log('2FA verification response:', data);

//       if (response.ok) {
//         const { access_token, refresh_token } = data;
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('refresh_token', refresh_token);
//         localStorage.setItem('token_expiry', data.expires_in ? Date.now() + (data.expires_in * 1000) : '');
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         try {
//           const decodedToken = jwtDecode(access_token);
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id,
//             mfaEnabled: true
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         setSuccess('2FA verified! Redirecting...');
//         setShow2FA(false);
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1500);
//       } else {
//         setOtpError(data.message || 'Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('2FA verification failed:', error);
//       setOtpError('An error occurred. Please try again.');
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // Handle 2FA Resend
//   const handleResend2FA = async () => {
//     if (countdown > 0 || !challengeId) return;

//     setResendLoading(true);
//     setOtpError('');
//     setError('');

//     const resendPayload = {
//       challenge_id: challengeId
//     };

//     console.log('2FA Resend payload:', resendPayload);

//     try {
//       const response = await fetch(API_CONFIG.RESEND_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(resendPayload),
//       });

//       const data = await response.json();
//       console.log('2FA resend response:', data);

//       if (response.ok) {
//         if (data.challenge_id) {
//           setChallengeId(data.challenge_id);
//         }
        
//         if (data.resend_available_at) {
//           const resendTime = new Date(data.resend_available_at).getTime();
//           const currentTime = new Date().getTime();
//           const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//           setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//         } else {
//           setCountdown(60);
//         }
        
//         if (data.expires_at) {
//           setExpiresAt(data.expires_at);
//         }
        
//         setSuccess('OTP resent successfully!');
//         setOtp('');
//       } else {
//         setError(data.message || 'Failed to resend OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend OTP failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const handleForgotPasswordClick = () => {
//     navigate('/forgot-password');
//   };

//   const formatExpiryTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString();
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left Side - Background Image */}
//       <div className="hidden lg:flex lg:w-1/2 relative min-h-screen bg-black">
//         <div 
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: `url(${Background})` }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-black/60" />
        
//         <div className="relative z-10 flex flex-col justify-start pt-16 lg:pt-20 text-white p-12 w-full">
//           <div className="max-w-lg">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
//                 <Zap className="w-8 h-8 text-white" />
//               </div>
//               {/* <span className="text-2xl font-bold text-white">TransEV</span> */}
//               <span className="text-2xl font-bold">
//   <span className="text-orange-500">Trans</span>
//   <span className="text-green-600">EV</span>
// </span>
//             </div>

//             <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//               Manage your EV chargers with
//               <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">charging management</span>
//               <br />
//               system
//             </h1>

//             <p className="text-lg text-blue-100/80 mb-6">
//               All in one stop for your EV solutions
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12 min-h-screen">
//         <div className="w-full max-w-md">
//           <div className="flex justify-center mb-8 lg:hidden">
//             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
//               <Zap className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           <div className="text-center mb-8">
//             {!show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <User className="w-8 h-8 text-blue-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   Login to your account
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Welcome back! Enter your credentials to continue
//                 </p>
//               </>
//             )}
            
//             {show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <ShieldCheck className="w-8 h-8 text-purple-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   2FA Verification
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Enter the 6-digit code sent to your email
//                 </p>
//                 {expiresAt && (
//                   <p className="text-xs text-gray-400 mt-1">
//                     Code expires at: {formatExpiryTime(expiresAt)}
//                   </p>
//                 )}
//               </>
//             )}
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//               <div className="flex items-center gap-2 text-red-600">
//                 <AlertCircle size={16} />
//                 <span className="text-sm">{error}</span>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
//               <div className="flex items-center gap-2 text-green-600">
//                 <CheckCircle size={16} />
//                 <span className="text-sm">{success}</span>
//               </div>
//             </div>
//           )}

//           {show2FA ? (
//             <form onSubmit={handleVerify2FA} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Key size={16} className="text-blue-600" />
//                     OTP Code
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     if (value.length <= 6) setOtp(value);
//                   }}
//                   placeholder="Enter 6-digit OTP"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
//                   maxLength="6"
//                   required
//                   autoFocus
//                 />
//                 {otpError && (
//                   <p className="text-red-500 text-xs mt-1">{otpError}</p>
//                 )}
//                 <div className="mt-2 flex items-center justify-between text-sm">
//                   <p className="text-gray-500">
//                     {countdown > 0 ? (
//                       <span className="flex items-center gap-1">
//                         <Clock size={14} /> Resend in {countdown}s
//                       </span>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleResend2FA}
//                         disabled={resendLoading}
//                         className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
//                       >
//                         {resendLoading ? 'Sending...' : 'Resend OTP'}
//                       </button>
//                     )}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShow2FA(false);
//                       setOtp('');
//                       setOtpError('');
//                       setChallengeId('');
//                     }}
//                     className="text-gray-500 hover:text-gray-700"
//                   >
//                     Back to Login
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={otpLoading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {otpLoading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Verifying...
//                   </div>
//                 ) : (
//                   <>
//                     <ShieldCheck size={18} />
//                     Verify & Login
//                   </>
//                 )}
//               </button>
//             </form>
//           ) : (
//             <form onSubmit={handleSignIn} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Building size={16} className="text-blue-600" />
//                     CPO ID (UUID)
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={cpoId}
//                   onChange={(e) => setCpoId(e.target.value)}
//                   placeholder="Enter CPO UUID (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter CPO ID in UUID format
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-blue-600" />
//                     Email Address
//                   </div>
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email address"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Lock size={16} className="text-blue-600" />
//                     Password
//                   </div>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="remember"
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor="remember" className="text-sm text-gray-600">
//                     Remember me
//                   </label>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleForgotPasswordClick}
//                   className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Signing In...
//                   </div>
//                 ) : (
//                   <>
//                     <LogIn size={18} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>
//           )}

//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <p className="text-xs text-gray-500 text-center">
//               <Shield size={12} className="inline mr-1" />
//               Secure CPO Login • {mfaEnabled ? '2FA Enabled' : '2FA Disabled'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// src/pages/SignIn.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import { useAuth } from '../Authentication/AuthContext';
// import { 
//   Mail, Lock, Eye, EyeOff, Key, CheckCircle, AlertCircle, 
//   Clock, Shield, Building, LogIn, ShieldCheck, Zap, User
// } from 'lucide-react';
// import Background from "../../assets/bg.jpg";

// // API Configuration
// const API_CONFIG = {
//   LOGIN_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/login'
//   },
//   VERIFY_2FA_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/verify'
//   },
//   RESEND_2FA_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/resend'
//   }
// };

// const SignIn = () => {
//   const navigate = useNavigate();
//   const { login, isAuthenticated, loading: authLoading } = useAuth();
  
//   // Login states
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [cpoId, setCpoId] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // 2FA states
//   const [show2FA, setShow2FA] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [challengeId, setChallengeId] = useState('');
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [countdown, setCountdown] = useState(0);
//   const [otpError, setOtpError] = useState('');
//   const [mfaEnabled, setMfaEnabled] = useState(false);
//   const [expiresAt, setExpiresAt] = useState('');
//   const [resendAvailableAt, setResendAvailableAt] = useState('');

//   // Check if already logged in
//   useEffect(() => {
//     if (isAuthenticated && !authLoading) {
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, authLoading, navigate]);

//   // Countdown timer for 2FA OTP resend
//   useEffect(() => {
//     let timer;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   // Validate UUID format
//   const isValidUUID = (uuid) => {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     return uuidRegex.test(uuid);
//   };

//   // Handle Login
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     // Validation
//     if (!email.trim()) {
//       setError('Email is required');
//       setLoading(false);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       setLoading(false);
//       return;
//     }

//     if (!password) {
//       setError('Password is required');
//       setLoading(false);
//       return;
//     }

//     if (!cpoId.trim()) {
//       setError('CPO ID is required');
//       setLoading(false);
//       return;
//     }

//     // Prepare login payload
//     let loginPayload = {
//       email: email,
//       password: password,
//       scope: "CPO",
//     };

//     if (isValidUUID(cpoId.trim())) {
//       loginPayload.cpo_id = cpoId.trim();
//     } else {
//       const numericCpoId = parseInt(cpoId.trim());
//       if (isNaN(numericCpoId) || numericCpoId <= 0) {
//         setError('Please enter a valid CPO ID (UUID format like: c821a013-5041-42f7-80c8-aa153cf9d455)');
//         setLoading(false);
//         return;
//       }
//       loginPayload.cpo_id = cpoId.trim();
//     }

//     try {
//       const response = await fetch(API_CONFIG.LOGIN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(loginPayload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         if (data.challenge_id) {
//           setMfaEnabled(true);
//           setChallengeId(data.challenge_id);
//           setExpiresAt(data.expires_at);
//           setResendAvailableAt(data.resend_available_at);
          
//           if (data.resend_available_at) {
//             const resendTime = new Date(data.resend_available_at).getTime();
//             const currentTime = new Date().getTime();
//             const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//             setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//           } else {
//             setCountdown(60);
//           }
          
//           setShow2FA(true);
//           setSuccess('2FA verification required. Please enter the OTP sent to your email.');
//           setLoading(false);
//           return;
//         }

//         const { access_token, refresh_token } = data;
        
//         // Store user info
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         let userInfo = null;
//         try {
//           const decodedToken = jwtDecode(access_token);
//           userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id
//           };
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         // Use the auth context login function
//         login(access_token, refresh_token, data.expires_in, userInfo);

//         setSuccess('Login successful! Redirecting...');
//         setTimeout(() => {
//           navigate('/dashboard', { replace: true });
//         }, 1500);
//       } else {
//         setError(data.message || 'Invalid credentials. Please check your email, password, and CPO ID.');
//       }
//     } catch (error) {
//       console.error('Login failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle 2FA Verification
//   const handleVerify2FA = async (e) => {
//     e.preventDefault();
//     setOtpLoading(true);
//     setOtpError('');
//     setError('');

//     if (!otp.trim() || otp.length !== 6) {
//       setOtpError('Please enter a valid 6-digit OTP');
//       setOtpLoading(false);
//       return;
//     }

//     const verifyPayload = {
//       challenge_id: challengeId,
//       code: otp
//     };

//     try {
//       const response = await fetch(API_CONFIG.VERIFY_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(verifyPayload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const { access_token, refresh_token } = data;
        
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         let userInfo = null;
//         try {
//           const decodedToken = jwtDecode(access_token);
//           userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id,
//             mfaEnabled: true
//           };
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         // Use the auth context login function
//         login(access_token, refresh_token, data.expires_in, userInfo);

//         setSuccess('2FA verified! Redirecting...');
//         setShow2FA(false);
//         setTimeout(() => {
//           navigate('/dashboard', { replace: true });
//         }, 1500);
//       } else {
//         setOtpError(data.message || 'Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('2FA verification failed:', error);
//       setOtpError('An error occurred. Please try again.');
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // Handle 2FA Resend
//   const handleResend2FA = async () => {
//     if (countdown > 0 || !challengeId) return;

//     setResendLoading(true);
//     setOtpError('');
//     setError('');

//     const resendPayload = {
//       challenge_id: challengeId
//     };

//     try {
//       const response = await fetch(API_CONFIG.RESEND_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(resendPayload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         if (data.challenge_id) {
//           setChallengeId(data.challenge_id);
//         }
        
//         if (data.resend_available_at) {
//           const resendTime = new Date(data.resend_available_at).getTime();
//           const currentTime = new Date().getTime();
//           const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//           setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//         } else {
//           setCountdown(60);
//         }
        
//         if (data.expires_at) {
//           setExpiresAt(data.expires_at);
//         }
        
//         setSuccess('OTP resent successfully!');
//         setOtp('');
//       } else {
//         setError(data.message || 'Failed to resend OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend OTP failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const handleForgotPasswordClick = () => {
//     navigate('/forgot-password');
//   };

//   const formatExpiryTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString();
//   };

//   // Rest of your JSX remains the same
//   return (
//     <div className="flex min-h-screen">
//       {/* Left Side - Background Image */}
//       <div className="hidden lg:flex lg:w-1/2 relative min-h-screen bg-black">
//         <div 
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: `url(${Background})` }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-black/60" />
        
//         <div className="relative z-10 flex flex-col justify-start pt-16 lg:pt-20 text-white p-12 w-full">
//           <div className="max-w-lg">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
//                 <Zap className="w-8 h-8 text-white" />
//               </div>
//               <span className="text-2xl font-bold">
//                 <span className="text-orange-500">Trans</span>
//                 <span className="text-green-600">EV</span>
//               </span>
//             </div>

//             <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//               Manage your EV chargers with
//               <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">charging management</span>
//               <br />
//               system
//             </h1>

//             <p className="text-lg text-blue-100/80 mb-6">
//               All in one stop for your EV solutions
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12 min-h-screen">
//         <div className="w-full max-w-md">
//           <div className="flex justify-center mb-8 lg:hidden">
//             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
//               <Zap className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           <div className="text-center mb-8">
//             {!show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <User className="w-8 h-8 text-blue-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   Login to your account
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Welcome back! Enter your credentials to continue
//                 </p>
//               </>
//             )}
            
//             {show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <ShieldCheck className="w-8 h-8 text-purple-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   2FA Verification
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Enter the 6-digit code sent to your email
//                 </p>
//                 {expiresAt && (
//                   <p className="text-xs text-gray-400 mt-1">
//                     Code expires at: {formatExpiryTime(expiresAt)}
//                   </p>
//                 )}
//               </>
//             )}
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//               <div className="flex items-center gap-2 text-red-600">
//                 <AlertCircle size={16} />
//                 <span className="text-sm">{error}</span>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
//               <div className="flex items-center gap-2 text-green-600">
//                 <CheckCircle size={16} />
//                 <span className="text-sm">{success}</span>
//               </div>
//             </div>
//           )}

//           {show2FA ? (
//             <form onSubmit={handleVerify2FA} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Key size={16} className="text-blue-600" />
//                     OTP Code
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     if (value.length <= 6) setOtp(value);
//                   }}
//                   placeholder="Enter 6-digit OTP"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
//                   maxLength="6"
//                   required
//                   autoFocus
//                 />
//                 {otpError && (
//                   <p className="text-red-500 text-xs mt-1">{otpError}</p>
//                 )}
//                 <div className="mt-2 flex items-center justify-between text-sm">
//                   <p className="text-gray-500">
//                     {countdown > 0 ? (
//                       <span className="flex items-center gap-1">
//                         <Clock size={14} /> Resend in {countdown}s
//                       </span>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleResend2FA}
//                         disabled={resendLoading}
//                         className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
//                       >
//                         {resendLoading ? 'Sending...' : 'Resend OTP'}
//                       </button>
//                     )}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShow2FA(false);
//                       setOtp('');
//                       setOtpError('');
//                       setChallengeId('');
//                     }}
//                     className="text-gray-500 hover:text-gray-700"
//                   >
//                     Back to Login
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={otpLoading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {otpLoading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Verifying...
//                   </div>
//                 ) : (
//                   <>
//                     <ShieldCheck size={18} />
//                     Verify & Login
//                   </>
//                 )}
//               </button>
//             </form>
//           ) : (
//             <form onSubmit={handleSignIn} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Building size={16} className="text-blue-600" />
//                     CPO ID (UUID)
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={cpoId}
//                   onChange={(e) => setCpoId(e.target.value)}
//                   placeholder="Enter CPO UUID (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter CPO ID in UUID format
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-blue-600" />
//                     Email Address
//                   </div>
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email address"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Lock size={16} className="text-blue-600" />
//                     Password
//                   </div>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="remember"
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor="remember" className="text-sm text-gray-600">
//                     Remember me
//                   </label>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleForgotPasswordClick}
//                   className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Signing In...
//                   </div>
//                 ) : (
//                   <>
//                     <LogIn size={18} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>
//           )}

//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <p className="text-xs text-gray-500 text-center">
//               <Shield size={12} className="inline mr-1" />
//               Secure CPO Login • {mfaEnabled ? '2FA Enabled' : '2FA Disabled'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// src/components/Authentication/SignIn.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import { useAuth } from '../Authentication/AuthContext'; // সঠিক পাথ
// import { 
//   Mail, Lock, Eye, EyeOff, Key, CheckCircle, AlertCircle, 
//   Clock, Shield, Building, LogIn, ShieldCheck, Zap, User
// } from 'lucide-react';
// import Background from "../../assets/bg.jpg";

// // API Configuration
// const API_CONFIG = {
//   LOGIN_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/login'
//   },
//   VERIFY_2FA_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/verify'
//   },
//   RESEND_2FA_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/2fa/resend'
//   }
// };

// const SignIn = () => {
//   const navigate = useNavigate();
//   const { login, isAuthenticated, loading: authLoading, isRefreshing } = useAuth();
  
//   // Login states
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [cpoId, setCpoId] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // 2FA states
//   const [show2FA, setShow2FA] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [challengeId, setChallengeId] = useState('');
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [countdown, setCountdown] = useState(0);
//   const [otpError, setOtpError] = useState('');
//   const [mfaEnabled, setMfaEnabled] = useState(false);
//   const [expiresAt, setExpiresAt] = useState('');
//   const [resendAvailableAt, setResendAvailableAt] = useState('');

//   // Check if already logged in - with proper dependency
//   useEffect(() => {
//     console.log('🔍 Auth State Check:', { isAuthenticated, authLoading, isRefreshing });
//     if (isAuthenticated && !authLoading && !isRefreshing) {
//       console.log('✅ User is authenticated, redirecting to dashboard...');
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, authLoading, isRefreshing, navigate]);

//   // Countdown timer for 2FA OTP resend
//   useEffect(() => {
//     let timer;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   // Validate UUID format
//   const isValidUUID = (uuid) => {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     return uuidRegex.test(uuid);
//   };

//   // Handle Login
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     // Validation
//     if (!email.trim()) {
//       setError('Email is required');
//       setLoading(false);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       setLoading(false);
//       return;
//     }

//     if (!password) {
//       setError('Password is required');
//       setLoading(false);
//       return;
//     }

//     if (!cpoId.trim()) {
//       setError('CPO ID is required');
//       setLoading(false);
//       return;
//     }

//     // Prepare login payload
//     let loginPayload = {
//       email: email,
//       password: password,
//       scope: "CPO",
//     };

//     if (isValidUUID(cpoId.trim())) {
//       loginPayload.cpo_id = cpoId.trim();
//     } else {
//       const numericCpoId = parseInt(cpoId.trim());
//       if (isNaN(numericCpoId) || numericCpoId <= 0) {
//         setError('Please enter a valid CPO ID (UUID format like: c821a013-5041-42f7-80c8-aa153cf9d455)');
//         setLoading(false);
//         return;
//       }
//       loginPayload.cpo_id = cpoId.trim();
//     }

//     console.log('📤 Login Payload:', loginPayload);

//     try {
//       const response = await fetch(API_CONFIG.LOGIN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(loginPayload),
//       });

//       const data = await response.json();
//       console.log('📥 Login Response:', data);

//       if (response.ok) {
//         if (data.challenge_id) {
//           setMfaEnabled(true);
//           setChallengeId(data.challenge_id);
//           setExpiresAt(data.expires_at);
//           setResendAvailableAt(data.resend_available_at);
          
//           if (data.resend_available_at) {
//             const resendTime = new Date(data.resend_available_at).getTime();
//             const currentTime = new Date().getTime();
//             const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//             setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//           } else {
//             setCountdown(60);
//           }
          
//           setShow2FA(true);
//           setSuccess('2FA verification required. Please enter the OTP sent to your email.');
//           setLoading(false);
//           return;
//         }

//         const { access_token, refresh_token } = data;
        
//         // Store user info in localStorage
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         let userInfo = null;
//         try {
//           const decodedToken = jwtDecode(access_token);
//           console.log('🔓 Decoded Token:', decodedToken);
//           userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id
//           };
//           // Save userInfo to localStorage
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         // Use the auth context login function
//         console.log('🔐 Calling login with:', { access_token, refresh_token, expires_in: data.expires_in, userInfo });
//         login(access_token, refresh_token, data.expires_in, userInfo);

//         setSuccess('Login successful! Redirecting...');
//         // Wait a bit before redirecting
//         setTimeout(() => {
//           console.log('🚀 Redirecting to dashboard...');
//           navigate('/dashboard', { replace: true });
//         }, 1500);
//       } else {
//         setError(data.message || 'Invalid credentials. Please check your email, password, and CPO ID.');
//       }
//     } catch (error) {
//       console.error('❌ Login failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle 2FA Verification
//   const handleVerify2FA = async (e) => {
//     e.preventDefault();
//     setOtpLoading(true);
//     setOtpError('');
//     setError('');

//     if (!otp.trim() || otp.length !== 6) {
//       setOtpError('Please enter a valid 6-digit OTP');
//       setOtpLoading(false);
//       return;
//     }

//     const verifyPayload = {
//       challenge_id: challengeId,
//       code: otp
//     };

//     console.log('📤 2FA Verify Payload:', verifyPayload);

//     try {
//       const response = await fetch(API_CONFIG.VERIFY_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(verifyPayload),
//       });

//       const data = await response.json();
//       console.log('📥 2FA Verify Response:', data);

//       if (response.ok) {
//         const { access_token, refresh_token } = data;
        
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('cpoId', cpoId);

//         let userInfo = null;
//         try {
//           const decodedToken = jwtDecode(access_token);
//           userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || email,
//             scope: 'CPO',
//             cpoId: cpoId,
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id,
//             mfaEnabled: true
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding token:', decodeError);
//         }

//         // Use the auth context login function
//         login(access_token, refresh_token, data.expires_in, userInfo);

//         setSuccess('2FA verified! Redirecting...');
//         setShow2FA(false);
//         setTimeout(() => {
//           console.log('🚀 Redirecting to dashboard after 2FA...');
//           navigate('/dashboard', { replace: true });
//         }, 1500);
//       } else {
//         setOtpError(data.message || 'Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('❌ 2FA verification failed:', error);
//       setOtpError('An error occurred. Please try again.');
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // Handle 2FA Resend
//   const handleResend2FA = async () => {
//     if (countdown > 0 || !challengeId) return;

//     setResendLoading(true);
//     setOtpError('');
//     setError('');

//     const resendPayload = {
//       challenge_id: challengeId
//     };

//     try {
//       const response = await fetch(API_CONFIG.RESEND_2FA_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(resendPayload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         if (data.challenge_id) {
//           setChallengeId(data.challenge_id);
//         }
        
//         if (data.resend_available_at) {
//           const resendTime = new Date(data.resend_available_at).getTime();
//           const currentTime = new Date().getTime();
//           const remainingSeconds = Math.max(0, Math.floor((resendTime - currentTime) / 1000));
//           setCountdown(remainingSeconds > 0 ? remainingSeconds : 60);
//         } else {
//           setCountdown(60);
//         }
        
//         if (data.expires_at) {
//           setExpiresAt(data.expires_at);
//         }
        
//         setSuccess('OTP resent successfully!');
//         setOtp('');
//       } else {
//         setError(data.message || 'Failed to resend OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend OTP failed:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const handleForgotPasswordClick = () => {
//     navigate('/forgot-password');
//   };

//   const formatExpiryTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString();
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left Side - Background Image */}
//       <div className="hidden lg:flex lg:w-1/2 relative min-h-screen bg-black">
//         <div 
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: `url(${Background})` }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-black/60" />
        
//         <div className="relative z-10 flex flex-col justify-start pt-16 lg:pt-20 text-white p-12 w-full">
//           <div className="max-w-lg">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
//                 <Zap className="w-8 h-8 text-white" />
//               </div>
//               <span className="text-2xl font-bold">
//                 <span className="text-orange-500">Trans</span>
//                 <span className="text-green-600">EV</span>
//               </span>
//             </div>

//             <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//               Manage your EV chargers with
//               <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">charging management</span>
//               <br />
//               system
//             </h1>

//             <p className="text-lg text-blue-100/80 mb-6">
//               All in one stop for your EV solutions
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12 min-h-screen">
//         <div className="w-full max-w-md">
//           <div className="flex justify-center mb-8 lg:hidden">
//             <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
//               <Zap className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           <div className="text-center mb-8">
//             {!show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <User className="w-8 h-8 text-blue-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   Login to your account
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Welcome back! Enter your credentials to continue
//                 </p>
//               </>
//             )}
            
//             {show2FA && (
//               <>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
//                     <ShieldCheck className="w-8 h-8 text-purple-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-3xl font-bold text-gray-900">
//                   2FA Verification
//                 </h2>
//                 <p className="text-gray-500 mt-2 text-sm">
//                   Enter the 6-digit code sent to your email
//                 </p>
//                 {expiresAt && (
//                   <p className="text-xs text-gray-400 mt-1">
//                     Code expires at: {formatExpiryTime(expiresAt)}
//                   </p>
//                 )}
//               </>
//             )}
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//               <div className="flex items-center gap-2 text-red-600">
//                 <AlertCircle size={16} />
//                 <span className="text-sm">{error}</span>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
//               <div className="flex items-center gap-2 text-green-600">
//                 <CheckCircle size={16} />
//                 <span className="text-sm">{success}</span>
//               </div>
//             </div>
//           )}

//           {show2FA ? (
//             <form onSubmit={handleVerify2FA} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Key size={16} className="text-blue-600" />
//                     OTP Code
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     if (value.length <= 6) setOtp(value);
//                   }}
//                   placeholder="Enter 6-digit OTP"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
//                   maxLength="6"
//                   required
//                   autoFocus
//                 />
//                 {otpError && (
//                   <p className="text-red-500 text-xs mt-1">{otpError}</p>
//                 )}
//                 <div className="mt-2 flex items-center justify-between text-sm">
//                   <p className="text-gray-500">
//                     {countdown > 0 ? (
//                       <span className="flex items-center gap-1">
//                         <Clock size={14} /> Resend in {countdown}s
//                       </span>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleResend2FA}
//                         disabled={resendLoading}
//                         className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
//                       >
//                         {resendLoading ? 'Sending...' : 'Resend OTP'}
//                       </button>
//                     )}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShow2FA(false);
//                       setOtp('');
//                       setOtpError('');
//                       setChallengeId('');
//                     }}
//                     className="text-gray-500 hover:text-gray-700"
//                   >
//                     Back to Login
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={otpLoading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {otpLoading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Verifying...
//                   </div>
//                 ) : (
//                   <>
//                     <ShieldCheck size={18} />
//                     Verify & Login
//                   </>
//                 )}
//               </button>
//             </form>
//           ) : (
//             <form onSubmit={handleSignIn} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Building size={16} className="text-blue-600" />
//                     CPO ID (UUID)
//                   </div>
//                 </label>
//                 <input
//                   type="text"
//                   value={cpoId}
//                   onChange={(e) => setCpoId(e.target.value)}
//                   placeholder="Enter CPO UUID (e.g., c821a013-5041-42f7-80c8-aa153cf9d455)"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter CPO ID in UUID format
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-blue-600" />
//                     Email Address
//                   </div>
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email address"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <div className="flex items-center gap-2">
//                     <Lock size={16} className="text-blue-600" />
//                     Password
//                   </div>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="remember"
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor="remember" className="text-sm text-gray-600">
//                     Remember me
//                   </label>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleForgotPasswordClick}
//                   className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Signing In...
//                   </div>
//                 ) : (
//                   <>
//                     <LogIn size={18} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>
//           )}

//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <p className="text-xs text-gray-500 text-center">
//               <Shield size={12} className="inline mr-1" />
//               Secure CPO Login • {mfaEnabled ? '2FA Enabled' : '2FA Disabled'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// src/components/Authentication/SignIn.jsx


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


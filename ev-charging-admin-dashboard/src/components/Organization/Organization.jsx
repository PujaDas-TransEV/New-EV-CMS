// // src/pages/Organization.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   User,
//   Settings,
//   LogOut,
//   Plus,
//   ChevronDown,
//   Building,
//   Mail,
//   Calendar,
//   Clock,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   X,
//   Layers,
//   MapPin,
//   Globe,
//   Hash,
//   FileText,
//   ExternalLink,
//   Search,
//   Phone,
//   Loader2,
//   Home,
//   Menu,
//   Link as LinkIcon,
//   CreditCard,
//   Zap,
//   Award,
//   TrendingUp,
//   DollarSign,
//   Crown,
//   Star,
//   Calendar as CalendarIcon,
//   Check,
//   Sparkles,
//   Gift,
//   BadgeCheck,
//   RefreshCw,
//   Timer,
//   Infinity,
//   Package,
//   IndianRupee,
//   Repeat,
//   CalendarDays
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // Get API Base URL from environment with fallback
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// // Log to verify environment variables are loaded
// console.log('API Base URL:', API_BASE_URL);
// console.log('CPO App ID:', CPO_APP_ID);

// // API Configuration
// const API_CONFIG = {
//   ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
//   SUBSCRIPTION_API: `${API_BASE_URL}/api/v1/cpo/subscription`,
//   LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
//   REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
// };

// // Token Refresh Functions
// const refreshAccessToken = async () => {
//   const refreshToken = localStorage.getItem('refresh_token');
  
//   if (!refreshToken) {
//     console.log('No refresh token found');
//     return { success: false, error: 'No refresh token available' };
//   }

//   try {
//     const response = await fetch(API_CONFIG.REFRESH_TOKEN_API, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-CPO-App-ID': CPO_APP_ID
//       },
//       body: JSON.stringify({
//         refresh_token: refreshToken
//       })
//     });

//     const data = await response.json();
//     console.log('Refresh token response:', data);

//     if (response.ok && data.access_token) {
//       localStorage.setItem('token', data.access_token);
      
//       if (data.expires_in) {
//         localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));
//       }
      
//       if (data.refresh_token) {
//         localStorage.setItem('refresh_token', data.refresh_token);
//       }

//       return { success: true, token: data.access_token };
//     } else {
//       console.log('Refresh token failed:', data);
//       return { success: false, error: data.message || 'Failed to refresh token' };
//     }
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     return { success: false, error: error.message };
//   }
// };

// const fetchWithTokenRefresh = async (url, options = {}, retryCount = 3) => {
//   const token = localStorage.getItem('token');
  
//   if (!token) {
//     throw new Error('No token found');
//   }

//   console.log('Fetching URL:', url);

//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...options.headers,
//         'Authorization': `Bearer ${token}`,
//         'X-CPO-App-ID': CPO_APP_ID,
//         'Content-Type': 'application/json',
//       }
//     });

//     if (response.status === 401 && retryCount > 0) {
//       console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
      
//       const refreshResult = await refreshAccessToken();
      
//       if (refreshResult.success) {
//         const newToken = localStorage.getItem('token');
//         console.log('Token refreshed successfully, retrying request...');
        
//         const retryResponse = await fetch(url, {
//           ...options,
//           headers: {
//             ...options.headers,
//             'Authorization': `Bearer ${newToken}`,
//             'X-CPO-App-ID': CPO_APP_ID,
//             'Content-Type': 'application/json',
//           }
//         });
        
//         if (retryResponse.ok) {
//           return retryResponse;
//         } else if (retryResponse.status === 401 && retryCount > 1) {
//           return fetchWithTokenRefresh(url, options, retryCount - 1);
//         }
//       } else {
//         console.log('Refresh token failed, but we will try to continue...');
//         throw new Error('REFRESH_TOKEN_FAILED');
//       }
//     }

//     return response;
//   } catch (error) {
//     console.error('Fetch error:', error);
//     throw error;
//   }
// };

// const Organization = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   // Organization state
//   const [orgData, setOrgData] = useState(null);
//   const [orgLoading, setOrgLoading] = useState(false);
//   const [orgError, setOrgError] = useState('');
  
//   // Subscription state
//   const [subscriptionData, setSubscriptionData] = useState(null);
//   const [subLoading, setSubLoading] = useState(false);
//   const [subError, setSubError] = useState('');
//   const [isRefreshing, setIsRefreshing] = useState(false);
  
//   // Fetch user info and organization data
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/signin');
//       return;
//     }
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       await fetchUserInfo();
//       await fetchOrganizationData();
//       await fetchSubscriptionData();
//     } catch (error) {
//       console.error('Error loading data:', error);
//       if (error.message === 'REFRESH_TOKEN_FAILED') {
//         setOrgError('Session expired. Please refresh the page to continue.');
//         setSubError('Session expired. Please refresh the page to continue.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserInfo = async () => {
//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
//         method: 'GET'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('User info:', data);
//         setUserData(data);
        
//         const userInfo = {
//           name: data.user?.full_name || data.user?.name || 'User',
//           email: data.user?.email || '',
//           role: data.role || '',
//           ...data
//         };
//         localStorage.setItem('userInfo', JSON.stringify(userInfo));
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//       if (error.message === 'REFRESH_TOKEN_FAILED') {
//         throw error;
//       }
//     }
//   };

//   const fetchOrganizationData = async () => {
//     setOrgLoading(true);
//     setOrgError('');
//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.ORGANIZATION_API, {
//         method: 'GET'
//       });

//       const data = await response.json();
//       console.log('Organization data:', data);

//       if (response.ok) {
//         setOrgData(data);
//       } else {
//         setOrgError(data.message || data.error?.message || 'Failed to fetch organization data');
//       }
//     } catch (error) {
//       console.error('Error fetching organization:', error);
//       if (error.message === 'REFRESH_TOKEN_FAILED') {
//         setOrgError('Session expired. Please refresh the page or login again.');
//       } else {
//         setOrgError(error.message || 'An error occurred while fetching organization data');
//       }
//     } finally {
//       setOrgLoading(false);
//     }
//   };

//   const fetchSubscriptionData = async () => {
//     setSubLoading(true);
//     setSubError('');
//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.SUBSCRIPTION_API, {
//         method: 'GET'
//       });

//       const data = await response.json();
//       console.log('Subscription data:', data);

//       if (response.ok) {
//         setSubscriptionData(data);
//       } else {
//         setSubError(data.message || data.error?.message || 'Failed to fetch subscription data');
//       }
//     } catch (error) {
//       console.error('Error fetching subscription:', error);
//       if (error.message === 'REFRESH_TOKEN_FAILED') {
//         setSubError('Session expired. Please refresh the page or login again.');
//       } else {
//         setSubError(error.message || 'An error occurred while fetching subscription data');
//       }
//     } finally {
//       setSubLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     setOrgError('');
//     setSubError('');
//     try {
//       const refreshResult = await refreshAccessToken();
//       if (refreshResult.success) {
//         await loadData();
//       } else {
//         setOrgError('Unable to refresh session. Please login again.');
//         setSubError('Unable to refresh session. Please login again.');
//       }
//     } catch (error) {
//       console.error('Refresh error:', error);
//       setOrgError('Failed to refresh session. Please login again.');
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const handleLogout = async () => {
//     const token = localStorage.getItem('token');
//     setLoggingOut(true);

//     try {
//       if (token) {
//         await fetch(API_CONFIG.LOGOUT_API, {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'X-CPO-App-ID': CPO_APP_ID,
//             'Content-Type': 'application/json'
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       setLoggingOut(false);
//       navigate('/signin');
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Format date for subscription display
//   const formatDateShort = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     const colors = {
//       'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
//       'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
//       'SUSPENDED': 'bg-red-100 text-red-800 border-red-200',
//       'APPROVED': 'bg-green-100 text-green-800 border-green-200',
//       'REJECTED': 'bg-red-100 text-red-800 border-red-200',
//       'TRIAL': 'bg-blue-100 text-blue-800 border-blue-200',
//       'EXPIRED': 'bg-gray-100 text-gray-800 border-gray-200'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
//   };

//   // Get status icon
//   const getStatusIcon = (status) => {
//     switch(status?.toUpperCase()) {
//       case 'ACTIVE':
//       case 'APPROVED':
//         return <CheckCircle className="w-3 h-3" />;
//       case 'PENDING':
//         return <Clock className="w-3 h-3" />;
//       case 'INACTIVE':
//       case 'REJECTED':
//         return <AlertCircle className="w-3 h-3" />;
//       case 'TRIAL':
//         return <Star className="w-3 h-3" />;
//       case 'EXPIRED':
//         return <AlertCircle className="w-3 h-3" />;
//       default:
//         return <AlertCircle className="w-3 h-3" />;
//     }
//   };

//   // Settings Dropdown Menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
//             {userData?.user?.full_name?.charAt(0) || 'U'}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">
//               {userData?.user?.full_name || 'User'}
//             </h4>
//             <p className="text-sm text-gray-400 truncate">
//               {userData?.user?.email || 'user@transev.com'}
//             </p>
//             {userData?.role && (
//               <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
//                 {userData.role}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
      
//       <div className="p-2">
//         <button 
//           onClick={() => {
//             setShowSettingsMenu(false);
//             navigate('/profile');
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <User size={16} className="text-gray-500" /> 
//           <span>Profile</span>
//         </button>
//         <button 
//           onClick={() => {
//             setShowSettingsMenu(false);
//             navigate('/organization');
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Building size={16} className="text-gray-500" /> 
//           <span>Organization</span>
//         </button>
//         <div className="border-t border-gray-700 my-1"></div>
//         <button 
//           onClick={() => {
//             setShowSettingsMenu(false);
//             handleLogout();
//           }}
//           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
//         >
//           <LogOut size={16} className="text-red-500" /> 
//           <span>Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Add Dropdown Menu
//   const AddMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
//       <div className="p-3">
//         <button 
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate("/add-hub");
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Plus size={18} className="text-gray-500" /> Add Hub
//         </button>
//         <button 
//           onClick={() => {
//             setShowAddMenu(false);
//             navigate("/add-charger");
//           }}
//           className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
//         >
//           <Plus size={18} className="text-gray-500" /> Add Charger
//         </button>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex">
//         <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <Sidebar 
//         isDarkMode={isDarkMode} 
//         onThemeToggle={handleThemeToggle}
//         userName={userData?.user?.full_name || 'User'}
//         userEmail={userData?.user?.email || ''}
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         {/* HEADER */}
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <Menu className="w-5 h-5 text-gray-600" />
//               </button>
//               <div className="flex items-center gap-3">
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2 relative">
//               <div className="relative">
//                 <button
//                   onClick={() => setShowSettingsMenu(!showSettingsMenu)}
//                   className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5"
//                 >
//                   <Settings size={20} className="text-gray-600" />
//                   <ChevronDown size={16} className="text-gray-400" />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowAddMenu(!showAddMenu)}
//                   className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
//                 >
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Tabs */}
//         <div className="border-b border-gray-200 bg-white px-6">
//           <div className="flex gap-0">
//             <button
//               onClick={() => {}}
//               className={`px-6 py-5 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 border-green-600 text-green-700 bg-green-50/50`}
//             >
//               <Building size={16} />
//               Organization
//             </button>
//             <button
//               onClick={() => navigate('/manage-hubs')}
//               className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`}
//             >
//               <Layers size={16} />
//               Manage Hubs
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Session Expired Banner */}
//             {(orgError?.includes('Session expired') || subError?.includes('Session expired')) && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <AlertCircle className="w-5 h-5 text-yellow-600" />
//                   <span className="text-yellow-800">Session expired. Please refresh to continue.</span>
//                 </div>
//                 <button
//                   onClick={handleRefresh}
//                   disabled={isRefreshing}
//                   className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
//                 >
//                   {isRefreshing ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Refreshing...
//                     </>
//                   ) : (
//                     <>
//                       <RefreshCw className="w-4 h-4" />
//                       Refresh Session
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}

//             {/* Organization Details Card */}
//             {orgLoading ? (
//               <div className="flex items-center justify-center h-64">
//                 <div className="flex flex-col items-center gap-3">
//                   <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
//                   <p className="text-gray-500">Loading organization data...</p>
//                 </div>
//               </div>
//             ) : orgError && !orgError.includes('Session expired') ? (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-2">
//                 <AlertCircle className="w-5 h-5" />
//                 <span>{orgError}</span>
//               </div>
//             ) : orgData ? (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
//                   <div className="flex items-center gap-4">
//                     <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
//                       <Building className="w-10 h-10 text-white" />
//                     </div>
//                     <div className="flex-1">
//                       <h2 className="text-2xl font-bold text-gray-900">{orgData.business_name || 'Organization'}</h2>
//                       <div className="flex items-center gap-3 mt-1 flex-wrap">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(orgData.status)}`}>
//                           {getStatusIcon(orgData.status)}
//                           {orgData.status || 'PENDING'}
//                         </span>
//                         <span className="text-sm text-gray-500">ID: {orgData.slug || 'N/A'}</span>
//                         <span className="text-sm text-gray-500">Type: {orgData.company_type || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <Mail className="w-5 h-5 text-green-600 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-gray-500">Email</p>
//                         <p className="text-sm font-medium text-gray-900">{userData?.user?.email || 'info@transev.com'}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <Shield className="w-5 h-5 text-green-600 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-gray-500">GSTIN</p>
//                         <p className="text-sm font-medium text-gray-900 font-mono">{orgData.gstin || 'N/A'}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <Globe className="w-5 h-5 text-green-600 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-gray-500">Location</p>
//                         <p className="text-sm font-medium text-gray-900">
//                           {orgData.city && orgData.state ? `${orgData.city}, ${orgData.state}` : 'N/A'}
//                           {orgData.pincode && ` - ${orgData.pincode}`}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-4">
//                     <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <Hash className="w-5 h-5 text-green-600 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-gray-500">App ID</p>
//                         <p className="text-sm font-medium text-gray-900 font-mono">{orgData.app_id || 'N/A'}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <Clock className="w-5 h-5 text-green-600 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-gray-500">App ID Mode</p>
//                         <p className="text-sm font-medium text-gray-900">{orgData.app_id_mode || 'N/A'}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-gray-500">Member Since</p>
//                         <p className="text-sm font-medium text-gray-900">{formatDate(orgData.created_at)}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 border-t border-gray-200 bg-gray-50">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <p className="text-xs text-gray-500">Address</p>
//                       <p className="text-sm font-medium text-gray-900">{orgData.address || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">City</p>
//                       <p className="text-sm font-medium text-gray-900">{orgData.city || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">State</p>
//                       <p className="text-sm font-medium text-gray-900">{orgData.state || 'N/A'}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
//                 <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No organization data found</p>
//               </div>
//             )}

//             {/* Subscription Details Card - UPDATED with modern design */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//               <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
//                 <div className="flex items-center gap-4">
//                   <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
//                     <CreditCard className="w-8 h-8 text-white" />
//                   </div>
//                   <div className="flex-1">
//                     <h2 className="text-xl font-bold text-gray-900">Subscription Details</h2>
//                     <p className="text-sm text-gray-500">Manage your plan and billing information</p>
//                   </div>
//                 </div>
//               </div>

//               {subLoading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <div className="flex flex-col items-center gap-3">
//                     <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                     <p className="text-gray-500">Loading subscription details...</p>
//                   </div>
//                 </div>
//               ) : subError && !subError.includes('Session expired') ? (
//                 <div className="p-6">
//                   <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-2">
//                     <AlertCircle className="w-5 h-5" />
//                     <span>{subError}</span>
//                   </div>
//                 </div>
//               ) : subscriptionData ? (
//                 <div className="p-6">
//                   {/* Plan Header */}
//                   <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
//                     <div className="flex items-center justify-between flex-wrap gap-4">
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <Crown className="w-6 h-6 text-yellow-300" />
//                           <span className="text-sm font-medium text-blue-200">Current Plan</span>
//                         </div>
//                         <h3 className="text-2xl font-bold mt-1">{subscriptionData.plan?.name || 'Base Plan'}</h3>
//                         {subscriptionData.plan?.description && (
//                           <p className="text-blue-200 text-sm mt-1">{subscriptionData.plan.description}</p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-4">
//                         <div className="text-right">
//                           <p className="text-sm text-blue-200">Price</p>
//                           <p className="text-2xl font-bold flex items-center gap-1">
//                             <IndianRupee className="w-5 h-5" />
//                             {(subscriptionData.plan?.price_minor / 100).toLocaleString('en-IN')}
//                             <span className="text-sm font-normal text-blue-200">
//                               /{subscriptionData.plan?.billing_interval?.toLowerCase() || 'month'}
//                             </span>
//                           </p>
//                         </div>
//                         <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(subscriptionData.status)}`}>
//                           {getStatusIcon(subscriptionData.status)}
//                           {subscriptionData.status || 'ACTIVE'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Plan Details Grid */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                       <div className="flex items-center gap-2 mb-1">
//                         <Package className="w-4 h-4 text-blue-600" />
//                         <span className="text-xs text-gray-500">Plan</span>
//                       </div>
//                       <p className="font-semibold text-gray-900">{subscriptionData.plan?.name || 'Base'}</p>
//                       <p className="text-xs text-gray-500 mt-1">{subscriptionData.plan?.description || 'Standard plan'}</p>
//                     </div>

//                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                       <div className="flex items-center gap-2 mb-1">
//                         <Repeat className="w-4 h-4 text-blue-600" />
//                         <span className="text-xs text-gray-500">Billing</span>
//                       </div>
//                       <p className="font-semibold text-gray-900">
//                         {subscriptionData.plan?.billing_interval || 'MONTHLY'}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         Every {subscriptionData.plan?.interval_count || 1} {subscriptionData.plan?.billing_interval?.toLowerCase() || 'month(s)'}
//                       </p>
//                     </div>

//                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                       <div className="flex items-center gap-2 mb-1">
//                         <Timer className="w-4 h-4 text-blue-600" />
//                         <span className="text-xs text-gray-500">Trial Period</span>
//                       </div>
//                       <p className="font-semibold text-gray-900">
//                         {subscriptionData.trial_ends_at ? `${subscriptionData.plan?.trial_days || 30} days` : 'No trial'}
//                       </p>
//                       {subscriptionData.trial_ends_at && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Ends: {formatDateShort(subscriptionData.trial_ends_at)}
//                         </p>
//                       )}
//                     </div>

//                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                       <div className="flex items-center gap-2 mb-1">
//                         <CalendarDays className="w-4 h-4 text-blue-600" />
//                         <span className="text-xs text-gray-500">Current Period</span>
//                       </div>
//                       <p className="font-semibold text-gray-900 text-sm">
//                         {formatDateShort(subscriptionData.current_period_starts_at)}
//                         <span className="text-gray-400 mx-1">→</span>
//                         {formatDateShort(subscriptionData.current_period_ends_at)}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {subscriptionData.cancel_at_period_end ? 'Cancels at period end' : 'Auto-renew'}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Additional Info */}
//                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <p className="text-xs text-gray-500">Subscription ID</p>
//                         <p className="text-sm font-mono text-gray-700 truncate">{subscriptionData.id || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">Currency</p>
//                         <p className="text-sm font-medium text-gray-900">{subscriptionData.plan?.currency || 'INR'}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">Started On</p>
//                         <p className="text-sm font-medium text-gray-900">{formatDateShort(subscriptionData.starts_at)}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Features */}
//                   {subscriptionData.plan?.features && subscriptionData.plan.features.length > 0 && (
//                     <div className="mt-4 pt-4 border-t border-gray-200">
//                       <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//                         <Star className="w-4 h-4 text-yellow-500" />
//                         Plan Features
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {subscriptionData.plan.features.map((feature, index) => (
//                           <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">
//                             <Check className="w-3 h-3" />
//                             {feature}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500">No subscription data found</p>
//                   <p className="text-sm text-gray-400 mt-1">Please contact support for assistance</p>
//                 </div>
//               )}
//             </div>

//             {/* Additional Info */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
//               <div className="flex items-center justify-between flex-wrap gap-2">
//                 <div className="flex items-center gap-4">
//                   <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <Sparkles className="w-4 h-4 text-blue-500" />
//                     <span>Everything is up to date</span>
//                   </div>
//                 </div>
//                 <a
//                   href="https://transev.site/terms-conditions/"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 hover:underline"
//                 >
//                   <FileText className="w-4 h-4" />
//                   Terms and Conditions
//                   <ExternalLink className="w-3 h-3" />
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Organization;

// src/components/Organization/Organization.jsx
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
  Link as LinkIcon,
  CreditCard,
  Zap,
  Award,
  TrendingUp,
  DollarSign,
  Crown,
  Star,
  Calendar as CalendarIcon,
  Check,
  Sparkles,
  Gift,
  BadgeCheck,
  RefreshCw,
  Timer,
  Infinity,
  Package,
  IndianRupee,
  Repeat,
  CalendarDays
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

console.log('API Base URL:', API_BASE_URL);
console.log('CPO App ID:', CPO_APP_ID);

const API_CONFIG = {
  ORGANIZATION_API: `${API_BASE_URL}/api/v1/cpo/organization`,
  SUBSCRIPTION_API: `${API_BASE_URL}/api/v1/cpo/subscription`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const Organization = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing: authIsRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
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
  
  // Subscription state
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      await fetchUserInfo();
      await fetchOrganizationData();
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error loading data:', error);
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
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchOrganizationData = async () => {
    setOrgLoading(true);
    setOrgError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.ORGANIZATION_API, {
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

  const fetchSubscriptionData = async () => {
    setSubLoading(true);
    setSubError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.SUBSCRIPTION_API, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Subscription data:', data);

      if (response.ok) {
        setSubscriptionData(data);
      } else {
        setSubError(data.message || data.error?.message || 'Failed to fetch subscription data');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubError(error.message || 'An error occurred while fetching subscription data');
    } finally {
      setSubLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setOrgError('');
    setSubError('');
    try {
      await loadData();
    } catch (error) {
      console.error('Refresh error:', error);
      setOrgError('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
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

  // Format date for subscription display
  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'TRIAL': 'bg-blue-100 text-blue-800 border-blue-200',
      'EXPIRED': 'bg-gray-100 text-gray-800 border-gray-200'
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
      case 'TRIAL':
        return <Star className="w-3 h-3" />;
      case 'EXPIRED':
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

  // Show loading if refreshing
  if (authIsRefreshing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {authIsRefreshing ? 'Refreshing session...' : 'Loading...'}
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
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
              onClick={() => {}}
              className={`px-6 py-5 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 border-green-600 text-green-700 bg-green-50/50`}
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

        {/* Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Session Expired Banner */}
            {(orgError?.includes('Session expired') || subError?.includes('Session expired')) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800">Session expired. Please refresh to continue.</span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh Session
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Organization Details Card */}
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
                        <span className="text-sm text-gray-500">ID: {orgData.slug || 'N/A'}</span>
                        <span className="text-sm text-gray-500">Type: {orgData.company_type || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{userData?.user?.email || user?.email || 'info@transev.com'}</p>
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
                          {orgData.city && orgData.state ? `${orgData.city}, ${orgData.state}` : 'N/A'}
                          {orgData.pincode && ` - ${orgData.pincode}`}
                        </p>
                      </div>
                    </div>
                  </div>
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
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No organization data found</p>
              </div>
            )}

            {/* Subscription Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Subscription Details</h2>
                    <p className="text-sm text-gray-500">Manage your plan and billing information</p>
                  </div>
                </div>
              </div>

              {subLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-500">Loading subscription details...</p>
                  </div>
                </div>
              ) : subError ? (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{subError}</span>
                  </div>
                </div>
              ) : subscriptionData ? (
                <div className="p-6">
                  {/* Plan Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Crown className="w-6 h-6 text-yellow-300" />
                          <span className="text-sm font-medium text-blue-200">Current Plan</span>
                        </div>
                        <h3 className="text-2xl font-bold mt-1">{subscriptionData.plan?.name || 'Base Plan'}</h3>
                        {subscriptionData.plan?.description && (
                          <p className="text-blue-200 text-sm mt-1">{subscriptionData.plan.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-blue-200">Price</p>
                          <p className="text-2xl font-bold flex items-center gap-1">
                            <IndianRupee className="w-5 h-5" />
                            {(subscriptionData.plan?.price_minor / 100).toLocaleString('en-IN')}
                            <span className="text-sm font-normal text-blue-200">
                              /{subscriptionData.plan?.billing_interval?.toLowerCase() || 'month'}
                            </span>
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(subscriptionData.status)}`}>
                          {getStatusIcon(subscriptionData.status)}
                          {subscriptionData.status || 'ACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-500">Plan</span>
                      </div>
                      <p className="font-semibold text-gray-900">{subscriptionData.plan?.name || 'Base'}</p>
                      <p className="text-xs text-gray-500 mt-1">{subscriptionData.plan?.description || 'Standard plan'}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Repeat className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-500">Billing</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {subscriptionData.plan?.billing_interval || 'MONTHLY'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Every {subscriptionData.plan?.interval_count || 1} {subscriptionData.plan?.billing_interval?.toLowerCase() || 'month(s)'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Timer className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-500">Trial Period</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {subscriptionData.trial_ends_at ? `${subscriptionData.plan?.trial_days || 30} days` : 'No trial'}
                      </p>
                      {subscriptionData.trial_ends_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ends: {formatDateShort(subscriptionData.trial_ends_at)}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-500">Current Period</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDateShort(subscriptionData.current_period_starts_at)}
                        <span className="text-gray-400 mx-1">→</span>
                        {formatDateShort(subscriptionData.current_period_ends_at)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {subscriptionData.cancel_at_period_end ? 'Cancels at period end' : 'Auto-renew'}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Subscription ID</p>
                        <p className="text-sm font-mono text-gray-700 truncate">{subscriptionData.id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Currency</p>
                        <p className="text-sm font-medium text-gray-900">{subscriptionData.plan?.currency || 'INR'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Started On</p>
                        <p className="text-sm font-medium text-gray-900">{formatDateShort(subscriptionData.starts_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {subscriptionData.plan?.features && subscriptionData.plan.features.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Plan Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subscriptionData.plan.features.map((feature, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">
                            <Check className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No subscription data found</p>
                  <p className="text-sm text-gray-400 mt-1">Please contact support for assistance</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Everything is up to date</span>
                  </div>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default Organization;
// // src/components/Revenue/AddCustomerTariff.jsx
// import React, { useState, useEffect,useCallback } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../Authentication/AuthContext';
// import {
//   Settings,
//   Plus,
//   ChevronDown,
//   User,
//   Building,
//   LogOut,
//   Users,
//   Users as UsersIcon,
//   UserCog,
//   UserCheck,
//   UserX,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   X,
//   Eye,
//   Edit,
//   Trash2,
//   Loader2,
//   Calendar,
//   Clock,
//   Mail,
//   Phone,
//   Menu,
//   Filter,
//   RefreshCw,
//   ChevronLeft,
//   ChevronRight,
//   ArrowLeft,
//   UserPlus,
//   MoreVertical,
//   Circle,
//   CircleCheck,
//   CircleX,
//   CircleAlert,
//   UserRound,
//   BadgeCheck,
//   Activity,
//   Power,
//   PowerOff,
//   Save,
//   ArrowRight,
//   Info,
//   Sparkles,
//   Award,
//   Star,
//   Zap,
//   Layers,
//   Gift,
//   Crown,
//   Users as UsersIcon2,
//   UserPlus as UserPlusIcon,
//   Check,
//   List,
//   Grid,
//   Search as SearchIcon,
//   FileText,
//   Tag,
//   DollarSign,
//   Calendar as CalendarIcon,
//   Clock as ClockIcon,
//   Percent,
//   IndianRupee,
//   Globe,
//   MapPin,
//   Wifi,
//   Plug,
//   Battery,
//   Gauge,
//   RadioTower,
//   Link as LinkIcon,
//   CreditCard,
//   Wallet,
//   Receipt,
//   TrendingUp,
//   TrendingDown,
//   BarChart,
//   PieChart,
//   LineChart,
//   Settings as SettingsIcon,
//   Sliders,
//   ToggleLeft,
//   ToggleRight,
//   CalendarDays,
//   Timer,
//   Infinity,
//   Package,
//   Repeat,
//   Landmark,
//   Banknote,
//   File,
//   Server,
//   Database,
//   Cloud,
//   Smartphone,
//   Monitor,
//   Tablet,
//   Laptop,
//   Cpu,
//   HardDrive,
//   Network,
//   Radio,
//   Bluetooth,
//   Thermometer,
//   Wind,
//   Droplet,
//   Sun,
//   Moon,
//   CloudRain,
//   CloudSnow,
//   CloudLightning,
//   CloudWind,
//   CloudFog,
//   CloudDrizzle,
//   CloudHail,
//   CloudSleet,
//   CloudThunder,
//   CloudTornado,
//   CloudHurricane,
//   CloudTyphoon,
//   CloudCyclone,
//   CloudStorm,
//   CloudRainbow,
//   CloudSun,
//   CloudMoon,
//   CloudStar,
//   CloudComet,
//   CloudAsteroid,
//   CloudMeteor,
//   CloudGalaxy,
//   CloudUniverse,
//   CloudMultiverse
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
//   USER_GROUP_TARIFFS_API: (groupId) => `${API_BASE_URL}/api/v1/cpo/user-groups/${groupId}/tariffs`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
// };

// const AddCustomerTariff = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [userGroups, setUserGroups] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     tariff_type: 'FLAT',
//     price_type: 'FIXED',
//     amount: '',
//     currency: 'INR',
//     unit: 'per_session',
//     valid_from: '',
//     valid_to: '',
//     is_active: true,
//     charger_ids: [],
//     hub_ids: []
//   });

//   // Form validation errors
//   const [formErrors, setFormErrors] = useState({});

//   // Tariff type options
//   const tariffTypes = [
//     { value: 'FLAT', label: 'Flat Tariff' },
//     { value: 'TIME_BASED', label: 'Time Based' },
//     { value: 'ENERGY_BASED', label: 'Energy Based' },
//     { value: 'HYBRID', label: 'Hybrid Tariff' }
//   ];

//   const priceTypes = [
//     { value: 'FIXED', label: 'Fixed' },
//     { value: 'PER_UNIT', label: 'Per Unit' },
//     { value: 'SLAB', label: 'Slab Based' }
//   ];

//   const units = [
//     { value: 'per_session', label: 'Per Session' },
//     { value: 'per_minute', label: 'Per Minute' },
//     { value: 'per_hour', label: 'Per Hour' },
//     { value: 'per_kwh', label: 'Per kWh' }
//   ];

//   // Fetch user info and groups
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//     fetchUserGroups();
    
//     // Check if groupId passed from previous page
//     const state = location.state;
//     if (state && state.groupId) {
//       const group = userGroups.find(g => g.id === state.groupId);
//       if (group) {
//         setSelectedGroup(group);
//       }
//     }
//   }, [isAuthenticated, navigate, location]);

//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
//         method: 'GET'
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setUserData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     }
//   };

//   const fetchUserGroups = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_GROUPS_API, {
//         method: 'GET'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const groups = data.user_groups || data.data || data || [];
//         setUserGroups(groups);
//       } else {
//         setError('Failed to fetch customer groups');
//       }
//     } catch (error) {
//       console.error('Error fetching user groups:', error);
//       setError('An error occurred while fetching groups');
//     } finally {
//       setLoading(false);
//     }
//   }, [authenticatedRequest]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ 
//       ...prev, 
//       [name]: type === 'checkbox' ? checked : value 
//     }));
//     // Clear error for this field
//     if (formErrors[name]) {
//       setFormErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleGroupSelect = (group) => {
//     setSelectedGroup(group);
//     setShowGroupDropdown(false);
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!selectedGroup) {
//       errors.group = 'Please select a customer group';
//     }
//     if (!formData.name.trim()) {
//       errors.name = 'Tariff name is required';
//     }
//     if (formData.name.trim().length < 2) {
//       errors.name = 'Tariff name must be at least 2 characters';
//     }
//     if (formData.name.trim().length > 50) {
//       errors.name = 'Tariff name must be less than 50 characters';
//     }
//     if (formData.description && formData.description.length > 200) {
//       errors.description = 'Description must be less than 200 characters';
//     }
//     if (!formData.amount) {
//       errors.amount = 'Amount is required';
//     } else if (isNaN(formData.amount) || parseFloat(formData.amount) < 0) {
//       errors.amount = 'Please enter a valid amount';
//     }
//     if (!formData.valid_from) {
//       errors.valid_from = 'Valid from date is required';
//     }
//     if (!formData.valid_to) {
//       errors.valid_to = 'Valid to date is required';
//     } else if (formData.valid_from && formData.valid_to && new Date(formData.valid_to) < new Date(formData.valid_from)) {
//       errors.valid_to = 'Valid to date must be after valid from date';
//     }
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);
//     setError('');
//     setSuccess('');

//     try {
//       const payload = {
//         name: formData.name.trim(),
//         description: formData.description.trim() || undefined,
//         tariff_type: formData.tariff_type,
//         price_type: formData.price_type,
//         amount: parseFloat(formData.amount),
//         currency: formData.currency,
//         unit: formData.unit,
//         valid_from: formData.valid_from,
//         valid_to: formData.valid_to,
//         is_active: formData.is_active,
//         charger_ids: formData.charger_ids,
//         hub_ids: formData.hub_ids
//       };

//       console.log('📤 Creating tariff payload:', payload);

//       const response = await authenticatedRequest(API_CONFIG.USER_GROUP_TARIFFS_API(selectedGroup.id), {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       console.log('📥 Response:', data);

//       if (response.ok) {
//         setSuccess('Tariff created successfully!');
//         setFormData({
//           name: '',
//           description: '',
//           tariff_type: 'FLAT',
//           price_type: 'FIXED',
//           amount: '',
//           currency: 'INR',
//           unit: 'per_session',
//           valid_from: '',
//           valid_to: '',
//           is_active: true,
//           charger_ids: [],
//           hub_ids: []
//         });
//         setTimeout(() => {
//           navigate('/revenue/driver-tariffs');
//         }, 2000);
//       } else {
//         setError(data.message || data.error?.message || 'Failed to create tariff');
//       }
//     } catch (error) {
//       console.error('Error creating tariff:', error);
//       setError('An error occurred while creating the tariff');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//       navigate('/signin');
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Settings Dropdown Menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
//             {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h4 className="text-base font-semibold text-white truncate">
//               {userData?.user?.full_name || user?.name || 'User'}
//             </h4>
//             <p className="text-sm text-gray-400 truncate">
//               {userData?.user?.email || user?.email || 'user@transev.com'}
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
//         <button onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
//           <User size={16} className="text-gray-500" /> <span>Profile</span>
//         </button>
//         <button onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
//           <Building size={16} className="text-gray-500" /> <span>Organization</span>
//         </button>
//         <div className="border-t border-gray-700 my-1"></div>
//         <button onClick={() => { setShowSettingsMenu(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition">
//           <LogOut size={16} className="text-red-500" /> <span>Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Add Dropdown Menu
//   const AddMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
//       <div className="p-3">
//         <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
//           <Plus size={18} className="text-gray-400" /> Add Hub
//         </button>
//         <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
//           <Zap size={18} className="text-gray-400" /> Add Charger
//         </button>
//       </div>
//     </div>
//   );

//   if (isRefreshing) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex">
//         <Sidebar />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600">Refreshing session...</p>
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
//         userName={userData?.user?.full_name || user?.name || 'User'}
//         userEmail={userData?.user?.email || user?.email || ''}
//         onLogout={handleLogout}
//       />

//       <div className="flex-1 min-w-0">
//         {/* HEADER */}
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button 
//                 onClick={() => navigate('/revenue/customer-tariffs')} 
//                 className="p-2 hover:bg-gray-100 rounded-xl transition"
//               >
//                 <ArrowLeft size={20} className="text-gray-600" />
//               </button>
//               <div className="flex items-center gap-2">
//                 <h1 className="text-2xl font-bold text-gray-800">Add Customer Tariff</h1>
//                 <span className="text-gray-300 text-xl">/</span>
//                 <span className="text-sm text-blue-400 font-medium mt-1">New Tariff</span>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2 relative">
//               <div className="relative">
//                 <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
//                   <Settings size={20} className="text-gray-600" />
//                   <ChevronDown size={16} className="text-gray-400" />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>
//               <div className="relative">
//                 <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25">
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* MAIN CONTENT */}
//         <div className="p-6 max-w-5xl mx-auto">
//           {/* Page Header */}
//           <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-sm mb-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
//                   <Tag size={24} className="text-purple-600" />
//                   Create New Customer Tariff
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Set up pricing and rules for customer charging sessions
//                 </p>
//               </div>
//               <div className="flex items-center gap-3 text-sm">
//                 <div className="flex items-center gap-2 px-3 py-2 bg-white border border-purple-200 rounded-xl shadow-sm">
//                   <Shield size={16} className="text-purple-600" />
//                   <span className="text-purple-700 font-medium">Secure</span>
//                 </div>
//                 <div className="flex items-center gap-2 px-3 py-2 bg-white border border-purple-200 rounded-xl shadow-sm">
//                   <DollarSign size={16} className="text-purple-600" />
//                   <span className="text-purple-700 font-medium">Pricing</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form Card */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                 <Sparkles size={20} className="text-purple-600" />
//                 Tariff Configuration
//               </h3>
//               <p className="text-sm text-gray-500 mt-1">Configure the pricing and rules for this tariff</p>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-6">
//               {/* Customer Group Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Customer Group <span className="text-red-500 text-lg">*</span>
//                 </label>
//                 <div className="relative">
//                   <button
//                     type="button"
//                     onClick={() => setShowGroupDropdown(!showGroupDropdown)}
//                     className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
//                       formErrors.group ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
//                     } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <Users size={18} className="text-gray-400" />
//                       <span className={selectedGroup ? 'text-gray-900' : 'text-gray-400'}>
//                         {selectedGroup ? selectedGroup.name : 'Select a customer group'}
//                       </span>
//                     </div>
//                     <ChevronDown size={18} className={`text-gray-400 transition-transform ${showGroupDropdown ? 'rotate-180' : ''}`} />
//                   </button>
                  
//                   {showGroupDropdown && (
//                     <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
//                       {userGroups.length === 0 ? (
//                         <div className="p-4 text-center text-gray-500">
//                           <Users size={24} className="mx-auto mb-2 text-gray-300" />
//                           <p className="text-sm">No groups available</p>
//                         </div>
//                       ) : (
//                         userGroups.map((group) => (
//                           <button
//                             key={group.id}
//                             type="button"
//                             onClick={() => handleGroupSelect(group)}
//                             className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 ${
//                               selectedGroup?.id === group.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
//                             }`}
//                           >
//                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
//                               {group.name?.charAt(0) || 'G'}
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">{group.name}</p>
//                               <p className="text-xs text-gray-500">{group.member_count || 0} members</p>
//                             </div>
//                           </button>
//                         ))
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 {formErrors.group && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle size={14} />
//                     {formErrors.group}
//                   </p>
//                 )}
//               </div>

//               {/* Tariff Name & Description */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Tariff Name <span className="text-red-500 text-lg">*</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <Tag size={18} />
//                     </div>
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       placeholder="Enter tariff name (e.g., Premium Rate)"
//                       className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
//                         formErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
//                       } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
//                       required
//                     />
//                   </div>
//                   {formErrors.name && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                       <AlertCircle size={14} />
//                       {formErrors.name}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Description <span className="text-gray-400 text-sm">(optional)</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-3 text-gray-400">
//                       <FileText size={18} />
//                     </div>
//                     <input
//                       type="text"
//                       name="description"
//                       value={formData.description}
//                       onChange={handleChange}
//                       placeholder="Brief description of the tariff"
//                       className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
//                         formErrors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
//                       } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
//                     />
//                   </div>
//                   {formErrors.description && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                       <AlertCircle size={14} />
//                       {formErrors.description}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Tariff Type & Price Type */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Tariff Type <span className="text-red-500 text-lg">*</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <Sliders size={18} />
//                     </div>
//                     <select
//                       name="tariff_type"
//                       value={formData.tariff_type}
//                       onChange={handleChange}
//                       className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
//                     >
//                       {tariffTypes.map((type) => (
//                         <option key={type.value} value={type.value}>{type.label}</option>
//                       ))}
//                     </select>
//                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
//                       <ChevronDown size={18} />
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Price Type <span className="text-red-500 text-lg">*</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <DollarSign size={18} />
//                     </div>
//                     <select
//                       name="price_type"
//                       value={formData.price_type}
//                       onChange={handleChange}
//                       className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
//                     >
//                       {priceTypes.map((type) => (
//                         <option key={type.value} value={type.value}>{type.label}</option>
//                       ))}
//                     </select>
//                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
//                       <ChevronDown size={18} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Amount & Currency */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Amount <span className="text-red-500 text-lg">*</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <IndianRupee size={18} />
//                     </div>
//                     <input
//                       type="number"
//                       name="amount"
//                       value={formData.amount}
//                       onChange={handleChange}
//                       placeholder="0.00"
//                       step="0.01"
//                       min="0"
//                       className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
//                         formErrors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
//                       } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
//                       required
//                     />
//                   </div>
//                   {formErrors.amount && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                       <AlertCircle size={14} />
//                       {formErrors.amount}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Currency
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <Globe size={18} />
//                     </div>
//                     <select
//                       name="currency"
//                       value={formData.currency}
//                       onChange={handleChange}
//                       className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
//                     >
//                       <option value="INR">INR - Indian Rupee</option>
//                       <option value="USD">USD - US Dollar</option>
//                       <option value="EUR">EUR - Euro</option>
//                       <option value="GBP">GBP - British Pound</option>
//                     </select>
//                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
//                       <ChevronDown size={18} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Unit */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Unit <span className="text-red-500 text-lg">*</span>
//                 </label>
//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                     <Activity size={18} />
//                   </div>
//                   <select
//                     name="unit"
//                     value={formData.unit}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
//                   >
//                     {units.map((unit) => (
//                       <option key={unit.value} value={unit.value}>{unit.label}</option>
//                     ))}
//                   </select>
//                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
//                     <ChevronDown size={18} />
//                   </div>
//                 </div>
//               </div>

//               {/* Validity Period */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Valid From <span className="text-red-500 text-lg">*</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <CalendarIcon size={18} />
//                     </div>
//                     <input
//                       type="date"
//                       name="valid_from"
//                       value={formData.valid_from}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
//                         formErrors.valid_from ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
//                       } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
//                       required
//                     />
//                   </div>
//                   {formErrors.valid_from && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                       <AlertCircle size={14} />
//                       {formErrors.valid_from}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Valid To <span className="text-red-500 text-lg">*</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <CalendarIcon size={18} />
//                     </div>
//                     <input
//                       type="date"
//                       name="valid_to"
//                       value={formData.valid_to}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
//                         formErrors.valid_to ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
//                       } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
//                       required
//                     />
//                   </div>
//                   {formErrors.valid_to && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                       <AlertCircle size={14} />
//                       {formErrors.valid_to}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Active Status */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Status
//                 </label>
//                 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
//                   <div className="relative">
//                     <input
//                       type="checkbox"
//                       name="is_active"
//                       id="is_active"
//                       checked={formData.is_active}
//                       onChange={handleChange}
//                       className="sr-only"
//                     />
//                     <div
//                       onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
//                       className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
//                         formData.is_active ? 'bg-green-600' : 'bg-gray-300'
//                       }`}
//                     >
//                       <div
//                         className={`w-5 h-5 rounded-full bg-white transition-transform ${
//                           formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
//                         } mt-0.5 shadow-md`}
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-700">
//                       {formData.is_active ? 'Active' : 'Inactive'}
//                     </p>
//                     <p className="text-xs text-gray-400">
//                       {formData.is_active 
//                         ? 'Tariff will be available for use' 
//                         : 'Tariff will be hidden and inactive'}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Info Box */}
//               <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
//                 <div className="flex items-start gap-3">
//                   <Info size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-sm font-medium text-purple-800">What is a Customer Tariff?</p>
//                     <p className="text-sm text-purple-700 mt-1">
//                       Customer tariffs define the pricing structure for charging sessions. You can set different
//                       rates for different customer groups, time periods, and usage patterns. Tariffs can be flat,
//                       time-based, energy-based, or hybrid.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Error/Success Messages */}
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
//                   <AlertCircle size={18} className="flex-shrink-0" />
//                   <span>{error}</span>
//                 </div>
//               )}

//               {success && (
//                 <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
//                   <CheckCircle size={18} className="flex-shrink-0" />
//                   <span>{success}</span>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       Creating Tariff...
//                     </>
//                   ) : (
//                     <>
//                       <Tag size={20} />
//                       Create Tariff
//                       <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
//                     </>
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => navigate('/revenue/driver-tariffs')}
//                   className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Features Section */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Tag className="w-5 h-5 text-purple-600" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900">Flexible Pricing</h4>
//               </div>
//               <p className="text-sm text-gray-500 leading-relaxed">
//                 Create custom pricing structures for different customer groups and usage patterns
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
//                   <CalendarDays className="w-5 h-5 text-blue-600" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900">Time-based Rules</h4>
//               </div>
//               <p className="text-sm text-gray-500 leading-relaxed">
//                 Set validity periods and time-based pricing rules for your tariffs
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Zap className="w-5 h-5 text-green-600" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900">Energy Optimization</h4>
//               </div>
//               <p className="text-sm text-gray-500 leading-relaxed">
//                 Optimize pricing based on energy consumption and demand patterns
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerTariff;

// src/components/Revenue/AddCustomerTariff.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  Users,
  Users as UsersIcon,
  UserCog,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  Mail,
  Phone,
  Menu,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserPlus,
  MoreVertical,
  Circle,
  CircleCheck,
  CircleX,
  CircleAlert,
  UserRound,
  BadgeCheck,
  Activity,
  Power,
  PowerOff,
  Save,
  ArrowRight,
  Info,
  Sparkles,
  Award,
  Star,
  Zap,
  Layers,
  Gift,
  Crown,
  Users as UsersIcon2,
  UserPlus as UserPlusIcon,
  Check,
  List,
  Grid,
  Search as SearchIcon,
  FileText,
  Tag,
  DollarSign,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Percent,
  IndianRupee,
  Globe,
  MapPin,
  Wifi,
  Plug,
  Battery,
  Gauge,
  RadioTower,
  Link as LinkIcon,
  CreditCard,
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Settings as SettingsIcon,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  Timer,
  Infinity,
  Package,
  Repeat,
  Landmark,
  Banknote,
  File,
  Server,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Cpu,
  HardDrive,
  Network,
  Radio,
  Bluetooth,
  Thermometer,
  Wind,
  Droplet,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudWind,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  CloudSleet,
  CloudThunder,
  CloudTornado,
  CloudHurricane,
  CloudTyphoon,
  CloudCyclone,
  CloudStorm,
  CloudRainbow,
  CloudSun,
  CloudMoon,
  CloudStar,
  CloudComet,
  CloudAsteroid,
  CloudMeteor,
  CloudGalaxy,
  CloudUniverse,
  CloudMultiverse,
  XCircle
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
  USER_GROUP_TARIFFS_API: (groupId) => `${API_BASE_URL}/api/v1/cpo/user-groups/${groupId}/tariffs`,
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const AddCustomerTariff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  
  // Hubs and Chargers states
  const [hubs, setHubs] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const [loadingChargers, setLoadingChargers] = useState(false);
  const [filteredChargers, setFilteredChargers] = useState([]);
  
  // Form state - Swagger API এর সাথে মানিয়ে নেওয়া
  const [formData, setFormData] = useState({
    hub_id: '',
    charger_id: '',
    price_per_kwh: '',
    idle_fee_per_min: '',
    currency: 'INR',
    is_active: true,
    gst_id: '' // optional
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch user info and groups
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchUserGroups();
    fetchHubs();
    fetchChargers();
    
    const state = location.state;
    if (state && state.groupId) {
      const group = userGroups.find(g => g.id === state.groupId);
      if (group) {
        setSelectedGroup(group);
      }
    }
  }, [isAuthenticated, navigate, location]);

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
    }
  };

  const fetchUserGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_GROUPS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const groups = data.user_groups || data.data || data || [];
        setUserGroups(groups);
      } else {
        setError('Failed to fetch customer groups');
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setError('An error occurred while fetching groups');
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  // ✅ Fetch hubs using GET /api/v1/cpo/hubs
  const fetchHubs = useCallback(async () => {
    setLoadingHubs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.HUBS_API, {
        method: 'GET',
        params: { limit: 100 }
      });

      if (response.ok) {
        const data = await response.json();
        const hubsData = data.hubs || data.data || data || [];
        setHubs(hubsData);
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

  // ✅ Fetch chargers using GET /api/v1/cpo/chargers
  const fetchChargers = useCallback(async () => {
    setLoadingChargers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGERS_API, {
        method: 'GET',
        params: { limit: 100 }
      });

      if (response.ok) {
        const data = await response.json();
        const chargersData = data.chargers || data.data || data || [];
        setChargers(chargersData);
      } else {
        setChargers([]);
      }
    } catch (error) {
      console.error('Error fetching chargers:', error);
      setChargers([]);
    } finally {
      setLoadingChargers(false);
    }
  }, [authenticatedRequest]);

  // ✅ Filter chargers based on selected hub
  useEffect(() => {
    if (formData.hub_id) {
      const filtered = chargers.filter(c => c.hub_id === formData.hub_id);
      setFilteredChargers(filtered);
    } else {
      setFilteredChargers([]);
    }
  }, [formData.hub_id, chargers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setShowGroupDropdown(false);
  };

  const handleHubChange = (e) => {
    const hubId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      hub_id: hubId,
      charger_id: '' // Reset charger when hub changes
    }));
    if (formErrors.hub_id) {
      setFormErrors(prev => ({ ...prev, hub_id: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedGroup) {
      errors.group = 'Please select a customer group';
    }
    if (!formData.hub_id) {
      errors.hub_id = 'Hub is required';
    }
    if (!formData.price_per_kwh) {
      errors.price_per_kwh = 'Price per kWh is required';
    } else if (isNaN(formData.price_per_kwh) || parseFloat(formData.price_per_kwh) < 0) {
      errors.price_per_kwh = 'Please enter a valid price';
    }
    if (formData.idle_fee_per_min && (isNaN(formData.idle_fee_per_min) || parseFloat(formData.idle_fee_per_min) < 0)) {
      errors.idle_fee_per_min = 'Please enter a valid idle fee';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Submit to CreateUserGroupTariff API
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
        hub_id: formData.hub_id,
        price_per_kwh: formData.price_per_kwh,
        idle_fee_per_min: formData.idle_fee_per_min || '0',
        currency: formData.currency,
        is_active: formData.is_active
      };

      // Add charger_id if selected
      if (formData.charger_id) {
        payload.charger_id = formData.charger_id;
      }

      // Add gst_id if available (optional)
      if (formData.gst_id) {
        payload.gst_id = formData.gst_id;
      }

      console.log('📤 Creating tariff payload:', payload);

      const response = await authenticatedRequest(API_CONFIG.USER_GROUP_TARIFFS_API(selectedGroup.id), {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (response.ok) {
        setSuccess('Tariff created successfully!');
        setFormData({
          hub_id: '',
          charger_id: '',
          price_per_kwh: '',
          idle_fee_per_min: '',
          currency: 'INR',
          is_active: true,
          gst_id: ''
        });
        setTimeout(() => {
          navigate('/revenue/customer-tariffs');
        }, 2000);
      } else {
        setError(data.message || data.error?.message || 'Failed to create tariff');
      }
    } catch (error) {
      console.error('Error creating tariff:', error);
      setError('An error occurred while creating the tariff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusIcon = (isActive) => {
    return isActive 
      ? <CheckCircle className="w-3 h-3" />
      : <XCircle className="w-3 h-3" />;
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
        <button onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <User size={16} className="text-gray-500" /> <span>Profile</span>
        </button>
        <button onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Building size={16} className="text-gray-500" /> <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button onClick={() => { setShowSettingsMenu(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition">
          <LogOut size={16} className="text-red-500" /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add Dropdown Menu
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Refreshing session...</p>
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
                onClick={() => navigate('/revenue/customer-tariffs')} 
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Add Customer Tariff</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-500 font-medium mt-1">New Tariff</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-6 max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Tag size={24} className="text-green-600" />
                  Create New Customer Tariff
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set up pricing and rules for customer charging sessions
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <DollarSign size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Pricing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-green-600" />
                Tariff Configuration
              </h3>
              <p className="text-sm text-gray-500 mt-1">Configure the pricing and rules for this tariff</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Group <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                      formErrors.group ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-gray-400" />
                      <span className={selectedGroup ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedGroup ? selectedGroup.name : 'Select a customer group'}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${showGroupDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showGroupDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
                      {userGroups.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Users size={24} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No groups available</p>
                        </div>
                      ) : (
                        userGroups.map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => handleGroupSelect(group)}
                            className={`w-full text-left px-4 py-3 hover:bg-green-50 transition flex items-center gap-3 ${
                              selectedGroup?.id === group.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {group.name?.charAt(0) || 'G'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{group.name}</p>
                              <p className="text-xs text-gray-500">{group.member_count || 0} members</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(group.is_active)}`}>
                                  {getStatusIcon(group.is_active)}
                                  {group.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formErrors.group && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.group}
                  </p>
                )}
              </div>

              {/* Hub Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hub <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Layers size={18} />
                  </div>
                  <select
                    name="hub_id"
                    value={formData.hub_id}
                    onChange={handleHubChange}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                      formErrors.hub_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white`}
                  >
                    <option value="">Select a hub</option>
                    {loadingHubs ? (
                      <option value="" disabled>Loading hubs...</option>
                    ) : (
                      hubs.map((hub) => (
                        <option key={hub.id} value={hub.id}>
                          {hub.name}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
                {formErrors.hub_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.hub_id}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Select the hub where this tariff will apply</p>
              </div>

              {/* Charger Selection (Optional) - Hub ID wise filtered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Charger <span className="text-gray-400 text-sm">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Zap size={18} />
                  </div>
                  <select
                    name="charger_id"
                    value={formData.charger_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select a charger (optional)</option>
                    {loadingChargers ? (
                      <option value="" disabled>Loading chargers...</option>
                    ) : filteredChargers.length > 0 ? (
                      filteredChargers.map((charger) => (
                        <option key={charger.id} value={charger.id}>
                          {charger.charger_name || charger.charger_id || charger.id}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No chargers available for this hub</option>
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">Optional: Apply tariff to a specific charger</p>
              </div>

              {/* Price per kWh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price per kWh <span className="text-red-500 text-lg">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <IndianRupee size={18} />
                  </div>
                  <input
                    type="number"
                    name="price_per_kwh"
                    value={formData.price_per_kwh}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.price_per_kwh ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                    required
                  />
                </div>
                {formErrors.price_per_kwh && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.price_per_kwh}
                  </p>
                )}
              </div>

              {/* Idle Fee per Minute */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Idle Fee per Minute
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Clock size={18} />
                  </div>
                  <input
                    type="number"
                    name="idle_fee_per_min"
                    value={formData.idle_fee_per_min}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      formErrors.idle_fee_per_min ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white`}
                  />
                </div>
                {formErrors.idle_fee_per_min && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.idle_fee_per_min}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Fee charged per minute when charger is idle</p>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Currency
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Globe size={18} />
                  </div>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                        formData.is_active ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5 shadow-md`}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formData.is_active 
                        ? 'Tariff will be available for use' 
                        : 'Tariff will be hidden and inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">What is a Customer Tariff?</p>
                    <p className="text-sm text-green-700 mt-1">
                      Customer tariffs define the pricing structure for charging sessions. You can set different
                      rates for different customer groups, hubs, and specific chargers. The tariff includes price per kWh
                      and optional idle fees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Tariff...
                    </>
                  ) : (
                    <>
                      <Tag size={20} />
                      Create Tariff
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/revenue/customer-tariffs')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Flexible Pricing</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Create custom pricing structures for different customer groups and usage patterns
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Hub & Charger Specific</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Apply tariffs to specific hubs or individual chargers
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Energy Optimization</h4>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Optimize pricing based on energy consumption and demand patterns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerTariff;
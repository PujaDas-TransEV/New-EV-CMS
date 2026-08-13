// // src/pages/AddHub.jsx
// import React, { useState, useEffect, useCallback } from 'react';
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
//   ArrowLeft,
//   Edit,
//   Trash2,
//   Power,
//   Wifi,
//   Zap,
//   MoreVertical,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
//   ArrowRight,
//   Check,
//   Circle,
//   Info,
//   Map,
//   Navigation,
//   Target,
//   List,
//   Grid,
//   Radio,
//   RadioButton,
//   Search as SearchIcon,
//   Gauge,
//   Database,
//   RefreshCw,
//   Globe2,
//   Crosshair,
//   Compass,
//   AlertTriangle,
//   Plug,
//   Clock as ClockIcon,
//   Wrench,
//   Activity // Added missing Activity import
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// console.log('API Base URL:', API_BASE_URL);
// console.log('CPO App ID:', CPO_APP_ID);

// const API_CONFIG = {
//   HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
//   CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
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

// const fetchWithTokenRefresh = async (url, options = {}, retryCount = 2) => {
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
//         console.log('Refresh token failed, redirecting to login...');
//         localStorage.removeItem('token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('token_expiry');
//         localStorage.removeItem('userInfo');
//         throw new Error('Session expired. Please login again.');
//       }
//     }

//     return response;
//   } catch (error) {
//     console.error('Fetch error:', error);
//     throw error;
//   }
// };

// // Reverse Geocoding - Get address from coordinates
// const getAddressFromCoordinates = async (lat, lng) => {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
//       {
//         headers: {
//           'User-Agent': 'TransEV-App/1.0'
//         }
//       }
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch address');
//     }
    
//     const data = await response.json();
//     console.log('Reverse geocoding response:', data);
    
//     if (data && data.display_name) {
//       return data.display_name;
//     } else {
//       return '';
//     }
//   } catch (error) {
//     console.error('Error fetching address:', error);
//     return '';
//   }
// };

// // Step 1: Basic Details Component
// const BasicDetailsStep = React.memo(({ formData, handleFormChange, handleGetAddress, gettingAddress, addressError }) => (
//   <div className="space-y-6">
//     {/* Hub Name with Red Star */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//         Hub Name <span className="text-red-500 text-lg">*</span>
//       </label>
//       <input
//         type="text"
//         name="name"
//         value={formData.name}
//         onChange={handleFormChange}
//         placeholder="Enter hub name (e.g., Park Street Hub)"
//         className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//         required
//       />
//       <p className="text-xs text-gray-400 mt-1">
//         Enter a unique name for your hub
//       </p>
//     </div>

//     {/* Hub Location */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//         Hub Location <span className="text-red-500 text-lg">*</span>
//       </label>
      
//       {/* Get Coordinates as Blue Text Link */}
//       <div className="mb-4">
//         <button
//           type="button"
//           onClick={() => window.open('https://www.latlong.net/', '_blank')}
//           className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition"
//         >
//           <Compass className="w-4 h-4" />
//           Get Coordinates
//           <ExternalLink className="w-3 h-3" />
//         </button>
//         <p className="text-xs text-gray-500 mt-0.5">
//           Click to get latitude and longitude from latlong.net
//         </p>
//       </div>

//       {/* Latitude and Longitude - Input Fields */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">
//             Latitude <span className="text-red-500 text-lg">*</span>
//           </label>
//           <input
//             type="text"
//             name="latitude"
//             value={formData.latitude}
//             onChange={handleFormChange}
//             placeholder="e.g., 22.5524"
//             className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">
//             Longitude <span className="text-red-500 text-lg">*</span>
//           </label>
//           <input
//             type="text"
//             name="longitude"
//             value={formData.longitude}
//             onChange={handleFormChange}
//             placeholder="e.g., 88.3521"
//             className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//             required
//           />
//         </div>
//       </div>
//     </div>

//     {/* Address with Get Address Button */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//         Address <span className="text-red-500 text-lg">*</span>
//       </label>
//       <div className="relative">
//         <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//         <input
//           type="text"
//           name="address"
//           value={formData.address}
//           onChange={handleFormChange}
//           placeholder="Enter full address or use Get Address from coordinates"
//           className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           required
//         />
//       </div>
      
//       {/* Get Address Button */}
//       <div className="flex items-center gap-3 mt-2">
//         <button
//           type="button"
//           onClick={handleGetAddress}
//           disabled={gettingAddress || !formData.latitude || !formData.longitude}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
//             gettingAddress || !formData.latitude || !formData.longitude
//               ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//               : 'bg-green-600 text-white hover:bg-green-700'
//           }`}
//         >
//           {gettingAddress ? (
//             <>
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Getting Address...
//             </>
//           ) : (
//             <>
//               <RefreshCw className="w-4 h-4" />
//               Get Address from Coordinates
//             </>
//           )}
//         </button>
//         <p className="text-xs text-gray-400">
//           Auto-fill address from latitude and longitude
//         </p>
//       </div>
//     </div>

//     {addressError && (
//       <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
//         <AlertCircle size={16} />
//         {addressError}
//       </div>
//     )}

//     {/* Sanction Load */}
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Load Type
//         </label>
//         <select
//           name="load_type"
//           value={formData.load_type}
//           onChange={handleFormChange}
//           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//         >
//           <option value="KVA">KVA</option>
//           <option value="KW">KW</option>
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Sanction Load
//         </label>
//         <div className="relative">
//           <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="number"
//             name="sanction_load"
//             value={formData.sanction_load}
//             onChange={handleFormChange}
//             step="any"
//             placeholder="Enter load value"
//             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           />
//         </div>
//       </div>
//     </div>
//     <p className="text-xs text-gray-400 -mt-2">
//       Sanction load capacity of the hub (optional)
//     </p>

//     {/* Open 24/7 */}
//     <div className="flex items-center gap-3 pt-2">
//       <input
//         type="checkbox"
//         name="open_24_hours"
//         id="open_24_hours"
//         checked={formData.open_24_hours}
//         onChange={handleFormChange}
//         className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
//       />
//       <label htmlFor="open_24_hours" className="text-sm font-medium text-gray-700">
//         Open 24/7
//       </label>
//     </div>
//   </div>
// ));

// // Step 2: Select Chargers Component - Table View with Colors
// const SelectChargersStep = React.memo(({ 
//   chargers, 
//   chargersLoading, 
//   selectedChargers, 
//   chargerSearchTerm, 
//   setChargerSearchTerm,
//   chargerPagination,
//   loadMoreChargers,
//   loadingMoreChargers,
//   toggleChargerSelection,
//   formatDate,
//   getStatusColor,
//   getStatusIcon,
//   onNavigateToAddCharger // Added prop for navigation
// }) => {
//   // Filter only unassigned chargers (assigned === false)
//   const filteredChargers = chargers
//     .filter(charger => charger.assigned === false)
//     .filter(charger =>
//       charger.charger_name?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
//       charger.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
//       charger.serial_number?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
//       charger.id?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
//     );

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div className="relative flex-1 max-w-sm">
//           <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search unassigned chargers..."
//             value={chargerSearchTerm}
//             onChange={(e) => setChargerSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           />
//         </div>
//         <div className="flex items-center gap-3 text-sm">
//           <span className="text-gray-500">
//             Selected: <span className="font-semibold text-green-600">{selectedChargers.length}</span>
//           </span>
//           <span className="text-gray-500">
//             Available: <span className="font-semibold text-blue-600">{chargers.filter(c => c.assigned === false).length}</span>
//           </span>
//           <span className="text-gray-500">
//             Total: <span className="font-semibold text-gray-900">{chargerPagination.total}</span>
//           </span>
//         </div>
//       </div>

//       {chargersLoading && chargers.length === 0 ? (
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
//         </div>
//       ) : filteredChargers.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
//           <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <p className="text-gray-500 font-medium">No Unassigned Chargers Available</p>
//           <p className="text-sm text-gray-400 mt-1">
//             {chargers.filter(c => c.assigned === false).length === 0 ? 
//               'All chargers are already assigned to hubs' : 
//               'No chargers match your search criteria'}
//           </p>
//           {chargers.filter(c => c.assigned === false).length === 0 && (
//             <button
//               onClick={onNavigateToAddCharger}
//               className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//             >
//               <Plus className="w-4 h-4" />
//               Create New Charger
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Table View with Colors */}
//           <div className="overflow-x-auto rounded-xl border border-gray-200">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
//                   <th className="px-4 py-3 text-left">
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-gray-700">Select</span>
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Hash className="w-3.5 h-3.5 text-gray-400" />
//                       Charger ID
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Zap className="w-3.5 h-3.5 text-gray-400" />
//                       Name
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <FileText className="w-3.5 h-3.5 text-gray-400" />
//                       Serial
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Plug className="w-3.5 h-3.5 text-gray-400" />
//                       Type
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Activity className="w-3.5 h-3.5 text-gray-400" />
//                       Status
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Gauge className="w-3.5 h-3.5 text-gray-400" />
//                       Power
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredChargers.map((charger) => {
//                   const chargerId = charger.id || charger.charger_id;
//                   const isSelected = selectedChargers.includes(chargerId);
                  
//                   return (
//                     <tr 
//                       key={chargerId}
//                       onClick={() => toggleChargerSelection(charger)}
//                       className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
//                         isSelected ? 'bg-green-50 hover:bg-green-100' : ''
//                       }`}
//                     >
//                       <td className="px-4 py-3">
//                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
//                           isSelected 
//                             ? 'border-green-500 bg-green-500' 
//                             : 'border-gray-300 hover:border-green-400'
//                         }`}>
//                           {isSelected && <Check className="w-3 h-3 text-white" />}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">
//                           {charger.charger_id || charger.id?.slice(0, 8) || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 font-medium text-gray-900">
//                         {charger.charger_name || charger.name || 'Unnamed'}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600 text-xs">
//                         {charger.serial_number || 'N/A'}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//                           charger.charger_type === 'DC' 
//                             ? 'bg-purple-100 text-purple-700' 
//                             : charger.charger_type === 'AC' 
//                               ? 'bg-blue-100 text-blue-700' 
//                               : 'bg-gray-100 text-gray-700'
//                         }`}>
//                           {charger.charger_type || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
//                           {getStatusIcon(charger.status)}
//                           {charger.status || 'PENDING'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="font-semibold text-gray-700">
//                           {charger.max_power_kw || 0} kW
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {chargerPagination.has_more && filteredChargers.length > 0 && (
//             <div className="text-center pt-2">
//               <button
//                 onClick={loadMoreChargers}
//                 disabled={loadingMoreChargers}
//                 className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
//               >
//                 {loadingMoreChargers ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Loading...
//                   </>
//                 ) : (
//                   'Load More Chargers'
//                 )}
//               </button>
//             </div>
//           )}

//           <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//             <p className="text-xs text-gray-400">
//               {filteredChargers.length} unassigned charger(s) available
//             </p>
//             <p className="text-xs text-gray-400">
//               Selected: <span className="font-semibold text-green-600">{selectedChargers.length}</span>
//             </p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// });

// const AddHub = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   // Step state
//   const [currentStep, setCurrentStep] = useState(1);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     address: '',
//     latitude: '',
//     longitude: '',
//     open_24_hours: false,
//     load_type: 'KVA',
//     sanction_load: ''
//   });
  
//   // Getting address state
//   const [gettingAddress, setGettingAddress] = useState(false);
//   const [addressError, setAddressError] = useState('');
  
//   // Chargers state
//   const [chargers, setChargers] = useState([]);
//   const [chargersLoading, setChargersLoading] = useState(false);
//   const [selectedChargers, setSelectedChargers] = useState([]);
//   const [chargerSearchTerm, setChargerSearchTerm] = useState('');
//   const [chargerPagination, setChargerPagination] = useState({
//     before: null,
//     before_id: null,
//     limit: 50,
//     has_more: false,
//     total: 0
//   });
//   const [loadingMoreChargers, setLoadingMoreChargers] = useState(false);
  
//   // Form submission state
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState('');
//   const [submitSuccess, setSubmitSuccess] = useState(false);

//   // Fetch user info
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//     fetchChargers();
//   }, []);

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
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchChargers = async (before = null, before_id = null) => {
//     setChargersLoading(true);
    
//     try {
//       let url = `${API_CONFIG.CHARGERS_API}?limit=${chargerPagination.limit}`;
//       if (before) {
//         url += `&before=${before}`;
//       }
//       if (before_id) {
//         url += `&before_id=${before_id}`;
//       }

//       console.log('Fetching chargers URL:', url);

//       const response = await fetchWithTokenRefresh(url, {
//         method: 'GET'
//       });

//       const data = await response.json();
//       console.log('Chargers response:', data);

//       if (response.ok) {
//         // Extract chargers data from response
//         let chargersData = data.data || data.chargers || data || [];
        
//         // Filter to only show unassigned chargers (assigned === false)
//         // If the API doesn't filter, we filter on frontend
//         chargersData = chargersData.filter(charger => charger.assigned === false);
        
//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;
//         const total = data.total || chargersData.length;

//         setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
//         setChargerPagination({
//           before: nextBefore,
//           before_id: nextBeforeId,
//           has_more: hasMore,
//           total: total,
//           limit: chargerPagination.limit
//         });
//       } else {
//         console.error('Failed to fetch chargers:', data);
//       }
//     } catch (error) {
//       console.error('Error fetching chargers:', error);
//     } finally {
//       setChargersLoading(false);
//       setLoadingMoreChargers(false);
//     }
//   };

//   const loadMoreChargers = () => {
//     if (chargerPagination.has_more && !loadingMoreChargers) {
//       setLoadingMoreChargers(true);
//       fetchChargers(chargerPagination.before, chargerPagination.before_id);
//     }
//   };

//   const handleFormChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   }, []);

//   const handleGetAddress = useCallback(async () => {
//     if (!formData.latitude || !formData.longitude) {
//       setAddressError('Please enter both latitude and longitude');
//       return;
//     }

//     const lat = parseFloat(formData.latitude);
//     const lng = parseFloat(formData.longitude);

//     if (isNaN(lat) || isNaN(lng)) {
//       setAddressError('Please enter valid numbers for latitude and longitude');
//       return;
//     }

//     setGettingAddress(true);
//     setAddressError('');

//     try {
//       const address = await getAddressFromCoordinates(lat, lng);
//       if (address) {
//         setFormData(prev => ({ ...prev, address }));
//         setAddressError('');
//       } else {
//         setAddressError('Could not fetch address for these coordinates');
//       }
//     } catch (error) {
//       console.error('Error getting address:', error);
//       setAddressError('Failed to get address. Please try again.');
//     } finally {
//       setGettingAddress(false);
//     }
//   }, [formData.latitude, formData.longitude]);

//   const toggleChargerSelection = useCallback((charger) => {
//     const chargerId = charger.id || charger.charger_id;
//     setSelectedChargers(prev => {
//       if (prev.includes(chargerId)) {
//         return prev.filter(id => id !== chargerId);
//       } else {
//         return [...prev, chargerId];
//       }
//     });
//   }, []);

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     setSubmitError('');
//     setSubmitSuccess(false);

//     // Validate required fields
//     if (!formData.name.trim()) {
//       setSubmitError('Hub name is required');
//       setSubmitting(false);
//       return;
//     }

//     if (!formData.address.trim()) {
//       setSubmitError('Address is required');
//       setSubmitting(false);
//       return;
//     }

//     if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
//       setSubmitError('Valid latitude is required');
//       setSubmitting(false);
//       return;
//     }

//     if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
//       setSubmitError('Valid longitude is required');
//       setSubmitting(false);
//       return;
//     }

//     // Build payload according to backend expectations
//     const payload = {
//       name: formData.name,
//       address: formData.address,
//       latitude: parseFloat(formData.latitude),
//       longitude: parseFloat(formData.longitude),
//       open_24_hours: formData.open_24_hours
//     };

//     // Add sanction_load as a number (not object) - backend expects float64
//     if (formData.sanction_load && !isNaN(parseFloat(formData.sanction_load))) {
//       payload.sanction_load = parseFloat(formData.sanction_load);
//     }

//     // Add charger IDs if selected
//     if (selectedChargers.length > 0) {
//       payload.charger_ids = selectedChargers;
//     }

//     console.log('Creating hub with payload:', payload);

//     try {
//       const response = await fetchWithTokenRefresh(API_CONFIG.HUBS_API, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       console.log('Create hub response:', data);

//       if (response.ok) {
//         setSubmitSuccess(true);
//         setTimeout(() => {
//           navigate('/manage-hubs');
//         }, 2000);
//       } else {
//         setSubmitError(data.message || data.error?.message || 'Failed to create hub');
//       }
//     } catch (error) {
//       console.error('Error creating hub:', error);
//       setSubmitError(error.message || 'An error occurred while creating hub');
//     } finally {
//       setSubmitting(false);
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

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
//       'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
//       'PREPARING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       'CHARGING': 'bg-blue-100 text-blue-800 border-blue-200',
//       'SUSPENDED_EV': 'bg-orange-100 text-orange-800 border-orange-200',
//       'SUSPENDED_EVSE': 'bg-orange-100 text-orange-800 border-orange-200',
//       'FINISHING': 'bg-purple-100 text-purple-800 border-purple-200',
//       'RESERVED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
//       'UNAVAILABLE': 'bg-red-100 text-red-800 border-red-200',
//       'FAULTED': 'bg-red-100 text-red-800 border-red-200',
//       'OFFLINE': 'bg-gray-100 text-gray-800 border-gray-200',
//       'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
//       'UNDER_MAINTENANCE': 'bg-orange-100 text-orange-800 border-orange-200',
//       'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
//   };

//   const getStatusIcon = (status) => {
//     switch(status?.toUpperCase()) {
//       case 'AVAILABLE':
//       case 'ACTIVE':
//         return <CheckCircle className="w-3 h-3" />;
//       case 'CHARGING':
//         return <Zap className="w-3 h-3" />;
//       case 'OFFLINE':
//         return <Wifi className="w-3 h-3" />;
//       case 'FAULTED':
//       case 'UNAVAILABLE':
//         return <AlertCircle className="w-3 h-3" />;
//       case 'UNDER_MAINTENANCE':
//         return <Wrench className="w-3 h-3" />;
//       case 'PREPARING':
//         return <ClockIcon className="w-3 h-3" />;
//       default:
//         return <Circle className="w-3 h-3" />;
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
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <Menu className="w-5 h-5 text-gray-600" />
//               </button>
//               <button
//                 onClick={() => navigate('/manage-hubs')}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
//               >
//                 <ArrowLeft size={20} />
//                 <span className="font-medium">Back</span>
//               </button>
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

//         {/* Main Content - Single Card with Two Columns */}
//         <div className="p-6">
//           <div className="max-w-6xl mx-auto">
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//               {/* Card Header */}
//               <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-green-600 rounded-xl">
//                     <Layers className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">Setup your Hub</h2>
//                     <p className="text-sm text-gray-500">Fill in the details to create a new hub</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Steps Progress with Border Line */}
//               <div className="px-6 pt-6 pb-4 border-b border-gray-200">
//                 <div className="flex items-center gap-4">
//                   {/* Step 1 - Basic Details */}
//                   <div className="flex items-center gap-2">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
//                       currentStep === 1 
//                         ? 'bg-green-600 text-white ring-4 ring-green-100' 
//                         : currentStep > 1 
//                           ? 'bg-green-100 text-green-600' 
//                           : 'bg-gray-100 text-gray-400'
//                     }`}>
//                       {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
//                     </div>
//                     <span className={`text-sm font-medium ${
//                       currentStep === 1 ? 'text-green-600' : 
//                       currentStep > 1 ? 'text-gray-700' : 'text-gray-400'
//                     }`}>
//                       Basic Details
//                     </span>
//                   </div>

//                   {/* Connecting Line - Changes color when step 2 is active */}
//                   <div className={`flex-1 h-0.5 max-w-24 transition-all duration-500 ${
//                     currentStep === 2 ? 'bg-green-500' : 
//                     currentStep > 1 ? 'bg-green-300' : 'bg-gray-200'
//                   }`} />

//                   {/* Step 2 - Select Chargers */}
//                   <div className="flex items-center gap-2">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
//                       currentStep === 2 
//                         ? 'bg-green-600 text-white ring-4 ring-green-100' 
//                         : currentStep > 2 
//                           ? 'bg-green-100 text-green-600' 
//                           : 'bg-gray-100 text-gray-400'
//                     }`}>
//                       {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
//                     </div>
//                     <span className={`text-sm font-medium ${
//                       currentStep === 2 ? 'text-green-600' : 
//                       currentStep > 2 ? 'text-gray-700' : 'text-gray-400'
//                     }`}>
//                       Select Chargers
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Two Column Layout */}
//               <div className="flex flex-col md:flex-row">
//                 {/* Left Column - Steps Indicator */}
//                 <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-200">
//                   <div className="sticky top-6">
//                     <h3 className="text-sm font-semibold text-gray-700 mb-4">Setup Steps</h3>
//                     <div className="space-y-6">
//                       {/* Step 1 Indicator */}
//                       <div className="flex items-start gap-3">
//                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${
//                           currentStep === 1 
//                             ? 'bg-green-600 text-white' 
//                             : currentStep > 1 
//                               ? 'bg-green-100 text-green-600' 
//                               : 'bg-gray-200 text-gray-400'
//                         }`}>
//                           {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
//                         </div>
//                         <div>
//                           <p className={`text-sm font-medium ${
//                             currentStep === 1 ? 'text-green-600' : 
//                             currentStep > 1 ? 'text-gray-700' : 'text-gray-400'
//                           }`}>
//                             Basic Details
//                           </p>
//                           <p className="text-xs text-gray-400">Name, location & capacity</p>
//                         </div>
//                       </div>

//                       {/* Step 2 Indicator */}
//                       <div className="flex items-start gap-3">
//                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${
//                           currentStep === 2 
//                             ? 'bg-green-600 text-white' 
//                             : currentStep > 2 
//                               ? 'bg-green-100 text-green-600' 
//                               : 'bg-gray-200 text-gray-400'
//                         }`}>
//                           {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
//                         </div>
//                         <div>
//                           <p className={`text-sm font-medium ${
//                             currentStep === 2 ? 'text-green-600' : 
//                             currentStep > 2 ? 'text-gray-700' : 'text-gray-400'
//                           }`}>
//                             Select Chargers
//                           </p>
//                           <p className="text-xs text-gray-400">View and select unassigned chargers</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column - Form Content */}
//                 <div className="flex-1 p-6">
//                   <div className="mb-4">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       {currentStep === 1 ? 'Basic Details' : 'Select Unassigned Chargers'}
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       {currentStep === 1 
//                         ? 'Enter the basic details of your hub' 
//                         : 'Select unassigned chargers to associate with this hub (optional)'}
//                     </p>
//                   </div>

//                   {currentStep === 1 ? (
//                     <BasicDetailsStep 
//                       formData={formData}
//                       handleFormChange={handleFormChange}
//                       handleGetAddress={handleGetAddress}
//                       gettingAddress={gettingAddress}
//                       addressError={addressError}
//                     />
//                   ) : (
//                     <SelectChargersStep 
//                       chargers={chargers}
//                       chargersLoading={chargersLoading}
//                       selectedChargers={selectedChargers}
//                       chargerSearchTerm={chargerSearchTerm}
//                       setChargerSearchTerm={setChargerSearchTerm}
//                       chargerPagination={chargerPagination}
//                       loadMoreChargers={loadMoreChargers}
//                       loadingMoreChargers={loadingMoreChargers}
//                       toggleChargerSelection={toggleChargerSelection}
//                       formatDate={formatDate}
//                       getStatusColor={getStatusColor}
//                       getStatusIcon={getStatusIcon}
//                       onNavigateToAddCharger={() => navigate('/add-charger')}
//                     />
//                   )}

//                   {/* Navigation Buttons - Bottom Right */}
//                   <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
//                     {currentStep > 1 && (
//                       <button
//                         onClick={() => setCurrentStep(currentStep - 1)}
//                         className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
//                       >
//                         Previous
//                       </button>
//                     )}
//                     <button
//                       onClick={() => {
//                         if (currentStep === 1) {
//                           if (!formData.name.trim()) {
//                             setSubmitError('Hub name is required');
//                             return;
//                           }
//                           if (!formData.address.trim()) {
//                             setSubmitError('Address is required');
//                             return;
//                           }
//                           if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
//                             setSubmitError('Valid latitude is required');
//                             return;
//                           }
//                           if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
//                             setSubmitError('Valid longitude is required');
//                             return;
//                           }
//                           setSubmitError('');
//                           setCurrentStep(2);
//                         } else if (currentStep === 2) {
//                           handleSubmit();
//                         }
//                       }}
//                       disabled={submitting}
//                       className={`px-8 py-2.5 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
//                         submitting 
//                           ? 'bg-gray-400 cursor-not-allowed' 
//                           : 'bg-green-600 hover:bg-green-700'
//                       }`}
//                     >
//                       {submitting ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Creating...
//                         </>
//                       ) : (
//                         <>
//                           {currentStep === 2 ? 'Create Hub' : 'Next'}
//                           {currentStep !== 2 && <ArrowRight size={16} />}
//                         </>
//                       )}
//                     </button>
//                   </div>

//                   {submitError && (
//                     <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
//                       <AlertCircle size={16} />
//                       {submitError}
//                     </div>
//                   )}

//                   {submitSuccess && (
//                     <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
//                       <CheckCircle size={16} />
//                       Hub created successfully! Redirecting...
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddHub;

// src/components/Hubs/Addhub.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../Authentication/AuthContext';
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
//   ArrowLeft,
//   Edit,
//   Trash2,
//   Power,
//   Wifi,
//   Zap,
//   MoreVertical,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
//   ArrowRight,
//   Check,
//   Circle,
//   Info,
//   Map,
//   Navigation,
//   Target,
//   List,
//   Grid,
//   Radio,
//   RadioButton,
//   Search as SearchIcon,
//   Gauge,
//   Database,
//   RefreshCw,
//   Globe2,
//   Crosshair,
//   Compass,
//   AlertTriangle,
//   Plug,
//   Clock as ClockIcon,
//   Wrench,
//   Activity
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// console.log('API Base URL:', API_BASE_URL);
// console.log('CPO App ID:', CPO_APP_ID);

// const API_CONFIG = {
//   HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
//   CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
// };

// // Reverse Geocoding - Get address from coordinates
// const getAddressFromCoordinates = async (lat, lng) => {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
//       {
//         headers: {
//           'User-Agent': 'TransEV-App/1.0'
//         }
//       }
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch address');
//     }
    
//     const data = await response.json();
//     console.log('Reverse geocoding response:', data);
    
//     if (data && data.display_name) {
//       return data.display_name;
//     } else {
//       return '';
//     }
//   } catch (error) {
//     console.error('Error fetching address:', error);
//     return '';
//   }
// };

// // Step 1: Basic Details Component
// const BasicDetailsStep = React.memo(({ formData, handleFormChange, handleGetAddress, gettingAddress, addressError }) => (
//   <div className="space-y-6">
//     {/* Hub Name with Red Star */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//         Hub Name <span className="text-red-500 text-lg">*</span>
//       </label>
//       <input
//         type="text"
//         name="name"
//         value={formData.name}
//         onChange={handleFormChange}
//         placeholder="Enter hub name (e.g., Park Street Hub)"
//         className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//         required
//       />
//       <p className="text-xs text-gray-400 mt-1">
//         Enter a unique name for your hub
//       </p>
//     </div>

//     {/* Hub Location */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//         Hub Location <span className="text-red-500 text-lg">*</span>
//       </label>
      
//       {/* Get Coordinates as Blue Text Link */}
//       <div className="mb-4">
//         <button
//           type="button"
//           onClick={() => window.open('https://www.latlong.net/', '_blank')}
//           className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition"
//         >
//           <Compass className="w-4 h-4" />
//           Get Coordinates
//           <ExternalLink className="w-3 h-3" />
//         </button>
//         <p className="text-xs text-gray-500 mt-0.5">
//           Click to get latitude and longitude from latlong.net
//         </p>
//       </div>

//       {/* Latitude and Longitude - Input Fields */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">
//             Latitude <span className="text-red-500 text-lg">*</span>
//           </label>
//           <input
//             type="text"
//             name="latitude"
//             value={formData.latitude}
//             onChange={handleFormChange}
//             placeholder="e.g., 22.5524"
//             className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">
//             Longitude <span className="text-red-500 text-lg">*</span>
//           </label>
//           <input
//             type="text"
//             name="longitude"
//             value={formData.longitude}
//             onChange={handleFormChange}
//             placeholder="e.g., 88.3521"
//             className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//             required
//           />
//         </div>
//       </div>
//     </div>

//     {/* Address with Get Address Button */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//         Address <span className="text-red-500 text-lg">*</span>
//       </label>
//       <div className="relative">
//         <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//         <input
//           type="text"
//           name="address"
//           value={formData.address}
//           onChange={handleFormChange}
//           placeholder="Enter full address or use Get Address from coordinates"
//           className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           required
//         />
//       </div>
      
//       {/* Get Address Button */}
//       <div className="flex items-center gap-3 mt-2">
//         <button
//           type="button"
//           onClick={handleGetAddress}
//           disabled={gettingAddress || !formData.latitude || !formData.longitude}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
//             gettingAddress || !formData.latitude || !formData.longitude
//               ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//               : 'bg-green-600 text-white hover:bg-green-700'
//           }`}
//         >
//           {gettingAddress ? (
//             <>
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Getting Address...
//             </>
//           ) : (
//             <>
//               <RefreshCw className="w-4 h-4" />
//               Get Address from Coordinates
//             </>
//           )}
//         </button>
//         <p className="text-xs text-gray-400">
//           Auto-fill address from latitude and longitude
//         </p>
//       </div>
//     </div>

//     {addressError && (
//       <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
//         <AlertCircle size={16} />
//         {addressError}
//       </div>
//     )}

//     {/* Sanction Load */}
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Load Type
//         </label>
//         <select
//           name="load_type"
//           value={formData.load_type}
//           onChange={handleFormChange}
//           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//         >
//           <option value="KVA">KVA</option>
//           <option value="KW">KW</option>
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Sanction Load
//         </label>
//         <div className="relative">
//           <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="number"
//             name="sanction_load"
//             value={formData.sanction_load}
//             onChange={handleFormChange}
//             step="any"
//             placeholder="Enter load value"
//             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           />
//         </div>
//       </div>
//     </div>
//     <p className="text-xs text-gray-400 -mt-2">
//       Sanction load capacity of the hub (optional)
//     </p>

//     {/* Open 24/7 */}
//     <div className="flex items-center gap-3 pt-2">
//       <input
//         type="checkbox"
//         name="open_24_hours"
//         id="open_24_hours"
//         checked={formData.open_24_hours}
//         onChange={handleFormChange}
//         className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
//       />
//       <label htmlFor="open_24_hours" className="text-sm font-medium text-gray-700">
//         Open 24/7
//       </label>
//     </div>
//   </div>
// ));

// // Step 2: Select Chargers Component - Table View with Colors
// const SelectChargersStep = React.memo(({ 
//   chargers, 
//   chargersLoading, 
//   selectedChargers, 
//   chargerSearchTerm, 
//   setChargerSearchTerm,
//   chargerPagination,
//   loadMoreChargers,
//   loadingMoreChargers,
//   toggleChargerSelection,
//   formatDate,
//   getStatusColor,
//   getStatusIcon,
//   onNavigateToAddCharger
// }) => {
//   // Filter only unassigned chargers (assigned === false)
//   const filteredChargers = chargers
//     .filter(charger => charger.assigned === false)
//     .filter(charger =>
//       charger.charger_name?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
//       charger.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
//       charger.serial_number?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
//       charger.id?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
//     );

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div className="relative flex-1 max-w-sm">
//           <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search unassigned chargers..."
//             value={chargerSearchTerm}
//             onChange={(e) => setChargerSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           />
//         </div>
//         <div className="flex items-center gap-3 text-sm">
//           <span className="text-gray-500">
//             Selected: <span className="font-semibold text-green-600">{selectedChargers.length}</span>
//           </span>
//           <span className="text-gray-500">
//             Available: <span className="font-semibold text-blue-600">{chargers.filter(c => c.assigned === false).length}</span>
//           </span>
//           <span className="text-gray-500">
//             Total: <span className="font-semibold text-gray-900">{chargerPagination.total}</span>
//           </span>
//         </div>
//       </div>

//       {chargersLoading && chargers.length === 0 ? (
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
//         </div>
//       ) : filteredChargers.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
//           <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <p className="text-gray-500 font-medium">No Unassigned Chargers Available</p>
//           <p className="text-sm text-gray-400 mt-1">
//             {chargers.filter(c => c.assigned === false).length === 0 ? 
//               'All chargers are already assigned to hubs' : 
//               'No chargers match your search criteria'}
//           </p>
//           {chargers.filter(c => c.assigned === false).length === 0 && (
//             <button
//               onClick={onNavigateToAddCharger}
//               className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//             >
//               <Plus className="w-4 h-4" />
//               Create New Charger
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Table View with Colors */}
//           <div className="overflow-x-auto rounded-xl border border-gray-200">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
//                   <th className="px-4 py-3 text-left">
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-gray-700">Select</span>
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Hash className="w-3.5 h-3.5 text-gray-400" />
//                       Charger ID
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Zap className="w-3.5 h-3.5 text-gray-400" />
//                       Name
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <FileText className="w-3.5 h-3.5 text-gray-400" />
//                       Serial
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Plug className="w-3.5 h-3.5 text-gray-400" />
//                       Type
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Activity className="w-3.5 h-3.5 text-gray-400" />
//                       Status
//                     </div>
//                   </th>
//                   <th className="px-4 py-3 text-left font-semibold text-gray-700">
//                     <div className="flex items-center gap-1">
//                       <Gauge className="w-3.5 h-3.5 text-gray-400" />
//                       Power
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredChargers.map((charger) => {
//                   const chargerId = charger.id || charger.charger_id;
//                   const isSelected = selectedChargers.includes(chargerId);
                  
//                   return (
//                     <tr 
//                       key={chargerId}
//                       onClick={() => toggleChargerSelection(charger)}
//                       className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
//                         isSelected ? 'bg-green-50 hover:bg-green-100' : ''
//                       }`}
//                     >
//                       <td className="px-4 py-3">
//                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
//                           isSelected 
//                             ? 'border-green-500 bg-green-500' 
//                             : 'border-gray-300 hover:border-green-400'
//                         }`}>
//                           {isSelected && <Check className="w-3 h-3 text-white" />}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">
//                           {charger.charger_id || charger.id?.slice(0, 8) || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 font-medium text-gray-900">
//                         {charger.charger_name || charger.name || 'Unnamed'}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600 text-xs">
//                         {charger.serial_number || 'N/A'}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//                           charger.charger_type === 'DC' 
//                             ? 'bg-purple-100 text-purple-700' 
//                             : charger.charger_type === 'AC' 
//                               ? 'bg-blue-100 text-blue-700' 
//                               : 'bg-gray-100 text-gray-700'
//                         }`}>
//                           {charger.charger_type || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
//                           {getStatusIcon(charger.status)}
//                           {charger.status || 'PENDING'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="font-semibold text-gray-700">
//                           {charger.max_power_kw || 0} kW
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {chargerPagination.has_more && filteredChargers.length > 0 && (
//             <div className="text-center pt-2">
//               <button
//                 onClick={loadMoreChargers}
//                 disabled={loadingMoreChargers}
//                 className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
//               >
//                 {loadingMoreChargers ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Loading...
//                   </>
//                 ) : (
//                   'Load More Chargers'
//                 )}
//               </button>
//             </div>
//           )}

//           <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//             <p className="text-xs text-gray-400">
//               {filteredChargers.length} unassigned charger(s) available
//             </p>
//             <p className="text-xs text-gray-400">
//               Selected: <span className="font-semibold text-green-600">{selectedChargers.length}</span>
//             </p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// });

// const AddHub = () => {
//   const navigate = useNavigate();
//   const { 
//     authenticatedRequest, 
//     logout, 
//     isRefreshing,
//     isAuthenticated,
//     user 
//   } = useAuth();
  
//   const [loading, setLoading] = useState(true);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   // Step state
//   const [currentStep, setCurrentStep] = useState(1);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     address: '',
//     latitude: '',
//     longitude: '',
//     open_24_hours: false,
//     load_type: 'KVA',
//     sanction_load: ''
//   });
  
//   // Getting address state
//   const [gettingAddress, setGettingAddress] = useState(false);
//   const [addressError, setAddressError] = useState('');
  
//   // Chargers state
//   const [chargers, setChargers] = useState([]);
//   const [chargersLoading, setChargersLoading] = useState(false);
//   const [selectedChargers, setSelectedChargers] = useState([]);
//   const [chargerSearchTerm, setChargerSearchTerm] = useState('');
//   const [chargerPagination, setChargerPagination] = useState({
//     before: null,
//     before_id: null,
//     limit: 50,
//     has_more: false,
//     total: 0
//   });
//   const [loadingMoreChargers, setLoadingMoreChargers] = useState(false);
  
//   // Form submission state
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState('');
//   const [submitSuccess, setSubmitSuccess] = useState(false);

//   // Check authentication on mount
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/signin');
//       return;
//     }
//     fetchUserInfo();
//     fetchChargers();
//   }, [isAuthenticated, navigate]);

//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
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
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchChargers = async (before = null, before_id = null) => {
//     setChargersLoading(true);
    
//     try {
//       let url = `${API_CONFIG.CHARGERS_API}?limit=${chargerPagination.limit}`;
//       if (before) {
//         url += `&before=${before}`;
//       }
//       if (before_id) {
//         url += `&before_id=${before_id}`;
//       }

//       console.log('Fetching chargers URL:', url);

//       const response = await authenticatedRequest(url, {
//         method: 'GET'
//       });

//       const data = await response.json();
//       console.log('Chargers response:', data);

//       if (response.ok) {
//         let chargersData = data.data || data.chargers || data || [];
//         chargersData = chargersData.filter(charger => charger.assigned === false);
        
//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;
//         const total = data.total || chargersData.length;

//         setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
//         setChargerPagination({
//           before: nextBefore,
//           before_id: nextBeforeId,
//           has_more: hasMore,
//           total: total,
//           limit: chargerPagination.limit
//         });
//       } else {
//         console.error('Failed to fetch chargers:', data);
//       }
//     } catch (error) {
//       console.error('Error fetching chargers:', error);
//     } finally {
//       setChargersLoading(false);
//       setLoadingMoreChargers(false);
//     }
//   };

//   const loadMoreChargers = () => {
//     if (chargerPagination.has_more && !loadingMoreChargers) {
//       setLoadingMoreChargers(true);
//       fetchChargers(chargerPagination.before, chargerPagination.before_id);
//     }
//   };

//   const handleFormChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   }, []);

//   const handleGetAddress = useCallback(async () => {
//     if (!formData.latitude || !formData.longitude) {
//       setAddressError('Please enter both latitude and longitude');
//       return;
//     }

//     const lat = parseFloat(formData.latitude);
//     const lng = parseFloat(formData.longitude);

//     if (isNaN(lat) || isNaN(lng)) {
//       setAddressError('Please enter valid numbers for latitude and longitude');
//       return;
//     }

//     setGettingAddress(true);
//     setAddressError('');

//     try {
//       const address = await getAddressFromCoordinates(lat, lng);
//       if (address) {
//         setFormData(prev => ({ ...prev, address }));
//         setAddressError('');
//       } else {
//         setAddressError('Could not fetch address for these coordinates');
//       }
//     } catch (error) {
//       console.error('Error getting address:', error);
//       setAddressError('Failed to get address. Please try again.');
//     } finally {
//       setGettingAddress(false);
//     }
//   }, [formData.latitude, formData.longitude]);

//   const toggleChargerSelection = useCallback((charger) => {
//     const chargerId = charger.id || charger.charger_id;
//     setSelectedChargers(prev => {
//       if (prev.includes(chargerId)) {
//         return prev.filter(id => id !== chargerId);
//       } else {
//         return [...prev, chargerId];
//       }
//     });
//   }, []);

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     setSubmitError('');
//     setSubmitSuccess(false);

//     // Validate required fields
//     if (!formData.name.trim()) {
//       setSubmitError('Hub name is required');
//       setSubmitting(false);
//       return;
//     }

//     if (!formData.address.trim()) {
//       setSubmitError('Address is required');
//       setSubmitting(false);
//       return;
//     }

//     if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
//       setSubmitError('Valid latitude is required');
//       setSubmitting(false);
//       return;
//     }

//     if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
//       setSubmitError('Valid longitude is required');
//       setSubmitting(false);
//       return;
//     }

//     // Build payload
//     const payload = {
//       name: formData.name,
//       address: formData.address,
//       latitude: parseFloat(formData.latitude),
//       longitude: parseFloat(formData.longitude),
//       open_24_hours: formData.open_24_hours
//     };

//     if (formData.sanction_load && !isNaN(parseFloat(formData.sanction_load))) {
//       payload.sanction_load = parseFloat(formData.sanction_load);
//     }

//     if (selectedChargers.length > 0) {
//       payload.charger_ids = selectedChargers;
//     }

//     console.log('Creating hub with payload:', payload);

//     try {
//       const response = await authenticatedRequest(API_CONFIG.HUBS_API, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       console.log('Create hub response:', data);

//       if (response.ok) {
//         setSubmitSuccess(true);
//         setTimeout(() => {
//           navigate('/manage-hubs');
//         }, 2000);
//       } else {
//         setSubmitError(data.message || data.error?.message || 'Failed to create hub');
//       }
//     } catch (error) {
//       console.error('Error creating hub:', error);
//       setSubmitError(error.message || 'An error occurred while creating hub');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleLogout = async () => {
//     setLoggingOut(true);
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       navigate('/signin');
//     } finally {
//       setLoggingOut(false);
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
//       'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
//       'PREPARING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       'CHARGING': 'bg-blue-100 text-blue-800 border-blue-200',
//       'SUSPENDED_EV': 'bg-orange-100 text-orange-800 border-orange-200',
//       'SUSPENDED_EVSE': 'bg-orange-100 text-orange-800 border-orange-200',
//       'FINISHING': 'bg-purple-100 text-purple-800 border-purple-200',
//       'RESERVED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
//       'UNAVAILABLE': 'bg-red-100 text-red-800 border-red-200',
//       'FAULTED': 'bg-red-100 text-red-800 border-red-200',
//       'OFFLINE': 'bg-gray-100 text-gray-800 border-gray-200',
//       'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
//       'UNDER_MAINTENANCE': 'bg-orange-100 text-orange-800 border-orange-200',
//       'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
//   };

//   const getStatusIcon = (status) => {
//     switch(status?.toUpperCase()) {
//       case 'AVAILABLE':
//       case 'ACTIVE':
//         return <CheckCircle className="w-3 h-3" />;
//       case 'CHARGING':
//         return <Zap className="w-3 h-3" />;
//       case 'OFFLINE':
//         return <Wifi className="w-3 h-3" />;
//       case 'FAULTED':
//       case 'UNAVAILABLE':
//         return <AlertCircle className="w-3 h-3" />;
//       case 'UNDER_MAINTENANCE':
//         return <Wrench className="w-3 h-3" />;
//       case 'PREPARING':
//         return <ClockIcon className="w-3 h-3" />;
//       default:
//         return <Circle className="w-3 h-3" />;
//     }
//   };

//   // Settings Dropdown Menu
//   const SettingsMenu = () => (
//     <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
//       <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
//         <div className="flex items-center gap-3">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
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

//   // Show loading if refreshing
//   if (isRefreshing || loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex">
//         <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600">
//               {isRefreshing ? 'Refreshing session...' : 'Loading...'}
//             </p>
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
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <Menu className="w-5 h-5 text-gray-600" />
//               </button>
//               <button
//                 onClick={() => navigate('/manage-hubs')}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
//               >
//                 <ArrowLeft size={20} />
//                 <span className="font-medium">Back</span>
//               </button>
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

//         {/* Main Content - Single Card with Two Columns */}
//         <div className="p-6">
//           <div className="max-w-6xl mx-auto">
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//               {/* Card Header */}
//               <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-green-600 rounded-xl">
//                     <Layers className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">Setup your Hub</h2>
//                     <p className="text-sm text-gray-500">Fill in the details to create a new hub</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Steps Progress with Border Line */}
//               <div className="px-6 pt-6 pb-4 border-b border-gray-200">
//                 <div className="flex items-center gap-4">
//                   {/* Step 1 - Basic Details */}
//                   <div className="flex items-center gap-2">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
//                       currentStep === 1 
//                         ? 'bg-green-600 text-white ring-4 ring-green-100' 
//                         : currentStep > 1 
//                           ? 'bg-green-100 text-green-600' 
//                           : 'bg-gray-100 text-gray-400'
//                     }`}>
//                       {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
//                     </div>
//                     <span className={`text-sm font-medium ${
//                       currentStep === 1 ? 'text-green-600' : 
//                       currentStep > 1 ? 'text-gray-700' : 'text-gray-400'
//                     }`}>
//                       Basic Details
//                     </span>
//                   </div>

//                   {/* Connecting Line */}
//                   <div className={`flex-1 h-0.5 max-w-24 transition-all duration-500 ${
//                     currentStep === 2 ? 'bg-green-500' : 
//                     currentStep > 1 ? 'bg-green-300' : 'bg-gray-200'
//                   }`} />

//                   {/* Step 2 - Select Chargers */}
//                   <div className="flex items-center gap-2">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
//                       currentStep === 2 
//                         ? 'bg-green-600 text-white ring-4 ring-green-100' 
//                         : currentStep > 2 
//                           ? 'bg-green-100 text-green-600' 
//                           : 'bg-gray-100 text-gray-400'
//                     }`}>
//                       {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
//                     </div>
//                     <span className={`text-sm font-medium ${
//                       currentStep === 2 ? 'text-green-600' : 
//                       currentStep > 2 ? 'text-gray-700' : 'text-gray-400'
//                     }`}>
//                       Select Chargers
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Two Column Layout */}
//               <div className="flex flex-col md:flex-row">
//                 {/* Left Column - Steps Indicator */}
//                 <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-200">
//                   <div className="sticky top-6">
//                     <h3 className="text-sm font-semibold text-gray-700 mb-4">Setup Steps</h3>
//                     <div className="space-y-6">
//                       {/* Step 1 Indicator */}
//                       <div className="flex items-start gap-3">
//                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${
//                           currentStep === 1 
//                             ? 'bg-green-600 text-white' 
//                             : currentStep > 1 
//                               ? 'bg-green-100 text-green-600' 
//                               : 'bg-gray-200 text-gray-400'
//                         }`}>
//                           {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
//                         </div>
//                         <div>
//                           <p className={`text-sm font-medium ${
//                             currentStep === 1 ? 'text-green-600' : 
//                             currentStep > 1 ? 'text-gray-700' : 'text-gray-400'
//                           }`}>
//                             Basic Details
//                           </p>
//                           <p className="text-xs text-gray-400">Name, location & capacity</p>
//                         </div>
//                       </div>

//                       {/* Step 2 Indicator */}
//                       <div className="flex items-start gap-3">
//                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${
//                           currentStep === 2 
//                             ? 'bg-green-600 text-white' 
//                             : currentStep > 2 
//                               ? 'bg-green-100 text-green-600' 
//                               : 'bg-gray-200 text-gray-400'
//                         }`}>
//                           {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
//                         </div>
//                         <div>
//                           <p className={`text-sm font-medium ${
//                             currentStep === 2 ? 'text-green-600' : 
//                             currentStep > 2 ? 'text-gray-700' : 'text-gray-400'
//                           }`}>
//                             Select Chargers
//                           </p>
//                           <p className="text-xs text-gray-400">View and select unassigned chargers</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column - Form Content */}
//                 <div className="flex-1 p-6">
//                   <div className="mb-4">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       {currentStep === 1 ? 'Basic Details' : 'Select Unassigned Chargers'}
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       {currentStep === 1 
//                         ? 'Enter the basic details of your hub' 
//                         : 'Select unassigned chargers to associate with this hub (optional)'}
//                     </p>
//                   </div>

//                   {currentStep === 1 ? (
//                     <BasicDetailsStep 
//                       formData={formData}
//                       handleFormChange={handleFormChange}
//                       handleGetAddress={handleGetAddress}
//                       gettingAddress={gettingAddress}
//                       addressError={addressError}
//                     />
//                   ) : (
//                     <SelectChargersStep 
//                       chargers={chargers}
//                       chargersLoading={chargersLoading}
//                       selectedChargers={selectedChargers}
//                       chargerSearchTerm={chargerSearchTerm}
//                       setChargerSearchTerm={setChargerSearchTerm}
//                       chargerPagination={chargerPagination}
//                       loadMoreChargers={loadMoreChargers}
//                       loadingMoreChargers={loadingMoreChargers}
//                       toggleChargerSelection={toggleChargerSelection}
//                       formatDate={formatDate}
//                       getStatusColor={getStatusColor}
//                       getStatusIcon={getStatusIcon}
//                       onNavigateToAddCharger={() => navigate('/add-charger')}
//                     />
//                   )}

//                   {/* Navigation Buttons - Bottom Right */}
//                   <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
//                     {currentStep > 1 && (
//                       <button
//                         onClick={() => setCurrentStep(currentStep - 1)}
//                         className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
//                       >
//                         Previous
//                       </button>
//                     )}
//                     <button
//                       onClick={() => {
//                         if (currentStep === 1) {
//                           if (!formData.name.trim()) {
//                             setSubmitError('Hub name is required');
//                             return;
//                           }
//                           if (!formData.address.trim()) {
//                             setSubmitError('Address is required');
//                             return;
//                           }
//                           if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
//                             setSubmitError('Valid latitude is required');
//                             return;
//                           }
//                           if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
//                             setSubmitError('Valid longitude is required');
//                             return;
//                           }
//                           setSubmitError('');
//                           setCurrentStep(2);
//                         } else if (currentStep === 2) {
//                           handleSubmit();
//                         }
//                       }}
//                       disabled={submitting || isRefreshing}
//                       className={`px-8 py-2.5 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
//                         submitting || isRefreshing
//                           ? 'bg-gray-400 cursor-not-allowed' 
//                           : 'bg-green-600 hover:bg-green-700'
//                       }`}
//                     >
//                       {submitting ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Creating...
//                         </>
//                       ) : (
//                         <>
//                           {currentStep === 2 ? 'Create Hub' : 'Next'}
//                           {currentStep !== 2 && <ArrowRight size={16} />}
//                         </>
//                       )}
//                     </button>
//                   </div>

//                   {submitError && (
//                     <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
//                       <AlertCircle size={16} />
//                       {submitError}
//                     </div>
//                   )}

//                   {submitSuccess && (
//                     <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
//                       <CheckCircle size={16} />
//                       Hub created successfully! Redirecting...
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddHub;

// src/components/Hubs/Addhub.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  ArrowLeft,
  Edit,
  Trash2,
  Power,
  Wifi,
  Zap,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  Circle,
  Info,
  Map,
  Navigation,
  Target,
  List,
  Grid,
  Radio,
  RadioButton,
  Search as SearchIcon,
  Gauge,
  Database,
  RefreshCw,
  Globe2,
  Crosshair,
  Compass,
  AlertTriangle,
  Plug,
  Clock as ClockIcon,
  Wrench,
  Activity
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

console.log('API Base URL:', API_BASE_URL);
console.log('CPO App ID:', CPO_APP_ID);

const API_CONFIG = {
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Reverse Geocoding - Get address and state from coordinates
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TransEV-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    console.log('Reverse geocoding response:', data);
    
    // Extract state from address
    let state = '';
    if (data && data.address) {
      state = data.address.state || data.address.region || data.address.state_district || '';
    }
    
    return {
      display_name: data.display_name || '',
      state: state,
      fullData: data
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    return {
      display_name: '',
      state: '',
      fullData: null
    };
  }
};

// Step 1: Basic Details Component
const BasicDetailsStep = React.memo(({ formData, handleFormChange, handleGetAddress, gettingAddress, addressError }) => (
  <div className="space-y-6">
    {/* Hub Name with Red Star */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Hub Name <span className="text-red-500 text-lg">*</span>
      </label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleFormChange}
        placeholder="Enter hub name (e.g., Park Street Hub)"
        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required
      />
      <p className="text-xs text-gray-400 mt-1">
        Enter a unique name for your hub
      </p>
    </div>

    {/* Hub Location */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Hub Location <span className="text-red-500 text-lg">*</span>
      </label>
      
      {/* Get Coordinates as Blue Text Link */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => window.open('https://www.latlong.net/', '_blank')}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition"
        >
          <Compass className="w-4 h-4" />
          Get Coordinates
          <ExternalLink className="w-3 h-3" />
        </button>
        <p className="text-xs text-gray-500 mt-0.5">
          Click to get latitude and longitude from latlong.net
        </p>
      </div>

      {/* Latitude and Longitude - Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Latitude <span className="text-red-500 text-lg">*</span>
          </label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleFormChange}
            placeholder="e.g., 22.5524"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Longitude <span className="text-red-500 text-lg">*</span>
          </label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleFormChange}
            placeholder="e.g., 88.3521"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>

    {/* Address with Get Address Button */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Address <span className="text-red-500 text-lg">*</span>
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleFormChange}
          placeholder="Enter full address or use Get Address from coordinates"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>
      
      {/* Get Address Button */}
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={handleGetAddress}
          disabled={gettingAddress || !formData.latitude || !formData.longitude}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            gettingAddress || !formData.latitude || !formData.longitude
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {gettingAddress ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting Address...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Get Address from Coordinates
            </>
          )}
        </button>
        <p className="text-xs text-gray-400">
          Auto-fill address from latitude and longitude
        </p>
      </div>
    </div>

    {addressError && (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
        <AlertCircle size={16} />
        {addressError}
      </div>
    )}

    {/* State - Auto-filled, not shown to user */}
    {/* Hidden state field that gets populated from reverse geocoding */}

    {/* Sanction Load */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Load Type
        </label>
        <select
          name="load_type"
          value={formData.load_type}
          onChange={handleFormChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
        
          <option value="KW">KW</option>
            <option value="KVA">KVA</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Sanction Load
        </label>
        <div className="relative">
          <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            name="sanction_load"
            value={formData.sanction_load}
            onChange={handleFormChange}
            step="any"
            placeholder="Enter load value"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
    <p className="text-xs text-gray-400 -mt-2">
      Sanction load capacity of the hub (optional)
    </p>

    {/* Open 24/7 */}
    <div className="flex items-center gap-3 pt-2">
      <input
        type="checkbox"
        name="open_24_hours"
        id="open_24_hours"
        checked={formData.open_24_hours}
        onChange={handleFormChange}
        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
      <label htmlFor="open_24_hours" className="text-sm font-medium text-gray-700">
        Open 24/7
      </label>
    </div>
  </div>
));

// Step 2: Select Chargers Component - Table View with Colors
const SelectChargersStep = React.memo(({ 
  chargers, 
  chargersLoading, 
  selectedChargers, 
  chargerSearchTerm, 
  setChargerSearchTerm,
  chargerPagination,
  loadMoreChargers,
  loadingMoreChargers,
  toggleChargerSelection,
  formatDate,
  getStatusColor,
  getStatusIcon,
  onNavigateToAddCharger
}) => {
  // Filter only unassigned chargers (assigned === false)
  const filteredChargers = chargers
    .filter(charger => charger.assigned === false)
    .filter(charger =>
      charger.charger_name?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
      charger.charger_id?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
      charger.serial_number?.toLowerCase().includes(chargerSearchTerm.toLowerCase()) ||
      charger.id?.toLowerCase().includes(chargerSearchTerm.toLowerCase())
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search unassigned chargers..."
            value={chargerSearchTerm}
            onChange={(e) => setChargerSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">
            Selected: <span className="font-semibold text-green-600">{selectedChargers.length}</span>
          </span>
          <span className="text-gray-500">
            Available: <span className="font-semibold text-blue-600">{chargers.filter(c => c.assigned === false).length}</span>
          </span>
          <span className="text-gray-500">
            Total: <span className="font-semibold text-gray-900">{chargerPagination.total}</span>
          </span>
        </div>
      </div>

      {chargersLoading && chargers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : filteredChargers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No Unassigned Chargers Available</p>
          <p className="text-sm text-gray-400 mt-1">
            {chargers.filter(c => c.assigned === false).length === 0 ? 
              'All chargers are already assigned to hubs' : 
              'No chargers match your search criteria'}
          </p>
          {chargers.filter(c => c.assigned === false).length === 0 && (
            <button
              onClick={onNavigateToAddCharger}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-4 h-4" />
              Create New Charger
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table View with Colors */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Select</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      Charger ID
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-gray-400" />
                      Name
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      Serial
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <Plug className="w-3.5 h-3.5 text-gray-400" />
                      Type
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-gray-400" />
                      Status
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-gray-400" />
                      Power
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredChargers.map((charger) => {
                  const chargerId = charger.id || charger.charger_id;
                  const isSelected = selectedChargers.includes(chargerId);
                  
                  return (
                    <tr 
                      key={chargerId}
                      onClick={() => toggleChargerSelection(charger)}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                        isSelected ? 'bg-green-50 hover:bg-green-100' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                          {charger.charger_id || charger.id?.slice(0, 8) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {charger.charger_name || charger.name || 'Unnamed'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {charger.serial_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          charger.charger_type === 'DC' 
                            ? 'bg-purple-100 text-purple-700' 
                            : charger.charger_type === 'AC' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {charger.charger_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                          {getStatusIcon(charger.status)}
                          {charger.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-700">
                          {charger.max_power_kw || 0} kW
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {chargerPagination.has_more && filteredChargers.length > 0 && (
            <div className="text-center pt-2">
              <button
                onClick={loadMoreChargers}
                disabled={loadingMoreChargers}
                className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {loadingMoreChargers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Chargers'
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              {filteredChargers.length} unassigned charger(s) available
            </p>
            <p className="text-xs text-gray-400">
              Selected: <span className="font-semibold text-green-600">{selectedChargers.length}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
});

const AddHub = () => {
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
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    state: '', // Hidden state field for backend
    open_24_hours: false,
    load_type: 'KVA',
    sanction_load: ''
  });
  
  // Getting address state
  const [gettingAddress, setGettingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  
  // Chargers state
  const [chargers, setChargers] = useState([]);
  const [chargersLoading, setChargersLoading] = useState(false);
  const [selectedChargers, setSelectedChargers] = useState([]);
  const [chargerSearchTerm, setChargerSearchTerm] = useState('');
  const [chargerPagination, setChargerPagination] = useState({
    before: null,
    before_id: null,
    limit: 50,
    has_more: false,
    total: 0
  });
  const [loadingMoreChargers, setLoadingMoreChargers] = useState(false);
  
  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchChargers();
  }, [isAuthenticated, navigate]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchChargers = async (before = null, before_id = null) => {
    setChargersLoading(true);
    
    try {
      let url = `${API_CONFIG.CHARGERS_API}?limit=${chargerPagination.limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      if (before_id) {
        url += `&before_id=${before_id}`;
      }

      console.log('Fetching chargers URL:', url);

      const response = await authenticatedRequest(url, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Chargers response:', data);

      if (response.ok) {
        let chargersData = data.data || data.chargers || data || [];
        chargersData = chargersData.filter(charger => charger.assigned === false);
        
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        const total = data.total || chargersData.length;

        setChargers(prev => before ? [...prev, ...chargersData] : chargersData);
        setChargerPagination({
          before: nextBefore,
          before_id: nextBeforeId,
          has_more: hasMore,
          total: total,
          limit: chargerPagination.limit
        });
      } else {
        console.error('Failed to fetch chargers:', data);
      }
    } catch (error) {
      console.error('Error fetching chargers:', error);
    } finally {
      setChargersLoading(false);
      setLoadingMoreChargers(false);
    }
  };

  const loadMoreChargers = () => {
    if (chargerPagination.has_more && !loadingMoreChargers) {
      setLoadingMoreChargers(true);
      fetchChargers(chargerPagination.before, chargerPagination.before_id);
    }
  };

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleGetAddress = useCallback(async () => {
    if (!formData.latitude || !formData.longitude) {
      setAddressError('Please enter both latitude and longitude');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setAddressError('Please enter valid numbers for latitude and longitude');
      return;
    }

    setGettingAddress(true);
    setAddressError('');

    try {
      const result = await getAddressFromCoordinates(lat, lng);
      
      if (result.display_name) {
        setFormData(prev => ({ 
          ...prev, 
          address: result.display_name,
          state: result.state // Set the state from reverse geocoding
        }));
        setAddressError('');
        console.log('Extracted state:', result.state);
      } else {
        setAddressError('Could not fetch address for these coordinates');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setAddressError('Failed to get address. Please try again.');
    } finally {
      setGettingAddress(false);
    }
  }, [formData.latitude, formData.longitude]);

  const toggleChargerSelection = useCallback((charger) => {
    const chargerId = charger.id || charger.charger_id;
    setSelectedChargers(prev => {
      if (prev.includes(chargerId)) {
        return prev.filter(id => id !== chargerId);
      } else {
        return [...prev, chargerId];
      }
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    // Validate required fields
    if (!formData.name.trim()) {
      setSubmitError('Hub name is required');
      setSubmitting(false);
      return;
    }

    if (!formData.address.trim()) {
      setSubmitError('Address is required');
      setSubmitting(false);
      return;
    }

    if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
      setSubmitError('Valid latitude is required');
      setSubmitting(false);
      return;
    }

    if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
      setSubmitError('Valid longitude is required');
      setSubmitting(false);
      return;
    }

    // Build payload
    const payload = {
      name: formData.name,
      address: formData.address,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      open_24_hours: formData.open_24_hours,
      state: formData.state || '' // Include state in payload
    };

    if (formData.sanction_load && !isNaN(parseFloat(formData.sanction_load))) {
      payload.sanction_load = parseFloat(formData.sanction_load);
    }

    if (selectedChargers.length > 0) {
      payload.charger_ids = selectedChargers;
    }

    console.log('Creating hub with payload:', payload);

    try {
      const response = await authenticatedRequest(API_CONFIG.HUBS_API, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Create hub response:', data);

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/manage-hubs');
        }, 2000);
      } else {
        setSubmitError(data.message || data.error?.message || 'Failed to create hub');
      }
    } catch (error) {
      console.error('Error creating hub:', error);
      setSubmitError(error.message || 'An error occurred while creating hub');
    } finally {
      setSubmitting(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'PREPARING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CHARGING': 'bg-blue-100 text-blue-800 border-blue-200',
      'SUSPENDED_EV': 'bg-orange-100 text-orange-800 border-orange-200',
      'SUSPENDED_EVSE': 'bg-orange-100 text-orange-800 border-orange-200',
      'FINISHING': 'bg-purple-100 text-purple-800 border-purple-200',
      'RESERVED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'UNAVAILABLE': 'bg-red-100 text-red-800 border-red-200',
      'FAULTED': 'bg-red-100 text-red-800 border-red-200',
      'OFFLINE': 'bg-gray-100 text-gray-800 border-gray-200',
      'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
      'UNDER_MAINTENANCE': 'bg-orange-100 text-orange-800 border-orange-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'AVAILABLE':
      case 'ACTIVE':
        return <CheckCircle className="w-3 h-3" />;
      case 'CHARGING':
        return <Zap className="w-3 h-3" />;
      case 'OFFLINE':
        return <Wifi className="w-3 h-3" />;
      case 'FAULTED':
      case 'UNAVAILABLE':
        return <AlertCircle className="w-3 h-3" />;
      case 'UNDER_MAINTENANCE':
        return <Wrench className="w-3 h-3" />;
      case 'PREPARING':
        return <ClockIcon className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
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
  if (isRefreshing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
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
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/manage-hubs')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back</span>
              </button>
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

        {/* Main Content - Single Card with Two Columns */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-xl">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Setup your Hub</h2>
                    <p className="text-sm text-gray-500">Fill in the details to create a new hub</p>
                  </div>
                </div>
              </div>

              {/* Steps Progress with Border Line */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  {/* Step 1 - Basic Details */}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep === 1 
                        ? 'bg-green-600 text-white ring-4 ring-green-100' 
                        : currentStep > 1 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                    </div>
                    <span className={`text-sm font-medium ${
                      currentStep === 1 ? 'text-green-600' : 
                      currentStep > 1 ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      Basic Details
                    </span>
                  </div>

                  {/* Connecting Line */}
                  <div className={`flex-1 h-0.5 max-w-24 transition-all duration-500 ${
                    currentStep === 2 ? 'bg-green-500' : 
                    currentStep > 1 ? 'bg-green-300' : 'bg-gray-200'
                  }`} />

                  {/* Step 2 - Select Chargers */}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep === 2 
                        ? 'bg-green-600 text-white ring-4 ring-green-100' 
                        : currentStep > 2 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                    </div>
                    <span className={`text-sm font-medium ${
                      currentStep === 2 ? 'text-green-600' : 
                      currentStep > 2 ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      Select Chargers
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="flex flex-col md:flex-row">
                {/* Left Column - Steps Indicator */}
                <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-200">
                  <div className="sticky top-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Setup Steps</h3>
                    <div className="space-y-6">
                      {/* Step 1 Indicator */}
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${
                          currentStep === 1 
                            ? 'bg-green-600 text-white' 
                            : currentStep > 1 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            currentStep === 1 ? 'text-green-600' : 
                            currentStep > 1 ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            Basic Details
                          </p>
                          <p className="text-xs text-gray-400">Name, location & capacity</p>
                        </div>
                      </div>

                      {/* Step 2 Indicator */}
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${
                          currentStep === 2 
                            ? 'bg-green-600 text-white' 
                            : currentStep > 2 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            currentStep === 2 ? 'text-green-600' : 
                            currentStep > 2 ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            Select Chargers
                          </p>
                          <p className="text-xs text-gray-400">View and select unassigned chargers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Form Content */}
                <div className="flex-1 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentStep === 1 ? 'Basic Details' : 'Select Unassigned Chargers'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentStep === 1 
                        ? 'Enter the basic details of your hub' 
                        : 'Select unassigned chargers to associate with this hub (optional)'}
                    </p>
                  </div>

                  {currentStep === 1 ? (
                    <BasicDetailsStep 
                      formData={formData}
                      handleFormChange={handleFormChange}
                      handleGetAddress={handleGetAddress}
                      gettingAddress={gettingAddress}
                      addressError={addressError}
                    />
                  ) : (
                    <SelectChargersStep 
                      chargers={chargers}
                      chargersLoading={chargersLoading}
                      selectedChargers={selectedChargers}
                      chargerSearchTerm={chargerSearchTerm}
                      setChargerSearchTerm={setChargerSearchTerm}
                      chargerPagination={chargerPagination}
                      loadMoreChargers={loadMoreChargers}
                      loadingMoreChargers={loadingMoreChargers}
                      toggleChargerSelection={toggleChargerSelection}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      onNavigateToAddCharger={() => navigate('/add-charger')}
                    />
                  )}

                  {/* Navigation Buttons - Bottom Right */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                    {currentStep > 1 && (
                      <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                      >
                        Previous
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (currentStep === 1) {
                          if (!formData.name.trim()) {
                            setSubmitError('Hub name is required');
                            return;
                          }
                          if (!formData.address.trim()) {
                            setSubmitError('Address is required');
                            return;
                          }
                          if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
                            setSubmitError('Valid latitude is required');
                            return;
                          }
                          if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
                            setSubmitError('Valid longitude is required');
                            return;
                          }
                          setSubmitError('');
                          setCurrentStep(2);
                        } else if (currentStep === 2) {
                          handleSubmit();
                        }
                      }}
                      disabled={submitting || isRefreshing}
                      className={`px-8 py-2.5 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
                        submitting || isRefreshing
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          {currentStep === 2 ? 'Create Hub' : 'Next'}
                          {currentStep !== 2 && <ArrowRight size={16} />}
                        </>
                      )}
                    </button>
                  </div>

                  {submitError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
                      <CheckCircle size={16} />
                      Hub created successfully! Redirecting...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHub;
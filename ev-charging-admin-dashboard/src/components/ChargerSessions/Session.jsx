// import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../Authentication/AuthContext';
// import {
//   Settings,
//   Plus,
//   ChevronDown,
//   User,
//   Building,
//   LogOut,
//   Search,
//   Filter,
//   Activity,
//   Clock,
//   Calendar,
//   MapPin,
//   Globe,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   X,
//   ArrowLeft,
//   RefreshCw,
//   Download,
//   Zap,
//   Plug,
//   Wifi,
//   WifiOff,
//   Loader2,
//   ChevronLeft,
//   ChevronRight,
//   Eye,
//   MoreVertical,
//   FileText,
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   Battery,
//   Smartphone,
//   Monitor,
//   Server,
//   Circle,
//   CircleDot,
//   CircleCheck,
//   CircleX,
//   Grid,
//   List,
//   Info,
//   Link,
//   ExternalLink,
//   Database,
//   IndianRupee,
//   CalendarDays,
//   Timer,
//   Layers,
//   Receipt,
//   BarChart,
//   PieChart,
//   User as UserIcon,
//   Award,
//   Star,
//   Crown,
//   Wallet,
//   CreditCard,
//   Cloud,
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
//   CloudMultiverse,
//   ToggleLeft,
//   ToggleRight,
//   Sliders,
//   Settings as SettingsIcon,
//   LineChart,
//   TrendingUp as TrendingUpIcon,
//   Award as AwardIcon,
//   Star as StarIcon,
//   Crown as CrownIcon,
//   RadioTower,
//   History
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   SESSIONS_API: `${API_BASE_URL}/api/v1/cpo/charging-sessions`,
//   SESSION_DETAIL_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}`,
//   STREAM_API: `${API_BASE_URL}/api/v1/cpo/operations/realtime/stream`,
//   FLEET_API: `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
// };

// // Status color mapping
// const getStatusColor = (status) => {
//   const colors = {
//     'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
//     'START_PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
//     'CHARGING': 'bg-blue-100 text-blue-700 border-blue-200',
//     'STOP_PENDING': 'bg-orange-100 text-orange-700 border-orange-200',
//     'STOPPED': 'bg-gray-100 text-gray-700 border-gray-200',
//     'FAILED': 'bg-red-100 text-red-700 border-red-200',
//     'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-200',
//     'Ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
//     'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
//     'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
//     'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
//     'Started': 'bg-emerald-100 text-emerald-700 border-emerald-200',
//     'ACTIVE': 'bg-blue-100 text-blue-700 border-blue-200',
//     'active': 'bg-blue-100 text-blue-700 border-blue-200'
//   };
//   return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
// };

// const getStatusIcon = (status) => {
//   const statusUpper = status?.toUpperCase() || '';
//   switch(statusUpper) {
//     case 'COMPLETED':
//       return <CheckCircle className="w-3 h-3" />;
//     case 'START_PENDING':
//       return <Clock className="w-3 h-3" />;
//     case 'CHARGING':
//       return <Activity className="w-3 h-3" />;
//     case 'STOP_PENDING':
//       return <AlertCircle className="w-3 h-3" />;
//     case 'STOPPED':
//     case 'FAILED':
//       return <CircleX className="w-3 h-3" />;
//     default:
//       return <Circle className="w-3 h-3" />;
//   }
// };

// const getStatusDisplayName = (status) => {
//   const statusMap = {
//     'START_PENDING': 'Start Pending',
//     'CHARGING': 'Charging',
//     'STOP_PENDING': 'Stop Pending',
//     'STOPPED': 'Stopped',
//     'COMPLETED': 'Completed',
//     'FAILED': 'Failed',
//     'CANCELLED': 'Cancelled',
//     'Ongoing': 'Ongoing',
//     'In Progress': 'In Progress',
//     'ACTIVE': 'Active',
//     'active': 'Active'
//   };
//   return statusMap[status] || status || 'Unknown';
// };

// // Helper function to check if a session is ongoing - MORE COMPREHENSIVE
// const isOngoingStatus = (status) => {
//   if (!status) return false;
  
//   // Convert to string and uppercase for comparison
//   const statusStr = String(status).toUpperCase().trim();
  
//   // List of ongoing statuses - expanded
//   const ongoingStatuses = [
//     'ONGOING', 
//     'CHARGING', 
//     'IN PROGRESS', 
//     'START_PENDING', 
//     'STARTED', 
//     'ACTIVE',
//     'START',
//     'PROCESSING',
//     'RUNNING',
//     'INPROGRESS',
//     'IN_PROGRESS'
//   ];
  
//   // Check if status exactly matches any ongoing status
//   if (ongoingStatuses.includes(statusStr)) {
//     return true;
//   }
  
//   // Check if status contains keywords
//   const keywords = ['START', 'CHARG', 'ACTIVE', 'ONGOING', 'PROGRESS', 'RUNNING'];
//   for (const keyword of keywords) {
//     if (statusStr.includes(keyword)) {
//       return true;
//     }
//   }
  
//   return false;
// };

// const Sessions = () => {
//   const navigate = useNavigate();
//   const { 
//     authenticatedRequest, 
//     logout, 
//     isRefreshing,
//     isAuthenticated,
//     user,
//     refreshToken
//   } = useAuth();
  
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [showFilterPopup, setShowFilterPopup] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   // Tab state
//   const [activeMainTab, setActiveMainTab] = useState('sessions');
//   const [activeTab, setActiveTab] = useState('all');
  
//   // Sessions state
//   const [allSessions, setAllSessions] = useState([]);
//   const [ongoingSessions, setOngoingSessions] = useState([]);
//   const [liveOngoingSessions, setLiveOngoingSessions] = useState([]);
  
//   // Pagination state
//   const [pagination, setPagination] = useState({
//     limit: 20,
//     has_more: false,
//     next_before: null,
//     next_before_id: null
//   });
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasLoaded, setHasLoaded] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
  
//   // Filter states
//   const [statusFilter, setStatusFilter] = useState('All');
  
//   // Modal state
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [loadingDetail, setLoadingDetail] = useState(false);
  
//   // SSE Stream state
//   const [isStreaming, setIsStreaming] = useState(false);
//   const eventSourceRef = useRef(null);
//   const [showLiveIndicator, setShowLiveIndicator] = useState(false);
//   const streamRetryTimeoutRef = useRef(null);
//   const [liveEvents, setLiveEvents] = useState([]);
//   const liveSessionMapRef = useRef({});
  
//   // Refs to prevent unnecessary updates
//   const isMountedRef = useRef(true);
//   const fetchInProgressRef = useRef(false);
//   const streamInitializedRef = useRef(false);

//   // Initial fetch - only once
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/signin');
//       return;
//     }
    
//     isMountedRef.current = true;
    
//     const init = async () => {
//       await fetchUserInfo();
//       await fetchSessions();
//       if (!streamInitializedRef.current) {
//         startSSEStream();
//         streamInitializedRef.current = true;
//       }
//     };
    
//     init();
    
//     return () => {
//       isMountedRef.current = false;
//       stopSSEStream();
//     };
//   }, [isAuthenticated, navigate]);

//   // Update live session map without causing re-renders
//   useEffect(() => {
//     const map = {};
//     liveEvents.forEach(event => {
//       const sessionId = event.transaction_id || event.session_id || event.id;
//       if (sessionId) {
//         map[sessionId] = event;
//       }
//     });
//     liveSessionMapRef.current = map;

//     // Update ongoing sessions from live events
//     const ongoingFromLive = liveEvents.filter(event => {
//       const status = event.status || event.new_status || event.state || '';
//       return isOngoingStatus(status);
//     });
    
//     console.log('🔄 Live ongoing sessions:', ongoingFromLive.length, ongoingFromLive);
//     setLiveOngoingSessions(ongoingFromLive);
//   }, [liveEvents]);

//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
//         method: 'GET'
//       });
//       if (response.ok && isMountedRef.current) {
//         const data = await response.json();
//         setUserData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     }
//   };

//   // SSE Stream for live ongoing sessions
//   const startSSEStream = () => {
//     try {
//       if (eventSourceRef.current) {
//         eventSourceRef.current.abort?.();
//         eventSourceRef.current = null;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.warn('No token found for SSE stream');
//         return;
//       }

//       const url = `${API_CONFIG.STREAM_API}?cpo_app_id=${CPO_APP_ID}`;

//       const controller = new AbortController();
//       eventSourceRef.current = controller;

//       fetch(url, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'X-CPO-App-ID': CPO_APP_ID,
//           'Accept': 'text/event-stream',
//           'Cache-Control': 'no-cache'
//         },
//         signal: controller.signal
//       })
//       .then(response => {
//         if (!response.ok) {
//           if (response.status === 401) {
//             console.error('❌ SSE Stream 401 Unauthorized');
//             setIsStreaming(false);
//             setShowLiveIndicator(false);
//             refreshToken().then(newToken => {
//               if (newToken && isMountedRef.current) {
//                 setTimeout(startSSEStream, 10000);
//               }
//             });
//             return;
//           }
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         console.log('📡 SSE Stream connected');
//         if (isMountedRef.current) {
//           setIsStreaming(true);
//           setShowLiveIndicator(true);
//         }

//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';

//         const readStream = () => {
//           if (!isMountedRef.current) return;
          
//           reader.read().then(({ done, value }) => {
//             if (done || !isMountedRef.current) {
//               console.log('📡 SSE Stream ended');
//               if (isMountedRef.current) {
//                 setIsStreaming(false);
//                 setShowLiveIndicator(false);
//               }
//               if (!streamRetryTimeoutRef.current && isMountedRef.current) {
//                 streamRetryTimeoutRef.current = setTimeout(() => {
//                   streamRetryTimeoutRef.current = null;
//                   if (isMountedRef.current && (!eventSourceRef.current || eventSourceRef.current.signal.aborted)) {
//                     startSSEStream();
//                   }
//                 }, 10000);
//               }
//               return;
//             }

//             const chunk = decoder.decode(value, { stream: true });
//             buffer += chunk;
            
//             const events = buffer.split('\n\n');
//             buffer = events.pop() || '';

//             for (const event of events) {
//               if (event.trim() && isMountedRef.current) {
//                 processSSEEvent(event);
//               }
//             }

//             if (isMountedRef.current) {
//               readStream();
//             }
//           }).catch(error => {
//             if (error.name === 'AbortError') {
//               console.log('📡 SSE Stream aborted');
//             } else {
//               console.error('📡 SSE Stream error:', error);
//               if (isMountedRef.current) {
//                 setIsStreaming(false);
//                 setShowLiveIndicator(false);
//               }
//             }
//           });
//         };

//         readStream();
//       })
//       .catch(error => {
//         if (error.name === 'AbortError') {
//           console.log('📡 SSE Stream aborted');
//         } else {
//           console.error('📡 SSE Stream fetch error:', error);
//           if (isMountedRef.current) {
//             setIsStreaming(false);
//             setShowLiveIndicator(false);
//           }
//         }
//       });

//     } catch (error) {
//       console.error('Error starting SSE stream:', error);
//       if (isMountedRef.current) {
//         setIsStreaming(false);
//         setShowLiveIndicator(false);
//       }
//     }
//   };

//   const processSSEEvent = (eventText) => {
//     try {
//       const lines = eventText.split('\n');
//       let eventData = '';
      
//       for (const line of lines) {
//         if (line.startsWith('data:')) {
//           eventData += line.substring(5).trim();
//         }
//       }

//       if (eventData) {
//         try {
//           const data = JSON.parse(eventData);
//           console.log('📨 SSE Event received:', data);
          
//           setLiveEvents(prev => {
//             const sessionId = data.transaction_id || data.session_id || data.id;
//             const existingIndex = prev.findIndex(e => {
//               const eId = e.transaction_id || e.session_id || e.id;
//               return eId === sessionId;
//             });
            
//             if (existingIndex >= 0) {
//               const updated = [...prev];
//               updated[existingIndex] = { ...updated[existingIndex], ...data, received_at: new Date().toISOString() };
//               return updated;
//             } else {
//               return [{ ...data, received_at: new Date().toISOString() }, ...prev];
//             }
//           });
//         } catch (parseError) {
//           console.warn('SSE parse error:', parseError);
//         }
//       }
//     } catch (error) {
//       console.warn('SSE processing error:', error);
//     }
//   };

//   const stopSSEStream = () => {
//     if (eventSourceRef.current) {
//       eventSourceRef.current.abort?.();
//       eventSourceRef.current = null;
//     }
//     if (streamRetryTimeoutRef.current) {
//       clearTimeout(streamRetryTimeoutRef.current);
//       streamRetryTimeoutRef.current = null;
//     }
//     setIsStreaming(false);
//     setShowLiveIndicator(false);
//   };

//   // Fetch sessions with pagination - CPO endpoint
//   const fetchSessions = useCallback(async (before = null, beforeId = null, isLoadMore = false) => {
//     if (fetchInProgressRef.current) return;
//     if (isLoadMore && loadingMore) return;
    
//     fetchInProgressRef.current = true;
    
//     if (!isLoadMore) {
//       setLoading(true);
//     } else {
//       setLoadingMore(true);
//     }
//     setError('');
    
//     try {
//       const token = localStorage.getItem('token');
//       let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
      
//       if (before) url += `&next_before=${encodeURIComponent(before)}`;
//       if (beforeId) url += `&next_before_id=${encodeURIComponent(beforeId)}`;
      
//       // Add status filter if not 'All'
//       if (statusFilter !== 'All') url += `&status=${statusFilter}`;

//       console.log('📤 Fetching CPO sessions:', url);
      
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'X-CPO-App-ID': CPO_APP_ID,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });

//       if (!isMountedRef.current) {
//         fetchInProgressRef.current = false;
//         return;
//       }

//       if (response.ok) {
//         const data = await response.json();
//         console.log('📥 CPO Sessions response:', data);
        
//         let sessionsArray = data.sessions || data.data || [];
//         if (!Array.isArray(sessionsArray)) sessionsArray = [];

//         const transformedSessions = sessionsArray.map((session) => ({
//           id: session.id,
//           transaction_id: session.transaction_id || 'N/A',
//           customer_name: session.customer?.name || 'N/A',
//           customer_email: session.customer?.email || 'N/A',
//           charger_name: session.charger?.name || 'N/A',
//           hub_name: session.charger?.hub_name || 'N/A',
//           connector_number: session.connector?.number || 'N/A',
//           start_time: session.start_time,
//           end_time: session.end_time,
//           total_kwh: session.total_kwh || '0',
//           total_amount: session.total_amount || '0',
//           currency: session.currency || 'INR',
//           status: session.status || 'UNKNOWN',
//           stop_reason: session.stop_reason || 'N/A',
//           created_at: session.created_at || session.start_time,
//           ...session
//         }));

//         console.log('📊 Transformed sessions:', transformedSessions.length);
//         console.log('📊 Session statuses:', transformedSessions.map(s => s.status));

//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;

//         if (isLoadMore) {
//           setAllSessions(prev => [...prev, ...transformedSessions]);
//         } else {
//           setAllSessions(transformedSessions);
//         }
        
//         // FIX: Update ongoing sessions from API with better filtering
//         const ongoing = transformedSessions.filter(s => isOngoingStatus(s.status));
//         console.log('🔄 Ongoing sessions from API:', ongoing.length, ongoing.map(s => ({ id: s.id, status: s.status })));
        
//         if (isLoadMore) {
//           setOngoingSessions(prev => [...prev, ...ongoing]);
//         } else {
//           setOngoingSessions(ongoing);
//         }

//         setPagination({
//           limit: pagination.limit,
//           has_more: hasMore,
//           next_before: nextBefore,
//           next_before_id: nextBeforeId
//         });
        
//         setHasLoaded(true);
//         setIsInitialLoad(false);
//       } else if (response.status === 401) {
//         console.error('❌ 401 Unauthorized - Token expired');
//         setError('Session expired. Please refresh.');
//         const newToken = await refreshToken();
//         if (newToken && isMountedRef.current) {
//           fetchSessions(before, beforeId, isLoadMore);
//           return;
//         }
//         if (!isLoadMore && isMountedRef.current) {
//           setAllSessions([]);
//           setOngoingSessions([]);
//         }
//         setPagination({ limit: 20, has_more: false, next_before: null, next_before_id: null });
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('❌ Failed to fetch sessions:', response.status, errorData);
//         if (!isLoadMore && isMountedRef.current) {
//           setAllSessions([]);
//           setOngoingSessions([]);
//         }
//         setPagination({ limit: 20, has_more: false, next_before: null, next_before_id: null });
//       }
//     } catch (error) {
//       console.error('❌ Error fetching sessions:', error);
//       if (!isLoadMore && isMountedRef.current) {
//         setAllSessions([]);
//         setOngoingSessions([]);
//       }
//       setPagination({ limit: 20, has_more: false, next_before: null, next_before_id: null });
//     } finally {
//       fetchInProgressRef.current = false;
//       if (isMountedRef.current) {
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     }
//   }, [pagination.limit, refreshToken, statusFilter]);

//   // Fetch single session detail - CPO endpoint
//   const fetchSessionDetail = useCallback(async (sessionId) => {
//     if (!sessionId) return;
    
//     setLoadingDetail(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('token');
//       const url = API_CONFIG.SESSION_DETAIL_API(sessionId);
      
//       console.log('📤 Fetching session detail from CPO:', url);
      
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'X-CPO-App-ID': CPO_APP_ID,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });

//       if (!isMountedRef.current) return;

//       if (response.ok) {
//         const data = await response.json();
//         console.log('📥 Session detail response:', data);
//         const session = data.session || data.data || data;
        
//         // Enrich with live data if available
//         const liveData = liveSessionMapRef.current[session.transaction_id] || liveSessionMapRef.current[session.id];
//         if (liveData) {
//           session.live_data = liveData;
//           session.is_live = true;
//         }
        
//         setSelectedSession(session);
//         setShowDetailModal(true);
//       } else if (response.status === 401) {
//         setError('Session expired. Please refresh.');
//         const newToken = await refreshToken();
//         if (newToken && isMountedRef.current) {
//           const retryResponse = await fetch(url, {
//             method: 'GET',
//             headers: {
//               'Authorization': `Bearer ${newToken}`,
//               'X-CPO-App-ID': CPO_APP_ID,
//               'Content-Type': 'application/json',
//               'Accept': 'application/json'
//             }
//           });
//           if (retryResponse.ok && isMountedRef.current) {
//             const data = await retryResponse.json();
//             const session = data.session || data.data || data;
//             setSelectedSession(session);
//             setShowDetailModal(true);
//           }
//         }
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         setError(errorData.message || 'Failed to fetch session details');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching session detail:', error);
//       if (isMountedRef.current) {
//         setError('An error occurred while fetching session details');
//       }
//     } finally {
//       if (isMountedRef.current) {
//         setLoadingDetail(false);
//       }
//     }
//   }, [refreshToken]);

//   const loadMoreSessions = () => {
//     if (pagination.has_more && !loadingMore && !loading && !fetchInProgressRef.current) {
//       fetchSessions(pagination.next_before, pagination.next_before_id, true);
//     }
//   };

//   const handleSessionClick = (sessionId) => {
//     if (sessionId) {
//       fetchSessionDetail(sessionId);
//     }
//   };

//   const closeDetailModal = () => {
//     setShowDetailModal(false);
//     setSelectedSession(null);
//     setError('');
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     // Refresh ongoing sessions when switching to ongoing tab
//     if (tab === 'ongoing') {
//       // Force refresh of ongoing sessions from API
//       fetchSessions();
//     }
//   };

//   const handleMainTabChange = (tab) => {
//     setActiveMainTab(tab);
//     if (tab === 'chargers') {
//       navigate('/charger-session');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       stopSSEStream();
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//       localStorage.removeItem('token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token_expiry');
//       navigate('/signin');
//     }
//   };

//   const handleThemeToggle = () => setIsDarkMode(!isDarkMode);
  
//   const handleRefresh = () => {
//     if (!fetchInProgressRef.current) {
//       setAllSessions([]);
//       setOngoingSessions([]);
//       setLiveEvents([]);
//       setLiveOngoingSessions([]);
//       liveSessionMapRef.current = {};
//       fetchSessions();
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'N/A';
//     return date.toLocaleString('en-US', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const calculateDuration = (startTime, endTime) => {
//     if (!startTime) return 'N/A';
//     const start = new Date(startTime);
//     const end = endTime ? new Date(endTime) : new Date();
//     if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
//     const diffMs = end - start;
//     const diffMins = Math.floor(diffMs / 60000);
//     if (diffMins < 1) return '< 1 min';
//     if (diffMins < 60) return `${diffMins} min`;
//     const hours = Math.floor(diffMins / 60);
//     const mins = diffMins % 60;
//     return `${hours}h ${mins}m`;
//   };

//   const truncateId = (id) => {
//     if (!id) return 'N/A';
//     const strId = String(id);
//     if (strId.length > 12) {
//       return strId.substring(0, 12) + '...';
//     }
//     return strId;
//   };

//   const formatCurrency = (amount, currency = 'INR') => {
//     if (!amount || amount === '0' || amount === 0) return `${currency} 0`;
//     return `${currency} ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   };

//   // Get current sessions based on active tab - memoized
//   const currentSessions = useMemo(() => {
//     if (activeTab === 'all') {
//       return allSessions;
//     } else {
//       // Start with API ongoing sessions
//       const combined = [...ongoingSessions];
      
//       // Add live sessions that aren't already in the combined list
//       liveOngoingSessions.forEach(liveSession => {
//         const sessionId = liveSession.transaction_id || liveSession.session_id || liveSession.id;
//         const exists = combined.some(s => {
//           const sId = s.transaction_id || s.id;
//           return String(sId) === String(sessionId);
//         });
//         if (!exists) {
//           combined.push({
//             id: sessionId,
//             transaction_id: sessionId,
//             customer_name: liveSession.customer_name || liveSession.customer?.name || 'N/A',
//             charger_name: liveSession.charger_name || liveSession.charger?.name || `Charger ${liveSession.charger_id || 'N/A'}`,
//             hub_name: liveSession.hub_name || liveSession.hub?.name || 'N/A',
//             start_time: liveSession.start_time || liveSession.started_at || new Date().toISOString(),
//             status: liveSession.status || liveSession.new_status || liveSession.state || 'Ongoing',
//             total_kwh: liveSession.total_kwh || liveSession.energy || '0',
//             total_amount: liveSession.total_amount || '0',
//             currency: liveSession.currency || 'INR',
//             duration: liveSession.duration_minutes || 0,
//             is_live: true,
//             ...liveSession
//           });
//         }
//       });
      
//       console.log('📊 Combined ongoing sessions:', combined.length, combined.map(s => ({ id: s.id, status: s.status, is_live: s.is_live })));
//       return combined;
//     }
//   }, [activeTab, allSessions, ongoingSessions, liveOngoingSessions]);

//   // Filter sessions based on search - memoized
//   const filteredSessions = useMemo(() => {
//     if (!searchQuery) return currentSessions;
//     const query = searchQuery.toLowerCase();
//     return currentSessions.filter(session => {
//       const idStr = String(session.id || '');
//       const transactionIdStr = String(session.transaction_id || '');
//       const chargerNameStr = String(session.charger_name || '');
//       const hubNameStr = String(session.hub_name || '');
//       const customerNameStr = String(session.customer_name || '');
      
//       return (
//         idStr.toLowerCase().includes(query) ||
//         transactionIdStr.toLowerCase().includes(query) ||
//         chargerNameStr.toLowerCase().includes(query) ||
//         hubNameStr.toLowerCase().includes(query) ||
//         customerNameStr.toLowerCase().includes(query)
//       );
//     });
//   }, [currentSessions, searchQuery]);

//   // Stats - memoized
//   const totalSessions = allSessions.length;
//   const ongoingCount = useMemo(() => {
//     // Count ongoing sessions from combined list
//     const count = currentSessions.filter(s => isOngoingStatus(s.status)).length;
//     console.log('📊 Ongoing count:', count);
//     return count;
//   }, [currentSessions]);

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

//   // Filter Popup
//   const FilterPopup = () => (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//             <Filter size={18} className="text-blue-600" />
//             Filters
//           </h3>
//           <button onClick={() => setShowFilterPopup(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
//             <X size={18} />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             >
//               <option value="All">All Status</option>
//               <option value="COMPLETED">Completed</option>
//               <option value="CHARGING">Charging</option>
//               <option value="START_PENDING">Start Pending</option>
//               <option value="STOP_PENDING">Stop Pending</option>
//               <option value="STOPPED">Stopped</option>
//               <option value="FAILED">Failed</option>
//               <option value="CANCELLED">Cancelled</option>
//             </select>
//           </div>

//           <div className="flex gap-3 pt-2">
//             <button
//               onClick={() => {
//                 setShowFilterPopup(false);
//                 fetchSessions();
//               }}
//               className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//             >
//               Apply Filters
//             </button>
//             <button
//               onClick={() => {
//                 setStatusFilter('All');
//                 setSearchQuery('');
//                 fetchSessions();
//               }}
//               className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
//             >
//               Clear All
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Session Detail Modal
//   const SessionDetailModal = () => {
//     if (!selectedSession) return null;

//     const duration = calculateDuration(
//       selectedSession.start_time,
//       selectedSession.end_time || selectedSession.live_data?.end_time
//     );

//     const isLive = selectedSession.is_live || selectedSession.live_data;

//     return (
//       <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
//         <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
//           <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
//                 <Activity className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-bold text-white">Session Details</h3>
//                 <p className="text-sm text-white/80">
//                   ID: {truncateId(selectedSession.id)}
//                   {isLive && (
//                     <span className="ml-2 text-green-300 items-center inline-flex gap-1">
//                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
//                       Live
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={closeDetailModal}
//               className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//             {loadingDetail ? (
//               <div className="flex items-center justify-center py-20">
//                 <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
//               </div>
//             ) : error ? (
//               <div className="text-center py-12">
//                 <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                 <p className="text-gray-600">{error}</p>
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
//                     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedSession.status)}`}>
//                       {getStatusIcon(selectedSession.status)}
//                       {getStatusDisplayName(selectedSession.status)}
//                     </span>
//                     {isLive && (
//                       <span className="ml-2 text-xs text-green-600">
//                         <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
//                         Live
//                       </span>
//                     )}
//                   </div>
//                   <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
//                     <p className="text-2xl font-bold text-emerald-600 mt-1">
//                       {formatCurrency(selectedSession.total_amount, selectedSession.currency)}
//                     </p>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Energy</p>
//                     <p className="text-2xl font-bold text-purple-600 mt-1">
//                       {selectedSession.total_kwh || 0} kWh
//                     </p>
//                   </div>
//                   <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
//                     <p className="text-2xl font-bold text-amber-600 mt-1">
//                       {duration}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                   <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Session Info</p>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Session ID</span>
//                         <span className="font-mono text-gray-900">{selectedSession.id || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Transaction ID</span>
//                         <span className="font-mono text-gray-900">{selectedSession.transaction_id || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Connector</span>
//                         <span className="text-gray-900">#{selectedSession.connector?.number || selectedSession.connector_number || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Info</p>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Name</span>
//                         <span className="text-gray-900">{selectedSession.customer?.name || selectedSession.customer_name || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Email</span>
//                         <span className="text-gray-900">{selectedSession.customer?.email || selectedSession.customer_email || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Charger Info</p>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Charger</span>
//                         <span className="text-gray-900">{selectedSession.charger?.name || selectedSession.charger_name || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Hub</span>
//                         <span className="text-gray-900">{selectedSession.charger?.hub_name || selectedSession.hub_name || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Timestamps</p>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Start Time</span>
//                         <span className="text-gray-900">{formatDate(selectedSession.start_time)}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">End Time</span>
//                         <span className="text-gray-900">{selectedSession.end_time ? formatDate(selectedSession.end_time) : (isLive ? 'Ongoing' : 'N/A')}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Duration</span>
//                         <span className="text-gray-900 font-medium">{duration}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {selectedSession.stop_reason && selectedSession.stop_reason !== 'N/A' && (
//                   <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200 mb-4">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stop Reason</p>
//                     <p className="text-sm text-gray-700">{selectedSession.stop_reason}</p>
//                   </div>
//                 )}

//                 {selectedSession.live_data && (
//                   <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 mb-4">
//                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
//                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                       Live Data
//                     </p>
//                     <div className="grid grid-cols-2 gap-2 text-sm">
//                       <div>
//                         <span className="text-gray-500">Status:</span>
//                         <span className="ml-2 font-medium text-green-700">{selectedSession.live_data.status || selectedSession.live_data.new_status || 'N/A'}</span>
//                       </div>
//                       {selectedSession.live_data.energy && (
//                         <div>
//                           <span className="text-gray-500">Energy:</span>
//                           <span className="ml-2 font-medium">{selectedSession.live_data.energy} kWh</span>
//                         </div>
//                       )}
//                       {selectedSession.live_data.power && (
//                         <div>
//                           <span className="text-gray-500">Power:</span>
//                           <span className="ml-2 font-medium">{selectedSession.live_data.power} kW</span>
//                         </div>
//                       )}
//                       {selectedSession.live_data.total_cost && (
//                         <div>
//                           <span className="text-gray-500">Cost:</span>
//                           <span className="ml-2 font-medium">{formatCurrency(selectedSession.live_data.total_cost)}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
//                   <button
//                     onClick={closeDetailModal}
//                     className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25"
//                   >
//                     <X size={18} />
//                     Close
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (isRefreshing && loading && isInitialLoad) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex">
//         <Sidebar />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading sessions...</p>
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
//         <header className="bg-white border-b-2 border-gray-100 px-6 py-4 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
//                 <p className="text-sm text-gray-500 flex items-center gap-2">
//                   View all charging sessions
//                   {showLiveIndicator && (
//                     <span className="flex items-center gap-1 text-green-600">
//                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                       <span className="text-xs font-medium">Live</span>
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2 relative">
//               <button
//                 onClick={handleRefresh}
//                 disabled={loading || loadingMore}
//                 className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
//               >
//                 <RefreshCw size={18} className={`text-gray-600 ${(loading || loadingMore) ? 'animate-spin' : ''}`} />
//               </button>

//               <div className="relative">
//                 <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
//                   <Settings size={20} className="text-gray-600" />
//                   <ChevronDown size={16} className="text-gray-400" />
//                 </button>
//                 {showSettingsMenu && <SettingsMenu />}
//               </div>

//               <div className="relative">
//                 <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
            
//           </div>
//         </header>
//         {/* Main Navigation Tabs - Sessions & Chargers */}
//         <div className="flex items-center gap-1 mt-4 border-b border-gray-200 px-6">
//           <button
//             onClick={() => handleMainTabChange('chargers')}
//             className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
//               activeMainTab === 'chargers'
//                 ? 'border-blue-600 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             <Zap size={16} />
//             Chargers
//           </button>
//           <button
//             onClick={() => handleMainTabChange('sessions')}
//             className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
//               activeMainTab === 'sessions'
//                 ? 'border-blue-600 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             <History size={16} />
//             Sessions
//             <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">
//               {totalSessions}
//             </span>
//           </button>
//         </div>

//         {/* Sessions Content */}
//         {activeMainTab === 'sessions' && (
//           <div className="p-6">
//             {/* Stats Card */}
//             <div className="mb-6">
//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition group inline-flex items-center gap-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Database className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Total Sessions</p>
//                   <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Tabs - All / Ongoing */}
//             <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
//               <button
//                 onClick={() => handleTabChange('all')}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
//                   activeTab === 'all'
//                     ? 'bg-white text-gray-900 shadow-sm'
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Grid size={16} />
//                   All Sessions
//                   <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
//                     {allSessions.length}
//                   </span>
//                 </div>
//               </button>
//               <button
//                 onClick={() => handleTabChange('ongoing')}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
//                   activeTab === 'ongoing'
//                     ? 'bg-white text-gray-900 shadow-sm'
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Activity size={16} />
//                   Ongoing
//                   <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
//                     {ongoingCount}
//                   </span>
//                   {showLiveIndicator && (
//                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span>
//                   )}
//                 </div>
//               </button>
//             </div>

//             {/* Search and Filters */}
//             <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
//               <div className="flex items-center gap-2">
//                 {statusFilter !== 'All' && (
//                   <button
//                     onClick={() => {
//                       setStatusFilter('All');
//                       setSearchQuery('');
//                       fetchSessions();
//                     }}
//                     className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center gap-1"
//                   >
//                     <X size={12} />
//                     Clear Filters
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="relative">
//                   <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search sessions..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56 bg-gray-50"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setShowFilterPopup(true)}
//                   className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium text-gray-700"
//                 >
//                   <Filter size={16} className="text-gray-500" />
//                   Filter
//                 </button>
//                 {showFilterPopup && <FilterPopup />}
//               </div>
//             </div>

//             {/* Sessions Table */}
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-gray-50 border-b border-gray-200">
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Session ID</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hub</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Energy</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                       <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading && !hasLoaded && isInitialLoad ? (
//                       <tr>
//                         <td colSpan="11" className="px-3 py-12 text-center">
//                           <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
//                           <p className="text-gray-600">Loading sessions...</p>
//                         </td>
//                       </tr>
//                     ) : error ? (
//                       <tr>
//                         <td colSpan="11" className="px-3 py-12 text-center">
//                           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                           <p className="text-gray-600">{error}</p>
//                           <button
//                             onClick={() => { setError(''); fetchSessions(); }}
//                             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//                           >
//                             Retry
//                           </button>
//                         </td>
//                       </tr>
//                     ) : filteredSessions.length === 0 ? (
//                       <tr>
//                         <td colSpan="11" className="px-3 py-12 text-center">
//                           <Database size={48} className="text-gray-300 mx-auto mb-3" />
//                           <p className="text-gray-500 font-medium">No Sessions Found</p>
//                           <p className="text-sm text-gray-400 mt-1">
//                             {activeTab === 'all' ? 'No charging sessions available.' : 'No ongoing sessions found.'}
//                           </p>
//                           {showLiveIndicator && activeTab === 'ongoing' && (
//                             <p className="text-xs text-green-600 mt-1">
//                               <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
//                               Waiting for live sessions...
//                             </p>
//                           )}
//                           <div className="flex items-center justify-center gap-3 mt-4">
//                             <button
//                               onClick={handleRefresh}
//                               className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
//                             >
//                               <RefreshCw size={16} />
//                               Refresh
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredSessions.map((session, index) => {
//                         const duration = calculateDuration(session.start_time, session.end_time);
//                         const isLive = session.is_live || liveSessionMapRef.current[session.transaction_id] || liveSessionMapRef.current[session.id];
                        
//                         return (
//                           <tr 
//                             key={session.id || session.transaction_id || index} 
//                             className={`border-b border-gray-100 hover:bg-gray-50/50 transition cursor-pointer ${isLive ? 'bg-green-50/30' : ''}`}
//                             onClick={() => handleSessionClick(session.id)}
//                           >
//                             <td className="px-3 py-3 text-sm text-gray-500">{index + 1}</td>
//                             <td className="px-3 py-3 text-sm font-mono text-gray-600">
//                               {truncateId(session.id)}
//                             </td>
//                             <td className="px-3 py-3 text-sm text-gray-700">
//                               {session.customer?.name || session.customer_name || 'N/A'}
//                             </td>
//                             <td className="px-3 py-3 text-sm text-gray-700">
//                               {session.charger?.name || session.charger_name || 'N/A'}
//                             </td>
//                             <td className="px-3 py-3 text-sm text-gray-600">
//                               {session.charger?.hub_name || session.hub_name || 'N/A'}
//                             </td>
//                             <td className="px-3 py-3 text-sm text-gray-600">
//                               {formatDate(session.start_time)}
//                             </td>
//                             <td className="px-3 py-3 text-sm text-gray-700 font-medium">
//                               {duration}
//                             </td>
//                             <td className="px-3 py-3 text-sm text-gray-700">
//                               {session.total_kwh || 0} kWh
//                             </td>
//                             <td className="px-3 py-3 text-sm font-medium text-gray-700">
//                               {formatCurrency(session.total_amount, session.currency)}
//                             </td>
//                             <td className="px-3 py-3 text-sm">
//                               <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
//                                 {getStatusIcon(session.status)}
//                                 {getStatusDisplayName(session.status)}
//                               </span>
//                               {isLive && (
//                                 <span className="ml-1 text-xs text-green-600">
//                                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
//                                   Live
//                                 </span>
//                               )}
//                             </td>
//                             <td className="px-3 py-3 text-sm">
//                               <button
//                                 className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
//                                 title="View Details"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleSessionClick(session.id);
//                                 }}
//                               >
//                                 <Eye size={16} />
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination - Load More */}
//               {pagination.has_more && filteredSessions.length > 0 && activeTab === 'all' && (
//                 <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
//                   <button
//                     onClick={loadMoreSessions}
//                     disabled={loadingMore || loading}
//                     className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
//                   >
//                     {loadingMore ? (
//                       <>
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                         Loading...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw size={16} />
//                         Load More
//                       </>
//                     )}
//                   </button>
//                 </div>
//               )}

//               {/* Footer */}
//               <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
//                 <span>
//                   {filteredSessions.length === 0 
//                     ? 'No sessions available'
//                     : `Showing ${filteredSessions.length} of ${currentSessions.length} sessions`
//                   }
//                 </span>
//                 {pagination.has_more && filteredSessions.length > 0 && activeTab === 'all' && (
//                   <span className="text-blue-600">Load more available</span>
//                 )}
//                 {!pagination.has_more && currentSessions.length > 0 && activeTab === 'all' && (
//                   <span className="text-gray-400">All sessions loaded</span>
//                 )}
//                 {activeTab === 'ongoing' && showLiveIndicator && (
//                   <span className="text-green-600 flex items-center gap-1">
//                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
//                     Live updates
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Chargers Tab Content */}
//         {activeMainTab === 'chargers' && (
//           <div className="p-6">
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
//               <Zap size={64} className="text-blue-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-700">Chargers Management</h3>
//               <p className="text-gray-500 mt-2">Click on the "Chargers" tab to view and manage all charging stations</p>
//               <button
//                 onClick={() => navigate('/chargers')}
//                 className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto"
//               >
//                 <Zap size={18} />
//                 Go to Chargers
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Session Detail Modal */}
//       {showDetailModal && <SessionDetailModal />}

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(20px) scale(0.98); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out forwards;
//         }
//         .animate-slideUp {
//           animation: slideUp 0.3s ease-out forwards;
//         }
//         .animate-pulse {
//           animation: pulse 1.5s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Sessions;

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  Search,
  Filter,
  Activity,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
  RefreshCw,
  Download,
  Zap,
  Plug,
  Wifi,
  WifiOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Battery,
  Smartphone,
  Monitor,
  Server,
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  Grid,
  List,
  Info,
  Link,
  ExternalLink,
  Database,
  IndianRupee,
  CalendarDays,
  Timer,
  Layers,
  Receipt,
  BarChart,
  PieChart,
  User as UserIcon,
  Award,
  Star,
  Crown,
  Wallet,
  CreditCard,
  Cloud,
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
  ToggleLeft,
  ToggleRight,
  Sliders,
  Settings as SettingsIcon,
  LineChart,
  TrendingUp as TrendingUpIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Crown as CrownIcon,
  RadioTower,
  History
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  SESSIONS_API: `${API_BASE_URL}/api/v1/cpo/charging-sessions`,
  SESSION_DETAIL_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}`,
  STREAM_API: `${API_BASE_URL}/api/v1/cpo/operations/realtime/stream`,
  FLEET_API: `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Status color mapping
const getStatusColor = (status) => {
  const colors = {
    'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'START_PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
    'CHARGING': 'bg-blue-100 text-blue-700 border-blue-200',
    'STOP_PENDING': 'bg-orange-100 text-orange-700 border-orange-200',
    'STOPPED': 'bg-gray-100 text-gray-700 border-gray-200',
    'FAILED': 'bg-red-100 text-red-700 border-red-200',
    'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-200',
    'Ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
    'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Started': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'ACTIVE': 'bg-blue-100 text-blue-700 border-blue-200',
    'active': 'bg-blue-100 text-blue-700 border-blue-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status) => {
  const statusUpper = status?.toUpperCase() || '';
  switch(statusUpper) {
    case 'COMPLETED':
      return <CheckCircle className="w-3 h-3" />;
    case 'START_PENDING':
      return <Clock className="w-3 h-3" />;
    case 'CHARGING':
      return <Activity className="w-3 h-3" />;
    case 'STOP_PENDING':
      return <AlertCircle className="w-3 h-3" />;
    case 'STOPPED':
    case 'FAILED':
      return <CircleX className="w-3 h-3" />;
    default:
      return <Circle className="w-3 h-3" />;
  }
};

const getStatusDisplayName = (status) => {
  const statusMap = {
    'START_PENDING': 'Start Pending',
    'CHARGING': 'Charging',
    'STOP_PENDING': 'Stop Pending',
    'STOPPED': 'Stopped',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed',
    'CANCELLED': 'Cancelled',
    'Ongoing': 'Ongoing',
    'In Progress': 'In Progress',
    'ACTIVE': 'Active',
    'active': 'Active'
  };
  return statusMap[status] || status || 'Unknown';
};

// Helper function to check if a session is ongoing - MORE COMPREHENSIVE
const isOngoingStatus = (status) => {
  if (!status) return false;
  
  // Convert to string and uppercase for comparison
  const statusStr = String(status).toUpperCase().trim();
  
  // List of ongoing statuses - expanded
  const ongoingStatuses = [
    'ONGOING', 
    'CHARGING', 
    'IN PROGRESS', 
    'START_PENDING', 
    'STARTED', 
    'ACTIVE',
    'START',
    'PROCESSING',
    'RUNNING',
    'INPROGRESS',
    'IN_PROGRESS'
  ];
  
  // Check if status exactly matches any ongoing status
  if (ongoingStatuses.includes(statusStr)) {
    return true;
  }
  
  // Check if status contains keywords
  const keywords = ['START', 'CHARG', 'ACTIVE', 'ONGOING', 'PROGRESS', 'RUNNING'];
  for (const keyword of keywords) {
    if (statusStr.includes(keyword)) {
      return true;
    }
  }
  
  return false;
};

const Sessions = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user,
    refreshToken
  } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab state
  const [activeMainTab, setActiveMainTab] = useState('sessions');
  const [activeTab, setActiveTab] = useState('all');
  
  // Sessions state
  const [allSessions, setAllSessions] = useState([]);
  const [ongoingSessions, setOngoingSessions] = useState([]);
  const [liveOngoingSessions, setLiveOngoingSessions] = useState([]);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    limit: 20,
    has_more: false,
    next_before: null,
    next_before_id: null
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // SSE Stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef(null);
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);
  const streamRetryTimeoutRef = useRef(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const liveSessionMapRef = useRef({});
  
  // Refs to prevent unnecessary updates
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);
  const streamInitializedRef = useRef(false);

  // Initial fetch - only once
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    isMountedRef.current = true;
    
    const init = async () => {
      await fetchUserInfo();
      await fetchSessions();
      if (!streamInitializedRef.current) {
        startSSEStream();
        streamInitializedRef.current = true;
      }
    };
    
    init();
    
    return () => {
      isMountedRef.current = false;
      stopSSEStream();
    };
  }, [isAuthenticated, navigate]);

  // Update live session map without causing re-renders
  useEffect(() => {
    const map = {};
    liveEvents.forEach(event => {
      const sessionId = event.transaction_id || event.session_id || event.id;
      if (sessionId) {
        map[sessionId] = event;
      }
    });
    liveSessionMapRef.current = map;

    // Update ongoing sessions from live events
    const ongoingFromLive = liveEvents.filter(event => {
      const status = event.status || event.new_status || event.state || '';
      return isOngoingStatus(status);
    });
    
    console.log('🔄 Live ongoing sessions:', ongoingFromLive.length, ongoingFromLive);
    setLiveOngoingSessions(ongoingFromLive);
  }, [liveEvents]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });
      if (response.ok && isMountedRef.current) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // SSE Stream for live ongoing sessions
  const startSSEStream = () => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.abort?.();
        eventSourceRef.current = null;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for SSE stream');
        return;
      }

      const url = `${API_CONFIG.STREAM_API}?cpo_app_id=${CPO_APP_ID}`;

      const controller = new AbortController();
      eventSourceRef.current = controller;

      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            console.error('❌ SSE Stream 401 Unauthorized');
            setIsStreaming(false);
            setShowLiveIndicator(false);
            refreshToken().then(newToken => {
              if (newToken && isMountedRef.current) {
                setTimeout(startSSEStream, 10000);
              }
            });
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('📡 SSE Stream connected');
        if (isMountedRef.current) {
          setIsStreaming(true);
          setShowLiveIndicator(true);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const readStream = () => {
          if (!isMountedRef.current) return;
          
          reader.read().then(({ done, value }) => {
            if (done || !isMountedRef.current) {
              console.log('📡 SSE Stream ended');
              if (isMountedRef.current) {
                setIsStreaming(false);
                setShowLiveIndicator(false);
              }
              if (!streamRetryTimeoutRef.current && isMountedRef.current) {
                streamRetryTimeoutRef.current = setTimeout(() => {
                  streamRetryTimeoutRef.current = null;
                  if (isMountedRef.current && (!eventSourceRef.current || eventSourceRef.current.signal.aborted)) {
                    startSSEStream();
                  }
                }, 10000);
              }
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';

            for (const event of events) {
              if (event.trim() && isMountedRef.current) {
                processSSEEvent(event);
              }
            }

            if (isMountedRef.current) {
              readStream();
            }
          }).catch(error => {
            if (error.name === 'AbortError') {
              console.log('📡 SSE Stream aborted');
            } else {
              console.error('📡 SSE Stream error:', error);
              if (isMountedRef.current) {
                setIsStreaming(false);
                setShowLiveIndicator(false);
              }
            }
          });
        };

        readStream();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('📡 SSE Stream aborted');
        } else {
          console.error('📡 SSE Stream fetch error:', error);
          if (isMountedRef.current) {
            setIsStreaming(false);
            setShowLiveIndicator(false);
          }
        }
      });

    } catch (error) {
      console.error('Error starting SSE stream:', error);
      if (isMountedRef.current) {
        setIsStreaming(false);
        setShowLiveIndicator(false);
      }
    }
  };

  const processSSEEvent = (eventText) => {
    try {
      const lines = eventText.split('\n');
      let eventData = '';
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          eventData += line.substring(5).trim();
        }
      }

      if (eventData) {
        try {
          const data = JSON.parse(eventData);
          console.log('📨 SSE Event received:', data);
          
          setLiveEvents(prev => {
            const sessionId = data.transaction_id || data.session_id || data.id;
            const existingIndex = prev.findIndex(e => {
              const eId = e.transaction_id || e.session_id || e.id;
              return eId === sessionId;
            });
            
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = { ...updated[existingIndex], ...data, received_at: new Date().toISOString() };
              return updated;
            } else {
              return [{ ...data, received_at: new Date().toISOString() }, ...prev];
            }
          });
        } catch (parseError) {
          console.warn('SSE parse error:', parseError);
        }
      }
    } catch (error) {
      console.warn('SSE processing error:', error);
    }
  };

  const stopSSEStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.abort?.();
      eventSourceRef.current = null;
    }
    if (streamRetryTimeoutRef.current) {
      clearTimeout(streamRetryTimeoutRef.current);
      streamRetryTimeoutRef.current = null;
    }
    setIsStreaming(false);
    setShowLiveIndicator(false);
  };

  // Fetch sessions with pagination - CPO endpoint
  const fetchSessions = useCallback(async (before = null, beforeId = null, isLoadMore = false) => {
    if (fetchInProgressRef.current) return;
    if (isLoadMore && loadingMore) return;
    
    fetchInProgressRef.current = true;
    
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
      
      if (before) url += `&next_before=${encodeURIComponent(before)}`;
      if (beforeId) url += `&next_before_id=${encodeURIComponent(beforeId)}`;
      
      // Add status filter if not 'All'
      if (statusFilter !== 'All') url += `&status=${statusFilter}`;

      console.log('📤 Fetching CPO sessions:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!isMountedRef.current) {
        fetchInProgressRef.current = false;
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📥 CPO Sessions response:', data);
        
        let sessionsArray = data.sessions || data.data || [];
        if (!Array.isArray(sessionsArray)) sessionsArray = [];

        const transformedSessions = sessionsArray.map((session) => ({
          id: session.id,
          transaction_id: session.transaction_id || 'N/A',
          customer_name: session.customer?.name || 'N/A',
          customer_email: session.customer?.email || 'N/A',
          charger_name: session.charger?.name || 'N/A',
          hub_name: session.charger?.hub_name || 'N/A',
          connector_number: session.connector?.number || 'N/A',
          connector_id: session.connector?.id || 'N/A',
          start_time: session.start_time,
          end_time: session.end_time,
          total_kwh: session.total_kwh || '0',
          total_amount: session.total_amount || '0',
          currency: session.currency || 'INR',
          status: session.status || 'UNKNOWN',
          stop_reason: session.stop_reason || 'N/A',
          created_at: session.created_at || session.start_time,
          ...session
        }));

        console.log('📊 Transformed sessions:', transformedSessions.length);
        console.log('📊 Session statuses:', transformedSessions.map(s => s.status));

        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;

        if (isLoadMore) {
          setAllSessions(prev => [...prev, ...transformedSessions]);
        } else {
          setAllSessions(transformedSessions);
        }
        
        // FIX: Update ongoing sessions from API with better filtering
        const ongoing = transformedSessions.filter(s => isOngoingStatus(s.status));
        console.log('🔄 Ongoing sessions from API:', ongoing.length, ongoing.map(s => ({ id: s.id, status: s.status })));
        
        if (isLoadMore) {
          setOngoingSessions(prev => [...prev, ...ongoing]);
        } else {
          setOngoingSessions(ongoing);
        }

        setPagination({
          limit: pagination.limit,
          has_more: hasMore,
          next_before: nextBefore,
          next_before_id: nextBeforeId
        });
        
        setHasLoaded(true);
        setIsInitialLoad(false);
      } else if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token expired');
        setError('Session expired. Please refresh.');
        const newToken = await refreshToken();
        if (newToken && isMountedRef.current) {
          fetchSessions(before, beforeId, isLoadMore);
          return;
        }
        if (!isLoadMore && isMountedRef.current) {
          setAllSessions([]);
          setOngoingSessions([]);
        }
        setPagination({ limit: 20, has_more: false, next_before: null, next_before_id: null });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch sessions:', response.status, errorData);
        if (!isLoadMore && isMountedRef.current) {
          setAllSessions([]);
          setOngoingSessions([]);
        }
        setPagination({ limit: 20, has_more: false, next_before: null, next_before_id: null });
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      if (!isLoadMore && isMountedRef.current) {
        setAllSessions([]);
        setOngoingSessions([]);
      }
      setPagination({ limit: 20, has_more: false, next_before: null, next_before_id: null });
    } finally {
      fetchInProgressRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [pagination.limit, refreshToken, statusFilter]);

  // Fetch single session detail - CPO endpoint
  const fetchSessionDetail = useCallback(async (sessionId) => {
    if (!sessionId) return;
    
    setLoadingDetail(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = API_CONFIG.SESSION_DETAIL_API(sessionId);
      
      console.log('📤 Fetching session detail from CPO:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CPO-App-ID': CPO_APP_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!isMountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Session detail response:', data);
        const session = data.session || data.data || data;
        
        // Enrich with live data if available
        const liveData = liveSessionMapRef.current[session.transaction_id] || liveSessionMapRef.current[session.id];
        if (liveData) {
          session.live_data = liveData;
          session.is_live = true;
        }
        
        setSelectedSession(session);
        setShowDetailModal(true);
      } else if (response.status === 401) {
        setError('Session expired. Please refresh.');
        const newToken = await refreshToken();
        if (newToken && isMountedRef.current) {
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'X-CPO-App-ID': CPO_APP_ID,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          if (retryResponse.ok && isMountedRef.current) {
            const data = await retryResponse.json();
            const session = data.session || data.data || data;
            setSelectedSession(session);
            setShowDetailModal(true);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch session details');
      }
    } catch (error) {
      console.error('❌ Error fetching session detail:', error);
      if (isMountedRef.current) {
        setError('An error occurred while fetching session details');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingDetail(false);
      }
    }
  }, [refreshToken]);

  const loadMoreSessions = () => {
    if (pagination.has_more && !loadingMore && !loading && !fetchInProgressRef.current) {
      fetchSessions(pagination.next_before, pagination.next_before_id, true);
    }
  };

  const handleSessionClick = (sessionId) => {
    if (sessionId) {
      fetchSessionDetail(sessionId);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSession(null);
    setError('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Refresh ongoing sessions when switching to ongoing tab
    if (tab === 'ongoing') {
      // Force refresh of ongoing sessions from API
      fetchSessions();
    }
  };

  const handleMainTabChange = (tab) => {
    setActiveMainTab(tab);
    if (tab === 'chargers') {
      navigate('/charger-session');
    }
  };

  const handleLogout = async () => {
    try {
      stopSSEStream();
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

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);
  
  const handleRefresh = () => {
    if (!fetchInProgressRef.current) {
      setAllSessions([]);
      setOngoingSessions([]);
      setLiveEvents([]);
      setLiveOngoingSessions([]);
      liveSessionMapRef.current = {};
      fetchSessions();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return '< 1 min';
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    const strId = String(id);
    if (strId.length > 12) {
      return strId.substring(0, 12) + '...';
    }
    return strId;
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount || amount === '0' || amount === 0) return `${currency} 0`;
    return `${currency} ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get current sessions based on active tab - memoized
  const currentSessions = useMemo(() => {
    if (activeTab === 'all') {
      return allSessions;
    } else {
      // Start with API ongoing sessions
      const combined = [...ongoingSessions];
      
      // Add live sessions that aren't already in the combined list
      liveOngoingSessions.forEach(liveSession => {
        const sessionId = liveSession.transaction_id || liveSession.session_id || liveSession.id;
        const exists = combined.some(s => {
          const sId = s.transaction_id || s.id;
          return String(sId) === String(sessionId);
        });
        if (!exists) {
          combined.push({
            id: sessionId,
            transaction_id: sessionId,
            customer_name: liveSession.customer_name || liveSession.customer?.name || 'N/A',
            charger_name: liveSession.charger_name || liveSession.charger?.name || `Charger ${liveSession.charger_id || 'N/A'}`,
            hub_name: liveSession.hub_name || liveSession.hub?.name || 'N/A',
            connector_id: liveSession.connector_id || liveSession.connector?.id || 'N/A',
            connector_number: liveSession.connector_number || liveSession.connector?.number || 'N/A',
            start_time: liveSession.start_time || liveSession.started_at || new Date().toISOString(),
            end_time: liveSession.end_time || null,
            status: liveSession.status || liveSession.new_status || liveSession.state || 'Ongoing',
            total_kwh: liveSession.total_kwh || liveSession.energy || '0',
            total_amount: liveSession.total_amount || '0', // Keep amount but don't display in ongoing
            currency: liveSession.currency || 'INR',
            duration: liveSession.duration_minutes || 0,
            is_live: true,
            usage: liveSession.energy || liveSession.total_kwh || '0',
            ...liveSession
          });
        }
      });
      
      console.log('📊 Combined ongoing sessions:', combined.length, combined.map(s => ({ id: s.id, status: s.status, is_live: s.is_live })));
      return combined;
    }
  }, [activeTab, allSessions, ongoingSessions, liveOngoingSessions]);

  // Filter sessions based on search - memoized
  const filteredSessions = useMemo(() => {
    if (!searchQuery) return currentSessions;
    const query = searchQuery.toLowerCase();
    return currentSessions.filter(session => {
      const idStr = String(session.id || '');
      const transactionIdStr = String(session.transaction_id || '');
      const chargerNameStr = String(session.charger_name || '');
      const hubNameStr = String(session.hub_name || '');
      const customerNameStr = String(session.customer_name || '');
      
      return (
        idStr.toLowerCase().includes(query) ||
        transactionIdStr.toLowerCase().includes(query) ||
        chargerNameStr.toLowerCase().includes(query) ||
        hubNameStr.toLowerCase().includes(query) ||
        customerNameStr.toLowerCase().includes(query)
      );
    });
  }, [currentSessions, searchQuery]);

  // Stats - memoized
  const totalSessions = allSessions.length;
  const ongoingCount = useMemo(() => {
    // Count ongoing sessions from combined list
    const count = currentSessions.filter(s => isOngoingStatus(s.status)).length;
    console.log('📊 Ongoing count:', count);
    return count;
  }, [currentSessions]);

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

  // Filter Popup
  const FilterPopup = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            Filters
          </h3>
          <button onClick={() => setShowFilterPopup(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="CHARGING">Charging</option>
              <option value="START_PENDING">Start Pending</option>
              <option value="STOP_PENDING">Stop Pending</option>
              <option value="STOPPED">Stopped</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowFilterPopup(false);
                fetchSessions();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setStatusFilter('All');
                setSearchQuery('');
                fetchSessions();
              }}
              className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Session Detail Modal
  const SessionDetailModal = () => {
    if (!selectedSession) return null;

    const duration = calculateDuration(
      selectedSession.start_time,
      selectedSession.end_time || selectedSession.live_data?.end_time
    );

    const isLive = selectedSession.is_live || selectedSession.live_data;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Session Details</h3>
                <p className="text-sm text-white/80">
                  ID: {truncateId(selectedSession.id)}
                  {isLive && (
                    <span className="ml-2 text-green-300 inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={closeDetailModal}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loadingDetail ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-gray-600">{error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedSession.status)}`}>
                      {getStatusIcon(selectedSession.status)}
                      {getStatusDisplayName(selectedSession.status)}
                    </span>
                    {isLive && (
                      <span className="ml-2 text-xs text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {formatCurrency(selectedSession.total_amount, selectedSession.currency)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Energy</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {selectedSession.total_kwh || 0} kWh
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {duration}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Session Info</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Session ID</span>
                        <span className="font-mono text-gray-900">{selectedSession.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-gray-900">{selectedSession.transaction_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Connector</span>
                        <span className="text-gray-900">#{selectedSession.connector?.number || selectedSession.connector_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Connector ID</span>
                        <span className="font-mono text-gray-900">{selectedSession.connector?.id || selectedSession.connector_id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Info</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name</span>
                        <span className="text-gray-900">{selectedSession.customer?.name || selectedSession.customer_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email</span>
                        <span className="text-gray-900">{selectedSession.customer?.email || selectedSession.customer_email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Charger Info</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Charger</span>
                        <span className="text-gray-900">{selectedSession.charger?.name || selectedSession.charger_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hub</span>
                        <span className="text-gray-900">{selectedSession.charger?.hub_name || selectedSession.hub_name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Timestamps</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Start Time</span>
                        <span className="text-gray-900">{formatDate(selectedSession.start_time)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">End Time</span>
                        <span className="text-gray-900">{selectedSession.end_time ? formatDate(selectedSession.end_time) : (isLive ? 'Ongoing' : 'N/A')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration</span>
                        <span className="text-gray-900 font-medium">{duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSession.stop_reason && selectedSession.stop_reason !== 'N/A' && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stop Reason</p>
                    <p className="text-sm text-gray-700">{selectedSession.stop_reason}</p>
                  </div>
                )}

                {selectedSession.live_data && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live Data
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium text-green-700">{selectedSession.live_data.status || selectedSession.live_data.new_status || 'N/A'}</span>
                      </div>
                      {selectedSession.live_data.energy && (
                        <div>
                          <span className="text-gray-500">Energy:</span>
                          <span className="ml-2 font-medium">{selectedSession.live_data.energy} kWh</span>
                        </div>
                      )}
                      {selectedSession.live_data.power && (
                        <div>
                          <span className="text-gray-500">Power:</span>
                          <span className="ml-2 font-medium">{selectedSession.live_data.power} kW</span>
                        </div>
                      )}
                      {selectedSession.live_data.total_cost && (
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <span className="ml-2 font-medium">{formatCurrency(selectedSession.live_data.total_cost)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeDetailModal}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25"
                  >
                    <X size={18} />
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isRefreshing && loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sessions...</p>
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
        <header className="bg-white border-b-2 border-gray-100 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  View all charging sessions
                  {showLiveIndicator && (
                    <span className="flex items-center gap-1 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-medium">Live</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button
                onClick={handleRefresh}
                disabled={loading || loadingMore}
                className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={18} className={`text-gray-600 ${(loading || loadingMore) ? 'animate-spin' : ''}`} />
              </button>

              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
            
          </div>
        </header>
        {/* Main Navigation Tabs - Sessions & Chargers */}
        <div className="flex items-center gap-1 mt-4 border-b border-gray-200 px-6">
          <button
            onClick={() => handleMainTabChange('chargers')}
            className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
              activeMainTab === 'chargers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap size={16} />
            Chargers
          </button>
          <button
            onClick={() => handleMainTabChange('sessions')}
            className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
              activeMainTab === 'sessions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History size={16} />
            Sessions
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">
              {totalSessions}
            </span>
          </button>
        </div>

        {/* Sessions Content */}
        {activeMainTab === 'sessions' && (
          <div className="p-6">
            {/* Stats Card */}
            <div className="mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition group inline-flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
                </div>
              </div>
            </div>

            {/* Tabs - All / Ongoing */}
            <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Grid size={16} />
                  All Sessions
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {allSessions.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('ongoing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'ongoing'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  Ongoing
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {ongoingCount}
                  </span>
                  {showLiveIndicator && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span>
                  )}
                </div>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                {statusFilter !== 'All' && (
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setSearchQuery('');
                      fetchSessions();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center gap-1"
                  >
                    <X size={12} />
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56 bg-gray-50"
                  />
                </div>
                <button
                  onClick={() => setShowFilterPopup(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm font-medium text-gray-700"
                >
                  <Filter size={16} className="text-gray-500" />
                  Filter
                </button>
                {showFilterPopup && <FilterPopup />}
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SI</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Session ID</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hub</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connector ID</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Time</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Energy / Usage</th>
                      {activeTab === 'all' && (
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      )}
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && !hasLoaded && isInitialLoad ? (
                      <tr>
                        <td colSpan="12" className="px-3 py-12 text-center">
                          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                          <p className="text-gray-600">Loading sessions...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="12" className="px-3 py-12 text-center">
                          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                          <p className="text-gray-600">{error}</p>
                          <button
                            onClick={() => { setError(''); fetchSessions(); }}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="px-3 py-12 text-center">
                          <Database size={48} className="text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No Sessions Found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {activeTab === 'all' ? 'No charging sessions available.' : 'No ongoing sessions found.'}
                          </p>
                          {showLiveIndicator && activeTab === 'ongoing' && (
                            <p className="text-xs text-green-600 mt-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                              Waiting for live sessions...
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-3 mt-4">
                            <button
                              onClick={handleRefresh}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
                            >
                              <RefreshCw size={16} />
                              Refresh
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((session, index) => {
                        const duration = calculateDuration(session.start_time, session.end_time);
                        const isLive = session.is_live || liveSessionMapRef.current[session.transaction_id] || liveSessionMapRef.current[session.id];
                        // For ongoing sessions, show usage from live data
                        const usage = isLive ? (session.usage || session.total_kwh || session.energy || '0') : (session.total_kwh || '0');
                        
                        return (
                          <tr 
                            key={session.id || session.transaction_id || index} 
                            className={`border-b border-gray-100 hover:bg-gray-50/50 transition cursor-pointer ${isLive ? 'bg-green-50/30' : ''}`}
                            onClick={() => handleSessionClick(session.id)}
                          >
                            <td className="px-3 py-3 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-3 py-3 text-sm font-mono text-gray-600">
                              {truncateId(session.id)}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-700">
                              {session.customer?.name || session.customer_name || 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-700">
                              {session.charger?.name || session.charger_name || 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600">
                              {session.charger?.hub_name || session.hub_name || 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-sm font-mono text-gray-500">
                              {session.connector?.id || session.connector_id || 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600">
                              {formatDate(session.start_time)}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600">
                              {session.end_time ? formatDate(session.end_time) : (isLive ? 'Ongoing' : 'N/A')}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-700 font-medium">
                              {duration}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-700">
                              {usage} kWh
                            </td>
                            {activeTab === 'all' && (
                              <td className="px-3 py-3 text-sm font-medium text-gray-700">
                                {formatCurrency(session.total_amount, session.currency)}
                              </td>
                            )}
                            <td className="px-3 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                {getStatusIcon(session.status)}
                                {getStatusDisplayName(session.status)}
                              </span>
                              {isLive && (
                                <span className="ml-1 text-xs text-green-600">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                                  Live
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <button
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSessionClick(session.id);
                                }}
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Load More */}
              {pagination.has_more && filteredSessions.length > 0 && activeTab === 'all' && (
                <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center">
                  <button
                    onClick={loadMoreSessions}
                    disabled={loadingMore || loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Load More
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                <span>
                  {filteredSessions.length === 0 
                    ? 'No sessions available'
                    : `Showing ${filteredSessions.length} of ${currentSessions.length} sessions`
                  }
                </span>
                {pagination.has_more && filteredSessions.length > 0 && activeTab === 'all' && (
                  <span className="text-blue-600">Load more available</span>
                )}
                {!pagination.has_more && currentSessions.length > 0 && activeTab === 'all' && (
                  <span className="text-gray-400">All sessions loaded</span>
                )}
                {activeTab === 'ongoing' && showLiveIndicator && (
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Live updates
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chargers Tab Content */}
        {activeMainTab === 'chargers' && (
          <div className="p-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <Zap size={64} className="text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">Chargers Management</h3>
              <p className="text-gray-500 mt-2">Click on the "Chargers" tab to view and manage all charging stations</p>
              <button
                onClick={() => navigate('/chargers')}
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto"
              >
                <Zap size={18} />
                Go to Chargers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {showDetailModal && <SessionDetailModal />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Sessions;
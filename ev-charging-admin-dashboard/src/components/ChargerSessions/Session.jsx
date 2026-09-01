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
  LIVE_SESSIONS_SSE: `${API_BASE_URL}/api/v1/cpo/operations/live-sessions`,
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
    'ACTIVE': 'bg-blue-100 text-blue-700 border-blue-200',
    'active': 'bg-blue-100 text-blue-700 border-blue-200',
    'INACTIVE': 'bg-gray-100 text-gray-700 border-gray-200',
    'inactive': 'bg-gray-100 text-gray-700 border-gray-200',
    'FINISHED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'finished': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'RECONCILIATION_REQUIRED': 'bg-amber-100 text-amber-700 border-amber-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status) => {
  const statusUpper = status?.toUpperCase() || '';
  switch(statusUpper) {
    case 'COMPLETED':
    case 'FINISHED':
      return <CheckCircle className="w-3 h-3" />;
    case 'START_PENDING':
      return <Clock className="w-3 h-3" />;
    case 'CHARGING':
    case 'ACTIVE':
      return <Activity className="w-3 h-3" />;
    case 'STOP_PENDING':
      return <AlertCircle className="w-3 h-3" />;
    case 'STOPPED':
    case 'FAILED':
    case 'INACTIVE':
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
    'ACTIVE': 'Active',
    'active': 'Active',
    'INACTIVE': 'Inactive',
    'inactive': 'Inactive',
    'FINISHED': 'Finished',
    'finished': 'Finished',
    'RECONCILIATION_REQUIRED': 'Reconciliation Required'
  };
  return statusMap[status] || status || 'Unknown';
};

// Helper function to check if a session is ongoing
const isOngoingStatus = (status) => {
  if (!status) return false;

  const statusStr = String(status).toUpperCase().trim();

  const ongoingStatuses = [
    'ACTIVE',
    'CHARGING',
    'START_PENDING',
    'STOP_PENDING',
    'ONGOING',
    'IN PROGRESS',
    'STARTED',
    'START',
    'PROCESSING',
    'RUNNING',
    'INPROGRESS',
    'IN_PROGRESS',
    'STARTING',
    'INITIATED'
  ];

  if (ongoingStatuses.includes(statusStr)) {
    return true;
  }

  const keywords = ['START', 'CHARG', 'ACTIVE', 'ONGOING', 'PROGRESS', 'RUNNING'];
  for (const keyword of keywords) {
    if (statusStr.includes(keyword)) {
      return true;
    }
  }

  return false;
};

// Helper to get energy from session (consumed_wh in watt-hours, convert to kWh)
const getEnergyKwh = (session) => {
  if (session.consumed_wh) {
    return parseFloat(session.consumed_wh) / 1000;
  }
  if (session.total_kwh) {
    return parseFloat(session.total_kwh);
  }
  if (session.energy) {
    return parseFloat(session.energy);
  }
  if (session.usage) {
    return parseFloat(session.usage);
  }
  return 0;
};

// Helper to get SOC percentage
const getSocPercent = (session) => {
  if (session.soc_percent) {
    return parseFloat(session.soc_percent) || 0;
  }
  return 0;
};

// Helper to get meter freshness
const getMeterFreshness = (session) => {
  return session.meter_freshness || 'UNKNOWN';
};

// Helper to get SOC freshness
const getSocFreshness = (session) => {
  return session.soc_freshness || 'UNKNOWN';
};

// Helper to get projected amount
const getProjectedAmount = (session) => {
  if (session.projected_amount) {
    return parseFloat(session.projected_amount) || 0;
  }
  if (session.total_amount) {
    return parseFloat(session.total_amount) || 0;
  }
  return 0;
};

// Helper to get currency
const getCurrency = (session) => {
  return session.currency || 'INR';
};

// Helper to get the transaction id, preferring the live SSE field
// (ocpp_transaction_id) over any stale/absent value from the REST API.
const getTransactionId = (session) => {
  return session.ocpp_transaction_id || session.transaction_id || 'N/A';
};

// ==================== DURATION FORMATTING (BACKEND-SOURCED ONLY) ====================
// IMPORTANT: duration_seconds must always come from the backend (SSE live_sessions /
// snapshot payload, or the session detail API response). We never compute duration
// from the local machine's clock (no `new Date() - new Date(started_at)` math),
// so the displayed duration always matches the backend/server timer exactly.
const formatDuration = (durationSeconds) => {
  if (!durationSeconds || durationSeconds < 0) return 'N/A';

  const totalSeconds = Math.floor(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Get duration in minutes for display (derived purely from backend duration_seconds)
const getDurationMinutes = (durationSeconds) => {
  if (!durationSeconds) return 0;
  return Math.floor(durationSeconds / 60);
};

// Format duration for display (short version)
const formatDurationShort = (durationSeconds) => {
  if (!durationSeconds || durationSeconds < 0) return 'N/A';

  const totalSeconds = Math.floor(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${totalSeconds}s`;
  }
};

// Duration for a COMPLETED session: computed from the two backend timestamps
// (start_time and end_time) — both come from the server, so this is a fixed
// calculation and never depends on the local machine's current time.
// Only use this for non-ongoing sessions.
const getCompletedDurationSeconds = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const diff = Math.floor((end - start) / 1000);
  return diff >= 0 ? diff : null;
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
  const [liveSessionsData, setLiveSessionsData] = useState({ sessions: [], as_of: null });
  const [updatedSessionIds, setUpdatedSessionIds] = useState(new Set());

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

  // Modal state - persisted in sessionStorage
  const [showDetailModal, setShowDetailModal] = useState(() => {
    // Check if modal was open before refresh
    return sessionStorage.getItem('sessionModalOpen') === 'true';
  });
  const [selectedSession, setSelectedSession] = useState(() => {
    // Restore selected session from sessionStorage
    const saved = sessionStorage.getItem('selectedSession');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    return sessionStorage.getItem('selectedSessionId') || null;
  });

  // SSE Stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef(null);
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);
  const streamRetryTimeoutRef = useRef(null);
  const liveSessionsMapRef = useRef({});
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);
  const streamInitializedRef = useRef(false);
  const sessionRefreshTimeoutRef = useRef(null);
  const durationUpdateIntervalRef = useRef(null);
  const previousLiveSessionsRef = useRef([]);
  const liveDurationIntervalRef = useRef(null);
  const modalLiveDataIntervalRef = useRef(null);
  const modalScrollPositionRef = useRef(0);

  // Save modal state to sessionStorage when it changes
  useEffect(() => {
    if (showDetailModal) {
      sessionStorage.setItem('sessionModalOpen', 'true');
      sessionStorage.setItem('selectedSessionId', selectedSessionId || '');
      if (selectedSession) {
        sessionStorage.setItem('selectedSession', JSON.stringify(selectedSession));
      }
    } else {
      sessionStorage.removeItem('sessionModalOpen');
      sessionStorage.removeItem('selectedSessionId');
      sessionStorage.removeItem('selectedSession');
    }
  }, [showDetailModal, selectedSessionId, selectedSession]);

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
        startLiveSessionsSSE();
        streamInitializedRef.current = true;
      }
    };

    init();

    return () => {
      isMountedRef.current = false;
      stopLiveSessionsSSE();
      if (sessionRefreshTimeoutRef.current) {
        clearTimeout(sessionRefreshTimeoutRef.current);
      }
      if (durationUpdateIntervalRef.current) {
        clearInterval(durationUpdateIntervalRef.current);
      }
      if (liveDurationIntervalRef.current) {
        clearInterval(liveDurationIntervalRef.current);
      }
      if (modalLiveDataIntervalRef.current) {
        clearInterval(modalLiveDataIntervalRef.current);
      }
    };
  }, [isAuthenticated, navigate]);

  // Tick every second purely to re-render live rows/modal so the UI stays fresh.
  // This interval NO LONGER recalculates duration_seconds from started_at / local
  // clock. It just triggers a re-render; the actual duration value always comes
  // from whatever the backend last sent via SSE (see processSSEEvent below).
  useEffect(() => {
    if (liveDurationIntervalRef.current) {
      clearInterval(liveDurationIntervalRef.current);
    }

    liveDurationIntervalRef.current = setInterval(() => {
      setLiveSessionsData(prev => ({ ...prev }));
    }, 1000);

    return () => {
      if (liveDurationIntervalRef.current) {
        clearInterval(liveDurationIntervalRef.current);
      }
    };
  }, []);

  // Update live sessions map when live sessions data changes
  useEffect(() => {
    // Detect which sessions were updated
    const newSessionIds = new Set();
    const currentIds = liveSessionsData.sessions.map(s => s.session_id || s.id);
    const prevIds = previousLiveSessionsRef.current.map(s => s.session_id || s.id);

    // Check for new or updated sessions
    liveSessionsData.sessions.forEach(session => {
      const id = session.session_id || session.id;
      const prevSession = previousLiveSessionsRef.current.find(s => (s.session_id || s.id) === id);
      if (prevSession) {
        // Check if energy or status changed
        const prevEnergy = getEnergyKwh(prevSession);
        const currEnergy = getEnergyKwh(session);
        const prevStatus = prevSession.status;
        const currStatus = session.status;
        if (prevEnergy !== currEnergy || prevStatus !== currStatus) {
          newSessionIds.add(id);
        }
      } else {
        // New session
        newSessionIds.add(id);
      }
    });

    // Update animation state
    if (newSessionIds.size > 0) {
      setUpdatedSessionIds(newSessionIds);
      // Clear animation after 2 seconds
      setTimeout(() => {
        setUpdatedSessionIds(new Set());
      }, 2000);
    }

    // Store current sessions for next comparison
    previousLiveSessionsRef.current = [...liveSessionsData.sessions];

    const map = {};
    liveSessionsData.sessions.forEach(session => {
      const id = session.session_id || session.id;
      if (id) {
        map[id] = session;
      }
    });
    liveSessionsMapRef.current = map;

    // If modal is open and selected session has live data, update it
    if (showDetailModal && selectedSessionId) {
      const liveData = map[selectedSessionId];
      if (liveData) {
        setSelectedSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            ...liveData,
            is_live: true,
            consumed_wh: liveData.consumed_wh || prev.consumed_wh,
            total_kwh: liveData.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : prev.total_kwh,
            soc_percent: liveData.soc_percent || prev.soc_percent,
            // Backend-sourced duration only. `?? ` keeps prev value if backend
            // didn't send one this tick (0 is a valid value, so we use ??, not ||).
            duration_seconds: liveData.duration_seconds ?? prev.duration_seconds,
            status: liveData.status || prev.status,
            charger_name: liveData.charger_name || prev.charger_name,
            charger_id: liveData.charger_id || prev.charger_id,
            hub_name: liveData.hub_name || prev.hub_name,
            connector_number: liveData.connector_number || prev.connector_number,
            customer_name: liveData.customer_name || prev.customer_name,
            started_at: liveData.started_at || prev.started_at,
            // Transaction id: the live stream sends this as ocpp_transaction_id,
            // so prefer that field over any stale transaction_id.
            ocpp_transaction_id: liveData.ocpp_transaction_id || prev.ocpp_transaction_id,
            transaction_id: liveData.ocpp_transaction_id || liveData.transaction_id || prev.transaction_id,
            // Add projected amount from live data
            projected_amount: liveData.projected_amount || prev.projected_amount,
            currency: liveData.currency || prev.currency
          };
        });
      }
    }

    // Update ongoing sessions from live data
    const ongoing = liveSessionsData.sessions.filter(s =>
      isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING'
    );
    setOngoingSessions(ongoing);

    // Also update all sessions with live data
    setAllSessions(prev => {
      const updated = [...prev];
      liveSessionsData.sessions.forEach(liveSession => {
        const index = updated.findIndex(s => {
          const sId = s.id || s.session_id;
          const lId = liveSession.id || liveSession.session_id;
          return String(sId) === String(lId);
        });
        if (index >= 0) {
          updated[index] = { ...updated[index], ...liveSession, is_live: true };
        } else if (isOngoingStatus(liveSession.status) || liveSession.status === 'ACTIVE') {
          updated.push({ ...liveSession, is_live: true });
        }
      });
      return updated;
    });
  }, [liveSessionsData, showDetailModal, selectedSessionId]);

  // Start modal live data update interval
  useEffect(() => {
    if (modalLiveDataIntervalRef.current) {
      clearInterval(modalLiveDataIntervalRef.current);
    }

    if (showDetailModal && selectedSessionId) {
      // Save current scroll position
      modalScrollPositionRef.current = window.scrollY;

      // Update modal live data every second — backend duration_seconds only.
      modalLiveDataIntervalRef.current = setInterval(() => {
        if (selectedSessionId && liveSessionsMapRef.current[selectedSessionId]) {
          const liveData = liveSessionsMapRef.current[selectedSessionId];
          setSelectedSession(prev => {
            if (!prev) return prev;
            // Only update if session is ongoing
            if (!isOngoingStatus(prev.status) && prev.status !== 'ACTIVE') {
              return prev;
            }
            return {
              ...prev,
              ...liveData,
              is_live: true,
              consumed_wh: liveData.consumed_wh || prev.consumed_wh,
              total_kwh: liveData.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : prev.total_kwh,
              soc_percent: liveData.soc_percent || prev.soc_percent,
              // Backend-sourced duration only — no local clock fallback here.
              duration_seconds: liveData.duration_seconds ?? prev.duration_seconds,
              status: liveData.status || prev.status,
              charger_name: liveData.charger_name || prev.charger_name,
              charger_id: liveData.charger_id || prev.charger_id,
              hub_name: liveData.hub_name || prev.hub_name,
              connector_number: liveData.connector_number || prev.connector_number,
              customer_name: liveData.customer_name || prev.customer_name,
              started_at: liveData.started_at || prev.started_at,
              // Transaction id: prefer live SSE's ocpp_transaction_id field.
              ocpp_transaction_id: liveData.ocpp_transaction_id || prev.ocpp_transaction_id,
              transaction_id: liveData.ocpp_transaction_id || liveData.transaction_id || prev.transaction_id,
              // Add projected amount from live data
              projected_amount: liveData.projected_amount || prev.projected_amount,
              currency: liveData.currency || prev.currency
            };
          });
        }
        // NOTE: previously there was an "else if" branch here that recalculated
        // duration from started_at using the local clock when no live SSE data
        // was available for this session. That branch has been removed — if the
        // backend hasn't sent a fresh duration_seconds, we simply keep showing
        // the last value the backend gave us instead of estimating locally.
      }, 1000);
    }

    return () => {
      if (modalLiveDataIntervalRef.current) {
        clearInterval(modalLiveDataIntervalRef.current);
      }
    };
  }, [showDetailModal, selectedSessionId, selectedSession]);

  // Restore scroll position when modal closes
  useEffect(() => {
    if (!showDetailModal) {
      // Restore scroll position after a small delay
      setTimeout(() => {
        window.scrollTo(0, modalScrollPositionRef.current);
      }, 100);
    }
  }, [showDetailModal]);

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

  // ==================== LIVE SESSIONS SSE STREAM ====================
  const startLiveSessionsSSE = () => {
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

      const url = `${API_CONFIG.LIVE_SESSIONS_SSE}?cpo_app_id=${CPO_APP_ID}`;

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
                setTimeout(startLiveSessionsSSE, 10000);
              }
            });
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('📡 SSE Live Sessions Stream connected');
        if (isMountedRef.current) {
          setIsStreaming(true);
          setShowLiveIndicator(true);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let snapshotReceived = false;

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
                    startLiveSessionsSSE();
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
                processSSEEvent(event, snapshotReceived);
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

  const processSSEEvent = (eventText, isSnapshot) => {
    try {
      const lines = eventText.split('\n');
      let eventType = '';
      let eventData = '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.substring(6).trim();
        }
        if (line.startsWith('data:')) {
          eventData += line.substring(5).trim();
        }
      }

      if (eventData && eventType) {
        try {
          const data = JSON.parse(eventData);
          console.log(`📨 SSE Event: ${eventType}`, data);

          if (eventType === 'snapshot' || eventType === 'live_sessions') {
            const sessions = data.sessions || [];
            const as_of = data.as_of || new Date().toISOString();

            console.log(`🔄 Replacing live sessions with ${sessions.length} sessions from ${eventType}`);

            const transformedSessions = sessions.map(session => {
              // Duration comes strictly from the backend's duration_seconds field.
              // No local-time fallback (no calculateLiveDuration / started_at math).
              const durationSeconds = session.duration_seconds || 0;

              return {
                id: session.session_id || session.id,
                session_id: session.session_id || session.id,
                status: session.status || 'ACTIVE',
                started_at: session.started_at || session.start_time,
                charger_id: session.charger_id || 'N/A',
                charger_name: session.charger_name || 'N/A',
                hub_name: session.hub_name || 'N/A',
                connector_number: session.connector_number || 0,
                latest_meter_wh: session.latest_meter_wh || 0,
                consumed_wh: session.consumed_wh || 0,
                meter_observed_at: session.meter_observed_at || null,
                meter_freshness: session.meter_freshness || 'UNKNOWN',
                soc_percent: session.soc_percent || null,
                soc_observed_at: session.soc_observed_at || null,
                soc_freshness: session.soc_freshness || 'UNKNOWN',
                total_kwh: session.consumed_wh ? parseFloat(session.consumed_wh) / 1000 : 0,
                is_live: true,
                duration_seconds: durationSeconds,
                customer_name: session.customer_name || 'N/A',
                transaction_id: session.ocpp_transaction_id || session.transaction_id || 'N/A',
                // Add projected amount and currency
                projected_amount: session.projected_amount || null,
                currency: session.currency || 'INR',
                ...session,
                // Re-assert transaction_id AFTER the ...session spread above, so the
                // raw session.transaction_id (which the live payload does NOT send)
                // never overwrites the ocpp_transaction_id-derived value.
                ocpp_transaction_id: session.ocpp_transaction_id || null,
                transaction_id: session.ocpp_transaction_id || session.transaction_id || 'N/A'
              };
            });

            setLiveSessionsData({
              sessions: transformedSessions,
              as_of: as_of
            });
          }
        } catch (parseError) {
          console.warn('SSE parse error:', parseError);
        }
      }
    } catch (error) {
      console.warn('SSE processing error:', error);
    }
  };

  const stopLiveSessionsSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.abort?.();
      eventSourceRef.current = null;
    }
    if (streamRetryTimeoutRef.current) {
      clearTimeout(streamRetryTimeoutRef.current);
      streamRetryTimeoutRef.current = null;
    }
    if (sessionRefreshTimeoutRef.current) {
      clearTimeout(sessionRefreshTimeoutRef.current);
      sessionRefreshTimeoutRef.current = null;
    }
    if (liveDurationIntervalRef.current) {
      clearInterval(liveDurationIntervalRef.current);
      liveDurationIntervalRef.current = null;
    }
    if (modalLiveDataIntervalRef.current) {
      clearInterval(modalLiveDataIntervalRef.current);
      modalLiveDataIntervalRef.current = null;
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

        const transformedSessions = sessionsArray.map((session) => {
          const sessionId = session.id || session.session_id;
          const liveData = liveSessionsMapRef.current[sessionId];
          const status = liveData?.status || session.status || 'UNKNOWN';
          const isOngoing = isOngoingStatus(status) || status === 'ACTIVE' || status === 'STOP_PENDING';
          const startTime = session.start_time || liveData?.started_at;
          const endTime = session.end_time;

          // COMPLETED: duration = end_time - start_time (both backend timestamps
          // from the All Sessions API) — a fixed calculation, no local clock.
          // ONGOING/ACTIVE: duration = ONLY the live duration_seconds from SSE.
          const durationSeconds = isOngoing
            ? (liveData?.duration_seconds ?? null)
            : (getCompletedDurationSeconds(startTime, endTime) ?? session.duration_seconds ?? null);

          return {
            ...session,
            id: session.id,
            session_id: session.session_id || session.id,
            // Transaction id: while the session is live/ongoing, always prefer the
            // live stream's ocpp_transaction_id over the REST API's transaction_id
            // so it matches what the Ongoing tab shows. Falls back to the API value
            // for completed sessions (which have no live data).
            ocpp_transaction_id: liveData?.ocpp_transaction_id || session.ocpp_transaction_id || null,
            transaction_id: liveData?.ocpp_transaction_id || liveData?.transaction_id || session.transaction_id || 'N/A',
            customer_name: session.customer?.name || 'N/A',
            customer_email: session.customer?.email || 'N/A',
            charger_name: session.charger?.name || liveData?.charger_name || 'N/A',
            charger_id: session.charger?.charger_id || session.charger_id || liveData?.charger_id || 'N/A',
            hub_name: session.charger?.hub_name || liveData?.hub_name || 'N/A',
            connector_number: session.connector?.number || liveData?.connector_number || 'N/A',
            connector_id: session.connector?.id || 'N/A',
            start_time: startTime,
            end_time: endTime,
            total_kwh: liveData?.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : (session.total_kwh || '0'),
            total_amount: liveData?.projected_amount || session.total_amount || '0',
            currency: liveData?.currency || session.currency || 'INR',
            status: status,
            stop_reason: session.stop_reason || 'N/A',
            created_at: session.created_at || session.start_time,
            is_live: !!liveData,
            live_data: liveData || null,
            consumed_wh: liveData?.consumed_wh || null,
            soc_percent: liveData?.soc_percent || null,
            latest_meter_wh: liveData?.latest_meter_wh || null,
            meter_freshness: liveData?.meter_freshness || 'UNKNOWN',
            soc_freshness: liveData?.soc_freshness || 'UNKNOWN',
            // Add projected amount
            projected_amount: liveData?.projected_amount || session.projected_amount || null,
            // duration_seconds must stay AFTER ...session so our computed value
            // (start/end diff for completed, live SSE value for ongoing) wins
            // over whatever raw duration_seconds the API response might contain.
            duration_seconds: durationSeconds,
            started_at: liveData?.started_at || session.start_time
          };
        });

        console.log('📊 Transformed sessions:', transformedSessions.length);

        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;

        if (isLoadMore) {
          setAllSessions(prev => [...prev, ...transformedSessions]);
        } else {
          setAllSessions(transformedSessions);
        }

        const ongoing = transformedSessions.filter(s => isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING');
        console.log('🔄 Ongoing sessions from API:', ongoing.length);

        const liveOngoing = liveSessionsData.sessions.filter(s => isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING');
        const allOngoing = [...ongoing];
        liveOngoing.forEach(live => {
          const exists = allOngoing.some(s => {
            const sId = s.id || s.session_id;
            const lId = live.id || live.session_id;
            return String(sId) === String(lId);
          });
          if (!exists) {
            allOngoing.push(live);
          }
        });

        setOngoingSessions(allOngoing);

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
  }, [pagination.limit, refreshToken, statusFilter, liveSessionsData.sessions]);

  // Fetch single session detail
  const fetchSessionDetail = useCallback(async (sessionId) => {
    if (!sessionId) return;

    setLoadingDetail(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = API_CONFIG.SESSION_DETAIL_API(sessionId);

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
        const session = data.session || data.data || data;

        const sessionKey = session.id || session.session_id;
        const liveData = liveSessionsMapRef.current[sessionKey];
        const sessionIsOngoing = isOngoingStatus(liveData?.status || session.status) ||
          (liveData?.status || session.status) === 'ACTIVE' ||
          (liveData?.status || session.status) === 'STOP_PENDING';

        if (liveData) {
          session.live_data = liveData;
          session.is_live = true;
          session.consumed_wh = liveData.consumed_wh || 0;
          session.total_kwh = liveData.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : (session.total_kwh || '0');
          session.soc_percent = liveData.soc_percent || null;
          session.latest_meter_wh = liveData.latest_meter_wh || 0;
          session.meter_freshness = liveData.meter_freshness || 'UNKNOWN';
          session.soc_freshness = liveData.soc_freshness || 'UNKNOWN';
          session.status = liveData.status || session.status;
          session.charger_name = liveData.charger_name || session.charger_name;
          session.charger_id = liveData.charger_id || session.charger_id;
          session.hub_name = liveData.hub_name || session.hub_name;
          session.connector_number = liveData.connector_number || session.connector_number;
          session.started_at = liveData.started_at || session.start_time;
          session.customer_name = liveData.customer_name || session.customer_name;
          // Transaction id: prefer the live stream's ocpp_transaction_id.
          session.ocpp_transaction_id = liveData.ocpp_transaction_id || session.ocpp_transaction_id || null;
          session.transaction_id = liveData.ocpp_transaction_id || liveData.transaction_id || session.transaction_id || 'N/A';
          // Add projected amount from live data
          session.projected_amount = liveData.projected_amount || session.projected_amount || null;
          session.currency = liveData.currency || session.currency || 'INR';
        }

        // COMPLETED: duration = end_time - start_time (backend timestamps).
        // ONGOING/ACTIVE: duration = ONLY the live SSE duration_seconds.
        if (sessionIsOngoing) {
          session.duration_seconds = liveData?.duration_seconds ?? session.duration_seconds ?? null;
        } else {
          session.duration_seconds =
            getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time) ??
            session.duration_seconds ??
            null;
        }

        setSelectedSessionId(sessionKey);
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
            const sessionKey = session.id || session.session_id;
            setSelectedSessionId(sessionKey);
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
      // Save current scroll position before opening modal
      modalScrollPositionRef.current = window.scrollY;
      fetchSessionDetail(sessionId);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSession(null);
    setSelectedSessionId(null);
    setError('');
    // Clear modal interval
    if (modalLiveDataIntervalRef.current) {
      clearInterval(modalLiveDataIntervalRef.current);
      modalLiveDataIntervalRef.current = null;
    }
    // Restore scroll position after a small delay
    setTimeout(() => {
      window.scrollTo(0, modalScrollPositionRef.current);
    }, 50);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMainTabChange = (tab) => {
    setActiveMainTab(tab);
    if (tab === 'chargers') {
      navigate('/charger-session');
    }
  };

  const handleLogout = async () => {
    try {
      stopLiveSessionsSSE();
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

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount || amount === '0' || amount === 0) return `${currency} 0`;
    return `${currency} ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get current sessions based on active tab
  const currentSessions = useMemo(() => {
    if (activeTab === 'all') {
      const merged = [...allSessions];

      liveSessionsData.sessions.forEach(liveSession => {
        const sessionKey = liveSession.id || liveSession.session_id;
        const exists = merged.some(s => {
          const sKey = s.id || s.session_id;
          return String(sKey) === String(sessionKey);
        });
        if (!exists) {
          merged.push({ ...liveSession, is_live: true });
        } else {
          const index = merged.findIndex(s => {
            const sKey = s.id || s.session_id;
            return String(sKey) === String(sessionKey);
          });
          if (index !== -1) {
            merged[index] = { ...merged[index], ...liveSession, is_live: true };
          }
        }
      });

      return merged;
    } else {
      return ongoingSessions;
    }
  }, [activeTab, allSessions, ongoingSessions, liveSessionsData.sessions]);

  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery) return currentSessions;
    const query = searchQuery.toLowerCase();
    return currentSessions.filter(session => {
      const idStr = String(session.id || session.session_id || '');
      const transactionIdStr = String(session.transaction_id || '');
      const chargerNameStr = String(session.charger_name || '');
      const chargerIdStr = String(session.charger_id || '');
      const hubNameStr = String(session.hub_name || '');
      const customerNameStr = String(session.customer_name || '');

      return (
        idStr.toLowerCase().includes(query) ||
        transactionIdStr.toLowerCase().includes(query) ||
        chargerNameStr.toLowerCase().includes(query) ||
        chargerIdStr.toLowerCase().includes(query) ||
        hubNameStr.toLowerCase().includes(query) ||
        customerNameStr.toLowerCase().includes(query)
      );
    });
  }, [currentSessions, searchQuery]);

  // Stats
  const totalSessions = allSessions.length;
  const ongoingCount = useMemo(() => {
    const count = currentSessions.filter(s => isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING').length;
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
              <option value="ACTIVE">Active</option>
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

    const isOngoing = isOngoingStatus(selectedSession.status) || selectedSession.status === 'ACTIVE' || selectedSession.status === 'STOP_PENDING';

    // COMPLETED sessions: duration = end_time - start_time (backend timestamps).
    // ONGOING/ACTIVE sessions: duration = ONLY the live duration_seconds from the
    // live-sessions SSE stream. No local-clock math either way.
    const durationSeconds = isOngoing
      ? (selectedSession.duration_seconds || 0)
      : (getCompletedDurationSeconds(selectedSession.start_time || selectedSession.started_at, selectedSession.end_time) ?? (selectedSession.duration_seconds || 0));

    const durationFormatted = formatDuration(durationSeconds);
    const durationMinutes = getDurationMinutes(durationSeconds);
    const durationShort = formatDurationShort(durationSeconds);

    const isLive = selectedSession.is_live || selectedSession.live_data || selectedSession.consumed_wh;
    const energy = getEnergyKwh(selectedSession);
    const soc = getSocPercent(selectedSession);
    const meterFreshness = getMeterFreshness(selectedSession);
    const socFreshness = getSocFreshness(selectedSession);
    const projectedAmount = getProjectedAmount(selectedSession);
    const currency = getCurrency(selectedSession);
    const transactionId = getTransactionId(selectedSession);

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl my-auto">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Session Details</h3>
                <p className="text-sm text-white/80">
                  ID: {truncateId(selectedSession.id || selectedSession.session_id)}
                  {isLive && isOngoing && (
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
                    {isLive && isOngoing && (
                      <span className="ml-2 text-xs text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {formatCurrency(projectedAmount || selectedSession.total_amount, currency)}
                    </p>
                    {isLive && isOngoing && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Live updating
                      </p>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Energy</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {energy > 0 ? energy.toFixed(2) : (selectedSession.total_kwh || 0)} kWh
                    </p>
                    {isLive && soc && (
                      <p className="text-xs text-gray-500 mt-1">SOC: {soc}%</p>
                    )}
                    {isLive && isOngoing && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Live updating
                      </p>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {durationFormatted}
                    </p>
                    {isOngoing && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Live (updating)
                      </p>
                    )}
                    {durationMinutes > 0 && !isOngoing && (
                      <p className="text-xs text-gray-400 mt-1">({durationMinutes} minutes)</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Session Info</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Session ID</span>
                        <span className="font-mono text-gray-900">{selectedSession.id || selectedSession.session_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-gray-900">{transactionId}</span>
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
                        <span className="text-gray-500">Charger Name</span>
                        <span className="text-gray-900">{selectedSession.charger?.name || selectedSession.charger_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Charger ID</span>
                        <span className="text-gray-900">{selectedSession.charger?.charger_id || selectedSession.charger_id || 'N/A'}</span>
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
                        <span className="text-gray-900">{formatDate(selectedSession.start_time || selectedSession.started_at)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">End Time</span>
                        <span className="text-gray-900">{selectedSession.end_time ? formatDate(selectedSession.end_time) : (isOngoing ? 'Ongoing' : 'N/A')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration</span>
                        <span className="text-gray-900 font-medium">{durationFormatted}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isLive && isOngoing && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live Session Data
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium text-green-700">{getStatusDisplayName(selectedSession.status)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Energy:</span>
                        <span className="ml-2 font-medium text-blue-700">{energy.toFixed(2)} kWh</span>
                      </div>
                      {soc && (
                        <div>
                          <span className="text-gray-500">SOC:</span>
                          <span className="ml-2 font-medium text-indigo-700">{soc}%</span>
                          {socFreshness && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${socFreshness === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {socFreshness}
                            </span>
                          )}
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-medium text-emerald-700">{formatCurrency(projectedAmount || selectedSession.total_amount, currency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium text-amber-700">{durationFormatted}</span>
                        {durationMinutes > 0 && (
                          <span className="ml-1 text-xs text-gray-400">({durationMinutes} min)</span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Meter:</span>
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${meterFreshness === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {meterFreshness}
                        </span>
                      </div>
                      {selectedSession.connector_number && (
                        <div>
                          <span className="text-gray-500">Connector:</span>
                          <span className="ml-2 font-medium text-gray-700">#{selectedSession.connector_number}</span>
                        </div>
                      )}
                    </div>
                    {selectedSession.started_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Started at: {formatDate(selectedSession.started_at)}
                      </p>
                    )}
                  </div>
                )}

                {selectedSession.stop_reason && selectedSession.stop_reason !== 'N/A' && !isOngoing && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stop Reason</p>
                    <p className="text-sm text-gray-700">{selectedSession.stop_reason}</p>
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

  // Helper to truncate ID
  const truncateId = (id) => {
    if (!id) return 'N/A';
    const strId = String(id);
    if (strId.length > 12) {
      return strId.substring(0, 12) + '...';
    }
    return strId;
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <h1 className="text-2xl font-bold text-gray-800">
                Chargers & Sessions
              </h1>

              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                / Dashboard
              </button>

              <span className="text-blue-600">/</span>
              <span className="text-blue-600 font-medium">
                Sessions
              </span>
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
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charger</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hub</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Connector</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Time</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Energy</th>
                      {/* Always show Amount column for both tabs */}
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && !hasLoaded && isInitialLoad ? (
                      <tr>
                        <td colSpan="14" className="px-3 py-12 text-center">
                          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                          <p className="text-gray-600">Loading sessions...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="14" className="px-3 py-12 text-center">
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
                        <td colSpan="14" className="px-3 py-12 text-center">
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
                        const isOngoing = isOngoingStatus(session.status) || session.status === 'ACTIVE' || session.status === 'STOP_PENDING';

                        // COMPLETED sessions: duration = end_time - start_time (both
                        // backend timestamps from the All Sessions API).
                        // ONGOING/ACTIVE sessions: duration = ONLY the live
                        // duration_seconds coming from the live-sessions SSE stream.
                        // No local-clock math in either case.
                        const durationSeconds = isOngoing
                          ? (session.duration_seconds || 0)
                          : (getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time) ?? (session.duration_seconds || 0));
                        const durationDisplay = durationSeconds ? formatDurationShort(durationSeconds) : 'N/A';

                        const isLive = session.is_live || liveSessionsMapRef.current[session.id || session.session_id];
                        const sessionId = session.id || session.session_id;
                        const isUpdated = updatedSessionIds.has(sessionId);

                        let displayEnergy = session.total_kwh || '0';
                        let displaySoc = session.soc_percent || null;
                        let displayAmount = session.total_amount || '0';
                        let displayCurrency = session.currency || 'INR';

                        if (isLive) {
                          const energy = getEnergyKwh(session);
                          displayEnergy = energy > 0 ? energy.toFixed(2) : (session.total_kwh || '0');
                          displaySoc = getSocPercent(session) || null;
                          const projectedAmount = getProjectedAmount(session);
                          if (projectedAmount > 0) {
                            displayAmount = projectedAmount;
                          }
                          displayCurrency = getCurrency(session);
                        }

                        // Get connector number, transaction ID, and charger ID.
                        // Transaction id: prefer the live SSE ocpp_transaction_id
                        // (via the shared liveSessionsMapRef) so ongoing rows always
                        // show the same live transaction id as the Ongoing tab does.
                        const connectorNumber = session.connector?.number || session.connector_number || 'N/A';
                        const liveMapEntry = liveSessionsMapRef.current[sessionId];
                        const transactionId = liveMapEntry?.ocpp_transaction_id
                          || session.ocpp_transaction_id
                          || session.transaction_id
                          || 'N/A';
                        const chargerId = session.charger?.charger_id || session.charger_id || session.charger?.id || 'N/A';
                        const chargerName = session.charger?.name || session.charger_name || 'N/A';

                        return (
                          <tr
                            key={sessionId || session.transaction_id || index}
                            className={`border-b border-gray-100 hover:bg-gray-50/50 transition cursor-pointer ${
                              isLive && isOngoing ? 'bg-green-50/30' : ''
                            } ${
                              isUpdated && isLive ? 'animate-pulse-update' : ''
                            }`}
                            onClick={() => handleSessionClick(sessionId)}
                          >
                            <td className="px-3 py-3 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-3 py-3 text-sm font-mono text-gray-600">
                              {truncateId(sessionId)}
                            </td>
                            <td className="px-3 py-3 text-sm font-mono text-gray-600">
                              {truncateId(transactionId)}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-700">
                              {session.customer?.name || session.customer_name || 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800">{chargerName}</span>
                                <span className="text-xs text-gray-400">ID: {chargerId}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600">
                              {session.charger?.hub_name || session.hub_name || 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-sm font-mono text-gray-500">
                              #{connectorNumber}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600">
                              {formatDate(session.start_time || session.started_at)}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600">
                              {isOngoing ? 'Ongoing' : (session.end_time ? formatDate(session.end_time) : 'N/A')}
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-700">{durationDisplay}</span>
                                {isLive && isOngoing && (
                                  <span className="text-xs text-green-600 flex items-center gap-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">{displayEnergy} kWh</span>
                                {isLive && displaySoc && (
                                  <span className="ml-1 text-xs text-purple-600">
                                    · SOC: {displaySoc}%
                                  </span>
                                )}
                                {isLive && isOngoing && (
                                  <span className="ml-1 text-xs text-green-600 flex items-center gap-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Live
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Amount column - always shown for both tabs */}
                            <td className="px-3 py-3 text-sm font-medium text-gray-700">
                              {formatCurrency(displayAmount, displayCurrency)}
                              {isLive && isOngoing && (
                                <span className="ml-1 text-xs text-green-600 flex items-center gap-0.5">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                  Live
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                {getStatusIcon(session.status)}
                                {getStatusDisplayName(session.status)}
                              </span>
                              {isLive && isOngoing && (
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
                                  handleSessionClick(sessionId);
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
        @keyframes pulseUpdate {
          0% { background-color: rgba(34, 197, 94, 0); }
          30% { background-color: rgba(34, 197, 94, 0.25); }
          60% { background-color: rgba(34, 197, 94, 0.15); }
          100% { background-color: rgba(34, 197, 94, 0); }
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
        .animate-pulse-update {
          animation: pulseUpdate 1.2s ease-in-out forwards;
        }
        tr.animate-pulse-update {
          transition: background-color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Sessions;

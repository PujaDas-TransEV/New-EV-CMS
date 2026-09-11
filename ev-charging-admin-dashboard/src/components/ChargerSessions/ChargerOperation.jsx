import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  ArrowLeft,
  Zap,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  Power,
  Unlock,
  RefreshCw,
  Send,
  FileText,
  Edit,
  Save,
  Shield,
  Clock,
  Plug,
  Circle,
  ChevronDown,
  Info,
  AlertTriangle,
  Trash2,
  Plus,
  LogOut,
  User,
  Building,
  History,
  Copy,
  HelpCircle,
  Lock,
  Filter,
  ScrollText,
  SearchCheck
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

// ============================================================================
// Status / State Configurations
// ============================================================================
const OCPP_STATUS_CONFIG = {
  'Available': { label: 'Available', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
  'Preparing': { label: 'Preparing', icon: <Clock className="w-3 h-3 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  'Charging': { label: 'Charging', icon: <Zap className="w-3 h-3 text-blue-500" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'Finishing': { label: 'Finishing', icon: <CheckCircle className="w-3 h-3 text-purple-500" />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'Faulted': { label: 'Faulted', icon: <AlertCircle className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
  'Unknown': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

const CONNECTION_STATUS_CONFIG = {
  'ONLINE': { label: 'Online', icon: <Wifi className="w-3 h-3 text-green-500" />, color: 'bg-green-100 text-green-700 border-green-200' },
  'OFFLINE': { label: 'Offline', icon: <WifiOff className="w-3 h-3 text-red-500" />, color: 'bg-red-100 text-red-700 border-red-200' },
  'UNKNOWN': { label: 'Unknown', icon: <Circle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

// Per handoff §4.4 — durable ChargerOperation states. Copy intentionally never
// claims later physical effect from protocol acknowledgement alone.
const OPERATION_STATE_CONFIG = {
  PERSISTED: {
    label: 'Pending / Recorded',
    copy: 'CMS durably recorded the operation before HAL I/O.',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  HAL_ACCEPTED: {
    label: 'Accepted by transport layer',
    copy: 'Accepted by transport layer; pending charger acknowledgement.',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  OCPP_CONFIRMED: {
    label: 'Charger acknowledged',
    copy: 'Charger acknowledged the command. This does not confirm later physical effect.',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  RECONCILIATION_REQUIRED: {
    label: 'Outcome uncertain',
    copy: 'Delivery outcome is uncertain. Use exact recovery instead of retrying the action.',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertTriangle className="w-3.5 h-3.5" />
  },
  CONFIRMED_ABSENT: {
    label: 'Not found / Absent',
    copy: 'Recovery confirmed the transport layer has no durable operation with this ID.',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />
  }
};

const getStatusDisplay = (status, config) => {
  return config[status] || config['Unknown'] || {
    label: status || 'Unknown',
    icon: <Circle className="w-3 h-3 text-gray-400" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200'
  };
};

const getStateDisplay = (state) => {
  return OPERATION_STATE_CONFIG[state] || {
    label: state || 'Unknown',
    copy: '',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <Circle className="w-3.5 h-3.5" />
  };
};

// Per handoff §18.5 — safe, honest wording per kind/result. Never upgrades
// protocol acknowledgement into a claim of later physical effect.
const getResultWording = (op) => {
  if (!op) return '';
  const { kind, state, ocpp_result: result } = op;
  const stateDisplay = getStateDisplay(state);

  if (state === 'RECONCILIATION_REQUIRED' || state === 'CONFIRMED_ABSENT' || state === 'PERSISTED' || state === 'HAL_ACCEPTED') {
    return stateDisplay.copy;
  }
  if (state === 'OCPP_CONFIRMED') {
    const r = result || 'Unknown';
    switch (kind) {
      case 'RESET':
        return `Charger acknowledged Reset: ${r}.`;
      case 'UNLOCK_CONNECTOR':
        return `Charger returned ${r} for Unlock Connector.`;
      case 'CHANGE_AVAILABILITY':
        return `Charger returned ${r}.`;
      case 'CLEAR_CACHE':
        return `Charger returned ${r} for Clear Cache.`;
      case 'CHANGE_CONFIGURATION':
        return `Configuration response: ${r}.`;
      case 'TRIGGER_MESSAGE':
        return `Charger accepted TriggerMessage: ${r}. This does not confirm the follow-up notification arrived.`;
      case 'GET_CONFIGURATION':
        return `Charger returned ${r} for Get Configuration.`;
      default:
        return `Charger acknowledged the command: ${r}.`;
    }
  }
  return stateDisplay.copy;
};

const FRESHNESS_CONFIG = {
  FRESH: { label: 'Fresh', color: 'bg-green-100 text-green-700 border-green-200' },
  STALE: { label: 'Stale', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  UNKNOWN: { label: 'Unknown', color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

const getFreshnessDisplay = (freshness) => FRESHNESS_CONFIG[freshness] || FRESHNESS_CONFIG.UNKNOWN;

// Short "3m ago" / "2h ago" style relative time for live `observed_at` timestamps.
const formatRelativeTime = (isoString) => {
  if (!isoString) return null;
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  const diffSec = Math.max(0, Math.round(diffMs / 1000));
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
};

const TRIGGER_MESSAGE_ALLOWLIST = [
  'BootNotification',
  'DiagnosticsStatusNotification',
  'FirmwareStatusNotification',
  'Heartbeat',
  'MeterValues',
  'StatusNotification'
];

const OPERATION_KIND_LABEL = {
  RESET: 'Reset',
  UNLOCK_CONNECTOR: 'Unlock Connector',
  CHANGE_AVAILABILITY: 'Change Availability',
  CLEAR_CACHE: 'Clear Cache',
  CHANGE_CONFIGURATION: 'Change Configuration',
  TRIGGER_MESSAGE: 'Trigger Message',
  GET_CONFIGURATION: 'Get Configuration (Audited)'
};

// Per handoff §11 — client-side hint only. The server is the sole enforcer;
// this list exists purely so the UI can explain a 400 before the user hits it.
const RESERVED_CONFIGURATION_KEYS = new Set([
  'HeartbeatInterval',
  'MeterValueInterval',
  'MeterValueSampleInterval',
  'AuthorizeRemoteTxRequests',
  'LocalAuthorizeOffline',
  'LocalPreAuthorize',
  'AuthorizationCacheEnabled',
  'AllowOfflineTxForUnknownId',
  'StopTransactionOnInvalidId',
  'ChargePointAuthEnable',
  'FreeVendEnabled'
]);
const SENSITIVE_KEY_FRAGMENTS = ['password', 'secret', 'token', 'privatekey', 'certificate'];

const isLikelyReservedOrSensitiveKey = (rawKey) => {
  const key = (rawKey || '').trim();
  if (!key) return null;
  if (RESERVED_CONFIGURATION_KEYS.has(key)) return 'reserved';
  const lower = key.toLowerCase();
  if (lower === 'authorizationkey' || SENSITIVE_KEY_FRAGMENTS.some(f => lower.includes(f))) return 'sensitive';
  return null;
};

// Per handoff §20 — friendlier fallback copy keyed by stable error.code.
// Server message still wins when present; this only fills gaps / adds guidance.
const ERROR_CODE_HINTS = {
  forbidden: 'Your account does not have the required permission for this action.',
  password_change_required: 'You must change your temporary password before continuing.',
  cpo_app_id_mismatch: 'Your session context is out of date. Please sign in again.',
  idempotency_conflict: 'This action was already submitted with different details. Refresh and try again as a new action.',
  invalid_idempotency_key: 'Could not tag this request as a single action — please retry.',
  mapping_unavailable: 'This charger is not currently synchronized with the transport layer. Try again shortly.',
  hal_unavailable: 'The charger transport layer is temporarily unavailable. Try again shortly.',
  charger_not_connected: 'Configuration could not be read — the charger is not currently connected.',
  reserved_configuration_key: 'This key is managed automatically and cannot be changed here.',
  sensitive_configuration_key: 'This key requires a secure workflow and cannot be changed here.',
  unsupported_operation: 'That message type is not on the supported allowlist.',
  charger_operation_not_found: 'That operation could not be found.',
  connector_not_found: 'That connector could not be found on this charger.',
  charger_not_found: 'That charger could not be found.'
};

// ============================================================================
// OCPP Protocol Evidence panel — lazy, bounded polling, honest empty states
// (handoff §14, §16.5, §18.3, §19.6)
// ============================================================================
const OCPP_EVIDENCE_POLL_INTERVAL_MS = 2500;
const OCPP_EVIDENCE_MAX_POLLS = 6; // ~15s bounded window, then require manual refresh

const OcppEvidencePanel = ({ operationId, authenticatedRequest, isVisible }) => {
  const [exchanges, setExchanges] = useState(null); // null = not yet fetched
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollAttempts, setPollAttempts] = useState(0);
  const pollTimerRef = useRef(null);

  const fetchExchanges = useCallback(async () => {
    if (!operationId) return;
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/cpo/operations/charger-operations/${operationId}/ocpp-exchanges`,
        { method: 'GET' }
      );
      if (response.ok) {
        const data = await response.json();
        setExchanges(data.exchanges || []);
        return data.exchanges || [];
      } else {
        setError('Could not load protocol evidence.');
        return null;
      }
    } catch (e) {
      setError('Could not load protocol evidence.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [operationId, authenticatedRequest]);

  useEffect(() => {
    setExchanges(null);
    setPollAttempts(0);
    setError('');
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    if (isVisible && operationId) {
      fetchExchanges();
    }
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationId, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const isEmpty = Array.isArray(exchanges) && exchanges.length === 0;
    if (isEmpty && pollAttempts < OCPP_EVIDENCE_MAX_POLLS) {
      pollTimerRef.current = setTimeout(async () => {
        const result = await fetchExchanges();
        setPollAttempts(prev => prev + 1);
        if (result && result.length > 0 && pollTimerRef.current) {
          clearTimeout(pollTimerRef.current);
        }
      }, OCPP_EVIDENCE_POLL_INTERVAL_MS);
    }
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchanges, pollAttempts, isVisible]);

  if (!operationId) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
          <ScrollText size={14} className="text-gray-400" />
          OCPP Protocol Evidence
        </h4>
        <button
          onClick={() => { setPollAttempts(0); fetchExchanges(); }}
          disabled={loading}
          className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {exchanges === null && loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
          <Loader2 size={14} className="animate-spin" /> Loading protocol evidence...
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {Array.isArray(exchanges) && exchanges.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
          {pollAttempts < OCPP_EVIDENCE_MAX_POLLS ? (
            <>
              <Loader2 size={13} className="animate-spin flex-shrink-0" />
              Protocol evidence is still being delivered — this refreshes automatically.
            </>
          ) : (
            <>
              <Info size={13} className="flex-shrink-0" />
              No protocol evidence recorded yet. This can be normal for delayed delivery — use Refresh to check again.
            </>
          )}
        </div>
      )}

      {Array.isArray(exchanges) && exchanges.length > 0 && (
        <div className="space-y-3">
          {exchanges.map((ex) => (
            <div key={ex.unique_id} className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">{ex.action}</span>
                <span className="text-[10px] font-mono text-gray-400">unique_id: {ex.unique_id}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-white border border-gray-200 rounded-lg p-2">
                  <p className="text-[10px] font-semibold text-blue-600 mb-1">SENT · {ex.sent?.message_type || 'CALL'}</p>
                  {ex.sent ? (
                    <>
                      <p className="text-[10px] text-gray-400 mb-1">{ex.sent.occurred_at ? new Date(ex.sent.occurred_at).toLocaleTimeString() : ''}</p>
                      <pre className="text-[10px] font-mono text-gray-700 whitespace-pre-wrap break-all">{JSON.stringify(ex.sent.payload, null, 2)}</pre>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400">No sent evidence recorded</p>
                  )}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-2">
                  <p className={`text-[10px] font-semibold mb-1 ${ex.received?.message_type === 'CALLERROR' ? 'text-red-600' : 'text-emerald-600'}`}>
                    RECEIVED{ex.received ? ` · ${ex.received.message_type}` : ''}
                  </p>
                  {ex.received ? (
                    <>
                      <p className="text-[10px] text-gray-400 mb-1">{ex.received.occurred_at ? new Date(ex.received.occurred_at).toLocaleTimeString() : ''}</p>
                      <pre className="text-[10px] font-mono text-gray-700 whitespace-pre-wrap break-all">{JSON.stringify(ex.received.payload, null, 2)}</pre>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400">No response evidence recorded</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// History Modal Component
// ============================================================================
const HistoryModal = ({ isOpen, onClose, cmsChargerId, authenticatedRequest, onOpenOperation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState({ before: null, before_id: null, has_more: false });
  const [filters, setFilters] = useState({
    kind: '',
    state: '',
    connector_id: '',
    created_after: '',
    created_before: '',
    typedValue: '' // reset_type | availability_type | requested_message | configuration_key, depending on kind
  });
  const [error, setError] = useState('');

  // Per handoff §15.3 — at most one typed parameter filter, and it must match
  // the selected kind. We derive the active typed-filter name from `kind` so
  // the UI can never construct a conflicting combination.
  const typedFilterName = {
    RESET: 'reset_type',
    CHANGE_AVAILABILITY: 'availability_type',
    TRIGGER_MESSAGE: 'requested_message',
    CHANGE_CONFIGURATION: 'configuration_key'
  }[filters.kind] || null;

  const fetchHistory = useCallback(async (loadMore = false) => {
    if (!cmsChargerId) return;
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      let url = `${API_BASE_URL}/api/v1/cpo/operations/charger-operations?charger_id=${encodeURIComponent(cmsChargerId)}&limit=20`;
      if (loadMore && cursor.before && cursor.before_id) {
        url += `&before=${encodeURIComponent(cursor.before)}&before_id=${encodeURIComponent(cursor.before_id)}`;
      }
      if (filters.kind) url += `&kind=${encodeURIComponent(filters.kind)}`;
      if (filters.state) url += `&state=${encodeURIComponent(filters.state)}`;
      if (filters.connector_id) url += `&connector_id=${encodeURIComponent(filters.connector_id)}`;
      if (filters.created_after) url += `&created_after=${encodeURIComponent(new Date(filters.created_after).toISOString())}`;
      if (filters.created_before) url += `&created_before=${encodeURIComponent(new Date(filters.created_before).toISOString())}`;
      if (typedFilterName && filters.typedValue) {
        url += `&${typedFilterName}=${encodeURIComponent(filters.typedValue)}`;
      }

      const response = await authenticatedRequest(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        const items = data.operations || [];
        setHistory(prev => (loadMore ? [...prev, ...items] : items));
        setCursor({
          before: data.next_before || null,
          before_id: data.next_before_id || null,
          has_more: Boolean(data.has_more)
        });
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(ERROR_CODE_HINTS[errData?.error?.code] || errData.error?.message || 'Failed to load history');
      }
    } catch (err) {
      setError('An error occurred while loading history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cmsChargerId, authenticatedRequest, cursor.before, cursor.before_id, filters, typedFilterName]);

  useEffect(() => {
    if (isOpen && cmsChargerId) {
      setHistory([]);
      setCursor({ before: null, before_id: null, has_more: false });
      fetchHistory(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cmsChargerId, filters]);

  const loadMore = () => {
    if (cursor.has_more && !loadingMore && !loading) {
      fetchHistory(true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      // Changing kind invalidates any previously chosen typed value, since
      // a typed filter only applies to the kind it belongs to (§15.3).
      if (key === 'kind') next.typedValue = '';
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      kind: '',
      state: '',
      connector_id: '',
      created_after: '',
      created_before: '',
      typedValue: ''
    });
  };

  if (!isOpen) return null;

  const renderTypedFilterControl = () => {
    if (!typedFilterName) return null;
    if (typedFilterName === 'reset_type') {
      return (
        <select
          value={filters.typedValue}
          onChange={(e) => handleFilterChange('typedValue', e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any reset type</option>
          <option value="SOFT">Soft</option>
          <option value="HARD">Hard</option>
        </select>
      );
    }
    if (typedFilterName === 'availability_type') {
      return (
        <select
          value={filters.typedValue}
          onChange={(e) => handleFilterChange('typedValue', e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any availability type</option>
          <option value="OPERATIVE">Operative</option>
          <option value="INOPERATIVE">Inoperative</option>
        </select>
      );
    }
    if (typedFilterName === 'requested_message') {
      return (
        <select
          value={filters.typedValue}
          onChange={(e) => handleFilterChange('typedValue', e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any message type</option>
          {TRIGGER_MESSAGE_ALLOWLIST.map((msg) => (
            <option key={msg} value={msg}>{msg}</option>
          ))}
        </select>
      );
    }
    if (typedFilterName === 'configuration_key') {
      return (
        <input
          type="text"
          value={filters.typedValue}
          onChange={(e) => handleFilterChange('typedValue', e.target.value)}
          placeholder="Configuration key"
          maxLength={100}
          className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <History size={22} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Operation History</h2>
            <span className="text-sm text-gray-400">({history.length} records)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filters:</span>
            </div>
            <select
              value={filters.kind}
              onChange={(e) => handleFilterChange('kind', e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Operations</option>
              {Object.entries(OPERATION_KIND_LABEL).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {Object.entries(OPERATION_STATE_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            {renderTypedFilterControl()}
            <input
              type="datetime-local"
              value={filters.created_after}
              onChange={(e) => handleFilterChange('created_after', e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From"
            />
            <input
              type="datetime-local"
              value={filters.created_before}
              onChange={(e) => handleFilterChange('created_before', e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="To"
            />
            <button
              onClick={clearFilters}
              className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-xl transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <History size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No operations found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operation</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">OCPP Result</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Connector</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((op) => {
                    const stateDisplay = getStateDisplay(op.state);
                    const kindLabel = OPERATION_KIND_LABEL[op.kind] || op.kind;
                    // Per handoff §15.5 — ChangeConfiguration value is NEVER exposed
                    // here, only the key. GET_CONFIGURATION exposes requested key
                    // names only, never returned values.
                    let details = '';
                    if (op.parameters) {
                      if (op.parameters.type) details += `Type: ${op.parameters.type}`;
                      if (op.parameters.reason) details += ` | Reason: ${op.parameters.reason}`;
                      if (op.parameters.requested_message) details += ` | Message: ${op.parameters.requested_message}`;
                      if (op.parameters.key) details += ` | Key: ${op.parameters.key}`;
                      if (op.parameters.configuration_keys?.length) details += ` | Keys: ${op.parameters.configuration_keys.join(', ')}`;
                    }
                    return (
                      <tr
                        key={op.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => onOpenOperation && onOpenOperation(op.id)}
                      >
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {op.created_at ? new Date(op.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{kindLabel}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${stateDisplay.color}`}>
                            {stateDisplay.icon}
                            {stateDisplay.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{op.ocpp_result || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {op.connector ? `#${op.connector.number}` : 'Charger-wide'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{op.actor?.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate" title={details}>
                          {details || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination / Load More */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50/50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {history.length} records
          </span>
          {cursor.has_more && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Load Older
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Operation Card — always visible (no accordion). A quiet left accent bar
// carries the color-coding instead of a heavy gradient icon block, so the
// grid reads calmly even with every card open at once.
// ============================================================================
const OperationCard = memo(({
  title,
  icon,
  children,
  description,
  badge,
  accent = 'blue',
  locked = false,
  lockedNote,
  className = ''
}) => {
  const accentMap = {
    blue: { bar: 'bg-blue-500', icon: 'text-blue-600 bg-blue-50', badge: 'text-blue-700 bg-blue-50' },
    green: { bar: 'bg-emerald-500', icon: 'text-emerald-600 bg-emerald-50', badge: 'text-emerald-700 bg-emerald-50' },
    purple: { bar: 'bg-purple-500', icon: 'text-purple-600 bg-purple-50', badge: 'text-purple-700 bg-purple-50' },
    amber: { bar: 'bg-amber-500', icon: 'text-amber-600 bg-amber-50', badge: 'text-amber-700 bg-amber-50' },
    indigo: { bar: 'bg-indigo-500', icon: 'text-indigo-600 bg-indigo-50', badge: 'text-indigo-700 bg-indigo-50' },
    slate: { bar: 'bg-slate-500', icon: 'text-slate-600 bg-slate-50', badge: 'text-slate-700 bg-slate-50' }
  };
  const tone = accentMap[accent] || accentMap.blue;

  return (
    <div className={`relative flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${tone.bar}`} />
      <div className="pl-6 pr-5 pt-5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tone.icon}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-gray-900 truncate">{title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {locked && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full flex items-center gap-1">
                <Lock size={10} /> Restricted
              </span>
            )}
            {badge && !locked && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${tone.badge}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-100 mx-6" />
      <div className="pl-6 pr-5 py-5 flex-1">
        {locked ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <Lock size={14} />
            {lockedNote || 'You do not have permission to use this operation.'}
          </div>
        ) : children}
      </div>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================
const ChargerOperations = () => {
  const navigate = useNavigate();
  const { chargerId } = useParams();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();

  // State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [charger, setCharger] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationResult, setOperationResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [activeOperation, setActiveOperation] = useState(null);

  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Operation states
  const [resetType, setResetType] = useState('SOFT');
  const [resetReason, setResetReason] = useState('');
  const [unlockConnectorId, setUnlockConnectorId] = useState('');
  const [availabilityType, setAvailabilityType] = useState('OPERATIVE');
  const [availabilityConnectorId, setAvailabilityConnectorId] = useState('');
  const [triggerMessage, setTriggerMessage] = useState('BootNotification');
  const [triggerConnectorId, setTriggerConnectorId] = useState('');
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');
  const [configData, setConfigData] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [auditedReadKeys, setAuditedReadKeys] = useState('');

  // Toast
  const [showToast, setShowToast] = useState({ visible: false, message: '', type: '' });

  // Per handoff §4.3 — one Idempotency-Key represents one user intent. We key
  // pending intents by operation slot + a hash of the exact payload: a retry
  // of the SAME request reuses the SAME key; changing the inputs (a genuinely
  // new intent) mints a fresh one. Keys are cleared once an intent completes.
  const idempotencyRef = useRef({});

  const getIdempotencyKey = useCallback((operationKey, body) => {
    const payloadHash = JSON.stringify(body ?? null);
    const existing = idempotencyRef.current[operationKey];
    if (existing && existing.payloadHash === payloadHash) {
      return existing.key;
    }
    const key = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    idempotencyRef.current[operationKey] = { key, payloadHash };
    return key;
  }, []);

  const clearIdempotencyKey = useCallback((operationKey) => {
    delete idempotencyRef.current[operationKey];
  }, []);

  // The CMS charger UUID
  const cmsChargerId = charger?.id || chargerId;
  const connectors = charger?.connectors || [];

  const hasOperationsPermission = permissions.length === 0 || permissions.includes('chargers.operations');
  const hasManagePermission = permissions.length === 0 || permissions.includes('chargers.manage');

  // ============================================================================
  // Helpers
  // ============================================================================

  const showToastMessage = useCallback((message, type = 'success') => {
    setShowToast({ visible: true, message, type });
    setTimeout(() => {
      setShowToast({ visible: false, message: '', type: '' });
    }, 4500);
  }, []);

  const parseApiError = async (response) => {
    const requestId = response.headers?.get ? response.headers.get('X-Request-ID') : null;
    let code = 'unknown_error';
    let message = 'An error occurred';
    try {
      const data = await response.json();
      code = data?.error?.code || code;
      message = data?.error?.message || message;
    } catch (e) { /* no-op: non-JSON error body */ }
    return { code, message: ERROR_CODE_HINTS[code] || message, requestId };
  };

  const connectorLabel = useCallback((connector) => {
    if (!connector) return 'Unknown connector';
    return `Connector #${connector.connector_number}${connector.connector_type ? ` — ${connector.connector_type}` : ''}`;
  }, []);

  const copyToClipboard = useCallback(async (value, label = 'Value') => {
    try {
      await navigator.clipboard.writeText(value);
      showToastMessage(`${label} copied to clipboard`, 'success');
    } catch (e) {
      showToastMessage('Could not copy to clipboard', 'error');
    }
  }, [showToastMessage]);

  // ============================================================================
  // API Calls
  // ============================================================================

  const fetchChargerDetails = useCallback(async () => {
    if (!chargerId) return;
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/cpo/operations/chargers/${chargerId}`,
        { method: 'GET', cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        // The operational-read response shape is { charger: {...}, live: {...} }
        // — `live` is a SIBLING of `charger`, not nested inside it. Merge it in
        // here so every downstream read (`charger.live.charger.connection_state`,
        // `charger.live.connectors[...]`) actually finds it instead of silently
        // falling back to "Unknown" / offline.
        const chargerObj = data.charger || data.data || data;
        const liveObj = data.live || chargerObj?.live || null;
        setCharger({ ...chargerObj, live: liveObj });
      } else {
        const err = await parseApiError(response);
        setError(err.message || 'Failed to fetch charger details');
      }
    } catch (err) {
      setError('An error occurred while fetching charger details');
    } finally {
      setLoading(false);
    }
  }, [chargerId, authenticatedRequest]);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/cpo/access/me`,
        { method: 'GET', cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.effective_permissions || data.permissions || []);
      }
    } catch (err) {
      console.error('Permission fetch error:', err);
    }
  }, [authenticatedRequest]);

  // Generic durable-operation runner. `mapResponse` lets callers (e.g. the
  // audited configuration read, whose 202 body is { operation, configuration })
  // normalize the JSON body into { operation, extra } while everything else
  // (idempotency reuse, error handling, toasts, result modal) stays shared.
  const runOperation = useCallback(async (operationKey, path, body, successPrefix, mapResponse = (d) => ({ operation: d, extra: null })) => {
    setOperationLoading(true);
    setOperationResult(null);
    setActiveOperation(operationKey);
    const idempotencyKey = getIdempotencyKey(operationKey, body);
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/cpo/operations/chargers/${cmsChargerId}/${path}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {})
        }
      );
      const requestId = response.headers.get('X-Request-ID');
      if (response.ok) {
        const raw = await response.json();
        const { operation, extra } = mapResponse(raw);
        clearIdempotencyKey(operationKey); // intent fulfilled; a future click is a new intent
        setOperationResult({ success: true, data: operation, extra, requestId, message: successPrefix });
        showToastMessage(`${successPrefix} — ${getStateDisplay(operation.state).label}`, 'success');
        return operation;
      } else {
        // Keep the same idempotency key: an unchanged retry of this exact
        // payload must reuse it, not mint a new physical intent (§4.3, §19.1).
        const err = await parseApiError(response);
        if (err.code === 'forbidden') fetchPermissions();
        setOperationResult({ success: false, error: err.message, code: err.code, requestId: err.requestId });
        showToastMessage(`${err.code}: ${err.message}`, 'error');
        return null;
      }
    } catch (err) {
      // Network failure: preserve the key so "Retry" resubmits the identical
      // intent rather than risking a duplicate physical command (§19.1).
      setOperationResult({ success: false, error: 'Request failed. Check your connection and retry with the same action.' });
      showToastMessage('Request failed. Check your connection and retry with the same action.', 'error');
      return null;
    } finally {
      setOperationLoading(false);
      setShowResultModal(true);
    }
  }, [authenticatedRequest, cmsChargerId, showToastMessage, getIdempotencyKey, clearIdempotencyKey, fetchPermissions]);

  // Operation handlers
  const handleReset = useCallback(async () => {
    if (resetReason.trim().length < 3) {
      showToastMessage('Reason must be at least 3 characters', 'error');
      return;
    }
    await runOperation('reset', 'reset', { type: resetType, reason: resetReason.trim() }, `${resetType} reset requested`);
  }, [resetType, resetReason, runOperation, showToastMessage]);

  const handleUnlock = useCallback(async () => {
    if (!unlockConnectorId) {
      showToastMessage('Please select a connector', 'error');
      return;
    }
    const result = await runOperation('unlock', 'unlock', { connector_id: unlockConnectorId }, 'Unlock requested');
    if (result) setUnlockConnectorId('');
  }, [unlockConnectorId, runOperation, showToastMessage]);

  const handleAvailability = useCallback(async () => {
    const payload = { type: availabilityType };
    if (availabilityConnectorId) {
      payload.connector_id = availabilityConnectorId;
    }
    const result = await runOperation('availability', 'availability', payload, 'Availability change requested');
    if (result) setAvailabilityConnectorId('');
  }, [availabilityType, availabilityConnectorId, runOperation]);

  const handleClearCache = useCallback(async () => {
    await runOperation('clearCache', 'clear-cache', undefined, 'Clear cache requested');
  }, [runOperation]);

  const handleTriggerMessage = useCallback(async () => {
    const payload = { requested_message: triggerMessage };
    if (triggerConnectorId) {
      payload.connector_id = triggerConnectorId;
    }
    await runOperation('triggerMessage', 'trigger-message', payload, `${triggerMessage} trigger requested`);
  }, [triggerMessage, triggerConnectorId, runOperation]);

  // Compatibility read (§10.1) — no Idempotency-Key, no durable operation,
  // no history row. Safe for passive load/refresh.
  const handleGetConfiguration = useCallback(async () => {
    setConfigLoading(true);
    setConfigData(null);
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/cpo/operations/chargers/${cmsChargerId}/configuration`,
        { method: 'GET', cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        setConfigData(data);
        showToastMessage('Configuration retrieved', 'success');
      } else {
        const err = await parseApiError(response);
        showToastMessage(`${err.code}: ${err.message}`, 'error');
      }
    } catch (err) {
      showToastMessage('Failed to get configuration', 'error');
    } finally {
      setConfigLoading(false);
    }
  }, [authenticatedRequest, cmsChargerId, showToastMessage]);

  // Explicit audited read (§10.2) — durable GET_CONFIGURATION operation with
  // its own Idempotency-Key, history row, and protocol evidence. Deliberately
  // separate from the compatibility GET above; never used for passive polling.
  const handleAuditedConfigurationRead = useCallback(async () => {
    const keys = auditedReadKeys
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
    if (keys.length > 64) {
      showToastMessage('At most 64 keys may be requested at once', 'error');
      return;
    }
    const body = keys.length > 0 ? { keys } : {};
    const operation = await runOperation(
      'auditedConfigRead',
      'configuration/read',
      body,
      keys.length > 0 ? `Audited read requested for ${keys.length} key(s)` : 'Audited read requested for all keys',
      (raw) => ({ operation: raw.operation, extra: raw.configuration || null })
    );
    if (operation) {
      // The transient `configuration` member (if present in this response)
      // is shown inside the result modal via `extra` — not assumed to be
      // reproduced on an idempotent retry (§10.2 "Idempotent retry nuance").
    }
  }, [auditedReadKeys, runOperation, showToastMessage]);

  const handleSetConfiguration = useCallback(async () => {
    if (!configKey || !configValue) {
      showToastMessage('Please enter both key and value', 'error');
      return;
    }
    const keyIssue = isLikelyReservedOrSensitiveKey(configKey);
    if (keyIssue === 'reserved') {
      showToastMessage(ERROR_CODE_HINTS.reserved_configuration_key, 'error');
      return;
    }
    if (keyIssue === 'sensitive') {
      showToastMessage(ERROR_CODE_HINTS.sensitive_configuration_key, 'error');
      return;
    }
    const result = await runOperation(
      'setConfig',
      'configuration',
      { key: configKey.trim(), value: configValue },
      `Configuration "${configKey.trim()}" update requested`
    );
    if (result) {
      setConfigKey('');
      setConfigValue('');
      handleGetConfiguration();
    }
  }, [configKey, configValue, runOperation, showToastMessage, handleGetConfiguration]);

  // Exact operation read / recovery (§13, §19.2) — never re-POSTs the
  // physical command; only performed on explicit user action.
  const fetchExactOperation = useCallback(async (operationId) => {
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/cpo/operations/charger-operations/${operationId}`,
        { method: 'GET', cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        setOperationResult(prev => (prev ? { ...prev, data } : { success: true, data }));
        setShowResultModal(true);
        showToastMessage('Operation status refreshed', 'info');
        return data;
      } else {
        const err = await parseApiError(response);
        showToastMessage(`${err.code}: ${err.message}`, 'error');
        return null;
      }
    } catch (err) {
      showToastMessage('Failed to check operation status', 'error');
      return null;
    }
  }, [authenticatedRequest, showToastMessage]);

  const handleOpenOperationFromHistory = useCallback(async (operationId) => {
    setOperationLoading(true);
    const data = await fetchExactOperation(operationId);
    setOperationLoading(false);
    if (data) {
      setOperationResult({ success: true, data, requestId: null, message: 'Loaded from history' });
      setShowResultModal(true);
    }
  }, [fetchExactOperation]);

  // ============================================================================
  // User Info
  // ============================================================================
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/auth/me`,
        { method: 'GET', cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('User info error:', err);
    }
  }, [authenticatedRequest]);

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchPermissions();
    fetchChargerDetails();
  }, [isAuthenticated, navigate, fetchUserInfo, fetchPermissions, fetchChargerDetails]);

  // ============================================================================
  // Menus
  // ============================================================================
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {(userData?.user?.full_name || user?.name || 'U').charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || user?.name || 'User'}
            </h4>
            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email || user?.email || 'user@transev.com'}
            </p>
          </div>
        </div>
      </div>
      <div className="p-2">
        <button onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3">
          <User size={16} /> <span>Profile</span>
        </button>
        <button onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3">
          <Building size={16} /> <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1" />
        <button onClick={() => { setShowSettingsMenu(false); logout(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 flex items-center gap-3">
          <LogOut size={16} /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate('/add-hub'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3">
          <Plus size={18} /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate('/add-charger'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3">
          <Zap size={18} /> Add Charger
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // Result Modal — operation truth summary + lazy OCPP protocol evidence
  // (§18.3). success !== false because a loaded-from-history / exact-GET
  // result never carries an explicit `success` flag.
  // ============================================================================
  const ResultModal = () => {
    if (!showResultModal || !operationResult) return null;
    const op = operationResult.data;
    const stateDisplay = op ? getStateDisplay(op.state) : null;
    const wording = op ? getResultWording(op) : '';

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
          <div className={`px-6 py-4 border-b flex items-center justify-between ${operationResult.success !== false ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2">
              {operationResult.success !== false ? (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {operationResult.success !== false ? 'Operation Submitted' : 'Operation Failed'}
              </h3>
            </div>
            <button onClick={() => setShowResultModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-4">
            {operationResult.message && (
              <p className="text-sm text-gray-600">{operationResult.message}</p>
            )}

            {operationResult.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 space-y-2">
                <p><strong>{operationResult.code || 'Error'}:</strong> {operationResult.error}</p>
                <button
                  onClick={() => {
                    // Retry reuses the SAME stored idempotency key because the
                    // triggering handler re-derives its key from the unchanged
                    // form state / payload (§19.1).
                    if (activeOperation === 'reset') handleReset();
                    else if (activeOperation === 'unlock') handleUnlock();
                    else if (activeOperation === 'availability') handleAvailability();
                    else if (activeOperation === 'clearCache') handleClearCache();
                    else if (activeOperation === 'triggerMessage') handleTriggerMessage();
                    else if (activeOperation === 'setConfig') handleSetConfiguration();
                    else if (activeOperation === 'auditedConfigRead') handleAuditedConfigurationRead();
                  }}
                  className="text-xs font-medium text-red-700 hover:text-red-900 flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Retry same action
                </button>
              </div>
            )}

            {op && (
              <>
                <div className={`rounded-2xl border p-4 ${stateDisplay.color}`}>
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {stateDisplay.icon}
                    {stateDisplay.label}
                  </div>
                  <p className="text-xs mt-1 opacity-90">{wording || stateDisplay.copy}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-500">Operation Kind</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{OPERATION_KIND_LABEL[op.kind] || op.kind || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-500">OCPP Result</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{op.ocpp_result || '—'}</p>
                  </div>
                  {op.failure_category && (
                    <div className="bg-red-50 rounded-xl p-3 col-span-2">
                      <p className="text-red-500">Failure Category</p>
                      <p className="font-semibold text-red-700 mt-0.5">{op.failure_category}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                    <p className="text-gray-500 flex items-center justify-between">
                      Operation ID
                      <button onClick={() => copyToClipboard(op.id, 'Operation ID')} className="text-gray-400 hover:text-gray-700">
                        <Copy size={12} />
                      </button>
                    </p>
                    <p className="font-mono text-gray-700 mt-0.5 break-all">{op.id}</p>
                  </div>
                  {op.hal_operation_id && (
                    <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                      <p className="text-gray-500">HAL Operation ID (diagnostic only)</p>
                      <p className="font-mono text-gray-500 mt-0.5 break-all">{op.hal_operation_id}</p>
                    </div>
                  )}
                </div>

                {/* Transient configuration snapshot from an audited GET_CONFIGURATION
                    response — only present when the sync OCPP confirmation arrived
                    in this exact HTTP response (§10.2). */}
                {operationResult.extra?.configuration_keys && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Configuration (from this response)</h4>
                    {operationResult.extra.unknown_keys?.length > 0 && (
                      <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                        <AlertTriangle size={13} /> Unknown keys: {operationResult.extra.unknown_keys.join(', ')}
                      </p>
                    )}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Key</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {operationResult.extra.configuration_keys.map((k) => (
                            <tr key={k.key} className="border-t border-gray-100">
                              <td className="px-3 py-2 font-mono text-gray-700">{k.key}</td>
                              <td className="px-3 py-2 text-gray-600">
                                {k.redacted ? (
                                  <span className="inline-flex items-center gap-1 text-gray-400"><Lock size={11} /> Redacted</span>
                                ) : (k.value ?? '—')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {op.state === 'RECONCILIATION_REQUIRED' && (
                  <button
                    onClick={async () => {
                      setOperationLoading(true);
                      await fetchExactOperation(op.id);
                      setOperationLoading(false);
                    }}
                    disabled={operationLoading}
                    className="w-full px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {operationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchCheck size={16} />}
                    Check Status (Exact Recovery)
                  </button>
                )}

                <OcppEvidencePanel
                  operationId={op.id}
                  authenticatedRequest={authenticatedRequest}
                  isVisible={showResultModal}
                />
              </>
            )}

            {operationResult.requestId && (
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
                <span>Request ID for support</span>
                <button onClick={() => copyToClipboard(operationResult.requestId, 'Request ID')} className="font-mono flex items-center gap-1 hover:text-gray-600">
                  {operationResult.requestId} <Copy size={11} />
                </button>
              </div>
            )}

            <button
              onClick={() => setShowResultModal(false)}
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // Toast Component
  // ============================================================================
  const Toast = () => {
    if (!showToast.visible) return null;
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
    return (
      <div className={`fixed top-20 right-6 z-50 ${colors[showToast.type] || 'bg-blue-500'} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn max-w-md`}>
        {showToast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
        {showToast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
        {showToast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
        <span className="text-sm">{showToast.message}</span>
      </div>
    );
  };

  // ============================================================================
  // Loading State
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Loading charger details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !charger) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Charger Not Found</h2>
            <p className="text-gray-600">{error || 'Unable to load charger details'}</p>
            <button
              onClick={() => navigate('/chargers')}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={18} />
              Back to Chargers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================
  const liveCharger = charger?.live?.charger || null;
  const connectionStatus = liveCharger?.connection_state || 'UNKNOWN';
  const connectionDisplay = getStatusDisplay(connectionStatus, CONNECTION_STATUS_CONFIG);
  const isOnline = connectionStatus === 'ONLINE';
  const canOperate = isOnline && hasOperationsPermission;
  const chargerFreshnessDisplay = getFreshnessDisplay(liveCharger?.connection_freshness);
  const chargerLastSeen = formatRelativeTime(liveCharger?.connection_observed_at);

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        userName={userData?.user?.full_name || user?.name || 'User'}
        userEmail={userData?.user?.email || user?.email || ''}
        onLogout={logout}
      />

      <div className="flex-1 min-w-0">
        <Toast />
        <ResultModal />
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          cmsChargerId={cmsChargerId}
          authenticatedRequest={authenticatedRequest}
          onOpenOperation={handleOpenOperationFromHistory}
        />

        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <button
                onClick={() => navigate('/charger-session')}
                className="p-1.5 -ml-1.5 mr-1 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Manage Charger
              </h1>
              <span className="text-blue-600">/</span>
              <button
                onClick={() => navigate('/charger-session')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Chargers
              </button>
              <span className="text-blue-600">/</span>
              <span className="text-blue-600 font-medium">
                {charger.charger_name || charger.charger_id || charger.id || 'Details'}
              </span>
            </div>

            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(prev => !prev)}
                  className="p-2 hover:bg-gray-100 rounded-xl flex items-center gap-1.5 text-gray-600 transition"
                >
                  <Settings size={20} />
                  <ChevronDown size={16} />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(prev => !prev)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Sub-header banner — History button lives here */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  {charger.charger_name || charger.name || 'Charger'}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${connectionDisplay.color}`}>
                    {connectionDisplay.icon}
                    {connectionDisplay.label}
                  </span>
                  {liveCharger && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${chargerFreshnessDisplay.color}`}
                      title={liveCharger.connection_observed_at ? `Observed at ${new Date(liveCharger.connection_observed_at).toLocaleString()}` : ''}
                    >
                      <Circle size={7} className="fill-current" />
                      {chargerFreshnessDisplay.label}
                      {chargerLastSeen && <span className="opacity-75">· {chargerLastSeen}</span>}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-sm text-gray-500 font-mono">
                    Code: {charger.charger_id || 'N/A'}
                  </p>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => copyToClipboard(cmsChargerId, 'Charger UUID')}
                    className="text-xs text-gray-400 font-mono flex items-center gap-1 hover:text-gray-700"
                    title="CMS charger UUID used for all operation calls"
                  >
                    UUID: {String(cmsChargerId || '').slice(0, 8)}... <Copy size={11} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 flex items-center gap-2 shadow-sm text-sm font-medium"
              >
                <History size={18} />
                Operation History
              </button>

              <button
                onClick={fetchChargerDetails}
                className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition text-gray-500 shadow-sm"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {!hasOperationsPermission && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
              <Lock size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Limited access</p>
                <p className="text-xs mt-0.5">Your account does not currently have the <code className="font-mono">chargers.operations</code> permission — operation controls are disabled.</p>
              </div>
            </div>
          )}

          {/* Charger Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-blue-50" />
              <p className="text-xs text-gray-500 relative">Total Connectors</p>
              <p className="text-2xl font-bold text-gray-900 relative">{connectors.length}</p>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-blue-50" />
              <p className="text-xs text-gray-500 relative">Max Power</p>
              <p className="text-2xl font-bold text-blue-600 relative">{charger.max_power_kw || 0} kW</p>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-purple-50" />
              <p className="text-xs text-gray-500 relative">OCPP Version</p>
              <p className="text-2xl font-bold text-purple-600 relative">{charger.ocpp_version || charger.protocol || 'N/A'}</p>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gray-50" />
              <p className="text-xs text-gray-500 relative">Admin Status</p>
              <p className="text-2xl font-bold text-gray-900 relative">{charger.status || 'N/A'}</p>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${isOnline ? 'bg-green-50' : 'bg-red-50'}`} />
              <p className="text-xs text-gray-500 relative">Live Connection</p>
              <p className={`text-2xl font-bold relative ${isOnline ? 'text-green-600' : 'text-red-500'}`}>{connectionDisplay.label}</p>
              {liveCharger && (
                <p className="text-[11px] text-gray-400 relative mt-0.5">
                  {chargerFreshnessDisplay.label}{chargerLastSeen ? ` · seen ${chargerLastSeen}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Connectors */}
          {connectors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plug size={20} className="text-blue-600" />
                Connectors
                <span className="text-xs font-normal text-gray-400 ml-1">(CMS connector IDs — used by Unlock, Availability & Trigger Message)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {connectors.map((connector) => {
                  // Match primarily by CMS connector UUID (live connector objects
                  // carry `connector_id`, not `connector_number`); fall back to
                  // connector_number only if a live payload happens to include it.
                  const liveConnector = charger?.live?.connectors?.find(
                    lc => String(lc.connector_id) === String(connector.id)
                      || (lc.connector_number != null && Number(lc.connector_number) === Number(connector.connector_number))
                  );
                  const ocppStatus = liveConnector?.last_ocpp_status || 'Unknown';
                  const ocppDisplay = getStatusDisplay(ocppStatus, OCPP_STATUS_CONFIG);
                  const connFreshnessDisplay = getFreshnessDisplay(liveConnector?.freshness);
                  const connLastSeen = formatRelativeTime(liveConnector?.observed_at);

                  return (
                    <div key={connector.id} className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <Plug size={15} className="text-gray-400" />
                          Connector #{connector.connector_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ocppDisplay.color}`}>
                          {ocppDisplay.icon}
                          {ocppDisplay.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Type: {connector.connector_type || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mb-1">Capacity: {connector.connector_total_capacity || 0} kW</p>
                      {liveConnector && (
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          {liveConnector.availability && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
                              {liveConnector.availability}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${connFreshnessDisplay.color}`}>
                            {connFreshnessDisplay.label}
                          </span>
                          {connLastSeen && (
                            <span className="text-[10px] text-gray-400">· {connLastSeen}</span>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => copyToClipboard(connector.id, `Connector #${connector.connector_number} ID`)}
                        className="w-full mt-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-mono text-gray-500 flex items-center justify-between gap-2 transition"
                        title="Copy CMS connector UUID"
                      >
                        <span className="truncate">{connector.id}</span>
                        <Copy size={11} className="flex-shrink-0" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Operations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Charger Operations</h2>
              <span className="text-xs font-normal text-gray-400">— every action below is available at once, no need to expand anything</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* 1. Reset Charger */}
              <OperationCard
                title="Reset Charger"
                icon={<Power size={18} />}
                description="Send a soft or hard reset command to the charger"
                badge="SOFT / HARD"
                accent="blue"
              >
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Reset Type:</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setResetType('SOFT')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${resetType === 'SOFT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      type="button"
                    >
                      Soft Reset
                    </button>
                    <button
                      onClick={() => setResetType('HARD')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${resetType === 'HARD' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      type="button"
                    >
                      Hard Reset
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Reason (required, 3–500 characters — CMS audit metadata, not sent to the charger)</label>
                  <textarea
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    placeholder="e.g., Operator-requested recovery after communication issue"
                    maxLength={500}
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mt-1 bg-white text-gray-900 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{resetReason.length}/500</p>
                </div>
                <button
                  onClick={handleReset}
                  disabled={operationLoading || !canOperate || resetReason.trim().length < 3}
                  className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate && resetReason.trim().length >= 3 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {operationLoading && activeOperation === 'reset' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Power size={18} />
                  )}
                  Send {resetType === 'SOFT' ? 'Soft' : 'Hard'} Reset
                </button>
                {resetType === 'HARD' && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> Hard reset is disruptive — confirm this is intentional.</p>
                )}
                {!isOnline && <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={14} /> Charger is offline. Operation may not be delivered.</p>}
              </div>
              </OperationCard>

              {/* 2. Unlock Connector */}
              <OperationCard
                title="Unlock Connector"
                icon={<Unlock size={18} />}
                description="Request OCPP UnlockConnector for a specific connector"
                badge="Connector"
                accent="green"
              >
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Connector:</label>
                  <select
                    value={unlockConnectorId}
                    onChange={(e) => setUnlockConnectorId(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-64 bg-white text-gray-900"
                  >
                    <option value="">Select a connector...</option>
                    {connectors.map((c) => (
                      <option key={c.id} value={c.id}>{connectorLabel(c)}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleUnlock}
                  disabled={operationLoading || !canOperate || !unlockConnectorId}
                  className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate && unlockConnectorId ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {operationLoading && activeOperation === 'unlock' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlock size={18} />
                  )}
                  Unlock Connector
                </button>
              </div>
              </OperationCard>

              {/* 3. Change Availability */}
              <OperationCard
                title="Change Availability"
                icon={<Shield size={18} />}
                description="Change availability for charger or specific connector"
                badge="OPERATIVE / INOPERATIVE"
                accent="purple"
              >
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Type:</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setAvailabilityType('OPERATIVE')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${availabilityType === 'OPERATIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      type="button"
                    >
                      Operative
                    </button>
                    <button
                      onClick={() => setAvailabilityType('INOPERATIVE')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${availabilityType === 'INOPERATIVE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      type="button"
                    >
                      Inoperative
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Target:</label>
                  <select
                    value={availabilityConnectorId}
                    onChange={(e) => setAvailabilityConnectorId(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm w-64 bg-white text-gray-900"
                  >
                    <option value="">Whole charger (connector 0)</option>
                    {connectors.map((c) => (
                      <option key={c.id} value={c.id}>{connectorLabel(c)}</option>
                    ))}
                  </select>
                </div>
                {availabilityType === 'INOPERATIVE' && !availabilityConnectorId && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> This will mark the entire charger inoperative — confirm this is intentional.</p>
                )}
                <button
                  onClick={handleAvailability}
                  disabled={operationLoading || !canOperate}
                  className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-lg hover:shadow-purple-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {operationLoading && activeOperation === 'availability' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield size={18} />
                  )}
                  Change Availability
                </button>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Info size={12} /> This is an OCPP availability request — separate from CMS admin status, live connection state, and customer charge eligibility. A "Scheduled" result is not an already-applied state.
                </p>
              </div>
              </OperationCard>

              {/* 4. Clear Cache */}
              <OperationCard
                title="Clear Cache"
                icon={<Trash2 size={18} />}
                description="Request OCPP ClearCache to reset charger authorization cache"
                badge="Maintenance"
                accent="amber"
              >
              <div className="space-y-4">
                <p className="text-sm text-gray-500">This clears the charger's authorization cache. Treat it as an explicit maintenance action, not a generic retry mechanism.</p>
                <button
                  onClick={handleClearCache}
                  disabled={operationLoading || !canOperate}
                  className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg hover:shadow-amber-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {operationLoading && activeOperation === 'clearCache' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  Clear Cache
                </button>
              </div>
              </OperationCard>

              {/* 5. Trigger Message */}
              <OperationCard
                title="Trigger Message"
                icon={<Send size={18} />}
                description="Send an allowlisted OCPP TriggerMessage to the charger"
                badge="Allowlisted"
                accent="indigo"
              >
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Message Type:</label>
                  <select
                    value={triggerMessage}
                    onChange={(e) => setTriggerMessage(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-900"
                  >
                    {TRIGGER_MESSAGE_ALLOWLIST.map((msg) => (
                      <option key={msg} value={msg}>{msg}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Connector (optional):</label>
                  <select
                    value={triggerConnectorId}
                    onChange={(e) => setTriggerConnectorId(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-64 bg-white text-gray-900"
                  >
                    <option value="">Charger-wide</option>
                    {connectors.map((c) => (
                      <option key={c.id} value={c.id}>{connectorLabel(c)}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleTriggerMessage}
                  disabled={operationLoading || !canOperate}
                  className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {operationLoading && activeOperation === 'triggerMessage' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  Send {triggerMessage}
                </button>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Info size={12} /> "Accepted" confirms the charger accepted the trigger request — it does not confirm the follow-up notification later arrived.
                </p>
              </div>
              </OperationCard>
            </div>

            {/* 6. Configuration — full width: it holds three distinct actions */}
            <div className="mt-5">
              <OperationCard
                title="Configuration"
                icon={<Settings size={18} />}
                description="Read (ordinary or audited) and update OCPP configuration keys"
                badge="Config"
                accent="slate"
              >
              <div className="space-y-6">
                {/* Compatibility read */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    Read Configuration
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full">Ordinary read — no history record</span>
                  </h4>
                  <button
                    onClick={handleGetConfiguration}
                    disabled={configLoading || !isOnline || !hasOperationsPermission}
                    className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${isOnline && hasOperationsPermission ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {configLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText size={18} />}
                    Get Configuration
                  </button>
                  {configData && (
                    <div className="mt-4">
                      {configData.unknown_keys?.length > 0 && (
                        <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                          <AlertTriangle size={13} /> Unknown keys (not reported by charger): {configData.unknown_keys.join(', ')}
                        </p>
                      )}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Key</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Value</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Readonly</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(configData.configuration_keys || []).map((k) => (
                              <tr key={k.key} className="border-t border-gray-100">
                                <td className="px-3 py-2 font-mono text-gray-700">{k.key}</td>
                                <td className="px-3 py-2 text-gray-600">
                                  {k.redacted ? (
                                    <span className="inline-flex items-center gap-1 text-gray-400">
                                      <Lock size={11} /> Redacted
                                    </span>
                                  ) : (k.value ?? '—')}
                                </td>
                                <td className="px-3 py-2 text-gray-500">{k.readonly ? 'Yes' : 'No'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Explicit audited read — durable GET_CONFIGURATION operation */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <SearchCheck size={16} className="text-indigo-500" />
                    Audited Configuration Read
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-semibold rounded-full">Creates a history record</span>
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Use this when you deliberately want an auditable GetConfiguration interaction with durable protocol evidence — not for routine page refreshes.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <input
                      type="text"
                      value={auditedReadKeys}
                      onChange={(e) => setAuditedReadKeys(e.target.value)}
                      placeholder="Comma-separated keys (leave blank for all keys)"
                      className="flex-1 min-w-[240px] px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <button
                    onClick={handleAuditedConfigurationRead}
                    disabled={operationLoading || !canOperate}
                    className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {operationLoading && activeOperation === 'auditedConfigRead' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SearchCheck size={18} />
                    )}
                    Run Audited Read
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Edit size={16} className="text-emerald-500" />
                    Set Configuration
                    {!hasManagePermission && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full flex items-center gap-1">
                        <Lock size={10} /> Requires chargers.manage
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Config Key</label>
                      <input
                        type="text"
                        value={configKey}
                        onChange={(e) => setConfigKey(e.target.value)}
                        placeholder="e.g., ClockAlignedDataInterval"
                        maxLength={100}
                        disabled={!hasManagePermission}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mt-1 bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      {configKey && isLikelyReservedOrSensitiveKey(configKey) && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle size={11} />
                          {isLikelyReservedOrSensitiveKey(configKey) === 'reserved' ? ERROR_CODE_HINTS.reserved_configuration_key : ERROR_CODE_HINTS.sensitive_configuration_key}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Value</label>
                      <input
                        type="text"
                        value={configValue}
                        onChange={(e) => setConfigValue(e.target.value)}
                        placeholder="e.g., 300"
                        maxLength={500}
                        disabled={!hasManagePermission}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mt-1 bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3 flex items-start gap-1">
                    <HelpCircle size={13} className="flex-shrink-0 mt-0.5" />
                    HAL-owned keys (e.g. HeartbeatInterval, LocalPreAuthorize) and sensitive keys (password, secret, token, AuthorizationKey, etc.) are rejected by the server — this UI does not attempt to work around that. The value you submit is never shown back in history or protocol evidence.
                  </p>
                  <button
                    onClick={handleSetConfiguration}
                    disabled={operationLoading || !canOperate || !hasManagePermission || !configKey || !configValue || !!isLikelyReservedOrSensitiveKey(configKey)}
                    className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate && hasManagePermission && configKey && configValue && !isLikelyReservedOrSensitiveKey(configKey) ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {operationLoading && activeOperation === 'setConfig' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Update Configuration
                  </button>
                </div>
              </div>
              </OperationCard>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChargerOperations;

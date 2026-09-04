import React, { useState, useEffect, useCallback, memo } from 'react';
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
  ChevronUp,
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
  Filter
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

const OPERATION_STATE_CONFIG = {
  PERSISTED: {
    label: 'Pending / Recorded',
    copy: 'Operation recorded; awaiting final acknowledgement.',
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
    copy: 'Outcome uncertain. Use exact recovery instead of retrying the action.',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertTriangle className="w-3.5 h-3.5" />
  },
  CONFIRMED_ABSENT: {
    label: 'Not found / Absent',
    copy: 'Recovery confirmed HAL has no durable operation with this ID.',
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
  TRIGGER_MESSAGE: 'Trigger Message'
};

// ============================================================================
// History Modal Component
// ============================================================================
const HistoryModal = ({ isOpen, onClose, chargerId, cmsChargerId, authenticatedRequest }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState({ before: null, before_id: null, has_more: false });
  const [filters, setFilters] = useState({
    kind: '',
    state: '',
    connector_id: '',
    created_after: '',
    created_before: ''
  });
  const [error, setError] = useState('');

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
      // Append filters
      if (filters.kind) url += `&kind=${encodeURIComponent(filters.kind)}`;
      if (filters.state) url += `&state=${encodeURIComponent(filters.state)}`;
      if (filters.connector_id) url += `&connector_id=${encodeURIComponent(filters.connector_id)}`;
      if (filters.created_after) url += `&created_after=${encodeURIComponent(filters.created_after)}`;
      if (filters.created_before) url += `&created_before=${encodeURIComponent(filters.created_before)}`;

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
        setError(errData.error?.message || 'Failed to load history');
      }
    } catch (err) {
      setError('An error occurred while loading history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cmsChargerId, authenticatedRequest, cursor.before, cursor.before_id, filters]);

  // Reset and fetch when filters change
  useEffect(() => {
    if (isOpen && cmsChargerId) {
      setHistory([]);
      setCursor({ before: null, before_id: null, has_more: false });
      fetchHistory(false);
    }
  }, [isOpen, cmsChargerId, filters, fetchHistory]);

  const loadMore = () => {
    if (cursor.has_more && !loadingMore && !loading) {
      fetchHistory(true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      kind: '',
      state: '',
      connector_id: '',
      created_after: '',
      created_before: ''
    });
  };

  if (!isOpen) return null;

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
                    let details = '';
                    if (op.parameters) {
                      if (op.parameters.type) details += `Type: ${op.parameters.type}`;
                      if (op.parameters.reason) details += ` | Reason: ${op.parameters.reason}`;
                      if (op.parameters.requested_message) details += ` | Message: ${op.parameters.requested_message}`;
                      if (op.parameters.key) details += ` | Key: ${op.parameters.key}`;
                    }
                    return (
                      <tr key={op.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
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
// Operation Section Component (memoized)
// ============================================================================
const OperationSection = memo(({ 
  id, 
  title, 
  icon, 
  children, 
  description, 
  badge, 
  accent = 'blue', 
  locked = false, 
  lockedNote,
  isExpanded,
  onToggle
}) => {
  const accentMap = {
    blue: ['from-blue-500', 'to-indigo-500', 'text-blue-600', 'bg-blue-50'],
    green: ['from-emerald-500', 'to-teal-500', 'text-emerald-600', 'bg-emerald-50'],
    purple: ['from-purple-500', 'to-fuchsia-500', 'text-purple-600', 'bg-purple-50'],
    amber: ['from-amber-500', 'to-orange-500', 'text-amber-600', 'bg-amber-50'],
    indigo: ['from-indigo-500', 'to-violet-500', 'text-indigo-600', 'bg-indigo-50'],
    slate: ['from-slate-500', 'to-gray-600', 'text-slate-600', 'bg-slate-50']
  };
  const [gradFrom, gradTo, textColor, bgColor] = accentMap[accent] || accentMap.blue;

  return (
    <div className={`group border border-gray-200/70 rounded-3xl overflow-hidden bg-white transition-all duration-300 ${isExpanded ? 'shadow-lg shadow-gray-200/60 ring-1 ring-gray-100' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}>
      <button
        onClick={() => onToggle(id)}
        className="w-full px-6 py-4 flex items-center justify-between transition"
        type="button"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradFrom} ${gradTo} text-white shadow-md shadow-gray-300/50`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              {title}
              {badge && (
                <span className={`px-2 py-0.5 ${bgColor} ${textColor} text-[10px] font-semibold rounded-full`}>
                  {badge}
                </span>
              )}
              {locked && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  <Lock size={10} /> Restricted
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 pt-1 border-t border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
          {locked ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <Lock size={14} />
              {lockedNote || 'You do not have permission to use this operation.'}
            </div>
          ) : children}
        </div>
      )}
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

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    reset: false,
    unlock: false,
    availability: false,
    clearCache: false,
    triggerMessage: false,
    configuration: false
  });

  // Toast
  const [showToast, setShowToast] = useState({ visible: false, message: '', type: '' });

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

  const newIdempotencyKey = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const parseApiError = async (response) => {
    const requestId = response.headers?.get ? response.headers.get('X-Request-ID') : null;
    let code = 'unknown_error';
    let message = 'An error occurred';
    try {
      const data = await response.json();
      code = data?.error?.code || code;
      message = data?.error?.message || message;
    } catch (e) {}
    return { code, message, requestId };
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
        `${API_BASE_URL}/api/v1/cpo/chargers/${chargerId}`,
        { method: 'GET' }
      );
      if (response.ok) {
        const data = await response.json();
        setCharger(data.charger || data.data || data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error?.message || errorData.message || 'Failed to fetch charger details');
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
        { method: 'GET' }
      );
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.effective_permissions || data.permissions || []);
      }
    } catch (err) {
      console.error('Permission fetch error:', err);
    }
  }, [authenticatedRequest]);

  const runOperation = useCallback(async (operationKey, path, body, successPrefix) => {
    setOperationLoading(true);
    setOperationResult(null);
    setActiveOperation(operationKey);
    const idempotencyKey = newIdempotencyKey();
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
        const data = await response.json();
        setOperationResult({ success: true, data, requestId, message: successPrefix });
        showToastMessage(`${successPrefix} — ${getStateDisplay(data.state).label}`, 'success');
        return data;
      } else {
        const err = await parseApiError(response);
        setOperationResult({ success: false, error: err.message, code: err.code, requestId: err.requestId });
        showToastMessage(`${err.code}: ${err.message}`, 'error');
        return null;
      }
    } catch (err) {
      setOperationResult({ success: false, error: err.message || 'An error occurred' });
      showToastMessage('Request failed. Check your connection and retry with the same action.', 'error');
      return null;
    } finally {
      setOperationLoading(false);
      setShowResultModal(true);
    }
  }, [authenticatedRequest, cmsChargerId, showToastMessage]);

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

  const handleGetConfiguration = useCallback(async () => {
    setConfigLoading(true);
    setConfigData(null);
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/cpo/operations/chargers/${cmsChargerId}/configuration`,
        { method: 'GET' }
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

  const handleSetConfiguration = useCallback(async () => {
    if (!configKey || !configValue) {
      showToastMessage('Please enter both key and value', 'error');
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

  // ============================================================================
  // User Info
  // ============================================================================
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/api/v1/auth/me`,
        { method: 'GET' }
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
  // Toggle Sections
  // ============================================================================
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

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
  // Result Modal
  // ============================================================================
  const ResultModal = () => {
    if (!showResultModal || !operationResult) return null;
    const op = operationResult.data;
    const stateDisplay = op ? getStateDisplay(op.state) : null;

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
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <strong>{operationResult.code || 'Error'}:</strong> {operationResult.error}
              </div>
            )}

            {op && (
              <>
                <div className={`rounded-2xl border p-4 ${stateDisplay.color}`}>
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {stateDisplay.icon}
                    {stateDisplay.label}
                  </div>
                  <p className="text-xs mt-1 opacity-90">{stateDisplay.copy}</p>
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
                </div>

                {op.state === 'RECONCILIATION_REQUIRED' && (
                  <button
                    onClick={async () => {
                      setOperationLoading(true);
                      try {
                        const response = await authenticatedRequest(
                          `${API_BASE_URL}/api/v1/cpo/operations/charger-operations/${op.id}`,
                          { method: 'GET' }
                        );
                        if (response.ok) {
                          const data = await response.json();
                          setOperationResult(prev => ({ ...prev, data }));
                          showToastMessage('Operation status refreshed', 'info');
                        } else {
                          const err = await parseApiError(response);
                          showToastMessage(`${err.code}: ${err.message}`, 'error');
                        }
                      } catch (err) {
                        showToastMessage('Failed to check operation status', 'error');
                      } finally {
                        setOperationLoading(false);
                      }
                    }}
                    disabled={operationLoading}
                    className="w-full px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {operationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw size={16} />}
                    Check Status (Exact Recovery)
                  </button>
                )}
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
  const connectionStatus = charger?.live?.charger?.connection_state || 'UNKNOWN';
  const connectionDisplay = getStatusDisplay(connectionStatus, CONNECTION_STATUS_CONFIG);
  const isOnline = connectionStatus === 'ONLINE';
  const canOperate = isOnline && hasOperationsPermission;

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
          chargerId={chargerId}
          cmsChargerId={cmsChargerId}
          authenticatedRequest={authenticatedRequest}
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
              {/* History button removed from header — now placed in sub-header below */}

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

        {/* Sub-header banner — now contains the History button */}
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
              {/* History button moved here */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  const liveConnector = charger?.live?.connectors?.find(
                    lc => String(lc.connector_id) === String(connector.id) || Number(lc.connector_number) === Number(connector.connector_number)
                  );
                  const ocppStatus = liveConnector?.last_ocpp_status || 'Unknown';
                  const ocppDisplay = getStatusDisplay(ocppStatus, OCPP_STATUS_CONFIG);

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
                      <p className="text-xs text-gray-500 mb-2">Capacity: {connector.connector_total_capacity || 0} kW</p>
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

          {/* Operations Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Zap size={20} className="text-blue-600" />
              OCPP Operations
              <span className="text-xs font-normal text-gray-400 ml-2">(CPO Charger Operations)</span>
            </h2>

            {/* 1. Reset Charger */}
            <OperationSection
              id="reset"
              title="Reset Charger"
              icon={<Power size={20} />}
              description="Send a soft or hard reset command to the charger"
              badge="SOFT / HARD"
              accent="blue"
              isExpanded={expandedSections.reset}
              onToggle={toggleSection}
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
                  <label className="text-xs font-medium text-gray-600">Reason (required, 3–500 characters)</label>
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
            </OperationSection>

            {/* 2. Unlock Connector */}
            <OperationSection
              id="unlock"
              title="Unlock Connector"
              icon={<Unlock size={20} />}
              description="Request OCPP UnlockConnector for a specific connector"
              badge="Connector"
              accent="green"
              isExpanded={expandedSections.unlock}
              onToggle={toggleSection}
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
            </OperationSection>

            {/* 3. Change Availability */}
            <OperationSection
              id="availability"
              title="Change Availability"
              icon={<Shield size={20} />}
              description="Change availability for charger or specific connector"
              badge="OPERATIVE / INOPERATIVE"
              accent="purple"
              isExpanded={expandedSections.availability}
              onToggle={toggleSection}
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
                  <Info size={12} /> This is an OCPP availability request — separate from CMS admin status, live connection state, and customer charge eligibility.
                </p>
              </div>
            </OperationSection>

            {/* 4. Clear Cache */}
            <OperationSection
              id="clearCache"
              title="Clear Cache"
              icon={<Trash2 size={20} />}
              description="Request OCPP ClearCache to reset charger authorization cache"
              badge="Maintenance"
              accent="amber"
              isExpanded={expandedSections.clearCache}
              onToggle={toggleSection}
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
            </OperationSection>

            {/* 5. Trigger Message */}
            <OperationSection
              id="triggerMessage"
              title="Trigger Message"
              icon={<Send size={20} />}
              description="Send an allowlisted OCPP TriggerMessage to the charger"
              badge="Allowlisted"
              accent="indigo"
              isExpanded={expandedSections.triggerMessage}
              onToggle={toggleSection}
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
              </div>
            </OperationSection>

            {/* 6. Configuration */}
            <OperationSection
              id="configuration"
              title="Configuration"
              icon={<Settings size={20} />}
              description="Read and update OCPP configuration keys"
              badge="Config"
              accent="slate"
              isExpanded={expandedSections.configuration}
              onToggle={toggleSection}
            >
              <div className="space-y-6">
                {/* Get Configuration */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    Read Configuration
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
                    HAL-owned keys (e.g. HeartbeatInterval, LocalPreAuthorize) and sensitive keys (password, secret, token, AuthorizationKey, etc.) are rejected by the server — this UI does not attempt to work around that.
                  </p>
                  <button
                    onClick={handleSetConfiguration}
                    disabled={operationLoading || !canOperate || !hasManagePermission || !configKey || !configValue}
                    className={`px-6 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2 ${canOperate && hasManagePermission && configKey && configValue ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25' : 'bg-gray-300 cursor-not-allowed'}`}
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
            </OperationSection>
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
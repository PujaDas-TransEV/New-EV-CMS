// import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../Authentication/AuthContext';
// import {
//   Settings,
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   User,
//   Building,
//   LogOut,
//   Search,
//   Filter,
//   Activity,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   X,
//   RefreshCw,
//   Zap,
//   Loader2,
//   Eye,
//   Database,
//   IndianRupee,
//   History,
//   GitBranch,
//   Sliders,
//   Grid,
//   Circle,
//   CircleX,
//   BatteryCharging,
//   BatteryMedium,
//   BatteryLow,
//   BatteryFull,
//   Calendar as CalendarIcon
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   SESSIONS_API: `${API_BASE_URL}/api/v1/cpo/charging-sessions`,
//   SESSION_DETAIL_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}`,
//   LIVE_SESSIONS_SSE: `${API_BASE_URL}/api/v1/cpo/operations/live-sessions`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
//   TRACE_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}/trace`,
//   TRACE_STREAM_API: (traceId) => `${API_BASE_URL}/api/v1/cpo/charging-traces/${traceId}/stream`,
// };

// // LocalStorage keys for filter persistence
// const STORAGE_KEYS = {
//   DATE_FILTER: 'sessions_date_filter',
//   CUSTOM_DATE: 'sessions_custom_date',
// };

// // Status helpers
// const getStatusColor = (status) => {
//   const colors = {
//     'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
//     'START_PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
//     'CHARGING': 'bg-blue-100 text-blue-700 border-blue-200',
//     'STOP_PENDING': 'bg-orange-100 text-orange-700 border-orange-200',
//     'STOPPED': 'bg-gray-100 text-gray-700 border-gray-200',
//     'FAILED': 'bg-red-100 text-red-700 border-red-200',
//     'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-200',
//     'ACTIVE': 'bg-blue-100 text-blue-700 border-blue-200',
//     'active': 'bg-blue-100 text-blue-700 border-blue-200',
//     'INACTIVE': 'bg-gray-100 text-gray-700 border-gray-200',
//     'inactive': 'bg-gray-100 text-gray-700 border-gray-200',
//     'FINISHED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
//     'finished': 'bg-emerald-100 text-emerald-700 border-emerald-200',
//     'RECONCILIATION_REQUIRED': 'bg-amber-100 text-amber-700 border-amber-200'
//   };
//   return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
// };

// const getStatusIcon = (status) => {
//   const statusUpper = status?.toUpperCase() || '';
//   switch(statusUpper) {
//     case 'COMPLETED':
//     case 'FINISHED':
//       return <CheckCircle className="w-3.5 h-3.5" />;
//     case 'START_PENDING':
//       return <Clock className="w-3.5 h-3.5" />;
//     case 'CHARGING':
//     case 'ACTIVE':
//       return <Activity className="w-3.5 h-3.5" />;
//     case 'STOP_PENDING':
//       return <AlertCircle className="w-3.5 h-3.5" />;
//     case 'STOPPED':
//     case 'FAILED':
//     case 'INACTIVE':
//       return <CircleX className="w-3.5 h-3.5" />;
//     default:
//       return <Circle className="w-3.5 h-3.5" />;
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
//     'ACTIVE': 'Active',
//     'active': 'Active',
//     'INACTIVE': 'Inactive',
//     'inactive': 'Inactive',
//     'FINISHED': 'Finished',
//     'finished': 'Finished',
//     'RECONCILIATION_REQUIRED': 'Reconciliation Required'
//   };
//   return statusMap[status] || status || 'Unknown';
// };

// const isOngoingStatus = (status) => {
//   if (!status) return false;
//   const statusStr = String(status).toUpperCase().trim();
//   const ongoingStatuses = [
//     'ACTIVE', 'CHARGING', 'START_PENDING', 'STOP_PENDING',
//     'ONGOING', 'IN PROGRESS', 'STARTED', 'START',
//     'PROCESSING', 'RUNNING', 'INPROGRESS', 'IN_PROGRESS',
//     'STARTING', 'INITIATED'
//   ];
//   if (ongoingStatuses.includes(statusStr)) return true;
//   const keywords = ['START', 'CHARG', 'ACTIVE', 'ONGOING', 'PROGRESS', 'RUNNING'];
//   for (const kw of keywords) if (statusStr.includes(kw)) return true;
//   return false;
// };

// // ✅ Prettify backend reasons: "time_limit_reached" → "Time Limit Reached"
// // "User requested stop" → "User Requested Stop"
// const prettifyReason = (raw) => {
//   if (!raw) return null;
//   const str = String(raw).trim();
//   if (!str) return null;

//   // If it contains underscores, treat as snake_case → Title Case each word
//   if (str.includes('_')) {
//     return str
//       .split('_')
//       .filter(Boolean)
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(' ');
//   }

//   // Otherwise, capitalize the first letter of each word
//   // ("User requested stop" → "User Requested Stop")
//   return str
//     .split(' ')
//     .filter(Boolean)
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(' ');
// };

// // ✅ Stop reason display logic
// // - If stop.ocpp_reason is "Local" → "Stopped by Charger"
// // - If stop.ocpp_reason is "Remote" → prettified stop.requested_reason
// //   e.g. "time_limit_reached" → "Time Limit Reached"
// //        "User requested stop"  → "User Requested Stop"
// // - Never shown for ongoing/live sessions
// const getStopReasonDisplay = (session) => {
//   if (!session) return null;

//   const status = String(session.status || '').toUpperCase();
//   const isLive = session.is_live || session.live_data;
//   if (isOngoingStatus(status) || status === 'ACTIVE' || status === 'STOP_PENDING' || isLive) {
//     return null;
//   }

//   const stopObj = session.stop || {};
//   const ocppReason = stopObj.ocpp_reason;
//   const requestedReason = stopObj.requested_reason;

//   // Prefer structured stop.ocpp_reason
//   if (ocppReason === 'Local') return 'Stopped by Charger';
//   if (ocppReason === 'Remote') {
//     return prettifyReason(requestedReason) || 'Stopped by Remote';
//   }

//   // Fallback to legacy session.stop_reason string
//   const legacy = session.stop_reason;
//   if (legacy === 'Local') return 'Stopped by Charger';
//   if (legacy === 'Remote') {
//     return prettifyReason(requestedReason) || 'Stopped by Remote';
//   }

//   return null;
// };

// const getEnergyKwh = (session) => {
//   if (session.consumed_wh) return parseFloat(session.consumed_wh) / 1000;
//   if (session.total_kwh) return parseFloat(session.total_kwh);
//   if (session.energy) return parseFloat(session.energy);
//   if (session.usage) return parseFloat(session.usage);
//   return 0;
// };

// const getSocPercent = (session) => {
//   if (session.soc_percent) return parseFloat(session.soc_percent) || 0;
//   return 0;
// };

// const getInitialSocPercent = (session) => {
//   if (!session) return null;
//   const candidates = [
//     session.initial_soc_percent,
//     session.start_soc_percent,
//     session.soc_start_percent,
//     session.starting_soc_percent,
//     session.soc_at_start,
//   ];
//   for (const c of candidates) {
//     if (c !== undefined && c !== null && c !== '') return parseFloat(c);
//   }
//   return null;
// };

// const getFinalSocPercent = (session, isOngoing, liveSoc) => {
//   if (!session) return null;
//   if (isOngoing && liveSoc !== undefined && liveSoc !== null && liveSoc !== 0) {
//     return parseFloat(liveSoc);
//   }
//   const candidates = [
//     session.final_soc_percent,
//     session.end_soc_percent,
//     session.soc_end_percent,
//     session.ending_soc_percent,
//     session.soc_at_end,
//     session.soc_percent,
//   ];
//   for (const c of candidates) {
//     if (c !== undefined && c !== null && c !== '') return parseFloat(c);
//   }
//   return null;
// };

// const getMeterFreshness = (session) => session.meter_freshness || 'UNKNOWN';
// const getSocFreshness = (session) => session.soc_freshness || 'UNKNOWN';

// const getProjectedAmount = (session) => {
//   if (session.projected_amount) return parseFloat(session.projected_amount) || 0;
//   if (session.total_amount) return parseFloat(session.total_amount) || 0;
//   return 0;
// };

// const getCurrency = (session) => session.currency || 'INR';
// const getTransactionId = (session) => session.ocpp_transaction_id || session.transaction_id || 'N/A';

// const formatDuration = (durationSeconds) => {
//   if (!durationSeconds || durationSeconds < 0) return 'N/A';
//   const totalSeconds = Math.floor(durationSeconds);
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;
//   if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
//   if (minutes > 0) return `${minutes}m ${seconds}s`;
//   return `${seconds}s`;
// };

// const getDurationMinutes = (durationSeconds) => {
//   if (!durationSeconds) return 0;
//   return Math.floor(durationSeconds / 60);
// };

// const formatDurationShort = (durationSeconds) => {
//   if (!durationSeconds || durationSeconds < 0) return 'N/A';
//   const totalSeconds = Math.floor(durationSeconds);
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   if (hours > 0) return `${hours}h ${minutes}m`;
//   if (minutes > 0) return `${minutes}m`;
//   return `${totalSeconds}s`;
// };

// const getCompletedDurationSeconds = (startTime, endTime) => {
//   if (!startTime || !endTime) return null;
//   const start = new Date(startTime);
//   const end = new Date(endTime);
//   if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
//   const diff = Math.floor((end - start) / 1000);
//   return diff >= 0 ? diff : null;
// };

// const formatTraceDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return 'N/A';
//   return date.toLocaleString('en-US', {
//     day: '2-digit', month: 'short', year: 'numeric',
//     hour: '2-digit', minute: '2-digit', second: '2-digit'
//   });
// };

// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return 'N/A';
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   return `${day}/${month}/${year} ${hours}:${minutes}`;
// };

// const formatCurrency = (amount) => {
//   if (!amount || amount === '0' || amount === 0) return '₹ 0';
//   return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const formatPriceWithUnit = (price, unit) => {
//   if (!price && price !== 0) return '—';
//   const formattedPrice = formatCurrency(price);
//   if (!unit) return formattedPrice;
//   return `${formattedPrice} / ${unit}`;
// };

// const formatRequestedLimit = (value, startCriteria) => {
//   if (value === undefined || value === null || value === '') return '—';
//   if (!startCriteria) return String(value);
//   const upper = startCriteria.toUpperCase();
//   if (upper === 'TIME') return `${value} min`;
//   if (upper === 'ENERGY' || upper === 'AMOUNT') return `${value} kWh`;
//   if (upper === 'SESSIONS') return `${value} session`;
//   return String(value);
// };

// const truncateId = (id) => {
//   if (!id) return 'N/A';
//   const str = String(id);
//   return str.length > 10 ? str.substring(0, 10) + '…' : str;
// };

// // Trace helpers
// const SOURCE_COLORS = {
//   APP: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-300', light: 'bg-blue-50' },
//   CMS: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-300', light: 'bg-purple-50' },
//   HAL: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-300', light: 'bg-emerald-50' },
//   CHARGER: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-300', light: 'bg-amber-50' },
// };
// const SOURCE_ORDER = ['APP', 'CMS', 'HAL', 'CHARGER'];
// const getSourceColor = (source) => SOURCE_COLORS[source] || { bg: 'bg-gray-400', text: 'text-gray-600', border: 'border-gray-300', light: 'bg-gray-50' };
// const PHASE_COLORS = {
//   PRE_START: { bg: 'bg-blue-50/70', text: 'text-blue-700', chip: 'bg-blue-100 text-blue-700' },
//   STARTING: { bg: 'bg-indigo-50/70', text: 'text-indigo-700', chip: 'bg-indigo-100 text-indigo-700' },
//   CHARGING: { bg: 'bg-emerald-50/70', text: 'text-emerald-700', chip: 'bg-emerald-100 text-emerald-700' },
//   STOPPING: { bg: 'bg-amber-50/70', text: 'text-amber-700', chip: 'bg-amber-100 text-amber-700' },
//   POST_STOP: { bg: 'bg-purple-50/70', text: 'text-purple-700', chip: 'bg-purple-100 text-purple-700' },
// };
// const getPhaseColor = (phase) => PHASE_COLORS[phase] || { bg: 'bg-gray-50/70', text: 'text-gray-600', chip: 'bg-gray-100 text-gray-600' };

// // ==========================================================================
// // SOC BATTERY DISPLAY
// // ==========================================================================
// const SocBatteryDisplay = ({ initialSoc, finalSoc, isOngoing }) => {
//   if (initialSoc === null && finalSoc === null) return null;
//   const initial = Math.min(Math.max(initialSoc ?? 0, 0), 100);
//   const final = Math.min(Math.max(finalSoc ?? 0, 0), 100);
//   const charged = Math.max(final - initial, 0);
//   const displaySoc = final;

//   const getBatteryColor = (soc) => {
//     if (soc >= 80) return 'from-green-400 to-emerald-500';
//     if (soc >= 50) return 'from-blue-400 to-indigo-500';
//     if (soc >= 20) return 'from-yellow-400 to-orange-500';
//     return 'from-red-400 to-rose-500';
//   };
//   const batteryColor = getBatteryColor(displaySoc);

//   const getBatteryIcon = (soc) => {
//     if (soc >= 80) return <BatteryFull className="w-5 h-5 text-green-500" />;
//     if (soc >= 50) return <BatteryCharging className="w-5 h-5 text-blue-500" />;
//     if (soc >= 20) return <BatteryMedium className="w-5 h-5 text-yellow-500" />;
//     return <BatteryLow className="w-5 h-5 text-red-500" />;
//   };

//   return (
//     <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           {getBatteryIcon(displaySoc)}
//           <h4 className="text-sm font-semibold text-gray-700">State of Charge</h4>
//         </div>
//         {isOngoing && (
//           <span className="text-xs text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
//             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
//             Live
//           </span>
//         )}
//       </div>

//       <div className="relative">
//         <div className="w-full h-14 bg-gray-200 rounded-xl overflow-hidden border-2 border-gray-300 relative">
//           <div
//             className={`h-full bg-gradient-to-r ${batteryColor} transition-all duration-700 ease-in-out rounded-lg flex items-center justify-end pr-3`}
//             style={{ width: `${displaySoc}%` }}
//           >
//             {displaySoc >= 15 && (
//               <span className="text-white text-sm font-bold drop-shadow-md">{Math.round(displaySoc)}%</span>
//             )}
//           </div>
//           <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-lg"></div>
//         </div>
//         <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-8 bg-gray-300 rounded-r-lg border-2 border-gray-300"></div>
//       </div>

//       <div className="flex justify-between mt-3 text-xs text-gray-500">
//         <div className="flex items-center gap-2">
//           <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//           <span>Start: {Math.round(initial)}%</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
//           <span>{isOngoing ? 'Current' : 'End'}: {Math.round(displaySoc)}%</span>
//         </div>
//       </div>

//       {initialSoc !== null && finalSoc !== null && (
//         <div className="mt-4 text-sm text-gray-600 text-center bg-white/60 rounded-xl py-2.5 border border-gray-200">
//           <span className="font-medium">
//             {charged > 0 ? (
//               <>
//                 <span className="text-emerald-600 font-bold">+{charged.toFixed(0)}%</span>
//                 <span className="text-gray-400 mx-2">•</span>
//                 Charged <span className="font-semibold">{charged.toFixed(0)}%</span>
//                 {isOngoing ? ' so far' : ' during session'}
//               </>
//             ) : (
//               <span className="text-gray-400">No charge increase recorded</span>
//             )}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// };

// // ==========================================================================
// // SessionDetailModal
// // ==========================================================================
// const SessionDetailModal = ({ session, loading, error, onClose }) => {
//   if (!session) return null;

//   const isOngoing = isOngoingStatus(session.status) || session.status === 'ACTIVE' || session.status === 'STOP_PENDING';
//   const durationSeconds = isOngoing
//     ? (session.duration_seconds || 0)
//     : (getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time) ?? (session.duration_seconds || 0));
//   const durationFormatted = formatDuration(durationSeconds);
//   const durationMinutes = getDurationMinutes(durationSeconds);

//   const isLive = session.is_live || session.live_data || session.consumed_wh;
//   const energy = getEnergyKwh(session);
//   const soc = getSocPercent(session);
//   const meterFreshness = getMeterFreshness(session);
//   const socFreshness = getSocFreshness(session);
//   const projectedAmount = getProjectedAmount(session);
//   const transactionId = getTransactionId(session);

//   const initialSoc = getInitialSocPercent(session);
//   const finalSoc = getFinalSocPercent(session, isOngoing, soc);

//   const pricePerUnit = session.price_per_unit;
//   const unit = session.unit || session.units;
//   const startCriteria = session.start_criteria;
//   const requestedLimit = session.requested_limit_value;
//   const sgst = session.sgst_percent;
//   const cgst = session.cgst_percent;
//   const igst = session.igst_percent;

//   // ==== Stop reason fields ====
//   const stopObject = session.stop || {};
//   const stopReason = session.stop_reason;
//   const stopRequestedInitiator = stopObject.requested_initiator;
//   const stopRequestedReason = stopObject.requested_reason;
//   const stopOcppReason = stopObject.ocpp_reason;
//   const stopReasonDisplay = getStopReasonDisplay(session);

//   const hasAnyStopInfo = Boolean(
//     (stopReason && stopReason !== 'N/A') ||
//     stopRequestedInitiator ||
//     stopRequestedReason ||
//     stopOcppReason
//   );

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
//       <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl my-auto">
//         <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
//               <Activity className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-lg font-bold text-white">Session Details</h3>
//               <p className="text-sm text-white/80">
//                 ID: {truncateId(session.id || session.session_id)}
//                 {isLive && isOngoing && (
//                   <span className="ml-2 text-green-300 inline-flex items-center gap-1">
//                     <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
//                     Live
//                   </span>
//                 )}
//               </p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-hide">
//           {loading ? (
//             <div className="flex items-center justify-center py-20">
//               <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//               <p className="text-gray-600">{error}</p>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
//                   <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(session.status)}`}>
//                     {getStatusIcon(session.status)}
//                     {getStatusDisplayName(session.status)}
//                   </span>
//                 </div>
//                 <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
//                   <p className="text-2xl font-bold text-emerald-600 mt-1">
//                     {formatCurrency(projectedAmount || session.total_amount)}
//                   </p>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">Usage</p>
//                   <p className="text-2xl font-bold text-purple-600 mt-1">
//                     {energy > 0 ? energy.toFixed(2) : (session.total_kwh || 0)} kWh
//                   </p>
//                   {isLive && soc && <p className="text-xs text-gray-500 mt-1">SOC: {soc}%</p>}
//                 </div>
//                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
//                   <p className="text-2xl font-bold text-amber-600 mt-1">{durationFormatted}</p>
//                   {durationMinutes > 0 && !isOngoing && (
//                     <p className="text-xs text-gray-400 mt-1">({durationMinutes} minutes)</p>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200 mb-6">
//                 <p className="text-xs font-medium text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
//                   <IndianRupee size={14} className="text-indigo-600" />
//                   Pricing & GST
//                 </p>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//                   {pricePerUnit !== null && pricePerUnit !== undefined && (
//                     <div>
//                       <span className="text-gray-500">Tariff</span>
//                       <span className="ml-2 font-medium text-gray-800">{formatPriceWithUnit(pricePerUnit, unit)}</span>
//                     </div>
//                   )}
//                   {startCriteria && (
//                     <div>
//                       <span className="text-gray-500">Start Criteria</span>
//                       <span className="ml-2 font-medium text-gray-800">{startCriteria}</span>
//                     </div>
//                   )}
//                   {requestedLimit !== null && requestedLimit !== undefined && (
//                     <div>
//                       <span className="text-gray-500">Requested Limit</span>
//                       <span className="ml-2 font-medium text-gray-800">{formatRequestedLimit(requestedLimit, startCriteria)}</span>
//                     </div>
//                   )}
//                   {sgst !== null && sgst !== undefined && (
//                     <div><span className="text-gray-500">SGST</span><span className="ml-2 font-medium text-gray-800">{sgst}%</span></div>
//                   )}
//                   {cgst !== null && cgst !== undefined && (
//                     <div><span className="text-gray-500">CGST</span><span className="ml-2 font-medium text-gray-800">{cgst}%</span></div>
//                   )}
//                   {igst !== null && igst !== undefined && (
//                     <div><span className="text-gray-500">IGST</span><span className="ml-2 font-medium text-gray-800">{igst}%</span></div>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Session Info</p>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Session ID</span>
//                       <span className="font-mono text-gray-900">{session.id || session.session_id || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Transaction ID</span>
//                       <span className="font-mono text-gray-900">{transactionId}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Connector</span>
//                       <span className="text-gray-900">#{session.connector?.number || session.connector_number || 'N/A'}</span>
//                     </div>
//                     {session.connector?.connector_type && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Connector Type</span>
//                         <span className="text-gray-900">{session.connector.connector_type}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Info</p>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Name</span>
//                       <span className="text-gray-900">{session.customer?.name || session.customer_name || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Email</span>
//                       <span className="text-gray-900">{session.customer?.email || session.customer_email || 'N/A'}</span>
//                     </div>
//                     {(session.customer?.phone || session.customer_phone) && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-500">Phone</span>
//                         <span className="text-gray-900">{session.customer?.phone || session.customer_phone}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Charger Info</p>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Charger Name</span>
//                       <span className="text-gray-900">{session.charger?.name || session.charger_name || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Charger ID</span>
//                       <span className="text-gray-900">{session.charger?.charger_id || session.charger_id || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Hub</span>
//                       <span className="text-gray-900">{session.charger?.hub_name || session.hub_name || 'N/A'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Timestamps</p>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Start Time</span>
//                       <span className="text-gray-900">{formatDate(session.start_time || session.started_at)}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">End Time</span>
//                       <span className="text-gray-900">{session.end_time ? formatDate(session.end_time) : (isOngoing ? 'Ongoing' : 'N/A')}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Duration</span>
//                       <span className="text-gray-900 font-medium">{durationFormatted}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {isLive && isOngoing && (
//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 mb-4">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                     Live Session Data
//                   </p>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
//                     <div><span className="text-gray-500">Status:</span> <span className="ml-2 font-medium text-green-700">{getStatusDisplayName(session.status)}</span></div>
//                     <div><span className="text-gray-500">Usage:</span> <span className="ml-2 font-medium text-blue-700">{energy.toFixed(2)} kWh</span></div>
//                     {soc && (
//                       <div>
//                         <span className="text-gray-500">SOC:</span>
//                         <span className="ml-2 font-medium text-indigo-700">{soc}%</span>
//                         {socFreshness && (
//                           <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${socFreshness === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
//                             {socFreshness}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                     <div><span className="text-gray-500">Amount:</span> <span className="ml-2 font-medium text-emerald-700">{formatCurrency(projectedAmount || session.total_amount)}</span></div>
//                     <div><span className="text-gray-500">Duration:</span> <span className="ml-2 font-medium text-amber-700">{durationFormatted}</span></div>
//                     <div>
//                       <span className="text-gray-500">Meter:</span>
//                       <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${meterFreshness === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
//                         {meterFreshness}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* STOP INFORMATION */}
//               {hasAnyStopInfo && !isOngoing && (
//                 <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200 mb-4">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
//                     <CircleX size={14} className="text-red-600" />
//                     Stop Information
//                   </p>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//                     {stopReasonDisplay && (
//                       <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
//                         <span className="text-gray-500">Stop Reason</span>
//                         <span className="font-semibold text-red-700">{stopReasonDisplay}</span>
//                       </div>
//                     )}
//                     {stopOcppReason && (
//                       <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
//                         <span className="text-gray-500">OCPP Reason</span>
//                         <span className="font-semibold text-red-700">{stopOcppReason}</span>
//                       </div>
//                     )}
//                     {stopRequestedInitiator && (
//                       <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
//                         <span className="text-gray-500">Requested Initiator</span>
//                         <span className="font-semibold text-orange-700">{stopRequestedInitiator}</span>
//                       </div>
//                     )}
//                     {stopRequestedReason && (
//                       <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
//                         <span className="text-gray-500">Requested Reason</span>
//                         <span className="font-semibold text-orange-700">{prettifyReason(stopRequestedReason)}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="mb-6">
//                 <SocBatteryDisplay initialSoc={initialSoc} finalSoc={finalSoc} isOngoing={isOngoing} />
//               </div>

//               <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
//                 <button
//                   onClick={onClose}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25"
//                 >
//                   <X size={18} /> Close
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ==========================================================================
// // TraceModal
// // ==========================================================================
// const compareTraceEventsChronological = (a, b) => {
//   const at = new Date(a?.occurred_at || 0).getTime();
//   const bt = new Date(b?.occurred_at || 0).getTime();
//   if (at !== bt) return at - bt;
//   return String(a?.id || '').localeCompare(String(b?.id || ''));
// };

// const isMeterTraceEvent = (event) => {
//   const category = String(event?.category || '').toUpperCase();
//   const summary = String(event?.summary || '').toUpperCase();
//   return (
//     category.includes('METER') ||
//     summary.includes('METERVALUES') ||
//     summary.includes('METER VALUE') ||
//     summary.includes('METER OBSERVATION')
//   );
// };

// const meterValueFromEvent = (event) => {
//   const value = event?.data?.meter_wh;
//   if (value === undefined || value === null || value === '') return null;
//   const numeric = Number(value);
//   return Number.isFinite(numeric) ? numeric : null;
// };

// const buildTraceDisplayRows = (events, expandedMeterGroups) => {
//   const rows = [];
//   for (let i = 0; i < events.length; ) {
//     const event = events[i];
//     if (!isMeterTraceEvent(event)) {
//       rows.push({ kind: 'event', key: event.id, event });
//       i += 1;
//       continue;
//     }
//     const group = [event];
//     let j = i + 1;
//     while (j < events.length) {
//       const next = events[j];
//       if (
//         !isMeterTraceEvent(next) ||
//         next.source !== event.source ||
//         next.target !== event.target ||
//         next.phase !== event.phase ||
//         next.protocol !== event.protocol
//       ) break;
//       group.push(next);
//       j += 1;
//     }
//     if (group.length === 1) rows.push({ kind: 'event', key: event.id, event });
//     else {
//       const groupKey = `meter:${group[0].id}:${group[group.length - 1].id}`;
//       if (expandedMeterGroups.has(groupKey)) {
//         group.forEach((member) => rows.push({ kind: 'event', key: member.id, event: member, meterGroupKey: groupKey }));
//       } else {
//         rows.push({ kind: 'meter-group', key: groupKey, event: group[0], events: group, groupKey });
//       }
//     }
//     i = j;
//   }
//   return rows;
// };

// const TraceModal = ({ traceData, loading, error, pagination, loadingMore, streamStatus, streamError, onClose, onLoadMore }) => {
//   const [expandedMeterGroups, setExpandedMeterGroups] = useState(() => new Set());
//   const events = traceData?.events || [];

//   const sortedEvents = useMemo(() => {
//     const byId = new Map();
//     events.forEach((event) => { if (event?.id) byId.set(event.id, event); });
//     return [...byId.values()].sort(compareTraceEventsChronological);
//   }, [events]);

//   const displayRows = useMemo(() => buildTraceDisplayRows(sortedEvents, expandedMeterGroups), [sortedEvents, expandedMeterGroups]);

//   const sourcesPresent = useMemo(() => {
//     const validSources = Array.isArray(traceData?.sources_present)
//       ? traceData.sources_present.filter((source) => typeof source === 'string' && source.trim())
//       : [];
//     const known = SOURCE_ORDER.filter((source) => validSources.includes(source));
//     const unknown = validSources.filter((source) => !SOURCE_ORDER.includes(source));
//     return [...known, ...unknown];
//   }, [traceData?.sources_present]);

//   const phaseSegments = useMemo(() => {
//     const segments = [];
//     displayRows.forEach((row) => {
//       const phase = row.event?.phase || 'UNKNOWN';
//       const last = segments[segments.length - 1];
//       if (last && last.phase === phase) last.rows.push(row);
//       else segments.push({ phase, rows: [row] });
//     });
//     return segments;
//   }, [displayRows]);

//   if (!traceData && !loading && !error) return null;

//   const traceUnavailable = error === 'Diagnostic trace is not available for this session.';

//   const toggleMeterGroup = (groupKey) => {
//     setExpandedMeterGroups((current) => {
//       const next = new Set(current);
//       if (next.has(groupKey)) next.delete(groupKey);
//       else next.add(groupKey);
//       return next;
//     });
//   };

//   const renderEventDetails = (event) => (
//     <details className="mt-2 text-xs">
//       <summary className="cursor-pointer text-gray-500 hover:text-gray-800 select-none">Details</summary>
//       <div className="mt-2 rounded-lg bg-white/80 border border-gray-200 p-2 space-y-1 text-gray-600">
//         <div><span className="font-medium">Direction:</span> {event?.source || 'UNKNOWN'} → {event?.target || 'UNKNOWN'}</div>
//         <div><span className="font-medium">Event ID:</span> <span className="font-mono break-all">{event?.id || 'N/A'}</span></div>
//         <div><span className="font-medium">Trace ID:</span> <span className="font-mono break-all">{event?.trace_id || traceData?.trace_id || 'N/A'}</span></div>
//         <div><span className="font-medium">Occurred:</span> <time dateTime={event?.occurred_at || undefined}>{formatTraceDate(event?.occurred_at)}</time></div>
//         {event?.correlation_id && <div><span className="font-medium">Correlation:</span> <span className="font-mono break-all">{event.correlation_id}</span></div>}
//         {(event?.state_before || event?.state_after) && (
//           <div><span className="font-medium">State:</span> {event?.state_before || '—'} → {event?.state_after || '—'}</div>
//         )}
//         <div>
//           <span className="font-medium">Sanitized data:</span>
//           <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-slate-950 text-slate-100 p-2 overflow-x-auto">
//             {JSON.stringify(event?.data ?? {}, null, 2)}
//           </pre>
//         </div>
//       </div>
//     </details>
//   );

//   const renderDesktopTraceRow = (row) => {
//     const event = row.event || {};
//     const source = event.source || 'UNKNOWN';
//     const target = event.target || 'UNKNOWN';
//     const sourceIndex = SOURCE_ORDER.indexOf(source);
//     const targetIndex = SOURCE_ORDER.indexOf(target);
//     const sourceColor = getSourceColor(source);
//     const sourceKnown = sourceIndex !== -1;
//     const targetKnown = targetIndex !== -1;
//     const meterGroup = row.kind === 'meter-group' ? row.events : null;
//     const firstMeter = meterGroup ? meterValueFromEvent(meterGroup[0]) : null;
//     const lastMeter = meterGroup ? meterValueFromEvent(meterGroup[meterGroup.length - 1]) : null;
//     const summary = meterGroup ? `MeterValues × ${meterGroup.length}` : event.summary || 'Trace event';
//     const occurredEnd = meterGroup ? meterGroup[meterGroup.length - 1]?.occurred_at : null;

//     const sourceX = sourceKnown ? ((sourceIndex + 0.5) / SOURCE_ORDER.length) * 100 : 0;
//     const targetX = targetKnown ? ((targetIndex + 0.5) / SOURCE_ORDER.length) * 100 : 0;
//     const arrowLeft = Math.min(sourceX, targetX);
//     const arrowWidth = Math.abs(targetX - sourceX);
//     const movesRight = targetX > sourceX;

//     return (
//       <div key={row.key} className="grid grid-cols-[150px_repeat(4,minmax(180px,1fr))] relative min-h-[124px] border-t border-gray-100">
//         <div className="px-3 py-4 bg-white/70 border-r border-gray-200 text-xs text-gray-500">
//           <time dateTime={event.occurred_at || undefined} className="font-medium text-gray-700">
//             {formatTraceDate(event.occurred_at)}
//           </time>
//           {occurredEnd && occurredEnd !== event.occurred_at && (
//             <div className="mt-1">→ <time dateTime={occurredEnd}>{formatTraceDate(occurredEnd)}</time></div>
//           )}
//         </div>
//         {SOURCE_ORDER.map((lane) => {
//           const isSource = source === lane;
//           return (
//             <div key={`${row.key}-${lane}`} className="relative px-3 py-3">
//               {isSource && (
//                 <div className={`relative z-20 mt-10 rounded-xl border ${sourceColor.border} ${sourceColor.light} p-3 shadow-sm`}>
//                   <div className={`text-[10px] font-bold uppercase tracking-wide ${sourceColor.text}`}>
//                     {source} → {target}
//                   </div>
//                   <div className="mt-1 text-sm font-semibold text-gray-800">{summary}</div>
//                   <div className="mt-2 flex flex-wrap gap-1.5">
//                     <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">{event.phase || 'UNKNOWN'}</span>
//                     <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">{event.protocol || 'UNKNOWN'}</span>
//                     <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">{event.category || 'UNKNOWN'}</span>
//                   </div>
//                   {meterGroup && (
//                     <div className="mt-2 text-xs text-gray-600">
//                       {firstMeter !== null || lastMeter !== null ? (
//                         <div>Meter: <span className="font-mono">{firstMeter ?? '—'} Wh → {lastMeter ?? '—'} Wh</span></div>
//                       ) : (
//                         <div>{meterGroup.length} loaded meter observations</div>
//                       )}
//                       <button
//                         type="button"
//                         onClick={() => toggleMeterGroup(row.groupKey)}
//                         className="mt-2 px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium"
//                       >
//                         Expand samples
//                       </button>
//                     </div>
//                   )}
//                   {!meterGroup && renderEventDetails(event)}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//         {sourceKnown && targetKnown && (
//           <div className="absolute left-[150px] right-0 top-0 h-[64px] pointer-events-none z-10" aria-hidden="true">
//             {source === target ? (
//               <>
//                 <div className="absolute top-[8px] w-9 h-6 rounded-t-full border-2 border-b-0 border-indigo-400" style={{ left: `calc(${sourceX}% - 18px)` }} />
//                 <span className="absolute top-[22px] w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-indigo-500" style={{ left: `calc(${sourceX}% + 10px)` }} />
//                 <span className="absolute top-[25px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white -translate-x-1/2" style={{ left: `${sourceX}%` }} />
//               </>
//             ) : (
//               <>
//                 <div className="absolute top-[30px] h-[2px] bg-indigo-400" style={{ left: `${arrowLeft}%`, width: `${arrowWidth}%` }} />
//                 <span className="absolute top-[25px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white -translate-x-1/2" style={{ left: `${sourceX}%` }} />
//                 <span className="absolute top-[25px] w-3 h-3 rounded-full bg-white border-2 border-indigo-500 ring-4 ring-white -translate-x-1/2" style={{ left: `${targetX}%` }} />
//                 {movesRight ? (
//                   <span className="absolute top-[25px] w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-indigo-500" style={{ left: `calc(${targetX}% - 15px)` }} />
//                 ) : (
//                   <span className="absolute top-[25px] w-0 h-0 border-y-[6px] border-transparent border-r-[10px] border-r-indigo-500" style={{ left: `calc(${targetX}% + 5px)` }} />
//                 )}
//               </>
//             )}
//             <span className="sr-only">{source} to {target}: {summary}</span>
//           </div>
//         )}
//         {(!sourceKnown || !targetKnown) && (
//           <div className="col-start-2 col-span-4 px-4 pb-4">
//             <div className="rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
//               <div className="font-semibold">{source} → {target}</div>
//               <div className="mt-1">{summary}</div>
//               {renderEventDetails(event)}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderMobileTraceRow = (row) => {
//     const event = row.event || {};
//     const meterGroup = row.kind === 'meter-group' ? row.events : null;
//     return (
//       <div key={`mobile-${row.key}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//         <div className="flex items-start justify-between gap-3">
//           <div>
//             <div className="text-xs font-bold text-gray-700">{event.source || 'UNKNOWN'} → {event.target || 'UNKNOWN'}</div>
//             <div className="mt-1 text-sm font-semibold text-gray-900">
//               {meterGroup ? `MeterValues × ${meterGroup.length}` : event.summary || 'Trace event'}
//             </div>
//           </div>
//           <time dateTime={event.occurred_at || undefined} className="text-[10px] text-gray-500 text-right">
//             {formatTraceDate(event.occurred_at)}
//           </time>
//         </div>
//         <div className="mt-2 flex flex-wrap gap-1.5">
//           <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{event.phase || 'UNKNOWN'}</span>
//           <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{event.protocol || 'UNKNOWN'}</span>
//           <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{event.category || 'UNKNOWN'}</span>
//         </div>
//         {meterGroup ? (
//           <button type="button" onClick={() => toggleMeterGroup(row.groupKey)} className="mt-3 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs text-gray-700 font-medium">
//             Expand {meterGroup.length} samples
//           </button>
//         ) : renderEventDetails(event)}
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
//       <div className="min-h-screen p-4 md:p-6 flex items-start justify-center">
//         <div className="bg-white rounded-3xl w-full max-w-7xl shadow-2xl overflow-hidden my-4">
//           <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between gap-4">
//             <div>
//               <h3 className="text-lg font-bold text-gray-900">Charging Transaction Trace</h3>
//               <p className="text-sm text-gray-500 mt-1">
//                 Session: <span className="font-mono">{truncateId(traceData?.session_id) || 'N/A'}</span> · Trace: <span className="font-mono">{truncateId(traceData?.trace_id) || 'N/A'}</span>
//               </p>
//             </div>
//             <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl transition" aria-label="Close charging trace">
//               <X size={22} />
//             </button>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//               <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider">Trace ID</p>
//                 <p className="text-sm font-mono text-gray-800 truncate">{traceData?.trace_id || 'N/A'}</p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider">CMS Session ID</p>
//                 <p className="text-sm font-mono text-gray-800 truncate">{traceData?.session_id || 'N/A'}</p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider">HAL Transaction ID</p>
//                 <p className="text-sm font-mono text-gray-800 truncate">{traceData?.hal_transaction_id || 'N/A'}</p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                 <p className="text-xs text-gray-500 uppercase tracking-wider">OCPP Transaction ID</p>
//                 <p className="text-sm font-mono text-gray-800 truncate">{traceData?.ocpp_transaction_id ?? 'N/A'}</p>
//               </div>
//             </div>
//             {loading && !traceData && (
//               <div className="flex items-center justify-center py-20">
//                 <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//                 <span className="ml-3 text-gray-500">Loading trace events...</span>
//               </div>
//             )}
//             {error && (
//               <div className={`mb-6 rounded-xl p-4 flex items-center gap-2 border ${
//                 traceUnavailable ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-red-50 border-red-200 text-red-700'
//               }`}>
//                 <AlertCircle size={20} />
//                 {error}
//               </div>
//             )}
//             {!loading && traceData && sortedEvents.length === 0 && (
//               <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
//                 <p className="text-gray-600">No diagnostic events are available for this trace.</p>
//               </div>
//             )}
//             {!loading && traceData && sortedEvents.length > 0 && (
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//                 <div className="hidden md:block max-h-[65vh] overflow-auto scrollbar-hide relative">
//                   <div className="min-w-[980px]">
//                     <div className="sticky top-0 z-40 grid grid-cols-[150px_repeat(4,minmax(180px,1fr))] bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
//                       <div className="px-3 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200">Time</div>
//                       {SOURCE_ORDER.map((lane) => {
//                         const color = getSourceColor(lane);
//                         return (
//                           <div key={lane} className="px-3 py-3 text-center border-r border-gray-100">
//                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${color.border} ${color.light} ${color.text} text-xs font-bold`}>
//                               <span className={`w-2 h-2 rounded-full ${color.bg}`} />
//                               {lane}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                     {phaseSegments.map((segment, segmentIndex) => {
//                       const phaseColor = getPhaseColor(segment.phase);
//                       return (
//                         <section key={`${segment.phase}-${segmentIndex}`} className={phaseColor.bg} aria-label={`${segment.phase} trace phase`}>
//                           <div className="px-3 py-2 border-b border-gray-100">
//                             <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${phaseColor.chip}`}>
//                               {String(segment.phase).replaceAll('_', ' ')}
//                             </span>
//                           </div>
//                           {segment.rows.map(renderDesktopTraceRow)}
//                         </section>
//                       );
//                     })}
//                   </div>
//                 </div>
//                 <div className="md:hidden p-3 space-y-4">
//                   {phaseSegments.map((segment, segmentIndex) => {
//                     const phaseColor = getPhaseColor(segment.phase);
//                     return (
//                       <section key={`mobile-${segment.phase}-${segmentIndex}`} className={`rounded-xl p-3 ${phaseColor.bg}`}>
//                         <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold mb-3 ${phaseColor.chip}`}>
//                           {String(segment.phase).replaceAll('_', ' ')}
//                         </div>
//                         <div className="space-y-3">
//                           {segment.rows.map(renderMobileTraceRow)}
//                         </div>
//                       </section>
//                     );
//                   })}
//                 </div>
//                 <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center gap-3 text-xs text-gray-500">
//                   <span>Each arrow is exactly one backend-declared source → target event.</span>
//                   {pagination?.has_more && (
//                     <>
//                       <span>•</span>
//                       <button type="button" onClick={onLoadMore} disabled={loadingMore} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium">
//                         {loadingMore ? 'Loading older evidence...' : 'Load older evidence'}
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ==========================================================================
// // MAIN SESSIONS COMPONENT
// // ==========================================================================
// const Sessions = () => {
//   const navigate = useNavigate();
//   const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user, refreshToken } = useAuth();

//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showAddMenu, setShowAddMenu] = useState(false);
//   const [showFilterPopup, setShowFilterPopup] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const [activeMainTab, setActiveMainTab] = useState('sessions');
//   const [activeTab, setActiveTab] = useState('all');

//   const [allSessions, setAllSessions] = useState([]);
//   const [ongoingSessions, setOngoingSessions] = useState([]);
//   const [liveSessionsData, setLiveSessionsData] = useState({ sessions: [], as_of: null });
//   const [updatedSessionIds, setUpdatedSessionIds] = useState(new Set());

//   const [pagination, setPagination] = useState({
//     limit: 20,
//     has_more: false,
//     cursor_value: null,
//     cursor_id: null,
//   });
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasLoaded, setHasLoaded] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);

//   const [statusFilter, setStatusFilter] = useState('All');

//   const [sortBy, setSortBy] = useState('created_at');
//   const [sortOrder, setSortOrder] = useState('desc');

//   // ✅ Date filter persisted in localStorage, defaulting to 'month'
//   const [dateFilter, setDateFilter] = useState(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEYS.DATE_FILTER);
//       return saved || 'month';
//     } catch {
//       return 'month';
//     }
//   });
//   const [customDate, setCustomDate] = useState(() => {
//     try {
//       return localStorage.getItem(STORAGE_KEYS.CUSTOM_DATE) || null;
//     } catch {
//       return null;
//     }
//   });
//   const [showDateDropdown, setShowDateDropdown] = useState(false);
//   const dateDropdownRef = useRef(null);

//   // ✅ Persist date filter changes
//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEYS.DATE_FILTER, dateFilter);
//       if (dateFilter === 'custom' && customDate) {
//         localStorage.setItem(STORAGE_KEYS.CUSTOM_DATE, customDate);
//       } else if (dateFilter !== 'custom') {
//         localStorage.removeItem(STORAGE_KEYS.CUSTOM_DATE);
//       }
//     } catch (err) {
//       console.warn('Failed to persist date filter:', err);
//     }
//   }, [dateFilter, customDate]);

//   const [showDetailModal, setShowDetailModal] = useState(() => sessionStorage.getItem('sessionModalOpen') === 'true');
//   const [selectedSession, setSelectedSession] = useState(() => {
//     const saved = sessionStorage.getItem('selectedSession');
//     return saved ? JSON.parse(saved) : null;
//   });
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [selectedSessionId, setSelectedSessionId] = useState(() => sessionStorage.getItem('selectedSessionId') || null);

//   const [showTraceModal, setShowTraceModal] = useState(false);
//   const [traceData, setTraceData] = useState(null);
//   const [loadingTrace, setLoadingTrace] = useState(false);
//   const [traceError, setTraceError] = useState('');
//   const [tracePagination, setTracePagination] = useState({
//     has_more: false,
//     next_occurred_at: null,
//     next_event_id: null
//   });
//   const [loadingMoreTrace, setLoadingMoreTrace] = useState(false);
//   const [traceStreamStatus, setTraceStreamStatus] = useState('idle');
//   const [traceStreamError, setTraceStreamError] = useState('');

//   const [isCompact, setIsCompact] = useState(true);

//   const [isStreaming, setIsStreaming] = useState(false);
//   const eventSourceRef = useRef(null);
//   const [showLiveIndicator, setShowLiveIndicator] = useState(false);
//   const streamRetryTimeoutRef = useRef(null);
//   const liveSessionsMapRef = useRef({});
//   const isMountedRef = useRef(true);
//   const fetchInProgressRef = useRef(false);
//   const streamInitializedRef = useRef(false);
//   const sessionRefreshTimeoutRef = useRef(null);
//   const durationUpdateIntervalRef = useRef(null);
//   const previousLiveSessionsRef = useRef([]);
//   const liveDurationIntervalRef = useRef(null);
//   const modalLiveDataIntervalRef = useRef(null);
//   const modalScrollPositionRef = useRef(0);

//   const previousLiveIdsRef = useRef(new Set());
//   const completedSessionsFetchRef = useRef(new Set());

//   const traceStreamRef = useRef(null);
//   const traceStreamRetryTimeoutRef = useRef(null);
//   const traceStreamEnabledRef = useRef(false);
//   const traceModalActiveRef = useRef(false);
//   const traceStreamTraceIdRef = useRef(null);
//   const traceReplayCursorRef = useRef(0);

//   const initialFilterEffectDoneRef = useRef(false);

//   const dateRange = useMemo(() => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     switch(dateFilter) {
//       case 'today': {
//         const to = new Date(today);
//         to.setDate(to.getDate() + 1);
//         return { from: today.toISOString(), to: to.toISOString() };
//       }
//       case 'yesterday': {
//         const from = new Date(today);
//         from.setDate(from.getDate() - 1);
//         return { from: from.toISOString(), to: today.toISOString() };
//       }
//       case 'week': {
//         const from = new Date(today);
//         const day = from.getDay();
//         const diff = day === 0 ? 6 : day - 1;
//         from.setDate(from.getDate() - diff);
//         const to = new Date(today);
//         to.setDate(to.getDate() + 1);
//         return { from: from.toISOString(), to: to.toISOString() };
//       }
//       case 'month': {
//         const from = new Date(today.getFullYear(), today.getMonth(), 1);
//         const to = new Date(today.getFullYear(), today.getMonth() + 1, 1);
//         return { from: from.toISOString(), to: to.toISOString() };
//       }
//       case 'year': {
//         const from = new Date(today.getFullYear(), 0, 1);
//         const to = new Date(today.getFullYear() + 1, 0, 1);
//         return { from: from.toISOString(), to: to.toISOString() };
//       }
//       case 'custom': {
//         if (!customDate) return null;
//         const from = new Date(customDate);
//         from.setHours(0, 0, 0, 0);
//         const to = new Date(from);
//         to.setDate(to.getDate() + 1);
//         return { from: from.toISOString(), to: to.toISOString() };
//       }
//       default:
//         return null;
//     }
//   }, [dateFilter, customDate]);

//   const dateFilterLabel = useMemo(() => {
//     switch (dateFilter) {
//       case 'today': return 'Today';
//       case 'yesterday': return 'Yesterday';
//       case 'week': return 'This Week';
//       case 'month': return 'This Month';
//       case 'year': return 'This Year';
//       case 'custom':
//         if (customDate) {
//           return new Date(customDate).toLocaleDateString('en-IN', {
//             day: '2-digit', month: 'short', year: 'numeric'
//           });
//         }
//         return 'Custom Date';
//       default: return 'Select Date';
//     }
//   }, [dateFilter, customDate]);

//   useEffect(() => {
//     if (showDetailModal) {
//       sessionStorage.setItem('sessionModalOpen', 'true');
//       sessionStorage.setItem('selectedSessionId', selectedSessionId || '');
//       if (selectedSession) sessionStorage.setItem('selectedSession', JSON.stringify(selectedSession));
//     } else {
//       sessionStorage.removeItem('sessionModalOpen');
//       sessionStorage.removeItem('selectedSessionId');
//       sessionStorage.removeItem('selectedSession');
//     }
//   }, [showDetailModal, selectedSessionId, selectedSession]);

//   useEffect(() => {
//     if (showDetailModal || showTraceModal) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => { document.body.style.overflow = ''; };
//   }, [showDetailModal, showTraceModal]);

//   useEffect(() => {
//     if (!showDateDropdown) return;
//     const handler = (e) => {
//       if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
//         setShowDateDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, [showDateDropdown]);

//   useEffect(() => {
//     if (!isAuthenticated) { navigate('/signin'); return; }
//     isMountedRef.current = true;
//     const init = async () => {
//       await fetchUserInfo();
//       await fetchSessions();
//       if (!streamInitializedRef.current) {
//         startLiveSessionsSSE();
//         streamInitializedRef.current = true;
//       }
//     };
//     init();
//     return () => {
//       isMountedRef.current = false;
//       stopLiveSessionsSSE();
//       if (sessionRefreshTimeoutRef.current) clearTimeout(sessionRefreshTimeoutRef.current);
//       if (durationUpdateIntervalRef.current) clearInterval(durationUpdateIntervalRef.current);
//       if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
//       if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
//       traceStreamEnabledRef.current = false;
//       traceModalActiveRef.current = false;
//       if (traceStreamRef.current) {
//         traceStreamRef.current.abort?.();
//         traceStreamRef.current = null;
//       }
//       if (traceStreamRetryTimeoutRef.current) {
//         clearTimeout(traceStreamRetryTimeoutRef.current);
//         traceStreamRetryTimeoutRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated, navigate]);

//   useEffect(() => {
//     if (!isAuthenticated) return;
//     if (!initialFilterEffectDoneRef.current) {
//       initialFilterEffectDoneRef.current = true;
//       return;
//     }
//     setLoading(true);
//     setAllSessions([]);
//     setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
//     fetchSessions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [statusFilter, sortBy, sortOrder, dateFilter, customDate]);

//   useEffect(() => {
//     if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
//     liveDurationIntervalRef.current = setInterval(() => {
//       setLiveSessionsData(prev => ({ ...prev }));
//     }, 1000);
//     return () => { if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current); };
//   }, []);

//   const refreshCompletedSession = useCallback(async (sessionId) => {
//     if (!sessionId) return;
//     if (completedSessionsFetchRef.current.has(String(sessionId))) return;
//     completedSessionsFetchRef.current.add(String(sessionId));

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(API_CONFIG.SESSION_DETAIL_API(sessionId), {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'X-CPO-App-ID': CPO_APP_ID,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });
//       if (!response.ok || !isMountedRef.current) return;

//       const data = await response.json();
//       const session = data.session || data.data || data;
//       if (!session) return;

//       setOngoingSessions(prev =>
//         prev.filter(s => String(s.id || s.session_id) !== String(sessionId))
//       );

//       setAllSessions(prev => {
//         const idx = prev.findIndex(s => String(s.id || s.session_id) === String(sessionId));
//         const updatedEntry = {
//           ...session,
//           is_live: false,
//           live_data: null,
//           status: session.status || 'COMPLETED',
//           consumed_wh: null,
//           duration_seconds:
//             getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time)
//             ?? session.duration_seconds ?? null
//         };
//         if (idx < 0) {
//           return [updatedEntry, ...prev];
//         }
//         const updated = [...prev];
//         updated[idx] = { ...updated[idx], ...updatedEntry };
//         return updated;
//       });

//       setSelectedSession(prev => {
//         if (!prev) return prev;
//         const prevId = String(prev.id || prev.session_id);
//         if (prevId !== String(sessionId)) return prev;
//         return { ...prev, ...session, is_live: false, live_data: null };
//       });

//       delete liveSessionsMapRef.current[sessionId];
//     } catch (err) {
//       console.error('Failed to refresh completed session:', err);
//     } finally {
//       setTimeout(() => {
//         completedSessionsFetchRef.current.delete(String(sessionId));
//       }, 8000);
//     }
//   }, []);

//   useEffect(() => {
//     const currentLiveIds = new Set(
//       liveSessionsData.sessions.map(s => String(s.session_id || s.id))
//     );

//     const justCompleted = new Set();
//     previousLiveIdsRef.current.forEach(id => {
//       if (!currentLiveIds.has(id)) justCompleted.add(id);
//     });

//     const TERMINAL = ['COMPLETED', 'STOPPED', 'FAILED', 'CANCELLED', 'FINISHED'];
//     liveSessionsData.sessions.forEach(s => {
//       const status = String(s.status || '').toUpperCase();
//       if (TERMINAL.includes(status)) justCompleted.add(String(s.session_id || s.id));
//     });

//     previousLiveIdsRef.current = currentLiveIds;

//     if (justCompleted.size > 0) {
//       justCompleted.forEach(id => refreshCompletedSession(id));
//     }

//     const newSessionIds = new Set();
//     liveSessionsData.sessions.forEach(session => {
//       const id = session.session_id || session.id;
//       const prev = previousLiveSessionsRef.current.find(s => (s.session_id || s.id) === id);
//       if (prev) {
//         const prevEnergy = getEnergyKwh(prev);
//         const currEnergy = getEnergyKwh(session);
//         if (prevEnergy !== currEnergy || prev.status !== session.status) newSessionIds.add(id);
//       } else {
//         newSessionIds.add(id);
//       }
//     });
//     if (newSessionIds.size > 0) {
//       setUpdatedSessionIds(newSessionIds);
//       setTimeout(() => setUpdatedSessionIds(new Set()), 2000);
//     }
//     previousLiveSessionsRef.current = [...liveSessionsData.sessions];

//     const map = {};
//     liveSessionsData.sessions.forEach(s => {
//       const id = s.session_id || s.id;
//       if (id) map[id] = s;
//     });
//     liveSessionsMapRef.current = map;

//     if (showDetailModal && selectedSessionId) {
//       const liveData = map[selectedSessionId];
//       if (liveData) {
//         setSelectedSession(prev => {
//           if (!prev) return prev;
//           return {
//             ...prev,
//             ...liveData,
//             is_live: true,
//             consumed_wh: liveData.consumed_wh || prev.consumed_wh,
//             total_kwh: liveData.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : prev.total_kwh,
//             soc_percent: liveData.soc_percent || prev.soc_percent,
//             duration_seconds: liveData.duration_seconds ?? prev.duration_seconds,
//             status: liveData.status || prev.status,
//             charger_name: liveData.charger_name || prev.charger_name,
//             charger_id: liveData.charger_id || prev.charger_id,
//             hub_name: liveData.hub_name || prev.hub_name,
//             connector_number: liveData.connector_number || prev.connector_number,
//             customer_name: liveData.customer_name || prev.customer_name,
//             started_at: liveData.started_at || prev.started_at,
//             ocpp_transaction_id: liveData.ocpp_transaction_id || prev.ocpp_transaction_id,
//             transaction_id: liveData.ocpp_transaction_id || liveData.transaction_id || prev.transaction_id,
//             projected_amount: liveData.projected_amount || prev.projected_amount,
//             currency: liveData.currency || prev.currency
//           };
//         });
//       }
//     }

//     const ongoing = liveSessionsData.sessions.filter(s =>
//       isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING'
//     );
//     setOngoingSessions(ongoing);
//   }, [liveSessionsData, showDetailModal, selectedSessionId, refreshCompletedSession]);

//   useEffect(() => {
//     if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
//     if (showDetailModal && selectedSessionId) {
//       modalScrollPositionRef.current = window.scrollY;
//       modalLiveDataIntervalRef.current = setInterval(() => {
//         if (selectedSessionId && liveSessionsMapRef.current[selectedSessionId]) {
//           const liveData = liveSessionsMapRef.current[selectedSessionId];
//           setSelectedSession(prev => {
//             if (!prev || (!isOngoingStatus(prev.status) && prev.status !== 'ACTIVE')) return prev;
//             return { ...prev, ...liveData, is_live: true };
//           });
//         }
//       }, 1000);
//     }
//     return () => { if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current); };
//   }, [showDetailModal, selectedSessionId]);

//   useEffect(() => {
//     if (!showDetailModal) {
//       setTimeout(() => window.scrollTo(0, modalScrollPositionRef.current), 100);
//     }
//   }, [showDetailModal]);

//   const fetchUserInfo = async () => {
//     try {
//       const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, { method: 'GET' });
//       if (response.ok && isMountedRef.current) {
//         const data = await response.json();
//         setUserData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     }
//   };

//   const startLiveSessionsSSE = () => {
//     try {
//       if (eventSourceRef.current) {
//         eventSourceRef.current.abort?.();
//         eventSourceRef.current = null;
//       }
//       const token = localStorage.getItem('token');
//       if (!token) { console.warn('No token found for SSE stream'); return; }
//       const url = `${API_CONFIG.LIVE_SESSIONS_SSE}?cpo_app_id=${CPO_APP_ID}`;
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
//             setIsStreaming(false); setShowLiveIndicator(false);
//             refreshToken().then(newToken => {
//               if (newToken && isMountedRef.current) setTimeout(startLiveSessionsSSE, 10000);
//             });
//             return;
//           }
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         if (isMountedRef.current) { setIsStreaming(true); setShowLiveIndicator(true); }
//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';
//         const readStream = () => {
//           if (!isMountedRef.current) return;
//           reader.read().then(({ done, value }) => {
//             if (done || !isMountedRef.current) {
//               if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
//               if (!streamRetryTimeoutRef.current && isMountedRef.current) {
//                 streamRetryTimeoutRef.current = setTimeout(() => {
//                   streamRetryTimeoutRef.current = null;
//                   if (isMountedRef.current && (!eventSourceRef.current || eventSourceRef.current.signal.aborted)) {
//                     startLiveSessionsSSE();
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
//               if (event.trim() && isMountedRef.current) processSSEEvent(event);
//             }
//             if (isMountedRef.current) readStream();
//           }).catch(error => {
//             if (error.name !== 'AbortError') {
//               console.error('📡 SSE Stream error:', error);
//               if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
//             }
//           });
//         };
//         readStream();
//       })
//       .catch(error => {
//         if (error.name !== 'AbortError') {
//           console.error('📡 SSE Stream fetch error:', error);
//           if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
//         }
//       });
//     } catch (error) {
//       console.error('Error starting SSE stream:', error);
//       if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
//     }
//   };

//   const processSSEEvent = (eventText) => {
//     try {
//       const lines = eventText.split('\n');
//       let eventType = '', eventData = '';
//       for (const line of lines) {
//         if (line.startsWith('event:')) eventType = line.substring(6).trim();
//         if (line.startsWith('data:')) eventData += line.substring(5).trim();
//       }
//       if (eventData && eventType) {
//         const data = JSON.parse(eventData);
//         if (eventType === 'snapshot' || eventType === 'live_sessions') {
//           const sessions = data.sessions || [];
//           const as_of = data.as_of || new Date().toISOString();
//           const transformed = sessions.map(session => {
//             const durationSeconds = session.duration_seconds || 0;
//             return {
//               id: session.session_id || session.id,
//               session_id: session.session_id || session.id,
//               status: session.status || 'ACTIVE',
//               started_at: session.started_at || session.start_time,
//               charger_id: session.charger_id || 'N/A',
//               charger_name: session.charger_name || 'N/A',
//               hub_name: session.hub_name || 'N/A',
//               connector_number: session.connector_number || 0,
//               latest_meter_wh: session.latest_meter_wh || 0,
//               consumed_wh: session.consumed_wh || 0,
//               meter_observed_at: session.meter_observed_at || null,
//               meter_freshness: session.meter_freshness || 'UNKNOWN',
//               soc_percent: session.soc_percent || null,
//               soc_observed_at: session.soc_observed_at || null,
//               soc_freshness: session.soc_freshness || 'UNKNOWN',
//               total_kwh: session.consumed_wh ? parseFloat(session.consumed_wh) / 1000 : 0,
//               is_live: true,
//               duration_seconds: durationSeconds,
//               customer_name: session.customer_name || 'N/A',
//               transaction_id: session.ocpp_transaction_id || session.transaction_id || 'N/A',
//               projected_amount: session.projected_amount || null,
//               currency: session.currency || 'INR',
//               ...session,
//               ocpp_transaction_id: session.ocpp_transaction_id || null,
//               transaction_id: session.ocpp_transaction_id || session.transaction_id || 'N/A'
//             };
//           });
//           setLiveSessionsData({ sessions: transformed, as_of });
//         }
//       }
//     } catch (error) {
//       console.warn('SSE processing error:', error);
//     }
//   };

//   const stopLiveSessionsSSE = () => {
//     if (eventSourceRef.current) {
//       eventSourceRef.current.abort?.();
//       eventSourceRef.current = null;
//     }
//     if (streamRetryTimeoutRef.current) {
//       clearTimeout(streamRetryTimeoutRef.current);
//       streamRetryTimeoutRef.current = null;
//     }
//     if (sessionRefreshTimeoutRef.current) clearTimeout(sessionRefreshTimeoutRef.current);
//     if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
//     if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
//     setIsStreaming(false);
//     setShowLiveIndicator(false);
//   };

//   const stopTraceSSE = useCallback((resetStatus = true) => {
//     traceStreamEnabledRef.current = false;
//     traceStreamTraceIdRef.current = null;
//     if (traceStreamRef.current) {
//       traceStreamRef.current.abort?.();
//       traceStreamRef.current = null;
//     }
//     if (traceStreamRetryTimeoutRef.current) {
//       clearTimeout(traceStreamRetryTimeoutRef.current);
//       traceStreamRetryTimeoutRef.current = null;
//     }
//     if (resetStatus && isMountedRef.current) {
//       setTraceStreamStatus('idle');
//       setTraceStreamError('');
//     }
//   }, []);

//   const startTraceSSE = useCallback((traceId, initialCursor = 0) => {
//     if (!traceId || !traceModalActiveRef.current) return;
//     if (traceStreamRef.current) {
//       traceStreamRef.current.abort?.();
//       traceStreamRef.current = null;
//     }
//     if (traceStreamRetryTimeoutRef.current) {
//       clearTimeout(traceStreamRetryTimeoutRef.current);
//       traceStreamRetryTimeoutRef.current = null;
//     }
//     traceStreamEnabledRef.current = true;
//     traceStreamTraceIdRef.current = traceId;
//     traceReplayCursorRef.current = Math.max(0, Number(initialCursor) || 0);
//     setTraceStreamError('');

//     const stillCurrent = () => (
//       isMountedRef.current &&
//       traceModalActiveRef.current &&
//       traceStreamEnabledRef.current &&
//       traceStreamTraceIdRef.current === traceId
//     );

//     const scheduleReconnect = (delayMs = 3000) => {
//       if (!stillCurrent() || traceStreamRetryTimeoutRef.current) return;
//       setTraceStreamStatus('retrying');
//       traceStreamRetryTimeoutRef.current = setTimeout(() => {
//         traceStreamRetryTimeoutRef.current = null;
//         if (stillCurrent()) connect();
//       }, delayMs);
//     };

//     const mergeTraceEvent = (event, replayCursor) => {
//       if (!event?.id || !stillCurrent()) return;
//       if (Number.isFinite(replayCursor) && replayCursor >= 0) {
//         traceReplayCursorRef.current = Math.max(traceReplayCursorRef.current, replayCursor);
//       }
//       setTraceData((previous) => {
//         if (!previous || previous.trace_id !== traceId) return previous;
//         const existingEvents = Array.isArray(previous.events) ? previous.events : [];
//         const alreadyPresent = existingEvents.some((candidate) => candidate?.id === event.id);
//         const source = typeof event.source === 'string' && event.source.trim() ? event.source : null;
//         return {
//           ...previous,
//           replay_cursor: Math.max(Number(previous.replay_cursor) || 0, Number.isFinite(replayCursor) ? replayCursor : 0),
//           sources_present: source
//             ? Array.from(new Set([...(previous.sources_present || []), source]))
//             : (previous.sources_present || []),
//           events: alreadyPresent ? existingEvents : [...existingEvents, event]
//         };
//       });
//     };

//     async function connect() {
//       if (!stillCurrent()) return;
//       const token = localStorage.getItem('token');
//       if (!token) { setTraceStreamError('Authentication is required for live trace updates.'); scheduleReconnect(3000); return; }
//       const controller = new AbortController();
//       traceStreamRef.current = controller;
//       const after = traceReplayCursorRef.current;
//       const url = `${API_CONFIG.TRACE_STREAM_API(traceId)}?after=${encodeURIComponent(after)}`;
//       setTraceStreamStatus('connecting');

//       try {
//         const response = await fetch(url, {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'X-CPO-App-ID': CPO_APP_ID,
//             'Accept': 'text/event-stream',
//             'Cache-Control': 'no-cache'
//           },
//           signal: controller.signal
//         });

//         if (!stillCurrent()) return;
//         if (response.status === 401) {
//           setTraceStreamError('Refreshing session for live trace updates…');
//           const newToken = await refreshToken();
//           if (newToken && stillCurrent()) { setTraceStreamError(''); scheduleReconnect(0); }
//           return;
//         }
//         if (response.status === 403) {
//           traceStreamEnabledRef.current = false;
//           setTraceStreamStatus('idle');
//           setTraceStreamError('Live trace access is no longer authorized.');
//           setTraceData(null);
//           setTracePagination({ has_more: false, next_occurred_at: null, next_event_id: null });
//           setTraceError('Trace access is no longer authorized.');
//           return;
//         }
//         if (response.status === 404) {
//           traceStreamEnabledRef.current = false;
//           setTraceStreamStatus('idle');
//           setTraceStreamError('Live diagnostic trace is no longer available.');
//           return;
//         }
//         if (!response.ok || !response.body) throw new Error(`Trace SSE HTTP ${response.status}`);

//         setTraceStreamStatus('connected');
//         setTraceStreamError('');

//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';

//         while (stillCurrent()) {
//           const { done, value } = await reader.read();
//           if (done) break;
//           buffer += decoder.decode(value, { stream: true });
//           const frames = buffer.split(/\r?\n\r?\n/);
//           buffer = frames.pop() || '';
//           for (const frame of frames) {
//             if (!frame.trim()) continue;
//             let eventType = 'message';
//             let eventId = '';
//             const dataLines = [];
//             for (const rawLine of frame.split(/\r?\n/)) {
//               if (!rawLine || rawLine.startsWith(':')) continue;
//               const colon = rawLine.indexOf(':');
//               const field = colon === -1 ? rawLine : rawLine.slice(0, colon);
//               let valueText = colon === -1 ? '' : rawLine.slice(colon + 1);
//               if (valueText.startsWith(' ')) valueText = valueText.slice(1);
//               if (field === 'event') eventType = valueText;
//               else if (field === 'id') eventId = valueText;
//               else if (field === 'data') dataLines.push(valueText);
//             }
//             if (eventType !== 'trace_event' || dataLines.length === 0) continue;
//             try {
//               const event = JSON.parse(dataLines.join('\n'));
//               const cursor = Number(eventId);
//               mergeTraceEvent(event, Number.isFinite(cursor) ? cursor : null);
//             } catch (parseError) {
//               console.warn('Trace SSE event parse error:', parseError);
//             }
//           }
//         }
//         if (stillCurrent()) scheduleReconnect();
//       } catch (streamError) {
//         if (streamError?.name === 'AbortError') return;
//         console.error('Trace SSE stream error:', streamError);
//         if (stillCurrent()) { setTraceStreamError('Live trace stream interrupted; retrying.'); scheduleReconnect(); }
//       } finally {
//         if (traceStreamRef.current === controller) traceStreamRef.current = null;
//       }
//     }
//     connect();
//   }, [refreshToken]);

//   const fetchSessions = useCallback(async (cursorValue = null, cursorId = null, isLoadMore = false) => {
//     if (fetchInProgressRef.current) return;
//     if (isLoadMore && loadingMore) return;

//     fetchInProgressRef.current = true;
//     if (!isLoadMore) setLoading(true);
//     else setLoadingMore(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
//       url += `&sort_by=${encodeURIComponent(sortBy)}&sort_order=${encodeURIComponent(sortOrder)}`;

//       if (cursorValue) url += `&cursor_value=${encodeURIComponent(cursorValue)}`;
//       if (cursorId) url += `&cursor_id=${encodeURIComponent(cursorId)}`;

//       if (dateRange) {
//         url += `&start_time_from=${encodeURIComponent(dateRange.from)}`;
//         url += `&start_time_to=${encodeURIComponent(dateRange.to)}`;
//       }

//       if (statusFilter !== 'All') url += `&status=${statusFilter}`;

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'X-CPO-App-ID': CPO_APP_ID,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });

//       if (!isMountedRef.current) { fetchInProgressRef.current = false; return; }

//       if (response.ok) {
//         const data = await response.json();
//         let sessionsArray = data.sessions || data.data || [];
//         if (!Array.isArray(sessionsArray)) sessionsArray = [];

//         const hasMore = data.has_more || false;
//         const nextCursorValue =
//           data.next_cursor_value !== undefined && data.next_cursor_value !== null
//             ? data.next_cursor_value
//             : data.next_before || null;
//         const nextCursorId =
//           data.next_cursor_id !== undefined && data.next_cursor_id !== null
//             ? data.next_cursor_id
//             : data.next_before_id || null;

//         const transformed = sessionsArray.map((session) => {
//           const sessionId = session.id || session.session_id;
//           const liveData = liveSessionsMapRef.current[sessionId];
//           const status = liveData?.status || session.status || 'UNKNOWN';
//           const isOngoing = isOngoingStatus(status) || status === 'ACTIVE' || status === 'STOP_PENDING';
//           const startTime = session.start_time || liveData?.started_at;
//           const endTime = session.end_time;
//           const durationSeconds = isOngoing
//             ? (liveData?.duration_seconds ?? null)
//             : (getCompletedDurationSeconds(startTime, endTime) ?? session.duration_seconds ?? null);

//           return {
//             ...session,
//             id: session.id,
//             session_id: session.session_id || session.id,
//             ocpp_transaction_id: liveData?.ocpp_transaction_id || session.ocpp_transaction_id || null,
//             transaction_id: liveData?.ocpp_transaction_id || liveData?.transaction_id || session.transaction_id || 'N/A',
//             customer_name: session.customer?.name || 'N/A',
//             customer_email: session.customer?.email || 'N/A',
//             charger_name: session.charger?.name || liveData?.charger_name || 'N/A',
//             charger_id: session.charger?.charger_id || session.charger_id || liveData?.charger_id || 'N/A',
//             hub_name: session.charger?.hub_name || liveData?.hub_name || 'N/A',
//             connector_number: session.connector?.number || liveData?.connector_number || 'N/A',
//             connector_id: session.connector?.id || 'N/A',
//             start_time: startTime,
//             end_time: endTime,
//             total_kwh: liveData?.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : (session.total_kwh || '0'),
//             total_amount: liveData?.projected_amount || session.total_amount || '0',
//             currency: liveData?.currency || session.currency || 'INR',
//             status: status,
//             stop_reason: session.stop_reason || 'N/A',
//             stop: session.stop || null,
//             created_at: session.created_at || session.start_time,
//             is_live: !!liveData,
//             live_data: liveData || null,
//             consumed_wh: liveData?.consumed_wh || null,
//             soc_percent: liveData?.soc_percent || null,
//             latest_meter_wh: liveData?.latest_meter_wh || null,
//             meter_freshness: liveData?.meter_freshness || 'UNKNOWN',
//             soc_freshness: liveData?.soc_freshness || 'UNKNOWN',
//             projected_amount: liveData?.projected_amount || session.projected_amount || null,
//             duration_seconds: durationSeconds,
//             started_at: liveData?.started_at || session.start_time,
//             price_per_unit: session.price_per_unit || null,
//             unit: session.unit || session.units || null,
//             start_criteria: session.start_criteria || null,
//             requested_limit_value: session.requested_limit_value || null,
//             sgst_percent: session.sgst_percent || null,
//             cgst_percent: session.cgst_percent || null,
//             igst_percent: session.igst_percent || null,
//           };
//         });

//         if (isLoadMore) {
//           setAllSessions(prev => {
//             const existingIds = new Set(prev.map(s => String(s.id || s.session_id)));
//             const newSessions = transformed.filter(s => !existingIds.has(String(s.id || s.session_id)));
//             return [...prev, ...newSessions];
//           });
//         } else {
//           setAllSessions(transformed);
//         }

//         setPagination({
//           limit: pagination.limit,
//           has_more: hasMore,
//           cursor_value: nextCursorValue,
//           cursor_id: nextCursorId,
//         });

//         setHasLoaded(true);
//         setIsInitialLoad(false);
//       } else if (response.status === 401) {
//         setError('Session expired. Please refresh.');
//         const newToken = await refreshToken();
//         if (newToken && isMountedRef.current) {
//           fetchSessions(cursorValue, cursorId, isLoadMore);
//           return;
//         }
//         if (!isLoadMore && isMountedRef.current) {
//           setAllSessions([]);
//           setOngoingSessions([]);
//         }
//         setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
//       } else {
//         if (!isLoadMore && isMountedRef.current) {
//           setAllSessions([]);
//           setOngoingSessions([]);
//         }
//         setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
//       }
//     } catch (error) {
//       console.error('❌ Error fetching sessions:', error);
//       if (!isLoadMore && isMountedRef.current) {
//         setAllSessions([]);
//         setOngoingSessions([]);
//       }
//       setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
//     } finally {
//       fetchInProgressRef.current = false;
//       if (isMountedRef.current) {
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pagination.limit, refreshToken, statusFilter, sortBy, sortOrder, dateRange]);

//   const fetchSessionDetail = useCallback(async (sessionId) => {
//     if (!sessionId) return;
//     setLoadingDetail(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const url = API_CONFIG.SESSION_DETAIL_API(sessionId);
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
//         const session = data.session || data.data || data;
//         const sessionKey = session.id || session.session_id;
//         const liveData = liveSessionsMapRef.current[sessionKey];
//         const sessionIsOngoing = isOngoingStatus(liveData?.status || session.status) ||
//           (liveData?.status || session.status) === 'ACTIVE' ||
//           (liveData?.status || session.status) === 'STOP_PENDING';
//         if (liveData) {
//           session.live_data = liveData;
//           session.is_live = true;
//           session.consumed_wh = liveData.consumed_wh || 0;
//           session.total_kwh = liveData.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : (session.total_kwh || '0');
//           session.soc_percent = liveData.soc_percent || null;
//           session.latest_meter_wh = liveData.latest_meter_wh || 0;
//           session.meter_freshness = liveData.meter_freshness || 'UNKNOWN';
//           session.soc_freshness = liveData.soc_freshness || 'UNKNOWN';
//           session.status = liveData.status || session.status;
//           session.charger_name = liveData.charger_name || session.charger_name;
//           session.charger_id = liveData.charger_id || session.charger_id;
//           session.hub_name = liveData.hub_name || session.hub_name;
//           session.connector_number = liveData.connector_number || session.connector_number;
//           session.started_at = liveData.started_at || session.start_time;
//           session.customer_name = liveData.customer_name || session.customer_name;
//           session.ocpp_transaction_id = liveData.ocpp_transaction_id || session.ocpp_transaction_id || null;
//           session.transaction_id = liveData.ocpp_transaction_id || liveData.transaction_id || session.transaction_id || 'N/A';
//           session.projected_amount = liveData.projected_amount || session.projected_amount || null;
//           session.currency = liveData.currency || session.currency || 'INR';
//         }
//         if (sessionIsOngoing) {
//           session.duration_seconds = liveData?.duration_seconds ?? session.duration_seconds ?? null;
//         } else {
//           session.duration_seconds =
//             getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time) ??
//             session.duration_seconds ??
//             null;
//         }
//         session.price_per_unit = session.price_per_unit || null;
//         session.unit = session.unit || session.units || null;
//         session.start_criteria = session.start_criteria || null;
//         session.requested_limit_value = session.requested_limit_value || null;
//         session.sgst_percent = session.sgst_percent || null;
//         session.cgst_percent = session.cgst_percent || null;
//         session.igst_percent = session.igst_percent || null;
//         setSelectedSessionId(sessionKey);
//         setSelectedSession(session);
//         setShowDetailModal(true);
//       } else if (response.status === 401) {
//         setError('Session expired. Please refresh.');
//         const newToken = await refreshToken();
//         if (newToken && isMountedRef.current) {
//           const retry = await fetch(url, {
//             method: 'GET',
//             headers: {
//               'Authorization': `Bearer ${newToken}`,
//               'X-CPO-App-ID': CPO_APP_ID,
//               'Content-Type': 'application/json',
//               'Accept': 'application/json'
//             }
//           });
//           if (retry.ok && isMountedRef.current) {
//             const data = await retry.json();
//             const session = data.session || data.data || data;
//             const sessionKey = session.id || session.session_id;
//             setSelectedSessionId(sessionKey);
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
//       if (isMountedRef.current) setError('An error occurred while fetching session details');
//     } finally {
//       if (isMountedRef.current) setLoadingDetail(false);
//     }
//   }, [refreshToken]);

//   const fetchTrace = useCallback(async (sessionId, beforeOccurredAt = null, beforeEventId = null, isLoadMore = false) => {
//     if (!sessionId) return;
//     if (isLoadMore && loadingMoreTrace) return;
//     if (!isLoadMore) {
//       if (traceStreamRef.current) { traceStreamRef.current.abort?.(); traceStreamRef.current = null; }
//       if (traceStreamRetryTimeoutRef.current) { clearTimeout(traceStreamRetryTimeoutRef.current); traceStreamRetryTimeoutRef.current = null; }
//       traceStreamEnabledRef.current = false;
//       setTraceStreamStatus('idle');
//       setTraceStreamError('');
//       setLoadingTrace(true);
//       setTraceError('');
//       setTraceData(null);
//     } else {
//       setLoadingMoreTrace(true);
//     }
//     try {
//       const token = localStorage.getItem('token');
//       let url = `${API_CONFIG.TRACE_API(sessionId)}?limit=50`;
//       if (beforeOccurredAt) url += `&before_occurred_at=${encodeURIComponent(beforeOccurredAt)}`;
//       if (beforeEventId) url += `&before_event_id=${encodeURIComponent(beforeEventId)}`;
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
//         if (isLoadMore) {
//           setTraceData(prev => ({
//             ...prev, ...data,
//             replay_cursor: prev?.replay_cursor ?? data.replay_cursor,
//             sources_present: Array.from(new Set([...(prev?.sources_present || []), ...(data.sources_present || [])])),
//             events: [...(prev?.events || []), ...(data.events || [])]
//           }));
//         } else {
//           setTraceData(data);
//           traceReplayCursorRef.current = Math.max(0, Number(data.replay_cursor) || 0);
//           if (data.trace_id && traceModalActiveRef.current) {
//             startTraceSSE(data.trace_id, traceReplayCursorRef.current);
//           }
//         }
//         setTracePagination({
//           has_more: !!data.next_occurred_at && !!data.next_event_id,
//           next_occurred_at: data.next_occurred_at || null,
//           next_event_id: data.next_event_id || null
//         });
//       } else if (response.status === 401) {
//         setTraceError('Session expired. Please refresh.');
//         const newToken = await refreshToken();
//         if (newToken && isMountedRef.current) { fetchTrace(sessionId, beforeOccurredAt, beforeEventId, isLoadMore); return; }
//       } else if (response.status === 403) {
//         setTraceData(null);
//         setTracePagination({ has_more: false, next_occurred_at: null, next_event_id: null });
//         setTraceError('Trace access is not authorized for this CPO membership.');
//       } else if (response.status === 404) {
//         setTraceError('Diagnostic trace is not available for this session.');
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         setTraceError(errorData?.error?.message || errorData?.message || 'Failed to fetch trace');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching trace:', error);
//       setTraceError('An error occurred while fetching diagnostic trace');
//     } finally {
//       if (isMountedRef.current) { setLoadingTrace(false); setLoadingMoreTrace(false); }
//     }
//   }, [refreshToken, startTraceSSE, loadingMoreTrace]);

//   const loadMoreTrace = () => {
//     if (tracePagination.has_more && !loadingMoreTrace && traceData) {
//       fetchTrace(traceData.session_id, tracePagination.next_occurred_at, tracePagination.next_event_id, true);
//     }
//   };

//   const openTraceModal = (sessionId) => {
//     if (sessionId) {
//       traceModalActiveRef.current = true;
//       setShowTraceModal(true);
//       fetchTrace(sessionId);
//     }
//   };

//   const closeTraceModal = () => {
//     traceModalActiveRef.current = false;
//     stopTraceSSE();
//     setShowTraceModal(false);
//     setTraceData(null);
//     setTraceError('');
//     setTracePagination({ has_more: false, next_occurred_at: null, next_event_id: null });
//   };

//   const loadMoreSessions = () => {
//     if (
//       pagination.has_more &&
//       pagination.cursor_value &&
//       pagination.cursor_id &&
//       !loadingMore && !loading && !fetchInProgressRef.current
//     ) {
//       fetchSessions(pagination.cursor_value, pagination.cursor_id, true);
//     }
//   };

//   const handleSessionClick = (sessionId) => {
//     if (sessionId) {
//       modalScrollPositionRef.current = window.scrollY;
//       fetchSessionDetail(sessionId);
//     }
//   };

//   const closeDetailModal = () => {
//     setShowDetailModal(false);
//     setSelectedSession(null);
//     setSelectedSessionId(null);
//     setError('');
//     if (modalLiveDataIntervalRef.current) {
//       clearInterval(modalLiveDataIntervalRef.current);
//       modalLiveDataIntervalRef.current = null;
//     }
//     setTimeout(() => window.scrollTo(0, modalScrollPositionRef.current), 50);
//   };

//   const handleTabChange = (tab) => setActiveTab(tab);
//   const handleMainTabChange = (tab) => {
//     setActiveMainTab(tab);
//     if (tab === 'chargers') navigate('/charger-session');
//   };

//   const handleLogout = async () => {
//     try { stopLiveSessionsSSE(); await logout(); }
//     catch (error) {
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
//       setLoading(true);
//       setAllSessions([]);
//       setOngoingSessions([]);
//       setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
//       fetchSessions();
//     }
//   };

//   const filteredSessions = useMemo(() => {
//     const liveOnes = ongoingSessions.map(s => ({
//       ...s,
//       is_live: true,
//       id: s.id || s.session_id,
//       session_id: s.session_id || s.id,
//       start_time: s.start_time || s.started_at,
//       started_at: s.started_at || s.start_time,
//       duration_seconds: s.duration_seconds ?? 0,
//       total_kwh: s.consumed_wh ? parseFloat(s.consumed_wh) / 1000 : (s.total_kwh || 0),
//       total_amount: s.projected_amount || s.total_amount || '0'
//     }));

//     liveOnes.sort((a, b) => {
//       const at = new Date(a.started_at || a.start_time || 0).getTime();
//       const bt = new Date(b.started_at || b.start_time || 0).getTime();
//       return bt - at;
//     });

//     const liveIds = new Set(liveOnes.map(s => String(s.id || s.session_id)));
//     const nonLive = allSessions.filter(s => !liveIds.has(String(s.id || s.session_id)));

//     let base;
//     if (activeTab === 'ongoing') {
//       base = liveOnes;
//     } else {
//       base = [...liveOnes, ...nonLive];
//     }

//     if (!searchQuery) return base;
//     const q = searchQuery.toLowerCase();
//     return base.filter(session => {
//       const idStr = String(session.id || session.session_id || '');
//       const transactionIdStr = String(session.transaction_id || session.ocpp_transaction_id || '');
//       const chargerNameStr = String(session.charger_name || session.charger?.name || '');
//       const chargerIdStr = String(session.charger_id || session.charger?.charger_id || '');
//       const hubNameStr = String(session.hub_name || session.charger?.hub_name || '');
//       const customerNameStr = String(session.customer_name || session.customer?.name || '');
//       return (
//         idStr.toLowerCase().includes(q) ||
//         transactionIdStr.toLowerCase().includes(q) ||
//         chargerNameStr.toLowerCase().includes(q) ||
//         chargerIdStr.toLowerCase().includes(q) ||
//         hubNameStr.toLowerCase().includes(q) ||
//         customerNameStr.toLowerCase().includes(q)
//       );
//     });
//   }, [activeTab, allSessions, ongoingSessions, searchQuery]);

//   const ongoingCount = useMemo(() => {
//     return ongoingSessions.filter(s => isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING').length;
//   }, [ongoingSessions]);

//   const showLoadMore = pagination.has_more && pagination.cursor_value && pagination.cursor_id && !loadingMore;

//   const DATE_OPTIONS = [
//     { id: 'today',     label: 'Today' },
//     { id: 'yesterday', label: 'Yesterday' },
//     { id: 'week',      label: 'This Week' },
//     { id: 'year',      label: 'This Year' },
//     { id: 'month',     label: 'This Month' },
//   ];

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

//   const FilterPopup = () => (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//             <Filter size={18} className="text-blue-600" /> Filters
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
//               <option value="START_PENDING">Start Pending</option>
//               <option value="ACTIVE">Active</option>
//               <option value="STOP_PENDING">Stop Pending</option>
//               <option value="RECONCILIATION_REQUIRED">Reconciliation Required</option>
//               <option value="FAILED">Failed</option>
//             </select>
//           </div>
//           <div className="flex gap-3 pt-2">
//             <button
//               onClick={() => { setShowFilterPopup(false); }}
//               className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//             >
//               Apply Filters
//             </button>
//             <button
//               onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}
//               className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
//             >
//               Clear All
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const tableMaxHeight = 'calc(100vh - 380px)';

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
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1 text-sm text-gray-500">
//                 <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
//                 <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium">/ Dashboard</button>
//                 <span className="text-blue-600">/</span>
//                 <span className="text-blue-600 font-medium">Sessions</span>
//               </div>
//               {isRefreshing && (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-medium animate-fadeIn">
//                   <RefreshCw size={11} className="animate-spin" />
//                   Refreshing…
//                 </span>
//               )}
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
//                 <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className="flex items-center gap-1 mt-4 border-b border-gray-200 px-6">
//           <button
//             onClick={() => handleMainTabChange('chargers')}
//             className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
//               activeMainTab === 'chargers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             <Zap size={16} /> Chargers
//           </button>
//           <button
//             onClick={() => handleMainTabChange('sessions')}
//             className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
//               activeMainTab === 'sessions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             <History size={16} /> Sessions
//             <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">{allSessions.length + ongoingSessions.length}</span>
//           </button>
//         </div>

//         {activeMainTab === 'sessions' && (
//           <div className="p-6">

//             <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition group inline-flex items-center gap-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Database className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Loaded Sessions</p>
//                   <p className="text-2xl font-bold text-gray-900">{allSessions.length + ongoingSessions.length}</p>
//                   {pagination.has_more && (
//                     <p className="text-xs text-blue-500">More sessions available — load more below</p>
//                   )}
//                 </div>
//               </div>

//               <div className="relative" ref={dateDropdownRef}>
//                 <button
//                   onClick={() => setShowDateDropdown(v => !v)}
//                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 shadow-sm transition text-sm font-medium text-gray-700 min-w-[190px] justify-between"
//                 >
//                   <span className="flex items-center gap-2">
//                     <CalendarIcon size={16} className="text-blue-600" />
//                     <span>{dateFilterLabel}</span>
//                   </span>
//                   <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
//                 </button>

//                 {showDateDropdown && (
//                   <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-64 overflow-hidden">
//                     <div className="p-1.5">
//                       {DATE_OPTIONS.map(opt => {
//                         const active = dateFilter === opt.id;
//                         return (
//                           <button
//                             key={opt.id}
//                             onClick={() => {
//                               setDateFilter(opt.id);
//                               setCustomDate(null);
//                               setShowDateDropdown(false);
//                             }}
//                             className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
//                               active
//                                 ? 'bg-blue-50 text-blue-700'
//                                 : 'text-gray-700 hover:bg-gray-50'
//                             }`}
//                           >
//                             <span>{opt.label}</span>
//                             {active && <CheckCircle size={14} className="text-blue-600" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                     <div className="border-t border-gray-100 p-2">
//                       <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">Custom Date</div>
//                       <input
//                         type="date"
//                         value={customDate || ''}
//                         onChange={(e) => {
//                           const v = e.target.value;
//                           if (v) {
//                             setCustomDate(v);
//                             setDateFilter('custom');
//                             setShowDateDropdown(false);
//                           } else {
//                             setCustomDate(null);
//                             setDateFilter('today');
//                           }
//                         }}
//                         className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                       <div className="mt-2 text-xs text-gray-400 px-1">
//                         {dateFilter === 'custom' && customDate
//                           ? `Showing ${new Date(customDate).toLocaleDateString()}`
//                           : 'Pick a date to filter'}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
//               <button
//                 onClick={() => handleTabChange('all')}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Grid size={16} /> All Sessions
//                   <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{allSessions.length + ongoingSessions.length}</span>
//                 </div>
//               </button>
//               <button
//                 onClick={() => handleTabChange('ongoing')}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'ongoing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Activity size={16} /> Ongoing
//                   <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{ongoingCount}</span>
//                   {showLiveIndicator && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span>}
//                 </div>
//               </button>
//             </div>

//             <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
//               <div className="flex items-center gap-2 flex-wrap">

//                 <div className="flex items-center gap-1.5 bg-white rounded-xl px-2 py-1 border border-gray-200 shadow-sm">
//                   <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Sort by</label>
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="px-1.5 py-1 rounded-lg bg-transparent text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 cursor-pointer"
//                   >
//                     <option value="created_at">Created At</option>
//                     <option value="start_time">Start Time</option>
//                     <option value="end_time">End Time</option>
//                     <option value="duration">Duration</option>
//                     <option value="usage">Usage</option>
//                   </select>
//                   <button
//                     onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
//                     className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition"
//                     title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
//                   >
//                     {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                   </button>
//                 </div>

//                 {statusFilter !== 'All' && (
//                   <button
//                     onClick={() => setStatusFilter('All')}
//                     className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-1 border border-red-200"
//                   >
//                     <X size={12} /> {getStatusDisplayName(statusFilter)}
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
//                   onClick={() => setIsCompact(!isCompact)}
//                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium whitespace-nowrap"
//                   title={isCompact ? "Switch to Expanded view" : "Switch to Compact view"}
//                 >
//                   <Sliders size={14} />
//                   {isCompact ? 'Compact' : 'Expanded'}
//                 </button>
//                 <button
//                   onClick={handleRefresh}
//                   disabled={fetchInProgressRef.current}
//                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium disabled:opacity-50 whitespace-nowrap"
//                 >
//                   <RefreshCw size={14} className={fetchInProgressRef.current ? 'animate-spin' : ''} />
//                   Refresh
//                 </button>
//                 {showFilterPopup && <FilterPopup />}
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
//               <div
//                 className="custom-scrollbar"
//                 style={{
//                   maxHeight: tableMaxHeight,
//                   overflow: 'auto',
//                   WebkitOverflowScrolling: 'touch',
//                 }}
//               >
//                 <table
//                   className="w-full"
//                   style={isCompact ? { minWidth: '1180px' } : { minWidth: '2050px' }}
//                 >
//                   <thead className="sticky top-0 z-20">
//                     <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>SI</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Session ID</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Transaction ID</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Customer</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Charger</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Hub</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Connector</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Start Time</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>End Time</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Duration</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Usage</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Start Criteria</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Req. Limit</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Amount</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Status</th>
//                       <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Stop Reason</th>
//                       <th
//                         className={`${isCompact ? 'px-3 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] z-30 whitespace-nowrap`}
//                         style={{ minWidth: '170px' }}
//                       >
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading && !hasLoaded && isInitialLoad ? (
//                       <tr>
//                         <td colSpan="17" className={`${isCompact ? 'px-3 py-6' : 'px-4 py-12'} text-center`}>
//                           <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-1" />
//                           <p className="text-gray-500 text-sm">Loading sessions...</p>
//                         </td>
//                       </tr>
//                     ) : loading ? (
//                       <tr>
//                         <td colSpan="17" className={`${isCompact ? 'px-3 py-12' : 'px-4 py-20'} text-center`}>
//                           <div className="flex flex-col items-center justify-center gap-2">
//                             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                             <p className="text-gray-500 text-sm font-medium">Loading sessions…</p>
//                             <p className="text-xs text-gray-400">Fetching {dateFilterLabel} data</p>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : error ? (
//                       <tr>
//                         <td colSpan="17" className={`${isCompact ? 'px-3 py-6' : 'px-4 py-12'} text-center`}>
//                           <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
//                           <p className="text-gray-600 text-sm">{error}</p>
//                           <button
//                             onClick={() => { setError(''); fetchSessions(); }}
//                             className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
//                           >
//                             Retry
//                           </button>
//                         </td>
//                       </tr>
//                     ) : filteredSessions.length === 0 ? (
//                       <tr>
//                         <td colSpan="17" className={`${isCompact ? 'px-3 py-6' : 'px-4 py-12'} text-center`}>
//                           <Database size={isCompact ? 32 : 40} className="text-gray-300 mx-auto mb-1" />
//                           <p className="text-gray-500 font-medium text-sm">No Sessions Found</p>
//                           <p className="text-xs text-gray-400 mt-0.5">
//                             {activeTab === 'all' ? `No charging sessions for ${dateFilterLabel}.` : 'No ongoing sessions found.'}
//                           </p>
//                           {showLiveIndicator && activeTab === 'ongoing' && (
//                             <p className="text-xs text-green-600 mt-1">
//                               <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
//                               Waiting for live sessions...
//                             </p>
//                           )}
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredSessions.map((session, index) => {
//                         const isOngoing = isOngoingStatus(session.status) || session.status === 'ACTIVE' || session.status === 'STOP_PENDING';
//                         const durationSeconds = isOngoing
//                           ? (session.duration_seconds || 0)
//                           : (getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time) ?? (session.duration_seconds || 0));
//                         const durationDisplay = durationSeconds ? formatDurationShort(durationSeconds) : 'N/A';

//                         const isLive = session.is_live || liveSessionsMapRef.current[session.id || session.session_id];
//                         const sessionId = session.id || session.session_id;
//                         const isUpdated = updatedSessionIds.has(sessionId);

//                         let displayEnergy = session.total_kwh || '0';
//                         let displaySoc = session.soc_percent || null;
//                         let displayAmount = session.total_amount || '0';

//                         if (isLive) {
//                           const energy = getEnergyKwh(session);
//                           displayEnergy = energy > 0 ? energy.toFixed(2) : (session.total_kwh || '0');
//                           displaySoc = getSocPercent(session) || null;
//                           const projectedAmount = getProjectedAmount(session);
//                           if (projectedAmount > 0) displayAmount = projectedAmount;
//                         }

//                         const connectorNumber = session.connector?.number || session.connector_number || 'N/A';
//                         const liveMapEntry = liveSessionsMapRef.current[sessionId];
//                         const transactionId = liveMapEntry?.ocpp_transaction_id || session.ocpp_transaction_id || session.transaction_id || 'N/A';
//                         const chargerId = session.charger?.charger_id || session.charger_id || session.charger?.id || 'N/A';
//                         const chargerName = session.charger?.name || session.charger_name || 'N/A';

//                         const startCriteria = session.start_criteria;
//                         const requestedLimit = session.requested_limit_value;
//                         const limitDisplay = formatRequestedLimit(requestedLimit, startCriteria);

//                         // ✅ Stop reason — null for ongoing/live sessions
//                         const stopReasonDisplay = getStopReasonDisplay(session);

//                         const rowBg = isLive && isOngoing ? 'bg-green-50/40' : 'bg-white';
//                         const stickyBg = isLive && isOngoing ? 'bg-green-50' : 'bg-white';

//                         const cellPad = isCompact ? 'px-2.5 py-2' : 'px-4 py-3.5';
//                         const cellText = isCompact ? 'text-sm' : 'text-[15px]';

//                         return (
//                           <tr
//                             key={sessionId || session.transaction_id || index}
//                             className={`border-b border-gray-100 hover:bg-gray-50/70 transition cursor-pointer ${rowBg} ${
//                               isUpdated && isLive ? 'animate-pulse-update' : ''
//                             }`}
//                             onClick={() => handleSessionClick(sessionId)}
//                           >
//                             <td className={`${cellPad} text-gray-500 text-center text-xs`}>
//                               {isLive && isOngoing ? (
//                                 <span className="inline-flex items-center justify-center">
//                                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                                 </span>
//                               ) : (index + 1)}
//                             </td>
//                             <td className={`${cellPad} font-mono text-gray-700 ${cellText} truncate max-w-[120px]`} title={sessionId}>{truncateId(sessionId)}</td>
//                             <td className={`${cellPad} font-mono text-gray-700 ${cellText} truncate max-w-[110px]`} title={transactionId}>{truncateId(transactionId)}</td>
//                             <td className={`${cellPad} text-gray-700 ${cellText} truncate max-w-[130px]`} title={session.customer?.name || session.customer_name}>
//                               {session.customer?.name || session.customer_name || 'N/A'}
//                             </td>
//                             <td className={`${cellPad} text-gray-700 ${cellText}`}>
//                               <div className="flex flex-col">
//                                 <span className="font-medium text-gray-800 truncate max-w-[140px]" title={chargerName}>{chargerName}</span>
//                                 <span className="text-[11px] text-gray-400 truncate max-w-[140px]" title={chargerId}>ID: {truncateId(chargerId)}</span>
//                               </div>
//                             </td>
//                             <td className={`${cellPad} text-gray-600 ${cellText} truncate max-w-[110px]`} title={session.charger?.hub_name || session.hub_name}>
//                               {session.charger?.hub_name || session.hub_name || 'N/A'}
//                             </td>
//                             <td className={`${cellPad} font-mono text-gray-500 text-center ${cellText}`}>#{connectorNumber}</td>
//                             <td className={`${cellPad} text-gray-600 ${cellText} whitespace-nowrap`}>{formatDate(session.start_time || session.started_at)}</td>
//                             <td className={`${cellPad} ${cellText} whitespace-nowrap`}>
//                               {isOngoing ? (
//                                 <span className="text-green-600 font-medium">Ongoing</span>
//                               ) : (session.end_time ? <span className="text-gray-600">{formatDate(session.end_time)}</span> : 'N/A')}
//                             </td>
//                             <td className={`${cellPad} ${cellText}`}>
//                               <span className="font-medium text-gray-700">{durationDisplay}</span>
//                             </td>
//                             <td className={`${cellPad} ${cellText} whitespace-nowrap`}>
//                               <div className="flex items-center gap-1">
//                                 <span className="font-medium text-gray-700">{displayEnergy} kWh</span>
//                                 {isLive && displaySoc && (
//                                   <span className="text-xs text-purple-600">· SOC: {displaySoc}%</span>
//                                 )}
//                               </div>
//                             </td>
//                             <td className={`${cellPad} text-gray-700 ${cellText} whitespace-nowrap`}>{startCriteria || '—'} BASED</td>
//                             {/* <td className={`${cellPad} text-gray-700 ${cellText}`}>{limitDisplay}</td> */}
//                             <td className={`${cellPad} text-gray-700 ${cellText}`}>
//   {(() => {
//     const criteria = String(session.start_criteria || '').toUpperCase();
//     const isMoneyBased = ['AMOUNT', 'MONEY', 'PRICE', 'COST'].includes(criteria);

//     if (limitDisplay === '—') {
//       return <span className="text-gray-300">—</span>;
//     }

//     if (isMoneyBased) {
//       const rawValue = session.requested_limit_value;
//       const num = Number(rawValue);
//       const formatted = Number.isFinite(num)
//         ? num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
//         : rawValue;
//       return (
//         <span className="inline-flex items-center gap-0.5 font-semibold text-gray-800 whitespace-nowrap">
//           <IndianRupee size={13} className="text-gray-600" />
//           {formatted}
//         </span>
//       );
//     }

//     return <span className="whitespace-nowrap">{limitDisplay}</span>;
//   })()}
// </td>
//                             <td className={`${cellPad} font-semibold text-gray-700 ${cellText} whitespace-nowrap`}>
//                               {formatCurrency(displayAmount)}
//                             </td>
//                             <td className={`${cellPad} ${cellText}`}>
//                               <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
//                                 {getStatusIcon(session.status)}
//                                 {getStatusDisplayName(session.status)}
//                               </span>
//                             </td>
//                             {/* ✅ Stop Reason cell */}
//                             <td className={`${cellPad} ${cellText} whitespace-nowrap`}>
//                               {stopReasonDisplay ? (
//                                 <span
//                                   className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
//                                     stopReasonDisplay === 'Stopped by Charger'
//                                       ? 'bg-blue-50 text-blue-700 border-blue-200'
//                                       : 'bg-amber-50 text-amber-700 border-amber-200'
//                                   }`}
//                                 >
//                                   {stopReasonDisplay}
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-300">—</span>
//                               )}
//                             </td>
//                             <td
//                               className={`${isCompact ? 'px-3 py-2' : 'px-4 py-3.5'} sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${stickyBg}`}
//                               style={{ minWidth: '170px' }}
//                             >
//                               <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
//                                 <button
//                                   className="px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 shadow-sm"
//                                   onClick={(e) => { e.stopPropagation(); handleSessionClick(sessionId); }}
//                                   title="View Session"
//                                 >
//                                   <Eye size={12} />
//                                   View
//                                 </button>
//                                 <button
//                                   className="px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 shadow-sm"
//                                   onClick={(e) => { e.stopPropagation(); openTraceModal(sessionId); }}
//                                   title="Diagnostic Trace"
//                                 >
//                                   <GitBranch size={12} />
//                                   Trace
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {showLoadMore && activeTab === 'all' && (
//               <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-center">
//                 <button
//                   onClick={loadMoreSessions}
//                   disabled={loadingMore || loading || fetchInProgressRef.current}
//                   className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md shadow-blue-500/25 disabled:opacity-50 text-sm"
//                 >
//                   {loadingMore ? (
//                     <><Loader2 className="w-3 h-3 animate-spin" /> Loading more...</>
//                   ) : (
//                     <><RefreshCw size={12} /> Load More ({allSessions.length} loaded)</>
//                   )}
//                 </button>
//               </div>
//             )}

//             <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500 flex justify-between items-center flex-wrap gap-2">
//               <span>
//                 {filteredSessions.length === 0 ? 'No sessions available' :
//                   `Showing ${filteredSessions.length} (${ongoingCount} live) of ${allSessions.length + ongoingSessions.length} loaded sessions`}
//               </span>
//               {showLoadMore && activeTab === 'all' && (
//                 <span className="text-blue-600">Load more sessions</span>
//               )}
//               {!showLoadMore && allSessions.length > 0 && activeTab === 'all' && (
//                 <span className="text-gray-400">All available sessions loaded</span>
//               )}
//               {activeTab === 'ongoing' && showLiveIndicator && (
//                 <span className="text-green-600 flex items-center gap-1">
//                   <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span> Live updates
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {activeMainTab === 'chargers' && (
//           <div className="p-6">
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
//               <Zap size={64} className="text-blue-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-700">Chargers Management</h3>
//               <p className="text-gray-500 mt-2">Click on the "Chargers" tab to view and manage all charging stations</p>
//               <button onClick={() => navigate('/chargers')} className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto">
//                 <Zap size={18} /> Go to Chargers
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {showDetailModal && (
//         <SessionDetailModal
//           session={selectedSession}
//           loading={loadingDetail}
//           error={error}
//           onClose={closeDetailModal}
//         />
//       )}
//       {showTraceModal && (
//         <TraceModal
//           traceData={traceData}
//           loading={loadingTrace}
//           error={traceError}
//           pagination={tracePagination}
//           loadingMore={loadingMoreTrace}
//           streamStatus={traceStreamStatus}
//           streamError={traceStreamError}
//           onClose={closeTraceModal}
//           onLoadMore={loadMoreTrace}
//         />
//       )}

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//         @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
//         @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
//         @keyframes pulseUpdate {
//           0% { background-color: rgba(34,197,94,0); }
//           30% { background-color: rgba(34,197,94,0.25); }
//           60% { background-color: rgba(34,197,94,0.15); }
//           100% { background-color: rgba(34,197,94,0); }
//         }
//         .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
//         .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
//         .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
//         .animate-pulse-update { animation: pulseUpdate 1.2s ease-in-out forwards; }
//         tr.animate-pulse-update { transition: background-color 0.3s ease; }

//         .custom-scrollbar {
//           scrollbar-width: thin;
//           scrollbar-color: #ffffff transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//           height: 4px;
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//           border-radius: 999px;
//           margin: 0 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(255, 255, 255, 0.85);
//           border-radius: 999px;
//           border: 1px solid rgba(0, 0, 0, 0.06);
//           background-clip: padding-box;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #ffffff;
//         }
//         .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }

//         .scrollbar-hide::-webkit-scrollbar { display: none; }
//         .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// };

// export default Sessions;

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, CPO_APP_ID } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  LogOut,
  Search,
  Filter,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Zap,
  Loader2,
  Eye,
  Database,
  IndianRupee,
  History,
  GitBranch,
  Sliders,
  Grid,
  Circle,
  CircleX,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  BatteryFull,
  Calendar as CalendarIcon
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
/* CPO_APP_ID comes from AuthContext so the whole app shares one
   source of truth for it (see the handoff doc, section 3). */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  SESSIONS_API: `${API_BASE_URL}/api/v1/cpo/charging-sessions`,
  SESSION_DETAIL_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}`,
  LIVE_SESSIONS_SSE: `${API_BASE_URL}/api/v1/cpo/operations/live-sessions`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  TRACE_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}/trace`,
  TRACE_STREAM_API: (traceId) => `${API_BASE_URL}/api/v1/cpo/charging-traces/${traceId}/stream`,
};

// LocalStorage keys for filter persistence
const STORAGE_KEYS = {
  DATE_FILTER: 'sessions_date_filter',
  CUSTOM_DATE: 'sessions_custom_date',
};

// Status helpers
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
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'START_PENDING':
      return <Clock className="w-3.5 h-3.5" />;
    case 'CHARGING':
    case 'ACTIVE':
      return <Activity className="w-3.5 h-3.5" />;
    case 'STOP_PENDING':
      return <AlertCircle className="w-3.5 h-3.5" />;
    case 'STOPPED':
    case 'FAILED':
    case 'INACTIVE':
      return <CircleX className="w-3.5 h-3.5" />;
    default:
      return <Circle className="w-3.5 h-3.5" />;
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

const isOngoingStatus = (status) => {
  if (!status) return false;
  const statusStr = String(status).toUpperCase().trim();
  const ongoingStatuses = [
    'ACTIVE', 'CHARGING', 'START_PENDING', 'STOP_PENDING',
    'ONGOING', 'IN PROGRESS', 'STARTED', 'START',
    'PROCESSING', 'RUNNING', 'INPROGRESS', 'IN_PROGRESS',
    'STARTING', 'INITIATED'
  ];
  if (ongoingStatuses.includes(statusStr)) return true;
  const keywords = ['START', 'CHARG', 'ACTIVE', 'ONGOING', 'PROGRESS', 'RUNNING'];
  for (const kw of keywords) if (statusStr.includes(kw)) return true;
  return false;
};

// ✅ Prettify backend reasons: "time_limit_reached" → "Time Limit Reached"
// "User requested stop" → "User Requested Stop"
const prettifyReason = (raw) => {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;

  // If it contains underscores, treat as snake_case → Title Case each word
  if (str.includes('_')) {
    return str
      .split('_')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Otherwise, capitalize the first letter of each word
  // ("User requested stop" → "User Requested Stop")
  return str
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ✅ Stop reason display logic
// - If stop.ocpp_reason is "Local" → "Stopped by Charger"
// - If stop.ocpp_reason is "Remote" → prettified stop.requested_reason
//   e.g. "time_limit_reached" → "Time Limit Reached"
//        "User requested stop"  → "User Requested Stop"
// - Never shown for ongoing/live sessions
const getStopReasonDisplay = (session) => {
  if (!session) return null;

  const status = String(session.status || '').toUpperCase();
  const isLive = session.is_live || session.live_data;
  if (isOngoingStatus(status) || status === 'ACTIVE' || status === 'STOP_PENDING' || isLive) {
    return null;
  }

  const stopObj = session.stop || {};
  const ocppReason = stopObj.ocpp_reason;
  const requestedReason = stopObj.requested_reason;

  // Prefer structured stop.ocpp_reason
  if (ocppReason === 'Local') return 'Stopped by Charger';
  if (ocppReason === 'Remote') {
    return prettifyReason(requestedReason) || 'Stopped by Remote';
  }

  // Fallback to legacy session.stop_reason string
  const legacy = session.stop_reason;
  if (legacy === 'Local') return 'Stopped by Charger';
  if (legacy === 'Remote') {
    return prettifyReason(requestedReason) || 'Stopped by Remote';
  }

  return null;
};

const getEnergyKwh = (session) => {
  if (session.consumed_wh) return parseFloat(session.consumed_wh) / 1000;
  if (session.total_kwh) return parseFloat(session.total_kwh);
  if (session.energy) return parseFloat(session.energy);
  if (session.usage) return parseFloat(session.usage);
  return 0;
};

const getSocPercent = (session) => {
  if (session.soc_percent) return parseFloat(session.soc_percent) || 0;
  return 0;
};

const getInitialSocPercent = (session) => {
  if (!session) return null;
  const candidates = [
    session.initial_soc_percent,
    session.start_soc_percent,
    session.soc_start_percent,
    session.starting_soc_percent,
    session.soc_at_start,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '') return parseFloat(c);
  }
  return null;
};

const getFinalSocPercent = (session, isOngoing, liveSoc) => {
  if (!session) return null;
  if (isOngoing && liveSoc !== undefined && liveSoc !== null && liveSoc !== 0) {
    return parseFloat(liveSoc);
  }
  const candidates = [
    session.final_soc_percent,
    session.end_soc_percent,
    session.soc_end_percent,
    session.ending_soc_percent,
    session.soc_at_end,
    session.soc_percent,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '') return parseFloat(c);
  }
  return null;
};

const getMeterFreshness = (session) => session.meter_freshness || 'UNKNOWN';
const getSocFreshness = (session) => session.soc_freshness || 'UNKNOWN';

const getProjectedAmount = (session) => {
  if (session.projected_amount) return parseFloat(session.projected_amount) || 0;
  if (session.total_amount) return parseFloat(session.total_amount) || 0;
  return 0;
};

const getCurrency = (session) => session.currency || 'INR';
const getTransactionId = (session) => session.ocpp_transaction_id || session.transaction_id || 'N/A';

const formatDuration = (durationSeconds) => {
  if (!durationSeconds || durationSeconds < 0) return 'N/A';
  const totalSeconds = Math.floor(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const getDurationMinutes = (durationSeconds) => {
  if (!durationSeconds) return 0;
  return Math.floor(durationSeconds / 60);
};

const formatDurationShort = (durationSeconds) => {
  if (!durationSeconds || durationSeconds < 0) return 'N/A';
  const totalSeconds = Math.floor(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
};

const getCompletedDurationSeconds = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const diff = Math.floor((end - start) / 1000);
  return diff >= 0 ? diff : null;
};

const formatTraceDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatCurrency = (amount) => {
  if (!amount || amount === '0' || amount === 0) return '₹ 0';
  return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPriceWithUnit = (price, unit) => {
  if (!price && price !== 0) return '—';
  const formattedPrice = formatCurrency(price);
  if (!unit) return formattedPrice;
  return `${formattedPrice} / ${unit}`;
};

const formatRequestedLimit = (value, startCriteria) => {
  if (value === undefined || value === null || value === '') return '—';
  if (!startCriteria) return String(value);
  const upper = startCriteria.toUpperCase();
  if (upper === 'TIME') return `${value} min`;
  if (upper === 'ENERGY' || upper === 'AMOUNT') return `${value} kWh`;
  if (upper === 'SESSIONS') return `${value} session`;
  return String(value);
};

const truncateId = (id) => {
  if (!id) return 'N/A';
  const str = String(id);
  return str.length > 10 ? str.substring(0, 10) + '…' : str;
};

// Trace helpers
const SOURCE_COLORS = {
  APP: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-300', light: 'bg-blue-50' },
  CMS: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-300', light: 'bg-purple-50' },
  HAL: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-300', light: 'bg-emerald-50' },
  CHARGER: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-300', light: 'bg-amber-50' },
};
const SOURCE_ORDER = ['APP', 'CMS', 'HAL', 'CHARGER'];
const getSourceColor = (source) => SOURCE_COLORS[source] || { bg: 'bg-gray-400', text: 'text-gray-600', border: 'border-gray-300', light: 'bg-gray-50' };
const PHASE_COLORS = {
  PRE_START: { bg: 'bg-blue-50/70', text: 'text-blue-700', chip: 'bg-blue-100 text-blue-700' },
  STARTING: { bg: 'bg-indigo-50/70', text: 'text-indigo-700', chip: 'bg-indigo-100 text-indigo-700' },
  CHARGING: { bg: 'bg-emerald-50/70', text: 'text-emerald-700', chip: 'bg-emerald-100 text-emerald-700' },
  STOPPING: { bg: 'bg-amber-50/70', text: 'text-amber-700', chip: 'bg-amber-100 text-amber-700' },
  POST_STOP: { bg: 'bg-purple-50/70', text: 'text-purple-700', chip: 'bg-purple-100 text-purple-700' },
};
const getPhaseColor = (phase) => PHASE_COLORS[phase] || { bg: 'bg-gray-50/70', text: 'text-gray-600', chip: 'bg-gray-100 text-gray-600' };

// ==========================================================================
// SOC BATTERY DISPLAY
// ==========================================================================
const SocBatteryDisplay = ({ initialSoc, finalSoc, isOngoing }) => {
  if (initialSoc === null && finalSoc === null) return null;
  const initial = Math.min(Math.max(initialSoc ?? 0, 0), 100);
  const final = Math.min(Math.max(finalSoc ?? 0, 0), 100);
  const charged = Math.max(final - initial, 0);
  const displaySoc = final;

  const getBatteryColor = (soc) => {
    if (soc >= 80) return 'from-green-400 to-emerald-500';
    if (soc >= 50) return 'from-blue-400 to-indigo-500';
    if (soc >= 20) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };
  const batteryColor = getBatteryColor(displaySoc);

  const getBatteryIcon = (soc) => {
    if (soc >= 80) return <BatteryFull className="w-5 h-5 text-green-500" />;
    if (soc >= 50) return <BatteryCharging className="w-5 h-5 text-blue-500" />;
    if (soc >= 20) return <BatteryMedium className="w-5 h-5 text-yellow-500" />;
    return <BatteryLow className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getBatteryIcon(displaySoc)}
          <h4 className="text-sm font-semibold text-gray-700">State of Charge</h4>
        </div>
        {isOngoing && (
          <span className="text-xs text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Live
          </span>
        )}
      </div>

      <div className="relative">
        <div className="w-full h-14 bg-gray-200 rounded-xl overflow-hidden border-2 border-gray-300 relative">
          <div
            className={`h-full bg-gradient-to-r ${batteryColor} transition-all duration-700 ease-in-out rounded-lg flex items-center justify-end pr-3`}
            style={{ width: `${displaySoc}%` }}
          >
            {displaySoc >= 15 && (
              <span className="text-white text-sm font-bold drop-shadow-md">{Math.round(displaySoc)}%</span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-lg"></div>
        </div>
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-8 bg-gray-300 rounded-r-lg border-2 border-gray-300"></div>
      </div>

      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Start: {Math.round(initial)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span>{isOngoing ? 'Current' : 'End'}: {Math.round(displaySoc)}%</span>
        </div>
      </div>

      {initialSoc !== null && finalSoc !== null && (
        <div className="mt-4 text-sm text-gray-600 text-center bg-white/60 rounded-xl py-2.5 border border-gray-200">
          <span className="font-medium">
            {charged > 0 ? (
              <>
                <span className="text-emerald-600 font-bold">+{charged.toFixed(0)}%</span>
                <span className="text-gray-400 mx-2">•</span>
                Charged <span className="font-semibold">{charged.toFixed(0)}%</span>
                {isOngoing ? ' so far' : ' during session'}
              </>
            ) : (
              <span className="text-gray-400">No charge increase recorded</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// SessionDetailModal
// ==========================================================================
const SessionDetailModal = ({ session, loading, error, onClose }) => {
  if (!session) return null;

  const isOngoing = isOngoingStatus(session.status) || session.status === 'ACTIVE' || session.status === 'STOP_PENDING';
  const durationSeconds = isOngoing
    ? (session.duration_seconds || 0)
    : (getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time) ?? (session.duration_seconds || 0));
  const durationFormatted = formatDuration(durationSeconds);
  const durationMinutes = getDurationMinutes(durationSeconds);

  const isLive = session.is_live || session.live_data || session.consumed_wh;
  const energy = getEnergyKwh(session);
  const soc = getSocPercent(session);
  const meterFreshness = getMeterFreshness(session);
  const socFreshness = getSocFreshness(session);
  const projectedAmount = getProjectedAmount(session);
  const transactionId = getTransactionId(session);

  const initialSoc = getInitialSocPercent(session);
  const finalSoc = getFinalSocPercent(session, isOngoing, soc);

  const pricePerUnit = session.price_per_unit;
  const unit = session.unit || session.units;
  const startCriteria = session.start_criteria;
  const requestedLimit = session.requested_limit_value;
  const sgst = session.sgst_percent;
  const cgst = session.cgst_percent;
  const igst = session.igst_percent;

  // ==== Stop reason fields ====
  const stopObject = session.stop || {};
  const stopReason = session.stop_reason;
  const stopRequestedInitiator = stopObject.requested_initiator;
  const stopRequestedReason = stopObject.requested_reason;
  const stopOcppReason = stopObject.ocpp_reason;
  const stopReasonDisplay = getStopReasonDisplay(session);

  const hasAnyStopInfo = Boolean(
    (stopReason && stopReason !== 'N/A') ||
    stopRequestedInitiator ||
    stopRequestedReason ||
    stopOcppReason
  );

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
                ID: {truncateId(session.id || session.session_id)}
                {isLive && isOngoing && (
                  <span className="ml-2 text-green-300 inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-hide">
          {loading ? (
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
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(session.status)}`}>
                    {getStatusIcon(session.status)}
                    {getStatusDisplayName(session.status)}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {formatCurrency(projectedAmount || session.total_amount)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Usage</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {energy > 0 ? energy.toFixed(2) : (session.total_kwh || 0)} kWh
                  </p>
                  {isLive && soc && <p className="text-xs text-gray-500 mt-1">SOC: {soc}%</p>}
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{durationFormatted}</p>
                  {durationMinutes > 0 && !isOngoing && (
                    <p className="text-xs text-gray-400 mt-1">({durationMinutes} minutes)</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200 mb-6">
                <p className="text-xs font-medium text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <IndianRupee size={14} className="text-indigo-600" />
                  Pricing & GST
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {pricePerUnit !== null && pricePerUnit !== undefined && (
                    <div>
                      <span className="text-gray-500">Tariff</span>
                      <span className="ml-2 font-medium text-gray-800">{formatPriceWithUnit(pricePerUnit, unit)}</span>
                    </div>
                  )}
                  {startCriteria && (
                    <div>
                      <span className="text-gray-500">Start Criteria</span>
                      <span className="ml-2 font-medium text-gray-800">{startCriteria}</span>
                    </div>
                  )}
                  {requestedLimit !== null && requestedLimit !== undefined && (
                    <div>
                      <span className="text-gray-500">Requested Limit</span>
                      <span className="ml-2 font-medium text-gray-800">{formatRequestedLimit(requestedLimit, startCriteria)}</span>
                    </div>
                  )}
                  {sgst !== null && sgst !== undefined && (
                    <div><span className="text-gray-500">SGST</span><span className="ml-2 font-medium text-gray-800">{sgst}%</span></div>
                  )}
                  {cgst !== null && cgst !== undefined && (
                    <div><span className="text-gray-500">CGST</span><span className="ml-2 font-medium text-gray-800">{cgst}%</span></div>
                  )}
                  {igst !== null && igst !== undefined && (
                    <div><span className="text-gray-500">IGST</span><span className="ml-2 font-medium text-gray-800">{igst}%</span></div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Session Info</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Session ID</span>
                      <span className="font-mono text-gray-900">{session.id || session.session_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-mono text-gray-900">{transactionId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Connector</span>
                      <span className="text-gray-900">#{session.connector?.number || session.connector_number || 'N/A'}</span>
                    </div>
                    {session.connector?.connector_type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Connector Type</span>
                        <span className="text-gray-900">{session.connector.connector_type}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Info</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Name</span>
                      <span className="text-gray-900">{session.customer?.name || session.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email</span>
                      <span className="text-gray-900">{session.customer?.email || session.customer_email || 'N/A'}</span>
                    </div>
                    {(session.customer?.phone || session.customer_phone) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phone</span>
                        <span className="text-gray-900">{session.customer?.phone || session.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Charger Info</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Charger Name</span>
                      <span className="text-gray-900">{session.charger?.name || session.charger_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Charger ID</span>
                      <span className="text-gray-900">{session.charger?.charger_id || session.charger_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Hub</span>
                      <span className="text-gray-900">{session.charger?.hub_name || session.hub_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Timestamps</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Start Time</span>
                      <span className="text-gray-900">{formatDate(session.start_time || session.started_at)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">End Time</span>
                      <span className="text-gray-900">{session.end_time ? formatDate(session.end_time) : (isOngoing ? 'Ongoing' : 'N/A')}</span>
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
                    <div><span className="text-gray-500">Status:</span> <span className="ml-2 font-medium text-green-700">{getStatusDisplayName(session.status)}</span></div>
                    <div><span className="text-gray-500">Usage:</span> <span className="ml-2 font-medium text-blue-700">{energy.toFixed(2)} kWh</span></div>
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
                    <div><span className="text-gray-500">Amount:</span> <span className="ml-2 font-medium text-emerald-700">{formatCurrency(projectedAmount || session.total_amount)}</span></div>
                    <div><span className="text-gray-500">Duration:</span> <span className="ml-2 font-medium text-amber-700">{durationFormatted}</span></div>
                    <div>
                      <span className="text-gray-500">Meter:</span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${meterFreshness === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {meterFreshness}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STOP INFORMATION */}
              {hasAnyStopInfo && !isOngoing && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200 mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CircleX size={14} className="text-red-600" />
                    Stop Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {stopReasonDisplay && (
                      <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
                        <span className="text-gray-500">Stop Reason</span>
                        <span className="font-semibold text-red-700">{stopReasonDisplay}</span>
                      </div>
                    )}
                    {stopOcppReason && (
                      <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
                        <span className="text-gray-500">OCPP Reason</span>
                        <span className="font-semibold text-red-700">{stopOcppReason}</span>
                      </div>
                    )}
                    {stopRequestedInitiator && (
                      <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
                        <span className="text-gray-500">Requested Initiator</span>
                        <span className="font-semibold text-orange-700">{stopRequestedInitiator}</span>
                      </div>
                    )}
                    {stopRequestedReason && (
                      <div className="bg-white/70 rounded-xl px-3 py-2 border border-red-100 flex items-center justify-between">
                        <span className="text-gray-500">Requested Reason</span>
                        <span className="font-semibold text-orange-700">{prettifyReason(stopRequestedReason)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <SocBatteryDisplay initialSoc={initialSoc} finalSoc={finalSoc} isOngoing={isOngoing} />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25"
                >
                  <X size={18} /> Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// TraceModal
// ==========================================================================
const compareTraceEventsChronological = (a, b) => {
  const at = new Date(a?.occurred_at || 0).getTime();
  const bt = new Date(b?.occurred_at || 0).getTime();
  if (at !== bt) return at - bt;
  return String(a?.id || '').localeCompare(String(b?.id || ''));
};

const isMeterTraceEvent = (event) => {
  const category = String(event?.category || '').toUpperCase();
  const summary = String(event?.summary || '').toUpperCase();
  return (
    category.includes('METER') ||
    summary.includes('METERVALUES') ||
    summary.includes('METER VALUE') ||
    summary.includes('METER OBSERVATION')
  );
};

const meterValueFromEvent = (event) => {
  const value = event?.data?.meter_wh;
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const buildTraceDisplayRows = (events, expandedMeterGroups) => {
  const rows = [];
  for (let i = 0; i < events.length; ) {
    const event = events[i];
    if (!isMeterTraceEvent(event)) {
      rows.push({ kind: 'event', key: event.id, event });
      i += 1;
      continue;
    }
    const group = [event];
    let j = i + 1;
    while (j < events.length) {
      const next = events[j];
      if (
        !isMeterTraceEvent(next) ||
        next.source !== event.source ||
        next.target !== event.target ||
        next.phase !== event.phase ||
        next.protocol !== event.protocol
      ) break;
      group.push(next);
      j += 1;
    }
    if (group.length === 1) rows.push({ kind: 'event', key: event.id, event });
    else {
      const groupKey = `meter:${group[0].id}:${group[group.length - 1].id}`;
      if (expandedMeterGroups.has(groupKey)) {
        group.forEach((member) => rows.push({ kind: 'event', key: member.id, event: member, meterGroupKey: groupKey }));
      } else {
        rows.push({ kind: 'meter-group', key: groupKey, event: group[0], events: group, groupKey });
      }
    }
    i = j;
  }
  return rows;
};

const TraceModal = ({ traceData, loading, error, pagination, loadingMore, streamStatus, streamError, onClose, onLoadMore }) => {
  const [expandedMeterGroups, setExpandedMeterGroups] = useState(() => new Set());
  const events = traceData?.events || [];

  const sortedEvents = useMemo(() => {
    const byId = new Map();
    events.forEach((event) => { if (event?.id) byId.set(event.id, event); });
    return [...byId.values()].sort(compareTraceEventsChronological);
  }, [events]);

  const displayRows = useMemo(() => buildTraceDisplayRows(sortedEvents, expandedMeterGroups), [sortedEvents, expandedMeterGroups]);

  const sourcesPresent = useMemo(() => {
    const validSources = Array.isArray(traceData?.sources_present)
      ? traceData.sources_present.filter((source) => typeof source === 'string' && source.trim())
      : [];
    const known = SOURCE_ORDER.filter((source) => validSources.includes(source));
    const unknown = validSources.filter((source) => !SOURCE_ORDER.includes(source));
    return [...known, ...unknown];
  }, [traceData?.sources_present]);

  const phaseSegments = useMemo(() => {
    const segments = [];
    displayRows.forEach((row) => {
      const phase = row.event?.phase || 'UNKNOWN';
      const last = segments[segments.length - 1];
      if (last && last.phase === phase) last.rows.push(row);
      else segments.push({ phase, rows: [row] });
    });
    return segments;
  }, [displayRows]);

  if (!traceData && !loading && !error) return null;

  const traceUnavailable = error === 'Diagnostic trace is not available for this session.';

  const toggleMeterGroup = (groupKey) => {
    setExpandedMeterGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const renderEventDetails = (event) => (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer text-gray-500 hover:text-gray-800 select-none">Details</summary>
      <div className="mt-2 rounded-lg bg-white/80 border border-gray-200 p-2 space-y-1 text-gray-600">
        <div><span className="font-medium">Direction:</span> {event?.source || 'UNKNOWN'} → {event?.target || 'UNKNOWN'}</div>
        <div><span className="font-medium">Event ID:</span> <span className="font-mono break-all">{event?.id || 'N/A'}</span></div>
        <div><span className="font-medium">Trace ID:</span> <span className="font-mono break-all">{event?.trace_id || traceData?.trace_id || 'N/A'}</span></div>
        <div><span className="font-medium">Occurred:</span> <time dateTime={event?.occurred_at || undefined}>{formatTraceDate(event?.occurred_at)}</time></div>
        {event?.correlation_id && <div><span className="font-medium">Correlation:</span> <span className="font-mono break-all">{event.correlation_id}</span></div>}
        {(event?.state_before || event?.state_after) && (
          <div><span className="font-medium">State:</span> {event?.state_before || '—'} → {event?.state_after || '—'}</div>
        )}
        <div>
          <span className="font-medium">Sanitized data:</span>
          <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-slate-950 text-slate-100 p-2 overflow-x-auto">
            {JSON.stringify(event?.data ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </details>
  );

  const renderDesktopTraceRow = (row) => {
    const event = row.event || {};
    const source = event.source || 'UNKNOWN';
    const target = event.target || 'UNKNOWN';
    const sourceIndex = SOURCE_ORDER.indexOf(source);
    const targetIndex = SOURCE_ORDER.indexOf(target);
    const sourceColor = getSourceColor(source);
    const sourceKnown = sourceIndex !== -1;
    const targetKnown = targetIndex !== -1;
    const meterGroup = row.kind === 'meter-group' ? row.events : null;
    const firstMeter = meterGroup ? meterValueFromEvent(meterGroup[0]) : null;
    const lastMeter = meterGroup ? meterValueFromEvent(meterGroup[meterGroup.length - 1]) : null;
    const summary = meterGroup ? `MeterValues × ${meterGroup.length}` : event.summary || 'Trace event';
    const occurredEnd = meterGroup ? meterGroup[meterGroup.length - 1]?.occurred_at : null;

    const sourceX = sourceKnown ? ((sourceIndex + 0.5) / SOURCE_ORDER.length) * 100 : 0;
    const targetX = targetKnown ? ((targetIndex + 0.5) / SOURCE_ORDER.length) * 100 : 0;
    const arrowLeft = Math.min(sourceX, targetX);
    const arrowWidth = Math.abs(targetX - sourceX);
    const movesRight = targetX > sourceX;

    return (
      <div key={row.key} className="grid grid-cols-[150px_repeat(4,minmax(180px,1fr))] relative min-h-[124px] border-t border-gray-100">
        <div className="px-3 py-4 bg-white/70 border-r border-gray-200 text-xs text-gray-500">
          <time dateTime={event.occurred_at || undefined} className="font-medium text-gray-700">
            {formatTraceDate(event.occurred_at)}
          </time>
          {occurredEnd && occurredEnd !== event.occurred_at && (
            <div className="mt-1">→ <time dateTime={occurredEnd}>{formatTraceDate(occurredEnd)}</time></div>
          )}
        </div>
        {SOURCE_ORDER.map((lane) => {
          const isSource = source === lane;
          return (
            <div key={`${row.key}-${lane}`} className="relative px-3 py-3">
              {isSource && (
                <div className={`relative z-20 mt-10 rounded-xl border ${sourceColor.border} ${sourceColor.light} p-3 shadow-sm`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${sourceColor.text}`}>
                    {source} → {target}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-800">{summary}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">{event.phase || 'UNKNOWN'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">{event.protocol || 'UNKNOWN'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">{event.category || 'UNKNOWN'}</span>
                  </div>
                  {meterGroup && (
                    <div className="mt-2 text-xs text-gray-600">
                      {firstMeter !== null || lastMeter !== null ? (
                        <div>Meter: <span className="font-mono">{firstMeter ?? '—'} Wh → {lastMeter ?? '—'} Wh</span></div>
                      ) : (
                        <div>{meterGroup.length} loaded meter observations</div>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleMeterGroup(row.groupKey)}
                        className="mt-2 px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium"
                      >
                        Expand samples
                      </button>
                    </div>
                  )}
                  {!meterGroup && renderEventDetails(event)}
                </div>
              )}
            </div>
          );
        })}
        {sourceKnown && targetKnown && (
          <div className="absolute left-[150px] right-0 top-0 h-[64px] pointer-events-none z-10" aria-hidden="true">
            {source === target ? (
              <>
                <div className="absolute top-[8px] w-9 h-6 rounded-t-full border-2 border-b-0 border-indigo-400" style={{ left: `calc(${sourceX}% - 18px)` }} />
                <span className="absolute top-[22px] w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-indigo-500" style={{ left: `calc(${sourceX}% + 10px)` }} />
                <span className="absolute top-[25px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white -translate-x-1/2" style={{ left: `${sourceX}%` }} />
              </>
            ) : (
              <>
                <div className="absolute top-[30px] h-[2px] bg-indigo-400" style={{ left: `${arrowLeft}%`, width: `${arrowWidth}%` }} />
                <span className="absolute top-[25px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white -translate-x-1/2" style={{ left: `${sourceX}%` }} />
                <span className="absolute top-[25px] w-3 h-3 rounded-full bg-white border-2 border-indigo-500 ring-4 ring-white -translate-x-1/2" style={{ left: `${targetX}%` }} />
                {movesRight ? (
                  <span className="absolute top-[25px] w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-indigo-500" style={{ left: `calc(${targetX}% - 15px)` }} />
                ) : (
                  <span className="absolute top-[25px] w-0 h-0 border-y-[6px] border-transparent border-r-[10px] border-r-indigo-500" style={{ left: `calc(${targetX}% + 5px)` }} />
                )}
              </>
            )}
            <span className="sr-only">{source} to {target}: {summary}</span>
          </div>
        )}
        {(!sourceKnown || !targetKnown) && (
          <div className="col-start-2 col-span-4 px-4 pb-4">
            <div className="rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
              <div className="font-semibold">{source} → {target}</div>
              <div className="mt-1">{summary}</div>
              {renderEventDetails(event)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMobileTraceRow = (row) => {
    const event = row.event || {};
    const meterGroup = row.kind === 'meter-group' ? row.events : null;
    return (
      <div key={`mobile-${row.key}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-gray-700">{event.source || 'UNKNOWN'} → {event.target || 'UNKNOWN'}</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {meterGroup ? `MeterValues × ${meterGroup.length}` : event.summary || 'Trace event'}
            </div>
          </div>
          <time dateTime={event.occurred_at || undefined} className="text-[10px] text-gray-500 text-right">
            {formatTraceDate(event.occurred_at)}
          </time>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{event.phase || 'UNKNOWN'}</span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{event.protocol || 'UNKNOWN'}</span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{event.category || 'UNKNOWN'}</span>
        </div>
        {meterGroup ? (
          <button type="button" onClick={() => toggleMeterGroup(row.groupKey)} className="mt-3 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs text-gray-700 font-medium">
            Expand {meterGroup.length} samples
          </button>
        ) : renderEventDetails(event)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-4 md:p-6 flex items-start justify-center">
        <div className="bg-white rounded-3xl w-full max-w-7xl shadow-2xl overflow-hidden my-4">
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Charging Transaction Trace</h3>
              <p className="text-sm text-gray-500 mt-1">
                Session: <span className="font-mono">{truncateId(traceData?.session_id) || 'N/A'}</span> · Trace: <span className="font-mono">{truncateId(traceData?.trace_id) || 'N/A'}</span>
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl transition" aria-label="Close charging trace">
              <X size={22} />
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Trace ID</p>
                <p className="text-sm font-mono text-gray-800 truncate">{traceData?.trace_id || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">CMS Session ID</p>
                <p className="text-sm font-mono text-gray-800 truncate">{traceData?.session_id || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">HAL Transaction ID</p>
                <p className="text-sm font-mono text-gray-800 truncate">{traceData?.hal_transaction_id || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">OCPP Transaction ID</p>
                <p className="text-sm font-mono text-gray-800 truncate">{traceData?.ocpp_transaction_id ?? 'N/A'}</p>
              </div>
            </div>
            {loading && !traceData && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <span className="ml-3 text-gray-500">Loading trace events...</span>
              </div>
            )}
            {error && (
              <div className={`mb-6 rounded-xl p-4 flex items-center gap-2 border ${
                traceUnavailable ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}
            {!loading && traceData && sortedEvents.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                <p className="text-gray-600">No diagnostic events are available for this trace.</p>
              </div>
            )}
            {!loading && traceData && sortedEvents.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="hidden md:block max-h-[65vh] overflow-auto scrollbar-hide relative">
                  <div className="min-w-[980px]">
                    <div className="sticky top-0 z-40 grid grid-cols-[150px_repeat(4,minmax(180px,1fr))] bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
                      <div className="px-3 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200">Time</div>
                      {SOURCE_ORDER.map((lane) => {
                        const color = getSourceColor(lane);
                        return (
                          <div key={lane} className="px-3 py-3 text-center border-r border-gray-100">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${color.border} ${color.light} ${color.text} text-xs font-bold`}>
                              <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                              {lane}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {phaseSegments.map((segment, segmentIndex) => {
                      const phaseColor = getPhaseColor(segment.phase);
                      return (
                        <section key={`${segment.phase}-${segmentIndex}`} className={phaseColor.bg} aria-label={`${segment.phase} trace phase`}>
                          <div className="px-3 py-2 border-b border-gray-100">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${phaseColor.chip}`}>
                              {String(segment.phase).replaceAll('_', ' ')}
                            </span>
                          </div>
                          {segment.rows.map(renderDesktopTraceRow)}
                        </section>
                      );
                    })}
                  </div>
                </div>
                <div className="md:hidden p-3 space-y-4">
                  {phaseSegments.map((segment, segmentIndex) => {
                    const phaseColor = getPhaseColor(segment.phase);
                    return (
                      <section key={`mobile-${segment.phase}-${segmentIndex}`} className={`rounded-xl p-3 ${phaseColor.bg}`}>
                        <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold mb-3 ${phaseColor.chip}`}>
                          {String(segment.phase).replaceAll('_', ' ')}
                        </div>
                        <div className="space-y-3">
                          {segment.rows.map(renderMobileTraceRow)}
                        </div>
                      </section>
                    );
                  })}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>Each arrow is exactly one backend-declared source → target event.</span>
                  {pagination?.has_more && (
                    <>
                      <span>•</span>
                      <button type="button" onClick={onLoadMore} disabled={loadingMore} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium">
                        {loadingMore ? 'Loading older evidence...' : 'Load older evidence'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// MAIN SESSIONS COMPONENT
// ==========================================================================
const Sessions = () => {
  const navigate = useNavigate();
  const {
    authenticatedRequest,
    logout,
    isRefreshing,
    isAuthenticated,
    isBootstrapping,
    user,
    refreshToken,
    getAccessToken,
    isTokenExpired,
  } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeMainTab, setActiveMainTab] = useState('sessions');
  const [activeTab, setActiveTab] = useState('all');

  const [allSessions, setAllSessions] = useState([]);
  const [ongoingSessions, setOngoingSessions] = useState([]);
  const [liveSessionsData, setLiveSessionsData] = useState({ sessions: [], as_of: null });
  const [updatedSessionIds, setUpdatedSessionIds] = useState(new Set());

  const [pagination, setPagination] = useState({
    limit: 20,
    has_more: false,
    cursor_value: null,
    cursor_id: null,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [statusFilter, setStatusFilter] = useState('All');

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // ✅ Date filter persisted in localStorage, defaulting to 'month'
  const [dateFilter, setDateFilter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DATE_FILTER);
      return saved || 'month';
    } catch {
      return 'month';
    }
  });
  const [customDate, setCustomDate] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CUSTOM_DATE) || null;
    } catch {
      return null;
    }
  });
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateDropdownRef = useRef(null);

  // ✅ Persist date filter changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DATE_FILTER, dateFilter);
      if (dateFilter === 'custom' && customDate) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_DATE, customDate);
      } else if (dateFilter !== 'custom') {
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_DATE);
      }
    } catch (err) {
      console.warn('Failed to persist date filter:', err);
    }
  }, [dateFilter, customDate]);

  const [showDetailModal, setShowDetailModal] = useState(() => sessionStorage.getItem('sessionModalOpen') === 'true');
  const [selectedSession, setSelectedSession] = useState(() => {
    const saved = sessionStorage.getItem('selectedSession');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(() => sessionStorage.getItem('selectedSessionId') || null);

  const [showTraceModal, setShowTraceModal] = useState(false);
  const [traceData, setTraceData] = useState(null);
  const [loadingTrace, setLoadingTrace] = useState(false);
  const [traceError, setTraceError] = useState('');
  const [tracePagination, setTracePagination] = useState({
    has_more: false,
    next_occurred_at: null,
    next_event_id: null
  });
  const [loadingMoreTrace, setLoadingMoreTrace] = useState(false);
  const [traceStreamStatus, setTraceStreamStatus] = useState('idle');
  const [traceStreamError, setTraceStreamError] = useState('');

  const [isCompact, setIsCompact] = useState(true);

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

  const previousLiveIdsRef = useRef(new Set());
  const completedSessionsFetchRef = useRef(new Set());

  const traceStreamRef = useRef(null);
  const traceStreamRetryTimeoutRef = useRef(null);
  const traceStreamEnabledRef = useRef(false);
  const traceModalActiveRef = useRef(false);
  const traceStreamTraceIdRef = useRef(null);
  const traceReplayCursorRef = useRef(0);

  const initialFilterEffectDoneRef = useRef(false);

  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch(dateFilter) {
      case 'today': {
        const to = new Date(today);
        to.setDate(to.getDate() + 1);
        return { from: today.toISOString(), to: to.toISOString() };
      }
      case 'yesterday': {
        const from = new Date(today);
        from.setDate(from.getDate() - 1);
        return { from: from.toISOString(), to: today.toISOString() };
      }
      case 'week': {
        const from = new Date(today);
        const day = from.getDay();
        const diff = day === 0 ? 6 : day - 1;
        from.setDate(from.getDate() - diff);
        const to = new Date(today);
        to.setDate(to.getDate() + 1);
        return { from: from.toISOString(), to: to.toISOString() };
      }
      case 'month': {
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        const to = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { from: from.toISOString(), to: to.toISOString() };
      }
      case 'year': {
        const from = new Date(today.getFullYear(), 0, 1);
        const to = new Date(today.getFullYear() + 1, 0, 1);
        return { from: from.toISOString(), to: to.toISOString() };
      }
      case 'custom': {
        if (!customDate) return null;
        const from = new Date(customDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setDate(to.getDate() + 1);
        return { from: from.toISOString(), to: to.toISOString() };
      }
      default:
        return null;
    }
  }, [dateFilter, customDate]);

  const dateFilterLabel = useMemo(() => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'custom':
        if (customDate) {
          return new Date(customDate).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          });
        }
        return 'Custom Date';
      default: return 'Select Date';
    }
  }, [dateFilter, customDate]);

  useEffect(() => {
    if (showDetailModal) {
      sessionStorage.setItem('sessionModalOpen', 'true');
      sessionStorage.setItem('selectedSessionId', selectedSessionId || '');
      if (selectedSession) sessionStorage.setItem('selectedSession', JSON.stringify(selectedSession));
    } else {
      sessionStorage.removeItem('sessionModalOpen');
      sessionStorage.removeItem('selectedSessionId');
      sessionStorage.removeItem('selectedSession');
    }
  }, [showDetailModal, selectedSessionId, selectedSession]);

  useEffect(() => {
    if (showDetailModal || showTraceModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showDetailModal, showTraceModal]);

  useEffect(() => {
    if (!showDateDropdown) return;
    const handler = (e) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
        setShowDateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDateDropdown]);

  useEffect(() => {
    /* Don't redirect while the session is still being restored —
       ProtectedRoute already guards this route, but this extra
       check keeps the component correct if it's ever rendered
       standalone. */
    if (isBootstrapping) return;
    if (!isAuthenticated) { navigate('/signin'); return; }
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
      if (sessionRefreshTimeoutRef.current) clearTimeout(sessionRefreshTimeoutRef.current);
      if (durationUpdateIntervalRef.current) clearInterval(durationUpdateIntervalRef.current);
      if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
      if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
      traceStreamEnabledRef.current = false;
      traceModalActiveRef.current = false;
      if (traceStreamRef.current) {
        traceStreamRef.current.abort?.();
        traceStreamRef.current = null;
      }
      if (traceStreamRetryTimeoutRef.current) {
        clearTimeout(traceStreamRetryTimeoutRef.current);
        traceStreamRetryTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isBootstrapping, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!initialFilterEffectDoneRef.current) {
      initialFilterEffectDoneRef.current = true;
      return;
    }
    setLoading(true);
    setAllSessions([]);
    setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortBy, sortOrder, dateFilter, customDate]);

  useEffect(() => {
    if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
    liveDurationIntervalRef.current = setInterval(() => {
      setLiveSessionsData(prev => ({ ...prev }));
    }, 1000);
    return () => { if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current); };
  }, []);

  const refreshCompletedSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    if (completedSessionsFetchRef.current.has(String(sessionId))) return;
    completedSessionsFetchRef.current.add(String(sessionId));

    try {
      const response = await authenticatedRequest(API_CONFIG.SESSION_DETAIL_API(sessionId), { method: 'GET' });
      if (!response.ok || !isMountedRef.current) return;

      const data = await response.json();
      const session = data.session || data.data || data;
      if (!session) return;

      setOngoingSessions(prev =>
        prev.filter(s => String(s.id || s.session_id) !== String(sessionId))
      );

      setAllSessions(prev => {
        const idx = prev.findIndex(s => String(s.id || s.session_id) === String(sessionId));
        const updatedEntry = {
          ...session,
          is_live: false,
          live_data: null,
          status: session.status || 'COMPLETED',
          consumed_wh: null,
          duration_seconds:
            getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time)
            ?? session.duration_seconds ?? null
        };
        if (idx < 0) {
          return [updatedEntry, ...prev];
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updatedEntry };
        return updated;
      });

      setSelectedSession(prev => {
        if (!prev) return prev;
        const prevId = String(prev.id || prev.session_id);
        if (prevId !== String(sessionId)) return prev;
        return { ...prev, ...session, is_live: false, live_data: null };
      });

      delete liveSessionsMapRef.current[sessionId];
    } catch (err) {
      console.error('Failed to refresh completed session:', err);
    } finally {
      setTimeout(() => {
        completedSessionsFetchRef.current.delete(String(sessionId));
      }, 8000);
    }
  }, [authenticatedRequest]);

  useEffect(() => {
    const currentLiveIds = new Set(
      liveSessionsData.sessions.map(s => String(s.session_id || s.id))
    );

    const justCompleted = new Set();
    previousLiveIdsRef.current.forEach(id => {
      if (!currentLiveIds.has(id)) justCompleted.add(id);
    });

    const TERMINAL = ['COMPLETED', 'STOPPED', 'FAILED', 'CANCELLED', 'FINISHED'];
    liveSessionsData.sessions.forEach(s => {
      const status = String(s.status || '').toUpperCase();
      if (TERMINAL.includes(status)) justCompleted.add(String(s.session_id || s.id));
    });

    previousLiveIdsRef.current = currentLiveIds;

    if (justCompleted.size > 0) {
      justCompleted.forEach(id => refreshCompletedSession(id));
    }

    const newSessionIds = new Set();
    liveSessionsData.sessions.forEach(session => {
      const id = session.session_id || session.id;
      const prev = previousLiveSessionsRef.current.find(s => (s.session_id || s.id) === id);
      if (prev) {
        const prevEnergy = getEnergyKwh(prev);
        const currEnergy = getEnergyKwh(session);
        if (prevEnergy !== currEnergy || prev.status !== session.status) newSessionIds.add(id);
      } else {
        newSessionIds.add(id);
      }
    });
    if (newSessionIds.size > 0) {
      setUpdatedSessionIds(newSessionIds);
      setTimeout(() => setUpdatedSessionIds(new Set()), 2000);
    }
    previousLiveSessionsRef.current = [...liveSessionsData.sessions];

    const map = {};
    liveSessionsData.sessions.forEach(s => {
      const id = s.session_id || s.id;
      if (id) map[id] = s;
    });
    liveSessionsMapRef.current = map;

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
            duration_seconds: liveData.duration_seconds ?? prev.duration_seconds,
            status: liveData.status || prev.status,
            charger_name: liveData.charger_name || prev.charger_name,
            charger_id: liveData.charger_id || prev.charger_id,
            hub_name: liveData.hub_name || prev.hub_name,
            connector_number: liveData.connector_number || prev.connector_number,
            customer_name: liveData.customer_name || prev.customer_name,
            started_at: liveData.started_at || prev.started_at,
            ocpp_transaction_id: liveData.ocpp_transaction_id || prev.ocpp_transaction_id,
            transaction_id: liveData.ocpp_transaction_id || liveData.transaction_id || prev.transaction_id,
            projected_amount: liveData.projected_amount || prev.projected_amount,
            currency: liveData.currency || prev.currency
          };
        });
      }
    }

    const ongoing = liveSessionsData.sessions.filter(s =>
      isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING'
    );
    setOngoingSessions(ongoing);
  }, [liveSessionsData, showDetailModal, selectedSessionId, refreshCompletedSession]);

  useEffect(() => {
    if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
    if (showDetailModal && selectedSessionId) {
      modalScrollPositionRef.current = window.scrollY;
      modalLiveDataIntervalRef.current = setInterval(() => {
        if (selectedSessionId && liveSessionsMapRef.current[selectedSessionId]) {
          const liveData = liveSessionsMapRef.current[selectedSessionId];
          setSelectedSession(prev => {
            if (!prev || (!isOngoingStatus(prev.status) && prev.status !== 'ACTIVE')) return prev;
            return { ...prev, ...liveData, is_live: true };
          });
        }
      }, 1000);
    }
    return () => { if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current); };
  }, [showDetailModal, selectedSessionId]);

  useEffect(() => {
    if (!showDetailModal) {
      setTimeout(() => window.scrollTo(0, modalScrollPositionRef.current), 100);
    }
  }, [showDetailModal]);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, { method: 'GET' });
      if (response.ok && isMountedRef.current) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const startLiveSessionsSSE = () => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.abort?.();
        eventSourceRef.current = null;
      }
      const url = `${API_CONFIG.LIVE_SESSIONS_SSE}?cpo_app_id=${CPO_APP_ID}`;
      const controller = new AbortController();
      eventSourceRef.current = controller;
      /* authenticatedRequest attaches the current bearer token and
         X-CPO-App-ID, refreshes first if the token is stale, and
         retries once on a 401 — so this stream survives a token
         rotation without any manual 401 handling here. */
      authenticatedRequest(url, {
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (isMountedRef.current) { setIsStreaming(true); setShowLiveIndicator(true); }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const readStream = () => {
          if (!isMountedRef.current) return;
          reader.read().then(({ done, value }) => {
            if (done || !isMountedRef.current) {
              if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
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
              if (event.trim() && isMountedRef.current) processSSEEvent(event);
            }
            if (isMountedRef.current) readStream();
          }).catch(error => {
            if (error.name !== 'AbortError') {
              console.error('📡 SSE Stream error:', error);
              if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
            }
          });
        };
        readStream();
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('📡 SSE Stream fetch error:', error);
          if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
        }
      });
    } catch (error) {
      console.error('Error starting SSE stream:', error);
      if (isMountedRef.current) { setIsStreaming(false); setShowLiveIndicator(false); }
    }
  };

  const processSSEEvent = (eventText) => {
    try {
      const lines = eventText.split('\n');
      let eventType = '', eventData = '';
      for (const line of lines) {
        if (line.startsWith('event:')) eventType = line.substring(6).trim();
        if (line.startsWith('data:')) eventData += line.substring(5).trim();
      }
      if (eventData && eventType) {
        const data = JSON.parse(eventData);
        if (eventType === 'snapshot' || eventType === 'live_sessions') {
          const sessions = data.sessions || [];
          const as_of = data.as_of || new Date().toISOString();
          const transformed = sessions.map(session => {
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
              projected_amount: session.projected_amount || null,
              currency: session.currency || 'INR',
              ...session,
              ocpp_transaction_id: session.ocpp_transaction_id || null,
              transaction_id: session.ocpp_transaction_id || session.transaction_id || 'N/A'
            };
          });
          setLiveSessionsData({ sessions: transformed, as_of });
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
    if (sessionRefreshTimeoutRef.current) clearTimeout(sessionRefreshTimeoutRef.current);
    if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
    if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
    setIsStreaming(false);
    setShowLiveIndicator(false);
  };

  const stopTraceSSE = useCallback((resetStatus = true) => {
    traceStreamEnabledRef.current = false;
    traceStreamTraceIdRef.current = null;
    if (traceStreamRef.current) {
      traceStreamRef.current.abort?.();
      traceStreamRef.current = null;
    }
    if (traceStreamRetryTimeoutRef.current) {
      clearTimeout(traceStreamRetryTimeoutRef.current);
      traceStreamRetryTimeoutRef.current = null;
    }
    if (resetStatus && isMountedRef.current) {
      setTraceStreamStatus('idle');
      setTraceStreamError('');
    }
  }, []);

  const startTraceSSE = useCallback((traceId, initialCursor = 0) => {
    if (!traceId || !traceModalActiveRef.current) return;
    if (traceStreamRef.current) {
      traceStreamRef.current.abort?.();
      traceStreamRef.current = null;
    }
    if (traceStreamRetryTimeoutRef.current) {
      clearTimeout(traceStreamRetryTimeoutRef.current);
      traceStreamRetryTimeoutRef.current = null;
    }
    traceStreamEnabledRef.current = true;
    traceStreamTraceIdRef.current = traceId;
    traceReplayCursorRef.current = Math.max(0, Number(initialCursor) || 0);
    setTraceStreamError('');

    const stillCurrent = () => (
      isMountedRef.current &&
      traceModalActiveRef.current &&
      traceStreamEnabledRef.current &&
      traceStreamTraceIdRef.current === traceId
    );

    const scheduleReconnect = (delayMs = 3000) => {
      if (!stillCurrent() || traceStreamRetryTimeoutRef.current) return;
      setTraceStreamStatus('retrying');
      traceStreamRetryTimeoutRef.current = setTimeout(() => {
        traceStreamRetryTimeoutRef.current = null;
        if (stillCurrent()) connect();
      }, delayMs);
    };

    const mergeTraceEvent = (event, replayCursor) => {
      if (!event?.id || !stillCurrent()) return;
      if (Number.isFinite(replayCursor) && replayCursor >= 0) {
        traceReplayCursorRef.current = Math.max(traceReplayCursorRef.current, replayCursor);
      }
      setTraceData((previous) => {
        if (!previous || previous.trace_id !== traceId) return previous;
        const existingEvents = Array.isArray(previous.events) ? previous.events : [];
        const alreadyPresent = existingEvents.some((candidate) => candidate?.id === event.id);
        const source = typeof event.source === 'string' && event.source.trim() ? event.source : null;
        return {
          ...previous,
          replay_cursor: Math.max(Number(previous.replay_cursor) || 0, Number.isFinite(replayCursor) ? replayCursor : 0),
          sources_present: source
            ? Array.from(new Set([...(previous.sources_present || []), source]))
            : (previous.sources_present || []),
          events: alreadyPresent ? existingEvents : [...existingEvents, event]
        };
      });
    };

    async function connect() {
      if (!stillCurrent()) return;

      let token = getAccessToken();

      if (token && isTokenExpired()) {
        token = await refreshToken();
      }

      if (!token) { setTraceStreamError('Authentication is required for live trace updates.'); scheduleReconnect(3000); return; }
      const controller = new AbortController();
      traceStreamRef.current = controller;
      const after = traceReplayCursorRef.current;
      const url = `${API_CONFIG.TRACE_STREAM_API(traceId)}?after=${encodeURIComponent(after)}`;
      setTraceStreamStatus('connecting');

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });

        if (!stillCurrent()) return;
        if (response.status === 401) {
          setTraceStreamError('Refreshing session for live trace updates…');
          const newToken = await refreshToken();
          if (newToken && stillCurrent()) { setTraceStreamError(''); scheduleReconnect(0); }
          return;
        }
        if (response.status === 403) {
          traceStreamEnabledRef.current = false;
          setTraceStreamStatus('idle');
          setTraceStreamError('Live trace access is no longer authorized.');
          setTraceData(null);
          setTracePagination({ has_more: false, next_occurred_at: null, next_event_id: null });
          setTraceError('Trace access is no longer authorized.');
          return;
        }
        if (response.status === 404) {
          traceStreamEnabledRef.current = false;
          setTraceStreamStatus('idle');
          setTraceStreamError('Live diagnostic trace is no longer available.');
          return;
        }
        if (!response.ok || !response.body) throw new Error(`Trace SSE HTTP ${response.status}`);

        setTraceStreamStatus('connected');
        setTraceStreamError('');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (stillCurrent()) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split(/\r?\n\r?\n/);
          buffer = frames.pop() || '';
          for (const frame of frames) {
            if (!frame.trim()) continue;
            let eventType = 'message';
            let eventId = '';
            const dataLines = [];
            for (const rawLine of frame.split(/\r?\n/)) {
              if (!rawLine || rawLine.startsWith(':')) continue;
              const colon = rawLine.indexOf(':');
              const field = colon === -1 ? rawLine : rawLine.slice(0, colon);
              let valueText = colon === -1 ? '' : rawLine.slice(colon + 1);
              if (valueText.startsWith(' ')) valueText = valueText.slice(1);
              if (field === 'event') eventType = valueText;
              else if (field === 'id') eventId = valueText;
              else if (field === 'data') dataLines.push(valueText);
            }
            if (eventType !== 'trace_event' || dataLines.length === 0) continue;
            try {
              const event = JSON.parse(dataLines.join('\n'));
              const cursor = Number(eventId);
              mergeTraceEvent(event, Number.isFinite(cursor) ? cursor : null);
            } catch (parseError) {
              console.warn('Trace SSE event parse error:', parseError);
            }
          }
        }
        if (stillCurrent()) scheduleReconnect();
      } catch (streamError) {
        if (streamError?.name === 'AbortError') return;
        console.error('Trace SSE stream error:', streamError);
        if (stillCurrent()) { setTraceStreamError('Live trace stream interrupted; retrying.'); scheduleReconnect(); }
      } finally {
        if (traceStreamRef.current === controller) traceStreamRef.current = null;
      }
    }
    connect();
  }, [refreshToken, getAccessToken, isTokenExpired]);

  const fetchSessions = useCallback(async (cursorValue = null, cursorId = null, isLoadMore = false) => {
    if (fetchInProgressRef.current) return;
    if (isLoadMore && loadingMore) return;

    fetchInProgressRef.current = true;
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);
    setError('');

    try {
      let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
      url += `&sort_by=${encodeURIComponent(sortBy)}&sort_order=${encodeURIComponent(sortOrder)}`;

      if (cursorValue) url += `&cursor_value=${encodeURIComponent(cursorValue)}`;
      if (cursorId) url += `&cursor_id=${encodeURIComponent(cursorId)}`;

      if (dateRange) {
        url += `&start_time_from=${encodeURIComponent(dateRange.from)}`;
        url += `&start_time_to=${encodeURIComponent(dateRange.to)}`;
      }

      if (statusFilter !== 'All') url += `&status=${statusFilter}`;

      const response = await authenticatedRequest(url, { method: 'GET' });

      if (!isMountedRef.current) { fetchInProgressRef.current = false; return; }

      if (response.ok) {
        const data = await response.json();
        let sessionsArray = data.sessions || data.data || [];
        if (!Array.isArray(sessionsArray)) sessionsArray = [];

        const hasMore = data.has_more || false;
        const nextCursorValue =
          data.next_cursor_value !== undefined && data.next_cursor_value !== null
            ? data.next_cursor_value
            : data.next_before || null;
        const nextCursorId =
          data.next_cursor_id !== undefined && data.next_cursor_id !== null
            ? data.next_cursor_id
            : data.next_before_id || null;

        const transformed = sessionsArray.map((session) => {
          const sessionId = session.id || session.session_id;
          const liveData = liveSessionsMapRef.current[sessionId];
          const status = liveData?.status || session.status || 'UNKNOWN';
          const isOngoing = isOngoingStatus(status) || status === 'ACTIVE' || status === 'STOP_PENDING';
          const startTime = session.start_time || liveData?.started_at;
          const endTime = session.end_time;
          const durationSeconds = isOngoing
            ? (liveData?.duration_seconds ?? null)
            : (getCompletedDurationSeconds(startTime, endTime) ?? session.duration_seconds ?? null);

          return {
            ...session,
            id: session.id,
            session_id: session.session_id || session.id,
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
            stop: session.stop || null,
            created_at: session.created_at || session.start_time,
            is_live: !!liveData,
            live_data: liveData || null,
            consumed_wh: liveData?.consumed_wh || null,
            soc_percent: liveData?.soc_percent || null,
            latest_meter_wh: liveData?.latest_meter_wh || null,
            meter_freshness: liveData?.meter_freshness || 'UNKNOWN',
            soc_freshness: liveData?.soc_freshness || 'UNKNOWN',
            projected_amount: liveData?.projected_amount || session.projected_amount || null,
            duration_seconds: durationSeconds,
            started_at: liveData?.started_at || session.start_time,
            price_per_unit: session.price_per_unit || null,
            unit: session.unit || session.units || null,
            start_criteria: session.start_criteria || null,
            requested_limit_value: session.requested_limit_value || null,
            sgst_percent: session.sgst_percent || null,
            cgst_percent: session.cgst_percent || null,
            igst_percent: session.igst_percent || null,
          };
        });

        if (isLoadMore) {
          setAllSessions(prev => {
            const existingIds = new Set(prev.map(s => String(s.id || s.session_id)));
            const newSessions = transformed.filter(s => !existingIds.has(String(s.id || s.session_id)));
            return [...prev, ...newSessions];
          });
        } else {
          setAllSessions(transformed);
        }

        setPagination({
          limit: pagination.limit,
          has_more: hasMore,
          cursor_value: nextCursorValue,
          cursor_id: nextCursorId,
        });

        setHasLoaded(true);
        setIsInitialLoad(false);
      } else {
        if (!isLoadMore && isMountedRef.current) {
          setAllSessions([]);
          setOngoingSessions([]);
        }
        setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      if (!isLoadMore && isMountedRef.current) {
        setAllSessions([]);
        setOngoingSessions([]);
      }
      if (error?.status === 401) {
        setError('Your session has expired. Sign in again.');
      }
      setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
    } finally {
      fetchInProgressRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedRequest, pagination.limit, statusFilter, sortBy, sortOrder, dateRange]);

  const fetchSessionDetail = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setLoadingDetail(true);
    setError('');
    try {
      const url = API_CONFIG.SESSION_DETAIL_API(sessionId);
      const response = await authenticatedRequest(url, { method: 'GET' });
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
          session.ocpp_transaction_id = liveData.ocpp_transaction_id || session.ocpp_transaction_id || null;
          session.transaction_id = liveData.ocpp_transaction_id || liveData.transaction_id || session.transaction_id || 'N/A';
          session.projected_amount = liveData.projected_amount || session.projected_amount || null;
          session.currency = liveData.currency || session.currency || 'INR';
        }
        if (sessionIsOngoing) {
          session.duration_seconds = liveData?.duration_seconds ?? session.duration_seconds ?? null;
        } else {
          session.duration_seconds =
            getCompletedDurationSeconds(session.start_time || session.started_at, session.end_time) ??
            session.duration_seconds ??
            null;
        }
        session.price_per_unit = session.price_per_unit || null;
        session.unit = session.unit || session.units || null;
        session.start_criteria = session.start_criteria || null;
        session.requested_limit_value = session.requested_limit_value || null;
        session.sgst_percent = session.sgst_percent || null;
        session.cgst_percent = session.cgst_percent || null;
        session.igst_percent = session.igst_percent || null;
        setSelectedSessionId(sessionKey);
        setSelectedSession(session);
        setShowDetailModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch session details');
      }
    } catch (error) {
      console.error('❌ Error fetching session detail:', error);
      if (isMountedRef.current) {
        setError(
          error?.status === 401
            ? 'Your session has expired. Sign in again.'
            : 'An error occurred while fetching session details'
        );
      }
    } finally {
      if (isMountedRef.current) setLoadingDetail(false);
    }
  }, [authenticatedRequest]);

  const fetchTrace = useCallback(async (sessionId, beforeOccurredAt = null, beforeEventId = null, isLoadMore = false) => {
    if (!sessionId) return;
    if (isLoadMore && loadingMoreTrace) return;
    if (!isLoadMore) {
      if (traceStreamRef.current) { traceStreamRef.current.abort?.(); traceStreamRef.current = null; }
      if (traceStreamRetryTimeoutRef.current) { clearTimeout(traceStreamRetryTimeoutRef.current); traceStreamRetryTimeoutRef.current = null; }
      traceStreamEnabledRef.current = false;
      setTraceStreamStatus('idle');
      setTraceStreamError('');
      setLoadingTrace(true);
      setTraceError('');
      setTraceData(null);
    } else {
      setLoadingMoreTrace(true);
    }
    try {
      let url = `${API_CONFIG.TRACE_API(sessionId)}?limit=50`;
      if (beforeOccurredAt) url += `&before_occurred_at=${encodeURIComponent(beforeOccurredAt)}`;
      if (beforeEventId) url += `&before_event_id=${encodeURIComponent(beforeEventId)}`;
      const response = await authenticatedRequest(url, { method: 'GET' });
      if (!isMountedRef.current) return;
      if (response.ok) {
        const data = await response.json();
        if (isLoadMore) {
          setTraceData(prev => ({
            ...prev, ...data,
            replay_cursor: prev?.replay_cursor ?? data.replay_cursor,
            sources_present: Array.from(new Set([...(prev?.sources_present || []), ...(data.sources_present || [])])),
            events: [...(prev?.events || []), ...(data.events || [])]
          }));
        } else {
          setTraceData(data);
          traceReplayCursorRef.current = Math.max(0, Number(data.replay_cursor) || 0);
          if (data.trace_id && traceModalActiveRef.current) {
            startTraceSSE(data.trace_id, traceReplayCursorRef.current);
          }
        }
        setTracePagination({
          has_more: !!data.next_occurred_at && !!data.next_event_id,
          next_occurred_at: data.next_occurred_at || null,
          next_event_id: data.next_event_id || null
        });
      } else if (response.status === 403) {
        setTraceData(null);
        setTracePagination({ has_more: false, next_occurred_at: null, next_event_id: null });
        setTraceError('Trace access is not authorized for this CPO membership.');
      } else if (response.status === 404) {
        setTraceError('Diagnostic trace is not available for this session.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTraceError(errorData?.error?.message || errorData?.message || 'Failed to fetch trace');
      }
    } catch (error) {
      console.error('❌ Error fetching trace:', error);
      setTraceError(
        error?.status === 401
          ? 'Your session has expired. Sign in again.'
          : 'An error occurred while fetching diagnostic trace'
      );
    } finally {
      if (isMountedRef.current) { setLoadingTrace(false); setLoadingMoreTrace(false); }
    }
  }, [authenticatedRequest, startTraceSSE, loadingMoreTrace]);

  const loadMoreTrace = () => {
    if (tracePagination.has_more && !loadingMoreTrace && traceData) {
      fetchTrace(traceData.session_id, tracePagination.next_occurred_at, tracePagination.next_event_id, true);
    }
  };

  const openTraceModal = (sessionId) => {
    if (sessionId) {
      traceModalActiveRef.current = true;
      setShowTraceModal(true);
      fetchTrace(sessionId);
    }
  };

  const closeTraceModal = () => {
    traceModalActiveRef.current = false;
    stopTraceSSE();
    setShowTraceModal(false);
    setTraceData(null);
    setTraceError('');
    setTracePagination({ has_more: false, next_occurred_at: null, next_event_id: null });
  };

  const loadMoreSessions = () => {
    if (
      pagination.has_more &&
      pagination.cursor_value &&
      pagination.cursor_id &&
      !loadingMore && !loading && !fetchInProgressRef.current
    ) {
      fetchSessions(pagination.cursor_value, pagination.cursor_id, true);
    }
  };

  const handleSessionClick = (sessionId) => {
    if (sessionId) {
      modalScrollPositionRef.current = window.scrollY;
      fetchSessionDetail(sessionId);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSession(null);
    setSelectedSessionId(null);
    setError('');
    if (modalLiveDataIntervalRef.current) {
      clearInterval(modalLiveDataIntervalRef.current);
      modalLiveDataIntervalRef.current = null;
    }
    setTimeout(() => window.scrollTo(0, modalScrollPositionRef.current), 50);
  };

  const handleTabChange = (tab) => setActiveTab(tab);
  const handleMainTabChange = (tab) => {
    setActiveMainTab(tab);
    if (tab === 'chargers') navigate('/charger-session');
  };

  const handleLogout = async () => {
    try {
      stopLiveSessionsSSE();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const handleRefresh = () => {
    if (!fetchInProgressRef.current) {
      setLoading(true);
      setAllSessions([]);
      setOngoingSessions([]);
      setPagination({ limit: 20, has_more: false, cursor_value: null, cursor_id: null });
      fetchSessions();
    }
  };

  const filteredSessions = useMemo(() => {
    const liveOnes = ongoingSessions.map(s => ({
      ...s,
      is_live: true,
      id: s.id || s.session_id,
      session_id: s.session_id || s.id,
      start_time: s.start_time || s.started_at,
      started_at: s.started_at || s.start_time,
      duration_seconds: s.duration_seconds ?? 0,
      total_kwh: s.consumed_wh ? parseFloat(s.consumed_wh) / 1000 : (s.total_kwh || 0),
      total_amount: s.projected_amount || s.total_amount || '0'
    }));

    liveOnes.sort((a, b) => {
      const at = new Date(a.started_at || a.start_time || 0).getTime();
      const bt = new Date(b.started_at || b.start_time || 0).getTime();
      return bt - at;
    });

    const liveIds = new Set(liveOnes.map(s => String(s.id || s.session_id)));
    const nonLive = allSessions.filter(s => !liveIds.has(String(s.id || s.session_id)));

    let base;
    if (activeTab === 'ongoing') {
      base = liveOnes;
    } else {
      base = [...liveOnes, ...nonLive];
    }

    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(session => {
      const idStr = String(session.id || session.session_id || '');
      const transactionIdStr = String(session.transaction_id || session.ocpp_transaction_id || '');
      const chargerNameStr = String(session.charger_name || session.charger?.name || '');
      const chargerIdStr = String(session.charger_id || session.charger?.charger_id || '');
      const hubNameStr = String(session.hub_name || session.charger?.hub_name || '');
      const customerNameStr = String(session.customer_name || session.customer?.name || '');
      return (
        idStr.toLowerCase().includes(q) ||
        transactionIdStr.toLowerCase().includes(q) ||
        chargerNameStr.toLowerCase().includes(q) ||
        chargerIdStr.toLowerCase().includes(q) ||
        hubNameStr.toLowerCase().includes(q) ||
        customerNameStr.toLowerCase().includes(q)
      );
    });
  }, [activeTab, allSessions, ongoingSessions, searchQuery]);

  const ongoingCount = useMemo(() => {
    return ongoingSessions.filter(s => isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING').length;
  }, [ongoingSessions]);

  const showLoadMore = pagination.has_more && pagination.cursor_value && pagination.cursor_id && !loadingMore;

  const DATE_OPTIONS = [
    { id: 'today',     label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week',      label: 'This Week' },
    { id: 'year',      label: 'This Year' },
    { id: 'month',     label: 'This Month' },
  ];

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

  const FilterPopup = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" /> Filters
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
              <option value="START_PENDING">Start Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="STOP_PENDING">Stop Pending</option>
              <option value="RECONCILIATION_REQUIRED">Reconciliation Required</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowFilterPopup(false); }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
            >
              Apply Filters
            </button>
            <button
              onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}
              className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tableMaxHeight = 'calc(100vh - 380px)';

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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
                <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium">/ Dashboard</button>
                <span className="text-blue-600">/</span>
                <span className="text-blue-600 font-medium">Sessions</span>
              </div>
              {isRefreshing && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-medium animate-fadeIn">
                  <RefreshCw size={11} className="animate-spin" />
                  Refreshing…
                </span>
              )}
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

        <div className="flex items-center gap-1 mt-4 border-b border-gray-200 px-6">
          <button
            onClick={() => handleMainTabChange('chargers')}
            className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
              activeMainTab === 'chargers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap size={16} /> Chargers
          </button>
          <button
            onClick={() => handleMainTabChange('sessions')}
            className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
              activeMainTab === 'sessions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History size={16} /> Sessions
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">{allSessions.length + ongoingSessions.length}</span>
          </button>
        </div>

        {activeMainTab === 'sessions' && (
          <div className="p-6">

            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition group inline-flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loaded Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{allSessions.length + ongoingSessions.length}</p>
                  {pagination.has_more && (
                    <p className="text-xs text-blue-500">More sessions available — load more below</p>
                  )}
                </div>
              </div>

              <div className="relative" ref={dateDropdownRef}>
                <button
                  onClick={() => setShowDateDropdown(v => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 shadow-sm transition text-sm font-medium text-gray-700 min-w-[190px] justify-between"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-blue-600" />
                    <span>{dateFilterLabel}</span>
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDateDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-64 overflow-hidden">
                    <div className="p-1.5">
                      {DATE_OPTIONS.map(opt => {
                        const active = dateFilter === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setDateFilter(opt.id);
                              setCustomDate(null);
                              setShowDateDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                              active
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {active && <CheckCircle size={14} className="text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-100 p-2">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">Custom Date</div>
                      <input
                        type="date"
                        value={customDate || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) {
                            setCustomDate(v);
                            setDateFilter('custom');
                            setShowDateDropdown(false);
                          } else {
                            setCustomDate(null);
                            setDateFilter('today');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 text-xs text-gray-400 px-1">
                        {dateFilter === 'custom' && customDate
                          ? `Showing ${new Date(customDate).toLocaleDateString()}`
                          : 'Pick a date to filter'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <div className="flex items-center gap-2">
                  <Grid size={16} /> All Sessions
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{allSessions.length + ongoingSessions.length}</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('ongoing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'ongoing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <div className="flex items-center gap-2">
                  <Activity size={16} /> Ongoing
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{ongoingCount}</span>
                  {showLiveIndicator && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span>}
                </div>
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">

                <div className="flex items-center gap-1.5 bg-white rounded-xl px-2 py-1 border border-gray-200 shadow-sm">
                  <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-1.5 py-1 rounded-lg bg-transparent text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 cursor-pointer"
                  >
                    <option value="created_at">Created At</option>
                    <option value="start_time">Start Time</option>
                    <option value="end_time">End Time</option>
                    <option value="duration">Duration</option>
                    <option value="usage">Usage</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {statusFilter !== 'All' && (
                  <button
                    onClick={() => setStatusFilter('All')}
                    className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-1 border border-red-200"
                  >
                    <X size={12} /> {getStatusDisplayName(statusFilter)}
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
                  onClick={() => setIsCompact(!isCompact)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium whitespace-nowrap"
                  title={isCompact ? "Switch to Expanded view" : "Switch to Compact view"}
                >
                  <Sliders size={14} />
                  {isCompact ? 'Compact' : 'Expanded'}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={fetchInProgressRef.current}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  <RefreshCw size={14} className={fetchInProgressRef.current ? 'animate-spin' : ''} />
                  Refresh
                </button>
                {showFilterPopup && <FilterPopup />}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
              <div
                className="custom-scrollbar"
                style={{
                  maxHeight: tableMaxHeight,
                  overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <table
                  className="w-full"
                  style={isCompact ? { minWidth: '1180px' } : { minWidth: '2050px' }}
                >
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>SI</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Session ID</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Transaction ID</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Customer</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Charger</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Hub</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Connector</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Start Time</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>End Time</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Duration</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Usage</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Start Criteria</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Req. Limit</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Amount</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Status</th>
                      <th className={`${isCompact ? 'px-2.5 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs whitespace-nowrap`}>Stop Reason</th>
                      <th
                        className={`${isCompact ? 'px-3 py-3' : 'px-4 py-4'} text-left font-semibold text-gray-600 uppercase tracking-wider text-xs sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] z-30 whitespace-nowrap`}
                        style={{ minWidth: '170px' }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && !hasLoaded && isInitialLoad ? (
                      <tr>
                        <td colSpan="17" className={`${isCompact ? 'px-3 py-6' : 'px-4 py-12'} text-center`}>
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-1" />
                          <p className="text-gray-500 text-sm">Loading sessions...</p>
                        </td>
                      </tr>
                    ) : loading ? (
                      <tr>
                        <td colSpan="17" className={`${isCompact ? 'px-3 py-12' : 'px-4 py-20'} text-center`}>
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-gray-500 text-sm font-medium">Loading sessions…</p>
                            <p className="text-xs text-gray-400">Fetching {dateFilterLabel} data</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="17" className={`${isCompact ? 'px-3 py-6' : 'px-4 py-12'} text-center`}>
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
                          <p className="text-gray-600 text-sm">{error}</p>
                          <button
                            onClick={() => { setError(''); fetchSessions(); }}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan="17" className={`${isCompact ? 'px-3 py-6' : 'px-4 py-12'} text-center`}>
                          <Database size={isCompact ? 32 : 40} className="text-gray-300 mx-auto mb-1" />
                          <p className="text-gray-500 font-medium text-sm">No Sessions Found</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {activeTab === 'all' ? `No charging sessions for ${dateFilterLabel}.` : 'No ongoing sessions found.'}
                          </p>
                          {showLiveIndicator && activeTab === 'ongoing' && (
                            <p className="text-xs text-green-600 mt-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                              Waiting for live sessions...
                            </p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((session, index) => {
                        const isOngoing = isOngoingStatus(session.status) || session.status === 'ACTIVE' || session.status === 'STOP_PENDING';
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

                        if (isLive) {
                          const energy = getEnergyKwh(session);
                          displayEnergy = energy > 0 ? energy.toFixed(2) : (session.total_kwh || '0');
                          displaySoc = getSocPercent(session) || null;
                          const projectedAmount = getProjectedAmount(session);
                          if (projectedAmount > 0) displayAmount = projectedAmount;
                        }

                        const connectorNumber = session.connector?.number || session.connector_number || 'N/A';
                        const liveMapEntry = liveSessionsMapRef.current[sessionId];
                        const transactionId = liveMapEntry?.ocpp_transaction_id || session.ocpp_transaction_id || session.transaction_id || 'N/A';
                        const chargerId = session.charger?.charger_id || session.charger_id || session.charger?.id || 'N/A';
                        const chargerName = session.charger?.name || session.charger_name || 'N/A';

                        const startCriteria = session.start_criteria;
                        const requestedLimit = session.requested_limit_value;
                        const limitDisplay = formatRequestedLimit(requestedLimit, startCriteria);

                        // ✅ Stop reason — null for ongoing/live sessions
                        const stopReasonDisplay = getStopReasonDisplay(session);

                        const rowBg = isLive && isOngoing ? 'bg-green-50/40' : 'bg-white';
                        const stickyBg = isLive && isOngoing ? 'bg-green-50' : 'bg-white';

                        const cellPad = isCompact ? 'px-2.5 py-2' : 'px-4 py-3.5';
                        const cellText = isCompact ? 'text-sm' : 'text-[15px]';

                        return (
                          <tr
                            key={sessionId || session.transaction_id || index}
                            className={`border-b border-gray-100 hover:bg-gray-50/70 transition cursor-pointer ${rowBg} ${
                              isUpdated && isLive ? 'animate-pulse-update' : ''
                            }`}
                            onClick={() => handleSessionClick(sessionId)}
                          >
                            <td className={`${cellPad} text-gray-500 text-center text-xs`}>
                              {isLive && isOngoing ? (
                                <span className="inline-flex items-center justify-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                </span>
                              ) : (index + 1)}
                            </td>
                            <td className={`${cellPad} font-mono text-gray-700 ${cellText} truncate max-w-[120px]`} title={sessionId}>{truncateId(sessionId)}</td>
                            <td className={`${cellPad} font-mono text-gray-700 ${cellText} truncate max-w-[110px]`} title={transactionId}>{truncateId(transactionId)}</td>
                            <td className={`${cellPad} text-gray-700 ${cellText} truncate max-w-[130px]`} title={session.customer?.name || session.customer_name}>
                              {session.customer?.name || session.customer_name || 'N/A'}
                            </td>
                            <td className={`${cellPad} text-gray-700 ${cellText}`}>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800 truncate max-w-[140px]" title={chargerName}>{chargerName}</span>
                                <span className="text-[11px] text-gray-400 truncate max-w-[140px]" title={chargerId}>ID: {truncateId(chargerId)}</span>
                              </div>
                            </td>
                            <td className={`${cellPad} text-gray-600 ${cellText} truncate max-w-[110px]`} title={session.charger?.hub_name || session.hub_name}>
                              {session.charger?.hub_name || session.hub_name || 'N/A'}
                            </td>
                            <td className={`${cellPad} font-mono text-gray-500 text-center ${cellText}`}>#{connectorNumber}</td>
                            <td className={`${cellPad} text-gray-600 ${cellText} whitespace-nowrap`}>{formatDate(session.start_time || session.started_at)}</td>
                            <td className={`${cellPad} ${cellText} whitespace-nowrap`}>
                              {isOngoing ? (
                                <span className="text-green-600 font-medium">Ongoing</span>
                              ) : (session.end_time ? <span className="text-gray-600">{formatDate(session.end_time)}</span> : 'N/A')}
                            </td>
                            <td className={`${cellPad} ${cellText}`}>
                              <span className="font-medium text-gray-700">{durationDisplay}</span>
                            </td>
                            <td className={`${cellPad} ${cellText} whitespace-nowrap`}>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-700">{displayEnergy} kWh</span>
                                {isLive && displaySoc && (
                                  <span className="text-xs text-purple-600">· SOC: {displaySoc}%</span>
                                )}
                              </div>
                            </td>
                            <td className={`${cellPad} text-gray-700 ${cellText} whitespace-nowrap`}>{startCriteria || '—'} BASED</td>
                            <td className={`${cellPad} text-gray-700 ${cellText}`}>
  {(() => {
    const criteria = String(session.start_criteria || '').toUpperCase();
    const isMoneyBased = ['AMOUNT', 'MONEY', 'PRICE', 'COST'].includes(criteria);

    if (limitDisplay === '—') {
      return <span className="text-gray-300">—</span>;
    }

    if (isMoneyBased) {
      const rawValue = session.requested_limit_value;
      const num = Number(rawValue);
      const formatted = Number.isFinite(num)
        ? num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : rawValue;
      return (
        <span className="inline-flex items-center gap-0.5 font-semibold text-gray-800 whitespace-nowrap">
          <IndianRupee size={13} className="text-gray-600" />
          {formatted}
        </span>
      );
    }

    return <span className="whitespace-nowrap">{limitDisplay}</span>;
  })()}
</td>
                            <td className={`${cellPad} font-semibold text-gray-700 ${cellText} whitespace-nowrap`}>
                              {formatCurrency(displayAmount)}
                            </td>
                            <td className={`${cellPad} ${cellText}`}>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                                {getStatusIcon(session.status)}
                                {getStatusDisplayName(session.status)}
                              </span>
                            </td>
                            {/* ✅ Stop Reason cell */}
                            <td className={`${cellPad} ${cellText} whitespace-nowrap`}>
                              {stopReasonDisplay ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                    stopReasonDisplay === 'Stopped by Charger'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {stopReasonDisplay}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td
                              className={`${isCompact ? 'px-3 py-2' : 'px-4 py-3.5'} sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${stickyBg}`}
                              style={{ minWidth: '170px' }}
                            >
                              <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                                <button
                                  className="px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 shadow-sm"
                                  onClick={(e) => { e.stopPropagation(); handleSessionClick(sessionId); }}
                                  title="View Session"
                                >
                                  <Eye size={12} />
                                  View
                                </button>
                                <button
                                  className="px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 shadow-sm"
                                  onClick={(e) => { e.stopPropagation(); openTraceModal(sessionId); }}
                                  title="Diagnostic Trace"
                                >
                                  <GitBranch size={12} />
                                  Trace
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {showLoadMore && activeTab === 'all' && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-center">
                <button
                  onClick={loadMoreSessions}
                  disabled={loadingMore || loading || fetchInProgressRef.current}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md shadow-blue-500/25 disabled:opacity-50 text-sm"
                >
                  {loadingMore ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Loading more...</>
                  ) : (
                    <><RefreshCw size={12} /> Load More ({allSessions.length} loaded)</>
                  )}
                </button>
              </div>
            )}

            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500 flex justify-between items-center flex-wrap gap-2">
              <span>
                {filteredSessions.length === 0 ? 'No sessions available' :
                  `Showing ${filteredSessions.length} (${ongoingCount} live) of ${allSessions.length + ongoingSessions.length} loaded sessions`}
              </span>
              {showLoadMore && activeTab === 'all' && (
                <span className="text-blue-600">Load more sessions</span>
              )}
              {!showLoadMore && allSessions.length > 0 && activeTab === 'all' && (
                <span className="text-gray-400">All available sessions loaded</span>
              )}
              {activeTab === 'ongoing' && showLiveIndicator && (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span> Live updates
                </span>
              )}
            </div>
          </div>
        )}

        {activeMainTab === 'chargers' && (
          <div className="p-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <Zap size={64} className="text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">Chargers Management</h3>
              <p className="text-gray-500 mt-2">Click on the "Chargers" tab to view and manage all charging stations</p>
              <button onClick={() => navigate('/chargers')} className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2 mx-auto">
                <Zap size={18} /> Go to Chargers
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailModal && (
        <SessionDetailModal
          session={selectedSession}
          loading={loadingDetail}
          error={error}
          onClose={closeDetailModal}
        />
      )}
      {showTraceModal && (
        <TraceModal
          traceData={traceData}
          loading={loadingTrace}
          error={traceError}
          pagination={tracePagination}
          loadingMore={loadingMoreTrace}
          streamStatus={traceStreamStatus}
          streamError={traceStreamError}
          onClose={closeTraceModal}
          onLoadMore={loadMoreTrace}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulseUpdate {
          0% { background-color: rgba(34,197,94,0); }
          30% { background-color: rgba(34,197,94,0.25); }
          60% { background-color: rgba(34,197,94,0.15); }
          100% { background-color: rgba(34,197,94,0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
        .animate-pulse-update { animation: pulseUpdate 1.2s ease-in-out forwards; }
        tr.animate-pulse-update { transition: background-color 0.3s ease; }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #ffffff transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 999px;
          margin: 0 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ffffff;
        }
        .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Sessions;

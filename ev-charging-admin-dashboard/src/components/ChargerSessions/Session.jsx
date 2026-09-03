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
//   CheckCircle,
//   AlertCircle,
//   X,
//   ArrowLeft,
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
//   Info
// } from 'lucide-react';
// import Sidebar from '../Sidebar/Sidebar';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   SESSIONS_API: `${API_BASE_URL}/api/v1/cpo/charging-sessions`,
//   SESSION_DETAIL_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}`,
//   LIVE_SESSIONS_SSE: `${API_BASE_URL}/api/v1/cpo/operations/live-sessions`,
//   FLEET_API: `${API_BASE_URL}/api/v1/cpo/operations/fleet`,
//   USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
//   TRACE_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}/trace`,
//   TRACE_DETAIL_API: (traceId) => `${API_BASE_URL}/api/v1/cpo/charging-traces/${traceId}`,
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
//       return <CheckCircle className="w-3 h-3" />;
//     case 'START_PENDING':
//       return <Clock className="w-3 h-3" />;
//     case 'CHARGING':
//     case 'ACTIVE':
//       return <Activity className="w-3 h-3" />;
//     case 'STOP_PENDING':
//       return <AlertCircle className="w-3 h-3" />;
//     case 'STOPPED':
//     case 'FAILED':
//     case 'INACTIVE':
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
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
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

// // Source colors for trace
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
//   const displaySoc = isOngoing ? final : final;

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
//               <span className="text-white text-sm font-bold drop-shadow-md">
//                 {Math.round(displaySoc)}%
//               </span>
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
//                   {isLive && isOngoing && (
//                     <span className="ml-2 text-xs text-green-600">
//                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
//                       Live
//                     </span>
//                   )}
//                 </div>
//                 <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
//                   <p className="text-2xl font-bold text-emerald-600 mt-1">
//                     {formatCurrency(projectedAmount || session.total_amount)}
//                   </p>
//                   {isLive && isOngoing && (
//                     <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
//                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
//                       Live updating
//                     </p>
//                   )}
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">Usage</p>
//                   <p className="text-2xl font-bold text-purple-600 mt-1">
//                     {energy > 0 ? energy.toFixed(2) : (session.total_kwh || 0)} kWh
//                   </p>
//                   {isLive && soc && <p className="text-xs text-gray-500 mt-1">SOC: {soc}%</p>}
//                   {isLive && isOngoing && (
//                     <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
//                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
//                       Live updating
//                     </p>
//                   )}
//                 </div>
//                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
//                   <p className="text-2xl font-bold text-amber-600 mt-1">
//                     {durationFormatted}
//                   </p>
//                   {isOngoing && (
//                     <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
//                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
//                       Live (updating)
//                     </p>
//                   )}
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
//                       <span className="ml-2 font-medium text-gray-800">
//                         {formatPriceWithUnit(pricePerUnit, unit)}
//                       </span>
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
//                       <span className="ml-2 font-medium text-gray-800">
//                         {formatRequestedLimit(requestedLimit, startCriteria)}
//                       </span>
//                     </div>
//                   )}
//                   {sgst !== null && sgst !== undefined && (
//                     <div>
//                       <span className="text-gray-500">SGST</span>
//                       <span className="ml-2 font-medium text-gray-800">{sgst}%</span>
//                     </div>
//                   )}
//                   {cgst !== null && cgst !== undefined && (
//                     <div>
//                       <span className="text-gray-500">CGST</span>
//                       <span className="ml-2 font-medium text-gray-800">{cgst}%</span>
//                     </div>
//                   )}
//                   {igst !== null && igst !== undefined && (
//                     <div>
//                       <span className="text-gray-500">IGST</span>
//                       <span className="ml-2 font-medium text-gray-800">{igst}%</span>
//                     </div>
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
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500">Connector ID</span>
//                       <span className="font-mono text-gray-900">{session.connector?.id || session.connector_id || 'N/A'}</span>
//                     </div>
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
//                     {session.connector_number && (
//                       <div><span className="text-gray-500">Connector:</span> <span className="ml-2 font-medium text-gray-700">#{session.connector_number}</span></div>
//                     )}
//                   </div>
//                   {session.started_at && (
//                     <p className="text-xs text-gray-400 mt-2">Started at: {formatDate(session.started_at)}</p>
//                   )}
//                 </div>
//               )}

//               {session.stop_reason && session.stop_reason !== 'N/A' && !isOngoing && (
//                 <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200 mb-4">
//                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stop Reason</p>
//                   <p className="text-sm text-gray-700">{session.stop_reason}</p>
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
//                   <X size={18} />
//                   Close
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
// // TraceModal (same as before)
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
//       ) {
//         break;
//       }
//       group.push(next);
//       j += 1;
//     }
//     if (group.length === 1) {
//       rows.push({ kind: 'event', key: event.id, event });
//     } else {
//       const groupKey = `meter:${group[0].id}:${group[group.length - 1].id}`;
//       if (expandedMeterGroups.has(groupKey)) {
//         group.forEach((member) => {
//           rows.push({ kind: 'event', key: member.id, event: member, meterGroupKey: groupKey });
//         });
//       } else {
//         rows.push({ kind: 'meter-group', key: groupKey, event: group[0], events: group, groupKey });
//       }
//     }
//     i = j;
//   }
//   return rows;
// };

// const TraceModal = ({ traceData, loading, error, pagination, loadingMore, onClose, onLoadMore }) => {
//   const [expandedMeterGroups, setExpandedMeterGroups] = useState(() => new Set());
//   const events = traceData?.events || [];

//   const sortedEvents = useMemo(() => {
//     const byId = new Map();
//     events.forEach((event) => {
//       if (!event?.id) return;
//       byId.set(event.id, event);
//     });
//     return [...byId.values()].sort(compareTraceEventsChronological);
//   }, [events]);

//   const displayRows = useMemo(
//     () => buildTraceDisplayRows(sortedEvents, expandedMeterGroups),
//     [sortedEvents, expandedMeterGroups]
//   );

//   const phaseSegments = useMemo(() => {
//     const segments = [];
//     displayRows.forEach((row) => {
//       const phase = row.event?.phase || 'UNKNOWN';
//       const last = segments[segments.length - 1];
//       if (last && last.phase === phase) {
//         last.rows.push(row);
//       } else {
//         segments.push({ phase, rows: [row] });
//       }
//     });
//     return segments;
//   }, [displayRows]);

//   if (!traceData && !loading) return null;

//   const toggleMeterGroup = (groupKey) => {
//     setExpandedMeterGroups((current) => {
//       const next = new Set(current);
//       if (next.has(groupKey)) next.delete(groupKey);
//       else next.add(groupKey);
//       return next;
//     });
//   };

//   const sourceStatusForLane = (lane) => {
//     if (lane === 'CMS') return traceData?.cms_source || 'UNKNOWN';
//     if (lane === 'HAL') return traceData?.hal_source || 'UNKNOWN';
//     return null;
//   };

//   const renderSourceBadge = (lane) => {
//     const status = sourceStatusForLane(lane);
//     if (!status) return null;
//     const className =
//       status === 'AVAILABLE'
//         ? 'bg-emerald-100 text-emerald-700'
//         : status === 'NOT_REQUESTED'
//           ? 'bg-gray-100 text-gray-600'
//           : status === 'UNAVAILABLE'
//             ? 'bg-amber-100 text-amber-700'
//             : 'bg-gray-100 text-gray-600';
//     return (
//       <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${className}`}>
//         {status}
//       </span>
//     );
//   };

//   const renderEventDetails = (event) => (
//     <details className="mt-2 text-xs">
//       <summary className="cursor-pointer text-gray-500 hover:text-gray-800 select-none">Details</summary>
//       <div className="mt-2 rounded-lg bg-white/80 border border-gray-200 p-2 space-y-1 text-gray-600">
//         <div><span className="font-medium">Direction:</span> {event?.source || 'UNKNOWN'} → {event?.target || 'UNKNOWN'}</div>
//         <div><span className="font-medium">Event ID:</span> <span className="font-mono break-all">{event?.id || 'N/A'}</span></div>
//         <div><span className="font-medium">Trace ID:</span> <span className="font-mono break-all">{event?.trace_id || traceData?.trace_id || 'N/A'}</span></div>
//         <div><span className="font-medium">Occurred:</span> <time dateTime={event?.occurred_at || undefined}>{formatTraceDate(event?.occurred_at)}</time></div>
//         <div><span className="font-medium">Recorded:</span> <time dateTime={event?.recorded_at || undefined}>{formatTraceDate(event?.recorded_at)}</time></div>
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
//     const laneAreaStartPct = sourceKnown ? ((sourceIndex + 0.5) / SOURCE_ORDER.length) * 100 : 0;
//     const laneAreaEndPct = targetKnown ? ((targetIndex + 0.5) / SOURCE_ORDER.length) * 100 : 0;
//     const lineLeft = Math.min(laneAreaStartPct, laneAreaEndPct);
//     const lineWidth = Math.abs(laneAreaEndPct - laneAreaStartPct);

//     return (
//       <div key={row.key} className="grid grid-cols-[150px_repeat(4,minmax(180px,1fr))] relative min-h-[116px] border-t border-gray-100">
//         <div className="px-3 py-4 bg-white/70 border-r border-gray-200 text-xs text-gray-500">
//           <time dateTime={event.occurred_at || undefined} className="font-medium text-gray-700">
//             {formatTraceDate(event.occurred_at)}
//           </time>
//           {occurredEnd && occurredEnd !== event.occurred_at && (
//             <div className="mt-1">→ <time dateTime={occurredEnd}>{formatTraceDate(occurredEnd)}</time></div>
//           )}
//         </div>

//         {SOURCE_ORDER.map((lane) => {
//           const laneColor = getSourceColor(lane);
//           const isSource = source === lane;
//           const isTarget = target === lane;
//           return (
//             <div key={`${row.key}-${lane}`} className="relative px-3 py-3 border-r border-gray-100">
//               <div aria-hidden="true" className={`absolute top-0 bottom-0 left-1/2 w-px ${laneColor.bg} opacity-20`} />
//               {(isSource || (source === target && isTarget)) && (
//                 <div className={`relative z-20 mt-8 rounded-xl border ${sourceColor.border} ${sourceColor.light} p-3 shadow-sm`}>
//                   <div className={`text-[10px] font-bold uppercase tracking-wide ${sourceColor.text}`}>
//                     {source} → {target}
//                   </div>
//                   <div className="mt-1 text-sm font-semibold text-gray-800">{summary}</div>
//                   <div className="mt-2 flex flex-wrap gap-1.5">
//                     <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">
//                       {event.phase || 'UNKNOWN'}
//                     </span>
//                     <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">
//                       {event.protocol || 'UNKNOWN'}
//                     </span>
//                     <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">
//                       {event.category || 'UNKNOWN'}
//                     </span>
//                   </div>
//                   {(event.state_before || event.state_after) && (
//                     <div className="mt-2 text-xs text-gray-600">
//                       {event.state_before || '—'} → {event.state_after || '—'}
//                     </div>
//                   )}
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
//               {isTarget && source !== target && (
//                 <span aria-hidden="true" className={`absolute z-20 top-[23px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${laneColor.bg} ring-4 ring-white`} />
//               )}
//             </div>
//           );
//         })}

//         {sourceKnown && targetKnown && source !== target && (
//           <div className="absolute left-[150px] right-0 top-0 bottom-0 pointer-events-none z-10" aria-hidden="true">
//             <div className="absolute top-[28px] h-[2px] bg-indigo-300" style={{ left: `${lineLeft}%`, width: `${Math.max(lineWidth, 0.5)}%` }} />
//             <span className="absolute top-[17px] text-indigo-500 text-base font-bold" style={{ left: `calc(${laneAreaEndPct}% - 5px)` }}>
//               {targetIndex > sourceIndex ? '▶' : '◀'}
//             </span>
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
//         ) : (
//           renderEventDetails(event)
//         )}
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

//             <div className="mb-6 flex flex-wrap gap-2">
//               <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${traceData?.cms_source === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
//                 CMS {traceData?.cms_source || 'UNKNOWN'}
//               </span>
//               <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${traceData?.hal_source === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : traceData?.hal_source === 'NOT_REQUESTED' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
//                 HAL {traceData?.hal_source || 'UNKNOWN'}
//               </span>
//             </div>

//             {traceData?.hal_source === 'UNAVAILABLE' && (
//               <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-700 text-sm">
//                 <Info size={16} className="flex-shrink-0 mt-0.5" />
//                 <div>
//                   <div className="font-medium">Partial diagnostic evidence</div>
//                   <div className="mt-0.5">HAL diagnostic evidence is temporarily unavailable. CMS evidence is still valid and is shown below. This does not mean the charging session failed.</div>
//                 </div>
//               </div>
//             )}

//             {traceData?.hal_source === 'NOT_REQUESTED' && (
//               <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-2 text-gray-600 text-sm">
//                 <Info size={16} className="flex-shrink-0 mt-0.5" />
//                 HAL diagnostic evidence was not requested for this response. Available CMS evidence is shown normally.
//               </div>
//             )}

//             {loading && !traceData && (
//               <div className="flex items-center justify-center py-20">
//                 <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
//                 <span className="ml-3 text-gray-500">Loading trace events...</span>
//               </div>
//             )}

//             {error && (
//               <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-2">
//                 <AlertCircle size={20} />
//                 {error}
//               </div>
//             )}

//             {!loading && traceData && sortedEvents.length === 0 && (
//               <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
//                 <p className="text-gray-600">No diagnostic events are available for this trace.</p>
//                 <p className="text-xs text-gray-400 mt-1">An empty trace page is not a charging-session failure.</p>
//               </div>
//             )}

//             {!loading && traceData && sortedEvents.length > 0 && (
//               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
//                 <div className="hidden md:block overflow-x-auto scrollbar-hide">
//                   <div className="min-w-[980px]">
//                     <div className="grid grid-cols-[150px_repeat(4,minmax(180px,1fr))] bg-gray-50 border-b border-gray-200">
//                       <div className="px-3 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200">Time</div>
//                       {SOURCE_ORDER.map((lane) => {
//                         const color = getSourceColor(lane);
//                         return (
//                           <div key={lane} className="px-3 py-3 text-center border-r border-gray-100">
//                             <span className={`inline-flex items-center px-2.5 py-1 rounded-full border ${color.border} ${color.light} ${color.text} text-xs font-bold`}>
//                               {lane}
//                               {renderSourceBadge(lane)}
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
//                   <span>Each arrow is one backend-provided source → target event.</span>
//                   <span>•</span>
//                   <span>Correlation IDs are details only, never frontend graph authority.</span>
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

//   // Pagination state using before and before_id
//   const [pagination, setPagination] = useState({
//     limit: 20,
//     has_more: false,
//     before: null,
//     before_id: null,
//   });
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasLoaded, setHasLoaded] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [isLoadingMoreComplete, setIsLoadingMoreComplete] = useState(false);

//   const [statusFilter, setStatusFilter] = useState('All');

//   // Detail modal
//   const [showDetailModal, setShowDetailModal] = useState(() => sessionStorage.getItem('sessionModalOpen') === 'true');
//   const [selectedSession, setSelectedSession] = useState(() => {
//     const saved = sessionStorage.getItem('selectedSession');
//     return saved ? JSON.parse(saved) : null;
//   });
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [selectedSessionId, setSelectedSessionId] = useState(() => sessionStorage.getItem('selectedSessionId') || null);

//   // Trace modal
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

//   const [isCompact, setIsCompact] = useState(true);

//   // SSE state
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

//   // Save modal state
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
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [showDetailModal, showTraceModal]);

//   // Initial fetch
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
//     };
//   }, [isAuthenticated, navigate]);

//   // Live data tick
//   useEffect(() => {
//     if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
//     liveDurationIntervalRef.current = setInterval(() => {
//       setLiveSessionsData(prev => ({ ...prev }));
//     }, 1000);
//     return () => { if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current); };
//   }, []);

//   // Update live sessions map
//   useEffect(() => {
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
    
//     setAllSessions(prev => {
//       const updated = [...prev];
//       liveSessionsData.sessions.forEach(liveSession => {
//         const lId = liveSession.id || liveSession.session_id;
//         const index = updated.findIndex(s => {
//           const sId = s.id || s.session_id;
//           return String(sId) === String(lId);
//         });
//         if (index >= 0) {
//           updated[index] = { ...updated[index], ...liveSession, is_live: true };
//         } else if (isOngoingStatus(liveSession.status) || liveSession.status === 'ACTIVE') {
//           updated.push({ ...liveSession, is_live: true });
//         }
//       });
//       return updated;
//     });
//   }, [liveSessionsData, showDetailModal, selectedSessionId]);

//   // Modal live data update
//   useEffect(() => {
//     if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
//     if (showDetailModal && selectedSessionId) {
//       modalScrollPositionRef.current = window.scrollY;
//       modalLiveDataIntervalRef.current = setInterval(() => {
//         if (selectedSessionId && liveSessionsMapRef.current[selectedSessionId]) {
//           const liveData = liveSessionsMapRef.current[selectedSessionId];
//           setSelectedSession(prev => {
//             if (!prev || (!isOngoingStatus(prev.status) && prev.status !== 'ACTIVE')) return prev;
//             return {
//               ...prev,
//               ...liveData,
//               is_live: true,
//               consumed_wh: liveData.consumed_wh || prev.consumed_wh,
//               total_kwh: liveData.consumed_wh ? parseFloat(liveData.consumed_wh) / 1000 : prev.total_kwh,
//               soc_percent: liveData.soc_percent || prev.soc_percent,
//               duration_seconds: liveData.duration_seconds ?? prev.duration_seconds,
//               status: liveData.status || prev.status,
//               charger_name: liveData.charger_name || prev.charger_name,
//               charger_id: liveData.charger_id || prev.charger_id,
//               hub_name: liveData.hub_name || prev.hub_name,
//               connector_number: liveData.connector_number || prev.connector_number,
//               customer_name: liveData.customer_name || prev.customer_name,
//               started_at: liveData.started_at || prev.started_at,
//               ocpp_transaction_id: liveData.ocpp_transaction_id || prev.ocpp_transaction_id,
//               transaction_id: liveData.ocpp_transaction_id || liveData.transaction_id || prev.transaction_id,
//               projected_amount: liveData.projected_amount || prev.projected_amount,
//               currency: liveData.currency || prev.currency
//             };
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

//   // ========== SSE ==========
//   const startLiveSessionsSSE = () => {
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
//             console.error('❌ SSE Stream 401 Unauthorized');
//             setIsStreaming(false);
//             setShowLiveIndicator(false);
//             refreshToken().then(newToken => {
//               if (newToken && isMountedRef.current) setTimeout(startLiveSessionsSSE, 10000);
//             });
//             return;
//           }
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         console.log('📡 SSE Live Sessions Stream connected');
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
//             if (error.name === 'AbortError') console.log('📡 SSE Stream aborted');
//             else {
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
//         if (error.name !== 'AbortError') {
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

//   // ========== Fetch Sessions with before/before_id pagination ==========
//   const fetchSessions = useCallback(async (before = null, beforeId = null, isLoadMore = false) => {
//     if (fetchInProgressRef.current) return;
//     if (isLoadMore && loadingMore) return;
    
//     fetchInProgressRef.current = true;
//     if (!isLoadMore) setLoading(true);
//     else setLoadingMore(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('token');
//       let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
      
//       // Use before and before_id for pagination
//       if (before) {
//         url += `&before=${encodeURIComponent(before)}`;
//       }
//       if (beforeId) {
//         url += `&before_id=${encodeURIComponent(beforeId)}`;
//       }
//       if (statusFilter !== 'All') {
//         url += `&status=${statusFilter}`;
//       }
      
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
      
//       if (!isMountedRef.current) { fetchInProgressRef.current = false; return; }
      
//       if (response.ok) {
//         const data = await response.json();
//         let sessionsArray = data.sessions || data.data || [];
//         if (!Array.isArray(sessionsArray)) sessionsArray = [];
        
//         const hasMore = data.has_more || false;
//         const nextBefore = data.next_before || null;
//         const nextBeforeId = data.next_before_id || null;
        
//         console.log('📊 API Response - HasMore:', hasMore, 'NextBefore:', nextBefore);
        
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
        
//         console.log('📊 Transformed sessions:', transformed.length);
        
//         // Update sessions list
//         if (isLoadMore) {
//           setAllSessions(prev => {
//             // Avoid duplicates
//             const existingIds = new Set(prev.map(s => s.id || s.session_id));
//             const newSessions = transformed.filter(s => {
//               const id = s.id || s.session_id;
//               return !existingIds.has(id);
//             });
//             console.log('Adding new sessions:', newSessions.length);
//             return [...prev, ...newSessions];
//           });
//         } else {
//           setAllSessions(transformed);
//         }
        
//         // Update pagination
//         setPagination({
//           limit: pagination.limit,
//           has_more: hasMore,
//           before: nextBefore,
//           before_id: nextBeforeId,
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
//         setPagination({ 
//           limit: 20, 
//           has_more: false, 
//           before: null, 
//           before_id: null,
//         });
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('❌ Failed to fetch sessions:', response.status, errorData);
//         if (!isLoadMore && isMountedRef.current) { 
//           setAllSessions([]); 
//           setOngoingSessions([]);
//         }
//         setPagination({ 
//           limit: 20, 
//           has_more: false, 
//           before: null, 
//           before_id: null,
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error fetching sessions:', error);
//       if (!isLoadMore && isMountedRef.current) { 
//         setAllSessions([]); 
//         setOngoingSessions([]);
//       }
//       setPagination({ 
//         limit: 20, 
//         has_more: false, 
//         before: null, 
//         before_id: null,
//       });
//     } finally {
//       fetchInProgressRef.current = false;
//       if (isMountedRef.current) { 
//         setLoading(false); 
//         setLoadingMore(false); 
//       }
//     }
//   }, [pagination.limit, refreshToken, statusFilter]);

//   // ========== Fetch Detail ==========
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

//   // ========== Fetch Trace ==========
//   const fetchTrace = useCallback(async (sessionId, beforeOccurredAt = null, beforeEventId = null, isLoadMore = false) => {
//     if (!sessionId) return;
//     if (isLoadMore && loadingMoreTrace) return;
//     if (!isLoadMore) {
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
//             ...data,
//             events: [...(prev?.events || []), ...(data.events || [])]
//           }));
//         } else {
//           setTraceData(data);
//         }
//         setTracePagination({
//           has_more: !!data.next_occurred_at && !!data.next_event_id,
//           next_occurred_at: data.next_occurred_at || null,
//           next_event_id: data.next_event_id || null
//         });
//       } else if (response.status === 401) {
//         setTraceError('Session expired. Please refresh.');
//         const newToken = await refreshToken();
//         if (newToken && isMountedRef.current) {
//           fetchTrace(sessionId, beforeOccurredAt, beforeEventId, isLoadMore);
//           return;
//         }
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         setTraceError(errorData.message || 'Failed to fetch trace');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching trace:', error);
//       setTraceError('An error occurred while fetching diagnostic trace');
//     } finally {
//       if (isMountedRef.current) {
//         setLoadingTrace(false);
//         setLoadingMoreTrace(false);
//       }
//     }
//   }, [refreshToken]);

//   const loadMoreTrace = () => {
//     if (tracePagination.has_more && !loadingMoreTrace && traceData) {
//       fetchTrace(traceData.session_id, tracePagination.next_occurred_at, tracePagination.next_event_id, true);
//     }
//   };

//   const openTraceModal = (sessionId) => {
//     if (sessionId) {
//       setShowTraceModal(true);
//       fetchTrace(sessionId);
//     }
//   };

//   const closeTraceModal = () => {
//     setShowTraceModal(false);
//     setTraceData(null);
//     setTraceError('');
//     setTracePagination({ has_more: false, next_occurred_at: null, next_event_id: null });
//   };

//   const loadMoreSessions = () => {
//     // Only load more if there are more sessions and not already loading
//     if (pagination.has_more && pagination.before && pagination.before_id && !loadingMore && !loading && !fetchInProgressRef.current) {
//       console.log('Loading more sessions with before:', pagination.before, 'before_id:', pagination.before_id);
//       fetchSessions(pagination.before, pagination.before_id, true);
//     } else {
//       console.log('Cannot load more - has_more:', pagination.has_more, 'before:', pagination.before, 'loadingMore:', loadingMore);
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

//   const handleBack = () => {
//     if (window.history.length > 1) {
//       navigate(-1);
//     } else {
//       navigate('/charger-session');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       stopLiveSessionsSSE();
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
//       setPagination({
//         limit: 20,
//         has_more: false,
//         before: null,
//         before_id: null,
//       });
//       fetchSessions();
//     }
//   };

//   // Get current sessions
//   const currentSessions = useMemo(() => {
//     if (activeTab === 'all') {
//       const merged = [...allSessions];
//       liveSessionsData.sessions.forEach(liveSession => {
//         const sessionKey = liveSession.id || liveSession.session_id;
//         const exists = merged.some(s => {
//           const sKey = s.id || s.session_id;
//           return String(sKey) === String(sessionKey);
//         });
//         if (!exists) merged.push({ ...liveSession, is_live: true });
//         else {
//           const index = merged.findIndex(s => {
//             const sKey = s.id || s.session_id;
//             return String(sKey) === String(sessionKey);
//           });
//           if (index !== -1) merged[index] = { ...merged[index], ...liveSession, is_live: true };
//         }
//       });
//       return merged;
//     } else {
//       return ongoingSessions;
//     }
//   }, [activeTab, allSessions, ongoingSessions, liveSessionsData.sessions]);

//   const filteredSessions = useMemo(() => {
//     if (!searchQuery) return currentSessions;
//     const query = searchQuery.toLowerCase();
//     return currentSessions.filter(session => {
//       const idStr = String(session.id || session.session_id || '');
//       const transactionIdStr = String(session.transaction_id || '');
//       const chargerNameStr = String(session.charger_name || '');
//       const chargerIdStr = String(session.charger_id || '');
//       const hubNameStr = String(session.hub_name || '');
//       const customerNameStr = String(session.customer_name || '');
//       return (
//         idStr.toLowerCase().includes(query) ||
//         transactionIdStr.toLowerCase().includes(query) ||
//         chargerNameStr.toLowerCase().includes(query) ||
//         chargerIdStr.toLowerCase().includes(query) ||
//         hubNameStr.toLowerCase().includes(query) ||
//         customerNameStr.toLowerCase().includes(query)
//       );
//     });
//   }, [currentSessions, searchQuery]);

//   const ongoingCount = useMemo(() => {
//     return currentSessions.filter(s => isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING').length;
//   }, [currentSessions]);

//   // Show Load More button only when:
//   // 1. has_more is true from API
//   // 2. before and before_id are available for next page
//   // 3. not already loading more
//   const showLoadMore = pagination.has_more && pagination.before && pagination.before_id && !loadingMore;

//   // ========== Settings Menu ==========
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
//               <option value="ACTIVE">Active</option>
//             </select>
//           </div>
//           <div className="flex gap-3 pt-2">
//             <button
//               onClick={() => { setShowFilterPopup(false); fetchSessions(); }}
//               className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//             >
//               Apply Filters
//             </button>
//             <button
//               onClick={() => { setStatusFilter('All'); setSearchQuery(''); fetchSessions(); }}
//               className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
//             >
//               Clear All
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

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
//         <header className="bg-white border-b-2 border-gray-200 px-6 py-5 sticky top-0 z-30 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
            
//               <div className="flex items-center gap-1 text-sm text-gray-500">
//                 <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
//                 <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium">/ Dashboard</button>
//                 <span className="text-blue-600">/</span>
//                 <span className="text-blue-600 font-medium">Sessions</span>
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
//                 <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
//                   <Plus size={18} />
//                 </button>
//                 {showAddMenu && <AddMenu />}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main Tabs */}
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
//             <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">{allSessions.length}</span>
//           </button>
//         </div>

//         {/* Sessions Content */}
//         {activeMainTab === 'sessions' && (
//           <div className="p-6">
//             {/* Stats */}
//             <div className="mb-6">
//               <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition group inline-flex items-center gap-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Database className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Loaded Sessions</p>
//                   <p className="text-2xl font-bold text-gray-900">{allSessions.length}</p>
//                   {pagination.has_more && (
//                     <p className="text-xs text-blue-500">More sessions available — load more below</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Sub Tabs */}
//             <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
//               <button
//                 onClick={() => handleTabChange('all')}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Grid size={16} /> All Sessions
//                   <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{allSessions.length}</span>
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

//             {/* Search & Filters */}
//             <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
//               <div className="flex items-center gap-2">
//                 {statusFilter !== 'All' && (
//                   <button
//                     onClick={() => { setStatusFilter('All'); setSearchQuery(''); fetchSessions(); }}
//                     className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center gap-1"
//                   >
//                     <X size={12} /> Clear Filters
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
//                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium"
//                   title={isCompact ? "Switch to Expanded view" : "Switch to Compact view"}
//                 >
//                   <Sliders size={14} />
//                   {isCompact ? 'Compact' : 'Expanded'}
//                 </button>
//                 <button
//                   onClick={handleRefresh}
//                   disabled={fetchInProgressRef.current}
//                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium disabled:opacity-50"
//                 >
//                   <RefreshCw size={14} className={fetchInProgressRef.current ? 'animate-spin' : ''} />
//                   Refresh
//                 </button>
//                 {showFilterPopup && <FilterPopup />}
//               </div>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
//               {!isCompact && (
//                 <>
//                   <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50/80 to-transparent pointer-events-none z-10" />
//                   <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs bg-white px-2 py-1 rounded shadow border border-gray-200 pointer-events-none opacity-80 z-10">
//                     → Scroll
//                   </div>
//                 </>
//               )}

//               <div className={`overflow-x-auto ${isCompact ? '' : 'custom-scrollbar'} scrollbar-hide`}>
//                 <table className={`w-full ${isCompact ? 'table-auto text-xs' : 'text-sm'}`} style={isCompact ? {} : { minWidth: '1800px' }}>
//                   <thead className="sticky top-0 z-10">
//                     <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-8 whitespace-nowrap`}>SI</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-24 whitespace-nowrap`}>Session ID</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Transaction ID</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-24 whitespace-nowrap`}>Customer</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 whitespace-nowrap`}>Charger</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Hub</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-10 whitespace-nowrap`}>Connector</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 whitespace-nowrap`}>Start Time</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 whitespace-nowrap`}>End Time</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-14 whitespace-nowrap`}>Duration</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-24 whitespace-nowrap`}>Usage</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Start Criteria</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-14 whitespace-nowrap`}>Req. Limit</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Amount</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Status</th>
//                       <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] z-20 whitespace-nowrap`}>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading && !hasLoaded && isInitialLoad ? (
//                       <tr>
//                         <td colSpan="16" className={`${isCompact ? 'px-2 py-6' : 'px-4 py-12'} text-center`}>
//                           <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-1" />
//                           <p className="text-gray-500 text-xs">Loading sessions...</p>
//                         </td>
//                       </tr>
//                     ) : error ? (
//                       <tr>
//                         <td colSpan="16" className={`${isCompact ? 'px-2 py-6' : 'px-4 py-12'} text-center`}>
//                           <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
//                           <p className="text-gray-600 text-xs">{error}</p>
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
//                         <td colSpan="16" className={`${isCompact ? 'px-2 py-6' : 'px-4 py-12'} text-center`}>
//                           <Database size={isCompact ? 28 : 40} className="text-gray-300 mx-auto mb-1" />
//                           <p className="text-gray-500 font-medium text-xs">No Sessions Found</p>
//                           <p className="text-xs text-gray-400 mt-0.5">
//                             {activeTab === 'all' ? 'No charging sessions available.' : 'No ongoing sessions found.'}
//                           </p>
//                           {showLiveIndicator && activeTab === 'ongoing' && (
//                             <p className="text-xs text-green-600 mt-1">
//                               <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
//                               Waiting for live sessions...
//                             </p>
//                           )}
//                           <button
//                             onClick={handleRefresh}
//                             className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition shadow flex items-center gap-1 mx-auto"
//                           >
//                             <RefreshCw size={12} /> Refresh
//                           </button>
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
//                         let displayCurrency = session.currency || 'INR';

//                         if (isLive) {
//                           const energy = getEnergyKwh(session);
//                           displayEnergy = energy > 0 ? energy.toFixed(2) : (session.total_kwh || '0');
//                           displaySoc = getSocPercent(session) || null;
//                           const projectedAmount = getProjectedAmount(session);
//                           if (projectedAmount > 0) displayAmount = projectedAmount;
//                           displayCurrency = getCurrency(session);
//                         }

//                         const connectorNumber = session.connector?.number || session.connector_number || 'N/A';
//                         const liveMapEntry = liveSessionsMapRef.current[sessionId];
//                         const transactionId = liveMapEntry?.ocpp_transaction_id || session.ocpp_transaction_id || session.transaction_id || 'N/A';
//                         const chargerId = session.charger?.charger_id || session.charger_id || session.charger?.id || 'N/A';
//                         const chargerName = session.charger?.name || session.charger_name || 'N/A';

//                         const startCriteria = session.start_criteria;
//                         const requestedLimit = session.requested_limit_value;
//                         const limitDisplay = formatRequestedLimit(requestedLimit, startCriteria);

//                         const rowBg = isLive && isOngoing ? 'bg-green-50/30' : 'bg-white';

//                         return (
//                           <tr
//                             key={sessionId || session.transaction_id || index}
//                             className={`border-b border-gray-100 hover:bg-gray-50/70 transition cursor-pointer ${rowBg} ${
//                               isUpdated && isLive ? 'animate-pulse-update' : ''
//                             }`}
//                             onClick={() => handleSessionClick(sessionId)}
//                           >
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-500 text-center text-xs`}>{index + 1}</td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-mono text-gray-600 text-xs truncate max-w-24`} title={sessionId}>{truncateId(sessionId)}</td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-mono text-gray-600 text-xs truncate max-w-20`} title={transactionId}>{truncateId(transactionId)}</td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs truncate max-w-24`} title={session.customer?.name || session.customer_name}>
//                               {session.customer?.name || session.customer_name || 'N/A'}
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs`}>
//                               <div className="flex flex-col">
//                                 <span className="font-medium text-gray-800 truncate max-w-24" title={chargerName}>{chargerName}</span>
//                                 <span className="text-[10px] text-gray-400 truncate max-w-24" title={chargerId}>ID: {truncateId(chargerId)}</span>
//                               </div>
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-600 text-xs truncate max-w-20`} title={session.charger?.hub_name || session.hub_name}>
//                               {session.charger?.hub_name || session.hub_name || 'N/A'}
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-mono text-gray-500 text-center text-xs`}>#{connectorNumber}</td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-600 text-xs whitespace-nowrap`}>{formatDate(session.start_time || session.started_at)}</td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-600 text-xs whitespace-nowrap`}>
//                               {isOngoing ? 'Ongoing' : (session.end_time ? formatDate(session.end_time) : 'N/A')}
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-xs`}>
//                               <div className="flex items-center gap-0.5">
//                                 <span className="font-medium text-gray-700">{durationDisplay}</span>
//                                 {isLive && isOngoing && (
//                                   <span className="text-[10px] text-green-600 flex items-center gap-0.5">
//                                     <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
//                                   </span>
//                                 )}
//                               </div>
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-xs whitespace-nowrap`}>
//                               <div className="flex items-center gap-0.5">
//                                 <span className="font-medium text-gray-700">{displayEnergy} kWh</span>
//                                 {isLive && displaySoc && (
//                                   <span className="ml-0.5 text-[10px] text-purple-600">· SOC: {displaySoc}%</span>
//                                 )}
//                                 {isLive && isOngoing && (
//                                   <span className="ml-0.5 text-[10px] text-green-600 flex items-center gap-0.5">
//                                     <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>Live
//                                   </span>
//                                 )}
//                               </div>
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs whitespace-nowrap`}>{startCriteria || '—'}</td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs`}>{limitDisplay}</td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-medium text-gray-700 text-xs whitespace-nowrap`}>
//                               {formatCurrency(displayAmount)}
//                               {isLive && isOngoing && (
//                                 <span className="ml-0.5 text-[10px] text-green-600 flex items-center gap-0.5">
//                                   <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>Live
//                                 </span>
//                               )}
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-xs`}>
//                               <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(session.status)}`}>
//                                 {getStatusIcon(session.status)}
//                                 {getStatusDisplayName(session.status)}
//                               </span>
//                               {isLive && isOngoing && (
//                                 <span className="ml-0.5 text-[10px] text-green-600">
//                                   <span className="w-1 h-1 bg-green-500 rounded-full inline-block mr-0.5 animate-pulse"></span>
//                                 </span>
//                               )}
//                             </td>
//                             <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${rowBg}`}>
//                               <div className="flex items-center gap-0.5">
//                                 <button
//                                   className={`${isCompact ? 'p-0.5' : 'p-1.5'} text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition flex items-center gap-0.5 text-[10px] font-medium`}
//                                   onClick={(e) => { e.stopPropagation(); handleSessionClick(sessionId); }}
//                                 >
//                                   <Eye size={isCompact ? 12 : 14} />
//                                   <span className={isCompact ? 'hidden sm:inline' : ''}>View</span>
//                                 </button>
//                                 <button
//                                   className={`${isCompact ? 'p-0.5' : 'p-1.5'} text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition flex items-center gap-0.5 text-[10px] font-medium`}
//                                   onClick={(e) => { e.stopPropagation(); openTraceModal(sessionId); }}
//                                   title="Diagnostic Trace"
//                                 >
//                                   <GitBranch size={isCompact ? 12 : 14} />
//                                   <span className={isCompact ? 'hidden sm:inline' : ''}>Trace</span>
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

//             {/* Load More - Only show when there are more sessions to load */}
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

//             {/* Footer */}
//             <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 flex justify-between items-center">
//               <span>
//                 {filteredSessions.length === 0 ? 'No sessions available' : 
//                   `Showing ${filteredSessions.length} of ${allSessions.length} loaded sessions`}
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

//         {/* Chargers Tab */}
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

//       {/* Modals */}
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

//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }

//         .custom-scrollbar {
//           overflow-x: auto;
//           overflow-y: visible;
//           scrollbar-width: thin;
//           scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar {
//           height: 6px;
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(156, 163, 175, 0.5);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(107, 114, 128, 0.8);
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
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
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
  BatteryFull
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
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  TRACE_API: (sessionId) => `${API_BASE_URL}/api/v1/cpo/charging-sessions/${sessionId}/trace`,
  TRACE_DETAIL_API: (traceId) => `${API_BASE_URL}/api/v1/cpo/charging-traces/${traceId}`,
  TRACE_STREAM_API: (traceId) => `${API_BASE_URL}/api/v1/cpo/charging-traces/${traceId}/stream`,
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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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

// Source colors for trace
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
  const displaySoc = isOngoing ? final : final;

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
              <span className="text-white text-sm font-bold drop-shadow-md">
                {Math.round(displaySoc)}%
              </span>
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
                    {formatCurrency(projectedAmount || session.total_amount)}
                  </p>
                  {isLive && isOngoing && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Live updating
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Usage</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {energy > 0 ? energy.toFixed(2) : (session.total_kwh || 0)} kWh
                  </p>
                  {isLive && soc && <p className="text-xs text-gray-500 mt-1">SOC: {soc}%</p>}
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

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200 mb-6">
                <p className="text-xs font-medium text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <IndianRupee size={14} className="text-indigo-600" />
                  Pricing & GST
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {pricePerUnit !== null && pricePerUnit !== undefined && (
                    <div>
                      <span className="text-gray-500">Tariff</span>
                      <span className="ml-2 font-medium text-gray-800">
                        {formatPriceWithUnit(pricePerUnit, unit)}
                      </span>
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
                      <span className="ml-2 font-medium text-gray-800">
                        {formatRequestedLimit(requestedLimit, startCriteria)}
                      </span>
                    </div>
                  )}
                  {sgst !== null && sgst !== undefined && (
                    <div>
                      <span className="text-gray-500">SGST</span>
                      <span className="ml-2 font-medium text-gray-800">{sgst}%</span>
                    </div>
                  )}
                  {cgst !== null && cgst !== undefined && (
                    <div>
                      <span className="text-gray-500">CGST</span>
                      <span className="ml-2 font-medium text-gray-800">{cgst}%</span>
                    </div>
                  )}
                  {igst !== null && igst !== undefined && (
                    <div>
                      <span className="text-gray-500">IGST</span>
                      <span className="ml-2 font-medium text-gray-800">{igst}%</span>
                    </div>
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
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Connector ID</span>
                      <span className="font-mono text-gray-900">{session.connector?.id || session.connector_id || 'N/A'}</span>
                    </div>
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
                    {session.connector_number && (
                      <div><span className="text-gray-500">Connector:</span> <span className="ml-2 font-medium text-gray-700">#{session.connector_number}</span></div>
                    )}
                  </div>
                  {session.started_at && (
                    <p className="text-xs text-gray-400 mt-2">Started at: {formatDate(session.started_at)}</p>
                  )}
                </div>
              )}

              {session.stop_reason && session.stop_reason !== 'N/A' && !isOngoing && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200 mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stop Reason</p>
                  <p className="text-sm text-gray-700">{session.stop_reason}</p>
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

// ==========================================================================
// TraceModal — CMS-canonical diagnostic waterfall
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
      ) {
        break;
      }
      group.push(next);
      j += 1;
    }
    if (group.length === 1) {
      rows.push({ kind: 'event', key: event.id, event });
    } else {
      const groupKey = `meter:${group[0].id}:${group[group.length - 1].id}`;
      if (expandedMeterGroups.has(groupKey)) {
        group.forEach((member) => {
          rows.push({ kind: 'event', key: member.id, event: member, meterGroupKey: groupKey });
        });
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
    events.forEach((event) => {
      if (!event?.id) return;
      byId.set(event.id, event);
    });
    return [...byId.values()].sort(compareTraceEventsChronological);
  }, [events]);

  const displayRows = useMemo(
    () => buildTraceDisplayRows(sortedEvents, expandedMeterGroups),
    [sortedEvents, expandedMeterGroups]
  );

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
      if (last && last.phase === phase) {
        last.rows.push(row);
      } else {
        segments.push({ phase, rows: [row] });
      }
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
        <div><span className="font-medium">Recorded:</span> <time dateTime={event?.recorded_at || undefined}>{formatTraceDate(event?.recorded_at)}</time></div>
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

    // The actor area is treated as 0..100%. Each event uses exactly the
    // backend-declared source -> target relation; no adjacency, correlation-id,
    // or timestamp inference is performed here.
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
                    <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">
                      {event.phase || 'UNKNOWN'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">
                      {event.protocol || 'UNKNOWN'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] text-gray-600">
                      {event.category || 'UNKNOWN'}
                    </span>
                  </div>
                  {(event.state_before || event.state_after) && (
                    <div className="mt-2 text-xs text-gray-600">
                      {event.state_before || '—'} → {event.state_after || '—'}
                    </div>
                  )}
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
                <div
                  className="absolute top-[8px] w-9 h-6 rounded-t-full border-2 border-b-0 border-indigo-400"
                  style={{ left: `calc(${sourceX}% - 18px)` }}
                />
                <span
                  className="absolute top-[22px] w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-indigo-500"
                  style={{ left: `calc(${sourceX}% + 10px)` }}
                />
                <span
                  className="absolute top-[25px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white -translate-x-1/2"
                  style={{ left: `${sourceX}%` }}
                />
              </>
            ) : (
              <>
                <div
                  className="absolute top-[30px] h-[2px] bg-indigo-400"
                  style={{ left: `${arrowLeft}%`, width: `${arrowWidth}%` }}
                />

                <span
                  className="absolute top-[25px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white -translate-x-1/2"
                  style={{ left: `${sourceX}%` }}
                />
                <span
                  className="absolute top-[25px] w-3 h-3 rounded-full bg-white border-2 border-indigo-500 ring-4 ring-white -translate-x-1/2"
                  style={{ left: `${targetX}%` }}
                />

                {movesRight ? (
                  <span
                    className="absolute top-[25px] w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-indigo-500"
                    style={{ left: `calc(${targetX}% - 15px)` }}
                  />
                ) : (
                  <span
                    className="absolute top-[25px] w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-indigo-500"
                    style={{ left: `calc(${targetX}% + 5px)` }}
                  />
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
        ) : (
          renderEventDetails(event)
        )}
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
              {traceData?.trace_id && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                    streamStatus === 'connected'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : streamStatus === 'connecting' || streamStatus === 'retrying'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      streamStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : streamStatus === 'connecting' || streamStatus === 'retrying'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-gray-400'
                    }`} />
                    {streamStatus === 'connected'
                      ? 'Live trace updates'
                      : streamStatus === 'connecting'
                        ? 'Connecting live trace'
                        : streamStatus === 'retrying'
                          ? 'Reconnecting live trace'
                          : 'Static trace snapshot'}
                  </span>
                  {streamError && <span className="text-amber-700">{streamError}</span>}
                </div>
              )}
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
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">CMS Start Intent ID</p>
                <p className="text-sm font-mono text-gray-800 truncate">{traceData?.cms_start_intent_id || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">CMS Command ID</p>
                <p className="text-sm font-mono text-gray-800 truncate">{traceData?.cms_command_id || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Charger OCPP Identity</p>
                <p className="text-sm font-mono text-gray-800 truncate">{traceData?.charger_ocpp_identity || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Connector</p>
                <p className="text-sm font-mono text-gray-800 truncate">
                  {traceData?.ocpp_connector_number ? `#${traceData.ocpp_connector_number}` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Persisted evidence sources:</span>
                {sourcesPresent.length > 0 ? (
                  sourcesPresent.map((source) => {
                    const color = getSourceColor(source);
                    return (
                      <span
                        key={`source-present-${source}`}
                        className={`px-2.5 py-1 rounded-full border ${color.border} ${color.light} ${color.text} text-xs font-semibold`}
                      >
                        {source}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-500">None reported in this response.</span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                This is persisted diagnostic evidence in CMS, not a health or availability check for any actor.
              </p>
            </div>

            {loading && !traceData && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <span className="ml-3 text-gray-500">Loading trace events...</span>
              </div>
            )}

            {error && (
              <div
                className={`mb-6 rounded-xl p-4 flex items-center gap-2 border ${
                  traceUnavailable
                    ? 'bg-gray-50 border-gray-200 text-gray-600'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {!loading && traceData && sortedEvents.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                <p className="text-gray-600">No diagnostic events are available for this trace.</p>
                <p className="text-xs text-gray-400 mt-1">An empty trace page is not a charging-session failure.</p>
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
                  <span>•</span>
                  <span>Correlation IDs are details only, never frontend graph authority.</span>
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
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user, refreshToken } = useAuth();

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

  // Pagination state using before and before_id
  const [pagination, setPagination] = useState({
    limit: 20,
    has_more: false,
    before: null,
    before_id: null,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMoreComplete, setIsLoadingMoreComplete] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(() => sessionStorage.getItem('sessionModalOpen') === 'true');
  const [selectedSession, setSelectedSession] = useState(() => {
    const saved = sessionStorage.getItem('selectedSession');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(() => sessionStorage.getItem('selectedSessionId') || null);

  // Trace modal
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

  // SSE state
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

  // Trace SSE is separate from the operational live-session stream.
  // The static snapshot's replay_cursor is the race-free boundary.
  const traceStreamRef = useRef(null);
  const traceStreamRetryTimeoutRef = useRef(null);
  const traceStreamEnabledRef = useRef(false);
  const traceModalActiveRef = useRef(false);
  const traceStreamTraceIdRef = useRef(null);
  const traceReplayCursorRef = useRef(0);

  // Save modal state
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDetailModal, showTraceModal]);

  // Initial fetch
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
  }, [isAuthenticated, navigate]);

  // Live data tick
  useEffect(() => {
    if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current);
    liveDurationIntervalRef.current = setInterval(() => {
      setLiveSessionsData(prev => ({ ...prev }));
    }, 1000);
    return () => { if (liveDurationIntervalRef.current) clearInterval(liveDurationIntervalRef.current); };
  }, []);

  // Update live sessions map
  useEffect(() => {
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
    
    setAllSessions(prev => {
      const updated = [...prev];
      liveSessionsData.sessions.forEach(liveSession => {
        const lId = liveSession.id || liveSession.session_id;
        const index = updated.findIndex(s => {
          const sId = s.id || s.session_id;
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

  // Modal live data update
  useEffect(() => {
    if (modalLiveDataIntervalRef.current) clearInterval(modalLiveDataIntervalRef.current);
    if (showDetailModal && selectedSessionId) {
      modalScrollPositionRef.current = window.scrollY;
      modalLiveDataIntervalRef.current = setInterval(() => {
        if (selectedSessionId && liveSessionsMapRef.current[selectedSessionId]) {
          const liveData = liveSessionsMapRef.current[selectedSessionId];
          setSelectedSession(prev => {
            if (!prev || (!isOngoingStatus(prev.status) && prev.status !== 'ACTIVE')) return prev;
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

  // ========== SSE ==========
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
              if (newToken && isMountedRef.current) setTimeout(startLiveSessionsSSE, 10000);
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
              if (event.trim() && isMountedRef.current) processSSEEvent(event);
            }
            if (isMountedRef.current) readStream();
          }).catch(error => {
            if (error.name === 'AbortError') console.log('📡 SSE Stream aborted');
            else {
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
        if (error.name !== 'AbortError') {
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

  // ========== Trace SSE ==========
  // Native EventSource cannot attach the required Authorization and
  // X-CPO-App-ID headers, so use the same authenticated fetch-stream pattern
  // as the live-session SSE above.
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
        const source = typeof event.source === 'string' && event.source.trim()
          ? event.source
          : null;

        return {
          ...previous,
          replay_cursor: Math.max(
            Number(previous.replay_cursor) || 0,
            Number.isFinite(replayCursor) ? replayCursor : 0
          ),
          sources_present: source
            ? Array.from(new Set([...(previous.sources_present || []), source]))
            : (previous.sources_present || []),
          events: alreadyPresent ? existingEvents : [...existingEvents, event]
        };
      });
    };

    async function connect() {
      if (!stillCurrent()) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setTraceStreamError('Authentication is required for live trace updates.');
        scheduleReconnect(3000);
        return;
      }

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
          if (newToken && stillCurrent()) {
            setTraceStreamError('');
            scheduleReconnect(0);
          }
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

        if (!response.ok || !response.body) {
          throw new Error(`Trace SSE HTTP ${response.status}`);
        }

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
        if (stillCurrent()) {
          setTraceStreamError('Live trace stream interrupted; retrying.');
          scheduleReconnect();
        }
      } finally {
        if (traceStreamRef.current === controller) {
          traceStreamRef.current = null;
        }
      }
    }

    connect();
  }, [refreshToken]);

  // ========== Fetch Sessions with before/before_id pagination ==========
  const fetchSessions = useCallback(async (before = null, beforeId = null, isLoadMore = false) => {
    if (fetchInProgressRef.current) return;
    if (isLoadMore && loadingMore) return;
    
    fetchInProgressRef.current = true;
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let url = `${API_CONFIG.SESSIONS_API}?limit=${pagination.limit}`;
      
      // Use before and before_id for pagination
      if (before) {
        url += `&before=${encodeURIComponent(before)}`;
      }
      if (beforeId) {
        url += `&before_id=${encodeURIComponent(beforeId)}`;
      }
      if (statusFilter !== 'All') {
        url += `&status=${statusFilter}`;
      }
      
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
      
      if (!isMountedRef.current) { fetchInProgressRef.current = false; return; }
      
      if (response.ok) {
        const data = await response.json();
        let sessionsArray = data.sessions || data.data || [];
        if (!Array.isArray(sessionsArray)) sessionsArray = [];
        
        const hasMore = data.has_more || false;
        const nextBefore = data.next_before || null;
        const nextBeforeId = data.next_before_id || null;
        
        console.log('📊 API Response - HasMore:', hasMore, 'NextBefore:', nextBefore);
        
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
        
        console.log('📊 Transformed sessions:', transformed.length);
        
        // Update sessions list
        if (isLoadMore) {
          setAllSessions(prev => {
            // Avoid duplicates
            const existingIds = new Set(prev.map(s => s.id || s.session_id));
            const newSessions = transformed.filter(s => {
              const id = s.id || s.session_id;
              return !existingIds.has(id);
            });
            console.log('Adding new sessions:', newSessions.length);
            return [...prev, ...newSessions];
          });
        } else {
          setAllSessions(transformed);
        }
        
        // Update pagination
        setPagination({
          limit: pagination.limit,
          has_more: hasMore,
          before: nextBefore,
          before_id: nextBeforeId,
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
        setPagination({ 
          limit: 20, 
          has_more: false, 
          before: null, 
          before_id: null,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch sessions:', response.status, errorData);
        if (!isLoadMore && isMountedRef.current) { 
          setAllSessions([]); 
          setOngoingSessions([]);
        }
        setPagination({ 
          limit: 20, 
          has_more: false, 
          before: null, 
          before_id: null,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      if (!isLoadMore && isMountedRef.current) { 
        setAllSessions([]); 
        setOngoingSessions([]);
      }
      setPagination({ 
        limit: 20, 
        has_more: false, 
        before: null, 
        before_id: null,
      });
    } finally {
      fetchInProgressRef.current = false;
      if (isMountedRef.current) { 
        setLoading(false); 
        setLoadingMore(false); 
      }
    }
  }, [pagination.limit, refreshToken, statusFilter]);

  // ========== Fetch Detail ==========
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
      } else if (response.status === 401) {
        setError('Session expired. Please refresh.');
        const newToken = await refreshToken();
        if (newToken && isMountedRef.current) {
          const retry = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'X-CPO-App-ID': CPO_APP_ID,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          if (retry.ok && isMountedRef.current) {
            const data = await retry.json();
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
      if (isMountedRef.current) setError('An error occurred while fetching session details');
    } finally {
      if (isMountedRef.current) setLoadingDetail(false);
    }
  }, [refreshToken]);

  // ========== Fetch Trace (CMS canonical store only) ==========
  const fetchTrace = useCallback(async (sessionId, beforeOccurredAt = null, beforeEventId = null, isLoadMore = false) => {
    if (!sessionId) return;
    if (isLoadMore && loadingMoreTrace) return;
    if (!isLoadMore) {
      if (traceStreamRef.current) {
        traceStreamRef.current.abort?.();
        traceStreamRef.current = null;
      }
      if (traceStreamRetryTimeoutRef.current) {
        clearTimeout(traceStreamRetryTimeoutRef.current);
        traceStreamRetryTimeoutRef.current = null;
      }
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
      const token = localStorage.getItem('token');
      let url = `${API_CONFIG.TRACE_API(sessionId)}?limit=50`;
      if (beforeOccurredAt) url += `&before_occurred_at=${encodeURIComponent(beforeOccurredAt)}`;
      if (beforeEventId) url += `&before_event_id=${encodeURIComponent(beforeEventId)}`;
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
        if (isLoadMore) {
          setTraceData(prev => ({
            ...prev,
            ...data,
            // Keep the first snapshot replay cursor as the race-free live boundary.
            replay_cursor: prev?.replay_cursor ?? data.replay_cursor,
            // Preserve every evidence source observed across loaded pages.
            sources_present: Array.from(new Set([
              ...(prev?.sources_present || []),
              ...(data.sources_present || [])
            ])),
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
      } else if (response.status === 401) {
        setTraceError('Session expired. Please refresh.');
        const newToken = await refreshToken();
        if (newToken && isMountedRef.current) {
          fetchTrace(sessionId, beforeOccurredAt, beforeEventId, isLoadMore);
          return;
        }
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
      setTraceError('An error occurred while fetching diagnostic trace');
    } finally {
      if (isMountedRef.current) {
        setLoadingTrace(false);
        setLoadingMoreTrace(false);
      }
    }
  }, [refreshToken, startTraceSSE, loadingMoreTrace]);

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
    // Only load more if there are more sessions and not already loading
    if (pagination.has_more && pagination.before && pagination.before_id && !loadingMore && !loading && !fetchInProgressRef.current) {
      console.log('Loading more sessions with before:', pagination.before, 'before_id:', pagination.before_id);
      fetchSessions(pagination.before, pagination.before_id, true);
    } else {
      console.log('Cannot load more - has_more:', pagination.has_more, 'before:', pagination.before, 'loadingMore:', loadingMore);
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
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
      setPagination({
        limit: 20,
        has_more: false,
        before: null,
        before_id: null,
      });
      fetchSessions();
    }
  };

  // Get current sessions
  const currentSessions = useMemo(() => {
    if (activeTab === 'all') {
      const merged = [...allSessions];
      liveSessionsData.sessions.forEach(liveSession => {
        const sessionKey = liveSession.id || liveSession.session_id;
        const exists = merged.some(s => {
          const sKey = s.id || s.session_id;
          return String(sKey) === String(sessionKey);
        });
        if (!exists) merged.push({ ...liveSession, is_live: true });
        else {
          const index = merged.findIndex(s => {
            const sKey = s.id || s.session_id;
            return String(sKey) === String(sessionKey);
          });
          if (index !== -1) merged[index] = { ...merged[index], ...liveSession, is_live: true };
        }
      });
      return merged;
    } else {
      return ongoingSessions;
    }
  }, [activeTab, allSessions, ongoingSessions, liveSessionsData.sessions]);

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

  const ongoingCount = useMemo(() => {
    return currentSessions.filter(s => isOngoingStatus(s.status) || s.status === 'ACTIVE' || s.status === 'STOP_PENDING').length;
  }, [currentSessions]);

  // Show Load More button only when:
  // 1. has_more is true from API
  // 2. before and before_id are available for next page
  // 3. not already loading more
  const showLoadMore = pagination.has_more && pagination.before && pagination.before_id && !loadingMore;

  // ========== Settings Menu ==========
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
              onClick={() => { setShowFilterPopup(false); fetchSessions(); }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
            >
              Apply Filters
            </button>
            <button
              onClick={() => { setStatusFilter('All'); setSearchQuery(''); fetchSessions(); }}
              className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
            <div className="flex items-center gap-3">
            
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <h1 className="text-2xl font-bold text-gray-800">Chargers & Sessions</h1>
                <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium">/ Dashboard</button>
                <span className="text-blue-600">/</span>
                <span className="text-blue-600 font-medium">Sessions</span>
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
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Main Tabs */}
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
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">{allSessions.length}</span>
          </button>
        </div>

        {/* Sessions Content */}
        {activeMainTab === 'sessions' && (
          <div className="p-6">
            {/* Stats */}
            <div className="mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition group inline-flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loaded Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{allSessions.length}</p>
                  {pagination.has_more && (
                    <p className="text-xs text-blue-500">More sessions available — load more below</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <div className="flex items-center gap-2">
                  <Grid size={16} /> All Sessions
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{allSessions.length}</span>
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

            {/* Search & Filters */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                {statusFilter !== 'All' && (
                  <button
                    onClick={() => { setStatusFilter('All'); setSearchQuery(''); fetchSessions(); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center gap-1"
                  >
                    <X size={12} /> Clear Filters
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium"
                  title={isCompact ? "Switch to Expanded view" : "Switch to Compact view"}
                >
                  <Sliders size={14} />
                  {isCompact ? 'Compact' : 'Expanded'}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={fetchInProgressRef.current}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium disabled:opacity-50"
                >
                  <RefreshCw size={14} className={fetchInProgressRef.current ? 'animate-spin' : ''} />
                  Refresh
                </button>
                {showFilterPopup && <FilterPopup />}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
              {!isCompact && (
                <>
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50/80 to-transparent pointer-events-none z-10" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs bg-white px-2 py-1 rounded shadow border border-gray-200 pointer-events-none opacity-80 z-10">
                    → Scroll
                  </div>
                </>
              )}

              <div className={`overflow-x-auto ${isCompact ? '' : 'custom-scrollbar'} scrollbar-hide`}>
                <table className={`w-full ${isCompact ? 'table-auto text-xs' : 'text-sm'}`} style={isCompact ? {} : { minWidth: '1800px' }}>
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-8 whitespace-nowrap`}>SI</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-24 whitespace-nowrap`}>Session ID</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Transaction ID</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-24 whitespace-nowrap`}>Customer</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 whitespace-nowrap`}>Charger</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Hub</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-10 whitespace-nowrap`}>Connector</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 whitespace-nowrap`}>Start Time</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 whitespace-nowrap`}>End Time</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-14 whitespace-nowrap`}>Duration</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-24 whitespace-nowrap`}>Usage</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Start Criteria</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-14 whitespace-nowrap`}>Req. Limit</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Amount</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-20 whitespace-nowrap`}>Status</th>
                      <th className={`${isCompact ? 'px-1.5 py-1.5' : 'px-3 py-3'} text-left font-semibold text-gray-600 uppercase tracking-wider w-28 sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] z-20 whitespace-nowrap`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && !hasLoaded && isInitialLoad ? (
                      <tr>
                        <td colSpan="16" className={`${isCompact ? 'px-2 py-6' : 'px-4 py-12'} text-center`}>
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-1" />
                          <p className="text-gray-500 text-xs">Loading sessions...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="16" className={`${isCompact ? 'px-2 py-6' : 'px-4 py-12'} text-center`}>
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
                          <p className="text-gray-600 text-xs">{error}</p>
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
                        <td colSpan="16" className={`${isCompact ? 'px-2 py-6' : 'px-4 py-12'} text-center`}>
                          <Database size={isCompact ? 28 : 40} className="text-gray-300 mx-auto mb-1" />
                          <p className="text-gray-500 font-medium text-xs">No Sessions Found</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {activeTab === 'all' ? 'No charging sessions available.' : 'No ongoing sessions found.'}
                          </p>
                          {showLiveIndicator && activeTab === 'ongoing' && (
                            <p className="text-xs text-green-600 mt-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                              Waiting for live sessions...
                            </p>
                          )}
                          <button
                            onClick={handleRefresh}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition shadow flex items-center gap-1 mx-auto"
                          >
                            <RefreshCw size={12} /> Refresh
                          </button>
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
                        let displayCurrency = session.currency || 'INR';

                        if (isLive) {
                          const energy = getEnergyKwh(session);
                          displayEnergy = energy > 0 ? energy.toFixed(2) : (session.total_kwh || '0');
                          displaySoc = getSocPercent(session) || null;
                          const projectedAmount = getProjectedAmount(session);
                          if (projectedAmount > 0) displayAmount = projectedAmount;
                          displayCurrency = getCurrency(session);
                        }

                        const connectorNumber = session.connector?.number || session.connector_number || 'N/A';
                        const liveMapEntry = liveSessionsMapRef.current[sessionId];
                        const transactionId = liveMapEntry?.ocpp_transaction_id || session.ocpp_transaction_id || session.transaction_id || 'N/A';
                        const chargerId = session.charger?.charger_id || session.charger_id || session.charger?.id || 'N/A';
                        const chargerName = session.charger?.name || session.charger_name || 'N/A';

                        const startCriteria = session.start_criteria;
                        const requestedLimit = session.requested_limit_value;
                        const limitDisplay = formatRequestedLimit(requestedLimit, startCriteria);

                        const rowBg = isLive && isOngoing ? 'bg-green-50/30' : 'bg-white';

                        return (
                          <tr
                            key={sessionId || session.transaction_id || index}
                            className={`border-b border-gray-100 hover:bg-gray-50/70 transition cursor-pointer ${rowBg} ${
                              isUpdated && isLive ? 'animate-pulse-update' : ''
                            }`}
                            onClick={() => handleSessionClick(sessionId)}
                          >
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-500 text-center text-xs`}>{index + 1}</td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-mono text-gray-600 text-xs truncate max-w-24`} title={sessionId}>{truncateId(sessionId)}</td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-mono text-gray-600 text-xs truncate max-w-20`} title={transactionId}>{truncateId(transactionId)}</td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs truncate max-w-24`} title={session.customer?.name || session.customer_name}>
                              {session.customer?.name || session.customer_name || 'N/A'}
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs`}>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800 truncate max-w-24" title={chargerName}>{chargerName}</span>
                                <span className="text-[10px] text-gray-400 truncate max-w-24" title={chargerId}>ID: {truncateId(chargerId)}</span>
                              </div>
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-600 text-xs truncate max-w-20`} title={session.charger?.hub_name || session.hub_name}>
                              {session.charger?.hub_name || session.hub_name || 'N/A'}
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-mono text-gray-500 text-center text-xs`}>#{connectorNumber}</td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-600 text-xs whitespace-nowrap`}>{formatDate(session.start_time || session.started_at)}</td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-600 text-xs whitespace-nowrap`}>
                              {isOngoing ? 'Ongoing' : (session.end_time ? formatDate(session.end_time) : 'N/A')}
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-xs`}>
                              <div className="flex items-center gap-0.5">
                                <span className="font-medium text-gray-700">{durationDisplay}</span>
                                {isLive && isOngoing && (
                                  <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                                    <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-xs whitespace-nowrap`}>
                              <div className="flex items-center gap-0.5">
                                <span className="font-medium text-gray-700">{displayEnergy} kWh</span>
                                {isLive && displaySoc && (
                                  <span className="ml-0.5 text-[10px] text-purple-600">· SOC: {displaySoc}%</span>
                                )}
                                {isLive && isOngoing && (
                                  <span className="ml-0.5 text-[10px] text-green-600 flex items-center gap-0.5">
                                    <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>Live
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs whitespace-nowrap`}>{startCriteria || '—'}</td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-gray-700 text-xs`}>{limitDisplay}</td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} font-medium text-gray-700 text-xs whitespace-nowrap`}>
                              {formatCurrency(displayAmount)}
                              {isLive && isOngoing && (
                                <span className="ml-0.5 text-[10px] text-green-600 flex items-center gap-0.5">
                                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>Live
                                </span>
                              )}
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} text-xs`}>
                              <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(session.status)}`}>
                                {getStatusIcon(session.status)}
                                {getStatusDisplayName(session.status)}
                              </span>
                              {isLive && isOngoing && (
                                <span className="ml-0.5 text-[10px] text-green-600">
                                  <span className="w-1 h-1 bg-green-500 rounded-full inline-block mr-0.5 animate-pulse"></span>
                                </span>
                              )}
                            </td>
                            <td className={`${isCompact ? 'px-1.5 py-1' : 'px-3 py-3'} sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] ${rowBg}`}>
                              <div className="flex items-center gap-0.5">
                                <button
                                  className={`${isCompact ? 'p-0.5' : 'p-1.5'} text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition flex items-center gap-0.5 text-[10px] font-medium`}
                                  onClick={(e) => { e.stopPropagation(); handleSessionClick(sessionId); }}
                                >
                                  <Eye size={isCompact ? 12 : 14} />
                                  <span className={isCompact ? 'hidden sm:inline' : ''}>View</span>
                                </button>
                                <button
                                  className={`${isCompact ? 'p-0.5' : 'p-1.5'} text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition flex items-center gap-0.5 text-[10px] font-medium`}
                                  onClick={(e) => { e.stopPropagation(); openTraceModal(sessionId); }}
                                  title="Diagnostic Trace"
                                >
                                  <GitBranch size={isCompact ? 12 : 14} />
                                  <span className={isCompact ? 'hidden sm:inline' : ''}>Trace</span>
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

            {/* Load More - Only show when there are more sessions to load */}
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

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 flex justify-between items-center">
              <span>
                {filteredSessions.length === 0 ? 'No sessions available' : 
                  `Showing ${filteredSessions.length} of ${allSessions.length} loaded sessions`}
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

        {/* Chargers Tab */}
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

      {/* Modals */}
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

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .custom-scrollbar {
          overflow-x: auto;
          overflow-y: visible;
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Sessions;
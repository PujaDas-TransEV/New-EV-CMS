// src/components/Revenue/CustomerTariff.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Users,
  UserCog,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Tag,
  FileText,
  Layers,
  Receipt,
  BarChart,
  PieChart,
  Zap,
  Calendar,
  Clock,
  X,
  AlertCircle,
  Shield,
  ArrowLeft,
  IndianRupee,
  Globe,
  CalendarDays,
  Info,
  Sparkles,
  DollarSign,
  RefreshCw,
  Infinity,
  Calendar as CalendarIcon,
  MoreVertical,
  Filter,
  Power,
  PowerOff,
  Activity,
  Pencil,
  Save,
  Gauge,
  Crown,
  Timer,
  CalendarRange
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// ============================================================================
// API Configuration
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

const API_CONFIG = {
  USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
  USER_GROUP_TARIFFS_API: (groupId) => `${API_BASE_URL}/api/v1/cpo/user-groups/${groupId}/tariffs`,
  USER_GROUP_TARIFF_DETAIL_API: (groupId, tariffId) => `${API_BASE_URL}/api/v1/cpo/user-groups/${groupId}/tariffs/${tariffId}`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  HUBS_API: `${API_BASE_URL}/api/v1/cpo/hubs`,
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
};

// ============================================================================
// SECTION 12 - Canonical Pricing Model
// ============================================================================
const PRICE_TYPE_MAP = {
  'Energy': 'energy',
  'Time': 'time',
  'Sessions': 'sessions'
};

const UNITS_MAP = {
  'kWh': 'kwh',
  'Minutes': 'minutes'
};

const PRICE_TYPE_DISPLAY = {
  'energy': 'Energy',
  'time': 'Time',
  'sessions': 'Sessions'
};

const UNITS_DISPLAY = {
  'kwh': 'kWh',
  'minutes': 'Minutes'
};

// Force‑sync unit per price type
const DEFAULT_UNIT_FOR_PRICE_TYPE = {
  'Energy': 'kWh',
  'Time': 'Minutes',
  'Sessions': ''
};

// ============================================================================
// SECTION 55 - Recommended Terminology Glossary
// ============================================================================
const TARIFF_ROLE_DISPLAY = {
  'root': 'Root Fallback',
  'baseline': 'Open-ended Baseline',
  'temporary': 'Temporary Override'
};

const TARIFF_ROLE_COLORS = {
  'root': 'purple',
  'baseline': 'blue',
  'temporary': 'orange'
};

const TARIFF_ROLE_ICONS = {
  'root': Crown,
  'baseline': CalendarRange,
  'temporary': Timer
};

// ============================================================================
// SECTION 10 - Derived Frontend Display States
// ============================================================================
const getDerivedStatus = (tariff, now = new Date()) => {
  if (!tariff.is_active) {
    return {
      label: 'Disabled',
      color: 'gray',
      icon: XCircle,
      description: 'Ignored by resolver',
      badgeColor: 'bg-gray-100 text-gray-700'
    };
  }

  const isRoot = !tariff.start_date && !tariff.end_date;

  if (isRoot) {
    return {
      label: 'Root',
      color: 'purple',
      icon: Crown,
      description: 'Timeless fallback',
      badgeColor: 'bg-purple-100 text-purple-700'
    };
  }

  const startDate = tariff.start_date ? new Date(tariff.start_date) : null;
  const endDate = tariff.end_date ? new Date(tariff.end_date) : null;

  if (startDate && startDate > now) {
    return {
      label: 'Scheduled',
      color: 'blue',
      icon: Calendar,
      description: 'Future tariff',
      badgeColor: 'bg-blue-100 text-blue-700'
    };
  }

  if (endDate && endDate <= now) {
    return {
      label: 'Expired',
      color: 'red',
      icon: XCircle,
      description: 'Past validity',
      badgeColor: 'bg-red-100 text-red-700'
    };
  }

  if (startDate && startDate <= now && (!endDate || endDate > now)) {
    return {
      label: 'Time-applicable',
      color: 'green',
      icon: CheckCircle,
      description: 'Currently valid',
      badgeColor: 'bg-green-100 text-green-700'
    };
  }

  return {
    label: 'Enabled',
    color: 'blue',
    icon: CheckCircle,
    description: 'Enabled for resolution',
    badgeColor: 'bg-blue-100 text-blue-700'
  };
};

// ============================================================================
// SECTION 5 - Temporal Roles
// ============================================================================
const getTemporalRole = (tariff) => {
  if (!tariff.start_date && !tariff.end_date) return 'root';
  if (tariff.start_date && !tariff.end_date) return 'baseline';
  if (tariff.start_date && tariff.end_date) return 'temporary';
  return 'unknown';
};

// ---------- Presentational helpers ----------
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatDateTime = (dateString) => {
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

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹ 0';
  return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getPriceDisplay = (tariff) => {
  if (!tariff) return '';
  const price = formatCurrency(tariff.price_per_unit);
  const priceType = tariff.price_type || 'energy';
  switch (priceType) {
    case 'energy':
      return `${price} / kWh`;
    case 'time':
      return `${price} / minute`;
    case 'sessions':
      return `${price} / session`;
    default:
      return price;
  }
};

const getStatusColor = (isActive) => {
  return isActive
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (isActive) => {
  return isActive
    ? <CheckCircle className="w-3 h-3" />
    : <XCircle className="w-3 h-3" />;
};

// ============================================================================
// TARIFF DETAIL MODAL – Declared OUTSIDE component to prevent blinking
// ============================================================================
const TariffDetailModal = ({
  tariff,
  onClose,
  onEditToggle,
  isEditing,
  editFormData,
  onEditChange,
  onTemporalRoleSelect,
  onUpdate,
  isUpdating,
  error,
  updateSuccess,
  onDelete,
}) => {
  if (!tariff) return null;

  const temporalRole = getTemporalRole(tariff);
  const derivedStatus = getDerivedStatus(tariff);
  const isRoot = temporalRole === 'root';
  const isBaseline = temporalRole === 'baseline';
  const isTemporary = temporalRole === 'temporary';
  const RoleIcon = TARIFF_ROLE_ICONS[temporalRole] || Tag;
  const roleColor = TARIFF_ROLE_COLORS[temporalRole] || 'blue';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Modal Header - Green Gradient */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Tariff' : 'Tariff Details'}
              </h3>
              <p className="text-sm text-white/80">
                {isEditing ? 'Update tariff configuration' : `ID: ${tariff.id?.slice(0, 12) || 'N/A'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={onEditToggle}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
                title="Edit Tariff"
              >
                <Pencil size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {updateSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-700">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{updateSuccess}</span>
            </div>
          )}

          {isEditing ? (
            // Edit Form
            <form onSubmit={onUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price per Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <IndianRupee size={18} />
                    </div>
                    <input
                      type="number"
                      name="price_per_unit"
                      value={editFormData.price_per_unit}
                      onChange={onEditChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {editFormData.price_type === 'Energy' && 'Price per kWh'}
                    {editFormData.price_type === 'Time' && 'Price per minute'}
                    {editFormData.price_type === 'Sessions' && 'Price per session'}
                  </p>
                </div>
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
                      value={editFormData.idle_fee_per_min}
                      onChange={onEditChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Must be 0 (idle fee is not supported)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Globe size={18} />
                    </div>
                    <select
                      name="currency"
                      value={editFormData.currency}
                      onChange={onEditChange}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DollarSign size={18} />
                    </div>
                    <select
                      name="price_type"
                      value={editFormData.price_type}
                      onChange={onEditChange}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-gray-50 hover:bg-white"
                    >
                      <option value="Energy">Energy (per kWh)</option>
                      <option value="Time">Time (per minute)</option>
                      <option value="Sessions">Sessions (per session)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Units <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Gauge size={18} />
                    </div>
                    {/* Units is read-only – auto‑synced with price_type */}
                    <input
                      type="text"
                      value={
                        editFormData.price_type === 'Sessions'
                          ? 'Units omitted for Sessions'
                          : editFormData.units
                      }
                      readOnly
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {editFormData.price_type === 'Sessions' && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <Info size={14} className="inline mr-1" />
                    Sessions pricing: One fixed amount for one completed session. Units are omitted.
                  </p>
                </div>
              )}

              {/* Temporal Role Selection */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  Temporal Role
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onTemporalRoleSelect('root')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${
                      !editFormData.start_date && !editFormData.end_date
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Crown size={14} className={!editFormData.start_date && !editFormData.end_date ? 'text-purple-500' : 'text-gray-400'} />
                      Root
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Timeless fallback</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTemporalRoleSelect('baseline')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${
                      editFormData.start_date && !editFormData.end_date
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarRange size={14} className={editFormData.start_date && !editFormData.end_date ? 'text-blue-500' : 'text-gray-400'} />
                      Baseline
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Open-ended fallback</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTemporalRoleSelect('temporary')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${
                      editFormData.start_date && editFormData.end_date
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Timer size={14} className={editFormData.start_date && editFormData.end_date ? 'text-orange-500' : 'text-gray-400'} />
                      Temporary
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Bounded override</p>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <CalendarDays size={18} />
                    </div>
                    <input
                      type="date"
                      name="start_date"
                      value={editFormData.start_date}
                      onChange={onEditChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <CalendarDays size={18} />
                    </div>
                    <input
                      type="date"
                      name="end_date"
                      value={editFormData.end_date}
                      onChange={onEditChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="edit_is_active"
                      checked={editFormData.is_active}
                      onChange={onEditChange}
                      className="sr-only"
                    />
                    <div
                      onClick={() => onEditChange({ target: { name: 'is_active', type: 'checkbox', checked: !editFormData.is_active } })}
                      className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${editFormData.is_active ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${editFormData.is_active ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5 shadow-md`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {editFormData.is_active ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {editFormData.is_active
                        ? 'Tariff participates in resolution'
                        : 'Tariff ignored by resolver'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Tariff
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onEditToggle}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-5">
              {/* Status, Price, Idle Fee */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tariff.is_active)}`}>
                      {getStatusIcon(tariff.is_active)}
                      {tariff.is_active ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Price</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{getPriceDisplay(tariff)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Idle Fee / min</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(tariff.idle_fee_per_min || 0)}</p>
                </div>
              </div>

              {/* Tariff Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Currency</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{tariff.currency || 'INR'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Price Type</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mt-1">
                    {PRICE_TYPE_DISPLAY[tariff.price_type] || tariff.price_type || 'Energy'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Temporal Role</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${roleColor}-100 text-${roleColor}-700 mt-1`}>
                    <RoleIcon size={14} className={`text-${roleColor}-500`} />
                    {TARIFF_ROLE_DISPLAY[temporalRole] || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Units (if applicable) */}
              {tariff.price_type !== 'sessions' && tariff.units && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Units</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-700 mt-1">
                    {UNITS_DISPLAY[tariff.units] || tariff.units}
                  </span>
                </div>
              )}

              {/* Schedule / Validity Period */}
              <div className={`rounded-2xl p-4 border ${
                isRoot ? 'bg-purple-50 border-purple-200' :
                isBaseline ? 'bg-blue-50 border-blue-200' :
                'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Validity Period</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    isRoot ? 'bg-purple-100 text-purple-700' :
                    isBaseline ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    <RoleIcon size={12} className={`text-${roleColor}-500`} />
                    {TARIFF_ROLE_DISPLAY[temporalRole]}
                  </span>
                </div>
                {isRoot && (
                  <p className="text-xs text-purple-700 mt-1">
                    <Info size={14} className="inline mr-1" />
                    Root tariff is always active and provides a fallback.
                  </p>
                )}
                <div className="flex items-center gap-6 flex-wrap mt-2">
                  <div>
                    <p className="text-xs text-gray-400">Start</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(tariff.start_date) || '—'}</p>
                  </div>
                  <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                  <div>
                    <p className="text-xs text-gray-400">End</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(tariff.end_date) || <span className="text-emerald-600"><Infinity size={14} className="inline" /> No expiry</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Derived Status */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Derived Status</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${derivedStatus.badgeColor}`}>
                    {React.createElement(derivedStatus.icon, { size: 14, className: `text-${derivedStatus.color}-500` })}
                    {derivedStatus.label}
                  </span>
                  <span className="text-xs text-gray-500">{derivedStatus.description}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  <Info size={14} className="inline mr-1" />
                  This is a UI projection. Backend resolver is authoritative for billing.
                </p>
              </div>

              {/* Scope Precedence Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                <p className="text-xs font-medium text-green-800 flex items-center gap-2">
                  <Info size={14} className="text-green-600" />
                  Scope Precedence
                </p>
                <p className="text-xs text-green-700 mt-1">
                  UserGroup &gt; Charger &gt; Hub. This tariff applies at the <strong>User Group</strong> level
                  and takes precedence over Charger and Hub tariffs.
                </p>
                {isRoot && (
                  <span className="block mt-1 font-medium text-purple-700">
                    🔵 This is a Root Tariff - provides fallback when no other tariff applies.
                  </span>
                )}
                {isBaseline && (
                  <span className="block mt-1 font-medium text-blue-700">
                    📅 This is an Open-ended Baseline - becomes eligible from its start date.
                  </span>
                )}
                {isTemporary && (
                  <span className="block mt-1 font-medium text-orange-700">
                    ⚡ This is a Temporary Override - applies only within its date range.
                  </span>
                )}
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Timestamps</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-700 ml-2">{formatDateTime(tariff.created_at)}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">Updated:</span>
                    <span className="text-gray-700 ml-2">{formatDateTime(tariff.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                <button
                  onClick={onEditToggle}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                >
                  <Edit size={16} />
                  Edit Tariff
                </button>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Info size={14} className="text-gray-400" />
                This change affects future tariff resolution and new charging starts. Existing started sessions keep their frozen tariff snapshot.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DELETE CONFIRM MODAL – Declared OUTSIDE to prevent blinking
// ============================================================================
const DeleteConfirmModal = ({ onConfirm, onCancel, isDeleting, error }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Delete Tariff</h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-700 text-sm leading-relaxed">
          Delete this tariff permanently? If it is currently selected, new pricing will immediately fall back to the next eligible tariff.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Tariffs referenced by charging history cannot be deleted.
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete Permanently
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const CustomerTariff = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [loadingTariffs, setLoadingTariffs] = useState(false);
  const [showTariffDetail, setShowTariffDetail] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [rootTariffExists, setRootTariffExists] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTariffId, setDeletingTariffId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isModalOpeningRef = useRef(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    price_per_unit: '',
    idle_fee_per_min: '0',
    currency: 'INR',
    is_active: true,
    tariff_type: 'Standard',
    price_type: 'Energy',
    units: 'kWh',
    start_date: '',
    end_date: ''
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/revenue/overview' },
    { id: 'driver_tariffs', label: 'Customer Tariffs', icon: Users, path: '/revenue/customer-tariffs' },
    { id: 'charger_tariffs', label: 'Charger Tariffs', icon: Zap, path: '/revenue/charger-tariffs' },
    { id: 'hub_tariffs', label: 'Hub Tariffs', icon: Layers, path: '/revenue/hub-tariffs' },
    { id: 'tax', label: 'Tax', icon: Receipt, path: '/revenue/tax' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/revenue/settings' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchUserGroups();
    fetchHubs();
    fetchChargers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = useCallback(async () => {
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
  }, [authenticatedRequest]);

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

        // Add member count
        const groupsWithMemberCount = groups.map(group => ({
          ...group,
          member_count: group.members ? group.members.length : 0,
          members_list: group.members || []
        }));

        setUserGroups(groupsWithMemberCount);
        if (groupsWithMemberCount.length > 0) {
          setSelectedGroup(groupsWithMemberCount[0]);
          fetchTariffs(groupsWithMemberCount[0].id);
        }
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

  const fetchHubs = useCallback(async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.HUBS_API, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        const hubsData = data.hubs || data.data || data || [];
        setHubs(hubsData);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
    }
  }, [authenticatedRequest]);

  const fetchChargers = useCallback(async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.CHARGERS_API, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        const chargersData = data.chargers || data.data || data || [];
        setChargers(chargersData);
      }
    } catch (error) {
      console.error('Error fetching chargers:', error);
    }
  }, [authenticatedRequest]);

  const fetchTariffs = useCallback(async (groupId) => {
    setLoadingTariffs(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_GROUP_TARIFFS_API(groupId), {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const tariffData = data.tariffs || data.data || data || [];
        setTariffs(tariffData);

        const hasRoot = tariffData.some(t => !t.start_date && !t.end_date && t.is_active === true);
        setRootTariffExists(hasRoot);
      } else {
        setTariffs([]);
        setRootTariffExists(false);
      }
    } catch (error) {
      console.error('Error fetching tariffs:', error);
      setTariffs([]);
      setRootTariffExists(false);
    } finally {
      setLoadingTariffs(false);
    }
  }, [authenticatedRequest]);

  const fetchTariffDetail = useCallback(async (groupId, tariffId) => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_GROUP_TARIFF_DETAIL_API(groupId, tariffId), {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        return data.tariff || data.data || data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tariff detail:', error);
      return null;
    }
  }, [authenticatedRequest]);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    fetchTariffs(group.id);
    setShowTariffDetail(false);
    setSelectedTariff(null);
  };

  const handleTariffClick = async (tariff) => {
    if (isModalOpeningRef.current) return;
    isModalOpeningRef.current = true;

    try {
      const fullTariff = await fetchTariffDetail(selectedGroup.id, tariff.id);
      if (fullTariff) {
        setSelectedTariff(fullTariff);
        setShowTariffDetail(true);
        setIsEditing(false);

        const displayPriceType = PRICE_TYPE_DISPLAY[fullTariff.price_type] || fullTariff.price_type || 'Energy';

        setEditFormData({
          price_per_unit: fullTariff.price_per_unit || '',
          idle_fee_per_min: fullTariff.idle_fee_per_min || '0',
          currency: fullTariff.currency || 'INR',
          is_active: fullTariff.is_active !== undefined ? fullTariff.is_active : true,
          tariff_type: 'Standard',
          price_type: displayPriceType,
          // Force units based on price_type (source of truth)
          units: DEFAULT_UNIT_FOR_PRICE_TYPE[displayPriceType] ?? '',
          start_date: fullTariff.start_date || '',
          end_date: fullTariff.end_date || ''
        });
      }
    } catch (error) {
      console.error('Error loading tariff details:', error);
    } finally {
      isModalOpeningRef.current = false;
    }
  };

  const handleAddTariff = () => {
    if (selectedGroup) {
      navigate('/revenue/add-customer-tariff', {
        state: { groupId: selectedGroup.id, groupName: selectedGroup.name }
      });
    } else {
      navigate('/revenue/add-customer-tariff');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && selectedTariff) {
      const displayPriceType = PRICE_TYPE_DISPLAY[selectedTariff.price_type] || selectedTariff.price_type || 'Energy';

      setEditFormData({
        price_per_unit: selectedTariff.price_per_unit || '',
        idle_fee_per_min: selectedTariff.idle_fee_per_min || '0',
        currency: selectedTariff.currency || 'INR',
        is_active: selectedTariff.is_active !== undefined ? selectedTariff.is_active : true,
        tariff_type: 'Standard',
        price_type: displayPriceType,
        units: DEFAULT_UNIT_FOR_PRICE_TYPE[displayPriceType] ?? '',
        start_date: selectedTariff.start_date || '',
        end_date: selectedTariff.end_date || ''
      });
    }
  };

  // Handles edit form changes – auto‑sync units when price_type changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setEditFormData(prev => {
      const updated = { ...prev, [name]: nextValue };

      if (name === 'price_type') {
        updated.units = DEFAULT_UNIT_FOR_PRICE_TYPE[value] ?? '';
      }

      return updated;
    });
  };

  // Quick‑select for temporal roles
  const handleTemporalRoleSelect = (kind) => {
    if (kind === 'root') {
      setEditFormData(prev => ({ ...prev, start_date: '', end_date: '' }));
      return;
    }
    if (kind === 'baseline') {
      const today = new Date();
      setEditFormData(prev => ({
        ...prev,
        start_date: today.toISOString().split('T')[0],
        end_date: ''
      }));
      return;
    }
    if (kind === 'temporary') {
      const today = new Date();
      const future = new Date();
      future.setMonth(future.getMonth() + 1);
      setEditFormData(prev => ({
        ...prev,
        start_date: today.toISOString().split('T')[0],
        end_date: future.toISOString().split('T')[0]
      }));
    }
  };

  // ============================================================================
  // SECTION 20 - PATCH Semantics (Omitted vs Null)
  // ============================================================================
  const buildUpdatePayload = () => {
    const pricePerUnit = parseFloat(editFormData.price_per_unit) || 0;
    const idleFeePerMin = parseFloat(editFormData.idle_fee_per_min) || 0;

    const payload = {
      price_per_unit: Number(pricePerUnit.toFixed(4)).toString(),
      idle_fee_per_min: Number(idleFeePerMin.toFixed(4)).toString(),
      currency: editFormData.currency,
      is_active: editFormData.is_active,
      tariff_type: 'fixed',
      price_type: PRICE_TYPE_MAP[editFormData.price_type] || 'energy',
    };

    // Units derived from price_type – never trust stale state
    if (editFormData.price_type !== 'Sessions') {
      const unitLabel = DEFAULT_UNIT_FOR_PRICE_TYPE[editFormData.price_type];
      payload.units = UNITS_MAP[unitLabel] || 'kwh';
    }

    // Temporal roles
    if (editFormData.start_date !== undefined && editFormData.end_date !== undefined) {
      if (!editFormData.start_date && !editFormData.end_date) {
        payload.start_date = null;
        payload.end_date = null;
      } else if (editFormData.start_date && !editFormData.end_date) {
        payload.start_date = new Date(editFormData.start_date).toISOString();
        payload.end_date = null;
      } else if (editFormData.start_date && editFormData.end_date) {
        payload.start_date = new Date(editFormData.start_date).toISOString();
        payload.end_date = new Date(editFormData.end_date).toISOString();
      }
    }

    return payload;
  };

  const handleUpdateTariff = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setUpdateSuccess('');

    try {
      const apiPayload = buildUpdatePayload();

      console.log('📤 Update Payload:', JSON.stringify(apiPayload, null, 2));

      const response = await authenticatedRequest(
        API_CONFIG.USER_GROUP_TARIFF_DETAIL_API(selectedGroup.id, selectedTariff.id),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(apiPayload)
        }
      );

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (response.ok) {
        setUpdateSuccess('Tariff updated successfully!');
        await fetchTariffs(selectedGroup.id);

        const updatedTariff = await fetchTariffDetail(selectedGroup.id, selectedTariff.id);
        if (updatedTariff) {
          setSelectedTariff(updatedTariff);
          setIsEditing(false);
        }

        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        let errorMessage = 'Failed to update tariff';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        } else if (data.error?.code) {
          if (data.error.code === 'tariff_temporal_conflict') {
            errorMessage = 'This tariff conflicts with another tariff on the same target. Adjust the schedule or keep it disabled.';
          } else if (data.error.code === 'tariff_in_use') {
            errorMessage = 'This tariff is referenced by charging/commercial history and cannot be deleted. Disable it instead.';
          } else {
            errorMessage = `${data.error.code}: ${data.error.message || 'Unknown error'}`;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating tariff:', error);
      setError(error.message || 'An error occurred while updating the tariff');
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================================================
  // SECTION 24 - Delete Semantics
  // ============================================================================
  const handleDeleteTariff = async () => {
    if (!deletingTariffId) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await authenticatedRequest(
        API_CONFIG.USER_GROUP_TARIFF_DETAIL_API(selectedGroup.id, deletingTariffId),
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        setUpdateSuccess('Tariff deleted successfully!');
        await fetchTariffs(selectedGroup.id);
        setShowTariffDetail(false);
        setSelectedTariff(null);
        setShowDeleteConfirm(false);
        setDeletingTariffId(null);
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        let errorMessage = 'Failed to delete tariff';
        const data = await response.json();
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        } else if (data.error?.code) {
          if (data.error.code === 'tariff_in_use') {
            errorMessage = 'This tariff is referenced by charging/commercial history and cannot be deleted. Disable it instead.';
          } else {
            errorMessage = `${data.error.code}: ${data.error.message || 'Unknown error'}`;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting tariff:', error);
      setError(error.message || 'An error occurred while deleting the tariff');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingTariffId(null);
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

  const handleTabClick = (tabId, path) => {
    if (tabId === 'driver_tariffs') return;
    navigate(path);
  };

  const getHubName = (hubId) => {
    const hub = hubs.find(h => h.id === hubId);
    return hub ? hub.name : hubId;
  };

  const getChargerName = (chargerId) => {
    const charger = chargers.find(c => c.id === chargerId);
    return charger ? charger.charger_name || charger.charger_id : chargerId;
  };

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-80 shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || user?.name || 'User'}
            </h4>
            <p className="text-sm text-white/80 truncate">
              {userData?.user?.email || user?.email || 'user@transev.com'}
            </p>
            {userData?.role && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white border border-white/30">
                {userData.role}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-2">
        <button onClick={() => { setShowSettingsMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <User size={16} className="text-gray-400" /> <span>Profile</span>
        </button>
        <button onClick={() => { setShowSettingsMenu(false); navigate('/organization'); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Building size={16} className="text-gray-400" /> <span>Organization</span>
        </button>
        <div className="border-t border-gray-100 my-1"></div>
        <button onClick={() => { setShowSettingsMenu(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-3 transition">
          <LogOut size={16} className="text-red-500" /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add Dropdown Menu
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl w-64 shadow-2xl border border-gray-100 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  if (isRefreshing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
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
        <header className="bg-white border-b-2 border-gray-100 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Revenue Management</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-green-600 font-medium mt-1">Customer Tariffs</span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => {
                  if (selectedGroup) {
                    fetchTariffs(selectedGroup.id);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 hover:text-gray-800"
                title="Refresh tariffs"
              >
                <RefreshCw size={18} className={loadingTariffs ? 'animate-spin' : ''} />
              </button>
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-9 h-9 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-center hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-500/25">
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="border-b border-gray-100 bg-white px-6">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === 'driver_tariffs';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`flex items-center gap-2 px-5 py-5 rounded-t-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Groups List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Customer Groups</h3>
                    </div>
                    <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2.5 py-1 rounded-full font-medium">
                      {userGroups.length}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by group name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition"
                    />
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                    </div>
                  ) : userGroups.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No groups found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {userGroups
                        .filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((group) => (
                          <button
                            key={group.id}
                            onClick={() => handleGroupSelect(group)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                              selectedGroup?.id === group.id
                                ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md ring-2 ring-green-500/20'
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-lg shadow-green-500/25">
                                  {group.name?.charAt(0) || 'G'}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                                    {group.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                    {group.description || 'No description'}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(group.is_active)}`}>
                                {getStatusIcon(group.is_active)}
                                {group.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span>Members: {group.members?.length || group.member_count || 0}</span>
                              <span>Created: {formatDate(group.created_at)}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Tariffs List */}
            <div className="lg:col-span-2">
              {selectedGroup ? (
                <>
                  {/* Group Info Card */}
                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-5 mb-5 shadow-lg shadow-green-500/25">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {selectedGroup.name}
                          </h3>
                          <p className="text-sm text-white/80">{selectedGroup.description || 'No description'}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/70">
                            <span>Members: {selectedGroup.members?.length || selectedGroup.member_count || 0}</span>
                            <span>•</span>
                            <span>Created: {formatDate(selectedGroup.created_at)}</span>
                            <span>•</span>
                            <span className={`flex items-center gap-1 ${rootTariffExists ? 'text-yellow-300' : 'text-gray-400'}`}>
                              <Crown size={12} />
                              {rootTariffExists ? 'Root ✓' : 'No Root'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleAddTariff}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 rounded-xl hover:bg-green-50 transition shadow-lg font-medium"
                      >
                        <Plus size={18} />
                        Add Tariff
                      </button>
                    </div>
                    {!rootTariffExists && tariffs.length > 0 && (
                      <div className="mt-3 text-xs text-white/70 bg-yellow-500/30 rounded-lg p-2 flex items-center gap-2">
                        <Info size={14} className="text-white/90" />
                        <span>ℹ️ No root tariff. Fallback will go to Charger/Hub level.</span>
                      </div>
                    )}
                  </div>

                  {/* Tariffs List */}
                  {loadingTariffs ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                  ) : tariffs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No Tariffs Found</p>
                      <p className="text-sm text-gray-400 mt-1">Create your first tariff for this group</p>
                      <button
                        onClick={handleAddTariff}
                        className="mt-4 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-500/25 font-medium"
                      >
                        <Plus size={16} className="inline mr-1" />
                        Create Tariff
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {tariffs.map((tariff) => {
                        const temporalRole = getTemporalRole(tariff);
                        const derivedStatus = getDerivedStatus(tariff);
                        const isRoot = temporalRole === 'root';
                        const RoleIcon = TARIFF_ROLE_ICONS[temporalRole] || Tag;
                        const roleColor = TARIFF_ROLE_COLORS[temporalRole] || 'blue';

                        return (
                          <div
                            key={tariff.id}
                            onClick={() => handleTariffClick(tariff)}
                            className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group ${
                              isRoot
                                ? 'border-purple-200 hover:border-purple-300'
                                : temporalRole === 'baseline'
                                ? 'border-blue-200 hover:border-blue-300'
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition ${
                                    isRoot
                                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                      : temporalRole === 'baseline'
                                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                      : 'bg-gradient-to-br from-green-500 to-emerald-600'
                                  }`}>
                                    <RoleIcon className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-semibold text-gray-900 truncate">
                                        Tariff #{tariff.id?.slice(0, 8) || 'N/A'}
                                      </h4>
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(tariff.is_active)}`}>
                                        {getStatusIcon(tariff.is_active)}
                                        {tariff.is_active ? 'Enabled' : 'Disabled'}
                                      </span>
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${roleColor}-100 text-${roleColor}-700`}>
                                        <RoleIcon size={12} className={`text-${roleColor}-500`} />
                                        {TARIFF_ROLE_DISPLAY[temporalRole]}
                                      </span>
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${derivedStatus.badgeColor}`}>
                                        {React.createElement(derivedStatus.icon, { size: 12, className: `text-${derivedStatus.color}-500` })}
                                        {derivedStatus.label}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                      <span className="text-sm font-bold text-green-600">
                                        {getPriceDisplay(tariff)}
                                      </span>
                                      <span className="text-xs text-gray-300">|</span>
                                      <span className="text-sm text-gray-500">
                                        Idle: {formatCurrency(tariff.idle_fee_per_min || 0)}/min
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                  <p className="text-xs text-gray-500">Currency</p>
                                  <p className="text-sm font-semibold text-gray-900">{tariff.currency || 'INR'}</p>
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                  {isRoot ? (
                                    <span className="flex items-center gap-1 text-purple-600 font-medium">
                                      <Infinity size={12} />
                                      No expiry (Root)
                                    </span>
                                  ) : tariff.start_date ? (
                                    <span className="flex items-center gap-1">
                                      <CalendarDays size={12} />
                                      {formatDate(tariff.start_date)}
                                      {tariff.end_date ? ` → ${formatDate(tariff.end_date)}` : ' → ∞'}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-emerald-600">
                                      <Infinity size={12} />
                                      No expiry
                                    </span>
                                  )}
                                  <span className="text-gray-300">|</span>
                                  <span>Price Type: {PRICE_TYPE_DISPLAY[tariff.price_type] || tariff.price_type || 'Energy'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTariffClick(tariff);
                                    }}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition"
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTariffClick(tariff);
                                      setTimeout(() => setIsEditing(true), 100);
                                    }}
                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                                    title="Edit Tariff"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Select a Customer Group</p>
                  <p className="text-sm text-gray-400 mt-1">Choose a group from the left to view its tariffs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tariff Detail Modal */}
      {showTariffDetail && selectedTariff && (
        <TariffDetailModal
          tariff={selectedTariff}
          onClose={() => {
            setShowTariffDetail(false);
            setSelectedTariff(null);
            setIsEditing(false);
            setError('');
            setUpdateSuccess('');
          }}
          onEditToggle={handleEditToggle}
          isEditing={isEditing}
          editFormData={editFormData}
          onEditChange={handleEditChange}
          onTemporalRoleSelect={handleTemporalRoleSelect}
          onUpdate={handleUpdateTariff}
          isUpdating={isUpdating}
          error={error}
          updateSuccess={updateSuccess}
          onDelete={() => {
            setDeletingTariffId(selectedTariff.id);
            setShowDeleteConfirm(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDeleteTariff}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingTariffId(null);
            setError('');
          }}
          isDeleting={isDeleting}
          error={error}
        />
      )}
    </div>
  );
};

export default CustomerTariff;
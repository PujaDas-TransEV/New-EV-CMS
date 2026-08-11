// src/components/Revenue/Settings.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings as SettingsIcon,
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
  Menu,
  RefreshCw,
  ArrowLeft,
  MoreVertical,
  Tag,
  FileText,
  Layers,
  Grid,
  List,
  DollarSign,
  Percent,
  IndianRupee,
  Receipt,
  BarChart,
  PieChart,
  Zap,
  Home,
  Briefcase,
  Calendar,
  Clock,
  X,
  AlertCircle,
  Shield,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Crown,
  File,
  FilePlus,
  ExternalLink,
  Info,
  HelpCircle,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Smartphone,
  Monitor,
  Tablet,
  Moon,
  Sun,
  Lock,
  Key,
  Bell,
  BellOff,
  Palette,
  Sliders,
  Hash,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  ListBullet,
  Link,
  Image,
  Video,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Trash,
  Archive,
  Save,
  Upload,
  DownloadCloud,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Database,
  Server,
  Cpu,
  HardDrive,
  MonitorPlay,
  MonitorStop,
  MonitorPause,
  Webcam,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  SpeakerOff,
  Tv,
  Radio,
  Podcast,
  Newspaper,
  Book,
  BookOpen,
  Bookmark,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FolderSearch,
  FileSearch,
  FileCheck,
  FileX,
  FileMinus,
  FilePlus as FilePlusIcon,
  FileSpreadsheet,
  FileText as FileTextIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileJson,
  FileXml,
  FileCss,
  FileHtml,
  FileJs,
  FileTs,
  FilePhp,
  FilePython,
  FileJava,
  FileCsharp,
  FileCpp,
  FileGo,
  FileRust,
  FileSwift,
  FileKotlin,
  FileRuby,
  FileDart,
  FileLua,
  FilePerl,
  FileShell,
  FileSql,
  FileYaml,
  FileToml,
  FileIni,
  FileConf,
  FileLog,
  FileLock,
  FileLock2,
  FileKey,
  FileSignature,
  FileCertificate,
  FileBadge,
  FileAward,
  FileHeart,
  FileStar,
  FileUser,
  FileUsers,
  FileClock,
  FileCalendar,
  FileCheck2,
  FileX2,
  FileMinus2,
  FilePlus2,
  FileSearch2,
  FileSpreadsheet2,
  FileText2,
  FileImage2,
  FileVideo2,
  FileAudio2,
  FileArchive2,
  FileCode2,
  FilePdf2,
  FileWord2,
  FileExcel2,
  FilePowerpoint2,
  FileJson2,
  FileXml2,
  FileCss2,
  FileHtml2,
  FileJs2,
  FileTs2,
  FilePhp2,
  FilePython2,
  FileJava2,
  FileCsharp2,
  FileCpp2,
  FileGo2,
  FileRust2,
  FileSwift2,
  FileKotlin2,
  FileRuby2,
  FileDart2,
  FileLua2,
  FilePerl2,
  FileShell2,
  FileSql2,
  FileYaml2,
  FileToml2,
  FileIni2,
  FileConf2,
  FileLog2,
  Camera,
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  SETTINGS_API: `${API_BASE_URL}/api/v1/cpo/settings`,
  SETTINGS_LOGO_API: `${API_BASE_URL}/api/v1/cpo/settings/invoice-logo`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const Settings = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');
  const [invoiceNote, setInvoiceNote] = useState('');
  const [invoiceLogoBlobUrl, setInvoiceLogoBlobUrl] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [modalInvoiceNote, setModalInvoiceNote] = useState('');
  const [modalInvoiceLogo, setModalInvoiceLogo] = useState(null);
  const [modalInvoiceLogoPreview, setModalInvoiceLogoPreview] = useState(null);
  const [modalInvoiceLogoFile, setModalInvoiceLogoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const blobUrlRef = useRef(null);

  // Tabs configuration - Hub Tariffs instead of Aggregation Fee
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart, path: '/revenue/overview' },
    { id: 'driver_tariffs', label: 'Customer Tariffs', icon: Users, path: '/revenue/customer-tariffs' },
    { id: 'charger_tariffs', label: 'Charger Tariffs', icon: Zap, path: '/revenue/charger-tariffs' },
    { id: 'hub_tariffs', label: 'Hub Tariffs', icon: Layers, path: '/revenue/hub-tariffs' },
    { id: 'tax', label: 'Tax', icon: Receipt, path: '/revenue/tax' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/revenue/settings' }
  ];

  // Fetch user info and settings
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchSettings();
    fetchInvoiceLogo();
    
    // Cleanup blob URL on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
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
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  // Fetch settings using GET /api/v1/cpo/settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.SETTINGS_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.invoice_note) {
          setInvoiceNote(data.invoice_note);
        }
      } else {
        console.log('No settings found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [authenticatedRequest]);

  // Fetch invoice logo using GET /api/v1/cpo/settings/invoice-logo
  const fetchInvoiceLogo = useCallback(async () => {
    try {
      // Revoke old blob URL if exists
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      const response = await authenticatedRequest(API_CONFIG.SETTINGS_LOGO_API, {
        method: 'GET',
        headers: {
          'X-CPO-App-ID': CPO_APP_ID,
        }
      });

      if (response.ok) {
        // Check if response is JSON or binary
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // If JSON response
          const data = await response.json();
          if (data.invoice_logo) {
            const logoPath = data.invoice_logo.startsWith('http') 
              ? data.invoice_logo 
              : `${API_BASE_URL}/${data.invoice_logo}`;
            setInvoiceLogoBlobUrl(logoPath);
          }
        } else {
          // If binary image response
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          blobUrlRef.current = imageUrl;
          setInvoiceLogoBlobUrl(imageUrl);
        }
      } else {
        console.log('No invoice logo found');
        setInvoiceLogoBlobUrl(null);
      }
    } catch (error) {
      console.error('Error fetching invoice logo:', error);
      setInvoiceLogoBlobUrl(null);
    }
  }, [authenticatedRequest]);

  // Save settings using multipart/form-data POST /api/v1/cpo/settings
  const saveSettings = useCallback(async (note, logoFile) => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      
      if (note) {
        formData.append('invoice_note', note);
      }
      
      if (logoFile) {
        formData.append('invoice_logo', logoFile);
      }

      const response = await authenticatedRequest(API_CONFIG.SETTINGS_API, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Invoice settings saved successfully!');
        
        if (data.invoice_note) {
          setInvoiceNote(data.invoice_note);
        }
        
        // Refresh logo after upload
        await fetchInvoiceLogo();
        
        setTimeout(() => setSuccess(''), 3000);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error?.message || 'Failed to save settings');
        return false;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('An error occurred while saving settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [authenticatedRequest, fetchInvoiceLogo]);

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
    setActiveTab(tabId);
    navigate(path);
  };

  // Open Invoice Settings Modal
  const handleOpenInvoiceModal = () => {
    setModalInvoiceNote(invoiceNote);
    setModalInvoiceLogo(invoiceLogoBlobUrl);
    setModalInvoiceLogoPreview(invoiceLogoBlobUrl);
    setModalInvoiceLogoFile(null);
    setShowInvoiceModal(true);
    setError('');
    setSuccess('');
  };

  // Close Invoice Settings Modal
  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    setModalInvoiceNote('');
    setModalInvoiceLogo(null);
    setModalInvoiceLogoPreview(null);
    setModalInvoiceLogoFile(null);
    setError('');
    setSuccess('');
  };

  // Handle Logo Upload in Modal
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setModalInvoiceLogoPreview(base64String);
        setModalInvoiceLogoFile(file);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Failed to upload logo');
      setIsUploading(false);
    }
  };

  // Handle Remove Logo
  const handleRemoveLogo = () => {
    setModalInvoiceLogoPreview(null);
    setModalInvoiceLogoFile(null);
  };

  // Handle Save Invoice Settings
  const handleSaveInvoiceSettings = async () => {
    const saved = await saveSettings(modalInvoiceNote, modalInvoiceLogoFile);
    
    if (saved) {
      setTimeout(() => {
        handleCloseInvoiceModal();
      }, 1500);
    }
  };

  const handleGuidelinesClick = () => {
    window.open('https://transev.com/invoicing-guidelines', '_blank');
  };

  // Settings Dropdown Menu - Black Background
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

  // Add Dropdown Menu - Black Background (only Add Hub and Add Charger)
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button onClick={() => { setShowAddMenu(false); navigate("/add-hub"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
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
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Revenue Management</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-600 font-medium mt-1">Settings</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <SettingsIcon size={20} className="text-gray-600" />
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

        {/* Tabs - Settings tab active with green color */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === 'settings';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition ${
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

        {/* Main Content */}
        <div className="p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Invoice Logo/Icon */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 flex flex-col items-center justify-center">
                  {/* Invoice Logo Display */}
                  <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 overflow-hidden">
                    {invoiceLogoBlobUrl ? (
                      <img 
                        src={invoiceLogoBlobUrl} 
                        alt="Invoice Logo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FileText size={64} className="text-white" />
                    )}
                    {invoiceLogoBlobUrl && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Logo</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Invoice Settings</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">
                    Configure your invoice logo and note
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>{invoiceLogoBlobUrl ? 'Logo uploaded' : 'No logo uploaded'}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>{invoiceNote ? 'Note added' : 'No note added'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right content - Invoice Settings */}
            <div className="lg:col-span-9">
              {/* Invoice Management Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <FileText size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Invoice Configuration</h3>
                      <p className="text-sm text-gray-500">Manage your invoice logo and note</p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenInvoiceModal}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25 font-medium"
                  >
                    <SettingsIcon size={20} />
                    Configure Invoice
                  </button>
                </div>
              </div>

              {/* Current Settings Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Current Invoice Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice Logo</p>
                    <div className="mt-2 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      {invoiceLogoBlobUrl ? (
                        <img 
                          src={invoiceLogoBlobUrl} 
                          alt="Logo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FileText size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice Note</p>
                    <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[60px]">
                      {invoiceNote ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoiceNote}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No invoice note set</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Flow, Invoicing & Tax Guidelines */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HelpCircle size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={handleGuidelinesClick}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-base hover:underline transition group"
                    >
                      Payment Flow, Invoicing & Tax Guidelines
                      <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      Click to view detailed documentation on payment processing, invoicing best practices, and tax compliance guidelines.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                        <FileText size={14} />
                        Payment Flow
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                        <FileText size={14} />
                        Invoicing
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                        <FileText size={14} />
                        Tax Guidelines
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Settings Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseInvoiceModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Invoice Settings</h3>
                  </div>
                  <button
                    onClick={handleCloseInvoiceModal}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Configure your invoice logo and note</p>
              </div>

              <div className="px-6 py-6">
                {/* Logo Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {modalInvoiceLogoPreview ? (
                        <>
                          <img src={modalInvoiceLogoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={handleRemoveLogo}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <FileText size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="modal-logo-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        <Camera size={16} />
                        Upload Logo
                      </label>
                      <input
                        id="modal-logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (max 5MB)</p>
                      {isUploading && (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-xs text-gray-500">Uploading...</span>
                        </div>
                      )}
                      {modalInvoiceLogoFile && (
                        <p className="text-xs text-green-600 mt-1">
                          <CheckCircle size={12} className="inline mr-1" />
                          File selected: {modalInvoiceLogoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Note
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    This note will appear at the bottom of all invoices
                  </p>
                  <textarea
                    placeholder="Enter invoice note (e.g., Payment terms, late fee policy, etc.)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                    rows="4"
                    value={modalInvoiceNote}
                    onChange={(e) => setModalInvoiceNote(e.target.value)}
                  />
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle size={16} className="flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveInvoiceSettings}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Settings
                    </>
                  )}
                </button>
                <button
                  onClick={handleCloseInvoiceModal}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
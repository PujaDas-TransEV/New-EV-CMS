import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  Zap,
  Plug,
  Battery,
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
  Eye,
  EyeOff,
  Download,
  Copy,
  Share2,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Edit,
  Trash2,
  Link as LinkIcon,
  Server,
  Layers,
  Info,
  Loader2,
  Image as ImageIcon,
  AlertTriangle,
  Save,
  Upload,
  Phone,
  Cpu,
  Gauge,
  Home,
  Navigation,
  Hash,
  FileText,
  Database,
  RadioTower,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  ShieldCheck,
  Link2,
  Smartphone,
  Network,
  Mail,
  Building2,
  Tag,
  Box,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  CHARGER_DETAILS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  CHARGER_IMAGE_API: (chargerId) => `${API_BASE_URL}/api/v1/cpo/chargers/${chargerId}/image`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return { success: false, error: 'No refresh token available' };
  }

  try {
    const response = await fetch(API_CONFIG.REFRESH_TOKEN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CPO-App-ID': CPO_APP_ID
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await response.json();

    if (response.ok && data.access_token) {
      localStorage.setItem('token', data.access_token);
      
      if (data.expires_in) {
        localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));
      }
      
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return { success: true, token: data.access_token };
    } else {
      return { success: false, error: data.message || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

const fetchWithTokenRefresh = async (url, options = {}, retryCount = 2) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'X-CPO-App-ID': CPO_APP_ID,
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 401 && retryCount > 0) {
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
          }
        });
        
        if (retryResponse.ok) {
          return retryResponse;
        } else if (retryResponse.status === 401 && retryCount > 1) {
          return fetchWithTokenRefresh(url, options, retryCount - 1);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('userInfo');
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const ChargerDetails = () => {
  const navigate = useNavigate();
  const { chargerId } = useParams();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState('ws');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    charger_name: '',
    charger_host_name: '',
    charger_host_phone_no: '',
    charger_type: '',
    segment: '',
    sub_segment: '',
    protocol: '',
    parking: '',
    twenty_four_seven_open_status: false,
    max_power_kw: '',
    serial_number: '',
    charger_use_type: '',
    hub_id: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Connector edit states
  const [editingConnectors, setEditingConnectors] = useState([]);
  const [connectorError, setConnectorError] = useState('');
  
  // Charger data
  const [charger, setCharger] = useState(null);
  const [chargerImage, setChargerImage] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);

  // Options for select fields
  const chargerTypeOptions = [
    { value: "DC", label: "DC Charger" },
    { value: "AC", label: "AC Charger" }
  ];

  const segmentOptions = [
    { value: "Commercial", label: "Commercial" },
    { value: "Residential", label: "Residential" },
    { value: "Industrial", label: "Industrial" },
    { value: "Public", label: "Public" },
    { value: "Fleet", label: "Fleet" }
  ];

  const subsegmentOptions = [
    { value: "Mall", label: "Mall" },
    { value: "Office", label: "Office" },
    { value: "Home", label: "Home" },
    { value: "Hotel", label: "Hotel" },
    { value: "Restaurant", label: "Restaurant" },
    { value: "Hospital", label: "Hospital" },
    { value: "Parking Lot", label: "Parking Lot" },
    { value: "Highway", label: "Highway" }
  ];

  const parkingOptions = [
    { value: "Dedicated", label: "Dedicated Parking" },
    { value: "Shared", label: "Shared Parking" },
    { value: "Street", label: "Street Parking" },
    { value: "Garage", label: "Garage" },
    { value: "None", label: "None" }
  ];

  const protocolOptions = [
    { value: "OCPP1.6-J", label: "OCPP 1.6-J" },
    { value: "OCPP2.0-J", label: "OCPP 2.0-J" },
    { value: "OCPP1.5-J", label: "OCPP 1.5-J" },
    { value: "ISO15118-J", label: "ISO 15118-J" }
  ];

  const chargerUseTypeOptions = [
    { value: "Public", label: "Public" },
    { value: "Private", label: "Private" }
  ];

  const connectorTypeOptions = [
    { value: "CCS1", label: "CCS1" },
    { value: "CCS2", label: "CCS2" },
    { value: "CHAdeMO", label: "CHAdeMO" },
    { value: "Type2", label: "Type 2" },
    { value: "Type1", label: "Type 1" },
    { value: "GB/T", label: "GB/T" }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchChargerDetails();
  }, [chargerId]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
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

  const fetchChargerDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetchWithTokenRefresh(`${API_CONFIG.CHARGER_DETAILS_API}/${chargerId}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const chargerData = data.charger || data.data || data;
        setCharger(chargerData);
        setEditFormData({
          charger_name: chargerData.charger_name || '',
          charger_host_name: chargerData.charger_host_name || '',
          charger_host_phone_no: chargerData.charger_host_phone_no || '',
          charger_type: chargerData.charger_type || '',
          segment: chargerData.segment || '',
          sub_segment: chargerData.sub_segment || '',
          protocol: chargerData.protocol || '',
          parking: chargerData.parking || '',
          twenty_four_seven_open_status: chargerData.twenty_four_seven_open_status || false,
          max_power_kw: chargerData.max_power_kw || '',
          serial_number: chargerData.serial_number || '',
          charger_use_type: chargerData.charger_use_type || '',
          hub_id: chargerData.hub_id || ''
        });
        
        // Initialize editing connectors with current connectors
        if (chargerData.connectors && chargerData.connectors.length > 0) {
          setEditingConnectors(chargerData.connectors.map(conn => ({
            ...conn,
            isNew: false,
            isDeleted: false
          })));
        } else {
          setEditingConnectors([]);
        }
        
        if (chargerData.charger_image) {
          fetchChargerImage(chargerData.charger_id || chargerId);
        }
      } else {
        setError(data.message || data.error?.message || 'Failed to fetch charger details');
      }
    } catch (error) {
      console.error('Error fetching charger details:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchChargerImage = async (id) => {
    setImageLoading(true);
    setImageError(false);
    
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.CHARGER_IMAGE_API(id), {
        method: 'GET'
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setChargerImage(imageUrl);
      } else {
        setImageError(true);
      }
    } catch (error) {
      console.error('Error fetching charger image:', error);
      setImageError(true);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteCharger = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    
    try {
      const response = await fetchWithTokenRefresh(`${API_CONFIG.CHARGER_DETAILS_API}/${chargerId}`, {
        method: 'DELETE'
      });

      if (response.status === 204) {
        navigate('/charger-session');
      } else {
        const data = await response.json();
        setError(data.message || data.error?.message || 'Failed to delete charger');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting charger:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddConnector = () => {
    const newConnector = {
      id: `new-${Date.now()}`,
      connector_number: editingConnectors.filter(c => !c.isDeleted).length + 1,
      connector_type: '',
      connector_total_capacity: 0,
      isNew: true,
      isDeleted: false
    };
    setEditingConnectors([...editingConnectors, newConnector]);
  };

  const handleRemoveConnector = (index) => {
    const updatedConnectors = [...editingConnectors];
    if (updatedConnectors[index].isNew) {
      updatedConnectors.splice(index, 1);
    } else {
      updatedConnectors[index].isDeleted = true;
    }
    setEditingConnectors(updatedConnectors);
  };

  const handleConnectorChange = (index, field, value) => {
    const updatedConnectors = [...editingConnectors];
    updatedConnectors[index][field] = value;
    setEditingConnectors(updatedConnectors);
  };

  const handleEditCharger = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setConnectorError('');

    try {
      // Build the main payload according to the schema
      const payload = {
        charger_name: editFormData.charger_name,
        charger_host_name: editFormData.charger_host_name,
        charger_host_phone_no: editFormData.charger_host_phone_no,
        charger_type: editFormData.charger_type,
        segment: editFormData.segment,
        sub_segment: editFormData.sub_segment,
        protocol: editFormData.protocol,
        parking: editFormData.parking,
        twenty_four_seven_open_status: editFormData.twenty_four_seven_open_status,
        max_power_kw: parseFloat(editFormData.max_power_kw) || 0,
        serial_number: editFormData.serial_number,
        charger_use_type: editFormData.charger_use_type,
        number_of_connectors: editingConnectors.filter(c => !c.isDeleted).length
      };

      // Add hub_id if present
      if (editFormData.hub_id) {
        payload.hub_id = editFormData.hub_id;
      }

      // Include connectors in the payload with proper structure
      const connectorsToSend = editingConnectors
        .filter(c => !c.isDeleted)
        .map(c => {
          const connectorData = {
            connector_number: parseInt(c.connector_number) || 0,
            connector_type: c.connector_type || '',
            connector_total_capacity: parseFloat(c.connector_total_capacity) || 0
          };
          
          // Include id for existing connectors (not new ones)
          if (!c.isNew && c.id) {
            connectorData.id = c.id;
          }
          
          return connectorData;
        });

      // Only add connectors if there are any
      if (connectorsToSend.length > 0) {
        payload.connectors = connectorsToSend;
      }

      console.log('📝 Full Payload:', JSON.stringify(payload, null, 2));

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      
      // Add image if selected - NEW IMAGE WILL REPLACE OLD ONE
      if (imageFile) {
        formData.append('charger_image', imageFile);
        console.log('🖼️ New image selected, will replace old image:', imageFile.name);
      }

      const url = `${API_CONFIG.CHARGER_DETAILS_API}/${chargerId}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-CPO-App-ID': CPO_APP_ID
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        const updatedCharger = data.charger || data.data || data;
        console.log('✅ Charger updated successfully:', updatedCharger);
        
        setCharger(updatedCharger);
        setEditFormData({
          charger_name: updatedCharger.charger_name || '',
          charger_host_name: updatedCharger.charger_host_name || '',
          charger_host_phone_no: updatedCharger.charger_host_phone_no || '',
          charger_type: updatedCharger.charger_type || '',
          segment: updatedCharger.segment || '',
          sub_segment: updatedCharger.sub_segment || '',
          protocol: updatedCharger.protocol || '',
          parking: updatedCharger.parking || '',
          twenty_four_seven_open_status: updatedCharger.twenty_four_seven_open_status || false,
          max_power_kw: updatedCharger.max_power_kw || '',
          serial_number: updatedCharger.serial_number || '',
          charger_use_type: updatedCharger.charger_use_type || '',
          hub_id: updatedCharger.hub_id || ''
        });
        
        // Update connectors in state
        if (updatedCharger.connectors) {
          setEditingConnectors(updatedCharger.connectors.map(c => ({
            ...c,
            isNew: false,
            isDeleted: false
          })));
        }
        
        // Refresh image if updated - NEW IMAGE WILL BE SHOWN
        if (updatedCharger.charger_image) {
          setChargerImage(null);
          fetchChargerImage(updatedCharger.charger_id || chargerId);
        }
        
        setIsEditMode(false);
        setImageFile(null);
        setImagePreview(null);
        setError('');
        setConnectorError('');
      } else {
        console.error('❌ Update failed:', data);
        setError(data.error?.message || data.message || 'Failed to update charger');
      }
    } catch (error) {
      console.error('❌ Error updating charger:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      if (token) {
        await fetch(API_CONFIG.LOGOUT_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      navigate('/signin');
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const handleCopyUrl = () => {
    const url = getConnectionUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const svgElement = document.querySelector('#charger-qr-code svg');
    if (svgElement) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `charger-${charger?.charger_id || 'qr'}-code.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const getConnectionUrl = () => {
    if (selectedProtocol === 'wss') {
      return charger?.charger_connection_url_wss || `wss://${charger?.charger_id || 'charger'}.transev.com`;
    }
    return charger?.charger_connection_url_ws || `ws://${charger?.charger_id || 'charger'}.transev.com`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
      'CHARGING': 'bg-blue-100 text-blue-700 border-blue-200',
      'PREPARING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'SUSPENDED_EV': 'bg-orange-100 text-orange-700 border-orange-200',
      'SUSPENDED_EVSE': 'bg-orange-100 text-orange-700 border-orange-200',
      'FINISHING': 'bg-purple-100 text-purple-700 border-purple-200',
      'RESERVED': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'UNAVAILABLE': 'bg-red-100 text-red-700 border-red-200',
      'FAULTED': 'bg-red-100 text-red-700 border-red-200',
      'OFFLINE': 'bg-gray-100 text-gray-700 border-gray-200',
      'UNDER_MAINTENANCE': 'bg-amber-100 text-amber-700 border-amber-200',
      'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
      'INACTIVE': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'AVAILABLE':
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'CHARGING':
        return <Zap className="w-4 h-4" />;
      case 'OFFLINE':
        return <WifiOff className="w-4 h-4" />;
      case 'FAULTED':
      case 'UNAVAILABLE':
      case 'INACTIVE':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getConnectorTypeColor = (type) => {
    const colors = {
      'CCS1': 'bg-blue-100 text-blue-700 border-blue-200',
      'CCS2': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'CHAdeMO': 'bg-red-100 text-red-700 border-red-200',
      'Type2': 'bg-green-100 text-green-700 border-green-200',
      'Type1': 'bg-purple-100 text-purple-700 border-purple-200',
      'GB/T': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getConnectorIcon = (type) => {
    switch(type) {
      case 'CCS1':
      case 'CCS2':
        return <Zap className="w-4 h-4" />;
      case 'CHAdeMO':
        return <Plug className="w-4 h-4" />;
      case 'Type2':
      case 'Type1':
        return <Plug className="w-4 h-4" />;
      default:
        return <Plug className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
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

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || 'User'}
            </h4>
            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email || 'user@transev.com'}
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
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-charger");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete Charger</h3>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{charger?.charger_name || 'this charger'}</span>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This action will permanently remove the charger and all its associated data. This cannot be undone.
        </p>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteCharger}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Delete Charger
              </>
            )}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600">{error || 'Charger not found'}</p>
            <button
              onClick={() => navigate('/charger-session')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Back to Chargers
            </button>
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
        userName={userData?.user?.full_name || 'User'}
        userEmail={userData?.user?.email || ''}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-4 sm:px-6 py-4 sm:py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate('/charger-session')}
                className="p-2 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                  {isEditMode ? 'Edit Charger' : 'Charger Details'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative flex-shrink-0">
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
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Charger Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Image Section - Click to Upload */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div 
                  className="p-4 sm:p-6 cursor-pointer"
                  onClick={handleImageClick}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charger Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <div className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed rounded-xl transition bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-green-400">
                      {(imagePreview || chargerImage) ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={imagePreview || chargerImage} 
                            alt="Preview" 
                            className="w-full h-full object-contain rounded-xl p-2" 
                          />
                          {isEditMode && (
                            <>
                              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                <div className="text-white text-sm font-medium flex items-center gap-2">
                                  <Upload size={20} />
                                  Click to change image
                                </div>
                              </div>
                              {imageFile && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageFile(null);
                                    setImagePreview(null);
                                  }}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </>
                          )}
                          {!isEditMode && (
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              Click to change image
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 px-4">
                          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-500 text-center">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  {isEditMode && imageFile && (
                    <p className="mt-2 text-sm text-green-600">✓ New image selected: {imageFile.name}</p>
                  )}
                  {isEditMode && (
                    <p className="mt-1 text-xs text-gray-400">Click on the image to upload a new one</p>
                  )}
                </div>
              </div>

              {/* Status & Basic Info */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                {isEditMode ? (
                  // Edit Mode Form
                  <form onSubmit={handleEditCharger} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charger Name *</label>
                        <input
                          type="text"
                          name="charger_name"
                          value={editFormData.charger_name}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter charger name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                        <input
                          type="text"
                          name="serial_number"
                          value={editFormData.serial_number}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter serial number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Host Name</label>
                        <input
                          type="text"
                          name="charger_host_name"
                          value={editFormData.charger_host_name}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter host name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Host Phone</label>
                        <input
                          type="text"
                          name="charger_host_phone_no"
                          value={editFormData.charger_host_phone_no}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charger Type</label>
                        <select
                          name="charger_type"
                          value={editFormData.charger_type}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Type</option>
                          {chargerTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Power (kW)</label>
                        <input
                          type="number"
                          name="max_power_kw"
                          value={editFormData.max_power_kw}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter max power"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                        <select
                          name="segment"
                          value={editFormData.segment}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Segment</option>
                          {segmentOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Segment</label>
                        <select
                          name="sub_segment"
                          value={editFormData.sub_segment}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Sub Segment</option>
                          {subsegmentOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Protocol</label>
                        <select
                          name="protocol"
                          value={editFormData.protocol}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Protocol</option>
                          {protocolOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
                        <select
                          name="parking"
                          value={editFormData.parking}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Parking</option>
                          {parkingOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charger Use Type</label>
                        <select
                          name="charger_use_type"
                          value={editFormData.charger_use_type}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Use Type</option>
                          {chargerUseTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hub ID</label>
                        <input
                          type="text"
                          name="hub_id"
                          value={editFormData.hub_id}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter hub ID"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="twenty_four_seven_open_status"
                        id="twenty_four_seven_open_status"
                        checked={editFormData.twenty_four_seven_open_status}
                        onChange={handleFormChange}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="twenty_four_seven_open_status" className="text-sm font-medium text-gray-700">
                        Open 24/7
                      </label>
                    </div>

                    {/* Connectors Section in Edit Mode */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Plug size={16} />
                          Connectors ({editingConnectors.filter(c => !c.isDeleted).length})
                        </h4>
                        {/* <button
                          type="button"
                          onClick={handleAddConnector}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-sm"
                        >
                          <PlusCircle size={16} />
                          Add Connector
                        </button> */}
                      </div>

                      {connectorError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-3">
                          {connectorError}
                        </div>
                      )}

                      <div className="space-y-3">
                        {editingConnectors.filter(c => !c.isDeleted).map((connector, index) => {
                          const actualIndex = editingConnectors.findIndex(c => c.id === connector.id);
                          return (
                            <div key={connector.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700">
                                  Connector #{connector.connector_number || index + 1}
                                  {connector.isNew && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">New</span>
                                  )}
                                  {!connector.isNew && connector.id && (
                                    <span className="ml-2 text-xs text-gray-400">ID: {connector.id.slice(0, 8)}</span>
                                  )}
                                </span>
                                {/* <button
                                  type="button"
                                  onClick={() => handleRemoveConnector(actualIndex)}
                                  className="text-red-500 hover:text-red-700 transition p-1 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={16} />
                                </button> */}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Connector Number *</label>
                                  <input
                                    type="number"
                                    value={connector.connector_number || ''}
                                    onChange={(e) => handleConnectorChange(actualIndex, 'connector_number', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    placeholder="e.g., 1"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Connector Type *</label>
                                  <select
                                    value={connector.connector_type || ''}
                                    onChange={(e) => handleConnectorChange(actualIndex, 'connector_type', e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    required
                                  >
                                    <option value="">Select Type</option>
                                    {connectorTypeOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Capacity (kW)</label>
                                  <input
                                    type="number"
                                    value={connector.connector_total_capacity || ''}
                                    onChange={(e) => handleConnectorChange(actualIndex, 'connector_total_capacity', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    placeholder="e.g., 50"
                                  />
                                </div>
                              </div>
                              {!connector.isNew && connector.id && (
                                <div className="mt-2 text-xs text-gray-400">
                                  Connector ID: {connector.id}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {editingConnectors.filter(c => !c.isDeleted).length === 0 && (
                          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <Plug className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No connectors added yet</p>
                            <button
                              type="button"
                              onClick={handleAddConnector}
                              className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              + Add your first connector
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditMode(false);
                          setImageFile(null);
                          setImagePreview(null);
                          setError('');
                          setConnectorError('');
                          // Reset connectors to original state
                          if (charger?.connectors) {
                            setEditingConnectors(charger.connectors.map(c => ({
                              ...c,
                              isNew: false,
                              isDeleted: false
                            })));
                          } else {
                            setEditingConnectors([]);
                          }
                        }}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`p-3 rounded-2xl flex-shrink-0 ${getStatusColor(charger.status)}`}>
                          {getStatusIcon(charger.status)}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                            {charger.charger_name || 'Unnamed Charger'}
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                              ID: {charger.charger_id || 'N/A'}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full hidden xs:block"></span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charger.status)}`}>
                              {charger.status || 'PENDING'}
                            </span>
                           
                       {charger.hub_id && (
  <>
    <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
      <Building2 size={14} className="text-purple-600" />
      <span className="font-semibold text-purple-800">Hub:</span>
      <span className="font-medium text-purple-900">{charger.hub_name || 'N/A'}</span>
      {charger.hub_id && (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-teal-600 text-white px-2.5 py-0.5 rounded-full ml-1 font-bold tracking-wider shadow-sm">
          <span className="text-blue-200 text-[10px]">ID:</span>
          {charger.hub_id.slice(0, 8)}
        </span>
      )}
    </span>
  </>
)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setIsEditMode(true);
                            if (charger?.connectors) {
                              setEditingConnectors(charger.connectors.map(c => ({
                                ...c,
                                isNew: false,
                                isDeleted: false
                              })));
                            }
                          }}
                          className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Edit size={16} />
                          <span className="hidden xs:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm flex items-center justify-center gap-2 border border-red-200"
                        >
                          <Trash2 size={16} />
                          <span className="hidden xs:inline">Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Details Grid - Modern Card Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
                      <DetailCard icon={<Hash size={14} />} label="Charger ID" value={charger.charger_id || 'N/A'} />
                      <DetailCard icon={<Tag size={14} />} label="Charger Name" value={charger.charger_name || 'N/A'} />
                      <DetailCard icon={<Box size={14} />} label="Serial Number" value={charger.serial_number || 'N/A'} />
                      <DetailCard icon={<Zap size={14} />} label="Max Power" value={`${charger.max_power_kw || 0} kW`} />
                      <DetailCard icon={<Plug size={14} />} label="Charger Type" value={charger.charger_type || 'N/A'} />
                      <DetailCard icon={<Activity size={14} />} label="Status" value={charger.status || 'N/A'} status={charger.status} />
                      <DetailCard icon={<User size={14} />} label="Host Name" value={charger.charger_host_name || 'N/A'} />
                      <DetailCard icon={<Phone size={14} />} label="Host Phone" value={charger.charger_host_phone_no || 'N/A'} />
                      <DetailCard icon={<Building2 size={14} />} label="Hub ID" value={charger.hub_id ? charger.hub_id.slice(0, 8) + '...' : 'N/A'} />
                      <DetailCard icon={<Globe size={14} />} label="Segment" value={charger.segment || 'N/A'} />
                      <DetailCard icon={<MapPin size={14} />} label="Sub Segment" value={charger.sub_segment || 'N/A'} />
                      <DetailCard icon={<Network size={14} />} label="Protocol" value={charger.protocol || 'N/A'} />
                      <DetailCard icon={<ClockIcon size={14} />} label="24/7 Open" value={charger.twenty_four_seven_open_status ? 'Yes' : 'No'} />
                      <DetailCard icon={<RadioTower size={14} />} label="OCPP Identity" value={charger.ocpp_identity || 'N/A'} />
                      <DetailCard icon={<Mail size={14} />} label="Email" value={charger.email || 'N/A'} />
                      <DetailCard icon={<Database size={14} />} label="Parking" value={charger.parking || 'N/A'} />
                      <DetailCard icon={<ShieldCheck size={14} />} label="Use Type" value={charger.charger_use_type || 'N/A'} />
                      <DetailCard icon={<FileText size={14} />} label="Connectors" value={charger.connectors?.length || 0} />
                    </div>

                    {/* Connectors Section - Beautiful Colored Cards */}
                    {charger.connectors && charger.connectors.length > 0 && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                          <Plug size={16} className="text-green-600" />
                          Connectors ({charger.connectors.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {charger.connectors.map((conn, idx) => {
                            const typeColor = getConnectorTypeColor(conn.connector_type);
                            const connIcon = getConnectorIcon(conn.connector_type);
                            
                            return (
                              <div key={conn.id || idx} 
                                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${typeColor}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/50`}>
                                      {connIcon}
                                    </div>
                                    <div>
                                      <span className="text-sm font-bold">
                                        Connector #{conn.connector_number}
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/70 px-2.5 py-1 rounded-full shadow-sm">
                      <Tag size={12} className="text-gray-500" />
                      <span className="font-semibold">Connector Type:</span>
                      <span>{conn.connector_type || 'N/A'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/70 px-2.5 py-1 rounded-full shadow-sm">
                      <Zap size={12} className="text-yellow-500" />
                      <span className="font-semibold">Connector Capacity:</span>
                      <span>{conn.connector_total_capacity || 0} kW</span>
                    </span>
                  </div>
                                    </div>
                                  </div>
                                 <div className="flex flex-col items-end">
  {conn.id && (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-white/60 px-2 py-0.5 rounded-full shadow-sm">
      <Hash size={10} className="opacity-60" />
      <span className="font-semibold text-gray-600">ID:</span>
      <span className="text-gray-700 font-medium">{conn.id.slice(0, 6)}</span>
    </span>
  )}
</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Created: {formatDate(charger.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw size={12} />
                        Updated: {formatDate(charger.updated_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database size={12} />
                        Assigned: {charger.assigned ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - QR Code & Connection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 sticky top-24">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                    <QrCode size={18} className="text-green-600" />
                    Charger QR Code
                  </h4>
                  <div id="charger-qr-code" className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block mx-auto">
                    <QRCodeSVG
                      value={charger.charger_id || 'charger-id'}
                      size={180}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-800">Charger ID</p>
                    <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                      {charger.charger_id || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    className="mt-4 w-full px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                  >
                    <Download size={16} />
                    Download QR Code
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <LinkIcon size={16} className="text-green-600" />
                    Connection URL
                  </h4>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setSelectedProtocol('wss')}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedProtocol === 'wss'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      WSS (Secure)
                    </button>
                    <button
                      onClick={() => setSelectedProtocol('ws')}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedProtocol === 'ws'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      WS (Standard)
                    </button>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <input
                      type="text"
                      value={getConnectionUrl()}
                      readOnly
                      className="flex-1 text-xs font-mono text-gray-600 bg-transparent outline-none min-w-0"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="p-2 text-gray-500 hover:text-green-600 transition rounded-lg hover:bg-green-50 flex-shrink-0"
                      title="Copy URL"
                    >
                      {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {selectedProtocol === 'wss' ? 'Secure WebSocket connection' : 'Standard WebSocket connection'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </div>
  );
};

// Detail Card Component
const DetailCard = ({ icon, label, value, status }) => {
  const isStatus = label === 'Status';
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-400">{icon}</span>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
      {isStatus && status ? (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          {value}
        </span>
      ) : (
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      )}
    </div>
  );
};

// Helper functions for DetailCard
const getStatusColor = (status) => {
  const colors = {
    'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
    'CHARGING': 'bg-blue-100 text-blue-700 border-blue-200',
    'PREPARING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'SUSPENDED_EV': 'bg-orange-100 text-orange-700 border-orange-200',
    'SUSPENDED_EVSE': 'bg-orange-100 text-orange-700 border-orange-200',
    'FINISHING': 'bg-purple-100 text-purple-700 border-purple-200',
    'RESERVED': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'UNAVAILABLE': 'bg-red-100 text-red-700 border-red-200',
    'FAULTED': 'bg-red-100 text-red-700 border-red-200',
    'OFFLINE': 'bg-gray-100 text-gray-700 border-gray-200',
    'UNDER_MAINTENANCE': 'bg-amber-100 text-amber-700 border-amber-200',
    'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
    'INACTIVE': 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status) => {
  switch(status?.toUpperCase()) {
    case 'AVAILABLE':
    case 'ACTIVE':
      return <CheckCircle className="w-3 h-3" />;
    case 'CHARGING':
      return <Zap className="w-3 h-3" />;
    case 'OFFLINE':
      return <WifiOff className="w-3 h-3" />;
    case 'FAULTED':
    case 'UNAVAILABLE':
    case 'INACTIVE':
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

export default ChargerDetails;
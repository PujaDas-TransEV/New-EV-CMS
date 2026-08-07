import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Copy, 
  Settings, 
  Plus, 
  ChevronDown, 
  LogOut, 
  User, 
  Building, 
  Phone, 
  MapPin, 
  Zap, 
  Loader2,
  AlertCircle,
  Check,
  X,
  Shield,
  Clock,
  Calendar,
  Mail,
  Upload,
  Image,
  Plug,
  Trash2,
  Globe2,
  QrCode,
  Download,
  Share2,
  Layers,
  Info,
  ArrowLeft,
  Wifi,
  Cpu,
  Gauge,
  Battery
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.log('No refresh token found');
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
    console.log('Refresh token response:', data);

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
      console.log('Refresh token failed:', data);
      return { success: false, error: data.message || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

const fetchWithTokenRefresh = async (url, options = {}, retryCount = 3) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  console.log('Fetching URL:', url);

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
      console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
      
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        console.log('Token refreshed successfully, retrying request...');
        
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
        console.log('Refresh token failed, redirecting to login...');
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

const steps = [
  "Basic Info",
  "Hardware",
  "Usage & Owner",
];

// Memoized Input component
const Input = memo(({ label, name, value, onChange, type = "text", placeholder = "", readOnly = false, required = false, icon: Icon }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative mt-1.5">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition ${
          readOnly ? 'cursor-not-allowed opacity-80 bg-gray-100' : 'hover:border-green-300'
        } ${Icon ? 'pl-10' : ''}`}
      />
    </div>
  </div>
));

// Memoized SelectField component
const SelectField = memo(({ label, name, value, onChange, options, required = false, icon: Icon }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative mt-1.5">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition hover:border-green-300 appearance-none ${Icon ? 'pl-10' : ''}`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={18} />
      </div>
    </div>
  </div>
));

// Component display names
Input.displayName = "Input";
SelectField.displayName = "SelectField";

// Segment options
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

// Decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// Get user email from token
const getUserEmailFromToken = () => {
  try {
    const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken', 'userToken'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          const email = decoded.email || decoded.Email || decoded.userEmail || decoded.user_email || decoded.username;
          if (email) return email;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting user email:", error);
    return null;
  }
};

const AddChargerForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdCharger, setCreatedCharger] = useState(null);
  
  // Settings menu state
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState('https');

  // Form data - matches backend CreateChargerRequest
  const [formData, setFormData] = useState({
    vendor: "",
    model: "",
    serial_number: "",
    max_power_kw: "",
    charger_name: "",
    charger_host_name: "",
    charger_host_phone_no: "",
    charger_type: "",
    segment: "",
    sub_segment: "",
    total_capacity: "",
    charger_use_type: "",
    number_of_connectors: "",
    parking: "",
    protocol: "",
    twenty_four_seven_open: "",
    charger_image: "",
    connectors: [
      {
        connector_number: 1,
        connector_type: "",
        connector_total_capacity: ""
      }
    ]
  });

  // Get user info on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
  }, [navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        const email = data.user?.email || '';
        setUserEmail(email);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleConnectorChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newConnectors = [...prev.connectors];
      newConnectors[index] = { ...newConnectors[index], [field]: value };
      return { ...prev, connectors: newConnectors };
    });
  }, []);

  const addConnector = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      connectors: [
        ...prev.connectors,
        {
          connector_number: prev.connectors.length + 1,
          connector_type: "",
          connector_total_capacity: ""
        }
      ]
    }));
  }, []);

  const removeConnector = useCallback((index) => {
    if (formData.connectors.length <= 1) {
      setMessage("At least one connector is required");
      setMessageType("error");
      return;
    }
    setFormData(prev => ({
      ...prev,
      connectors: prev.connectors.filter((_, i) => i !== index)
    }));
  }, [formData.connectors.length]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      // Validate connectors
      for (const connector of formData.connectors) {
        if (!connector.connector_type) {
          setMessage("Please select connector type for all connectors");
          setMessageType("error");
          setIsLoading(false);
          return;
        }
        if (!connector.connector_total_capacity) {
          setMessage("Please enter connector capacity for all connectors");
          setMessageType("error");
          setIsLoading(false);
          return;
        }
      }

      // Prepare payload
      const payload = {
        vendor: formData.vendor || "",
        model: formData.model || "",
        serial_number: formData.serial_number,
        max_power_kw: parseFloat(formData.max_power_kw) || 0,
        charger_name: formData.charger_name || "",
        charger_host_name: formData.charger_host_name || "",
        charger_host_phone_no: formData.charger_host_phone_no || "",
        charger_type: formData.charger_type,
        segment: formData.segment || "",
        sub_segment: formData.sub_segment || "",
        total_capacity: parseFloat(formData.total_capacity) || 0,
        charger_use_type: formData.charger_use_type,
        number_of_connectors: formData.connectors.length,
        parking: formData.parking || "",
        protocol: formData.protocol,
        twenty_four_seven_open: formData.twenty_four_seven_open === "yes",
        connectors: formData.connectors.map(conn => ({
          connector_number: parseInt(conn.connector_number) || 0,
          connector_type: conn.connector_type,
          connector_total_capacity: parseFloat(conn.connector_total_capacity) || 0
        }))
      };

      console.log("Submitting payload:", payload);

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(payload));
      
      // If there's an image file, append it
      if (imageFile) {
        formDataToSend.append('charger_image', imageFile);
      }

      const response = await fetch(API_CONFIG.CHARGERS_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-CPO-App-ID': CPO_APP_ID
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('Create charger response:', data);

      if (response.ok) {
        setMessage("Charger created successfully!");
        setMessageType("success");
        
        // Get the charger data from response
        const chargerData = data.charger || data.data || data;
        
        // Get charger_id from response or generate fallback
        const chargerId = chargerData.charger_id || chargerData.id || 'CH-' + Date.now();
        
        // Get charger_name from response or form
        const chargerName = chargerData.charger_name || formData.charger_name || 'My Charger';
        
        // Get connection URL from response
        const connectionUrlWs = chargerData.charger_connection_url_ws || 
                               chargerData.charger_connection_url_wss ||
                               `ws://${chargerId}.transev.com`;
        
        setCreatedCharger({
          ...chargerData,
          charger_id: chargerId,
          charger_name: chargerName,
          ocpp_version: chargerData.ocpp_version || '1.6J',
          protocol: chargerData.protocol || formData.protocol || 'OCPP1.6',
          charger_connection_url_ws: connectionUrlWs,
          charger_connection_url_wss: chargerData.charger_connection_url_wss || connectionUrlWs.replace('ws://', 'wss://'),
          status: chargerData.status || 'PENDING'
        });
        
        setShowSuccessPopup(true);
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            vendor: "",
            model: "",
            serial_number: "",
            max_power_kw: "",
            charger_name: "",
            charger_host_name: "",
            charger_host_phone_no: "",
            charger_type: "",
            segment: "",
            sub_segment: "",
            total_capacity: "",
            charger_use_type: "",
            number_of_connectors: "",
            parking: "",
            protocol: "",
            twenty_four_seven_open: "",
            connectors: [
              {
                connector_number: 1,
                connector_type: "",
                connector_total_capacity: ""
              }
            ]
          });
          setCurrentStep(1);
          setImageFile(null);
        }, 3000);
      } else {
        setMessage(data.error?.message || data.message || 'Failed to create charger');
        setMessageType("error");
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage(error.message || "Server error. Try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    const url = selectedProtocol === 'https' 
      ? createdCharger?.charger_connection_url_wss 
      : createdCharger?.charger_connection_url_ws;
    
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const svgElement = document.querySelector('#qr-code-popup svg');
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
        link.download = `charger-${createdCharger?.charger_id || 'qr'}-code.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  // Settings Dropdown Menu - Black
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

  // Add Dropdown Menu - Black, only Add Hub
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
      </div>
    </div>
  );

  // Success Popup - Full featured like ChargerSuccess page
  const SuccessPopup = () => {
    // Get the appropriate URL based on selected protocol
    const connectionUrl = selectedProtocol === 'https' 
      ? createdCharger?.charger_connection_url_wss 
      : createdCharger?.charger_connection_url_ws;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <div className="sticky top-0 bg-white z-10 flex justify-end p-4 border-b border-gray-100">
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                navigate('/manage-chargers');
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                Charge Point Added Successfully!
              </h2>
              <p className="text-gray-500">
                Your charger has been registered and is ready to use
              </p>
            </div>

            {/* URL Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe2 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Charger Connection URL</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setSelectedProtocol('https')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedProtocol === 'https'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Shield className="w-4 h-4 inline mr-1" />
                      WSS (Secure)
                    </button>
                    <button
                      onClick={() => setSelectedProtocol('http')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedProtocol === 'http'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      WS (Standard)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={connectionUrl || `${selectedProtocol}://${createdCharger?.charger_id || 'charger'}.transev.com`}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap shadow-lg shadow-green-500/25"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy URL
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Use this URL to connect your charger to the OCPP network. 
                    {selectedProtocol === 'https' 
                      ? ' SSL/TLS encryption is enabled for secure communication.'
                      : ' HTTP communication is used without SSL encryption.'}
                  </p>
                </div>
              </div>
            </div>

            {/* OCPP Compliance & QR Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* OCPP Compliance */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">OCPP Compliance</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">OCPP Version</p>
                      <p className="text-sm text-gray-600">{createdCharger?.ocpp_version || '1.6J'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Protocol</p>
                      <p className="text-sm text-gray-600">{createdCharger?.protocol || 'OCPP1.6'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Status</p>
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {createdCharger?.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Charger ID</p>
                      <p className="text-sm font-mono text-gray-600">{createdCharger?.charger_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                </div>

                <div className="flex flex-col items-center">
                  <div id="qr-code-popup" className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4">
                    <QRCodeSVG
                      value={createdCharger?.charger_id || 'charger-id'}
                      size={180}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-gray-900">Charger ID</p>
                    <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                      {createdCharger?.charger_id || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Scan to identify this charger</p>
                  </div>

                  <button
                    onClick={handleDownloadQR}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>

                  <p className="text-xs text-gray-500 mt-3">
                    Scan this QR code to quickly identify and connect to this charger
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate('/charger-session');
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
              >
                <Layers className="w-5 h-5" />
                View All Chargers
              </button>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  setFormData({
                    vendor: "",
                    model: "",
                    serial_number: "",
                    max_power_kw: "",
                    charger_name: "",
                    charger_host_name: "",
                    charger_host_phone_no: "",
                    charger_type: "",
                    segment: "",
                    sub_segment: "",
                    total_capacity: "",
                    charger_use_type: "",
                    number_of_connectors: "",
                    parking: "",
                    protocol: "",
                    twenty_four_seven_open: "",
                    connectors: [
                      {
                        connector_number: 1,
                        connector_type: "",
                        connector_total_capacity: ""
                      }
                    ]
                  });
                  setCurrentStep(1);
                  setImageFile(null);
                  setCreatedCharger(null);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25"
              >
                <Plus className="w-5 h-5" />
                Add Another Charger
              </button>
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Share Charger Details</p>
                  <p className="text-sm text-gray-500">
                    Share the charger details with your team or stakeholders
                  </p>
                </div>
                <button
                  onClick={() => {
                    const url = connectionUrl || `${selectedProtocol}://${createdCharger?.charger_id || 'charger'}.transev.com`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Charger Details',
                        text: `Charger ${createdCharger?.charger_name || ''} - ${createdCharger?.charger_id || ''}`,
                        url: url
                      });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert('Charger URL copied to clipboard!');
                    }
                  }}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-500/25"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Options for select fields
  const chargerTypeOptions = [
    { value: "DC", label: "DC Charger" },
    { value: "AC", label: "AC Charger" }
  ];

  const parkingOptions = [
    { value: "Dedicated", label: "Dedicated Parking" },
    { value: "Shared", label: "Shared Parking" },
    { value: "Street", label: "Street Parking" },
    { value: "Garage", label: "Garage" },
    { value: "None", label: "None" }
  ];

  const connectorTypeOptions = [
    { value: "CCS2", label: "CCS2 (Combined Charging System)" },
    { value: "CHAdeMO", label: "CHAdeMO" },
    { value: "Type 2", label: "Type 2 (Mennekes)" },
    { value: "GB/T", label: "GB/T" },
    { value: "Tesla", label: "Tesla Connector" }
  ];

  const chargerUseTypeOptions = [
    { value: "Public", label: "Public" },
    { value: "Private", label: "Private" }
  ];

  const openStatusOptions = [
    { value: "yes", label: "24/7 Open" },
    { value: "no", label: "Limited Hours" }
  ];

  const protocolOptions = [
    { value: "OCPP1.6-J", label: "OCPP 1.6-J" },
    { value: "OCPP2.0-J", label: "OCPP 2.0-J" },
    { value: "OCPP1.5-J", label: "OCPP 1.5-J" },
    { value: "ISO15118-J", label: "ISO 15118-J" }
  ];

  if (loading) {
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
      <Sidebar />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Add Charger</h1>
                </div>
              </div>
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
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-green-500/25"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Zap size={24} className="text-green-600" />
                  Register New Charger Unit
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure and add a new EV charger to the system
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>
                    Step <strong className="text-gray-900">{currentStep}</strong> of{" "}
                    <strong className="text-gray-900">{steps.length}</strong>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>{steps[currentStep - 1]}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">Secure Connection</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">OCPP Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex flex-wrap gap-3">
            {steps.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition
                  ${
                    currentStep === i + 1
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
                      : currentStep > i + 1
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
              >
                {currentStep > i + 1 ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <span className="font-bold">{i + 1}</span>
                )}
                {step}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6"
          >
            {/* STEP 1 - Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Serial Number" 
                    name="serial_number" 
                    value={formData.serial_number}
                    onChange={handleChange}
                    placeholder="e.g., SN-2024-001"
                    required
                    icon={Battery}
                  />
                  <Input 
                    label="Max Power (kW)" 
                    name="max_power_kw" 
                    type="number"
                    value={formData.max_power_kw}
                    onChange={handleChange}
                    placeholder="e.g., 150"
                    required
                    icon={Gauge}
                  />
                  <Input 
                    label="Charger Name" 
                    name="charger_name" 
                    value={formData.charger_name}
                    onChange={handleChange}
                    placeholder="e.g., Main Station Charger"
                    icon={Zap}
                  />
                  <Input 
                    label="Charger Host Name" 
                    name="charger_host_name" 
                    value={formData.charger_host_name}
                    onChange={handleChange}
                    placeholder="e.g., Company Name"
                    icon={Building}
                  />
                  <Input 
                    label="Host Phone Number" 
                    name="charger_host_phone_no" 
                    type="tel"
                    value={formData.charger_host_phone_no}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    icon={Phone}
                  />
                  <SelectField 
                    label="Charger Type" 
                    name="charger_type"
                    value={formData.charger_type}
                    onChange={handleChange}
                    options={chargerTypeOptions}
                    required
                    icon={Cpu}
                  />
                  <SelectField 
                    label="Segment" 
                    name="segment"
                    value={formData.segment}
                    onChange={handleChange}
                    options={segmentOptions}
                    icon={Building}
                  />
                  <SelectField 
                    label="Subsegment" 
                    name="sub_segment"
                    value={formData.sub_segment}
                    onChange={handleChange}
                    options={subsegmentOptions}
                    icon={Layers}
                  />
                </div>
              </div>
            )}

            {/* STEP 2 - Hardware & Connectors */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField 
                    label="Parking Type" 
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    options={parkingOptions}
                    required
                    icon={MapPin}
                  />
                  <SelectField 
                    label="Protocol" 
                    name="protocol"
                    value={formData.protocol}
                    onChange={handleChange}
                    options={protocolOptions}
                    required
                    icon={Wifi}
                  />
                  <SelectField 
                    label="24/7 Open Status" 
                    name="twenty_four_seven_open"
                    value={formData.twenty_four_seven_open}
                    onChange={handleChange}
                    options={openStatusOptions}
                    required
                    icon={Clock}
                  />
                </div>

                {/* Connectors Section */}
                <div className="border-t-2 border-green-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Plug className="w-5 h-5 text-green-600" />
                      Connectors
                      <span className="text-sm font-normal text-gray-500">
                        ({formData.connectors.length} configured)
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={addConnector}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm shadow-lg shadow-green-500/25"
                    >
                      <Plus size={16} />
                      Add Connector
                    </button>
                  </div>

                  {formData.connectors.map((connector, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-4 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                            {connector.connector_number || index + 1}
                          </span>
                          Connector {connector.connector_number || index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeConnector(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                          label="Connector Number" 
                          name={`connector_${index}_number`}
                          value={connector.connector_number}
                          onChange={(e) => handleConnectorChange(index, 'connector_number', e.target.value)}
                          type="number"
                          placeholder="1, 2, 3..."
                          required
                        />
                        <SelectField 
                          label="Connector Type" 
                          name={`connector_${index}_type`}
                          value={connector.connector_type}
                          onChange={(e) => handleConnectorChange(index, 'connector_type', e.target.value)}
                          options={connectorTypeOptions}
                          required
                        />
                        <Input 
                          label="Connector Capacity (kW)" 
                          name={`connector_${index}_connector_total_capacity`}
                          value={connector.connector_total_capacity}
                          onChange={(e) => handleConnectorChange(index, 'connector_total_capacity', e.target.value)}
                          type="number"
                          placeholder="e.g., 50"
                          required
                          icon={Gauge}
                        />
                      </div>
                    </div>
                  ))}

                  {formData.connectors.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Plug className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No connectors added</p>
                      <button
                        type="button"
                        onClick={addConnector}
                        className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Add first connector
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 - Usage & Owner */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField 
                    label="Charger Use Type" 
                    name="charger_use_type"
                    value={formData.charger_use_type}
                    onChange={handleChange}
                    options={chargerUseTypeOptions}
                    required
                    icon={Building}
                  />
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Charger Buyer Email <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="email"
                        value={userEmail}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 cursor-not-allowed opacity-80 text-base"
                      />
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap border border-green-200">
                        From Token
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-filled from your authentication token
                    </p>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="border-t-2 border-green-100 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Image size={20} className="text-green-600" />
                    Charger Image
                  </h3>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Upload Image</label>
                    <div className="mt-1.5">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition border-gray-300 hover:border-green-400">
                          {imageFile ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={URL.createObjectURL(imageFile)} 
                                alt="Preview" 
                                className="w-full h-full object-contain rounded-xl p-2" 
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageFile(null);
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                              <Upload className="w-12 h-12 text-gray-400 mb-3" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {imageFile && (
                        <p className="mt-2 text-sm text-green-600">✓ Image uploaded: {imageFile.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Response Message */}
                {message && (
                  <div className={`border rounded-xl p-4 ${
                    messageType === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <p className="flex items-center gap-2">
                      {messageType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      {message}
                    </p>
                  </div>
                )}

                {/* User email status */}
                {!userEmail && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      ⚠️ Unable to retrieve your email from authentication token. Please ensure you are logged in properly.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t-2 border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition font-medium text-base"
                  disabled={isLoading}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition font-medium text-base shadow-lg shadow-green-500/25"
                  disabled={isLoading}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition flex items-center gap-2 justify-center min-w-[180px] font-medium text-base shadow-lg shadow-green-500/25"
                  disabled={isLoading || !userEmail}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Add Charger
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default AddChargerForm;
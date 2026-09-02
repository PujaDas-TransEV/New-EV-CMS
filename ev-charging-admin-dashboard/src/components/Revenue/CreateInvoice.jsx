// src/components/Revenue/CreateInvoice.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  Settings,
  Plus,
  ChevronDown,
  User,
  Building,
  LogOut,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Info,
  Sparkles,
  FileText,
  FilePlus,
  Save,
  Printer,
  Download,
  Share2,
  Mail,
  Send,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  IndianRupee,
  Percent,
  Users,
  MapPin,
  Phone,
  Globe,
  CreditCard,
  Wallet,
  Receipt,
  Tag,
  Zap,
  Layers,
  Shield,
  AlertCircle,
  ArrowRight,
  X,
  Search,
  UserPlus,
  MoreVertical,
  CalendarDays,
  Timer,
  Package,
  Repeat,
  Landmark,
  Banknote,
  File,
  Server,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
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
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  INVOICE_API: `${API_BASE_URL}/api/v1/cpo/invoices`,
  CUSTOMERS_API: `${API_BASE_URL}/api/v1/cpo/customers`,
  SETTINGS_API: `${API_BASE_URL}/api/v1/cpo/settings`,
  SETTINGS_LOGO_API: `${API_BASE_URL}/api/v1/cpo/settings/invoice-logo`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [settings, setSettings] = useState(null);
  const [invoiceNote, setInvoiceNote] = useState('');
  const [invoiceLogoPath, setInvoiceLogoPath] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [
      { id: 1, description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    taxRate: 18,
    discount: 0,
    notes: '',
    status: 'draft',
    currency: 'INR'
  });

  // Fetch settings and customers
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchSettings();
    fetchInvoiceLogo();
    fetchCustomers();
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

  const fetchSettings = useCallback(async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.SETTINGS_API, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        if (data.invoice_note) {
          setInvoiceNote(data.invoice_note);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [authenticatedRequest]);

  // Fetch invoice logo using GET /api/v1/cpo/settings/invoice-logo
  const fetchInvoiceLogo = useCallback(async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.SETTINGS_LOGO_API, {
        method: 'GET',
        headers: {
          'X-CPO-App-ID': CPO_APP_ID,
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.invoice_logo) {
          const logoPath = data.invoice_logo.startsWith('http') 
            ? data.invoice_logo 
            : `${API_BASE_URL}/${data.invoice_logo}`;
          setInvoiceLogoPath(logoPath);
        }
      }
    } catch (error) {
      console.error('Error fetching invoice logo:', error);
    }
  }, [authenticatedRequest]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.CUSTOMERS_API, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        const customersData = data.customers || data.data || data || [];
        setCustomers(customersData);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, [authenticatedRequest]);

  const handleAddItem = () => {
    const newItem = {
      id: invoiceData.items.length + 1,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem]
    });
  };

  const handleRemoveItem = (id) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.filter(item => item.id !== id)
      });
    }
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = invoiceData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = (parseFloat(updatedItem.quantity) || 0) * (parseFloat(updatedItem.rate) || 0);
        }
        return updatedItem;
      }
      return item;
    });
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const handleCustomerSelect = (customer) => {
    setInvoiceData({
      ...invoiceData,
      customerId: customer.id,
      customerName: customer.full_name || customer.name || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerAddress: customer.address || ''
    });
    setShowCustomerDropdown(false);
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * invoiceData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - (invoiceData.discount || 0);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        invoice_number: invoiceData.invoiceNumber,
        customer_id: invoiceData.customerId,
        customer_name: invoiceData.customerName,
        customer_email: invoiceData.customerEmail,
        customer_phone: invoiceData.customerPhone,
        customer_address: invoiceData.customerAddress,
        date: invoiceData.date,
        due_date: invoiceData.dueDate,
        items: invoiceData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })),
        subtotal: calculateSubtotal(),
        tax_rate: invoiceData.taxRate,
        tax_amount: calculateTax(),
        discount: invoiceData.discount,
        total: calculateTotal(),
        currency: invoiceData.currency,
        notes: invoiceData.notes || invoiceNote,
        status: invoiceData.status
      };

      console.log('📤 Creating invoice payload:', payload);

      const response = await authenticatedRequest(API_CONFIG.INVOICE_API, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Invoice created successfully!');
        setTimeout(() => {
          navigate('/revenue/settings');
        }, 2000);
      } else {
        setError(data.message || data.error?.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('An error occurred while creating the invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoiceData.customerEmail) {
      setError('Customer email is required to send invoice');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // First save the invoice
      await handleSave();
      
      // Then send it
      const response = await authenticatedRequest(`${API_CONFIG.INVOICE_API}/send`, {
        method: 'POST',
        body: JSON.stringify({ invoice_id: invoiceData.invoiceNumber, email: invoiceData.customerEmail })
      });

      if (response.ok) {
        setSuccess('Invoice sent to customer successfully!');
      } else {
        setError('Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      setError('An error occurred while sending the invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Downloading invoice as PDF...');
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

  const formatCurrency = (amount) => {
    if (!amount) return '₹ 0';
    return `₹ ${parseFloat(amount).toLocaleString('en-IN')}`;
  };

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

  // Add Dropdown Menu
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

  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Refreshing session...</p>
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
              <button 
                onClick={() => navigate('/revenue/settings')}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Create Invoice</h1>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {invoiceData.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save
              </button>
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <Printer size={20} className="text-gray-600" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <Download size={20} className="text-gray-600" />
              </button>
              <div className="relative">
                <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5">
                  <Settings size={20} className="text-gray-600" />
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

        {/* Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Invoice Logo & Note Banner */}
            {(invoiceLogoPath || invoiceNote) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
                <div className="flex items-center gap-6">
                  {invoiceLogoPath && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-gray-200">
                      <img 
                        src={invoiceLogoPath} 
                        alt="Invoice Logo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {invoiceNote && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Invoice Note</p>
                      <p className="text-sm text-gray-700">{invoiceNote}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Invoice Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  {/* Invoice Header */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Status
                      </label>
                      <select
                        value={invoiceData.status}
                        onChange={(e) => setInvoiceData({ ...invoiceData, status: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Invoice Date
                      </label>
                      <input
                        type="date"
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Customer Selection */}
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Customer
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <Users size={18} className="text-gray-400" />
                          <span className={invoiceData.customerName ? 'text-gray-900' : 'text-gray-400'}>
                            {invoiceData.customerName || 'Select a customer'}
                          </span>
                        </div>
                        <ChevronDown size={18} className="text-gray-400" />
                      </button>
                      
                      {showCustomerDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
                          <div className="p-2">
                            <div className="relative mb-2">
                              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search customers..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              />
                            </div>
                            {customers.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                <Users size={24} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No customers available</p>
                              </div>
                            ) : (
                              customers.map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded-lg transition flex items-center gap-3"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                    {(customer.full_name || customer.name || 'C').charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{customer.full_name || customer.name}</p>
                                    <p className="text-xs text-gray-500">{customer.email}</p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Details */}
                  {invoiceData.customerName && (
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Customer Name</p>
                        <p className="text-sm font-medium text-gray-900">{invoiceData.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-700">{invoiceData.customerEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-700">{invoiceData.customerPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm text-gray-700">{invoiceData.customerAddress || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Invoice Items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">Invoice Items</h4>
                      <button
                        onClick={handleAddItem}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2 text-center">Qty</th>
                            <th className="px-3 py-2 text-right">Rate</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.items.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-100">
                              <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                  className="w-full px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                  placeholder="Item description"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-center"
                                  min="1"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-right"
                                  min="0"
                                  step="0.01"
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-gray-700">
                                {formatCurrency(item.amount)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition"
                                  disabled={invoiceData.items.length === 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mt-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                      rows="2"
                      placeholder="Add any additional notes or payment terms..."
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Invoice Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Invoice Summary</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-700">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tax Rate</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={invoiceData.taxRate}
                          onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: parseFloat(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-right"
                          min="0"
                          step="0.5"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax Amount</span>
                      <span className="font-medium text-gray-700">{formatCurrency(calculateTax())}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Discount</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={invoiceData.discount}
                          onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-right"
                          min="0"
                          step="1"
                        />
                        <span className="text-sm text-gray-500">₹</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Currency</span>
                      <select
                        value={invoiceData.currency}
                        onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value })}
                        className="px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {isSubmitting ? 'Saving...' : 'Save Invoice'}
                    </button>
                    <button
                      onClick={handleSendInvoice}
                      disabled={isSubmitting || !invoiceData.customerEmail}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                    >
                      <Mail size={18} />
                      Send to Customer
                    </button>
                  </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
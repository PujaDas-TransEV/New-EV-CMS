// src/components/HelpAndSupport/Help.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import {
  User,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  Building,
  Mail,
  Phone,
  Loader2,
  Menu,
  ArrowLeft,
  Search,
  HelpCircle,
  ChevronRight,
  Minus,
  Plus as PlusIcon,
  Zap,
  Layers,
  DollarSign,
  Gauge,
  Wrench,
  Award,
  Shield,
  MessageCircle,
  Users,
  Headphones,
  LifeBuoy,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ExternalLink,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  BarChart3,
  TrendingUp,
  Activity,
  Cpu,
  BatteryCharging,
  Globe
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const HelpSupport = () => {
  const navigate = useNavigate();
  const { 
    authenticatedRequest, 
    logout, 
    isRefreshing,
    isAuthenticated,
    user 
  } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [currentPage, setCurrentPage] = useState('main');
  const [searchInputValue, setSearchInputValue] = useState('');

  // Support popup ref
  const supportPopupRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // FAQ Data
  const faqData = {
    dashboard: {
      title: 'Dashboard',
      icon: <Zap className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      faqs: [
        {
          question: 'Why are the number of connectors more than the number of chargers? What is the difference between a charger and a connector?',
          answer: 'A charger is the main unit that can have multiple connectors. Each connector can charge one vehicle at a time. For example, a dual-port charger has 2 connectors but is still 1 charger.'
        },
        {
          question: 'What are the different states of a charger?',
          answer: 'Chargers can be in various states: Available (ready to charge), Charging (currently charging a vehicle), Unavailable (temporarily out of service), Faulted (needs maintenance), and Offline (not connected to network).'
        },
        {
          question: 'How do chargers become unavailable?',
          answer: 'Chargers become unavailable due to scheduled maintenance, technical faults, network issues, or manual intervention by the operator.'
        },
        {
          question: 'What are we showing on the maps?',
          answer: 'Maps show the real-time locations of all chargers with their availability status, connector types, pricing information, and nearby amenities.'
        },
        {
          question: 'What are heat maps? Meanings of different colours in detail.',
          answer: 'Heat maps show charging demand patterns across different areas. Red indicates high demand, yellow moderate, and green low demand areas. This helps in strategic placement of new chargers.'
        },
        {
          question: 'How to add an organisation to CMS?',
          answer: 'Navigate to Organization section, click on "Add Organization", fill in the required details (business name, contact info, address), and submit for approval.'
        },
        {
          question: 'Can one client have multiple organisations?',
          answer: 'Yes, one client can manage multiple organizations under a single account, making it easier to manage different business entities or locations.'
        }
      ]
    },
    chargerSessions: {
      title: 'Charger & Sessions',
      icon: <Layers className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      faqs: [
        {
          question: 'What are configured and non-configured chargers?',
          answer: 'Configured chargers are those that have been set up in the system with all parameters like pricing, connector types, and location details. Non-configured chargers are added to the system but need additional setup before they can be used.'
        },
        {
          question: 'In what calculations are non-configured chargers counted? Are they considered at all?',
          answer: 'Non-configured chargers are counted in total charger inventory but are not included in availability calculations, revenue reports, or session statistics until they are fully configured.'
        },
        {
          question: 'Will a charging session be started using RFID on a non-configured charger? Will that session be counted?',
          answer: 'No, a non-configured charger cannot start a session even with RFID authentication. It needs proper configuration before it can initiate or record any sessions.'
        },
        {
          question: 'What is preparing? Finishing?',
          answer: 'Preparing is the state when a charger is getting ready to start a session (performing diagnostics, authentication, etc.). Finishing is the state when a session is completing (wrapping up the transaction, generating receipts, etc.)'
        },
        {
          question: 'What is a hub?',
          answer: 'A hub is a location that houses multiple chargers. It can be a parking lot, shopping mall, or dedicated charging station with several charging points.'
        },
        {
          question: 'Who is a host? Who is the owner? What is an organisation?',
          answer: 'A host is the entity that provides the physical location for chargers. The owner is the entity that owns the charging equipment. An organisation is the overarching business entity that manages multiple hubs and chargers.'
        },
        {
          question: 'Difference between private and public chargers.',
          answer: 'Public chargers are accessible to all EV owners, often with pay-per-use pricing. Private chargers are restricted to specific users (like employees, residents) and may have different pricing or access rules.'
        }
      ]
    },
    revenueManagement: {
      title: 'Revenue Management',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      faqs: [
        {
          question: 'What is a transaction? Transaction id?',
          answer: 'A transaction is a complete charging event with a unique transaction ID. It includes start time, end time, energy consumed, cost, and payment details.'
        },
        {
          question: 'Difference between invoice and receipt?',
          answer: 'An invoice is a bill sent to the customer before payment, while a receipt is a proof of payment provided after the transaction is completed.'
        },
        {
          question: 'Difference between session and transaction?',
          answer: 'A session is the actual charging event from start to finish. A transaction includes the session details plus billing and payment information.'
        },
        {
          question: 'What is aggregation fee?',
          answer: 'Aggregation fee is a service charge applied to sessions that go through a third-party aggregator or roaming network.'
        },
        {
          question: 'Why is the usage > 0, yet the bill is still zero?',
          answer: 'This can happen if the session is within a free charging period, promotional offer, or if the user has a credit balance covering the cost.'
        },
        {
          question: 'What is a tariff? What are the types of tariffs?',
          answer: 'A tariff is the pricing structure for charging. Types include Flat (fixed rate), Time-based (cost per minute), Energy-based (cost per kWh), and Hybrid (combination of time and energy).'
        },
        {
          question: 'What is a Flat Tariff?',
          answer: 'A Flat Tariff is a fixed rate pricing model where the customer pays a single rate regardless of time or energy consumed.'
        }
      ]
    },
    loadBalancing: {
      title: 'Load Balancing',
      icon: <Activity className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      faqs: [
        {
          question: 'What is a load?',
          answer: 'Load refers to the total power demand or consumption at any given time across all active chargers in a hub.'
        },
        {
          question: 'What is load balancing? What is the need to do load balancing?',
          answer: 'Load balancing is the distribution of available power among multiple chargers to prevent overloading the grid. It ensures efficient power usage and prevents circuit tripping.'
        },
        {
          question: 'What is smart charging in load balancing?',
          answer: 'Smart charging uses algorithms to dynamically adjust charging rates based on grid conditions, energy prices, and user preferences.'
        },
        {
          question: 'What are hubs?',
          answer: 'Hubs are centralized locations with multiple chargers that can be managed together for load balancing and power optimization.'
        },
        {
          question: 'What is a load limit?',
          answer: 'Load limit is the maximum power that can be drawn from the grid at any point, preventing overload and ensuring safe operation.'
        },
        {
          question: 'How to check if a charger supports a smart charging profile?',
          answer: 'Check the charger specifications in the management dashboard. Look for "Smart Charging" or "Dynamic Load Management" capabilities in the charger details.'
        },
        {
          question: 'What are all the strategies to set load?',
          answer: 'Load strategies include Priority-based (give preference to certain chargers), Equal Distribution, Dynamic Adjustment (based on real-time conditions), and Peak Shaving (reduce load during peak hours).'
        }
      ]
    },
    chargerMaintenance: {
      title: 'Charger Maintenance',
      icon: <Wrench className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      faqs: [
        {
          question: 'Who is a charger OEM?',
          answer: 'OEM stands for Original Equipment Manufacturer. The charger OEM is the company that manufactures the charging equipment.'
        },
        {
          question: 'Who is a SPOC?',
          answer: 'SPOC stands for Single Point of Contact. This is the designated person responsible for maintenance coordination and communication.'
        },
        {
          question: 'How to assign a SPOC?',
          answer: 'Go to Maintenance > SPOC Management, click "Add SPOC", enter contact details, and assign to specific chargers or hubs.'
        },
        {
          question: 'How to download the maintenance tasks list?',
          answer: 'Navigate to Maintenance > Tasks, click the download icon, and choose your preferred format (PDF, CSV, or Excel).'
        },
        {
          question: 'How to schedule a new maintenance task?',
          answer: 'Go to Maintenance > Schedule, click "New Task", fill in the details (charger, date, type of maintenance), and save.'
        },
        {
          question: 'How to track a schedule?',
          answer: 'Use the maintenance calendar view to track all scheduled tasks. You can filter by date, status, or charger.'
        }
      ]
    }
  };

  // Module list for main page
  const modules = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Zap className="w-8 h-8" />,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      description: 'User who will be able to manage chargers in a particular city',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-50'
    },
    {
      id: 'chargerSessions',
      title: 'Charger & Sessions',
      icon: <Layers className="w-8 h-8" />,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      description: 'User who will be able to manage chargers in a particular city',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-50'
    },
    {
      id: 'revenueManagement',
      title: 'Revenue Management',
      icon: <TrendingUp className="w-8 h-8" />,
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      description: 'User who will be able to manage chargers in a particular city',
      borderColor: 'border-yellow-200',
      hoverBg: 'hover:bg-yellow-50'
    },
    {
      id: 'loadBalancing',
      title: 'Load Balancing',
      icon: <Activity className="w-8 h-8" />,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      description: 'User who will be able to manage chargers in a particular city',
      borderColor: 'border-purple-200',
      hoverBg: 'hover:bg-purple-50'
    },
    {
      id: 'chargerMaintenance',
      title: 'Charger Maintenance',
      icon: <Wrench className="w-8 h-8" />,
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      description: 'User who will be able to manage chargers in a particular city',
      borderColor: 'border-red-200',
      hoverBg: 'hover:bg-red-50'
    }
  ];

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
  }, [isAuthenticated, navigate]);

  // Click outside support popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (supportPopupRef.current && !supportPopupRef.current.contains(event.target)) {
        setShowSupportPopup(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && searchInputRef.current !== event.target) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await authenticatedRequest(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info:', data);
        setUserData(data);
        
        const userInfo = {
          name: data.user?.full_name || data.user?.name || 'User',
          email: data.user?.email || '',
          role: data.role || '',
          ...data
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      navigate('/signin');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  // Settings Dropdown Menu
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
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
          <Plus size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Support Popup
  const SupportPopup = () => (
    <div 
      ref={supportPopupRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 w-80 p-6"
    >
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/25">
          <Headphones className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Support Details</h3>
        <p className="text-xs text-gray-500">We're here to help you 24/7</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">support@transev.com</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Contact</p>
            <p className="text-sm font-medium text-gray-900">(+91) 995-894-3092</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <Globe className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Website</p>
            <p className="text-sm font-medium text-gray-900">www.transev.com</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setShowSupportPopup(false)}
        className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-lg shadow-green-500/25 text-sm font-medium"
      >
        Close
      </button>
    </div>
  );

  // Module FAQ Page Component
  const ModuleFAQPage = ({ moduleId }) => {
    const moduleData = faqData[moduleId];
    const moduleInfo = modules.find(m => m.id === moduleId);
    
    if (!moduleData || !moduleInfo) return null;

    const filteredFaqs = moduleData.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchInputValue.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchInputValue.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setCurrentPage('main');
            setSearchInputValue('');
            setExpandedFaq(null);
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Help Center</span>
        </button>

        {/* Module Header */}
        <div className={`p-8 rounded-2xl ${moduleInfo.iconBg} shadow-lg text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              {moduleData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{moduleData.title}</h2>
              <p className="text-white/80 text-sm mt-1">{moduleInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search your query..."
            value={searchInputValue}
            onChange={(e) => {
              setSearchInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition shadow-sm"
          />
          {searchInputValue && (
            <button
              onClick={() => {
                setSearchInputValue('');
                setShowSuggestions(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* FAQ Count */}
        <p className="text-sm text-gray-500">
          {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
        </p>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
              >
                <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                <span className="flex-shrink-0">
                  {expandedFaq === index ? (
                    <Minus className="w-5 h-5 text-green-600" />
                  ) : (
                    <PlusIcon className="w-5 h-5 text-green-600" />
                  )}
                </span>
              </button>
              {expandedFaq === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No results found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show loading if refreshing
  if (isRefreshing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isRefreshing ? 'Refreshing session...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Page
  if (currentPage === 'main') {
    const getSuggestions = () => {
      if (!searchInputValue.trim()) return [];
      const allFaqs = [];
      Object.values(faqData).forEach(module => {
        module.faqs.forEach(faq => {
          if (faq.question.toLowerCase().includes(searchInputValue.toLowerCase())) {
            allFaqs.push(faq.question);
          }
        });
      });
      return allFaqs.slice(0, 5);
    };

    const suggestions = getSuggestions();

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
          <header className="bg-white px-6 py-6 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-3 relative">
                  <button
                    onMouseEnter={() => setShowSupportPopup(true)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition group"
                  >
                    <HelpCircle size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Having Trouble?</span>
                    <span className="text-green-600 font-medium">Get Help</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  {showSupportPopup && <SupportPopup />}
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
                    className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                  >
                    <Plus size={18} />
                  </button>
                  {showAddMenu && <AddMenu />}
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <div className="p-6 max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <p className="text-xl text-green-500 mb-1">Hi {userData?.user?.full_name || user?.name || 'User'},</p>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">How can we help you?</h1>
            </div>

            {/* Search Section */}
            <div className="relative max-w-3xl mx-auto mb-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search your query..."
                  value={searchInputValue}
                  onChange={(e) => {
                    setSearchInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-14 pr-4 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition"
                />
                {searchInputValue && (
                  <button
                    onClick={() => {
                      setSearchInputValue('');
                      setShowSuggestions(false);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={22} />
                  </button>
                )}
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && searchInputValue && suggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-40 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggestions:</p>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchInputValue(suggestion);
                        setShowSuggestions(false);
                        for (const [key, module] of Object.entries(faqData)) {
                          const faqIndex = module.faqs.findIndex(f => f.question === suggestion);
                          if (faqIndex !== -1) {
                            setCurrentPage(key);
                            setExpandedFaq(faqIndex);
                            break;
                          }
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition border-b border-gray-50 last:border-0"
                    >
                      <Search size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Module Wise Help */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                Module Wise Help
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => {
                      setCurrentPage(module.id);
                      setExpandedFaq(null);
                    }}
                    className={`p-6 rounded-2xl border-2 ${module.borderColor} bg-white ${module.hoverBg} transition-all text-left group shadow-sm hover:shadow-lg hover:-translate-y-1`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 ${module.iconBg} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 text-white`}>
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{module.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{module.description}</p>
                        <div className="flex items-center gap-1 mt-3 text-sm font-medium text-green-600 group-hover:text-green-700">
                          <span>Know More</span>
                          <ChevronRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Module FAQ Page
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
        <header className="bg-white px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 relative">
                <button
                  onMouseEnter={() => setShowSupportPopup(true)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition group"
                >
                  <HelpCircle size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Having Trouble?</span>
                  <span className="text-green-600 font-medium">Get Help</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSupportPopup && <SupportPopup />}
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
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-6 max-w-4xl mx-auto">
          <ModuleFAQPage moduleId={currentPage} />
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
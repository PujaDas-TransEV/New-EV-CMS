// src/components/CustomerandVehicles/CustomerGroupDetail.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Users as UsersIcon,
  UserCog,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  Mail,
  Phone,
  Menu,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserPlus,
  MoreVertical,
  Circle,
  CircleCheck,
  CircleX,
  CircleAlert,
  UserRound,
  BadgeCheck,
  Activity,
  Power,
  PowerOff,
  Save,
  Zap,
  XCircle,
  UserPlus as UserPlusIcon,
  Check,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  USER_GROUPS_API: `${API_BASE_URL}/api/v1/cpo/user-groups`,
  USER_GROUP_MEMBERS_API: (groupId) => `${API_BASE_URL}/api/v1/cpo/user-groups/${groupId}/members`,
  CUSTOMERS_API: `${API_BASE_URL}/api/v1/cpo/customers`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

const CustomerGroupDetail = () => {
  const navigate = useNavigate();
  const { userGroupId } = useParams();
  const { authenticatedRequest, logout, isRefreshing, isAuthenticated, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Add Member states
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [addingMembers, setAddingMembers] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Remove Member Confirmation states
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  // Refs for preventing multiple calls
  const fetchCustomersRef = useRef(false);

  // Fetch group details
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
    fetchGroupDetails();
  }, [isAuthenticated, navigate, userGroupId]);

  const fetchUserInfo = async () => {
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
  };

  const fetchGroupDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedRequest(`${API_CONFIG.USER_GROUPS_API}/${userGroupId}`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        const group = data.user_group || data.data || data;
        setGroupData(group);
        setMembers(group.members || []);
        setEditFormData({
          name: group.name || '',
          description: group.description || '',
          is_active: group.is_active !== undefined ? group.is_active : true
        });
      } else {
        setError('Failed to fetch group details');
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      setError('An error occurred while fetching group details');
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest, userGroupId]);

  // Fetch available customers (not in this group)
  const fetchAvailableCustomers = useCallback(async () => {
    if (fetchCustomersRef.current) return;
    fetchCustomersRef.current = true;
    
    setLoadingCustomers(true);
    try {
      const response = await authenticatedRequest(API_CONFIG.CUSTOMERS_API, {
        method: 'GET',
        params: {
          limit: 200
        }
      });

      if (response.ok) {
        const data = await response.json();
        const customers = data.customers || data.data || data || [];
        
        const available = customers.filter(c => c.usergroup_assigned === false);
        setAvailableCustomers(available);
      } else {
        setAvailableCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setAvailableCustomers([]);
    } finally {
      setLoadingCustomers(false);
      fetchCustomersRef.current = false;
    }
  }, [authenticatedRequest]);

  // Popup open handler
  const handleOpenPopup = () => {
    if (!isPopupOpen) {
      setIsPopupOpen(true);
      setShowAddMemberPopup(true);
      setSelectedCustomers([]);
      setCustomerSearchQuery('');
      fetchAvailableCustomers();
    }
  };

  // Popup close handler
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setShowAddMemberPopup(false);
    setSelectedCustomers([]);
    setCustomerSearchQuery('');
    fetchCustomersRef.current = false;
  };

  // Open remove confirmation modal
  const handleOpenRemoveConfirm = (member) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  // Close remove confirmation modal
  const handleCloseRemoveConfirm = () => {
    setShowRemoveConfirm(false);
    setMemberToRemove(null);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        is_active: editFormData.is_active
      };

      const response = await authenticatedRequest(`${API_CONFIG.USER_GROUPS_API}/${userGroupId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedGroup = data.user_group || data.data || data;
        setGroupData(updatedGroup);
        setMembers(updatedGroup.members || []);
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError('An error occurred while updating the group');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    try {
      const response = await authenticatedRequest(`${API_CONFIG.USER_GROUPS_API}/${userGroupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteConfirm(false);
        navigate('/customer-groups');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('An error occurred while deleting the group');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add members to group
  const handleAddMembers = async () => {
    if (selectedCustomers.length === 0) return;
    
    setAddingMembers(true);
    setError('');
    
    try {
      for (const customerId of selectedCustomers) {
        const response = await authenticatedRequest(API_CONFIG.USER_GROUP_MEMBERS_API(userGroupId), {
          method: 'POST',
          body: JSON.stringify({ customer_id: customerId })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `Failed to add member ${customerId}`);
        }
      }
      
      await fetchGroupDetails();
      handleClosePopup();
      
    } catch (error) {
      console.error('Error adding members:', error);
      setError(error.message || 'Failed to add members to group');
    } finally {
      setAddingMembers(false);
    }
  };

  // ✅ Remove member from group using DELETE API
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setRemovingMember(memberToRemove.id);
    try {
      const response = await authenticatedRequest(
        `${API_CONFIG.USER_GROUP_MEMBERS_API(userGroupId)}/${memberToRemove.id}`,
        {
          method: 'DELETE'
        }
      );

      if (response.ok) {
        await fetchGroupDetails();
        if (showAddMemberPopup) {
          await fetchAvailableCustomers();
        }
        handleCloseRemoveConfirm();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      setError('An error occurred while removing the member');
    } finally {
      setRemovingMember(null);
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

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusIcon = (isActive) => {
    return isActive 
      ? <CheckCircle className="w-3 h-3" />
      : <XCircle className="w-3 h-3" />;
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
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
        <button onClick={() => { setShowAddMenu(false); navigate("/add-charger"); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition">
          <Zap size={18} className="text-gray-400" /> Add Charger
        </button>
      </div>
    </div>
  );

  // Delete Group Confirmation Modal
  const DeleteGroupConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete Group</h3>
          </div>
          <button onClick={() => setShowDeleteConfirm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{groupData?.name}</span>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This action will permanently remove the group and all its associated data. This cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={handleDeleteGroup} disabled={isDeleting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/25 disabled:opacity-50">
            {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 size={20} /> Delete Group</>}
          </button>
          <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Remove Member Confirmation Modal - Clean design with Eye icon
  const RemoveMemberConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Remove Member</h3>
              <p className="text-sm text-gray-500">Confirm removal from group</p>
            </div>
          </div>
          <button onClick={handleCloseRemoveConfirm} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {memberToRemove?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{memberToRemove?.full_name || 'Unnamed'}</p>
            <p className="text-sm text-gray-500">{memberToRemove?.email || 'No email'}</p>
            <p className="text-xs text-gray-400">{memberToRemove?.phone || 'No phone'}</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-2">
          Are you sure you want to remove <span className="font-semibold text-gray-900">{memberToRemove?.full_name}</span> from <span className="font-semibold text-gray-900">{groupData?.name}</span>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This action will remove the member from this group. They will still exist as a customer.
        </p>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRemoveMember} 
            disabled={removingMember === memberToRemove?.id} 
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/25 disabled:opacity-50"
          >
            {removingMember === memberToRemove?.id ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Removing...</>
            ) : (
              <><UserMinus size={20} /> Remove Member</>
            )}
          </button>
          <button 
            onClick={handleCloseRemoveConfirm} 
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Add Member Popup - Slide from right (Green Theme)
  const AddMemberPopup = () => {
    const filteredCustomers = availableCustomers.filter(customer =>
      customer.full_name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(customerSearchQuery.toLowerCase())
    );

    const toggleCustomerSelection = (customerId) => {
      setSelectedCustomers(prev =>
        prev.includes(customerId)
          ? prev.filter(id => id !== customerId)
          : [...prev, customerId]
      );
    };

    const selectAll = () => {
      if (selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0) {
        setSelectedCustomers([]);
      } else {
        setSelectedCustomers(filteredCustomers.map(c => c.id));
      }
    };

    return (
      <>
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={handleClosePopup}
        />
        
        <div 
          className="fixed top-0 right-0 h-full w-[480px] max-w-[90vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out forwards;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #22c55e, #16a34a);
              border-radius: 10px;
            }
          `}</style>
          
          {/* Header - Green Theme */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserPlus size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Members</h3>
                  <p className="text-xs text-green-100 mt-0.5">
                    Add customers to {groupData?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClosePopup}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white hover:rotate-90 duration-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Select All */}
            {filteredCustomers.length > 0 && (
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <button
                  onClick={selectAll}
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition flex items-center gap-2"
                >
                  {selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Circle size={16} />
                  )}
                  {selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-xs text-gray-500">
                  {selectedCustomers.length} selected
                </span>
              </div>
            )}

            {/* Customer List */}
            {loadingCustomers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No customers available</p>
                <p className="text-sm text-gray-400 mt-1">
                  {customerSearchQuery ? 'Try adjusting your search' : 'All customers are already in this group'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((customer) => {
                  const isSelected = selectedCustomers.includes(customer.id);
                  return (
                    <div
                      key={customer.id}
                      onClick={() => toggleCustomerSelection(customer.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                        isSelected
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {customer.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.full_name || 'Unnamed'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="truncate">{customer.email || 'No email'}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{customer.phone || 'No phone'}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.is_active)}`}>
                        {getStatusIcon(customer.is_active)}
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer - Green Theme */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <button
                onClick={handleAddMembers}
                disabled={addingMembers || selectedCustomers.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingMembers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlusIcon size={18} />
                    Add Selected ({selectedCustomers.length})
                  </>
                )}
              </button>
              <button
                onClick={handleClosePopup}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600">{error}</p>
            <button onClick={() => navigate('/customer-groups')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
              Back to Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredMembers = members.filter(member =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <button onClick={() => navigate('/customer-groups')} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Customer Group Detail</h1>
                <span className="text-gray-300 text-xl">/</span>
                <span className="text-sm text-blue-400 font-medium mt-1">
                  {groupData?.name || 'Group'}
                </span>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Group Details Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-xl">
                      <UserCog className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Group Details</h2>
                      <p className="text-sm text-gray-500">Complete information</p>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateGroup} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name *</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={editFormData.is_active}
                          onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                          {editFormData.is_active ? 'Active' : 'Inactive'}
                        </label>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                        {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save size={18} /> Save</>}
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(groupData?.is_active)}`}>
                        {getStatusIcon(groupData?.is_active)}
                        {groupData?.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Group"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(true)} 
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Group"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Group Name</p>
                      <p className="text-base font-semibold text-gray-900">{groupData?.name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                      <p className="text-base text-gray-700">{groupData?.description || 'No description'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Members</p>
                      <p className="text-base font-semibold text-gray-900">{members.length}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Created At</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(groupData?.created_at)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(groupData?.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Members List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Members</h3>
                      <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {members.length}
                      </span>
                    </div>
                    <button 
                      onClick={handleOpenPopup}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-1.5 shadow-sm shadow-green-500/25"
                    >
                      <UserPlus size={14} />
                      Add Member
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {members.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No Members in this Group</p>
                      <p className="text-sm text-gray-400 mt-1">Add members to this group</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left font-medium text-gray-700">SI</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Phone</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Joined</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map((member, index) => (
                            <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                              <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                    {member.full_name?.charAt(0) || 'U'}
                                  </div>
                                  <span className="font-medium text-gray-900">{member.full_name || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{member.email || 'N/A'}</td>
                              <td className="px-4 py-3 text-gray-600">{member.phone || 'N/A'}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.is_active)}`}>
                                  {getStatusIcon(member.is_active)}
                                  {member.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(member.created_at)}</td>
                              <td className="px-4 py-3">
                                {/* ✅ Remove Member button with Eye icon */}
                                <button 
                                  onClick={() => handleOpenRemoveConfirm(member)}
                                  disabled={removingMember === member.id}
                                  className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                                  title="Remove Member"
                                >
                                  {removingMember === member.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserMinus size={16} />
                                      <span className="text-xs">Remove</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Group Confirmation Modal */}
      {showDeleteConfirm && <DeleteGroupConfirmModal />}
      
      {/* ✅ Remove Member Confirmation Modal */}
      {showRemoveConfirm && <RemoveMemberConfirmModal />}
      
      {/* Add Member Popup - Green Theme */}
      {showAddMemberPopup && <AddMemberPopup />}
    </div>
  );
};

export default CustomerGroupDetail;
import React, { useState, useEffect, useCallback, memo } from "react";
import Sidebar from "./Sidebar/Sidebar";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, RefreshCw, Eye, X } from "lucide-react";

// Helper to decode JWT token and extract admin ID
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

// Get admin ID from localStorage token
const getAdminIdFromToken = () => {
  try {
    const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken', 'userToken'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          // Try common fields for admin id
          const adminId = decoded.adminid || decoded.adminId || decoded.id || decoded.userId;
          if (adminId) return adminId;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting admin ID from token:", error);
    return null;
  }
};

const BillManagement = () => {
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBill, setSelectedBill] = useState(null); // for modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    userid: "",
    chargerid: "",
    fromDate: "",
    toDate: "",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const adminId = getAdminIdFromToken();

  // Fetch bills using adminid
  const fetchBills = useCallback(async () => {
    if (!adminId) {
      setError("Admin ID not found. Please log in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body = {
        adminid: adminId,
        userid: filters.userid || undefined,
        chargerid: filters.chargerid || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        sortOrder: filters.sortOrder,
        page: filters.page,
        limit: filters.limit,
      };

      const res = await fetch("https://be.cms.ocpp.transev.site/admin/getbilldatabyadminid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiauthkey: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setBills(data.data || []);
        setPagination(data.pagination);
      } else {
        setError(data.message || "Failed to fetch bills");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [adminId, filters]);

  // Fetch single bill details
  const fetchBillDetails = async (billid) => {
    setDetailLoading(true);
    try {
      const res = await fetch("https://be.cms.ocpp.transev.site/admin/getbilldatabyid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiauthkey: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
        },
        body: JSON.stringify({ billid }),
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedBill(data.data);
        setShowDetailModal(true);
      } else {
        alert(data.message || "Failed to load bill details");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading bill details");
    } finally {
      setDetailLoading(false);
    }
  };

  // Apply filters (reset to page 1)
  const applyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle page change
  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setFilters(prev => ({ ...prev, page }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userid: "",
      chargerid: "",
      fromDate: "",
      toDate: "",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    if (adminId) {
      fetchBills();
    }
  }, [fetchBills, adminId]);

  // Table columns
  const columns = [
    { key: "uid", label: "Bill ID" },
    { key: "username", label: "User Name" },
    { key: "chargerid", label: "Charger ID" },
    { key: "totalamount", label: "Total Amount (₹)", align: "right" },
    { key: "energyconsumption", label: "Energy (kWh)", align: "right" },
    { key: "chargingtime", label: "Charging Time", align: "right" },
    { key: "createdAt", label: "Date", format: (val) => new Date(val).toLocaleDateString() },
  ];

  // Format currency and numbers
  const formatNumber = (val) => {
    if (val === undefined || val === null) return "-";
    return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">Bill Management</h1>
              <p className="text-sm text-gray-400 mt-1">
                View and manage all charging session bills
              </p>
            </div>
            <div className="text-sm text-gray-400">
              {adminId ? `Admin ID: ${adminId}` : "Not logged in"}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400">User ID</label>
              <input
                type="text"
                name="userid"
                value={filters.userid}
                onChange={handleFilterChange}
                placeholder="Filter by user"
                className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Charger ID</label>
              <input
                type="text"
                name="chargerid"
                value={filters.chargerid}
                onChange={handleFilterChange}
                placeholder="Filter by charger"
                className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">To Date</label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Sort Order</label>
              <select
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
                className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Page Size</label>
              <select
                name="limit"
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
            <button
              onClick={() => applyFilters({})}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Bill Table */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">{error}</div>
          ) : bills.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No bills found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map(col => (
                    <th key={col.key} className={`text-left py-3 px-2 text-gray-400 font-medium ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="text-center py-3 px-2 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className={`py-3 px-2 ${col.align === 'right' ? 'text-right' : ''}`}>
                        {col.key === 'totalamount'
                          ? `₹ ${formatNumber(bill[col.key])}`
                          : col.key === 'energyconsumption'
                          ? `${formatNumber(bill[col.key])} kWh`
                          : col.format
                          ? col.format(bill[col.key])
                          : bill[col.key] || "-"}
                      </td>
                    ))}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => fetchBillDetails(bill.uid)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && bills.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400">
                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of {pagination.totalRecords} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 bg-blue-600 rounded-lg">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => goToPage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bill Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#0B0F1A] p-5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Bill Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5">
                {detailLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedBill ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Bill ID</p>
                      <p className="font-mono text-white">{selectedBill.uid}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">User Name</p>
                      <p className="text-white">{selectedBill.username}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">User ID</p>
                      <p className="text-white">{selectedBill.userid}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Charger ID</p>
                      <p className="text-white">{selectedBill.chargerid}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Wallet ID</p>
                      <p className="text-white">{selectedBill.walletid || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Last Transaction</p>
                      <p className="text-white">{selectedBill.lasttransaction || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Balance Deducted</p>
                      <p className="text-white">₹ {formatNumber(selectedBill.balancededuct)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Energy Consumption</p>
                      <p className="text-white">{formatNumber(selectedBill.energyconsumption)} kWh</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Charging Time</p>
                      <p className="text-white">{selectedBill.chargingtime || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Taxable Amount</p>
                      <p className="text-white">₹ {formatNumber(selectedBill.taxableamount)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">GST Amount</p>
                      <p className="text-white">₹ {formatNumber(selectedBill.gstamount)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Total Amount</p>
                      <p className="text-white font-semibold">₹ {formatNumber(selectedBill.totalamount)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Admin ID</p>
                      <p className="text-white">{selectedBill.associatedadminid}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Created At</p>
                      <p className="text-white">{new Date(selectedBill.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Updated At</p>
                      <p className="text-white">{new Date(selectedBill.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-400">Failed to load bill details</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillManagement;
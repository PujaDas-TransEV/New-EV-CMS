import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const RevenueManagement = () => {
  const [selectedMonth, setSelectedMonth] = useState("May");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalSessions: 0,
    validCount: 0,
    invalidCount: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hubFilter, setHubFilter] = useState("All");
  const [showInvalidOnly, setShowInvalidOnly] = useState(false);

  // API Configuration
  const API_CONFIG = {
    BASE_URL: "https://be.cms.ocpp.transev.site/admin/admingetcombinedchargingsessions",
    API_KEY: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
    KEY_HEADER: "apiauthkey"
  };

  // Refs to prevent duplicate API calls
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);
  const abortController = useRef(null);
  const lastFetchId = useRef(0);

  // Get admin ID from token
  const getAdminIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const decoded = jwtDecode(token);
      return decoded.adminid || decoded.adminId || decoded.userid || decoded.userId || decoded.id || decoded.user_id || "5mrv";
    } catch (err) {
      console.error("Error decoding token:", err);
      return "5mrv";
    }
  };

  // Cancel any ongoing fetch request
  const cancelPreviousFetch = () => {
    if (abortController.current) {
      abortController.current.abort();
      console.log("Previous API request cancelled");
    }
  };

  // Fetch revenue data from API
  const fetchRevenueData = async (page = 1, limit = 50, force = false) => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current && !force) {
      console.log("Fetch already in progress, skipping...");
      return;
    }

    // Cancel any previous request
    cancelPreviousFetch();
    
    // Create new AbortController for this request
    abortController.current = new AbortController();
    const currentFetchId = ++lastFetchId.current;
    
    console.log(`Starting fetch #${currentFetchId} for page ${page}, limit ${limit}`);

    fetchInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const adminUid = getAdminIdFromToken();
      
      const payload = {
        adminuid: adminUid,
        limit: limit.toString(),
        page: page.toString()
      };

      console.log("Fetching revenue data with payload:", payload);

      const response = await axios.post(
        API_CONFIG.BASE_URL,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            [API_CONFIG.KEY_HEADER]: API_CONFIG.API_KEY,
          },
          timeout: 10000,
          signal: abortController.current.signal,
        }
      );

      // Check if this is still the latest request
      if (currentFetchId !== lastFetchId.current) {
        console.log(`Ignoring stale response from fetch #${currentFetchId}`);
        return;
      }

      console.log("Revenue API Response:", response.data);

      const data = response.data;

      // Extract combined and invalid sessions
      const combinedSessions = data.combined || [];
      const invalidSessions = data.invalid || [];

      // Map combined sessions (valid sessions with transaction history)
      const formattedCombined = combinedSessions.map((session, index) => {
        const sessionData = session.session || {};
        const transactionData = session.transactionHistory || {};
        
        return formatSessionData(sessionData, transactionData, "Valid", index);
      });

      // Map invalid sessions (sessions without transaction history)
      const formattedInvalid = invalidSessions.map((invalidItem, index) => {
        const sessionData = invalidItem.session || {};
        const reason = invalidItem.reason || "No transaction history";
        
        const formatted = formatSessionData(sessionData, {}, "Invalid", index);
        formatted.reason = reason;
        return formatted;
      });

      // Combine both arrays
      const allTransactions = [...formattedCombined, ...formattedInvalid];

      if (isMounted.current) {
        setTransactions(allTransactions);
        
        // Update pagination from response
        if (data.pagination) {
          setPagination({
            page: parseInt(data.pagination.page) || page,
            limit: parseInt(data.pagination.limit) || limit,
            totalSessions: parseInt(data.pagination.returned_sessions) || allTransactions.length,
            validCount: parseInt(data.pagination.valid_count) || formattedCombined.length,
            invalidCount: parseInt(data.pagination.invalid_count) || formattedInvalid.length
          });
        } else {
          setPagination(prev => ({
            ...prev,
            page: page,
            totalSessions: allTransactions.length,
            validCount: formattedCombined.length,
            invalidCount: formattedInvalid.length
          }));
        }
      }

    } catch (err) {
      // Check if this is still the latest request
      if (currentFetchId !== lastFetchId.current) {
        console.log(`Ignoring stale error from fetch #${currentFetchId}`);
        return;
      }
      
      // Ignore abort errors
      if (axios.isCancel(err)) {
        console.log("Request was cancelled:", err.message);
        return;
      }
      
      console.error("Error fetching revenue data:", err);
      
      let errorMessage = "Failed to load revenue data";
      if (err.response) {
        console.error("Response error:", err.response.status, err.response.data);
        errorMessage = `Server Error: ${err.response.status}`;
        
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "API Authentication Failed";
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = "No response from server. Please check your connection.";
      }
      
      if (isMounted.current) {
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      fetchInProgress.current = false;
    }
  };

  // Format session data for display
  const formatSessionData = (sessionData, transactionData, status, index) => {
    // Extract transaction ID
    const transactionId = sessionData.sessionid || 
                         transactionData.transaction_id || 
                         `TX${Date.now()}${index}`;

    // Extract amount - handle different formats
    let amount = "₹0.00";
    const totalcost = sessionData.totalcost || transactionData.amount;
    if (totalcost !== undefined && totalcost !== null) {
      const costNum = typeof totalcost === 'string' ? parseFloat(totalcost) : totalcost;
      amount = `₹${costNum.toFixed(2)}`;
    }

    // Extract usage/energy
    let usage = "0.00 kWh";
    const consumedkwh = sessionData.consumedkwh || transactionData.energy_kwh;
    if (consumedkwh !== undefined && consumedkwh !== null) {
      const usageNum = typeof consumedkwh === 'string' ? parseFloat(consumedkwh) : consumedkwh;
      usage = `${usageNum.toFixed(3)} kWh`;
    }

    // Extract charger info
    const charger = sessionData.chargerid || 
                   transactionData.charger_name || 
                   "--";

    // Extract hub info (not in response, we'll use placeholder)
    const hub = "--";

    // Extract tariff (not in response, we'll use placeholder)
    const tariff = "--";

    // Extract status
    const displayStatus = status;

    // Extract owner (from associatedadminid)
    const owner = sessionData.associatedadminid || 
                 transactionData.owner_type || 
                 "Host";

    // Extract host details (admin ID)
    const hostDetails = sessionData.associatedadminid || "Admin";

    // Extract driver details
    const driverDetails = sessionData.userid || 
                         transactionData.driver_name || 
                         transactionData.user_name || 
                         "--";

    // Extract and format timestamp
    let timestamp = "--";
    const timeSource = sessionData.startime || sessionData.createdAt || transactionData.transaction_time;
    if (timeSource) {
      try {
        const date = new Date(timeSource);
        timestamp = date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        timestamp = timeSource;
      }
    }

    // Additional session details for tooltips
    const sessionDetails = {
      meterStart: sessionData.meterstart,
      meterStop: sessionData.meterstop,
      startTime: sessionData.startime,
      stopTime: sessionData.stoptime,
      sessionId: sessionData.sessionid
    };

    return {
      id: transactionId,
      status: displayStatus,
      amount: amount,
      charger: charger,
      hub: hub,
      tariff: tariff,
      usage: usage,
      owner: owner,
      hostDetails: hostDetails,
      driverDetails: driverDetails,
      timestamp: timestamp,
      sessionDetails: sessionDetails,
      rawData: sessionData,
      transactionData: transactionData
    };
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Status filter
    if (statusFilter !== "All" && transaction.status !== statusFilter) {
      return false;
    }
    
    // Hub filter
    if (hubFilter !== "All" && transaction.hub !== hubFilter) {
      return false;
    }
    
    // Show invalid only filter
    if (showInvalidOnly && transaction.status !== "Invalid") {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(query) ||
        transaction.charger.toLowerCase().includes(query) ||
        transaction.driverDetails.toLowerCase().includes(query) ||
        transaction.hostDetails.toLowerCase().includes(query) ||
        transaction.owner.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Calculate total revenue from filtered transactions
  const calculateTotalRevenue = () => {
    return filteredTransactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount.replace(/[^0-9.-]+/g, "")) || 0;
      return total + amount;
    }, 0).toFixed(2);
  };

  // Calculate total energy from filtered transactions
  const calculateTotalEnergy = () => {
    return filteredTransactions.reduce((total, transaction) => {
      const usage = parseFloat(transaction.usage.replace(/[^0-9.-]+/g, "")) || 0;
      return total + usage;
    }, 0).toFixed(3);
  };

  // Get unique statuses for filter dropdown
  const getUniqueStatuses = () => {
    const statuses = transactions.map(t => t.status);
    return ["All", ...new Set(statuses)];
  };

  // Get unique hubs for filter dropdown (from data if available)
  const getUniqueHubs = () => {
    const hubs = transactions.map(t => t.hub).filter(hub => hub && hub !== "--");
    return ["All", ...new Set(hubs)];
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(pagination.totalSessions / pagination.limit)) {
      fetchRevenueData(newPage, pagination.limit);
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    fetchRevenueData(1, newLimit);
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = ["Transaction ID", "Status", "Amount", "Charger", "Hub", "Tariff", "Usage", "Owner", "Host", "Driver", "Timestamp", "Meter Start", "Meter Stop"];
    const csvData = filteredTransactions.map(t => [
      t.id,
      t.status,
      t.amount,
      t.charger,
      t.hub,
      t.tariff,
      t.usage,
      t.owner,
      t.hostDetails,
      t.driverDetails,
      t.timestamp,
      t.sessionDetails.meterStart || "--",
      t.sessionDetails.meterStop || "--"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-sessions-${selectedMonth}-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = ["2022", "2023", "2024", "2025", "2026"];

  useEffect(() => {
    isMounted.current = true;
    
    // Use a timeout to prevent duplicate calls in development mode
    const fetchTimeout = setTimeout(() => {
      if (isMounted.current) {
        fetchRevenueData(1, 50);
      }
    }, 100);

    return () => {
      console.log("Component unmounting, cleaning up...");
      isMounted.current = false;
      fetchInProgress.current = false;
      cancelPreviousFetch();
      clearTimeout(fetchTimeout);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* PAGE HEADER */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* LEFT */}
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Revenue Management
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Track transactions, earnings and settlements
              </p>
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={exportToCSV}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
              >
                Export CSV
              </button>

              {/* MONTH SELECT */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-medium shadow text-sm"
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* YEAR SELECT */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-medium shadow text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">₹{calculateTotalRevenue()}</p>
            <p className="text-xs text-gray-400 mt-1">
              From {filteredTransactions.length} sessions
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-sm text-gray-400">Total Sessions</p>
            <p className="text-2xl font-bold text-white">{pagination.totalSessions}</p>
            <p className="text-xs text-gray-400 mt-1">
              {pagination.validCount} Valid • {pagination.invalidCount} Invalid
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-sm text-gray-400">Total Energy</p>
            <p className="text-2xl font-bold text-white">{calculateTotalEnergy()} kWh</p>
            <p className="text-xs text-gray-400 mt-1">
              Energy consumed
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-sm text-gray-400">Settlement Status</p>
            <p className={`text-2xl font-bold ${
              pagination.validCount > 0 ? "text-green-400" : "text-yellow-400"
            }`}>
              {pagination.validCount > 0 ? "Processed" : "Pending"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {pagination.invalidCount} sessions need attention
            </p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <input
            placeholder="Search by transaction ID, charger, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm w-full md:w-96 focus:ring-2 focus:ring-blue-500"
          />

          <select 
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {getUniqueStatuses().map(status => status !== "All" && (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select 
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm"
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
          >
            <option value="All">All Hubs</option>
            {getUniqueHubs().map(hub => hub !== "All" && hub !== "--" && (
              <option key={hub} value={hub}>{hub}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showInvalidOnly"
              checked={showInvalidOnly}
              onChange={(e) => setShowInvalidOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600"
            />
            <label htmlFor="showInvalidOnly" className="text-sm text-gray-300">
              Show Invalid Only
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">
              Page {pagination.page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={filteredTransactions.length < pagination.limit || loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-400">Loading revenue data...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-white mb-2">No transactions found</p>
              <p className="text-sm text-gray-400">
                {searchQuery || statusFilter !== "All" || hubFilter !== "All" || showInvalidOnly
                  ? "Try adjusting your filters or search terms" 
                  : "No charging sessions recorded"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr className="text-xs uppercase text-gray-400">
                    {[
                      "Session ID",
                      "Status",
                      "Amount",
                      "Charger",
                      "Hub",
                      "Tariff",
                      "Usage",
                      "Owner",
                      "Host",
                      "Driver",
                      "Timestamp",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-4 py-4 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition group">
                      <td className="px-4 py-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          {t.id}
                          {t.sessionDetails && (
                            <button 
                              className="text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition"
                              title="View session details"
                              onClick={() => {
                                alert(`Session Details:\nID: ${t.id}\nCharger: ${t.charger}\nDriver: ${t.driverDetails}\nEnergy: ${t.usage}\nAmount: ${t.amount}\nMeter Start: ${t.sessionDetails.meterStart || '--'}\nMeter Stop: ${t.sessionDetails.meterStop || '--'}\nStart Time: ${t.sessionDetails.startTime || '--'}\nStop Time: ${t.sessionDetails.stopTime || '--'}`);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          t.status === "Valid" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{t.amount}</td>
                      <td className="px-4 py-3">{t.charger}</td>
                      <td className="px-4 py-3">{t.hub}</td>
                      <td className="px-4 py-3">{t.tariff}</td>
                      <td className="px-4 py-3">{t.usage}</td>
                      <td className="px-4 py-3">{t.owner}</td>
                      <td className="px-4 py-3">{t.hostDetails}</td>
                      <td className="px-4 py-3">{t.driverDetails}</td>
                      <td className="px-4 py-3 text-gray-400">{t.timestamp}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-xs"
                            onClick={() => {
                              // View details action
                              alert(`Session Details:\nID: ${t.id}\nStatus: ${t.status}\nAmount: ${t.amount}\nCharger: ${t.charger}\nUsage: ${t.usage}\nDriver: ${t.driverDetails}\nTimestamp: ${t.timestamp}`);
                            }}
                          >
                            View
                          </button>
                          {t.status === "Invalid" && (
                            <button 
                              className="px-3 py-1 rounded-lg bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 transition text-xs"
                              onClick={() => {
                                // Action to fix invalid session
                                alert(`This session needs attention. Please check transaction history for session ID: ${t.id}`);
                              }}
                            >
                              Fix
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION FOOTER */}
          {filteredTransactions.length > 0 && (
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div>
                  Showing <span className="text-white font-medium">{filteredTransactions.length}</span> of{" "}
                  <span className="text-white font-medium">{pagination.totalSessions}</span> sessions
                  <span className="ml-4">
                    (<span className="text-green-400">{pagination.validCount}</span> valid,{" "}
                    <span className="text-red-400">{pagination.invalidCount}</span> invalid)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-[#111827] border border-white/10 rounded-lg px-2 py-1 text-xs"
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                    disabled={loading}
                  >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                  <button 
                    onClick={() => fetchRevenueData(1, pagination.limit, true)}
                    disabled={loading}
                    className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
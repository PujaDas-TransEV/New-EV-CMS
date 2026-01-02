import React, { useEffect, useState } from "react";
import { FilterList, Search } from "@mui/icons-material";
import Sidebar from "../Sidebar/Sidebar";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ChargerList = () => {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.userid;
    }
    return null;
  };

  const fetchChargers = async () => {
    setLoading(true);
    setError(null);

    const userId = getUserIdFromToken();
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "https://be.cms.ocpp.transev.site/admin/getchargerbyuserid",
        { get_user_id: userId },
        {
          headers: {
            "Content-Type": "application/json",
            apiauthkey:
              "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
          },
        }
      );

      const data = res.data.user_chargerunit_details;
      setChargers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch chargers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
  }, []);

  const totalConnectors = chargers.reduce(
    (sum, c) => sum + Number(c.number_of_connectors || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* PAGE HEADER */}
        {/* PAGE HEADER */}
<div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    {/* LEFT */}
    <div>
      <h1 className="text-2xl font-semibold text-white">
        Chargers & Sessions
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        View and manage all registered charger units
      </p>

    </div>

    {/* RIGHT */}
    <Link to="/add-charger">
      <button
        className="
          px-5 py-2.5 rounded-xl
          bg-blue-600 hover:bg-blue-700
          transition
          text-sm font-medium
          shadow-md
        "
      >
        Add Charger
      </button>
    </Link>

  </div>
</div>


        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Chargers</p>
            <p className="text-2xl font-bold text-white">{chargers.length}</p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Connectors</p>
            <p className="text-2xl font-bold text-white">{totalConnectors}</p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Network</p>
            <p className="text-2xl font-bold text-white">All</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-4 items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
          <select className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500">
            <option>All Networks</option>
          </select>

          <select className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500">
            <option>All ({chargers.length})</option>
            <option>Available</option>
            <option>Busy</option>
            <option>Error</option>
          </select>

          <button className="p-2 rounded-xl bg-[#111827] border border-white/10 hover:bg-white/10 transition">
            <FilterList />
          </button>

          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search chargers..."
              className="bg-[#111827] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-x-auto">
          {loading ? (
            <p className="text-center py-10 text-gray-400">Loading chargers...</p>
          ) : error ? (
            <p className="text-center py-10 text-red-500">{error}</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-gray-400 uppercase text-xs">
                  {[
                    "Charger ID",
                    "Status",
                    "Hub Name",
                    "Charger Name",
                    "Connectors",
                    "Host",
                    "Protocol",
                    "Last Online",
                    "Uptime",
                    "Make",
                    "Firmware",
                    "Update",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="px-4 py-4 text-left whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {chargers.map((c) => (
                  <tr
                    key={c.uid}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3">{c.uid}</td>
                    <td className="px-4 py-3 text-yellow-400">N/A</td>
                    <td className="px-4 py-3">{c.Chargerhost}</td>
                    <td className="px-4 py-3">{c.ChargerName}</td>
                    <td className="px-4 py-3">{c.Connector_type}</td>
                    <td className="px-4 py-3">{c.firstname}</td>
                    <td className="px-4 py-3">OCPP</td>
                    <td className="px-4 py-3">{c.createdAt}</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">{c.createdAt}</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3 text-blue-400 cursor-pointer">
                      View
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChargerList;

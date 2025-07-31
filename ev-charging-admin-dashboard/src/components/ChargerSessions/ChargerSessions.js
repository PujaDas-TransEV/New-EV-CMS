import React, { useEffect, useState } from 'react';
import { FilterList, Search } from '@mui/icons-material';
import Sidebar from '../Sidebar/Sidebar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ChargerList = () => {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      return decodedToken.userid;
    }
    return null;
  };

  const fetchChargers = async () => {
    setLoading(true);
    setError(null);
    const userId = getUserIdFromToken();

    if (!userId) {
      setError('User ID not found in token');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(
        'https://be.cms.ocpp.transev.site/admin/getchargerbyuserid',
        { get_user_id: userId },
        {
          headers: {
            'Content-Type': 'application/json',
            apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
          },
        }
      );

      const chargerDetails = response.data.user_chargerunit_details;
      setChargers(Array.isArray(chargerDetails) ? chargerDetails : []);
    } catch (error) {
      setError('Failed to fetch chargers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="text-3xl font-semibold mb-6 text-white">Chargers & Sessions / Chargers</h2>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button className="bg-gray-700 text-gray-200 py-2 px-4 rounded border border-gray-600 hover:bg-gray-600">
              {chargers.length} Chargers
            </button>
            <button className="bg-gray-700 text-gray-200 py-2 px-4 rounded border border-gray-600 hover:bg-gray-600">
              {Array.isArray(chargers) ? chargers.reduce((total, charger) => total + Number(charger.number_of_connectors || 0), 0) : 0} Connectors
            </button>
          </div>
          <Link to="/add-charger">
            <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              + Add Charger
            </button>
          </Link>
        </div>

        <div className="flex items-center mb-6 space-x-4">
          <select className="border border-gray-600 rounded py-2 px-4 bg-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500">
            <option value="All Network">All Network</option>

          </select>
          <select className="border border-gray-600 rounded py-2 px-4 bg-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500">
            <option value="All">All ({chargers.length})</option>
            <option value="Busy">Busy (0)</option>
            <option value="Available">Available (4)</option>
            <option value="Error">Error (7)</option>
          </select>
          <button className="p-2 text-gray-400 hover:text-gray-300">
            <FilterList />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-600 rounded py-2 px-10 pl-10 bg-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="bg-gray-800 shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  {[
                    'CHARGER ID', 'Status', 'HUB NAME', 'CHARGER NAME', 'CONNECTOR(S)', 'HOST DETAILS',
                    'PROTOCOL', 'LAST ONLINE', 'UPTIME', 'MAKE', 'FIRMWARE VERSION', 'FIRMWARE UPDATE', 'ACTION'
                  ].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {chargers.map((charger) => (
                  <tr key={charger.uid}>
                    {[
                      charger.uid || '', 'N/A', charger.Chargerhost || '', charger.ChargerName || '',
                      charger.Connector_type || '', charger.firstname || '', 'N/A', charger.createdAt || '',
                      charger.Connector_type || '', charger.createdAt || '', 'N/A', 'N/A', 'N/A', 
                    ].map((value, index) => (
                      <td key={index} className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargerList;

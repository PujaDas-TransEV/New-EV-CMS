
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Bell,
  MapPin,
  Zap,
  Sun,
  Moon,
  Power,
  AlertTriangle,
  X,
} from "lucide-react";

/* ---------------- MOCK REALTIME DATA ---------------- */
const livePowerData = [
  { time: "10:00", power: 1.2 },
  { time: "11:00", power: 1.8 },
  { time: "12:00", power: 2.4 },
  { time: "13:00", power: 2.1 },
  { time: "14:00", power: 2.9 },
];

const chargersMock = [
  {
    id: "a7crit",
    name: "Charger 1",
    status: "Available",
    power: "0.0 kW",
    rate: "₹9.50 / min",
  },
  {
    id: "b3fexe",
    name: "Charger 2",
    status: "Charging",
    power: "1.9 kW",
    rate: "₹5.50 / min",
  },
];

/* ---------------- MAIN DASHBOARD ---------------- */
const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [darkMode, setDarkMode] = useState(true);
  const [alerts, setAlerts] = useState([
    "Charger #2 high load detected",
    "Charger #7 went offline",
  ]);
  const [selectedCharger, setSelectedCharger] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin");
    try {
      const decoded = jwtDecode(token);
      setUserName(decoded.firstname || "User");
    } catch {
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-200">
        <Sidebar />

        <div className="flex-1 p-6 space-y-6">
          {/* TOP BAR */}
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {userName} 
                 </h1>
              <p className="text-sm text-gray-400">Enterprise EV Charging Control Center</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="relative">
                <Bell />
                {alerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-2 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* KPI SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <Kpi title="Revenue" value="₹1,24,500" icon={<Zap />} color="from-green-500 to-emerald-600" />
            <Kpi title="Active Sessions" value="82" icon={<Power />} color="from-blue-500 to-cyan-600" />
            <Kpi title="Usage" value="76%" icon={<Zap />} color="from-yellow-500 to-orange-500" />
            <Kpi title="Uptime" value="99.3%" icon={<Zap />} color="from-purple-500 to-indigo-600" />
          </div>

          {/* GRAPH + MAP */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Live Power Consumption</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={livePowerData}>
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line type="monotone" dataKey="power" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin /> Charger Map
              </h2>
              <div className="h-[260px] rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-400">
                Google Maps / Mapbox Integration Ready
              </div>
            </div>
          </div>

          {/* CHARGERS */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-6">Chargers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {chargersMock.map((c) => (
                <ChargerCard key={c.id} charger={c} onClick={() => setSelectedCharger(c)} />
              ))}
            </div>
          </div>

          {/* ALERTS */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-400" /> System Alerts
            </h2>
            <ul className="space-y-3">
              {alerts.map((a, i) => (
                <li key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm">
                  ⚠ {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CHARGER DRAWER */}
        {selectedCharger && (
          <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
            <div className="w-full sm:w-[420px] bg-gray-900 h-full p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedCharger.name}</h2>
                <button onClick={() => setSelectedCharger(null)}>
                  <X />
                </button>
              </div>

              <p className="text-sm text-gray-400">ID: {selectedCharger.id}</p>
              <p>Status: <span className="font-semibold">{selectedCharger.status}</span></p>
              <p>Power: {selectedCharger.power}</p>
              <p>Rate: {selectedCharger.rate}</p>

              <div className="space-y-3">
                <button className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700">Start Session</button>
                <button className="w-full py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700">Stop Session</button>
                <button className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700">Reset Charger</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */
const Kpi = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-xl hover:scale-[1.03] transition`}>
    <div className="flex justify-between items-center">
      <p className="text-sm opacity-80">{title}</p>
      {icon}
    </div>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

const ChargerCard = ({ charger, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-gray-900 border border-gray-700 rounded-2xl p-5 hover:shadow-2xl transition"
  >
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-semibold text-lg">{charger.name}</h3>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold
        ${charger.status === "Available" && "bg-green-500/20 text-green-400"}
        ${charger.status === "Charging" && "bg-blue-500/20 text-blue-400"}`}
      >
        {charger.status}
      </span>
    </div>
    <p className="text-sm text-gray-400">{charger.id}</p>
    <hr className="my-3 border-gray-700" />
    <p className="text-sm">Power: <b>{charger.power}</b></p>
    <p className="text-sm">Rate: <b>{charger.rate}</b></p>
  </div>
);

export default Dashboard;
import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";

const alertsData = [
  {
    id: 1,
    title: "Charger Offline",
    description: "Charger EV-DEL-023 is not responding.",
    severity: "critical",
    time: "2 mins ago",
  },
  {
    id: 2,
    title: "Low Power Output",
    description: "Charger BLR-AC-11 power dropped below threshold.",
    severity: "warning",
    time: "10 mins ago",
  },
  {
    id: 3,
    title: "Session Completed",
    description: "Charging session completed successfully.",
    severity: "info",
    time: "30 mins ago",
  },
];

const severityStyles = {
  critical: {
    icon: <XCircle className="text-red-500" size={22} />,
    border: "border-red-500/40",
    bg: "bg-red-500/10",
  },
  warning: {
    icon: <AlertTriangle className="text-yellow-400" size={22} />,
    border: "border-yellow-400/40",
    bg: "bg-yellow-400/10",
  },
  info: {
    icon: <CheckCircle className="text-blue-400" size={22} />,
    border: "border-blue-400/40",
    bg: "bg-blue-400/10",
  },
};

const Alerts = () => {
  const [filter, setFilter] = useState("all");

  const filteredAlerts =
    filter === "all"
      ? alertsData
      : alertsData.filter((a) => a.severity === filter);

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar />

      <main className="flex-1 p-6 text-gray-200">
        {/* Header */}
        {/* PAGE HEADER */}
<div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 mb-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    {/* LEFT: Title + Summary */}
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Bell className="text-blue-400" size={24} />
        <h1 className="text-2xl font-semibold text-white">Alerts</h1>
      </div>

      <p className="text-sm text-gray-400">
        View all system alerts and notifications
      </p>

      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
        <span>
          Total Alerts <strong className="text-white">{alertsData.length}</strong>
        </span>
        <span className="w-1 h-1 bg-gray-500 rounded-full" />
        <span>
          Critical <strong className="text-red-400">{alertsData.filter(a => a.severity === 'critical').length}</strong>
        </span>
        <span className="w-1 h-1 bg-gray-500 rounded-full" />
        <span>
          Warning <strong className="text-yellow-400">{alertsData.filter(a => a.severity === 'warning').length}</strong>
        </span>
        <span className="w-1 h-1 bg-gray-500 rounded-full" />
        <span>
          Info <strong className="text-blue-400">{alertsData.filter(a => a.severity === 'info').length}</strong>
        </span>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm">
        Refresh
      </button>

      <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium shadow">
        Manage Alerts
      </button>
    </div>

  </div>
</div>


        <div className="flex gap-3 mb-6">
          {["all", "critical", "warning", "info"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  filter === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

 
        <div className="grid gap-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              🎉 No alerts found
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const style = severityStyles[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${style.border} ${style.bg} hover:scale-[1.01] transition`}
                >
                  <div className="mt-1">{style.icon}</div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {alert.description}
                    </p>
                  </div>

                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {alert.time}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Alerts;

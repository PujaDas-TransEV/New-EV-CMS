import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import {
  LifeBuoy,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ticketsMock = [
  {
    id: "SUP-1023",
    subject: "Charger not starting",
    status: "open",
    updated: "5 mins ago",
  },
  {
    id: "SUP-1018",
    subject: "OCPP connection issue",
    status: "in-progress",
    updated: "2 hours ago",
  },
  {
    id: "SUP-1004",
    subject: "Billing mismatch",
    status: "resolved",
    updated: "1 day ago",
  },
];

const statusStyles = {
  open: {
    label: "Open",
    icon: <AlertCircle size={16} />,
    color: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  "in-progress": {
    label: "In Progress",
    icon: <Clock size={16} />,
    color: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle size={16} />,
    color: "bg-green-500/15 text-green-400 border-green-500/30",
  },
};

const Support = () => {
  const [ticket, setTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });

  const handleChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Support ticket submitted successfully!");
    setTicket({ subject: "", description: "", priority: "medium" });
  };

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
        <LifeBuoy className="text-blue-400" size={24} />
        <h1 className="text-2xl font-semibold text-white">Support</h1>
      </div>

      <p className="text-sm text-gray-400">
        Manage support tickets and contact information
      </p>

      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
        <span>
          Total Tickets <strong className="text-white">{ticketsMock.length}</strong>
        </span>
        <span className="w-1 h-1 bg-gray-500 rounded-full" />
        <span>
          Open <strong className="text-red-400">{ticketsMock.filter(t => t.status === 'open').length}</strong>
        </span>
        <span className="w-1 h-1 bg-gray-500 rounded-full" />
        <span>
          In Progress <strong className="text-yellow-400">{ticketsMock.filter(t => t.status === 'in-progress').length}</strong>
        </span>
        <span className="w-1 h-1 bg-gray-500 rounded-full" />
        <span>
          Resolved <strong className="text-green-400">{ticketsMock.filter(t => t.status === 'resolved').length}</strong>
        </span>
      </div>
    </div>

    {/* RIGHT: Actions */}
    <div className="flex items-center gap-3">
      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm">
        Refresh
      </button>

      <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium shadow">
        New Ticket
      </button>
    </div>

  </div>
</div>


        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Form */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">
              Raise a Support Ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={ticket.subject}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={ticket.description}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Priority</label>
                <select
                  name="priority"
                  value={ticket.priority}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 rounded-lg bg-gray-800 border border-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
              >
                <Send size={18} />
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Previous Tickets */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">
              My Tickets
            </h2>

            <div className="space-y-4">
              {ticketsMock.map((t) => {
                const s = statusStyles[t.status];
                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-gray-800 border border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{t.subject}</span>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${s.color}`}
                      >
                        {s.icon}
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Ticket ID: {t.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last updated: {t.updated}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">
            Need immediate help?
          </h3>
          <p className="text-gray-400 text-sm">
            📧 Email: support@transev.com  
            <br />
            📞 Phone: +91 98765 43210  
            <br />
            🕒 Support Hours: 24 × 7
          </p>
        </div>
      </main>
    </div>
  );
};

export default Support;

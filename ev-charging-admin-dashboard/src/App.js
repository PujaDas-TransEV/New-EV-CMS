import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/Authentication/SignIn';
import ForgotPassword from './components/Authentication/ForgotPassword';
import Profile from './components/Profile/Profile';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import ChargerSessions from './components/ChargerSessions/ChargerSessions';
import './index.css'; 
import RevenueManagement from './components/RevenueManagement';
import AddChargerForm from './components/ChargerSessions/AddChargerForm';
import DriversVehicles from './components/DriversVehicles';
import Alerts from './components/Alerts';
import Support from './components/Support';
import BillManagement from './components/BillManagement';
import Organization from './components/Organization/Organization';
import ManageHub from './components/Hubs/Managehubs';
import Addhub from './components/Hubs/Addhub';
import HubwiseDetails from './components/Hubs/ViewHubwise';
import RevenueOverview from './components/Revenue/Overview';
import HelpandSupportPage from './components/HelpAndSupport/Help';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        {/* <Route path="/dashboard/:userId" element={<Dashboard />} /> */}
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/charger-session" element={<ChargerSessions />} />
        <Route path="/revenue" element={<RevenueManagement />} />
        <Route path="/add-charger" element={<AddChargerForm />} />
        <Route path="/vd-management" element={<DriversVehicles />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/support" element={<Support />} />
        <Route path="/bills" element={<BillManagement />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/manage-hubs" element={<ManageHub />} />
        <Route path="/add-hub" element={<Addhub />} />
        <Route path="/hub-details/:hubId" element={<HubwiseDetails />} /> {/* Hub ID wise */}
        <Route path="/revenue/overview" element={<RevenueOverview />} />
         <Route path="/help-support" element={<HelpandSupportPage />} />
      </Routes>
    </Router>
  );
}

export default App;


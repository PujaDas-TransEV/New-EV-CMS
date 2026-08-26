
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/Authentication/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Authentication Pages
import SignIn from './components/Authentication/SignIn';
import ForgotPassword from './components/Authentication/ForgotPassword';

// Main Pages
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import Sidebar from './components/Sidebar/Sidebar';
import ChargerSessions from './components/ChargerSessions/ChargerList';

import AddChargerForm from './components/ChargerSessions/AddChargerForm';

import Alerts from './components/Alerts';

import Organization from './components/Organization/Organization';
import ManageHub from './components/Hubs/Managehubs';
import Addhub from './components/Hubs/Addhub';
import HubwiseDetails from './components/Hubs/ViewHubwise';
import RevenueOverview from './components/Revenue/Overview';
import HelpandSupportPage from './components/HelpAndSupport/Help';
import PaymentIntegration from './components/PaymentIntegration/Payment';
import ChargerDetails from './components/ChargerSessions/ChargerDetails';
import ChargerSession from './components/ChargerSessions/Session';
import Customers from './components/CustomerandVehicles/Customer';

// Customer Groups Pages
import CustomerGroups from './components/CustomerandVehicles/CustomerGroup';
import CustomerGroupDetail from './components/CustomerandVehicles/CustomerGroupDetailsPage';
import AddCustomerGroup from './components/CustomerandVehicles/AddCustomerGroup';

// Revenue Pages
import CustomerTariff from './components/Revenue/CustomerTarrifDetails';
import AddCustomerTariff from './components/Revenue/AddCustomerTarriff';
import Tax from './components/Revenue/Tax';
import GSTProfile from './components/Revenue/GSTProfile';
import Settings from './components/Revenue/Settings';
import CreateInvoice from './components/Revenue/CreateInvoice';
import HubTariff from './components/Revenue/HubTarrif';
import AddHubTariff from './components/Revenue/AddHubTarriff';
import ChargerTariff from './components/Revenue/Chargertarrifs';
import AddChargerTariff from './components/Revenue/AddChargerTarrif';
import AppWalletSettings from './components/AppManagement/Wallet';
import SupportTicket from './components/Support/SupportTicket';
import UserAccess from './components/UserAccess/UserAccess';
import AddStaff from './components/UserAccess/AddStaffAccess';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ===== PROTECTED ROUTES ===== */}
          
          {/* Dashboard & Profile */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sidebar" element={<ProtectedRoute><Sidebar /></ProtectedRoute>} />
          <Route path="/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />

          {/* Charger Management */}
          <Route path="/charger-session" element={<ProtectedRoute><ChargerSessions /></ProtectedRoute>} />
          <Route path="/add-charger" element={<ProtectedRoute><AddChargerForm /></ProtectedRoute>} />
          <Route path="/charger-details/:chargerId" element={<ProtectedRoute><ChargerDetails /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><ChargerSession /></ProtectedRoute>} />

          {/* Hub Management */}
          <Route path="/manage-hubs" element={<ProtectedRoute><ManageHub /></ProtectedRoute>} />
          <Route path="/add-hub" element={<ProtectedRoute><Addhub /></ProtectedRoute>} />
          <Route path="/hub-details/:hubId" element={<ProtectedRoute><HubwiseDetails /></ProtectedRoute>} />

          {/* Revenue Management */}
        
          <Route path="/revenue/overview" element={<ProtectedRoute><RevenueOverview /></ProtectedRoute>} />
          <Route path="/revenue/customer-tariffs" element={<ProtectedRoute><CustomerTariff /></ProtectedRoute>} />
          <Route path="/revenue/add-customer-tariff" element={<ProtectedRoute><AddCustomerTariff /></ProtectedRoute>} />
          <Route path="/revenue/tax" element={<ProtectedRoute><Tax /></ProtectedRoute>} />
       <Route path="/revenue/add-gst" element={<ProtectedRoute><GSTProfile /></ProtectedRoute>} />
          <Route path="/revenue/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/revenue/hub-tariffs" element={<ProtectedRoute><HubTariff /></ProtectedRoute>} />
      <Route path="/revenue/add-hub-tariff" element={<ProtectedRoute><AddHubTariff /></ProtectedRoute>} />
          <Route path="/revenue/create-invoice" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />

          {/* Customer & Vehicles */}
        
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          
          {/* Customer Groups */}
          <Route path="/customer-groups" element={<ProtectedRoute><CustomerGroups /></ProtectedRoute>} />
          <Route path="/customer-group-detail/:userGroupId" element={<ProtectedRoute><CustomerGroupDetail /></ProtectedRoute>} />
          <Route path="/add-customer-group" element={<ProtectedRoute><AddCustomerGroup /></ProtectedRoute>} />

          {/* Other Features */}
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
       
         
          <Route path="/help-support" element={<ProtectedRoute><HelpandSupportPage /></ProtectedRoute>} />
          <Route path="/payment-integration" element={<ProtectedRoute><PaymentIntegration /></ProtectedRoute>} />
          <Route path="/revenue/charger-tariffs" element={<ProtectedRoute><ChargerTariff /></ProtectedRoute>} />
          <Route path="/revenue/add-charger-tariff" element={<ProtectedRoute><AddChargerTariff /></ProtectedRoute>} />
          <Route path="/app-management" element={<ProtectedRoute><AppWalletSettings/></ProtectedRoute>} />
          <Route path="/support-ticket" element={<ProtectedRoute><SupportTicket/></ProtectedRoute>} />
           <Route path="/user-access" element={<ProtectedRoute><UserAccess/></ProtectedRoute>} />
              <Route path="/add-staff" element={<ProtectedRoute><AddStaff/></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
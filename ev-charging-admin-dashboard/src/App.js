// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import SignIn from './components/Authentication/SignIn';
// import ForgotPassword from './components/Authentication/ForgotPassword';
// import Profile from './components/Profile/Profile';
// import Dashboard from './components/Dashboard/Dashboard';
// import Sidebar from './components/Sidebar/Sidebar';
// import ChargerSessions from './components/ChargerSessions/ChargerList';
// import './index.css'; 
// import RevenueManagement from './components/RevenueManagement';
// import AddChargerForm from './components/ChargerSessions/AddChargerForm';
// import DriversVehicles from './components/DriversVehicles';
// import Alerts from './components/Alerts';
// import Support from './components/Support';
// import BillManagement from './components/BillManagement';
// import Organization from './components/Organization/Organization';
// import ManageHub from './components/Hubs/Managehubs';
// import Addhub from './components/Hubs/Addhub';
// import HubwiseDetails from './components/Hubs/ViewHubwise';
// import RevenueOverview from './components/Revenue/Overview';
// import HelpandSupportPage from './components/HelpAndSupport/Help';
// import PaymentIntegration from './components/PaymentIntegration/Payment';
// import ChargerDetails from './components/ChargerSessions/ChargerDetails';
// import ChargerSession from './components/ChargerSessions/Session';
// import Customers from './components/CustomerandVehicles/Customer';
// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<SignIn />} />
//         <Route path="/signin" element={<SignIn />} />
//          <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/profile" element={<Profile />} />
//         {/* <Route path="/dashboard/:userId" element={<Dashboard />} /> */}
//         <Route path="/sidebar" element={<Sidebar />} />
//         <Route path="/charger-session" element={<ChargerSessions />} />
//         <Route path="/revenue" element={<RevenueManagement />} />
//         <Route path="/add-charger" element={<AddChargerForm />} />
//         <Route path="/vd-management" element={<DriversVehicles />} />
//         <Route path="/alerts" element={<Alerts />} />
//         <Route path="/support" element={<Support />} />
//         <Route path="/bills" element={<BillManagement />} />
//         <Route path="/organization" element={<Organization />} />
//         <Route path="/manage-hubs" element={<ManageHub />} />
//         <Route path="/add-hub" element={<Addhub />} />
//         <Route path="/hub-details/:hubId" element={<HubwiseDetails />} /> {/* Hub ID wise */}
//         <Route path="/revenue/overview" element={<RevenueOverview />} />
//         <Route path="/help-support" element={<HelpandSupportPage />} />
//         <Route path="/payment-integration" element={<PaymentIntegration />} />
//         <Route path="/charger-details/:chargerId" element={<ChargerDetails />} />
//         <Route path="/sessions" element={<ChargerSession />} />
//           <Route path="/customers" element={<Customers />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

// src/App.jsx
// src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './components/Authentication/AuthContext'; // ✅ সঠিক পাথ
// import ProtectedRoute from './components/ProtectedRoute';

// // Authentication Pages
// import SignIn from './components/Authentication/SignIn';
// import ForgotPassword from './components/Authentication/ForgotPassword';

// // Main Pages
// import Dashboard from './components/Dashboard/Dashboard';
// import Profile from './components/Profile/Profile';
// import Sidebar from './components/Sidebar/Sidebar';
// import ChargerSessions from './components/ChargerSessions/ChargerList';
// import RevenueManagement from './components/RevenueManagement';
// import AddChargerForm from './components/ChargerSessions/AddChargerForm';
// import DriversVehicles from './components/DriversVehicles';
// import Alerts from './components/Alerts';
// import Support from './components/Support';
// import BillManagement from './components/BillManagement';
// import Organization from './components/Organization/Organization';
// import ManageHub from './components/Hubs/Managehubs';
// import Addhub from './components/Hubs/Addhub';
// import HubwiseDetails from './components/Hubs/ViewHubwise';
// import RevenueOverview from './components/Revenue/Overview';
// import HelpandSupportPage from './components/HelpAndSupport/Help';
// import PaymentIntegration from './components/PaymentIntegration/Payment';
// import ChargerDetails from './components/ChargerSessions/ChargerDetails';
// import ChargerSession from './components/ChargerSessions/Session';
// import Customers from './components/CustomerandVehicles/Customer';

// import './index.css';

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           {/* Public Routes - No Authentication Required */}
//           <Route path="/" element={<SignIn />} />
//           <Route path="/signin" element={<SignIn />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />

//           {/* Protected Routes - Authentication Required */}
//           <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//           <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
//           <Route path="/sidebar" element={<ProtectedRoute><Sidebar /></ProtectedRoute>} />
//           <Route path="/charger-session" element={<ProtectedRoute><ChargerSessions /></ProtectedRoute>} />
//           <Route path="/revenue" element={<ProtectedRoute><RevenueManagement /></ProtectedRoute>} />
//           <Route path="/add-charger" element={<ProtectedRoute><AddChargerForm /></ProtectedRoute>} />
//           <Route path="/vd-management" element={<ProtectedRoute><DriversVehicles /></ProtectedRoute>} />
//           <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
//           <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
//           <Route path="/bills" element={<ProtectedRoute><BillManagement /></ProtectedRoute>} />
//           <Route path="/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
//           <Route path="/manage-hubs" element={<ProtectedRoute><ManageHub /></ProtectedRoute>} />
//           <Route path="/add-hub" element={<ProtectedRoute><Addhub /></ProtectedRoute>} />
//           <Route path="/hub-details/:hubId" element={<ProtectedRoute><HubwiseDetails /></ProtectedRoute>} />
//           <Route path="/revenue/overview" element={<ProtectedRoute><RevenueOverview /></ProtectedRoute>} />
//           <Route path="/help-support" element={<ProtectedRoute><HelpandSupportPage /></ProtectedRoute>} />
//           <Route path="/payment-integration" element={<ProtectedRoute><PaymentIntegration /></ProtectedRoute>} />
//           <Route path="/charger-details/:chargerId" element={<ProtectedRoute><ChargerDetails /></ProtectedRoute>} />
//           <Route path="/sessions" element={<ProtectedRoute><ChargerSession /></ProtectedRoute>} />
//           <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;

// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/Authentication/AuthContext'; //
import ProtectedRoute from './components/ProtectedRoute';

// Authentication Pages
import SignIn from './components/Authentication/SignIn';
import ForgotPassword from './components/Authentication/ForgotPassword';

// Main Pages
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import Sidebar from './components/Sidebar/Sidebar';
import ChargerSessions from './components/ChargerSessions/ChargerList';
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
import PaymentIntegration from './components/PaymentIntegration/Payment';
import ChargerDetails from './components/ChargerSessions/ChargerDetails';
import ChargerSession from './components/ChargerSessions/Session';
import Customers from './components/CustomerandVehicles/Customer';
// ✅ Customer Groups Pages Import
import CustomerGroups from './components/CustomerandVehicles/CustomerGroup';
import CustomerGroupDetail from './components/CustomerandVehicles/CustomerGroupDetailsPage';
import AddCustomerGroup from './components/CustomerandVehicles/AddCustomerGroup';
import CustomerTariff from './components/Revenue/CustomerTarrifDetails';
import AddCustomerTariff from './components/Revenue/AddCustomerTarriff';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sidebar" element={<ProtectedRoute><Sidebar /></ProtectedRoute>} />
          <Route path="/charger-session" element={<ProtectedRoute><ChargerSessions /></ProtectedRoute>} />
          <Route path="/revenue" element={<ProtectedRoute><RevenueManagement /></ProtectedRoute>} />
          <Route path="/add-charger" element={<ProtectedRoute><AddChargerForm /></ProtectedRoute>} />
          <Route path="/vd-management" element={<ProtectedRoute><DriversVehicles /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><BillManagement /></ProtectedRoute>} />
          <Route path="/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
          <Route path="/manage-hubs" element={<ProtectedRoute><ManageHub /></ProtectedRoute>} />
          <Route path="/add-hub" element={<ProtectedRoute><Addhub /></ProtectedRoute>} />
          <Route path="/hub-details/:hubId" element={<ProtectedRoute><HubwiseDetails /></ProtectedRoute>} />
          <Route path="/revenue/overview" element={<ProtectedRoute><RevenueOverview /></ProtectedRoute>} />
          <Route path="/help-support" element={<ProtectedRoute><HelpandSupportPage /></ProtectedRoute>} />
          <Route path="/payment-integration" element={<ProtectedRoute><PaymentIntegration /></ProtectedRoute>} />
          <Route path="/charger-details/:chargerId" element={<ProtectedRoute><ChargerDetails /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><ChargerSession /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          
          {/* ✅ Customer Groups Routes */}
          <Route path="/customer-groups" element={<ProtectedRoute><CustomerGroups /></ProtectedRoute>} />
          <Route path="/customer-group-detail/:userGroupId" element={<ProtectedRoute><CustomerGroupDetail /></ProtectedRoute>} />
          <Route path="/add-customer-group" element={<ProtectedRoute><AddCustomerGroup /></ProtectedRoute>} />
            <Route path="/revenue/customer-tariffs" element={<ProtectedRoute><CustomerTariff /></ProtectedRoute>} />
              <Route path="/revenue/add-customer-tariff" element={<ProtectedRoute><AddCustomerTariff /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
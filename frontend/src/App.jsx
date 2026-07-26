import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Views
import Landing from './views/Landing';
import ComingSoon from './views/ComingSoon';
import OtpVerification from './views/OtpVerification';
import ScratchScreen from './views/ScratchScreen';
import Dashboard from './views/Dashboard';
import Winners from './views/Winners';
import Shop from './views/Shop';
import TermsConditions from './views/TermsConditions';
import AdminLogin from './views/AdminLogin';
import AdminDashboard from './views/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Portal */}
        <Route path="/" element={<Landing />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/verify" element={<OtpVerification />} />
        <Route path="/scratch" element={<ScratchScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/winners" element={<Winners />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />

        {/* Admin Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

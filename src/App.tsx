import Login from './pages/Login';
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Chibify from './pages/Chibify';
import ScrollToTop from './components/ScrollToTop';
import CompareDetail from './pages/CompareDetail';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chibify" element={<Chibify />} />
            <Route path="/compare/:type" element={<CompareDetail />} />
          </Routes>
          <ScrollToTop />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useSettings } from './contexts/SettingsContext';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SetupWizard from './pages/SetupWizard';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated, checkSession } = useAuth();
  const { settings, fetchSettings } = useSettings();

  useEffect(() => {
    // Check if user is already logged in
    checkSession();
    
    // Fetch application settings
    fetchSettings();
  }, [checkSession, fetchSettings]);

  // If setup is not complete, redirect to setup wizard
  if (settings.setup_complete === 'false') {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      </Route>

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
        
        {/* Admin routes */}
        <Route path="/admin/users" element={isAuthenticated ? <AdminUsers /> : <Navigate to="/login" replace />} />
        <Route path="/admin/settings" element={isAuthenticated ? <AdminSettings /> : <Navigate to="/login" replace />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
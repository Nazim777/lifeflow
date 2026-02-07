import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api/axios';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import ForgotPassword from './features/auth/components/ForgotPassword';
import ResetPassword from './features/auth/components/ResetPassword';
import Dashboard from './features/users/components/Dashboard'; // user/components/Dashboard.tsx? Wait, I didn't see Dashboard.tsx moved in the command list.
// Checking my previous move commands:
// Move-Item "e:\open-vibe-coding\blood-donation\frontend\src\pages\Dashboard\AdminDashboard.tsx" "e:\open-vibe-coding\blood-donation\frontend\src\features\admin\components\AdminDashboard.tsx"
// Move-Item "e:\open-vibe-coding\blood-donation\frontend\src\pages\Dashboard\HospitalRequests.tsx" "e:\open-vibe-coding\blood-donation\frontend\src\features\requests\components\HospitalRequests.tsx"
// Move-Item "e:\open-vibe-coding\blood-donation\frontend\src\pages\Dashboard\DonorSearch.tsx" "e:\open-vibe-coding\blood-donation\frontend\src\features\users\components\DonorSearch.tsx"
// I missed generic "Dashboard.tsx" and "RecipientDashboard.tsx", "DonorDashboard.tsx", "HospitalDashboard.tsx" if they existed in "pages/Dashboard".
// Let me double check usage of "Dashboard" in App.tsx. It imports "Dashboard from './pages/Dashboard'".
// I need to check where I put Dashboard.tsx. 
// I ran `Move-Item` for specific files. I might have missed the folder move or some files.
// Let's assume for now I will fix imports based on where I INTENDED to put them, but I should verify if I moved them.
// I will pause the replace to check if Dashboard.tsx was moved.
import Profile from './features/users/components/Profile';
import Requests from './features/requests/components/Requests';
import Donate from './features/requests/components/Donate';
import DonorSearch from './features/users/components/DonorSearch';
import Inventory from './features/inventory/components/Inventory';
import AdminDashboard from './features/admin/components/AdminDashboard';
import UserManagement from './features/admin/components/UserManagement';
import VerificationQueue from './features/admin/components/VerificationQueue';
import Layout from './components/Layout';
import { useAuthStore } from './features/auth/hooks/useAuthStore';
import HospitalRequests from './features/requests/components/HospitalRequests';

const RoleBasedRequests = () => {
  const { user } = useAuthStore();
  return user?.role === 'hospital' ? <HospitalRequests /> : <Requests />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

// Removed duplicate import

function App() {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    const refreshUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to refresh user", error);
        }
      }
    };
    refreshUser();
  }, [token, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RoleBasedRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <ProtectedRoute>
              <VerificationQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donate"
          element={
            <ProtectedRoute>
              <Donate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donors"
          element={
            <ProtectedRoute>
              <DonorSearch />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
// import CoordinatorDashboard from './pages/coordinator/Dashboard';
// import SupervisorDashboard from './pages/supervisor/Dashboard';
// import StudentDashboard from './pages/student/Dashboard';
// import ExaminerDashboard from './pages/examiner/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} />;
  }

  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* <Route 
          path="/coordinator" 
          element={
            <ProtectedRoute role="coordinator">
              <CoordinatorDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/supervisor" 
          element={
            <ProtectedRoute role="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/student" 
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/examiner" 
          element={
            <ProtectedRoute role="examiner">
              <ExaminerDashboard />
            </ProtectedRoute>
          } 
        /> */}

        <Route 
          path="/" 
          element={user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}``
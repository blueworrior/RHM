
import React from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from './context/ThemeContext';
import Loading from "./components/Loading";
import Layout from './components/Layout';
import Login from "./pages/Login";

//Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from './pages/admin/Users';
import AdminDepartments from './pages/admin/Departments';
import AdminCoordinators from './pages/admin/Coordinators';
import AdminSupervisors from './pages/admin/Supervisors';
import AdminExaminers from './pages/admin/Examiners';
import AdminStudents from './pages/admin/Students';

import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import ExaminerDashboard from "./pages/examiner/Dashboard";


// Protected Route Component
const ProtectedRoute = ({ children, role}) => {
  const {user, loading} = useAuth();

  if(loading){
    return <Loading />
  }

  if(!user){
    return <Navigate to = "/login" />
  }

  if(role && user.role !== role){
    return <Navigate to={`/${user.role}`} />
  }

  return <Layout>{children}</Layout>;

};

function AppRoutes() {
  const {user, loading} = useAuth();

  if (loading) {
    return <Loading />
  }

  return(
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user? <Login/> : <Navigate to={`/${user.role}`} /> }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={"admin"}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users'
          element={
            <ProtectedRoute role={'admin'}>
              <AdminUsers/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/departments" 
          element={
            <ProtectedRoute role="admin">
              <AdminDepartments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/coordinators" 
          element={
            <ProtectedRoute role="admin">
              <AdminCoordinators />
            </ProtectedRoute>
          } 
        />
        <Route 
        path="/admin/supervisors" 
        element={
          <ProtectedRoute role="admin">
            <AdminSupervisors />
          </ProtectedRoute>
        } 
        />
        <Route 
          path="/admin/examiners" 
          element={
            <ProtectedRoute role="admin">
              <AdminExaminers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students" 
          element={
            <ProtectedRoute role="admin">
              <AdminStudents />
            </ProtectedRoute>
          } 
        />


        {/* Coordinator Routes */}
        <Route
          path="/coordinator"
          element={
            <ProtectedRoute role={"coordinator"}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />


        {/* Supervisor Routes */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute role={"supervisor"}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />


        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role={"student"}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />


        {/* Examiner Routes */}
        <Route
          path="/examiner"
          element={
            <ProtectedRoute role={"examiner"}>
              <ExaminerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={user ? <Navigate to={`/${user.role}`}/> : <Navigate to={'/login'}/> }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default function App(){
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </ThemeProvider>
  )
}
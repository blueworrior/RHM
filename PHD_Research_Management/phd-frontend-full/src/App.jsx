
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

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorStudents from './pages/coordinator/Student';
import CoordinatorSupervisors from './pages/coordinator/Supervisor';
import CoordinatorPublications from './pages/coordinator/Publications';
import CoordinatorThesis from './pages/coordinator/Thesis';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorProposals from './pages/supervisor/Proposals';
import SupervisorProgressReports from './pages/supervisor/ProgressReports';
import SupervisorPublications from './pages/supervisor/Publications';
import SupervisorThesis from './pages/supervisor/Thesis';

// Examiner Pages
import ExaminerDashboard from './pages/examiner/Dashboard';
import ExaminerThesis from './pages/examiner/Thesis';

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentProposals from './pages/student/Proposals';
import StudentProgressReports from './pages/student/ProgressReports';
import StudentPublications from './pages/student/Publications';
import StudentThesis from './pages/student/Thesis';


// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} />
  }

  return <Layout>{children}</Layout>;

};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Login Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role={"admin"}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role={'admin'}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute role="admin"><AdminDepartments /></ProtectedRoute>} />
        <Route path="/admin/coordinators" element={<ProtectedRoute role="admin"><AdminCoordinators /></ProtectedRoute>} />
        <Route path="/admin/supervisors" element={<ProtectedRoute role="admin"><AdminSupervisors /></ProtectedRoute>} />
        <Route path="/admin/examiners" element={<ProtectedRoute role="admin"><AdminExaminers /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />


        {/* Coordinator Routes */}
        <Route path="/coordinator" element={<ProtectedRoute role={"coordinator"}> <CoordinatorDashboard /> </ProtectedRoute>} />
        <Route path='/coordinator/students' element={<ProtectedRoute role={"coordinator"}> <CoordinatorStudents /> </ProtectedRoute>} />
        <Route path='/coordinator/supervisors' element={<ProtectedRoute role={"coordinator"}> <CoordinatorSupervisors /> </ProtectedRoute>} />
        <Route path='/coordinator/publications' element={<ProtectedRoute role={"coordinator"}> <CoordinatorPublications /> </ProtectedRoute>} />
        <Route path='/coordinator/thesis' element={<ProtectedRoute role={"coordinator"}> <CoordinatorThesis /> </ProtectedRoute>} />


        {/* Supervisor Routes */}
        <Route path="/supervisor" element={<ProtectedRoute role="supervisor"><SupervisorDashboard /></ProtectedRoute>} />
        <Route path="/supervisor/proposals" element={<ProtectedRoute role="supervisor"><SupervisorProposals /></ProtectedRoute>} />
        <Route path="/supervisor/progress-reports" element={<ProtectedRoute role="supervisor"><SupervisorProgressReports /></ProtectedRoute>} />
        <Route path="/supervisor/publications" element={<ProtectedRoute role="supervisor"><SupervisorPublications /></ProtectedRoute>} />
        <Route path="/supervisor/thesis" element={<ProtectedRoute role="supervisor"><SupervisorThesis /></ProtectedRoute>} />


        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute role={"student"}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/proposals" element={<ProtectedRoute role={"student"}><StudentProposals /></ProtectedRoute>} />
        <Route path="/student/progress-reports" element={<ProtectedRoute role={"student"}><StudentProgressReports /></ProtectedRoute>} />
        <Route path="/student/publications" element={<ProtectedRoute role={"student"}><StudentPublications /></ProtectedRoute>} />
        <Route path="/student/thesis" element={<ProtectedRoute role={"student"}><StudentThesis /></ProtectedRoute>} />


        {/* Examiner Routes */}
        <Route path="/examiner" element={<ProtectedRoute role="examiner"><ExaminerDashboard /></ProtectedRoute>} />
        <Route path="/examiner/thesis" element={<ProtectedRoute role="examiner"><ExaminerThesis /></ProtectedRoute>} />

        <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Navigate to={'/login'} />} />

      </Routes>

    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
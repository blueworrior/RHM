import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';

import AdminDashboard from '../pages/dashboards/AdminDashboard'
// import CoordinatorDashboard from '../pages/dashboards/CoordinatorDashboard'
// import SupervisorDashboard from '../pages/dashboards/SupervisorDashboard'
// import StudentDashboard from '../pages/dashboards/StudentDashboard'
// import ExaminerDashboard from "../pages/dashboards/ExaminerDashboard";

import AdminDepartments from '../pages/admin/AdminDepartments';

import ProtectedRoute from '../components/ProtectedRoute';
import AdminUsers from '../pages/admin/AdminUsers';

export default function AppRoputes(){
    return(
        <BrowserRouter>
            <Routes>

                <Route path='/' element={<Login/>}/>

                <Route element={<ProtectedRoute  role='admin'/>}>

                    <Route path='/admin' element={<AdminDashboard/>}/>
                    <Route path='/admin/users' element={<AdminUsers/>}/>
                    <Route path='/admin/departments' element={<AdminDepartments/>}/>
                
                </Route>

                {/* <Route element={<ProtectedRoute  role='coordinator'/>}>
                    <Route path='/coordinator' element={<CoordinatorDashboard/>}/>
                </Route>

                <Route element={<ProtectedRoute  role='supervisor'/>}>
                    <Route path='/supervisor' element={<SupervisorDashboard/>}/>
                </Route>

                <Route element={<ProtectedRoute  role='student'/>}>
                    <Route path='/student' element={<StudentDashboard/>}/>
                </Route>
                <Route element={<ProtectedRoute  role='examiner'/>}>
                    <Route path='/examiner' element={<ExaminerDashboard/>}/>
                </Route> */}

            </Routes>
        </BrowserRouter>
    )
}
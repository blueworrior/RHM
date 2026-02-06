import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/auth/Login'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import Unauthorized from '../pages/auth/Unauthorized'

import Admin from '../pages/admin/Admin'
import Coordinator from '../pages/coordinator/Coordinator'
import Supervisor from '../pages/supervisor/Supervisor'
import Student from '../pages/student/Student'
import Examiner from '../pages/examiner/Examiner'


const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Admin />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/coordinator"
                    element={
                        <ProtectedRoute allowedRoles={['coordinator']}>
                            <Coordinator />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/supervisor"
                    element={
                        <ProtectedRoute allowedRoles={['supervisor']}>
                            <Supervisor />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <Student />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner"
                    element={
                        <ProtectedRoute allowedRoles={['examiner']}>
                            <Examiner />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/unauthorized' element={<Unauthorized/>}
                />
                
                <Route path="*" element={<Navigate to="/login" />} />


            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter

import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const ProtectedRoute = ({ children, allowedRoles }) => {

    const { user } = useAuth()

    // 1️⃣ Not logged in
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // 2️⃣ Logged in but wrong role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    // 3️⃣ Allowed
    return children
}

export default ProtectedRoute

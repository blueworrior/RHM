import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
    const { user, logout } = useAuth();

    return(
        <div style={{ padding: `40px` }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.first_name} {user?.last_name}!</p>
            <button onClick={logout} className="btn btn-primary" style={{ marginTop: '20px' }}>
                Logout
            </button>
        </div>
    );
};

export default AdminDashboard;
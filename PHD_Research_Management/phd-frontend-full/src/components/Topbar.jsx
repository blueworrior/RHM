import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Topbar = () => {
    const { user, logout } = useAuth();
    const {theme, toggleTheme} = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return(
        <div className="topbar">
            <h1>Research Management System</h1>

            <div className="topbar-actions">
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    title={`Switch to ${theme === 'light'? 'dark': 'light'} mode`}
                >
                    {theme === 'light' ? <Moon size={20} />: <Sun size={20} /> }
                </button>

                <button onClick={handleLogout} className="btn btn-outline">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Topbar;
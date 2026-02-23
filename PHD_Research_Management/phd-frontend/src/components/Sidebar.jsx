import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Building,
    UserCog,
    BookOpen,
    GraduationCap,
    UsersRound,
    Book,
    FileText
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import logo from '../assets/logo.png';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    // admin navigations
    const adminNav = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Users', path: '/admin/users', icon: UsersRound },
        { name: 'Departments', path: '/admin/departments', icon: Building },
        { name: 'Coordinators', path: '/admin/coordinators', icon: UserCog },
        { name: 'Supervisors', path: '/admin/supervisors', icon: Users },
        { name: 'Examiners', path: '/admin/examiners', icon: BookOpen },
        { name: 'Students', path: '/admin/students', icon: GraduationCap }
    ];

    // Coordintor navigations
    const coordinatorNav = [
        { name: 'Dashboard', path: '/coordinator', icon: LayoutDashboard, exact: true },
        { name: 'Students', path: '/coordinator/students', icon: GraduationCap },
        { name: 'Supervisors', path: '/coordinator/supervisors', icon: Users },
        { name: 'Publications', path: '/coordinator/publications', icon: BookOpen },
        { name: 'Thesis', path: '/coordinator/thesis', icon: Book }
    ];

    // Select navigation based on role
    const navigation = {
        admin: adminNav,
        coordinator: coordinatorNav,
        supervisor: [],
        student: [],
        examiner: []
    };

    const items = navigation[user?.role] || [];

    const isActive = (path, exact) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <img src={logo} alt="Logo" />
                <h2>PHD Portal</h2>
                <p>{user?.first_name} {user?.last_name}</p>
                <p style={{ fontSize: '11px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                    {user?.role}
                </p>
            </div>

            <nav className="sidebar-nav">
                {items.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={isActive(item.path, item.exact) ? 'active' : ''}
                    >
                        <item.icon size={20} />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
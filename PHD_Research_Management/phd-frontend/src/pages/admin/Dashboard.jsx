import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersRound, 
  Building, 
  UserCog, 
  Users, 
  BookOpen, 
  GraduationCap 
} from 'lucide-react';

const AdminDashboard = () => {
  const menuItems = [
    { 
      icon: UsersRound, 
      title: 'Users', 
      desc: 'Manage all system users',
      link: '/admin/users',
      color: '#B11226'
    },
    { 
      icon: Building, 
      title: 'Departments', 
      desc: 'Manage departments',
      link: '/admin/departments',
      color: '#7A0C1A'
    },
    { 
      icon: UserCog, 
      title: 'Coordinators', 
      desc: 'Manage coordinators',
      link: '/admin/coordinators',
      color: '#D91E36'
    },
    { 
      icon: Users, 
      title: 'Supervisors', 
      desc: 'Manage supervisors',
      link: '/admin/supervisors',
      color: '#B11226'
    },
    { 
      icon: BookOpen, 
      title: 'Examiners', 
      desc: 'Manage examiners',
      link: '/admin/examiners',
      color: '#7A0C1A'
    },
    { 
      icon: GraduationCap, 
      title: 'Students', 
      desc: 'View all students',
      link: '/admin/students',
      color: '#D91E36'
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
        Admin Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Manage your research management system
      </p>

      <div className="dashboard-cards">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="dashboard-card"
          >
            <div 
              className="dashboard-card-icon"
              style={{ background: item.color }}
            >
              <item.icon size={28} color="white" />
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Book } from 'lucide-react';

const CoordinatorDashboard = () => {
  const menuItems = [
    { 
      icon: GraduationCap, 
      title: 'Students', 
      desc: 'Manage department students',
      link: '/coordinator/students',
      color: '#B11226'
    },
    { 
      icon: Users, 
      title: 'Supervisors', 
      desc: 'View department supervisors',
      link: '/coordinator/supervisors',
      color: '#7A0C1A'
    },
    { 
      icon: BookOpen, 
      title: 'Publications', 
      desc: 'Student publications',
      link: '/coordinator/publications',
      color: '#D91E36'
    },
    { 
      icon: Book, 
      title: 'Thesis', 
      desc: 'Thesis management',
      link: '/coordinator/thesis',
      color: '#B11226'
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
        Coordinator Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Manage your department operations
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

export default CoordinatorDashboard;
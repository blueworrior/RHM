import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';

const StudentDashboard = () => {
  const menuItems = [
    { 
      icon: FileText, 
      title: 'Proposals', 
      desc: 'Submit and track research proposals',
      link: '/student/proposals',
      color: '#B11226'
    },
    { 
      icon: TrendingUp, 
      title: 'Progress Reports', 
      desc: 'Submit semester progress reports',
      link: '/student/progress-reports',
      color: '#7A0C1A'
    },
    { 
      icon: BookOpen, 
      title: 'Publications', 
      desc: 'Add your publications',
      link: '/student/publications',
      color: '#D91E36'
    },
    { 
      icon: GraduationCap, 
      title: 'Thesis', 
      desc: 'Submit and resubmit thesis',
      link: '/student/thesis',
      color: '#B11226'
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
        Student Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Manage your PhD research journey
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

export default StudentDashboard;
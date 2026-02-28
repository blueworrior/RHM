import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const ExaminerDashboard = () => {
  const menuItems = [
    { 
      icon: GraduationCap, 
      title: 'Assigned Thesis', 
      desc: 'Evaluate assigned thesis',
      link: '/examiner/thesis',
      color: '#B11226'
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
        Examiner Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Evaluate thesis assigned to you
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

export default ExaminerDashboard;
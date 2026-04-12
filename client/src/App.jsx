import { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import InstructorPage from './pages/InstructorPage';
import CustomerPage from './pages/CustomerPage';
import PackagePage from './pages/PackagePage';
import ClassPage from './pages/ClassPage';
import SalePage from './pages/SalePage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'instructors', label: 'Instructors' },
    { key: 'customers', label: 'Customers' },
    { key: 'packages', label: 'Packages' },
    { key: 'classes', label: 'Classes' },
    { key: 'sales', label: 'Sales' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'reports', label: 'Reports' }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f7f7',
        padding: '30px'
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}
      >
        <div className="page-header">
          <h1 style={{ marginBottom: '10px', color: '#4b2e83' }}>YogiTrack</h1>
          <p className="page-subtitle">Yoga Studio Management System</p>
        </div>

        <div className="nav-bar">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-button ${currentPage === item.key ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
        {currentPage === 'instructors' && <InstructorPage />}
        {currentPage === 'customers' && <CustomerPage />}
        {currentPage === 'packages' && <PackagePage />}
        {currentPage === 'classes' && <ClassPage />}
        {currentPage === 'sales' && <SalePage />}
        {currentPage === 'attendance' && <AttendancePage />}
        {currentPage === 'reports' && <ReportsPage />}
      </div>
    </div>
  );
}

export default App;
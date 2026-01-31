import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Set initial state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = useCallback((open) => {
    setSidebarOpen(open);
  }, []);

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-is-open' : 'sidebar-is-closed'}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={handleToggle} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

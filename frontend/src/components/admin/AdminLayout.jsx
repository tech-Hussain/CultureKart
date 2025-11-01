import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

/**
 * AdminLayout Component
 * Main wrapper for all admin dashboard pages
 * Provides consistent sidebar and header across admin screens
 * No footer, no buyer/artisan UI elements
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Admin Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

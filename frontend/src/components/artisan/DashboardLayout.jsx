/**
 * Artisan Dashboard Layout
 * Main wrapper with sidebar navigation (works with main site navbar)
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Sidebar - Below main navbar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area - Next to sidebar */}
      <div
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Page Content */}
        <main className="p-6">
          {/* Sidebar Toggle Button for mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mb-4 p-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors"
          >
            ☰ Menu
          </button>
          <Outlet />
        </main>
      </div>

      {/* Cultural Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C27B0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </div>
  );
}

export default DashboardLayout;

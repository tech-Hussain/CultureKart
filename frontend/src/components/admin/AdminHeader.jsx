import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOutUser } from '../../services/authService';
import { 
  Bars3Icon, 
  ArrowRightOnRectangleIcon,
  BellIcon 
} from '@heroicons/react/24/outline';

/**
 * AdminHeader Component
 * Top header bar for admin dashboard
 * Shows only admin avatar, notifications, and logout button
 * Clean and professional design
 */
const AdminHeader = ({ toggleSidebar }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      updateUser(null);
      navigate('/login'); // Return to public login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Left Section - Toggle Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          Admin Dashboard
        </h1>
      </div>

      {/* Right Section - Admin Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <BellIcon className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          
          {/* Admin Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md"
          aria-label="Logout"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;

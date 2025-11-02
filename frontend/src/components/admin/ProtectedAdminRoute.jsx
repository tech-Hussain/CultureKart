/**
 * Protected Admin Route Component
 * Checks if user is authenticated as admin before allowing access
 * Redirects to /admin/login if not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated and is admin
  const isAdmin = user && user.role === 'admin';

  // If not admin (either not logged in or not admin role), redirect to admin login
  if (!isAdmin) {
    // Clear any invalid tokens
    if (!user) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return <Navigate to="/admin/login" state={{ from: location, error: !user ? undefined : 'Admin access required' }} replace />;
  }

  // If authenticated and admin, render the protected content
  return children;
}

export default ProtectedAdminRoute;

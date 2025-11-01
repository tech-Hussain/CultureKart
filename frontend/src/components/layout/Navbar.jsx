/**
 * Navbar Component
 */
import { Link } from 'react-router-dom';
import { signOutUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { user, updateUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
      updateUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b-2 border-camel-200 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-maroon-600 hover:text-maroon-700">
            🏺 CultureKart
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-camel-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-camel-600 font-medium transition-colors">
              Shop
            </Link>
            {user && user.role === 'artisan' && (
              <Link to="/seller" className="text-gray-700 hover:text-camel-600 font-medium transition-colors">
                My Shop
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-camel-600 font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to={
                    user.role === 'admin' 
                      ? '/admin/dashboard' 
                      : user.role === 'artisan' 
                      ? '/artisan/dashboard' 
                      : '/dashboard'
                  } 
                  className="text-gray-700 hover:text-camel-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-camel-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

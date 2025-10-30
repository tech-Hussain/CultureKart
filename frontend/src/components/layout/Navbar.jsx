/**
 * Navbar Component
 */
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth';
  };

  return (
    <nav className="bg-white shadow-md border-b-2 border-camel-200">
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
                <Link to="/dashboard" className="text-gray-700 hover:text-camel-600 font-medium transition-colors">
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
              <Link to="/auth" className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

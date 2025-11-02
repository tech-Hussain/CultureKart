/**
 * Navbar Component
 */
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import UserAvatar from '../UserAvatar';

function Navbar() {
  const { user } = useAuth();
  const { cartCount } = useCart();

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
                {/* Show Dashboard link only for admin/artisan */}
                {(user.role === 'admin' || user.role === 'artisan') && (
                  <Link 
                    to={
                      user.role === 'admin' 
                        ? '/admin/dashboard' 
                        : '/artisan/dashboard'
                    } 
                    className="text-gray-700 hover:text-camel-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                
                {/* Cart Icon with Badge */}
                <Link 
                  to="/cart" 
                  className="relative text-gray-700 hover:text-camel-600 transition-colors"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                
                {/* User Avatar with Dropdown */}
                <UserAvatar />
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

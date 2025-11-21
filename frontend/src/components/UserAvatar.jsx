/**
 * User Avatar Component with Dropdown Menu
 * Shows user avatar with dropdown for profile, orders, addresses, settings, logout
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../services/authService';
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  LogOut,
  ChevronDown,
  MessageCircle
} from 'lucide-react';

const UserAvatar = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get avatar source
  const getAvatarSrc = () => {
    // If image failed to load, use initials
    if (imageError) {
      const initials = getInitials();
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=4F46E5&textColor=ffffff`;
    }
    
    // Firebase photoURL (Google login)
    if (user?.profile?.avatar) {
      return user.profile.avatar;
    }
    
    // DiceBear avatar with user initials
    const initials = getInitials();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=4F46E5&textColor=ffffff`;
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOutUser();
      updateUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Menu items
  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      onClick: () => {
        navigate('/profile');
        setIsDropdownOpen(false);
      }
    },
    {
      icon: Package,
      label: 'My Orders',
      onClick: () => {
        navigate('/orders');
        setIsDropdownOpen(false);
      }
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      onClick: () => {
        navigate('/messages');
        setIsDropdownOpen(false);
      }
    },
    {
      icon: MapPin,
      label: 'Saved Addresses',
      onClick: () => {
        navigate('/addresses');
        setIsDropdownOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Account Settings',
      onClick: () => {
        navigate('/settings');
        setIsDropdownOpen(false);
      }
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: handleLogout,
      divider: true,
      danger: true
    }
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 focus:outline-none group"
        aria-label="User menu"
      >
        {/* Avatar Image */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-indigo-500 transition-colors duration-200">
          <img
            src={getAvatarSrc()}
            alt={user.name || 'User avatar'}
            className="w-full h-full object-cover"
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </div>
        
        {/* Dropdown indicator */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.divider && <div className="my-1 border-t border-gray-100" />}
                <button
                  onClick={item.onClick}
                  className={`w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-150 ${
                    item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;

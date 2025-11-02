/**
 * User Profile Page
 * Display and edit user profile information
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Globe, Edit2, Save, X } from 'lucide-react';
import api from '../api/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageError, setImageError] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    country: '',
    city: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        gender: user.profile?.gender || '',
        country: user.profile?.country || '',
        city: user.profile?.city || '',
      });
    }
  }, [user]);

  // Get user initials for avatar fallback
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

  // Get avatar source with fallback
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare profile data for backend API
      const profileData = {
        name: formData.name,
        profile: {
          phone: formData.phone,
          gender: formData.gender,
          country: formData.country,
          city: formData.city,
        },
      };

      console.log('Saving profile via API...', profileData);
      
      // Call backend API instead of Firestore
      const response = await api.patch('/auth/profile', profileData);
      
      console.log('API save successful!', response.data);

      // Update local user state with response data
      updateUser({
        ...user,
        name: response.data.user.name,
        profile: {
          ...user.profile,
          ...response.data.user.profile,
        },
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.message, error.response?.data);
      setMessage({ 
        type: 'error', 
        text: `Failed to update profile: ${error.response?.data?.message || error.message || 'Please try again.'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.profile?.phone || '',
      gender: user.profile?.gender || '',
      country: user.profile?.country || '',
      city: user.profile?.city || '',
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100">
                <img
                  src={getAvatarSrc()}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  crossOrigin="anonymous"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {user.role || 'Buyer'}
                </span>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
                required
              />
            </div>

            {/* Email (Non-editable) */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="input-field bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="+92 300 1234567"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>Gender</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4" />
                <span>Country</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="Pakistan"
              />
            </div>

            {/* City */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span>City</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input-field disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="Karachi"
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

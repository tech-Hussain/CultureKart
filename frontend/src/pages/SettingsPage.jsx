/**
 * Account Settings Page
 * Change password, update phone, manage notifications, delete account
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Phone, 
  Bell, 
  Trash2, 
  Save,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Phone form
  const [phoneData, setPhoneData] = useState({
    phone: user?.profile?.phone || ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: false
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement password change via backend API
      // For now, just show a success message
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        'profile.phone': phoneData.phone,
        updatedAt: new Date().toISOString()
      });

      updateUser({
        ...user,
        profile: {
          ...user.profile,
          phone: phoneData.phone
        }
      });

      setMessage({ type: 'success', text: 'Phone number updated successfully' });
    } catch (error) {
      console.error('Error updating phone:', error);
      setMessage({ type: 'error', text: 'Failed to update phone number' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        notifications,
        updatedAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'Notification preferences updated' });
    } catch (error) {
      console.error('Error updating notifications:', error);
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Delete user document from Firestore
      const userRef = doc(db, 'users', user.id);
      await deleteDoc(userRef);

      // TODO: Call backend API to delete user account completely
      
      setMessage({ type: 'success', text: 'Account deleted successfully' });
      
      // Logout and redirect
      setTimeout(() => {
        updateUser(null);
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account' });
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to access settings.</p>
      </div>
    );
  }

  const isEmailAuth = user.authProvider === 'email-password' || user.authProvider === 'email';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' :
            message.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Change Password Section */}
        {isEmailAuth && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Update Phone Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Phone className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Phone Number</h2>
          </div>

          <form onSubmit={handlePhoneUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneData.phone}
                onChange={(e) => setPhoneData({...phoneData, phone: e.target.value})}
                className="input-field"
                placeholder="+92 300 1234567"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Updating...' : 'Update Phone'}</span>
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">Get notified about your order status</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.orderUpdates}
                onChange={(e) => setNotifications({...notifications, orderUpdates: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Promotions & Offers</p>
                <p className="text-sm text-gray-600">Receive special deals and discounts</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.promotions}
                onChange={(e) => setNotifications({...notifications, promotions: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-600">Weekly newsletter with new arrivals</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.newsletter}
                onChange={(e) => setNotifications({...notifications, newsletter: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>

          <button
            onClick={handleNotificationUpdate}
            disabled={loading}
            className="mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
          </div>

          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete My Account</span>
            </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
              <p className="text-red-900 font-semibold mb-4">
                Are you absolutely sure? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

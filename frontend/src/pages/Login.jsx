/**
 * Login Page
 * Authentication with Google OAuth or Email/Password
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail } from '../services/authService';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

function Login() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Handle Google Signup
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');

      // Sign in with Google
      const { token } = await signInWithGoogle();

      // Verify with backend
      const response = await loginUser(token);

      if (response.success) {
        // Check if user already has a role
        if (response.user.role && response.user.role !== 'user') {
          // User has role, redirect immediately
          updateUser(response.user);
          localStorage.setItem('firebaseToken', token);
          
          // Redirect based on role
          if (response.user.role === 'artisan') {
            navigate('/artisan/dashboard');
          } else if (response.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } else {
          // User needs to select role
          setPendingGoogleUser({ user: response.user, token });
          setShowRoleModal(true);
        }
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  // Handle role selection for Google signup
  const handleRoleSelection = async (role) => {
    try {
      setLoading(true);
      setError('');

      // Update user role via API
      const response = await api.patch('/auth/profile', { role });

      if (response.data.success) {
        const updatedUser = response.data.user;
        updateUser(updatedUser);
        localStorage.setItem('firebaseToken', pendingGoogleUser.token);

        // Redirect based on selected role
        if (role === 'artisan') {
          navigate('/artisan/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Role update error:', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
      setShowRoleModal(false);
    }
  };

  // Handle email/password login
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      // Sign in with email/password via backend
      const response = await signInWithEmail(formData.email, formData.password);

      if (response) {
        // User authenticated successfully
        updateUser(response);

        // Redirect based on role
        if (response.role === 'artisan') {
          navigate('/artisan/dashboard');
        } else if (response.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Role Selection Modal
  const RoleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-2xl border-4 border-camel-300">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold text-maroon-800 mb-2">Choose Your Role</h3>
          <p className="text-gray-600">Select how you'd like to use CultureKart</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection('buyer')}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🛍️</span>
            <span>I am a Buyer</span>
          </button>

          <button
            onClick={() => handleRoleSelection('artisan')}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-camel-500 to-maroon-500 text-white rounded-lg font-semibold hover:from-camel-600 hover:to-maroon-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🎨</span>
            <span>I am an Artisan</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-100 via-camel-50 to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-5xl mb-4">🏺</div>
            <h1 className="text-3xl font-bold text-maroon-800">CultureKart</h1>
          </Link>
          <p className="text-gray-600 mt-2">Welcome back!</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 border-4 border-camel-200">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-maroon-600 font-semibold hover:text-maroon-700">
              Sign up
            </Link>
          </div>
        </div>

        {/* Decorative Border */}
        <div className="mt-4 h-2 bg-gradient-to-r from-camel-400 via-maroon-400 to-teal-400 rounded-full"></div>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && <RoleModal />}
    </div>
  );
}

export default Login;

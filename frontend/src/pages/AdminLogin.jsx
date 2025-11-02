/**
 * Admin Login Page
 * Dedicated login page for admin panel
 * Email/Password authentication with JWT tokens
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithEmail } from '../services/authService';

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockEndTime, setLockEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const redirectedRef = useRef(false);
  const timerRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check if already logged in as admin (only once)
  useEffect(() => {
    if (!authLoading && user?.role === 'admin' && !redirectedRef.current) {
      redirectedRef.current = true;
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show error from redirect if any (only once on mount)
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state?.error]);

  // Check if IP is locked on page load
  useEffect(() => {
    const checkIPLockStatus = async () => {
      try {
        // Call the dedicated endpoint to check IP lock status
        const response = await fetch('http://localhost:5000/api/v1/auth/check-ip-lock', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        console.log('🔍 IP lock check response:', data);
        
        // If IP is locked, set timer state
        if (data.success && data.locked) {
          const lockTime = new Date(data.lockUntil);
          const remaining = data.remainingTime;
          
          console.log('🔒 IP is locked on page load:', {
            lockUntil: lockTime.toISOString(),
            remainingTime: remaining,
          });
          
          setIsLocked(true);
          setLockEndTime(lockTime);
          setRemainingTime(remaining);
        } else {
          console.log('✅ IP is not locked');
        }
      } catch (err) {
        console.error('Error checking IP lock status:', err);
        // Ignore errors, just means we couldn't check
      }
    };

    checkIPLockStatus();
  }, []); // Run only once on mount

  // Countdown timer effect
  useEffect(() => {
    console.log('Timer effect - isLocked:', isLocked, 'lockEndTime:', lockEndTime, 'remainingTime:', remainingTime); // Debug
    
    if (isLocked && lockEndTime) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Update timer every second
      timerRef.current = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(lockEndTime).getTime();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

        console.log('Timer update - timeLeft:', timeLeft); // Debug
        setRemainingTime(timeLeft);

        // Unlock when timer reaches 0
        if (timeLeft <= 0) {
          console.log('Timer expired - unlocking'); // Debug
          setIsLocked(false);
          setLockEndTime(null);
          setError('');
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isLocked, lockEndTime]);

  // Debug effect to track isLocked state changes
  useEffect(() => {
    console.log('🔍 isLocked state changed to:', isLocked);
    console.log('🔍 Current lockEndTime:', lockEndTime);
    console.log('🔍 Current remainingTime:', remainingTime);
  }, [isLocked, lockEndTime, remainingTime]);

  // Handle admin login
  const handleLogin = async (e) => {
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

      // Sign in with email/password
      const response = await signInWithEmail(formData.email, formData.password);

      if (response) {
        // Verify user has admin role
        if (response.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          // Clear token for non-admin users
          localStorage.removeItem('authToken');
          setLoading(false);
          return;
        }

        // Admin verified, update user and redirect
        updateUser(response);
        
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Admin login error:', err);
      console.log('Error object keys:', Object.keys(err)); // Debug log
      
      // authService.signInWithEmail throws error.response?.data || error
      // So err might be the data object directly, or an Axios error
      const errorData = err.response?.data || err; // The actual data object
      const errorMessage = errorData?.message || err.message || 'Invalid email or password. Please try again.';
      
      console.log('Parsed - errorData:', errorData); // Debug log
      console.log('Parsed - locked flag:', errorData?.locked); // Debug log
      console.log('Parsed - lockUntil:', errorData?.lockUntil); // Debug log
      console.log('Parsed - remainingTime:', errorData?.remainingTime); // Debug log
      
      // Display lock information if account is locked
      // Check locked flag (from 429 response)
      if (errorData?.locked) {
        // Calculate lockEndTime from remainingTime if lockUntil is not provided
        const lockTime = errorData?.lockUntil 
          ? new Date(errorData.lockUntil)
          : new Date(Date.now() + (errorData?.remainingTime || 300) * 1000);
        const remaining = errorData?.remainingTime || 300;
        
        console.log('🔒 LOCK DETECTED - Setting lock state:', { 
          lockTime: lockTime.toISOString(), 
          remaining, 
          locked: errorData?.locked 
        }); // Debug log
        
        setIsLocked(true);
        setLockEndTime(lockTime);
        setRemainingTime(remaining);
        setError(''); // Clear error message since timer will show
        
        console.log('🔒 Lock state set - isLocked should now be true'); // Debug log
      } else if (errorData?.remainingAttempts !== undefined) {
        // Clear any previous lock state
        setIsLocked(false);
        setLockEndTime(null);
        setError(`${errorMessage}`);
      } else {
        // Clear any previous lock state
        setIsLocked(false);
        setLockEndTime(null);
        setError(errorMessage);
      }
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

  // Debug render
  console.log('Render - isLocked:', isLocked, 'remainingTime:', remainingTime, 'lockEndTime:', lockEndTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Admin Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">CultureKart Platform Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Admin Login
          </h2>

          {/* Error Display - Only show if NOT locked */}
          {error && !isLocked && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Lock Timer Display */}
          {isLocked && (
            <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Account Temporarily Locked</h3>
                <p className="text-sm text-yellow-800 text-center mb-4">
                  Too many failed login attempts. Please wait for the timer to expire.
                </p>
                <div className="bg-white px-6 py-4 rounded-lg shadow-inner border-2 border-yellow-300">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6 text-yellow-600 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-center">
                      <p className="text-3xl font-mono font-bold text-yellow-900">
                        {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">Minutes : Seconds</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mt-4">
                  You can try logging in again after the timer expires
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter admin email"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLocked}
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className={`w-full py-3 font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                isLocked
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  : loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
              }`}
              title={isLocked ? 'Account is locked. Please wait for the timer to expire.' : ''}
            >
              {isLocked ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Locked - Wait {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}</span>
                </>
              ) : loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-xs font-semibold text-slate-700">Secure Admin Access</p>
                <p className="text-xs text-slate-600 mt-1">
                  This is a restricted area. All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Site Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to CultureKart
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

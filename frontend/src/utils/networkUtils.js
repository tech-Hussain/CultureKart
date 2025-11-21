/**
 * Network Utilities for Frontend
 * Automatically detects and uses the correct API URL based on how the app is accessed
 */

/**
 * Get the appropriate API URL based on current hostname
 * @returns {string} The API URL to use
 */
export const getApiUrl = () => {
  // If running in production, use environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  }

  // In development, detect based on how the app is accessed
  const hostname = window.location.hostname;
  const port = 5000; // Backend port

  // If accessed via localhost or 127.0.0.1, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}/api/v1`;
  }

  // If accessed via network IP, use the same IP for API
  // This ensures mobile devices use the network IP
  return `http://${hostname}:${port}/api/v1`;
};

/**
 * Get the current access mode (local or network)
 * @returns {string} 'local' or 'network'
 */
export const getAccessMode = () => {
  const hostname = window.location.hostname;
  return (hostname === 'localhost' || hostname === '127.0.0.1') ? 'local' : 'network';
};

/**
 * Get display-friendly access information
 * @returns {Object} Information about current access mode
 */
export const getAccessInfo = () => {
  const hostname = window.location.hostname;
  const mode = getAccessMode();
  const apiUrl = getApiUrl();

  return {
    mode,
    hostname,
    apiUrl,
    isMobile: mode === 'network',
    displayName: mode === 'local' ? 'Local Development' : 'Network Access',
  };
};

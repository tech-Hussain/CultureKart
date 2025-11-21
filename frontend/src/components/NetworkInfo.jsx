/**
 * Network Info Component
 * Displays network access information in development mode
 */
import { useState, useEffect } from 'react';
import { getAccessInfo } from '../utils/networkUtils';

const NetworkInfo = () => {
  const [info, setInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (import.meta.env.DEV) {
      const accessInfo = getAccessInfo();
      setInfo(accessInfo);
    }
  }, []);

  if (!info || import.meta.env.PROD) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Network Info"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Info Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800">Network Info</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${info.isMobile ? 'bg-green-500' : 'bg-blue-500'}`}></span>
              <span className="font-medium text-gray-700">{info.displayName}</span>
            </div>

            <div className="bg-gray-50 rounded p-2 space-y-1">
              <div>
                <span className="text-gray-600">Hostname:</span>
                <span className="ml-2 font-mono text-gray-800">{info.hostname}</span>
              </div>
              <div>
                <span className="text-gray-600">API URL:</span>
                <span className="ml-2 font-mono text-gray-800 break-all">{info.apiUrl}</span>
              </div>
            </div>

            {info.isMobile && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-green-700 font-medium">📱 Network Access Mode</p>
                <p className="text-green-600 text-xs mt-1">
                  Accessible from mobile devices on the same network
                </p>
              </div>
            )}

            {!info.isMobile && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-blue-700 font-medium">💻 Local Development Mode</p>
                <p className="text-blue-600 text-xs mt-1">
                  Access via network IP for mobile testing
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkInfo;

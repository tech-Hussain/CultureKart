/**
 * Network Utilities
 * Detects local network IP addresses automatically
 */

const os = require('os');

/**
 * Get the local network IP address
 * @returns {string} The local network IP address
 */
const getNetworkIP = () => {
  const interfaces = os.networkInterfaces();
  
  // Priority order: Wi-Fi, Ethernet, then any other
  const priorityOrder = ['Wi-Fi', 'Ethernet', 'en0', 'eth0', 'wlan0'];
  
  // First, try priority interfaces
  for (const name of priorityOrder) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const net of networkInterface) {
        // Skip internal (loopback) and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  
  // If no priority interface found, get first available IPv4 address
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    for (const net of networkInterface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  // Fallback to localhost
  return '127.0.0.1';
};

/**
 * Get all available network addresses
 * @returns {Object} Object containing localhost and network IPs
 */
const getAllNetworkAddresses = (port) => {
  const networkIP = getNetworkIP();
  
  return {
    local: `http://localhost:${port}`,
    network: `http://${networkIP}:${port}`,
    ip: networkIP,
  };
};

module.exports = {
  getNetworkIP,
  getAllNetworkAddresses,
};

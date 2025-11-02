/**
 * Network Information Utilities
 * Get detailed network information including MAC addresses
 */

const os = require('os');

/**
 * Get all network interfaces with MAC addresses
 */
const getNetworkInterfaces = () => {
  const interfaces = os.networkInterfaces();
  const result = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    addresses.forEach(addr => {
      result.push({
        interface: name,
        family: addr.family,
        address: addr.address,
        mac: addr.mac,
        internal: addr.internal,
      });
    });
  }

  return result;
};

/**
 * Get MAC address for a specific IP
 */
const getMacAddressForIP = (ip) => {
  const interfaces = os.networkInterfaces();
  
  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const addr of addresses) {
      if (addr.address === ip) {
        return addr.mac;
      }
    }
  }
  
  return 'Unknown';
};

/**
 * Get primary network interface MAC address
 */
const getPrimaryMacAddress = () => {
  const interfaces = os.networkInterfaces();
  
  // Try to find the first non-internal, IPv4 interface
  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const addr of addresses) {
      if (!addr.internal && addr.family === 'IPv4') {
        return addr.mac;
      }
    }
  }
  
  // Fallback: return any MAC address
  for (const [name, addresses] of Object.entries(interfaces)) {
    if (addresses[0]?.mac) {
      return addresses[0].mac;
    }
  }
  
  return 'Unknown';
};

/**
 * Get full IP address (convert IPv6 localhost to full format)
 */
const getFullIPAddress = (ip) => {
  if (ip === '::1') {
    return '0000:0000:0000:0000:0000:0000:0000:0001 (IPv6 localhost)';
  }
  if (ip === '127.0.0.1') {
    return '127.0.0.1 (IPv4 localhost)';
  }
  return ip;
};

/**
 * Get detailed network info for logging
 */
const getDetailedNetworkInfo = (req) => {
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   'Unknown';
  
  const fullIP = getFullIPAddress(clientIP);
  const serverMac = getPrimaryMacAddress();
  
  // For localhost connections, get the server's MAC
  let macAddress = serverMac;
  
  // If it's a local connection, note that
  const isLocalhost = clientIP === '::1' || clientIP === '127.0.0.1' || clientIP === 'localhost';
  
  return {
    clientIP: clientIP,
    fullIP: fullIP,
    macAddress: macAddress,
    isLocalhost: isLocalhost,
    serverHostname: os.hostname(),
    serverPlatform: os.platform(),
    allInterfaces: getNetworkInterfaces(),
  };
};

module.exports = {
  getNetworkInterfaces,
  getMacAddressForIP,
  getPrimaryMacAddress,
  getFullIPAddress,
  getDetailedNetworkInfo,
};

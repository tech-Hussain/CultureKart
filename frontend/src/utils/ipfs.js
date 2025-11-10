// IPFS Gateway Configuration with reliable fallbacks
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs',               // Public IPFS gateway (most reliable)
  'https://gateway.ipfs.io/ipfs',       // Alternative public gateway
  'https://dweb.link/ipfs',             // Distributed web link
  'https://cf-ipfs.com/ipfs',           // Cloudflare alternative
  'https://gateway.pinata.cloud/ipfs'   // Pinata (moved to last due to rate limiting)
];

// Cache for converted URLs to avoid repeated conversions
const urlCache = new Map();

// Rate limiting - track last request time per gateway
const gatewayLastUsed = new Map();
const RATE_LIMIT_DELAY = 1000; // 1 second between requests to same gateway

/**
 * Gets the next available gateway with rate limiting
 * @param {number} preferredIndex - Preferred gateway index
 * @returns {number} - Available gateway index
 */
const getAvailableGateway = (preferredIndex = 0) => {
  const now = Date.now();
  
  // Try preferred gateway first if it's not rate limited
  if (preferredIndex < IPFS_GATEWAYS.length) {
    const lastUsed = gatewayLastUsed.get(preferredIndex) || 0;
    if (now - lastUsed > RATE_LIMIT_DELAY) {
      gatewayLastUsed.set(preferredIndex, now);
      return preferredIndex;
    }
  }
  
  // Find first available gateway
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    const lastUsed = gatewayLastUsed.get(i) || 0;
    if (now - lastUsed > RATE_LIMIT_DELAY) {
      gatewayLastUsed.set(i, now);
      return i;
    }
  }
  
  // If all are rate limited, use the preferred one anyway
  return Math.min(preferredIndex, IPFS_GATEWAYS.length - 1);
};

/**
 * Converts IPFS URL to HTTP URL using the configured gateway with fallbacks
 * @param {string} ipfsUrl - The IPFS URL (e.g., 'ipfs://Qm...' or 'Qm...')
 * @param {number} gatewayIndex - Which gateway to use (0-4)
 * @returns {string} - HTTP URL for the IPFS resource
 */
export const convertIpfsToHttp = (ipfsUrl, gatewayIndex = 0) => {
  if (!ipfsUrl) return '';
  
  // If it's already an HTTP URL, return as is
  if (ipfsUrl.startsWith('http')) {
    return ipfsUrl;
  }
  
  // Check cache first
  const cacheKey = `${ipfsUrl}-${gatewayIndex}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey);
  }
  
  // Remove 'ipfs://' prefix if present
  const hash = ipfsUrl.replace('ipfs://', '');
  
  // Get available gateway with rate limiting
  const actualGatewayIndex = getAvailableGateway(gatewayIndex);
  const gateway = IPFS_GATEWAYS[actualGatewayIndex];
  const httpUrl = `${gateway}/${hash}`;
  
  // Cache the result
  urlCache.set(cacheKey, httpUrl);
  
  return httpUrl;
};

/**
 * Gets the display URL for an image with automatic fallback handling
 * @param {string} imageUrl - The image URL (could be IPFS, HTTP, or any other format)
 * @returns {string} - Displayable HTTP URL
 */
export const getImageDisplayUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // Handle IPFS URLs
  if (imageUrl.startsWith('ipfs://') || /^Qm[1-9A-HJ-NP-Za-km-z]{44}/.test(imageUrl)) {
    return convertIpfsToHttp(imageUrl, 0); // Start with most reliable gateway
  }
  
  // Return other URLs as is
  return imageUrl;
};

/**
 * Creates an image element with automatic IPFS gateway fallback
 * @param {string} imageUrl - The image URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS classes for the image
 * @param {function} onLoad - Callback for successful load
 * @param {function} onFinalError - Callback when all gateways fail
 * @returns {HTMLImageElement} - Image element with fallback handling
 */
export const createImageWithFallback = (imageUrl, alt = '', className = '', onLoad = null, onFinalError = null) => {
  const img = document.createElement('img');
  img.alt = alt;
  img.className = className;
  
  let currentGatewayIndex = 0;
  
  const tryNextGateway = () => {
    if (currentGatewayIndex >= IPFS_GATEWAYS.length) {
      // All gateways failed
      if (onFinalError) {
        onFinalError(img);
      }
      return;
    }
    
    const url = imageUrl.startsWith('ipfs://') || /^Qm[1-9A-HJ-NP-Za-km-z]{44}/.test(imageUrl)
      ? convertIpfsToHttp(imageUrl, currentGatewayIndex)
      : imageUrl;
    
    img.onload = () => {
      if (onLoad) onLoad(img);
    };
    
    img.onerror = () => {
      currentGatewayIndex++;
      // Add delay before trying next gateway to avoid overwhelming servers
      setTimeout(() => tryNextGateway(), 500);
    };
    
    img.src = url;
  };
  
  tryNextGateway();
  return img;
};

/**
 * Checks if a URL is a valid image URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's likely an image URL
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i;
  const httpUrl = getImageDisplayUrl(url);
  
  return httpUrl.startsWith('http') || imageExtensions.test(httpUrl);
};
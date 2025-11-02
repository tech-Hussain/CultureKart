/**
 * Device Fingerprinting Utility
 * Generates a unique device identifier based on browser properties
 * This is used for rate limiting instead of IP addresses
 */

/**
 * Generate a unique device fingerprint
 * Combines multiple browser properties to create a unique identifier
 */
export const generateDeviceFingerprint = async () => {
  const components = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Language
  components.push(navigator.language);

  // 3. Color Depth
  components.push(screen.colorDepth);

  // 4. Screen Resolution
  components.push(`${screen.width}x${screen.height}`);

  // 5. Timezone Offset
  components.push(new Date().getTimezoneOffset());

  // 6. Session Storage Support
  components.push(!!window.sessionStorage);

  // 7. Local Storage Support
  components.push(!!window.localStorage);

  // 8. Indexed DB Support
  components.push(!!window.indexedDB);

  // 9. Platform
  components.push(navigator.platform);

  // 10. CPU Cores
  components.push(navigator.hardwareConcurrency || 'unknown');

  // 11. Device Memory (if available)
  components.push(navigator.deviceMemory || 'unknown');

  // 12. Touch Support
  components.push(navigator.maxTouchPoints || 0);

  // 13. Canvas Fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('CultureKart', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device ID', 4, 17);
      const canvasData = canvas.toDataURL();
      components.push(canvasData.substring(0, 100)); // Use first 100 chars
    }
  } catch {
    components.push('canvas_error');
  }

  // 14. WebGL Fingerprint
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    components.push('webgl_error');
  }

  // 15. Audio Fingerprint
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);
    const audioFingerprint = analyser.frequencyBinCount;
    components.push(audioFingerprint);
    
    oscillator.stop();
    audioContext.close();
  } catch {
    components.push('audio_error');
  }

  // Combine all components and hash them
  const fingerprint = await hashString(components.join('|||'));
  
  return fingerprint;
};

/**
 * Hash a string using SHA-256
 */
const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Get or create device ID from localStorage
 * This ensures the device ID persists across page reloads
 */
export const getDeviceId = async () => {
  try {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
      // Generate new device ID
      deviceId = await generateDeviceFingerprint();
      
      // Store it in localStorage
      localStorage.setItem('deviceId', deviceId);
      console.log('🆔 New device ID generated:', deviceId.substring(0, 16) + '...');
    } else {
      console.log('🆔 Using existing device ID:', deviceId.substring(0, 16) + '...');
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error generating device ID:', error);
    // Fallback to a random ID if fingerprinting fails
    const fallbackId = 'fallback_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deviceId', fallbackId);
    return fallbackId;
  }
};

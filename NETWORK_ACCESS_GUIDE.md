# Network Access Configuration

This guide explains how the CultureKart application automatically detects and uses the correct network configuration for both local development and network/mobile access.

## 🌐 How It Works

The application now **automatically detects** whether it's being accessed from:
- **Localhost** (http://localhost:5173) - Traditional development
- **Network IP** (http://192.168.x.x:5173) - Mobile/network access

### Backend (API Server)

The backend server listens on **all network interfaces** (`0.0.0.0`) instead of just `localhost`, making it accessible from:
- Your computer: `http://localhost:5000`
- Other devices on same network: `http://YOUR_IP:5000`

### Frontend (React App)

The frontend automatically uses the appropriate API URL based on how you access it:
- Access via `localhost` → Uses `http://localhost:5000/api/v1`
- Access via network IP → Uses `http://YOUR_IP:5000/api/v1`

### QR Codes

QR codes generated for order verification automatically contain the **network IP address**, so when scanned from mobile devices, they redirect to the correct URL.

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd backend
npm start
```

You'll see output like:
```
🚀 CultureKart API Server
📡 Server running in development mode
🌐 Listening on port 5000

📱 Access URLs:
   Local:   http://localhost:5000/api/v1
   Network: http://192.168.1.100:5000/api/v1

💡 Use http://192.168.1.100:5000 for mobile devices on the same network
```

### 2. Start Frontend Server

```bash
cd frontend
npm run dev
```

You'll see output like:
```
VITE ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

## 📱 Mobile Access

### On Your Computer
Access normally: `http://localhost:5173`

### On Your Mobile Device (Same WiFi Network)

1. **Find your computer's IP address** from the backend/frontend startup logs
2. **Open browser** on mobile device
3. **Navigate to**: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

### Scanning QR Codes

QR codes generated for orders automatically use the network IP, so:
1. Generate order on computer
2. Scan QR code with mobile device
3. Mobile opens verification page using network IP
4. Everything works seamlessly!

## 🔧 Configuration

### Automatic Detection

No configuration needed! The system automatically:
- Detects your network IP
- Configures CORS for both localhost and network IP
- Adjusts API URLs based on access method
- Generates QR codes with correct URLs

### Manual Override (Optional)

If you need to override the automatic detection:

**Backend (.env)**
```env
FRONTEND_URL=http://your-custom-url:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://your-custom-url:5000/api/v1
```

## 🛠 Technical Details

### Files Modified

**Backend:**
- `backend/server.js` - Listen on 0.0.0.0
- `backend/app.js` - Dynamic CORS configuration
- `backend/src/utils/networkUtils.js` - IP detection utility
- `backend/src/models/ProductAuthentication.js` - Dynamic QR URL
- `backend/src/services/orderAuthenticationService.js` - Dynamic QR generation

**Frontend:**
- `frontend/vite.config.js` - Listen on 0.0.0.0
- `frontend/src/api/api.js` - Dynamic API URL
- `frontend/src/utils/networkUtils.js` - Client-side IP detection
- `frontend/src/components/NetworkInfo.jsx` - Network info display
- `frontend/src/App.jsx` - Added NetworkInfo component

### Network Info Component

In development mode, click the blue info button (bottom-right) to see:
- Current access mode (Local/Network)
- Hostname being used
- API URL being used
- Mobile access status

## 🔒 Security Notes

- **Development Only**: Network access is intended for local network testing
- **Production**: Configure proper domain names and SSL certificates
- **Firewall**: Ensure port 5000 and 5173 are not exposed to the internet

## 📋 Troubleshooting

### Can't access from mobile

1. **Check same WiFi**: Both devices must be on same network
2. **Check firewall**: Windows Firewall may block Node.js
3. **Verify IP**: Make sure using correct IP from startup logs

### CORS errors

- Restart backend after any network changes
- Check CORS origins in console logs
- Verify both devices use same IP address

### QR codes not working

- Check QR code URL (should show network IP)
- Ensure mobile can access `http://YOUR_IP:5173`
- Try accessing frontend directly before scanning

## 🎯 Use Cases

✅ **Local Development**: Use `localhost` on your computer
✅ **Mobile Testing**: Access via network IP from phone
✅ **QR Code Testing**: Scan codes with real mobile devices
✅ **Cross-device Testing**: Test on multiple devices simultaneously
✅ **Demo/Presentation**: Show app on projector while testing on phone

## 📞 Support

For issues or questions, check:
- Network IP detection in console logs
- NetworkInfo component for current configuration
- Backend startup logs for access URLs

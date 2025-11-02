# 📡 Live Logging Setup Guide - Papertrail

## What You've Got

Your admin login system now sends real-time logs to **Papertrail** - a free logging service that gives you:

- ✅ **Live log streaming** - See login attempts in real-time (live tail)
- ✅ **Search & filter** - Find specific IPs, emails, events
- ✅ **Alerts** - Get notified of suspicious activity via email
- ✅ **Simple dashboard** - Clean interface, instant setup
- ✅ **50MB/day free** - More than enough for login monitoring

## 🚀 Setup Steps (3 minutes)

### Step 1: Create Papertrail Account

1. Go to: **https://papertrailapp.com**
2. Click **"Sign Up"** (top right)
3. Sign up with Email (free account)
4. Verify your email

### Step 2: Get Your Log Destination

1. After login, go to **Settings** (top right) → **Log Destinations**
2. You'll see your log destination:
   ```
   Host: logs5.papertrailapp.com
   Port: 12345
   ```
3. **Copy both the host and port!**

### Step 3: Add to Your .env File

1. Open: `d:\Hussain Project\CultureKart\backend\.env`
2. Find these lines:
   ```
   PAPERTRAIL_HOST=
   PAPERTRAIL_PORT=
   ```
3. Add your host and port:
   ```
   PAPERTRAIL_HOST=logs5.papertrailapp.com
   PAPERTRAIL_PORT=12345
   ```
4. Save the file

### Step 4: Restart Your Backend

```powershell
# Stop current backend (Ctrl+C if running)
cd "d:\Hussain Project\CultureKart\backend"
npm start
```

You should see:
```
📡 Papertrail logging enabled (logs5.papertrailapp.com:12345)
```

## ✅ Testing

### 1. Make a Failed Login Attempt

Go to: `http://localhost:5173/admin-login`
- Try wrong email/password

### 2. View Live Logs

Go to Papertrail dashboard: **https://papertrailapp.com/events**

**For Real-Time Streaming:**
1. Click the **"LIVE"** button (or **"Live Tail"**) at the top
2. Keep the page open - logs will stream automatically
3. Look for the **pause button** - if paused, click to resume

**Note:** If logs only appear on page refresh:
- Make sure "Live Tail" or "LIVE" mode is enabled (button should be highlighted)
- SolarWinds free tier may have delays (up to 5-10 seconds)
- Some browsers block WebSocket connections - check browser console for errors
- Try disabling browser extensions (ad blockers) that might block streaming

**Alternative - Use SolarWinds CLI for True Real-Time:**
```powershell
# Install SolarWinds CLI (if available)
npm install -g solarwinds-papertrail-cli

# Stream logs in terminal
papertrail --token YOUR_TOKEN
```

You'll see logs like:

**Failed Login:**
```
2025-11-02 14:30:15 [warn]: ⚠️  Failed login attempt
{"event":"admin_login_failed","email":"test@example.com","ipAddress":"::1","attemptNumber":1,"remainingAttempts":2}
```

**IP Locked:**
```
2025-11-02 14:30:20 [error]: 🔴 Failed login - IP LOCKED
{"event":"admin_login_failed_locked","email":"test@example.com","ipAddress":"::1","attemptNumber":3,"lockUntil":"2025-11-02T14:35:20Z"}
```

**Successful Login:**
```
2025-11-02 14:30:25 [info]: ✅ Successful admin login
{"event":"admin_login_success","email":"admin@culturekart.com","ipAddress":"::1"}
```

## 🎯 What's Being Logged

### Events Tracked:

| **Event** | **When** | **Level** | **Data Included** |
|-----------|----------|-----------|-------------------|
| `admin_login_success` | Successful login | INFO | Email, IP, User Agent |
| `admin_login_failed` | Wrong credentials | WARN | Email, IP, Attempt #, Remaining attempts |
| `admin_login_failed_locked` | Failed + IP locked | ERROR | Email, IP, Lock until time |
| `admin_login_blocked` | Try login while locked | WARN | Email, IP, Remaining lock time |

### Data Fields:

- `event` - Type of event
- `email` - Email attempted
- `ipAddress` - IP address (::1 for localhost)
- `userAgent` - Browser/device info
- `attemptNumber` - Current attempt count
- `remainingAttempts` - How many tries left
- `lockUntil` - When lock expires
- `remainingTime` - Seconds until unlock
- `reason` - Why login failed
- `timestamp` - When it happened

## 🔍 Using Papertrail Dashboard

### Search Examples:

Search in the search bar at: **https://papertrailapp.com/events**

- **Find all failed logins:**
  ```
  admin_login_failed
  ```

- **Find specific email:**
  ```
  test@example.com
  ```

- **Find specific IP:**
  ```
  192.168.1.100
  ```

- **Find all locks:**
  ```
  admin_login_failed_locked
  ```

- **Last 24 hours:**
  ```
  admin_login within 24h
  ```

- **Combine filters:**
  ```
  admin_login_failed test@example.com
  ```

### Create Alerts 🚨

Get notified when suspicious activity happens!

1. Go to **Settings** → **Alerts**
2. Click **"Create Alert"**
3. Example configurations:

**Alert 1: IP Got Locked**
- Name: "IP Address Locked"
- Search: `admin_login_failed_locked`
- Frequency: "1 match"
- Destination: Your email
- Get instant notification when someone gets locked out!

**Alert 2: Multiple Failed Logins**
- Name: "Brute Force Attack"
- Search: `admin_login_failed`
- Frequency: "10 matches within 5 minutes"
- Destination: Your email
- Detect potential brute force attacks!

**Alert 3: High Login Activity**
- Name: "Unusual Login Activity"
- Search: `admin_login`
- Frequency: "20 matches within 10 minutes"
- Destination: Your email
- Track abnormal patterns!

## 📊 Alternative Services

### Better Stack / Logtail (More features)
- **Sign up:** https://betterstack.com/logtail
- **Free:** Unlimited logs (fair use)
- **Setup:** Install `@logtail/node @logtail/winston`
- **Pros:** Beautiful UI, better search, mobile app

### Loggly (Enterprise-grade)
- **Sign up:** https://www.loggly.com
- **Free:** 200MB/day
- **Pros:** Advanced analytics, anomaly detection

### Sentry (Error tracking focus)
- **Sign up:** https://sentry.io
- **Free:** 5K events/month
- **Pros:** Source maps, performance monitoring

## 🆘 Troubleshooting

### Logs not appearing?

1. **Check .env file:**
   - Make sure `PAPERTRAIL_HOST` and `PAPERTRAIL_PORT` are filled
   - No spaces around `=`
   - Host format: `logsN.papertrailapp.com` (not full URL)
   - Port is just the number: `12345` (no quotes)

2. **Check backend console:**
   - Should see: `📡 Papertrail logging enabled (logsX.papertrailapp.com:XXXXX)`
   - If you see connection errors, verify host/port

3. **Restart backend:**
   ```powershell
   cd "d:\Hussain Project\CultureKart\backend"
   npm start
   ```

4. **Test with a login attempt:**
   - Go to admin login page
   - Try wrong password
   - Should appear in Papertrail within 1-2 seconds

### Local Logs Still Work

Even if Papertrail is down, your console still shows logs:
```
[2025-11-02 14:30:15] warn: ⚠️  Failed login attempt {"event":"admin_login_failed"...}
```

## 💡 Pro Tips

1. **Save Searches:** Click "Save Search" after filtering to quickly access later
2. **Live Tail + Filter:** Use search while live tail is on to only see specific events
3. **Archive Logs:** Set up archiving to S3/GCS for long-term storage
4. **Multiple Systems:** Add different systems to same log destination for centralized monitoring

## 📚 Documentation

- **Papertrail Docs:** https://www.papertrail.com/help/
- **Winston Logger:** https://github.com/winstonjs/winston
- **Winston Syslog:** https://github.com/winstonjs/winston-syslog

---

**You're all set!** 🎉 

**Next Steps:**
1. Sign up for Papertrail at https://papertrailapp.com
2. Get your log destination (Settings → Log Destinations)
3. Add `PAPERTRAIL_HOST` and `PAPERTRAIL_PORT` to `.env`
4. Restart backend with `npm start`
5. Try a failed login and watch it appear in Papertrail live tail! 🚀

Your admin login attempts will now be logged live to Papertrail!

# Admin Setup Guide

## ✅ Step 1: Admin User Created in MongoDB

The admin user entry has been created in MongoDB with:
- **Email**: `admin@culturekart.com`
- **Role**: `admin`

## 🔥 Step 2: Create Admin User in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - **Email**: `admin@culturekart.com`
   - **Password**: `Admin@123456` (or your choice - minimum 6 characters)
6. Click **Add User**

## 🔐 Step 3: Admin Login

### For Local Development:
- **Admin Login URL**: http://localhost:5173/admin/login
- **Admin Dashboard**: http://localhost:5173/admin/dashboard

### Login Steps:
1. Go to http://localhost:5173/admin/login
2. Enter email: `admin@culturekart.com`
3. Enter password: `Admin@123456`
4. You'll be automatically redirected to the admin dashboard

## 🌐 Step 4: Subdomain Setup (For Production)

### Option A: Using Vercel/Netlify

#### For Vercel:
1. Deploy your frontend to Vercel
2. Go to your project settings
3. Add a new domain: `admin.yourdomain.com`
4. In your DNS provider (like Cloudflare), add:
   ```
   Type: CNAME
   Name: admin
   Target: cname.vercel-dns.com
   ```

#### Frontend Configuration:
Update your routing to detect subdomain:

```javascript
// In App.jsx
const isAdminSubdomain = window.location.hostname.startsWith('admin.');

// Redirect admin subdomain to admin login
if (isAdminSubdomain && window.location.pathname === '/') {
  return <Navigate to="/admin/login" replace />;
}
```

### Option B: Using Nginx Reverse Proxy

If self-hosting, configure Nginx:

```nginx
# Main site
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5173;
    }
}

# Admin subdomain
server {
    listen 80;
    server_name admin.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5173/admin;
    }
}
```

### Option C: Environment-Based Routing

Create a `.env` file for subdomain handling:

```env
# Frontend .env
VITE_ADMIN_SUBDOMAIN=admin.culturekart.com
VITE_MAIN_DOMAIN=culturekart.com
```

Then in your code:
```javascript
const isAdminSite = window.location.hostname === import.meta.env.VITE_ADMIN_SUBDOMAIN;
```

## 🚀 Quick Start (Current Setup)

Right now, you can access:

### Main App:
- Home: http://localhost:5173/
- Login: http://localhost:5173/login
- Shop: http://localhost:5173/shop

### Admin Panel:
- Admin Login: http://localhost:5173/admin/login ⭐
- Admin Dashboard: http://localhost:5173/admin/dashboard

## 🔒 Security Features

1. **Role-Based Access Control**: 
   - Admin routes require `role: 'admin'`
   - Verified on both frontend and backend

2. **Email Validation**:
   - Admin login checks for admin email format
   - Non-admin emails are rejected

3. **Separate UI**:
   - Admin dashboard has no navbar/footer
   - Different design theme (slate/blue)
   - Isolated from buyer/artisan interfaces

4. **Session Management**:
   - Admin logout returns to admin login page
   - Tokens stored securely in localStorage

## 📝 Next Steps

1. ✅ Create admin user in Firebase (see Step 2)
2. ✅ Test login at http://localhost:5173/admin/login
3. ✅ Verify admin dashboard access
4. ⏭️ Set up subdomain when deploying to production

## 🆘 Troubleshooting

### "Admin account not found"
- Make sure you created the user in Firebase Console
- Check email is exactly: `admin@culturekart.com`

### "Access denied. Admin privileges required"
- Run: `node backend/scripts/createAdminSimple.js` again
- Verify role is `admin` in MongoDB

### Cannot access admin dashboard
- Clear browser cache and localStorage
- Make sure you're logged in as admin
- Check console for errors

## 🔐 Changing Admin Password

To change admin password in Firebase:
1. Go to Firebase Console → Authentication
2. Find admin user
3. Click menu (•••) → Reset password
4. Or delete and recreate user with new password

---

**Admin Panel is ready to use!** 🎉

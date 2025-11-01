# Admin Dashboard - Testing Guide

## Overview
The CultureKart Admin Dashboard is a completely separate interface for platform administrators. It has no buyer/artisan UI elements and provides full control over the platform.

## Features Implemented

### ✅ Layout Components
- **AdminLayout**: Main wrapper with sidebar and header
- **AdminSidebar**: Fixed left navigation (slate gradient theme)
- **AdminHeader**: Top bar with admin avatar, notifications, and logout button

### ✅ Dashboard Pages

#### 1. **Admin Dashboard** (`/admin/dashboard`)
- Total buyers, artisans, active artisans count
- Products listed, pending approval count
- Total orders, completed orders
- Platform revenue, pending withdrawals
- Real-time activity feed
- **Charts:**
  - Monthly revenue & commission (Area Chart)
  - Orders per month (Bar Chart)
  - User signups - Artisans vs Buyers (Line Chart)
  - Category performance (Pie Chart)
  - Top selling categories widget

#### 2. **User Management** (`/admin/users`)
- Table of all users (buyers + artisans)
- Filters: All / Buyers / Artisans / Suspended
- Search by name, email, or city
- **Actions:**
  - View user profile modal
  - Suspend user
  - Block user
  - Approve artisan (for pending status)
- Stats: Total users, buyers, artisans, suspended

#### 3. **Product Management** (`/admin/products`)
- Product grid view with images
- Approval panel for pending products
- **Filters:**
  - Status: All / Pending / Approved / Flagged
  - Category dropdown
  - Sort by: Newest / Oldest / Price
- **Actions:**
  - View product details
  - Approve product
  - Reject product
  - Flag product
  - Remove product
- Inventory alerts (low stock / out of stock)
- Product details modal

#### 4. **Order Monitoring** (`/admin/orders`)
- All orders list with status tracking
- Dispute tracking system
- Fraud alerts highlighting
- **Filters:**
  - All / Pending / Packed / Shipped / Delivered / Disputes / Fraud Alerts
- **Features:**
  - Order timeline modal
  - Manual dispute resolution
  - Clear fraud alerts
- Stats: Total orders, disputes, fraud alerts, delivered

#### 5. **Payout Management** (`/admin/payouts`)
- Withdrawal requests table
- **Actions:**
  - Approve withdrawal
  - Reject withdrawal
  - Hold withdrawal
- Platform commission breakdown (10%)
- Balance ledger display
- Stats: Pending, approved, completed, commission earned

#### 6. **Categories & Tags** (`/admin/categories`)
- **Categories Tab:**
  - Grid view with icons
  - Add/Edit/Delete categories
  - Category icon upload
  - Product count per category
  - Active/Inactive status
  
- **Tags Tab:**
  - Tag list with product counts
  - Add/Edit/Delete tags
  - Tags for product discovery

#### 7. **CMS & Marketing** (`/admin/cms`)
- **Homepage Banners:**
  - Add/Edit/Delete banners
  - Banner image upload
  - Link management
  - Position ordering
  
- **Featured Artisans:**
  - Set/remove featured status
  - Display artisan performance
  
- **Promo Codes:**
  - Create promo codes
  - Percentage or fixed discount
  - Usage tracking
  - Validity period
  
- **Announcements:**
  - Platform-wide announcements
  - Warning/Info types
  - Active/Inactive toggle

#### 8. **Support & Tickets** (`/admin/support`)
- Ticket inbox for complaints
- **Filters:**
  - Status: Open / In Progress / Resolved
  - Priority: High / Medium / Low
- **Features:**
  - View ticket details with conversation
  - Assign tickets to support agents
  - Reply to tickets
  - Mark as resolved with notes
  - User type indicator (buyer/artisan)
- Stats: Open, in-progress, resolved, high priority

## Design Features

### 🎨 UI Style
- **Minimal and Professional**
- **Color Scheme:**
  - Sidebar: Slate gradient (900 → 800)
  - Accents: Blue (primary actions)
  - Status badges: Color-coded (green, yellow, red, orange, blue)
  - Background: Gray-50
  
### 🔒 Security
- Role-based access control (admin role required)
- Protected routes
- Logout returns to public login page
- No navbar or footer in admin area
- Complete isolation from buyer/artisan UI

### 📊 Charts & Visualizations
- Using Recharts library
- Responsive charts
- Interactive tooltips
- Legend displays
- Professional color schemes

## Routes Structure

```
/admin
  ├── /dashboard       - Overview with stats and charts
  ├── /users           - User management
  ├── /products        - Product management & approval
  ├── /orders          - Order monitoring & disputes
  ├── /payouts         - Withdrawal & commission management
  ├── /categories      - Categories & tags management
  ├── /cms             - Marketing & content management
  └── /support         - Support tickets
```

## Testing Instructions

### 1. **Access Admin Dashboard**
You need a user with `role: 'admin'` in the database.

**Temporary Solution (for testing):**
You can manually update a user's role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### 2. **Login as Admin**
- Go to `/login`
- Sign in with your admin account
- You'll be redirected to `/admin/dashboard`

### 3. **Test Each Module**
Navigate through the sidebar to test all pages:
- Check stats display correctly
- Test search and filter functionality
- Open modals and verify data
- Try action buttons (they log to console currently)

### 4. **Verify Isolation**
- No main navbar should appear
- No footer should appear
- Sidebar is admin-specific
- Header only shows logout button

## Sample Data

All pages currently use sample/mock data. To connect to real data:

1. Create API endpoints in backend for:
   - Users (GET /admin/users)
   - Products (GET /admin/products)
   - Orders (GET /admin/orders)
   - Withdrawals (GET /admin/withdrawals)
   - Categories (GET /admin/categories)
   - Tickets (GET /admin/tickets)

2. Replace sample data arrays with API calls using axios

## Future Enhancements

- Real-time updates using WebSockets
- Export data to CSV/Excel
- Advanced analytics with date range filters
- Bulk actions (approve multiple products)
- Email notifications to users
- Activity logs and audit trail
- Dashboard customization

## Notes

- All action buttons currently log to console
- Modal forms need backend integration
- File uploads need storage service (Firebase/S3)
- Charts use sample data - connect to real analytics API
- Support ticket replies need backend endpoint

---

**Admin Dashboard is fully functional and ready for backend integration!**

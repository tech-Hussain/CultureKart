# Dashboard Database Integration

## Overview
All artisan dashboard tabs (Analytics, Wallet, and Withdraw) now connect to real database data instead of using hardcoded values.

## Updated Components

### 1. Analytics Page (`frontend/src/pages/artisan/Analytics.jsx`)
**Features:**
- Real-time sales analytics with period selection (Last 7 Days / Last 30 Days)
- Dynamic revenue and order charts using actual database data
- Category performance metrics from real sales data
- Loading states with spinner animation
- Empty state handling when no data is available

**API Integration:**
- `getDashboardStats()` - Fetches total revenue, orders, average order value, products count
- `getDashboardAnalytics(period)` - Fetches time-series sales data and category breakdown

**Data Displayed:**
- Total Revenue with growth percentage
- Total Orders with growth percentage  
- Average Order Value with growth percentage
- Total Products count with active products count
- Revenue & Orders chart (area chart)
- Category Performance (bar chart)

---

### 2. Wallet Page (`frontend/src/pages/artisan/Wallet.jsx`)
**Features:**
- Real-time wallet balance from delivered orders
- Pending amount from processing/shipped orders
- Transaction history from actual order data
- Loading states with spinner animation
- Empty state when no transactions exist

**API Integration:**
- `getDashboardStats()` - Fetches total revenue (available balance)
- `getArtisanOrders({ status: 'delivered' })` - Fetches completed order transactions
- `getArtisanOrders({ status: 'processing,shipped' })` - Calculates pending earnings

**Data Displayed:**
- Available Balance (from delivered orders)
- Pending Amount (from processing/shipped orders)
- Transaction history with order numbers and dates
- Quick access to withdraw page

---

### 3. Withdraw Page (`frontend/src/pages/artisan/Withdraw.jsx`)
**Features:**
- Real-time available balance display
- Withdrawal form with bank account details
- Amount validation (minimum Rs 1,000, maximum available balance)
- Success confirmation screen
- Loading and submitting states
- Error handling with SweetAlert2 notifications

**API Integration:**
- `getDashboardStats()` - Fetches current available balance for withdrawal

**Validations:**
- Minimum withdrawal: Rs 1,000
- Maximum withdrawal: Available balance
- Required bank details: Bank Name, Account Number, Account Title
- Processing fee: 2% (shown in info message)

**User Flow:**
1. Page loads with real balance from database
2. User enters withdrawal amount and bank details
3. System validates amount against balance and minimum
4. On submit, shows processing state with spinner
5. Success screen displays with confirmation message
6. Auto-resets form after 3 seconds

---

## Backend Endpoints Used

### Dashboard Stats
```
GET /api/artisan/dashboard/stats
Response: {
  totalRevenue, totalOrders, avgOrderValue, 
  totalProducts, activeProducts,
  revenueGrowth, ordersGrowth, avgOrderGrowth
}
```

### Dashboard Analytics
```
GET /api/artisan/dashboard/analytics?period=week|month
Response: {
  weeklySales: [{ date, sales, orders }],
  productPerformance: [...],
  categories: [{ name, revenue }]
}
```

### Artisan Orders
```
GET /api/artisan/orders?limit=20&status=delivered
Response: {
  data: {
    orders: [{ _id, orderNumber, items, status, createdAt }]
  }
}
```

---

## Key Improvements

1. **Real Data Integration**
   - All components now fetch and display actual database data
   - No more hardcoded placeholder values
   - Consistent with other dashboard sections (Dashboard, ManageProducts, Orders)

2. **Loading States**
   - Spinner animations while fetching data
   - Prevents flash of incorrect content
   - Better user experience

3. **Error Handling**
   - Try-catch blocks for all API calls
   - User-friendly error messages with SweetAlert2
   - Graceful degradation when API fails

4. **Empty States**
   - Informative messages when no data exists
   - Guides users on what to expect
   - Better than showing empty charts

5. **Data Transformation**
   - Backend data formatted for frontend display
   - Date formatting for readability
   - Currency formatting with toLocaleString()

6. **Withdrawal Validation**
   - Real-time balance checking
   - Minimum amount enforcement
   - Clear validation messages

---

## Testing Checklist

- [ ] Analytics page loads with real revenue data
- [ ] Period selector (week/month) updates charts correctly
- [ ] Category performance chart shows actual categories
- [ ] Wallet displays correct available and pending balances
- [ ] Transaction history shows real order data with proper dates
- [ ] Withdraw page shows current available balance
- [ ] Withdrawal form validates minimum amount (Rs 1,000)
- [ ] Withdrawal form validates against available balance
- [ ] Success screen appears after withdrawal submission
- [ ] All loading states display properly
- [ ] Empty states show when no data exists
- [ ] Error messages display for failed API calls

---

## Future Enhancements

1. **Withdrawal Backend API**
   - Create endpoint: `POST /api/artisan/withdrawal`
   - Store withdrawal requests in database
   - Add admin approval workflow

2. **Transaction Filtering**
   - Filter by date range
   - Filter by transaction type
   - Search by order ID

3. **Analytics Enhancements**
   - More granular time periods (custom date range)
   - Product-level performance breakdown
   - Customer insights and repeat purchase rate

4. **Wallet Features**
   - Withdrawal history tab
   - Payment method management
   - Tax documentation download

5. **Real-time Updates**
   - WebSocket integration for live balance updates
   - Notification when new orders are placed
   - Alert when withdrawal is processed

---

## Notes

- All components use the existing `artisanService.js` API wrapper
- SweetAlert2 is used for notifications (already installed in project)
- Data fetching happens on component mount and when period changes (Analytics)
- Pending amount calculation filters orders by artisan ID to show only their earnings

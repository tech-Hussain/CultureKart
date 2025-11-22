# Withdrawal Approval & Escrow System

## Overview
Implemented a complete admin approval system for artisan withdrawal requests with escrow management to hold funds until orders are delivered.

## Backend Changes

### 1. Updated Withdrawal Model (`backend/src/models/Withdrawal.js`)
- **New Status**: Added `approved` and `rejected` to withdrawal statuses
- **Admin Approval Tracking**:
  - `adminApproval.status`: pending/approved/rejected
  - `adminApproval.approvedBy`: Reference to admin user
  - `adminApproval.approvedAt` / `rejectedAt`: Timestamps
  - `adminApproval.rejectionReason`: Reason for rejection
  - `adminApproval.adminNotes`: Admin notes
  
- **Escrow Details**:
  - `escrowDetails.totalEscrow`: Total funds held for artisan
  - `escrowDetails.availableBalance`: Available for withdrawal
  - `escrowDetails.pendingBalance`: Locked in pending withdrawals
  - `escrowDetails.orders`: Array of orders contributing to escrow

- **New Methods**:
  - `approveRequest(adminId, notes)`: Approve withdrawal
  - `rejectRequest(adminId, reason, notes)`: Reject withdrawal
  - `getPendingApprovals()`: Get all pending withdrawal requests
  - `getTotalPendingAmount()`: Total amount pending approval
  - `getArtisanEscrowSummary(artisanId)`: Calculate escrow from delivered orders

### 2. New Admin Routes (`backend/src/routes/admin/withdrawals.js`)
- `GET /api/v1/admin/withdrawals/pending` - Get pending approvals
- `GET /api/v1/admin/withdrawals/all` - Get all withdrawals with filters
- `GET /api/v1/admin/withdrawals/:id` - Get withdrawal details
- `POST /api/v1/admin/withdrawals/:id/approve` - Approve request
- `POST /api/v1/admin/withdrawals/:id/reject` - Reject request
- `GET /api/v1/admin/withdrawals/stats/summary` - Dashboard statistics

### 3. Updated Artisan Withdrawal Routes (`backend/src/routes/withdrawal.js`)
- Changed balance calculation to use escrow system
- Withdrawal requests now default to `status: 'pending'` awaiting admin approval
- Response includes `adminApprovalStatus`
- Shows `availableBalance` and `pendingBalance` separately

### 4. App Registration (`backend/app.js`)
- Registered new admin withdrawal routes

## Frontend Changes

### 1. New Service (`frontend/src/services/adminWithdrawalService.js`)
API service for admin withdrawal management with methods:
- `getPendingWithdrawals()`
- `getAllWithdrawals(filters)`
- `getWithdrawalDetails(id)`
- `approveWithdrawal(id, notes)`
- `rejectWithdrawal(id, reason, notes)`
- `getWithdrawalStats()`

### 2. New Admin Page (`frontend/src/pages/admin/AdminWithdrawalPage.jsx`)
Complete withdrawal management interface with:
- **Statistics Dashboard**:
  - Pending approval amount and count
  - Approved amount and count
  - Total escrow held
  - Completed withdrawals this month
  
- **Two Views**:
  - Pending Approvals: All requests awaiting admin action
  - All Withdrawals: Historical view with status filters
  
- **Withdrawal Actions**:
  - Approve with optional notes
  - Reject with required reason
  - SweetAlert2 confirmation dialogs
  
- **Detailed Information**:
  - Artisan details
  - Amount breakdown (gross, fees, net)
  - Bank details
  - Request timestamp
  - Admin notes and rejection reasons
  - Status badges

### 3. Updated Admin Navigation (`frontend/src/components/admin/AdminSidebar.jsx`)
- Added "Withdrawals" menu item with BanknotesIcon
- Positioned between Orders and Payouts

### 4. App Routing (`frontend/src/App.jsx`)
- Imported `AdminWithdrawalPage`
- Added route: `/admin/withdrawals`

## How It Works

### Escrow Flow
1. **Order Placed**: Funds held in escrow when order is created
2. **Order Delivered**: Artisan's share moves to "available balance"
3. **Withdrawal Request**: Artisan initiates withdrawal
   - Funds move from "available" to "pending" balance
   - Request enters admin approval queue
4. **Admin Reviews**: Admin can approve or reject
   - **Approved**: Funds released for payout processing
   - **Rejected**: Funds return to available balance
5. **Payout Completed**: Funds transferred to artisan's bank

### Admin Workflow
1. Navigate to `/admin/withdrawals`
2. View statistics and pending requests
3. Review withdrawal details:
   - Artisan information
   - Requested amount
   - Bank details
   - Escrow breakdown
4. Make decision:
   - **Approve**: Add optional notes, confirm approval
   - **Reject**: Provide reason, add optional notes
5. System updates withdrawal status and escrow balances

### Artisan Experience
1. View available balance (from delivered orders)
2. Initiate withdrawal request
3. See "Pending Admin Approval" status
4. Wait for admin decision
5. Receive notification (if approved) or see rejection reason
6. Track payout progress after approval

## Database Schema

### Withdrawal Document
```javascript
{
  artisan: ObjectId,
  amount: Number,
  processingFee: Number,
  netAmount: Number,
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed',
  adminApproval: {
    status: 'pending' | 'approved' | 'rejected',
    approvedBy: ObjectId, // Admin user
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    adminNotes: String
  },
  escrowDetails: {
    totalEscrow: Number,
    availableBalance: Number,
    pendingBalance: Number,
    orders: [{
      orderId: ObjectId,
      amount: Number,
      status: String
    }]
  },
  bankDetails: { ... },
  requestedAt: Date,
  processedAt: Date,
  completedAt: Date
}
```

## Security Features
- Admin-only routes protected by `authenticateAdmin` middleware
- Validates escrow availability before approval
- Prevents duplicate withdrawals for same funds
- Tracks admin actions with user references
- Requires rejection reason for accountability

## UI Features
- Real-time statistics
- Color-coded status badges
- Filterable withdrawal list
- Detailed withdrawal cards
- Confirmation dialogs
- Success/error notifications
- Responsive design
- Loading states

## Future Enhancements
1. Email notifications to artisans
2. Bulk approval for multiple withdrawals
3. Withdrawal limits and thresholds
4. Detailed audit logs
5. Export withdrawal reports
6. Automated approval rules
7. Integration with accounting systems

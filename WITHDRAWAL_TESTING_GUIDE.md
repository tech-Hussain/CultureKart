# Withdrawal System - Testing Guide

## 🎯 Overview

The withdrawal system uses **Stripe Connect** with a mock sandbox mode for testing. In development, it simulates real bank transfers without actual money movement.

## 🧪 Test Mode Features

### Test Bank Account Numbers

Use these account numbers to simulate different scenarios:

| Account Number | Behavior | Processing Time | Result |
|----------------|----------|-----------------|--------|
| `1234567890` | ✅ Always succeeds | Instant | Completed |
| `9999999999` | ⏱️ Delayed processing | 5 seconds | Completed |
| `0000000000` | ❌ Always fails | Instant | Failed |
| Any other | ✅ Normal processing | 30 seconds | Completed |

### Status Flow

1. **Pending** 🟡 - Just submitted
2. **Processing** 🔵 - Being transferred (5-10 seconds)
3. **Completed** ✅ - Money sent (after 30 seconds in mock mode)
4. **Failed** ❌ - Transfer failed

## 🚀 How to Test

### Step 1: Login as Artisan

1. Go to artisan dashboard
2. Navigate to "Wallet" page
3. Check your available balance

### Step 2: Create Withdrawal Request

1. Click "Withdraw Funds" button
2. Fill in the form:
   - **Amount**: At least Rs 1,000
   - **Bank Name**: Any (e.g., HBL, UBL, MCB)
   - **Account Number**: Use test numbers above
   - **Account Title**: Your name

3. Submit the form

### Step 3: Monitor Status

**Immediately after submission:**
- Status: "Pending" 🟡
- Transaction ID generated
- Estimated arrival date shown

**After 5-10 seconds:**
- Status changes to "Processing" 🔵
- Stripe payout ID assigned

**After 30 seconds (mock mode):**
- Status changes to "Completed" ✅
- Balance updated
- Transaction appears in history

### Step 4: View Transaction History

1. Go back to Wallet page
2. See withdrawal in transaction list
3. Negative amount (money going out)
4. Status badge with color coding

## 💰 Balance Calculation

```
Available Balance = Total Earnings - (Completed Withdrawals + Pending Withdrawals)
```

**Example:**
- Total Earnings: Rs 10,000
- Previous Withdrawals: Rs 3,000
- Pending Withdrawal: Rs 2,000
- **Available Balance: Rs 5,000**

## 🔒 Validations

### Amount Validation
- ✅ Minimum: Rs 1,000
- ✅ Maximum: Available balance
- ❌ Cannot withdraw if pending request exists
- ❌ Cannot withdraw more than available

### Processing Fee
- **Fee**: 2% of withdrawal amount
- **Net Amount**: Amount - Fee
- Example: Rs 10,000 withdrawal = Rs 200 fee = Rs 9,800 net

## 📊 API Endpoints

### Create Withdrawal
```http
POST /api/v1/artisan/withdrawals
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 5000,
  "bankDetails": {
    "bankName": "HBL",
    "accountNumber": "1234567890",
    "accountTitle": "John Doe"
  }
}
```

### Get Withdrawals
```http
GET /api/v1/artisan/withdrawals?page=1&limit=20&status=completed
Authorization: Bearer <token>
```

### Get Available Balance
```http
GET /api/v1/artisan/withdrawals/balance/available
Authorization: Bearer <token>
```

## 🎨 UI Features

### Wallet Page
- Real-time balance display
- Pending withdrawals shown separately
- Combined transaction history (orders + withdrawals)
- Color-coded status indicators

### Withdraw Page
- Balance breakdown
- Real-time validation
- Test account helper text
- Success screen with transaction details
- Error handling with user-friendly messages

## 🔄 Mock Behavior Details

### Immediate Actions (0 seconds)
- Withdrawal record created in database
- Status: "Pending"
- Transaction ID generated
- Response sent to frontend

### Background Processing (Async)
- Stripe Connect service called
- Mock payout created
- Status changed to "Processing"
- Payout ID assigned

### Auto-Completion (30 seconds)
- In mock mode only
- Status automatically changes to "Completed"
- Balance updated
- Ready for next withdrawal

## 🚨 Error Scenarios

### Insufficient Balance
```json
{
  "status": "error",
  "message": "Insufficient balance",
  "details": {
    "requested": 10000,
    "available": 5000,
    "shortfall": 5000
  }
}
```

### Pending Withdrawal Exists
```json
{
  "status": "error",
  "message": "You have a pending withdrawal. Please wait for it to complete.",
  "pendingWithdrawal": {
    "id": "...",
    "amount": 5000,
    "status": "processing"
  }
}
```

### Invalid Account (0000000000)
```json
{
  "status": "error",
  "message": "Invalid bank account",
  "code": "account_invalid"
}
```

## 🎯 Testing Checklist

- [ ] Login as artisan with delivered orders
- [ ] Check available balance on Wallet page
- [ ] Create withdrawal with test account `1234567890`
- [ ] Verify success message with transaction ID
- [ ] Wait 30 seconds and refresh Wallet page
- [ ] Confirm status changed to "Completed"
- [ ] Verify balance decreased by withdrawal amount
- [ ] Try withdrawing with account `0000000000` to test failure
- [ ] Try withdrawing more than available balance
- [ ] Try creating second withdrawal while first is pending

## 📝 Notes

- **Mock Mode**: Active in development environment
- **Production**: Will use real Stripe Connect when `NODE_ENV=production`
- **Auto-complete**: Only happens in mock mode (30 seconds)
- **Real Mode**: Would take 3-5 business days for actual bank transfer

## 🔜 Production Checklist

Before going live with real payouts:

1. [ ] Set `NODE_ENV=production` in `.env`
2. [ ] Configure real Stripe API keys
3. [ ] Complete Stripe Connect onboarding
4. [ ] Add artisan bank account verification
5. [ ] Set up Stripe webhooks for payout status updates
6. [ ] Test with Stripe test mode first
7. [ ] Enable email notifications for withdrawal updates
8. [ ] Add admin approval workflow (optional)

## 🛠️ Troubleshooting

**Withdrawal stuck in "Pending":**
- Check backend console for errors
- Verify Stripe service is running
- Wait 30 seconds for auto-completion (mock mode)

**Balance not updating:**
- Refresh the Wallet page
- Check if withdrawal actually completed
- Verify order status is "delivered"

**Cannot create withdrawal:**
- Ensure no pending withdrawals exist
- Check available balance
- Verify minimum Rs 1,000 amount
- Confirm artisan profile exists

## 📞 Support

For issues or questions:
- Check backend console logs (detailed logging enabled)
- Frontend console shows API responses
- Review `Withdrawal` model in MongoDB
- Check `stripePayoutId` field for tracking

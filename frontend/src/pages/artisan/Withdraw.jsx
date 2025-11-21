/**
 * Withdraw Earnings Page
 * Request withdrawal of earnings with real Stripe Connect integration
 */
import { useState, useEffect } from 'react';
import { BanknotesIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getAvailableBalance, createWithdrawal } from '../../services/withdrawalService';
import Swal from 'sweetalert2';

function Withdraw() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountTitle: '',
  });
  const [availableBalance, setAvailableBalance] = useState(0);
  const [balanceDetails, setBalanceDetails] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const response = await getAvailableBalance();
        const data = response.data?.data || response.data;
        
        console.log('💰 Available balance:', data);
        setAvailableBalance(data.availableBalance || 0);
        setBalanceDetails(data);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load balance'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    
    if (withdrawalAmount > availableBalance) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Balance',
        text: `You only have Rs ${availableBalance.toLocaleString()} available`,
        footer: balanceDetails ? `Pending withdrawals: Rs ${balanceDetails.pendingWithdrawals.toLocaleString()}` : ''
      });
      return;
    }

    if (withdrawalAmount < 1000) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'Minimum withdrawal amount is Rs 1,000'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const withdrawalData = {
        amount: withdrawalAmount,
        bankDetails: {
          bankName: accountDetails.bankName,
          accountNumber: accountDetails.accountNumber,
          accountTitle: accountDetails.accountTitle,
        },
      };

      console.log('📤 Submitting withdrawal:', withdrawalData);
      const response = await createWithdrawal(withdrawalData);
      const data = response.data?.data || response.data;
      
      console.log('✅ Withdrawal response:', data);
      
      setTransactionId(data.withdrawal.id);
      setEstimatedArrival(data.withdrawal.estimatedArrival);
      setSuccess(true);
      
      Swal.fire({
        icon: 'success',
        title: 'Request Submitted!',
        html: `
          <p>Your withdrawal request has been submitted successfully</p>
          <p class="text-sm text-gray-600 mt-2">Transaction ID: ${data.withdrawal.id.slice(-8)}</p>
          <p class="text-sm text-gray-600">Processing fee: Rs ${data.withdrawal.processingFee.toLocaleString()}</p>
          <p class="text-sm font-semibold text-green-600 mt-2">Net amount: Rs ${data.withdrawal.netAmount.toLocaleString()}</p>
        `,
        timer: 3000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit withdrawal request';
      const errorDetails = error.response?.data?.details;
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        footer: errorDetails ? `Available: Rs ${errorDetails.available.toLocaleString()}` : ''
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-2">
            Your withdrawal request has been submitted successfully.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
            <p className="text-sm font-mono text-blue-800">Transaction ID: #{transactionId.slice(-8).toUpperCase()}</p>
            {estimatedArrival && (
              <p className="text-sm text-blue-700 mt-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Estimated arrival: {new Date(estimatedArrival).toLocaleDateString()}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            We'll process it within 2-3 business days. You can track the status on your Wallet page.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSuccess(false);
                setAmount('');
                setAccountDetails({ bankName: '', accountNumber: '', accountTitle: '' });
              }}
              className="px-6 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700"
            >
              Make Another Request
            </button>
            <a
              href="/artisan/wallet"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              View Wallet
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Withdraw Earnings</h1>
        <p className="text-gray-600 mt-1">Request a payout to your bank account</p>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BanknotesIcon className="w-10 h-10" />
          <div className="flex-1">
            <p className="text-sm opacity-90">Available for Withdrawal</p>
            <p className="text-4xl font-bold">Rs {availableBalance.toLocaleString()}</p>
          </div>
        </div>
        {balanceDetails && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-75">Total Earnings</p>
              <p className="text-lg font-semibold">Rs {balanceDetails.totalEarnings?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Pending Withdrawals</p>
              <p className="text-lg font-semibold">Rs {balanceDetails.pendingWithdrawals?.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Withdrawal Amount (Rs) *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={availableBalance}
            required
            className="input-field"
            placeholder="Enter amount"
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum: Rs {availableBalance.toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bank Name *
          </label>
          <input
            type="text"
            value={accountDetails.bankName}
            onChange={(e) =>
              setAccountDetails({ ...accountDetails, bankName: e.target.value })
            }
            required
            className="input-field"
            placeholder="e.g., HBL, UBL, MCB"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            value={accountDetails.accountNumber}
            onChange={(e) =>
              setAccountDetails({ ...accountDetails, accountNumber: e.target.value })
            }
            required
            className="input-field"
            placeholder="Enter account number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Account Title *
          </label>
          <input
            type="text"
            value={accountDetails.accountTitle}
            onChange={(e) =>
              setAccountDetails({ ...accountDetails, accountTitle: e.target.value })
            }
            required
            className="input-field"
            placeholder="Account holder name"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Withdrawal requests are processed within 2-3 business
            days. A processing fee of 2% will be deducted from the withdrawal amount.
            <br />Minimum withdrawal: Rs 1,000
            <br />
            <br />
            <strong>Test Account Numbers (Sandbox Mode):</strong>
            <br />• <code>1234567890</code> - Always succeeds (instant)
            <br />• <code>9999999999</code> - Delayed processing (5 seconds)
            <br />• <code>0000000000</code> - Always fails (test error handling)
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !amount || parseFloat(amount) > availableBalance}
          className="w-full py-3 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-800 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Submit Withdrawal Request'
          )}
        </button>
      </form>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default Withdraw;

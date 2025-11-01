/**
 * Withdraw Earnings Page
 * Request withdrawal of earnings
 */
import { useState } from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';

function Withdraw() {
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountTitle: '',
  });

  const availableBalance = 125430;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Withdrawal request:', { amount, accountDetails });
    // TODO: Implement API call
  };

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
          <div>
            <p className="text-sm opacity-90">Available for Withdrawal</p>
            <p className="text-4xl font-bold">Rs {availableBalance.toLocaleString()}</p>
          </div>
        </div>
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
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-800 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
        >
          Submit Withdrawal Request
        </button>
      </form>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default Withdraw;

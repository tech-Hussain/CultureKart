/**
 * Wallet Page
 * View earnings balance and transaction history
 */
import { BanknotesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

function Wallet() {
  const balance = 125430;
  const pendingAmount = 8500;

  const transactions = [
    {
      id: 1,
      orderId: 'ORD-1004',
      amount: 12600,
      date: '2025-10-28',
      status: 'completed',
      type: 'sale',
    },
    {
      id: 2,
      orderId: 'ORD-1003',
      amount: 8500,
      date: '2025-10-30',
      status: 'pending',
      type: 'sale',
    },
    {
      id: 3,
      orderId: 'WD-1001',
      amount: -50000,
      date: '2025-10-25',
      status: 'completed',
      type: 'withdrawal',
    },
    {
      id: 4,
      orderId: 'ORD-1002',
      amount: 7000,
      date: '2025-10-24',
      status: 'completed',
      type: 'sale',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Wallet & Earnings</h1>
        <p className="text-gray-600 mt-1">Manage your earnings and payouts</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-12 h-12 opacity-90" />
            <ArrowTrendingUpIcon className="w-8 h-8 opacity-75" />
          </div>
          <p className="text-sm opacity-90 mb-2">Available Balance</p>
          <p className="text-4xl font-bold mb-4">Rs {balance.toLocaleString()}</p>
          <Link
            to="/artisan/withdraw"
            className="inline-block px-6 py-2 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Withdraw Funds
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-sm opacity-90 mb-2">Pending Clearance</p>
          <p className="text-4xl font-bold mb-4">Rs {pendingAmount.toLocaleString()}</p>
          <p className="text-sm opacity-90">Will be available in 2-3 business days</p>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Transaction History
        </h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {transaction.type === 'withdrawal' ? 'Withdrawal' : 'Order Payment'}
                </p>
                <p className="text-sm text-gray-600">{transaction.orderId}</p>
                <p className="text-xs text-gray-500">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-emerald-600' : 'text-gray-800'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}Rs {Math.abs(transaction.amount).toLocaleString()}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default Wallet;

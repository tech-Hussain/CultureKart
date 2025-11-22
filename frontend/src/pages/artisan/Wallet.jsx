/**
 * Wallet Page
 * View earnings balance and transaction history with real data
 */
import { useState, useEffect } from 'react';
import { BanknotesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getArtisanOrders } from '../../services/artisanService';
import { getAvailableBalance, getWithdrawals } from '../../services/withdrawalService';

function Wallet() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        
        // Fetch available balance
        const balanceResponse = await getAvailableBalance();
        const balanceData = balanceResponse.data?.data || balanceResponse.data;
        
        console.log('💰 Balance data:', balanceData);
        setBalance(balanceData.availableBalance || 0);
        setPendingAmount(balanceData.pendingBalance || 0); // Unreleased escrow

        // Fetch order transactions
        const ordersResponse = await getArtisanOrders({ limit: 10, status: 'delivered' });
        const orderTransactions = ordersResponse.data?.data?.orders?.map(order => ({
          id: order._id,
          orderId: order.orderNumber || order._id.slice(-8),
          amount: order.total || 0,
          date: order.createdAt,
          status: 'completed',
          type: 'sale'
        })) || [];

        // Fetch withdrawal transactions
        const withdrawalsResponse = await getWithdrawals({ limit: 10 });
        const withdrawalTransactions = withdrawalsResponse.data?.data?.withdrawals?.map(w => ({
          id: w._id,
          orderId: w._id.slice(-8),
          amount: -w.amount, // Negative for withdrawals
          date: w.createdAt,
          status: w.status,
          type: 'withdrawal'
        })) || [];

        // Combine and sort by date
        const allTransactions = [...orderTransactions, ...withdrawalTransactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);
        
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
      </div>
    );
  }

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
          {transactions.length > 0 ? transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {transaction.type === 'withdrawal' ? 'Withdrawal' : 'Order Payment'}
                </p>
                <p className="text-sm text-gray-600">Order #{transaction.orderId}</p>
                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
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
          )) : (
            <div className="text-center py-12 text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </div>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default Wallet;

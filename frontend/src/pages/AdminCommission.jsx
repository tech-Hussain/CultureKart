/**
 * Admin Commission Dashboard
 * Shows platform revenue, commissions, and pending payouts
 */

import { useState, useEffect } from 'react';
import api from '../api/api';

function AdminCommission() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (activeTab === 'summary') {
      fetchSummary();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'pending') {
      fetchPendingPayouts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dateFilter]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);

      const res = await api.get(`/admin/commission/summary?${params}`);
      if (res.data.success) {
        setSummary(res.data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/commission/transactions');
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayouts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payouts/pending');
      if (res.data.success) {
        setPendingPayouts(res.data.orders);
      }
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Commission Dashboard</h1>
          <p className="text-gray-600">Track revenue, commissions, and payouts</p>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={() => setDateFilter({ startDate: '', endDate: '' })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'summary'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Summary
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 Transactions
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⏳ Pending Payouts
              {pendingPayouts.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingPayouts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Summary Tab */}
        {!loading && activeTab === 'summary' && summary && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Total Revenue</h3>
                <span className="text-2xl">💵</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                Rs {summary.totalRevenue.amount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {summary.totalRevenue.orderCount} orders
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Platform Commission</h3>
                <span className="text-2xl">🏦</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                Rs {summary.platformCommission.total.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {summary.commissionRate} rate • {summary.platformCommission.transactionCount} transactions
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Escrow Held</h3>
                <span className="text-2xl">🔒</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">
                Rs {summary.escrowHeld.total.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {summary.escrowHeld.orderCount} pending deliveries
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Commission Rate</h3>
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-3xl font-bold text-teal-700">
                {summary.commissionRate}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                90% to artisan • 10% platform
              </p>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {!loading && activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artisan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      #{transaction.orderId.toString().slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.artisan?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Rs {transaction.orderTotal?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-700">
                      Rs {transaction.commissionAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No commission transactions yet
              </div>
            )}
          </div>
        )}

        {/* Pending Payouts Tab */}
        {!loading && activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingPayouts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending payouts at the moment</p>
              </div>
            ) : (
              pendingPayouts.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Artisan: {order.artisan?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {order.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        Rs {order.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">
                        Commission: Rs {order.platformCommission.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-700">
                        Artisan: Rs {order.artisanPayout.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-orange-50 border-l-4 border-orange-500 p-3">
                    <p className="text-sm text-orange-800">
                      ⏳ Awaiting delivery confirmation by artisan
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCommission;

/**
 * Admin Withdrawal Management Page
 * View and manage artisan withdrawal requests
 */

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  AlertCircle,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  getPendingWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getWithdrawalStats,
} from '../../services/adminWithdrawalService';

const AdminWithdrawalPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pending'); // 'pending' or 'all'
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  useEffect(() => {
    loadData();
  }, [view, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData] = await Promise.all([
        getWithdrawalStats(),
        getPendingWithdrawals(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (pendingData.success) setPendingWithdrawals(pendingData.data.withdrawals);

      if (view === 'all') {
        const filters = statusFilter ? { status: statusFilter } : {};
        const allData = await getAllWithdrawals(filters);
        if (allData.success) setAllWithdrawals(allData.data.withdrawals);
      }
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      Swal.fire('Error', 'Failed to load withdrawal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    const result = await Swal.fire({
      title: 'Approve Withdrawal?',
      text: 'This will approve the withdrawal request and initiate payout processing.',
      input: 'textarea',
      inputLabel: 'Admin Notes (optional)',
      inputPlaceholder: 'Add any notes about this approval...',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await approveWithdrawal(withdrawalId, result.value);
        if (response.success) {
          Swal.fire('Approved!', 'Withdrawal request has been approved.', 'success');
          loadData();
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to approve withdrawal', 'error');
      }
    }
  };

  const handleReject = async (withdrawalId) => {
    const result = await Swal.fire({
      title: 'Reject Withdrawal?',
      text: 'Please provide a reason for rejection.',
      input: 'textarea',
      inputLabel: 'Rejection Reason *',
      inputPlaceholder: 'Explain why this withdrawal is being rejected...',
      inputValidator: (value) => {
        if (!value) return 'You must provide a reason for rejection!';
      },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await rejectWithdrawal(withdrawalId, result.value);
        if (response.success) {
          Swal.fire('Rejected', 'Withdrawal request has been rejected.', 'info');
          loadData();
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to reject withdrawal', 'error');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      processing: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="text-gray-600 mt-2">Manage artisan withdrawal requests and escrow funds</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    Rs {(stats.pending?.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.pending?.count || 0} requests</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.approved?.count || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs {(stats.completed?.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.completed?.count || 0} withdrawals</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setView('pending')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  view === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Approvals ({pendingWithdrawals.length})
                </div>
              </button>
              <button
                onClick={() => setView('all')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  view === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  All Withdrawals
                </div>
              </button>
            </nav>
          </div>

          {/* Filter for All View */}
          {view === 'all' && (
            <div className="p-4 border-b border-gray-200">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          )}

          {/* Withdrawals List */}
          <div className="divide-y divide-gray-200">
            {(view === 'pending' ? pendingWithdrawals : allWithdrawals).length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No withdrawal requests found</p>
              </div>
            ) : (
              (view === 'pending' ? pendingWithdrawals : allWithdrawals).map((withdrawal) => (
                <div key={withdrawal._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {withdrawal.artisan?.businessName || 'Unknown Artisan'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                        {withdrawal.adminApproval && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(withdrawal.adminApproval.status)}`}>
                            Admin: {withdrawal.adminApproval.status}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-semibold text-gray-900">Rs {withdrawal.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Net Amount</p>
                          <p className="text-sm font-semibold text-green-600">Rs {withdrawal.netAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Requested</p>
                          <p className="text-sm text-gray-700">{formatDate(withdrawal.requestedAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bank</p>
                          <p className="text-sm text-gray-700">{withdrawal.bankDetails.bankName}</p>
                        </div>
                      </div>

                      {withdrawal.notes && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500">Artisan Notes:</p>
                          <p className="text-sm text-gray-700">{withdrawal.notes}</p>
                        </div>
                      )}

                      {withdrawal.adminApproval?.adminNotes && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <p className="text-xs text-blue-600 font-medium">Admin Notes:</p>
                          <p className="text-sm text-blue-900">{withdrawal.adminApproval.adminNotes}</p>
                        </div>
                      )}

                      {withdrawal.adminApproval?.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                          <p className="text-xs text-red-600 font-medium">Rejection Reason:</p>
                          <p className="text-sm text-red-900">{withdrawal.adminApproval.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {withdrawal.adminApproval?.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(withdrawal._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(withdrawal._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawalPage;

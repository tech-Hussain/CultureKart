import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  getWithdrawals,
  getWithdrawalSummary,
  approveWithdrawal,
  rejectWithdrawal,
} from '../../services/adminService';
import Swal from 'sweetalert2';

/**
 * Payout Management Page
 * Manage artisan withdrawal requests and platform commissions
 */
const PayoutManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    pending: 0,
    totalCommission: 0,
    approvedToday: 0,
    completed: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchWithdrawals();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, pagination.page]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchTerm || undefined,
      };

      const response = await getWithdrawals(params);
      const data = response.data;

      setWithdrawalRequests(data.data?.withdrawals || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch withdrawal requests',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getWithdrawalSummary();
      setSummary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchWithdrawals();
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: 'Approve Withdrawal?',
      text: 'This will process the payout to the artisan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<span style="color: white;">Yes, approve!</span>',
      cancelButtonText: '<span style="color: white;">Cancel</span>',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      try {
        await approveWithdrawal(id);
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Withdrawal has been approved and is being processed.',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchWithdrawals();
        fetchSummary();
      } catch (error) {
        console.error('Failed to approve withdrawal:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to approve withdrawal. Please try again.',
        });
      }
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: 'Reject Withdrawal?',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter the reason for rejection...',
      inputAttributes: {
        'aria-label': 'Enter rejection reason',
      },
      showCancelButton: true,
      confirmButtonText: '<span style="color: white;">Reject</span>',
      cancelButtonText: '<span style="color: white;">Cancel</span>',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a reason for rejection';
        }
      },
    });

    if (result.isConfirmed && result.value) {
      try {
        await rejectWithdrawal(id, result.value);
        Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Withdrawal has been rejected.',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchWithdrawals();
        fetchSummary();
      } catch (error) {
        console.error('Failed to reject withdrawal:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to reject withdrawal. Please try again.',
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-blue-100 text-blue-700 border-blue-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      hold: 'bg-orange-100 text-orange-700 border-orange-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payout Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage artisan withdrawals and platform commissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{summary.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Commission</p>
          <p className="text-3xl font-bold text-green-600 mt-2">Rs. {summary.totalCommission?.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Approved Today</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{summary.approvedToday}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{summary.completed}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by artisan name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Withdrawal Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading withdrawals...</p>
          </div>
        ) : withdrawalRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No withdrawal requests found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Artisan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Commission (10%)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Net Payout</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawalRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {request.artisan?.displayName || 'Unknown Artisan'}
                      </p>
                      <p className="text-xs text-gray-600">ID: {request.artisan?._id?.toString().slice(-6)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {request.bankDetails?.bankName} - {request.bankDetails?.accountNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">Rs. {request.amount?.toFixed(0)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-red-600">Rs. {request.processingFee?.toFixed(0)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-green-600">Rs. {request.netAmount?.toFixed(0)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">
                      {new Date(request.requestedAt || request.createdAt).toLocaleDateString()}
                    </p>
                    {request.completedAt && (
                      <p className="text-xs text-gray-600">
                        Completed: {new Date(request.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                  <td className="px-6 py-4">
                    {request.status === 'pending' && (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {request.status === 'processing' && (
                      <div className="flex items-center justify-end">
                        <ClockIcon className="w-5 h-5 text-blue-600 animate-pulse" title="Processing" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total requests)
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Commission Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
          <span>Platform Commission Breakdown</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">Total Earned</p>
            <p className="text-2xl font-bold text-green-700 mt-1">Rs. {summary.totalCommission?.toFixed(0) || 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">Pending Commission</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              Rs. {(summary.stats?.pending?.commission || 0).toFixed(0)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">Commission Rate</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">2%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutManagement;

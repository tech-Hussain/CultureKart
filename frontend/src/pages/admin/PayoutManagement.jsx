import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

/**
 * Payout Management Page
 * Manage artisan withdrawal requests and platform commissions
 */
const PayoutManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const withdrawalRequests = [
    {
      id: 1,
      artisanName: 'Ahmed Khan',
      artisanId: 101,
      amount: 12500,
      commission: 1250,
      netAmount: 11250,
      requestDate: '2024-06-26',
      status: 'pending',
      bankDetails: 'Bank: HBL - Account: 1234567890',
    },
    {
      id: 2,
      artisanName: 'Ali Hassan',
      artisanId: 102,
      amount: 18900,
      commission: 1890,
      netAmount: 17010,
      requestDate: '2024-06-25',
      status: 'approved',
      approvedDate: '2024-06-26',
      bankDetails: 'Bank: UBL - Account: 0987654321',
    },
    {
      id: 3,
      artisanName: 'Fatima Bibi',
      artisanId: 103,
      amount: 8900,
      commission: 890,
      netAmount: 8010,
      requestDate: '2024-06-24',
      status: 'completed',
      approvedDate: '2024-06-25',
      completedDate: '2024-06-26',
      bankDetails: 'Bank: MCB - Account: 5555666677',
    },
  ];

  const filteredRequests = withdrawalRequests.filter((req) => {
    const matchesSearch =
      req.artisanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.artisanId.toString().includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPending = withdrawalRequests.filter((r) => r.status === 'pending').length;
  const totalCommission = withdrawalRequests.reduce((sum, req) => sum + req.commission, 0);

  const handleApprove = (id) => {
    console.log('Approve withdrawal:', id);
  };

  const handleReject = (id) => {
    console.log('Reject withdrawal:', id);
  };

  const handleHold = (id) => {
    console.log('Hold withdrawal:', id);
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
          <p className="text-3xl font-bold text-yellow-600 mt-2">{totalPending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Commission</p>
          <p className="text-3xl font-bold text-green-600 mt-2">Rs. {totalCommission}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Approved Today</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {withdrawalRequests.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {withdrawalRequests.filter((r) => r.status === 'completed').length}
          </p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{request.artisanName}</p>
                      <p className="text-xs text-gray-600">ID: {request.artisanId}</p>
                      <p className="text-xs text-gray-500 mt-1">{request.bankDetails}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">Rs. {request.amount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-red-600">Rs. {request.commission}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-green-600">Rs. {request.netAmount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{request.requestDate}</p>
                    {request.approvedDate && (
                      <p className="text-xs text-gray-600">Approved: {request.approvedDate}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                  <td className="px-6 py-4">
                    {request.status === 'pending' && (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleHold(request.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Hold"
                        >
                          <ClockIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            <p className="text-2xl font-bold text-green-700 mt-1">Rs. {totalCommission}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">Pending Commission</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              Rs. {withdrawalRequests.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.commission, 0)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">Commission Rate</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">10%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutManagement;

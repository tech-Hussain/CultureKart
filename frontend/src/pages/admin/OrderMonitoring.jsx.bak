import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * Order Monitoring Page
 * Track all orders, disputes, and fraud alerts
 * Manual resolution tools for admin
 */
const OrderMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Sample orders data
  const orders = [
    {
      id: 15672,
      buyerName: 'Fatima Bibi',
      artisanName: 'Ahmed Khan',
      product: 'Hand-Embroidered Shawl',
      amount: 4500,
      status: 'delivered',
      orderDate: '2024-06-20',
      hasDispute: false,
      fraudAlert: false,
      timeline: [
        { step: 'Order Placed', date: '2024-06-20 10:30 AM', completed: true },
        { step: 'Payment Confirmed', date: '2024-06-20 10:32 AM', completed: true },
        { step: 'Packed', date: '2024-06-21 02:15 PM', completed: true },
        { step: 'Shipped', date: '2024-06-22 09:00 AM', completed: true },
        { step: 'Delivered', date: '2024-06-25 04:30 PM', completed: true },
      ],
    },
    {
      id: 15671,
      buyerName: 'Zainab Malik',
      artisanName: 'Ali Hassan',
      product: 'Ceramic Vase Set',
      amount: 3200,
      status: 'shipped',
      orderDate: '2024-06-23',
      hasDispute: false,
      fraudAlert: false,
      timeline: [
        { step: 'Order Placed', date: '2024-06-23 11:20 AM', completed: true },
        { step: 'Payment Confirmed', date: '2024-06-23 11:22 AM', completed: true },
        { step: 'Packed', date: '2024-06-24 03:00 PM', completed: true },
        { step: 'Shipped', date: '2024-06-25 10:30 AM', completed: true },
        { step: 'Delivered', date: '', completed: false },
      ],
    },
    {
      id: 15670,
      buyerName: 'Mohammad Ali',
      artisanName: 'Fatima Bibi',
      product: 'Silver Necklace',
      amount: 8900,
      status: 'dispute',
      orderDate: '2024-06-21',
      hasDispute: true,
      fraudAlert: false,
      disputeReason: 'Product quality issue - stones missing',
      timeline: [
        { step: 'Order Placed', date: '2024-06-21 02:00 PM', completed: true },
        { step: 'Payment Confirmed', date: '2024-06-21 02:02 PM', completed: true },
        { step: 'Packed', date: '2024-06-22 11:00 AM', completed: true },
        { step: 'Shipped', date: '2024-06-23 09:15 AM', completed: true },
        { step: 'Delivered', date: '2024-06-26 05:00 PM', completed: true },
        { step: 'Dispute Raised', date: '2024-06-27 10:30 AM', completed: true },
      ],
    },
    {
      id: 15669,
      buyerName: 'Suspicious User',
      artisanName: 'Mohammad Raza',
      product: 'Traditional Wall Art',
      amount: 6700,
      status: 'pending',
      orderDate: '2024-06-26',
      hasDispute: false,
      fraudAlert: true,
      fraudReason: 'Multiple failed payment attempts, unusual shipping address',
      timeline: [
        { step: 'Order Placed', date: '2024-06-26 08:00 PM', completed: true },
        { step: 'Payment Confirmed', date: '', completed: false },
      ],
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.artisanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'disputes' && order.hasDispute) ||
      (filterStatus === 'fraud' && order.fraudAlert) ||
      order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleResolveDispute = (orderId) => {
    console.log('Resolve dispute for order:', orderId);
    // Implement dispute resolution
  };

  const handleClearFraud = (orderId) => {
    console.log('Clear fraud alert for order:', orderId);
    // Implement fraud clearance
  };

  const getStatusBadge = (status, hasDispute, fraudAlert) => {
    if (fraudAlert) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-300">Fraud Alert</span>;
    }
    if (hasDispute) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-300">Dispute</span>;
    }

    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      packed: 'bg-blue-100 text-blue-700 border-blue-300',
      shipped: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      delivered: 'bg-green-100 text-green-700 border-green-300',
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
        <h1 className="text-2xl font-bold text-gray-800">Order Monitoring</h1>
        <p className="text-sm text-gray-600 mt-1">Track orders, disputes, and fraud alerts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Active Disputes</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {orders.filter((o) => o.hasDispute).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Fraud Alerts</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {orders.filter((o) => o.fraudAlert).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Delivered</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {orders.filter((o) => o.status === 'delivered').length}
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
              placeholder="Search by order ID, buyer, artisan, or product..."
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
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="disputes">Disputes Only</option>
            <option value="fraud">Fraud Alerts</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${
              order.fraudAlert ? 'border-red-300' : order.hasDispute ? 'border-orange-300' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                  {getStatusBadge(order.status, order.hasDispute, order.fraudAlert)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Buyer</p>
                    <p className="text-sm font-medium text-gray-800">{order.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Artisan</p>
                    <p className="text-sm font-medium text-gray-800">{order.artisanName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Product</p>
                    <p className="text-sm font-medium text-gray-800">{order.product}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="text-sm font-bold text-green-600">Rs. {order.amount}</p>
                  </div>
                </div>

                {order.hasDispute && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-800">Dispute Raised</p>
                        <p className="text-xs text-orange-700 mt-1">{order.disputeReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {order.fraudAlert && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Fraud Alert</p>
                        <p className="text-xs text-red-700 mt-1">{order.fraudReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>Order Date: {order.orderDate}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleViewDetails(order)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>View Details</span>
                </button>

                {order.hasDispute && (
                  <button
                    onClick={() => handleResolveDispute(order.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                )}

                {order.fraudAlert && (
                  <button
                    onClick={() => handleClearFraud(order.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Clear Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Order #{selectedOrder.id} Timeline</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Order Timeline */}
              <div className="space-y-4">
                {selectedOrder.timeline.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {step.completed ? (
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      ) : (
                        <ClockIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                        {step.step}
                      </p>
                      {step.date && (
                        <p className="text-sm text-gray-600 mt-1">{step.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {selectedOrder.hasDispute && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleResolveDispute(selectedOrder.id)}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Mark Dispute as Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderMonitoring;

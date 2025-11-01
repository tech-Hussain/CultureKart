/**
 * Orders Management Page
 * View and manage incoming orders
 */
import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PrinterIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

function Orders() {
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample orders data
  const orders = [
    {
      id: 'ORD-1001',
      customer: 'Ahmed Khan',
      email: 'ahmed@example.com',
      product: 'Traditional Kashmiri Carpet',
      quantity: 1,
      amount: 25000,
      status: 'pending',
      date: '2025-11-02',
      address: '123 Main Street, Lahore, Pakistan',
    },
    {
      id: 'ORD-1002',
      customer: 'Fatima Ali',
      email: 'fatima@example.com',
      product: 'Handmade Ceramic Vase',
      quantity: 2,
      amount: 7000,
      status: 'packed',
      date: '2025-11-01',
      address: '456 Park Road, Karachi, Pakistan',
    },
    {
      id: 'ORD-1003',
      customer: 'Hassan Raza',
      email: 'hassan@example.com',
      product: 'Embroidered Pashmina Shawl',
      quantity: 1,
      amount: 8500,
      status: 'shipped',
      date: '2025-10-30',
      address: '789 Garden Avenue, Islamabad, Pakistan',
    },
    {
      id: 'ORD-1004',
      customer: 'Ayesha Malik',
      email: 'ayesha@example.com',
      product: 'Walnut Wood Carved Box',
      quantity: 3,
      amount: 12600,
      status: 'delivered',
      date: '2025-10-28',
      address: '321 Valley Street, Multan, Pakistan',
    },
  ];

  const statuses = ['all', 'pending', 'packed', 'shipped', 'delivered'];

  const filteredOrders = orders.filter(
    (order) => filterStatus === 'all' || order.status === filterStatus
  );

  const handleUpdateStatus = (orderId, newStatus) => {
    console.log(`Update order ${orderId} to ${newStatus}`);
    // TODO: Implement API call
  };

  const handlePrintInvoice = (orderId) => {
    console.log(`Print invoice for order ${orderId}`);
    // TODO: Implement print functionality
  };

  const handleMessageBuyer = (orderEmail) => {
    console.log(`Message buyer at ${orderEmail}`);
    // TODO: Implement messaging functionality
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      packed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600 mt-1">View and manage all incoming orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {orders.filter((o) => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">
            {orders.filter((o) => o.status === 'shipped').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-emerald-600">
            {orders.filter((o) => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status
                  ? 'bg-maroon-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Order #{order.id}
                </h3>
                <p className="text-sm text-gray-600">{order.date}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold text-gray-800">{order.customer}</p>
                <p className="text-sm text-gray-600">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-semibold text-gray-800">{order.product}</p>
                <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shipping Address</p>
                <p className="text-sm text-gray-800">{order.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-maroon-600">
                  Rs {order.amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              {order.status !== 'delivered' && (
                <select
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Update Status
                  </option>
                  {statuses.slice(1).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => handlePrintInvoice(order.id)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Invoice
              </button>
              <button
                onClick={() => handleMessageBuyer(order.email)}
                className="flex items-center gap-2 px-4 py-2 bg-maroon-100 text-maroon-700 rounded-lg hover:bg-maroon-200 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Message Buyer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default Orders;

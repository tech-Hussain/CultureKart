/**
 * Orders Management Page
 * View and manage incoming orders
 */
import { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  PrinterIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

// Import artisan services
import {
  getArtisanOrders,
  updateOrderStatus,
  getOrderStats,
  formatCurrency,
  formatDate,
  getStatusColor,
} from '../../services/artisanService';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const statuses = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  // Fetch orders with current filters
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 10,
        status: filterStatus,
        search: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await getArtisanOrders(params);
      setOrders(response.data.data.orders || []);
      setPagination(response.data.data.pagination);

    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm]);

  // Fetch order statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await getOrderStats();
      setStats(response.data.data || {});
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      setError('');

      await updateOrderStatus(orderId, newStatus);

      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // Refresh stats
      fetchStats();

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `Order has been marked as ${newStatus}`,
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      console.error('Update status error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      
      // Show error popup
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMessage,
        confirmButtonColor: '#8B1538'
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handlePrintInvoice = (orderId) => {
    // TODO: Implement print functionality
    console.log(`Print invoice for order ${orderId}`);
  };

  const handleMessageBuyer = (customerEmail) => {
    // TODO: Implement messaging functionality
    window.open(`mailto:${customerEmail}?subject=Regarding your order`);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600 mt-1">View and manage all incoming orders</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats?.total || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {stats?.pending || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">
            {stats?.shipped || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-emerald-600">
            {stats?.delivered || 0}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, customer, or product..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.orderNumber || order._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold text-gray-800">{order.buyer?.name || order.shippingAddress?.fullName || 'Unknown Customer'}</p>
                  <p className="text-sm text-gray-600">{order.buyer?.email || 'No email'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  {order.items?.map((item, index) => (
                    <div key={index} className="mb-2">
                      <p className="font-semibold text-gray-800">{item.product?.title || item.title || 'Product'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.qty || item.quantity || 0}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shipping Address</p>
                  <p className="text-sm text-gray-800">
                    {order.shippingAddress ? (
                      <>
                        {order.shippingAddress.fullName && <>{order.shippingAddress.fullName}<br /></>}
                        {order.shippingAddress.phone && <>{order.shippingAddress.phone}<br /></>}
                        {order.shippingAddress.address && <>{order.shippingAddress.address}<br /></>}
                        {order.shippingAddress.city && order.shippingAddress.postalCode && 
                          <>{order.shippingAddress.city}, {order.shippingAddress.postalCode}<br /></>
                        }
                        {order.shippingAddress.state && <>{order.shippingAddress.state}<br /></>}
                        {order.shippingAddress.country || 'Pakistan'}
                      </>
                    ) : 'No shipping address'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-maroon-600">
                    {formatCurrency(order.total || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleUpdateStatus(order._id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-4 py-2 border-2 border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 bg-white text-gray-700 font-medium hover:border-maroon-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      defaultValue=""
                      disabled={updatingOrder === order._id}
                    >
                      <option value="" disabled>
                        {updatingOrder === order._id ? '⏳ Updating...' : '📝 Update Status'}
                      </option>
                      {statuses.slice(1).filter(status => status !== order.status && status !== 'cancelled').map((status) => (
                        <option key={status} value={status}>
                          {status === 'confirmed' && '✅ Confirm Order'}
                          {status === 'processing' && '⚙️ Mark as Processing'}
                          {status === 'packed' && '📦 Mark as Packed'}
                          {status === 'shipped' && '🚚 Mark as Shipped'}
                          {status === 'delivered' && '✓ Mark as Delivered'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={() => handlePrintInvoice(order._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium shadow-sm"
                >
                  <PrinterIcon className="w-5 h-5" />
                  Print Invoice
                </button>
                <button
                  onClick={() => handleMessageBuyer(order.user?.email)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-maroon-50 to-maroon-100 text-maroon-700 border border-maroon-200 rounded-lg hover:from-maroon-100 hover:to-maroon-200 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!order.user?.email}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Message Buyer
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.current} of {pagination.total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.current + 1)}
                    disabled={pagination.current >= pagination.total}
                    className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'No orders match your current filters.'
              : 'You haven\'t received any orders yet.'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default Orders;

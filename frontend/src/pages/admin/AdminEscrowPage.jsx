import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Package,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import adminEscrowService from '../../services/adminEscrowService';
import './AdminEscrowPage.css';

const AdminEscrowPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [releasedOrders, setReleasedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData] = await Promise.all([
        adminEscrowService.getEscrowStats(),
      ]);
      setStats(statsData);

      if (activeTab === 'pending') {
        const pendingData = await adminEscrowService.getPendingEscrow(currentPage, itemsPerPage);
        console.log('📦 Pending escrow data:', pendingData);
        console.log('📦 First order items:', pendingData.data?.orders?.[0]?.items);
        console.log('📦 First order artisan:', pendingData.data?.orders?.[0]?.items?.[0]?.artisan);
        setPendingOrders(pendingData.data?.orders || []);
        setTotalPages(pendingData.data?.pagination?.pages || 1);
      } else {
        const releasedData = await adminEscrowService.getReleasedEscrow(currentPage, itemsPerPage);
        console.log('✅ Released escrow data:', releasedData);
        setReleasedOrders(releasedData.data?.orders || []);
        setTotalPages(releasedData.data?.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error loading escrow data:', error);
      Swal.fire('Error', 'Failed to load escrow data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (orderId, orderNumber) => {
    const { value: notes } = await Swal.fire({
      title: `Release Escrow for Order ${orderNumber}`,
      input: 'textarea',
      inputLabel: 'Admin Notes (Optional)',
      inputPlaceholder: 'Enter any notes about this release...',
      showCancelButton: true,
      confirmButtonText: 'Release Escrow',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      buttonsStyling: true,
      inputValidator: (value) => {
        if (value && value.length > 500) {
          return 'Notes must be less than 500 characters';
        }
      }
    });

    if (notes !== undefined) {
      try {
        await adminEscrowService.releaseEscrow(orderId, notes);
        Swal.fire('Success', 'Escrow funds released successfully', 'success');
        setSelectedOrders([]);
        loadData();
      } catch (error) {
        console.error('Error releasing escrow:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to release escrow', 'error');
      }
    }
  };

  const handleBulkRelease = async () => {
    if (selectedOrders.length === 0) {
      Swal.fire('Warning', 'Please select at least one order', 'warning');
      return;
    }

    const { value: notes } = await Swal.fire({
      title: `Release Escrow for ${selectedOrders.length} Orders`,
      input: 'textarea',
      inputLabel: 'Admin Notes (Optional)',
      inputPlaceholder: 'Enter notes for bulk release...',
      showCancelButton: true,
      confirmButtonText: 'Release All',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      buttonsStyling: true,
      inputValidator: (value) => {
        if (value && value.length > 500) {
          return 'Notes must be less than 500 characters';
        }
      }
    });

    if (notes !== undefined) {
      try {
        const result = await adminEscrowService.bulkReleaseEscrow(selectedOrders, notes);
        
        let message = `Successfully released ${result.successful?.length || 0} orders`;
        if (result.failed?.length > 0) {
          message += `\nFailed: ${result.failed.length} orders`;
        }
        
        Swal.fire('Bulk Release Complete', message, 
          result.failed?.length > 0 ? 'warning' : 'success'
        );
        
        setSelectedOrders([]);
        loadData();
      } catch (error) {
        console.error('Error bulk releasing escrow:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to bulk release escrow', 'error');
      }
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === pendingOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(pendingOrders.map(order => order._id));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderNumber = (order) => {
    return order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Escrow Management</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending Escrow</p>
              <p className="text-2xl font-bold text-yellow-800 mt-2">
                {formatCurrency(stats?.pendingAmount || 0)}
              </p>
              <p className="text-yellow-600 text-xs mt-1">
                {stats?.pendingCount || 0} orders
              </p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Released Escrow</p>
              <p className="text-2xl font-bold text-green-800 mt-2">
                {formatCurrency(stats?.releasedAmount || 0)}
              </p>
              <p className="text-green-600 text-xs mt-1">
                {stats?.releasedCount || 0} orders
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-blue-800 mt-2">
                {(stats?.pendingCount || 0) + (stats?.releasedCount || 0)}
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Awaiting release
              </p>
            </div>
            <Package className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold text-purple-800 mt-2">
                {formatCurrency((stats?.pendingAmount || 0) + (stats?.releasedAmount || 0))}
              </p>
              <p className="text-purple-600 text-xs mt-1">
                All escrow funds
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
              setSelectedOrders([]);
            }}
            className={`px-6 py-4 font-medium ${
              activeTab === 'pending'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Release ({stats?.pendingCount || 0})
          </button>
          <button
            onClick={() => {
              setActiveTab('released');
              setCurrentPage(1);
              setSelectedOrders([]);
            }}
            className={`px-6 py-4 font-medium ${
              activeTab === 'released'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Released History ({stats?.releasedCount || 0})
          </button>
        </div>

        {/* Bulk Actions */}
        {activeTab === 'pending' && pendingOrders.length > 0 && (
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedOrders.length === pendingOrders.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">
                Select All ({selectedOrders.length} selected)
              </span>
            </label>
            {selectedOrders.length > 0 && (
              <button
                onClick={handleBulkRelease}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Release Selected ({selectedOrders.length})
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : activeTab === 'pending' ? (
            pendingOrders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending escrow orders</p>
                <p className="text-gray-400 text-sm mt-2">All delivered orders have been released</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          className="mt-1 w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-800">
                              Order {getOrderNumber(order)}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Buyer:</span> {order.buyer?.name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Artisan:</span> {order.items?.[0]?.artisan?.displayName || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Delivered:</span> {order.shippingDetails?.deliveredAt ? formatDate(order.shippingDetails.deliveredAt) : 'Not yet delivered'}
                            </div>
                            <div>
                              <span className="font-medium">Escrow Amount:</span>{' '}
                              <span className="text-green-600 font-semibold">
                                {formatCurrency(order.paymentDistribution?.artisanPayout?.amount || 0)}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Order ID: {order._id}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReleaseEscrow(order._id, getOrderNumber(order))}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm font-medium whitespace-nowrap shadow-sm"
                      >
                        Release Escrow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            releasedOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No released escrow history</p>
                <p className="text-gray-400 text-sm mt-2">Released orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {releasedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800">
                            Order {getOrderNumber(order)}
                          </h3>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Buyer:</span> {order.buyer?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Artisan:</span> {order.items?.[0]?.artisan?.displayName || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Released:</span>{' '}
                            {formatDate(order.paymentDistribution?.escrowReleasedAt)}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span>{' '}
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(order.paymentDistribution?.artisanPayout?.amount || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Released by:</span>{' '}
                          {order.paymentDistribution?.escrowReleasedBy?.name || 'Admin'}
                        </div>

                        {order.paymentDistribution?.escrowReleaseNotes && (
                          <div className="mt-2 p-2 bg-white border-l-4 border-green-500 rounded">
                            <p className="text-xs text-gray-500 mb-1">Admin Notes:</p>
                            <p className="text-sm text-gray-700">
                              {order.paymentDistribution.escrowReleaseNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEscrowPage;

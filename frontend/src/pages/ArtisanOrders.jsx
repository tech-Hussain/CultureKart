/**
 * Artisan Orders Page - Delivery Management
 * Allows artisans to view orders and confirm deliveries
 */

import { useState, useEffect } from 'react';
import api from '../api/api';

function ArtisanOrders() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'pending' ? '/delivery/pending' : '/delivery/completed';
      const res = await api.get(endpoint);
      
      if (res.data.success) {
        if (activeTab === 'pending') {
          setPendingOrders(res.data.orders);
        } else {
          setCompletedOrders(res.data.orders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const confirmDelivery = async (orderId) => {
    if (!confirm('Are you sure you want to confirm this delivery? This action will distribute payment and cannot be undone.')) {
      return;
    }

    setConfirmingOrderId(orderId);
    try {
      const res = await api.post(`/delivery/confirm/${orderId}`);
      
      if (res.data.success) {
        alert(`✅ Delivery confirmed!\n\nYour payout: Rs ${res.data.payment.artisanPayout.toLocaleString()}\nBuyer has been notified via email.`);
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert(error.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Manage your orders and confirm deliveries</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Pending Delivery
              {pendingOrders.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'completed'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✅ Completed
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Pending Orders */}
        {!loading && activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending deliveries</h3>
                <p className="text-gray-600">All your orders have been delivered!</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-700">
                        Rs {order.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Your payout: Rs {Math.round(order.total * 0.9).toLocaleString()} (90%)
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-semibold">{order.buyer.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold">{order.buyer.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.fullName}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                      {order.shippingAddress.country}<br />
                      📞 {order.shippingAddress.phone}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">•</span>
                          <span className="flex-1">{item.product?.title || 'Product'}</span>
                          <span className="text-gray-600">Qty: {item.qty}</span>
                          <span className="font-semibold">Rs {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Delivery Button */}
                  <button
                    onClick={() => confirmDelivery(order.id)}
                    disabled={confirmingOrderId === order.id}
                    className="w-full bg-teal-700 border-2 border-teal-800 text-white font-semibold py-3 rounded-lg hover:bg-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirmingOrderId === order.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Confirming...
                      </span>
                    ) : (
                      '✅ Confirm Delivery & Receive Payment'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    ⚠️ Click only after customer has received the product. Buyer will be notified via email.
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Completed Orders */}
        {!loading && activeTab === 'completed' && (
          <div className="space-y-4">
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed deliveries yet</h3>
                <p className="text-gray-600">Confirmed deliveries will appear here</p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-700">
                        Rs {order.payoutAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Your payout</div>
                      {order.payoutPaid && (
                        <div className="text-xs text-green-600 font-semibold mt-1">
                          ✓ Paid
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                    <span>✅</span>
                    <span>Delivery confirmed on {new Date(order.confirmedAt).toLocaleDateString()}</span>
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

export default ArtisanOrders;

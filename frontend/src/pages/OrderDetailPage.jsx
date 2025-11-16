/**
 * Order Detail Page
 * Displays detailed information about a specific order
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar,
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import api from '../api/api';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('📦 [OrderDetail] Loading order:', id);
      const response = await api.get(`/orders/${id}`);
      console.log('✅ [OrderDetail] Order loaded successfully');
      console.log('📊 [OrderDetail] Order data:', response.data.order);
      console.log('🔢 [OrderDetail] Auth codes count:', response.data.order.authenticationCodes?.length || 0);
      console.log('📋 [OrderDetail] Auth codes:', response.data.order.authenticationCodes);
      setOrder(response.data.order);
    } catch (error) {
      console.error('❌ [OrderDetail] Error loading order:', error);
      console.error('❌ [OrderDetail] Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      refunded: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5" />,
      confirmed: <CheckCircle className="w-5 h-5" />,
      processing: <Package className="w-5 h-5" />,
      shipped: <Truck className="w-5 h-5" />,
      delivered: <CheckCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />,
      refunded: <XCircle className="w-5 h-5" />
    };
    return icons[status] || <Package className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order ID: #{order._id.slice(-8).toUpperCase()}</p>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium capitalize">{order.status}</span>
            </div>
          </div>
        </div>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-lg">Rs {order.total?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="font-medium">{order.currency || 'PKR'}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">{order.paymentInfo?.method || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className={`font-medium capitalize ${
                  order.paymentInfo?.status === 'completed' ? 'text-green-600' : 
                  order.paymentInfo?.status === 'failed' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {order.paymentInfo?.status || 'Pending'}
                </p>
              </div>
              {order.paymentInfo?.transactionId && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium text-xs">{order.paymentInfo.transactionId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{order.shippingAddress?.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress?.phone}</p>
            <p className="text-gray-600">{order.shippingAddress?.address}</p>
            <p className="text-gray-600">
              {order.shippingAddress?.city}
              {order.shippingAddress?.postalCode && ` - ${order.shippingAddress.postalCode}`}
            </p>
            <p className="text-gray-600">{order.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          </div>
          
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.title || 'Product'}</h4>
                  <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                  <p className="text-sm text-gray-600">Price: Rs {item.price?.toLocaleString()} each</p>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-lg text-gray-900">
                    Rs {(item.price * item.qty)?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs {(order.total - 150 - (order.total - 150) * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span>Rs 150</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>Rs {((order.total - 150) * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>Rs {order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Details (if available) */}
        {order.shippingDetails && (order.shippingDetails.trackingNumber || order.shippingDetails.carrier) && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Shipping Details</h2>
            </div>
            <div className="space-y-3">
              {order.shippingDetails.carrier && (
                <div>
                  <p className="text-sm text-gray-600">Carrier</p>
                  <p className="font-medium">{order.shippingDetails.carrier}</p>
                </div>
              )}
              {order.shippingDetails.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-medium">{order.shippingDetails.trackingNumber}</p>
                </div>
              )}
              {order.shippingDetails.shippedAt && (
                <div>
                  <p className="text-sm text-gray-600">Shipped Date</p>
                  <p className="font-medium">{new Date(order.shippingDetails.shippedAt).toLocaleDateString()}</p>
                </div>
              )}
              {order.shippingDetails.deliveredAt && (
                <div>
                  <p className="text-sm text-gray-600">Delivered Date</p>
                  <p className="font-medium">{new Date(order.shippingDetails.deliveredAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Authentication QR Codes */}
        {(() => {
          console.log('🔍 [OrderDetail] Checking auth codes...');
          console.log('🔍 [OrderDetail] order.authenticationCodes:', order.authenticationCodes);
          console.log('🔍 [OrderDetail] Array?', Array.isArray(order.authenticationCodes));
          console.log('🔍 [OrderDetail] Length:', order.authenticationCodes?.length);
          return null;
        })()}
        {order.authenticationCodes && order.authenticationCodes.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 mt-6 border-2 border-green-200">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Product Authenticity Verification</h2>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4 border border-green-300">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-green-700">🛡️ Anti-Counterfeiting Protection:</strong> Each product in this order has a unique QR code for authenticity verification.
              </p>
              <p className="text-sm text-gray-600">
                The same QR code will be <strong>printed on your product package</strong> during delivery. Scan it to ensure you receive the genuine CultureKart product.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {order.authenticationCodes.map((authCode, index) => {
                console.log(`🎫 [OrderDetail] Rendering QR code ${index + 1}:`, authCode);
                const item = order.items?.find(i => i.product?._id === authCode.productId || i.product === authCode.productId);
                console.log(`🎫 [OrderDetail] Found item for QR ${index + 1}:`, item);
                return (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 border-2 border-green-200">
                    {/* Product Info */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{item?.title || 'Product'}</h4>
                      <p className="text-xs text-gray-600">Authenticity Certificate</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white rounded-lg p-3 mb-3 flex items-center justify-center border-2 border-dashed border-gray-300">
                      {authCode.qrCodeUrl ? (
                        <img 
                          src={authCode.qrCodeUrl} 
                          alt="Authenticity QR Code" 
                          className="w-48 h-48 object-contain"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                          <p className="text-gray-400 text-xs text-center">QR Code<br/>Generating...</p>
                        </div>
                      )}
                    </div>

                    {/* Verification Code */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-600 mb-1 font-semibold">Verification Code:</p>
                      <p className="text-xs font-mono text-gray-800 break-all">{authCode.publicCode}</p>
                    </div>

                    {/* Verify Button */}
                    {authCode.verificationUrl && (
                      <a
                        href={authCode.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✓ Verify Authenticity
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Important Notice */}
            <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h3 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                <span>⚠️</span> Important Security Notice
              </h3>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• The QR code on this page is for your reference only</li>
                <li>• The <strong>SAME QR code will be printed on your product packaging</strong></li>
                <li>• Upon delivery, scan the package QR code to verify authenticity</li>
                <li>• If the codes don't match, <strong>DO NOT accept the delivery</strong></li>
                <li>• Each QR code is unique and cannot be replicated by counterfeiters</li>
                <li>• Report any discrepancies immediately to support@culturekart.com</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;

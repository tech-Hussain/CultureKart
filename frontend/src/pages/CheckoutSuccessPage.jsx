/**
 * Checkout Success Page
 * Displayed after successful Stripe payment
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import api from '../api/api';

function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setError('Invalid session');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await api.get(`/stripe/session/${sessionId}`);
      
      if (response.data.success) {
        setOrderDetails(response.data.session);
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your order has been placed successfully</p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-maroon-600" />
                Order Information
              </h2>

              {orderDetails && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-semibold text-gray-900">
                      #{orderDetails.metadata?.orderId?.substring(orderDetails.metadata.orderId.length - 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-semibold text-green-600 capitalize">
                      {orderDetails.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold text-gray-900">
                      {orderDetails.customerEmail}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-xl font-bold text-maroon-600">
                      {new Intl.NumberFormat('en-PK', {
                        style: 'currency',
                        currency: orderDetails.currency?.toUpperCase() || 'PKR',
                        minimumFractionDigits: 0
                      }).format((orderDetails.amountTotal || 0) / 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>You'll receive an order confirmation email shortly</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>We'll notify you when your order is shipped</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Track your order status in the Orders page</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-maroon-600 text-white py-3 rounded-lg font-semibold hover:bg-maroon-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>View Order Details</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-maroon-600 hover:text-maroon-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Support */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
                Need help? <a href="/contact" className="text-maroon-600 hover:underline">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;

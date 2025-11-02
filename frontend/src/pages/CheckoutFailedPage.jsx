/**
 * Checkout Failed Page
 * Displayed when Stripe payment fails or is cancelled
 */

import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, ShoppingCart, Home } from 'lucide-react';

function CheckoutFailedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Failed Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-red-100">Your payment could not be processed</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Reasons */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-red-900 mb-3">Common reasons for payment failure:</h3>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Insufficient funds in your account</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Incorrect card details or expired card</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Payment cancelled by user</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Bank declined the transaction</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Network or technical issues</span>
                </li>
              </ul>
            </div>

            {/* What to do */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">What you can do:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Check your card details and try again</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Try a different payment method</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Contact your bank for more information</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Your cart items are still saved</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-maroon-600 text-white py-3 rounded-lg font-semibold hover:bg-maroon-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Return to Cart</span>
              </button>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-maroon-600 hover:text-maroon-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go to Home</span>
              </button>
            </div>

            {/* Support */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-600 mb-2">
                Still having issues?
              </p>
              <a href="/contact" className="text-maroon-600 hover:underline font-medium">
                Contact our Support Team
              </a>
            </div>

            {/* Reassurance */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold">Don't worry!</span> No charges were made to your account.
                Your cart items are safe and you can try again anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutFailedPage;

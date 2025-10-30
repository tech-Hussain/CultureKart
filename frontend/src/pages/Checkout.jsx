/**
 * Checkout Page
 * Handles payment processing with Stripe Elements
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/api';

// Load Stripe with publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1f2937',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
};

// Checkout Form Component (uses Stripe hooks)
function CheckoutForm({ orderData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Shipping form data
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
  });

  // Create payment intent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await api.post('/payments/create-intent', {
          amount: orderData.total,
          currency: 'usd',
          orderId: orderData.orderId || 'temp_' + Date.now(),
        });

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err.response?.data?.message || 'Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [orderData]);

  // Handle shipping form changes
  const handleShippingChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate shipping form
  const validateShipping = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
    for (const field of required) {
      if (!shippingData[field].trim()) {
        setError(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingData.email)) {
      setError('Invalid email address');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateShipping()) {
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait...');
      return;
    }

    if (!clientSecret) {
      setError('Payment not initialized. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingData.fullName,
              email: shippingData.email,
              phone: shippingData.phone,
              address: {
                line1: shippingData.address,
                city: shippingData.city,
                state: shippingData.state,
                postal_code: shippingData.postalCode,
                country: shippingData.country,
              },
            },
          },
        }
      );

      if (stripeError) {
        setPaymentError(stripeError.message);
        setLoading(false);
        return;
      }

      // Payment successful, create order in backend
      if (paymentIntent.status === 'succeeded') {
        const orderResponse = await api.post('/orders', {
          items: orderData.items,
          total: orderData.total,
          currency: 'USD',
          paymentInfo: {
            method: 'stripe',
            transactionId: paymentIntent.id,
            status: 'paid',
            paidAt: new Date().toISOString(),
          },
          shippingAddress: shippingData,
        });

        if (orderResponse.data.success) {
          onSuccess(orderResponse.data.order);
        } else {
          throw new Error('Failed to create order');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-maroon-800 mb-4">Shipping Information</h2>
        
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={shippingData.fullName}
              onChange={handleShippingChange}
              className="input-field"
              required
            />
          </div>

          {/* Email and Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={shippingData.email}
                onChange={handleShippingChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={shippingData.phone}
                onChange={handleShippingChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="address"
              value={shippingData.address}
              onChange={handleShippingChange}
              className="input-field"
              required
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={shippingData.city}
                onChange={handleShippingChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={shippingData.state}
                onChange={handleShippingChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                value={shippingData.postalCode}
                onChange={handleShippingChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country *
            </label>
            <select
              name="country"
              value={shippingData.country}
              onChange={handleShippingChange}
              className="input-field"
              required
            >
              <option value="Pakistan">Pakistan</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
              <option value="UAE">United Arab Emirates</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-maroon-800 mb-4">Payment Information</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Card Details *
          </label>
          <div className="border-2 border-camel-300 rounded-lg p-4 bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-200">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-teal-600 font-bold">🔒</span>
            <span>
              Your payment information is secure and encrypted. We use Stripe for payment processing.
            </span>
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {(error || paymentError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">❌ {error || paymentError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            Processing Payment...
          </>
        ) : (
          <>💳 Pay ${orderData.total.toFixed(2)}</>
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        By completing this purchase, you agree to our Terms of Service
      </p>
    </form>
  );
}

// Main Checkout Component
function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Get order data from navigation state or localStorage
  useEffect(() => {
    const data = location.state?.orderData || JSON.parse(localStorage.getItem('checkoutData') || 'null');
    
    if (!data || !data.items || data.items.length === 0) {
      // No order data, redirect to shop
      navigate('/shop');
      return;
    }

    setOrderData(data);
  }, [location, navigate]);

  // Handle successful payment
  const handleSuccess = (order) => {
    setCompletedOrder(order);
    setSuccess(true);
    
    // Clear checkout data
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('cart');

    // Redirect to order confirmation after 3 seconds
    setTimeout(() => {
      navigate('/orders', { state: { orderId: order._id } });
    }, 3000);
  };

  // Handle payment error
  const handleError = (errorMessage) => {
    console.error('Payment error:', errorMessage);
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-teal-700 mb-4">Payment Successful!</h2>
          <p className="text-gray-700 mb-4">
            Your order has been placed successfully.
          </p>
          <div className="bg-ivory-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono font-semibold text-maroon-700">
              {completedOrder?._id}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Redirecting to order details...
          </p>
        </div>
      </div>
    );
  }

  // Loading state while order data is being set
  if (!orderData) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-maroon-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-maroon-800 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                orderData={orderData}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-maroon-800 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 pb-4 border-b">
                    <div className="w-16 h-16 bg-gradient-to-br from-camel-200 to-teal-200 rounded flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-2xl">🎨</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-semibold text-maroon-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="space-y-2 pt-4 border-t-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-teal-600">Calculated at next step</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-maroon-800 pt-2 border-t">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-600 text-center mb-3">
                  Secured by Stripe
                </p>
                <div className="flex justify-center gap-4 text-2xl">
                  <span title="Visa">💳</span>
                  <span title="Mastercard">💳</span>
                  <span title="American Express">💳</span>
                  <span title="Secure">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

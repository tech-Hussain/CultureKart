/**
 * Checkout Page
 * Validates cart, address, and creates Stripe checkout session
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/api';

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartSummary, loading: cartLoading } = useCart();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Perform validations
    validateCheckout();
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load user addresses
  const loadAddresses = async () => {
    try {
      const response = await api.get('/auth/addresses');
      if (response.data.success) {
        const addressList = response.data.addresses || [];
        setAddresses(addressList);
        
        // Auto-select default address
        const defaultAddr = addressList.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate checkout requirements
  const validateCheckout = () => {
    // Check if user logged in
    if (!user) {
      navigate('/login');
      return false;
    }

    // Check if cart is empty
    if (!cartLoading && cartItems.length === 0) {
      navigate('/shop');
      return false;
    }

    return true;
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    // Validate address selected
    if (!selectedAddress) {
      if (confirm('Please select or add a delivery address. Go to addresses page?')) {
        navigate('/addresses');
      }
      return;
    }

    // Validate cart not empty
    if (cartItems.length === 0) {
      alert('Cart is empty. Please add items to cart.');
      return;
    }

    try {
      setProcessing(true);

      // Prepare shipping address
      const shippingAddress = {
        fullName: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.addressLine,
        city: selectedAddress.city,
        country: selectedAddress.country,
        postalCode: selectedAddress.postalCode || '',
        state: selectedAddress.state || ''
      };

      // Create Stripe checkout session
      const response = await api.post('/stripe/create-checkout-session', {
        shippingAddress
      });

      if (response.data.success) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      alert(error.response?.data?.message || 'Failed to create checkout session. Please try again.');
      
      setProcessing(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user) {
    return null;
  }

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-maroon-600" />
            Checkout
          </h1>
          <p className="text-gray-600 mt-1">Review your order and complete payment</p>
        </div>

        {/* Validation Warnings */}
        {!user.emailVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Email Verification Required</h3>
              <p className="text-yellow-700 text-sm">Please verify your email before proceeding with checkout</p>
            </div>
          </div>
        )}

        {addresses.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">No Delivery Address</h3>
              <p className="text-red-700 text-sm mb-2">Please add a delivery address to continue</p>
              <button
                onClick={() => navigate('/addresses')}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Add Address
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-maroon-600" />
                Shipping Address
              </h2>

              {addresses.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No addresses found. Please add one.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddress(address)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddress?._id === address._id
                          ? 'border-maroon-600 bg-maroon-50'
                          : 'border-gray-200 hover:border-maroon-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{address.name}</h3>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.addressLine}, {address.city}, {address.country}
                          </p>
                        </div>
                        {selectedAddress?._id === address._id && (
                          <div className="w-6 h-6 bg-maroon-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate('/addresses')}
                className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-maroon-600 hover:text-maroon-600 transition-colors"
              >
                + Add New Address
              </button>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-maroon-600" />
                Order Items ({cartItems.length})
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(cartSummary.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">
                    {cartSummary.deliveryCharges === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(cartSummary.deliveryCharges)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold">{formatPrice(cartSummary.tax || 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-maroon-600">
                    {formatPrice(cartSummary.total || 0)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={processing || !selectedAddress || cartItems.length === 0 || !user.emailVerified}
                className="w-full bg-maroon-600 text-white py-3 rounded-lg font-semibold hover:bg-maroon-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our terms and conditions
              </p>

              <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="mr-2">🔒</span>
                  Secure payment with Stripe
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🚚</span>
                  Fast delivery
                </p>
                <p className="flex items-center">
                  <span className="mr-2">↩️</span>
                  Easy returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

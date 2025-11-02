/**
 * Cart Page
 * Shopping cart with quantity management and checkout
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cartItems,
    cartSummary,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart
  } = useCart();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle quantity increment
  const handleIncrement = (cartItem) => {
    updateQuantity(cartItem._id, cartItem.quantity + 1);
  };

  // Handle quantity decrement
  const handleDecrement = (cartItem) => {
    if (cartItem.quantity > 1) {
      updateQuantity(cartItem._id, cartItem.quantity - 1);
    } else {
      removeItem(cartItem._id);
    }
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    // Navigate to checkout
    navigate('/checkout');
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your cart</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-maroon-600" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-1">
            {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate('/shop')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cart</span>
                </button>
              </div>

              {/* Cart Items List */}
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.productName}
                      </h3>
                      {item.artisanName && (
                        <p className="text-sm text-gray-600 mb-2">
                          by {item.artisanName}
                        </p>
                      )}
                      <p className="text-maroon-600 font-bold">
                        {formatPrice(item.price)}
                      </p>

                      {/* Stock Warning */}
                      {item.product?.stock && item.quantity > item.product.stock && (
                        <p className="text-red-600 text-sm mt-1">
                          Only {item.product.stock} available in stock
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-3 py-2">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="text-gray-600 hover:text-maroon-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item)}
                          disabled={item.product?.stock && item.quantity >= item.product.stock}
                          className="text-gray-600 hover:text-maroon-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Subtotal */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(cartSummary.subtotal || 0)}
                  </span>
                </div>

                {/* Delivery Charges */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-semibold text-gray-900">
                    {cartSummary.deliveryCharges === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(cartSummary.deliveryCharges)
                    )}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(cartSummary.tax || 0)}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-maroon-600">
                    {formatPrice(cartSummary.total || 0)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary text-lg py-3"
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping Link */}
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full mt-3 text-maroon-600 hover:text-maroon-700 font-medium"
                >
                  Continue Shopping
                </button>

                {/* Info */}
                <div className="mt-6 text-sm text-gray-600">
                  <p className="mb-2">💳 Secure payment with Stripe</p>
                  <p className="mb-2">🚚 Fast delivery across Pakistan</p>
                  <p>📦 Track your order in real-time</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;

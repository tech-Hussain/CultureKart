/**
 * Cart Context
 * Global state management for shopping cart
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSummary, setCartSummary] = useState({
    itemCount: 0,
    subtotal: 0,
    deliveryCharges: 0,
    tax: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchCartCount();
    } else {
      // Clear cart if user logs out
      setCartItems([]);
      setCartCount(0);
      setCartSummary({
        itemCount: 0,
        subtotal: 0,
        deliveryCharges: 0,
        tax: 0,
        total: 0
      });
    }
  }, [user]);

  /**
   * Fetch cart items from backend
   */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      
      if (response.data.success) {
        setCartItems(response.data.cartItems || []);
        setCartSummary(response.data.summary || {
          itemCount: 0,
          subtotal: 0,
          deliveryCharges: 0,
          tax: 0,
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status !== 401) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load cart items',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch cart count for navbar badge
   */
  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart/count');
      if (response.data.success) {
        setCartCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  /**
   * Add item to cart
   */
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to add items to cart',
        confirmButtonText: 'Login',
        confirmButtonColor: '#4F46E5'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return false;
    }

    try {
      const response = await api.post('/cart/add', {
        productId,
        quantity
      });

      if (response.data.success) {
        // Refresh cart
        await fetchCart();
        await fetchCartCount();

        Swal.fire({
          icon: 'success',
          title: 'Added to Cart',
          text: response.data.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });

        return true;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add item to cart',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }
  };

  /**
   * Update cart item quantity
   */
  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) {
      return removeItem(cartItemId);
    }

    try {
      const response = await api.put(`/cart/${cartItemId}`, { quantity });

      if (response.data.success) {
        // Update local state immediately for better UX
        setCartItems(prevItems =>
          prevItems.map(item =>
            item._id === cartItemId ? { ...item, quantity } : item
          )
        );

        // Refresh cart to get updated totals
        await fetchCart();
        await fetchCartCount();

        return true;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update quantity',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }
  };

  /**
   * Remove item from cart
   */
  const removeItem = async (cartItemId) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Remove Item?',
        text: 'Are you sure you want to remove this item from cart?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280'
      });

      if (!result.isConfirmed) {
        return false;
      }

      const response = await api.delete(`/cart/${cartItemId}`);

      if (response.data.success) {
        // Remove from local state immediately
        setCartItems(prevItems => prevItems.filter(item => item._id !== cartItemId));

        // Refresh cart and count
        await fetchCart();
        await fetchCartCount();

        Swal.fire({
          icon: 'success',
          title: 'Removed',
          text: 'Item removed from cart',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });

        return true;
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to remove item',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Clear Cart?',
        text: 'Are you sure you want to remove all items from cart?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Clear All',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280'
      });

      if (!result.isConfirmed) {
        return false;
      }

      const response = await api.delete('/cart');

      if (response.data.success) {
        setCartItems([]);
        setCartCount(0);
        setCartSummary({
          itemCount: 0,
          subtotal: 0,
          deliveryCharges: 0,
          tax: 0,
          total: 0
        });

        Swal.fire({
          icon: 'success',
          title: 'Cart Cleared',
          text: 'All items removed from cart',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });

        return true;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to clear cart',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }
  };

  /**
   * Check if product is in cart
   */
  const isInCart = (productId) => {
    return cartItems.some(item => item.product?._id === productId || item.product === productId);
  };

  /**
   * Get cart item by product ID
   */
  const getCartItem = (productId) => {
    return cartItems.find(item => item.product?._id === productId || item.product === productId);
  };

  const value = {
    cartItems,
    cartCount,
    cartSummary,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    fetchCartCount,
    isInCart,
    getCartItem
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

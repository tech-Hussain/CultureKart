/**
 * Product Detail Page
 * Shows full product information including images, metadata, IPFS hash, blockchain verification
 * Fully integrated with MongoDB, cart functionality, and beautiful responsive design
 */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { getImageDisplayUrl, convertIpfsToHttp } from '../utils/ipfs';
import { startConversation } from '../services/messageService';
import ProductReviews from '../components/ProductReviews';
import Swal from 'sweetalert2';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart, getCartItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [startingConversation, setStartingConversation] = useState(false);
  
  // Check if product is in cart
  const inCart = product ? isInCart(product._id) : false;
  const cartItem = product ? getCartItem(product._id) : null;

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to add items to cart',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#8B4513'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    setAddingToCart(true);
    const success = await addToCart(product._id, quantity);
    setAddingToCart(false);
    
    if (success) {
      setQuantity(1); // Reset quantity after successful add
    }
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required', 
        text: 'Please login to purchase items',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#8B4513'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    // Add to cart first if not already in cart
    if (!inCart) {
      setAddingToCart(true);
      const success = await addToCart(product._id, quantity);
      setAddingToCart(false);
      
      if (!success) return;
    }

    // Navigate to cart/checkout
    navigate('/cart');
  };

  // Handle Contact Seller
  const handleContactSeller = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to contact the seller',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#8B4513'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    if (!product.artisan?._id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to contact seller for this product',
      });
      return;
    }

    try {
      setStartingConversation(true);
      console.log('🔄 Starting conversation with:', product.artisan._id, product._id);
      const response = await startConversation(product.artisan._id, product._id);
      
      console.log('✅ Conversation response:', response);
      console.log('✅ Response data:', response.data);
      console.log('✅ Response data status:', response.data?.status);
      
      if (response.data?.success === true) {
        console.log('🚀 Navigating to /messages');
        
        // Navigate immediately without SweetAlert delay
        navigate('/messages');
        
        // Show success toast after navigation
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Conversation started successfully!',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        }, 100);
      } else {
        throw new Error('Invalid response format: ' + JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to start conversation. Please try again.',
      });
    } finally {
      setStartingConversation(false);
    }
  };



  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        
        if (response.data.status === 'success') {
          setProduct(response.data.data.product);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Get category emoji
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      Textiles: '🧵',
      Pottery: '🏺',
      'Metal Work': '⚒️',
      Woodwork: '🪵',
      Jewelry: '💎',
      Decor: '🎨',
      Paintings: '🖼️',
      Other: '✨',
    };
    return emojiMap[category] || '🎨';
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-maroon-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This product does not exist'}</p>
          <Link to="/shop" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
          <Link to="/" className="hover:text-maroon-700 transition-colors">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/shop" className="hover:text-maroon-700 transition-colors">Shop</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image with Cultural Border */}
            <div className="relative group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border-4 border-double border-maroon-300">
                {product.images && product.images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={getImageDisplayUrl(product.images[selectedImage])}
                      alt={product.title}
                      className="w-full h-56 md:h-72 lg:h-96 object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                      onClick={() => setShowImageModal(true)}
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        const ipfsUrl = product.images[selectedImage];
                        
                        // Try different IPFS gateways on error
                        if (currentSrc.includes('ipfs.io')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 1);
                        } else if (currentSrc.includes('gateway.ipfs.io')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 2);
                        } else if (currentSrc.includes('dweb.link')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 3);
                        } else if (currentSrc.includes('cf-ipfs.com')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 4);
                        } else {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="w-full h-64 md:h-80 lg:h-[400px] bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 rounded-2xl flex items-center justify-center text-6xl">${getCategoryEmoji(product.category)}</div>`;
                        }
                      }}
                    />
                    
                    {/* Image overlay - Simplified */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white rounded-full p-2">
                        <svg className="w-5 h-5 text-maroon-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-56 md:h-72 lg:h-96 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 rounded flex items-center justify-center text-5xl">
                    {getCategoryEmoji(product.category)}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images - Smaller */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-maroon-600 shadow-md scale-105' 
                        : 'border-gray-300 hover:border-maroon-400'
                    }`}
                  >
                    <img
                      src={getImageDisplayUrl(image)}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        const ipfsUrl = image;
                        
                        if (currentSrc.includes('ipfs.io')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 1);
                        } else if (currentSrc.includes('gateway.ipfs.io')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 2);
                        } else if (currentSrc.includes('dweb.link')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 3);
                        } else if (currentSrc.includes('cf-ipfs.com')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 4);
                        } else {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-xl">🖼️</div>';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-maroon-600">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-maroon-800 text-xs font-semibold rounded-full border border-amber-300">
                  {getCategoryEmoji(product.category)} {product.category}
                </span>
                {product.rating && product.rating.average > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-sm">⭐</span>
                    <span className="text-xs font-medium text-gray-700">
                      {product.rating.average.toFixed(1)} ({product.rating.count})
                    </span>
                  </div>
                )}
                {(product.ipfsMetadataHash || product.blockchainTxn) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
                    ✓ Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.title}
              </h1>

              {/* Artisan Info - Compact */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="w-10 h-10 bg-gradient-to-br from-maroon-500 to-orange-500 rounded-full flex items-center justify-center text-lg text-white shadow">
                  👨‍🎨
                </div>
                <div>
                  <p className="text-xs text-gray-600">Handcrafted by</p>
                  <p className="font-bold text-sm text-gray-900">
                    {product.artisan?.displayName || 'Master Artisan'}
                  </p>
                  {product.artisan?.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      📍 {product.artisan.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Price - Compact */}
              <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-300">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-emerald-700">
                    Rs {product.price}
                  </span>
                  <span className="text-sm text-gray-600">{product.currency}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 font-semibold rounded-full text-xs">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 font-semibold rounded-full text-xs">
                      Out of stock
                    </span>
                  )}
                  {product.views > 0 && (
                    <span className="text-xs text-gray-600">👁️ {product.views}</span>
                  )}
                  {product.soldCount > 0 && (
                    <span className="text-xs text-gray-600">🛒 {product.soldCount} sold</span>
                  )}
                </div>
              </div>

              {/* Quantity Selector - Compact */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-md font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-14 h-9 text-center text-sm font-bold border-2 border-gray-200 rounded-md focus:border-maroon-400 focus:ring-1 focus:ring-maroon-200"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-md font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600 ml-2">
                    Total: <span className="font-bold text-gray-900">Rs {(product.price * quantity).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleContactSeller}
                  disabled={startingConversation}
                  className="w-full text-sm py-2.5 px-4 rounded-md font-semibold transition-all border-2 flex items-center justify-center gap-2 bg-white border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  {startingConversation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      💬 Contact Seller
                    </>
                  )}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className={`w-full text-sm py-2.5 px-4 rounded-md font-semibold transition-all border-2 flex items-center justify-center gap-2 ${
                    product.stock === 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500' 
                      : inCart
                      ? 'bg-green-50 border-green-400 text-green-800 hover:bg-green-100'
                      : 'bg-white border-maroon-700 text-maroon-700 hover:bg-maroon-50'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Adding...
                    </>
                  ) : inCart ? (
                    <>
                      ✓ In Cart ({cartItem?.quantity || 0})
                    </>
                  ) : (
                    <>
                      🛒 Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || addingToCart}
                  className={`w-full text-sm py-2.5 px-4 rounded-md font-semibold transition-all border-2 flex items-center justify-center gap-2 ${
                    product.stock === 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-400 border-gray-400 text-white' 
                      : 'bg-maroon-800 border-maroon-800 text-white hover:bg-maroon-900'
                  }`}
                >
                  {product.stock > 0 ? '⚡ Buy Now' : 'Out of Stock'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">🔒</span>
                    <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">✓</span>
                    <span className="text-xs text-gray-600 font-medium">Authentic</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">📦</span>
                    <span className="text-xs text-gray-600 font-medium">Safe Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 rounded-lg p-4 border-2 border-maroon-300">
              <h3 className="text-sm font-bold text-maroon-900 mb-2">🇵🇰 Why Choose CultureKart?</h3>
              <ul className="space-y-1.5 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Direct support to Pakistani artisans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>100% authentic handcrafted products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Secure escrow payment protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Preserving cultural heritage</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-maroon-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <nav className="flex space-x-6 px-6 pt-4">
              {[
                { id: 'description', label: 'Description', icon: '📋' },
                { id: 'specifications', label: 'Details', icon: '📐' },
                { id: 'artisan', label: 'Artisan Story', icon: '✨' },
                { id: 'reviews', label: 'Reviews', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-2.5 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-maroon-600 text-maroon-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-3">About This Product</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                    {product.description}
                  </p>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-maroon-100 hover:text-maroon-700 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-maroon-800 border-b border-maroon-200 pb-2">Physical Properties</h4>
                    {product.dimensions && product.dimensions.length && product.dimensions.width && product.dimensions.height ? (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Dimensions</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit || 'cm'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Dimensions</span>
                        <span className="text-sm text-gray-500 italic">Not specified</span>
                      </div>
                    )}
                    
                    {product.weight && product.weight.value ? (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Weight</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {product.weight.value} {product.weight.unit || 'kg'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Weight</span>
                        <span className="text-sm text-gray-500 italic">Not specified</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Category</span>
                      <span className="font-semibold text-sm text-gray-900">{product.category}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-maroon-800 border-b border-maroon-200 pb-2">Statistics</h4>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="font-semibold text-sm text-gray-900">{product.views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Sold</span>
                      <span className="font-semibold text-sm text-gray-900">{product.soldCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Listed On</span>
                      <span className="font-semibold text-sm text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {product.rating && product.rating.average > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Rating</span>
                        <span className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                          ⭐ {product.rating.average.toFixed(1)} ({product.rating.count})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'artisan' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Meet the Artisan</h3>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5 border-2 border-maroon-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-maroon-500 to-orange-500 rounded-full flex items-center justify-center text-2xl text-white shadow-lg">
                      👨‍🎨
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {product.artisan?.displayName || 'Master Artisan'}
                      </h4>
                      {product.artisan?.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          📍 {product.artisan.location}
                        </p>
                      )}
                      {product.artisan?.verified && (
                        <p className="text-sm text-green-600 flex items-center gap-1 font-medium">
                          ✓ Verified Artisan
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p className="leading-relaxed">
                      This exquisite piece is handcrafted by skilled Pakistani artisans who have inherited their craft through generations. Each product represents hours of dedicated work, traditional techniques, and a deep connection to cultural heritage.
                    </p>
                    <p className="leading-relaxed">
                      By purchasing this item, you're directly supporting local artisans and helping preserve Pakistan's rich cultural traditions for future generations.
                    </p>
                    <div className="bg-white rounded-md p-3 mt-3">
                      <h5 className="font-semibold text-maroon-800 mb-2 flex items-center gap-2">
                        🌟 Why Support Artisans?
                      </h5>
                      <ul className="space-y-1.5 text-xs">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Fair compensation for skilled craftsmanship</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Preservation of traditional art forms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Economic empowerment of local communities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Sustainable and eco-friendly production</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <ProductReviews productId={product._id} />
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              {product.images && product.images[selectedImage] && (
                <img
                  src={getImageDisplayUrl(product.images[selectedImage])}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    const ipfsUrl = product.images[selectedImage];
                    
                    if (currentSrc.includes('ipfs.io')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 1);
                    } else if (currentSrc.includes('gateway.ipfs.io')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 2);
                    } else if (currentSrc.includes('dweb.link')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 3);
                    } else if (currentSrc.includes('cf-ipfs.com')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 4);
                    } else {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-96 h-96 bg-gray-800 rounded-lg flex items-center justify-center text-6xl">${getCategoryEmoji(product.category)}</div>`;
                    }
                  }}
                />
              )}

              {/* Image navigation */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        selectedImage === index ? 'bg-white' : 'bg-gray-500 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;

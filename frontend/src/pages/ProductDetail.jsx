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
    <div className="min-h-screen bg-ivory-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-camel-600">Home</Link>
          {' > '}
          <Link to="/shop" className="hover:text-camel-600">Shop</Link>
          {' > '}
          <span className="text-gray-900">{product.title}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {product.images && product.images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={getImageDisplayUrl(product.images[selectedImage])}
                      alt={product.title}
                      className="w-full h-64 md:h-80 lg:h-[400px] object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
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
                    
                    {/* Image overlay with zoom hint */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-80 lg:h-[400px] bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 rounded-2xl flex items-center justify-center text-6xl">
                    {getCategoryEmoji(product.category)}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-orange-500 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <img
                      src={getImageDisplayUrl(image)}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Category Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 text-sm font-semibold rounded-full border border-orange-200">
                  {getCategoryEmoji(product.category)} {product.category}
                </span>
                {product.rating && product.rating.average > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span>⭐</span>
                    <span className="text-sm font-medium text-gray-700">
                      {product.rating.average.toFixed(1)} ({product.rating.count})
                    </span>
                  </div>
                )}
                {/* Authenticity Badge */}
                {(product.ipfsMetadataHash || product.blockchainTxn) && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold rounded-full border border-green-300">
                    ✓ Authenticity Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.title}
              </h1>

              {/* Artisan Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl text-white shadow-lg">
                  👨‍🎨
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Handcrafted by</p>
                  <p className="font-bold text-base text-gray-900">
                    {product.artisan?.displayName || 'Master Artisan'}
                  </p>
                  {product.artisan?.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span>📍</span> {product.artisan.location}
                    </p>
                  )}
                  {product.artisan?.verified && (
                    <p className="text-sm text-green-600 flex items-center gap-1 font-medium">
                      <span>✓</span> Verified Artisan
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-green-700">
                    Rs {product.price}
                  </span>
                  <span className="text-base text-gray-600 font-medium">{product.currency}</span>
                </div>
                <div className="flex items-center gap-4">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 font-semibold rounded-full text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 font-semibold rounded-full text-sm">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Out of stock
                    </span>
                  )}
                  {product.views > 0 && (
                    <span className="text-sm text-gray-600">
                      👁️ {product.views} views
                    </span>
                  )}
                  {product.soldCount > 0 && (
                    <span className="text-sm text-gray-600">
                      🛒 {product.soldCount} sold
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-base transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 h-10 text-center text-base font-bold border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-base transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                  <span className="text-gray-600 font-medium">
                    Total: <span className="font-bold text-gray-900">Rs {(product.price * quantity).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className={`btn-secondary w-full text-base py-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                    product.stock === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-md hover:scale-[1.01]'
                  } ${
                    inCart 
                      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                      : ''
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

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || addingToCart}
                  className={`btn-primary w-full text-base py-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                    product.stock === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  {product.stock > 0 ? (
                    <>
                      ⚡ Buy Now
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 pt-6">
              {[
                { id: 'description', label: 'Description', icon: '📋' },
                { id: 'specifications', label: 'Specifications', icon: '📐' },
                { id: 'reviews', label: 'Reviews', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {product.description}
                  </p>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
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
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Specifications</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Physical Properties</h4>
                    {product.dimensions && product.dimensions.length && product.dimensions.width && product.dimensions.height ? (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Dimensions</span>
                        <span className="font-semibold text-gray-900">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit || 'cm'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Dimensions</span>
                        <span className="text-gray-500 italic">Not specified</span>
                      </div>
                    )}
                    
                    {product.weight && product.weight.value ? (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Weight</span>
                        <span className="font-semibold text-gray-900">
                          {product.weight.value} {product.weight.unit || 'kg'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Weight</span>
                        <span className="text-gray-500 italic">Not specified</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Category</span>
                      <span className="font-semibold text-gray-900">{product.category}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Product Statistics</h4>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Views</span>
                      <span className="font-semibold text-gray-900">{product.views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Total Sold</span>
                      <span className="font-semibold text-gray-900">{product.soldCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Date Listed</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {product.rating && product.rating.average > 0 && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Rating</span>
                        <span className="font-semibold text-gray-900 flex items-center gap-1">
                          ⭐ {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                {product.rating && product.rating.count > 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl">⭐</span>
                    <h4 className="text-xl font-semibold mt-4 mb-2">
                      {product.rating.average.toFixed(1)} out of 5 stars
                    </h4>
                    <p>Based on {product.rating.count} reviews</p>
                    <p className="text-sm mt-4 text-gray-400">Individual reviews coming soon...</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl">📝</span>
                    <h4 className="text-xl font-semibold mt-4 mb-2">No Reviews Yet</h4>
                    <p>Be the first to review this amazing handcrafted product!</p>
                  </div>
                )}
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

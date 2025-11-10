/**
 * Product Detail Page
 * Shows full product information including images, metadata, IPFS hash, blockchain verification
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { getImageDisplayUrl, convertIpfsToHttp } from '../utils/ipfs';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

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

  // Truncate hash for display
  const truncateHash = (hash, length = 16) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - 8)}`;
  };

  // Checkout Modal Component
  const CheckoutModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-maroon-800">Checkout</h3>
          <button
            onClick={() => setShowCheckoutModal(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <img
              src={getImageDisplayUrl(product.images?.[0] || '')}
              alt={product.title}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">🖼️</div>';
              }}
            />
            <div>
              <h4 className="font-semibold">{product.title}</h4>
              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
              <p className="text-lg font-bold text-maroon-600">
                ${(product.price * quantity).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-gray-700 mb-4">
              This is a placeholder checkout. Integration with Stripe will process the payment.
            </p>
            <button className="btn-primary w-full mb-2">
              Proceed to Payment
            </button>
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getImageDisplayUrl(product.images[selectedImage])}
                  alt={product.title}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    const ipfsUrl = product.images[selectedImage];
                    
                    // Try different IPFS gateways on error
                    if (currentSrc.includes('ipfs.io')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 1); // Try gateway.ipfs.io
                    } else if (currentSrc.includes('gateway.ipfs.io')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 2); // Try dweb.link
                    } else if (currentSrc.includes('dweb.link')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 3); // Try cf-ipfs.com
                    } else if (currentSrc.includes('cf-ipfs.com')) {
                      e.target.src = convertIpfsToHttp(ipfsUrl, 4); // Try pinata as last resort
                    } else {
                      // All gateways failed, show fallback
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-96 bg-gradient-to-br from-camel-200 via-ivory-200 to-teal-200 rounded-lg flex items-center justify-center text-9xl">${getCategoryEmoji(product.category)}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-camel-200 via-ivory-200 to-teal-200 rounded-lg flex items-center justify-center text-9xl">
                  {getCategoryEmoji(product.category)}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-maroon-600' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageDisplayUrl(image)}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        const ipfsUrl = image;
                        
                        // Try different IPFS gateways on error
                        if (currentSrc.includes('ipfs.io')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 1); // Try gateway.ipfs.io
                        } else if (currentSrc.includes('gateway.ipfs.io')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 2); // Try dweb.link
                        } else if (currentSrc.includes('dweb.link')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 3); // Try cf-ipfs.com
                        } else if (currentSrc.includes('cf-ipfs.com')) {
                          e.target.src = convertIpfsToHttp(ipfsUrl, 4); // Try pinata as last resort
                        } else {
                          // All gateways failed, show fallback
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
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Category Badge */}
              <span className="inline-block px-3 py-1 bg-camel-100 text-camel-800 text-sm font-semibold rounded-full mb-3">
                {product.category}
              </span>

              <h1 className="text-4xl font-bold text-maroon-800 mb-4">
                {product.title}
              </h1>

              {/* Artisan Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="w-12 h-12 bg-gradient-to-br from-camel-300 to-maroon-300 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <p className="text-sm text-gray-600">Crafted by</p>
                  <p className="font-semibold text-gray-900">
                    {product.artisan?.displayName || 'Artisan'}
                  </p>
                  {product.artisan?.location && (
                    <p className="text-xs text-gray-500">
                      📍 {product.artisan.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-maroon-600 mb-2">
                  ${product.price}
                  <span className="text-lg text-gray-500 ml-2">{product.currency}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {product.stock > 0 ? (
                    <span className="text-teal-600 font-semibold">
                      ✓ {product.stock} in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ✗ Out of stock
                    </span>
                  )}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-camel-200"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center input-field"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-camel-200"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => setShowCheckoutModal(true)}
                disabled={product.stock === 0}
                className="btn-primary w-full text-lg py-4 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock > 0 ? '🛒 Buy Now' : 'Out of Stock'}
              </button>

              <button className="btn-secondary w-full">
                💝 Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="border-b mb-6">
            <h2 className="text-2xl font-bold text-maroon-800 pb-4">Product Details</h2>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="space-y-2">
                {product.dimensions && product.dimensions.length && product.dimensions.width && product.dimensions.height && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Dimensions</span>
                    <span className="font-medium">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit || 'cm'}
                    </span>
                  </div>
                )}
                {product.weight && product.weight.value && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium">
                      {product.weight.value} {product.weight.unit || 'kg'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Tags</span>
                    <span className="font-medium">{product.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{product.views || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Sold</span>
                  <span className="font-medium">{product.soldCount || 0}</span>
                </div>
                {product.rating && product.rating.average > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">⭐ {product.rating.average.toFixed(1)} ({product.rating.count} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blockchain Verification */}
          <div className="bg-gradient-to-r from-teal-50 to-camel-50 rounded-lg p-6 border-2 border-teal-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              ⛓️ Blockchain Verification
            </h3>
            <div className="space-y-3">
              {/* IPFS Metadata Hash */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  IPFS Metadata Hash
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-4 py-2 rounded border text-sm font-mono text-gray-800">
                    {product.ipfsMetadataHash || 'Not available'}
                  </code>
                  {product.ipfsMetadataHash && !product.ipfsMetadataHash.includes('Sample') ? (
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${product.ipfsMetadataHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 text-sm whitespace-nowrap"
                    >
                      View on IPFS
                    </a>
                  ) : product.ipfsMetadataHash ? (
                    <button
                      disabled
                      className="btn-secondary px-4 py-2 text-sm whitespace-nowrap opacity-50 cursor-not-allowed"
                      title="Demo hash - not uploaded to IPFS yet"
                    >
                      Demo Only
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Blockchain Transaction */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Blockchain Transaction ID
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-4 py-2 rounded border text-sm font-mono text-gray-800">
                    {product.blockchainTxn ? truncateHash(product.blockchainTxn, 20) : 'Pending blockchain registration'}
                  </code>
                  {product.blockchainTxn && 
                   product.blockchainTxn.startsWith('0x') && 
                   product.blockchainTxn.length === 66 &&
                   !product.blockchainTxn.includes('abcdef123456') ? (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${product.blockchainTxn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4 py-2 text-sm whitespace-nowrap"
                    >
                      View on Etherscan
                    </a>
                  ) : product.blockchainTxn ? (
                    <button
                      disabled
                      className="btn-secondary px-4 py-2 text-sm whitespace-nowrap opacity-50 cursor-not-allowed"
                      title="Demo transaction - not on blockchain yet"
                    >
                      Demo Only
                    </button>
                  ) : null}
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                {product.blockchainTxn && !product.blockchainTxn.includes('abcdef123456') ? (
                  <>
                    ✅ This product's authenticity has been permanently recorded on the Ethereum blockchain.
                  </>
                ) : (
                  <>
                    ⏳ Blockchain registration in progress...
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckoutModal && <CheckoutModal />}
      </div>
    </div>
  );
}

export default ProductDetail;

/**
 * Product List Page
 * Displays paginated products with filtering and search
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  });

  // Categories for filtering
  const categories = [
    'All',
    'Textiles',
    'Pottery',
    'Metal Work',
    'Woodwork',
    'Jewelry',
    'Decor',
    'Paintings',
    'Other',
  ];

  // Fetch products from API
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        status: 'active',
      });

      if (filters.category && filters.category !== 'All') {
        params.append('category', filters.category);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }

      const response = await api.get(`/products?${params.toString()}`);

      if (response.data.success) {
        setProducts(response.data.products);
        setPagination({
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.pages,
          totalProducts: response.data.pagination.total,
          limit: response.data.pagination.limit,
        });
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Handle filter changes
  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category: category === 'All' ? '' : category });
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="min-h-screen bg-ivory-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-maroon-800 mb-2">
            Discover Authentic Crafts
          </h1>
          <p className="text-gray-600">
            {pagination.totalProducts} handcrafted products from Pakistani artisans
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={filters.search}
                onChange={handleSearchChange}
                className="input-field"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Price ($)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Price ($)
              </label>
              <input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    (category === 'All' && !filters.category) ||
                    filters.category === category
                      ? 'bg-maroon-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-camel-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-maroon-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => fetchProducts(pagination.currentPage)}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={() => setFilters({ category: '', search: '', minPrice: '', maxPrice: '' })}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                      {/* Product Image */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-camel-200 via-ivory-200 to-teal-200 rounded-lg mb-4 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            {getCategoryEmoji(product.category)}
                          </div>
                        )}
                        
                        {/* Blockchain Badge */}
                        {product.blockchainTxn && (
                          <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            ⛓️ Verified
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <span className="inline-block px-3 py-1 bg-camel-100 text-camel-800 text-xs font-semibold rounded-full mb-2">
                          {product.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-maroon-700 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          by {product.artisan?.displayName || 'Artisan'}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-maroon-600">
                            ${product.price}
                          </span>
                          {product.stock > 0 ? (
                            <span className="text-xs text-teal-600 font-semibold">
                              {product.stock} in stock
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-semibold">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 bg-white border border-camel-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-camel-50"
                    >
                      ← Previous
                    </button>
                    
                    <div className="flex gap-2">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-lg font-medium ${
                                page === pagination.currentPage
                                  ? 'bg-maroon-600 text-white'
                                  : 'bg-white border border-camel-300 hover:bg-camel-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 bg-white border border-camel-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-camel-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductList;

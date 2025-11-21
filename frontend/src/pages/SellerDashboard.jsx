/**
 * Seller Dashboard Page (Artisan)
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeBanner from '../components/ThemeBanner';
import { getSellerDashboard, getSellerProducts } from '../services/sellerService';

function SellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: { total: 0, active: 0, outOfStock: 0 },
    orders: { total: 0, pending: 0, delivered: 0 },
    revenue: { total: 0, averageOrderValue: 0 },
    rating: { average: 0, totalReviews: 0 },
    recentOrders: [],
    topProducts: [],
  });
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getSellerDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await getSellerProducts({ limit: 6 });
      setProducts(response.data.data?.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const getImageUrl = (images) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/300';
    const img = images[0];
    let url = typeof img === 'string' ? img : img.url || img.path || 'https://via.placeholder.com/300';
    
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    if (url.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
    }
    return url;
  };

  const formatCurrency = (amount) => {
    return `Rs ${amount?.toLocaleString() || 0}`;
  };

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Page Header with ThemeBanner */}
      <ThemeBanner size="medium" pattern="truckArt" title="Artisan Studio" subtitle="Manage Your Craft & Sales" />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Products</h3>
                <p className="text-3xl font-bold text-maroon-600">{stats.products.total}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="text-green-600 font-semibold">{stats.products.active}</span> active
                  {stats.products.outOfStock > 0 && (
                    <span className="ml-2">
                      <span className="text-red-600 font-semibold">{stats.products.outOfStock}</span> out of stock
                    </span>
                  )}
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Orders</h3>
                <p className="text-3xl font-bold text-teal-600">{stats.orders.total}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="text-yellow-600 font-semibold">{stats.orders.pending}</span> pending •{' '}
                  <span className="text-green-600 font-semibold">{stats.orders.delivered}</span> delivered
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Revenue</h3>
                <p className="text-3xl font-bold text-camel-600">{formatCurrency(stats.revenue.total)}</p>
                <div className="mt-2 text-sm text-gray-600">
                  Avg: {formatCurrency(stats.revenue.averageOrderValue)}/order
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Rating</h3>
                <p className="text-3xl font-bold text-maroon-600">{stats.rating.average}</p>
                <div className="mt-2 text-sm text-gray-600">
                  {stats.rating.totalReviews} {stats.rating.totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Top Products */}
              {stats.topProducts.length > 0 && (
                <div className="card">
                  <h3 className="text-xl font-bold text-maroon-800 mb-4">🏆 Top Selling Products</h3>
                  <div className="space-y-3">
                    {stats.topProducts.map((product, index) => (
                      <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{product.title}</p>
                            <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {stats.recentOrders.length > 0 && (
                <div className="card">
                  <h3 className="text-xl font-bold text-maroon-800 mb-4">📦 Recent Orders</h3>
                  <div className="space-y-3">
                    {stats.recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{order.item.title}</p>
                          <p className="text-sm text-gray-600">
                            {order.buyer.name} • {order.item.qty} qty
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.item.price * order.item.qty)}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* My Products Section */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-maroon-800">My Products</h2>
            <div className="flex gap-3">
              <Link to="/artisan/products" className="btn-secondary">
                View All
              </Link>
              <Link to="/artisan/products/add" className="btn-primary">
                Add Product
              </Link>
            </div>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't added any products yet.</p>
              <Link to="/artisan/products/add" className="btn-primary inline-block">
                Create Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(product.images)}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300?text=Product+Image';
                      }}
                    />
                    {product.verified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ⛓️ Verified
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-block px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-maroon-700 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-maroon-600">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="text-xs">
                        {product.stock > 0 ? (
                          <span className="text-teal-600 font-semibold">{product.stock} in stock</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Out of stock</span>
                        )}
                      </div>
                    </div>
                    {product.soldCount > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        🔥 {product.soldCount} sold
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        {!loading && stats.recentOrders.length === 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-maroon-800 mb-4">Recent Sales</h2>
            <p className="text-gray-600">Your sales history will appear here once you make your first sale.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;

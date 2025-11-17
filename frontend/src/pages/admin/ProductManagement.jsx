import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { getProducts } from '../../services/adminService';

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus === 'all' ? undefined : filterStatus,
      };

      const response = await getProducts(params);
      const data = response.data?.data || response.data;
      
      setProducts(data.products || []);
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: pagination.limit,
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchTerm,
      };

      const response = await getProducts(params);
      const data = response.data?.data || response.data;
      
      setProducts(data.products || []);
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-300',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      out_of_stock: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || colors.active}`}>
        {status?.replace(/_/g, ' ').charAt(0).toUpperCase() + status?.replace(/_/g, ' ').slice(1)}
      </span>
    );
  };

  const getImageUrl = (images) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/100';
    const img = images[0];
    let url;
    if (typeof img === 'string') {
      url = img;
    } else {
      url = img.url || img.path || 'https://via.placeholder.com/100';
    }
    
    // Convert IPFS URLs to HTTP gateway URLs
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    return url;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and approve products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Products</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {products.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {products.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {products.filter(p => p.inventory === 0).length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            {['all', 'active', 'pending', 'out_of_stock'].map((status) => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); setPagination(prev => ({ ...prev, page: 1 })); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Artisan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={getImageUrl(product.images)}
                            alt={product.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{product.title}</p>
                            <p className="text-xs text-gray-600">{product.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">{product.artisan?.displayName || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{product.artisan?.location || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">{product.category || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">Rs {product.price?.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-semibold ${product.inventory === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                          {product.inventory}
                        </p>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {product.status === 'pending' && (
                            <>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total products)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;

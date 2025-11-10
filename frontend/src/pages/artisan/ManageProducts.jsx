import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { getImageDisplayUrl, convertIpfsToHttp } from '../../utils/ipfs';

import {
  getArtisanProducts,
  deleteProduct,
  toggleProductStatus,
  formatCurrency,
  getStatusColor,
  formatDate,
} from '../../services/artisanService';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const categories = [
    'all',
    'Pottery & Ceramics',
    'Textiles & Fabrics',
    'Jewelry & Accessories',
    'Woodwork & Carpentry',
    'Other'
  ];

  const statuses = ['all', 'active', 'inactive', 'draft'];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: filterCategory,
        status: filterStatus,
        sortBy,
        sortOrder,
      };

      const response = await getArtisanProducts(params);
      console.log('📦 API Response:', response);
      console.log('📦 Response Data:', response.data);
      console.log('📦 Products Array:', response.data.data.products);
      console.log('📦 Products Length:', response.data.data.products?.length);
      
      setProducts(response.data.data.products || []);
      setPagination(response.data.data.pagination);

    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterStatus, sortBy, sortOrder, fetchProducts]);

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await toggleProductStatus(productId, newStatus);
      
      setProducts(products.map(product => 
        product._id === productId 
          ? { ...product, status: newStatus }
          : product
      ));

    } catch (err) {
      console.error('Toggle status error:', err);
      setError(err.response?.data?.message || 'Failed to update product status');
    }
  };

  const handleDelete = async (productId, productTitle) => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(product => product._id !== productId));
        fetchProducts();

      } catch (err) {
        console.error('Delete product error:', err);
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
          <p className="text-gray-600 mt-1">View, edit, and manage all your products</p>
        </div>
        <Link
          to="/artisan/products/add"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-800 shadow-lg transition-all duration-200"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="title-asc">Name A-Z</option>
              <option value="price-desc">Price High-Low</option>
              <option value="soldCount-desc">Most Sold</option>
            </select>
          </div>
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xl mr-4 overflow-hidden">
                          {product.images?.[0] ? (
                            <img 
                              src={getImageDisplayUrl(product.images[0])} 
                              alt={product.title} 
                              className="h-12 w-12 rounded-lg object-cover" 
                              onError={(e) => {
                                const currentSrc = e.target.src;
                                const ipfsUrl = product.images[0];
                                
                                // Try different IPFS gateways
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
                                  e.target.parentElement.innerHTML = '<span class="text-amber-600">🖼️</span>';
                                }
                              }}
                            />
                          ) : (
                            <span className="text-amber-600">🖼️</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500">Created {formatDate(product.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-3">
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(product._id, product.status)}
                          className={`relative group flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                            product.status === 'active' 
                              ? 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700' 
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                          title={product.status === 'active' ? 'Hide Product' : 'Show Product'}
                        >
                          {product.status === 'active' ? 
                            <EyeSlashIcon className="w-4 h-4" /> : 
                            <EyeIcon className="w-4 h-4" />
                          }
                        </button>
                        
                        {/* Edit Button */}
                        <Link
                          to={`/artisan/products/edit/${product._id}`}
                          className="group flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200"
                          title="Edit Product"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(product._id, product.title)}
                          className="group flex items-center justify-center w-9 h-9 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all duration-200"
                          title="Delete Product"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">Page {pagination.current} of {pagination.total}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(pagination.current + 1)}
                  disabled={pagination.current >= pagination.total}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">Start by adding your first product to showcase your crafts.</p>
          <Link
            to="/artisan/products/add"
            className="px-6 py-2 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg transition-all duration-200"
          >
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;

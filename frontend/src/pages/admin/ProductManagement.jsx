import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Product Management Page
 * Admin panel for managing and approving products
 * Features: approve/reject, flag, remove, search, inventory alerts
 */
const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, flagged
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Sample product data - Replace with real API
  const products = [
    {
      id: 1,
      name: 'Hand-Embroidered Shawl',
      sku: 'TEX-001',
      artisanName: 'Ahmed Khan',
      artisanId: 101,
      category: 'Textiles',
      price: 4500,
      inventory: 5,
      status: 'pending',
      submittedDate: '2024-06-25',
      image: 'https://via.placeholder.com/150',
      description: 'Beautiful hand-embroidered shawl with traditional patterns',
    },
    {
      id: 2,
      name: 'Ceramic Vase Set',
      sku: 'POT-045',
      artisanName: 'Ali Hassan',
      artisanId: 102,
      category: 'Pottery',
      price: 3200,
      inventory: 12,
      status: 'approved',
      submittedDate: '2024-06-20',
      image: 'https://via.placeholder.com/150',
      description: 'Set of 3 handmade ceramic vases with traditional glazing',
    },
    {
      id: 3,
      name: 'Silver Necklace',
      sku: 'JEW-023',
      artisanName: 'Fatima Bibi',
      artisanId: 103,
      category: 'Jewelry',
      price: 8900,
      inventory: 2,
      status: 'approved',
      submittedDate: '2024-06-18',
      image: 'https://via.placeholder.com/150',
      description: 'Handcrafted silver necklace with semi-precious stones',
    },
    {
      id: 4,
      name: 'Traditional Wall Art',
      sku: 'ART-067',
      artisanName: 'Mohammad Raza',
      artisanId: 104,
      category: 'Paintings',
      price: 6700,
      inventory: 0,
      status: 'flagged',
      submittedDate: '2024-06-22',
      image: 'https://via.placeholder.com/150',
      description: 'Hand-painted wall art depicting cultural scenes',
    },
    {
      id: 5,
      name: 'Wooden Jewelry Box',
      sku: 'WOD-012',
      artisanName: 'Zainab Malik',
      artisanId: 105,
      category: 'Wood Crafts',
      price: 2800,
      inventory: 8,
      status: 'pending',
      submittedDate: '2024-06-26',
      image: 'https://via.placeholder.com/150',
      description: 'Handcrafted wooden jewelry box with intricate carvings',
    },
  ];

  const categories = ['all', 'Textiles', 'Pottery', 'Jewelry', 'Paintings', 'Wood Crafts'];

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.artisanName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || product.status === filterStatus;

      const matchesCategory =
        filterCategory === 'all' || product.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submittedDate) - new Date(a.submittedDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.submittedDate) - new Date(b.submittedDate);
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      return 0;
    });

  const handleApprove = (productId) => {
    console.log('Approve product:', productId);
    // Implement approve logic
  };

  const handleReject = (productId) => {
    console.log('Reject product:', productId);
    // Implement reject logic
  };

  const handleFlag = (productId) => {
    console.log('Flag product:', productId);
    // Implement flag logic
  };

  const handleRemove = (productId) => {
    console.log('Remove product:', productId);
    // Implement remove logic
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      flagged: 'bg-red-100 text-red-700 border-red-300',
      rejected: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getInventoryBadge = (inventory) => {
    if (inventory === 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Out of Stock</span>;
    } else if (inventory <= 5) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Low Stock</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">In Stock</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <p className="text-sm text-gray-600 mt-1">Review and manage all platform products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Products</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {products.filter((p) => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {products.filter((p) => p.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {products.filter((p) => p.inventory <= 5).length}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or artisan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.inventory === 0 && (
                <div className="absolute top-2 right-2">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div className="absolute top-2 left-2">{getStatusBadge(product.status)}</div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Artisan:</span>
                  <span className="font-medium text-gray-800">{product.artisanName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-800">{product.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-green-600">Rs. {product.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Inventory:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{product.inventory} units</span>
                    {getInventoryBadge(product.inventory)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium text-gray-800">{product.submittedDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(product)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>View</span>
                </button>

                {product.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(product.id)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      title="Approve"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(product.id)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      title="Reject"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {product.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleFlag(product.id)}
                      className="px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Flag Product"
                    >
                      <FlagIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Product"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}

                {product.status === 'flagged' && (
                  <>
                    <button
                      onClick={() => handleApprove(product.id)}
                      className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Unflag & Approve"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Product"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Product Image */}
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Information */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h3>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">SKU</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedProduct.sku}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-lg font-semibold text-green-600">Rs. {selectedProduct.price}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedProduct.category}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Inventory</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedProduct.inventory} units</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Artisan</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedProduct.artisanName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedProduct.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedProduct.id)}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Approve Product
                    </button>
                    <button
                      onClick={() => handleReject(selectedProduct.id)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Reject Product
                    </button>
                  </>
                )}
                {selectedProduct.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleFlag(selectedProduct.id)}
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Flag Product
                    </button>
                    <button
                      onClick={() => handleRemove(selectedProduct.id)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Remove Product
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

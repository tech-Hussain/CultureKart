/**
 * Manage Products Page
 * View, edit, delete, and manage all products
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

function ManageProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sample products data - will be replaced with API data
  const [products] = useState([
    {
      id: 1,
      name: 'Traditional Kashmiri Carpet',
      category: 'Textiles & Fabrics',
      price: 25000,
      stock: 5,
      sales: 45,
      status: 'active',
      image: '🏺',
      createdAt: '2025-10-15',
    },
    {
      id: 2,
      name: 'Handmade Ceramic Vase',
      category: 'Pottery & Ceramics',
      price: 3500,
      stock: 12,
      sales: 32,
      status: 'active',
      image: '🏺',
      createdAt: '2025-10-20',
    },
    {
      id: 3,
      name: 'Embroidered Pashmina Shawl',
      category: 'Traditional Clothing',
      price: 8500,
      stock: 2,
      sales: 28,
      status: 'active',
      image: '🧣',
      createdAt: '2025-10-25',
    },
    {
      id: 4,
      name: 'Walnut Wood Carved Box',
      category: 'Woodwork',
      price: 4200,
      stock: 8,
      sales: 21,
      status: 'active',
      image: '📦',
      createdAt: '2025-11-01',
    },
    {
      id: 5,
      name: 'Silver Filigree Earrings',
      category: 'Jewelry',
      price: 2800,
      stock: 0,
      sales: 18,
      status: 'inactive',
      image: '💍',
      createdAt: '2025-09-10',
    },
  ]);

  const categories = ['all', 'Textiles & Fabrics', 'Pottery & Ceramics', 'Woodwork', 'Jewelry', 'Traditional Clothing'];

  const handleToggleStatus = (productId) => {
    console.log('Toggle status for product:', productId);
    // TODO: Implement API call to toggle product status
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      console.log('Delete product:', productId);
      // TODO: Implement API call to delete product
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'sales') {
        return b.sales - a.sales;
      } else if (sortBy === 'lowStock') {
        return a.stock - b.stock;
      }
      return 0;
    });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
          <p className="text-gray-600 mt-1">
            View and manage all your products
          </p>
        </div>
        <Link
          to="/artisan/products/add"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-800 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active Products</p>
          <p className="text-2xl font-bold text-emerald-600">
            {products.filter((p) => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="sales">Sort by Sales</option>
              <option value="lowStock">Sort by Low Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-maroon-600 to-maroon-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Sales</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                        {product.image}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">
                      Rs {product.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{product.sales} sold</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(product.id)}
                        className="p-2 text-gray-600 hover:text-maroon-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {product.status === 'active' ? (
                          <EyeIcon className="w-5 h-5" />
                        ) : (
                          <EyeSlashIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => console.log('Edit product:', product.id)}
                        className="p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by adding your first product'}
          </p>
          <Link
            to="/artisan/products/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add Your First Product
          </Link>
        </div>
      )}

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default ManageProducts;

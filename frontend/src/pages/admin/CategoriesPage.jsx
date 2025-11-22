import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/api';
import Swal from 'sweetalert2';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '🎨',
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching categories from /admin/categories...');
      const response = await api.get('/admin/categories');
      console.log('📦 Categories response:', response.data);
      console.log('📦 Categories data.data:', response.data.data);
      console.log('📦 Categories array:', response.data.data?.categories);
      setCategories(response.data.data.categories || []);
      console.log('✅ Categories loaded:', response.data.data.categories?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      console.error('❌ Error response:', error.response?.data);
      Swal.fire('Error', 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', formData);
      Swal.fire('Success', 'Category added successfully', 'success');
      setShowAddForm(false);
      setFormData({ name: '', description: '', emoji: '🎨', order: 0 });
      fetchCategories();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to add category', 'error');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/admin/categories/${id}`, updates);
      Swal.fire('Success', 'Category updated successfully', 'success');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update category', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/categories/${id}`);
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        fetchCategories();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete category', 'error');
      }
    }
  };

  const handleSync = async () => {
    try {
      await api.post('/admin/categories/sync');
      Swal.fire('Success', 'Product counts synced successfully', 'success');
      fetchCategories();
    } catch (error) {
      Swal.fire('Error', 'Failed to sync product counts', 'error');
    }
  };

  const CategoryRow = ({ category }) => {
    const [editForm, setEditForm] = useState({
      name: category.name,
      description: category.description,
      emoji: category.emoji,
      order: category.order,
      isActive: category.isActive,
    });

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          {editingId === category._id ? (
            <input
              type="text"
              value={editForm.emoji}
              onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
              className="w-16 px-2 py-1 border rounded"
              maxLength={2}
            />
          ) : (
            <span className="text-2xl">{category.emoji}</span>
          )}
        </td>
        <td className="px-6 py-4">
          {editingId === category._id ? (
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="font-medium text-gray-900">{category.name}</div>
          )}
        </td>
        <td className="px-6 py-4">
          {editingId === category._id ? (
            <input
              type="text"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-sm text-gray-600">{category.description || '-'}</div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className="text-sm font-semibold text-blue-600">{category.productCount}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {editingId === category._id ? (
            <input
              type="number"
              value={editForm.order}
              onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
              className="w-20 px-2 py-1 border rounded text-center"
            />
          ) : (
            <span className="text-sm text-gray-600">{category.order}</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {editingId === category._id ? (
            <input
              type="checkbox"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="w-4 h-4"
            />
          ) : (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {editingId === category._id ? (
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  handleUpdate(category._id, editForm);
                }}
                className="text-green-600 hover:text-green-900"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-red-600 hover:text-red-900"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setEditingId(category._id)}
                className="text-blue-600 hover:text-blue-900"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(category._id, category.name)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage product categories for your marketplace</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sync Counts
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Category</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-2xl text-center"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', description: '', emoji: '🎨', order: 0 });
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emoji</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No categories found. Add your first category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <CategoryRow key={category._id} category={category} />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How Categories Work</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Categories are automatically synced with product listings and shop filters</li>
          <li>• Product counts show active products in each category</li>
          <li>• Use "Order" to control the display sequence (lower numbers appear first)</li>
          <li>• Inactive categories won't appear in product forms or shop filters</li>
          <li>• You cannot delete categories that have products assigned to them</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoriesPage;

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';

/**
 * Categories & Tags Management
 * CRUD operations for product categories and tags
 */
const CategoriesManagement = () => {
  const [activeTab, setActiveTab] = useState('categories'); // categories or tags
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const categories = [
    { id: 1, name: 'Textiles', icon: '🧵', productCount: 2850, active: true },
    { id: 2, name: 'Pottery', icon: '🏺', productCount: 1820, active: true },
    { id: 3, name: 'Jewelry', icon: '💍', productCount: 2150, active: true },
    { id: 4, name: 'Paintings', icon: '🎨', productCount: 1450, active: true },
    { id: 5, name: 'Wood Crafts', icon: '🪵', productCount: 980, active: true },
  ];

  const tags = [
    { id: 1, name: 'Handmade', productCount: 4200 },
    { id: 2, name: 'Traditional', productCount: 3800 },
    { id: 3, name: 'Pakistani', productCount: 5600 },
    { id: 4, name: 'Embroidered', productCount: 1200 },
    { id: 5, name: 'Ceramic', productCount: 980 },
    { id: 6, name: 'Silver', productCount: 650 },
    { id: 7, name: 'Gift', productCount: 2100 },
    { id: 8, name: 'Home Decor', productCount: 1800 },
  ];

  const handleAdd = () => {
    setShowAddModal(true);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    console.log('Delete:', activeTab, id);
  };

  const handleSave = () => {
    console.log('Save:', activeTab, editingItem);
    setShowAddModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories & Tags Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage product categories and discovery tags</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add {activeTab === 'categories' ? 'Category' : 'Tag'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'tags'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tags ({tags.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{category.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.productCount} products</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        category.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{tag.name}</p>
                    <p className="text-xs text-gray-600">{tag.productCount} products</p>
                  </div>
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : 'Tag'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={editingItem?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${activeTab === 'categories' ? 'category' : 'tag'} name`}
                />
              </div>

              {activeTab === 'categories' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon/Emoji</label>
                    <input
                      type="text"
                      defaultValue={editingItem?.icon || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="🧵"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Icon Image</label>
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <div className="text-center">
                        <PhotoIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload icon</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;

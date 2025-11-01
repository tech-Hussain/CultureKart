import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, MegaphoneIcon, SparklesIcon } from '@heroicons/react/24/outline';

/**
 * CMS & Marketing Page
 * Manage homepage banners, featured content, promo codes
 */
const CMSMarketing = () => {
  const [activeTab, setActiveTab] = useState('banners'); // banners, featured, promos, announcements

  const banners = [
    {
      id: 1,
      title: 'Summer Sale 2024',
      description: 'Up to 50% off on traditional textiles',
      image: 'https://via.placeholder.com/800x300',
      link: '/shop/textiles',
      active: true,
      position: 1,
    },
    {
      id: 2,
      title: 'New Artisan Collection',
      description: 'Discover handcrafted pottery',
      image: 'https://via.placeholder.com/800x300',
      link: '/shop/pottery',
      active: true,
      position: 2,
    },
  ];

  const featuredArtisans = [
    { id: 1, name: 'Ahmed Khan', specialty: 'Textiles', sales: 12500, featured: true },
    { id: 2, name: 'Fatima Bibi', specialty: 'Jewelry', sales: 8900, featured: true },
    { id: 3, name: 'Ali Hassan', specialty: 'Pottery', sales: 18900, featured: false },
  ];

  const promoCodes = [
    {
      id: 1,
      code: 'SUMMER24',
      discount: 20,
      type: 'percentage',
      validUntil: '2024-08-31',
      usageCount: 145,
      maxUsage: 500,
      active: true,
    },
    {
      id: 2,
      code: 'NEWUSER',
      discount: 500,
      type: 'fixed',
      validUntil: '2024-12-31',
      usageCount: 89,
      maxUsage: 1000,
      active: true,
    },
  ];

  const announcements = [
    {
      id: 1,
      title: 'Platform Maintenance',
      message: 'Scheduled maintenance on July 1st from 2 AM to 4 AM',
      type: 'warning',
      active: true,
      createdDate: '2024-06-25',
    },
    {
      id: 2,
      title: 'New Features Released',
      message: 'Check out our new product recommendation engine!',
      type: 'info',
      active: true,
      createdDate: '2024-06-20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CMS & Marketing</h1>
          <p className="text-sm text-gray-600 mt-1">Manage homepage content and marketing campaigns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'banners'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Homepage Banners
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'featured'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Featured Artisans
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'promos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Promo Codes
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Announcements
          </button>
        </div>

        <div className="p-6">
          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <PlusIcon className="w-5 h-5" />
                <span>Add Banner</span>
              </button>

              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{banner.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{banner.description}</p>
                            <p className="text-xs text-gray-500 mt-2">Link: {banner.link}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Artisans Tab */}
          {activeTab === 'featured' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArtisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                          {artisan.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{artisan.name}</h3>
                          <p className="text-sm text-gray-600">{artisan.specialty}</p>
                        </div>
                      </div>
                      {artisan.featured && (
                        <SparklesIcon className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-lg font-bold text-green-600">Rs. {artisan.sales}</p>
                    </div>
                    <button
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        artisan.featured
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {artisan.featured ? 'Remove Featured' : 'Set as Featured'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promo Codes Tab */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <PlusIcon className="w-5 h-5" />
                <span>Create Promo Code</span>
              </button>

              <div className="space-y-4">
                {promoCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800 font-mono">{promo.code}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {promo.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-600">Discount</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {promo.type === 'percentage' ? `${promo.discount}%` : `Rs. ${promo.discount}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Valid Until</p>
                            <p className="text-sm font-medium text-gray-800">{promo.validUntil}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Usage</p>
                            <p className="text-sm font-medium text-gray-800">
                              {promo.usageCount} / {promo.maxUsage}
                            </p>
                          </div>
                          <div className="flex items-end space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <MegaphoneIcon className="w-5 h-5" />
                <span>Create Announcement</span>
              </button>

              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`rounded-lg border-2 p-6 ${
                      announcement.type === 'warning'
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-blue-50 border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <MegaphoneIcon
                            className={`w-6 h-6 ${
                              announcement.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                            }`}
                          />
                          <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              announcement.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {announcement.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                        <p className="text-xs text-gray-600">Created: {announcement.createdDate}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CMSMarketing;

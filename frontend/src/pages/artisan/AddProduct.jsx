/**
 * Add New Product Page
 * Comprehensive form for adding products to artisan store
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [productVideo, setProductVideo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    shortDescription: '',
    fullDescription: '',
    price: '',
    discountPrice: '',
    inventory: '',
    artisanCategory: '',
    shippingCost: '',
    deliveryTime: '',
  });

  const categories = [
    'Textiles & Fabrics',
    'Pottery & Ceramics',
    'Woodwork',
    'Jewelry',
    'Metalwork',
    'Hand-painted Items',
    'Embroidery',
    'Leather Goods',
    'Traditional Clothing',
    'Home Decor',
    'Other',
  ];

  const artisanCategories = [
    'Traditional Craft',
    'Modern Design',
    'Vintage Style',
    'Contemporary Art',
    'Heritage Craft',
    'Custom Made',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (productImages.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setProductImages((prev) => [...prev, ...newImages]);
    setError('');
  };

  const removeImage = (index) => {
    setProductImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setError('Video file size should be less than 50MB');
        return;
      }
      setProductVideo({
        file,
        preview: URL.createObjectURL(file),
      });
      setError('');
    }
  };

  const removeVideo = () => {
    if (productVideo) {
      URL.revokeObjectURL(productVideo.preview);
      setProductVideo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (productImages.length === 0) {
        setError('Please add at least one product image');
        setLoading(false);
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        setError('Price must be greater than 0');
        setLoading(false);
        return;
      }

      if (
        formData.discountPrice &&
        parseFloat(formData.discountPrice) >= parseFloat(formData.price)
      ) {
        setError('Discount price must be less than original price');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const uploadData = new FormData();
      Object.keys(formData).forEach((key) => {
        uploadData.append(key, formData[key]);
      });

      productImages.forEach((img) => {
        uploadData.append('images', img.file);
      });

      if (productVideo) {
        uploadData.append('video', productVideo.file);
      }

      // TODO: Replace with actual API call
      console.log('Product data:', formData);
      console.log('Images:', productImages.length);
      console.log('Video:', productVideo ? 'Yes' : 'No');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess('Product added successfully!');
      setTimeout(() => {
        navigate('/artisan/products');
      }, 2000);
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
        <p className="text-gray-600 mt-1">
          Fill in the details to add a new product to your store
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Traditional Kashmiri Carpet"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Artisan Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Artisan Category *
              </label>
              <select
                name="artisanCategory"
                value={formData.artisanCategory}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select Style</option>
                {artisanCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description *
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                maxLength="100"
                className="input-field"
                placeholder="Brief description (max 100 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/100 characters
              </p>
            </div>

            {/* Full Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleChange}
                required
                rows="5"
                className="input-field"
                placeholder="Detailed product description, materials used, craftsmanship details, etc."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pricing & Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (Rs) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Price (Rs)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input-field"
                placeholder="Optional discount price"
              />
            </div>

            {/* Inventory */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Inventory Quantity *
              </label>
              <input
                type="number"
                name="inventory"
                value={formData.inventory}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>

            {/* Shipping Cost */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shipping Cost (Rs) *
              </label>
              <input
                type="number"
                name="shippingCost"
                value={formData.shippingCost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
            </div>

            {/* Delivery Time */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Delivery Time *
              </label>
              <input
                type="text"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., 3-5 business days"
              />
            </div>
          </div>
        </div>

        {/* Media Upload Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Product Media
          </h2>

          {/* Images Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Images * (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-maroon-400 transition-colors">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block mt-3 px-4 py-2 bg-maroon-600 text-white rounded-lg cursor-pointer hover:bg-maroon-700 transition-colors"
              >
                Choose Images
              </label>
            </div>

            {/* Image Previews */}
            {productImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {productImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Video (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-maroon-400 transition-colors">
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Upload a product demonstration video
              </p>
              <p className="text-xs text-gray-500">MP4, MOV up to 50MB</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="inline-block mt-3 px-4 py-2 bg-maroon-600 text-white rounded-lg cursor-pointer hover:bg-maroon-700 transition-colors"
              >
                Choose Video
              </label>
            </div>

            {/* Video Preview */}
            {productVideo && (
              <div className="mt-4 relative">
                <video
                  src={productVideo.preview}
                  controls
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/artisan/products')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>

      {/* Cultural Footer Border */}
      <div className="mt-8 h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default AddProduct;

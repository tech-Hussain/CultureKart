/**
 * Create Product Page
 * Allows artisans to create new products with images
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ThemeBanner from '../components/ThemeBanner';

function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'Textiles',
    materials: '',
    dimensions: '',
    weight: '',
    tags: '',
  });

  // Image upload state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Categories
  const categories = [
    'Textiles',
    'Pottery',
    'Metal Work',
    'Woodwork',
    'Jewelry',
    'Decor',
    'Paintings',
    'Other',
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count (max 10 images)
    if (files.length + images.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const validPreviews = [];

    files.forEach((file) => {
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        setError(`Invalid file type: ${file.name}. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        validPreviews.push(reader.result);
        if (validPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...validPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages([...images, ...validFiles]);
    setError(null);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Product title is required');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      return false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Valid stock quantity is required');
      return false;
    }

    if (images.length === 0) {
      setError('At least one product image is required');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create FormData for multipart/form-data
      const submitData = new FormData();
      
      // Append form fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', parseFloat(formData.price));
      submitData.append('stock', parseInt(formData.stock));
      submitData.append('category', formData.category);
      
      if (formData.materials.trim()) {
        submitData.append('materials', formData.materials.trim());
      }
      
      if (formData.dimensions.trim()) {
        submitData.append('dimensions', formData.dimensions.trim());
      }
      
      if (formData.weight.trim()) {
        submitData.append('weight', formData.weight.trim());
      }
      
      // Handle tags (convert comma-separated string to array)
      if (formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        tagsArray.forEach(tag => {
          submitData.append('tags[]', tag);
        });
      }
      
      // Append images
      images.forEach((image) => {
        submitData.append('images', image);
      });

      // Get Firebase token from localStorage
      const token = localStorage.getItem('firebaseToken');
      
      // Submit to API with Authorization header
      const response = await api.post('/products', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSuccess(true);
        setError(null);
        
        // Show success message briefly then redirect
        setTimeout(() => {
          navigate(`/product/${response.data.product._id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to create product. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Success Message
  if (success) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-teal-700 mb-4">Success!</h2>
          <p className="text-gray-700 mb-4">
            Your product has been created and uploaded to IPFS.
          </p>
          <p className="text-sm text-gray-600">
            Redirecting to product page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Page Header with ThemeBanner */}
      <ThemeBanner size="medium" pattern="truckArt" title="Create New Product" subtitle="Share Your Craft with the World" />

      <div className="container mx-auto px-4 max-w-4xl py-8">

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Create Product Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-maroon-800 mb-4 pb-2 border-b">
              Basic Information
            </h2>

            {/* Product Title */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Hand-Embroidered Phulkari Dupatta"
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product, its story, craftsmanship, and unique features..."
                rows="6"
                className="input-field"
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 characters recommended
              </p>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Stock Row */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-maroon-800 mb-4 pb-2 border-b">
              Product Details
            </h2>

            {/* Materials */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Materials
              </label>
              <input
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                placeholder="e.g., Cotton, Silk threads, Natural dyes"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                List the materials used in crafting this product
              </p>
            </div>

            {/* Dimensions and Weight Row */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  placeholder="e.g., 20cm x 15cm x 10cm"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 500g"
                  className="input-field"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., handmade, traditional, punjabi, embroidered"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas for better searchability
              </p>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-maroon-800 mb-4 pb-2 border-b">
              Product Images *
            </h2>

            {/* Image Upload Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Images (Max 10)
              </label>
              <div className="border-2 border-dashed border-camel-300 rounded-lg p-8 text-center hover:border-camel-500 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-6xl mb-2">📸</div>
                  <p className="text-gray-700 font-semibold mb-1">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-500">
                    JPEG, PNG, GIF, WebP (Max 10MB each)
                  </p>
                </label>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Selected Images ({imagePreviews.length}/10)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-camel-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-teal-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  First image will be the main product image
                </p>
              </div>
            )}
          </div>

          {/* Blockchain Notice */}
          <div className="bg-gradient-to-r from-teal-50 to-camel-50 rounded-lg p-4 mb-6 border border-teal-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">⛓️ Blockchain Verification:</span> Your product
              will be uploaded to IPFS and registered on the Ethereum blockchain for
              authenticity verification. This process may take a few minutes.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Creating Product...
                </>
              ) : (
                '🚀 Create Product'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary px-8 py-3"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;

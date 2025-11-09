/**
 * Address Management Page
 * Add, edit, and manage delivery addresses
 * Supports: Manual entry, Current location, Map picker
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Navigation, 
  Map, 
  Save, 
  X,
  Loader
} from 'lucide-react';
import api from '../api/api';
import MapPicker from '../components/MapPicker';

const AddressesPage = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    postalCode: '',
    country: '',
    latitude: '',
    longitude: ''
  });

  // Load addresses on mount
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/auth/addresses');
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load addresses' 
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      addressLine: '',
      city: '',
      postalCode: '',
      country: '',
      latitude: '',
      longitude: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  // Get current location using browser geolocation
  const handleCurrentLocation = async () => {
    setGettingLocation(true);
    setMessage({ type: '', text: '' });

    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.address) {
            setFormData(prev => ({
              ...prev,
              addressLine: data.display_name || '',
              city: data.address.city || data.address.town || data.address.village || '',
              postalCode: data.address.postcode || '',
              country: data.address.country || '',
              latitude: latitude.toString(),
              longitude: longitude.toString()
            }));
            setMessage({ type: 'success', text: 'Location detected successfully!' });
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Still set coordinates even if reverse geocoding fails
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString()
          }));
          setMessage({ type: 'warning', text: 'Location set, but could not determine address. Please enter manually.' });
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setMessage({ type: 'error', text: 'Failed to get location. Please enable location permissions.' });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle map picker (opens in new modal)
  const handleMapPicker = () => {
    setShowMapPicker(true);
  };

  // Handle location selection from map
  const handleLocationSelect = (lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      addressLine: address || prev.addressLine,
    }));
    setShowMapPicker(false);
    setMessage({ type: 'success', text: 'Location selected from map!' });
  };

  // Save address (add or update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const addressData = {
        name: formData.name,
        phone: formData.phone,
        addressLine: formData.addressLine,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (editingId) {
        // Update existing address
        await api.put(`/auth/addresses/${editingId}`, addressData);
        setMessage({ type: 'success', text: 'Address updated successfully!' });
      } else {
        // Add new address
        await api.post('/auth/addresses', addressData);
        setMessage({ type: 'success', text: 'Address added successfully!' });
      }
      
      await loadAddresses();
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save address. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit address
  const handleEdit = (address) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      postalCode: address.postalCode || '',
      country: address.country,
      latitude: address.latitude || '',
      longitude: address.longitude || ''
    });
    setEditingId(address._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete address
  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await api.delete(`/auth/addresses/${addressId}`);
      setMessage({ type: 'success', text: 'Address deleted successfully!' });
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete address.' 
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to manage addresses.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
            <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
          </div>
          
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Address</span>
            </button>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' :
            message.type === 'error' ? 'bg-red-50 text-red-800' :
            message.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Location Methods */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gettingLocation ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Getting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleMapPicker}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Map className="w-5 h-5" />
                <span>Pick from Map</span>
              </button>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line *
                </label>
                <textarea
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  required
                  placeholder="House/Flat No., Street, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="Karachi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="75500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  placeholder="Pakistan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (Optional)
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="24.8607"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (Optional)
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="67.0011"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No addresses saved
              </h3>
              <p className="text-gray-500 mb-6">
                Add your first delivery address to make checkout faster
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Your First Address
                </button>
              )}
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {address.name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-1">{address.phone}</p>
                    <p className="text-gray-700 mb-2">{address.addressLine}</p>
                    <p className="text-gray-600">
                      {address.city}{address.postalCode ? ` - ${address.postalCode}` : ''}, {address.country}
                    </p>
                    
                    {(address.latitude && address.longitude) && (
                      <p className="text-sm text-gray-500 mt-2">
                        📍 {address.latitude}, {address.longitude}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMapPicker(false)}
          initialLat={formData.latitude ? parseFloat(formData.latitude) : null}
          initialLng={formData.longitude ? parseFloat(formData.longitude) : null}
        />
      )}
    </div>
  );
};

export default AddressesPage;

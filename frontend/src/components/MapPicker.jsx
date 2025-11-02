/**
 * Map Picker Component
 * Interactive map for selecting location coordinates with draggable marker
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Navigation, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and marker dragging
function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  const map = useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latlng = marker.getLatLng();
        setPosition({
          lat: latlng.lat,
          lng: latlng.lng,
        });
      }
    },
  };

  useEffect(() => {
    if (position.lat && position.lng) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return position.lat && position.lng ? (
    <Marker
      position={[position.lat, position.lng]}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  ) : null;
}

const MapPicker = ({ onLocationSelect, onClose, initialLat, initialLng }) => {
  const [selectedPosition, setSelectedPosition] = useState({
    lat: initialLat || 24.8607, // Default: Karachi
    lng: initialLng || 67.0011,
  });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPosition.lat && selectedPosition.lng) {
      getAddressFromCoords(selectedPosition.lat, selectedPosition.lng);
    }
  }, [selectedPosition]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setSelectedPosition(newPosition);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please check your permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedPosition.lat, selectedPosition.lng, address);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Pick Location on Map</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Interactive Leaflet Map */}
          <div className="relative w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
            <MapContainer
              center={[selectedPosition.lat, selectedPosition.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={selectedPosition} setPosition={setSelectedPosition} />
            </MapContainer>
          </div>

          {/* Map Interaction Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              🎯 <strong>Interactive Map:</strong> Click anywhere on the map or drag the marker to select a location. Coordinates will update automatically!
            </p>
          </div>

          {/* Coordinates Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Selected Location</p>
                <p className="text-sm text-gray-600 mb-2">
                  Latitude: {selectedPosition.lat.toFixed(6)}, Longitude: {selectedPosition.lng.toFixed(6)}
                </p>
                {loading ? (
                  <p className="text-xs text-gray-500">Loading address...</p>
                ) : address ? (
                  <p className="text-xs text-gray-700">{address}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Manual Coordinates Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={selectedPosition.lat}
                onChange={(e) =>
                  setSelectedPosition((prev) => ({
                    ...prev,
                    lat: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="24.8607"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={selectedPosition.lng}
                onChange={(e) =>
                  setSelectedPosition((prev) => ({
                    ...prev,
                    lng: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="67.0011"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex space-x-3">
              <button
                onClick={handleGetCurrentLocation}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
              >
                <Navigation className="w-4 h-4" />
                <span>Use Current Location</span>
              </button>
              <button
                onClick={() => window.open(`https://www.openstreetmap.org/#map=15/${selectedPosition.lat}/${selectedPosition.lng}`, '_blank')}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1"
              >
                <MapIcon className="w-4 h-4" />
                <span>Open Full Map</span>
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Confirm Location
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;

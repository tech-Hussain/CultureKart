/**
 * Seller Dashboard Page (Artisan)
 */
import ThemeBanner from '../components/ThemeBanner';

function SellerDashboard() {
  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Page Header with ThemeBanner */}
      <ThemeBanner size="medium" pattern="truckArt" title="Artisan Studio" subtitle="Manage Your Craft & Sales" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Products</h3>
            <p className="text-3xl font-bold text-maroon-600">0</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Orders</h3>
            <p className="text-3xl font-bold text-teal-600">0</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-camel-600">$0</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Rating</h3>
            <p className="text-3xl font-bold text-maroon-600">0.0</p>
          </div>
        </div>
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-maroon-800">My Products</h2>
            <button className="btn-primary">Add Product</button>
          </div>
          <p className="text-gray-600">Your products will appear here.</p>
        </div>
        <div className="card">
          <h2 className="text-2xl font-bold text-maroon-800 mb-4">Recent Sales</h2>
          <p className="text-gray-600">Your sales history will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;

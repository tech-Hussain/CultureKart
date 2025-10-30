/**
 * Buyer Dashboard Page
 */

function BuyerDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Buyer Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Favorites</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-primary-600">$0</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <p className="text-gray-600">Your order history will appear here.</p>
      </div>
    </div>
  );
}

export default BuyerDashboard;

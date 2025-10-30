/**
 * Admin Dashboard Page with Analytics
 * Protected route - requires admin role
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import ThemeBanner from '../components/ThemeBanner';

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  // Dashboard data state
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalArtisans: 0,
    artisansPending: 0,
    artisansVerified: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentSales: { revenue: 0, orderCount: 0 },
  });

  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [pendingArtisans, setPendingArtisans] = useState([]);
  const [approvingArtisan, setApprovingArtisan] = useState(null);

  // Verify admin access on mount
  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const response = await api.get('/auth/profile');
        
        if (response.data.success && response.data.user.role === 'admin') {
          setAuthorized(true);
          fetchDashboardData();
        } else {
          setError('Access denied. Admin privileges required.');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (err) {
        console.error('Authorization error:', err);
        setError('Failed to verify admin access');
        setTimeout(() => navigate('/auth'), 2000);
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary, monthly sales, top products, and pending artisans in parallel
      const [summaryRes, salesRes, topProductsRes, artisansRes] = await Promise.all([
        api.get('/admin/summary'),
        api.get('/admin/sales-monthly'),
        api.get('/admin/top-products'),
        api.get('/admin/artisans?verified=false&limit=20'),
      ]);

      // Set summary data
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
      }

      // Set monthly sales data
      if (salesRes.data.success) {
        setMonthlySales(salesRes.data.monthly || []);
      }

      // Set top products data
      if (topProductsRes.data.success) {
        setTopProducts(topProductsRes.data.topBySales || []);
      }

      // Set pending artisans
      if (artisansRes.data.success) {
        setPendingArtisans(artisansRes.data.artisans || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Handle artisan approval
  const handleApproveArtisan = async (artisanId) => {
    try {
      setApprovingArtisan(artisanId);
      
      const response = await api.patch(`/admin/artisans/${artisanId}/approve`);
      
      if (response.data.success) {
        // Remove approved artisan from pending list
        setPendingArtisans(pendingArtisans.filter(a => a._id !== artisanId));
        
        // Update summary counts
        setSummary({
          ...summary,
          artisansPending: summary.artisansPending - 1,
          artisansVerified: summary.artisansVerified + 1,
        });
      }
    } catch (err) {
      console.error('Error approving artisan:', err);
      alert(err.response?.data?.message || 'Failed to approve artisan');
    } finally {
      setApprovingArtisan(null);
    }
  };

  // Handle artisan rejection
  const handleRejectArtisan = async (artisanId) => {
    if (!confirm('Are you sure you want to reject this artisan application?')) {
      return;
    }

    try {
      setApprovingArtisan(artisanId);
      
      const response = await api.patch(`/admin/artisans/${artisanId}/reject`);
      
      if (response.data.success) {
        setPendingArtisans(pendingArtisans.filter(a => a._id !== artisanId));
        setSummary({
          ...summary,
          artisansPending: summary.artisansPending - 1,
        });
      }
    } catch (err) {
      console.error('Error rejecting artisan:', err);
      alert(err.response?.data?.message || 'Failed to reject artisan');
    } finally {
      setApprovingArtisan(null);
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-camel-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'revenue' ? `$${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Access denied screen
  if (!authorized && error) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-maroon-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Page Header with ThemeBanner */}
      <ThemeBanner size="medium" pattern="ajrak" title="Admin Dashboard" subtitle="Platform Overview & Management" />

      <div className="container mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 uppercase">Total Users</h3>
            <p className="text-4xl font-bold text-maroon-600">{summary.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">Registered accounts</p>
          </div>
          
          <div className="card hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 uppercase">Artisans</h3>
            <p className="text-4xl font-bold text-teal-600">{summary.artisansVerified}</p>
            <div className="flex gap-4 text-xs text-gray-500 mt-2">
              <span>✅ {summary.artisansVerified} verified</span>
              <span>⏳ {summary.artisansPending} pending</span>
            </div>
          </div>
          
          <div className="card hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 uppercase">Products</h3>
            <p className="text-4xl font-bold text-camel-600">{summary.totalProducts}</p>
            <p className="text-xs text-gray-500 mt-2">Active listings</p>
          </div>
          
          <div className="card hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 uppercase">Total Orders</h3>
            <p className="text-4xl font-bold text-maroon-600">{summary.totalOrders}</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>
        </div>

        {/* Recent Sales Summary */}
        <div className="card mb-8 bg-gradient-to-r from-teal-50 to-camel-50 border-2 border-teal-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Last 30 Days</h3>
              <p className="text-3xl font-bold text-teal-700">
                ${summary.recentSales?.revenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-600">
                {summary.recentSales?.orderCount || 0} orders • 
                Avg: ${summary.recentSales?.averageOrderValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-6xl">📈</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="card">
            <h2 className="text-2xl font-bold text-maroon-800 mb-6">Monthly Revenue (12 Months)</h2>
            {monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#c74040" 
                    strokeWidth={3}
                    dot={{ fill: '#c74040', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No sales data available</p>
            )}
          </div>

          {/* Top Products Chart */}
          <div className="card">
            <h2 className="text-2xl font-bold text-maroon-800 mb-6">Top 10 Products by Sales</h2>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    stroke="#6b7280" 
                    style={{ fontSize: '10px' }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="soldCount" 
                    fill="#14b8a6" 
                    name="Units Sold"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No product data available</p>
            )}
          </div>
        </div>

        {/* Pending Artisan Approvals */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-maroon-800">
              Pending Artisan Approvals ({pendingArtisans.length})
            </h2>
            <button
              onClick={fetchDashboardData}
              className="btn-secondary text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {pendingArtisans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-600 text-lg">No pending artisan approvals</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-camel-100 border-b-2 border-camel-300">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Artisan Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Specialty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Applied</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingArtisans.map((artisan) => (
                    <tr key={artisan._id} className="border-b hover:bg-ivory-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{artisan.displayName}</p>
                          <p className="text-sm text-gray-600">{artisan.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 bg-camel-100 text-camel-800 text-sm rounded-full">
                          {artisan.specialty || 'Not specified'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        📍 {artisan.location || 'Not specified'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(artisan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApproveArtisan(artisan._id)}
                            disabled={approvingArtisan === artisan._id}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {approvingArtisan === artisan._id ? '⏳' : '✅'} Approve
                          </button>
                          <button
                            onClick={() => handleRejectArtisan(artisan._id)}
                            disabled={approvingArtisan === artisan._id}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

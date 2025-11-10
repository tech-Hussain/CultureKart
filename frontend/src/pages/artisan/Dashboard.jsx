/**
 * Artisan Dashboard Home Page
 * Overview with stats, charts, and quick actions
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  EyeIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Import artisan services
import {
  getDashboardStats,
  getDashboardAnalytics,
  getTopProducts,
  formatCurrency,
  formatPercentage,
} from '../../services/artisanService';

function ArtisanDashboard() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError('');

      // Fetch all data in parallel
      const [statsResponse, analyticsResponse, topProductsResponse] = await Promise.all([
        getDashboardStats(),
        getDashboardAnalytics('week'),
        getTopProducts(4),
      ]);

      setStats(statsResponse.data.data || {});
      setAnalytics(analyticsResponse.data.data || {});
      setTopProducts(topProductsResponse.data.data || []);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Transform stats for display
  const getStatsCards = () => {
    if (!stats) return [];

    return [
      {
        title: 'Total Sales',
        value: stats.totalSales?.formatted || 'Rs 0',
        change: formatPercentage(stats.totalSales?.change || 0),
        isPositive: stats.totalSales?.isPositive !== false,
        icon: BanknotesIcon,
        bgColor: 'from-emerald-500 to-teal-600',
      },
      {
        title: 'Total Orders',
        value: stats.totalOrders?.formatted || '0',
        change: formatPercentage(stats.totalOrders?.change || 0),
        isPositive: stats.totalOrders?.isPositive !== false,
        icon: ShoppingBagIcon,
        bgColor: 'from-amber-500 to-orange-600',
      },
      {
        title: 'Monthly Revenue',
        value: stats.monthlyRevenue?.formatted || 'Rs 0',
        change: formatPercentage(stats.monthlyRevenue?.change || 0),
        isPositive: stats.monthlyRevenue?.isPositive !== false,
        icon: ChartBarIcon,
        bgColor: 'from-maroon-500 to-rose-600',
      },
      {
        title: 'Store Views',
        value: stats.storeViews?.formatted || '0',
        change: formatPercentage(stats.storeViews?.change || 0),
        isPositive: stats.storeViews?.isPositive !== false,
        icon: EyeIcon,
        bgColor: 'from-purple-500 to-indigo-600',
      },
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Dashboard Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statsCards = getStatsCards();
  const pendingOrders = stats?.pendingOrders || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            to="/artisan/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add Product
          </Link>
          <Link
            to="/artisan/orders"
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-maroon-600 text-maroon-600 rounded-lg hover:bg-maroon-50 transition-all duration-200"
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            View Orders
          </Link>
        </div>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {pendingOrders} Pending Orders
                </h3>
                <p className="text-sm text-gray-600">
                  You have orders waiting to be processed
                </p>
              </div>
            </div>
            <Link
              to="/artisan/orders"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className={`bg-gradient-to-br ${stat.bgColor} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-10 h-10 text-white opacity-90" />
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    stat.isPositive
                      ? 'bg-white bg-opacity-30 text-white'
                      : 'bg-black bg-opacity-20 text-white'
                  }`}
                >
                  {stat.isPositive ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Weekly Sales Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.weeklySales || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#7C2D12"
                strokeWidth={3}
                dot={{ fill: '#D97706', r: 5 }}
                activeDot={{ r: 7 }}
                name="Sales (Rs)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.categoryData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(analytics?.categoryData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance Bar Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Product Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics?.productPerformance || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="sales" fill="#D97706" name="Units Sold" />
            <Bar dataKey="revenue" fill="#7C2D12" name="Revenue (Rs)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Selling Products Widget */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Top Selling Products
          </h3>
          <Link
            to="/artisan/products"
            className="text-sm text-maroon-600 hover:text-maroon-700 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-4">
          {topProducts && topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  {typeof product.image === 'string' && product.image.startsWith('http') ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    product.image || '🎨'
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{product.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {product.sales} sales
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    product.trend === 'up'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  )}
                  {index === 0 ? 'Hot' : product.trend === 'up' ? 'Rising' : 'Falling'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No products data available</p>
              <Link
                to="/artisan/products/add"
                className="inline-block mt-2 text-maroon-600 hover:text-maroon-700 font-medium"
              >
                Add your first product →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default ArtisanDashboard;

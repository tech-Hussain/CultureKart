/**
 * Artisan Dashboard Home Page
 * Overview with stats, charts, and quick actions
 */
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

function ArtisanDashboard() {
  // Sample data - will be replaced with real API data
  const stats = [
    {
      title: 'Total Sales',
      value: 'Rs 125,430',
      change: '+12.5%',
      isPositive: true,
      icon: BanknotesIcon,
      bgColor: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Total Orders',
      value: '156',
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBagIcon,
      bgColor: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Monthly Revenue',
      value: 'Rs 45,200',
      change: '+18.7%',
      isPositive: true,
      icon: ChartBarIcon,
      bgColor: 'from-maroon-500 to-rose-600',
    },
    {
      title: 'Store Views',
      value: '2,341',
      change: '-3.1%',
      isPositive: false,
      icon: EyeIcon,
      bgColor: 'from-purple-500 to-indigo-600',
    },
  ];

  const pendingOrders = 8;

  // Weekly sales data
  const weeklySalesData = [
    { day: 'Mon', sales: 4200 },
    { day: 'Tue', sales: 5800 },
    { day: 'Wed', sales: 4100 },
    { day: 'Thu', sales: 7200 },
    { day: 'Fri', sales: 6500 },
    { day: 'Sat', sales: 8900 },
    { day: 'Sun', sales: 9300 },
  ];

  // Product performance data
  const productPerformanceData = [
    { name: 'Handwoven Carpets', sales: 45, revenue: 23400 },
    { name: 'Pottery', sales: 32, revenue: 15600 },
    { name: 'Embroidered Shawls', sales: 28, revenue: 18900 },
    { name: 'Wooden Crafts', sales: 21, revenue: 12300 },
    { name: 'Jewelry', sales: 18, revenue: 9800 },
  ];

  // Category distribution for pie chart
  const categoryData = [
    { name: 'Textiles', value: 35, color: '#D97706' },
    { name: 'Pottery', value: 25, color: '#7C2D12' },
    { name: 'Woodwork', value: 20, color: '#059669' },
    { name: 'Jewelry', value: 15, color: '#9333EA' },
    { name: 'Other', value: 5, color: '#6B7280' },
  ];

  // Top selling products
  const topProducts = [
    {
      id: 1,
      name: 'Traditional Kashmiri Carpet',
      sales: 45,
      revenue: 23400,
      image: '🏺',
      trend: 'up',
    },
    {
      id: 2,
      name: 'Handmade Ceramic Vase',
      sales: 32,
      revenue: 15600,
      image: '🏺',
      trend: 'up',
    },
    {
      id: 3,
      name: 'Embroidered Pashmina Shawl',
      sales: 28,
      revenue: 18900,
      image: '🧣',
      trend: 'up',
    },
    {
      id: 4,
      name: 'Walnut Wood Carved Box',
      sales: 21,
      revenue: 12300,
      image: '📦',
      trend: 'down',
    },
  ];

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
        {stats.map((stat, index) => (
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
            <LineChart data={weeklySalesData}>
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
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
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
          <BarChart data={productPerformanceData}>
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
          {topProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                {product.image}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{product.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600">
                    {product.sales} sales
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    Rs {product.revenue.toLocaleString()}
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
          ))}
        </div>
      </div>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default ArtisanDashboard;

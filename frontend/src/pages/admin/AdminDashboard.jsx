import { 
  UsersIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Admin Dashboard Overview
 * Main dashboard with platform statistics, charts, and activity feed
 * Professional and analytical design
 */
const AdminDashboard = () => {
  // Sample data - Replace with real API calls
  const stats = [
    {
      title: 'Total Buyers',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: UsersIcon,
      color: 'blue',
    },
    {
      title: 'Total Artisans',
      value: '423',
      change: '+8.2%',
      trend: 'up',
      icon: UsersIcon,
      color: 'green',
    },
    {
      title: 'Active Artisans',
      value: '356',
      change: '+5.4%',
      trend: 'up',
      icon: CheckCircleIcon,
      color: 'teal',
    },
    {
      title: 'Products Listed',
      value: '8,234',
      change: '+18.7%',
      trend: 'up',
      icon: ShoppingBagIcon,
      color: 'purple',
    },
    {
      title: 'Pending Approval',
      value: '47',
      change: '-3 today',
      trend: 'neutral',
      icon: ClockIcon,
      color: 'orange',
    },
    {
      title: 'Total Orders',
      value: '15,672',
      change: '+23.1%',
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'indigo',
    },
    {
      title: 'Platform Revenue',
      value: '$234,567',
      change: '+15.3%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'emerald',
    },
    {
      title: 'Pending Withdrawals',
      value: '23',
      change: '+5 today',
      trend: 'neutral',
      icon: ExclamationTriangleIcon,
      color: 'red',
    },
  ];

  // Monthly Revenue Data
  const revenueData = [
    { month: 'Jan', revenue: 45000, commission: 4500 },
    { month: 'Feb', revenue: 52000, commission: 5200 },
    { month: 'Mar', revenue: 48000, commission: 4800 },
    { month: 'Apr', revenue: 61000, commission: 6100 },
    { month: 'May', revenue: 55000, commission: 5500 },
    { month: 'Jun', revenue: 67000, commission: 6700 },
  ];

  // Orders Per Month Data
  const ordersData = [
    { month: 'Jan', orders: 1200 },
    { month: 'Feb', orders: 1450 },
    { month: 'Mar', orders: 1380 },
    { month: 'Apr', orders: 1690 },
    { month: 'May', orders: 1550 },
    { month: 'Jun', orders: 1820 },
  ];

  // Artisan vs Buyer Signup Data
  const signupData = [
    { month: 'Jan', artisans: 35, buyers: 280 },
    { month: 'Feb', artisans: 42, buyers: 320 },
    { month: 'Mar', artisans: 38, buyers: 295 },
    { month: 'Apr', artisans: 51, buyers: 380 },
    { month: 'May', artisans: 45, buyers: 350 },
    { month: 'Jun', artisans: 48, buyers: 410 },
  ];

  // Category Performance Data
  const categoryData = [
    { name: 'Textiles', value: 2850, color: '#0088FE' },
    { name: 'Pottery', value: 1820, color: '#00C49F' },
    { name: 'Jewelry', value: 2150, color: '#FFBB28' },
    { name: 'Paintings', value: 1450, color: '#FF8042' },
    { name: 'Wood Crafts', value: 980, color: '#8884D8' },
  ];

  // Top Selling Categories
  const topCategories = [
    { name: 'Traditional Textiles', sales: 2850, growth: '+15%' },
    { name: 'Handmade Jewelry', sales: 2150, growth: '+12%' },
    { name: 'Ceramic Pottery', sales: 1820, growth: '+8%' },
    { name: 'Wall Art', sales: 1450, growth: '+10%' },
    { name: 'Wood Furniture', sales: 980, growth: '+5%' },
  ];

  // Real-time Activity Feed
  const activities = [
    { id: 1, type: 'order', message: 'New order #15672 placed', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'product', message: 'Product pending approval from Artisan #234', time: '5 minutes ago', status: 'warning' },
    { id: 3, type: 'withdrawal', message: 'Withdrawal request $1,250 from Artisan #156', time: '12 minutes ago', status: 'info' },
    { id: 4, type: 'user', message: 'New artisan registered: Fatima Crafts', time: '23 minutes ago', status: 'success' },
    { id: 5, type: 'dispute', message: 'Dispute raised for order #15641', time: '45 minutes ago', status: 'danger' },
    { id: 6, type: 'order', message: 'Order #15670 marked as delivered', time: '1 hour ago', status: 'success' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      teal: 'bg-teal-100 text-teal-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      red: 'bg-red-100 text-red-600',
    };
    return colors[color] || colors.blue;
  };

  const getActivityColor = (status) => {
    const colors = {
      success: 'bg-green-100 text-green-700 border-green-300',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      info: 'bg-blue-100 text-blue-700 border-blue-300',
      danger: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || colors.info;
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-600 mt-1">Platform statistics and analytics</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ClockIcon className="w-5 h-5" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 space-x-1">
                  {stat.trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue & Commission</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Revenue" />
              <Area type="monotone" dataKey="commission" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Commission" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Per Month Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders Per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#6366f1" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artisan vs Buyer Signups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Signups</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="artisans" stroke="#10b981" strokeWidth={2} name="Artisans" />
              <Line type="monotone" dataKey="buyers" stroke="#3b82f6" strokeWidth={2} name="Buyers" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

        {/* Top Selling Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{category.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{category.sales} sales</p>
                </div>
                <span className="text-xs font-semibold text-green-600">{category.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Real-Time Activity Feed</h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${getActivityColor(activity.status)}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
              </div>
              <span className="text-xs font-medium ml-4">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

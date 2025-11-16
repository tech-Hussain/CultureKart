import { useState, useEffect } from 'react';
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardSummary, getMonthlySales } from '../../services/adminService';

/**
 * Admin Dashboard Overview
 * Main dashboard with platform statistics, charts, and activity feed
 * Professional and analytical design
 */
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, salesRes] = await Promise.all([
          getDashboardSummary(),
          getMonthlySales()
        ]);

        console.log('📊 Dashboard data:', summaryRes.data, salesRes.data);
        
        setSummary(summaryRes.data?.data || summaryRes.data);
        setMonthlySales(salesRes.data?.data?.monthly || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">Failed to load dashboard</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  // Build stats array from real data
  const stats = [
    {
      title: 'Total Buyers',
      value: summary.users?.total || 0,
      change: '+12.5%',
      trend: 'up',
      icon: UsersIcon,
      color: 'blue',
    },
    {
      title: 'Total Artisans',
      value: summary.artisans?.total || 0,
      change: summary.artisans?.approvalRate ? `${summary.artisans.approvalRate}% verified` : '0%',
      trend: 'up',
      icon: UsersIcon,
      color: 'green',
    },
    {
      title: 'Active Artisans',
      value: summary.artisans?.verified || 0,
      change: `${summary.artisans?.pending || 0} pending`,
      trend: 'neutral',
      icon: CheckCircleIcon,
      color: 'teal',
    },
    {
      title: 'Products Listed',
      value: summary.products?.total || 0,
      change: `${summary.products?.active || 0} active`,
      trend: 'up',
      icon: ShoppingBagIcon,
      color: 'purple',
    },
    {
      title: 'Pending Approval',
      value: summary.artisans?.pending || 0,
      change: 'Artisans',
      trend: 'neutral',
      icon: ClockIcon,
      color: 'orange',
    },
    {
      title: 'Total Orders',
      value: summary.orders?.total || 0,
      change: `${summary.orders?.completionRate || 0}% completed`,
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'indigo',
    },
    {
      title: 'Revenue (30 Days)',
      value: `Rs ${(summary.sales?.last30Days?.revenue || 0).toLocaleString()}`,
      change: `${summary.sales?.last30Days?.orderCount || 0} orders`,
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'emerald',
    },
    {
      title: 'Avg Order Value',
      value: `Rs ${parseFloat(summary.sales?.last30Days?.averageOrderValue || 0).toLocaleString()}`,
      change: 'Last 30 days',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'red',
    },
  ];

  // Format monthly data for charts
  const revenueData = monthlySales.slice(-6).map(item => ({
    month: item.month,
    revenue: item.revenue,
    commission: Math.round(item.revenue * 0.1), // 10% commission
  }));

  const ordersData = monthlySales.slice(-6).map(item => ({
    month: item.month,
    orders: item.orderCount,
  }));

  // Recent activity from summary
  const activities = (summary.recentActivity || []).slice(0, 6).map((order) => ({
    id: order._id,
    type: 'order',
    message: `Order #${order._id.slice(-6)} - ${order.status} - Rs ${order.total?.toLocaleString()}`,
    time: new Date(order.createdAt).toLocaleDateString(),
    status: order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'info',
  }));

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

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders Activity</h3>
        <div className="space-y-3">
          {activities.length > 0 ? activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${getActivityColor(activity.status)}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
              </div>
              <span className="text-xs font-medium ml-4">{activity.time}</span>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

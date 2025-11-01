/**
 * Sales Analytics Page
 * Comprehensive analytics and reports
 */
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

function Analytics() {
  // Sample data
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000, orders: 32 },
    { month: 'Feb', revenue: 52000, orders: 38 },
    { month: 'Mar', revenue: 48000, orders: 35 },
    { month: 'Apr', revenue: 61000, orders: 45 },
    { month: 'May', revenue: 58000, orders: 42 },
    { month: 'Jun', revenue: 72000, orders: 51 },
    { month: 'Jul', revenue: 68000, orders: 48 },
    { month: 'Aug', revenue: 79000, orders: 56 },
    { month: 'Sep', revenue: 85000, orders: 62 },
    { month: 'Oct', revenue: 91000, orders: 68 },
  ];

  const categoryPerformance = [
    { category: 'Textiles', revenue: 125000, growth: 15 },
    { category: 'Pottery', revenue: 98000, growth: 12 },
    { category: 'Woodwork', revenue: 76000, growth: 8 },
    { category: 'Jewelry', revenue: 65000, growth: 18 },
    { category: 'Clothing', revenue: 89000, growth: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Sales Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your sales performance and business growth
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">Rs 684,000</p>
          <p className="text-sm mt-2">+23.4% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Total Orders</p>
          <p className="text-3xl font-bold mt-2">477</p>
          <p className="text-sm mt-2">+18.2% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-maroon-500 to-rose-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Avg Order Value</p>
          <p className="text-3xl font-bold mt-2">Rs 1,434</p>
          <p className="text-sm mt-2">+5.1% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Conversion Rate</p>
          <p className="text-3xl font-bold mt-2">12.8%</p>
          <p className="text-sm mt-2">+2.3% from last period</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Monthly Revenue & Orders
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={monthlyRevenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C2D12" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#7C2D12" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7C2D12"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue (Rs)"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#D97706"
              strokeWidth={2}
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Category Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#7C2D12" name="Revenue (Rs)" />
            <Bar dataKey="growth" fill="#D97706" name="Growth %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cultural Footer Border */}
      <div className="h-2 bg-gradient-to-r from-maroon-500 via-amber-400 to-orange-500 rounded-full" />
    </div>
  );
}

export default Analytics;

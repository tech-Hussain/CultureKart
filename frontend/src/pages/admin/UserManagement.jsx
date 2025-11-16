import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  NoSymbolIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getUsers } from '../../services/adminService';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        role: filterType === 'all' ? undefined : filterType,
      };

      const response = await getUsers(params);
      const data = response.data?.data || response.data;
      
      setUsers(data.users || []);
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: pagination.limit,
        role: filterType === 'all' ? undefined : filterType,
        search: searchTerm,
      };

      const response = await getUsers(params);
      const data = response.data?.data || response.data;
      
      setUsers(data.users || []);
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        isActive 
          ? 'bg-green-100 text-green-700 border-green-300' 
          : 'bg-red-100 text-red-700 border-red-300'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      artisan: 'bg-purple-100 text-purple-700',
      buyer: 'bg-blue-100 text-blue-700',
      admin: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[role] || colors.buyer}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  const totalUsers = pagination.total;
  const buyerCount = users.filter(u => u.role === 'buyer').length;
  const artisanCount = users.filter(u => u.role === 'artisan').length;
  const inactiveCount = users.filter(u => !u.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage all platform users and artisans</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Buyers</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{buyerCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Artisans</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{artisanCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Inactive</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{inactiveCount}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <button
              onClick={() => { setFilterType('all'); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilterType('buyer'); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'buyer' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Buyers
            </button>
            <button
              onClick={() => { setFilterType('artisan'); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'artisan' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Artisans
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{user.name || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {user.artisan?.location || user.profile?.city || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(user.isActive)}
                          {user.role === 'artisan' && user.artisan && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.artisan.isVerified 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {user.artisan.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {user.isActive ? (
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Suspend">
                              <NoSymbolIcon className="w-5 h-5" />
                            </button>
                          ) : (
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Activate">
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total users)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

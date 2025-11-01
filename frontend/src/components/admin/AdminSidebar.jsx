import { NavLink } from 'react-router-dom';
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TagIcon,
  MegaphoneIcon,
  LifebuoyIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

/**
 * AdminSidebar Component
 * Navigation sidebar for admin dashboard
 * Professional, minimal design for administrative tasks
 */
const AdminSidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { path: '/admin/users', name: 'User Management', icon: UsersIcon },
    { path: '/admin/products', name: 'Product Management', icon: ShoppingBagIcon },
    { path: '/admin/orders', name: 'Order Monitoring', icon: ShoppingCartIcon },
    { path: '/admin/payouts', name: 'Payout Management', icon: CurrencyDollarIcon },
    { path: '/admin/categories', name: 'Categories & Tags', icon: TagIcon },
    { path: '/admin/cms', name: 'CMS & Marketing', icon: MegaphoneIcon },
    { path: '/admin/support', name: 'Support & Tickets', icon: LifebuoyIcon },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      {/* Admin Logo/Title */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Squares2X2Icon className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin Info Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center">
          <p className="font-semibold text-slate-300">CultureKart Admin</p>
          <p className="mt-1">Platform Management System</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

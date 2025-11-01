/**
 * Artisan Dashboard Sidebar Navigation
 */
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  PlusCircleIcon,
  CubeIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  WalletIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/artisan/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Add Product',
      path: '/artisan/products/add',
      icon: PlusCircleIcon,
    },
    {
      name: 'Manage Products',
      path: '/artisan/products',
      icon: CubeIcon,
    },
    {
      name: 'Orders',
      path: '/artisan/orders',
      icon: ShoppingBagIcon,
    },
    {
      name: 'Analytics',
      path: '/artisan/analytics',
      icon: ChartBarIcon,
    },
    {
      name: 'Wallet',
      path: '/artisan/wallet',
      icon: WalletIcon,
    },
    {
      name: 'Withdraw',
      path: '/artisan/withdraw',
      icon: BanknotesIcon,
    },
    {
      name: 'Messages',
      path: '/artisan/messages',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Settings',
      path: '/artisan/settings',
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-maroon-800 via-maroon-700 to-maroon-900 text-white shadow-2xl z-30 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top spacing for navbar */}
        <div className="h-[66px]"></div>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-maroon-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="text-lg font-bold text-amber-100">Artisan Panel</h2>
              <p className="text-xs text-amber-300">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-lg scale-105'
                        : 'text-amber-100 hover:bg-maroon-600 hover:text-white hover:translate-x-1'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer - Cultural Design Element */}
        <div className="p-4 border-t border-maroon-600">
          <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full mb-3" />
          <div className="text-center text-xs text-amber-200">
            <p>🎨 Artisan Dashboard</p>
            <p className="text-amber-300 mt-1">Empowering Craftsmen</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

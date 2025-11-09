/**
 * Footer Component - Cultural Pakistani Theme
 */
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-900 text-white relative overflow-hidden">
      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Top Decorative Border */}
        <div className="border-t-4 border-camel-400 mb-8 w-32 mx-auto"></div>

        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4 text-camel-300 flex items-center justify-center md:justify-start">
              <span className="text-3xl mr-2">🏺</span>
              CultureKart
            </h3>
            <p className="text-ivory-200 text-sm leading-relaxed">
              Preserving Pakistan's rich cultural heritage through authentic handicrafts. 
              <span className="block mt-2 text-camel-300 font-semibold">⛓️ Blockchain-Verified Authenticity</span>
            </p>
          </div>

          {/* Explore */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-4 text-camel-200 border-b border-camel-600 pb-2">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-ivory-200 hover:text-camel-300 transition-colors text-sm flex items-center justify-center md:justify-start">
                  <span className="mr-2">🏠</span> Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-ivory-200 hover:text-camel-300 transition-colors text-sm flex items-center justify-center md:justify-start">
                  <span className="mr-2">🛍️</span> Shop Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-ivory-200 hover:text-camel-300 transition-colors text-sm flex items-center justify-center md:justify-start">
                  <span className="mr-2">🛒</span> Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-ivory-200 hover:text-camel-300 transition-colors text-sm flex items-center justify-center md:justify-start">
                  <span className="mr-2">📦</span> Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-4 text-camel-200 border-b border-camel-600 pb-2">Crafts</h4>
            <ul className="space-y-2 text-ivory-200 text-sm">
              <li className="flex items-center justify-center md:justify-start">
                <span className="mr-2">🧵</span> Textiles
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <span className="mr-2">🏺</span> Pottery
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <span className="mr-2">💎</span> Jewelry
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <span className="mr-2">🎨</span> Paintings
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-4 text-camel-200 border-b border-camel-600 pb-2">Connect</h4>
            <ul className="space-y-3 text-ivory-200 text-sm">
              <li className="flex items-center justify-center md:justify-start">
                <span className="mr-2">📧</span> support@culturekart.pk
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <span className="mr-2">📱</span> +92 XXX XXXXXXX
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <span className="mr-2">📍</span> Pakistan
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 mt-4">
                <a href="#" className="text-camel-300 hover:text-camel-200 transition-colors text-xl">
                  📘
                </a>
                <a href="#" className="text-camel-300 hover:text-camel-200 transition-colors text-xl">
                  📷
                </a>
                <a href="#" className="text-camel-300 hover:text-camel-200 transition-colors text-xl">
                  🐦
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center my-8">
          <div className="border-t border-camel-600 flex-1"></div>
          <div className="px-4 text-camel-400 text-2xl">✦</div>
          <div className="border-t border-camel-600 flex-1"></div>
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <p className="text-ivory-200 text-sm mb-2">
            <span className="text-camel-300 font-bold">Preserving Culture</span> • <span className="text-teal-400 font-bold">Empowering Artisans</span> • <span className="text-camel-300 font-bold">Authentic Crafts</span>
          </p>
          <p className="text-ivory-300 text-xs">
            &copy; {currentYear} CultureKart. All rights reserved. Made with ❤️ in Pakistan
          </p>
          <p className="text-camel-400 text-xs mt-2 font-semibold">
            🔒 Secure Payments • 🚚 Nationwide Delivery • ⛓️ Blockchain Verified
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

/**
 * Footer Component
 */
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-maroon-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-camel-300">🏺 CultureKart</h3>
            <p className="text-ivory-100">
              Connecting Pakistani artisans with global buyers through blockchain-verified authentic crafts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-camel-200">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-ivory-100 hover:text-camel-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-ivory-100 hover:text-camel-300 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-ivory-100 hover:text-camel-300 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* For Artisans */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-camel-200">For Artisans</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/seller" className="text-ivory-100 hover:text-camel-300 transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-ivory-100 hover:text-camel-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-ivory-100 hover:text-camel-300 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-camel-200">Contact</h4>
            <ul className="space-y-2 text-ivory-100">
              <li>Email: support@culturekart.com</li>
              <li>Phone: +92 XXX XXXXXXX</li>
              <li>Location: Pakistan</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-maroon-700 mt-8 pt-8 text-center text-ivory-100">
          <p>&copy; {currentYear} CultureKart. All rights reserved. Preserving Culture, Empowering Artisans.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

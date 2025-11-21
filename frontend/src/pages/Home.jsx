/**
 * Home Page - CultureKart Landing
 * Features: Hero with Pakistani motifs, featured artisans carousel, featured products grid
 */
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import ThemeBanner from '../components/ThemeBanner';
import api from '../api/api';
import { getImageDisplayUrl } from '../utils/ipfs';

function Home() {
    console.log('Home page loaded');
  const [currentArtisan, setCurrentArtisan] = useState(0);
  const [featuredArtisans, setFeaturedArtisans] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      console.log('Fetching featured data using api.js...');
      try {
        const res = await api.get('/home/featured');
        console.log('API response:', res);
        const data = res.data;
        console.log('Featured Artisans:', data.featuredArtisans);
        console.log('Featured Products:', data.featuredProducts);
        setFeaturedArtisans(data.featuredArtisans || []);
        setFeaturedProducts(data.featuredProducts || []);
      } catch (err) {
        console.error('Error fetching featured data:', err);
        setFeaturedArtisans([]);
        setFeaturedProducts([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Auto-rotate artisan carousel
  useEffect(() => {
    if (featuredArtisans.length > 0) {
      const interval = setInterval(() => {
        setCurrentArtisan((prev) => (prev + 1) % featuredArtisans.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredArtisans.length]);

  return (
    <div>
      {/* Hero Section with ThemeBanner */}
      <ThemeBanner size="hero" pattern="truckArt">
        <div className="text-center">
          <div className="inline-block mb-4">
            <span className="text-6xl">🏺</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-maroon-800 mb-6" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
            Discover Pakistan's Heritage
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium" style={{ fontFamily: '"Merriweather", "Georgia", serif' }}>
            Authentic Handicrafts from Master Artisans
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Every piece tells a story. Every purchase supports tradition. 
            <span className="font-semibold text-teal-700"> Blockchain-verified authenticity.</span>
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop" className="btn-primary text-lg px-8 py-3">
              🛍️ Browse Products
            </Link>
            <Link to="/orders" className="btn-secondary text-lg px-8 py-3">
              📦 Track Orders
            </Link>
          </div>
        </div>
      </ThemeBanner>

      {/* Artisan Stories - Horizontal Scroll */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden relative">
        {/* Decorative truck art border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-sm font-bold text-red-700 tracking-widest uppercase mb-2 block">Ustaad ka Hunar</span>
              <h2 className="text-5xl font-bold text-gray-900 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                Meet Our Master Craftsmen
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-600"></div>
            </div>
            <div className="hidden md:flex gap-3">
              <button 
                onClick={() => setCurrentArtisan(prev => (prev - 1 + featuredArtisans.length) % featuredArtisans.length)}
                className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-2xl text-maroon-700 transition-all hover:scale-110"
                aria-label="Previous artisan"
              >
                ←
              </button>
              <button 
                onClick={() => setCurrentArtisan(prev => (prev + 1) % featuredArtisans.length)}
                className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-2xl text-maroon-700 transition-all hover:scale-110"
                aria-label="Next artisan"
              >
                →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="animate-spin w-16 h-16 border-4 border-maroon-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading artisan stories...</p>
            </div>
          ) : featuredArtisans.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-4">🎨</div>
              <p className="text-gray-600 text-lg">No featured artisans at the moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Artisan Card */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-br from-yellow-400 to-red-500 rounded-2xl transform rotate-2"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-white">
                  <div className="h-56 bg-gradient-to-br from-orange-200 via-yellow-100 to-red-200 flex items-center justify-center text-7xl">
                    {featuredArtisans[currentArtisan]?.specialty?.includes('Embroidery') ? '🧵' :
                     featuredArtisans[currentArtisan]?.specialty?.includes('Pottery') ? '🏺' :
                     featuredArtisans[currentArtisan]?.specialty?.includes('Wood') ? '🪵' : '🎨'}
                  </div>
                  <div className="p-6 bg-gradient-to-b from-white to-amber-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
                          {featuredArtisans[currentArtisan]?.displayName}
                        </h3>
                        <p className="text-red-700 font-semibold text-base">
                          {featuredArtisans[currentArtisan]?.specialty}
                        </p>
                      </div>
                      <div className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full font-bold text-xs shadow-md">
                        ⭐ {featuredArtisans[currentArtisan]?.rating?.average ?? 0}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                      <span className="text-red-600">📍</span>
                      {featuredArtisans[currentArtisan]?.location}
                    </p>
                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                          {featuredArtisans[currentArtisan]?.productCount ?? 0}
                        </div>
                        <span className="text-xs text-gray-600">Products</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-base">
                          🏆
                        </div>
                        <span className="text-xs text-gray-600">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Artisan Info */}
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-red-600 shadow-md">
                  <h4 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span className="text-xl">🏺</span> Heritage & Tradition
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Generations of craftsmanship passed down through families. Each piece created with the wisdom 
                    of ancestors and the passion of modern artistry, preserving Pakistan's rich cultural tapestry.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-yellow-600 shadow-md">
                  <h4 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span className="text-xl">✨</span> Handcrafted Excellence
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    No machines, no mass production. Every stitch, every curve, every detail crafted by skilled 
                    hands using time-honored techniques that have defined Pakistani artistry for centuries.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-600 shadow-md">
                  <h4 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span className="text-xl">🌟</span> Your Impact
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    When you buy from our artisans, you're not just purchasing art—you're preserving culture, 
                    supporting families, and keeping ancient traditions alive for future generations.
                  </p>
                </div>

                <Link to="/shop" className="block">
                  <button className="w-full bg-maroon-800 border-2 border-maroon-900 text-ivory-50 font-semibold py-3 rounded-lg shadow-md hover:bg-maroon-900 hover:shadow-lg transition-all">
                    Explore Their Creations →
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-12">
            {featuredArtisans.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentArtisan(index)}
                className={`transition-all rounded-full ${
                  index === currentArtisan 
                    ? 'w-12 h-3 bg-gradient-to-r from-red-600 to-yellow-600' 
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View artisan ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections - Masonry Grid */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 border-8 border-red-600 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 border-8 border-yellow-600 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border-8 border-green-600 transform rotate-45"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-teal-700 tracking-widest uppercase mb-2 block">Dastakari Collections</span>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Treasures of Pakistan
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-600 to-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Handpicked masterpieces that carry the soul of our land
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="animate-spin w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Curating collections...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-9xl mb-6">🎁</div>
              <p className="text-gray-600 text-xl">New collections arriving soon...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product._id}
                  className={`group relative ${index % 3 === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                >
                  {/* Hover glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                  
                  <div className="relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                      <div className="w-full h-52 bg-gradient-to-br from-amber-100 via-orange-50 to-red-100 flex items-center justify-center">
                        {product.image || product.images?.[0] ? (
                          <img
                            src={getImageDisplayUrl(product.image || product.images?.[0])}
                            alt={product.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            onError={e => { e.target.onerror = null; e.target.src = '/palette.png'; }}
                          />
                        ) : (
                          <span className="text-8xl">
                            {product.category === 'Textiles' ? '🧵' :
                             product.category === 'Pottery' ? '🏺' :
                             product.category === 'Metal Work' ? '⚒️' : '🎨'}
                          </span>
                        )}
                      </div>
                      
                      {/* Category badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-lg border border-gray-200">
                          {product.category}
                        </span>
                      </div>

                      {/* Authenticity badge */}
                      {product.verified && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-xs font-bold">
                            <span>⛓️</span>
                            <span>Verified</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {product.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                          {(product.artisan?.displayName || product.artisan?.name || 'A').charAt(0)}
                        </div>
                        <p className="text-sm text-gray-600">
                          by <span className="font-semibold text-gray-900">{product.artisan?.displayName || product.artisan?.name || 'Master Artisan'}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Starting from</p>
                          <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            Rs {product.price?.toLocaleString()}
                          </span>
                        </div>
                        <Link 
                          to={`/product/${product._id}`}
                          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/shop">
              <button className="px-8 py-3 bg-camel-700 border-2 border-camel-800 text-ivory-50 font-semibold rounded-lg shadow-md hover:bg-camel-800 hover:shadow-lg transition-all">
                Discover All Collections →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cultural Heritage Timeline */}
      <section className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 text-9xl">🕌</div>
          <div className="absolute bottom-20 left-20 text-9xl">🏺</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-yellow-400 tracking-widest uppercase mb-2 block">Our Promise</span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
              More Than Just a Marketplace
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform"></div>
              <div className="relative bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 hover:border-red-500 transition-all">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🎨</div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                  100% Authentic
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  Every product is handcrafted by verified Pakistani artisans. No replicas, no factory copies—just pure, authentic craftsmanship.
                </p>
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                  <span>✓</span>
                  <span>Artisan Verified</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative md:mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl transform -rotate-3 group-hover:-rotate-6 transition-transform"></div>
              <div className="relative bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 hover:border-yellow-500 transition-all">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">⛓️</div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Blockchain Secured
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  Product provenance permanently recorded on Ethereum blockchain. Scan QR codes to verify authenticity instantly.
                </p>
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                  <span>✓</span>
                  <span>Immutable Records</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform"></div>
              <div className="relative bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 hover:border-green-500 transition-all">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🤝</div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Fair Trade
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  Direct connection from artisan to you. Fair prices, sustainable livelihoods, and preservation of cultural heritage.
                </p>
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                  <span>✓</span>
                  <span>Impact Driven</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-6xl font-bold mb-2">500+</div>
              <div className="text-xl opacity-90">Master Artisans</div>
              <div className="text-sm opacity-75 mt-1">Across Pakistan</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-6xl font-bold mb-2">2000+</div>
              <div className="text-xl opacity-90">Unique Products</div>
              <div className="text-sm opacity-75 mt-1">Handcrafted Daily</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-6xl font-bold mb-2">50+</div>
              <div className="text-xl opacity-90">Cities Covered</div>
              <div className="text-sm opacity-75 mt-1">Nationwide Network</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-6xl font-bold mb-2">100%</div>
              <div className="text-xl opacity-90">Authentic</div>
              <div className="text-sm opacity-75 mt-1">Blockchain Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category - Visual Cards */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-2 block">Browse by Craft</span>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Explore Our Heritage
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Textiles & Embroidery', icon: '🧵', color: 'from-blue-400 to-blue-500', items: '500+' },
              { name: 'Pottery & Ceramics', icon: '🏺', color: 'from-teal-400 to-teal-500', items: '300+' },
              { name: 'Wood & Metal Work', icon: '⚒️', color: 'from-cyan-400 to-cyan-500', items: '250+' },
              { name: 'Jewelry & Accessories', icon: '💎', color: 'from-sky-400 to-sky-500', items: '400+' },
            ].map((category, index) => (
              <Link key={index} to="/shop" className="group">
                <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}></div>
                  <div className="relative p-6 text-white">
                    <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">{category.icon}</div>
                    <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                    <p className="text-white/90 text-xs mb-3">{category.items} items</p>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span>Explore</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Process Flow */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-blue-700 tracking-widest uppercase mb-2 block">Simple & Secure</span>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              How CultureKart Works
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-teal-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From artisan's hands to your home in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-teal-200 to-green-200 z-0"></div>

            {[
              { step: '01', title: 'Browse & Discover', desc: 'Explore unique handcrafted products', icon: '🔍', color: 'blue' },
              { step: '02', title: 'Verify Authenticity', desc: 'Check blockchain provenance', icon: '⛓️', color: 'teal' },
              { step: '03', title: 'Secure Purchase', desc: 'Safe payment & fast shipping', icon: '🛡️', color: 'green' },
              { step: '04', title: 'Receive & Enjoy', desc: 'Scan QR to confirm authenticity', icon: '🎁', color: 'purple' },
            ].map((item, index) => (
              <div key={index} className="relative z-10">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 flex items-center justify-center text-3xl shadow-lg border-2 border-white`}>
                  {item.icon}
                </div>
                <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-6xl font-bold text-${item.color}-100 -z-10`}>
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 text-center">{item.title}</h3>
                <p className="text-gray-600 text-center text-xs">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <button className="px-8 py-3 bg-teal-700 border-2 border-teal-800 text-ivory-50 font-semibold rounded-lg shadow-md hover:bg-teal-800 hover:shadow-lg transition-all">
                Start Shopping Now →
              </button>
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}

export default Home;

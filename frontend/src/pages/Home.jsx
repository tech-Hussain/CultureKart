/**
 * Home Page - CultureKart Landing
 * Features: Hero with Pakistani motifs, featured artisans carousel, featured products grid
 */
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ThemeBanner from '../components/ThemeBanner';

function Home() {
  const [currentArtisan, setCurrentArtisan] = useState(0);

  // Featured artisans carousel data (placeholder)
  const featuredArtisans = [
    {
      id: 1,
      name: 'Fatima Textile Arts',
      specialty: 'Traditional Embroidery',
      location: 'Lahore, Punjab',
      rating: 4.9,
      products: 42,
    },
    {
      id: 2,
      name: 'Ahmed Pottery Studio',
      specialty: 'Blue Pottery',
      location: 'Multan, Punjab',
      rating: 4.8,
      products: 38,
    },
    {
      id: 3,
      name: 'Zara Handloom',
      specialty: 'Ajrak & Block Print',
      location: 'Karachi, Sindh',
      rating: 4.9,
      products: 56,
    },
  ];

  // Featured products data (placeholder)
  const featuredProducts = [
    {
      id: 1,
      title: 'Hand-Embroidered Phulkari Dupatta',
      artisan: 'Fatima Textile Arts',
      price: 89.99,
      category: 'Textiles',
    },
    {
      id: 2,
      title: 'Blue Pottery Decorative Vase',
      artisan: 'Ahmed Pottery Studio',
      price: 45.50,
      category: 'Pottery',
    },
    {
      id: 3,
      title: 'Ajrak Block Print Fabric',
      artisan: 'Zara Handloom',
      price: 34.99,
      category: 'Textiles',
    },
    {
      id: 4,
      title: 'Brass Engraved Wall Hanging',
      artisan: 'Hassan Metal Crafts',
      price: 67.00,
      category: 'Metal Work',
    },
    {
      id: 5,
      title: 'Handwoven Ralli Quilt',
      artisan: 'Noor Handicrafts',
      price: 125.00,
      category: 'Textiles',
    },
    {
      id: 6,
      title: 'Camel Skin Lamp Shade',
      artisan: 'Sindh Traditional Arts',
      price: 52.75,
      category: 'Decor',
    },
  ];

  // Auto-rotate artisan carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArtisan((prev) => (prev + 1) % featuredArtisans.length);
    }, 4000);
    return () => clearInterval(interval);
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
            <Link to="/seller" className="btn-secondary text-lg px-8 py-3">
              🎨 Become an Artisan
            </Link>
          </div>
        </div>
      </ThemeBanner>

      {/* Featured Artisans Carousel */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-maroon-800 mb-12">
            Featured Artisans
          </h2>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Carousel Container */}
            <div className="bg-gradient-to-br from-ivory-50 to-camel-50 rounded-2xl shadow-2xl p-8 border-2 border-camel-200">
              <div className="text-center">
                {/* Artisan Avatar Placeholder */}
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-camel-300 to-maroon-300 rounded-full flex items-center justify-center text-6xl shadow-lg">
                  {featuredArtisans[currentArtisan].specialty.includes('Embroidery') ? '🧵' :
                   featuredArtisans[currentArtisan].specialty.includes('Pottery') ? '🏺' : '🎨'}
                </div>

                <h3 className="text-3xl font-bold text-maroon-800 mb-2">
                  {featuredArtisans[currentArtisan].name}
                </h3>
                <p className="text-xl text-camel-700 font-semibold mb-2">
                  {featuredArtisans[currentArtisan].specialty}
                </p>
                <p className="text-gray-600 mb-4">
                  📍 {featuredArtisans[currentArtisan].location}
                </p>
                
                <div className="flex justify-center items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      ⭐ {featuredArtisans[currentArtisan].rating}
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-maroon-600">
                      {featuredArtisans[currentArtisan].products}
                    </div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                </div>

                <Link to="/shop" className="btn-accent px-6 py-2">
                  View Products
                </Link>
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-3 mt-6">
              {featuredArtisans.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentArtisan(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentArtisan 
                      ? 'bg-maroon-600 w-8' 
                      : 'bg-gray-300 hover:bg-camel-400'
                  }`}
                  aria-label={`View artisan ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16 bg-ivory-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-maroon-800 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 text-lg">
              Handpicked treasures from our master artisans
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <div 
                key={product.id}
                className="card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Product Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-camel-200 via-ivory-200 to-teal-200 rounded-lg mb-4 flex items-center justify-center text-6xl">
                  {product.category === 'Textiles' ? '🧵' :
                   product.category === 'Pottery' ? '🏺' :
                   product.category === 'Metal Work' ? '⚒️' : '🎨'}
                </div>

                <div>
                  <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full mb-2">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    by {product.artisan}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-maroon-600">
                      ${product.price}
                    </span>
                    <Link 
                      to={`/product/${product.id}`}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Products Button */}
          <div className="text-center">
            <Link to="/shop" className="btn-secondary text-lg px-10 py-3 inline-block">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose CultureKart Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-maroon-800 mb-12">
            Why CultureKart?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2 text-camel-700">Authentic Crafts</h3>
              <p className="text-gray-600">
                Every product is handcrafted by verified Pakistani artisans, 
                preserving centuries-old traditions and techniques.
              </p>
            </div>
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⛓️</div>
              <h3 className="text-xl font-semibold mb-2 text-teal-700">Blockchain Verified</h3>
              <p className="text-gray-600">
                Product provenance recorded permanently on the blockchain. 
                Verify authenticity with a single click.
              </p>
            </div>
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2 text-maroon-700">Empower Artisans</h3>
              <p className="text-gray-600">
                Direct connection between artisans and global buyers. 
                Fair prices, sustainable livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-maroon-700 to-maroon-900 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-ivory-100">
            Join thousands discovering authentic Pakistani crafts
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop" className="bg-white text-maroon-800 font-semibold px-8 py-3 rounded-lg hover:bg-ivory-100 transition-colors">
              Start Shopping
            </Link>
            <Link to="/auth" className="bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

/**
 * ThemeBanner Component
 * Pakistani truck-art and Ajrak inspired decorative banner
 */

function ThemeBanner({ 
  title, 
  subtitle, 
  pattern = 'ajrak', 
  size = 'large',
  children 
}) {
  // Pattern variations
  const patterns = {
    ajrak: (
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ajrak-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Geometric Ajrak patterns */}
            <circle cx="40" cy="40" r="15" fill="#c74040" opacity="0.6" />
            <circle cx="40" cy="40" r="8" fill="#14b8a6" opacity="0.7" />
            <rect x="20" y="20" width="5" height="5" fill="#dc8947" />
            <rect x="55" y="20" width="5" height="5" fill="#dc8947" />
            <rect x="20" y="55" width="5" height="5" fill="#dc8947" />
            <rect x="55" y="55" width="5" height="5" fill="#dc8947" />
            <line x1="40" y1="0" x2="40" y2="80" stroke="#14b8a6" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="40" x2="80" y2="40" stroke="#14b8a6" strokeWidth="1" opacity="0.5" />
            {/* Diagonal lines */}
            <line x1="0" y1="0" x2="80" y2="80" stroke="#c74040" strokeWidth="0.5" opacity="0.4" />
            <line x1="80" y1="0" x2="0" y2="80" stroke="#c74040" strokeWidth="0.5" opacity="0.4" />
            {/* Small decorative dots */}
            <circle cx="10" cy="10" r="2" fill="#fff6b3" />
            <circle cx="70" cy="10" r="2" fill="#fff6b3" />
            <circle cx="10" cy="70" r="2" fill="#fff6b3" />
            <circle cx="70" cy="70" r="2" fill="#fff6b3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ajrak-pattern)" />
      </svg>
    ),
    truckArt: (
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="truck-art-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Floral motifs */}
            <circle cx="60" cy="60" r="20" fill="none" stroke="#c74040" strokeWidth="3" />
            <circle cx="60" cy="60" r="12" fill="#14b8a6" opacity="0.6" />
            <circle cx="60" cy="60" r="5" fill="#dc8947" />
            {/* Petals */}
            <ellipse cx="60" cy="35" rx="8" ry="15" fill="#fff6b3" opacity="0.7" />
            <ellipse cx="60" cy="85" rx="8" ry="15" fill="#fff6b3" opacity="0.7" />
            <ellipse cx="35" cy="60" rx="15" ry="8" fill="#fff6b3" opacity="0.7" />
            <ellipse cx="85" cy="60" rx="15" ry="8" fill="#fff6b3" opacity="0.7" />
            {/* Corner decorations */}
            <path d="M 10 10 L 20 10 L 15 20 Z" fill="#14b8a6" opacity="0.5" />
            <path d="M 110 10 L 100 10 L 105 20 Z" fill="#14b8a6" opacity="0.5" />
            <path d="M 10 110 L 20 110 L 15 100 Z" fill="#14b8a6" opacity="0.5" />
            <path d="M 110 110 L 100 110 L 105 100 Z" fill="#14b8a6" opacity="0.5" />
            {/* Decorative lines */}
            <path d="M 0 60 Q 30 50 60 60 T 120 60" stroke="#c74040" strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M 60 0 Q 50 30 60 60 T 60 120" stroke="#dc8947" strokeWidth="2" fill="none" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#truck-art-pattern)" />
      </svg>
    ),
  };

  // Size variants
  const sizeClasses = {
    small: 'py-8',
    medium: 'py-12',
    large: 'py-16 md:py-20',
    hero: 'py-20 md:py-32',
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-camel-100 via-ivory-100 to-teal-50 ${sizeClasses[size]}`}>
      {/* Background Pattern */}
      {patterns[pattern]}

      {/* Decorative Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon-600 via-camel-600 to-teal-600"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 via-camel-600 to-maroon-600"></div>

      {/* Decorative Corner Ornaments */}
      <div className="absolute top-4 left-4 text-3xl opacity-20 text-maroon-600">🕌</div>
      <div className="absolute top-4 right-4 text-3xl opacity-20 text-teal-600">🏺</div>
      <div className="absolute bottom-4 left-4 text-3xl opacity-20 text-camel-600">🪔</div>
      <div className="absolute bottom-4 right-4 text-3xl opacity-20 text-maroon-600">🧵</div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {children || (
          <div className="text-center">
            {/* CultureKart Wordmark */}
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-maroon-800 mb-2 tracking-tight" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
                {title || (
                  <>
                    <span className="inline-block">🏺</span>
                    {' '}CultureKart
                  </>
                )}
              </h1>
              {subtitle && (
                <p className="text-xl md:text-2xl text-gray-700 font-medium" style={{ fontFamily: '"Merriweather", "Georgia", serif' }}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-camel-600 to-camel-600"></div>
              <span className="text-teal-600 text-2xl">✦</span>
              <div className="h-px w-12 bg-gradient-to-r from-camel-600 via-camel-600 to-transparent"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThemeBanner;

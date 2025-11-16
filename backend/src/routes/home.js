// Home Page Featured Data Route
const express = require('express');
const router = express.Router();

const Artisan = require('../models/Artisan');
const Product = require('../models/Product');

/**
 * GET /api/v1/home/featured
 * Returns:
 *   - featuredArtisans: Top 3 artisans with most products
 *   - featuredProducts: Any 4 products (most recent)
 */
router.get('/featured', async (req, res) => {
      // Force 200 OK by disabling ETag and Last-Modified
      res.removeHeader('ETag');
      res.removeHeader('Last-Modified');
    // Disable caching for this endpoint
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  try {
    // Top 3 artisans by product count (no filter on verified/isActive)
    const topArtisans = await Artisan.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'artisan',
          as: 'products',
        },
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
        },
      },
      { $sort: { productCount: -1, createdAt: -1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 1,
          displayName: 1,
          specialty: 1,
          location: 1,
          rating: 1,
          productCount: 1,
          user: 1,
        },
      },
    ]);

    // Populate user info for each artisan
    const populatedArtisans = await Artisan.populate(topArtisans, { path: 'user', select: 'name email' });

    // Any 4 products (most recent, no status filter)
    const featuredProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('artisan', 'displayName')
      .select('title price currency images category artisan');

    res.json({
      featuredArtisans: populatedArtisans,
      featuredProducts,
    });
  } catch (error) {
    console.error('❌ Error fetching homepage featured data:', error);
    res.status(500).json({ error: 'Failed to fetch homepage featured data' });
  }
});

module.exports = router;

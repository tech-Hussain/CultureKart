/**
 * Public Category Routes
 * Fetch categories for product filtering and display
 */

const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

/**
 * GET /api/v1/categories
 * Get all active categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getActiveCategories();
    
    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
});

module.exports = router;

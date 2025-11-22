/**
 * Admin Category Management Routes
 * CRUD operations for product categories
 */

const express = require('express');
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const { authenticate } = require('../../middleware/authenticate');
const { requireAdmin } = require('../../middleware/requireRole');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/categories
 * Get all categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    
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

/**
 * POST /api/v1/admin/categories
 * Create a new category
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, emoji, order } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }
    
    // Check if category already exists
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }
    
    const category = new Category({
      name,
      description,
      emoji: emoji || '🎨',
      order: order || 0,
    });
    
    await category.save();
    
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message,
    });
  }
});

/**
 * PUT /api/v1/admin/categories/:id
 * Update a category
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, emoji, isActive, order } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
      category.name = name;
    }
    
    if (description !== undefined) category.description = description;
    if (emoji !== undefined) category.emoji = emoji;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;
    
    await category.save();
    
    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    console.error('❌ Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/v1/admin/categories/:id
 * Delete a category
 */
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    // Check if category is used by any products
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} products are using this category.`,
        data: { productCount },
      });
    }
    
    await category.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/admin/categories/sync
 * Sync product counts for all categories
 */
router.post('/sync', async (req, res) => {
  try {
    const categories = await Category.find();
    
    for (const category of categories) {
      const count = await Product.countDocuments({ 
        category: category.name, 
        status: 'active' 
      });
      category.productCount = count;
      await category.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Category product counts synced successfully',
    });
  } catch (error) {
    console.error('❌ Error syncing categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Error syncing categories',
      error: error.message,
    });
  }
});

module.exports = router;

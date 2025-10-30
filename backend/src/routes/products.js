/**
 * Products Routes
 * Handles all product-related endpoints
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, query, param, validationResult } = require('express-validator');

const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

/**
 * Middleware: Check if user is artisan
 */
const isArtisan = async (req, res, next) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user.uid });
    
    if (!artisan) {
      return res.status(403).json({
        status: 'error',
        message: 'Only artisans can perform this action',
      });
    }
    
    req.artisan = artisan;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error verifying artisan status',
    });
  }
};

/**
 * POST /api/v1/products
 * Create a new product (Artisan only)
 */
router.post(
  '/',
  verifyFirebaseToken,
  isArtisan,
  upload.array('images', 10),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10, max: 2000 }),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('currency').optional().isIn(['USD', 'PKR', 'EUR', 'GBP']).withMessage('Invalid currency'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category').optional().isString(),
    body('tags').optional().isString(),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array(),
        });
      }

      // Check if images are uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'At least one product image is required',
        });
      }

      console.log(`📸 Uploading ${req.files.length} images to IPFS...`);

      // Upload images to IPFS
      let ipfsImageUrls = [];
      try {
        ipfsImageUrls = await ipfsService.uploadFiles(req.files);
      } catch (error) {
        console.error('IPFS upload error:', error);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to upload images to IPFS',
          details: error.message,
        });
      }

      // Prepare product data
      const { title, description, price, currency, stock, category, tags, specialty } = req.body;

      // Create metadata JSON for IPFS
      const metadata = {
        name: title,
        description: description,
        image: ipfsImageUrls[0], // Primary image
        images: ipfsImageUrls,
        attributes: [
          { trait_type: 'Price', value: price },
          { trait_type: 'Currency', value: currency || 'PKR' },
          { trait_type: 'Category', value: category || 'Other' },
          { trait_type: 'Artisan', value: req.artisan.displayName },
          { trait_type: 'Location', value: req.artisan.location },
        ],
        created_at: new Date().toISOString(),
        artisan: {
          id: req.artisan._id.toString(),
          name: req.artisan.displayName,
          verified: req.artisan.verified,
        },
      };

      console.log('📝 Uploading metadata to IPFS...');

      // Upload metadata to IPFS
      let metadataCid;
      try {
        metadataCid = await ipfsService.uploadMetadata(metadata);
      } catch (error) {
        console.error('Metadata upload error:', error);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to upload metadata to IPFS',
          details: error.message,
        });
      }

      // Parse tags if provided
      let parsedTags = [];
      if (tags) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }

      // Create product in database
      const product = await Product.create({
        artisan: req.artisan._id,
        title,
        description,
        price: parseFloat(price),
        currency: currency || 'PKR',
        stock: parseInt(stock),
        images: ipfsImageUrls,
        ipfsMetadataHash: metadataCid,
        category: category || 'Other',
        tags: parsedTags,
        status: 'active',
      });

      console.log(`✅ Product created in database: ${product._id}`);

      // Attempt blockchain registration (non-blocking)
      let blockchainTxn = null;
      try {
        console.log('⛓️  Attempting blockchain registration...');
        blockchainTxn = await blockchainService.recordProduct({
          productId: product._id.toString(),
          artisanAddress: null, // Use default signer address
          ipfsHash: metadataCid,
        });

        if (blockchainTxn) {
          product.blockchainTxn = blockchainTxn;
          await product.save();
          console.log(`✅ Blockchain transaction recorded: ${blockchainTxn}`);
        }
      } catch (error) {
        console.warn('⚠️  Blockchain registration failed (product still created):', error.message);
      }

      // Update artisan product count
      req.artisan.totalProducts += 1;
      await req.artisan.save();

      // Populate artisan data
      await product.populate('artisan', 'displayName bio location verified');

      res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: {
          product,
          ipfs: {
            metadataCid,
            metadataUrl: `ipfs://${metadataCid}`,
            gatewayUrl: ipfsService.getGatewayUrl(`ipfs://${metadataCid}`),
          },
          blockchain: {
            recorded: !!blockchainTxn,
            transactionHash: blockchainTxn,
          },
        },
      });
    } catch (error) {
      console.error('❌ Product creation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/products
 * Get all products (with pagination, filtering, search)
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('artisan').optional().isMongoId().withMessage('Invalid artisan ID'),
    query('category').optional().isString(),
    query('status').optional().isIn(['draft', 'active', 'inactive', 'out_of_stock']),
    query('search').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array(),
        });
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};

      if (req.query.artisan) {
        filter.artisan = req.query.artisan;
      }

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.status) {
        filter.status = req.query.status;
      } else {
        // Default: only show active products
        filter.status = 'active';
      }

      // Price range filter
      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
      }

      // Text search
      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      // Execute query
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('artisan', 'displayName bio location verified rating')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      res.status(200).json({
        status: 'success',
        results: products.length,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        data: { products },
      });
    } catch (error) {
      console.error('❌ Get products error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/products/:id
 * Get single product by ID
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid product ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array(),
        });
      }

      const product = await Product.findById(req.params.id)
        .populate('artisan', 'displayName bio location verified rating portfolio');

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      // Increment view count (non-blocking)
      product.incrementViews().catch(err => console.error('View count error:', err));

      res.status(200).json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      console.error('❌ Get product error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch product',
        error: error.message,
      });
    }
  }
);

/**
 * PUT /api/v1/products/:id
 * Update product (Artisan owner or Admin)
 */
router.put(
  '/:id',
  verifyFirebaseToken,
  isArtisan,
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('title').optional().trim().isLength({ min: 3, max: 200 }),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['draft', 'active', 'inactive', 'out_of_stock']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array(),
        });
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      // Check ownership
      if (product.artisan.toString() !== req.artisan._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this product',
        });
      }

      // Update allowed fields
      const allowedFields = ['title', 'description', 'price', 'stock', 'status', 'category', 'tags'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          product[field] = req.body[field];
        }
      });

      await product.save();
      await product.populate('artisan', 'displayName bio location verified');

      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error) {
      console.error('❌ Update product error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }
);

/**
 * DELETE /api/v1/products/:id
 * Delete product (Artisan owner or Admin)
 */
router.delete(
  '/:id',
  verifyFirebaseToken,
  isArtisan,
  [param('id').isMongoId().withMessage('Invalid product ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array(),
        });
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      // Check ownership
      if (product.artisan.toString() !== req.artisan._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete this product',
        });
      }

      await product.deleteOne();

      // Update artisan product count
      req.artisan.totalProducts = Math.max(0, req.artisan.totalProducts - 1);
      await req.artisan.save();

      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('❌ Delete product error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }
);

module.exports = router;

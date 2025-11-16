/**
 * Product Verification Routes
 * Handles QR code verification for anti-counterfeiting
 */

const express = require('express');
const router = express.Router();
const ProductAuthentication = require('../models/ProductAuthentication');
const { param, validationResult } = require('express-validator');

/**
 * GET /api/v1/verification/:code
 * Verify a product authentication code
 */
router.get(
  '/:code',
  [param('code').isString().trim().notEmpty().withMessage('Verification code is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { code } = req.params;

      // Get verification metadata
      const verificationMetadata = {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        location: req.get('cf-ipcountry') || 'unknown', // Cloudflare country header
      };

      // Verify the code
      const result = await ProductAuthentication.verifyCode(code, verificationMetadata);

      console.log('🔍 [Verification] Result:', result);
      console.log('🔍 [Verification] Valid:', result.valid);
      console.log('🔍 [Verification] Status:', result.status);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
          status: result.status,
          deliveryInfo: result.deliveryInfo,
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        status: result.status,
        productInfo: result.productInfo,
        verificationInfo: result.verificationInfo,
        scanHistory: result.scanHistory,
        blockchainInfo: result.blockchainInfo,
      });
    } catch (error) {
      console.error('Verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify product code',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/verification/qr/:code
 * Get QR code data for a verification code
 */
router.get(
  '/qr/:code',
  [param('code').isString().trim().notEmpty().withMessage('Verification code is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { code } = req.params;

      const auth = await ProductAuthentication.findOne({
        publicVerificationCode: code,
      });

      if (!auth) {
        return res.status(404).json({
          success: false,
          message: 'Verification code not found',
        });
      }

      return res.status(200).json({
        success: true,
        qrCodeUrl: auth.getQRCodeUrl(),
        qrCodeData: auth.getQRCodeData(),
      });
    } catch (error) {
      console.error('QR code fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch QR code data',
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/verification/:code/confirm-delivery
 * Confirm delivery - ONE-TIME USE
 */
router.post(
  '/:code/confirm-delivery',
  [param('code').isString().trim().notEmpty().withMessage('Verification code is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { code } = req.params;

      // Get confirmation metadata
      const confirmationMetadata = {
        ipAddress: req.ip || req.connection.remoteAddress,
        location: req.get('cf-ipcountry') || 'unknown',
        deviceFingerprint: req.body.deviceFingerprint || '',
      };

      // Confirm delivery
      const result = await ProductAuthentication.confirmDelivery(code, confirmationMetadata);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Delivery confirmation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm delivery',
        error: error.message,
      });
    }
  }
);

module.exports = router;

/**
 * IPFS Service
 * Handles file and metadata uploads to IPFS using NFT.Storage
 */

const { NFTStorage, File, Blob } = require('nft.storage');
const fs = require('fs');
const path = require('path');

// Initialize NFT.Storage client
const client = process.env.IPFS_API_KEY
  ? new NFTStorage({ token: process.env.IPFS_API_KEY })
  : null;

/**
 * Upload multiple files to IPFS
 * @param {Array} files - Array of file objects with path, originalname, mimetype
 * @returns {Promise<Array>} Array of IPFS URLs (ipfs://...)
 */
const uploadFiles = async (files) => {
  try {
    if (!client) {
      throw new Error('NFT.Storage client not initialized. Please provide IPFS_API_KEY in .env');
    }

    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const ipfsUrls = [];

    // Upload each file to IPFS
    for (const file of files) {
      // Read file from disk
      const fileBuffer = fs.readFileSync(file.path);
      
      // Create File object for NFT.Storage
      const nftFile = new File(
        [fileBuffer],
        file.originalname,
        { type: file.mimetype }
      );

      // Store file on IPFS
      const cid = await client.storeBlob(nftFile);
      
      // Build IPFS URL
      const ipfsUrl = `ipfs://${cid}`;
      ipfsUrls.push(ipfsUrl);

      console.log(`✅ File uploaded to IPFS: ${file.originalname} -> ${ipfsUrl}`);

      // Clean up local file after upload
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.warn(`⚠️  Could not delete local file: ${file.path}`);
      }
    }

    return ipfsUrls;
  } catch (error) {
    console.error('❌ IPFS file upload error:', error.message);
    throw new Error(`Failed to upload files to IPFS: ${error.message}`);
  }
};

/**
 * Upload metadata JSON to IPFS
 * @param {Object} metadata - JSON object to upload
 * @returns {Promise<String>} IPFS CID of the metadata
 */
const uploadMetadata = async (metadata) => {
  try {
    if (!client) {
      throw new Error('NFT.Storage client not initialized. Please provide IPFS_API_KEY in .env');
    }

    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Invalid metadata object');
    }

    // Convert metadata to JSON string
    const jsonString = JSON.stringify(metadata, null, 2);
    
    // Create Blob from JSON
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Store metadata on IPFS
    const cid = await client.storeBlob(blob);

    console.log(`✅ Metadata uploaded to IPFS: ${cid}`);

    return cid;
  } catch (error) {
    console.error('❌ IPFS metadata upload error:', error.message);
    throw new Error(`Failed to upload metadata to IPFS: ${error.message}`);
  }
};

/**
 * Get gateway URL for IPFS content
 * @param {String} ipfsUrl - IPFS URL (ipfs://...)
 * @returns {String} HTTP gateway URL
 */
const getGatewayUrl = (ipfsUrl) => {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }

  const cid = ipfsUrl.replace('ipfs://', '');
  const gateway = process.env.IPFS_GATEWAY_URL || 'https://nftstorage.link/ipfs';
  
  return `${gateway}/${cid}`;
};

/**
 * Convert array of IPFS URLs to gateway URLs
 * @param {Array} ipfsUrls - Array of IPFS URLs
 * @returns {Array} Array of HTTP gateway URLs
 */
const convertToGatewayUrls = (ipfsUrls) => {
  if (!Array.isArray(ipfsUrls)) {
    return [];
  }

  return ipfsUrls.map(url => getGatewayUrl(url));
};

/**
 * Verify IPFS client is initialized
 * @returns {Boolean} True if client is ready
 */
const isClientReady = () => {
  return client !== null;
};

module.exports = {
  uploadFiles,
  uploadMetadata,
  getGatewayUrl,
  convertToGatewayUrls,
  isClientReady,
};

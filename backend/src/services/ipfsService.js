/**
 * IPFS Service
 * Handles file and metadata uploads to IPFS using Pinata API directly
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Get Pinata JWT from environment
const pinataJWT = process.env.PINATA_JWT || process.env.NFT_STORAGE_API_KEY || process.env.IPFS_API_KEY;

// Control whether to use mock fallback or fail hard
const ALLOW_MOCK_FALLBACK = process.env.IPFS_ALLOW_MOCK !== 'false';

// Pinata API endpoints
const PINATA_API_URL = 'https://api.pinata.cloud';

/**
 * Upload multiple files to IPFS via Pinata API
 */
const uploadFiles = async (files) => {
  try {
    if (!pinataJWT) {
      if (!ALLOW_MOCK_FALLBACK) {
        throw new Error('Pinata JWT not configured. Please provide PINATA_JWT in .env');
      }
      console.warn('⚠️  Pinata JWT not configured. Using mock IPFS URLs');
      const mockUrls = files.map((file, index) => {
        const timestamp = Date.now();
        const mockCid = `Qm${timestamp}${index}${Math.random().toString(36).substring(7)}`;
        try { fs.unlinkSync(file.path); } catch {}
        return `ipfs://${mockCid}`;
      });
      return mockUrls;
    }

    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const ipfsUrls = [];
    for (const file of files) {
      console.log(`📤 Uploading ${file.originalname} to Pinata...`);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path), file.originalname);
      
      // Upload to Pinata
      const response = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          'Authorization': `Bearer ${pinataJWT}`,
        },
      });
      
      const ipfsUrl = `ipfs://${response.data.IpfsHash}`;
      ipfsUrls.push(ipfsUrl);
      
      console.log(`✅ Uploaded: ${file.originalname} -> ${ipfsUrl}`);
      
      // Clean up local file
      try { fs.unlinkSync(file.path); } catch {}
    }
    return ipfsUrls;
  } catch (error) {
    console.error('❌ IPFS upload error:', error.response?.data || error.message);
    
    if (!ALLOW_MOCK_FALLBACK) {
      throw new Error(`Failed to upload files to IPFS: ${error.message}`);
    }
    
    const mockUrls = files.map((file, index) => {
      const timestamp = Date.now();
      const mockCid = `Qm${timestamp}${index}${Math.random().toString(36).substring(7)}`;
      try { fs.unlinkSync(file.path); } catch {}
      return `ipfs://${mockCid}`;
    });
    return mockUrls;
  }
};

const uploadMetadata = async (metadata) => {
  try {
    if (!pinataJWT) {
      if (!ALLOW_MOCK_FALLBACK) {
        throw new Error('Pinata JWT not configured');
      }
      const mockCid = `Qm${Date.now()}meta${Math.random().toString(36).substring(7)}`;
      console.warn('⚠️  Using mock metadata CID:', mockCid);
      return mockCid;
    }
    
    console.log('📤 Uploading metadata to Pinata...');
    
    // Upload JSON to Pinata
    const response = await axios.post(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, metadata, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pinataJWT}`,
      },
    });
    
    console.log(`✅ Metadata uploaded: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Metadata upload error:', error.response?.data || error.message);
    
    if (!ALLOW_MOCK_FALLBACK) {
      throw new Error(`Failed to upload metadata: ${error.message}`);
    }
    
    const mockCid = `Qm${Date.now()}meta${Math.random().toString(36).substring(7)}`;
    return mockCid;
  }
};

const getGatewayUrl = (ipfsUrl) => {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  const cid = ipfsUrl.replace('ipfs://', '');
  const gateway = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
  return `${gateway}/${cid}`;
};

const convertToGatewayUrls = (ipfsUrls) => {
  if (!Array.isArray(ipfsUrls)) {
    return [];
  }
  return ipfsUrls.map(url => getGatewayUrl(url));
};

const isClientReady = () => {
  return !!pinataJWT;
};

module.exports = {
  uploadFiles,
  uploadMetadata,
  getGatewayUrl,
  convertToGatewayUrls,
  isClientReady,
};

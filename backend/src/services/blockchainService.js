/**
 * Blockchain Service
 * Handles interactions with CultureProvenance smart contract for product provenance
 */

const { ethers } = require('ethers');
const crypto = require('crypto');

// CultureProvenance Contract ABI
const CULTURE_PROVENANCE_ABI = [
  'function registerProduct(address artisan, string calldata ipfsHash) external returns (uint256 tokenId)',
  'function getProduct(uint256 tokenId) external view returns (address artisan, string memory ipfsHash, uint256 timestamp)',
  'function getArtisanProducts(address artisan) external view returns (uint256[] memory)',
  'function getTotalProducts() external view returns (uint256)',
  'function verifyProduct(uint256 tokenId, address expectedArtisan, string calldata expectedIpfsHash) external view returns (bool isValid)',
  'event ProductRegistered(uint256 indexed tokenId, address indexed artisan, string ipfsHash, uint256 timestamp)',
];

let provider;
let signer;
let contract;
let isConfigured = false;

/**
 * Initialize blockchain connection
 */
const initializeBlockchain = () => {
  try {
    const rpcUrl = process.env.INFURA_ALCHEMY_RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;

    if (!rpcUrl || !contractAddress) {
      console.warn('⚠️  Blockchain configuration incomplete (INFURA_ALCHEMY_RPC_URL or CONTRACT_ADDRESS missing).');
      console.warn('⚠️  Blockchain features will be disabled. Mock transaction IDs will be generated.');
      isConfigured = false;
      return false;
    }

    if (!privateKey) {
      console.warn('⚠️  PRIVATE_KEY not configured. Read-only blockchain access enabled.');
      // Create provider only (no signer)
      provider = new ethers.JsonRpcProvider(rpcUrl);
      contract = new ethers.Contract(contractAddress, CULTURE_PROVENANCE_ABI, provider);
      isConfigured = false;
      return false;
    }

    // Create provider
    provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create wallet/signer
    signer = new ethers.Wallet(privateKey, provider);

    // Create contract instance with signer
    contract = new ethers.Contract(contractAddress, CULTURE_PROVENANCE_ABI, signer);

    console.log('✅ Blockchain service initialized');
    console.log(`📝 Contract address: ${contractAddress}`);
    console.log(`🔗 Network: ${rpcUrl.includes('sepolia') ? 'Sepolia' : rpcUrl.includes('mainnet') ? 'Mainnet' : 'Custom'}`);

    isConfigured = true;
    return true;
  } catch (error) {
    console.error('❌ Blockchain initialization error:', error.message);
    isConfigured = false;
    return false;
  }
};

/**
 * Generate mock transaction hash
 * @returns {String} Mock transaction hash
 */
const generateMockTxHash = () => {
  return '0x' + crypto.randomBytes(32).toString('hex');
};

/**
 * Record product on blockchain
 * @param {Object} productData - Product data to record
 * @param {String} productData.productId - MongoDB product ID
 * @param {String} productData.artisanAddress - Artisan's wallet address (optional)
 * @param {String} productData.ipfsHash - IPFS CID of product metadata
 * @returns {Promise<String>} Transaction hash or mock hash
 */
const recordProduct = async (productData) => {
  try {
    const { productId, artisanAddress, ipfsHash } = productData;

    if (!ipfsHash) {
      throw new Error('IPFS hash is required');
    }

    // Check if blockchain is configured
    if (!isConfigured) {
      // Initialize attempt
      initializeBlockchain();
    }

    // If still not configured, return mock transaction hash
    if (!isConfigured || !contract || !signer) {
      const mockTxHash = generateMockTxHash();
      console.warn('⚠️  Blockchain not configured. Generating mock transaction ID.');
      console.warn(`⚠️  Mock Transaction Hash: ${mockTxHash}`);
      console.log(`📝 Product would be registered: productId=${productId}, ipfsHash=${ipfsHash}`);
      return mockTxHash;
    }

    // Use provided artisan address or default to signer address
    const artisan = artisanAddress || await signer.getAddress();

    console.log(`📝 Recording product on blockchain...`);
    console.log(`   Product ID: ${productId}`);
    console.log(`   Artisan: ${artisan}`);
    console.log(`   IPFS Hash: ${ipfsHash}`);

    // Call smart contract registerProduct function
    const tx = await contract.registerProduct(artisan, ipfsHash);

    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    console.log(`✅ Product registered on blockchain!`);
    console.log(`   Transaction Hash: ${receipt.hash}`);
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);

    // Parse logs to get tokenId (optional)
    try {
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === 'ProductRegistered';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        console.log(`   Token ID: ${parsed.args.tokenId.toString()}`);
      }
    } catch (error) {
      // Event parsing is optional
      console.log('   (Token ID parsing skipped)');
    }

    return receipt.hash;
  } catch (error) {
    console.error('❌ Blockchain recording error:', error.message);

    // Generate mock transaction hash as fallback
    const mockTxHash = generateMockTxHash();
    console.warn('⚠️  Blockchain transaction failed. Generating mock transaction ID.');
    console.warn(`⚠️  Mock Transaction Hash: ${mockTxHash}`);
    
    // Don't throw - blockchain registration is optional
    // Return mock hash to allow product creation to continue
    return mockTxHash;
  }
};

/**
 * Verify product on blockchain
 * @param {Number} tokenId - Token ID to verify
 * @returns {Promise<Object>} Product data from blockchain
 */
const verifyProduct = async (tokenId) => {
  try {
    if (!contract) {
      initializeBlockchain();
    }

    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    console.log(`🔍 Verifying product on blockchain: Token ID ${tokenId}`);

    const result = await contract.getProduct(tokenId);

    return {
      artisan: result[0],
      ipfsHash: result[1],
      timestamp: Number(result[2]),
      verified: true,
    };
  } catch (error) {
    console.error('❌ Blockchain verification error:', error.message);
    return {
      verified: false,
      error: error.message,
    };
  }
};

/**
 * Get products by artisan address
 * @param {String} artisanAddress - Artisan's wallet address
 * @returns {Promise<Array>} Array of token IDs
 */
const getArtisanProducts = async (artisanAddress) => {
  try {
    if (!contract) {
      initializeBlockchain();
    }

    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    const tokenIds = await contract.getArtisanProducts(artisanAddress);
    return tokenIds.map(id => Number(id));
  } catch (error) {
    console.error('❌ Error fetching artisan products:', error.message);
    return [];
  }
};

/**
 * Get total products registered on blockchain
 * @returns {Promise<Number>} Total product count
 */
const getTotalProducts = async () => {
  try {
    if (!contract) {
      initializeBlockchain();
    }

    if (!contract) {
      return 0;
    }

    const total = await contract.getTotalProducts();
    return Number(total);
  } catch (error) {
    console.error('❌ Error fetching total products:', error.message);
    return 0;
  }
};

/**
 * Get wallet address
 * @returns {Promise<String>} Wallet address or null
 */
const getWalletAddress = async () => {
  try {
    if (!signer) {
      initializeBlockchain();
    }

    if (!signer) {
      return null;
    }

    return await signer.getAddress();
  } catch (error) {
    console.error('❌ Error getting wallet address:', error.message);
    return null;
  }
};

/**
 * Check if blockchain service is configured and ready
 * @returns {Boolean} Configuration status
 */
const isBlockchainConfigured = () => {
  return isConfigured;
};

// Initialize on module load
initializeBlockchain();

module.exports = {
  recordProduct,
  verifyProduct,
  getArtisanProducts,
  getTotalProducts,
  getWalletAddress,
  initializeBlockchain,
  isBlockchainConfigured,
};

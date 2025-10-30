# CultureProvenance Smart Contract

Solidity smart contract for registering and tracking Pakistani artisan products with blockchain-based provenance and IPFS metadata storage.

## 📋 Contract Overview

**CultureProvenance.sol** provides immutable product registration on the Ethereum blockchain, linking products to their artisan creators with IPFS metadata hashes.

### Features

- ✅ Register products with IPFS metadata hashes
- ✅ Link products to artisan wallet addresses
- ✅ Immutable provenance tracking
- ✅ Query products by token ID or artisan
- ✅ Verify product authenticity on-chain
- ✅ Update metadata hashes (owner only)
- ✅ OpenZeppelin Ownable for access control

## 🏗️ Contract Functions

### Core Functions

#### `registerProduct(address artisan, string calldata ipfsHash)`
- Registers a new product on the blockchain
- Returns unique `tokenId`
- Emits `ProductRegistered` event
- **Access**: Owner only

#### `getProduct(uint256 tokenId)`
- Returns product details: artisan, ipfsHash, timestamp
- **Access**: Public view

#### `getArtisanProducts(address artisan)`
- Returns array of all token IDs for a specific artisan
- **Access**: Public view

#### `verifyProduct(uint256 tokenId, address expectedArtisan, string calldata expectedIpfsHash)`
- Verifies product authenticity against on-chain data
- Returns `bool` indicating validity
- **Access**: Public view

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.x
- npm or yarn
- MetaMask or similar Web3 wallet
- Infura/Alchemy account for RPC access
- ETH for gas fees (testnet or mainnet)

### Installation

```bash
cd contracts
npm install
```

### Environment Setup

Create a `.env` file in the `contracts` directory:

```env
# RPC URL (Infura or Alchemy)
INFURA_ALCHEMY_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Deployer Private Key (DO NOT COMMIT THIS)
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Enable gas reporting
REPORT_GAS=true
```

⚠️ **Security Warning**: Never commit your `.env` file or private keys to version control!

## 📦 Compilation

Compile the smart contract:

```bash
npx hardhat compile
```

This will generate artifacts in the `artifacts/` directory.

## 🧪 Testing

Run contract tests:

```bash
npx hardhat test
```

Run tests with gas reporting:

```bash
REPORT_GAS=true npx hardhat test
```

## 🌐 Deployment

### Deploy to Local Hardhat Network

1. Start local node:
```bash
npx hardhat node
```

2. Deploy (in another terminal):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Sepolia Testnet

1. Get Sepolia ETH from faucets:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/

2. Configure `.env` with Sepolia RPC URL and private key

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

4. Verify contract on Etherscan:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Deploy to Ethereum Mainnet

⚠️ **Warning**: Mainnet deployment costs real ETH. Double-check everything!

1. Configure `.env` with mainnet RPC URL and private key

2. Ensure wallet has sufficient ETH for deployment

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

4. Verify on Etherscan:
```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

## 📝 Deployment Output

After deployment, the script will output:

```
✅ CultureProvenance contract deployed successfully!
📍 Contract Address: 0x...
👤 Owner Address: 0x...
📄 Deployment Transaction Hash: 0x...

============================================================
📋 DEPLOYMENT SUMMARY
============================================================
Contract: CultureProvenance
Address: 0xabcd...ef12
Network: sepolia
Chain ID: 11155111
Deployer: 0x1234...5678
============================================================

🔧 NEXT STEPS:
1. Copy the contract address above
2. Add it to your backend .env file:
   PROVENANCE_CONTRACT_ADDRESS=0xabcd...ef12
3. Or run the update script:
   cd backend && node src/tasks/updateContractAddress.js 0xabcd...ef12
```

Deployment info is automatically saved to `deployments/<network>-deployment.json`

### Updating Backend with Contract Address

After successful deployment, update your backend configuration:

**Option A: Using the automated script** (Recommended)
```bash
cd ../backend
node src/tasks/updateContractAddress.js 0xYOUR_CONTRACT_ADDRESS
```

The script will:
- ✅ Validate the Ethereum address format
- ✅ Update `backend/.env` with the new contract address
- ✅ Create a backup of your previous `.env` file
- ✅ Display Etherscan verification links

**Option B: Manual update**

Edit `backend/.env` and add/update:
```env
PROVENANCE_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS_HERE
```

Then restart your backend server for changes to take effect.

## 🔧 Contract Interaction

### Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
const CultureProvenance = await ethers.getContractFactory("CultureProvenance");
const contract = await CultureProvenance.attach("CONTRACT_ADDRESS");

// Register a product
const tx = await contract.registerProduct(
  "0xArtisanAddress",
  "QmXxx...ipfsHash"
);
await tx.wait();

// Get product details
const product = await contract.getProduct(1);
console.log(product);

// Get total products
const total = await contract.getTotalProducts();
console.log("Total products:", total.toString());
```

### Using Ethers.js in Backend

See `backend/src/services/blockchainService.js` for integration example.

## 📊 Contract Events

### ProductRegistered
```solidity
event ProductRegistered(
    uint256 indexed tokenId,
    address indexed artisan,
    string ipfsHash,
    uint256 timestamp
)
```

### ProductUpdated
```solidity
event ProductUpdated(
    uint256 indexed tokenId,
    string newIpfsHash,
    uint256 timestamp
)
```

## 🔐 Security Considerations

- ✅ Uses OpenZeppelin's audited `Ownable` contract
- ✅ Input validation on all functions
- ✅ Access control with `onlyOwner` modifier
- ✅ Immutable product records (except metadata updates)
- ⚠️ Keep private keys secure
- ⚠️ Test thoroughly on testnet before mainnet deployment

## 🛠️ Contract Architecture

```
CultureProvenance (Ownable)
├── Storage
│   ├── _tokenIdCounter (uint256)
│   ├── _products (mapping tokenId => Product)
│   └── _artisanProducts (mapping address => uint256[])
├── Functions
│   ├── registerProduct() [onlyOwner]
│   ├── updateProductMetadata() [onlyOwner]
│   ├── getProduct() [view]
│   ├── getArtisanProducts() [view]
│   ├── productExists() [view]
│   ├── getTotalProducts() [view]
│   └── verifyProduct() [view]
└── Events
    ├── ProductRegistered
    └── ProductUpdated
```

## 📄 License

MIT License

## 🤝 Integration with Backend

Update `backend/.env` with deployed contract address:

```env
CONTRACT_ADDRESS=0xYourDeployedContractAddress
INFURA_ALCHEMY_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key
```

The backend `blockchainService.js` will automatically use this contract for product registration.

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Infura](https://infura.io/)
- [Alchemy](https://www.alchemy.com/)

## 🐛 Troubleshooting

### Gas Estimation Failed
- Ensure wallet has sufficient ETH
- Check RPC URL is correct
- Verify network configuration

### Transaction Reverted
- Check function parameters are valid
- Ensure you're calling from owner address (for restricted functions)
- Verify contract is deployed to correct network

### Contract Verification Failed
- Ensure compiler version matches (0.8.19)
- Check Etherscan API key is valid
- Wait a few minutes after deployment before verifying

---

Built with ❤️ for CultureKart

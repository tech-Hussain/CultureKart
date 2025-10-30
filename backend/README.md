# CultureKart Backend API

Backend server for CultureKart - A blockchain-verified marketplace for authentic Pakistani handicrafts with IPFS storage and smart contract integration.

## 🏗️ Project Overview

This Node.js/Express backend provides:
- **Firebase Authentication** - Secure user authentication with Firebase Admin SDK
- **MongoDB Database** - User, Artisan, Product, and Order management
- **IPFS Integration** - Decentralized metadata storage via NFT.Storage
- **Ethereum Smart Contracts** - Product provenance verification on blockchain
- **Stripe Payments** - Secure payment processing
- **Admin Dashboard API** - Analytics, artisan approval, order management
- **RESTful API** - Complete CRUD operations for all resources

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** v5.0+ running locally or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **Firebase Project** with Admin SDK credentials
- **Stripe Account** for payment processing
- **NFT.Storage API Key** for IPFS uploads
- **Ethereum Node/Provider** (Alchemy, Infura, or local Hardhat network)

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/culturekart
# For MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/culturekart?retryWrites=true&w=majority

# Firebase Admin SDK
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# NFT.Storage (IPFS)
NFT_STORAGE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ethereum/Blockchain
ETHEREUM_NETWORK=goerli
ALCHEMY_API_KEY=your-alchemy-api-key
# Or use Infura: INFURA_PROJECT_ID=your-infura-project-id
PRIVATE_KEY=0xyour-ethereum-private-key-for-contract-deployment

# Smart Contract Addresses (after deployment)
PROVENANCE_CONTRACT_ADDRESS=0x...
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Download the JSON file and extract values to `.env`

### Getting NFT.Storage API Key

1. Visit [NFT.Storage](https://nft.storage/)
2. Sign up/Login with GitHub or email
3. Go to API Keys section
4. Create new API key and copy to `.env`

### Getting Stripe Keys

1. Visit [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get test keys from Developers → API Keys
3. For webhook secret: Developers → Webhooks → Add endpoint → Get signing secret

## 📦 Installation

1. **Clone the repository** (if not already done):
```bash
git clone <repository-url>
cd CultureKart/backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
# Copy example env file (if provided)
cp .env.example .env

# Edit .env with your actual credentials
notepad .env  # Windows
nano .env     # Linux/Mac
```

4. **Install MongoDB** (if running locally):
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **Mac**: `brew install mongodb-community`
   - **Linux**: Follow [official docs](https://www.mongodb.com/docs/manual/installation/)

## 🗄️ Database Setup

### Local MongoDB

Start MongoDB service:
```bash
# Windows (as Administrator)
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Add database user (Database Access)
4. Whitelist your IP address (Network Access)
5. Get connection string and update `MONGO_URI` in `.env`

## 🌱 Seed Database

Populate the database with sample data for development:

```bash
node scripts/seed.js
```

This will create:
- **4 Sample Users**:
  - Admin: `admin@culturekart.com` (role: admin)
  - Artisan 1: `fatima@artisan.com` (role: artisan)
  - Artisan 2: `ahmed@pottery.com` (role: artisan)
  - Buyer: `buyer@example.com` (role: buyer)
  
- **2 Artisan Profiles**:
  - Fatima Textile Arts (Lahore) - Traditional embroidery
  - Ahmed Pottery Studio (Multan) - Blue pottery

- **6 Sample Products**:
  - Hand-Embroidered Phulkari Dupatta
  - Blue Pottery Decorative Vase
  - Ajrak Block Print Fabric
  - Brass Engraved Wall Hanging
  - Handwoven Ralli Quilt
  - Camel Skin Lamp Shade

- **3 Sample Orders** with different statuses (delivered, shipped, confirmed)

**Note**: Firebase UIDs in seed data are placeholders. For actual authentication, users must sign up through the frontend Firebase Auth.

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

Server will run on `http://localhost:5000` with nodemon watching for changes.

### Production Mode
```bash
npm start
```

### Check Server Health
```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CultureKart API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## 🧪 Testing

Run the test suite with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

Current test coverage:
- ✅ Health check endpoint (`tests/health.test.js`)
- ✅ Authentication verification with Firebase mock (`tests/auth.test.js`)

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
Include Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### **Health Check**
```
GET /health
```
Check API server status.

---

#### **Authentication**

```
POST /auth/verify
Headers: Authorization: Bearer <token>
```
Verify Firebase token and create/retrieve user.

```
GET /auth/profile
Headers: Authorization: Bearer <token>
```
Get current user profile.

```
PATCH /auth/profile
Headers: Authorization: Bearer <token>
Body: { name, profile: { bio, location, phone } }
```
Update user profile.

---

#### **Products**

```
GET /products
Query: ?page=1&limit=20&category=Textiles&search=embroidery&minPrice=50&maxPrice=200&status=available
```
List products with filters and pagination.

```
GET /products/:id
```
Get single product details.

```
POST /products
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: FormData with title, description, price, stock, category, images[]
```
Create new product (artisan only).

```
PATCH /products/:id
Headers: Authorization: Bearer <token>
Body: { title, description, price, stock, status }
```
Update product (owner only).

```
DELETE /products/:id
Headers: Authorization: Bearer <token>
```
Delete product (owner/admin only).

---

#### **Payments**

```
POST /payments/create-intent
Headers: Authorization: Bearer <token>
Body: { amount, currency: "usd" }
```
Create Stripe payment intent.

```
POST /payments/webhook
Headers: stripe-signature
```
Stripe webhook for payment events.

---

#### **Orders**

```
GET /orders
Headers: Authorization: Bearer <token>
```
Get user's orders.

```
GET /orders/:id
Headers: Authorization: Bearer <token>
```
Get single order details.

```
POST /orders
Headers: Authorization: Bearer <token>
Body: { items, paymentInfo, shippingAddress, totalPrice }
```
Create new order.

```
PATCH /orders/:id/status
Headers: Authorization: Bearer <token>
Body: { status: "confirmed|shipped|delivered|cancelled" }
```
Update order status (seller/admin).

---

#### **Admin Routes** (Admin role required)

```
GET /admin/summary
```
Dashboard statistics (users, products, orders, revenue).

```
GET /admin/sales-monthly
```
Monthly sales data for last 12 months.

```
GET /admin/top-products
Query: ?limit=10
```
Top selling products.

```
GET /admin/artisans
Query: ?verified=false
```
List artisans (filter by verification status).

```
PATCH /admin/artisans/:id/approve
```
Approve artisan verification.

```
PATCH /admin/artisans/:id/reject
Body: { reason }
```
Reject artisan application.

---

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## ⛓️ Smart Contract Deployment

Deploy the CultureProvenance contract to Sepolia testnet (or other Ethereum networks):

### Prerequisites for Deployment

1. **Get Sepolia ETH** from faucets (needed for gas fees):
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

2. **Get an RPC Provider** (choose one):
   - **Alchemy**: Sign up at [alchemy.com](https://www.alchemy.com/) → Create app → Get API key
   - **Infura**: Sign up at [infura.io](https://www.infura.io/) → Create project → Get project ID

3. **Prepare your wallet private key**:
   - Export from MetaMask: Settings → Advanced → Export Private Key
   - ⚠️ **NEVER commit your private key to Git!**

### Step-by-Step Deployment

#### 1. Navigate to contracts directory
```bash
cd ../contracts
```

#### 2. Install Hardhat dependencies (if not already installed)
```bash
npm install
```

#### 3. Configure environment variables

Create `.env` file in the `contracts/` directory:

```env
# RPC URL for Sepolia testnet
INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
# Or use Infura: https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Your wallet private key (with Sepolia ETH for gas)
PRIVATE_KEY=0xyour_private_key_here

# Optional: For contract verification on Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Network Configuration** (already in `hardhat.config.js`):
```javascript
networks: {
  sepolia: {
    url: process.env.INFURA_ALCHEMY_RPC_URL || "",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 11155111,
  }
}
```

#### 4. Deploy contract to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected output**:
```
🚀 Starting CultureProvenance contract deployment...

🌐 Target Network: sepolia
✅ Deploying to Sepolia testnet
📝 Deploying contract with account: 0x1234...5678
💰 Account balance: 0.5 ETH

⏳ Deploying CultureProvenance contract...

✅ CultureProvenance contract deployed successfully!
📍 Contract Address: 0xabcd...ef12
👤 Owner Address: 0x1234...5678
📄 Deployment Transaction Hash: 0x9876...4321

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

#### 5. Update backend with contract address

**Option A: Automatic update with script** (Recommended)
```bash
cd ../backend
node src/tasks/updateContractAddress.js 0xYOUR_CONTRACT_ADDRESS
```

**Option B: Manual update**

Edit `backend/.env` and add/update:
```env
# Smart Contract Address (CultureProvenance on Sepolia)
PROVENANCE_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

#### 6. Verify contract on Etherscan (Optional but recommended)

Get Etherscan API key from [etherscan.io](https://etherscan.io/apis)

```bash
# Add to contracts/.env
ETHERSCAN_API_KEY=your_etherscan_api_key

# Verify contract
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS
```

After verification, view your contract at:
```
https://sepolia.etherscan.io/address/0xYOUR_CONTRACT_ADDRESS
```

### Deploy to Other Networks

**Local Hardhat Network** (for development):
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.js --network localhost
```

**Ethereum Mainnet** (production - requires real ETH):
```bash
# Update contracts/.env with mainnet RPC URL
INFURA_ALCHEMY_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Deploy
npx hardhat run scripts/deploy.js --network mainnet

# Verify
npx hardhat verify --network mainnet 0xYOUR_CONTRACT_ADDRESS
```

### Deployment Troubleshooting

**Error**: `Error: insufficient funds for intrinsic transaction cost`
- **Solution**: Get more Sepolia ETH from faucets listed above

**Error**: `Invalid nonce`
- **Solution**: Wait a few seconds and try again, or reset nonce in MetaMask

**Error**: `Error: could not detect network`
- **Solution**: Check `INFURA_ALCHEMY_RPC_URL` in `.env` is correct

**Error**: `Error: private key not provided`
- **Solution**: Ensure `PRIVATE_KEY` is set in `contracts/.env` (with `0x` prefix)

### Contract Interaction Example

After deployment, test the contract:

```javascript
// In backend/src/services/blockchain.js
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.INFURA_ALCHEMY_RPC_URL);
const contract = new ethers.Contract(
  process.env.PROVENANCE_CONTRACT_ADDRESS,
  CultureProvenanceABI,
  provider
);

// Check total products
const total = await contract.getTotalProducts();
console.log('Total products:', total.toString());
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # MongoDB connection
│   │   └── firebase.js  # Firebase Admin setup
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Firebase token verification
│   │   ├── errorHandler.js
│   │   └── upload.js    # Multer file upload
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Artisan.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── services/        # Business logic
│   │   ├── ipfs.js      # NFT.Storage integration
│   │   └── blockchain.js # Ethers.js contract interaction
│   ├── tasks/           # Utility scripts
│   │   └── updateContractAddress.js # Update .env with contract address
│   └── utils/           # Helper functions
│       ├── validators.js
│       └── formatters.js
├── scripts/
│   └── seed.js          # Database seeding script
├── tests/               # Jest test files
│   ├── health.test.js
│   └── auth.test.js
├── uploads/             # Temporary file uploads
├── .env                 # Environment variables
├── .env.example         # Example env file
├── .env.backup          # Automatic backup (created by updateContractAddress)
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError`

**Solution**:
- Check if MongoDB service is running: `net start MongoDB` (Windows) or `sudo systemctl status mongod` (Linux)
- Verify `MONGO_URI` in `.env` is correct
- For Atlas: Check IP whitelist and database user credentials

---

### Firebase Authentication Errors

**Error**: `Firebase ID token has expired`

**Solution**:
- Tokens expire after 1 hour
- Frontend should refresh token automatically
- Check Firebase project configuration

**Error**: `Error while making request: ECONNREFUSED`

**Solution**:
- Verify Firebase credentials in `.env`
- Check `FIREBASE_PRIVATE_KEY` has proper line breaks: `\n`
- Ensure Firebase project has Authentication enabled

---

### Stripe Payment Issues

**Error**: `No such PaymentIntent`

**Solution**:
- Verify `STRIPE_SECRET_KEY` is correct (starts with `sk_test_` for testing)
- Check payment intent ID format
- Test with Stripe test card: `4242 4242 4242 4242`

---

### File Upload Errors

**Error**: `File too large` or `Invalid file type`

**Solution**:
- Check file size limits in `middleware/upload.js` (default: 10MB)
- Allowed types: JPEG, PNG, GIF, WebP
- Ensure `uploads/` directory exists and has write permissions

---

### IPFS Upload Failures

**Error**: `NFT.Storage API error`

**Solution**:
- Verify `NFT_STORAGE_API_KEY` is valid
- Check API key limits (free tier: 100MB storage, 31GB bandwidth/month)
- Ensure file size is under 100MB

---

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows - find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

---

### Test Failures

**Error**: Tests timing out

**Solution**:
- Increase Jest timeout in `package.json`:
```json
{
  "jest": {
    "testTimeout": 10000
  }
}
```
- Check if MongoDB test database is accessible
- Verify Firebase mock is working (tests should not make real Firebase calls)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@culturekart.com
- Documentation: [CultureKart Docs](https://docs.culturekart.com)

## 🎯 Next Steps

- [ ] Add more comprehensive integration tests
- [ ] Implement rate limiting for API endpoints
- [ ] Add Redis caching for frequently accessed data
- [ ] Set up CI/CD pipeline with GitHub Actions
- [ ] Deploy to production environment (AWS/Heroku/Railway)
- [ ] Configure CDN for image delivery
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement real-time notifications with WebSockets

---

**Built with ❤️ for Pakistani artisans** | CultureKart Backend v1.0.0

# CultureKart 🛍️

**CultureKart** is a MERN-based e-commerce platform connecting Pakistani artisans directly to global buyers. It combines modern web technologies with blockchain for product provenance and authenticity verification.

---

## 🚀 Quick Start (5 Minutes)

**Already have accounts?** Skip to detailed setup below. New developers start here:

```bash
# 1. Clone and install
git clone https://github.com/tech-Hussain/CultureKart.git
cd CultureKart

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (see setup guide below)
node scripts/seed.js
npm run dev  # Runs on http://localhost:5000

# 3. Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev  # Runs on http://localhost:5173

# 4. Smart contracts (optional for development)
cd ../contracts
npm install
npx hardhat compile
```

**First time?** You'll need accounts for:
- 🔥 [Firebase](https://console.firebase.google.com/) (Authentication)
- 🗄️ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Database)
- 💳 [Stripe](https://dashboard.stripe.com/) (Payments)
- 📦 [NFT.Storage](https://nft.storage/) (IPFS)
- ⛓️ [Alchemy](https://www.alchemy.com/) (Blockchain RPC)

See **complete setup guide** below for step-by-step instructions.

---

## 🎯 Features

- **Artisan Marketplace**: Direct connection between Pakistani artisans and global customers
- **Blockchain Provenance**: Solidity smart contracts for product authenticity tracking
- **Multi-Payment Support**: Integrated Stripe payment gateway with test mode
- **Decentralized Storage**: IPFS for product media and metadata
- **Firebase Authentication**: Google Sign-in with secure backend verification
- **Admin Dashboard**: Analytics and charts for inventory, sales, and user management
- **Responsive Design**: Tailwind CSS with Pakistani cultural motifs (Ajrak, truck art)

---

## 📚 Table of Contents

- [Quick Start](#-quick-start-5-minutes)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Project Structure](#-project-structure)
- [Complete Setup Guide](#-getting-started)
  - [1. Clone Repository](#1️⃣-clone-the-repository)
  - [2. MongoDB Setup](#2️⃣-mongodb-setup)
  - [3. Firebase Setup](#3️⃣-firebase-setup)
  - [4. Stripe Setup](#4️⃣-stripe-setup)
  - [5. IPFS/NFT.Storage Setup](#5️⃣-ipfs--nftstorage-setup)
  - [6. Blockchain Setup](#6️⃣-blockchain-setup-sepolia-testnet)
  - [7. Backend Setup](#7️⃣-backend-setup)
  - [8. Frontend Setup](#8️⃣-frontend-setup)
  - [9. Smart Contract Deployment](#9️⃣-smart-contract-deployment)
  - [10. Verify Setup](#-verify-setup)
- [Environment Variables](#-environment-variables)
- [Command Reference](#-quick-command-reference)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Security Best Practices](#-security-best-practices)
- [Deployment](#-production-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗️ Architecture

CultureKart follows a layered architecture:

```
┌─────────────────────────────────────────────┐
│          Client Layer (React + Vite)        │
│         Tailwind CSS, Recharts              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│     Application Layer (Node + Express)      │
│      API Routes (/api/v1), Middleware       │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───▼──────────────┐   ┌────────▼─────────────┐
│   Data Layer     │   │  Blockchain Layer    │
│   (MongoDB)      │   │  (Solidity/Hardhat)  │
│   Mongoose ODM   │   │  Product Provenance  │
└──────────────────┘   └──────────────────────┘
```

## 📁 Project Structure

```
CultureKart/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
├── contracts/         # Solidity smart contracts
├── infra/            # Infrastructure configs
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- **MongoDB** (local installation or Atlas account)
- **MetaMask** browser extension (for blockchain interactions)
- **Code Editor** (VS Code recommended)

### 📋 Complete Setup Guide

Follow these steps in order to set up the entire CultureKart platform:

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/tech-Hussain/CultureKart.git
cd CultureKart
```

---

## 2️⃣ MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Configure Database Access**
   - Go to **Database Access** → Add New Database User
   - Create username and password (save these!)
   - Select **Read and write to any database**

3. **Configure Network Access**
   - Go to **Network Access** → Add IP Address
   - Click **Allow Access from Anywhere** (0.0.0.0/0) for development
   - For production, whitelist specific IPs

4. **Get Connection String**
   - Click **Connect** → **Connect your application**
   - Copy the connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/culturekart?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your credentials

### Option B: Local MongoDB

1. **Install MongoDB**
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **Mac**: `brew install mongodb-community`
   - **Linux**: `sudo apt-get install mongodb`

2. **Start MongoDB Service**
   ```bash
   # Windows (as Administrator)
   net start MongoDB

   # Mac
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. **Connection String**
   ```
   mongodb://localhost:27017/culturekart
   ```

---

## 3️⃣ Firebase Setup

### Create Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
   - Click **Add Project**
   - Enter project name: "CultureKart" (or your choice)
   - Disable Google Analytics (optional)
   - Click **Create Project**

2. **Enable Google Sign-In**
   - In Firebase Console, go to **Authentication** → **Sign-in method**
   - Click **Google** → **Enable**
   - Set support email
   - Click **Save**

3. **Get Frontend Firebase Config**
   - Go to **Project Settings** (gear icon) → **General**
   - Scroll to **Your apps** → Click **Web** icon (</>) to add web app
   - Register app name: "CultureKart Frontend"
   - Copy the config object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "culturekart-xxxxx.firebaseapp.com",
     projectId: "culturekart-xxxxx",
     storageBucket: "culturekart-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

4. **Get Backend Firebase Admin SDK**
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Download the JSON file (keep it secure!)
   - Open the JSON file and note these values:
     - `project_id`
     - `private_key`
     - `client_email`

### Configure Firebase OAuth

1. **Add Authorized Domains**
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Add: `localhost`, your production domain

2. **OAuth Consent Screen** (for production)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Configure OAuth consent screen

---

## 4️⃣ Stripe Setup

### Get Stripe API Keys

1. **Create Stripe Account**
   - Visit [Stripe Dashboard](https://dashboard.stripe.com/)
   - Sign up for a free account

2. **Get Test API Keys**
   - Go to **Developers** → **API Keys**
   - Copy **Publishable key** (starts with `pk_test_`)
   - Copy **Secret key** (starts with `sk_test_`)
   - ⚠️ **Never share or commit the secret key!**

3. **Set Up Webhook** (for payment events)
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - URL: `http://localhost:5000/api/v1/payments/webhook` (development)
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`)

### Test Cards

Use these test cards in development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`
- Any future expiry date, any CVC

---

## 5️⃣ IPFS / NFT.Storage Setup

### Get NFT.Storage API Key

1. **Visit [NFT.Storage](https://nft.storage/)**
2. Sign up with GitHub or email
3. Go to **API Keys** section
4. Click **+ New Key**
5. Name it "CultureKart"
6. Copy the API key (starts with `eyJhbGciOiJIUzI1NiIs...`)

### Alternative: Pinata

1. Visit [Pinata](https://www.pinata.cloud/)
2. Sign up for free account
3. Go to **API Keys** → **New Key**
4. Copy API Key and API Secret

---

## 6️⃣ Blockchain Setup (Sepolia Testnet)

### Get Alchemy/Infura RPC URL

**Option A: Alchemy (Recommended)**
1. Visit [Alchemy](https://www.alchemy.com/)
2. Sign up and create a new app
3. Select **Ethereum** → **Sepolia** network
4. Copy the HTTPS URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

**Option B: Infura**
1. Visit [Infura](https://www.infura.io/)
2. Create project
3. Copy Sepolia endpoint

### Get Sepolia Test ETH

Get free Sepolia ETH from these faucets:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

### Export MetaMask Private Key

⚠️ **SECURITY WARNING**: Never share your private key!

1. Open MetaMask
2. Click account icon → **Account Details**
3. Click **Show Private Key**
4. Enter password
5. Copy the private key (starts with `0x`)

---

## 7️⃣ Backend Setup

```bash
cd backend
npm install
```

### Configure Backend Environment

Create `backend/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/culturekart?retryWrites=true&w=majority
# Or for local: mongodb://localhost:27017/culturekart

# Firebase Admin SDK (from downloaded JSON file)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=culturekart-xxxxx
FIREBASE_PRIVATE_KEY_ID=1234567890abcdef
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...your-key-here...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@culturekart-xxxxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40culturekart-xxxxx.iam.gserviceaccount.com

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_51Abc...your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_...your-webhook-secret

# NFT.Storage (IPFS)
NFT_STORAGE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Pinata (alternative to NFT.Storage)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Ethereum/Blockchain
ETHEREUM_NETWORK=sepolia
INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=0xyour_metamask_private_key

# Smart Contract Address (leave empty until deployed)
PROVENANCE_CONTRACT_ADDRESS=
```

### Seed Database with Sample Data

```bash
node scripts/seed.js
```

This creates:
- Sample admin user: `admin@culturekart.com`
- Sample artisans: `fatima@artisan.com`, `ahmed@pottery.com`
- Sample buyer: `buyer@example.com`
- 6 sample products
- 3 sample orders

### Start Backend Server

```bash
npm run dev
```

Backend should be running at `http://localhost:5000`

Test health endpoint:
```bash
curl http://localhost:5000/api/v1/health
```

---

## 8️⃣ Frontend Setup

```bash
cd frontend
npm install
```

### Configure Frontend Environment

Create `frontend/.env` file:

```env
# Backend API
VITE_API_URL=http://localhost:5000/api/v1

# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...your-api-key
VITE_FIREBASE_AUTH_DOMAIN=culturekart-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=culturekart-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=culturekart-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...your-publishable-key

# IPFS Gateway for displaying images
VITE_IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

### Start Frontend Development Server

```bash
npm run dev
```

Frontend should be running at `http://localhost:5173`

Open browser and navigate to `http://localhost:5173`

---

## 9️⃣ Smart Contract Deployment

### Setup Contracts

```bash
cd contracts
npm install
```

### Configure Contracts Environment

Create `contracts/.env` file:

```env
# Sepolia RPC URL (same as backend)
INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Deployer Private Key (same as backend)
PRIVATE_KEY=0xyour_metamask_private_key

# Optional: Etherscan API Key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected output:**
```
✅ CultureProvenance contract deployed successfully!
📍 Contract Address: 0xabcd1234...
```

### Update Backend with Contract Address

**Option A: Automated script**
```bash
cd ../backend
node src/tasks/updateContractAddress.js 0xYOUR_CONTRACT_ADDRESS
```

**Option B: Manual**
Edit `backend/.env` and add:
```env
PROVENANCE_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

### Verify Contract on Etherscan (Optional)

```bash
cd contracts
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS
```

View your contract at: `https://sepolia.etherscan.io/address/0xYOUR_CONTRACT_ADDRESS`

---

## 🎯 Verify Setup

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Response should be:
# {"status":"ok","message":"CultureKart API is running","timestamp":"..."}
```

### Test Frontend

1. Open `http://localhost:5173`
2. Click **Sign In** (top right)
3. Test Google Sign-in
4. Browse products
5. Add to cart
6. Test checkout with Stripe test card: `4242 4242 4242 4242`

### Test Blockchain Integration

1. Create a product as an artisan
2. Upload images (IPFS)
3. Check blockchain transaction on Sepolia Etherscan
4. Verify product provenance

---

## 🎮 Development Commands

### Backend (Port 5000)
```bash
cd backend
npm run dev          # Start with auto-reload
npm start            # Production mode
npm test             # Run Jest tests
node scripts/seed.js # Seed database
```

### Frontend (Port 5173)
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Run ESLint
```

### Smart Contracts
```bash
cd contracts
npx hardhat compile              # Compile contracts
npx hardhat test                 # Run tests
npx hardhat run scripts/deploy.js --network sepolia  # Deploy to Sepolia
npx hardhat verify --network sepolia <ADDRESS>       # Verify contract
npx hardhat node                 # Local blockchain
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### ❌ MongoDB Connection Error

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
- **Atlas**: Check username/password in connection string, verify IP whitelist
- **Local**: Ensure MongoDB service is running: `net start MongoDB` (Windows)
- Test connection: `mongosh "mongodb://localhost:27017/culturekart"`

---

#### ❌ Firebase Authentication Failed

**Error**: `Firebase ID token has expired` or `Error while making request`

**Solutions**:
- Verify Firebase credentials in `backend/.env` are correct
- Check `FIREBASE_PRIVATE_KEY` has proper line breaks (`\n`)
- Ensure Firebase Authentication is enabled in console
- Frontend `.env` has correct `VITE_FIREBASE_` variables
- Token expires after 1 hour - refresh page to get new token

---

#### ❌ Stripe Payment Fails

**Error**: `No such PaymentIntent` or `Invalid API Key`

**Solutions**:
- Use test keys (starting with `pk_test_` and `sk_test_`)
- Test with card `4242 4242 4242 4242`
- Verify `STRIPE_SECRET_KEY` in backend `.env`
- Check webhook endpoint is configured correctly
- Ensure frontend has `VITE_STRIPE_PUBLISHABLE_KEY`

---

#### ❌ IPFS Upload Fails

**Error**: `NFT.Storage API error` or `Upload failed`

**Solutions**:
- Verify `NFT_STORAGE_API_KEY` is valid
- Check file size (max 100MB for free tier)
- Try alternative: Configure Pinata keys
- Test API key at [NFT.Storage](https://nft.storage/)
- Check internet connection and firewall settings

---

#### ❌ Smart Contract Deployment Fails

**Error**: `insufficient funds` or `Error: could not detect network`

**Solutions**:
- **Insufficient funds**: Get Sepolia ETH from faucets listed above
- **Network error**: Check `INFURA_ALCHEMY_RPC_URL` is correct
- **Nonce error**: Wait 30 seconds and retry
- **Private key error**: Ensure it starts with `0x`
- Verify you're on Sepolia network in MetaMask

---

#### ❌ Frontend Build Fails

**Error**: `Module not found` or `Cannot resolve dependency`

**Solutions**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

#### ❌ Backend Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
```powershell
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in backend/.env
PORT=5001
```

---

#### ❌ CORS Errors

**Error**: `Access-Control-Allow-Origin` blocked

**Solutions**:
- Ensure `CLIENT_URL=http://localhost:5173` in backend `.env`
- Check backend CORS middleware allows frontend origin
- For production, update `CLIENT_URL` to your domain

---

#### ❌ Google Sign-In Not Working

**Error**: OAuth popup blocked or redirect fails

**Solutions**:
- Add `localhost` to Firebase Authorized Domains
- Check browser allows popups from localhost
- Verify Firebase config in frontend `.env`
- Clear browser cache and cookies
- Try incognito/private mode

---

## 🔐 Security Best Practices

### ⚠️ Critical Security Rules

1. **Never Commit Secrets to Git**
   ```bash
   # Always in .gitignore:
   .env
   .env.local
   .env.production
   *firebase-adminsdk*.json
   ```

2. **Protect Private Keys**
   - ❌ **NEVER** share MetaMask private keys
   - ❌ **NEVER** commit `.env` files
   - ✅ Use environment variables
   - ✅ Rotate keys if exposed

3. **Firebase Service Account**
   - ❌ **DO NOT** commit the downloaded JSON file
   - ✅ Store in `.env` or secure vault
   - ✅ Use environment variables in production
   - ✅ Restrict permissions to minimum required

4. **Stripe Keys**
   - ✅ Use test keys in development (`sk_test_*`)
   - ✅ Store production keys in secure environment
   - ❌ Never expose secret key to frontend
   - ✅ Implement webhook signature verification

5. **MongoDB Security**
   - ✅ Use strong passwords
   - ✅ Enable IP whitelisting in Atlas
   - ✅ Use read-only users where possible
   - ❌ Don't use default MongoDB port in production
   - ✅ Enable authentication even locally

6. **IPFS / NFT.Storage**
   - ✅ API keys are less sensitive (read-only)
   - ✅ Still keep in `.env` files
   - ✅ Monitor usage to detect abuse
   - ✅ Rotate if compromised

### 🔒 Production Checklist

- [ ] Use HTTPS everywhere (TLS/SSL certificates)
- [ ] Enable Firebase App Check for abuse prevention
- [ ] Set up rate limiting on API endpoints
- [ ] Use production Stripe keys with live mode
- [ ] Deploy smart contracts to mainnet (costs real ETH)
- [ ] Configure proper CORS origins (no wildcards)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set strong JWT secrets (random 64+ characters)
- [ ] Configure CSP (Content Security Policy) headers
- [ ] Enable Helmet.js for Express security headers
- [ ] Use HTTPS for IPFS gateway URLs
- [ ] Set up monitoring and alerting
- [ ] Regular security audits of smart contracts
- [ ] Implement 2FA for admin accounts
- [ ] Backup database regularly
- [ ] Use environment-specific Firebase projects

### 🔑 Key Rotation Schedule

| Secret Type | Rotation Frequency | Priority |
|-------------|-------------------|----------|
| Firebase Service Account | 90 days | High |
| Stripe API Keys | 180 days | High |
| JWT Secret | 90 days | Critical |
| MetaMask Private Key | If exposed | Critical |
| MongoDB Password | 90 days | High |
| NFT.Storage API Key | 180 days | Medium |

### 📱 Environment-Specific Configs

```bash
# Development
VITE_API_URL=http://localhost:5000/api/v1
STRIPE_SECRET_KEY=sk_test_...

# Staging
VITE_API_URL=https://staging-api.culturekart.com/api/v1
STRIPE_SECRET_KEY=sk_test_...

# Production
VITE_API_URL=https://api.culturekart.com/api/v1
STRIPE_SECRET_KEY=sk_live_...
```

---

## 📚 Additional Resources

### Documentation
- [Backend API Docs](./backend/README.md) - Complete backend setup and API reference
- [Smart Contracts](./contracts/README.md) - Contract deployment and interaction
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment steps

### External Services
- [Firebase Console](https://console.firebase.google.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [NFT.Storage](https://nft.storage/)
- [Alchemy Dashboard](https://www.alchemy.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)

### Learning Resources
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Docs](https://docs.ethers.org/)
- [React + Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Stripe Integration](https://stripe.com/docs/development)

---

## 🎮 Quick Command Reference

### Backend (Port 5000)
```bash
cd backend
npm run dev          # Development with nodemon
npm start            # Production mode
npm test             # Run tests with Jest
npm run test:watch   # Watch mode for tests
node scripts/seed.js # Seed database with sample data
```

### Frontend (Port 5173)
```bash
cd frontend
npm run dev          # Development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Smart Contracts
```bash
cd contracts
npx hardhat compile                                    # Compile Solidity contracts
npx hardhat test                                       # Run contract tests
npx hardhat run scripts/deploy.js --network sepolia    # Deploy to Sepolia
npx hardhat verify --network sepolia <ADDRESS>         # Verify on Etherscan
npx hardhat node                                       # Start local blockchain
```

---

## 🧪 Testing

```bash
# Backend tests (Jest + Supertest)
cd backend
npm test                  # Run all tests
npm test health.test.js   # Run specific test
npm run test:coverage     # Coverage report

# Frontend tests (Vitest + React Testing Library)
cd frontend
npm test

# Smart contract tests (Hardhat + Chai)
cd contracts
npx hardhat test
npx hardhat test --network localhost
REPORT_GAS=true npx hardhat test  # With gas reporting
```

---

## 📦 Production Deployment

### Quick Deploy Checklist

1. **Environment Setup**
   - [ ] Set all production environment variables
   - [ ] Use production Firebase project
   - [ ] Switch to Stripe live keys
   - [ ] Deploy contract to Ethereum mainnet
   - [ ] Update all URLs to production domains

2. **Security**
   - [ ] Enable HTTPS (SSL/TLS)
   - [ ] Configure CORS for production domain only
   - [ ] Rotate all API keys and secrets
   - [ ] Enable Firebase App Check
   - [ ] Set up MongoDB Atlas production cluster

3. **Build & Deploy**
   ```bash
   # Frontend
   cd frontend
   npm run build
   # Deploy dist/ folder to Vercel/Netlify/AWS S3
   
   # Backend
   cd backend
   npm start
   # Deploy to Heroku/Railway/AWS EC2
   ```

4. **Post-Deployment**
   - [ ] Test all features end-to-end
   - [ ] Monitor logs and errors
   - [ ] Set up uptime monitoring
   - [ ] Configure CDN for static assets
   - [ ] Enable database backups

For detailed deployment instructions, see [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

## 🔐 Environment Variables

### Backend Environment Variables

All backend environment variables go in `backend/.env`:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| **Server** |
| `NODE_ENV` | Environment mode | `development` or `production` | ✓ |
| `PORT` | Server port | `5000` | ✓ |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` | ✓ |
| **Database** |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/culturekart` | ✓ |
| **Firebase Admin SDK** |
| `FIREBASE_TYPE` | Service account type | `service_account` | ✓ |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `culturekart-xxxxx` | ✓ |
| `FIREBASE_PRIVATE_KEY_ID` | Private key ID | `1234567890abcdef` | ✓ |
| `FIREBASE_PRIVATE_KEY` | Private key (with \n) | `"-----BEGIN PRIVATE KEY-----\n..."` | ✓ |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-xxx@project.iam.gserviceaccount.com` | ✓ |
| `FIREBASE_CLIENT_ID` | Client ID | `123456789012345678901` | ✓ |
| `FIREBASE_AUTH_URI` | Auth URI | `https://accounts.google.com/o/oauth2/auth` | ✓ |
| `FIREBASE_TOKEN_URI` | Token URI | `https://oauth2.googleapis.com/token` | ✓ |
| `FIREBASE_AUTH_PROVIDER_CERT_URL` | Auth cert URL | `https://www.googleapis.com/oauth2/v1/certs` | ✓ |
| `FIREBASE_CLIENT_CERT_URL` | Client cert URL | `https://www.googleapis.com/robot/v1/metadata/x509/...` | ✓ |
| **Stripe** |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_51Abc...` (test) or `sk_live_...` (prod) | ✓ |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` | ✓ |
| **IPFS** |
| `NFT_STORAGE_API_KEY` | NFT.Storage API key | `eyJhbGciOiJIUzI1NiIs...` | ✓ |
| `PINATA_API_KEY` | Pinata API key (optional) | `your_pinata_key` | - |
| `PINATA_SECRET_KEY` | Pinata secret (optional) | `your_pinata_secret` | - |
| **Blockchain** |
| `ETHEREUM_NETWORK` | Network name | `sepolia` or `mainnet` | ✓ |
| `INFURA_ALCHEMY_RPC_URL` | RPC endpoint | `https://eth-sepolia.g.alchemy.com/v2/API_KEY` | ✓ |
| `PRIVATE_KEY` | Deployer wallet key | `0x1234...` (keep secret!) | ✓ |
| `PROVENANCE_CONTRACT_ADDRESS` | Deployed contract address | `0xabcd...` | ✓ |

### Frontend Environment Variables

All frontend variables go in `frontend/.env` (must start with `VITE_`):

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` | ✓ |
| **Firebase Client Config** |
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` | ✓ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | `culturekart-xxxxx.firebaseapp.com` | ✓ |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `culturekart-xxxxx` | ✓ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | `culturekart-xxxxx.appspot.com` | ✓ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | `123456789` | ✓ |
| `VITE_FIREBASE_APP_ID` | App ID | `1:123456789:web:abcdef` | ✓ |
| **Payments** |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` (test) or `pk_live_...` (prod) | ✓ |
| **IPFS** |
| `VITE_IPFS_GATEWAY_URL` | IPFS gateway for images | `https://gateway.pinata.cloud/ipfs/` | ✓ |

### Smart Contracts Environment Variables

Variables for `contracts/.env`:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `INFURA_ALCHEMY_RPC_URL` | RPC endpoint | `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY` | ✓ |
| `PRIVATE_KEY` | Deployer private key | `0x1234567890abcdef...` | ✓ |
| `ETHERSCAN_API_KEY` | Etherscan API (for verification) | `ABC123...` | - |
| `REPORT_GAS` | Enable gas reporting | `true` or `false` | - |

### Example .env Files

**backend/.env** (example):
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/culturekart
FIREBASE_PROJECT_ID=culturekart-a1b2c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@culturekart.iam.gserviceaccount.com
STRIPE_SECRET_KEY=sk_test_51AbCdEf...
NFT_STORAGE_API_KEY=eyJhbGciOiJIUzI1...
INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xabcd1234...
PROVENANCE_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

**frontend/.env** (example):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=AIzaSyAbc123...
VITE_FIREBASE_PROJECT_ID=culturekart-a1b2c
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEf...
VITE_IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

---

## 🧪 Testing

Run the test suites to ensure everything is working:

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm test health.test.js     # Run specific test file
npm test auth.test.js       # Test authentication
npm run test:watch          # Watch mode for TDD
npm run test:coverage       # Generate coverage report
```

**Test Files:**
- `tests/health.test.js` - API health check endpoint
- `tests/auth.test.js` - Firebase authentication with mocks

### Frontend Tests
```bash
cd frontend
npm test                    # Run Vitest tests
npm run test:ui             # Interactive test UI
npm run test:coverage       # Coverage report
```

### Smart Contract Tests
```bash
cd contracts
npx hardhat test                        # Run all contract tests
npx hardhat test test/CultureProvenance.test.js  # Specific test
REPORT_GAS=true npx hardhat test        # With gas usage report
npx hardhat coverage                    # Solidity coverage
```

---

## 📦 Deployment

Refer to the deployment guide in `/infra` for production deployment instructions.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: Firebase Auth, JWT
- **Payments**: Stripe, JazzCash
- **Storage**: IPFS, Pinata
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Testing**: Jest, Mocha, Chai

## 📄 API Documentation

All API endpoints are prefixed with `/api/v1`. Detailed API documentation is available after starting the backend server at `/api/v1/docs`.

## 🤝 Contributing

We welcome contributions from the community! Here's how to contribute:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CultureKart.git
   cd CultureKart
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Run tests**
   ```bash
   # Backend
   cd backend && npm test
   
   # Frontend
   cd frontend && npm test
   
   # Contracts
   cd contracts && npx hardhat test
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

### Code Style Guidelines

- **JavaScript/React**: ESLint + Prettier (configs included)
- **Solidity**: Solhint for smart contracts
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation changes
  - `test:` Test additions/modifications
  - `refactor:` Code refactoring

### Testing Requirements

- All new features must include tests
- Maintain or improve code coverage
- Smart contracts must pass all security checks

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 CultureKart

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Team & Support

### Project Team

**CultureKart** is built with ❤️ to empower Pakistani artisans and preserve cultural heritage through technology.

### Get Help

- **📧 Email**: support@culturekart.com
- **🐛 Issues**: [GitHub Issues](https://github.com/tech-Hussain/CultureKart/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/tech-Hussain/CultureKart/discussions)
- **📖 Docs**: See README files in each directory
  - [Backend Documentation](./backend/README.md)
  - [Smart Contracts Guide](./contracts/README.md)
  - [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### Community

- Star ⭐ the repo if you find it useful
- Share with others who might benefit
- Contribute and help improve the platform

---

## 🎓 Learning Path

New to blockchain or MERN stack? Here's a suggested learning path:

### Prerequisites
1. JavaScript ES6+ fundamentals
2. Node.js and npm basics
3. React fundamentals

### Backend Development
1. Express.js and RESTful APIs
2. MongoDB and Mongoose
3. Firebase Authentication
4. JWT and session management

### Frontend Development
1. React hooks and context
2. Vite build tool
3. Tailwind CSS utility classes
4. Stripe integration

### Blockchain Development
1. Ethereum and Web3 basics
2. Solidity smart contracts
3. Hardhat development environment
4. Ethers.js library
5. IPFS and decentralized storage

### Recommended Courses
- [Ethereum.org Tutorials](https://ethereum.org/en/developers/tutorials/)
- [Hardhat Getting Started](https://hardhat.org/tutorial)
- [React Official Docs](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 🚨 Important Reminders

### Before You Start

✅ **DO:**
- Read all documentation thoroughly
- Set up all required accounts (Firebase, Stripe, MongoDB Atlas, etc.)
- Use test mode for all payment services
- Keep private keys and secrets secure
- Test on Sepolia testnet before mainnet
- Back up your `.env` files (but don't commit them!)
- Ask for help if stuck

❌ **DON'T:**
- Commit `.env` files or private keys to Git
- Use production keys in development
- Deploy to mainnet without thorough testing
- Share Firebase service account JSON files
- Expose API keys in frontend code
- Skip the security checklist

### Common Mistakes to Avoid

1. **Forgetting to start MongoDB** before running backend
2. **Using wrong API keys** (test vs production)
3. **Not setting CORS** properly for frontend URL
4. **Committing sensitive data** to version control
5. **Deploying contracts without enough ETH** for gas
6. **Not verifying environment variables** are loaded

---

## 📊 Project Statistics

- **Languages**: JavaScript, Solidity, JSX
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js 18+, Express 4.x, MongoDB 6.x
- **Blockchain**: Ethereum (Sepolia/Mainnet), Solidity 0.8.19
- **Testing**: Jest, Supertest, Hardhat, Chai
- **Code Quality**: ESLint, Prettier, Solhint
- **CI/CD**: GitHub Actions (configured)

---

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ Basic marketplace functionality
- ✅ Firebase Google authentication
- ✅ Stripe payment integration
- ✅ IPFS product storage
- ✅ Smart contract provenance
- ✅ Admin dashboard with analytics

### Upcoming Features (v2.0)
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Urdu, Punjabi)
- [ ] Advanced search and filters
- [ ] Artisan messaging system
- [ ] Video product showcases
- [ ] Social media integration
- [ ] Loyalty rewards program
- [ ] Enhanced analytics dashboard

### Future Considerations
- [ ] NFT certificates for premium products
- [ ] Auction system for rare items
- [ ] Artisan collaboration tools
- [ ] AR/VR product previews
- [ ] Cryptocurrency payment options
- [ ] Global shipping partnerships

---

## 📞 Contact & Links

- **Website**: [Coming Soon]
- **GitHub**: [tech-Hussain/CultureKart](https://github.com/tech-Hussain/CultureKart)
- **Email**: support@culturekart.com
- **LinkedIn**: [CultureKart](https://linkedin.com/company/culturekart)

---

## 🙏 Acknowledgments

Special thanks to:
- Pakistani artisan communities for inspiration
- Open-source contributors
- Firebase, Stripe, MongoDB, and Alchemy teams
- Hardhat and OpenZeppelin for blockchain tools
- React and Vite communities

---

## ⭐ Show Your Support

If this project helped you or you find it interesting:
- ⭐ Star the repository
- 🐛 Report bugs or request features
- 🔀 Fork and contribute
- 📢 Share with others

---

**Built with ❤️ for Pakistani artisans | CultureKart v1.0.0** 🇵🇰

*Empowering traditional craftsmanship through modern technology*

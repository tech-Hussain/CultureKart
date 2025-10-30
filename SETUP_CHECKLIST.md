# CultureKart Setup Checklist ✅

Use this checklist to track your setup progress. Check off each item as you complete it.

---

## 📋 Pre-Setup (Accounts Required)

Create accounts on these platforms before starting:

- [ ] **Firebase** - [console.firebase.google.com](https://console.firebase.google.com/)
  - [ ] Create new project
  - [ ] Enable Google Sign-in
  - [ ] Download service account JSON
  - [ ] Get web app config

- [ ] **MongoDB Atlas** - [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
  - [ ] Create free cluster
  - [ ] Create database user
  - [ ] Whitelist IP (0.0.0.0/0 for dev)
  - [ ] Get connection string

- [ ] **Stripe** - [dashboard.stripe.com](https://dashboard.stripe.com/)
  - [ ] Sign up for account
  - [ ] Get test API keys (pk_test_*, sk_test_*)
  - [ ] Set up webhook endpoint
  - [ ] Get webhook secret

- [ ] **NFT.Storage** - [nft.storage](https://nft.storage/)
  - [ ] Sign up with GitHub
  - [ ] Generate API key
  - [ ] Copy key to clipboard

- [ ] **Alchemy** - [alchemy.com](https://www.alchemy.com/)
  - [ ] Create account
  - [ ] Create Ethereum → Sepolia app
  - [ ] Copy HTTPS RPC URL

- [ ] **MetaMask** - [metamask.io](https://metamask.io/)
  - [ ] Install browser extension
  - [ ] Create wallet or import existing
  - [ ] Switch to Sepolia network
  - [ ] Get test ETH from faucets

---

## 🔧 Local Setup

### 1. Repository & Dependencies

- [ ] Clone repository: `git clone https://github.com/tech-Hussain/CultureKart.git`
- [ ] Navigate to project: `cd CultureKart`
- [ ] Verify Node.js version: `node --version` (should be v18+)

### 2. Backend Setup

- [ ] Navigate to backend: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Copy example env: `cp .env.example .env` (if exists)
- [ ] Create `backend/.env` file with all variables:
  - [ ] `NODE_ENV=development`
  - [ ] `PORT=5000`
  - [ ] `CLIENT_URL=http://localhost:5173`
  - [ ] `MONGO_URI=mongodb+srv://...` (from MongoDB Atlas)
  - [ ] `FIREBASE_PROJECT_ID=...` (from Firebase)
  - [ ] `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
  - [ ] `FIREBASE_CLIENT_EMAIL=...`
  - [ ] All other Firebase fields
  - [ ] `STRIPE_SECRET_KEY=sk_test_...`
  - [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
  - [ ] `NFT_STORAGE_API_KEY=eyJ...`
  - [ ] `INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...`
  - [ ] `PRIVATE_KEY=0x...` (from MetaMask)
  - [ ] `PROVENANCE_CONTRACT_ADDRESS=` (leave empty for now)

- [ ] Test MongoDB connection: `mongosh "YOUR_CONNECTION_STRING"`
- [ ] Seed database: `node scripts/seed.js`
- [ ] Start backend: `npm run dev`
- [ ] Verify backend: Open `http://localhost:5000/api/v1/health`
- [ ] Should see: `{"status":"ok","message":"CultureKart API is running"...}`

### 3. Frontend Setup

- [ ] Open new terminal
- [ ] Navigate to frontend: `cd frontend` (from project root)
- [ ] Install dependencies: `npm install`
- [ ] Copy example env: `cp .env.example .env` (if exists)
- [ ] Create `frontend/.env` file:
  - [ ] `VITE_API_URL=http://localhost:5000/api/v1`
  - [ ] `VITE_FIREBASE_API_KEY=...` (from Firebase web config)
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN=...`
  - [ ] `VITE_FIREBASE_PROJECT_ID=...`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET=...`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
  - [ ] `VITE_FIREBASE_APP_ID=...`
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
  - [ ] `VITE_IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/`

- [ ] Start frontend: `npm run dev`
- [ ] Verify frontend: Open `http://localhost:5173`
- [ ] Should see CultureKart homepage

### 4. Smart Contracts Setup (Optional for Development)

- [ ] Get Sepolia ETH from faucets:
  - [ ] [sepoliafaucet.com](https://sepoliafaucet.com/)
  - [ ] [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de/)
  - [ ] Wait for ETH to arrive (check MetaMask)

- [ ] Navigate to contracts: `cd contracts` (from project root)
- [ ] Install dependencies: `npm install`
- [ ] Create `contracts/.env` file:
  - [ ] `INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...`
  - [ ] `PRIVATE_KEY=0x...` (from MetaMask)
  - [ ] `ETHERSCAN_API_KEY=...` (optional, for verification)

- [ ] Compile contracts: `npx hardhat compile`
- [ ] Run tests: `npx hardhat test`
- [ ] Deploy to Sepolia: `npx hardhat run scripts/deploy.js --network sepolia`
- [ ] Copy contract address from output
- [ ] Update backend: `cd ../backend && node src/tasks/updateContractAddress.js 0xYOUR_ADDRESS`
- [ ] Verify contract (optional): `cd ../contracts && npx hardhat verify --network sepolia 0xYOUR_ADDRESS`

---

## ✅ Verification Tests

### Backend Tests
- [ ] Health endpoint: `curl http://localhost:5000/api/v1/health`
- [ ] Run test suite: `cd backend && npm test`
- [ ] All tests pass (health.test.js, auth.test.js)

### Frontend Tests
- [ ] Homepage loads at `http://localhost:5173`
- [ ] Click "Sign In" button
- [ ] Google Sign-in popup appears
- [ ] Sign in with Google account
- [ ] Redirected to homepage after login
- [ ] User profile shows in header
- [ ] Browse products page works
- [ ] Can view product details
- [ ] Can add items to cart

### Payment Tests
- [ ] Go to checkout page
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/25)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] Zip: Any 5 digits (e.g., 12345)
- [ ] Complete payment
- [ ] Order confirmation appears
- [ ] Check Stripe dashboard for payment

### Smart Contract Tests (if deployed)
- [ ] View contract on Sepolia Etherscan
- [ ] Check contract has transactions
- [ ] Run contract tests: `cd contracts && npx hardhat test`

---

## 🔒 Security Checklist

- [ ] `.gitignore` includes `.env` files
- [ ] Never committed any `.env` files to Git
- [ ] Firebase service account JSON not in repository
- [ ] Private keys stored securely (not shared)
- [ ] Using test mode for Stripe (test keys only)
- [ ] MongoDB user has strong password
- [ ] IP whitelist configured for MongoDB (0.0.0.0/0 OK for dev)
- [ ] All `.env` files backed up locally (not in Git!)

---

## 🎯 Common Issues

If you encounter errors, check these:

### Backend won't start
- [ ] MongoDB is running (Atlas or local)
- [ ] All required env variables in `backend/.env`
- [ ] Port 5000 is not in use
- [ ] `node_modules` installed: `npm install`

### Frontend won't start
- [ ] Backend is running first
- [ ] All Firebase vars in `frontend/.env`
- [ ] Port 5173 is not in use
- [ ] `node_modules` installed: `npm install`

### Firebase auth not working
- [ ] Google Sign-in enabled in Firebase Console
- [ ] `localhost` in Firebase authorized domains
- [ ] Correct Firebase config in `frontend/.env`
- [ ] Firebase service account in `backend/.env`

### Stripe payments failing
- [ ] Using test keys (pk_test_*, sk_test_*)
- [ ] Webhook endpoint configured
- [ ] Test card number: `4242 4242 4242 4242`

### Contract deployment fails
- [ ] Have Sepolia ETH in wallet
- [ ] Correct RPC URL in `contracts/.env`
- [ ] Private key starts with `0x`
- [ ] Network is `sepolia` not `mainnet`

---

## 📊 Setup Progress

Track your overall progress:

- [ ] **Phase 1**: All accounts created (Firebase, MongoDB, Stripe, etc.)
- [ ] **Phase 2**: Repository cloned and dependencies installed
- [ ] **Phase 3**: Environment variables configured (backend, frontend, contracts)
- [ ] **Phase 4**: Backend running and database seeded
- [ ] **Phase 5**: Frontend running and Google Sign-in working
- [ ] **Phase 6**: Smart contracts deployed to Sepolia (optional)
- [ ] **Phase 7**: All verification tests passing
- [ ] **Phase 8**: Ready for development! 🎉

---

## 🚀 Next Steps After Setup

Once everything is working:

1. **Explore the code**
   - [ ] Read `backend/README.md` for API documentation
   - [ ] Read `contracts/README.md` for smart contract details
   - [ ] Check out sample products from seed data

2. **Try features**
   - [ ] Sign in as admin: `admin@culturekart.com`
   - [ ] Browse admin dashboard
   - [ ] Create a product as artisan
   - [ ] Complete a test purchase
   - [ ] View blockchain transaction

3. **Start developing**
   - [ ] Create feature branch: `git checkout -b feature/your-feature`
   - [ ] Make changes
   - [ ] Run tests: `npm test`
   - [ ] Commit and push

4. **Learn more**
   - [ ] Read main `README.md` for detailed guides
   - [ ] Check troubleshooting section if needed
   - [ ] Review security best practices

---

## 📞 Get Help

Stuck? Here's where to get help:

- **Documentation**: Read the main README.md and subdirectory docs
- **Troubleshooting**: Check troubleshooting section in main README
- **GitHub Issues**: Open an issue if you find a bug
- **Community**: Ask questions in GitHub Discussions

---

**Good luck with your setup! 🎉**

Once all checkboxes are checked, you're ready to build awesome features for Pakistani artisans! 🇵🇰

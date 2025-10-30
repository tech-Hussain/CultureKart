# Environment Variables Quick Reference

Quick copy-paste templates for all required environment variables.

---

## 📁 Backend Environment (.env)

**Location**: `backend/.env`

```env
# ==============================================
# SERVER CONFIGURATION
# ==============================================
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# ==============================================
# DATABASE
# ==============================================
# MongoDB Atlas (recommended)
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/culturekart?retryWrites=true&w=majority

# OR Local MongoDB
# MONGO_URI=mongodb://localhost:27017/culturekart

# ==============================================
# FIREBASE ADMIN SDK
# Get from: console.firebase.google.com
# Project Settings > Service Accounts > Generate Private Key
# ==============================================
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123def456
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# ==============================================
# STRIPE PAYMENT GATEWAY
# Get from: dashboard.stripe.com/test/apikeys
# ==============================================
STRIPE_SECRET_KEY=sk_test_51Abc123...your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret

# ==============================================
# IPFS STORAGE (NFT.Storage)
# Get from: nft.storage (sign in with GitHub)
# ==============================================
NFT_STORAGE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_api_key

# ==============================================
# IPFS STORAGE (Pinata - Alternative/Optional)
# Get from: pinata.cloud
# ==============================================
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# ==============================================
# BLOCKCHAIN (ETHEREUM)
# Get from: alchemy.com or infura.io
# ==============================================
ETHEREUM_NETWORK=sepolia
INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# MetaMask Private Key (Settings > Account Details > Export Private Key)
# ⚠️ KEEP THIS SECRET! Never commit to Git!
PRIVATE_KEY=0xabc123def456...your_private_key

# Smart Contract Address (deployed on Sepolia)
# Leave empty until you deploy, then run: node src/tasks/updateContractAddress.js
PROVENANCE_CONTRACT_ADDRESS=

# ==============================================
# Optional: For contract verification on Etherscan
# Get from: etherscan.io/myapikey
# ==============================================
ETHERSCAN_API_KEY=your_etherscan_api_key
```

---

## 🌐 Frontend Environment (.env)

**Location**: `frontend/.env`

**Important**: All variables MUST start with `VITE_` prefix!

```env
# ==============================================
# BACKEND API
# ==============================================
VITE_API_URL=http://localhost:5000/api/v1

# ==============================================
# FIREBASE CLIENT CONFIGURATION
# Get from: Firebase Console > Project Settings > Your apps > SDK setup and configuration
# ==============================================
VITE_FIREBASE_API_KEY=AIzaSyAbc123Def456Ghi789...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# ==============================================
# STRIPE CLIENT (PUBLISHABLE KEY)
# Get from: dashboard.stripe.com/test/apikeys
# ==============================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Abc123...your_publishable_key

# ==============================================
# IPFS GATEWAY
# Public gateway for displaying images
# ==============================================
VITE_IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
# Alternative: https://ipfs.io/ipfs/
# Alternative: https://cloudflare-ipfs.com/ipfs/
```

---

## ⛓️ Smart Contracts Environment (.env)

**Location**: `contracts/.env`

```env
# ==============================================
# ETHEREUM RPC PROVIDER
# Same as backend INFURA_ALCHEMY_RPC_URL
# ==============================================
INFURA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# ==============================================
# DEPLOYER WALLET PRIVATE KEY
# Same as backend PRIVATE_KEY
# Must have Sepolia ETH for deployment
# ==============================================
PRIVATE_KEY=0xabc123def456...your_private_key

# ==============================================
# ETHERSCAN API KEY (Optional)
# For contract verification after deployment
# Get from: etherscan.io/myapikey
# ==============================================
ETHERSCAN_API_KEY=your_etherscan_api_key

# ==============================================
# GAS REPORTING (Optional)
# Enable detailed gas usage in tests
# ==============================================
REPORT_GAS=true
```

---

## 🔗 Where to Get Each Credential

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **For Backend** (Service Account):
   - Project Settings → Service Accounts
   - Generate New Private Key → Download JSON
   - Extract values from JSON to `.env`
3. **For Frontend** (Web Config):
   - Project Settings → Your apps → Web app
   - Copy the `firebaseConfig` object values

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create Cluster → Database Access → Add User
3. Network Access → Add IP (0.0.0.0/0 for dev)
4. Connect → Connect your application → Copy connection string
5. Replace `<username>`, `<password>`, and database name

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **API Keys**: Developers → API Keys
   - Copy Publishable key (pk_test_*) → Frontend
   - Copy Secret key (sk_test_*) → Backend
3. **Webhook**: Developers → Webhooks → Add endpoint
   - URL: `http://localhost:5000/api/v1/payments/webhook`
   - Copy Signing secret (whsec_*) → Backend

### NFT.Storage
1. Go to [NFT.Storage](https://nft.storage/)
2. Sign in with GitHub or email
3. API Keys → + New Key → Copy API key

### Alchemy (Blockchain RPC)
1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up → Create App
3. Chain: Ethereum, Network: Sepolia
4. Copy HTTPS URL from dashboard

### MetaMask Private Key
1. Open MetaMask extension
2. Click account icon → Account Details
3. Export Private Key → Enter password → Copy
4. ⚠️ **NEVER share this with anyone!**

### Etherscan API Key (Optional)
1. Go to [Etherscan](https://etherscan.io/)
2. Sign up → My API Keys → Add
3. Copy API key

---

## 🔒 Security Checklist

Before committing code:

- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] No private keys in comments
- [ ] Firebase JSON not committed
- [ ] Using test keys for Stripe (not live)
- [ ] Sepolia network (not mainnet) for testing

---

## 🧪 Test Values

For **Stripe Test Mode**:

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (12/25)
CVC: Any 3 digits (123)
ZIP: Any 5 digits (12345)
```

More test cards: https://stripe.com/docs/testing

---

## 📝 Production Checklist

When deploying to production:

- [ ] Change `NODE_ENV=production`
- [ ] Update `CLIENT_URL` to production domain
- [ ] Use production Firebase project
- [ ] Switch to Stripe live keys (`sk_live_*`, `pk_live_*`)
- [ ] Deploy contract to Ethereum mainnet (costs real ETH!)
- [ ] Update `INFURA_ALCHEMY_RPC_URL` to mainnet
- [ ] Use strong passwords for MongoDB
- [ ] Enable IP whitelist for MongoDB (specific IPs only)
- [ ] Set up HTTPS (SSL/TLS)
- [ ] Rotate all API keys and secrets
- [ ] Set `VITE_API_URL` to production API domain

---

## 🆘 Troubleshooting

**Backend not starting?**
- Check all Firebase variables are set
- Verify MongoDB connection string
- Ensure PORT is not in use

**Firebase auth fails?**
- Check `FIREBASE_PRIVATE_KEY` has `\n` for line breaks
- Must be wrapped in quotes: `"-----BEGIN..."`
- Verify project ID matches

**Stripe errors?**
- Ensure using test keys (starts with `sk_test_`, `pk_test_`)
- Check webhook secret is set
- Test with card: 4242 4242 4242 4242

**Contract deployment fails?**
- Need Sepolia ETH from faucets
- Check `PRIVATE_KEY` starts with `0x`
- Verify RPC URL is correct

---

**Need help?** Check the main README.md troubleshooting section!

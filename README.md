# CultureKart 🛍️

**CultureKart** is a MERN-based e-commerce platform connecting Pakistani artisans directly to global buyers. It combines modern web technologies with blockchain for product provenance and authenticity verification.

## 🎯 Features

- **Artisan Marketplace**: Direct connection between Pakistani artisans and global customers
- **Blockchain Provenance**: Solidity smart contracts for product authenticity tracking
- **Multi-Payment Support**: Integrated Stripe and JazzCash payment gateways
- **Decentralized Storage**: IPFS for product media and metadata
- **Firebase Authentication**: Google Sign-in with JWT backend sessions
- **Admin Dashboard**: Analytics and charts for inventory, sales, and user management

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

- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CultureKart
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Setup Smart Contracts**
   ```bash
   cd contracts
   npm install
   npx hardhat compile
   ```

## 🎮 Start Commands

### Backend (Port 5000)
```bash
cd backend
npm run dev          # Development with nodemon
npm start            # Production
npm test             # Run tests
npm run seed         # Seed database
```

### Frontend (Port 5173)
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Smart Contracts
```bash
cd contracts
npx hardhat compile  # Compile contracts
npx hardhat test     # Run contract tests
npx hardhat node     # Start local blockchain
```

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | ✓ |
| `NODE_ENV` | Environment (development/production) | ✓ |
| `MONGODB_URI` | MongoDB connection string | ✓ |
| `JWT_SECRET` | Secret for JWT signing | ✓ |
| `JWT_EXPIRE` | JWT expiration time | ✓ |
| `FIREBASE_PROJECT_ID` | Firebase project ID | ✓ |
| `FIREBASE_PRIVATE_KEY` | Firebase service account key | ✓ |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | ✓ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✓ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ✓ |
| `JAZZCASH_MERCHANT_ID` | JazzCash merchant ID | ✓ |
| `JAZZCASH_PASSWORD` | JazzCash password | ✓ |
| `JAZZCASH_INTEGRITY_SALT` | JazzCash integrity salt | ✓ |
| `IPFS_API_URL` | IPFS API endpoint | ✓ |
| `IPFS_GATEWAY_URL` | IPFS gateway URL | ✓ |
| `PINATA_API_KEY` | Pinata API key (optional) | - |
| `PINATA_SECRET_KEY` | Pinata secret key (optional) | - |
| `ETHEREUM_RPC_URL` | Ethereum RPC endpoint | ✓ |
| `CONTRACT_ADDRESS` | Deployed contract address | ✓ |
| `PRIVATE_KEY` | Wallet private key for transactions | ✓ |

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | ✓ |
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✓ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✓ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✓ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✓ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✓ |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | ✓ |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | ✓ |
| `VITE_IPFS_GATEWAY_URL` | IPFS gateway for media | ✓ |

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Smart contract tests
cd contracts
npx hardhat test
```

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

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ for Pakistani artisans by the CultureKart team.

---

**Note**: Make sure to configure all environment variables before running the application. Never commit `.env` files to version control.

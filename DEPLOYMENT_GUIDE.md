# Smart Contract Deployment Guide - Quick Reference

## 📁 Files Created/Updated

### ✅ Updated Files

1. **contracts/scripts/deploy.js**
   - Enhanced with Sepolia-specific deployment instructions
   - Added network validation and balance checking
   - Improved deployment summary with next steps
   - Displays Sepolia faucet links

2. **backend/README.md**
   - Complete Smart Contract Deployment section added
   - Step-by-step Sepolia deployment instructions
   - Environment variable setup guide
   - Deployment troubleshooting section
   - Contract interaction examples

3. **contracts/README.md**
   - Added automated contract address update instructions
   - Documentation for updateContractAddress.js script

### ✅ New Files Created

4. **backend/src/tasks/updateContractAddress.js**
   - Automated script to update contract address in backend .env
   - Validates Ethereum address format (0x + 40 hex chars)
   - Creates backup of .env before updating
   - Color-coded terminal output
   - Displays Etherscan verification links

## 🚀 Quick Deployment Steps

### 1. Deploy to Sepolia

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Update Backend

```bash
cd ../backend
node src/tasks/updateContractAddress.js 0xYOUR_CONTRACT_ADDRESS
```

### 3. Verify on Etherscan (Optional)

```bash
cd ../contracts
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS
```

## 📋 Prerequisites Checklist

Before deploying:
- [ ] Node.js v18+ installed
- [ ] Sepolia ETH in your wallet (from faucets)
- [ ] Alchemy or Infura API key
- [ ] contracts/.env configured with:
  - `INFURA_ALCHEMY_RPC_URL`
  - `PRIVATE_KEY`
  - `ETHERSCAN_API_KEY` (optional)

## 🔗 Useful Links

### Sepolia Testnet Resources
- **Faucets**:
  - https://sepoliafaucet.com/
  - https://sepolia-faucet.pk910.de/
  - https://www.infura.io/faucet/sepolia

- **Explorer**: https://sepolia.etherscan.io/

### RPC Providers
- **Alchemy**: https://www.alchemy.com/
- **Infura**: https://www.infura.io/

## 🛠️ Script Features

### updateContractAddress.js
- ✅ Validates Ethereum address format
- ✅ Updates or adds PROVENANCE_CONTRACT_ADDRESS in .env
- ✅ Creates .env.backup automatically
- ✅ Color-coded terminal output for clarity
- ✅ Shows Etherscan verification links
- ✅ Displays next steps after update

### deploy.js Enhancements
- ✅ Network validation (Sepolia/Hardhat/Mainnet)
- ✅ Balance checking before deployment
- ✅ Chain ID display in summary
- ✅ Next steps with copy-paste commands
- ✅ Sepolia faucet links when deploying to testnet
- ✅ Saves deployment info to JSON file

## 📖 Documentation Updates

All three README files now include:
- Complete deployment workflow
- Environment variable setup
- Troubleshooting common issues
- Contract interaction examples
- Backend integration guide

## 🎯 Usage Examples

### Deploy and Update (Full Flow)

```bash
# 1. Deploy contract
cd contracts
npx hardhat run scripts/deploy.js --network sepolia

# Output will show: Contract Address: 0xabcd...ef12

# 2. Update backend
cd ../backend
node src/tasks/updateContractAddress.js 0xabcd...ef12

# 3. Restart backend server
npm run dev

# 4. Verify on Etherscan (optional)
cd ../contracts
npx hardhat verify --network sepolia 0xabcd...ef12
```

### Just Update Contract Address

```bash
cd backend
node src/tasks/updateContractAddress.js 0x1234567890abcdef1234567890abcdef12345678
```

Output:
```
🔧 CultureKart Contract Address Updater

📝 Current contract address: 0xold...address
🔄 Updating to: 0x1234...5678

✅ Successfully updated .env file!
📍 Contract Address: 0x1234...5678
💾 Backup saved to: .env.backup

📋 Next Steps:
1. Restart your backend server to load the new contract address
2. Verify the contract on Etherscan (if deployed to mainnet/testnet)
3. Test blockchain integration with: npm test
```

## 🔐 Security Notes

- ⚠️ Never commit .env files
- ⚠️ Keep private keys secure
- ⚠️ Test on Sepolia before mainnet
- ✅ .env.backup is auto-generated for safety

## ✨ Key Improvements

1. **Automated workflow**: One command to update backend config
2. **Validation**: Address format checked before updating
3. **Safety**: Automatic .env backup
4. **Clear instructions**: Step-by-step in all README files
5. **Network-specific**: Optimized for Sepolia testnet deployment
6. **User-friendly**: Color-coded output and helpful next steps

---

**All files are ready for production use!** 🚀

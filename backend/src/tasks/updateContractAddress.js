#!/usr/bin/env node

/**
 * Update Contract Address Task
 * Updates the PROVENANCE_CONTRACT_ADDRESS in the backend .env file
 * 
 * Usage:
 *   node src/tasks/updateContractAddress.js <contract-address>
 * 
 * Example:
 *   node src/tasks/updateContractAddress.js 0x1234567890abcdef1234567890abcdef12345678
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateAddress(address) {
  // Check if it's a valid Ethereum address format (0x followed by 40 hex chars)
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}

async function updateContractAddress(contractAddress) {
  try {
    log('\n🔧 CultureKart Contract Address Updater\n', 'cyan');

    // Validate contract address
    if (!contractAddress) {
      log('❌ Error: No contract address provided', 'red');
      log('\nUsage: node src/tasks/updateContractAddress.js <contract-address>', 'yellow');
      log('Example: node src/tasks/updateContractAddress.js 0x1234...5678\n', 'yellow');
      process.exit(1);
    }

    if (!validateAddress(contractAddress)) {
      log('❌ Error: Invalid Ethereum address format', 'red');
      log('Address must be 42 characters starting with 0x\n', 'yellow');
      process.exit(1);
    }

    // Path to .env file
    const envPath = path.join(__dirname, '../../.env');
    const envExamplePath = path.join(__dirname, '../../.env.example');

    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      log('⚠️  .env file not found. Creating from .env.example...', 'yellow');
      
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        log('✅ Created .env file from .env.example', 'green');
      } else {
        log('❌ Error: Neither .env nor .env.example found', 'red');
        log('Please create a .env file in the backend directory\n', 'yellow');
        process.exit(1);
      }
    }

    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    const originalContent = envContent;

    // Check if PROVENANCE_CONTRACT_ADDRESS exists
    const contractAddressRegex = /^PROVENANCE_CONTRACT_ADDRESS=.*$/m;
    const hasContractAddress = contractAddressRegex.test(envContent);

    if (hasContractAddress) {
      // Extract current address
      const currentMatch = envContent.match(/^PROVENANCE_CONTRACT_ADDRESS=(.*)$/m);
      const currentAddress = currentMatch ? currentMatch[1].trim() : 'none';
      
      log(`📝 Current contract address: ${currentAddress}`, 'blue');
      log(`🔄 Updating to: ${contractAddress}`, 'blue');
      
      // Replace existing address
      envContent = envContent.replace(
        contractAddressRegex,
        `PROVENANCE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      log('➕ Adding new PROVENANCE_CONTRACT_ADDRESS to .env', 'blue');
      
      // Add new line if file doesn't end with newline
      if (!envContent.endsWith('\n')) {
        envContent += '\n';
      }
      
      // Add the contract address
      envContent += `\n# Smart Contract Address (CultureProvenance on blockchain)\nPROVENANCE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    // Write updated content back to .env
    fs.writeFileSync(envPath, envContent, 'utf8');

    log('\n✅ Successfully updated .env file!', 'green');
    log(`📍 Contract Address: ${contractAddress}`, 'cyan');
    
    // Create backup
    const backupPath = path.join(__dirname, '../../.env.backup');
    fs.writeFileSync(backupPath, originalContent, 'utf8');
    log(`💾 Backup saved to: .env.backup`, 'magenta');

    // Show verification steps
    log('\n📋 Next Steps:', 'cyan');
    log('1. Restart your backend server to load the new contract address', 'yellow');
    log('2. Verify the contract on Etherscan (if deployed to mainnet/testnet)', 'yellow');
    log('3. Test blockchain integration with: npm test', 'yellow');
    
    // Show example Etherscan links
    log('\n🔗 Verify on Etherscan:', 'cyan');
    log(`   Sepolia: https://sepolia.etherscan.io/address/${contractAddress}`, 'blue');
    log(`   Mainnet: https://etherscan.io/address/${contractAddress}`, 'blue');
    
    log('\n✨ Done!\n', 'green');

  } catch (error) {
    log(`\n❌ Error updating contract address: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Get contract address from command line arguments
const contractAddress = process.argv[2];

// Run the update
updateContractAddress(contractAddress);

/**
 * Deployment Script for CultureProvenance Contract
 * Deploys the contract to Sepolia testnet (or other networks)
 * Usage: npx hardhat run scripts/deploy.js --network sepolia
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting CultureProvenance contract deployment...\n");

  // Validate network
  const networkName = hre.network.name;
  console.log("🌐 Target Network:", networkName);
  
  if (networkName === "hardhat") {
    console.log("⚠️  Warning: Deploying to Hardhat local network");
  } else if (networkName === "sepolia") {
    console.log("✅ Deploying to Sepolia testnet");
  }

  // Get the contract factory
  const CultureProvenance = await hre.ethers.getContractFactory("CultureProvenance");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("📝 Deploying contract with account:", deployerAddress);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Check if balance is sufficient for deployment
  const estimatedGas = hre.ethers.parseEther("0.01"); // Rough estimate
  if (balance < estimatedGas) {
    console.log("⚠️  Warning: Low balance. You may need more ETH for deployment.");
  }
  console.log();

  // Deploy the contract
  console.log("⏳ Deploying CultureProvenance contract...");
  const cultureProvenance = await CultureProvenance.deploy();

  // Wait for deployment to complete
  await cultureProvenance.waitForDeployment();

  const contractAddress = await cultureProvenance.getAddress();

  console.log("\n✅ CultureProvenance contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Owner Address:", deployerAddress);

  // Get deployment transaction details
  const deploymentTx = cultureProvenance.deploymentTransaction();
  if (deploymentTx) {
    console.log("📄 Deployment Transaction Hash:", deploymentTx.hash);
    console.log("⛽ Gas Used:", deploymentTx.gasLimit?.toString());
  }

  // Verify initial state
  console.log("\n🔍 Verifying contract state...");
  const totalProducts = await cultureProvenance.getTotalProducts();
  const owner = await cultureProvenance.owner();

  console.log("📊 Total Products:", totalProducts.toString());
  console.log("👑 Contract Owner:", owner);

  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Contract: CultureProvenance`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log("=".repeat(60));

  console.log("\n🔧 NEXT STEPS:");
  console.log("1. Copy the contract address above");
  console.log("2. Add it to your backend .env file:");
  console.log(`   PROVENANCE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("3. Or run the update script:");
  console.log(`   cd backend && node src/tasks/updateContractAddress.js ${contractAddress}`);
  if (hre.network.name === "sepolia") {
    console.log("\n4. Get Sepolia ETH from faucets:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://faucet.sepolia.dev/");
  }

  // Save deployment info to file (optional)
  const fs = require("fs");
  const path = require("path");

  const deploymentInfo = {
    contractName: "CultureProvenance",
    contractAddress: contractAddress,
    network: hre.network.name,
    deployer: deployerAddress,
    deploymentTime: new Date().toISOString(),
    transactionHash: deploymentTx?.hash,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-deployment.json`;
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: deployments/${filename}`);

  console.log("\n✨ Deployment complete!\n");

  // Instructions for verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📝 To verify the contract on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}\n`);
  }

  return contractAddress;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

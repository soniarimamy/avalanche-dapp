const hre = require('hardhat');

async function main() {
  console.log('Deploying SimpleStorage contract to Avalanche...');

  const SimpleStorage = await hre.ethers.getContractFactory('SimpleStorage');
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.waitForDeployment();

  const address = await simpleStorage.getAddress();
  console.log(`SimpleStorage deployed to: ${address}`);

  // Vérifier le déploiement
  console.log('Checking initial value...');
  const initialValue = await simpleStorage.get();
  console.log(`Initial value: ${initialValue}`);

  // Tester la mise à jour
  console.log('Testing update...');
  const tx = await simpleStorage.set(42);
  await tx.wait();

  const newValue = await simpleStorage.get();
  console.log(`New value after update: ${newValue}`);

  console.log('✅ Deployment and test completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });

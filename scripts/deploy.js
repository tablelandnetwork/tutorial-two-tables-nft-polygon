const hre = require('hardhat')

async function main() {
	deployMetadata()

	// We get the contract to deploy
	const TableNFT = await ethers.getContractFactory('TableNFT')
	const tableNFT = await TableNFT.deploy()
	await tableNFT.deployed()

	console.log('TableNFT deployed to:', tableNFT.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

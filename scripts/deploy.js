const path = require('path')
const uploadToIPFS = require('./uploadMetadata')

async function deployMetadata() {
	// Upload a single JPEG to IPfS and retrieve the CID
	let cid = await uploadToIPFS()
	// Upload a directory of metadta files
}

async function main() {
	await deployMetadata()

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

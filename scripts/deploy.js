const hre = require('hardhat')
const uploadMetadataToIpfs = require('./uploadMetadataToIpfs')

/**
 * Primary script to deploy the NFT, first writing the metadata & pushing to IPFS with `uploadMetadataToIpfs`
 */
async function main() {
	// Pushes/pins metadata to IPFS, as a direcoty of metadata files.
	// Image files exist in `assets`, but `metadata` JSON files do not
	// initally have the CID in `image`. This uploads & re-writes the metadata files
	const metadataDirCid = await uploadMetadataToIpfs()
	console.log(`Uploaded metadata to: ${metadataDirCid}`)
	// Get the contract
	const TableNFT = await ethers.getContractFactory('TableNFT')
	// Deploy the contract, passing `metadataDirCid` in the constructor's `baseURI`
	const tableNFT = await TableNFT.deploy(`ipfs://${metadataDirCid}/`)
	await tableNFT.deployed()
	// Log the deployed address and call the getter on `baseURIString`
	console.log('TableNFT deployed to: ', tableNFT.address)
	const baseURI = await tableNFT.baseURIString()
	console.log('TableNFT baseURIString successfully set to: ', baseURI)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

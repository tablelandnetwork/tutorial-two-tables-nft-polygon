// Standard `ethers` import for blockchain operations, plus `network` for logging the flagged network
const { ethers, network } = require('hardhat')
// The script required to upload metadata to IPFS
const uploadMetadataToIpfs = require('./uploadMetadataToIpfs')

/**
 * Primary script to deploy the NFT, first writing the metadata & pushing to IPFS with `uploadMetadataToIpfs`
 */
async function main() {
	const [deployer] = await ethers.getSigners()
	console.log(`Deploying to network '${network.name}' with account ${deployer.address}`)

	// Pushes/pins metadata to IPFS, as a direcoty of metadata files.
	// Image files exist in `assets`, but `metadata` JSON files do not
	// initally have the CID in `image`. This uploads & re-writes the metadata files
	const metadataDirCid = await uploadMetadataToIpfs()
	const metadataDirAtGateway = `https://${metadataDirCid}.ipfs.nftstorage.link/`
	console.log(`Uploaded metadata to: ${metadataDirAtGateway}`)

	// Get the contract
	const TableNFT = await ethers.getContractFactory('TableNFT')
	// Deploy the contract, passing `metadataDirCid` in the constructor's `baseURI` and using the NFT.Storage gateway
	const tableNFT = await TableNFT.deploy(metadataDirAtGateway)
	await tableNFT.deployed()

	// Log the deployed address and call the getter on `baseURIString`
	console.log(`TableNFT contract deployed to: ${tableNFT.address}`)
	const baseURI = await tableNFT.baseURIString()
	console.log(`TableNFT is using baseURI: ${baseURI}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

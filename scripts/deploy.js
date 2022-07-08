// Standard `ethers` import for blockchain operations, plus `network` for logging the flagged network
const { ethers, network } = require('hardhat')
// The script required to upload metadata to IPFS
const { prepareSqlForOneTable } = require('./prepareSql')
// Import Tableland
const { connect } = require('@tableland/sdk')
// Import 'node-fetch' and set globally -- needed for Tableland to work with CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
globalThis.fetch = fetch

// Wait for createTable tx to exist
async function verifyTableIsCreated(tableland, txnHash) {
	let table = await tableland.receipt(txnHash)
	let tries = 0
	while (!table && tries < 5) {
		await new Promise((resolve) => setTimeout(resolve, 1500 + tries * 500))
		table = await tableland.receipt(txnHash)
		tries++
	}

	if (!table) return false

	return true
}

/**
 * Primary script to deploy the NFT, first writing the metadata & pushing to IPFS with `uploadMetadataToIpfs`
 */
async function main() {
	const [signer] = await ethers.getSigners()
	console.log(`Deploying to network '${network.name}' with account ${signer.address}`)
	// Connect to Tableland
	const tableland = await connect({ signer })
	const schema = `id int, name text, description text, image text, attributes text, primary key (id)`
	const prefix = 'table_nft_basic'
	// Create a single table and retrieve it's returned `name` and on-chain tx as `txnHash`
	const { name, txnHash } = await tableland.create(schema, prefix)
	console.log('Table name:', name)
	console.log('Table creation tx hash:', txnHash)

	// // Wait for the tabl
	const tableIsCreated = await verifyTableIsCreated(tableland, txnHash)
	console.log('Table has been created on Tableland?:', tableIsCreated)
	if (!tableIsCreated) throw new Error(`Could not get transaction receipt: ${txnHash}`)

	// Insert metadata into Tableland table, before minting
	const sqlInsertStatements = await prepareSqlForOneTable(name)
	for await (let statement of sqlInsertStatements) {
		console.log('Writing SQL statment:', statement)
		const writeTx = await tableland.write(statement)
		console.log(writeTx)
	}

	// Set the Tableand gateway as the `baseURI` where a `tokenId` will get appended upon `tokenURI` calls
	const tablelandBaseURI = `https://testnet.tableland.network/query?s=`
	// Get the contract
	const TableNFT = await ethers.getContractFactory('TableNFT')
	// Deploy the contract, passing `tablelandBaseURI` in the constructor's `baseURI` and using the Tableland gateway
	// Also, pass the table's `name` to write in storage on the smart contract
	const tableNFT = await TableNFT.deploy(tablelandBaseURI, name)
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

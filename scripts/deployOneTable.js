// Standard `ethers` import for blockchain operations, plus `network` for logging the flagged network
const { ethers, network } = require('hardhat')
// The script required to upload metadata to IPFS
const { prepareSqlForOneTable } = require('./prepareSql')
// A helper function to make sure a tx has been included in a block
const waitForTx = require('./utils')
// Import Tableland
const { connect } = require('@tableland/sdk')
// Import 'node-fetch' and set globally -- needed for Tableland to work with CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
globalThis.fetch = fetch

/**
 * Primary script to deploy the NFT, first pushing images to IPFS and saving the CIDs to a metadata object.
 * Then, creating both a 'main' and 'attributes' metadata table to INSERT metadata into for each NFT token.
 */
async function main() {
	// Define the account that will be signing txs for table creates/writes & contract deployment
	const [signer] = await ethers.getSigners()
	console.log(`Deploying to network '${network.name}' with account ${signer.address}`)
	// Connect to Tableland
	const tableland = await connect({ signer })
	// Define the table's schema
	const schema = `id int, name text, description text, image text, attributes text, primary key (id)`
	// Define the (optional) prefix, which provides some human-readebale table context
	const prefix = 'table_nft_basic'
	// Create a single table and retrieve its returned `name` and on-chain tx as `txnHash`
	const { name, txnHash } = await tableland.create(schema, prefix)
	// Wait for the table to be "officially" created (i.e., tx is included in a block)
	// If you do not, you could be later be inserting into a non-existent table
	const tableIsCreated = waitForTx(tableland, txnHash)
	if (tableIsCreated) {
		console.log(`Table '${name}' has been created at tx '${txnHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${name}' transaction receipt: ${txnHash}`)
	}

	// Prepare the SQL INSERT statements
	const sqlInsertStatements = await prepareSqlForOneTable(name)
	// Insert metadata into the Tableland metadata table, before smart contract deployment
	console.log(`Writing SQL statements:`)
	for await (let statement of sqlInsertStatements) {
		console.log(statement)
		// Call 'write' with the INSERT statement
		await tableland.write(statement)
	}

	// Set the Tableand gateway as the `baseURI` where a `tokenId` will get appended upon `tokenURI` calls
	const tablelandBaseURI = `https://testnet.tableland.network/query?s=`
	// Get the contract factory to create an instance of the  OneTableNFT contract
	const OneTableNFT = await ethers.getContractFactory('OneTableNFT')
	// Deploy the contract, passing `tablelandBaseURI` in the constructor's `baseURI` and using the Tableland gateway
	// Also, pass the table's `name` to write to storage in the smart contract
	const oneTableNFT = await OneTableNFT.deploy(tablelandBaseURI, name)
	await oneTableNFT.deployed()

	// Log the deployed address and call the getter on `baseURIString` (for demonstration purposes)
	console.log(`OneTableNFT contract deployed on ${network.name} at: ${oneTableNFT.address}`)
	const baseURI = await oneTableNFT.baseURIString()
	console.log(`OneTableNFT is using baseURI: ${baseURI}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

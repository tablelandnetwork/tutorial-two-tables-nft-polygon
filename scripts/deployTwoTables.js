// Standard `ethers` import for blockchain operations, plus `network` for logging the flagged network
const { ethers, network } = require('hardhat')
// The script required to upload metadata to IPFS
const { prepareSqlForTwoTables } = require('./prepareSql')
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
	// Define the 'main' table's schema as well as the 'attributes' table; a primary key should exist
	// Recall that declaring a primary key must have a unique combination of values in its primary key columns
	const mainSchema = `id int, name text, description text, image text, primary key (id)`
	// Should have one `main` row (a token) to many `attributes`, so no need to introduce a primary key constraint
	const attributesSchema = `id int, trait_type text, value text`
	// Define the (optional) prefix, noting the main & attributes tables
	const mainPrefix = 'table_nft_main'
	const attributesPrefix = 'table_nft_attributes'

	// Create the main table and retrieve its returned `name` and on-chain tx as `txnHash`
	const { name: mainName, txnHash: mainTxnHash } = await tableland.create(mainSchema, mainPrefix)
	// Wait for the main table to be "officially" created (i.e., tx is included in a block)
	// If you do not, you could be later be inserting into a non-existent table
	let tableIsCreated = waitForTx(tableland, mainTxnHash)
	if (tableIsCreated) {
		console.log(`Table '${mainName}' has been created at tx '${mainTxnHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${mainName}' transaction receipt: ${mainTxnHash}`)
	}

	// Create the attributes table and retrieve its returned `name` and on-chain tx as `txnHash`
	const { name: attributesName, txnHash: attributesTxnHash } = await tableland.create(
		attributesSchema,
		attributesPrefix
	)
	// Wait for the attributes table to be "officially" created
	// If you do not, you could be later be inserting into a non-existent table
	tableIsCreated = waitForTx(tableland, attributesTxnHash)
	if (tableIsCreated) {
		console.log(`Table '${attributesName}' has been created at tx '${attributesTxnHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${attributesName}' transaction receipt: ${attributesTxnHash}`)
	}

	// Prepare the SQL INSERT statements, which pass the table names to help prepare the statements
	// It returns an object with keys `main` (a single statement) and `attributes` (an array of statements)
	// That is, many `attributes` can be inserted for every 1 entry/row in `main`
	const sqlInsertStatements = await prepareSqlForTwoTables(mainName, attributesName)
	// Insert metadata into both the 'main' and 'attributes' tables, before smart contract deployment
	console.log(`Writing metadata to tables...`)
	for await (let statement of sqlInsertStatements) {
		const { main, attributes } = statement
		// Call 'write' with both INSERT statements; optionally, log it to show some SQL queries
		await tableland.write(main)
		console.log(`Main table: ${main}`)
		// Recall that `attributes` is an array of SQL statements for each `trait_type` and `value` for a `tokenId`
		for await (let attribute of attributes) {
			await tableland.write(attribute)
			console.log(`Attributes table: ${attribute}`)
		}
	}

	// Set the Tableand gateway as the `baseURI` where a `tokenId` will get appended upon `tokenURI` calls
	const tablelandBaseURI = `https://testnet.tableland.network/query?s=`
	// Get the contract factory to create an instance of the  OneTableNFT contract
	const TwoTablesNFT = await ethers.getContractFactory('TwoTablesNFT')
	// Deploy the contract, passing `tablelandBaseURI` in the constructor's `baseURI` and using the Tableland gateway
	// Also, pass the table's `name` to write to storage in the smart contract
	const twoTablesNFT = await TwoTablesNFT.deploy(tablelandBaseURI, mainName, attributesName)
	await twoTablesNFT.deployed()

	// Log the deployed address and call the getter on `baseURIString` (for demonstration purposes)
	console.log(`TwoTablesNFT contract deployed on ${network.name} at: ${twoTablesNFT.address}`)
	const baseURI = await twoTablesNFT.baseURIString()
	console.log(`TwoTablesNFT is using baseURI: ${baseURI}`)

	// For demonstration purposes, mint a token so that `tokenURI` can be called
	const mintToken = await twoTablesNFT.mint()
	const mintTxn = await mintToken.wait()
	// For demonstration purposes, retrieve the event data from the mint to get the minted `tokenId`
	const mintReceipient = mintTxn.events[0].args[1]
	const tokenId = mintTxn.events[0].args[2]
	console.log(`NFT minted: tokenId '${tokenId.toNumber()}' to owner '${mintReceipient}'`)
	const tokenURI = await twoTablesNFT.tokenURI(0)
	console.log(`\nSee an example of 'tokenURI' here:\n${tokenURI}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// The script required to upload metadata to IPFS
const prepareMetadata = require('./uploadMetadataToIpfs')
const dotenv = require('dotenv')
dotenv.config()

/**
 * Prepare metadata for Tableland as SQL insert statements within a single table (note: not a best practice)
 * @param name The name of the Tableland table to insert metadata values into
 * @return Array of SQL statements for metadata table writes
 */
async function prepareSqlForOneTable(name) {
	// Prepare the metadata (handles all of the IPFS-related actions & JSON parsing)
	const metadata = await prepareMetadata()
	// An array to hold interpolated SQL INSERT statements, using the JSON metadata values
	const sqlInsertStatements = []
	for await (let obj of metadata) {
		// A classic INSERT statement -- all data is getting written to a single table
		let statement = `INSERT INTO ${name} (id, name, description, image, attributes) VALUES (${obj.id}, '${
			obj.name
		}', '${obj.description}', '${obj.image}', '${JSON.stringify(obj.attributes)}');`
		// Note the need above to stringify the attributes
		sqlInsertStatements.push(statement)
	}

	// Return the final prepare array of SQL INSERT statements
	return sqlInsertStatements
}

/**
 * Prepare metadata for Tableland as SQL insert statements within a single table (note: not a best practice)
 * @param name The name of the Tableland table to insert metadata values into
 * @return Array of SQL statements for metadata table writes
 */
async function prepareSqlForTwoTables(name) {
	// Prepare the metadata (handles all of the IPFS-related actions & JSON parsing)
	const metadata = await prepareMetadata()
	// An array to hold interpolated SQL INSERT statements, using the JSON metadata values
	const sqlInsertStatements = []
	for await (let obj of metadata) {
		// A classic INSERT statement -- all data is getting written to a single table
		let statement = `INSERT INTO ${name} (id, name, description, image, attributes) VALUES (${obj.id}, '${
			obj.name
		}', '${obj.description}', '${obj.image}', '${JSON.stringify(obj.attributes)}');`
		// Note the need above to stringify the attributes
		sqlInsertStatements.push(statement)
	}

	// Return the final prepare array of SQL INSERT statements
	return sqlInsertStatements
}

module.exports = { prepareSqlForOneTable, prepareSqlForTwoTables }

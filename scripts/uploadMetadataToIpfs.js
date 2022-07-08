const { NFTStorage, File } = require('nft.storage')
const { getFilesFromPath } = require('files-from-path')
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

// The NFT.Storage API token, passed to `NFTStorage` function as a `token`
const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY

/**
 * Helper to retrieve a single file from some path
 * @param filePath The path of a file to retrieve
 * @return A file from the specified file path
 */
async function fileFromPath(filePath) {
	const content = await fs.promises.readFile(filePath)
	const type = mime.getType(filePath)
	return new File([content], path.basename(filePath), { type })
}

/**
 * Upload the image to IPFS and return its CID
 * @param id The id of the NFT, matching with the `assets` and `metadata` directories
 * @return Resulting CID from pushing the image to IPFS
 */
async function uploadImageToIpfs(id) {
	// Find & load the file from disk
	const imagePath = path.join(__dirname, '..', 'assets', `${id}.jpeg`)
	const image = await fileFromPath(imagePath)
	// Upload to IPFS using NFT Storage
	const storage = new NFTStorage({ token: nftStorageApiKey })
	const imageCid = await storage.storeBlob(image)
	// Return the image's CID
	return imageCid
}

/**
 * Update the existing metadata file, changing the 'image' to the `ipfs://{imageCid}`
 * @param id The id of the NFT, matching with the `assets` and `metadata` directories
 * @retun JSON object of parsed metadata file with CID written to 'image' field
 */
async function parseMetadataToJson(id) {
	// Retrieve CID from uploaded image file
	const imageCid = await uploadImageToIpfs(id)
	// Find the corresponding metadata file (matching `id`)
	const metadataFilePath = path.join(__dirname, '..', 'metadata', `${id}`)
	let metadataFile
	try {
		metadataFile = await fs.promises.readFile(metadataFilePath)
	} catch (error) {
		console.error(`Error reading file in metadata directory: ${id}`)
	}
	// Parse metatadata buffer (from 'readFile') to JSON
	const metadataJson = JSON.parse(metadataFile.toString())
	// Overwrite the empty 'image' with the IPFS CID at the NFT.Storage gateway
	metadataJson.image = `https://${imageCid}.ipfs.nftstorage.link/`
	// Write the file to the metadata directory
	const metadataFileBuffer = Buffer.from(JSON.stringify(metadataJson))
	try {
		await fs.promises.writeFile(metadataFilePath, metadataFileBuffer)
	} catch (error) {
		console.error(`Error writing file in metadata directory: ${id}`)
	}

	// Return metadata as JSON object
	return metadataJson
}

/**
 * Prepare metadata as an array of JSON objects
 * @return Array of metadata files parsed as JSON objects, including the written image CID
 */
async function prepareMetadata() {
	const metadata = []
	// Load the `metadata` directory path, holding the metadata files
	const metadataDirPath = path.join(__dirname, '..', 'metadata')
	// Retrieve the updated files -- pass the metadata directory and strip off the `metadata` prefix, leaving only the file name
	const metadataFiles = await getFilesFromPath(metadataDirPath, { pathPrefix: path.resolve(metadataDirPath) })
	for await (const file of metadataFiles) {
		let fileName = file.name.replace(/^\//, '')
		try {
			// Retrieve the metadata as JSON
			let metadataJson = await parseMetadataToJson(fileName)
			// Add a new filed called `id`, which will be used during INSERTs as a unique row `id`
			metadataJson.id = Number(fileName)
			metadata.push(await metadataJson)
		} catch (error) {
			console.error(`Error parsing metadata file: ${fileName}`)
		}
	}

	// Return metadata files
	return metadata
}

module.exports = prepareMetadata

const { NFTStorage, File } = require('nft.storage')
const { getFilesFromPath } = require('files-from-path')
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

// Helper to retrieve a single file from some path
async function fileFromPath(filePath) {
	const content = await fs.promises.readFile(filePath)
	const type = mime.getType(filePath)
	return new File([content], path.basename(filePath), { type })
}

// Upload the image to IPFS and return its CID
async function uploadImageToIpfs(id) {
	// Find & load the file from disk
	const imagePath = path.join(__dirname, '..', 'assets', `${id}.jpeg`)
	const image = await fileFromPath(imagePath)
	// Upload to IPFS using NFT Storage
	const storage = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })
	const imageCid = await storage.storeBlob(image)
	// Return the image's CID
	return imageCid
}

// Update the existing metadata file, changing the 'image' to the `ipfs://{imageCid}`
async function writeImageCidToMetadata(id) {
	// Retrieve CID from uploaded image file
	const imageCid = await uploadImageToIpfs(id)
	// Find the corresponding metadata file (matching `id`)
	const metadataFilePath = path.join(__dirname, '..', 'metadata', `${id}`)
	let metadataFile
	try {
		metadataFile = await fs.promises.readFile(metadataFilePath)
		console.log(`Successfully read metadata file: ${id}`)
	} catch (error) {
		console.error(`Error reading file in metadata directory: ${id}`)
	}
	// Parse metatadata buffer (from 'readFile') to JSON
	const metadataJson = JSON.parse(metadataFile.toString())
	// Overwrite the empty 'image' with the IPFS CID
	metadataJson.image = `ipfs://${imageCid}`
	// Write the file to the metadata directory
	const metadataFileBuffer = Buffer.from(JSON.stringify(metadataJson))
	try {
		await fs.promises.writeFile(metadataFilePath, metadataFileBuffer)
		console.log(`Wrote image CID to metadata file: ${id}`)
	} catch (error) {
		console.error(`Error writing file in metadata directory: ${id}`)
	}
}

async function uploadMetadataToIpfs() {
	// Load the `metadata` directory path, holding the metadata files
	const metadataDirPath = path.join(__dirname, '..', 'metadata')
	// Retrieve the updated files -- pass the metadata directory and strip off the `metadata` prefix, leaving only the file name
	const metadataFiles = await getFilesFromPath(metadataDirPath, { pathPrefix: path.resolve(metadataDirPath) })
	for await (const file of metadataFiles) {
		let fileName = file.name.replace(/^\//, '')
		try {
			await writeImageCidToMetadata(fileName)
		} catch (error) {
			console.error(`Error writing 'image' field in metadata file: ${fileName}`)
		}
	}

	// Upload the metadata files to IPFS, now containing the image CID
	// Start by creating a new NFTStorage client using the API key
	const storage = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })
	const directoryCid = await storage.storeDirectory(metadataFiles)
	// Return the directory's CID
	return directoryCid
}

module.exports = uploadMetadataToIpfs

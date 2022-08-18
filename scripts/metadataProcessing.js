const { NFTStorage, File } = require("nft.storage")
const { getFilesFromPath } = require("files-from-path")
const mime = require("mime")
const fs = require("fs")
const path = require("path")
const dotenv = require("dotenv")
dotenv.config()

// The NFT.Storage API token, passed to `NFTStorage` function as a `token`
const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY

/**
 * Helper to retrieve a single file from some path.
 * @param {string} filePath The path of a file to retrieve.
 * @returns {File} A fs File at the specified file path.
 */
async function fileFromPath(filePath) {
	const content = await fs.promises.readFile(filePath)
	const type = mime.getType(filePath)
	return new File([content], path.basename(filePath), { type })
}

/**
 * Upload the image to IPFS and return its CID.
 * @param {number} id The id of the NFT, matching with the `images` and `metadata` directories.
 * @param {string} imagesDirPath The `path` to the directory of images.
 * @returns {string} Resulting CID from pushing the image to IPFS.
 */
async function uploadImageToIpfs(id, imagesDirPath) {
	// Find & load the file from disk
	const imagePath = path.join(imagesDirPath, `${id}.jpeg`)
	const image = await fileFromPath(imagePath)
	// Upload to IPFS using NFT Storage
	const storage = new NFTStorage({ token: nftStorageApiKey })
	const imageCid = await storage.storeBlob(image)
	// Return the image's CID
	return imageCid
}

/**
 * Update the existing metadata file, changing the 'image' to the `{imageCid}` interpolated in the NFT.Storage gateway URL.
 * @param {number} id The id of the NFT, matching with the `images` and `metadata` directories.
 * @param {string} metadataDirPath The `path` to the metadata directory of JSON files.
 * @param {string} imagesDirPath The `path` to the images directory of JSON files.
 * @returns {Object} Object of parsed metadata JSON file with CID written to 'image' field.
 */
async function parseMetadataFile(id, metadataDirPath, imagesDirPath) {
	// Retrieve CID from uploaded image file
	const imageCid = await uploadImageToIpfs(id, imagesDirPath)
	// Find the corresponding metadata file (matching `id`)
	const metadataFilePath = path.join(metadataDirPath, `${id}`)
	let metadataFile
	try {
		metadataFile = await fs.promises.readFile(metadataFilePath)
	} catch (error) {
		console.error(`Error reading file in metadata directory: ${id}`)
	}
	// Parse metatadata buffer (from 'readFile') to an object
	const metadataJson = JSON.parse(metadataFile.toString())
	// Overwrite the empty 'image' with the IPFS CID at the NFT.Storage gateway
	metadataJson.image = `https://${imageCid}.ipfs.nftstorage.link/`
	// Write the file to the metadata directory. This is not essential for Tableland
	// purposes, but it's handy to see what the output looks like for those coming
	// from background where metadata files are deployed on IPFS, not just images.
	const metadataFileBuffer = Buffer.from(JSON.stringify(metadataJson))
	try {
		await fs.promises.writeFile(metadataFilePath, metadataFileBuffer)
	} catch (error) {
		console.error(`Error writing file in metadata directory: ${id}`)
	}

	// Return metadata as an object
	return metadataJson
}

/**
 * Prepare metadata as an array of metadata objects.
 * @returns {Array<Object>} Metadata files parsed to objects, including the overwritten `image` with a CID.
 */
async function prepareMetadata() {
	// An array that contains all metadata objects
	const finalMetadata = []
	// Set the `metadata` & `images` directory path, holding the metadata files & images
	const metadataDirPath = path.join(__dirname, "..", "metadata")
	const imagesDirPath = path.join(__dirname, "..", "images")
	// Retrieve the updated files -- pass the metadata directory and strip off the `metadata` prefix, leaving only the file name
	const metadataFiles = await getFilesFromPath(metadataDirPath, { pathPrefix: path.resolve(metadataDirPath) })
	for await (const file of metadataFiles) {
		// Strip the leading `/` from the file's `name`, which is
		let id = file.name.replace(/^\//, "")
		try {
			// Retrieve the metadata files as an object, parsed from the metadata files
			let metadataObj = await parseMetadataFile(id, metadataDirPath, imagesDirPath)
			// Add a new field called `id`, which will be used during INSERTs as a unique row `id`
			metadataObj.id = Number(id)
			finalMetadata.push(await metadataObj)
		} catch (error) {
			console.error(`Error parsing metadata file: ${id}`)
		}
	}

	// Return metadata files
	return finalMetadata
}

module.exports = prepareMetadata

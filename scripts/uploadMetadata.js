const { NFTStorage, File } = require('nft.storage')
const { filesFromPath } = require('files-from-path')
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

async function uploadToIPFS() {
	// load the file from disk
	const imagePath = path.join(__dirname, '..', 'assets', 'rig.jpeg')
	const image = await fileFromPath(imagePath)

	// create a new NFTStorage client using our API key
	const nftstorage = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })
	const imageCid = await nftstorage.storeBlob(image)
	const metadata = {
		name: 'TableNFT',
		description: 'A Tableland NFT demo',
		image: `ipfs://${imageCid}`,
	}
	const metadataDirPath = path.join(__dirname, '..', 'metadata')
	if (!fs.existsSync(metadataDirPath)) fs.mkdirSync(metadataDirPath)
	const metadataFilePath = path.join(metadataDirPath, '0')
	fs.writeFile(metadataFilePath, JSON.stringify(metadata), (error) => {
		if (error) {
			console.log('An error has occurred ', error)
			return
		}
		console.log('Data written successfully to disk')
	})
	const files = filesFromPath(metadataFilePath, {
		pathPrefix: path.resolve(metadataFilePath),
	})
	const directoryCid = await nftstorage.storeDirectory(files)
	console.log(directoryCid)
	// call client.store, passing in the image & metadata
	// return nftstorage.store({
	// 	image,
	// 	name,
	// 	description,
	// })
}

async function fileFromPath(filePath) {
	const content = await fs.promises.readFile(filePath)
	const type = mime.getType(filePath)
	return new File([content], path.basename(filePath), { type })
}

module.exports = uploadToIPFS

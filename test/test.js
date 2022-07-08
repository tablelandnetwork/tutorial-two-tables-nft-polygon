const { expect } = require('chai')
const { ethers } = require('hardhat')
const uploadMetadataToIpfs = require('../scripts/uploadMetadataToIpfs')

describe('TableNFT', function () {
	let TableNFT
	let tableNFT
	let owner
	let addr1
	let metadataDirCid
	// Set up some common variables used throughout, as defined in the `deploy` script
	before(async () => {
		;[owner, addr1] = await ethers.getSigners()
		metadataDirCid = await uploadMetadataToIpfs()
		metadataDirAtGateway = `https://${metadataDirCid}.ipfs.nftstorage.link/`
		TableNFT = await ethers.getContractFactory('TableNFT')
		tableNFT = await TableNFT.deploy(metadataDirAtGateway)
		await tableNFT.deployed()
	})
	it('Should initialize `tokenId` to `0`', async function () {
		// Validate the `tokenCounter` was incremented
		const tokenId = await tableNFT.tokenId()
		expect(tokenId.toNumber()).to.equal(0)
	})
	it('Should increment `tokenId` upon a token mint', async function () {
		// Mint an NFT to the calling `owner` & wait until the transaction is mined
		const mintTx = await tableNFT.connect(owner).mint()
		await mintTx.wait()

		// Validate the `tokenCounter` was incremented
		const tokenId = await tableNFT.tokenId()
		expect(tokenId.toNumber()).to.equal(1)
	})
	it('Should mint a token to the caller address', async function () {
		// Mint an NFT to the calling `owner` & wait until the transaction is mined
		const mintTx = await tableNFT.connect(owner).mint()
		await mintTx.wait()

		// Validate the owner of the minted token is `owner`
		expect(await tableNFT.ownerOf(0)).to.equal(owner.address)
	})
	it('Should allow transfers from token `owner` to others', async function () {
		// Mint an NFT to the calling `owner` & wait until the transaction is mined
		const mintTx = await tableNFT.connect(owner).mint()
		await mintTx.wait()

		// Validate the NFT can be transferred
		await tableNFT['safeTransferFrom(address,address,uint256)'](owner.address, addr1.address, 0)
		expect(await tableNFT.ownerOf(0)).to.equal(addr1.address)
	})
	it('Should return `tokenURI` for a valid `tokenId`', async function () {
		// Mint an NFT to the calling `owner` & wait until the transaction is mined
		const mintTx = await tableNFT.connect(owner).mint()
		await mintTx.wait()

		// Validate the `tokenURI` of id `0`
		let tokenURI = await tableNFT.tokenURI(0)
		expect(await tokenURI).to.equal(`${metadataDirAtGateway}/0`)
	})
})
